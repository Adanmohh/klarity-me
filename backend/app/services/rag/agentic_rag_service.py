"""Advanced Agentic RAG Service for Personalized Guidance"""

import os
import json
import logging
from typing import List, Dict, Any, Optional, Union
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
import numpy as np
from llama_index.core import (
    VectorStoreIndex, 
    Document, 
    StorageContext, 
    Settings,
    PromptTemplate
)
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.core.retrievers import VectorIndexRetriever
from llama_index.core.query_engine import RetrieverQueryEngine
from llama_index.core.postprocessor import SimilarityPostprocessor
import chromadb
from .gemini_client import GeminiRAGClient

logger = logging.getLogger(__name__)


class GuidanceType(Enum):
    DAILY_WISDOM = "daily_wisdom"
    HABIT_OPTIMIZATION = "habit_optimization"
    MANIFESTATION_INSIGHT = "manifestation_insight"
    SUCCESS_PREDICTION = "success_prediction"
    CUSTOM_AFFIRMATION = "custom_affirmation"
    PATTERN_ANALYSIS = "pattern_analysis"


@dataclass
class UserProfile:
    user_id: str
    goals: List[str]
    current_habits: List[Dict[str, Any]]
    manifestation_targets: List[Dict[str, Any]]
    personality_traits: Dict[str, float]
    success_patterns: Dict[str, Any]
    learning_preferences: Dict[str, Any]
    last_updated: datetime


@dataclass
class GuidanceRequest:
    user_profile: UserProfile
    guidance_type: GuidanceType
    context: Optional[Dict[str, Any]] = None
    specific_query: Optional[str] = None
    urgency: str = "normal"  # low, normal, high


@dataclass
class GuidanceResponse:
    guidance_text: str
    confidence: float
    sources: List[Dict[str, str]]
    actionable_steps: List[str]
    follow_up_suggestions: List[str]
    personalization_score: float
    metadata: Dict[str, Any]


