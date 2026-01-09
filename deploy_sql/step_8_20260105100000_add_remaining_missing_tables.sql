-- ============================================
-- TABELLE RIMANENTI MANCANTI
-- ============================================
-- Completa l'allineamento con tutte le tabelle mancanti

-- ============================================
-- CROP_LEARNING_EVENTS (Eventi apprendimento colture)
-- ============================================
CREATE TABLE IF NOT EXISTS crop_learning_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crop_name TEXT NOT NULL,
  archetype_id TEXT REFERENCES crop_archetypes(id),
  event_type TEXT NOT NULL CHECK (event_type IN ('success', 'failure', 'observation', 'experiment', 'discovery')),
  event_title TEXT NOT NULL,
  event_description TEXT,
  lesson_learned TEXT,
  confidence_level INTEGER CHECK (confidence_level >= 1 AND confidence_level <= 5),
  reproducible BOOLEAN DEFAULT false,
  conditions JSONB DEFAULT '{}', -- condizioni che hanno portato all'evento
  outcome JSONB DEFAULT '{}',
  photos TEXT[],
  tags TEXT[] DEFAULT '{}',
  shared_publicly BOOLEAN DEFAULT false,
  helpful_votes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crop_learning_events_user ON crop_learning_events(user_id);
CREATE INDEX IF NOT EXISTS idx_crop_learning_events_crop ON crop_learning_events(crop_name);
CREATE INDEX IF NOT EXISTS idx_crop_learning_events_archetype ON crop_learning_events(archetype_id);
CREATE INDEX IF NOT EXISTS idx_crop_learning_events_type ON crop_learning_events(event_type);
CREATE INDEX IF NOT EXISTS idx_crop_learning_events_public ON crop_learning_events(shared_publicly);
CREATE INDEX IF NOT EXISTS idx_crop_learning_events_tags ON crop_learning_events USING GIN(tags);

-- RLS Policy
ALTER TABLE crop_learning_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their own learning events" ON crop_learning_events
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view public learning events" ON crop_learning_events
  FOR SELECT USING (shared_publicly = true);

