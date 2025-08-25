"""
Mock implementation of Swarm for Dream Journal Agent
This provides the basic structure needed without the actual Swarm library
"""

from typing import Dict, Any, List, Callable
from dataclasses import dataclass

@dataclass
class Agent:
    """Mock Agent class for Swarm compatibility"""
    name: str
    instructions: str
    functions: List[Callable] = None
    
    def __post_init__(self):
        if self.functions is None:
            self.functions = []

class SwarmResult:
    """Mock result class for Swarm responses"""
    def __init__(self, context_variables: Dict[str, Any] = None):
        self.context_variables = context_variables or {}

class Swarm:
    """Mock Swarm client for Dream Journal Agent"""
    
    def run(self, agent: Agent, messages: List[Dict[str, str]], 
            context_variables: Dict[str, Any] = None) -> SwarmResult:
        """Mock run method that simulates Swarm execution"""
        
        # Simulate task extraction based on agent name
        if agent.name == "Task Extractor":
            # Mock task extraction response
            tasks = [
                {
                    "title": "Review presentation slides",
                    "context": "Prepare for tomorrow's meeting",
                    "category": "work",
                    "time_estimate": 30,
                    "confidence": 0.9
                }
            ]
            
            return SwarmResult({
                "tasks": tasks,
                "themes": ["work", "presentation"],
                "emotional_tone": "anxious",
                "emotions": {
                    "anxiety_level": 0.7,
                    "excitement_level": 0.3,
                    "urgency_markers": ["tomorrow"]
                }
            })
        
        elif agent.name == "Context Enricher":
            # Mock context enrichment response
            task = context_variables.get("task", {})
            enriched_task = {
                **task,
                "title": f"✓ {task.get('title', 'Task')}",
                "suggested_time": "9:00 AM - Your peak focus hour",
                "motivation": "You've got this!"
            }
            
            return SwarmResult({
                "enriched_task": enriched_task
            })
        
        # Default response
        return SwarmResult(context_variables)