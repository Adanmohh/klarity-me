export interface IdentityQuality {
  id: number;
  user_id: string;
  quality_name: string;
  category: 'mindset' | 'behavior' | 'skill' | 'character' | 'spiritual';
  strength: number;
  evidence_count: number;
  last_evidence: string | null;
  growth_rate: number;
  created_at: string;
  updated_at?: string;
}

export interface IdentityEvidence {
  id: number;
  user_id: string;
  quality_id: number;
  evidence_type: 'task_completion' | 'habit_streak' | 'challenge_progress' | 'manual_entry' | 'ai_detected';
  action: string;
  description?: string;
  task_id?: number;
  habit_id?: number;
  challenge_id?: number;
  impact_score: number;
  created_at: string;
}

export interface IdentityChallenge {
  id: number;
  user_id: string;
  quality_target_id: number;
  title: string;
  description?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  daily_quests: DailyQuest[];
  wisdom_quotes?: WisdomQuote[];
  current_day: number;
  completed_days: number[];
  status: 'active' | 'completed' | 'paused' | 'abandoned';
  start_date: string;
  end_date?: string;
  completed_at?: string;
  xp_earned: number;
  badges_earned?: string[];
  created_at: string;
  updated_at?: string;
}

export interface DailyQuest {
  title: string;
  description?: string;
  tasks?: string[];
}

export interface WisdomQuote {
  quote: string;
  author: string;
  source?: string;
}

export interface GrowthEdge {
  quality_id: number;
  quality_name: string;
  strength: number;
  evidence_count: number;
  last_evidence: string | null;
  recommendation: string;
  suggested_actions: string[];
}

export interface IdentityInsight {
  id: number;
  user_id: string;
  insight_type: 'pattern' | 'recommendation' | 'milestone' | 'warning';
  title: string;
  content: string;
  related_qualities: number[];
  action_items: string[];
  priority: number;
  is_read: boolean;
  is_acted_upon: boolean;
  created_at: string;
  expires_at?: string;
}

export interface IdentityMilestone {
  id: number;
  user_id: string;
  quality_id: number;
  title: string;
  description?: string;
  milestone_type: 'level_up' | 'streak' | 'challenge_complete' | 'first_evidence';
  achievement_data?: any;
  xp_reward: number;
  badge_id?: string;
  achieved_at: string;
}