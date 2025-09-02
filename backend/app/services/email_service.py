"""
Email service for sending OTPs
"""
import random
import string
from datetime import datetime, timedelta
from typing import Optional, Dict
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

class EmailService:
    """Service for sending emails and managing OTPs"""
    
    def __init__(self):
        # For development, we'll store OTPs in memory
        # In production, use Redis or database
        self.otp_store: Dict[str, Dict] = {}
        
        # Email configuration (you'll need to set these in .env)
        self.smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER", "")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "")
        self.from_email = os.getenv("FROM_EMAIL", "noreply@focuscards.com")
        self.app_name = "Focus Cards"
        
        # For development, print OTPs to console if email not configured
        self.dev_mode = not self.smtp_user or not self.smtp_password
    
    def generate_otp(self, length: int = 6) -> str:
        """Generate a random OTP"""
        return ''.join(random.choices(string.digits, k=length))
    
    def store_otp(self, email: str, otp: str, purpose: str = "login", expires_in_minutes: int = 10):
        """Store OTP with expiration"""
        self.otp_store[f"{email}:{purpose}"] = {
            "otp": otp,
            "expires_at": datetime.now() + timedelta(minutes=expires_in_minutes),
            "attempts": 0,
            "verified": False
        }
    
    def verify_otp(self, email: str, otp: str, purpose: str = "login") -> bool:
        """Verify an OTP"""
        key = f"{email}:{purpose}"
        
        if key not in self.otp_store:
            return False
        
        stored = self.otp_store[key]
        
        # Check if expired
        if datetime.now() > stored["expires_at"]:
            del self.otp_store[key]
            return False
        
        # Check attempts (max 3)
        if stored["attempts"] >= 3:
            del self.otp_store[key]
            return False
        
        # Increment attempts
        stored["attempts"] += 1
        
        # Verify OTP
        if stored["otp"] == otp:
            stored["verified"] = True
            return True
        
        return False
    
    def send_otp_email(self, email: str, purpose: str = "login") -> bool:
        """Send OTP to email"""
        otp = self.generate_otp()
        self.store_otp(email, otp, purpose)
        
        if purpose == "activation":
            subject = f"Activate your {self.app_name} account"
            body = self._get_activation_email_body(otp)
        else:
            subject = f"Your {self.app_name} login code"
            body = self._get_login_email_body(otp)
        
        self._send_email(email, subject, body, otp)
        return otp  # Return the OTP for dev mode
    
    def _get_activation_email_body(self, otp: str) -> str:
        """Get activation email body"""
        return f"""
        <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; text-align: center;">Welcome to {self.app_name}!</h1>
                </div>
                
                <div style="background: #f7f7f7; padding: 30px; border-radius: 0 0 10px 10px;">
                    <p style="font-size: 16px; color: #333;">Thank you for signing up! Please activate your account using the code below:</p>
                    
                    <div style="background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
                        <h2 style="color: #667eea; margin: 0; font-size: 32px; letter-spacing: 5px;">{otp}</h2>
                    </div>
                    
                    <p style="font-size: 14px; color: #666;">This code will expire in 10 minutes.</p>
                    <p style="font-size: 14px; color: #666;">If you didn't request this, please ignore this email.</p>
                </div>
                
                <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
                    <p>© 2024 {self.app_name}. All rights reserved.</p>
                </div>
            </body>
        </html>
        """
    
    def _get_login_email_body(self, otp: str) -> str:
        """Get login email body"""
        return f"""
        <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; text-align: center;">{self.app_name}</h1>
                </div>
                
                <div style="background: #f7f7f7; padding: 30px; border-radius: 0 0 10px 10px;">
                    <p style="font-size: 16px; color: #333;">Your login code is:</p>
                    
                    <div style="background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
                        <h2 style="color: #667eea; margin: 0; font-size: 32px; letter-spacing: 5px;">{otp}</h2>
                    </div>
                    
                    <p style="font-size: 14px; color: #666;">This code will expire in 10 minutes.</p>
                    <p style="font-size: 14px; color: #666;">If you didn't request this, please ignore this email.</p>
                </div>
                
                <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
                    <p>© 2024 {self.app_name}. All rights reserved.</p>
                </div>
            </body>
        </html>
        """
    
    def _send_email(self, to_email: str, subject: str, body: str, otp: str) -> bool:
        """Send email via SMTP or print to console in dev mode"""
        
        if self.dev_mode:
            # In development, print OTP to console
            print("\n" + "="*50)
            print(f"EMAIL OTP (Dev Mode)")
            print(f"To: {to_email}")
            print(f"Subject: {subject}")
            print(f"OTP Code: {otp}")
            print("="*50 + "\n")
            return True
        
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['From'] = self.from_email
            msg['To'] = to_email
            msg['Subject'] = subject
            
            # Add HTML body
            html_part = MIMEText(body, 'html')
            msg.attach(html_part)
            
            # Send email
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)
            
            return True
        except Exception as e:
            print(f"Failed to send email: {e}")
            # Fallback to console in case of error
            print("\n" + "="*50)
            print(f"📧 EMAIL OTP (Fallback)")
            print(f"To: {to_email}")
            print(f"OTP Code: {otp}")
            print("="*50 + "\n")
            return True

# Global email service instance
email_service = EmailService()