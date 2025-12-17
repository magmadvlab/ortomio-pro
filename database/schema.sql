-- OrtoMio AI - Supabase Database Schema
-- This schema supports both Free and Pro tiers

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- GARDENS (Orti)
-- ============================================
CREATE TABLE gardens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  coordinates JSONB, -- { latitude: number, longitude: number }
  size_sq_meters DECIMAL(10, 2) NOT NULL DEFAULT 0,
  size_unit TEXT CHECK (size_unit IN ('sqm', 'are', 'hectare')) DEFAULT 'sqm',
  soil_type TEXT CHECK (soil_type IN ('Clay', 'Sandy', 'Loamy', 'Peaty', 'Chalky', 'Silty')),
  soil_ph DECIMAL(3, 1) CHECK (soil_ph >= 0 AND soil_ph <= 14),
  
  -- GEO-CLIMA
  altitude_meters INTEGER,
  delay_factor_days INTEGER, -- Giorni ritardo semina vs costa (fallback se no altitudine)
  
  -- MICRO-CLIMA
  sun_exposure TEXT CHECK (sun_exposure IN ('FullSun', 'PartSun', 'Shade')),
  daily_sun_hours INTEGER CHECK (daily_sun_hours >= 0 AND daily_sun_hours <= 24),
  aspect_direction TEXT CHECK (aspect_direction IN ('North', 'South', 'East', 'West', 'Flat')),
  wind_protection TEXT CHECK (wind_protection IN ('High', 'Medium', 'Low')),
  
  -- INFRASTRUTTURA
  has_compost_bin BOOLEAN DEFAULT false,
  is_raised_bed BOOLEAN DEFAULT false,
  
  -- NUOVO: Tipo spazio coltivabile e configurazioni avanzate
  garden_type TEXT CHECK (
    garden_type IN (
      'OpenField', 'Greenhouse', 'Tunnel', 'RaisedBed', 
      'Indoor', 'Hydroponic', 'Aquaponic', 'Aeroponic',
      'NFT', 'DWC', 'EbbFlow', 'Drip', 'Wick', 'Kratky',
      'Orchard', 'OliveGrove', 'Vineyard'
    )
  ),
  greenhouse_config JSONB,
  indoor_config JSONB,
  hydroponic_config JSONB,
  aquaponic_config JSONB,
  aeroponic_config JSONB,
  
  -- VACATION MODE (JSONB per flessibilità)
  vacation_mode JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_gardens_user_id ON gardens(user_id);
CREATE INDEX idx_gardens_created_at ON gardens(created_at);

