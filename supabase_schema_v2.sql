-- Midula DB Schema V2 - Extensive User Data Model
-- Run this manually in the Supabase SQL Editor to add comprehensive tracking tables.
-- This schema REQUIRES Supabase Auth to be enabled (auth.users table).
-- Existing tables (users, daily_trackers, workouts, goals, recipes) are NOT modified.

-- =============================================================================
-- 1. USER PROFILES (extends auth.users)
-- =============================================================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not')),
    height_cm NUMERIC,
    weight_kg NUMERIC,
    fitness_level TEXT CHECK (fitness_level IN ('beginner', 'intermediate', 'advanced')),
    primary_goals TEXT[],
    target_weight_kg NUMERIC,
    weekly_workout_target INT DEFAULT 3,
    diet_type TEXT CHECK (diet_type IN ('vegetarian', 'vegan', 'jain', 'other')),
    food_allergies TEXT[],
    meal_preference TEXT,
    medical_conditions TEXT,
    injury_history TEXT,
    sleep_target_hours INT DEFAULT 8,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- 2. WORKOUT SESSIONS (detailed tracking)
-- =============================================================================
CREATE TABLE IF NOT EXISTS workout_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    routine_id INT,
    routine_name TEXT,
    date DATE DEFAULT CURRENT_DATE,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    duration_seconds INT,
    exercises_completed JSONB,
    calories_burned_estimated INT,
    mood_before INT CHECK (mood_before BETWEEN 1 AND 5),
    mood_after INT CHECK (mood_after BETWEEN 1 AND 5),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- 3. MEAL LOGS
-- =============================================================================
CREATE TABLE IF NOT EXISTS meal_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    recipe_id INT,
    custom_food_name TEXT,
    calories INT,
    protein_g NUMERIC,
    carbs_g NUMERIC,
    fats_g NUMERIC,
    portion_size TEXT,
    time_logged TIMESTAMP DEFAULT NOW(),
    mood_rating INT CHECK (mood_rating BETWEEN 1 AND 5),
    notes TEXT
);

-- =============================================================================
-- 4. BODY METRICS (daily tracking)
-- =============================================================================
CREATE TABLE IF NOT EXISTS body_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    weight_kg NUMERIC,
    body_fat_percentage NUMERIC,
    muscle_mass_kg NUMERIC,
    waist_cm NUMERIC,
    hip_cm NUMERIC,
    logged_at TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- 5. SLEEP LOGS
-- =============================================================================
CREATE TABLE IF NOT EXISTS sleep_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    hours_slept NUMERIC,
    sleep_quality INT CHECK (sleep_quality BETWEEN 1 AND 5),
    bedtime TIME,
    wake_time TIME,
    interruptions INT DEFAULT 0,
    notes TEXT
);

-- =============================================================================
-- 6. WATER LOGS
-- =============================================================================
CREATE TABLE IF NOT EXISTS water_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    amount_ml INT DEFAULT 250,
    time_logged TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- 7. MOOD LOGS
-- =============================================================================
CREATE TABLE IF NOT EXISTS mood_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    mood_score INT CHECK (mood_score BETWEEN 1 AND 10),
    mood_tags TEXT[],
    energy_level INT CHECK (energy_level BETWEEN 1 AND 5),
    stress_level INT CHECK (stress_level BETWEEN 1 AND 5),
    logged_at TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- 8. STEP COUNTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS step_counts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    steps INT DEFAULT 0,
    distance_km NUMERIC,
    calories_burned INT
);

-- =============================================================================
-- 9. ACTIVITY SUMMARY (daily aggregation)
-- =============================================================================
CREATE TABLE IF NOT EXISTS activity_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    total_calories_consumed INT DEFAULT 0,
    total_calories_burned INT DEFAULT 0,
    total_protein_g NUMERIC DEFAULT 0,
    total_carbs_g NUMERIC DEFAULT 0,
    total_fats_g NUMERIC DEFAULT 0,
    workout_minutes INT DEFAULT 0,
    steps INT DEFAULT 0,
    water_ml INT DEFAULT 0,
    sleep_hours NUMERIC DEFAULT 0,
    mood_avg NUMERIC,
    UNIQUE(user_id, date)
);

