-- ============================================
-- GAMIFICATION E GESTIONE GIARDINO AVANZATA
-- ============================================
-- Aggiunge tabelle per sfide, badge e gestione avanzata giardino

-- ============================================
-- CHALLENGE_COMPLETIONS (Completamento sfide)
-- ============================================
CREATE TABLE IF NOT EXISTS challenge_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id TEXT NOT NULL,
  challenge_type TEXT NOT NULL CHECK (challenge_type IN ('daily', 'weekly', 'monthly', 'seasonal', 'achievement', 'milestone')),
  challenge_name TEXT NOT NULL,
  challenge_description TEXT,
  target_value INTEGER,
  current_progress INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  reward_points INTEGER DEFAULT 0,
  reward_badge TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_challenge_completions_user ON challenge_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_completions_challenge ON challenge_completions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_completions_type ON challenge_completions(challenge_type);
CREATE INDEX IF NOT EXISTS idx_challenge_completions_completed ON challenge_completions(completed_at);

-- RLS Policy
ALTER TABLE challenge_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own challenge completions" ON challenge_completions
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- USER_BADGES (Badge utenti)
-- ============================================
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  badge_description TEXT,
  badge_icon TEXT,
  badge_category TEXT CHECK (badge_category IN ('cultivation', 'harvest', 'sustainability', 'knowledge', 'community', 'milestone')),
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  earned_for TEXT, -- descrizione di cosa ha fatto per guadagnarlo
  points_awarded INTEGER DEFAULT 0,
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  metadata JSONB DEFAULT '{}',
  UNIQUE(user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge ON user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_category ON user_badges(badge_category);
CREATE INDEX IF NOT EXISTS idx_user_badges_earned ON user_badges(earned_at);
CREATE INDEX IF NOT EXISTS idx_user_badges_rarity ON user_badges(rarity);

-- RLS Policy
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own badges" ON user_badges
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- GARDEN_CORRELATIONS (Correlazioni giardino)
-- ============================================
CREATE TABLE IF NOT EXISTS garden_correlations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  correlation_type TEXT NOT NULL CHECK (correlation_type IN ('companion_planting', 'succession_planting', 'crop_rotation', 'pest_management', 'nutrient_cycling')),
  primary_crop TEXT NOT NULL,
  secondary_crop TEXT,
  relationship_strength DECIMAL(3,2) CHECK (relationship_strength >= -1.0 AND relationship_strength <= 1.0),
  effect_description TEXT,
  evidence_level TEXT DEFAULT 'observed' CHECK (evidence_level IN ('theoretical', 'observed', 'measured', 'scientific')),
  season TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_garden_correlations_user ON garden_correlations(user_id);
CREATE INDEX IF NOT EXISTS idx_garden_correlations_garden ON garden_correlations(garden_id);
CREATE INDEX IF NOT EXISTS idx_garden_correlations_type ON garden_correlations(correlation_type);
CREATE INDEX IF NOT EXISTS idx_garden_correlations_primary ON garden_correlations(primary_crop);

-- RLS Policy
ALTER TABLE garden_correlations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own garden correlations" ON garden_correlations
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- GARDEN_PATTERNS (Pattern giardino)
-- ============================================
CREATE TABLE IF NOT EXISTS garden_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  pattern_name TEXT NOT NULL,
  pattern_type TEXT NOT NULL CHECK (pattern_type IN ('layout', 'rotation', 'succession', 'companion', 'seasonal')),
  pattern_data JSONB NOT NULL DEFAULT '{}',
  success_rate DECIMAL(3,2),
  difficulty_level TEXT DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard', 'expert')),
  season_applicability TEXT[] DEFAULT '{}', -- array di stagioni
  space_requirements JSONB DEFAULT '{}',
  expected_benefits TEXT[],
  notes TEXT,
  is_template BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_garden_patterns_user ON garden_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_garden_patterns_garden ON garden_patterns(garden_id);
CREATE INDEX IF NOT EXISTS idx_garden_patterns_type ON garden_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_garden_patterns_template ON garden_patterns(is_template);
CREATE INDEX IF NOT EXISTS idx_garden_patterns_public ON garden_patterns(is_public);

-- RLS Policy
ALTER TABLE garden_patterns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their own garden patterns" ON garden_patterns
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view public garden patterns" ON garden_patterns
  FOR SELECT USING (is_public = true);

-- ============================================
-- GARDEN_ROWS (Righe giardino)
-- ============================================
CREATE TABLE IF NOT EXISTS garden_rows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  garden_zone_id UUID NOT NULL REFERENCES garden_zones(id) ON DELETE CASCADE,
  row_number INTEGER NOT NULL,
  row_length_cm INTEGER,
  row_width_cm INTEGER,
  spacing_between_plants_cm INTEGER,
  spacing_between_rows_cm INTEGER,
  orientation TEXT CHECK (orientation IN ('north_south', 'east_west', 'northeast_southwest', 'northwest_southeast')),
  crop_name TEXT,
  archetype_id TEXT REFERENCES crop_archetypes(id),
  planting_date DATE,
  expected_harvest_date DATE,
  row_status TEXT DEFAULT 'planned' CHECK (row_status IN ('planned', 'planted', 'growing', 'harvested', 'fallow')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(garden_zone_id, row_number)
);

CREATE INDEX IF NOT EXISTS idx_garden_rows_user ON garden_rows(user_id);
CREATE INDEX IF NOT EXISTS idx_garden_rows_zone ON garden_rows(garden_zone_id);
CREATE INDEX IF NOT EXISTS idx_garden_rows_archetype ON garden_rows(archetype_id);
CREATE INDEX IF NOT EXISTS idx_garden_rows_status ON garden_rows(row_status);
CREATE INDEX IF NOT EXISTS idx_garden_rows_planting ON garden_rows(planting_date);

-- RLS Policy
ALTER TABLE garden_rows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own garden rows" ON garden_rows
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- GARDEN_SEASON_ANALYSES (Analisi stagionali)
-- ============================================
CREATE TABLE IF NOT EXISTS garden_season_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  season TEXT NOT NULL CHECK (season IN ('spring', 'summer', 'autumn', 'winter')),
  year INTEGER NOT NULL,
  total_yield_kg DECIMAL(8,2),
  total_varieties_grown INTEGER,
  success_rate DECIMAL(3,2),
  most_successful_crops TEXT[],
  least_successful_crops TEXT[],
  weather_impact_score DECIMAL(3,2),
  pest_pressure_score DECIMAL(3,2),
  disease_pressure_score DECIMAL(3,2),
  resource_efficiency_score DECIMAL(3,2),
  sustainability_score DECIMAL(3,2),
  lessons_learned TEXT[],
  improvements_planned TEXT[],
  analysis_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, garden_id, season, year)
);

