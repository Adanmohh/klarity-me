from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum
import uuid


class IdentityStatementBase(BaseModel):
    """Base model for identity statements"""
    text: str = Field(..., min_length=5, max_length=200, description="Identity statement text")
    background_color: Optional[str] = Field(None, description="Hex color for background")
    background_image: Optional[str] = Field(None, description="URL or path to background image")
    order: int = Field(0, ge=0, description="Display order")
    active: bool = Field(True, description="Whether statement is active")


class IdentityStatementCreate(IdentityStatementBase):
    """Model for creating a new identity statement"""
    pass


class IdentityStatementUpdate(BaseModel):
    """Model for updating an identity statement"""
    text: Optional[str] = Field(None, min_length=5, max_length=200)
    background_color: Optional[str] = None
    background_image: Optional[str] = None
    order: Optional[int] = Field(None, ge=0)
    active: Optional[bool] = None


class IdentityStatement(IdentityStatementBase):
    """Complete identity statement model"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    strength: int = Field(0, ge=0, le=100, description="Strength based on supporting habits")
    related_habit_ids: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class ReminderSettings(BaseModel):
    """Settings for identity reminders"""
    morning_ritual: bool = Field(True, description="Enable morning ritual")
    morning_time: str = Field("07:00", description="Time for morning ritual")
    day_rotation: bool = Field(True, description="Rotate statements during day")
    rotation_interval: int = Field(3, ge=1, le=12, description="Hours between rotations")
    evening_review: bool = Field(True, description="Enable evening review")
    evening_time: str = Field("22:00", description="Time for evening review")


class IdentitySettingsBase(BaseModel):
    """Base model for identity settings"""
    reminder_settings: ReminderSettings = Field(default_factory=ReminderSettings)


class IdentitySettingsCreate(IdentitySettingsBase):
    """Model for creating identity settings"""
    statements: List[IdentityStatementCreate] = Field(
        default_factory=list,
        max_items=5,
        description="Identity statements (max 5)"
    )


class IdentitySettingsUpdate(BaseModel):
    """Model for updating identity settings"""
    reminder_settings: Optional[ReminderSettings] = None


class IdentitySettings(IdentitySettingsBase):
    """Complete identity settings model"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    statements: List[IdentityStatement] = Field(default_factory=list, max_items=5)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }