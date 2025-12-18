-- ============================================
-- GRUPPO 1: CORE SCHEMA (Base)
-- ============================================
-- Questo file contiene lo schema base del database
-- DEVE essere eseguito per PRIMO su Supabase online
-- 
-- Include:
-- - Extensions
-- - Tabelle core: gardens, garden_beds, garden_tasks, harvest_logs, photo_logs, seed_inventory
-- - RLS Policies base
-- - Funzioni base
-- - Triggers base

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- GARDENS (Orti)
-- ============================================
CREATE TABLE IF NOT EXISTS gardens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  coordinates JSONB,
  size_sq_meters DECIMAL(10, 2) NOT NULL DEFAULT 0,
  size_unit TEXT CHECK (size_unit IN ('sqm', 'are', 'hectare')) DEFAULT 'sqm',
  soil_type TEXT CHECK (soil_type IN ('Clay', 'Sandy', 'Loamy', 'Peaty', 'Chalky', 'Silty')),
  soil_ph DECIMAL(3, 1) CHECK (soil_ph >= 0 AND soil_ph <= 14),
  altitude_meters INTEGER,
  delay_factor_days INTEGER,
  sun_exposure TEXT CHECK (sun_exposure IN ('FullSun', 'PartSun', 'Shade')),
  daily_sun_hours INTEGER CHECK (daily_sun_hours >= 0 AND daily_sun_hours <= 24),
  aspect_direction TEXT CHECK (aspect_direction IN ('North', 'South', 'East', 'West', 'Flat')),
  wind_protection TEXT CHECK (wind_protection IN ('High', 'Medium', 'Low')),
  has_compost_bin BOOLEAN DEFAULT false,
  is_raised_bed BOOLEAN DEFAULT false,
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
  vacation_mode JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gardens_user_id ON gardens(user_id);
CREATE INDEX IF NOT EXISTS idx_gardens_created_at ON gardens(created_at);

