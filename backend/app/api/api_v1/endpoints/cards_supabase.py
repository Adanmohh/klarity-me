"""
Cards endpoint using dev store for dev mode
"""
from typing import List, Any, Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from datetime import datetime

from app.core.config import settings
from app.db.dev_store import dev_store
from app.api.deps_supabase import get_current_user_supabase, SupabaseUser

router = APIRouter()

class Card(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    emoji: Optional[str] = "📝"
    color: Optional[str] = "#3b82f6"
    position: int = 0
    status: str = "queued"
    sessions_count: int = 0
    momentum_score: int = 0
    created_at: datetime
    updated_at: datetime

class CardCreate(BaseModel):
    title: str
    description: Optional[str] = None
    emoji: Optional[str] = "📝"
    color: Optional[str] = "#3b82f6"
    position: Optional[int] = 0
    status: Optional[str] = "queued"

class CardUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    emoji: Optional[str] = None
    color: Optional[str] = None
    position: Optional[int] = None
    status: Optional[str] = None

@router.get("/", response_model=List[Card])
async def get_cards(
    current_user: SupabaseUser = Depends(get_current_user_supabase)
) -> Any:
    """Get all cards for the current user"""
    if settings.DEV_MODE:
        # Use dev store in dev mode
        cards = dev_store.get_cards(current_user.id)
        return [
            Card(
                id=card.id,
                title=card.title,
                description=card.description,
                emoji=card.emoji,
                color=card.color,
                position=card.position,
                status="queued",
                sessions_count=0,
                momentum_score=0,
                created_at=card.created_at,
                updated_at=card.updated_at
            )
            for card in cards
        ]
    
    # Production mode - Supabase not configured
    raise HTTPException(status_code=503, detail="Supabase connection not configured")

@router.get("/{card_id}", response_model=Card)
async def get_card(
    card_id: str,
    current_user: SupabaseUser = Depends(get_current_user_supabase)
) -> Any:
    """Get a specific card"""
    if settings.DEV_MODE:
        cards = dev_store.get_cards(current_user.id)
        for card in cards:
            if card.id == card_id:
                return Card(
                    id=card.id,
                    title=card.title,
                    description=card.description,
                    emoji=card.emoji,
                    color=card.color,
                    position=card.position,
                    status="queued",
                    sessions_count=0,
                    momentum_score=0,
                    created_at=card.created_at,
                    updated_at=card.updated_at
                )
        raise HTTPException(status_code=404, detail="Card not found")
    
    # Production mode - Supabase not configured
    raise HTTPException(status_code=503, detail="Supabase connection not configured")

@router.post("/", response_model=Card)
async def create_card(
    card_in: CardCreate,
    current_user: SupabaseUser = Depends(get_current_user_supabase)
) -> Any:
    """Create a new card"""
    if settings.DEV_MODE:
        # Use dev store in dev mode
        new_card = dev_store.create_card(
            user_id=current_user.id,
            title=card_in.title,
            description=card_in.description or "",
            emoji=card_in.emoji or "📝",
            color=card_in.color or "#3b82f6",
            position=card_in.position or len(dev_store.get_cards(current_user.id))
        )
        return Card(
            id=new_card.id,
            title=new_card.title,
            description=new_card.description,
            emoji=new_card.emoji,
            color=new_card.color,
            position=new_card.position,
            status="queued",
            sessions_count=0,
            momentum_score=0,
            created_at=new_card.created_at,
            updated_at=new_card.updated_at
        )
    
    # Production mode - Supabase not configured
    raise HTTPException(status_code=503, detail="Supabase connection not configured")

@router.put("/{card_id}", response_model=Card)
async def update_card(
    card_id: str,
    card_in: CardUpdate,
    current_user: SupabaseUser = Depends(get_current_user_supabase)
) -> Any:
    """Update a card"""
    if settings.DEV_MODE:
        # Check ownership
        cards = dev_store.get_cards(current_user.id)
        card_exists = any(card.id == card_id for card in cards)
        if not card_exists:
            raise HTTPException(status_code=404, detail="Card not found")
        
        # Update card
        updates = {k: v for k, v in card_in.dict().items() if v is not None}
        updated_card = dev_store.update_card(card_id, **updates)
        
        if not updated_card:
            raise HTTPException(status_code=404, detail="Card not found")
        
        return Card(
            id=updated_card.id,
            title=updated_card.title,
            description=updated_card.description,
            emoji=updated_card.emoji,
            color=updated_card.color,
            position=updated_card.position,
            status="queued",
            sessions_count=0,
            momentum_score=0,
            created_at=updated_card.created_at,
            updated_at=updated_card.updated_at
        )
    
    # Production mode - Supabase not configured
    raise HTTPException(status_code=503, detail="Supabase connection not configured")

@router.delete("/{card_id}")
async def delete_card(
    card_id: str,
    current_user: SupabaseUser = Depends(get_current_user_supabase)
) -> Any:
    """Delete a card"""
    if settings.DEV_MODE:
        # Check ownership
        cards = dev_store.get_cards(current_user.id)
        card_exists = any(card.id == card_id for card in cards)
        if not card_exists:
            raise HTTPException(status_code=404, detail="Card not found")
        
        if not dev_store.delete_card(card_id):
            raise HTTPException(status_code=404, detail="Card not found")
        
        return {"message": "Card deleted successfully"}
    
    # Production mode - Supabase not configured
    raise HTTPException(status_code=503, detail="Supabase connection not configured")