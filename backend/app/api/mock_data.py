from typing import List, Optional
from uuid import UUID, uuid4
from datetime import datetime, timedelta
from app.schemas.card import Card, CardWithTasks
from app.schemas.focus_task import FocusTask
from app.schemas.daily_task import DailyTask
from app.models.card import CardStatus

# Mock data storage
mock_cards: List[dict] = [
    {
        "id": uuid4(),
        "user_id": UUID('12345678-1234-5678-1234-567812345678'),
        "title": "Project Alpha",
        "description": "Main development project",
        "position": 0,
        "status": CardStatus.ACTIVE,
        "pause_until": None,
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    },
    {
        "id": uuid4(),
        "user_id": UUID('12345678-1234-5678-1234-567812345678'),
        "title": "Research Task",
        "description": "Technology research and evaluation",
        "position": 1,
        "status": CardStatus.ACTIVE,
        "pause_until": None,
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    },
    {
        "id": uuid4(),
        "user_id": UUID('12345678-1234-5678-1234-567812345678'),
        "title": "Learning Goals",
        "description": "Personal learning objectives",
        "position": 2,
        "status": CardStatus.PAUSED,
        "pause_until": datetime.now() + timedelta(days=2),
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }
]

mock_focus_tasks: List[dict] = []
mock_daily_tasks: List[dict] = []

def get_mock_cards(user_id: UUID) -> List[Card]:
    """Get all cards for a user"""
    user_cards = [card for card in mock_cards if card["user_id"] == user_id]
    return [Card(**card) for card in user_cards]

def get_mock_card(card_id: UUID, user_id: UUID) -> Optional[Card]:
    """Get a single card"""
    for card in mock_cards:
        if card["id"] == card_id and card["user_id"] == user_id:
            return Card(**card)
    return None

def get_mock_card_with_tasks(card_id: UUID, user_id: UUID) -> Optional[CardWithTasks]:
    """Get a card with its tasks"""
    card = get_mock_card(card_id, user_id)
    if not card:
        return None
    
    focus_tasks = [FocusTask(**task) for task in mock_focus_tasks if task.get("card_id") == card_id]
    daily_tasks = [DailyTask(**task) for task in mock_daily_tasks if task.get("card_id") == card_id]
    
    return CardWithTasks(
        **card.dict(),
        focus_tasks=focus_tasks,
        daily_tasks=daily_tasks
    )

def create_mock_card(card_data: dict, user_id: UUID) -> Card:
    """Create a new card"""
    new_card = {
        "id": uuid4(),
        "user_id": user_id,
        "title": card_data.get("title", "New Card"),
        "description": card_data.get("description", ""),
        "position": card_data.get("position", len(mock_cards)),
        "status": CardStatus.ACTIVE,
        "pause_until": None,
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }
    mock_cards.append(new_card)
    return Card(**new_card)

def update_mock_card(card_id: UUID, card_data: dict, user_id: UUID) -> Optional[Card]:
    """Update an existing card"""
    for i, card in enumerate(mock_cards):
        if card["id"] == card_id and card["user_id"] == user_id:
            for key, value in card_data.items():
                if value is not None:
                    card[key] = value
            card["updated_at"] = datetime.now()
            mock_cards[i] = card
            return Card(**card)
    return None

def delete_mock_card(card_id: UUID, user_id: UUID) -> Optional[Card]:
    """Delete a card"""
    for i, card in enumerate(mock_cards):
        if card["id"] == card_id and card["user_id"] == user_id:
            deleted_card = mock_cards.pop(i)
            return Card(**deleted_card)
    return None

def get_mock_focus_tasks(card_id: UUID) -> List[FocusTask]:
    """Get focus tasks for a card"""
    tasks = [task for task in mock_focus_tasks if task.get("card_id") == card_id]
    return [FocusTask(**task) for task in tasks]

def create_mock_focus_task(task_data: dict) -> FocusTask:
    """Create a new focus task"""
    new_task = {
        "id": uuid4(),
        "card_id": task_data.get("card_id"),
        "title": task_data.get("title", "New Task"),
        "description": task_data.get("description", ""),
        "lane": task_data.get("lane", "controller"),
        "date_filter": task_data.get("date_filter"),
        "tags": task_data.get("tags", []),
        "completed": task_data.get("completed", False),
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }
    mock_focus_tasks.append(new_task)
    return FocusTask(**new_task)

def get_mock_daily_tasks(card_id: UUID) -> List[DailyTask]:
    """Get daily tasks for a card"""
    tasks = [task for task in mock_daily_tasks if task.get("card_id") == card_id]
    return [DailyTask(**task) for task in tasks]

def create_mock_daily_task(task_data: dict) -> DailyTask:
    """Create a new daily task"""
    new_task = {
        "id": uuid4(),
        "card_id": task_data.get("card_id"),
        "title": task_data.get("title", "New Task"),
        "description": task_data.get("description", ""),
        "time_category": task_data.get("time_category", "10min"),
        "lane": task_data.get("lane", "controller"),
        "completed": task_data.get("completed", False),
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }
    mock_daily_tasks.append(new_task)
    return DailyTask(**new_task)