-- ============================================
-- GARDEN BEDS (Aiuole)
-- ============================================
CREATE TABLE IF NOT EXISTS garden_beds (
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

CREATE INDEX IF NOT EXISTS idx_garden_beds_garden_id ON garden_beds(garden_id);

-- ============================================
-- BED PLANTING HISTORY (per rotazioni)
-- ============================================
CREATE TABLE IF NOT EXISTS bed_planting_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bed_id UUID REFERENCES garden_beds(id) ON DELETE CASCADE NOT NULL,
  plant_id TEXT NOT NULL,
  plant_name TEXT NOT NULL,
  plant_family TEXT NOT NULL,
  season TEXT CHECK (season IN ('Summer', 'Winter')) NOT NULL,
  year INTEGER NOT NULL,
  planted_at TIMESTAMP WITH TIME ZONE,
  harvested_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bed_history_bed_id ON bed_planting_history(bed_id);
CREATE INDEX IF NOT EXISTS idx_bed_history_year_season ON bed_planting_history(year, season);
CREATE INDEX IF NOT EXISTS idx_bed_history_plant_family ON bed_planting_history(plant_family);

-- ============================================
-- GARDEN TASKS
-- ============================================
CREATE TABLE IF NOT EXISTS garden_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  bed_id UUID REFERENCES garden_beds(id) ON DELETE SET NULL,
  plant_name TEXT NOT NULL,
  variety TEXT,
  planting_method TEXT CHECK (planting_method IN ('Seed', 'Seedling', 'Sapling')),
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
  grid_position JSONB,
  grid_rotation INTEGER CHECK (grid_rotation >= 0 AND grid_rotation <= 360),
  user_responses JSONB,
  recorded_brix DECIMAL(4, 2),
  harvest_ready_analysis TEXT,
  harvest_history JSONB,
  final_harvest JSONB,
  strawberry_data JSONB,
  fruit_tree_data JSONB,
  aromatic_data JSONB,
  olive_data JSONB,
  vine_data JSONB,
  exotic_fruit_data JSONB,
  mechanical_work_data JSONB,
  tree_pruning_data JSONB,
  hydroponic_data JSONB,
  aquaponic_data JSONB,
  aeroponic_data JSONB,
  suggested_date DATE,
  actual_completed_date TIMESTAMP WITH TIME ZONE,
  is_suggested BOOLEAN DEFAULT false,
  suggested_by TEXT,
  images JSONB,
  last_photo_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_garden_tasks_garden_id ON garden_tasks(garden_id);
CREATE INDEX IF NOT EXISTS idx_garden_tasks_bed_id ON garden_tasks(bed_id);
CREATE INDEX IF NOT EXISTS idx_garden_tasks_date ON garden_tasks(date);
CREATE INDEX IF NOT EXISTS idx_garden_tasks_completed ON garden_tasks(completed);
CREATE INDEX IF NOT EXISTS idx_garden_tasks_plant_name ON garden_tasks(plant_name);
CREATE INDEX IF NOT EXISTS idx_garden_tasks_suggested ON garden_tasks(is_suggested) WHERE is_suggested = true;
CREATE INDEX IF NOT EXISTS idx_garden_tasks_suggested_date ON garden_tasks(suggested_date) WHERE suggested_date IS NOT NULL;

-- ============================================
-- HARVEST LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS harvest_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES garden_tasks(id) ON DELETE SET NULL,
  plant_name TEXT NOT NULL,
  quantity DECIMAL(8, 2) NOT NULL,
  unit TEXT CHECK (unit IN ('kg', 'g', 'units')) NOT NULL DEFAULT 'kg',
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  harvest_date DATE NOT NULL,
  photo TEXT,
  brix DECIMAL(4, 2),
  notes TEXT,
  suggested_recipes JSONB,
  strawberry_harvest JSONB,
  fruit_tree_harvest JSONB,
  aromatic_harvest JSONB,
  olive_harvest JSONB,
  vine_harvest JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_harvest_logs_garden_id ON harvest_logs(garden_id);
CREATE INDEX IF NOT EXISTS idx_harvest_logs_task_id ON harvest_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_harvest_logs_harvest_date ON harvest_logs(harvest_date);
CREATE INDEX IF NOT EXISTS idx_harvest_logs_plant_name ON harvest_logs(plant_name);

-- ============================================
-- PHOTO LOGS (Time-Lapse - Pro Feature)
-- ============================================
CREATE TABLE IF NOT EXISTS photo_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES garden_tasks(id) ON DELETE CASCADE NOT NULL,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT NOT NULL,
  photo_date DATE NOT NULL,
  days_from_planting INTEGER NOT NULL,
  analysis_result JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_photo_logs_task_id ON photo_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_photo_logs_garden_id ON photo_logs(garden_id);
CREATE INDEX IF NOT EXISTS idx_photo_logs_photo_date ON photo_logs(photo_date);

-- ============================================
-- SEED INVENTORY
-- ============================================
CREATE TABLE IF NOT EXISTS seed_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  variety_id TEXT NOT NULL,
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

CREATE INDEX IF NOT EXISTS idx_seed_inventory_user_id ON seed_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_seed_inventory_garden_id ON seed_inventory(garden_id);
CREATE INDEX IF NOT EXISTS idx_seed_inventory_expiry_year ON seed_inventory(expiry_year);

-- ============================================
-- WEATHER CACHE
-- ============================================
CREATE TABLE IF NOT EXISTS weather_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lat_lng TEXT NOT NULL,
  date DATE NOT NULL,
  forecast JSONB NOT NULL,
  cached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(lat_lng, date)
);

CREATE INDEX IF NOT EXISTS idx_weather_cache_lat_lng_date ON weather_cache(lat_lng, date);
CREATE INDEX IF NOT EXISTS idx_weather_cache_cached_at ON weather_cache(cached_at);

