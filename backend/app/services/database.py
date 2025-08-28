from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime
from app.core.supabase import get_supabase
from app.models.card import Card, CardStatus
from app.models.focus_task import FocusTask, TaskLane, TaskStatus as FocusTaskStatus
from app.models.daily_task import DailyTask, TaskStatus as DailyTaskStatus
from app.models.user import User
import logging

logger = logging.getLogger(__name__)

class DatabaseService:
    def __init__(self):
        self.client = get_supabase()
    
    # User operations
    async def get_or_create_user(self, email: str = "dev@example.com") -> Dict[str, Any]:
        """Get or create a development user"""
        try:
            # Try to get existing user
            result = self.client.table("users").select("*").eq("email", email).execute()
            if result.data:
                return result.data[0]
            
            # Create new user if doesn't exist
            user_data = {
                "email": email,
                "hashed_password": "dev_password_hash",  # In production, this would be properly hashed
                "full_name": "Dev User",
                "is_active": True,
                "is_superuser": False
            }
            result = self.client.table("users").insert(user_data).execute()
            return result.data[0]
        except Exception as e:
            logger.error(f"Error in get_or_create_user: {e}")
            raise
    
    # Card operations
    async def get_cards(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all cards for a user"""
        try:
            result = self.client.table("cards").select("*").eq("user_id", user_id).order("position").execute()
            return result.data
        except Exception as e:
            logger.error(f"Error getting cards: {e}")
            return []
    
    async def get_card(self, card_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific card"""
        try:
            result = self.client.table("cards").select("*").eq("id", card_id).eq("user_id", user_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error getting card: {e}")
            return None
    
    async def create_card(self, card_data: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """Create a new card"""
        try:
            # Ensure only one active card
            if card_data.get("status") == "active":
                # Deactivate all other active cards
                self.client.table("cards").update({"status": "queued"}).eq("user_id", user_id).eq("status", "active").execute()
            
            card_data["user_id"] = user_id
            result = self.client.table("cards").insert(card_data).execute()
            return result.data[0]
        except Exception as e:
            logger.error(f"Error creating card: {e}")
            raise
    
    async def update_card(self, card_id: str, card_data: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """Update a card"""
        try:
            # Ensure only one active card
            if card_data.get("status") == "active":
                # Deactivate all other active cards except this one
                self.client.table("cards").update({"status": "queued"}).eq("user_id", user_id).eq("status", "active").neq("id", card_id).execute()
            
            card_data["updated_at"] = datetime.now().isoformat()
            result = self.client.table("cards").update(card_data).eq("id", card_id).eq("user_id", user_id).execute()
            
            if not result.data:
                raise ValueError(f"Card {card_id} not found")
            
            return result.data[0]
        except Exception as e:
            logger.error(f"Error updating card: {e}")
            raise
    
    async def delete_card(self, card_id: str, user_id: str) -> bool:
        """Delete a card"""
        try:
            result = self.client.table("cards").delete().eq("id", card_id).eq("user_id", user_id).execute()
            return True
        except Exception as e:
            logger.error(f"Error deleting card: {e}")
            return False
    
    # Focus Task operations
    async def get_focus_tasks(self, card_id: Optional[str] = None, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get focus tasks, optionally filtered by card"""
        try:
            query = self.client.table("focus_tasks").select("*")
            if card_id:
                query = query.eq("card_id", card_id)
            result = query.order("position").execute()
            return result.data
        except Exception as e:
            logger.error(f"Error getting focus tasks: {e}")
            return []
    
    async def get_focus_task(self, task_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific focus task"""
        try:
            result = self.client.table("focus_tasks").select("*").eq("id", task_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error getting focus task: {e}")
            return None
    
    async def create_focus_task(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new focus task"""
        try:
            result = self.client.table("focus_tasks").insert(task_data).execute()
            return result.data[0]
        except Exception as e:
            logger.error(f"Error creating focus task: {e}")
            raise
    
    async def update_focus_task(self, task_id: str, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update a focus task"""
        try:
            task_data["updated_at"] = datetime.now().isoformat()
            task_data["last_touched"] = datetime.now().isoformat()
            result = self.client.table("focus_tasks").update(task_data).eq("id", task_id).execute()
            
            if not result.data:
                raise ValueError(f"Focus task {task_id} not found")
            
            return result.data[0]
        except Exception as e:
            logger.error(f"Error updating focus task: {e}")
            raise
    
    async def delete_focus_task(self, task_id: str) -> bool:
        """Delete a focus task"""
        try:
            result = self.client.table("focus_tasks").delete().eq("id", task_id).execute()
            return True
        except Exception as e:
            logger.error(f"Error deleting focus task: {e}")
            return False
    
    # Daily Task operations
    async def get_daily_tasks(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all daily tasks for a user"""
        try:
            result = self.client.table("daily_tasks").select("*").eq("user_id", user_id).order("position").execute()
            return result.data
        except Exception as e:
            logger.error(f"Error getting daily tasks: {e}")
            return []
    
    async def get_daily_task(self, task_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific daily task"""
        try:
            result = self.client.table("daily_tasks").select("*").eq("id", task_id).eq("user_id", user_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error getting daily task: {e}")
            return None
    
    async def create_daily_task(self, task_data: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """Create a new daily task"""
        try:
            task_data["user_id"] = user_id
            result = self.client.table("daily_tasks").insert(task_data).execute()
            return result.data[0]
        except Exception as e:
            logger.error(f"Error creating daily task: {e}")
            raise
    
    async def update_daily_task(self, task_id: str, task_data: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """Update a daily task"""
        try:
            task_data["updated_at"] = datetime.now().isoformat()
            result = self.client.table("daily_tasks").update(task_data).eq("id", task_id).eq("user_id", user_id).execute()
            
            if not result.data:
                raise ValueError(f"Daily task {task_id} not found")
            
            return result.data[0]
        except Exception as e:
            logger.error(f"Error updating daily task: {e}")
            raise
    
    async def delete_daily_task(self, task_id: str, user_id: str) -> bool:
        """Delete a daily task"""
        try:
            result = self.client.table("daily_tasks").delete().eq("id", task_id).eq("user_id", user_id).execute()
            return True
        except Exception as e:
            logger.error(f"Error deleting daily task: {e}")
            return False

# Singleton instance
db_service = DatabaseService()