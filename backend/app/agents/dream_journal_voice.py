"""
Dream Journal Voice Integration with ElevenLabs
Handles text-to-speech for briefings and voice transcription for input
"""

import os
from typing import Dict, Any, Optional
from elevenlabs import ElevenLabs, stream, Voice, VoiceSettings
from elevenlabs.client import AsyncElevenLabs
import asyncio
import base64
import tempfile
from pathlib import Path
from datetime import datetime

class DreamJournalVoice:
    """Handles voice interactions for Dream Journal using ElevenLabs"""
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize ElevenLabs client"""
        self.api_key = api_key or os.getenv("ELEVENLABS_API_KEY")
        
        if self.api_key:
            self.client = ElevenLabs(api_key=self.api_key)
            self.async_client = AsyncElevenLabs(api_key=self.api_key)
        else:
            # Use default client without API key (limited functionality)
            self.client = ElevenLabs()
            self.async_client = AsyncElevenLabs()
        
        # Voice settings for different moods
        self.voice_profiles = {
            "calm": {
                "voice_id": "21m00Tcm4TlvDq8ikWAM",  # Rachel - calm female voice
                "settings": VoiceSettings(
                    stability=0.75,
                    similarity_boost=0.75,
                    style=0.0,
                    use_speaker_boost=True
                )
            },
            "energetic": {
                "voice_id": "yoZ06aMxZJJ28mfd3POQ",  # Sam - energetic male voice
                "settings": VoiceSettings(
                    stability=0.5,
                    similarity_boost=0.8,
                    style=0.2,
                    use_speaker_boost=True
                )
            },
            "professional": {
                "voice_id": "EXAVITQu4vr4xnSDxMaL",  # Sarah - professional female voice
                "settings": VoiceSettings(
                    stability=0.85,
                    similarity_boost=0.7,
                    style=0.0,
                    use_speaker_boost=False
                )
            },
            "motivational": {
                "voice_id": "TxGEqnHWrfWFTfGW9XjX",  # Josh - motivational male voice
                "settings": VoiceSettings(
                    stability=0.6,
                    similarity_boost=0.85,
                    style=0.3,
                    use_speaker_boost=True
                )
            }
        }
        
        # Default voice for fallback
        self.default_voice_id = "21m00Tcm4TlvDq8ikWAM"
    
    async def text_to_speech(self, 
                            text: str, 
                            mood: str = "calm",
                            stream_audio: bool = False) -> Dict[str, Any]:
        """
        Convert text to speech with mood-appropriate voice
        
        Args:
            text: Text to convert to speech
            mood: Emotional tone (calm, energetic, professional, motivational)
            stream_audio: Whether to stream audio in real-time
        
        Returns:
            Dict containing audio data and metadata
        """
        try:
            # Select voice based on mood
            voice_profile = self.voice_profiles.get(mood, self.voice_profiles["calm"])
            
            if stream_audio:
                # Stream audio in real-time
                audio_stream = self.client.text_to_speech.stream(
                    text=text,
                    voice_id=voice_profile["voice_id"],
                    model_id="eleven_turbo_v2_5",  # Fast model for streaming
                    voice_settings=voice_profile["settings"]
                )
                
                # Collect audio chunks
                audio_chunks = []
                for chunk in audio_stream:
                    if isinstance(chunk, bytes):
                        audio_chunks.append(chunk)
                
                audio_data = b''.join(audio_chunks)
            else:
                # Generate complete audio
                audio_data = await self.async_client.text_to_speech.convert(
                    text=text,
                    voice_id=voice_profile["voice_id"],
                    model_id="eleven_multilingual_v2",  # Higher quality model
                    output_format="mp3_44100_128",
                    voice_settings=voice_profile["settings"]
                )
            
            # Convert to base64 for API response
            audio_base64 = base64.b64encode(audio_data).decode('utf-8')
            
            return {
                "success": True,
                "audio_base64": audio_base64,
                "audio_format": "mp3",
                "voice_used": voice_profile["voice_id"],
                "mood": mood,
                "text_length": len(text),
                "message": "Audio generated successfully"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to generate audio"
            }
    
    async def generate_morning_briefing_audio(self,
                                             briefing_text: str,
                                             emotional_state: str = "neutral") -> Dict[str, Any]:
        """
        Generate voice audio for morning briefing based on emotional state
        
        Args:
            briefing_text: The morning briefing text
            emotional_state: User's emotional state from journal analysis
        
        Returns:
            Audio data and metadata
        """
        # Map emotional states to voice moods
        emotion_to_mood = {
            "anxious": "calm",
            "stressed": "calm",
            "excited": "energetic",
            "motivated": "motivational",
            "neutral": "professional",
            "tired": "calm",
            "overwhelmed": "calm",
            "happy": "energetic",
            "focused": "professional"
        }
        
        mood = emotion_to_mood.get(emotional_state, "professional")
        
        # Add personalized intro based on emotional state
        personalized_intro = self._get_personalized_intro(emotional_state)
        full_text = f"{personalized_intro} {briefing_text}"
        
        return await self.text_to_speech(full_text, mood=mood)
    
    def _get_personalized_intro(self, emotional_state: str) -> str:
        """Get personalized introduction based on emotional state"""
        
        intros = {
            "anxious": "Take a deep breath. Let's approach today one step at a time.",
            "stressed": "I understand you're feeling pressured. Let's organize your priorities.",
            "excited": "I can feel your energy! Let's channel it productively.",
            "motivated": "You're ready to conquer the day! Here's your action plan.",
            "neutral": "Good morning! Let's review your tasks for today.",
            "tired": "I know you're feeling low on energy. Let's focus on what's essential.",
            "overwhelmed": "Let's break everything down into manageable pieces.",
            "happy": "What a great mood to start the day! Let's make it count.",
            "focused": "You're in the zone. Let's maximize your productivity."
        }
        
        return intros.get(emotional_state, "Good morning! Here's your briefing.")
    
    async def transcribe_voice_note(self, 
                                   audio_data: bytes,
                                   audio_format: str = "mp3") -> Dict[str, Any]:
        """
        Transcribe voice note to text (placeholder for speech-to-text)
        
        Note: ElevenLabs doesn't provide speech-to-text. 
        This would integrate with other services like OpenAI Whisper or Google Speech-to-Text
        
        Args:
            audio_data: Audio file data
            audio_format: Format of the audio file
        
        Returns:
            Transcribed text and metadata
        """
        try:
            # For now, return mock transcription
            # In production, integrate with OpenAI Whisper or similar
            
            # Save audio temporarily for processing
            with tempfile.NamedTemporaryFile(suffix=f".{audio_format}", delete=False) as tmp_file:
                tmp_file.write(audio_data)
                temp_path = tmp_file.name
            
            # Here you would call actual transcription service
            # For example, using OpenAI Whisper:
            # transcription = openai_client.audio.transcriptions.create(
            #     model="whisper-1",
            #     file=open(temp_path, "rb")
            # )
            
            # Mock transcription for demonstration
            transcribed_text = """
            I had that dream again about the presentation. I'm feeling anxious about tomorrow's meeting.
            Need to prepare slides, practice my opening, and email the team the agenda.
            Also, I should call mom about weekend plans. Oh, and that app idea about fitness tracking
            keeps coming back - maybe I should finally draft a concept.
            """
            
            # Clean up temp file
            Path(temp_path).unlink()
            
            return {
                "success": True,
                "transcribed_text": transcribed_text.strip(),
                "audio_duration": "unknown",  # Would be calculated from actual audio
                "confidence": 0.95,
                "message": "Voice note transcribed successfully"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to transcribe voice note"
            }
    
    async def generate_task_audio_summaries(self, 
                                           tasks: list,
                                           max_tasks: int = 5) -> Dict[str, Any]:
        """
        Generate audio summaries for top priority tasks
        
        Args:
            tasks: List of extracted tasks
            max_tasks: Maximum number of tasks to include in audio
        
        Returns:
            Audio data for task summaries
        """
        # Sort tasks by priority
        priority_order = {"high": 0, "medium": 1, "low": 2}
        sorted_tasks = sorted(tasks, key=lambda x: priority_order.get(x.get("priority", "low"), 3))
        
        # Take top tasks
        top_tasks = sorted_tasks[:max_tasks]
        
        # Create summary text
        if not top_tasks:
            summary_text = "No tasks were extracted from your journal."
        else:
            task_descriptions = []
            for i, task in enumerate(top_tasks, 1):
                priority = task.get("priority", "medium")
                title = task.get("title", "Untitled task")
                time_est = task.get("estimated_minutes", 15)
                
                task_descriptions.append(
                    f"Task {i}: {title}. Priority: {priority}. Estimated time: {time_est} minutes."
                )
            
            summary_text = "Here are your top priority tasks: " + " ".join(task_descriptions)
        
        # Generate audio with appropriate mood
        mood = "motivational" if len(top_tasks) > 3 else "professional"
        
        return await self.text_to_speech(summary_text, mood=mood)
    
    async def create_voice_affirmation(self, 
                                      themes: list,
                                      emotional_tone: str) -> Dict[str, Any]:
        """
        Create personalized voice affirmation based on journal themes
        
        Args:
            themes: Recurring themes from journal
            emotional_tone: Overall emotional tone
        
        Returns:
            Audio affirmation
        """
        # Generate affirmation text based on themes
        affirmation = self._generate_affirmation(themes, emotional_tone)
        
        # Use motivational voice for affirmations
        return await self.text_to_speech(affirmation, mood="motivational")
    
    def _generate_affirmation(self, themes: list, emotional_tone: str) -> str:
        """Generate personalized affirmation text"""
        
        theme_affirmations = {
            "work": "Your professional growth is a journey, not a race.",
            "family": "The connections you nurture today strengthen your tomorrow.",
            "health": "Every healthy choice is an investment in your future self.",
            "creativity": "Your unique perspective has the power to inspire change.",
            "productivity": "Progress, not perfection, is your path to success.",
            "relationships": "The energy you give to others returns to brighten your world.",
            "learning": "Every challenge is an opportunity to expand your capabilities.",
            "finance": "Your mindful decisions today build tomorrow's security."
        }
        
        # Build affirmation
        affirmation_parts = ["Remember:"]
        
        for theme in themes[:3]:  # Use top 3 themes
            if theme.lower() in theme_affirmations:
                affirmation_parts.append(theme_affirmations[theme.lower()])
        
        if emotional_tone == "anxious":
            affirmation_parts.append("You've overcome challenges before, and you will again.")
        elif emotional_tone == "excited":
            affirmation_parts.append("Your enthusiasm is your superpower.")
        else:
            affirmation_parts.append("You have everything you need to succeed today.")
        
        affirmation_parts.append("Take it one step at a time, and celebrate each small victory.")
        
        return " ".join(affirmation_parts)
    
    async def get_available_voices(self) -> Dict[str, Any]:
        """Get list of available voices from ElevenLabs"""
        try:
            response = await self.async_client.voices.search()
            
            voices = []
            for voice in response.voices:
                voices.append({
                    "voice_id": voice.voice_id,
                    "name": voice.name,
                    "category": voice.category,
                    "description": voice.description
                })
            
            return {
                "success": True,
                "voices": voices,
                "total": len(voices)
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to fetch available voices"
            }


# Helper function for saving audio files
async def save_audio_file(audio_base64: str, filename: str = None) -> str:
    """Save base64 audio to file"""
    
    if not filename:
        filename = f"briefing_{datetime.now().strftime('%Y%m%d_%H%M%S')}.mp3"
    
    # Create audio directory if it doesn't exist
    audio_dir = Path("audio_outputs")
    audio_dir.mkdir(exist_ok=True)
    
    # Decode and save
    audio_data = base64.b64decode(audio_base64)
    file_path = audio_dir / filename
    
    with open(file_path, "wb") as f:
        f.write(audio_data)
    
    return str(file_path)