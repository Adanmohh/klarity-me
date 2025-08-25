from typing import Optional
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from app.models.daily_task import TaskLane, TaskDuration, TaskStatus


class DailyTaskBase(BaseModel):
    title: str
    lane: TaskLane = TaskLane.CONTROLLER
    duration: Optional[TaskDuration] = None
    position: int = 0


class DailyTaskCreate(DailyTaskBase):
    card_id: UUID


class DailyTaskUpdate(BaseModel):
    title: Optional[str] = None
    lane: Optional[TaskLane] = None
    duration: Optional[TaskDuration] = None
    status: Optional[TaskStatus] = None
    position: Optional[int] = None


class DailyTaskInDBBase(DailyTaskBase):
    id: UUID
    card_id: UUID
    status: TaskStatus
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class DailyTask(DailyTaskInDBBase):
    pass