-- Migration: Add Garden Memory Tables
-- Supporta memoria contestuale profonda per zone, alberi, pattern e correlazioni

-- ============================================
-- GARDEN ZONE MEMORIES
-- Memoria contestuale per ogni zona/aiuola
-- ============================================
CREATE TABLE IF NOT EXISTS garden_zone_memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  zone_id UUID, -- Riferimento a garden_beds.id o garden_points.id (può essere NULL per orti senza zone)
  zone_name TEXT, -- Nome zona (cache per query veloci)
  
  -- Storia completa piantagioni con contesto
  planting_history JSONB DEFAULT '[]'::jsonb,
  
  -- Pattern riconosciuti
  patterns JSONB DEFAULT '{}'::jsonb, -- { bestPlantingDate, worstPlantingDate, recurringProblems, successfulTreatments }
  
  -- Correlazioni scoperte
  correlations JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_zone_memories_garden_id ON garden_zone_memories(garden_id);
CREATE INDEX IF NOT EXISTS idx_zone_memories_zone_id ON garden_zone_memories(zone_id);
CREATE INDEX IF NOT EXISTS idx_zone_memories_last_updated ON garden_zone_memories(last_updated);

-- ============================================
-- GARDEN TREE MEMORIES
-- Memoria pluriennale per alberi da frutto
-- ============================================
CREATE TABLE IF NOT EXISTS garden_tree_memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  tree_id UUID REFERENCES garden_tasks(id) ON DELETE CASCADE, -- Riferimento a task albero
  tree_name TEXT NOT NULL, -- Nome albero (cache)
  tree_type TEXT CHECK (tree_type IN ('Pome', 'Stone', 'Citrus', 'Nut', 'Berry')),
  
  -- Età albero (aggiornata annualmente)
  tree_age INTEGER DEFAULT 1,
  
  -- Storia produzione anno per anno
  production_history JSONB DEFAULT '[]'::jsonb,
  
  -- Pattern alternanza carica/scarica
  alternance_pattern JSONB DEFAULT '{}'::jsonb, -- { lastCarica: year, lastScarica: year, predictedNext: 'carica'|'scarica' }
  
  -- Storico potature con risultati
  pruning_history JSONB DEFAULT '[]'::jsonb,
  
  -- Storico trattamenti
  treatment_history JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tree_memories_garden_id ON garden_tree_memories(garden_id);
CREATE INDEX IF NOT EXISTS idx_tree_memories_tree_id ON garden_tree_memories(tree_id);
CREATE INDEX IF NOT EXISTS idx_tree_memories_tree_name ON garden_tree_memories(tree_name);

-- ============================================
-- GARDEN PATTERNS
-- Pattern locali riconosciuti (meteo, malattie, resa, timing)
-- ============================================
CREATE TABLE IF NOT EXISTS garden_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  
  pattern_type TEXT NOT NULL CHECK (pattern_type IN ('weather', 'disease', 'yield', 'timing')),
  pattern_name TEXT NOT NULL, -- Nome pattern (es. 'late_frost_after_april_10')
  pattern_description TEXT, -- Descrizione leggibile
  
  -- Dati pattern
  pattern_data JSONB NOT NULL, -- { occurrences: number, confidence: number, months: number[], conditions: {...} }
  
  -- Predizione prossima occorrenza
  prediction JSONB, -- { nextLikelyDate: date, probability: number }
  
  -- Zone interessate
  affected_zones JSONB DEFAULT '[]'::jsonb, -- Array di zone_id
  
  -- Stato pattern
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'confirmed', 'rejected', 'expired')),
  user_confirmed BOOLEAN DEFAULT false, -- Utente ha confermato pattern
  
  -- Metadata
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
-- Correlazioni scoperte tra fattori e risultati
-- ============================================
CREATE TABLE IF NOT EXISTS garden_correlations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  
  factor_type TEXT NOT NULL, -- Es. 'early_planting', 'high_rain', 'clay_soil', 'late_frost'
  factor_description TEXT, -- Descrizione leggibile
  
  impact_type TEXT NOT NULL CHECK (impact_type IN ('positive', 'negative')),
  strength DECIMAL(3, 2) NOT NULL CHECK (strength >= 0 AND strength <= 1), -- 0-1
  
  -- Numero esempi osservati
  examples_count INTEGER DEFAULT 1,
  
  -- Zone interessate
  affected_zones JSONB DEFAULT '[]'::jsonb, -- Array di zone_id
  
  -- Piante interessate
  affected_plants JSONB DEFAULT '[]'::jsonb, -- Array di plant_name
  
  -- Dettagli correlazione
  correlation_details JSONB, -- { avgImpact: number, bestCase: number, worstCase: number }
  
  -- Metadata
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
-- Analisi post-stagione con successi, fallimenti e insight
-- ============================================
CREATE TABLE IF NOT EXISTS garden_season_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  
  year INTEGER NOT NULL,
  season TEXT NOT NULL CHECK (season IN ('Summer', 'Winter')),
  
  -- Successi identificati
  successes JSONB DEFAULT '[]'::jsonb, -- Array di { plant, zone, improvement, likelyCause, recommendation }
  
  -- Fallimenti identificati
  failures JSONB DEFAULT '[]'::jsonb, -- Array di { plant, zone, loss, likelyCause, correlation, recommendation }
  
  -- Insight scoperti
  insights JSONB DEFAULT '[]'::jsonb, -- Array di { type, finding, confidence, action }
  
  -- Raccomandazioni per anno successivo
  next_year_adjustments JSONB DEFAULT '[]'::jsonb, -- Array di { zone, plant, change, reason }
  
  -- Statistiche stagione
  statistics JSONB, -- { totalYield: number, avgQuality: number, totalProblems: number }
  
  -- Metadata
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_reviewed BOOLEAN DEFAULT false, -- Utente ha rivisto analisi
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_season_analyses_garden_id ON garden_season_analyses(garden_id);
CREATE INDEX IF NOT EXISTS idx_season_analyses_year_season ON garden_season_analyses(year, season);
CREATE INDEX IF NOT EXISTS idx_season_analyses_analyzed_at ON garden_season_analyses(analyzed_at DESC);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE garden_zone_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE garden_tree_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE garden_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE garden_correlations ENABLE ROW LEVEL SECURITY;
ALTER TABLE garden_season_analyses ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own garden memories
CREATE POLICY "Users can manage their own zone memories" ON garden_zone_memories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM gardens 
      WHERE gardens.id = garden_zone_memories.garden_id 
      AND gardens.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own tree memories" ON garden_tree_memories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM gardens 
      WHERE gardens.id = garden_tree_memories.garden_id 
      AND gardens.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own patterns" ON garden_patterns
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM gardens 
      WHERE gardens.id = garden_patterns.garden_id 
      AND gardens.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own correlations" ON garden_correlations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM gardens 
      WHERE gardens.id = garden_correlations.garden_id 
      AND gardens.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own season analyses" ON garden_season_analyses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM gardens 
      WHERE gardens.id = garden_season_analyses.garden_id 
      AND gardens.user_id = auth.uid()
    )
  );