-- ============================================
-- GARDEN BEDS (Aiuole)
-- ============================================
CREATE TABLE garden_beds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  bed_type TEXT CHECK (bed_type IN ('RaisedBed', 'Container', 'Pot', 'Ground', 'Greenhouse', 'Hydroponic', 'Aquaponic', 'Aeroponic', 'Indoor')),
  shape TEXT CHECK (shape IN ('Rectangle', 'Circle', 'Custom')),
  length_cm DECIMAL(8, 2),
  width_cm DECIMAL(8, 2),
  diameter_cm DECIMAL(8, 2),
  size_sq_meters DECIMAL(5, 2),
  sun_exposure TEXT CHECK (sun_exposure IN ('FullSun', 'PartSun', 'Shade')),
  daily_sun_hours INTEGER,
  aspect_direction TEXT,
  soil_type TEXT,
  structure_id UUID REFERENCES gardens(id) ON DELETE SET NULL,
  structure_type TEXT CHECK (structure_type IN ('Greenhouse', 'Hydroponic', 'Aquaponic', 'Aeroponic', 'Indoor')),
  is_covered BOOLEAN DEFAULT false,
  covering_structure_id UUID REFERENCES gardens(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_garden_beds_garden_id ON garden_beds(garden_id);

-- ============================================
-- BED PLANTING HISTORY (per rotazioni)
-- ============================================
CREATE TABLE bed_planting_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bed_id UUID REFERENCES garden_beds(id) ON DELETE CASCADE NOT NULL,
  plant_id TEXT NOT NULL, -- Riferimento a plantMasterSheets.id
  plant_name TEXT NOT NULL, -- Cache per query veloci
  plant_family TEXT NOT NULL, -- 'Solanaceae', 'Cucurbitaceae', etc.
  season TEXT CHECK (season IN ('Summer', 'Winter')) NOT NULL,
  year INTEGER NOT NULL,
  planted_at TIMESTAMP WITH TIME ZONE,
  harvested_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_bed_history_bed_id ON bed_planting_history(bed_id);
CREATE INDEX idx_bed_history_year_season ON bed_planting_history(year, season);
CREATE INDEX idx_bed_history_plant_family ON bed_planting_history(plant_family);

-- ============================================
-- GARDEN TASKS
-- ============================================
CREATE TABLE garden_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  bed_id UUID REFERENCES garden_beds(id) ON DELETE SET NULL,
  
  plant_name TEXT NOT NULL,
  variety TEXT,
  planting_method TEXT CHECK (planting_method IN ('Seed', 'Seedling')),
  
  location_type TEXT CHECK (location_type IN ('Pot', 'Ground', 'RaisedBed', 'HydroponicNFT', 'HydroponicDWC', 'HydroponicEbbFlow', 'HydroponicDrip', 'HydroponicWick', 'HydroponicKratky', 'Aquaponic', 'Aeroponic', 'Indoor')),
  initial_quantity INTEGER,
  current_quantity INTEGER,
  
  task_type TEXT CHECK (task_type IN ('Sowing', 'Transplant', 'Fertilize', 'Prune', 'Harvest', 'Treatment', 'Plowing', 'Tilling', 'TreePruning')) NOT NULL,
  stage TEXT CHECK (stage IN ('Germination', 'Vegetative', 'ReadyToTransplant', 'Flowering', 'Fruiting', 'Harvested')),
  lifecycle_state TEXT CHECK (lifecycle_state IN ('Sowing', 'Germination', 'Nursing', 'Hardening', 'Transplanting', 'Production')),
  season TEXT CHECK (season IN ('Summer', 'Winter')),
  
  date DATE NOT NULL,
  expected_transplant_date DATE,
  moon_phase TEXT CHECK (moon_phase IN ('New', 'WaxingCrescent', 'FirstQuarter', 'WaxingGibbous', 'Full', 'WaningGibbous', 'LastQuarter', 'WaningCrescent')),
  
  completed BOOLEAN DEFAULT false,
  notes TEXT,
  next_due_date DATE,
  treatment_product_id TEXT,
  
  -- Visual Garden Planner
  grid_position JSONB, -- { x: number, y: number }
  grid_rotation INTEGER CHECK (grid_rotation >= 0 AND grid_rotation <= 360),
  
  -- Lifecycle Coach Responses
  user_responses JSONB, -- { germinationConfirmed?: boolean, transplantReady?: boolean, ... }
  
  -- Harvest Specifics
  recorded_brix DECIMAL(4, 2),
  harvest_ready_analysis TEXT,
  harvest_history JSONB, -- Array di HarvestLogData
  final_harvest JSONB, -- HarvestLogData
  
  -- Specialized Crop Data (Pro Features - JSONB per flessibilità)
  strawberry_data JSONB,
  fruit_tree_data JSONB,
  aromatic_data JSONB,
  olive_data JSONB,
  vine_data JSONB,
  exotic_fruit_data JSONB,
  
  -- Lavorazioni meccaniche e potatura alberi
  mechanical_work_data JSONB, -- { workType: 'Plowing'|'Tilling', equipmentType: 'Tractor'|'Manual', depth: number, area: number }
  tree_pruning_data JSONB, -- { treeType: 'Pome'|'Stone'|'Citrus'|'Nut'|'Berry', pruningType: 'Formative'|'Maintenance'|'Rejuvenation', season: 'Winter'|'Summer' }
  
  -- NUOVO: Dati sistemi idroponici/acquaponici/aeroponici
  hydroponic_data JSONB, -- { systemType: 'NFT'|'DWC'|..., reservoirId?: string, channelId?: string, bucketId?: string, phAtPlanting?: number, ecAtPlanting?: number }
  aquaponic_data JSONB, -- { systemType: 'MediaBed'|'NFT'|..., bedId?: string, phAtPlanting?: number, ammoniaAtPlanting?: number }
  aeroponic_data JSONB, -- { systemType: 'HighPressure'|'LowPressure'|..., chamberId?: string, phAtPlanting?: number, ecAtPlanting?: number }
  
  -- Tracking suggerimenti vs completamenti reali
  suggested_date DATE, -- Data suggerita dall'orchestrator
  actual_completed_date TIMESTAMP WITH TIME ZONE, -- Data effettiva di completamento (diversa da completed_at se completato in data diversa)
  is_suggested BOOLEAN DEFAULT false, -- true se generato automaticamente dall'orchestrator
  suggested_by TEXT, -- ID del task/sistema che ha suggerito questo task
  
  images JSONB, -- Array di stringhe (base64 o URLs)
  last_photo_date DATE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_garden_tasks_garden_id ON garden_tasks(garden_id);
CREATE INDEX idx_garden_tasks_bed_id ON garden_tasks(bed_id);
CREATE INDEX idx_garden_tasks_date ON garden_tasks(date);
CREATE INDEX idx_garden_tasks_completed ON garden_tasks(completed);
CREATE INDEX idx_garden_tasks_plant_name ON garden_tasks(plant_name);
CREATE INDEX idx_garden_tasks_suggested ON garden_tasks(is_suggested) WHERE is_suggested = true;
CREATE INDEX idx_garden_tasks_suggested_date ON garden_tasks(suggested_date) WHERE suggested_date IS NOT NULL;

-- ============================================
-- HARVEST LOGS
-- ============================================
CREATE TABLE harvest_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES garden_tasks(id) ON DELETE SET NULL,
  
  plant_name TEXT NOT NULL,
  quantity DECIMAL(8, 2) NOT NULL,
  unit TEXT CHECK (unit IN ('kg', 'g', 'units')) NOT NULL DEFAULT 'kg',
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  harvest_date DATE NOT NULL,
  photo TEXT, -- URL o base64
  brix DECIMAL(4, 2),
  notes TEXT,
  
  -- Suggested Recipes (JSONB)
  suggested_recipes JSONB,
  
  -- Specialized Crop Harvest Data (Pro Features - JSONB)
  strawberry_harvest JSONB,
  fruit_tree_harvest JSONB,
  aromatic_harvest JSONB,
  olive_harvest JSONB,
  vine_harvest JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_harvest_logs_garden_id ON harvest_logs(garden_id);
CREATE INDEX idx_harvest_logs_task_id ON harvest_logs(task_id);
CREATE INDEX idx_harvest_logs_harvest_date ON harvest_logs(harvest_date);
CREATE INDEX idx_harvest_logs_plant_name ON harvest_logs(plant_name);

-- ============================================
-- PHOTO LOGS (Time-Lapse - Pro Feature)
-- ============================================
CREATE TABLE photo_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES garden_tasks(id) ON DELETE CASCADE NOT NULL,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT NOT NULL, -- URL Supabase Storage
  photo_date DATE NOT NULL,
  days_from_planting INTEGER NOT NULL,
  analysis_result JSONB, -- { isHealthy, growthRate, issues, phase, leafCount }
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_photo_logs_task_id ON photo_logs(task_id);
CREATE INDEX idx_photo_logs_garden_id ON photo_logs(garden_id);
CREATE INDEX idx_photo_logs_photo_date ON photo_logs(photo_date);

-- ============================================
-- SEED INVENTORY
-- ============================================
CREATE TABLE seed_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  variety_id TEXT NOT NULL, -- Riferimento a PlantVariety.id o varietyName
  variety_name TEXT NOT NULL,
  species_name TEXT NOT NULL,
  purchase_date DATE,
  expiry_year INTEGER NOT NULL,
  is_open BOOLEAN DEFAULT false,
  quantity_remaining TEXT CHECK (quantity_remaining IN ('High', 'Medium', 'Low', 'Empty')) DEFAULT 'High',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_seed_inventory_user_id ON seed_inventory(user_id);
CREATE INDEX idx_seed_inventory_garden_id ON seed_inventory(garden_id);
CREATE INDEX idx_seed_inventory_expiry_year ON seed_inventory(expiry_year);

-- ============================================
-- SEEDLING BATCHES (Batch Semenzai)
-- ============================================
CREATE TABLE seedling_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  plant_name TEXT NOT NULL,
  variety TEXT,
  sowing_date DATE NOT NULL,
  quantity INTEGER NOT NULL,
  location TEXT CHECK (location IN ('Indoor', 'Greenhouse', 'ColdFrame')) NOT NULL,
  phase TEXT CHECK (phase IN ('Sowing', 'Germination', 'Nursing', 'Hardening', 'ReadyToTransplant')) DEFAULT 'Sowing',
  current_quantity INTEGER,
  expected_transplant_date DATE,
  notes TEXT,
  photo_log JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_seedling_batches_garden_id ON seedling_batches(garden_id);
CREATE INDEX idx_seedling_batches_sowing_date ON seedling_batches(sowing_date);
CREATE INDEX idx_seedling_batches_phase ON seedling_batches(phase);

-- RLS Policies for seedling_batches
ALTER TABLE seedling_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access seedling batches in their gardens"
  ON seedling_batches FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = seedling_batches.garden_id
      AND gardens.user_id = auth.uid()
    )
  );

