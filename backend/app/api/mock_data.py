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
        "status": CardStatus.QUEUED,
        "pause_until": None,
        "last_worked_on": None,
        "sessions_count": 0,
        "where_left_off": None,
        "momentum_score": 0,
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    },
    {
        "id": uuid4(),
        "user_id": UUID('12345678-1234-5678-1234-567812345678'),
        "title": "Research Task",
        "description": "Technology research and evaluation",
        "position": 1,
        "status": CardStatus.QUEUED,
        "pause_until": None,
        "last_worked_on": None,
        "sessions_count": 0,
        "where_left_off": None,
        "momentum_score": 0,
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    },
    {
        "id": uuid4(),
        "user_id": UUID('12345678-1234-5678-1234-567812345678'),
        "title": "Learning Goals",
        "description": "Personal learning objectives",
        "position": 2,
        "status": CardStatus.ON_HOLD,
        "pause_until": datetime.now() + timedelta(days=2),
        "last_worked_on": None,
        "sessions_count": 0,
        "where_left_off": None,
        "momentum_score": 0,
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
    
    # Get existing tasks for this card
    focus_tasks = [FocusTask(**task) for task in mock_focus_tasks if str(task.get("card_id")) == str(card_id)]
    daily_tasks = [DailyTask(**task) for task in mock_daily_tasks if str(task.get("card_id")) == str(card_id)]
    
    # If no focus tasks exist for this card, create some sample tasks
    if not focus_tasks:
        from app.models.focus_task import TaskStatus
        sample_tasks = [
            {
                "id": uuid4(),
                "card_id": card_id,
                "title": "Sample Task 1",
                "description": "This is a sample task in the controller lane",
                "status": TaskStatus.ACTIVE,
                "lane": "controller",
                "position": 0,
                "date": None,
                "tags": [],
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            },
            {
                "id": uuid4(),
                "card_id": card_id,
                "title": "Sample Task 2",
                "description": "This is a sample task in the main lane",
                "status": TaskStatus.ACTIVE,
                "lane": "main",
                "position": 0,
                "date": None,
                "tags": [],
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            }
        ]
        # Add these tasks to the mock storage
        mock_focus_tasks.extend(sample_tasks)
        focus_tasks = [FocusTask(**task) for task in sample_tasks]
    
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
        "status": CardStatus.QUEUED,
        "pause_until": None,
        "last_worked_on": None,
        "sessions_count": 0,
        "where_left_off": None,
        "momentum_score": 0,
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }
    mock_cards.append(new_card)
    return Card(**new_card)

def update_mock_card(card_id: UUID, card_data: dict, user_id: UUID) -> Optional[Card]:
    """Update an existing card"""
    # SAFETY: If setting a card to active, ensure no other cards are active
    if card_data.get("status") == CardStatus.ACTIVE or card_data.get("status") == "active":
        # First deactivate all other active cards for this user
        for card in mock_cards:
            if (card["user_id"] == user_id and 
                card["id"] != card_id and 
                card["status"] == CardStatus.ACTIVE):
                card["status"] = CardStatus.QUEUED
                card["updated_at"] = datetime.now()
    
    # Now update the requested card
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
    card_id_str = str(card_id)
    tasks = [task for task in mock_focus_tasks if str(task.get("card_id")) == card_id_str]
    return [FocusTask(**task) for task in tasks]

def get_all_mock_focus_tasks(user_id: UUID) -> List[FocusTask]:
    """Get all focus tasks for a user"""
    # Get all cards for the user first
    user_id_str = str(user_id)
    user_cards = [card for card in mock_cards if str(card.get("user_id")) == user_id_str]
    card_ids = [str(card.get("id")) for card in user_cards]
    
    # Get all tasks for those cards
    tasks = [task for task in mock_focus_tasks if str(task.get("card_id")) in card_ids]
    return [FocusTask(**task) for task in tasks]

