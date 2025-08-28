from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, Query
from app.models.habit import (
    Habit,
    HabitCreate,
    HabitUpdate,
    HabitGraduate,
    HabitLane,
    HabitFrequency,
    DailyCheckIn,
    DailyCheckInCreate,
    HabitStats,
    FrequencyDetails
)
from app.core.config import settings
from app.services.memory_db import memory_db
import uuid
from datetime import datetime, date, timedelta

router = APIRouter()


def get_current_user_id():
    """Mock function to get current user ID"""
    return "user_123"


@router.get("/", response_model=List[Habit])
async def get_habits(
    lane: Optional[HabitLane] = None,
    user_id: str = Depends(get_current_user_id)
):
    """Get all habits for current user, optionally filtered by lane"""
    habits = []
    habits_key = f"habits_{user_id}"
    
    if habits_key not in memory_db:
        memory_db[habits_key] = []
    
    all_habits = memory_db[habits_key]
    
    if lane:
        habits = [h for h in all_habits if h.get("lane") == lane]
    else:
        habits = all_habits
    
    return habits


@router.post("/", response_model=Habit)
async def create_habit(
    habit_in: HabitCreate,
    user_id: str = Depends(get_current_user_id)
):
    """Create a new habit in the Becoming lane"""
    habits_key = f"habits_{user_id}"
    
    if habits_key not in memory_db:
        memory_db[habits_key] = []
    
    # Create habit
    habit = Habit(
        **habit_in.dict(),
        id=str(uuid.uuid4()),
        user_id=user_id,
        lane=HabitLane.BECOMING,
        required_days=40,  # Will be calculated based on frequency
        current_day=0,
        missed_days=0,
        grace_days_used=0,
        longest_streak=0,
        current_streak=0,
        total_completions=0,
        start_date=datetime.now(),
        created_at=datetime.now(),
        updated_at=datetime.now()
    )
    
    # Calculate required days based on frequency
    habit.required_days = habit.calculate_required_days()
    
    memory_db[habits_key].append(habit.dict())
    return habit