class AgenticRAGService:
    """
    Advanced RAG service that provides personalized guidance based on:
    - User's habits, goals, and manifestation targets
    - Spiritual and psychological knowledge base
    - Learning patterns and feedback loops
    - Success prediction algorithms
    """
    
    def __init__(self, 
                 chroma_persist_dir: str = "./chroma_db",
                 gemini_api_key: Optional[str] = None):
        """
        Initialize the Agentic RAG Service
        
        Args:
            chroma_persist_dir: Directory to persist ChromaDB
            gemini_api_key: Google Gemini API key
        """
        self.chroma_persist_dir = chroma_persist_dir
        self.gemini_client = GeminiRAGClient(gemini_api_key)
        
        # Initialize ChromaDB
        self.chroma_client = chromadb.PersistentClient(path=chroma_persist_dir)
        
        # Initialize collections
        self.knowledge_collection = self._get_or_create_collection("knowledge_base")
        self.user_patterns_collection = self._get_or_create_collection("user_patterns")
        
        # Initialize vector store and index
        self.vector_store = ChromaVectorStore(chroma_collection=self.knowledge_collection)
        self.storage_context = StorageContext.from_defaults(vector_store=self.vector_store)
        
        # Will be set when documents are loaded
        self.index = None
        self.query_engine = None
        
        # User profiles cache
        self.user_profiles: Dict[str, UserProfile] = {}
        
        logger.info("Agentic RAG Service initialized")
    
    def _get_or_create_collection(self, name: str):
        """Get or create a ChromaDB collection"""
        try:
            return self.chroma_client.get_collection(name)
        except:
            return self.chroma_client.create_collection(name)
    
    def ingest_knowledge_documents(self, documents: List[Dict[str, str]]):
        """
        Ingest spiritual and psychological knowledge documents
        
        Args:
            documents: List of documents with 'text', 'title', 'author', 'source' keys
        """
        logger.info(f"Ingesting {len(documents)} knowledge documents")
        
        llama_docs = []
        for doc_data in documents:
            doc = Document(
                text=doc_data["text"],
                metadata={
                    "title": doc_data.get("title", "Unknown"),
                    "author": doc_data.get("author", "Unknown"),
                    "source": doc_data.get("source", "Unknown"),
                    "document_type": "knowledge",
                    "ingestion_date": datetime.now().isoformat()
                }
            )
            llama_docs.append(doc)
        
        # Create or update index
        if self.index is None:
            self.index = VectorStoreIndex.from_documents(
                llama_docs, 
                storage_context=self.storage_context
            )
        else:
            for doc in llama_docs:
                self.index.insert(doc)
        
        # Create query engine
        retriever = VectorIndexRetriever(
            index=self.index,
            similarity_top_k=5
        )
        
        self.query_engine = RetrieverQueryEngine(
            retriever=retriever,
            postprocessors=[SimilarityPostprocessor(similarity_cutoff=0.7)]
        )
        
        logger.info("Knowledge documents ingested successfully")
    
    def update_user_profile(self, user_profile: UserProfile):
        """Update user profile in memory and persistent storage"""
        user_profile.last_updated = datetime.now()
        self.user_profiles[user_profile.user_id] = user_profile
        
        # Store user patterns for learning
        self._store_user_patterns(user_profile)
    
    def _store_user_patterns(self, user_profile: UserProfile):
        """Store user patterns in vector database for similarity matching"""
        pattern_text = self._serialize_user_patterns(user_profile)
        
        # Store in ChromaDB for user pattern matching
        self.user_patterns_collection.upsert(
            documents=[pattern_text],
            metadatas=[{
                "user_id": user_profile.user_id,
                "goals": json.dumps(user_profile.goals),
                "trait_dominant": max(user_profile.personality_traits.items(), key=lambda x: x[1])[0],
                "last_updated": user_profile.last_updated.isoformat()
            }],
            ids=[f"user_pattern_{user_profile.user_id}"]
        )
    
    def _serialize_user_patterns(self, user_profile: UserProfile) -> str:
        """Convert user profile to searchable text"""
        patterns = []
        
        # Goals
        patterns.append(f"Goals: {', '.join(user_profile.goals)}")
        
        # Current habits
        habit_descriptions = []
        for habit in user_profile.current_habits:
            habit_descriptions.append(f"{habit.get('name', 'habit')} - {habit.get('frequency', 'daily')}")
        patterns.append(f"Current habits: {', '.join(habit_descriptions)}")
        
        # Manifestation targets
        manifestation_descriptions = []
        for target in user_profile.manifestation_targets:
            manifestation_descriptions.append(f"{target.get('description', 'goal')} - {target.get('timeline', 'ongoing')}")
        patterns.append(f"Manifestation targets: {', '.join(manifestation_descriptions)}")
        
        # Personality traits
        top_traits = sorted(user_profile.personality_traits.items(), key=lambda x: x[1], reverse=True)[:3]
        patterns.append(f"Top personality traits: {', '.join([f'{trait}: {score:.2f}' for trait, score in top_traits])}")
        
        return "\n".join(patterns)
    
    async def get_personalized_guidance(self, request: GuidanceRequest) -> GuidanceResponse:
        """
        Generate personalized guidance based on user profile and request type
        """
        logger.info(f"Generating {request.guidance_type.value} guidance for user {request.user_profile.user_id}")
        
        # Find similar users for pattern matching
        similar_patterns = self._find_similar_user_patterns(request.user_profile)
        
        # Retrieve relevant knowledge
        knowledge_context = await self._retrieve_relevant_knowledge(request)
        
        # Generate personalized guidance
        guidance_response = await self._generate_guidance(request, knowledge_context, similar_patterns)
        
        # Learn from the interaction
        self._record_interaction(request, guidance_response)
        
        return guidance_response
    
    def _find_similar_user_patterns(self, user_profile: UserProfile, top_k: int = 3) -> List[Dict[str, Any]]:
        """Find similar user patterns for collaborative insights"""
        query_text = self._serialize_user_patterns(user_profile)
        
        try:
            results = self.user_patterns_collection.query(
                query_texts=[query_text],
                n_results=top_k + 1,  # +1 to exclude self
                include=["documents", "metadatas"]
            )
            
            similar_patterns = []
            for i, (doc, metadata) in enumerate(zip(results["documents"][0], results["metadatas"][0])):
                # Skip self
                if metadata["user_id"] == user_profile.user_id:
                    continue
                
                similar_patterns.append({
                    "user_id": metadata["user_id"],
                    "patterns": doc,
                    "goals": json.loads(metadata["goals"]),
                    "dominant_trait": metadata["trait_dominant"]
                })
            
            return similar_patterns
        except Exception as e:
            logger.error(f"Error finding similar patterns: {e}")
            return []
    
    async def _retrieve_relevant_knowledge(self, request: GuidanceRequest) -> List[Dict[str, Any]]:
        """Retrieve relevant knowledge from the knowledge base"""
        if not self.query_engine:
            return []
        
        # Build query based on request type and user profile
        query = self._build_knowledge_query(request)
        
        try:
            response = self.query_engine.query(query)
            
            knowledge_context = []
            for node in response.source_nodes:
                knowledge_context.append({
                    "text": node.get_content(),
                    "metadata": node.metadata,
                    "score": node.score if hasattr(node, 'score') else 1.0
                })
            
            return knowledge_context
        except Exception as e:
            logger.error(f"Error retrieving knowledge: {e}")
            return []
    
    def _build_knowledge_query(self, request: GuidanceRequest) -> str:
        """Build an optimized query for knowledge retrieval"""
        user_profile = request.user_profile
        
        query_parts = []
        
        # Base query based on guidance type
        type_queries = {
            GuidanceType.DAILY_WISDOM: "daily wisdom inspiration motivation",
            GuidanceType.HABIT_OPTIMIZATION: "habit formation behavior change discipline",
            GuidanceType.MANIFESTATION_INSIGHT: "manifestation visualization subconscious programming",
            GuidanceType.SUCCESS_PREDICTION: "success patterns achievement goal attainment",
            GuidanceType.CUSTOM_AFFIRMATION: "affirmations positive thinking self-talk",
            GuidanceType.PATTERN_ANALYSIS: "behavior patterns self-awareness growth"
        }
        
        query_parts.append(type_queries.get(request.guidance_type, "personal development"))
        
        # Add user context
        if user_profile.goals:
            query_parts.append(f"goals: {' '.join(user_profile.goals[:3])}")
        
        # Add dominant personality trait
        if user_profile.personality_traits:
            dominant_trait = max(user_profile.personality_traits.items(), key=lambda x: x[1])[0]
            query_parts.append(f"personality: {dominant_trait}")
        
        # Add specific query if provided
        if request.specific_query:
            query_parts.append(request.specific_query)
        
        return " ".join(query_parts)
    
    async def _generate_guidance(self, 
                               request: GuidanceRequest, 
                               knowledge_context: List[Dict[str, Any]],
                               similar_patterns: List[Dict[str, Any]]) -> GuidanceResponse:
        """Generate personalized guidance using LLM"""
        
        # Build comprehensive prompt
        prompt = self._build_guidance_prompt(request, knowledge_context, similar_patterns)
        
        try:
            # Generate guidance
            guidance_text = self.gemini_client.complete(prompt)
            
            # Extract actionable steps and follow-up suggestions
            actionable_steps, follow_up_suggestions = self._extract_action_items(guidance_text)
            
            # Calculate personalization score
            personalization_score = self._calculate_personalization_score(
                request.user_profile, knowledge_context, similar_patterns
            )
            
            # Prepare sources
            sources = [
                {
                    "title": ctx["metadata"].get("title", "Unknown"),
                    "author": ctx["metadata"].get("author", "Unknown"),
                    "source": ctx["metadata"].get("source", "Unknown")
                }
                for ctx in knowledge_context
            ]
            
            return GuidanceResponse(
                guidance_text=guidance_text,
                confidence=0.85,  # This could be calculated based on retrieval scores
                sources=sources,
                actionable_steps=actionable_steps,
                follow_up_suggestions=follow_up_suggestions,
                personalization_score=personalization_score,
                metadata={
                    "guidance_type": request.guidance_type.value,
                    "user_id": request.user_profile.user_id,
                    "generated_at": datetime.now().isoformat(),
                    "similar_patterns_found": len(similar_patterns),
                    "knowledge_sources_used": len(knowledge_context)
                }
            )
            
        except Exception as e:
            logger.error(f"Error generating guidance: {e}")
            return GuidanceResponse(
                guidance_text="I apologize, but I'm unable to generate personalized guidance at this moment. Please try again later.",
                confidence=0.0,
                sources=[],
                actionable_steps=[],
                follow_up_suggestions=[],
                personalization_score=0.0,
                metadata={"error": str(e)}
            )
    
    def _build_guidance_prompt(self, 
                             request: GuidanceRequest,
                             knowledge_context: List[Dict[str, Any]],
                             similar_patterns: List[Dict[str, Any]]) -> str:
        """Build a comprehensive prompt for guidance generation"""
        
        user_profile = request.user_profile
        
        prompt_parts = [
            "You are an advanced AI coach specializing in personalized guidance based on the wisdom of Napoleon Hill, Joseph Murphy, and Al-Ghazali.",
            "",
            f"GUIDANCE TYPE: {request.guidance_type.value}",
            "",
            "USER PROFILE:",
        ]
        
        # User goals
        if user_profile.goals:
            prompt_parts.append(f"Goals: {', '.join(user_profile.goals)}")
        
        # Current habits
        if user_profile.current_habits:
            habits_desc = []
            for habit in user_profile.current_habits[:5]:  # Top 5 habits
                habits_desc.append(f"- {habit.get('name', 'habit')}: {habit.get('status', 'active')}")
            prompt_parts.append(f"Current Habits:\n" + "\n".join(habits_desc))
        
        # Manifestation targets
        if user_profile.manifestation_targets:
            targets_desc = []
            for target in user_profile.manifestation_targets[:3]:  # Top 3 targets
                targets_desc.append(f"- {target.get('description', 'goal')}: {target.get('timeline', 'ongoing')}")
            prompt_parts.append(f"Manifestation Targets:\n" + "\n".join(targets_desc))
        
        # Personality traits
        if user_profile.personality_traits:
            top_traits = sorted(user_profile.personality_traits.items(), key=lambda x: x[1], reverse=True)[:3]
            traits_desc = [f"{trait}: {score:.2f}" for trait, score in top_traits]
            prompt_parts.append(f"Top Personality Traits: {', '.join(traits_desc)}")
        
        # Specific query
        if request.specific_query:
            prompt_parts.append(f"Specific Question: {request.specific_query}")
        
        # Knowledge context
        if knowledge_context:
            prompt_parts.append("\nRELEVANT KNOWLEDGE:")
            for ctx in knowledge_context[:3]:  # Top 3 most relevant
                prompt_parts.append(f"From {ctx['metadata'].get('author', 'Unknown')}: {ctx['text'][:200]}...")
        
        # Similar user patterns
        if similar_patterns:
            prompt_parts.append("\nSIMILAR USER PATTERNS:")
            for pattern in similar_patterns[:2]:  # Top 2 similar patterns
                prompt_parts.append(f"Similar user goals: {', '.join(pattern['goals'][:3])}")
        
        prompt_parts.extend([
            "",
            "Please provide:",
            "1. Personalized guidance that combines insights from the three masters",
            "2. 3-5 specific, actionable steps",
            "3. 2-3 follow-up questions or suggestions",
            "",
            "Make the guidance deeply personal, practical, and inspiring.",
            "Format your response with clear sections for guidance, action steps, and follow-up suggestions."
        ])
        
        return "\n".join(prompt_parts)
    
    def _extract_action_items(self, guidance_text: str) -> tuple[List[str], List[str]]:
        """Extract actionable steps and follow-up suggestions from guidance text"""
        lines = guidance_text.split('\n')
        
        actionable_steps = []
        follow_up_suggestions = []
        
        current_section = None
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Detect sections
            if any(keyword in line.lower() for keyword in ['action', 'step', 'do', 'practice']):
                current_section = 'actions'
            elif any(keyword in line.lower() for keyword in ['follow', 'next', 'consider', 'explore']):
                current_section = 'followup'
            
            # Extract items
            if line.startswith(('1.', '2.', '3.', '4.', '5.', '-', '•')):
                if current_section == 'actions':
                    actionable_steps.append(line[2:].strip() if line[1:2] in '.-)' else line[1:].strip())
                elif current_section == 'followup':
                    follow_up_suggestions.append(line[2:].strip() if line[1:2] in '.-)' else line[1:].strip())
        
        # If no structured format found, use fallback extraction
        if not actionable_steps and not follow_up_suggestions:
            return self._fallback_extract_items(guidance_text)
        
        return actionable_steps[:5], follow_up_suggestions[:3]
    
    def _fallback_extract_items(self, text: str) -> tuple[List[str], List[str]]:
        """Fallback method to extract action items"""
        sentences = text.split('.')
        
        actionable_steps = []
        follow_up_suggestions = []
        
        for sentence in sentences:
            sentence = sentence.strip()
            if len(sentence) < 10:
                continue
            
            # Look for action-oriented sentences
            if any(word in sentence.lower() for word in ['start', 'begin', 'practice', 'do', 'create', 'write']):
                actionable_steps.append(sentence)
            elif any(word in sentence.lower() for word in ['consider', 'explore', 'reflect', 'think about']):
                follow_up_suggestions.append(sentence)
        
        return actionable_steps[:3], follow_up_suggestions[:2]
    
    def _calculate_personalization_score(self, 
                                       user_profile: UserProfile,
                                       knowledge_context: List[Dict[str, Any]],
                                       similar_patterns: List[Dict[str, Any]]) -> float:
        """Calculate how personalized the guidance is"""
        score = 0.0
        
        # Base score for having user profile
        if user_profile.goals:
            score += 0.2
        if user_profile.current_habits:
            score += 0.2
        if user_profile.personality_traits:
            score += 0.2
        
        # Bonus for knowledge context
        if knowledge_context:
            score += min(0.3, len(knowledge_context) * 0.1)
        
        # Bonus for similar patterns
        if similar_patterns:
            score += min(0.1, len(similar_patterns) * 0.05)
        
        return min(1.0, score)
    
    def _record_interaction(self, request: GuidanceRequest, response: GuidanceResponse):
        """Record interaction for learning and improvement"""
        interaction_data = {
            "user_id": request.user_profile.user_id,
            "guidance_type": request.guidance_type.value,
            "timestamp": datetime.now().isoformat(),
            "personalization_score": response.personalization_score,
            "confidence": response.confidence,
            "sources_count": len(response.sources),
            "actionable_steps_count": len(response.actionable_steps)
        }
        
        # Store interaction (you could save to database or log file)
        logger.info(f"Interaction recorded: {interaction_data}")
    
    async def provide_daily_insights(self, user_id: str) -> Dict[str, Any]:
        """Provide daily personalized insights for a user"""
        if user_id not in self.user_profiles:
            return {"error": "User profile not found"}
        
        user_profile = self.user_profiles[user_id]
        
        # Generate multiple types of guidance for daily insights
        insights = {}
        
        # Daily wisdom
        wisdom_request = GuidanceRequest(
            user_profile=user_profile,
            guidance_type=GuidanceType.DAILY_WISDOM
        )
        insights["daily_wisdom"] = await self.get_personalized_guidance(wisdom_request)
        
        # Habit optimization
        habit_request = GuidanceRequest(
            user_profile=user_profile,
            guidance_type=GuidanceType.HABIT_OPTIMIZATION
        )
        insights["habit_optimization"] = await self.get_personalized_guidance(habit_request)
        
        # Pattern analysis
        pattern_request = GuidanceRequest(
            user_profile=user_profile,
            guidance_type=GuidanceType.PATTERN_ANALYSIS
        )
        insights["pattern_analysis"] = await self.get_personalized_guidance(pattern_request)
        
        return insights
    
    def analyze_success_patterns(self, user_id: str) -> Dict[str, Any]:
        """Analyze user's success patterns and predict future success"""
        if user_id not in self.user_profiles:
            return {"error": "User profile not found"}
        
        user_profile = self.user_profiles[user_id]
        
        # Analyze patterns from user data
        analysis = {
            "goal_completion_rate": self._calculate_goal_completion_rate(user_profile),
            "habit_consistency": self._calculate_habit_consistency(user_profile),
            "growth_trajectory": self._analyze_growth_trajectory(user_profile),
            "success_predictions": self._generate_success_predictions(user_profile),
            "recommended_actions": self._recommend_optimization_actions(user_profile)
        }
        
        return analysis
    
    def _calculate_goal_completion_rate(self, user_profile: UserProfile) -> float:
        """Calculate user's goal completion rate"""
        # This would be calculated from historical data
        # For now, return a placeholder
        return 0.75
    
    def _calculate_habit_consistency(self, user_profile: UserProfile) -> Dict[str, float]:
        """Calculate consistency scores for each habit"""
        consistency_scores = {}
        for habit in user_profile.current_habits:
            # This would be calculated from tracking data
            consistency_scores[habit.get('name', 'habit')] = 0.8
        return consistency_scores
    
    def _analyze_growth_trajectory(self, user_profile: UserProfile) -> Dict[str, Any]:
        """Analyze user's growth trajectory"""
        return {
            "trend": "upward",
            "acceleration": 0.15,
            "projected_milestone_dates": {}
        }
    
    def _generate_success_predictions(self, user_profile: UserProfile) -> Dict[str, Any]:
        """Generate success predictions based on patterns"""
        return {
            "30_day_success_probability": 0.85,
            "90_day_success_probability": 0.72,
            "key_success_factors": ["consistency", "mindset", "environment"],
            "potential_obstacles": ["time management", "motivation dips"]
        }
    
    def _recommend_optimization_actions(self, user_profile: UserProfile) -> List[str]:
        """Recommend actions to optimize success"""
        return [
            "Focus on keystone habits that trigger positive cascades",
            "Implement morning routine for consistent day starts",
            "Create environment cues that support your goals"
        ]