def create_mock_focus_task(task_data: dict) -> FocusTask:
    """Create a new focus task"""
    from app.models.focus_task import TaskStatus
    
    task_id = uuid4()
    new_task = {
        "id": task_id,
        "card_id": task_data.get("card_id"),
        "title": task_data.get("title", "New Task"),
        "description": task_data.get("description", ""),
        "status": TaskStatus.ACTIVE,  # Add the status field
        "lane": task_data.get("lane", "controller"),
        "position": task_data.get("position", 0),
        "date": task_data.get("date"),
        "tags": task_data.get("tags", []),
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }
    mock_focus_tasks.append(new_task)
    print(f"Created focus task with ID: {task_id}")
    return FocusTask(**new_task)

def update_mock_focus_task(task_id: UUID, updates: dict) -> Optional[FocusTask]:
    """Update an existing focus task"""
    # First check if the task exists, if not create it with the updates
    # Convert task_id to string for comparison
    task_id_str = str(task_id)
    for i, task in enumerate(mock_focus_tasks):
        # Compare as strings to handle both UUID and string IDs
        if str(task.get("id")) == task_id_str:
            for key, value in updates.items():
                if value is not None:
                    task[key] = value
            task["updated_at"] = datetime.now()
            mock_focus_tasks[i] = task
            print(f"Updated focus task with ID: {task_id}")
            return FocusTask(**task)
    
    # Task doesn't exist - this can happen when frontend has tasks from initial card data
    # Create a new task with the given ID and updates
    from app.models.focus_task import TaskStatus
    print(f"Task {task_id} not found, creating new task with updates")
    new_task = {
        "id": task_id,
        "card_id": updates.get("card_id", uuid4()),  # Need a card_id
        "title": updates.get("title", "Untitled Task"),
        "description": updates.get("description", ""),
        "status": updates.get("status", TaskStatus.ACTIVE),
        "lane": updates.get("lane", "controller"),
        "position": updates.get("position", 0),
        "date": updates.get("date"),
        "tags": updates.get("tags", []),
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }
    # Apply any other updates
    for key, value in updates.items():
        if value is not None and key not in new_task:
            new_task[key] = value
    
    mock_focus_tasks.append(new_task)
    return FocusTask(**new_task)

def delete_mock_focus_task(task_id: UUID) -> Optional[FocusTask]:
    """Delete a focus task"""
    global mock_focus_tasks
    task_id_str = str(task_id)
    for i, task in enumerate(mock_focus_tasks):
        if str(task.get("id")) == task_id_str:
            deleted_task = mock_focus_tasks.pop(i)
            return FocusTask(**deleted_task)
    return None

def get_mock_daily_tasks(card_id: UUID) -> List[DailyTask]:
    """Get daily tasks for a card"""
    tasks = [task for task in mock_daily_tasks if task.get("card_id") == card_id]
    return [DailyTask(**task) for task in tasks]

def create_mock_daily_task(task_data: dict) -> DailyTask:
    """Create a new daily task"""
    from app.models.daily_task import TaskStatus
    
    new_task = {
        "id": uuid4(),
        "card_id": task_data.get("card_id"),
        "title": task_data.get("title", "New Task"),
        "description": task_data.get("description", ""),
        "status": TaskStatus.PENDING,
        "time_category": task_data.get("time_category", "10min"),
        "lane": task_data.get("lane", "controller"),
        "position": task_data.get("position", 0),
        "completed": task_data.get("completed", False),
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }
    mock_daily_tasks.append(new_task)
    return DailyTask(**new_task)

def update_mock_daily_task(task_id: UUID, updates: dict) -> Optional[DailyTask]:
    """Update an existing daily task"""
    for i, task in enumerate(mock_daily_tasks):
        if task.get("id") == task_id:
            for key, value in updates.items():
                if value is not None:
                    task[key] = value
            task["updated_at"] = datetime.now()
            mock_daily_tasks[i] = task
            return DailyTask(**task)
    return None

def delete_mock_daily_task(task_id: UUID) -> Optional[DailyTask]:
    """Delete a daily task"""
    global mock_daily_tasks
    for i, task in enumerate(mock_daily_tasks):
        if task.get("id") == task_id:
            deleted_task = mock_daily_tasks.pop(i)
            return DailyTask(**deleted_task)
    return None