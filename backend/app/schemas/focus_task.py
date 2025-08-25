from typing import Optional, List
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime, date
from app.models.focus_task import TaskLane, TaskStatus


class FocusTaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    lane: TaskLane = TaskLane.CONTROLLER
    date: Optional[date] = None
    tags: List[str] = []
    position: int = 0


class FocusTaskCreate(FocusTaskBase):
    card_id: UUID


class FocusTaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    lane: Optional[TaskLane] = None
    status: Optional[TaskStatus] = None
    date: Optional[date] = None
    tags: Optional[List[str]] = None
    position: Optional[int] = None


class FocusTaskInDBBase(FocusTaskBase):
    id: UUID
    card_id: UUID
    status: TaskStatus
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class FocusTask(FocusTaskInDBBase):
    pass