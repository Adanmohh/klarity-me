from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from uuid import UUID
import logging

from app.api import deps
from app.models.user import User
from app.schemas.card import Card, CardCreate, CardUpdate, CardWithTasks
from app.core.config import settings
# from app.services.database import db_service  # Supabase - disabled due to SSL issues
from app.services.memory_db import memory_db_service as db_service

logger = logging.getLogger(__name__)

# Import mock data functions for dev mode
if settings.DEV_MODE:
    from app.api.mock_data import (
        get_mock_cards, get_mock_card, get_mock_card_with_tasks,
        create_mock_card, update_mock_card, delete_mock_card
    )

router = APIRouter()


@router.get("/", response_model=List[Card])
async def read_cards(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    # Always use memory database for now (Supabase SSL issues)
    # if settings.DEV_MODE:
    #     # Return mock data in dev mode
    #     return get_mock_cards(current_user.id)
    
    try:
        # Get or create dev user
        user = await db_service.get_or_create_user(current_user.email if hasattr(current_user, 'email') else "dev@example.com")
        cards = await db_service.get_cards(user["id"])
        return cards
    except Exception as e:
        logger.error(f"Error getting cards: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch cards")


@router.post("/", response_model=Card)
async def create_card(
    *,
    card_in: CardCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    # if settings.DEV_MODE:
    #     # Create mock card in dev mode
    #     return create_mock_card(card_in.dict(), current_user.id)
    
    try:
        # Get or create dev user
        user = await db_service.get_or_create_user(current_user.email if hasattr(current_user, 'email') else "dev@example.com")
        card = await db_service.create_card(card_in.dict(exclude_unset=True), user["id"])
        return card
    except Exception as e:
        logger.error(f"Error creating card: {e}")
        raise HTTPException(status_code=500, detail="Failed to create card")


@router.get("/{card_id}", response_model=CardWithTasks)
async def read_card(
    *,
    card_id: UUID,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    # if settings.DEV_MODE:
    #     # Get mock card with tasks in dev mode
    #     card = get_mock_card_with_tasks(card_id, current_user.id)
    #     if not card:
    #         raise HTTPException(status_code=404, detail="Card not found")
    #     return card
    
    try:
        # Get or create dev user
        user = await db_service.get_or_create_user(current_user.email if hasattr(current_user, 'email') else "dev@example.com")
        card = await db_service.get_card(str(card_id), user["id"])
        if not card:
            raise HTTPException(status_code=404, detail="Card not found")
        
        # Get tasks for the card
        tasks = await db_service.get_focus_tasks(card_id=str(card_id))
        card["focus_tasks"] = tasks
        
        return card
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting card: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch card")


@router.put("/{card_id}", response_model=Card)
async def update_card(
    *,
    card_id: UUID,
    card_in: CardUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    # if settings.DEV_MODE:
    #     # Update mock card in dev mode
    #     card = update_mock_card(card_id, card_in.dict(exclude_unset=True), current_user.id)
    #     if not card:
    #         raise HTTPException(status_code=404, detail="Card not found")
    #     return card
    
    try:
        # Get or create dev user
        user = await db_service.get_or_create_user(current_user.email if hasattr(current_user, 'email') else "dev@example.com")
        card = await db_service.update_card(str(card_id), card_in.dict(exclude_unset=True), user["id"])
        return card
    except ValueError as e:
        raise HTTPException(status_code=404, detail="Card not found")
    except Exception as e:
        logger.error(f"Error updating card: {e}")
        raise HTTPException(status_code=500, detail="Failed to update card")


@router.delete("/{card_id}", response_model=Card)
async def delete_card(
    *,
    card_id: UUID,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    # if settings.DEV_MODE:
    #     # Delete mock card in dev mode
    #     card = delete_mock_card(card_id, current_user.id)
    #     if not card:
    #         raise HTTPException(status_code=404, detail="Card not found")
    #     return card
    
    try:
        # Get or create dev user
        user = await db_service.get_or_create_user(current_user.email if hasattr(current_user, 'email') else "dev@example.com")
        
        # Get card before deleting to return it
        card = await db_service.get_card(str(card_id), user["id"])
        if not card:
            raise HTTPException(status_code=404, detail="Card not found")
        
        success = await db_service.delete_card(str(card_id), user["id"])
        if not success:
            raise HTTPException(status_code=500, detail="Failed to delete card")
        
        return card
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting card: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete card")