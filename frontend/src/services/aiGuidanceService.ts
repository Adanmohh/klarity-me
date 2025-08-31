/**
 * AI Guidance Service
 * Handles communication with the agentic RAG backend for personalized guidance
 */

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface PersonalityTraits {
  discipline: number;
  creativity: number;
  empathy: number;
  analytical: number;
  intuitive: number;
}

interface Habit {
  name: string;
  frequency: string;
  status: string;
  completion_rate?: number;
  start_date?: string;
}

interface ManifestationTarget {
  description: string;
  timeline: string;
  priority: string;
  progress?: number;
}

interface UserProfile {
  user_id: string;
  goals: string[];
  current_habits: Habit[];
  manifestation_targets: ManifestationTarget[];
  personality_traits: PersonalityTraits;
  learning_preferences: Record<string, any>;
}

interface GuidanceResponse {
  user_id: string;
  guidance_type: string;
  guidance: string;
  confidence: number;
  personalization_score: number;
  actionable_steps: string[];
  follow_up_suggestions: string[];
  sources: Array<{
    title: string;
    author: string;
    source: string;
  }>;
  metadata: Record<string, any>;
}

interface ChatResponse {
  user_id: string;
  response: ChatMessage;
  confidence: number;
  actionable_steps: string[];
  follow_up_suggestions: string[];
  sources: Array<{
    title: string;
    author: string;
    source: string;
  }>;
}

interface DailyInsight {
  guidance_text: string;
  actionable_steps: string[];
  follow_up_suggestions: string[];
  confidence: number;
  personalization_score: number;
}

interface DailyInsights {
  daily_wisdom: DailyInsight;
  habit_optimization: DailyInsight;
  pattern_analysis: DailyInsight;
}

interface SuccessAnalysis {
  goal_completion_rate: number;
  habit_consistency: Record<string, number>;
  growth_trajectory: {
    trend: string;
    acceleration: number;
    projected_milestone_dates: Record<string, string>;
  };
  success_predictions: {
    '30_day_success_probability': number;
    '90_day_success_probability': number;
    key_success_factors: string[];
    potential_obstacles: string[];
  };
  recommended_actions: string[];
}

interface GuidanceType {
  value: string;
  name: string;
  description: string;
}

class AIGuidanceService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}/api/v1/ai-coach${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  /**
   * Check if the AI Coach service is healthy
   */
  async healthCheck(): Promise<{ status: string; service: string; has_knowledge_base: boolean }> {
    return this.request('/health');
  }

  /**
   * Initialize the knowledge base
   */
  async initializeKnowledgeBase(forceReinitialize = false): Promise<{ status: string; message: string }> {
    return this.request('/initialize-knowledge', {
      method: 'POST',
      body: JSON.stringify({ force_reinitialize: forceReinitialize }),
    });
  }

  /**
   * Create or update user profile
   */
  async createOrUpdateUserProfile(profile: UserProfile): Promise<{ status: string; message: string; user_id: string }> {
    return this.request('/user-profile', {
      method: 'POST',
      body: JSON.stringify(profile),
    });
  }

  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<UserProfile> {
    return this.request(`/user-profile/${userId}`);
  }

