"""
Supabase client for backend operations
"""
import os
from supabase import create_client, Client
from typing import Optional, Dict, Any, List
import logging

logger = logging.getLogger(__name__)

class SupabaseService:
    """Service for interacting with Supabase"""
    
    def __init__(self):
        # Production Supabase configuration
        self.url = "https://dqkfjcnseysddzdpdlaq.supabase.co"
        self.anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxa2ZqY25zZXlzZGR6ZHBkbGFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNzM4OTksImV4cCI6MjA3MTk0OTg5OX0.cOZy-EA06kPhGOwMw6_PW69dGuWs5ywMORqXp8_p1n4"
        
        # Service role key for backend operations
        self.service_key = os.getenv("SUPABASE_SERVICE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxa2ZqY25zZXlzZGR6ZHBkbGFxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjM3Mzg5OSwiZXhwIjoyMDcxOTQ5ODk5fQ.qOJTzvNc8HQCeIYg1DG4r9B1GMk5zzgLGW7VGoJphpA")
        
        # Create client with service key for full access
        self.client: Client = create_client(self.url, self.service_key)
        logger.info(f"Connected to Supabase at {self.url}")
    
    # User operations
    async def create_user(self, email: str, full_name: str = "", is_verified: bool = False) -> Dict[str, Any]:
        """Create a new user in Supabase"""
        try:
            # Create user in auth.users first
            auth_response = self.client.auth.admin.create_user({
                "email": email,
                "email_confirm": is_verified,
                "user_metadata": {"full_name": full_name}
            })
            
            if auth_response.user:
                # Create corresponding record in public.users
                user_data = {
                    "id": auth_response.user.id,
                    "email": email,
                    "full_name": full_name,
                    "is_active": True,
                    "is_superuser": False,
                    "hashed_password": ""  # No password for OTP auth
                }
                
                result = self.client.table("users").insert(user_data).execute()
                return result.data[0] if result.data else user_data
            
            raise Exception("Failed to create auth user")
        except Exception as e:
            logger.error(f"Error creating user: {e}")
            raise
    
    async def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get user by email"""
        try:
            result = self.client.table("users").select("*").eq("email", email).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error getting user: {e}")
            return None
    
    async def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        try:
            result = self.client.table("users").select("*").eq("id", user_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error getting user: {e}")
            return None
    
    async def update_user(self, user_id: str, **updates) -> Optional[Dict[str, Any]]:
        """Update user"""
        try:
            result = self.client.table("users").update(updates).eq("id", user_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error updating user: {e}")
            return None
    
    # Card operations
    async def get_cards(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all cards for a user"""
        try:
            result = self.client.table("cards").select("*").eq("user_id", user_id).order("position").execute()
            return result.data or []
        except Exception as e:
            logger.error(f"Error getting cards: {e}")
            return []
    
    async def create_card(self, user_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new card"""
        try:
            card_data = {
                "user_id": user_id,
                "title": data.get("title", "Untitled"),
                "description": data.get("description"),
                "position": data.get("position", 0),
                "status": data.get("status", "queued"),
                "sessions_count": 0,
                "momentum_score": 0
            }
            
            result = self.client.table("cards").insert(card_data).execute()
            return result.data[0] if result.data else card_data
        except Exception as e:
            logger.error(f"Error creating card: {e}")
            raise
    
    async def update_card(self, card_id: str, **updates) -> Optional[Dict[str, Any]]:
        """Update a card"""
        try:
            result = self.client.table("cards").update(updates).eq("id", card_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error updating card: {e}")
            return None
    
    async def delete_card(self, card_id: str) -> bool:
        """Delete a card"""
        try:
            self.client.table("cards").delete().eq("id", card_id).execute()
            return True
        except Exception as e:
            logger.error(f"Error deleting card: {e}")
            return False
    
    # Task operations
    async def get_focus_tasks(self, card_id: str) -> List[Dict[str, Any]]:
        """Get focus tasks for a card"""
        try:
            result = self.client.table("focus_tasks").select("*").eq("card_id", card_id).order("position").execute()
            return result.data or []
        except Exception as e:
            logger.error(f"Error getting focus tasks: {e}")
            return []
    
    async def create_focus_task(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a focus task"""
        try:
            result = self.client.table("focus_tasks").insert(data).execute()
            return result.data[0] if result.data else data
        except Exception as e:
            logger.error(f"Error creating focus task: {e}")
            raise
    
    async def update_focus_task(self, task_id: str, **updates) -> Optional[Dict[str, Any]]:
        """Update a focus task"""
        try:
            result = self.client.table("focus_tasks").update(updates).eq("id", task_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error updating focus task: {e}")
            return None
    
    async def delete_focus_task(self, task_id: str) -> bool:
        """Delete a focus task"""
        try:
            self.client.table("focus_tasks").delete().eq("id", task_id).execute()
            return True
        except Exception as e:
            logger.error(f"Error deleting focus task: {e}")
            return False
    
    # Daily task operations
    async def get_daily_tasks(self, user_id: str) -> List[Dict[str, Any]]:
        """Get daily tasks for a user"""
        try:
            result = self.client.table("daily_tasks").select("*").eq("user_id", user_id).order("position").execute()
            return result.data or []
        except Exception as e:
            logger.error(f"Error getting daily tasks: {e}")
            return []
    
    async def create_daily_task(self, user_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a daily task"""
        try:
            task_data = {
                "user_id": user_id,
                **data
            }
            result = self.client.table("daily_tasks").insert(task_data).execute()
            return result.data[0] if result.data else task_data
        except Exception as e:
            logger.error(f"Error creating daily task: {e}")
            raise
    
    async def update_daily_task(self, task_id: str, **updates) -> Optional[Dict[str, Any]]:
        """Update a daily task"""
        try:
            result = self.client.table("daily_tasks").update(updates).eq("id", task_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error updating daily task: {e}")
            return None
    
    async def delete_daily_task(self, task_id: str) -> bool:
        """Delete a daily task"""
        try:
            self.client.table("daily_tasks").delete().eq("id", task_id).execute()
            return True
        except Exception as e:
            logger.error(f"Error deleting daily task: {e}")
            return False

# Global instance
supabase_service = SupabaseService()