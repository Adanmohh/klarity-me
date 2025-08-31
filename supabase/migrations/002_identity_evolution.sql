-- Identity Evolution System Tables

-- Create enum types
CREATE TYPE quality_category AS ENUM ('mindset', 'behavior', 'skill', 'character', 'spiritual');
CREATE TYPE evidence_type AS ENUM ('task_completion', 'habit_streak', 'challenge_progress', 'manual_entry', 'ai_detected');
CREATE TYPE challenge_status AS ENUM ('active', 'completed', 'paused', 'abandoned');
CREATE TYPE insight_type AS ENUM ('pattern', 'recommendation', 'milestone', 'warning');
CREATE TYPE milestone_type AS ENUM ('level_up', 'streak', 'challenge_complete', 'first_evidence');

-- Identity Qualities Table
CREATE TABLE identity_qualities (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    quality_name VARCHAR(100) NOT NULL,
    category quality_category DEFAULT 'character',
    strength DECIMAL(5,2) DEFAULT 0.0 CHECK (strength >= 0 AND strength <= 100),
    evidence_count INTEGER DEFAULT 0,
    last_evidence TIMESTAMPTZ,
    growth_rate DECIMAL(5,2) DEFAULT 0.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, quality_name)
);

-- Identity Evidence Table
CREATE TABLE identity_evidence (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    quality_id INTEGER NOT NULL REFERENCES identity_qualities(id) ON DELETE CASCADE,
    evidence_type evidence_type NOT NULL,
    task_id INTEGER REFERENCES focus_tasks(id) ON DELETE SET NULL,
    habit_id INTEGER, -- Will reference habits table when created
    challenge_id INTEGER, -- Will be self-referencing
    action VARCHAR(255) NOT NULL,
    description TEXT,
    impact_score DECIMAL(3,1) DEFAULT 1.0 CHECK (impact_score >= 0.5 AND impact_score <= 3.0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    INDEX idx_evidence_user (user_id),
    INDEX idx_evidence_quality (quality_id)
);

-- Identity Challenges Table
CREATE TABLE identity_challenges (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    quality_target_id INTEGER NOT NULL REFERENCES identity_qualities(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    difficulty VARCHAR(20) DEFAULT 'beginner',
    daily_quests JSONB NOT NULL DEFAULT '[]'::jsonb,
    wisdom_quotes JSONB DEFAULT '[]'::jsonb,
    current_day INTEGER DEFAULT 0,
    completed_days INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    status challenge_status DEFAULT 'active',
    start_date TIMESTAMPTZ DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    xp_earned INTEGER DEFAULT 0,
    badges_earned TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    INDEX idx_challenge_user_status (user_id, status)
);

-- Add foreign key for challenge_id in evidence table
ALTER TABLE identity_evidence 
ADD CONSTRAINT fk_evidence_challenge 
FOREIGN KEY (challenge_id) REFERENCES identity_challenges(id) ON DELETE SET NULL;

-- Identity Insights Table
CREATE TABLE identity_insights (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    insight_type insight_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    related_qualities INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    action_items TEXT[] DEFAULT ARRAY[]::TEXT[],
    priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
    is_read BOOLEAN DEFAULT FALSE,
    is_acted_upon BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    INDEX idx_insight_user_unread (user_id, is_read)
);

-- Identity Milestones Table
CREATE TABLE identity_milestones (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    quality_id INTEGER NOT NULL REFERENCES identity_qualities(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    milestone_type milestone_type NOT NULL,
    achievement_data JSONB,
    xp_reward INTEGER DEFAULT 0,
    badge_id VARCHAR(100),
    achieved_at TIMESTAMPTZ DEFAULT NOW(),
    INDEX idx_milestone_user (user_id)
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_identity_qualities_updated_at 
BEFORE UPDATE ON identity_qualities 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_identity_challenges_updated_at 
BEFORE UPDATE ON identity_challenges 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate and update growth rate
CREATE OR REPLACE FUNCTION calculate_quality_growth_rate(p_quality_id INTEGER)
RETURNS VOID AS $$
DECLARE
    v_week_ago TIMESTAMPTZ := NOW() - INTERVAL '7 days';
    v_evidence_count INTEGER;
    v_growth_rate DECIMAL(5,2);
BEGIN
    -- Count evidence from last week
    SELECT COUNT(*) INTO v_evidence_count
    FROM identity_evidence
    WHERE quality_id = p_quality_id
    AND created_at >= v_week_ago;
    
    -- Calculate growth rate (evidence per day * 7)
    v_growth_rate := (v_evidence_count::DECIMAL / 7.0) * 7.0;
    
    -- Update the quality
    UPDATE identity_qualities
    SET growth_rate = v_growth_rate
    WHERE id = p_quality_id;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-detect qualities from task completion
CREATE OR REPLACE FUNCTION detect_qualities_from_task(
    p_user_id UUID,
    p_task_id INTEGER,
    p_task_title TEXT,
    p_task_description TEXT
)
RETURNS VOID AS $$
DECLARE
    v_text TEXT;
    v_quality_id INTEGER;
BEGIN
    -- Combine title and description for analysis
    v_text := LOWER(COALESCE(p_task_title, '') || ' ' || COALESCE(p_task_description, ''));
    
    -- Check for discipline keywords
    IF v_text SIMILAR TO '%(schedule|routine|consistent|daily|habit)%' THEN
        -- Get or create discipline quality
        INSERT INTO identity_qualities (user_id, quality_name, category)
        VALUES (p_user_id, 'disciplined', 'behavior')
        ON CONFLICT (user_id, quality_name) DO NOTHING
        RETURNING id INTO v_quality_id;
        
        IF v_quality_id IS NULL THEN
            SELECT id INTO v_quality_id 
            FROM identity_qualities 
            WHERE user_id = p_user_id AND quality_name = 'disciplined';
        END IF;
        
        -- Add evidence
        INSERT INTO identity_evidence (
            user_id, quality_id, evidence_type, task_id, 
            action, impact_score
        ) VALUES (
            p_user_id, v_quality_id, 'task_completion', p_task_id,
            'Completed task: ' || p_task_title, 1.0
        );
        
        -- Update quality strength
        UPDATE identity_qualities
        SET strength = LEAST(100, strength + 0.5),
            evidence_count = evidence_count + 1,
            last_evidence = NOW()
        WHERE id = v_quality_id;
    END IF;
    
    -- Check for focus keywords
    IF v_text SIMILAR TO '%(focus|concentrate|deep work|attention)%' THEN
        INSERT INTO identity_qualities (user_id, quality_name, category)
        VALUES (p_user_id, 'focused', 'mindset')
        ON CONFLICT (user_id, quality_name) DO NOTHING
        RETURNING id INTO v_quality_id;
        
        IF v_quality_id IS NULL THEN
            SELECT id INTO v_quality_id 
            FROM identity_qualities 
            WHERE user_id = p_user_id AND quality_name = 'focused';
        END IF;
        
        INSERT INTO identity_evidence (
            user_id, quality_id, evidence_type, task_id, 
            action, impact_score
        ) VALUES (
            p_user_id, v_quality_id, 'task_completion', p_task_id,
            'Completed task: ' || p_task_title, 1.0
        );
        
        UPDATE identity_qualities
        SET strength = LEAST(100, strength + 0.5),
            evidence_count = evidence_count + 1,
            last_evidence = NOW()
        WHERE id = v_quality_id;
    END IF;
    
    -- Check for creative keywords
    IF v_text SIMILAR TO '%(design|create|innovate|brainstorm|idea)%' THEN
        INSERT INTO identity_qualities (user_id, quality_name, category)
        VALUES (p_user_id, 'creative', 'skill')
        ON CONFLICT (user_id, quality_name) DO NOTHING
        RETURNING id INTO v_quality_id;
        
        IF v_quality_id IS NULL THEN
            SELECT id INTO v_quality_id 
            FROM identity_qualities 
            WHERE user_id = p_user_id AND quality_name = 'creative';
        END IF;
        
        INSERT INTO identity_evidence (
            user_id, quality_id, evidence_type, task_id, 
            action, impact_score
        ) VALUES (
            p_user_id, v_quality_id, 'task_completion', p_task_id,
            'Completed task: ' || p_task_title, 1.0
        );
        
        UPDATE identity_qualities
        SET strength = LEAST(100, strength + 0.5),
            evidence_count = evidence_count + 1,
            last_evidence = NOW()
        WHERE id = v_quality_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security Policies
ALTER TABLE identity_qualities ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity_milestones ENABLE ROW LEVEL SECURITY;

-- Policies for identity_qualities
CREATE POLICY "Users can view their own qualities" 
ON identity_qualities FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own qualities" 
ON identity_qualities FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own qualities" 
ON identity_qualities FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own qualities" 
ON identity_qualities FOR DELETE 
USING (auth.uid() = user_id);

-- Policies for identity_evidence
CREATE POLICY "Users can view their own evidence" 
ON identity_evidence FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own evidence" 
ON identity_evidence FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own evidence" 
ON identity_evidence FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own evidence" 
ON identity_evidence FOR DELETE 
USING (auth.uid() = user_id);

-- Policies for identity_challenges
CREATE POLICY "Users can view their own challenges" 
ON identity_challenges FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own challenges" 
ON identity_challenges FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenges" 
ON identity_challenges FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own challenges" 
ON identity_challenges FOR DELETE 
USING (auth.uid() = user_id);

-- Policies for identity_insights
CREATE POLICY "Users can view their own insights" 
ON identity_insights FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own insights" 
ON identity_insights FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own insights" 
ON identity_insights FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own insights" 
ON identity_insights FOR DELETE 
USING (auth.uid() = user_id);

-- Policies for identity_milestones
CREATE POLICY "Users can view their own milestones" 
ON identity_milestones FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own milestones" 
ON identity_milestones FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own milestones" 
ON identity_milestones FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own milestones" 
ON identity_milestones FOR DELETE 
USING (auth.uid() = user_id);