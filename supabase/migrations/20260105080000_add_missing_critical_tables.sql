-- ============================================
-- TABELLE MANCANTI CRITICHE - ALLINEAMENTO DATABASE
-- ============================================
-- Aggiunge le tabelle che esistono online ma mancano nel locale

-- ============================================
-- API_CONFIGURATIONS (Configurazioni API personalizzate)
-- ============================================
CREATE TABLE IF NOT EXISTS api_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  api_key TEXT,
  api_secret TEXT,
  endpoint_url TEXT,
  configuration JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, service_name)
);

CREATE INDEX IF NOT EXISTS idx_api_configurations_user ON api_configurations(user_id);
CREATE INDEX IF NOT EXISTS idx_api_configurations_service ON api_configurations(service_name);

-- RLS Policy
ALTER TABLE api_configurations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own API configurations" ON api_configurations
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- CALENDAR_TASKS (Attività calendario)
-- ============================================
CREATE TABLE IF NOT EXISTS calendar_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT NOT NULL CHECK (task_type IN ('seeding', 'transplanting', 'watering', 'fertilizing', 'harvesting', 'pruning', 'treatment', 'maintenance', 'custom')),
  scheduled_date DATE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  estimated_duration INTEGER, -- minuti
  actual_duration INTEGER, -- minuti
  weather_dependent BOOLEAN DEFAULT false,
  recurring_pattern JSONB, -- per task ricorrenti
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_calendar_tasks_user ON calendar_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_tasks_garden ON calendar_tasks(garden_id);
CREATE INDEX IF NOT EXISTS idx_calendar_tasks_date ON calendar_tasks(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_calendar_tasks_type ON calendar_tasks(task_type);
CREATE INDEX IF NOT EXISTS idx_calendar_tasks_completed ON calendar_tasks(completed_at);

-- RLS Policy
ALTER TABLE calendar_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own calendar tasks" ON calendar_tasks
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- CUSTOM_CROPS (Colture personalizzate)
-- ============================================
CREATE TABLE IF NOT EXISTS custom_crops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  archetype_id TEXT REFERENCES crop_archetypes(id),
  custom_profile_id UUID REFERENCES crop_profiles(id),
  scientific_name TEXT,
  variety TEXT,
  source TEXT, -- dove l'ha ottenuta
  notes TEXT,
  photos TEXT[], -- array di URL foto
  growing_notes JSONB DEFAULT '{}',
  harvest_notes JSONB DEFAULT '{}',
  is_public BOOLEAN DEFAULT false, -- condivisibile con altri utenti
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_custom_crops_user ON custom_crops(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_crops_archetype ON custom_crops(archetype_id);
CREATE INDEX IF NOT EXISTS idx_custom_crops_name ON custom_crops(name);
CREATE INDEX IF NOT EXISTS idx_custom_crops_public ON custom_crops(is_public);

-- RLS Policy
ALTER TABLE custom_crops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their own custom crops" ON custom_crops
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view public custom crops" ON custom_crops
  FOR SELECT USING (is_public = true);

-- ============================================
-- PROFESSIONAL_ANALYTICS (Analytics professionali)
-- ============================================
CREATE TABLE IF NOT EXISTS professional_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('yield_analysis', 'cost_analysis', 'efficiency_analysis', 'seasonal_report', 'crop_performance', 'resource_usage')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  data_points JSONB NOT NULL DEFAULT '{}',
  metrics JSONB NOT NULL DEFAULT '{}',
  insights JSONB DEFAULT '{}',
  recommendations JSONB DEFAULT '{}',
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE, -- per cache analytics
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_professional_analytics_user ON professional_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_professional_analytics_garden ON professional_analytics(garden_id);
CREATE INDEX IF NOT EXISTS idx_professional_analytics_type ON professional_analytics(analysis_type);
CREATE INDEX IF NOT EXISTS idx_professional_analytics_period ON professional_analytics(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_professional_analytics_expires ON professional_analytics(expires_at);

-- RLS Policy
ALTER TABLE professional_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own analytics" ON professional_analytics
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- YIELD_PREDICTIONS (Previsioni raccolto)
-- ============================================
CREATE TABLE IF NOT EXISTS yield_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  garden_zone_id UUID REFERENCES garden_zones(id) ON DELETE CASCADE,
  crop_name TEXT NOT NULL,
  archetype_id TEXT REFERENCES crop_archetypes(id),
  planting_date DATE NOT NULL,
  predicted_harvest_date DATE NOT NULL,
  predicted_yield_kg DECIMAL(8,2),
  predicted_yield_units INTEGER,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
  factors_considered JSONB DEFAULT '{}', -- fattori usati per predizione
  weather_impact JSONB DEFAULT '{}',
  soil_impact JSONB DEFAULT '{}',
  care_impact JSONB DEFAULT '{}',
  actual_harvest_date DATE,
  actual_yield_kg DECIMAL(8,2),
  actual_yield_units INTEGER,
  accuracy_score DECIMAL(3,2), -- calcolato post-raccolto
  model_version TEXT DEFAULT 'v1.0',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_yield_predictions_user ON yield_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_yield_predictions_zone ON yield_predictions(garden_zone_id);
CREATE INDEX IF NOT EXISTS idx_yield_predictions_archetype ON yield_predictions(archetype_id);
CREATE INDEX IF NOT EXISTS idx_yield_predictions_planting ON yield_predictions(planting_date);
CREATE INDEX IF NOT EXISTS idx_yield_predictions_harvest ON yield_predictions(predicted_harvest_date);

-- RLS Policy
ALTER TABLE yield_predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own yield predictions" ON yield_predictions
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- SENSOR_READINGS (Letture sensori)
-- ============================================
CREATE TABLE IF NOT EXISTS sensor_readings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  sensor_type TEXT NOT NULL CHECK (sensor_type IN ('temperature', 'humidity', 'soil_moisture', 'ph', 'light', 'co2', 'pressure', 'wind_speed', 'rainfall')),
  sensor_location TEXT,
  value DECIMAL(10,4) NOT NULL,
  unit TEXT NOT NULL,
  quality_score DECIMAL(3,2) DEFAULT 1.0, -- affidabilità lettura
  metadata JSONB DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sensor_readings_user ON sensor_readings(user_id);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_garden ON sensor_readings(garden_id);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_type ON sensor_readings(sensor_type);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_recorded ON sensor_readings(recorded_at);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_location ON sensor_readings(sensor_location);

-- RLS Policy
ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own sensor readings" ON sensor_readings
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- SOIL_ANALYSIS (Analisi suolo)
-- ============================================
CREATE TABLE IF NOT EXISTS soil_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  garden_zone_id UUID REFERENCES garden_zones(id) ON DELETE CASCADE,
  analysis_date DATE NOT NULL,
  ph_value DECIMAL(3,1),
  organic_matter_percent DECIMAL(4,2),
  nitrogen_ppm DECIMAL(8,2),
  phosphorus_ppm DECIMAL(8,2),
  potassium_ppm DECIMAL(8,2),
  calcium_ppm DECIMAL(8,2),
  magnesium_ppm DECIMAL(8,2),
  sulfur_ppm DECIMAL(8,2),
  iron_ppm DECIMAL(8,2),
  manganese_ppm DECIMAL(8,2),
  zinc_ppm DECIMAL(8,2),
  copper_ppm DECIMAL(8,2),
  boron_ppm DECIMAL(8,2),
  electrical_conductivity DECIMAL(6,2), -- EC in mS/cm
  cation_exchange_capacity DECIMAL(6,2), -- CEC
  soil_texture TEXT CHECK (soil_texture IN ('clay', 'silt', 'sand', 'loam', 'clay_loam', 'silt_loam', 'sandy_loam')),
  laboratory TEXT,
  lab_report_url TEXT,
  recommendations JSONB DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_soil_analysis_user ON soil_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_soil_analysis_garden ON soil_analysis(garden_id);
CREATE INDEX IF NOT EXISTS idx_soil_analysis_zone ON soil_analysis(garden_zone_id);
CREATE INDEX IF NOT EXISTS idx_soil_analysis_date ON soil_analysis(analysis_date);

-- RLS Policy
ALTER TABLE soil_analysis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own soil analysis" ON soil_analysis
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS PER UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Applica trigger alle tabelle con updated_at
DROP TRIGGER IF EXISTS trigger_update_api_configurations_updated_at ON api_configurations;
CREATE TRIGGER trigger_update_api_configurations_updated_at
  BEFORE UPDATE ON api_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_calendar_tasks_updated_at ON calendar_tasks;
CREATE TRIGGER trigger_update_calendar_tasks_updated_at
  BEFORE UPDATE ON calendar_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_custom_crops_updated_at ON custom_crops;
CREATE TRIGGER trigger_update_custom_crops_updated_at
  BEFORE UPDATE ON custom_crops
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_yield_predictions_updated_at ON yield_predictions;
CREATE TRIGGER trigger_update_yield_predictions_updated_at
  BEFORE UPDATE ON yield_predictions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();