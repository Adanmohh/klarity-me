"""Google Gemini LLM Client for RAG System"""

import os
from typing import Optional
from llama_index.llms.gemini import Gemini
from llama_index.embeddings.gemini import GeminiEmbedding
from llama_index.core import Settings
import logging

logger = logging.getLogger(__name__)


class GeminiRAGClient:
    """
    Gemini client for RAG operations.
    Handles both LLM and embedding model initialization.
    """
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize Gemini client with API key.
        
        Args:
            api_key: Google API key. If not provided, will use GOOGLE_API_KEY env var.
        """
        self.api_key = api_key or os.environ.get("GOOGLE_API_KEY")
        
        if not self.api_key:
            raise ValueError(
                "Google API key not found. Please set GOOGLE_API_KEY environment variable "
                "or pass api_key parameter."
            )
        
        # Initialize LLM
        self.llm = Gemini(
            model="models/gemini-1.5-flash",
            api_key=self.api_key,
            temperature=0.7,
            max_tokens=2048
        )
        
        # Initialize Embedding Model
        self.embed_model = GeminiEmbedding(
            model_name="models/embedding-001",
            api_key=self.api_key
        )
        
        # Set as default for LlamaIndex
        Settings.llm = self.llm
        Settings.embed_model = self.embed_model
        
        logger.info("Gemini RAG Client initialized successfully")
    
    def complete(self, prompt: str) -> str:
        """
        Generate completion for a prompt.
        
        Args:
            prompt: Input prompt
            
        Returns:
            Generated text
        """
        try:
            response = self.llm.complete(prompt)
            return str(response)
        except Exception as e:
            logger.error(f"Error generating completion: {e}")
            raise
    
    def synthesize_wisdom(
        self, 
        query: str,
        hill_response: str,
        murphy_response: str,
        ghazali_response: str,
        context: Optional[dict] = None
    ) -> str:
        """
        Synthesize wisdom from three philosophical sources.
        
        Args:
            query: User's question
            hill_response: Napoleon Hill's perspective
            murphy_response: Joseph Murphy's perspective
            ghazali_response: Al-Ghazali's perspective
            context: Additional context
            
        Returns:
            Synthesized wisdom
        """
        synthesis_prompt = f"""
        You are a wisdom synthesizer combining insights from three great thinkers.
        
        Question: {query}
        {f"Context: {context}" if context else ""}
        
        Napoleon Hill (Think and Grow Rich) says:
        {hill_response}
        
        Dr. Joseph Murphy (Power of Your Subconscious Mind) says:
        {murphy_response}
        
        Imam Al-Ghazali (Alchemy of Happiness) says:
        {ghazali_response}
        
        Please synthesize these three perspectives into unified, practical wisdom.
        Focus on:
        1. Common themes across all three
        2. Complementary insights
        3. Practical application
        4. A balanced integration
        
        Keep the response concise and actionable.
        """
        
        return self.complete(synthesis_prompt)
    
    def generate_mantra(
        self,
        identity: str,
        style: str = "synthesis"
    ) -> str:
        """
        Generate a personalized mantra for identity reinforcement.
        
        Args:
            identity: The identity quality (e.g., "disciplined")
            style: Style of mantra ('hill', 'murphy', 'ghazali', or 'synthesis')
            
        Returns:
            Generated mantra
        """
        style_prompts = {
            "hill": f"""
            Create a mantra in Napoleon Hill's style for becoming more {identity}.
            Use his pattern: "I will [action] by [date] because [reason]"
            Make it powerful and action-oriented.
            """,
            
            "murphy": f"""
            Create a mantra in Dr. Joseph Murphy's style for becoming more {identity}.
            Use his pattern: "My subconscious mind now [result]"
            Focus on the feeling and assumption of already being.
            """,
            
            "ghazali": f"""
            Create a mantra in Al-Ghazali's style for becoming more {identity}.
            Focus on spiritual refinement and heart purification.
            Include elements of gratitude and divine connection.
            """,
            
            "synthesis": f"""
            Create a unified mantra for becoming more {identity}.
            Combine:
            - Hill's action and determination
            - Murphy's subconscious programming
            - Ghazali's spiritual depth
            Make it memorable and powerful.
            """
        }
        
        prompt = style_prompts.get(style, style_prompts["synthesis"])
        return self.complete(prompt)
    
    def generate_challenge(
        self,
        identity: str,
        difficulty: str = "beginner",
        user_context: Optional[dict] = None
    ) -> dict:
        """
        Generate a 7-day identity challenge.
        
        Args:
            identity: Target identity quality
            difficulty: Challenge difficulty level
            user_context: User's context and history
            
        Returns:
            Challenge structure with daily quests
        """
        prompt = f"""
        Create a 7-day progressive challenge for someone wanting to embody being more {identity}.
        Difficulty level: {difficulty}
        {f"User context: {user_context}" if user_context else ""}
        
        Draw inspiration from:
        - Napoleon Hill's principle of organized planning and persistence
        - Joseph Murphy's subconscious programming techniques
        - Al-Ghazali's spiritual practices and self-examination
        
        Structure the response as a JSON object with:
        {{
            "title": "Challenge title",
            "description": "Brief description",
            "daily_quests": [
                {{
                    "day": 1,
                    "title": "Quest title",
                    "description": "What to do",
                    "morning_practice": "Morning ritual",
                    "evening_reflection": "Evening practice",
                    "success_criteria": ["criterion 1", "criterion 2"],
                    "wisdom_quote": "Relevant quote from one of the three authors"
                }}
            ]
        }}
        
        Make each day build upon the previous, starting gentle and increasing in commitment.
        """
        
        response = self.complete(prompt)
        
        # Parse JSON response
        import json
        try:
            # Clean up response if needed
            if "```json" in response:
                response = response.split("```json")[1].split("```")[0]
            elif "```" in response:
                response = response.split("```")[1].split("```")[0]
            
            return json.loads(response)
        except json.JSONDecodeError:
            logger.error(f"Failed to parse challenge JSON: {response}")
            # Return a basic structure
            return {
                "title": f"7-Day {identity.title()} Challenge",
                "description": f"A progressive journey to embody being {identity}",
                "daily_quests": []
            }