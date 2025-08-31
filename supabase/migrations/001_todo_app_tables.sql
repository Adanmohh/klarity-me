-- TODO App Core Tables Migration
-- This migration creates all the core tables for the TODO application

-- Create enum types for the TODO app
CREATE TYPE card_status AS ENUM ('active', 'queued', 'on-hold', 'paused', 'completed');
CREATE TYPE task_lane AS ENUM ('controller', 'main');
CREATE TYPE daily_task_lane AS ENUM ('controller', 'main');
CREATE TYPE task_status AS ENUM ('pending', 'active', 'completed', 'archived');
CREATE TYPE daily_task_status AS ENUM ('pending', 'completed', 'archived');
CREATE TYPE task_duration AS ENUM ('10min', '15min', '30min');
CREATE TYPE habit_lane AS ENUM ('becoming', 'i_am');

-- Cards Table
CREATE TABLE cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    position INTEGER NOT NULL DEFAULT 0,
    status card_status DEFAULT 'active',
    pause_until TIMESTAMPTZ,
    last_worked_on TIMESTAMPTZ,
    sessions_count INTEGER DEFAULT 0,
    where_left_off TEXT,
    momentum_score DECIMAL(5,2) DEFAULT 0.0 CHECK (momentum_score >= 0 AND momentum_score <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    INDEX idx_cards_user_status (user_id, status),
    INDEX idx_cards_position (user_id, position)
);

-- Focus Tasks Table
CREATE TABLE focus_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    lane task_lane DEFAULT 'controller',
    status task_status DEFAULT 'pending',
    date DATE,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    INDEX idx_focus_tasks_card (card_id),
    INDEX idx_focus_tasks_user_status (user_id, status),
    INDEX idx_focus_tasks_lane (lane, status)
);

-- Daily Tasks Table
CREATE TABLE daily_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    lane daily_task_lane DEFAULT 'controller',
    duration task_duration,
    status daily_task_status DEFAULT 'pending',
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    INDEX idx_daily_tasks_user_status (user_id, status),
    INDEX idx_daily_tasks_date (user_id, created_at::date),
    INDEX idx_daily_tasks_lane (user_id, lane, status)
);

-- Habits Table
CREATE TABLE habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    lane habit_lane DEFAULT 'becoming',
    target_frequency INTEGER DEFAULT 1, -- times per day
    current_streak INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    total_completions INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    graduation_criteria JSONB, -- flexible criteria for graduating from "becoming" to "i_am"
    graduated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    INDEX idx_habits_user_lane (user_id, lane),
    INDEX idx_habits_active (user_id, is_active)
);

-- Habit Check-ins Table
CREATE TABLE habit_checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 5),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(habit_id, checkin_date),
    INDEX idx_habit_checkins_habit_date (habit_id, checkin_date),
    INDEX idx_habit_checkins_user (user_id, checkin_date)
);

-- Power Statements Table (Identity Affirmations)
CREATE TABLE power_statements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    statement TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'general',
    affirmation_count INTEGER DEFAULT 0,
    last_affirmed TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    strength_rating DECIMAL(3,1) DEFAULT 5.0 CHECK (strength_rating >= 1.0 AND strength_rating <= 10.0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    INDEX idx_power_statements_user_active (user_id, is_active),
    INDEX idx_power_statements_category (user_id, category)
);

-- Manifestations Journal Table
CREATE TABLE manifestations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    visualization_notes TEXT,
    target_date DATE,
    achieved BOOLEAN DEFAULT FALSE,
    achieved_at TIMESTAMPTZ,
    achievement_notes TEXT,
    energy_level INTEGER DEFAULT 5 CHECK (energy_level >= 1 AND energy_level <= 10),
    belief_level INTEGER DEFAULT 5 CHECK (belief_level >= 1 AND belief_level <= 10),
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    INDEX idx_manifestations_user_achieved (user_id, achieved),
    INDEX idx_manifestations_target_date (user_id, target_date)
);

-- Mind Journal Entries Table (for reflection and insights)
CREATE TABLE mind_journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    content TEXT NOT NULL,
    mood VARCHAR(50),
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
    gratitude_notes TEXT,
    insights TEXT,
    tomorrow_focus TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    INDEX idx_mind_journal_user_date (user_id, created_at::date)
);

-- Create updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at columns
CREATE TRIGGER update_cards_updated_at 
BEFORE UPDATE ON cards 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_focus_tasks_updated_at 
BEFORE UPDATE ON focus_tasks 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_tasks_updated_at 
BEFORE UPDATE ON daily_tasks 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_habits_updated_at 
BEFORE UPDATE ON habits 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_power_statements_updated_at 
BEFORE UPDATE ON power_statements 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_manifestations_updated_at 
BEFORE UPDATE ON manifestations 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mind_journal_entries_updated_at 
BEFORE UPDATE ON mind_journal_entries 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Functions for habit streak calculation
CREATE OR REPLACE FUNCTION update_habit_streak(p_habit_id UUID)
RETURNS VOID AS $$
DECLARE
    v_current_streak INTEGER := 0;
    v_check_date DATE := CURRENT_DATE;
    v_habit_record RECORD;
