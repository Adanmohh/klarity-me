"""
OTP Service for authentication
"""
import secrets
import string
from datetime import datetime, timedelta
from typing import Optional
import hashlib
import httpx
from app.core.config import settings
from app.services.supabase_client import supabase_service


class OTPService:
    OTP_LENGTH = 6
    OTP_EXPIRY_MINUTES = 10
    MAX_ATTEMPTS = 3
    
    @staticmethod
    def generate_otp() -> str:
        """Generate a random 6-digit OTP"""
        return ''.join(secrets.choice(string.digits) for _ in range(OTPService.OTP_LENGTH))
    
    @staticmethod
    def hash_otp(otp: str) -> str:
        """Hash the OTP for secure storage"""
        return hashlib.sha256(otp.encode()).hexdigest()
    
    async def create_otp(self, email: str) -> str:
        """Create and store OTP for email"""
        otp = self.generate_otp()
        hashed_otp = self.hash_otp(otp)
        expires_at = datetime.utcnow() + timedelta(minutes=self.OTP_EXPIRY_MINUTES)
        
        # Store in auth_codes table
        result = await supabase_service.execute_query(
            """
            INSERT INTO auth_codes (email, code_hash, expires_at, created_at)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (email) 
            DO UPDATE SET 
                code_hash = EXCLUDED.code_hash,
                expires_at = EXCLUDED.expires_at,
                created_at = EXCLUDED.created_at,
                used_at = NULL,
                attempts = 0
            """,
            email, hashed_otp, expires_at, datetime.utcnow()
        )
        
        return otp
    
    async def verify_otp(self, email: str, otp: str) -> bool:
        """Verify OTP for email"""
        hashed_otp = self.hash_otp(otp)
        
        # Check OTP validity
        result = await supabase_service.execute_query(
            """
            SELECT code_hash, expires_at, attempts, used_at
            FROM auth_codes
            WHERE email = $1
            AND expires_at > $2
            AND used_at IS NULL
            AND attempts < $3
            """,
            email, datetime.utcnow(), self.MAX_ATTEMPTS
        )
        
        if not result or not result.data:
            return False
        
        auth_code = result.data[0]
        
        # Increment attempts
        await supabase_service.execute_query(
            """
            UPDATE auth_codes
            SET attempts = attempts + 1
            WHERE email = $1
            """,
            email
        )
        
        # Verify hash
        if auth_code['code_hash'] != hashed_otp:
            return False
        
        # Mark as used
        await supabase_service.execute_query(
            """
            UPDATE auth_codes
            SET used_at = $1
            WHERE email = $2
            """,
            datetime.utcnow(), email
        )
        
        return True
    
    async def send_otp_email(self, email: str, otp: str) -> bool:
        """Send OTP via email using Resend API"""
        if not settings.RESEND_API_KEY:
            # For development, just log the OTP
            print(f"OTP for {email}: {otp}")
            return True
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.resend.com/emails",
                    json={
                        "from": settings.EMAIL_FROM or "noreply@yourdomain.com",
                        "to": email,
                        "subject": "Your Login Code",
                        "html": f"""
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2>Your Login Code</h2>
                            <p>Use this code to log in to your account:</p>
                            <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
                                {otp}
                            </div>
                            <p>This code will expire in {self.OTP_EXPIRY_MINUTES} minutes.</p>
                            <p style="color: #666; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
                        </div>
                        """
                    },
                    headers={
                        "Authorization": f"Bearer {settings.RESEND_API_KEY}",
                        "Content-Type": "application/json"
                    }
                )
                return response.status_code == 200
        except Exception as e:
            print(f"Failed to send email: {e}")
            return False


otp_service = OTPService()