-- =============================================================================
-- 10. USER PREFERENCES
-- =============================================================================
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    preferred_workout_time TEXT,
    preferred_workout_duration TEXT,
    preferred_workout_types TEXT[],
    preferred_cuisines TEXT[],
    preferred_meal_times JSONB,
    notification_preferences JSONB,
    language TEXT DEFAULT 'en',
    unit_system TEXT DEFAULT 'metric' CHECK (unit_system IN ('metric', 'imperial'))
);

-- =============================================================================
-- 11. RECIPE RATINGS
-- =============================================================================
CREATE TABLE IF NOT EXISTS recipe_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    recipe_id INT,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    review TEXT,
    made_it BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, recipe_id)
);

-- =============================================================================
-- RLS POLICIES (scoped to auth.uid())
-- =============================================================================

-- Enable RLS on all new tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.step_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ratings ENABLE ROW LEVEL SECURITY;

-- Helper: create policies for a table
-- user_profiles uses id (FK to auth.users), all others use user_id
CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can delete own profile" ON public.user_profiles FOR DELETE USING (auth.uid() = id);

CREATE POLICY "Users can view own workout_sessions" ON public.workout_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own workout_sessions" ON public.workout_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workout_sessions" ON public.workout_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own workout_sessions" ON public.workout_sessions FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own meal_logs" ON public.meal_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own meal_logs" ON public.meal_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own meal_logs" ON public.meal_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own meal_logs" ON public.meal_logs FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own body_metrics" ON public.body_metrics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own body_metrics" ON public.body_metrics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own body_metrics" ON public.body_metrics FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own body_metrics" ON public.body_metrics FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own sleep_logs" ON public.sleep_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sleep_logs" ON public.sleep_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sleep_logs" ON public.sleep_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sleep_logs" ON public.sleep_logs FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own water_logs" ON public.water_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own water_logs" ON public.water_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own water_logs" ON public.water_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own water_logs" ON public.water_logs FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own mood_logs" ON public.mood_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own mood_logs" ON public.mood_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own mood_logs" ON public.mood_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own mood_logs" ON public.mood_logs FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own step_counts" ON public.step_counts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own step_counts" ON public.step_counts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own step_counts" ON public.step_counts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own step_counts" ON public.step_counts FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own activity_summary" ON public.activity_summary FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activity_summary" ON public.activity_summary FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own activity_summary" ON public.activity_summary FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own activity_summary" ON public.activity_summary FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own user_preferences" ON public.user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own user_preferences" ON public.user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own user_preferences" ON public.user_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own user_preferences" ON public.user_preferences FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own recipe_ratings" ON public.recipe_ratings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own recipe_ratings" ON public.recipe_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own recipe_ratings" ON public.recipe_ratings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own recipe_ratings" ON public.recipe_ratings FOR DELETE USING (auth.uid() = user_id);

-- =============================================================================
-- INDEXES (for performance on common queries)
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_date ON public.workout_sessions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_meal_logs_user_date ON public.meal_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_body_metrics_user_date ON public.body_metrics(user_id, date);
CREATE INDEX IF NOT EXISTS idx_sleep_logs_user_date ON public.sleep_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_water_logs_user_date ON public.water_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_mood_logs_user_date ON public.mood_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_step_counts_user_date ON public.step_counts(user_id, date);
CREATE INDEX IF NOT EXISTS idx_activity_summary_user_date ON public.activity_summary(user_id, date);
CREATE INDEX IF NOT EXISTS idx_recipe_ratings_recipe ON public.recipe_ratings(recipe_id);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Auto-update updated_at on user_profiles
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Auto-create user profile entry when auth.users row is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id)
    VALUES (NEW.id)
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on auth.users (only works if Supabase Auth is enabled)
-- This will fire when a user signs up via Supabase Auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
