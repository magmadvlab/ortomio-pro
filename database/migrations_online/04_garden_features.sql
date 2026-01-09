-- ============================================
-- GRUPPO 4: GARDEN FEATURES
-- ============================================
-- Feature avanzate per gestione giardini
-- 
-- Include:
-- - garden_memory (zone memories, tree memories, patterns, correlations)
-- - garden_obstacles (calcolo esposizione solare)
-- - sun_exposure_to_garden_beds
-- - structure_config
-- - orchard_configs (frutteto/oliveto/vigneto)
-- - custom_crops
-- 
-- ORDINE: Dopo core schema (01)

-- ============================================
-- GARDEN ZONE MEMORIES
-- ============================================
CREATE TABLE IF NOT EXISTS garden_zone_memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  zone_id UUID,
  zone_name TEXT,
  planting_history JSONB DEFAULT '[]'::jsonb,
  patterns JSONB DEFAULT '{}'::jsonb,
  correlations JSONB DEFAULT '[]'::jsonb,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_zone_memories_garden_id ON garden_zone_memories(garden_id);
CREATE INDEX IF NOT EXISTS idx_zone_memories_zone_id ON garden_zone_memories(zone_id);
CREATE INDEX IF NOT EXISTS idx_zone_memories_last_updated ON garden_zone_memories(last_updated);

-- ============================================
-- GARDEN TREE MEMORIES
-- ============================================
CREATE TABLE IF NOT EXISTS garden_tree_memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  tree_id UUID REFERENCES garden_tasks(id) ON DELETE CASCADE,
  tree_name TEXT NOT NULL,
  tree_type TEXT CHECK (tree_type IN ('Pome', 'Stone', 'Citrus', 'Nut', 'Berry')),
  tree_age INTEGER DEFAULT 1,
  production_history JSONB DEFAULT '[]'::jsonb,
  alternance_pattern JSONB DEFAULT '{}'::jsonb,
  pruning_history JSONB DEFAULT '[]'::jsonb,
  treatment_history JSONB DEFAULT '[]'::jsonb,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tree_memories_garden_id ON garden_tree_memories(garden_id);
CREATE INDEX IF NOT EXISTS idx_tree_memories_tree_id ON garden_tree_memories(tree_id);
CREATE INDEX IF NOT EXISTS idx_tree_memories_tree_name ON garden_tree_memories(tree_name);

-- ============================================
-- GARDEN PATTERNS
-- ============================================
CREATE TABLE IF NOT EXISTS garden_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  pattern_type TEXT NOT NULL CHECK (pattern_type IN ('weather', 'disease', 'yield', 'timing')),
  pattern_name TEXT NOT NULL,
  pattern_description TEXT,
  pattern_data JSONB NOT NULL,
  prediction JSONB,
  affected_zones JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'confirmed', 'rejected', 'expired')),
  user_confirmed BOOLEAN DEFAULT false,
  first_detected TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_occurrence TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patterns_garden_id ON garden_patterns(garden_id);
CREATE INDEX IF NOT EXISTS idx_patterns_type ON garden_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_patterns_status ON garden_patterns(status);
CREATE INDEX IF NOT EXISTS idx_patterns_user_confirmed ON garden_patterns(user_confirmed);

-- ============================================
-- GARDEN CORRELATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS garden_correlations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  factor_type TEXT NOT NULL,
  factor_description TEXT,
  impact_type TEXT NOT NULL CHECK (impact_type IN ('positive', 'negative')),
  strength DECIMAL(3, 2) NOT NULL CHECK (strength >= 0 AND strength <= 1),
  examples_count INTEGER DEFAULT 1,
  affected_zones JSONB DEFAULT '[]'::jsonb,
  affected_plants JSONB DEFAULT '[]'::jsonb,
  correlation_details JSONB,
  first_observed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_observed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_correlations_garden_id ON garden_correlations(garden_id);
CREATE INDEX IF NOT EXISTS idx_correlations_factor_type ON garden_correlations(factor_type);
CREATE INDEX IF NOT EXISTS idx_correlations_impact_type ON garden_correlations(impact_type);
CREATE INDEX IF NOT EXISTS idx_correlations_strength ON garden_correlations(strength DESC);

-- ============================================
-- GARDEN SEASON ANALYSES
-- ============================================
CREATE TABLE IF NOT EXISTS garden_season_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  year INTEGER NOT NULL,
  season TEXT NOT NULL CHECK (season IN ('Summer', 'Winter')),
  successes JSONB DEFAULT '[]'::jsonb,
  failures JSONB DEFAULT '[]'::jsonb,
  insights JSONB DEFAULT '[]'::jsonb,
  next_year_adjustments JSONB DEFAULT '[]'::jsonb,
  statistics JSONB,
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_reviewed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_season_analyses_garden_id ON garden_season_analyses(garden_id);
CREATE INDEX IF NOT EXISTS idx_season_analyses_year_season ON garden_season_analyses(year, season);
CREATE INDEX IF NOT EXISTS idx_season_analyses_analyzed_at ON garden_season_analyses(analyzed_at DESC);

