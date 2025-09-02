"""
Supabase authentication endpoints
"""
from typing import Any
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
import httpx

from app.core.config import settings
from app.api.deps_supabase import get_current_user_supabase, SupabaseUser
from app.services.supabase_client import supabase_service

router = APIRouter()


class EmailSignup(BaseModel):
    email: EmailStr
    password: str
    full_name: str = ""


class EmailLogin(BaseModel):
    email: EmailStr
    password: str


class OTPRequest(BaseModel):
    email: EmailStr


class OTPVerify(BaseModel):
    email: EmailStr
    token: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    refresh_token: str = None
    expires_in: int = None
    user: dict = None


@router.post("/signup", response_model=TokenResponse)
async def signup_with_email(signup_data: EmailSignup) -> Any:
    """Sign up with email and password"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.SUPABASE_URL}/auth/v1/signup",
                json={
                    "email": signup_data.email,
                    "password": signup_data.password,
                    "data": {
                        "full_name": signup_data.full_name
                    }
                },
                headers={
                    "apikey": settings.SUPABASE_ANON_KEY,
                    "Content-Type": "application/json"
                }
            )
            
            if response.status_code == 400:
                error_data = response.json()
                raise HTTPException(status_code=400, detail=error_data.get("msg", "Signup failed"))
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Signup failed")
            
            data = response.json()
            return TokenResponse(
                access_token=data["access_token"],
                refresh_token=data.get("refresh_token"),
                expires_in=data.get("expires_in"),
                user=data.get("user")
            )
            
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail="Authentication service unavailable")


@router.post("/login", response_model=TokenResponse)
async def login_with_email(login_data: EmailLogin) -> Any:
    """Login with email and password"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.SUPABASE_URL}/auth/v1/token?grant_type=password",
                json={
                    "email": login_data.email,
                    "password": login_data.password
                },
                headers={
                    "apikey": settings.SUPABASE_ANON_KEY,
                    "Content-Type": "application/json"
                }
            )
            
            if response.status_code == 400:
                error_data = response.json()
                raise HTTPException(status_code=400, detail=error_data.get("error_description", "Invalid credentials"))
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Login failed")
            
            data = response.json()
            return TokenResponse(
                access_token=data["access_token"],
                refresh_token=data.get("refresh_token"),
                expires_in=data.get("expires_in"),
                user=data.get("user")
            )
            
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail="Authentication service unavailable")


@router.post("/otp/request", response_model=dict)
async def request_otp(otp_data: OTPRequest) -> Any:
    """Request OTP for passwordless login"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.SUPABASE_URL}/auth/v1/otp",
                json={
                    "email": otp_data.email,
                    "create_user": True,
                    "data": {}
                },
                headers={
                    "apikey": settings.SUPABASE_ANON_KEY,
                    "Content-Type": "application/json"
                }
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Failed to send OTP")
            
            return {"message": f"OTP sent to {otp_data.email}"}
            
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail="Authentication service unavailable")


@router.post("/otp/verify", response_model=TokenResponse)
async def verify_otp(verify_data: OTPVerify) -> Any:
    """Verify OTP and login"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.SUPABASE_URL}/auth/v1/verify",
                json={
                    "email": verify_data.email,
                    "token": verify_data.token,
                    "type": "email"
                },
                headers={
                    "apikey": settings.SUPABASE_ANON_KEY,
                    "Content-Type": "application/json"
                }
            )
            
            if response.status_code == 400:
                error_data = response.json()
                raise HTTPException(status_code=400, detail=error_data.get("msg", "Invalid OTP"))
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="OTP verification failed")
            
            data = response.json()
            return TokenResponse(
                access_token=data["access_token"],
                refresh_token=data.get("refresh_token"),
                expires_in=data.get("expires_in"),
                user=data.get("user")
            )
            
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail="Authentication service unavailable")


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(refresh_token: str) -> Any:
    """Refresh access token"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.SUPABASE_URL}/auth/v1/token?grant_type=refresh_token",
                json={
                    "refresh_token": refresh_token
                },
                headers={
                    "apikey": settings.SUPABASE_ANON_KEY,
                    "Content-Type": "application/json"
                }
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Token refresh failed")
            
            data = response.json()
            return TokenResponse(
                access_token=data["access_token"],
                refresh_token=data.get("refresh_token"),
                expires_in=data.get("expires_in"),
                user=data.get("user")
            )
            
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail="Authentication service unavailable")


@router.post("/logout")
async def logout(current_user: SupabaseUser = Depends(get_current_user_supabase)) -> Any:
    """Logout user (requires valid token)"""
    # Supabase handles token revocation on client side
    # This endpoint just validates the token is valid
    return {"message": "Logged out successfully"}


@router.get("/me")
async def get_current_user(current_user: SupabaseUser = Depends(get_current_user_supabase)) -> Any:
    """Get current user info"""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "email_verified": current_user.email_verified,
        "full_name": current_user.full_name,
        "user_metadata": current_user.user_metadata,
        "is_active": True
    }