import uuid
from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from app.db.base import Base


class CardStatus(str, enum.Enum):
    ACTIVE = "active"
    QUEUED = "queued"
    ON_HOLD = "on-hold"
    PAUSED = "paused"
    COMPLETED = "completed"


class Card(Base):
    __tablename__ = "cards"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    position = Column(Integer, nullable=False, default=0)
    status = Column(Enum(CardStatus), default=CardStatus.QUEUED)
    pause_until = Column(DateTime(timezone=True), nullable=True)
    last_worked_on = Column(DateTime(timezone=True), nullable=True)
    sessions_count = Column(Integer, default=0)
    where_left_off = Column(Text, nullable=True)
    momentum_score = Column(Integer, default=0)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="cards")
    focus_tasks = relationship("FocusTask", back_populates="card", cascade="all, delete-orphan")