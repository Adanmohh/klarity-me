"""
Simple authentication dependencies for development
"""
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from datetime import datetime

from app.core.config import settings
from app.core.security import create_access_token
from app.db.dev_store import dev_store

security = HTTPBearer(auto_error=False)


class SimpleUser:
    """Simple user model for dev mode"""
    def __init__(self, id: str, email: str, full_name: str = "", is_active: bool = True):
        self.id = id
        self.email = email
        self.full_name = full_name
        self.is_active = is_active
        self.created_at = datetime.now()


async def get_current_user_simple(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> SimpleUser:
    """
    Simple auth check for development - validates JWT token
    """
    
    if not credentials:
        # In dev mode, return a default user if no token
        if settings.DEV_MODE:
            return SimpleUser(
                id="00000000-0000-0000-0000-000000000001",
                email="test@example.com",
                full_name="Test User"
            )
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        # Decode the JWT token
        payload = jwt.decode(
            credentials.credentials, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        user_id: str = payload.get("sub")
        
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Get user from dev store
        user_data = dev_store.get_user_by_id(user_id)
        
        if not user_data:
            # If user not found in dev store but token is valid, create a simple user
            return SimpleUser(
                id=user_id,
                email=f"user_{user_id}@example.com",
                full_name="User"
            )
        
        return SimpleUser(
            id=user_data.id,
            email=user_data.email,
            full_name=user_data.full_name,
            is_active=user_data.is_active
        )
        
    except JWTError:
        # In dev mode, return default user on JWT error
        if settings.DEV_MODE:
            return SimpleUser(
                id="00000000-0000-0000-0000-000000000001",
                email="test@example.com",
                full_name="Test User"
            )
            
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_active_user_simple(
    current_user: SimpleUser = Depends(get_current_user_simple),
) -> SimpleUser:
    """Check if user is active"""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


# Optional: For endpoints that can work with or without auth
async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[SimpleUser]:
    """
    Get user if authenticated, otherwise return None
    """
    if not credentials:
        return None
    
    try:
        return await get_current_user_simple(credentials)
    except HTTPException:
        return None