-- OrtoMio - Schema Database per Calendario e Challenge System
-- Migrations per feature Calendario + Almanacco + Challenge

-- ============================================
-- CALENDAR TASKS
-- ============================================

CREATE TABLE IF NOT EXISTS calendar_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('semina','irrigazione','raccolta','potatura','concimazione','trattamento','altro')) NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  recurring BOOLEAN DEFAULT false,
  recurring_pattern JSONB, -- {type: 'daily'|'weekly'|'monthly', interval: number, endDate?: string}
  plant_id UUID,
  plant_name TEXT,
  completed BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_calendar_tasks_user_date ON calendar_tasks(user_id, start_date);
CREATE INDEX IF NOT EXISTS idx_calendar_tasks_garden ON calendar_tasks(garden_id);
CREATE INDEX IF NOT EXISTS idx_calendar_tasks_recurring ON calendar_tasks(recurring) WHERE recurring = true;

-- ============================================
-- CHALLENGE COMPLETIONS
-- ============================================

CREATE TABLE IF NOT EXISTS challenge_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  challenge_id TEXT NOT NULL, -- formato: "giorno-mese" es. "22-4" per Earth Day
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  actions_completed INTEGER[], -- array di indici azioni completate
  photo_url TEXT,
  points_awarded INTEGER NOT NULL,
  badge_earned TEXT, -- emoji + nome badge
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);

CREATE INDEX IF NOT EXISTS idx_challenge_completions_user ON challenge_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_completions_date ON challenge_completions(completed_at);
CREATE INDEX IF NOT EXISTS idx_challenge_completions_challenge ON challenge_completions(challenge_id);

-- ============================================
-- USER BADGES
-- ============================================

CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_id TEXT NOT NULL, -- formato: "challenge_22_4" o "streak_7", "streak_30"
  badge_name TEXT NOT NULL,
  badge_emoji TEXT NOT NULL,
  badge_description TEXT,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_earned ON user_badges(earned_at);

-- ============================================
-- UPDATE PROFILES TABLE
-- ============================================

-- Aggiungi colonne per geolocalizzazione e gamification
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS regione TEXT,
  ADD COLUMN IF NOT EXISTS provincia TEXT,
  ADD COLUMN IF NOT EXISTS comune TEXT,
  ADD COLUMN IF NOT EXISTS zona TEXT CHECK (zona IN ('nord','centro','sud','isole')),
  ADD COLUMN IF NOT EXISTS clima TEXT CHECK (clima IN ('alpino','continentale','mediterraneo','subtropicale')),
  ADD COLUMN IF NOT EXISTS location_lat FLOAT,
  ADD COLUMN IF NOT EXISTS location_lng FLOAT,
  ADD COLUMN IF NOT EXISTS location_manual BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS streak_current INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS streak_longest INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS streak_last_date DATE,
  ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Funzione per aggiornare updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger per calendar_tasks
DROP TRIGGER IF EXISTS update_calendar_tasks_updated_at ON calendar_tasks;
CREATE TRIGGER update_calendar_tasks_updated_at
  BEFORE UPDATE ON calendar_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Abilita RLS
ALTER TABLE calendar_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Policies per calendar_tasks
CREATE POLICY "Users can view their own calendar tasks"
  ON calendar_tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calendar tasks"
  ON calendar_tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar tasks"
  ON calendar_tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendar tasks"
  ON calendar_tasks FOR DELETE
  USING (auth.uid() = user_id);

-- Policies per challenge_completions
CREATE POLICY "Users can view their own challenge completions"
  ON challenge_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own challenge completions"
  ON challenge_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenge completions"
  ON challenge_completions FOR UPDATE
  USING (auth.uid() = user_id);

-- Policies per user_badges
CREATE POLICY "Users can view their own badges"
  ON user_badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own badges"
  ON user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE calendar_tasks IS 'Task del calendario con supporto ricorrenze';
COMMENT ON TABLE challenge_completions IS 'Completamenti challenge giornaliere con punti e badge';
COMMENT ON TABLE user_badges IS 'Badge guadagnati dagli utenti (challenge + streak)';
COMMENT ON COLUMN calendar_tasks.recurring_pattern IS 'Pattern ricorrenza: {type: daily|weekly|monthly, interval: number, endDate?: string}';
COMMENT ON COLUMN challenge_completions.challenge_id IS 'ID challenge formato "giorno-mese" es. "22-4" per Earth Day';
COMMENT ON COLUMN user_badges.badge_id IS 'ID badge formato "challenge_22_4" o "streak_7", "streak_30"';
