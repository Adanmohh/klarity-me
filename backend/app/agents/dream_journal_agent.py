"""
Dream Journal Integration - AI Agent for processing morning thoughts
Extracts actionable tasks from voice notes and dreams
"""

try:
    from swarm import Swarm, Agent
except ImportError:
    # Use mock implementation if Swarm is not available
    from app.agents.swarm_mock import Swarm, Agent
from typing import Dict, List, Any
import json
from datetime import datetime
from openai import OpenAI
import re

# Initialize clients
swarm_client = Swarm()

# Initialize OpenAI client (will use mock if no API key)
try:
    openai_client = OpenAI()
except Exception:
    # Create a mock client if OpenAI API key is not available
    openai_client = None

class DreamJournalProcessor:
    """Processes dream journal entries and morning thoughts into actionable tasks"""
    
    def __init__(self):
        self.task_extractor_agent = Agent(
            name="Task Extractor",
            instructions="""You are an expert at extracting actionable tasks from stream-of-consciousness text.
            
            Your job is to:
            1. Identify concrete actions mentioned in dreams or morning thoughts
            2. Extract worries/anxieties and convert them to preventive tasks
            3. Recognize patterns and recurring themes
            4. Suggest time estimates based on task complexity
            
            For each task found, determine:
            - Title (clear, actionable)
            - Description (context from the dream/thought)
            - Priority (based on emotional intensity)
            - Estimated time (10, 15, or 30 minutes)
            - Category (personal, work, creative, health)
            """,
            functions=[self.extract_tasks, self.analyze_emotions]
        )
        
        self.context_enricher_agent = Agent(
            name="Context Enricher",
            instructions="""You add context and make tasks more actionable.
            
            Transform vague ideas into concrete steps:
            - "worried about presentation" → "Practice presentation opening for 15 minutes"
            - "need to call mom" → "Schedule 30-min call with mom about weekend plans"
            - "that project idea" → "Draft initial outline for [specific project]"
            
            You also identify dependencies and suggest task ordering.
            """,
            functions=[self.enrich_task, self.suggest_time_slot]
        )
    
    def extract_tasks(self, journal_text: str) -> Dict[str, Any]:
        """Extract actionable tasks from journal text"""
        
        # Use GPT to analyze the text if available, otherwise use mock
        if openai_client is None:
            # Mock response when OpenAI is not available
            return {
                "tasks": [
                    {
                        "title": "Process journal entry",
                        "context": journal_text[:100],
                        "category": "personal",
                        "time_estimate": 15,
                        "confidence": 0.8
                    }
                ],
                "themes": ["personal"],
                "emotional_tone": "neutral"
            }
        
        response = openai_client.chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": "Extract actionable tasks from this morning journal entry. Focus on worries, ideas, and commitments."
                },
                {
                    "role": "user",
                    "content": journal_text
                }
            ],
            response_format={"type": "json_object"},
            temperature=0.7
        )
        
        tasks_data = json.loads(response.choices[0].message.content)
        
        # Parse and structure tasks
        tasks = []
        for item in tasks_data.get("tasks", []):
            task = {
                "title": item.get("title"),
                "description": item.get("context", ""),
                "priority": self._calculate_priority(item),
                "estimated_minutes": item.get("time_estimate", 15),
                "category": item.get("category", "personal"),
                "source": "dream_journal",
                "extracted_from": journal_text[:100] + "...",
                "confidence": item.get("confidence", 0.8)
            }
            tasks.append(task)
        
        return {
            "tasks": tasks,
            "themes": tasks_data.get("recurring_themes", []),
            "emotional_tone": tasks_data.get("emotional_tone", "neutral")
        }
    
    def analyze_emotions(self, journal_text: str) -> Dict[str, Any]:
        """Analyze emotional content to prioritize tasks"""
        
        emotions = {
            "anxiety_level": self._detect_anxiety(journal_text),
            "excitement_level": self._detect_excitement(journal_text),
            "urgency_markers": self._find_urgency_markers(journal_text)
        }
        
        # Suggest focus mode based on emotional state
        if emotions["anxiety_level"] > 0.7:
            suggestion = "High anxiety detected. Suggesting calming 10-minute tasks first."
        elif emotions["excitement_level"] > 0.7:
            suggestion = "High energy detected. Good time for creative or challenging tasks."
        else:
            suggestion = "Balanced emotional state. Follow normal priority order."
        
        return {
            "emotions": emotions,
            "suggestion": suggestion,
            "recommended_first_task": self._recommend_first_task(emotions)
        }
    
    def enrich_task(self, task: Dict[str, Any], context_variables: Dict) -> Dict[str, Any]:
        """Enrich task with additional context and make it more actionable"""
        
        # Access user's calendar and past patterns from context
        user_patterns = context_variables.get("user_patterns", {})
        calendar = context_variables.get("calendar", [])
        
        enriched = task.copy()
        
        # Make title more specific
        enriched["title"] = self._make_actionable(task["title"])
        
        # Add smart scheduling
        enriched["suggested_time"] = self._find_best_time_slot(
            task, calendar, user_patterns
        )
        
        # Add motivation based on past completions
        if task["category"] in user_patterns.get("successful_categories", []):
            enriched["motivation"] = f"You usually excel at {task['category']} tasks!"
        
        return enriched
    
    def suggest_time_slot(self, task: Dict, context_variables: Dict) -> str:
        """Suggest optimal time slot based on user patterns"""
        
        patterns = context_variables.get("user_patterns", {})
        energy_levels = patterns.get("energy_by_hour", {})
        
        if task["priority"] == "high" and task["estimated_minutes"] > 20:
            # Schedule important tasks during peak hours
            peak_hours = [h for h, e in energy_levels.items() if e > 0.8]
            if peak_hours:
                return f"Best time: {peak_hours[0]}:00"
        
        return "Flexible - any time today"
    
    # Helper methods
    def _calculate_priority(self, task_item: Dict) -> str:
        keywords_high = ["urgent", "important", "deadline", "worried", "anxiety"]
        keywords_low = ["maybe", "someday", "would be nice", "eventually"]
        
        text = (task_item.get("title", "") + " " + task_item.get("context", "")).lower()
        
        if any(word in text for word in keywords_high):
            return "high"
        elif any(word in text for word in keywords_low):
            return "low"
        return "medium"
    
    def _detect_anxiety(self, text: str) -> float:
        anxiety_words = ["worried", "anxious", "stressed", "nervous", "afraid", "concerned"]
        count = sum(1 for word in anxiety_words if word in text.lower())
        return min(count / 3.0, 1.0)  # Normalize to 0-1
    
    def _detect_excitement(self, text: str) -> float:
        excitement_words = ["excited", "amazing", "great idea", "can't wait", "awesome"]
        count = sum(1 for word in excitement_words if word in text.lower())
        return min(count / 3.0, 1.0)
    
    def _find_urgency_markers(self, text: str) -> List[str]:
        markers = []
        if "today" in text.lower():
            markers.append("today")
        if "asap" in text.lower() or "urgent" in text.lower():
            markers.append("urgent")
        if re.search(r'\d{1,2}:\d{2}', text):  # Time mentioned
            markers.append("specific_time")
        return markers
    
    def _make_actionable(self, title: str) -> str:
        """Convert vague titles to actionable ones"""
        
        vague_to_actionable = {
            "presentation": "Practice presentation opening for 15 minutes",
            "email": "Draft and send email to",
            "call": "Schedule 30-minute call with",
            "meeting": "Prepare agenda for meeting about",
            "project": "Complete next milestone for",
            "workout": "Complete 30-minute workout routine",
            "meditation": "10-minute morning meditation session"
        }
        
        for vague, actionable in vague_to_actionable.items():
            if vague in title.lower() and not any(
                action_word in title.lower() 
                for action_word in ["practice", "draft", "schedule", "complete", "prepare"]
            ):
                return actionable + " " + title
        
        return title
    
    def _find_best_time_slot(self, task: Dict, calendar: List, patterns: Dict) -> str:
        """Find optimal time slot for task"""
        
        # This would integrate with actual calendar
        # For now, return smart suggestions
        
        if task["category"] == "creative":
            return "Morning (9-11 AM) - Your creative peak"
        elif task["category"] == "work" and task["priority"] == "high":
            return "First thing (9 AM) - Tackle while fresh"
        elif task["estimated_minutes"] <= 10:
            return "Between meetings - Quick win opportunity"
        else:
            return "Afternoon block (2-4 PM)"
    
    async def process_journal_entry(self, 
                                   voice_note_text: str,
                                   user_context: Dict = None) -> Dict[str, Any]:
        """Main entry point for processing dream journal"""
        
        context_variables = user_context or {
            "user_patterns": {
                "peak_hours": [9, 10, 14, 15],
                "successful_categories": ["creative", "work"],
                "energy_by_hour": {9: 0.9, 10: 0.95, 14: 0.8, 15: 0.75}
            },
            "calendar": [],
            "date": datetime.now().isoformat()
        }
        
        # Step 1: Extract tasks using first agent
        extraction_result = swarm_client.run(
            agent=self.task_extractor_agent,
            messages=[{
                "role": "user",
                "content": f"Process this morning journal entry: {voice_note_text}"
            }],
            context_variables=context_variables
        )
        
        # Step 2: Enrich tasks using second agent
        tasks = extraction_result.context_variables.get("tasks", [])
        enriched_tasks = []
        
        for task in tasks:
            enrichment_result = swarm_client.run(
                agent=self.context_enricher_agent,
                messages=[{
                    "role": "user",
                    "content": f"Enrich this task: {json.dumps(task)}"
                }],
                context_variables={**context_variables, "task": task}
            )
            enriched_tasks.append(enrichment_result.context_variables.get("enriched_task", task))
        
        # Step 3: Generate morning briefing
        briefing = self._generate_morning_briefing(enriched_tasks, extraction_result.context_variables)
        
        return {
            "tasks": enriched_tasks,
            "briefing": briefing,
            "themes": extraction_result.context_variables.get("themes", []),
            "emotional_analysis": extraction_result.context_variables.get("emotions", {}),
            "processed_at": datetime.now().isoformat()
        }
    
    def _generate_morning_briefing(self, tasks: List[Dict], context: Dict) -> str:
        """Generate a motivating morning briefing"""
        
        briefing = f"Good morning! I've extracted {len(tasks)} actionable items from your thoughts.\n\n"
        
        if context.get("emotional_tone") == "anxious":
            briefing += "I noticed some anxiety in your journal. Let's tackle these one step at a time.\n\n"
        elif context.get("emotional_tone") == "excited":
            briefing += "You're feeling energized! Let's channel that into productive action.\n\n"
        
        if tasks:
            high_priority = [t for t in tasks if t.get("priority") == "high"]
            if high_priority:
                briefing += f"🎯 Focus first on: {high_priority[0]['title']}\n"
            
            quick_wins = [t for t in tasks if t.get("estimated_minutes", 30) <= 10]
            if quick_wins:
                briefing += f"⚡ Quick wins available: {len(quick_wins)} tasks under 10 minutes\n"
        
        themes = context.get("themes", [])
        if themes:
            briefing += f"\n📝 Recurring themes: {', '.join(themes)}"
        
        return briefing