CREATE INDEX IF NOT EXISTS idx_garden_season_analyses_user ON garden_season_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_garden_season_analyses_garden ON garden_season_analyses(garden_id);
CREATE INDEX IF NOT EXISTS idx_garden_season_analyses_season ON garden_season_analyses(season, year);

-- RLS Policy
ALTER TABLE garden_season_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own season analyses" ON garden_season_analyses
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- GARDEN_TREE_MEMORIES (Memoria alberi)
-- ============================================
CREATE TABLE IF NOT EXISTS garden_tree_memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  tree_name TEXT NOT NULL,
  tree_type TEXT, -- tipo di albero
  archetype_id TEXT REFERENCES crop_archetypes(id),
  planting_date DATE,
  location_description TEXT,
  coordinates JSONB, -- lat/lng o coordinate relative
  growth_stages JSONB DEFAULT '{}', -- storia crescita
  pruning_history JSONB DEFAULT '{}',
  harvest_history JSONB DEFAULT '{}',
  health_events JSONB DEFAULT '{}',
  photos TEXT[], -- array di URL foto nel tempo
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_garden_tree_memories_user ON garden_tree_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_garden_tree_memories_garden ON garden_tree_memories(garden_id);
CREATE INDEX IF NOT EXISTS idx_garden_tree_memories_archetype ON garden_tree_memories(archetype_id);
CREATE INDEX IF NOT EXISTS idx_garden_tree_memories_active ON garden_tree_memories(is_active);

-- RLS Policy
ALTER TABLE garden_tree_memories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own tree memories" ON garden_tree_memories
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- GARDEN_ZONE_MEMORIES (Memoria zone)
-- ============================================
CREATE TABLE IF NOT EXISTS garden_zone_memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  garden_zone_id UUID NOT NULL REFERENCES garden_zones(id) ON DELETE CASCADE,
  memory_date DATE NOT NULL,
  memory_type TEXT NOT NULL CHECK (memory_type IN ('planting', 'harvest', 'treatment', 'observation', 'problem', 'success', 'experiment')),
  title TEXT NOT NULL,
  description TEXT,
  crops_involved TEXT[],
  weather_conditions TEXT,
  photos TEXT[],
  lessons_learned TEXT,
  tags TEXT[] DEFAULT '{}',
  mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 5), -- 1=frustrato, 5=entusiasta
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_garden_zone_memories_user ON garden_zone_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_garden_zone_memories_zone ON garden_zone_memories(garden_zone_id);
CREATE INDEX IF NOT EXISTS idx_garden_zone_memories_date ON garden_zone_memories(memory_date);
CREATE INDEX IF NOT EXISTS idx_garden_zone_memories_type ON garden_zone_memories(memory_type);
CREATE INDEX IF NOT EXISTS idx_garden_zone_memories_tags ON garden_zone_memories USING GIN(tags);

-- RLS Policy
ALTER TABLE garden_zone_memories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own zone memories" ON garden_zone_memories
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS PER UPDATED_AT
-- ============================================
DROP TRIGGER IF EXISTS trigger_update_challenge_completions_updated_at ON challenge_completions;
CREATE TRIGGER trigger_update_challenge_completions_updated_at
  BEFORE UPDATE ON challenge_completions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_garden_correlations_updated_at ON garden_correlations;
CREATE TRIGGER trigger_update_garden_correlations_updated_at
  BEFORE UPDATE ON garden_correlations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_garden_patterns_updated_at ON garden_patterns;
CREATE TRIGGER trigger_update_garden_patterns_updated_at
  BEFORE UPDATE ON garden_patterns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_garden_rows_updated_at ON garden_rows;
CREATE TRIGGER trigger_update_garden_rows_updated_at
  BEFORE UPDATE ON garden_rows
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_garden_tree_memories_updated_at ON garden_tree_memories;
CREATE TRIGGER trigger_update_garden_tree_memories_updated_at
  BEFORE UPDATE ON garden_tree_memories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();