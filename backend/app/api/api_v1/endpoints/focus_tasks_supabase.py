from typing import Any, List
from fastapi import APIRouter, HTTPException
from uuid import UUID

from app.schemas.focus_task import FocusTask, FocusTaskCreate, FocusTaskUpdate
from app.services.database import db_service

router = APIRouter()


@router.get("/", response_model=List[FocusTask])
async def read_all_focus_tasks() -> Any:
    """Get all focus tasks"""
    tasks = await db_service.get_focus_tasks()
    return tasks


@router.get("/{task_id}", response_model=FocusTask)
async def read_focus_task(task_id: UUID) -> Any:
    """Get a specific focus task"""
    task = await db_service.get_focus_task(str(task_id))
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.get("/card/{card_id}", response_model=List[FocusTask])
async def read_focus_tasks_by_card(card_id: UUID) -> Any:
    """Get all focus tasks for a specific card"""
    tasks = await db_service.get_focus_tasks(card_id=str(card_id))
    return tasks


@router.post("/", response_model=FocusTask)
async def create_focus_task(task_in: FocusTaskCreate) -> Any:
    """Create a new focus task"""
    # Verify card exists
    card = await db_service.get_card(str(task_in.card_id), user_id=None)
    if not card:
        # For now, we'll allow creating tasks without verifying the card
        pass
    
    task_data = task_in.dict()
    task_data["card_id"] = str(task_data["card_id"])
    task = await db_service.create_focus_task(task_data)
    return task


@router.put("/{task_id}", response_model=FocusTask)
async def update_focus_task(task_id: UUID, task_in: FocusTaskUpdate) -> Any:
    """Update a focus task"""
    task = await db_service.get_focus_task(str(task_id))
    if not task:
        # Create a new task if it doesn't exist (for frontend sync)
        task_data = task_in.dict(exclude_unset=True)
        task_data["id"] = str(task_id)
        if "card_id" in task_data:
            task_data["card_id"] = str(task_data["card_id"])
        task = await db_service.create_focus_task(task_data)
        return task
    
    task_data = task_in.dict(exclude_unset=True)
    if "card_id" in task_data:
        task_data["card_id"] = str(task_data["card_id"])
    
    updated_task = await db_service.update_focus_task(str(task_id), task_data)
    return updated_task


@router.delete("/{task_id}")
async def delete_focus_task(task_id: UUID) -> Any:
    """Delete a focus task"""
    success = await db_service.delete_focus_task(str(task_id))
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"success": True}