-- ============================================
-- CROP_MECHANICAL_WORKS (Lavori meccanici per coltura)
-- ============================================
CREATE TABLE IF NOT EXISTS crop_mechanical_works (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crop_name TEXT NOT NULL,
  archetype_id TEXT REFERENCES crop_archetypes(id),
  work_type TEXT NOT NULL CHECK (work_type IN ('soil_preparation', 'seeding', 'transplanting', 'cultivation', 'weeding', 'pruning', 'harvesting', 'post_harvest')),
  work_name TEXT NOT NULL,
  timing_description TEXT, -- quando fare il lavoro
  tools_required TEXT[],
  estimated_time_minutes INTEGER,
  difficulty_level TEXT DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  instructions TEXT,
  tips TEXT,
  frequency TEXT, -- una volta, settimanale, etc.
  season_applicability TEXT[] DEFAULT '{}',
  weather_requirements TEXT,
  created_by_user BOOLEAN DEFAULT true, -- false se è standard del sistema
  is_template BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crop_mechanical_works_user ON crop_mechanical_works(user_id);
CREATE INDEX IF NOT EXISTS idx_crop_mechanical_works_crop ON crop_mechanical_works(crop_name);
CREATE INDEX IF NOT EXISTS idx_crop_mechanical_works_archetype ON crop_mechanical_works(archetype_id);
CREATE INDEX IF NOT EXISTS idx_crop_mechanical_works_type ON crop_mechanical_works(work_type);
CREATE INDEX IF NOT EXISTS idx_crop_mechanical_works_template ON crop_mechanical_works(is_template);

-- RLS Policy
ALTER TABLE crop_mechanical_works ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their own mechanical works" ON crop_mechanical_works
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view template mechanical works" ON crop_mechanical_works
  FOR SELECT USING (is_template = true);

-- ============================================
-- VEGETATION_INDICES (Indici vegetazione)
-- ============================================
CREATE TABLE IF NOT EXISTS vegetation_indices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  garden_zone_id UUID REFERENCES garden_zones(id) ON DELETE CASCADE,
  measurement_date DATE NOT NULL,
  measurement_method TEXT NOT NULL CHECK (measurement_method IN ('satellite', 'drone', 'handheld_sensor', 'visual_estimation', 'photo_analysis')),
  ndvi_value DECIMAL(4,3), -- Normalized Difference Vegetation Index
  evi_value DECIMAL(4,3), -- Enhanced Vegetation Index
  savi_value DECIMAL(4,3), -- Soil Adjusted Vegetation Index
  lai_value DECIMAL(4,2), -- Leaf Area Index
  chlorophyll_content DECIMAL(6,2),
  biomass_estimate_kg DECIMAL(8,2),
  health_score DECIMAL(3,2) CHECK (health_score >= 0.0 AND health_score <= 1.0),
  stress_indicators JSONB DEFAULT '{}',
  growth_stage TEXT,
  weather_conditions JSONB DEFAULT '{}',
  image_url TEXT, -- se derivato da foto
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vegetation_indices_user ON vegetation_indices(user_id);
CREATE INDEX IF NOT EXISTS idx_vegetation_indices_zone ON vegetation_indices(garden_zone_id);
CREATE INDEX IF NOT EXISTS idx_vegetation_indices_date ON vegetation_indices(measurement_date);
CREATE INDEX IF NOT EXISTS idx_vegetation_indices_method ON vegetation_indices(measurement_method);

-- RLS Policy
ALTER TABLE vegetation_indices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own vegetation indices" ON vegetation_indices
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- WEATHER_RESCHEDULE_LOGS (Log riprogrammazioni meteo)
-- ============================================
CREATE TABLE IF NOT EXISTS weather_reschedule_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_task_id UUID, -- riferimento al task originale
  task_type TEXT NOT NULL,
  original_date DATE NOT NULL,
  rescheduled_date DATE NOT NULL,
  weather_reason TEXT NOT NULL CHECK (weather_reason IN ('rain', 'frost', 'heat_wave', 'wind', 'storm', 'drought', 'humidity', 'temperature')),
  weather_data JSONB DEFAULT '{}',
  automatic_reschedule BOOLEAN DEFAULT false,
  user_confirmed BOOLEAN DEFAULT false,
  reschedule_algorithm TEXT DEFAULT 'basic',
  confidence_score DECIMAL(3,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weather_reschedule_logs_user ON weather_reschedule_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_weather_reschedule_logs_task ON weather_reschedule_logs(original_task_id);
CREATE INDEX IF NOT EXISTS idx_weather_reschedule_logs_original_date ON weather_reschedule_logs(original_date);
CREATE INDEX IF NOT EXISTS idx_weather_reschedule_logs_reason ON weather_reschedule_logs(weather_reason);
CREATE INDEX IF NOT EXISTS idx_weather_reschedule_logs_automatic ON weather_reschedule_logs(automatic_reschedule);

-- RLS Policy
ALTER TABLE weather_reschedule_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own reschedule logs" ON weather_reschedule_logs
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- FERTILIZATION_LOGS (Log fertilizzazioni) - se non esiste già
-- ============================================
CREATE TABLE IF NOT EXISTS fertilization_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  garden_zone_id UUID REFERENCES garden_zones(id) ON DELETE CASCADE,
  fertilizer_name TEXT NOT NULL,
  fertilizer_type TEXT NOT NULL CHECK (fertilizer_type IN ('organic', 'mineral', 'liquid', 'granular', 'compost', 'manure')),
  application_date DATE NOT NULL,
  quantity_applied DECIMAL(8,2) NOT NULL,
  quantity_unit TEXT NOT NULL CHECK (quantity_unit IN ('kg', 'g', 'l', 'ml', 'bags', 'scoops')),
  npk_ratio TEXT, -- es. "10-10-10"
  application_method TEXT CHECK (application_method IN ('broadcast', 'banding', 'foliar', 'fertigation', 'side_dress')),
  weather_conditions TEXT,
  soil_moisture_level TEXT CHECK (soil_moisture_level IN ('dry', 'moist', 'wet', 'saturated')),
  crop_growth_stage TEXT,
  cost DECIMAL(8,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fertilization_logs_user ON fertilization_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_fertilization_logs_zone ON fertilization_logs(garden_zone_id);
CREATE INDEX IF NOT EXISTS idx_fertilization_logs_date ON fertilization_logs(application_date);
CREATE INDEX IF NOT EXISTS idx_fertilization_logs_type ON fertilization_logs(fertilizer_type);

-- RLS Policy
ALTER TABLE fertilization_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own fertilization logs" ON fertilization_logs
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- TREATMENT_REGISTRY (Registro trattamenti) - diverso da treatment_register
-- ============================================
CREATE TABLE IF NOT EXISTS treatment_registry (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  garden_zone_id UUID REFERENCES garden_zones(id) ON DELETE CASCADE,
  treatment_name TEXT NOT NULL,
  treatment_category TEXT NOT NULL CHECK (treatment_category IN ('fungicide', 'insecticide', 'herbicide', 'bactericide', 'organic', 'biological', 'preventive')),
  active_ingredient TEXT,
  target_pest_disease TEXT,
  application_date DATE NOT NULL,
  dosage TEXT NOT NULL,
  application_method TEXT CHECK (application_method IN ('spray', 'dust', 'granular', 'systemic', 'soil_drench')),
  weather_at_application JSONB DEFAULT '{}',
  pre_harvest_interval_days INTEGER,
  effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
  side_effects TEXT,
  cost DECIMAL(8,2),
  supplier TEXT,
  batch_number TEXT,
  expiry_date DATE,
  safety_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_treatment_registry_user ON treatment_registry(user_id);
CREATE INDEX IF NOT EXISTS idx_treatment_registry_zone ON treatment_registry(garden_zone_id);
CREATE INDEX IF NOT EXISTS idx_treatment_registry_date ON treatment_registry(application_date);
CREATE INDEX IF NOT EXISTS idx_treatment_registry_category ON treatment_registry(treatment_category);
CREATE INDEX IF NOT EXISTS idx_treatment_registry_target ON treatment_registry(target_pest_disease);

-- RLS Policy
ALTER TABLE treatment_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own treatment registry" ON treatment_registry
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- MECHANICAL_WORK_SEQUENCES (Sequenze lavori meccanici)
-- ============================================
CREATE TABLE IF NOT EXISTS mechanical_work_sequences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sequence_name TEXT NOT NULL,
  crop_name TEXT,
  archetype_id TEXT REFERENCES crop_archetypes(id),
  season TEXT CHECK (season IN ('spring', 'summer', 'autumn', 'winter', 'all')),
  sequence_steps JSONB NOT NULL DEFAULT '[]', -- array di step ordinati
  total_estimated_time_minutes INTEGER,
  difficulty_level TEXT DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard', 'expert')),
  tools_required TEXT[],
  prerequisites TEXT[],
  success_criteria TEXT[],
  common_mistakes TEXT[],
  is_template BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  success_rate DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mechanical_work_sequences_user ON mechanical_work_sequences(user_id);
CREATE INDEX IF NOT EXISTS idx_mechanical_work_sequences_crop ON mechanical_work_sequences(crop_name);
CREATE INDEX IF NOT EXISTS idx_mechanical_work_sequences_archetype ON mechanical_work_sequences(archetype_id);
CREATE INDEX IF NOT EXISTS idx_mechanical_work_sequences_season ON mechanical_work_sequences(season);
CREATE INDEX IF NOT EXISTS idx_mechanical_work_sequences_template ON mechanical_work_sequences(is_template);

-- RLS Policy
ALTER TABLE mechanical_work_sequences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their own work sequences" ON mechanical_work_sequences
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view public work sequences" ON mechanical_work_sequences
  FOR SELECT USING (is_public = true);

-- ============================================
-- TRIGGERS PER UPDATED_AT
-- ============================================
DROP TRIGGER IF EXISTS trigger_update_crop_learning_events_updated_at ON crop_learning_events;
CREATE TRIGGER trigger_update_crop_learning_events_updated_at
  BEFORE UPDATE ON crop_learning_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_crop_mechanical_works_updated_at ON crop_mechanical_works;
CREATE TRIGGER trigger_update_crop_mechanical_works_updated_at
  BEFORE UPDATE ON crop_mechanical_works
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_mechanical_work_sequences_updated_at ON mechanical_work_sequences;
CREATE TRIGGER trigger_update_mechanical_work_sequences_updated_at
  BEFORE UPDATE ON mechanical_work_sequences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();