-- ============================================
-- GARDEN OBSTACLES (Ostacoli per calcolo esposizione solare)
-- ============================================
CREATE TABLE IF NOT EXISTS garden_obstacles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  azimuth DECIMAL(5, 2) NOT NULL CHECK (azimuth >= 0 AND azimuth <= 360),
  height_meters DECIMAL(6, 2) NOT NULL CHECK (height_meters > 0),
  distance_meters DECIMAL(6, 2) NOT NULL CHECK (distance_meters > 0),
  width_degrees DECIMAL(5, 2) DEFAULT 30 CHECK (width_degrees > 0 AND width_degrees <= 180),
  type TEXT CHECK (type IN ('Building', 'Tree', 'Mountain', 'Other')) DEFAULT 'Other',
  source TEXT CHECK (source IN ('photo_360', 'manual', 'ai_analysis')) DEFAULT 'manual',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_garden_obstacles_garden_id ON garden_obstacles(garden_id);
CREATE INDEX IF NOT EXISTS idx_garden_obstacles_azimuth ON garden_obstacles(azimuth);

-- ============================================
-- GARDEN ACCESSORIES (Paletti, Reti, Fili, etc.)
-- ============================================
CREATE TABLE IF NOT EXISTS garden_accessories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT CHECK (category IN ('Support', 'Netting', 'Wire', 'Structure')) NOT NULL,
  support_type TEXT CHECK (support_type IN ('Stake', 'Tutor', 'Trellis', 'Cage')),
  netting_type TEXT CHECK (netting_type IN ('Shade', 'Hail', 'Insect', 'Harvest')),
  wire_type TEXT CHECK (wire_type IN ('Steel', 'Plastic')),
  material TEXT CHECK (material IN ('Wood', 'Steel', 'Plastic', 'Bamboo', 'Cane', 'Aluminum', 'Polyethylene', 'Polypropylene')) NOT NULL,
  quantity INTEGER,
  length_cm INTEGER,
  height_cm INTEGER,
  width_cm INTEGER,
  diameter_cm INTEGER,
  mesh_size_mm INTEGER,
  used_for JSONB,
  installation_date DATE,
  expected_lifespan_years INTEGER,
  last_maintenance DATE,
  needs_replacement BOOLEAN DEFAULT false,
  position JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_accessories_garden_id ON garden_accessories(garden_id);
CREATE INDEX IF NOT EXISTS idx_accessories_category ON garden_accessories(category);

