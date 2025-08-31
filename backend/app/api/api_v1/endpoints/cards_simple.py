"""
Simple cards endpoint using dev store
"""
from typing import List, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime

from app.db.dev_store import dev_store

router = APIRouter()

class Card(BaseModel):
    id: str
    title: str
    description: str = ""
    emoji: str = "📝"
    color: str = "#3b82f6"
    position: int = 0
    created_at: datetime
    updated_at: datetime

class CardCreate(BaseModel):
    title: str
    description: str = ""
    emoji: str = "📝"
    color: str = "#3b82f6"
    position: int = 0

class CardUpdate(BaseModel):
    title: str = None
    description: str = None
    emoji: str = None
    color: str = None
    position: int = None

@router.get("/", response_model=List[Card])
async def get_cards() -> Any:
    """Get all cards for test user"""
    test_user = dev_store.get_user_by_email("test@example.com")
    if not test_user:
        return []
    
    cards = dev_store.get_cards(test_user.id)
    return [
        Card(
            id=card.id,
            title=card.title,
            description=card.description,
            emoji=card.emoji,
            color=card.color,
            position=card.position,
            created_at=card.created_at,
            updated_at=card.updated_at
        )
        for card in cards
    ]

@router.get("/{card_id}", response_model=Card)
async def get_card(card_id: str) -> Any:
    """Get a specific card"""
    card = dev_store.cards.get(card_id)
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    return Card(
        id=card.id,
        title=card.title,
        description=card.description,
        emoji=card.emoji,
        color=card.color,
        position=card.position,
        created_at=card.created_at,
        updated_at=card.updated_at
    )

@router.post("/", response_model=Card)
async def create_card(card_in: CardCreate) -> Any:
    """Create a new card"""
    test_user = dev_store.get_user_by_email("test@example.com")
    if not test_user:
        raise HTTPException(status_code=401, detail="User not found")
    
    card = dev_store.create_card(
        user_id=test_user.id,
        title=card_in.title,
        description=card_in.description,
        emoji=card_in.emoji,
        color=card_in.color,
        position=card_in.position
    )
    
    return Card(
        id=card.id,
        title=card.title,
        description=card.description,
        emoji=card.emoji,
        color=card.color,
        position=card.position,
        created_at=card.created_at,
        updated_at=card.updated_at
    )

@router.put("/{card_id}", response_model=Card)
async def update_card(card_id: str, card_in: CardUpdate) -> Any:
    """Update a card"""
    updates = {k: v for k, v in card_in.dict().items() if v is not None}
    card = dev_store.update_card(card_id, **updates)
    
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    return Card(
        id=card.id,
        title=card.title,
        description=card.description,
        emoji=card.emoji,
        color=card.color,
        position=card.position,
        created_at=card.created_at,
        updated_at=card.updated_at
    )

@router.delete("/{card_id}")
async def delete_card(card_id: str) -> Any:
    """Delete a card"""
    if not dev_store.delete_card(card_id):
        raise HTTPException(status_code=404, detail="Card not found")
    
    return {"message": "Card deleted successfully"}