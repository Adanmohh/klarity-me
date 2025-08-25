import uuid
from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, Enum, Date, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from app.db.base import Base


class TaskLane(str, enum.Enum):
    CONTROLLER = "controller"
    MAIN = "main"


class TaskStatus(str, enum.Enum):
    PENDING = "pending"
    ACTIVE = "active"
    COMPLETED = "completed"


class FocusTask(Base):
    __tablename__ = "focus_tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    card_id = Column(UUID(as_uuid=True), ForeignKey("cards.id"), nullable=False)
    lane = Column(Enum(TaskLane), default=TaskLane.CONTROLLER)
    status = Column(Enum(TaskStatus), default=TaskStatus.PENDING)
    date = Column(Date, nullable=True)
    tags = Column(ARRAY(String), default=[])
    position = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    card = relationship("Card", back_populates="focus_tasks")