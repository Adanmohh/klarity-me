"""
JWT Token Service for authentication
"""
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import jwt
import secrets
from app.core.config import settings
from app.services.supabase_client import supabase_service


class TokenService:
    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create JWT access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire, "type": "access"})
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def create_refresh_token(user_id: str) -> str:
        """Create refresh token"""
        token = secrets.token_urlsafe(32)
        expires_at = datetime.utcnow() + timedelta(days=30)
        
        # Store in user_sessions table
        supabase_service.execute_query_sync(
            """
            INSERT INTO user_sessions (user_id, refresh_token, expires_at, created_at)
            VALUES ($1, $2, $3, $4)
            """,
            user_id, token, expires_at, datetime.utcnow()
        )
        
        return token
    
    @staticmethod
    def verify_token(token: str) -> Optional[Dict[str, Any]]:
        """Verify JWT token"""
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.JWTError:
            return None
    
    @staticmethod
    async def verify_refresh_token(token: str) -> Optional[str]:
        """Verify refresh token and return user_id"""
        result = await supabase_service.execute_query(
            """
            SELECT user_id, expires_at
            FROM user_sessions
            WHERE refresh_token = $1
            AND expires_at > $2
            AND revoked_at IS NULL
            """,
            token, datetime.utcnow()
        )
        
        if result and result.data:
            return result.data[0]['user_id']
        return None
    
    @staticmethod
    async def revoke_refresh_token(token: str) -> bool:
        """Revoke a refresh token"""
        result = await supabase_service.execute_query(
            """
            UPDATE user_sessions
            SET revoked_at = $1
            WHERE refresh_token = $2
            """,
            datetime.utcnow(), token
        )
        return True
    
    @staticmethod
    async def create_tokens(user_id: str, email: str) -> Dict[str, str]:
        """Create both access and refresh tokens"""
        access_token = TokenService.create_access_token(
            data={"sub": user_id, "email": email}
        )
        refresh_token = TokenService.create_refresh_token(user_id)
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        }


token_service = TokenService()