-- ============================================
-- ROW LEVEL SECURITY (RLS) - Base
-- ============================================
ALTER TABLE gardens ENABLE ROW LEVEL SECURITY;
ALTER TABLE garden_beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE bed_planting_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE garden_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE harvest_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE seed_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_cache ENABLE ROW LEVEL SECURITY;

-- Gardens: Users can only access their own gardens
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'gardens' AND policyname = 'Users can only access their gardens'
  ) THEN
    CREATE POLICY "Users can only access their gardens"
      ON gardens FOR ALL
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Garden Beds: Users can only access beds in their gardens
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'garden_beds' AND policyname = 'Users can only access beds in their gardens'
  ) THEN
    CREATE POLICY "Users can only access beds in their gardens"
      ON garden_beds FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM gardens
          WHERE gardens.id = garden_beds.garden_id
          AND gardens.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Bed Planting History: Users can only access history in their beds
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'bed_planting_history' AND policyname = 'Users can only access history in their beds'
  ) THEN
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
  END IF;
END $$;

-- Garden Tasks: Users can only access tasks in their gardens
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'garden_tasks' AND policyname = 'Users can only access tasks in their gardens'
  ) THEN
    CREATE POLICY "Users can only access tasks in their gardens"
      ON garden_tasks FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM gardens
          WHERE gardens.id = garden_tasks.garden_id
          AND gardens.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Harvest Logs: Users can only access harvests in their gardens
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'harvest_logs' AND policyname = 'Users can only access harvests in their gardens'
  ) THEN
    CREATE POLICY "Users can only access harvests in their gardens"
      ON harvest_logs FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM gardens
          WHERE gardens.id = harvest_logs.garden_id
          AND gardens.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Photo Logs: Users can only access photos in their gardens
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'photo_logs' AND policyname = 'Users can only access photos in their gardens'
  ) THEN
    CREATE POLICY "Users can only access photos in their gardens"
      ON photo_logs FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM gardens
          WHERE gardens.id = photo_logs.garden_id
          AND gardens.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Seed Inventory: Users can only access their own seeds
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'seed_inventory' AND policyname = 'Users can only access their own seeds'
  ) THEN
    CREATE POLICY "Users can only access their own seeds"
      ON seed_inventory FOR ALL
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Weather Cache: Public read
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'weather_cache' AND policyname = 'Weather cache is publicly readable'
  ) THEN
    CREATE POLICY "Weather cache is publicly readable"
      ON weather_cache FOR SELECT
      USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'weather_cache' AND policyname = 'Users can insert weather cache'
  ) THEN
    CREATE POLICY "Users can insert weather cache"
      ON weather_cache FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;

-- ============================================
-- TRIGGERS - Base
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_gardens_updated_at ON gardens;
CREATE TRIGGER update_gardens_updated_at BEFORE UPDATE ON gardens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_garden_beds_updated_at ON garden_beds;
CREATE TRIGGER update_garden_beds_updated_at BEFORE UPDATE ON garden_beds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_garden_tasks_updated_at ON garden_tasks;
CREATE TRIGGER update_garden_tasks_updated_at BEFORE UPDATE ON garden_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_seed_inventory_updated_at ON seed_inventory;
CREATE TRIGGER update_seed_inventory_updated_at BEFORE UPDATE ON seed_inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RPC FUNCTIONS - Base
-- ============================================
CREATE OR REPLACE FUNCTION check_rotation_compliance(
  p_bed_id UUID,
  p_plant_family TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_last_planting RECORD;
  v_result JSONB;
BEGIN
  SELECT plant_family, plant_name, year, season
  INTO v_last_planting
  FROM bed_planting_history
  WHERE bed_id = p_bed_id
  ORDER BY year DESC, season DESC
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'allowed', true,
      'severity', 'SUCCESS',
      'message', 'Aiuola nuova - nessuna rotazione da rispettare'
    );
  END IF;
  
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

