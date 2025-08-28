from pydantic import BaseModel, Field, validator
from typing import List, Optional, Literal
from datetime import datetime, date
from enum import Enum
import uuid


class HabitFrequency(str, Enum):
    """Frequency options for habits"""
    DAILY = "daily"
    WEEKLY = "weekly"
    CUSTOM = "custom"


class HabitLane(str, Enum):
    """Lane status for habits"""
    BECOMING = "becoming"
    I_AM = "i_am"


class FrequencyDetails(BaseModel):
    """Details about habit frequency"""
    type: HabitFrequency
    target_days: Optional[int] = Field(None, ge=1, le=7, description="Days per week")
    specific_days: Optional[List[int]] = Field(None, description="0-6 for Sun-Sat")
    
    @validator('target_days')
    def validate_target_days(cls, v, values):
        if values.get('type') == HabitFrequency.CUSTOM and v is None:
            raise ValueError("target_days required for custom frequency")
        return v


class HabitBase(BaseModel):
    """Base model for habits"""
    title: str = Field(..., min_length=1, max_length=100, description="Habit title")
    description: Optional[str] = Field(None, max_length=500, description="Habit description")
    frequency: FrequencyDetails
    tiny_habit_option: Optional[str] = Field(None, max_length=100, description="Minimum viable version")


class HabitCreate(HabitBase):
    """Model for creating a new habit"""
    pass


class HabitUpdate(BaseModel):
    """Model for updating a habit"""
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    tiny_habit_option: Optional[str] = Field(None, max_length=100)


class HabitGraduate(BaseModel):
    """Model for graduating a habit"""
    manual: bool = Field(True, description="Whether this is manual graduation")
    note: Optional[str] = Field(None, description="Graduation note")


class Habit(HabitBase):
    """Complete habit model"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    lane: HabitLane = Field(HabitLane.BECOMING, description="Current lane")
    required_days: int = Field(40, description="Days required for graduation")
    current_day: int = Field(0, ge=0, description="Current progress day")
    missed_days: int = Field(0, ge=0, description="Total missed days")
    grace_days_used: int = Field(0, ge=0, description="Grace days used this month")
    longest_streak: int = Field(0, ge=0, description="Longest streak achieved")
    current_streak: int = Field(0, ge=0, description="Current active streak")
    total_completions: int = Field(0, ge=0, description="Total times completed")
    start_date: datetime = Field(default_factory=datetime.now)
    graduation_date: Optional[datetime] = None
    last_check_in: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    def calculate_required_days(self) -> int:
        """Calculate required days based on frequency"""
        if self.frequency.type == HabitFrequency.DAILY:
            return 40
        elif self.frequency.type == HabitFrequency.WEEKLY:
            return 90
        elif self.frequency.type == HabitFrequency.CUSTOM:
            if self.frequency.target_days >= 5:
                return 50
            elif self.frequency.target_days >= 3:
                return 60
            else:
                return 90
        return 40

    def can_graduate(self) -> bool:
        """Check if habit can graduate"""
        # Manual graduation after 21 days minimum
        if self.current_day >= 21:
            return True
        # Auto graduation after required days with good consistency
        if self.current_day >= self.required_days:
            consistency = self.total_completions / max(self.current_day, 1)
            return consistency >= 0.8
        return False

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class DailyCheckInBase(BaseModel):
    """Base model for daily check-ins"""
    completed: bool = Field(..., description="Whether habit was completed")
    tiny_habit_used: bool = Field(False, description="Whether tiny version was used")
    note: Optional[str] = Field(None, max_length=500, description="Check-in note")


class DailyCheckInCreate(DailyCheckInBase):
    """Model for creating a check-in"""
    habit_id: str


class DailyCheckIn(DailyCheckInBase):
    """Complete check-in model"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    habit_id: str
    check_in_date: date = Field(default_factory=date.today)
    created_at: datetime = Field(default_factory=datetime.now)

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            date: lambda v: v.isoformat()
        }


class HabitStats(BaseModel):
    """Statistics for a habit"""
    habit_id: str
    total_days: int
    completed_days: int
    consistency_rate: float
    current_streak: int
    longest_streak: int
    average_completions_per_week: float
    last_7_days: List[bool]
    last_30_days: List[bool]