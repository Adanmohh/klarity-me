from fastapi import APIRouter

from app.api.api_v1.endpoints import auth_supabase, auth_supabase_full, auth_otp, cards_supabase, focus_tasks_dev, daily_tasks, identity_evolution_supabase, ai_coach
from app.core.config import settings

api_router = APIRouter()
api_router.include_router(auth_supabase.router, prefix="/auth", tags=["auth"])
api_router.include_router(auth_supabase_full.router, prefix="/auth-v2", tags=["auth-v2"])
api_router.include_router(auth_otp.router, prefix="/auth-otp", tags=["auth-otp"])
api_router.include_router(cards_supabase.router, prefix="/cards", tags=["cards"])

# Use dev version for focus tasks in DEV_MODE
print(f"DEBUG api.py: DEV_MODE is {settings.DEV_MODE}")
if settings.DEV_MODE:
    print("DEBUG api.py: Using focus_tasks_dev router")
    api_router.include_router(focus_tasks_dev.router, prefix="/focus-tasks", tags=["focus-tasks"])
else:
    print("DEBUG api.py: Using focus_tasks router")
    from app.api.api_v1.endpoints import focus_tasks
    api_router.include_router(focus_tasks.router, prefix="/focus-tasks", tags=["focus-tasks"])
api_router.include_router(daily_tasks.router, prefix="/daily-tasks", tags=["daily-tasks"])
api_router.include_router(identity_evolution_supabase.router, prefix="/identity-evolution", tags=["identity-evolution"])
api_router.include_router(ai_coach.router, prefix="/ai-coach", tags=["ai-coach"])