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
  title: string;
  card_id: string;
  lane: TaskLane;
  duration?: TaskDuration;
  status: DailyTaskStatus;
  position: number;
  created_at: string;
  updated_at?: string;
}

export interface CardWithTasks extends Card {
  focus_tasks: FocusTask[];
  daily_tasks: DailyTask[];
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