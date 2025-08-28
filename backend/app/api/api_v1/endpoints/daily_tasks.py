from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.api import deps
from app.crud.daily_task import daily_task_crud
from app.crud.card import card_crud
from app.db.session import get_db
from app.models.user import User
from app.schemas.daily_task import DailyTask, DailyTaskCreate, DailyTaskUpdate
from app.core.config import settings

# Import mock data functions for dev mode
if settings.DEV_MODE:
    from app.api.mock_data import (
        get_mock_daily_tasks, create_mock_daily_task, get_mock_card
    )

router = APIRouter()


@router.get("/", response_model=List[DailyTask])
async def read_all_daily_tasks(
    *,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    if settings.DEV_MODE:
        from app.api.mock_data import mock_daily_tasks
        from app.schemas.daily_task import DailyTask as DailyTaskSchema
        return [DailyTaskSchema(**task) for task in mock_daily_tasks]
    
    # In production, would query all tasks for current user
    return []


@router.get("/card/{card_id}", response_model=List[DailyTask])
async def read_daily_tasks_by_card(
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
        return get_mock_daily_tasks(card_id)
    
    card = await card_crud.get(db, id=card_id)
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    if card.user_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    tasks = await daily_task_crud.get_by_card(db, card_id=card_id)
    return tasks


@router.post("/", response_model=DailyTask)
async def create_daily_task(
    *,
    db: AsyncSession = Depends(get_db),
    task_in: DailyTaskCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    if settings.DEV_MODE:
        # Check card ownership in dev mode
        card = get_mock_card(task_in.card_id, current_user.id)
        if not card:
            raise HTTPException(status_code=404, detail="Card not found")
        return create_mock_daily_task(task_in.dict())
    
    card = await card_crud.get(db, id=task_in.card_id)
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    if card.user_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    task = await daily_task_crud.create(db, obj_in=task_in)
    return task


@router.put("/{task_id}", response_model=DailyTask)
async def update_daily_task(
    *,
    db: AsyncSession = Depends(get_db),
    task_id: UUID,
    task_in: DailyTaskUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    if settings.DEV_MODE:
        from app.api.mock_data import update_mock_daily_task
        task = update_mock_daily_task(task_id, task_in.dict(exclude_unset=True))
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        return task
    
    task = await daily_task_crud.get(db, id=task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    card = await card_crud.get(db, id=task.card_id)
    if card.user_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    task = await daily_task_crud.update(db, db_obj=task, obj_in=task_in)
    return task


@router.delete("/{task_id}", response_model=DailyTask)
async def delete_daily_task(
    *,
    db: AsyncSession = Depends(get_db),
    task_id: UUID,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    if settings.DEV_MODE:
        from app.api.mock_data import delete_mock_daily_task
        task = delete_mock_daily_task(task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        return task
    
    task = await daily_task_crud.get(db, id=task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    card = await card_crud.get(db, id=task.card_id)
    if card.user_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    task = await daily_task_crud.remove(db, id=task_id)
    return task