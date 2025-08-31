"""
OTP-based authentication endpoints
"""
from datetime import timedelta
from typing import Any, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr

from app.core import security
from app.core.config import settings
from app.db.dev_store import dev_store
from app.services.email_service import email_service

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
            email_service.send_otp_email(data.email, purpose="login")
            return {
                "message": "Login code sent to your email.",
                "is_new_user": False,
                "needs_activation": False,
                "email": data.email
            }

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
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        authenticated_user.id, expires_delta=access_token_expires
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
    email_service.send_otp_email(data.email, purpose=purpose)
    
    return {
        "message": f"New code sent to {data.email}",
        "purpose": purpose
    }

@router.get("/me", response_model=User)
async def read_users_me() -> Any:
    """Get current user - returns test user for dev"""
    # For dev, return the test user
    test_user = dev_store.get_user_by_email("test@example.com")
    if test_user:
        return User(
            id=test_user.id,
            email=test_user.email,
            full_name=test_user.full_name,
            is_verified=test_user.is_verified,
            is_active=test_user.is_active
        )
    
    raise HTTPException(status_code=404, detail="User not found")

@router.post("/logout")
async def logout() -> Any:
    """Logout endpoint (client should clear token)"""
    return {"message": "Logged out successfully"}