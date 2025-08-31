"""Identity Evolution API Endpoints using Supabase"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from pydantic import BaseModel
from app.core.supabase import get_supabase

router = APIRouter()

# In-memory store for development
DEV_STORE = {
    'qualities': [],
    'evidence': [],
    'challenges': [],
    'next_id': 1
}

# Pydantic Models
class QualityBase(BaseModel):
    quality_name: str
    category: Optional[str] = "character"
    

class QualityCreate(QualityBase):
    pass


class QualityUpdate(BaseModel):
    strength: Optional[float] = None
    category: Optional[str] = None


class EvidenceCreate(BaseModel):
    quality_id: int
    evidence_type: str
    action: str
    description: Optional[str] = None
    task_id: Optional[int] = None
    habit_id: Optional[int] = None
    challenge_id: Optional[int] = None
    impact_score: Optional[float] = 1.0


class ChallengeCreate(BaseModel):
    quality_target_id: int
    title: str
    description: Optional[str] = None
    difficulty: str = "beginner"
    daily_quests: List[Dict[str, Any]]
    wisdom_quotes: Optional[List[Dict[str, str]]] = None


# CRUD Operations
@router.get("/qualities")
async def get_user_qualities(
    user_id: str = Query(..., description="User ID")
):
    """Get all identity qualities for a user"""
    # For development, return from in-memory store
    if user_id == '00000000-0000-0000-0000-000000000001':
        print(f"Returning {len(DEV_STORE['qualities'])} qualities from dev store for dev user")
        return DEV_STORE['qualities']
    
    supabase = get_supabase()
    
    try:
        response = supabase.table('identity_qualities').select("*").eq('user_id', user_id).execute()
        return response.data if response.data else []
    except Exception as e:
        # Return empty on error
        print(f"Error fetching qualities: {e}")
        return []


@router.post("/qualities")
async def create_quality(
    user_id: str,
    quality: QualityCreate
):
    """Create a new identity quality for tracking"""
    supabase = get_supabase()
    
    # For development, add to in-memory store
    if user_id == '00000000-0000-0000-0000-000000000001':
        # Check if quality already exists in dev store
        existing = [q for q in DEV_STORE['qualities'] if q['quality_name'] == quality.quality_name]
        if existing:
            raise HTTPException(status_code=400, detail="Quality already exists")
        
        # Create new quality in dev store
        new_quality = {
            'id': DEV_STORE['next_id'],
            'user_id': user_id,
            'quality_name': quality.quality_name,
            'category': quality.category,
            'strength': 0.0,
            'evidence_count': 0,
            'last_evidence': None,
            'growth_rate': 0.0,
            'created_at': datetime.now().isoformat()
        }
        DEV_STORE['qualities'].append(new_quality)
        DEV_STORE['next_id'] += 1
        print(f"Created quality in dev store: {new_quality}")
        return new_quality
    
    # Check if quality already exists
    existing = supabase.table('identity_qualities').select("*").eq('user_id', user_id).eq('quality_name', quality.quality_name).execute()
    
    if existing.data:
        raise HTTPException(status_code=400, detail="Quality already exists")
    
    try:
        response = supabase.table('identity_qualities').insert({
            'user_id': user_id,
            'quality_name': quality.quality_name,
            'category': quality.category
        }).execute()
        
        return response.data[0] if response.data else None
    except Exception as e:
        # For dev mode, add to store on error
        print(f"Error creating quality in DB, using dev store: {e}")
        new_quality = {
            'id': DEV_STORE['next_id'],
            'user_id': user_id,
            'quality_name': quality.quality_name,
            'category': quality.category,
            'strength': 0.0,
            'evidence_count': 0,
            'last_evidence': None,
            'growth_rate': 0.0,
            'created_at': datetime.now().isoformat()
        }
        DEV_STORE['qualities'].append(new_quality)
        DEV_STORE['next_id'] += 1
        return new_quality


@router.patch("/qualities/{quality_id}")
async def update_quality(
    quality_id: int,
    update: QualityUpdate
):
    """Update an identity quality"""
    supabase = get_supabase()
    
    # For development, update in-memory store
    for quality in DEV_STORE['qualities']:
        if quality['id'] == quality_id:
            if update.strength is not None:
                quality['strength'] = min(100.0, max(0.0, update.strength))
                quality['growth_rate'] = 5.0  # Mock growth rate
            if update.category is not None:
                quality['category'] = update.category
            quality['last_evidence'] = datetime.now().isoformat()
            print(f"Updated quality in dev store: {quality}")
            return quality
    
    # Try database if not in dev store
    update_data = {}
    if update.strength is not None:
        update_data['strength'] = min(100.0, max(0.0, update.strength))
    if update.category is not None:
        update_data['category'] = update.category
    
    try:
        response = supabase.table('identity_qualities').update(update_data).eq('id', quality_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Quality not found")
        
        return response.data[0]
    except Exception as e:
        print(f"Error updating quality: {e}")
        raise HTTPException(status_code=404, detail="Quality not found")


@router.post("/evidence")
async def record_evidence(
    user_id: str,
    evidence: EvidenceCreate
):
    """Record evidence of identity embodiment"""
    supabase = get_supabase()
    
    # For development, use in-memory store
    if user_id == '00000000-0000-0000-0000-000000000001':
        # Find quality in dev store
        quality = None
        for q in DEV_STORE['qualities']:
            if q['id'] == evidence.quality_id:
                quality = q
                break
        
        if not quality:
            raise HTTPException(status_code=404, detail="Quality not found")
        
        # Create evidence record
        new_evidence = {
            'id': DEV_STORE['next_id'],
            'user_id': user_id,
            'quality_id': evidence.quality_id,
            'evidence_type': evidence.evidence_type,
            'action': evidence.action,
            'description': evidence.description,
            'impact_score': evidence.impact_score,
            'created_at': datetime.now().isoformat()
        }
        DEV_STORE['evidence'].append(new_evidence)
        
        # Update quality stats
        strength_increase = evidence.impact_score * 2.0  # More noticeable increase for testing
        quality['strength'] = min(100.0, quality['strength'] + strength_increase)
        quality['evidence_count'] = quality.get('evidence_count', 0) + 1
        quality['last_evidence'] = datetime.now().isoformat()
        quality['growth_rate'] = 5.0
        
        DEV_STORE['next_id'] += 1
        print(f"Recorded evidence in dev store: {new_evidence}")
        print(f"Updated quality strength to: {quality['strength']}")
        return new_evidence
    
    # Original database logic for production
    quality_check = supabase.table('identity_qualities').select("*").eq('id', evidence.quality_id).eq('user_id', user_id).execute()
    
    if not quality_check.data:
        raise HTTPException(status_code=404, detail="Quality not found")
    
    try:
        # Create evidence record
        evidence_response = supabase.table('identity_evidence').insert({
            'user_id': user_id,
            'quality_id': evidence.quality_id,
            'evidence_type': evidence.evidence_type,
            'action': evidence.action,
            'description': evidence.description,
            'task_id': evidence.task_id,
            'habit_id': evidence.habit_id,
            'challenge_id': evidence.challenge_id,
            'impact_score': evidence.impact_score
        }).execute()
        
        # Update quality stats
        quality = quality_check.data[0]
        strength_increase = evidence.impact_score * 0.5
        new_strength = min(100.0, quality['strength'] + strength_increase)
        
        supabase.table('identity_qualities').update({
            'strength': new_strength,
            'evidence_count': quality['evidence_count'] + 1,
            'last_evidence': datetime.utcnow().isoformat()
        }).eq('id', evidence.quality_id).execute()
        
        return evidence_response.data[0] if evidence_response.data else None
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/evidence")
async def get_user_evidence(
    user_id: str = Query(...),
    quality_id: Optional[int] = None,
    limit: int = Query(50, le=100)
):
    """Get evidence records for a user"""
    supabase = get_supabase()
    
    query = supabase.table('identity_evidence').select("*").eq('user_id', user_id)
    
    if quality_id:
        query = query.eq('quality_id', quality_id)
    
    query = query.order('created_at', desc=True).limit(limit)
    
    try:
        response = query.execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/growth-edge")
async def get_growth_edge(
    user_id: str = Query(...)
):
    """Identify the user's current growth edge (weakest quality needing work)"""
    supabase = get_supabase()
    
    # For development, use in-memory store
    if user_id == '00000000-0000-0000-0000-000000000001':
        if not DEV_STORE['qualities']:
            print("No qualities in dev store for growth-edge")
            return {
                'quality_id': 0,
                'quality_name': 'No qualities tracked',
                'strength': 0,
                'evidence_count': 0,
                'last_evidence': None,
                'recommendation': 'Start by adding your first quality',
                'suggested_actions': ['Add a quality to track']
            }
        
        # Get the weakest quality from dev store
        sorted_qualities = sorted(DEV_STORE['qualities'], key=lambda x: x['strength'])
        weakest = sorted_qualities[0]
        print(f"Growth edge from dev store: {weakest['quality_name']} at {weakest['strength']}%")
    else:
        try:
            # Get all qualities sorted by strength
            response = supabase.table('identity_qualities').select("*").eq('user_id', user_id).order('strength').execute()
            
            if not response.data:
                raise HTTPException(status_code=404, detail="No qualities found")
            
            # Get the weakest quality
            weakest = response.data[0]
        except Exception as e:
            print(f"Error getting qualities: {e}")
            return {
                'quality_id': 0,
                'quality_name': 'No qualities tracked',
                'strength': 0,
                'evidence_count': 0,
                'last_evidence': None,
                'recommendation': 'Start by adding your first quality',
                'suggested_actions': ['Add a quality to track']
            }
        
    
    # Generate recommendations
    recommendations = []
    if weakest['strength'] < 20:
        recommendation = "This quality needs focused attention. Start with small, daily actions."
        recommendations = [
            "Set a daily reminder to practice this quality",
            "Start a 7-day challenge",
            "Find an accountability partner"
        ]
    elif weakest['strength'] < 50:
        recommendation = "You're making progress. Increase the challenge level."
        recommendations = [
            "Take on bigger challenges",
            "Teach someone else about this quality",
            "Track your progress more rigorously"
        ]
    else:
        recommendation = "Good foundation established. Time for mastery."
        recommendations = [
            "Mentor others in this quality",
            "Integrate into other life areas",
            "Set stretch goals"
        ]
    
    return {
        'quality_id': weakest['id'],
        'quality_name': weakest['quality_name'],
        'strength': weakest['strength'],
        'evidence_count': weakest.get('evidence_count', 0),
        'last_evidence': weakest.get('last_evidence'),
        'recommendation': recommendation,
        'suggested_actions': recommendations
    }


