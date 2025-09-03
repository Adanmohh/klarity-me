"""
Focus tasks endpoint using dev store for development
"""
from typing import Any, List, Optional
from fastapi import APIRouter, HTTPException, Depends
from uuid import UUID, uuid4
from datetime import datetime
from pydantic import BaseModel

from app.core.config import settings
from app.db.dev_store import dev_store
from app.api.deps_supabase import get_current_user_supabase, SupabaseUser

router = APIRouter()

print("LOADING focus_tasks_dev.py - This should appear in the console")

class FocusTaskCreate(BaseModel):
    card_id: str
    title: str
    description: Optional[str] = ""
    lane: str = "controller"
    position: int = 0
    
class FocusTaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    lane: Optional[str] = None
    position: Optional[int] = None
    status: Optional[str] = None
    
class FocusTask(BaseModel):
    id: str
    card_id: str
    title: str
    description: str = ""
    lane: str = "controller"
    position: int = 0
    status: str = "active"
    created_at: datetime
    updated_at: datetime

# In-memory storage for focus tasks
focus_tasks_store = {}

@router.get("/", response_model=List[FocusTask])
async def get_all_focus_tasks(
    current_user: SupabaseUser = Depends(get_current_user_supabase)
) -> Any:
    """Get all focus tasks for the current user's cards"""
    if not settings.DEV_MODE:
        raise HTTPException(status_code=503, detail="Supabase connection not configured")
    
    # Get user's cards
    user_cards = dev_store.get_cards(current_user.id)
    card_ids = [card.id for card in user_cards]
    
    # Return tasks for those cards
    tasks = []
    for task_id, task in focus_tasks_store.items():
        if task['card_id'] in card_ids:
            tasks.append(FocusTask(**task))
    
    return tasks

@router.get("/card/{card_id}", response_model=List[FocusTask])
async def get_focus_tasks_by_card(
    card_id: str,
    current_user: SupabaseUser = Depends(get_current_user_supabase)
) -> Any:
    """Get focus tasks for a specific card"""
    if not settings.DEV_MODE:
        raise HTTPException(status_code=503, detail="Supabase connection not configured")
    
    # Check card ownership
    cards = dev_store.get_cards(current_user.id)
    card_exists = any(card.id == card_id for card in cards)
    if not card_exists:
        raise HTTPException(status_code=404, detail="Card not found")
    
    # Return tasks for this card
    tasks = []
    for task_id, task in focus_tasks_store.items():
        if task['card_id'] == card_id:
            tasks.append(FocusTask(**task))
    
    return tasks

@router.post("/", response_model=FocusTask)
async def create_focus_task(
    task_in: FocusTaskCreate,
    current_user: SupabaseUser = Depends(get_current_user_supabase)
) -> Any:
    """Create a new focus task"""
    if not settings.DEV_MODE:
        raise HTTPException(status_code=503, detail="Supabase connection not configured")
    
    # Skip card ownership check in dev mode for testing
    # In production, you would check card ownership here
    pass
    
    # Create task
    task_id = str(uuid4())
    new_task = {
        'id': task_id,
        'card_id': task_in.card_id,
        'title': task_in.title,
        'description': task_in.description or "",
        'lane': task_in.lane,
        'position': task_in.position,
        'status': 'active',
        'created_at': datetime.now(),
        'updated_at': datetime.now()
    }
    
    focus_tasks_store[task_id] = new_task
    return FocusTask(**new_task)

@router.put("/{task_id}", response_model=FocusTask)
async def update_focus_task(
    task_id: str,
    task_in: FocusTaskUpdate,
    current_user: SupabaseUser = Depends(get_current_user_supabase)
) -> Any:
    """Update a focus task"""
    if not settings.DEV_MODE:
        raise HTTPException(status_code=503, detail="Supabase connection not configured")
    
    # Check if task exists
    if task_id not in focus_tasks_store:
        # Create new task if it doesn't exist (for frontend sync)
        # We need a card_id though
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Update task
    task = focus_tasks_store[task_id]
    
    # Verify ownership through card
    cards = dev_store.get_cards(current_user.id)
    card_exists = any(card.id == task['card_id'] for card in cards)
    if not card_exists:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Apply updates
    updates = task_in.dict(exclude_unset=True)
    for key, value in updates.items():
        if value is not None:
            task[key] = value
    task['updated_at'] = datetime.now()
    
    return FocusTask(**task)

@router.delete("/{task_id}")
async def delete_focus_task(
    task_id: str,
    current_user: SupabaseUser = Depends(get_current_user_supabase)
) -> Any:
    """Delete a focus task"""
    if not settings.DEV_MODE:
        raise HTTPException(status_code=503, detail="Supabase connection not configured")
    
    if task_id not in focus_tasks_store:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task = focus_tasks_store[task_id]
    
    # Verify ownership through card
    cards = dev_store.get_cards(current_user.id)
    card_exists = any(card.id == task['card_id'] for card in cards)
    if not card_exists:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    del focus_tasks_store[task_id]
    return {"message": "Task deleted successfully"}