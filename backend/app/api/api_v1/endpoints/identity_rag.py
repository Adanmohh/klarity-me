"""Identity RAG API Endpoints"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Dict, Any
import os
from ....services.rag.gemini_client import GeminiRAGClient

router = APIRouter()

# Initialize Gemini client (will be singleton in production)
gemini_client = None

def get_gemini_client():
    """Get or create Gemini client singleton"""
    global gemini_client
    if gemini_client is None:
        # For testing, we'll use a test key or mock
        api_key = os.environ.get("GOOGLE_API_KEY")
        if not api_key:
            # Return a mock response for testing
            return None
        gemini_client = GeminiRAGClient(api_key)
    return gemini_client


class WisdomQueryRequest(BaseModel):
    query: str
    context: Optional[Dict[str, Any]] = None


class MantraGenerateRequest(BaseModel):
    identity: str
    style: str = "synthesis"  # hill, murphy, ghazali, or synthesis


class ChallengeGenerateRequest(BaseModel):
    identity: str
    difficulty: str = "beginner"
    user_context: Optional[Dict[str, Any]] = None


class TestResponse(BaseModel):
    status: str
    message: str
    has_api_key: bool


@router.get("/test")
async def test_rag_setup() -> TestResponse:
    """Test if RAG system is properly configured"""
    api_key = os.environ.get("GOOGLE_API_KEY")
    
    return TestResponse(
        status="ready" if api_key else "missing_api_key",
        message="RAG system is ready" if api_key else "Please set GOOGLE_API_KEY environment variable",
        has_api_key=bool(api_key)
    )


@router.post("/wisdom/query")
async def query_wisdom(request: WisdomQueryRequest):
    """Query wisdom from the three philosophical sources"""
    client = get_gemini_client()
    
    if not client:
        # Return mock response for testing
        return {
            "query": request.query,
            "response": "Mock wisdom response: To develop discipline, one must have a burning desire (Hill), program the subconscious mind (Murphy), and purify the heart through consistent practice (Ghazali).",
            "sources": {
                "hill": "Mock Napoleon Hill quote",
                "murphy": "Mock Joseph Murphy quote",
                "ghazali": "Mock Al-Ghazali quote"
            }
        }
    
    try:
        # For now, we'll generate a synthesized response without the full RAG pipeline
        # This will be enhanced when we add document loading
        response = client.complete(f"""
        Provide wisdom on: {request.query}
        
        Give a brief response combining insights from:
        - Napoleon Hill (Think and Grow Rich)
        - Dr. Joseph Murphy (Power of Your Subconscious Mind)
        - Al-Ghazali (Alchemy of Happiness)
        """)
        
        return {
            "query": request.query,
            "response": response,
            "context": request.context
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/wisdom/generate-mantra")
async def generate_mantra(request: MantraGenerateRequest):
    """Generate a personalized mantra for identity reinforcement"""
    client = get_gemini_client()
    
    if not client:
        # Return mock response
        return {
            "identity": request.identity,
            "style": request.style,
            "mantra": f"I am becoming more {request.identity} each day through focused action and faith."
        }
    
    try:
        mantra = client.generate_mantra(request.identity, request.style)
        return {
            "identity": request.identity,
            "style": request.style,
            "mantra": mantra
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/wisdom/generate-challenge")
async def generate_challenge(request: ChallengeGenerateRequest):
    """Generate a 7-day identity challenge"""
    client = get_gemini_client()
    
    if not client:
        # Return mock response
        return {
            "identity": request.identity,
            "difficulty": request.difficulty,
            "challenge": {
                "title": f"7-Day {request.identity.title()} Challenge",
                "description": "A mock challenge for testing",
                "daily_quests": [
                    {
                        "day": i,
                        "title": f"Day {i} Quest",
                        "description": f"Practice being {request.identity}",
                        "morning_practice": "Morning meditation",
                        "evening_reflection": "Journal about progress",
                        "success_criteria": ["Complete practice", "Reflect on learning"],
                        "wisdom_quote": "Mock wisdom quote"
                    }
                    for i in range(1, 8)
                ]
            }
        }
    
    try:
        challenge = client.generate_challenge(
            request.identity,
            request.difficulty,
            request.user_context
        )
        return {
            "identity": request.identity,
            "difficulty": request.difficulty,
            "challenge": challenge
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/wisdom/daily-quote")
async def get_daily_quote():
    """Get a daily wisdom quote"""
    client = get_gemini_client()
    
    if not client:
        return {
            "quote": "Whatever the mind can conceive and believe, it can achieve.",
            "author": "Napoleon Hill",
            "source": "Think and Grow Rich"
        }
    
    try:
        response = client.complete("""
        Provide one powerful quote from either Napoleon Hill, Joseph Murphy, or Al-Ghazali.
        Format as JSON:
        {
            "quote": "the quote",
            "author": "author name",
            "source": "book title"
        }
        """)
        
        import json
        try:
            if "```json" in response:
                response = response.split("```json")[1].split("```")[0]
            elif "```" in response:
                response = response.split("```")[1].split("```")[0]
            return json.loads(response)
        except:
            return {
                "quote": response,
                "author": "Unknown",
                "source": "Generated"
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))