BEGIN
    -- Get habit info
    SELECT * INTO v_habit_record FROM habits WHERE id = p_habit_id;
    
    -- Calculate current streak by checking consecutive days backwards
    WHILE EXISTS (
        SELECT 1 FROM habit_checkins 
        WHERE habit_id = p_habit_id 
        AND checkin_date = v_check_date
    ) LOOP
        v_current_streak := v_current_streak + 1;
        v_check_date := v_check_date - INTERVAL '1 day';
    END LOOP;
    
    -- Update the habit
    UPDATE habits
    SET 
        current_streak = v_current_streak,
        best_streak = GREATEST(best_streak, v_current_streak),
        total_completions = (
            SELECT COUNT(*) FROM habit_checkins WHERE habit_id = p_habit_id
        )
    WHERE id = p_habit_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update habit streaks after check-in
CREATE OR REPLACE FUNCTION trigger_update_habit_streak()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_habit_streak(NEW.habit_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_habit_checkin_insert
AFTER INSERT ON habit_checkins
FOR EACH ROW EXECUTE FUNCTION trigger_update_habit_streak();

CREATE TRIGGER after_habit_checkin_delete
AFTER DELETE ON habit_checkins
FOR EACH ROW EXECUTE FUNCTION trigger_update_habit_streak();

-- Enable Row Level Security on all tables
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE power_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE manifestations ENABLE ROW LEVEL SECURITY;
ALTER TABLE mind_journal_entries ENABLE ROW LEVEL SECURITY;

-- Row Level Security Policies
-- Cards policies
CREATE POLICY "Users can view their own cards" 
ON cards FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cards" 
ON cards FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cards" 
ON cards FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cards" 
ON cards FOR DELETE 
USING (auth.uid() = user_id);

-- Focus tasks policies
CREATE POLICY "Users can view their own focus tasks" 
ON focus_tasks FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own focus tasks" 
ON focus_tasks FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own focus tasks" 
ON focus_tasks FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own focus tasks" 
ON focus_tasks FOR DELETE 
USING (auth.uid() = user_id);

-- Daily tasks policies
CREATE POLICY "Users can view their own daily tasks" 
ON daily_tasks FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own daily tasks" 
ON daily_tasks FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily tasks" 
ON daily_tasks FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily tasks" 
ON daily_tasks FOR DELETE 
USING (auth.uid() = user_id);

-- Habits policies
CREATE POLICY "Users can view their own habits" 
ON habits FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own habits" 
ON habits FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habits" 
ON habits FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habits" 
ON habits FOR DELETE 
USING (auth.uid() = user_id);

-- Habit check-ins policies
CREATE POLICY "Users can view their own habit checkins" 
ON habit_checkins FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own habit checkins" 
ON habit_checkins FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habit checkins" 
ON habit_checkins FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habit checkins" 
ON habit_checkins FOR DELETE 
USING (auth.uid() = user_id);

-- Power statements policies
CREATE POLICY "Users can view their own power statements" 
ON power_statements FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own power statements" 
ON power_statements FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own power statements" 
ON power_statements FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own power statements" 
ON power_statements FOR DELETE 
USING (auth.uid() = user_id);

-- Manifestations policies
CREATE POLICY "Users can view their own manifestations" 
ON manifestations FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own manifestations" 
ON manifestations FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own manifestations" 
ON manifestations FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own manifestations" 
ON manifestations FOR DELETE 
USING (auth.uid() = user_id);

-- Mind journal entries policies
CREATE POLICY "Users can view their own mind journal entries" 
ON mind_journal_entries FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mind journal entries" 
ON mind_journal_entries FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mind journal entries" 
ON mind_journal_entries FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mind journal entries" 
ON mind_journal_entries FOR DELETE 
USING (auth.uid() = user_id);

-- Set up Realtime for all tables
BEGIN;

-- Drop existing publication if it exists
DROP PUBLICATION IF EXISTS supabase_realtime;

-- Create new publication
CREATE PUBLICATION supabase_realtime;

COMMIT;

-- Add all tables to realtime
ALTER PUBLICATION supabase_realtime ADD TABLE cards;
ALTER PUBLICATION supabase_realtime ADD TABLE focus_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE daily_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE habits;
ALTER PUBLICATION supabase_realtime ADD TABLE habit_checkins;
ALTER PUBLICATION supabase_realtime ADD TABLE power_statements;
ALTER PUBLICATION supabase_realtime ADD TABLE manifestations;
ALTER PUBLICATION supabase_realtime ADD TABLE mind_journal_entries;