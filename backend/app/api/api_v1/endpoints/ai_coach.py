"""
AI Coach endpoint for development mode
"""
from typing import Any, Dict
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from app.core.config import settings
from app.api.deps_supabase import get_current_user_supabase, SupabaseUser

router = APIRouter()

class KnowledgeBaseRequest(BaseModel):
    user_id: str

class MessageRequest(BaseModel):
    message: str
    context: Dict[str, Any] = {}

@router.post("/initialize-knowledge")
async def initialize_knowledge(
    current_user: SupabaseUser = Depends(get_current_user_supabase)
) -> Any:
    """Initialize AI Coach knowledge base for user"""
    if not settings.DEV_MODE:
        raise HTTPException(status_code=503, detail="AI Coach not available in production mode")
    
    # In dev mode, return mock success
    return {
        "status": "initialized",
        "user_id": current_user.id,
        "message": "AI Coach knowledge base initialized successfully"
    }

@router.post("/chat")
async def chat_with_coach(
    request: MessageRequest,
    current_user: SupabaseUser = Depends(get_current_user_supabase)
) -> Any:
    """Chat with AI Coach"""
    if not settings.DEV_MODE:
        raise HTTPException(status_code=503, detail="AI Coach not available in production mode")
    
    # In dev mode, return mock response
    return {
        "response": f"I understand you said: '{request.message}'. How can I help you achieve your goals today?",
        "user_id": current_user.id,
        "suggestions": [
            "Focus on your most important task",
            "Take regular breaks",
            "Review your progress"
        ]
    }

@router.get("/suggestions")
async def get_suggestions(
    current_user: SupabaseUser = Depends(get_current_user_supabase)
) -> Any:
    """Get AI Coach suggestions"""
    if not settings.DEV_MODE:
        raise HTTPException(status_code=503, detail="AI Coach not available in production mode")
    
    return {
        "suggestions": [
            {
                "id": "1",
                "type": "focus",
                "message": "Your most productive time is usually in the morning. Consider scheduling important tasks then.",
                "priority": "high"
            },
            {
                "id": "2", 
                "type": "habit",
                "message": "You've been consistent with your morning routine. Keep it up!",
                "priority": "medium"
            },
            {
                "id": "3",
                "type": "break",
                "message": "You've been working for 90 minutes. Time for a short break!",
                "priority": "low"
            }
        ]
    }