CREATE TRIGGER update_seedling_batches_updated_at BEFORE UPDATE ON seedling_batches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- WEATHER CACHE
-- ============================================
CREATE TABLE weather_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lat_lng TEXT NOT NULL, -- "40.123_16.456" format
  date DATE NOT NULL,
  forecast JSONB NOT NULL, -- Array di WeatherForecast
  cached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(lat_lng, date)
);

CREATE INDEX idx_weather_cache_lat_lng_date ON weather_cache(lat_lng, date);
CREATE INDEX idx_weather_cache_cached_at ON weather_cache(cached_at);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE gardens ENABLE ROW LEVEL SECURITY;
ALTER TABLE garden_beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE bed_planting_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE garden_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE harvest_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE seed_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE seedling_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_cache ENABLE ROW LEVEL SECURITY;

-- Gardens: Users can only access their own gardens
CREATE POLICY "Users can only access their gardens"
  ON gardens FOR ALL
  USING (auth.uid() = user_id);

-- Garden Beds: Users can only access beds in their gardens
CREATE POLICY "Users can only access beds in their gardens"
  ON garden_beds FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = garden_beds.garden_id
      AND gardens.user_id = auth.uid()
    )
  );

-- Bed Planting History: Users can only access history in their beds
CREATE POLICY "Users can only access history in their beds"
  ON bed_planting_history FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM garden_beds
      JOIN gardens ON gardens.id = garden_beds.garden_id
      WHERE garden_beds.id = bed_planting_history.bed_id
      AND gardens.user_id = auth.uid()
    )
  );

