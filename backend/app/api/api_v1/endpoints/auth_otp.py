"""
OTP-based authentication endpoints
"""
from datetime import timedelta
from typing import Any, Optional
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from jose import jwt, JWTError

from app.core import security
from app.core.config import settings
from app.db.dev_store import dev_store
from app.services.email_service import email_service

security_bearer = HTTPBearer(auto_error=False)

router = APIRouter()

class RequestOTPRequest(BaseModel):
    email: EmailStr
    full_name: Optional[str] = ""

class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str

class ResendOTPRequest(BaseModel):
    email: EmailStr

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class User(BaseModel):
    id: str
    email: str
    full_name: str
    is_verified: bool
    is_active: bool = True

@router.post("/request-otp")
async def request_otp(data: RequestOTPRequest) -> Any:
    """
    Request OTP for login or registration.
    If user doesn't exist, creates a new unverified account.
    """
    # Get or create user
    user = dev_store.get_user_by_email(data.email)
    
    if not user:
        # New user - create unverified account
        user = dev_store.create_user(
            email=data.email,
            full_name=data.full_name or ""
        )
        # Send activation OTP
        email_service.send_otp_email(data.email, purpose="activation")
        return {
            "message": "Account created. Please check your email for activation code.",
            "is_new_user": True,
            "email": data.email
        }
    else:
        # Existing user
        if not user.is_verified:
            # Resend activation OTP
            email_service.send_otp_email(data.email, purpose="activation")
            return {
                "message": "Your account is not activated. Please check your email for activation code.",
                "is_new_user": False,
                "needs_activation": True,
                "email": data.email
            }
        else:
            # Send login OTP
            otp = email_service.send_otp_email(data.email, purpose="login")
            result = {
                "message": "Login code sent to your email.",
                "is_new_user": False,
                "needs_activation": False,
                "email": data.email
            }
            # In dev mode, include the OTP for testing
            from app.core.config import settings
            if settings.DEV_MODE:
                result["debug_otp"] = otp
            return result

@router.get("/demo-login")
async def demo_login() -> Token:
    """
    Demo login endpoint for DEV_MODE.
    Automatically creates and logs in a demo user.
    """
    if not settings.DEV_MODE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Demo login is only available in development mode"
        )
    
    # Create or get demo user
    demo_email = "demo@focuscards.local"
    demo_user = dev_store.get_user_by_email(demo_email)
    
    if not demo_user:
        demo_user = dev_store.create_user(
            email=demo_email,
            full_name="Demo User"
        )
        # Mark as verified
        demo_user.is_verified = True
        demo_user.is_active = True
    
    # Create access token with email included
    access_token_expires = timedelta(days=7)  # Longer expiry for demo
    access_token = security.create_access_token(
        subject=demo_user.id,
        expires_delta=access_token_expires,
        email=demo_user.email
    )
    
    return Token(
        access_token=access_token,
        user={
            "id": demo_user.id,
            "email": demo_user.email,
            "full_name": demo_user.full_name,
            "is_verified": demo_user.is_verified,
            "is_active": demo_user.is_active
        }
    )

@router.post("/verify-otp")
async def verify_otp(data: VerifyOTPRequest) -> Token:
    """
    Verify OTP and login user.
    For new users, this also activates their account.
    """
    user = dev_store.get_user_by_email(data.email)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found. Please request OTP first."
        )
    
    # Determine OTP purpose
    purpose = "activation" if not user.is_verified else "login"
    
    # Verify OTP
    if not email_service.verify_otp(data.email, data.otp, purpose):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired code. Please try again."
        )
    
    # If it's activation, mark email as verified
    if not user.is_verified:
        dev_store.verify_user_email(data.email)
        user = dev_store.get_user_by_email(data.email)  # Refresh user
    
    # Authenticate user
    authenticated_user = dev_store.authenticate_user(data.email)
    
    if not authenticated_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed"
        )
    
    # Create access token with email
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        authenticated_user.id, 
        expires_delta=access_token_expires,
        email=authenticated_user.email
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user={
            "id": authenticated_user.id,
            "email": authenticated_user.email,
            "full_name": authenticated_user.full_name,
            "is_verified": authenticated_user.is_verified
        }
    )

@router.post("/resend-otp")
async def resend_otp(data: ResendOTPRequest) -> Any:
    """Resend OTP to email"""
    user = dev_store.get_user_by_email(data.email)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found. Please sign up first."
        )
    
    # Determine OTP purpose
    purpose = "activation" if not user.is_verified else "login"
    
    # Send OTP
    otp = email_service.send_otp_email(data.email, purpose=purpose)
    
    result = {
        "message": f"New code sent to {data.email}",
        "purpose": purpose
    }
    
    # In dev mode, include the OTP for testing
    from app.core.config import settings
    if settings.DEV_MODE:
        result["debug_otp"] = otp
    
    return result

@router.get("/me")
async def read_users_me(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer)
) -> Any:
    """Get current user from token"""
    
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        # Decode our JWT token
        payload = jwt.decode(
            credentials.credentials, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM],
            options={"verify_aud": False}
        )
        
        # Get user info from token
        user_id = payload.get("sub")
        email = payload.get("email")
        
        if not user_id or not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Get user from dev store
        user = dev_store.get_user_by_id(user_id)
        if not user:
            # Try to get by email if ID lookup fails
            user = dev_store.get_user_by_email(email)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "is_verified": user.is_verified,
            "is_active": user.is_active
        }
            
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.post("/logout")
async def logout() -> Any:
    """Logout endpoint (client should clear token)"""
    return {"message": "Logged out successfully"}