-- ============================================
-- HYDROPONIC READINGS
-- ============================================
CREATE TABLE IF NOT EXISTS hydroponic_readings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  reading_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ph DECIMAL(3, 2) CHECK (ph >= 0 AND ph <= 14),
  ec DECIMAL(5, 2),
  water_temperature DECIMAL(4, 1),
  reservoir_volume DECIMAL(6, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hydroponic_readings_garden_date ON hydroponic_readings(garden_id, reading_date DESC);

-- ============================================
-- AQUAPONIC READINGS
-- ============================================
CREATE TABLE IF NOT EXISTS aquaponic_readings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  reading_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ph DECIMAL(3, 2) CHECK (ph >= 0 AND ph <= 14),
  ammonia DECIMAL(5, 2),
  nitrite DECIMAL(5, 2),
  nitrate DECIMAL(5, 2),
  water_temperature DECIMAL(4, 1),
  dissolved_oxygen DECIMAL(4, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_aquaponic_readings_garden_date ON aquaponic_readings(garden_id, reading_date DESC);

-- ============================================
-- MODIFICHE A GARDENS (Configurazioni avanzate)
-- ============================================
ALTER TABLE gardens 
ADD COLUMN IF NOT EXISTS orchard_config JSONB,
ADD COLUMN IF NOT EXISTS olive_grove_config JSONB,
ADD COLUMN IF NOT EXISTS vineyard_config JSONB;

CREATE INDEX IF NOT EXISTS idx_gardens_orchard_config ON gardens USING GIN (orchard_config);
CREATE INDEX IF NOT EXISTS idx_gardens_olive_grove_config ON gardens USING GIN (olive_grove_config);
CREATE INDEX IF NOT EXISTS idx_gardens_vineyard_config ON gardens USING GIN (vineyard_config);

-- ============================================
-- MODIFICHE A GARDEN_BEDS (Sun exposure)
-- ============================================
-- NOTA: sun_exposure e daily_sun_hours sono già nello schema base
-- Questo è solo per riferimento

-- ============================================
-- CUSTOM PLANS (Piani Personalizzati - Pro Feature)
-- ============================================
CREATE TABLE IF NOT EXISTS custom_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  garden_id UUID REFERENCES gardens(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  base_master_sheet_id TEXT NOT NULL,
  overrides JSONB,
  custom_notes JSONB,
  custom_methods JSONB,
  additional_parameters JSONB,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_custom_plans_user_id ON custom_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_plans_garden_id ON custom_plans(garden_id);
CREATE INDEX IF NOT EXISTS idx_custom_plans_base_master_sheet ON custom_plans(base_master_sheet_id);

-- ============================================
-- AGRONOMISTS (Agronomi di Fiducia - Pro Feature)
-- ============================================
CREATE TABLE IF NOT EXISTS agronomists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  specialization JSONB,
  notes TEXT,
  preferred_contact_method TEXT CHECK (preferred_contact_method IN ('Email', 'Phone', 'InPerson')),
  consultation_frequency TEXT CHECK (consultation_frequency IN ('Weekly', 'Monthly', 'Seasonal', 'OnDemand')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agronomists_user_id ON agronomists(user_id);

-- ============================================
-- AGRONOMIST CONSULTATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS agronomist_consultations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agronomist_id UUID REFERENCES agronomists(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  garden_id UUID REFERENCES gardens(id) ON DELETE SET NULL,
  task_id UUID REFERENCES garden_tasks(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  consultation_type TEXT CHECK (consultation_type IN ('InPerson', 'Phone', 'Email', 'Video')),
  topic TEXT NOT NULL,
  advice JSONB,
  notes TEXT,
  attachments JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consultations_agronomist_id ON agronomist_consultations(agronomist_id);
CREATE INDEX IF NOT EXISTS idx_consultations_user_id ON agronomist_consultations(user_id);
CREATE INDEX IF NOT EXISTS idx_consultations_task_id ON agronomist_consultations(task_id);

-- ============================================
-- AGRONOMIST ADVICE
-- ============================================
CREATE TABLE IF NOT EXISTS agronomist_advice (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultation_id UUID REFERENCES agronomist_consultations(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES garden_tasks(id) ON DELETE SET NULL,
  advice_text TEXT NOT NULL,
  category TEXT CHECK (category IN ('Fertilization', 'Pruning', 'Irrigation', 'Disease', 'Harvest', 'Other')),
  priority TEXT CHECK (priority IN ('High', 'Medium', 'Low')),
  apply_date DATE,
  apply_season JSONB,
  applied BOOLEAN DEFAULT false,
  applied_date DATE,
  result TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_advice_consultation_id ON agronomist_advice(consultation_id);
CREATE INDEX IF NOT EXISTS idx_advice_task_id ON agronomist_advice(task_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE garden_zone_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE garden_tree_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE garden_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE garden_correlations ENABLE ROW LEVEL SECURITY;
ALTER TABLE garden_season_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE garden_obstacles ENABLE ROW LEVEL SECURITY;
ALTER TABLE garden_accessories ENABLE ROW LEVEL SECURITY;
ALTER TABLE hydroponic_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE aquaponic_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE agronomists ENABLE ROW LEVEL SECURITY;
ALTER TABLE agronomist_consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE agronomist_advice ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own garden memories
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'garden_zone_memories' AND policyname = 'Users can manage their own zone memories'
  ) THEN
    CREATE POLICY "Users can manage their own zone memories" ON garden_zone_memories
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM gardens 
          WHERE gardens.id = garden_zone_memories.garden_id 
          AND gardens.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'garden_tree_memories' AND policyname = 'Users can manage their own tree memories'
  ) THEN
    CREATE POLICY "Users can manage their own tree memories" ON garden_tree_memories
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM gardens 
          WHERE gardens.id = garden_tree_memories.garden_id 
          AND gardens.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'garden_patterns' AND policyname = 'Users can manage their own patterns'
  ) THEN
    CREATE POLICY "Users can manage their own patterns" ON garden_patterns
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM gardens 
          WHERE gardens.id = garden_patterns.garden_id 
          AND gardens.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'garden_correlations' AND policyname = 'Users can manage their own correlations'
  ) THEN
    CREATE POLICY "Users can manage their own correlations" ON garden_correlations
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM gardens 
          WHERE gardens.id = garden_correlations.garden_id 
          AND gardens.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'garden_season_analyses' AND policyname = 'Users can manage their own season analyses'
  ) THEN
    CREATE POLICY "Users can manage their own season analyses" ON garden_season_analyses
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM gardens 
          WHERE gardens.id = garden_season_analyses.garden_id 
          AND gardens.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'garden_obstacles' AND policyname = 'Users can view obstacles in their gardens'
  ) THEN
    CREATE POLICY "Users can view obstacles in their gardens"
      ON garden_obstacles FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM gardens
          WHERE gardens.id = garden_obstacles.garden_id
          AND gardens.user_id = auth.uid()
        )
      );
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'garden_obstacles' AND policyname = 'Users can create obstacles in their gardens'
  ) THEN
    CREATE POLICY "Users can create obstacles in their gardens"
      ON garden_obstacles FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM gardens
          WHERE gardens.id = garden_obstacles.garden_id
          AND gardens.user_id = auth.uid()
        )
      );
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'garden_obstacles' AND policyname = 'Users can update obstacles in their gardens'
  ) THEN
    CREATE POLICY "Users can update obstacles in their gardens"
      ON garden_obstacles FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM gardens
          WHERE gardens.id = garden_obstacles.garden_id
          AND gardens.user_id = auth.uid()
        )
      );
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'garden_obstacles' AND policyname = 'Users can delete obstacles in their gardens'
  ) THEN
    CREATE POLICY "Users can delete obstacles in their gardens"
      ON garden_obstacles FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM gardens
          WHERE gardens.id = garden_obstacles.garden_id
          AND gardens.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'garden_accessories' AND policyname = 'Users can access accessories in their gardens'
  ) THEN
    CREATE POLICY "Users can access accessories in their gardens"
      ON garden_accessories FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM gardens
          WHERE gardens.id = garden_accessories.garden_id
          AND gardens.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'hydroponic_readings' AND policyname = 'Users can access hydroponic readings in their gardens'
  ) THEN
    CREATE POLICY "Users can access hydroponic readings in their gardens"
      ON hydroponic_readings FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM gardens
          WHERE gardens.id = hydroponic_readings.garden_id
          AND gardens.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'aquaponic_readings' AND policyname = 'Users can access aquaponic readings in their gardens'
  ) THEN
    CREATE POLICY "Users can access aquaponic readings in their gardens"
      ON aquaponic_readings FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM gardens
          WHERE gardens.id = aquaponic_readings.garden_id
          AND gardens.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'custom_plans' AND policyname = 'Users can view their own custom plans'
  ) THEN
    CREATE POLICY "Users can view their own custom plans"
      ON custom_plans FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'custom_plans' AND policyname = 'Users can view public custom plans'
  ) THEN
    CREATE POLICY "Users can view public custom plans"
      ON custom_plans FOR SELECT
      USING (is_public = true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'custom_plans' AND policyname = 'Users can create their own custom plans'
  ) THEN
    CREATE POLICY "Users can create their own custom plans"
      ON custom_plans FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'custom_plans' AND policyname = 'Users can update their own custom plans'
  ) THEN
    CREATE POLICY "Users can update their own custom plans"
      ON custom_plans FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'custom_plans' AND policyname = 'Users can delete their own custom plans'
  ) THEN
    CREATE POLICY "Users can delete their own custom plans"
      ON custom_plans FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'agronomists' AND policyname = 'Users can manage their own agronomists'
  ) THEN
    CREATE POLICY "Users can manage their own agronomists"
      ON agronomists FOR ALL
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'agronomist_consultations' AND policyname = 'Users can manage their own consultations'
  ) THEN
    CREATE POLICY "Users can manage their own consultations"
      ON agronomist_consultations FOR ALL
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'agronomist_advice' AND policyname = 'Users can view advice from their consultations'
  ) THEN
    CREATE POLICY "Users can view advice from their consultations"
      ON agronomist_advice FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM agronomist_consultations
          WHERE agronomist_consultations.id = agronomist_advice.consultation_id
          AND agronomist_consultations.user_id = auth.uid()
        )
      );
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'agronomist_advice' AND policyname = 'Users can update advice from their consultations'
  ) THEN
    CREATE POLICY "Users can update advice from their consultations"
      ON agronomist_advice FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM agronomist_consultations
          WHERE agronomist_consultations.id = agronomist_advice.consultation_id
          AND agronomist_consultations.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- ============================================
-- TRIGGERS
-- ============================================
DROP TRIGGER IF EXISTS update_garden_obstacles_updated_at ON garden_obstacles;
CREATE TRIGGER update_garden_obstacles_updated_at BEFORE UPDATE ON garden_obstacles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_garden_patterns_updated_at ON garden_patterns;
CREATE TRIGGER update_garden_patterns_updated_at BEFORE UPDATE ON garden_patterns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_garden_correlations_updated_at ON garden_correlations;
CREATE TRIGGER update_garden_correlations_updated_at BEFORE UPDATE ON garden_correlations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_custom_plans_updated_at ON custom_plans;
CREATE TRIGGER update_custom_plans_updated_at BEFORE UPDATE ON custom_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_agronomists_updated_at ON agronomists;
CREATE TRIGGER update_agronomists_updated_at BEFORE UPDATE ON agronomists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