  /**
   * Get personalized guidance based on type
   */
  async getPersonalizedGuidance(
    userId: string, 
    guidanceType: string, 
    specificQuery?: string,
    context?: Record<string, any>
  ): Promise<GuidanceResponse> {
    return this.request('/guidance', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        guidance_type: guidanceType,
        specific_query: specificQuery,
        context: context,
      }),
    });
  }

  /**
   * Chat with the AI Coach
   */
  async chatWithCoach(
    userId: string, 
    message: string, 
    conversationHistory: ChatMessage[] = [],
    context?: Record<string, any>
  ): Promise<ChatResponse> {
    return this.request('/chat', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        message,
        conversation_history: conversationHistory,
        context,
      }),
    });
  }

  /**
   * Get daily insights for a user
   */
  async getDailyInsights(userId: string): Promise<DailyInsights> {
    const response = await this.request<{ insights: DailyInsights }>(`/daily-insights/${userId}`);
    return response.insights;
  }

  /**
   * Analyze user's success patterns
   */
  async analyzeSuccessPatterns(userId: string): Promise<SuccessAnalysis> {
    const response = await this.request<{ analysis: SuccessAnalysis }>(`/success-analysis/${userId}`);
    return response.analysis;
  }

  /**
   * Get available guidance types
   */
  async getGuidanceTypes(): Promise<GuidanceType[]> {
    const response = await this.request<{ guidance_types: GuidanceType[] }>('/guidance-types');
    return response.guidance_types;
  }

  /**
   * Provide feedback on guidance
   */
  async provideFeedback(
    userId: string,
    wasHelpful: boolean,
    rating: number,
    feedback?: string,
    guidanceId?: string
  ): Promise<{ status: string; message: string }> {
    const params = new URLSearchParams({
      user_id: userId,
      rating: rating.toString(),
      was_helpful: wasHelpful.toString(),
    });

    if (feedback) params.append('feedback', feedback);
    if (guidanceId) params.append('guidance_id', guidanceId);

    return this.request(`/feedback?${params}`, {
      method: 'POST',
    });
  }

  /**
   * Get service statistics
   */
  async getServiceStats(): Promise<{
    total_users: number;
    knowledge_base_initialized: boolean;
    service_uptime: string;
  }> {
    return this.request('/stats');
  }

  /**
   * Helper method to create a basic user profile from identity data
   */
  createUserProfileFromIdentity(
    userId: string,
    identityData: {
      goals?: string[];
      habits?: Array<{ name: string; frequency?: string; status?: string }>;
      manifestationTargets?: Array<{ description: string; timeline?: string; priority?: string }>;
      personalityTraits?: Partial<PersonalityTraits>;
    }
  ): UserProfile {
    const defaultTraits: PersonalityTraits = {
      discipline: 0.5,
      creativity: 0.5,
      empathy: 0.5,
      analytical: 0.5,
      intuitive: 0.5,
    };

    return {
      user_id: userId,
      goals: identityData.goals || [],
      current_habits: identityData.habits?.map(habit => ({
        name: habit.name,
        frequency: habit.frequency || 'daily',
        status: habit.status || 'active',
      })) || [],
      manifestation_targets: identityData.manifestationTargets?.map(target => ({
        description: target.description,
        timeline: target.timeline || '3 months',
        priority: target.priority || 'medium',
      })) || [],
      personality_traits: {
        ...defaultTraits,
        ...identityData.personalityTraits,
      },
      learning_preferences: {
        preferred_time: 'morning',
        content_style: 'practical',
        interaction_frequency: 'daily',
      },
    };
  }

  /**
   * Generate personality assessment questions
   */
  getPersonalityAssessmentQuestions(): Array<{
    trait: keyof PersonalityTraits;
    question: string;
    lowAnchor: string;
    highAnchor: string;
  }> {
    return [
      {
        trait: 'discipline',
        question: 'How would you describe your self-discipline?',
        lowAnchor: 'I struggle with consistency',
        highAnchor: 'I consistently follow through',
      },
      {
        trait: 'creativity',
        question: 'How creative and innovative are you?',
        lowAnchor: 'I prefer established methods',
        highAnchor: 'I love creative solutions',
      },
      {
        trait: 'empathy',
        question: 'How well do you understand others\' emotions?',
        lowAnchor: 'I focus on logic',
        highAnchor: 'I deeply feel others\' emotions',
      },
      {
        trait: 'analytical',
        question: 'How do you prefer to make decisions?',
        lowAnchor: 'I trust my intuition',
        highAnchor: 'I analyze all the data',
      },
      {
        trait: 'intuitive',
        question: 'How much do you trust your gut feelings?',
        lowAnchor: 'I need concrete evidence',
        highAnchor: 'I trust my inner knowing',
      },
    ];
  }

  /**
   * Get sample guidance for demonstration
   */
  getSampleGuidance(): {
    daily_wisdom: string;
    habit_optimization: string;
    success_prediction: string;
  } {
    return {
      daily_wisdom: "Your thoughts are the architects of your destiny. Today, choose thoughts that align with your highest vision of yourself. Remember Napoleon Hill's wisdom: 'Whatever the mind can conceive and believe, it can achieve.'",
      habit_optimization: "Focus on keystone habits - those small changes that create positive cascades in other areas of your life. Joseph Murphy taught that consistency in small practices programs the subconscious mind for success.",
      success_prediction: "Based on your patterns, you're 78% likely to achieve your 30-day goals. Your key success factors are consistency and mindset. Al-Ghazali reminds us: 'The disciplined soul finds peace regardless of external circumstances.'"
    };
  }
}

// Export singleton instance
export const aiGuidanceService = new AIGuidanceService();

// Export types for use in components
export type {
  UserProfile,
  GuidanceResponse,
  ChatResponse,
  ChatMessage,
  DailyInsights,
  DailyInsight,
  SuccessAnalysis,
  GuidanceType,
  PersonalityTraits,
  Habit,
  ManifestationTarget,
};