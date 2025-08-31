"""Advanced Agentic RAG API Endpoints for Personalized Guidance"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
import os
import asyncio
from datetime import datetime
from enum import Enum

from ....services.rag.agentic_rag_service import (
    AgenticRAGService, 
    UserProfile, 
    GuidanceRequest, 
    GuidanceType,
    GuidanceResponse
)
from ....services.rag.knowledge_ingestion import initialize_knowledge_base

router = APIRouter()

# Global RAG service instance
rag_service: Optional[AgenticRAGService] = None

def get_rag_service() -> AgenticRAGService:
    """Get or initialize the RAG service"""
    global rag_service
    if rag_service is None:
        api_key = os.environ.get("GOOGLE_API_KEY")
        if not api_key:
            raise HTTPException(
                status_code=503,
                detail="RAG service unavailable: GOOGLE_API_KEY not configured"
            )
        rag_service = AgenticRAGService(gemini_api_key=api_key)
        # Initialize knowledge base in background
        try:
            initialize_knowledge_base(rag_service)
        except Exception as e:
            print(f"Warning: Could not initialize knowledge base: {e}")
    return rag_service


# Pydantic models for API
class PersonalityTraitsModel(BaseModel):
    discipline: float = Field(ge=0, le=1)
    creativity: float = Field(ge=0, le=1)
    empathy: float = Field(ge=0, le=1)
    analytical: float = Field(ge=0, le=1)
    intuitive: float = Field(ge=0, le=1)


class HabitModel(BaseModel):
    name: str
    frequency: str = "daily"
    status: str = "active"
    completion_rate: Optional[float] = None
    start_date: Optional[str] = None


class ManifestationTargetModel(BaseModel):
    description: str
    timeline: str = "3 months"
    priority: str = "medium"
    progress: Optional[float] = None


class UserProfileCreateModel(BaseModel):
    user_id: str
    goals: List[str]
    current_habits: List[HabitModel] = []
    manifestation_targets: List[ManifestationTargetModel] = []
    personality_traits: PersonalityTraitsModel
    learning_preferences: Dict[str, Any] = {}


class GuidanceRequestModel(BaseModel):
    user_id: str
    guidance_type: str  # Will be converted to GuidanceType enum
    specific_query: Optional[str] = None
    context: Optional[Dict[str, Any]] = None
    urgency: str = "normal"


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    timestamp: Optional[str] = None


class ChatRequest(BaseModel):
    user_id: str
    message: str
    context: Optional[Dict[str, Any]] = None
    conversation_history: List[ChatMessage] = []


class InitializeKnowledgeRequest(BaseModel):
    force_reinitialize: bool = False


# API Endpoints

@router.get("/health")
async def health_check():
    """Check if the agentic RAG service is healthy"""
    try:
        service = get_rag_service()
        return {
            "status": "healthy",
            "service": "agentic_rag",
            "timestamp": datetime.now().isoformat(),
            "has_knowledge_base": service.index is not None
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }


@router.post("/initialize-knowledge")
async def initialize_knowledge(
    request: InitializeKnowledgeRequest,
    background_tasks: BackgroundTasks
):
    """Initialize or reinitialize the knowledge base"""
    try:
        service = get_rag_service()
        
        def init_knowledge():
            try:
                count = initialize_knowledge_base(service)
                return count
            except Exception as e:
                print(f"Knowledge initialization error: {e}")
                return 0
        
        if request.force_reinitialize or service.index is None:
            background_tasks.add_task(init_knowledge)
            return {
                "status": "initiated",
                "message": "Knowledge base initialization started in background"
            }
        else:
            return {
                "status": "already_initialized",
                "message": "Knowledge base already exists"
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/user-profile")
async def create_or_update_user_profile(profile_data: UserProfileCreateModel):
    """Create or update a user profile"""
    try:
        service = get_rag_service()
        
        # Convert Pydantic models to dict format
        current_habits = [habit.dict() for habit in profile_data.current_habits]
        manifestation_targets = [target.dict() for target in profile_data.manifestation_targets]
        personality_traits = profile_data.personality_traits.dict()
        
        # Create UserProfile object
        user_profile = UserProfile(
            user_id=profile_data.user_id,
            goals=profile_data.goals,
            current_habits=current_habits,
            manifestation_targets=manifestation_targets,
            personality_traits=personality_traits,
            success_patterns={},  # Will be populated over time
            learning_preferences=profile_data.learning_preferences,
            last_updated=datetime.now()
        )
        
        # Update profile in service
        service.update_user_profile(user_profile)
        
        return {
            "status": "success",
            "message": "User profile created/updated successfully",
            "user_id": profile_data.user_id,
            "profile_summary": {
                "goals_count": len(profile_data.goals),
                "habits_count": len(profile_data.current_habits),
                "manifestation_targets_count": len(profile_data.manifestation_targets)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/user-profile/{user_id}")
async def get_user_profile(user_id: str):
    """Get user profile by ID"""
    try:
        service = get_rag_service()
        
        if user_id not in service.user_profiles:
            raise HTTPException(status_code=404, detail="User profile not found")
        
        profile = service.user_profiles[user_id]
        
        return {
            "user_id": profile.user_id,
            "goals": profile.goals,
            "current_habits": profile.current_habits,
            "manifestation_targets": profile.manifestation_targets,
            "personality_traits": profile.personality_traits,
            "learning_preferences": profile.learning_preferences,
            "last_updated": profile.last_updated.isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/guidance")
async def get_personalized_guidance(request: GuidanceRequestModel):
    """Get personalized guidance based on user profile and request type"""
    try:
        service = get_rag_service()
        
        # Check if user profile exists
        if request.user_id not in service.user_profiles:
            raise HTTPException(
                status_code=404, 
                detail="User profile not found. Please create a profile first."
            )
        
        user_profile = service.user_profiles[request.user_id]
        
        # Convert string to GuidanceType enum
        try:
            guidance_type = GuidanceType(request.guidance_type)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid guidance type. Must be one of: {[t.value for t in GuidanceType]}"
            )
        
        # Create guidance request
        guidance_request = GuidanceRequest(
            user_profile=user_profile,
            guidance_type=guidance_type,
            context=request.context,
            specific_query=request.specific_query,
            urgency=request.urgency
        )
        
        # Get personalized guidance
        response = await service.get_personalized_guidance(guidance_request)
        
        return {
            "user_id": request.user_id,
            "guidance_type": request.guidance_type,
            "guidance": response.guidance_text,
            "confidence": response.confidence,
            "personalization_score": response.personalization_score,
            "actionable_steps": response.actionable_steps,
            "follow_up_suggestions": response.follow_up_suggestions,
            "sources": response.sources,
            "metadata": response.metadata
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat")
async def chat_with_ai_coach(request: ChatRequest):
    """Chat interface with the AI coach"""
    try:
        service = get_rag_service()
        
        # Check if user profile exists
        if request.user_id not in service.user_profiles:
            raise HTTPException(
                status_code=404,
                detail="User profile not found. Please create a profile first."
            )
        
        user_profile = service.user_profiles[request.user_id]
        
        # Create guidance request for chat
        guidance_request = GuidanceRequest(
            user_profile=user_profile,
            guidance_type=GuidanceType.DAILY_WISDOM,  # Default to daily wisdom for chat
            specific_query=request.message,
            context={
                "conversation_history": [msg.dict() for msg in request.conversation_history],
                **request.context if request.context else {}
            }
        )
        
        # Get response from AI coach
        response = await service.get_personalized_guidance(guidance_request)
        
        # Create chat response
        assistant_message = ChatMessage(
            role="assistant",
            content=response.guidance_text,
            timestamp=datetime.now().isoformat()
        )
        
        return {
            "user_id": request.user_id,
            "response": assistant_message,
            "confidence": response.confidence,
            "actionable_steps": response.actionable_steps,
            "follow_up_suggestions": response.follow_up_suggestions,
            "sources": response.sources
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/daily-insights/{user_id}")
async def get_daily_insights(user_id: str):
    """Get comprehensive daily insights for a user"""
    try:
        service = get_rag_service()
        
        insights = await service.provide_daily_insights(user_id)
        
        if "error" in insights:
            raise HTTPException(status_code=404, detail=insights["error"])
        
        return {
            "user_id": user_id,
            "date": datetime.now().isoformat(),
            "insights": insights
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/success-analysis/{user_id}")
async def analyze_success_patterns(user_id: str):
    """Analyze user's success patterns and provide predictions"""
    try:
        service = get_rag_service()
        
        analysis = service.analyze_success_patterns(user_id)
        
        if "error" in analysis:
            raise HTTPException(status_code=404, detail=analysis["error"])
        
        return {
            "user_id": user_id,
            "analysis_date": datetime.now().isoformat(),
            "analysis": analysis
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/guidance-types")
async def get_available_guidance_types():
    """Get list of available guidance types"""
    return {
        "guidance_types": [
            {
                "value": guidance_type.value,
                "name": guidance_type.value.replace("_", " ").title(),
                "description": _get_guidance_type_description(guidance_type)
            }
            for guidance_type in GuidanceType
        ]
    }


def _get_guidance_type_description(guidance_type: GuidanceType) -> str:
    """Get description for guidance type"""
    descriptions = {
        GuidanceType.DAILY_WISDOM: "Get daily inspirational wisdom tailored to your goals and personality",
        GuidanceType.HABIT_OPTIMIZATION: "Receive suggestions to optimize your current habits for better results",
        GuidanceType.MANIFESTATION_INSIGHT: "Get insights into your manifestation practices and success patterns",
        GuidanceType.SUCCESS_PREDICTION: "Analyze your patterns to predict success probability and key factors",
        GuidanceType.CUSTOM_AFFIRMATION: "Generate personalized affirmations based on your goals and traits",
        GuidanceType.PATTERN_ANALYSIS: "Deep analysis of your behavior patterns and growth opportunities"
    }
    return descriptions.get(guidance_type, "Personalized guidance")


@router.post("/feedback")
async def provide_feedback(
    user_id: str,
    guidance_id: Optional[str] = None,
    rating: int = Field(ge=1, le=5),
    feedback: Optional[str] = None,
    was_helpful: bool = True
):
    """Provide feedback on guidance for learning improvement"""
    try:
        service = get_rag_service()
        
        # Record feedback for learning
        feedback_data = {
            "user_id": user_id,
            "guidance_id": guidance_id,
            "rating": rating,
            "feedback": feedback,
            "was_helpful": was_helpful,
            "timestamp": datetime.now().isoformat()
        }
        
        # This would be used to improve the service
        # For now, just log it
        print(f"Feedback received: {feedback_data}")
        
        return {
            "status": "success",
            "message": "Feedback recorded successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats")
async def get_service_stats():
    """Get service statistics"""
    try:
        service = get_rag_service()
        
        return {
            "total_users": len(service.user_profiles),
            "knowledge_base_initialized": service.index is not None,
            "service_uptime": "Available",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))