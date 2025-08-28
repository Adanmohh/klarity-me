from typing import List, Optional, Dict, Any
from uuid import UUID, uuid4
from datetime import datetime
import uuid

# In-memory database
memory_db = {
    "users": {},
    "cards": {},
    "focus_tasks": {},
    "daily_tasks": {}
}

# Initialize with test data
def init_test_data():
    # Create test user
    user_id = "12345678-1234-5678-1234-567812345678"
    memory_db["users"][user_id] = {
        "id": user_id,
        "email": "dev@example.com",
        "full_name": "Dev User",
        "is_active": True,
        "is_superuser": False,
        "created_at": datetime.now().isoformat(),
        "hashed_password": "hashed_password"
    }
    
    # Create test cards
    card1_id = "596bb074-a0ab-493a-ac91-c664f34bc534"
    card2_id = "e9dc4c45-aa93-49e2-aafe-dd40745ac0c8"
    card3_id = "f7a8b9c0-1234-5678-90ab-cdef01234567"
    
    memory_db["cards"][card1_id] = {
        "id": card1_id,
        "user_id": user_id,
        "title": "Refactor Authentication System",
        "description": "Implement OAuth2 with JWT tokens and refresh token rotation",
        "position": 0,
        "status": "active",
        "last_worked_on": "2025-08-26T10:00:00",
        "sessions_count": 5,
        "where_left_off": "Working on token refresh logic",
        "momentum_score": 8,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
        "pause_until": None
    }
    
    memory_db["cards"][card2_id] = {
        "id": card2_id,
        "user_id": user_id,
        "title": "Build Dashboard Analytics",
        "description": "Create comprehensive analytics dashboard with charts and KPIs",
        "position": 1,
        "status": "queued",
        "last_worked_on": "2025-08-23T14:00:00",
        "sessions_count": 2,
        "where_left_off": "Researching charting libraries",
        "momentum_score": 3,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
        "pause_until": None
    }
    
    memory_db["cards"][card3_id] = {
        "id": card3_id,
        "user_id": user_id,
        "title": "API Documentation",
        "description": "Write comprehensive API documentation with OpenAPI specs",
        "position": 2,
        "status": "on-hold",
        "last_worked_on": "2025-08-18T09:00:00",
        "sessions_count": 1,
        "where_left_off": "Outlined main endpoints",
        "momentum_score": 1,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
        "pause_until": None
    }
    
    # Create focus tasks for cards
    tasks = [
        # Tasks for card1
        {
            "id": str(uuid4()),
            "card_id": card1_id,
            "title": "Setup JWT structure",
            "description": "Create JWT token models and validation",
            "lane": "main",
            "status": "completed",
            "position": 0,
            "is_breakthrough": False,
            "is_stale": False,
            "last_touched": datetime.now().isoformat(),
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        },
        {
            "id": str(uuid4()),
            "card_id": card1_id,
            "title": "Implement refresh tokens",
            "description": "Add refresh token rotation mechanism",
            "lane": "main",
            "status": "active",
            "position": 1,
            "is_breakthrough": True,
            "is_stale": False,
            "last_touched": datetime.now().isoformat(),
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        },
        {
            "id": str(uuid4()),
            "card_id": card1_id,
            "title": "Add rate limiting",
            "description": "Implement rate limiting for auth endpoints",
            "lane": "main",
            "position": 2,
            "status": "pending",
            "is_breakthrough": False,
            "is_stale": False,
            "last_touched": datetime.now().isoformat(),
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        },
        {
            "id": str(uuid4()),
            "card_id": card1_id,
            "title": "Research OAuth providers",
            "description": "Evaluate Google, GitHub, Microsoft",
            "lane": "controller",
            "status": "pending",
            "position": 0,
            "is_breakthrough": False,
            "is_stale": False,
            "last_touched": datetime.now().isoformat(),
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        },
        # Tasks for card2
        {
            "id": str(uuid4()),
            "card_id": card2_id,
            "title": "Design dashboard layout",
            "description": "Create wireframes and mockups",
            "lane": "main",
            "status": "completed",
            "position": 0,
            "is_breakthrough": False,
            "is_stale": False,
            "last_touched": datetime.now().isoformat(),
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        },
        {
            "id": str(uuid4()),
            "card_id": card2_id,
            "title": "Implement chart components",
            "description": "Build reusable chart components",
            "lane": "main",
            "status": "pending",
            "position": 1,
            "is_breakthrough": True,
            "is_stale": False,
            "last_touched": datetime.now().isoformat(),
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        },
        {
            "id": str(uuid4()),
            "card_id": card2_id,
            "title": "Connect to data source",
            "description": "Integrate with backend APIs",
            "lane": "main",
            "status": "pending",
            "position": 2,
            "is_breakthrough": False,
            "is_stale": False,
            "last_touched": datetime.now().isoformat(),
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        },
        {
            "id": str(uuid4()),
            "card_id": card2_id,
            "title": "Research D3.js alternatives",
            "description": "Compare Chart.js, Recharts, Victory",
            "lane": "controller",
            "status": "pending",
            "position": 0,
            "is_breakthrough": False,
            "is_stale": False,
            "last_touched": datetime.now().isoformat(),
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
    ]
    
    for task in tasks:
        memory_db["focus_tasks"][task["id"]] = task
    
    # Create sample daily tasks (independent from cards)
    daily_tasks = [
        {
            "id": str(uuid4()),
            "user_id": user_id,
            "title": "Review inbox and emails",
            "description": "Check and respond to important emails",
            "lane": "controller",
            "duration": None,
            "status": "pending",
            "position": 0,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "completed_at": None
        },
        {
            "id": str(uuid4()),
            "user_id": user_id,
            "title": "Daily standup meeting",
            "description": "Team sync meeting at 10 AM",
            "lane": "main",
            "duration": "15min",
            "status": "completed",
            "position": 1,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "completed_at": datetime.now().isoformat()
        },
        {
            "id": str(uuid4()),
            "user_id": user_id,
            "title": "Code review for PR #123",
            "description": "Review frontend changes",
            "lane": "main",
            "duration": "30min",
            "status": "pending",
            "position": 2,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "completed_at": None
        },
        {
            "id": str(uuid4()),
            "user_id": user_id,
            "title": "Update project documentation",
            "description": "Add new API endpoints to docs",
            "lane": "main",
            "duration": "30min",
            "status": "pending",
            "position": 3,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "completed_at": None
        },
        {
            "id": str(uuid4()),
            "user_id": user_id,
            "title": "Coffee break",
            "description": "Take a quick break",
            "lane": "main",
            "duration": "10min",
            "status": "completed",
            "position": 4,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "completed_at": datetime.now().isoformat()
        },
        {
            "id": str(uuid4()),
            "user_id": user_id,
            "title": "Test new deployment pipeline",
            "description": "Verify CI/CD changes are working",
            "lane": "controller",
            "duration": None,
            "status": "pending",
            "position": 5,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "completed_at": None
        },
        {
            "id": str(uuid4()),
            "user_id": user_id,
            "title": "Reply to customer feedback",
            "description": "Respond to recent support tickets",
            "lane": "controller",
            "duration": None,
            "status": "pending",
            "position": 6,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "completed_at": None
        },
        {
            "id": str(uuid4()),
            "user_id": user_id,
            "title": "Research new React patterns",
            "description": "Look into Server Components",
            "lane": "controller",
            "duration": None,
            "status": "pending",
            "position": 7,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "completed_at": None
        }
    ]
    
    for task in daily_tasks:
        memory_db["daily_tasks"][task["id"]] = task

# Initialize on module load
init_test_data()

class MemoryDatabaseService:
    """In-memory database service that mimics Supabase structure"""
    
    # User operations
    async def get_or_create_user(self, email: str = "dev@example.com") -> Dict[str, Any]:
        """Get or create a user"""
        for user_id, user in memory_db["users"].items():
            if user["email"] == email:
                return user
        
        # Create new user
        user_id = str(uuid4())
        user = {
            "id": user_id,
            "email": email,
            "full_name": "New User",
            "is_active": True,
            "is_superuser": False,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "hashed_password": "hashed_password"
        }
        memory_db["users"][user_id] = user
        return user
    
    # Card operations
    async def get_cards(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all cards for a user"""
        cards = [card for card in memory_db["cards"].values() if card["user_id"] == user_id]
        return sorted(cards, key=lambda x: x["position"])
    
    async def get_card(self, card_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific card"""
        card = memory_db["cards"].get(card_id)
        if card and card["user_id"] == user_id:
            return card
        return None
    
    async def create_card(self, card_data: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """Create a new card"""
        # Ensure only one active card
        if card_data.get("status") == "active":
            for card in memory_db["cards"].values():
                if card["user_id"] == user_id and card["status"] == "active":
                    card["status"] = "queued"
        
        card_id = str(uuid4())
        card = {
            "id": card_id,
            "user_id": user_id,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "pause_until": None,
            "last_worked_on": None,
            "sessions_count": 0,
            "where_left_off": None,
            "momentum_score": 0,
            "position": 0,  # Default position
            "status": "queued",  # Default status
            **card_data
        }
        memory_db["cards"][card_id] = card
        return card
    
    async def update_card(self, card_id: str, card_data: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """Update a card"""
        card = memory_db["cards"].get(card_id)
        if not card or card["user_id"] != user_id:
            raise ValueError(f"Card {card_id} not found")
        
        # Ensure only one active card
        if card_data.get("status") == "active":
            for other_card in memory_db["cards"].values():
                if other_card["user_id"] == user_id and other_card["status"] == "active" and other_card["id"] != card_id:
                    other_card["status"] = "queued"
        
        card.update(card_data)
        card["updated_at"] = datetime.now().isoformat()
        return card
    
    async def delete_card(self, card_id: str, user_id: str) -> bool:
        """Delete a card"""
        if card_id in memory_db["cards"] and memory_db["cards"][card_id]["user_id"] == user_id:
            del memory_db["cards"][card_id]
            # Also delete associated tasks
            task_ids_to_delete = [tid for tid, task in memory_db["focus_tasks"].items() if task["card_id"] == card_id]
            for tid in task_ids_to_delete:
                del memory_db["focus_tasks"][tid]
            return True
        return False
    
    # Focus Task operations
    async def get_focus_tasks(self, card_id: Optional[str] = None, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get focus tasks, optionally filtered by card"""
        if card_id:
            tasks = [task for task in memory_db["focus_tasks"].values() if task["card_id"] == card_id]
        else:
            tasks = list(memory_db["focus_tasks"].values())
        return sorted(tasks, key=lambda x: x["position"])
    
    async def get_focus_task(self, task_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific focus task"""
        return memory_db["focus_tasks"].get(task_id)
    
    async def create_focus_task(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new focus task"""
        task_id = str(uuid4())
        task = {
            "id": task_id,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "last_touched": datetime.now().isoformat(),
            "is_breakthrough": False,
            "is_stale": False,
            "status": "pending",
            **task_data
        }
        memory_db["focus_tasks"][task_id] = task
        return task
    
    async def update_focus_task(self, task_id: str, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update a focus task"""
        task = memory_db["focus_tasks"].get(task_id)
        if not task:
            raise ValueError(f"Focus task {task_id} not found")
        
        task.update(task_data)
        task["updated_at"] = datetime.now().isoformat()
        task["last_touched"] = datetime.now().isoformat()
        return task
    
    async def delete_focus_task(self, task_id: str) -> bool:
        """Delete a focus task"""
        if task_id in memory_db["focus_tasks"]:
            del memory_db["focus_tasks"][task_id]
            return True
        return False
    
    # Daily Task operations (similar structure to focus tasks)
    async def get_daily_tasks(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all daily tasks for a user"""
        tasks = [task for task in memory_db["daily_tasks"].values() if task.get("user_id") == user_id]
        return sorted(tasks, key=lambda x: x.get("position", 0))
    
    async def get_daily_task(self, task_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific daily task"""
        task = memory_db["daily_tasks"].get(task_id)
        if task and task.get("user_id") == user_id:
            return task
        return None
    
    async def create_daily_task(self, task_data: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """Create a new daily task"""
        task_id = str(uuid4())
        # Set defaults first
        task = {
            "id": task_id,
            "user_id": user_id,
            "status": "pending",  # Default status
            "completed_at": None,  # Default completed_at
            "position": len([t for t in memory_db["daily_tasks"].values() if t.get("user_id") == user_id]),  # Auto-position
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
        }
        # Update with provided data, but don't overwrite defaults if not provided
        for key, value in task_data.items():
            task[key] = value
        # Ensure required fields are present
        if "status" not in task:
            task["status"] = "pending"
        if "completed_at" not in task:
            task["completed_at"] = None
        memory_db["daily_tasks"][task_id] = task
        return task
    
    async def update_daily_task(self, task_id: str, task_data: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """Update a daily task"""
        task = memory_db["daily_tasks"].get(task_id)
        if not task or task.get("user_id") != user_id:
            raise ValueError(f"Daily task {task_id} not found")
        
        task.update(task_data)
        task["updated_at"] = datetime.now().isoformat()
        return task
    
    async def delete_daily_task(self, task_id: str, user_id: str) -> bool:
        """Delete a daily task"""
        if task_id in memory_db["daily_tasks"] and memory_db["daily_tasks"][task_id].get("user_id") == user_id:
            del memory_db["daily_tasks"][task_id]
            return True
        return False

# Singleton instance
memory_db_service = MemoryDatabaseService()