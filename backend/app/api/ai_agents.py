"""
Dream Journal AI Agent API endpoints with ElevenLabs Voice Integration
"""

from fastapi import APIRouter, HTTPException, File, UploadFile, Form
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from datetime import datetime
import base64

# Import our Dream Journal agents
from app.agents.dream_journal_agent import process_dream_journal, process_voice_journal
from app.agents.dream_journal_voice import DreamJournalVoice

router = APIRouter(prefix="/ai", tags=["AI Agents"])

# Request/Response Models
class DreamJournalRequest(BaseModel):
    """Request model for dream journal processing"""
    journal_text: str
    user_id: Optional[str] = None
    generate_audio: bool = False

class DreamJournalResponse(BaseModel):
    """Response model for dream journal processing"""
    success: bool
    tasks: List[Dict[str, Any]]
    briefing: str
    themes: List[str]
    emotional_analysis: Dict[str, Any]
    processed_at: str
    audio: Optional[Dict[str, Any]] = None
    transcription: Optional[Dict[str, Any]] = None

# Dream Journal Endpoints
@router.post("/dream-journal/process", response_model=DreamJournalResponse)
async def process_journal_entry(request: DreamJournalRequest):
    """
    Process a dream journal entry and extract actionable tasks
    
    This endpoint:
    - Extracts tasks from morning thoughts/dreams
    - Analyzes emotional content
    - Enriches tasks with context
    - Suggests optimal time slots
    """
    try:
        result = await process_dream_journal(
            journal_text=request.journal_text,
            user_id=request.user_id,
            generate_audio=request.generate_audio
        )
        
        if not result.get("success"):
            raise HTTPException(status_code=400, detail="Failed to process journal entry")
        
        return DreamJournalResponse(
            success=True,
            tasks=result["data"]["tasks"],
            briefing=result["data"]["briefing"],
            themes=result["data"]["themes"],
            emotional_analysis=result["data"]["emotional_analysis"],
            processed_at=result["data"]["processed_at"],
            audio=result.get("audio")
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/dream-journal/voice-upload", response_model=DreamJournalResponse)
async def process_voice_upload(
    audio_file: UploadFile = File(...),
    user_id: Optional[str] = Form(None),
    generate_audio_response: bool = Form(True)
):
    """
    Process an uploaded voice note dream journal entry
    
    This endpoint:
    - Accepts audio file upload (mp3, wav, m4a)
    - Transcribes the audio to text
    - Processes the journal entry
    - Optionally generates audio briefing response
    """
    try:
        # Validate file format
        allowed_formats = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/m4a"]
        if audio_file.content_type not in allowed_formats:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid audio format. Allowed: {', '.join(allowed_formats)}"
            )
        
        # Read audio data
        audio_data = await audio_file.read()
        
        # Determine format from content type
        format_map = {
            "audio/mpeg": "mp3",
            "audio/mp3": "mp3",
            "audio/wav": "wav",
            "audio/x-wav": "wav",
            "audio/m4a": "m4a"
        }
        audio_format = format_map.get(audio_file.content_type, "mp3")
        
        # Process voice journal
        result = await process_voice_journal(
            audio_data=audio_data,
            audio_format=audio_format,
            user_id=user_id,
            generate_audio_response=generate_audio_response
        )
        
        if not result.get("success"):
            raise HTTPException(status_code=400, detail="Failed to process voice journal")
        
        return DreamJournalResponse(
            success=True,
            tasks=result["data"]["tasks"],
            briefing=result["data"]["briefing"],
            themes=result["data"]["themes"],
            emotional_analysis=result["data"]["emotional_analysis"],
            processed_at=result["data"]["processed_at"],
            audio=result.get("audio"),
            transcription=result.get("transcription")
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/dream-journal/generate-audio")
async def generate_briefing_audio(
    briefing_text: str = Form(...),
    emotional_state: str = Form("neutral"),
    user_id: Optional[str] = Form(None)
):
    """
    Generate audio for a text briefing using ElevenLabs
    
    Emotional states: anxious, stressed, excited, motivated, neutral, tired, overwhelmed, happy, focused
    """
    try:
        voice_processor = DreamJournalVoice()
        
        result = await voice_processor.generate_morning_briefing_audio(
            briefing_text=briefing_text,
            emotional_state=emotional_state
        )
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail="Failed to generate audio")
        
        return {
            "success": True,
            "audio": {
                "audio_base64": result["audio_base64"],
                "audio_format": result["audio_format"],
                "voice_mood": result["mood"]
            },
            "message": "Audio generated successfully"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/dream-journal/task-audio")
async def generate_task_audio(tasks: List[Dict[str, Any]]):
    """
    Generate audio summaries for tasks
    """
    try:
        voice_processor = DreamJournalVoice()
        
        result = await voice_processor.generate_task_audio_summaries(tasks)
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail="Failed to generate task audio")
        
        return {
            "success": True,
            "audio": {
                "audio_base64": result["audio_base64"],
                "audio_format": result["audio_format"],
                "voice_mood": result["mood"]
            },
            "message": "Task audio generated successfully"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/dream-journal/affirmation")
async def generate_affirmation(
    themes: List[str] = Form(...),
    emotional_tone: str = Form("neutral")
):
    """
    Generate personalized voice affirmation based on journal themes
    """
    try:
        voice_processor = DreamJournalVoice()
        
        result = await voice_processor.create_voice_affirmation(themes, emotional_tone)
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail="Failed to generate affirmation")
        
        return {
            "success": True,
            "audio": {
                "audio_base64": result["audio_base64"],
                "audio_format": result["audio_format"],
                "voice_mood": result["mood"]
            },
            "message": "Affirmation generated successfully"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/dream-journal/voices")
async def get_available_voices():
    """
    Get list of available ElevenLabs voices
    """
    try:
        voice_processor = DreamJournalVoice()
        result = await voice_processor.get_available_voices()
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail="Failed to fetch voices")
        
        return result
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/dream-journal/sample")
async def get_sample_journal_entries():
    """
    Get sample journal entries for testing
    """
    samples = [
        {
            "title": "Morning anxiety",
            "text": "Woke up anxious about the presentation tomorrow. Need to practice my opening, prepare slides, and email the team. Also worried about the deadline next week. Should call mom about her birthday plans."
        },
        {
            "title": "Creative morning",
            "text": "Had an amazing idea for the app - what if we added voice commands? Excited to prototype this. Also need to finish the design review and schedule team standup. Feeling energized today!"
        },
        {
            "title": "Overwhelmed",
            "text": "Too many things on my plate. Client meeting, code review, documentation, and that bug fix. Where do I even start? Need to organize my thoughts and prioritize. Maybe I should delegate some tasks."
        }
    ]
    
    return {
        "samples": samples,
        "message": "Use these sample texts to test the dream journal feature"
    }

@router.get("/dream-journal/stats")
async def get_journal_stats(user_id: Optional[str] = None):
    """
    Get statistics about journal processing
    """
    # Mock implementation - would fetch from database
    return {
        "total_entries": 42,
        "tasks_extracted": 156,
        "common_themes": ["work", "family", "health", "creativity"],
        "average_tasks_per_entry": 3.7,
        "most_common_emotion": "focused",
        "peak_journal_time": "7:00 AM"
    }

# Health check for Dream Journal agent
@router.get("/health")
async def dream_journal_health():
    """
    Check if Dream Journal agent is operational
    """
    return {
        "status": "healthy",
        "agent": "dream_journal",
        "features": [
            "task_extraction",
            "emotional_analysis",
            "context_enrichment",
            "time_slot_suggestion"
        ],
        "timestamp": datetime.now().isoformat()
    }