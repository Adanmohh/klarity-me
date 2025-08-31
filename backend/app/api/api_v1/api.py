from fastapi import APIRouter

from app.api.api_v1.endpoints import auth_supabase, cards_supabase, focus_tasks, daily_tasks

api_router = APIRouter()
api_router.include_router(auth_supabase.router, prefix="/auth", tags=["auth"])
api_router.include_router(cards_supabase.router, prefix="/cards", tags=["cards"])
api_router.include_router(focus_tasks.router, prefix="/focus-tasks", tags=["focus-tasks"])
api_router.include_router(daily_tasks.router, prefix="/daily-tasks", tags=["daily-tasks"])