@router.get("/{habit_id}", response_model=Habit)
async def get_habit(
    habit_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Get a specific habit"""
    habits_key = f"habits_{user_id}"
    
    if habits_key not in memory_db:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    for habit in memory_db[habits_key]:
        if habit["id"] == habit_id:
            return habit
    
    raise HTTPException(status_code=404, detail="Habit not found")


@router.put("/{habit_id}", response_model=Habit)
async def update_habit(
    habit_id: str,
    habit_update: HabitUpdate,
    user_id: str = Depends(get_current_user_id)
):
    """Update a habit"""
    habits_key = f"habits_{user_id}"
    
    if habits_key not in memory_db:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    habits = memory_db[habits_key]
    
    for i, habit in enumerate(habits):
        if habit["id"] == habit_id:
            # Update fields
            update_data = habit_update.dict(exclude_unset=True)
            for field, value in update_data.items():
                habit[field] = value
            habit["updated_at"] = datetime.now().isoformat()
            
            habits[i] = habit
            memory_db[habits_key] = habits
            return habit
    
    raise HTTPException(status_code=404, detail="Habit not found")


@router.delete("/{habit_id}")
async def delete_habit(
    habit_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Delete a habit"""
    habits_key = f"habits_{user_id}"
    
    if habits_key not in memory_db:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    memory_db[habits_key] = [
        h for h in memory_db[habits_key]
        if h["id"] != habit_id
    ]
    
    return {"detail": "Habit deleted successfully"}


@router.post("/{habit_id}/checkin", response_model=DailyCheckIn)
async def create_check_in(
    habit_id: str,
    check_in: DailyCheckInCreate,
    user_id: str = Depends(get_current_user_id)
):
    """Create a daily check-in for a habit"""
    habits_key = f"habits_{user_id}"
    checkins_key = f"checkins_{user_id}"
    
    if habits_key not in memory_db:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    # Find habit
    habit = None
    for i, h in enumerate(memory_db[habits_key]):
        if h["id"] == habit_id:
            habit = h
            habit_index = i
            break
    
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    # Initialize check-ins storage
    if checkins_key not in memory_db:
        memory_db[checkins_key] = []
    
    # Check if already checked in today
    today = date.today().isoformat()
    for ci in memory_db[checkins_key]:
        if ci["habit_id"] == habit_id and ci["check_in_date"] == today:
            raise HTTPException(status_code=400, detail="Already checked in today")
    
    # Create check-in
    check_in_data = check_in.dict()
    check_in_data.pop('habit_id', None)  # Remove if exists to avoid duplicate
    checkin = DailyCheckIn(
        **check_in_data,
        id=str(uuid.uuid4()),
        habit_id=habit_id,
        check_in_date=date.today(),
        created_at=datetime.now()
    )
    
    # Update habit statistics
    if check_in.completed:
        habit["total_completions"] += 1
        habit["current_streak"] += 1
        habit["current_day"] += 1
        if habit["current_streak"] > habit["longest_streak"]:
            habit["longest_streak"] = habit["current_streak"]
    else:
        # Handle missed day
        habit["missed_days"] += 1
        # Check consecutive misses
        yesterday = (date.today() - timedelta(days=1)).isoformat()
        yesterday_missed = not any(
            ci["habit_id"] == habit_id and ci["check_in_date"] == yesterday and ci["completed"]
            for ci in memory_db[checkins_key]
        )
        
        if yesterday_missed:
            # Two misses in a row - reset streak but keep progress
            habit["current_streak"] = 0
        # else: one miss is okay, keep streak
    
    habit["last_check_in"] = datetime.now().isoformat()
    habit["updated_at"] = datetime.now().isoformat()
    
    # Save updates
    memory_db[habits_key][habit_index] = habit
    memory_db[checkins_key].append(checkin.dict())
    
    return checkin


@router.post("/{habit_id}/graduate", response_model=Habit)
async def graduate_habit(
    habit_id: str,
    graduation: HabitGraduate,
    user_id: str = Depends(get_current_user_id)
):
    """Graduate a habit from Becoming to I AM"""
    habits_key = f"habits_{user_id}"
    
    if habits_key not in memory_db:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    habits = memory_db[habits_key]
    
    for i, habit in enumerate(habits):
        if habit["id"] == habit_id:
            # Check if can graduate
            if habit["lane"] == HabitLane.I_AM:
                raise HTTPException(status_code=400, detail="Habit already graduated")
            
            # Check minimum requirements
            if graduation.manual and habit["current_day"] < 21:
                raise HTTPException(
                    status_code=400, 
                    detail="Manual graduation requires minimum 21 days"
                )
            
            if not graduation.manual:
                # Auto graduation check
                if habit["current_day"] < habit["required_days"]:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Auto graduation requires {habit['required_days']} days"
                    )
                consistency = habit["total_completions"] / max(habit["current_day"], 1)
                if consistency < 0.8:
                    raise HTTPException(
                        status_code=400,
                        detail="Auto graduation requires 80% consistency"
                    )
            
            # Graduate the habit
            habit["lane"] = HabitLane.I_AM
            habit["graduation_date"] = datetime.now().isoformat()
            habit["updated_at"] = datetime.now().isoformat()
            
            habits[i] = habit
            memory_db[habits_key] = habits
            
            # Trigger identity suggestion (would be handled by frontend)
            return habit
    
    raise HTTPException(status_code=404, detail="Habit not found")


@router.get("/{habit_id}/stats", response_model=HabitStats)
async def get_habit_stats(
    habit_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Get detailed statistics for a habit"""
    habits_key = f"habits_{user_id}"
    checkins_key = f"checkins_{user_id}"
    
    if habits_key not in memory_db:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    # Find habit
    habit = None
    for h in memory_db[habits_key]:
        if h["id"] == habit_id:
            habit = h
            break
    
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    # Get check-ins
    if checkins_key not in memory_db:
        memory_db[checkins_key] = []
    
    checkins = [ci for ci in memory_db[checkins_key] if ci["habit_id"] == habit_id]
    
    # Calculate stats
    today = date.today()
    last_7_days = []
    last_30_days = []
    
    for i in range(7):
        check_date = (today - timedelta(days=i)).isoformat()
        completed = any(ci["check_in_date"] == check_date and ci["completed"] for ci in checkins)
        last_7_days.append(completed)
    
    for i in range(30):
        check_date = (today - timedelta(days=i)).isoformat()
        completed = any(ci["check_in_date"] == check_date and ci["completed"] for ci in checkins)
        last_30_days.append(completed)
    
    # Calculate weekly average
    weeks = max(habit["current_day"] / 7, 1)
    avg_per_week = habit["total_completions"] / weeks
    
    stats = HabitStats(
        habit_id=habit_id,
        total_days=habit["current_day"],
        completed_days=habit["total_completions"],
        consistency_rate=habit["total_completions"] / max(habit["current_day"], 1),
        current_streak=habit["current_streak"],
        longest_streak=habit["longest_streak"],
        average_completions_per_week=avg_per_week,
        last_7_days=last_7_days,
        last_30_days=last_30_days
    )
    
    return stats