@router.post("/challenges")
async def create_challenge(
    user_id: str,
    challenge: ChallengeCreate
):
    """Create a new identity challenge"""
    supabase = get_supabase()
    
    # Verify quality exists
    quality_check = supabase.table('identity_qualities').select("*").eq('id', challenge.quality_target_id).eq('user_id', user_id).execute()
    
    if not quality_check.data:
        raise HTTPException(status_code=404, detail="Quality not found")
    
    # Check for active challenges on same quality
    active_check = supabase.table('identity_challenges').select("*").eq('user_id', user_id).eq('quality_target_id', challenge.quality_target_id).eq('status', 'active').execute()
    
    if active_check.data:
        raise HTTPException(status_code=400, detail="Active challenge already exists for this quality")
    
    try:
        response = supabase.table('identity_challenges').insert({
            'user_id': user_id,
            'quality_target_id': challenge.quality_target_id,
            'title': challenge.title,
            'description': challenge.description,
            'difficulty': challenge.difficulty,
            'daily_quests': challenge.daily_quests,
            'wisdom_quotes': challenge.wisdom_quotes
        }).execute()
        
        return response.data[0] if response.data else None
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/challenges")
async def get_user_challenges(
    user_id: str = Query(...),
    status: Optional[str] = None
):
    """Get user's challenges"""
    supabase = get_supabase()
    
    try:
        # For development, return empty array if user_id is the dev UUID
        if user_id == '00000000-0000-0000-0000-000000000001':
            return []
        
        query = supabase.table('identity_challenges').select("*").eq('user_id', user_id)
        
        if status:
            query = query.eq('status', status)
        
        query = query.order('created_at', desc=True)
        
        response = query.execute()
        return response.data if response.data else []
    except Exception as e:
        # Return empty array on error for dev mode
        print(f"Error fetching challenges: {e}")
        return []


