"""
OTP-based authentication endpoints using Supabase
"""
from datetime import timedelta
from typing import Any, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
import asyncio

from app.core import security
from app.core.config import settings
from app.services.email_service import email_service
from app.services.supabase_client import supabase_service

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
    is_active: bool = True

@router.post("/request-otp")
async def request_otp(data: RequestOTPRequest) -> Any:
    """
    Request OTP for login or registration.
    If user doesn't exist, creates a new unverified account.
    """
    # Get or create user in Supabase
    user = await supabase_service.get_user_by_email(data.email)
    
    if not user:
        # New user - create in Supabase
        user = await supabase_service.create_user(
            email=data.email,
            full_name=data.full_name or "",
            is_verified=False
        )
        # Send activation OTP
        email_service.send_otp_email(data.email, purpose="activation")
        return {
            "message": "Account created. Please check your email for activation code.",
            "is_new_user": True,
            "email": data.email
        }
    else:
        # Existing user - send login OTP
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
    user = await supabase_service.get_user_by_email(data.email)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found. Please request OTP first."
        )
    
    # Verify OTP
    purpose = "activation" if not user.get("is_active") else "login"
    
    if not email_service.verify_otp(data.email, data.otp, purpose):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired code. Please try again."
        )
    
    # If it's activation, mark user as active
    if not user.get("is_active"):
        await supabase_service.update_user(user["id"], is_active=True)
        user = await supabase_service.get_user_by_email(data.email)
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        user["id"], expires_delta=access_token_expires
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user={
            "id": user["id"],
            "email": user["email"],
            "full_name": user.get("full_name", ""),
            "is_active": user.get("is_active", True)
        }
    )

@router.post("/resend-otp")
async def resend_otp(data: ResendOTPRequest) -> Any:
    """Resend OTP to email"""
    user = await supabase_service.get_user_by_email(data.email)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found. Please sign up first."
        )
    
    # Determine OTP purpose
    purpose = "activation" if not user.get("is_active") else "login"
    
    # Send OTP
    email_service.send_otp_email(data.email, purpose=purpose)
    
    return {
        "message": f"New code sent to {data.email}",
        "purpose": purpose
    }

@router.get("/me", response_model=User)
async def read_users_me() -> Any:
    """Get current user - returns test user for now"""
    # For testing, return a test user
    test_user = await supabase_service.get_user_by_email("test@example.com")
    if not test_user:
        # Create test user if doesn't exist
        test_user = await supabase_service.create_user(
            email="test@example.com",
            full_name="Test User",
            is_verified=True
        )
    
    if test_user:
        return User(
            id=test_user["id"],
            email=test_user["email"],
            full_name=test_user.get("full_name", ""),
            is_active=test_user.get("is_active", True)
        )
    
    raise HTTPException(status_code=404, detail="User not found")

@router.post("/logout")
async def logout() -> Any:
    """Logout endpoint (client should clear token)"""
    return {"message": "Logged out successfully"}