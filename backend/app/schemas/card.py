from typing import Optional, List
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from app.models.card import CardStatus


class CardBase(BaseModel):
    title: str
    description: Optional[str] = None
    position: int = 0


class CardCreate(CardBase):
    pass


class CardUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    position: Optional[int] = None
    status: Optional[CardStatus] = None
    pause_until: Optional[datetime] = None
    last_worked_on: Optional[datetime] = None
    sessions_count: Optional[int] = None
    where_left_off: Optional[str] = None
    momentum_score: Optional[int] = None


class CardInDBBase(CardBase):
    id: UUID
    status: CardStatus
    pause_until: Optional[datetime]
    last_worked_on: Optional[datetime]
    sessions_count: int
    where_left_off: Optional[str]
    momentum_score: int
    user_id: UUID
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class Card(CardInDBBase):
    pass


class CardWithTasks(CardInDBBase):
    focus_tasks: List["FocusTask"] = []
    daily_tasks: List["DailyTask"] = []


# Import here to avoid circular imports
from app.schemas.focus_task import FocusTask
from app.schemas.daily_task import DailyTask

CardWithTasks.model_rebuild()