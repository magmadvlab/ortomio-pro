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
  size_sq_meters DECIMAL(5, 2),
  daily_sun_hours INTEGER,
  aspect_direction TEXT,
  soil_type TEXT,
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
  
  location_type TEXT CHECK (location_type IN ('Pot', 'Ground', 'RaisedBed')),
  initial_quantity INTEGER,
  current_quantity INTEGER,
  
  task_type TEXT CHECK (task_type IN ('Sowing', 'Transplant', 'Fertilize', 'Prune', 'Harvest', 'Treatment')) NOT NULL,
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

