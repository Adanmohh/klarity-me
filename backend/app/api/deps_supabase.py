"""
Supabase authentication dependencies
"""
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
import httpx
import json

from app.core.config import settings
from app.services.supabase_client import supabase_service

security = HTTPBearer(auto_error=False)


class SupabaseUser:
    """User model for Supabase authentication"""
    def __init__(self, id: str, email: str, email_verified: bool = False, phone: str = None, app_metadata: dict = None, user_metadata: dict = None):
        self.id = id
        self.email = email
        self.email_verified = email_verified
        self.phone = phone
        self.app_metadata = app_metadata or {}
        self.user_metadata = user_metadata or {}
        self.full_name = user_metadata.get("full_name", "") if user_metadata else ""
        self.is_active = True


async def get_current_user_supabase(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> SupabaseUser:
    """
    Validate Supabase JWT token and return user
    """
    
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        # Validate token with Supabase
        # Use the service client to verify the JWT
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.SUPABASE_URL}/auth/v1/user",
                headers={
                    "Authorization": f"Bearer {credentials.credentials}",
                    "apikey": settings.SUPABASE_ANON_KEY
                }
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid authentication credentials",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            user_data = response.json()
            
            return SupabaseUser(
                id=user_data["id"],
                email=user_data["email"],
                email_verified=user_data.get("email_confirmed_at") is not None,
                phone=user_data.get("phone"),
                app_metadata=user_data.get("app_metadata", {}),
                user_metadata=user_data.get("user_metadata", {})
            )
            
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service unavailable"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_active_user_supabase(
    current_user: SupabaseUser = Depends(get_current_user_supabase),
) -> SupabaseUser:
    """Check if user is active"""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


# Optional: For endpoints that can work with or without auth
async def get_optional_user_supabase(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[SupabaseUser]:
    """
    Get user if authenticated, otherwise return None
    """
    if not credentials:
        return None
    
    try:
        return await get_current_user_supabase(credentials)
    except HTTPException:
        return None