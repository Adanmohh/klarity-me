from typing import List
from fastapi import APIRouter, HTTPException, Depends
from app.models.identity import (
    IdentitySettings,
    IdentitySettingsCreate,
    IdentitySettingsUpdate,
    IdentityStatement,
    IdentityStatementCreate,
    IdentityStatementUpdate
)
from app.core.config import settings
from app.services.memory_db import memory_db
import uuid
from datetime import datetime

router = APIRouter()


def get_current_user_id():
    """Mock function to get current user ID"""
    return "user_123"


@router.get("/", response_model=IdentitySettings)
async def get_identity_settings(user_id: str = Depends(get_current_user_id)):
    """Get identity settings for current user"""
    # Check if settings exist
    settings_key = f"identity_{user_id}"
    if settings_key not in memory_db:
        # Create default settings
        memory_db[settings_key] = IdentitySettings(
            id=str(uuid.uuid4()),
            user_id=user_id,
            statements=[],
            reminder_settings={
                "morning_ritual": True,
                "morning_time": "07:00",
                "day_rotation": True,
                "rotation_interval": 3,
                "evening_review": True,
                "evening_time": "22:00"
            }
        ).dict()
    
    return memory_db[settings_key]


@router.post("/", response_model=IdentitySettings)
async def create_identity_settings(
    settings_in: IdentitySettingsCreate,
    user_id: str = Depends(get_current_user_id)
):
    """Create or update identity settings"""
    settings_key = f"identity_{user_id}"
    
    # Create statements with IDs
    statements = []
    for i, stmt_data in enumerate(settings_in.statements):
        stmt = IdentityStatement(
            **stmt_data.dict(),
            id=str(uuid.uuid4()),
            order=i,
            strength=0,
            related_habit_ids=[],
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        statements.append(stmt.dict())
    
    # Create settings
    settings = IdentitySettings(
        id=str(uuid.uuid4()),
        user_id=user_id,
        statements=statements,
        reminder_settings=settings_in.reminder_settings.dict(),
        created_at=datetime.now(),
        updated_at=datetime.now()
    )
    
    memory_db[settings_key] = settings.dict()
    return settings


@router.put("/", response_model=IdentitySettings)
async def update_identity_settings(
    settings_update: IdentitySettingsUpdate,
    user_id: str = Depends(get_current_user_id)
):
    """Update identity settings"""
    settings_key = f"identity_{user_id}"
    
    if settings_key not in memory_db:
        raise HTTPException(status_code=404, detail="Identity settings not found")
    
    current_settings = memory_db[settings_key]
    
    # Update reminder settings if provided
    if settings_update.reminder_settings:
        current_settings["reminder_settings"] = settings_update.reminder_settings.dict()
    
    current_settings["updated_at"] = datetime.now().isoformat()
    memory_db[settings_key] = current_settings
    
    return current_settings


@router.post("/statements", response_model=IdentityStatement)
async def add_identity_statement(
    statement: IdentityStatementCreate,
    user_id: str = Depends(get_current_user_id)
):
    """Add a new identity statement"""
    settings_key = f"identity_{user_id}"
    
    if settings_key not in memory_db:
        raise HTTPException(status_code=404, detail="Identity settings not found")
    
    settings = memory_db[settings_key]
    
    if len(settings["statements"]) >= 5:
        raise HTTPException(status_code=400, detail="Maximum 5 statements allowed")
    
    # Create new statement
    statement_data = statement.dict()
    statement_data.pop('order', None)  # Remove if exists to avoid duplicate
    new_statement = IdentityStatement(
        **statement_data,
        id=str(uuid.uuid4()),
        order=len(settings["statements"]),
        strength=0,
        related_habit_ids=[],
        created_at=datetime.now(),
        updated_at=datetime.now()
    )
    
    settings["statements"].append(new_statement.dict())
    settings["updated_at"] = datetime.now().isoformat()
    memory_db[settings_key] = settings
    
    return new_statement


@router.put("/statements/{statement_id}", response_model=IdentityStatement)
async def update_identity_statement(
    statement_id: str,
    statement_update: IdentityStatementUpdate,
    user_id: str = Depends(get_current_user_id)
):
    """Update an identity statement"""
    settings_key = f"identity_{user_id}"
    
    if settings_key not in memory_db:
        raise HTTPException(status_code=404, detail="Identity settings not found")
    
    settings = memory_db[settings_key]
    
    # Find and update statement
    for i, stmt in enumerate(settings["statements"]):
        if stmt["id"] == statement_id:
            # Update fields
            update_data = statement_update.dict(exclude_unset=True)
            for field, value in update_data.items():
                stmt[field] = value
            stmt["updated_at"] = datetime.now().isoformat()
            
            settings["statements"][i] = stmt
            settings["updated_at"] = datetime.now().isoformat()
            memory_db[settings_key] = settings
            return stmt
    
    raise HTTPException(status_code=404, detail="Statement not found")


@router.delete("/statements/{statement_id}")
async def delete_identity_statement(
    statement_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Delete an identity statement"""
    settings_key = f"identity_{user_id}"
    
    if settings_key not in memory_db:
        raise HTTPException(status_code=404, detail="Identity settings not found")
    
    settings = memory_db[settings_key]
    
    # Remove statement
    settings["statements"] = [
        stmt for stmt in settings["statements"] 
        if stmt["id"] != statement_id
    ]
    
    # Reorder remaining statements
    for i, stmt in enumerate(settings["statements"]):
        stmt["order"] = i
    
    settings["updated_at"] = datetime.now().isoformat()
    memory_db[settings_key] = settings
    
    return {"detail": "Statement deleted successfully"}


@router.post("/statements/{statement_id}/strengthen")
async def strengthen_identity_statement(
    statement_id: str,
    habit_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Link a habit to strengthen an identity statement"""
    settings_key = f"identity_{user_id}"
    
    if settings_key not in memory_db:
        raise HTTPException(status_code=404, detail="Identity settings not found")
    
    settings = memory_db[settings_key]
    
    for stmt in settings["statements"]:
        if stmt["id"] == statement_id:
            if habit_id not in stmt["related_habit_ids"]:
                stmt["related_habit_ids"].append(habit_id)
                # Recalculate strength (simple formula: 20 points per habit, max 100)
                stmt["strength"] = min(len(stmt["related_habit_ids"]) * 20, 100)
                stmt["updated_at"] = datetime.now().isoformat()
            
            settings["updated_at"] = datetime.now().isoformat()
            memory_db[settings_key] = settings
            return {"detail": "Statement strengthened", "strength": stmt["strength"]}
    
    raise HTTPException(status_code=404, detail="Statement not found")