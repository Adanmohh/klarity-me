from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.api import deps
from app.crud.card import card_crud
from app.db.session import get_db
from app.models.user import User
from app.schemas.card import Card, CardCreate, CardUpdate, CardWithTasks
from app.core.config import settings

# Import mock data functions for dev mode
if settings.DEV_MODE:
    from app.api.mock_data import (
        get_mock_cards, get_mock_card, get_mock_card_with_tasks,
        create_mock_card, update_mock_card, delete_mock_card
    )

router = APIRouter()


@router.get("/", response_model=List[Card])
async def read_cards(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    if settings.DEV_MODE:
        # Return mock data in dev mode
        return get_mock_cards(current_user.id)
    
    cards = await card_crud.get_by_user(
        db, user_id=current_user.id, skip=skip, limit=limit
    )
    return cards


@router.post("/", response_model=Card)
async def create_card(
    *,
    db: AsyncSession = Depends(get_db),
    card_in: CardCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    if settings.DEV_MODE:
        # Create mock card in dev mode
        return create_mock_card(card_in.dict(), current_user.id)
    
    card = await card_crud.create_with_user(
        db, obj_in=card_in, user_id=current_user.id
    )
    return card


@router.get("/{card_id}", response_model=CardWithTasks)
async def read_card(
    *,
    db: AsyncSession = Depends(get_db),
    card_id: UUID,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    if settings.DEV_MODE:
        # Get mock card with tasks in dev mode
        card = get_mock_card_with_tasks(card_id, current_user.id)
        if not card:
            raise HTTPException(status_code=404, detail="Card not found")
        return card
    
    card = await card_crud.get_with_tasks(db, id=card_id)
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    if card.user_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    return card


@router.put("/{card_id}", response_model=Card)
async def update_card(
    *,
    db: AsyncSession = Depends(get_db),
    card_id: UUID,
    card_in: CardUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    if settings.DEV_MODE:
        # Update mock card in dev mode
        card = update_mock_card(card_id, card_in.dict(exclude_unset=True), current_user.id)
        if not card:
            raise HTTPException(status_code=404, detail="Card not found")
        return card
    
    card = await card_crud.get(db, id=card_id)
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    if card.user_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    card = await card_crud.update(db, db_obj=card, obj_in=card_in)
    return card


@router.delete("/{card_id}", response_model=Card)
async def delete_card(
    *,
    db: AsyncSession = Depends(get_db),
    card_id: UUID,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    if settings.DEV_MODE:
        # Delete mock card in dev mode
        card = delete_mock_card(card_id, current_user.id)
        if not card:
            raise HTTPException(status_code=404, detail="Card not found")
        return card
    
    card = await card_crud.get(db, id=card_id)
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    if card.user_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    card = await card_crud.remove(db, id=card_id)
    return card