# Integration function for FastAPI
async def process_dream_journal(journal_text: str, 
                               user_id: str = None,
                               generate_audio: bool = False) -> Dict[str, Any]:
    """FastAPI endpoint integration with optional voice generation"""
    
    processor = DreamJournalProcessor()
    
    # Get user context from database (if available)
    user_context = {
        "user_id": user_id,
        "user_patterns": {
            # This would come from analyzing user's historical data
            "peak_hours": [9, 10, 14, 15],
            "successful_categories": ["creative", "work"]
        }
    }
    
    result = await processor.process_journal_entry(journal_text, user_context)
    
    # Optionally generate audio briefing
    audio_data = None
    if generate_audio:
        from app.agents.dream_journal_voice import DreamJournalVoice
        voice_processor = DreamJournalVoice()
        
        # Generate audio for morning briefing
        emotional_tone = result.get("emotional_analysis", {}).get("emotional_tone", "neutral")
        audio_result = await voice_processor.generate_morning_briefing_audio(
            result["briefing"],
            emotional_tone
        )
        
        if audio_result["success"]:
            audio_data = {
                "audio_base64": audio_result["audio_base64"],
                "audio_format": audio_result["audio_format"],
                "voice_mood": audio_result["mood"]
            }
    
    return {
        "success": True,
        "data": result,
        "audio": audio_data,
        "message": "Dream journal processed successfully"
    }

async def process_voice_journal(audio_data: bytes,
                               audio_format: str = "mp3",
                               user_id: str = None,
                               generate_audio_response: bool = True) -> Dict[str, Any]:
    """Process voice journal entry with transcription and audio response"""
    
    from app.agents.dream_journal_voice import DreamJournalVoice
    voice_processor = DreamJournalVoice()
    
    # Step 1: Transcribe voice note
    transcription_result = await voice_processor.transcribe_voice_note(audio_data, audio_format)
    
    if not transcription_result["success"]:
        return {
            "success": False,
            "message": "Failed to transcribe voice note",
            "error": transcription_result.get("error")
        }
    
    # Step 2: Process transcribed text through dream journal
    journal_text = transcription_result["transcribed_text"]
    result = await process_dream_journal(journal_text, user_id, generate_audio_response)
    
    # Add transcription info to result
    result["transcription"] = {
        "text": journal_text,
        "confidence": transcription_result.get("confidence", 0)
    }
    
    return result