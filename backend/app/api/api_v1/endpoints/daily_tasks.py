from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from uuid import UUID
import logging
from datetime import datetime

from app.api import deps
from app.models.user import User
from app.schemas.daily_task import DailyTask, DailyTaskCreate, DailyTaskUpdate
from app.models.daily_task import TaskLane
from app.core.config import settings
from app.services.memory_db import memory_db_service as db_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/", response_model=List[DailyTask])
async def read_daily_tasks(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Get all daily tasks for the current user"""
    try:
        # Get or create dev user
        user = await db_service.get_or_create_user(current_user.email if hasattr(current_user, 'email') else "dev@example.com")
        tasks = await db_service.get_daily_tasks(user["id"])
        return tasks
    except Exception as e:
        logger.error(f"Error getting daily tasks: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch daily tasks")


@router.post("/", response_model=DailyTask)
async def create_daily_task(
    *,
    task_in: DailyTaskCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Create a new daily task"""
    try:
        # Get or create dev user
        user = await db_service.get_or_create_user(current_user.email if hasattr(current_user, 'email') else "dev@example.com")
        # Convert pydantic model to dict, converting enum to string
        task_data = task_in.dict(exclude_unset=True)
        # Ensure enums are converted to strings
        if "lane" in task_data and hasattr(task_data["lane"], "value"):
            task_data["lane"] = task_data["lane"].value
        task = await db_service.create_daily_task(task_data, user["id"])
        return task
    except Exception as e:
        logger.error(f"Error creating daily task: {e}")
        raise HTTPException(status_code=500, detail="Failed to create daily task")


@router.get("/{task_id}", response_model=DailyTask)
async def read_daily_task(
    *,
    task_id: UUID,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Get a specific daily task"""
    try:
        # Get or create dev user
        user = await db_service.get_or_create_user(current_user.email if hasattr(current_user, 'email') else "dev@example.com")
        task = await db_service.get_daily_task(str(task_id), user["id"])
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        return task
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting daily task: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch daily task")


@router.put("/{task_id}", response_model=DailyTask)
async def update_daily_task(
    *,
    task_id: UUID,
    task_in: DailyTaskUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Update a daily task"""
    try:
        # Get or create dev user
        user = await db_service.get_or_create_user(current_user.email if hasattr(current_user, 'email') else "dev@example.com")
        
        # Convert pydantic model to dict
        update_data = task_in.dict(exclude_unset=True)
        
        # Ensure enums are converted to strings
        for key in ["lane", "status", "duration"]:
            if key in update_data and hasattr(update_data[key], "value"):
                update_data[key] = update_data[key].value
        
        # If marking as completed, set completed_at
        if update_data.get("status") == "completed":
            update_data["completed_at"] = datetime.now().isoformat()
        
        task = await db_service.update_daily_task(str(task_id), update_data, user["id"])
        return task
    except ValueError as e:
        raise HTTPException(status_code=404, detail="Task not found")
    except Exception as e:
        logger.error(f"Error updating daily task: {e}")
        raise HTTPException(status_code=500, detail="Failed to update daily task")


@router.delete("/{task_id}", response_model=DailyTask)
async def delete_daily_task(
    *,
    task_id: UUID,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Delete a daily task"""
    try:
        # Get or create dev user
        user = await db_service.get_or_create_user(current_user.email if hasattr(current_user, 'email') else "dev@example.com")
        
        # Get task before deleting to return it
        task = await db_service.get_daily_task(str(task_id), user["id"])
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        success = await db_service.delete_daily_task(str(task_id), user["id"])
        if not success:
            raise HTTPException(status_code=500, detail="Failed to delete task")
        
        return task
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting daily task: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete daily task")


@router.post("/{task_id}/complete", response_model=DailyTask)
async def complete_daily_task(
    *,
    task_id: UUID,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Mark a daily task as completed"""
    try:
        # Get or create dev user
        user = await db_service.get_or_create_user(current_user.email if hasattr(current_user, 'email') else "dev@example.com")
        
        update_data = {
            "status": "completed",
            "completed_at": datetime.now().isoformat()
        }
        
        task = await db_service.update_daily_task(str(task_id), update_data, user["id"])
        return task
    except ValueError as e:
        raise HTTPException(status_code=404, detail="Task not found")
    except Exception as e:
        logger.error(f"Error completing daily task: {e}")
        raise HTTPException(status_code=500, detail="Failed to complete daily task")


@router.post("/{task_id}/reopen", response_model=DailyTask)
async def reopen_daily_task(
    *,
    task_id: UUID,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Reopen a completed daily task"""
    try:
        # Get or create dev user
        user = await db_service.get_or_create_user(current_user.email if hasattr(current_user, 'email') else "dev@example.com")
        
        update_data = {
            "status": "pending",
            "completed_at": None
        }
        
        task = await db_service.update_daily_task(str(task_id), update_data, user["id"])
        return task
    except ValueError as e:
        raise HTTPException(status_code=404, detail="Task not found")
    except Exception as e:
        logger.error(f"Error reopening daily task: {e}")
        raise HTTPException(status_code=500, detail="Failed to reopen daily task")


@router.post("/{task_id}/move-to-main", response_model=DailyTask)
async def move_to_main(
    *,
    task_id: UUID,
    duration: str = None,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Move a daily task from controller to main lane"""
    try:
        # Get or create dev user
        user = await db_service.get_or_create_user(current_user.email if hasattr(current_user, 'email') else "dev@example.com")
        
        update_data = {
            "lane": "main",
            "duration": duration
        }
        
        task = await db_service.update_daily_task(str(task_id), update_data, user["id"])
        return task
    except ValueError as e:
        raise HTTPException(status_code=404, detail="Task not found")
    except Exception as e:
        logger.error(f"Error moving task to main: {e}")
        raise HTTPException(status_code=500, detail="Failed to move task")


@router.post("/{task_id}/move-to-controller", response_model=DailyTask)
async def move_to_controller(
    *,
    task_id: UUID,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Move a daily task from main to controller lane"""
    try:
        # Get or create dev user
        user = await db_service.get_or_create_user(current_user.email if hasattr(current_user, 'email') else "dev@example.com")
        
        update_data = {
            "lane": "controller",
            "duration": None
        }
        
        task = await db_service.update_daily_task(str(task_id), update_data, user["id"])
        return task
    except ValueError as e:
        raise HTTPException(status_code=404, detail="Task not found")
    except Exception as e:
        logger.error(f"Error moving task to controller: {e}")
        raise HTTPException(status_code=500, detail="Failed to move task")