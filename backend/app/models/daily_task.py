import uuid
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from app.db.base import Base


class TaskLane(str, enum.Enum):
    CONTROLLER = "controller"
    MAIN = "main"


class TaskDuration(str, enum.Enum):
    TEN_MIN = "10min"
    FIFTEEN_MIN = "15min"
    THIRTY_MIN = "30min"


class TaskStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"


class DailyTask(Base):
    __tablename__ = "daily_tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    card_id = Column(UUID(as_uuid=True), ForeignKey("cards.id"), nullable=False)
    lane = Column(Enum(TaskLane), default=TaskLane.CONTROLLER)
    duration = Column(Enum(TaskDuration), nullable=True)
    status = Column(Enum(TaskStatus), default=TaskStatus.PENDING)
    position = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    card = relationship("Card", back_populates="daily_tasks")