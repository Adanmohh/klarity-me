"""
Cards endpoint using Supabase
"""
from typing import List, Any, Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from datetime import datetime
import asyncio

from app.services.supabase_client import supabase_service
from app.api import deps_simple
from app.api.deps_simple import SimpleUser

router = APIRouter()

class Card(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    position: int = 0
    status: str = "queued"
    sessions_count: int = 0
    momentum_score: int = 0
    created_at: datetime
    updated_at: datetime

class CardCreate(BaseModel):
    title: str
    description: Optional[str] = None
    position: int = 0
    status: str = "queued"

class CardUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    position: Optional[int] = None
    status: Optional[str] = None

@router.get("/", response_model=List[Card])
async def get_cards(
    current_user: SimpleUser = Depends(deps_simple.get_current_active_user_simple)
) -> Any:
    """Get all cards for the current user"""
    # Get or create user in Supabase
    test_user = await supabase_service.get_user_by_email(current_user.email)
    if not test_user:
        test_user = await supabase_service.create_user(
            email=current_user.email,
            full_name=current_user.full_name or "User",
            is_verified=True
        )
    
    user_id = test_user["id"]
    cards = await supabase_service.get_cards(user_id)
    
    # If no cards exist, create some default ones
    if not cards:
        default_cards = [
            {"title": "Main Focus", "description": "Primary work items", "position": 0},
            {"title": "Quick Tasks", "description": "Small, quick wins", "position": 1},
            {"title": "Projects", "description": "Long-term projects", "position": 2},
        ]
        
        for card_data in default_cards:
            await supabase_service.create_card(user_id, card_data)
        
        cards = await supabase_service.get_cards(user_id)
    
    return cards

@router.get("/{card_id}", response_model=Card)
async def get_card(card_id: str) -> Any:
    """Get a specific card"""
    # For simplicity, just fetch from cards table
    result = supabase_service.client.table("cards").select("*").eq("id", card_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Card not found")
    
    return result.data[0]

@router.post("/", response_model=Card)
async def create_card(
    card_in: CardCreate,
    current_user: SimpleUser = Depends(deps_simple.get_current_active_user_simple)
) -> Any:
    """Create a new card"""
    test_user = await supabase_service.get_user_by_email(current_user.email)
    if not test_user:
        raise HTTPException(status_code=401, detail="User not found")
    
    card = await supabase_service.create_card(
        user_id=test_user["id"],
        data=card_in.dict()
    )
    
    return card

@router.put("/{card_id}", response_model=Card)
async def update_card(card_id: str, card_in: CardUpdate) -> Any:
    """Update a card"""
    updates = {k: v for k, v in card_in.dict().items() if v is not None}
    card = await supabase_service.update_card(card_id, **updates)
    
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    return card

@router.delete("/{card_id}")
async def delete_card(card_id: str) -> Any:
    """Delete a card"""
    if not await supabase_service.delete_card(card_id):
        raise HTTPException(status_code=404, detail="Card not found")
    
    return {"message": "Card deleted successfully"}