@router.post("/challenges/{challenge_id}/complete-day")
async def complete_challenge_day(
    challenge_id: int,
    day: int
):
    """Mark a challenge day as complete"""
    supabase = get_supabase()
    
    try:
        # Get challenge
        challenge_response = supabase.table('identity_challenges').select("*").eq('id', challenge_id).execute()
        
        if not challenge_response.data:
            raise HTTPException(status_code=404, detail="Challenge not found")
        
        challenge = challenge_response.data[0]
        
        if challenge['status'] != 'active':
            raise HTTPException(status_code=400, detail="Challenge is not active")
        
        completed_days = challenge['completed_days'] or []
        if day in completed_days:
            raise HTTPException(status_code=400, detail="Day already completed")
        
        # Update challenge progress
        completed_days.append(day)
        xp_reward = 10 * (1 + (0.1 * len(completed_days)))
        new_xp = challenge['xp_earned'] + int(xp_reward)
        
        update_data = {
            'completed_days': completed_days,
            'current_day': day,
            'xp_earned': new_xp
        }
        
        # Check if challenge is complete
        if len(completed_days) >= 7:
            update_data['status'] = 'completed'
            update_data['completed_at'] = datetime.utcnow().isoformat()
            update_data['xp_earned'] = new_xp + 100  # Completion bonus
            
            # Create milestone
            supabase.table('identity_milestones').insert({
                'user_id': challenge['user_id'],
                'quality_id': challenge['quality_target_id'],
                'title': f"Completed {challenge['title']}",
                'description': f"Successfully completed a 7-day {challenge['difficulty']} challenge",
                'milestone_type': 'challenge_complete',
                'achievement_data': {'challenge_id': challenge_id},
                'xp_reward': 100
            }).execute()
        
        supabase.table('identity_challenges').update(update_data).eq('id', challenge_id).execute()
        
        return {"message": f"Day {day} completed", "xp_earned": xp_reward}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/auto-evidence")