-- Garden Tasks: Users can only access tasks in their gardens
CREATE POLICY "Users can only access tasks in their gardens"
  ON garden_tasks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = garden_tasks.garden_id
      AND gardens.user_id = auth.uid()
    )
  );

-- Harvest Logs: Users can only access harvests in their gardens
CREATE POLICY "Users can only access harvests in their gardens"
  ON harvest_logs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = harvest_logs.garden_id
      AND gardens.user_id = auth.uid()
    )
  );

-- Photo Logs: Users can only access photos in their gardens
CREATE POLICY "Users can only access photos in their gardens"
  ON photo_logs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = photo_logs.garden_id
      AND gardens.user_id = auth.uid()
    )
  );

-- Seed Inventory: Users can only access their own seeds
CREATE POLICY "Users can only access their own seeds"
  ON seed_inventory FOR ALL
  USING (auth.uid() = user_id);

-- Weather Cache: Public read (same data for all users in same location)
CREATE POLICY "Weather cache is publicly readable"
  ON weather_cache FOR SELECT
  USING (true);

CREATE POLICY "Users can insert weather cache"
  ON weather_cache FOR INSERT
  WITH CHECK (true);

-- ============================================
-- RPC FUNCTIONS
-- ============================================

-- Function to check rotation compliance
CREATE OR REPLACE FUNCTION check_rotation_compliance(
  p_bed_id UUID,
  p_plant_family TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_last_planting RECORD;
  v_result JSONB;
BEGIN
  -- Get last planting for this bed
  SELECT plant_family, plant_name, year, season
  INTO v_last_planting
  FROM bed_planting_history
  WHERE bed_id = p_bed_id
  ORDER BY year DESC, season DESC
  LIMIT 1;
  
  -- If no history, rotation is OK
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'allowed', true,
      'severity', 'SUCCESS',
      'message', 'Aiuola nuova - nessuna rotazione da rispettare'
    );
  END IF;
  
  -- Check if same family
  IF v_last_planting.plant_family = p_plant_family THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'severity', 'ERROR',
      'message', format('Stessa famiglia botanica dell''anno scorso (%s). Rischio malattie!', v_last_planting.plant_name),
      'lastPlanting', jsonb_build_object(
        'plantName', v_last_planting.plant_name,
        'plantFamily', v_last_planting.plant_family,
        'year', v_last_planting.year,
        'season', v_last_planting.season
      )
    );
  END IF;
  
  -- Rotation OK
  RETURN jsonb_build_object(
    'allowed', true,
    'severity', 'SUCCESS',
    'message', format('Rotazione OK - ultima pianta: %s (%s)', v_last_planting.plant_name, v_last_planting.plant_family),
    'lastPlanting', jsonb_build_object(
      'plantName', v_last_planting.plant_name,
      'plantFamily', v_last_planting.plant_family,
      'year', v_last_planting.year,
      'season', v_last_planting.season
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate harvest statistics
CREATE OR REPLACE FUNCTION calculate_harvest_stats(
  p_garden_id UUID,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_total_kg DECIMAL(10, 2);
  v_harvest_count INTEGER;
  v_avg_rating DECIMAL(3, 2);
BEGIN
  SELECT 
    COALESCE(SUM(CASE WHEN unit = 'kg' THEN quantity WHEN unit = 'g' THEN quantity / 1000 ELSE 0 END), 0),
    COUNT(*),
    COALESCE(AVG(rating), 0)
  INTO v_total_kg, v_harvest_count, v_avg_rating
  FROM harvest_logs
  WHERE garden_id = p_garden_id
    AND (p_start_date IS NULL OR harvest_date >= p_start_date)
    AND (p_end_date IS NULL OR harvest_date <= p_end_date);
  
  RETURN jsonb_build_object(
    'totalKgProduced', v_total_kg,
    'harvestCount', v_harvest_count,
    'avgRating', v_avg_rating
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_gardens_updated_at BEFORE UPDATE ON gardens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_garden_beds_updated_at BEFORE UPDATE ON garden_beds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_garden_tasks_updated_at BEFORE UPDATE ON garden_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seed_inventory_updated_at BEFORE UPDATE ON seed_inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- CUSTOM PLANS (Piani Personalizzati - Pro Feature)
-- ============================================
CREATE TABLE custom_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  garden_id UUID REFERENCES gardens(id) ON DELETE SET NULL,
  
  name TEXT NOT NULL,
  description TEXT,
  base_master_sheet_id TEXT NOT NULL,  -- Reference to master sheet
  
  -- Override parameters (JSONB for flexibility)
  overrides JSONB,
  
  -- Personal notes
  custom_notes JSONB,  -- Array of { phase, note, date }
  
  -- Custom methodologies
  custom_methods JSONB,  -- Array of { name, description, steps, applicableSeasons }
  
  -- Additional parameters
  additional_parameters JSONB,
  
  is_public BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_custom_plans_user_id ON custom_plans(user_id);
CREATE INDEX idx_custom_plans_garden_id ON custom_plans(garden_id);
CREATE INDEX idx_custom_plans_base_master_sheet ON custom_plans(base_master_sheet_id);

-- RLS Policies for custom_plans
ALTER TABLE custom_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own custom plans"
  ON custom_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public custom plans"
  ON custom_plans FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can create their own custom plans"
  ON custom_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom plans"
  ON custom_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom plans"
  ON custom_plans FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_custom_plans_updated_at BEFORE UPDATE ON custom_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- AGRONOMISTS (Agronomi di Fiducia - Pro Feature)
-- ============================================
CREATE TABLE agronomists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  specialization JSONB,  -- Array of strings
  notes TEXT,
  
  preferred_contact_method TEXT CHECK (preferred_contact_method IN ('Email', 'Phone', 'InPerson')),
  consultation_frequency TEXT CHECK (consultation_frequency IN ('Weekly', 'Monthly', 'Seasonal', 'OnDemand')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_agronomists_user_id ON agronomists(user_id);

-- RLS Policies for agronomists
ALTER TABLE agronomists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own agronomists"
  ON agronomists FOR ALL
  USING (auth.uid() = user_id);

CREATE TRIGGER update_agronomists_updated_at BEFORE UPDATE ON agronomists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- AGRONOMIST CONSULTATIONS (Consultazioni)
-- ============================================
CREATE TABLE agronomist_consultations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agronomist_id UUID REFERENCES agronomists(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  garden_id UUID REFERENCES gardens(id) ON DELETE SET NULL,
  task_id UUID REFERENCES garden_tasks(id) ON DELETE SET NULL,
  
  date DATE NOT NULL,
  consultation_type TEXT CHECK (consultation_type IN ('InPerson', 'Phone', 'Email', 'Video')),
  topic TEXT NOT NULL,
  
  advice JSONB,  -- Array of { plantName, issue, recommendation, priority, followUpDate }
  notes TEXT,
  attachments JSONB,  -- Array of URLs
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_consultations_agronomist_id ON agronomist_consultations(agronomist_id);
CREATE INDEX idx_consultations_user_id ON agronomist_consultations(user_id);
CREATE INDEX idx_consultations_task_id ON agronomist_consultations(task_id);

-- RLS Policies for consultations
ALTER TABLE agronomist_consultations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own consultations"
  ON agronomist_consultations FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- AGRONOMIST ADVICE (Consigli Agronomo)
-- ============================================
CREATE TABLE agronomist_advice (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultation_id UUID REFERENCES agronomist_consultations(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES garden_tasks(id) ON DELETE SET NULL,
  
  advice_text TEXT NOT NULL,
  category TEXT CHECK (category IN ('Fertilization', 'Pruning', 'Irrigation', 'Disease', 'Harvest', 'Other')),
  priority TEXT CHECK (priority IN ('High', 'Medium', 'Low')),
  
  apply_date DATE,
  apply_season JSONB,  -- Array of seasons
  
  applied BOOLEAN DEFAULT false,
  applied_date DATE,
  result TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_advice_consultation_id ON agronomist_advice(consultation_id);
CREATE INDEX idx_advice_task_id ON agronomist_advice(task_id);

-- RLS Policies for advice
ALTER TABLE agronomist_advice ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view advice from their consultations"
  ON agronomist_advice FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM agronomist_consultations
      WHERE agronomist_consultations.id = agronomist_advice.consultation_id
      AND agronomist_consultations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update advice from their consultations"
  ON agronomist_advice FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM agronomist_consultations
      WHERE agronomist_consultations.id = agronomist_advice.consultation_id
      AND agronomist_consultations.user_id = auth.uid()
    )
  );

-- ============================================
-- GARDEN OBSTACLES (Ostacoli per calcolo esposizione solare)
-- ============================================
CREATE TABLE IF NOT EXISTS garden_obstacles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  
  -- Posizione e dimensioni ostacolo
  azimuth DECIMAL(5, 2) NOT NULL CHECK (azimuth >= 0 AND azimuth <= 360), -- Direzione (0-360°, 0=Nord)
  height_meters DECIMAL(6, 2) NOT NULL CHECK (height_meters > 0), -- Altezza in metri
  distance_meters DECIMAL(6, 2) NOT NULL CHECK (distance_meters > 0), -- Distanza orizzontale in metri
  width_degrees DECIMAL(5, 2) DEFAULT 30 CHECK (width_degrees > 0 AND width_degrees <= 180), -- Larghezza angolare
  
  -- Tipo e sorgente
  type TEXT CHECK (type IN ('Building', 'Tree', 'Mountain', 'Other')) DEFAULT 'Other',
  source TEXT CHECK (source IN ('photo_360', 'manual', 'ai_analysis')) DEFAULT 'manual',
  
  -- Metadati
  description TEXT, -- Descrizione opzionale
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_garden_obstacles_garden_id ON garden_obstacles(garden_id);
CREATE INDEX IF NOT EXISTS idx_garden_obstacles_azimuth ON garden_obstacles(azimuth);

ALTER TABLE garden_obstacles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view obstacles in their gardens"
  ON garden_obstacles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = garden_obstacles.garden_id
      AND gardens.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create obstacles in their gardens"
  ON garden_obstacles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = garden_obstacles.garden_id
      AND gardens.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update obstacles in their gardens"
  ON garden_obstacles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = garden_obstacles.garden_id
      AND gardens.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete obstacles in their gardens"
  ON garden_obstacles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = garden_obstacles.garden_id
      AND gardens.user_id = auth.uid()
    )
  );

-- ============================================
-- GARDEN ACCESSORIES (Paletti, Reti, Fili, etc.)
-- ============================================
CREATE TABLE garden_accessories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT CHECK (category IN ('Support', 'Netting', 'Wire', 'Structure')) NOT NULL,
  
  -- Dettagli categoria
  support_type TEXT CHECK (support_type IN ('Stake', 'Tutor', 'Trellis', 'Cage')),
  netting_type TEXT CHECK (netting_type IN ('Shade', 'Hail', 'Insect', 'Harvest')),
  wire_type TEXT CHECK (wire_type IN ('Steel', 'Plastic')),
  
  -- Materiale
  material TEXT CHECK (material IN ('Wood', 'Steel', 'Plastic', 'Bamboo', 'Cane', 'Aluminum', 'Polyethylene', 'Polypropylene')) NOT NULL,
  
  -- Dimensioni
  quantity INTEGER,
  length_cm INTEGER,
  height_cm INTEGER,
  width_cm INTEGER,
  diameter_cm INTEGER,
  mesh_size_mm INTEGER,
  
  -- Utilizzo
  used_for JSONB, -- Array di nomi piante
  installation_date DATE,
  expected_lifespan_years INTEGER,
  
  -- Manutenzione
  last_maintenance DATE,
  needs_replacement BOOLEAN DEFAULT false,
  
  -- Posizione
  position JSONB, -- { x: number, y: number }
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_accessories_garden_id ON garden_accessories(garden_id);
CREATE INDEX idx_accessories_category ON garden_accessories(category);

ALTER TABLE garden_accessories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access accessories in their gardens"
  ON garden_accessories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = garden_accessories.garden_id
      AND gardens.user_id = auth.uid()
    )
  );

-- ============================================
-- HYDROPONIC READINGS (Monitoraggio parametri idroponica)
-- ============================================
CREATE TABLE hydroponic_readings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  reading_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ph DECIMAL(3, 2) CHECK (ph >= 0 AND ph <= 14),
  ec DECIMAL(5, 2), -- mS/cm
  water_temperature DECIMAL(4, 1), -- °C
  reservoir_volume DECIMAL(6, 2), -- Litri
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_hydroponic_readings_garden_date ON hydroponic_readings(garden_id, reading_date DESC);

ALTER TABLE hydroponic_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access hydroponic readings in their gardens"
  ON hydroponic_readings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = hydroponic_readings.garden_id
      AND gardens.user_id = auth.uid()
    )
  );

-- ============================================
-- AQUAPONIC READINGS (Monitoraggio parametri acquaponica)
-- ============================================
CREATE TABLE aquaponic_readings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  reading_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ph DECIMAL(3, 2) CHECK (ph >= 0 AND ph <= 14),
  ammonia DECIMAL(5, 2), -- mg/L
  nitrite DECIMAL(5, 2), -- mg/L
  nitrate DECIMAL(5, 2), -- mg/L
  water_temperature DECIMAL(4, 1), -- °C
  dissolved_oxygen DECIMAL(4, 2), -- mg/L
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_aquaponic_readings_garden_date ON aquaponic_readings(garden_id, reading_date DESC);

ALTER TABLE aquaponic_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access aquaponic readings in their gardens"
  ON aquaponic_readings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = aquaponic_readings.garden_id
      AND gardens.user_id = auth.uid()
    )
  );

CREATE TRIGGER update_garden_obstacles_updated_at BEFORE UPDATE ON garden_obstacles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

