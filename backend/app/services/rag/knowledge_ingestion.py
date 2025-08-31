"""Knowledge Ingestion System for RAG"""

import os
import json
import logging
from typing import List, Dict, Any
from datetime import datetime
from .agentic_rag_service import AgenticRAGService

logger = logging.getLogger(__name__)


class KnowledgeIngestionService:
    """Service to ingest spiritual and psychological knowledge into RAG system"""
    
    def __init__(self, rag_service: AgenticRAGService):
        self.rag_service = rag_service
    
    def ingest_foundational_knowledge(self):
        """Ingest foundational knowledge from the three masters"""
        documents = []
        
        # Napoleon Hill - Think and Grow Rich principles
        documents.extend(self._get_napoleon_hill_knowledge())
        
        # Joseph Murphy - Subconscious Mind principles
        documents.extend(self._get_joseph_murphy_knowledge())
        
        # Al-Ghazali - Spiritual wisdom
        documents.extend(self._get_al_ghazali_knowledge())
        
        # Modern psychology and neuroscience
        documents.extend(self._get_modern_psychology_knowledge())
        
        # Habit formation and behavior change
        documents.extend(self._get_habit_formation_knowledge())
        
        # Manifestation and visualization techniques
        documents.extend(self._get_manifestation_knowledge())
        
        logger.info(f"Ingesting {len(documents)} foundational knowledge documents")
        self.rag_service.ingest_knowledge_documents(documents)
        
        return len(documents)
    
    def _get_napoleon_hill_knowledge(self) -> List[Dict[str, str]]:
        """Get Napoleon Hill's key principles"""
        return [
            {
                "text": """Desire is the starting point of all achievement. Not a wish, not a hope, but a keen pulsating desire which transcends everything else. When you begin with desire, and base it on sound reasoning, you take the first step toward riches. Every person who wins in any undertaking must be willing to burn his ships and cut all sources of retreat. Only by doing so can one be sure of maintaining that state of mind known as a burning desire to win - essential to success.""",
                "title": "The Power of Burning Desire",
                "author": "Napoleon Hill",
                "source": "Think and Grow Rich"
            },
            {
                "text": """Faith is the head chemist of the mind. When faith is blended with the vibration of thought, the subconscious mind instantly picks up the vibration, translates it into its spiritual equivalent, and transmits it to Infinite Intelligence. Faith is a state of mind which you may develop by making affirmation or repeated instructions to your subconscious mind.""",
                "title": "Faith and Autosuggestion",
                "author": "Napoleon Hill",
                "source": "Think and Grow Rich"
            },
            {
                "text": """Organized planning is essential for transmuting desire into riches. You must have definite plans for carrying out your desire, and these plans must be backed by persistent action. Most people fail because they lack organized plans. The successful person always has a plan and follows it systematically.""",
                "title": "The Importance of Organized Planning",
                "author": "Napoleon Hill",
                "source": "Think and Grow Rich"
            },
            {
                "text": """Persistence is the direct result of habit. The mind absorbs and becomes part of daily experiences upon which it feeds. Fear is the chief reason for poverty. Fear is nothing more than a state of mind, which is subject to control and direction. Destroy fear and you will develop confidence.""",
                "title": "Persistence and Fear",
                "author": "Napoleon Hill",
                "source": "Think and Grow Rich"
            },
            {
                "text": """The Master Mind principle: No individual may have great power without availing himself of the Master Mind. The Master Mind consists of coordination of knowledge and effort, in a spirit of harmony, between two or more people, for the attainment of a definite purpose.""",
                "title": "The Master Mind Principle",
                "author": "Napoleon Hill",
                "source": "Think and Grow Rich"
            },
            {
                "text": """Definiteness of purpose is the starting point of all achievement. Without a purpose, nothing can be achieved. Your purpose must be definite, specific, and backed by intense desire. Write down your purpose and commit it to memory. Review it daily until it becomes an obsession.""",
                "title": "Definiteness of Purpose",
                "author": "Napoleon Hill",
                "source": "Think and Grow Rich"
            }
        ]
    
    def _get_joseph_murphy_knowledge(self) -> List[Dict[str, str]]:
        """Get Joseph Murphy's subconscious mind principles"""
        return [
            {
                "text": """Your subconscious mind works continuously, while you are awake and while you sleep. It never rests. It is always working for you. Your subconscious mind controls your heartbeat, your circulation, and regulates your digestion, assimilation, and elimination. It controls all the vital processes and functions of your body.""",
                "title": "The Function of the Subconscious Mind",
                "author": "Joseph Murphy",
                "source": "The Power of Your Subconscious Mind"
            },
            {
                "text": """Whatever you impress upon your subconscious mind, the latter will move heaven and earth to bring it to pass. You must, therefore, impress it with right ideas and constructive thoughts. The law of your subconscious mind works for good and bad ideas alike. This law, when applied in a negative way, is the cause of failure, frustration, and unhappiness.""",
                "title": "The Law of Subconscious Activity",
                "author": "Joseph Murphy",
                "source": "The Power of Your Subconscious Mind"
            },
            {
                "text": """As you sow in your subconscious mind, so shall you reap in your body and environment. Whatever your conscious mind assumes and believes to be true, your subconscious mind will accept and bring to pass. Believe in good fortune, divine guidance, right action, and all the blessings of life.""",
                "title": "The Power of Belief",
                "author": "Joseph Murphy",
                "source": "The Power of Your Subconscious Mind"
            },
            {
                "text": """Prior to sleep, turn over a specific request to your subconscious mind and prove its miraculous power to yourself. Whatever thought is impressed upon the subconscious mind, it will move heaven and earth to accomplish. The great secret is to feel the wish fulfilled and go to sleep with that feeling.""",
                "title": "Programming While You Sleep",
                "author": "Joseph Murphy",
                "source": "The Power of Your Subconscious Mind"
            },
            {
                "text": """Imagination is your most powerful faculty. When you imagine something vividly, your subconscious mind accepts it as real. Imagine the happy solution to your problem, feel the thrill of accomplishment, and what you imagine and feel will be experienced in reality.""",
                "title": "The Power of Imagination",
                "author": "Joseph Murphy",
                "source": "The Power of Your Subconscious Mind"
            },
            {
                "text": """The feeling of health produces health, the feeling of wealth produces wealth. How you feel is very important. Feeling is the secret. When you feel that you are healthy and wealthy, your subconscious mind will respond accordingly.""",
                "title": "Feeling is the Secret",
                "author": "Joseph Murphy",
                "source": "The Power of Your Subconscious Mind"
            }
        ]
    
    def _get_al_ghazali_knowledge(self) -> List[Dict[str, str]]:
        """Get Al-Ghazali's spiritual wisdom"""
        return [
            {
                "text": """Know that the world is a fleeting shadow and a passing cloud. Do not attach your heart to it, for attachment to the temporal brings sorrow. True happiness comes from inner purification and connection with the Divine. The heart that is purified reflects divine light.""",
                "title": "Detachment and Inner Purification",
                "author": "Al-Ghazali",
                "source": "The Alchemy of Happiness"
            },
            {
                "text": """The disciplining of the soul consists in purifying it from blameworthy qualities. This is accomplished through spiritual exercises, self-examination, and constant remembrance of the Divine. The soul that is disciplined finds peace and contentment regardless of external circumstances.""",
                "title": "Disciplining the Soul",
                "author": "Al-Ghazali",
                "source": "The Alchemy of Happiness"
            },
            {
                "text": """Knowledge without action is empty, and action without knowledge is blind. True knowledge is that which leads to right action and draws one closer to the Divine. The purpose of knowledge is to guide the soul toward its ultimate happiness.""",
                "title": "Knowledge and Action",
                "author": "Al-Ghazali",
                "source": "The Alchemy of Happiness"
            },
            {
                "text": """Patience in adversity is a sign of true faith. Every difficulty contains within it a blessing and a lesson. The soul that remains patient and grateful in all circumstances develops spiritual strength and wisdom.""",
                "title": "Patience and Gratitude",
                "author": "Al-Ghazali",
                "source": "The Alchemy of Happiness"
            },
            {
                "text": """The heart is like a mirror that can reflect divine light, but it must be polished through spiritual practices. Self-examination, repentance, and constant remembrance of the Divine remove the rust of sin and ignorance from the heart.""",
                "title": "Polishing the Heart",
                "author": "Al-Ghazali",
                "source": "The Alchemy of Happiness"
            },
            {
                "text": """True happiness is not found in the accumulation of worldly things but in the development of spiritual qualities such as compassion, wisdom, and inner peace. The soul that cultivates these qualities finds lasting contentment.""",
                "title": "True Happiness",
                "author": "Al-Ghazali",
                "source": "The Alchemy of Happiness"
            }
        ]
    
    def _get_modern_psychology_knowledge(self) -> List[Dict[str, str]]:
        """Get modern psychological insights"""
        return [
            {
                "text": """Neuroplasticity demonstrates that the brain can reorganize and form new neural connections throughout life. This means that habits, thought patterns, and behaviors can be changed through conscious effort and repetition. The key is consistency in practice and patience with the process.""",
                "title": "Neuroplasticity and Change",
                "author": "Modern Neuroscience",
                "source": "Brain Research"
            },
            {
                "text": """Flow state occurs when there is a perfect balance between challenge and skill level. In flow, self-consciousness disappears, time perception alters, and performance reaches its peak. Cultivating flow states leads to increased happiness and achievement.""",
                "title": "Flow State Psychology",
                "author": "Mihaly Csikszentmihalyi",
                "source": "Flow: The Psychology of Optimal Experience"
            },
            {
                "text": """Cognitive behavioral therapy shows that thoughts, feelings, and behaviors are interconnected. By changing negative thought patterns, we can influence our emotional state and behavior. This creates a positive feedback loop that reinforces mental well-being.""",
                "title": "Cognitive Behavioral Patterns",
                "author": "CBT Research",
                "source": "Cognitive Behavioral Therapy"
            },
            {
                "text": """Self-efficacy, the belief in one's ability to execute behaviors necessary to produce specific performance attainments, is a key factor in motivation and achievement. People with high self-efficacy set challenging goals and maintain strong commitment to them.""",
                "title": "Self-Efficacy and Achievement",
                "author": "Albert Bandura",
                "source": "Social Learning Theory"
            },
            {
                "text": """Positive psychology research shows that gratitude practices, acts of kindness, and focusing on strengths contribute more to happiness than external circumstances. Regular gratitude practice rewires the brain for positivity.""",
                "title": "Positive Psychology Interventions",
                "author": "Martin Seligman",
                "source": "Positive Psychology"
            }
        ]
    
    def _get_habit_formation_knowledge(self) -> List[Dict[str, str]]:
        """Get habit formation principles"""
        return [
            {
                "text": """Habits are formed through a neurological loop consisting of a cue, routine, and reward. To change a habit, identify the cue and reward, then substitute a new routine. The key is to keep the same cue and reward while changing only the routine.""",
                "title": "The Habit Loop",
                "author": "Charles Duhigg",
                "source": "The Power of Habit"
            },
            {
                "text": """Keystone habits are small changes that create a cascade of positive behaviors. Examples include regular exercise, making your bed, or keeping a journal. These habits create positive momentum that spills over into other areas of life.""",
                "title": "Keystone Habits",
                "author": "Charles Duhigg",
                "source": "The Power of Habit"
            },
            {
                "text": """The two-minute rule states that when starting a new habit, it should take less than two minutes to complete. This makes the habit so easy that you can't say no. Once established, you can gradually increase the complexity and duration.""",
                "title": "The Two-Minute Rule",
                "author": "James Clear",
                "source": "Atomic Habits"
            },
            {
                "text": """Environment design is crucial for habit formation. Make desired behaviors obvious and easy while making undesired behaviors invisible and difficult. Your environment should support your desired identity and behaviors.""",
                "title": "Environment and Habit Design",
                "author": "James Clear",
                "source": "Atomic Habits"
            },
            {
                "text": """Habit stacking involves linking a new habit to an existing habit. The formula is: 'After I [existing habit], I will [new habit].' This leverages the strength of established neural pathways to build new ones.""",
                "title": "Habit Stacking",
                "author": "James Clear",
                "source": "Atomic Habits"
            }
        ]
    
    def _get_manifestation_knowledge(self) -> List[Dict[str, str]]:
        """Get manifestation and visualization principles"""
        return [
            {
                "text": """Mental imagery activates the same neural pathways as actual experiences. When you visualize achieving your goals with vivid detail and emotion, your brain begins to treat it as reality. This creates motivation and helps identify opportunities.""",
                "title": "The Science of Visualization",
                "author": "Sports Psychology",
                "source": "Peak Performance Research"
            },
            {
                "text": """The reticular activating system (RAS) filters information based on what you focus on. When you clarify your goals and visualize them regularly, your RAS begins to notice opportunities and resources that align with those goals.""",
                "title": "Reticular Activating System",
                "author": "Neuroscience Research",
                "source": "Cognitive Neuroscience"
            },
            {
                "text": """Affirmations are most effective when they are specific, emotional, and believable. Instead of 'I am rich,' use 'I am grateful for the increasing financial opportunities that come my way.' The emotion and believability activate the subconscious mind.""",
                "title": "Effective Affirmations",
                "author": "Psychological Research",
                "source": "Self-Talk Studies"
            },
            {
                "text": """Vision boards work by combining visual imagery with emotional engagement. The process of creating a vision board clarifies goals, and regular viewing reinforces the desired outcomes in the subconscious mind.""",
                "title": "Vision Board Psychology",
                "author": "Visualization Research",
                "source": "Goal Achievement Studies"
            },
            {
                "text": """Acting 'as if' you have already achieved your goal creates a psychological state that supports manifestation. This involves adopting the thoughts, feelings, and behaviors of the person you want to become.""",
                "title": "Acting As If",
                "author": "Behavioral Psychology",
                "source": "Identity-Based Change"
            }
        ]


def initialize_knowledge_base(rag_service: AgenticRAGService) -> int:
    """Initialize the knowledge base with foundational documents"""
    ingestion_service = KnowledgeIngestionService(rag_service)
    return ingestion_service.ingest_foundational_knowledge()


# Additional knowledge that could be added based on user data and feedback
EXPANDABLE_KNOWLEDGE_CATEGORIES = {
    "meditation": [
        "mindfulness practices",
        "breathing techniques", 
        "body scan meditation",
        "loving-kindness meditation"
    ],
    "goal_setting": [
        "SMART goals",
        "vision creation",
        "milestone tracking",
        "obstacle anticipation"
    ],
    "emotional_intelligence": [
        "emotion regulation",
        "empathy development",
        "social skills",
        "self-awareness"
    ],
    "productivity": [
        "time management",
        "deep work principles",
        "energy management",
        "focus techniques"
    ],
    "relationships": [
        "communication skills",
        "conflict resolution",
        "building trust",
        "active listening"
    ]
}


def expand_knowledge_base(rag_service: AgenticRAGService, categories: List[str]):
    """Expand the knowledge base with additional categories"""
    # This could be implemented to add more specialized knowledge
    # based on user needs and interests
    pass