"""
Authentication dependencies for FastAPI
"""
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError

from app.core.config import settings
from app.db.dev_store import dev_store

# Create HTTPBearer instance for token extraction
security = HTTPBearer()


class SupabaseUser:
    """User model for authentication"""
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
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> SupabaseUser:
    """
    Validate JWT token and return user
    Uses our own JWT validation for OTP-generated tokens
    """
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        logger.info(f"Received token: {credentials.credentials[:50]}...")
        logger.info(f"Using SECRET_KEY: {settings.SECRET_KEY[:10]}...")
        logger.info(f"Using ALGORITHM: {settings.ALGORITHM}")
        
        # Decode our JWT token
        payload = jwt.decode(
            credentials.credentials, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM],
            options={"verify_aud": False}  # We're not using audience claim for now
        )
        
        logger.info(f"Decoded payload: {payload}")
        
        # Get user info from token
        user_id = payload.get("sub")
        email = payload.get("email")
        
        logger.info(f"Extracted user_id: {user_id}, email: {email}")
        
        if not user_id or not email:
            logger.error(f"Missing required fields - user_id: {user_id}, email: {email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Get user from dev store in dev mode
        if settings.DEV_MODE:
            logger.info(f"DEV_MODE is {settings.DEV_MODE}, looking up user in dev_store")
            user = dev_store.get_user_by_id(user_id)
            logger.info(f"User lookup by ID result: {user}")
            
            if not user:
                # Try to get by email if ID lookup fails
                logger.info(f"User not found by ID, trying email: {email}")
                user = dev_store.get_user_by_email(email)
                logger.info(f"User lookup by email result: {user}")
            
            if not user:
                logger.error(f"User not found in dev_store for id={user_id}, email={email}")
                logger.info(f"Current dev_store users: {list(dev_store.users.keys())}")
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )
            
            return SupabaseUser(
                id=user.id,
                email=user.email,
                email_verified=user.is_verified,
                phone=None,
                app_metadata={},
                user_metadata={"full_name": user.full_name}
            )
        else:
            # Production mode - use Supabase (not implemented yet)
            raise HTTPException(
                status_code=status.HTTP_503,
                detail="Supabase connection not configured"
            )
            
    except JWTError as e:
        logger.error(f"JWTError: {str(e)}")
        logger.error(f"Token that failed: {credentials.credentials[:50]}...")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication error",
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
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))
) -> Optional[SupabaseUser]:
    """
    Get user if authenticated, otherwise return None
    """
    if not credentials:
        return None
    
    try:
        # Use the same logic as get_current_user_supabase
        payload = jwt.decode(
            credentials.credentials, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM],
            options={"verify_aud": False}
        )
        
        user_id = payload.get("sub")
        email = payload.get("email")
        
        if not user_id or not email:
            return None
        
        if settings.DEV_MODE:
            user = dev_store.get_user_by_id(user_id)
            if not user:
                user = dev_store.get_user_by_email(email)
            
            if not user:
                return None
            
            return SupabaseUser(
                id=user.id,
                email=user.email,
                email_verified=user.is_verified,
                phone=None,
                app_metadata={},
                user_metadata={"full_name": user.full_name}
            )
        else:
            return None
    except:
        return None