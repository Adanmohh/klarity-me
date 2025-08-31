"""
Development store for in-memory data persistence
All data operations go through this when database is not configured
"""
from typing import Dict, List, Any, Optional
from datetime import datetime
import uuid
import hashlib
from dataclasses import dataclass, field, asdict

@dataclass
class DevUser:
    id: str
    email: str
    full_name: str
    is_verified: bool = False  # Email verification status
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    last_login: Optional[datetime] = None
    is_active: bool = True

@dataclass  
class DevCard:
    id: str
    title: str
    description: str = ""
    emoji: str = "📝"
    color: str = "#3b82f6"
    position: int = 0
    user_id: str = ""
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

@dataclass
class DevTask:
    id: str
    title: str
    card_id: str
    user_id: str = ""
    description: str = ""
    priority: str = "medium"
    status: str = "pending"
    completed: bool = False
    completed_at: Optional[datetime] = None
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

class DevStore:
    """In-memory store for development"""
    
    def __init__(self):
        self.users: Dict[str, DevUser] = {}
        self.cards: Dict[str, DevCard] = {}
        self.tasks: Dict[str, DevTask] = {}
        self.daily_tasks: Dict[str, Dict] = {}
        self.habits: Dict[str, Dict] = {}
        
        # Create a test user (verified for testing)
        test_user = DevUser(
            id="test-user-1",
            email="test@example.com", 
            full_name="Test User",
            is_verified=True  # Pre-verified for testing
        )
        self.users[test_user.id] = test_user
        
        # Create some sample cards
        self._create_sample_data(test_user.id)
    
    def verify_user_email(self, email: str) -> bool:
        """Mark user's email as verified"""
        user = self.get_user_by_email(email)
        if user:
            user.is_verified = True
            user.updated_at = datetime.now()
            return True
        return False
    
    def _create_sample_data(self, user_id: str):
        """Create sample data for development"""
        # Sample cards
        cards_data = [
            {"title": "Main Focus", "emoji": "🎯", "color": "#3b82f6"},
            {"title": "Quick Tasks", "emoji": "⚡", "color": "#10b981"},
            {"title": "Projects", "emoji": "📁", "color": "#8b5cf6"},
        ]
        
        for i, card_data in enumerate(cards_data):
            card = DevCard(
                id=str(uuid.uuid4()),
                title=card_data["title"],
                emoji=card_data["emoji"],
                color=card_data["color"],
                position=i,
                user_id=user_id
            )
            self.cards[card.id] = card
    
    # User operations
    def create_user(self, email: str, full_name: str = "") -> DevUser:
        """Create a new user"""
        if any(u.email == email for u in self.users.values()):
            raise ValueError("User with this email already exists")
        
        user = DevUser(
            id=str(uuid.uuid4()),
            email=email,
            full_name=full_name,
            is_verified=False  # Requires email verification
        )
        self.users[user.id] = user
        return user
    
    def get_user_by_email(self, email: str) -> Optional[DevUser]:
        """Get user by email"""
        for user in self.users.values():
            if user.email == email:
                return user
        return None
    
    def get_user_by_id(self, user_id: str) -> Optional[DevUser]:
        """Get user by ID"""
        return self.users.get(user_id)
    
    def authenticate_user(self, email: str) -> Optional[DevUser]:
        """Authenticate user with email (after OTP verification)"""
        user = self.get_user_by_email(email)
        if user and user.is_verified:
            user.last_login = datetime.now()
            return user
        return None
    
    def get_or_create_user(self, email: str, full_name: str = "") -> DevUser:
        """Get existing user or create new one"""
        user = self.get_user_by_email(email)
        if not user:
            user = self.create_user(email, full_name)
        return user
    
    # Card operations
    def get_cards(self, user_id: str) -> List[DevCard]:
        """Get all cards for a user"""
        return sorted(
            [c for c in self.cards.values() if c.user_id == user_id],
            key=lambda x: x.position
        )
    
    def create_card(self, user_id: str, title: str, **kwargs) -> DevCard:
        """Create a new card"""
        card = DevCard(
            id=str(uuid.uuid4()),
            title=title,
            user_id=user_id,
            position=len(self.cards),
            **kwargs
        )
        self.cards[card.id] = card
        return card
    
    def update_card(self, card_id: str, **updates) -> Optional[DevCard]:
        """Update a card"""
        if card_id in self.cards:
            card = self.cards[card_id]
            for key, value in updates.items():
                if hasattr(card, key):
                    setattr(card, key, value)
            card.updated_at = datetime.now()
            return card
        return None
    
    def delete_card(self, card_id: str) -> bool:
        """Delete a card"""
        if card_id in self.cards:
            del self.cards[card_id]
            # Also delete associated tasks
            self.tasks = {k: v for k, v in self.tasks.items() if v.card_id != card_id}
            return True
        return False
    
    # Task operations  
    def get_tasks_by_card(self, card_id: str) -> List[DevTask]:
        """Get all tasks for a card"""
        return [t for t in self.tasks.values() if t.card_id == card_id]
    
    def create_task(self, card_id: str, title: str, user_id: str = "", **kwargs) -> DevTask:
        """Create a new task"""
        task = DevTask(
            id=str(uuid.uuid4()),
            title=title,
            card_id=card_id,
            user_id=user_id,
            **kwargs
        )
        self.tasks[task.id] = task
        return task
    
    def update_task(self, task_id: str, **updates) -> Optional[DevTask]:
        """Update a task"""
        if task_id in self.tasks:
            task = self.tasks[task_id]
            for key, value in updates.items():
                if hasattr(task, key):
                    setattr(task, key, value)
            task.updated_at = datetime.now()
            
            # Handle completion
            if 'completed' in updates and updates['completed']:
                task.completed_at = datetime.now()
            elif 'completed' in updates and not updates['completed']:
                task.completed_at = None
                
            return task
        return None
    
    def delete_task(self, task_id: str) -> bool:
        """Delete a task"""
        if task_id in self.tasks:
            del self.tasks[task_id]
            return True
        return False

# Global store instance
dev_store = DevStore()