from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Request
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
import httpx
import json
from uuid import UUID

from app.core.config import settings
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import TokenPayload
from app.crud.user import user_crud
from app.core.supabase import get_supabase

security = HTTPBearer(auto_error=False)


async def get_current_user(
    db: AsyncSession = Depends(get_db),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> User:
    """
    Extract the user from the Supabase JWT token.
    This validates the token with Supabase and creates/updates the user in our local database.
    """
    
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        # Get Supabase client
        supabase = get_supabase()
        
        # Verify the JWT token with Supabase
        response = supabase.auth.get_user(credentials.credentials)
        
        if not response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        supabase_user = response.user
        
        # Try to get user from our database
        user = await user_crud.get_by_email(db, email=supabase_user.email)
        
        if not user:
            # Create new user in our database
            from datetime import datetime
            user = User()
            user.id = UUID(supabase_user.id)
            user.email = supabase_user.email
            user.full_name = supabase_user.user_metadata.get('full_name', '') if supabase_user.user_metadata else ''
            user.is_active = True
            user.created_at = datetime.now()
            user.hashed_password = ""  # We don't store passwords when using Supabase
            
            # Save to database
            user = await user_crud.create(db, obj_in=user)
        else:
            # Update existing user info if needed
            update_data = {}
            if supabase_user.user_metadata and supabase_user.user_metadata.get('full_name'):
                full_name = supabase_user.user_metadata.get('full_name', '')
                if user.full_name != full_name:
                    update_data['full_name'] = full_name
            
            if update_data:
                user = await user_crud.update(db, db_obj=user, obj_in=update_data)
        
        return user
        
    except Exception as e:
        # For development, provide more detailed error info
        if settings.DEV_MODE:
            print(f"Auth error: {e}")
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user