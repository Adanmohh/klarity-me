from fastapi import APIRouter

from app.api.api_v1.endpoints import auth, cards, focus_tasks, daily_tasks
from app.api import ai_agents

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(cards.router, prefix="/cards", tags=["cards"])
api_router.include_router(focus_tasks.router, prefix="/focus-tasks", tags=["focus-tasks"])
api_router.include_router(daily_tasks.router, prefix="/daily-tasks", tags=["daily-tasks"])
api_router.include_router(ai_agents.router, tags=["ai-agents"])