async def record_auto_evidence(
    user_id: str,
    task_id: Optional[int] = None,
    habit_id: Optional[int] = None
):
    """Automatically record evidence from task completion or habit tracking"""
    if not task_id and not habit_id:
        raise HTTPException(status_code=400, detail="Either task_id or habit_id required")
    
    supabase = get_supabase()
    evidence_records = []
    
    if task_id:
        try:
            # Get task details
            task_response = supabase.table('focus_tasks').select("*").eq('id', task_id).execute()
            
            if not task_response.data:
                raise HTTPException(status_code=404, detail="Task not found")
            
            task = task_response.data[0]
            
            # Call stored procedure to detect qualities
            supabase.rpc('detect_qualities_from_task', {
                'p_user_id': user_id,
                'p_task_id': task_id,
                'p_task_title': task['title'],
                'p_task_description': task.get('description', '')
            }).execute()
            
            return {"message": "Evidence recorded automatically", "task_analyzed": task['title']}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    if habit_id:
        try:
            # Find or create "consistent" quality for habits
            quality_response = supabase.table('identity_qualities').select("*").eq('user_id', user_id).eq('quality_name', 'consistent').execute()
            
            if not quality_response.data:
                # Create the quality
                quality_response = supabase.table('identity_qualities').insert({
                    'user_id': user_id,
                    'quality_name': 'consistent',
                    'category': 'behavior'
                }).execute()
            
            quality_id = quality_response.data[0]['id']
            
            # Add evidence
            supabase.table('identity_evidence').insert({
                'user_id': user_id,
                'quality_id': quality_id,
                'evidence_type': 'habit_streak',
                'habit_id': habit_id,
                'action': f"Maintained habit",
                'impact_score': 1.2
            }).execute()
            
            # Update quality
            quality = quality_response.data[0]
            supabase.table('identity_qualities').update({
                'strength': min(100.0, quality['strength'] + 0.3),
                'evidence_count': quality['evidence_count'] + 1,
                'last_evidence': datetime.utcnow().isoformat()
            }).eq('id', quality_id).execute()
            
            return {"message": "Habit evidence recorded"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


@router.get("/insights")
async def get_insights(
    user_id: str = Query(...),
    unread_only: bool = Query(False)
):
    """Get AI-generated insights for the user"""
    supabase = get_supabase()
    
    query = supabase.table('identity_insights').select("*").eq('user_id', user_id)
    
    if unread_only:
        query = query.eq('is_read', False)
    
    query = query.order('priority', desc=True).order('created_at', desc=True).limit(10)
    
    try:
        response = query.execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/insights/generate")
async def generate_insights(user_id: str):
    """Generate new insights based on user's identity data"""
    supabase = get_supabase()
    
    try:
        # Get user's qualities
        qualities_response = supabase.table('identity_qualities').select("*").eq('user_id', user_id).execute()
        
        if not qualities_response.data:
            return {"message": "No qualities to analyze"}
        
        qualities = qualities_response.data
        insights_created = []
        
        # Pattern detection: Find qualities with rapid growth
        week_ago = (datetime.utcnow() - timedelta(days=7)).isoformat()
        
        for quality in qualities:
            # Count recent evidence
            evidence_response = supabase.table('identity_evidence').select("*", count='exact').eq('quality_id', quality['id']).gte('created_at', week_ago).execute()
            
            recent_evidence = evidence_response.count
            
            if recent_evidence >= 10:
                insight = supabase.table('identity_insights').insert({
                    'user_id': user_id,
                    'insight_type': 'pattern',
                    'title': f"Rapid growth in {quality['quality_name']}",
                    'content': f"You've shown exceptional progress in being {quality['quality_name']} this week with {recent_evidence} evidence points. Keep this momentum!",
                    'related_qualities': [quality['id']],
                    'action_items': [
                        "Set a stretch goal for this quality",
                        "Share your progress with someone",
                        "Start a more challenging practice"
                    ],
                    'priority': 8
                }).execute()
                insights_created.append(insight.data[0] if insight.data else None)
        
        # Recommendation: Suggest focus on weakest quality
        weakest = min(qualities, key=lambda q: q['strength'])
        if weakest['strength'] < 30:
            insight = supabase.table('identity_insights').insert({
                'user_id': user_id,
                'insight_type': 'recommendation',
                'title': f"Focus area: {weakest['quality_name']}",
                'content': f"Your {weakest['quality_name']} quality is at {weakest['strength']:.1f}% strength. This represents your biggest growth opportunity.",
                'related_qualities': [weakest['id']],
                'action_items': [
                    f"Start a 7-day {weakest['quality_name']} challenge",
                    "Set daily reminders for practice",
                    "Find resources about developing this quality"
                ],
                'priority': 9
            }).execute()
            insights_created.append(insight.data[0] if insight.data else None)
        
        return {
            "message": f"Generated {len([i for i in insights_created if i])} insights",
            "insights": [{"title": i['title'], "type": i['insight_type']} for i in insights_created if i]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))