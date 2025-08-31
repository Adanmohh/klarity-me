export interface User {
  id: string;
  email: string;
  full_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export enum CardStatus {
  ACTIVE = 'active',
  QUEUED = 'queued',
  ON_HOLD = 'on-hold',
  PAUSED = 'paused',
  COMPLETED = 'completed'
}

export interface Card {
  id: string;
  title: string;
  description?: string;
  position: number;
  status: CardStatus | string; // Allow string for now to handle backend responses
  pause_until?: string;
  last_worked_on?: string;
  sessions_count: number;
  where_left_off?: string;
  momentum_score: number;
  user_id: string;
  created_at: string;
  updated_at?: string;
}

export enum DailyTaskLane {
  CONTROLLER = 'controller',
  MAIN = 'main'
}

export enum TaskLane {
  CONTROLLER = 'controller',
  MAIN = 'main'
}

export enum TaskStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ARCHIVED = 'archived'
}

export interface FocusTask {
  id: string;
  title: string;
  description?: string;
  card_id: string;
  lane: TaskLane;
  status: TaskStatus;
  date?: string;
  tags: string[];
  position: number;
  created_at: string;
  updated_at?: string;
}

export enum TaskDuration {
  TEN_MIN = '10min',
  FIFTEEN_MIN = '15min',
  THIRTY_MIN = '30min'
}

export enum DailyTaskStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  ARCHIVED = 'archived'
}

export interface DailyTask {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  lane: DailyTaskLane;
  duration?: TaskDuration;
  status: DailyTaskStatus;
  position: number;
  created_at: string;
  updated_at?: string;
  completed_at?: string;
}

export interface CardWithTasks extends Card {
  focus_tasks: FocusTask[];
}

export interface AuthToken {
  access_token: string;
  token_type: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name?: string;
}

// Habits types
export enum HabitLane {
  BECOMING = 'becoming',
  I_AM = 'i_am'
}

export interface Habit {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  lane: HabitLane;
  target_frequency: number; // times per day
  current_streak: number;
  best_streak: number;
  total_completions: number;
  is_active: boolean;
  graduation_criteria?: any; // JSON object
  graduated_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface HabitCheckin {
  id: string;
  user_id: string;
  habit_id: string;
  checkin_date: string;
  notes?: string;
  mood_rating?: number; // 1-5
  created_at: string;
}

// Power Statements types
export interface PowerStatement {
  id: string;
  user_id: string;
  statement: string;
  category: string;
  affirmation_count: number;
  last_affirmed?: string;
  is_active: boolean;
  strength_rating: number; // 1-10
  created_at: string;
  updated_at?: string;
}

// Manifestations types
export interface Manifestation {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  visualization_notes?: string;
  target_date?: string;
  achieved: boolean;
  achieved_at?: string;
  achievement_notes?: string;
  energy_level: number; // 1-10
  belief_level: number; // 1-10
  tags: string[];
  created_at: string;
  updated_at?: string;
}

// Mind Journal types
export interface MindJournalEntry {
  id: string;
  user_id: string;
  title?: string;
  content: string;
  mood?: string;
  energy_level?: number; // 1-10
  gratitude_notes?: string;
  insights?: string;
  tomorrow_focus?: string;
  tags: string[];
  created_at: string;
  updated_at?: string;
}