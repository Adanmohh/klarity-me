from fastapi import APIRouter

from app.api.api_v1.endpoints import auth_supabase, auth_supabase_full, auth_otp, cards_supabase, focus_tasks, daily_tasks, identity_evolution_supabase

api_router = APIRouter()
api_router.include_router(auth_supabase.router, prefix="/auth", tags=["auth"])
api_router.include_router(auth_supabase_full.router, prefix="/auth-v2", tags=["auth-v2"])
api_router.include_router(auth_otp.router, prefix="/auth-otp", tags=["auth-otp"])
api_router.include_router(cards_supabase.router, prefix="/cards", tags=["cards"])
api_router.include_router(focus_tasks.router, prefix="/focus-tasks", tags=["focus-tasks"])
api_router.include_router(daily_tasks.router, prefix="/daily-tasks", tags=["daily-tasks"])
api_router.include_router(identity_evolution_supabase.router, prefix="/identity-evolution", tags=["identity-evolution"])