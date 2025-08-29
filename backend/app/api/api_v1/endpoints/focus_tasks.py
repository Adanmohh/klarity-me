from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.api import deps
from app.crud.focus_task import focus_task_crud
from app.crud.card import card_crud
from app.db.session import get_db
from app.models.user import User
from app.schemas.focus_task import FocusTask, FocusTaskCreate, FocusTaskUpdate
from app.core.config import settings
from app.services.database import db_service

# Import mock data functions for dev mode  
if settings.DEV_MODE:
    from app.api.mock_data import (
        get_mock_focus_tasks, create_mock_focus_task, get_mock_card
    )

router = APIRouter()


@router.get("/", response_model=List[FocusTask])
async def read_all_focus_tasks(
    *,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Get all focus tasks for the current user"""
    if settings.DEV_MODE:
        # Return all mock focus tasks
        from app.api.mock_data import get_all_mock_focus_tasks
        return get_all_mock_focus_tasks(current_user.id)
    
    # Use Supabase for production
    tasks = await db_service.get_focus_tasks()
    return tasks if tasks else []


@router.get("/card/{card_id}", response_model=List[FocusTask])
async def read_focus_tasks_by_card(
    *,
    db: AsyncSession = Depends(get_db),
    card_id: UUID,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    if settings.DEV_MODE:
        # Check card ownership in dev mode
        card = get_mock_card(card_id, current_user.id)
        if not card:
            raise HTTPException(status_code=404, detail="Card not found")
        return get_mock_focus_tasks(card_id)
    
    # Use Supabase for production
    card = await db_service.get_card(str(card_id), str(current_user.id))
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    tasks = await db_service.get_focus_tasks(card_id=str(card_id))
    return tasks


@router.post("/", response_model=FocusTask)
async def create_focus_task(
    *,
    db: AsyncSession = Depends(get_db),
    task_in: FocusTaskCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    if settings.DEV_MODE:
        # Check card ownership in dev mode
        card = get_mock_card(task_in.card_id, current_user.id)
        if not card:
            raise HTTPException(status_code=404, detail="Card not found")
        return create_mock_focus_task(task_in.dict())
    
    # Use Supabase for production
    task_data = task_in.dict()
    task_data["card_id"] = str(task_data["card_id"])
    task = await db_service.create_focus_task(task_data)
    return task


@router.put("/{task_id}", response_model=FocusTask)
async def update_focus_task(
    *,
    db: AsyncSession = Depends(get_db),
    task_id: UUID,
    task_in: FocusTaskUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    if settings.DEV_MODE:
        # Mock implementation for dev mode
        from app.api.mock_data import update_mock_focus_task
        task = update_mock_focus_task(task_id, task_in.dict(exclude_unset=True))
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        return task
    
    # Use Supabase for production
    task = await db_service.get_focus_task(str(task_id))
    if not task:
        # Create new task if it doesn't exist (for frontend sync)
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


@router.delete("/{task_id}", response_model=FocusTask)
async def delete_focus_task(
    *,
    db: AsyncSession = Depends(get_db),
    task_id: UUID,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    if settings.DEV_MODE:
        # Mock implementation for dev mode
        from app.api.mock_data import delete_mock_focus_task
        task = delete_mock_focus_task(task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        return task
    
    # Use Supabase for production
    task = await db_service.get_focus_task(str(task_id))
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Verify ownership through card
    card = await db_service.get_card(str(task.get("card_id")), str(current_user.id))
    if not card:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    success = await db_service.delete_focus_task(str(task_id))
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
    return task