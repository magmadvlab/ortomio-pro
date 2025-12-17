-- ============================================
-- OrtoMio AI - Complete Database Schema
-- Script completo per ricostruire il database da zero
-- Include tutte le correzioni: tier system (FREE, PLUS, PRO), lavorazioni meccaniche, etc.
-- ============================================

-- ATTENZIONE: Questo script DROPPA tutte le tabelle esistenti!
-- Usa solo su database di sviluppo o dopo aver fatto un backup completo.

-- ============================================
-- STEP 1: DROP ALL TABLES (in ordine corretto per rispettare foreign keys)
-- ============================================

-- Drop professional tables first
DROP TABLE IF EXISTS crop_mechanical_works CASCADE;
DROP TABLE IF EXISTS mechanical_work_register CASCADE;
DROP TABLE IF EXISTS treatment_register CASCADE;
DROP TABLE IF EXISTS professional_analytics CASCADE;

-- Drop credit transactions
DROP TABLE IF EXISTS ai_credit_transactions CASCADE;

-- Drop agronomist tables
DROP TABLE IF EXISTS agronomist_advice CASCADE;
DROP TABLE IF EXISTS agronomist_consultations CASCADE;
DROP TABLE IF EXISTS agronomists CASCADE;

-- Drop calendar/challenge tables
DROP TABLE IF EXISTS user_badges CASCADE;
DROP TABLE IF EXISTS challenge_completions CASCADE;
DROP TABLE IF EXISTS calendar_tasks CASCADE;

-- Drop specialized tables
DROP TABLE IF EXISTS crop_learning_events CASCADE;
DROP TABLE IF EXISTS custom_crops CASCADE;
DROP TABLE IF EXISTS garden_season_analyses CASCADE;
DROP TABLE IF EXISTS garden_correlations CASCADE;
DROP TABLE IF EXISTS garden_patterns CASCADE;
DROP TABLE IF EXISTS garden_tree_memories CASCADE;
DROP TABLE IF EXISTS garden_zone_memories CASCADE;
DROP TABLE IF EXISTS aquaponic_readings CASCADE;
DROP TABLE IF EXISTS hydroponic_readings CASCADE;
DROP TABLE IF EXISTS garden_accessories CASCADE;
DROP TABLE IF EXISTS garden_obstacles CASCADE;
DROP TABLE IF EXISTS custom_plans CASCADE;

-- Drop main tables
DROP TABLE IF EXISTS photo_logs CASCADE;
DROP TABLE IF EXISTS harvest_logs CASCADE;
DROP TABLE IF EXISTS garden_tasks CASCADE;
DROP TABLE IF EXISTS bed_planting_history CASCADE;
DROP TABLE IF EXISTS garden_beds CASCADE;
DROP TABLE IF EXISTS seed_inventory CASCADE;
DROP TABLE IF EXISTS seedling_batches CASCADE;
DROP TABLE IF EXISTS weather_cache CASCADE;
DROP TABLE IF EXISTS gardens CASCADE;

-- Drop profiles last (referenced by auth.users)
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS check_rotation_compliance(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS calculate_harvest_stats(UUID, DATE, DATE) CASCADE;
DROP FUNCTION IF EXISTS deduct_credits(UUID, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS grant_credits(UUID, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS handle_new_user_credits() CASCADE;

-- Drop triggers
DROP TRIGGER IF EXISTS on_user_created_credits ON auth.users CASCADE;

-- ============================================
-- STEP 2: ENABLE EXTENSIONS
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- STEP 3: BASE SCHEMA (schema.sql)
-- ============================================

-- GARDENS
CREATE TABLE gardens (
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
      'NFT', 'DWC', 'EbbFlow', 'Drip', 'Wick', 'Kratky'
    )
  ),
  greenhouse_config JSONB,
  indoor_config JSONB,
  hydroponic_config JSONB,
  aquaponic_config JSONB,
  aeroponic_config JSONB,
  structure_config JSONB,
  vacation_mode JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_gardens_user_id ON gardens(user_id);
CREATE INDEX idx_gardens_created_at ON gardens(created_at);

-- GARDEN BEDS
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

-- BED PLANTING HISTORY
CREATE TABLE bed_planting_history (
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

CREATE INDEX idx_bed_history_bed_id ON bed_planting_history(bed_id);
CREATE INDEX idx_bed_history_year_season ON bed_planting_history(year, season);
CREATE INDEX idx_bed_history_plant_family ON bed_planting_history(plant_family);

-- ============================================
-- CROP ARCHETYPES (Sistema Archetipi 3 Livelli)
-- ============================================
CREATE TABLE IF NOT EXISTS crop_archetypes (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  icon TEXT NOT NULL,
  botanical_family TEXT NOT NULL,
  default_profile_id UUID REFERENCES crop_profiles(id),
  parent_archetype_id TEXT REFERENCES crop_archetypes(id),
  examples TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_archetypes_parent ON crop_archetypes(parent_archetype_id);

CREATE TABLE IF NOT EXISTS crop_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  archetype_id TEXT REFERENCES crop_archetypes(id),
  root_zone_depth_cm_default INTEGER NOT NULL,
  root_zone_depth_cm_min INTEGER,
  root_zone_depth_cm_max INTEGER,
  kc_json JSONB NOT NULL,
  stress_depletion_p_default DECIMAL(3, 2) DEFAULT 0.5,
  nutrient_plan_json JSONB,
  irrigation_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_profiles_archetype ON crop_profiles(archetype_id);

CREATE TABLE IF NOT EXISTS crop_aliases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alias_text TEXT NOT NULL,
  archetype_id TEXT REFERENCES crop_archetypes(id) NOT NULL,
  region TEXT,
  province TEXT,
  confidence DECIMAL(3, 2) DEFAULT 1.0,
  created_by UUID REFERENCES auth.users(id),
  usage_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(alias_text, region, province)
);

CREATE INDEX idx_aliases_text ON crop_aliases(alias_text);
CREATE INDEX idx_aliases_archetype ON crop_aliases(archetype_id);
CREATE INDEX idx_aliases_region ON crop_aliases(region, province);

CREATE TABLE IF NOT EXISTS official_crops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  archetype_id TEXT REFERENCES crop_archetypes(id) NOT NULL,
  profile_override_id UUID REFERENCES crop_profiles(id),
  scientific_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_official_crops_archetype ON official_crops(archetype_id);
CREATE INDEX idx_official_crops_name ON official_crops(name);

-- GARDEN TASKS
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
  
  -- Sistema Archetipi
  archetype_id TEXT REFERENCES crop_archetypes(id),
  root_zone_depth_cm INTEGER,
  irrigation_setup JSONB,
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

CREATE INDEX idx_garden_tasks_garden_id ON garden_tasks(garden_id);
CREATE INDEX idx_garden_tasks_bed_id ON garden_tasks(bed_id);
CREATE INDEX idx_garden_tasks_date ON garden_tasks(date);
CREATE INDEX idx_garden_tasks_completed ON garden_tasks(completed);
CREATE INDEX idx_garden_tasks_plant_name ON garden_tasks(plant_name);
CREATE INDEX idx_garden_tasks_suggested ON garden_tasks(is_suggested) WHERE is_suggested = true;
CREATE INDEX idx_garden_tasks_suggested_date ON garden_tasks(suggested_date) WHERE suggested_date IS NOT NULL;
CREATE INDEX idx_tasks_archetype ON garden_tasks(archetype_id);

-- HARVEST LOGS
CREATE TABLE harvest_logs (
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

CREATE INDEX idx_harvest_logs_garden_id ON harvest_logs(garden_id);
CREATE INDEX idx_harvest_logs_task_id ON harvest_logs(task_id);
CREATE INDEX idx_harvest_logs_harvest_date ON harvest_logs(harvest_date);
CREATE INDEX idx_harvest_logs_plant_name ON harvest_logs(plant_name);

-- PHOTO LOGS
CREATE TABLE photo_logs (
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

CREATE INDEX idx_photo_logs_task_id ON photo_logs(task_id);
CREATE INDEX idx_photo_logs_garden_id ON photo_logs(garden_id);
CREATE INDEX idx_photo_logs_photo_date ON photo_logs(photo_date);

-- SEED INVENTORY
CREATE TABLE seed_inventory (
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

CREATE INDEX idx_seed_inventory_user_id ON seed_inventory(user_id);
CREATE INDEX idx_seed_inventory_garden_id ON seed_inventory(garden_id);
CREATE INDEX idx_seed_inventory_expiry_year ON seed_inventory(expiry_year);

-- SEEDLING BATCHES
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

-- WEATHER CACHE
CREATE TABLE weather_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lat_lng TEXT NOT NULL,
  date DATE NOT NULL,
  forecast JSONB NOT NULL,
  cached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(lat_lng, date)
);

CREATE INDEX idx_weather_cache_lat_lng_date ON weather_cache(lat_lng, date);
CREATE INDEX idx_weather_cache_cached_at ON weather_cache(cached_at);

-- CUSTOM PLANS
CREATE TABLE custom_plans (
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

CREATE INDEX idx_custom_plans_user_id ON custom_plans(user_id);
CREATE INDEX idx_custom_plans_garden_id ON custom_plans(garden_id);
CREATE INDEX idx_custom_plans_base_master_sheet ON custom_plans(base_master_sheet_id);

-- AGRONOMISTS
CREATE TABLE agronomists (
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

CREATE INDEX idx_agronomists_user_id ON agronomists(user_id);

-- AGRONOMIST CONSULTATIONS
CREATE TABLE agronomist_consultations (
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

CREATE INDEX idx_consultations_agronomist_id ON agronomist_consultations(agronomist_id);
CREATE INDEX idx_consultations_user_id ON agronomist_consultations(user_id);
CREATE INDEX idx_consultations_task_id ON agronomist_consultations(task_id);

-- AGRONOMIST ADVICE
CREATE TABLE agronomist_advice (
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

CREATE INDEX idx_advice_consultation_id ON agronomist_advice(consultation_id);
CREATE INDEX idx_advice_task_id ON agronomist_advice(task_id);

-- GARDEN OBSTACLES
CREATE TABLE garden_obstacles (
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

CREATE INDEX idx_garden_obstacles_garden_id ON garden_obstacles(garden_id);
CREATE INDEX idx_garden_obstacles_azimuth ON garden_obstacles(azimuth);

-- GARDEN ACCESSORIES
CREATE TABLE garden_accessories (
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

CREATE INDEX idx_accessories_garden_id ON garden_accessories(garden_id);
CREATE INDEX idx_accessories_category ON garden_accessories(category);

-- HYDROPONIC READINGS
CREATE TABLE hydroponic_readings (
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

CREATE INDEX idx_hydroponic_readings_garden_date ON hydroponic_readings(garden_id, reading_date DESC);

-- AQUAPONIC READINGS
CREATE TABLE aquaponic_readings (
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

CREATE INDEX idx_aquaponic_readings_garden_date ON aquaponic_readings(garden_id, reading_date DESC);

-- CALENDAR TASKS
CREATE TABLE calendar_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('semina','irrigazione','raccolta','potatura','concimazione','trattamento','altro')) NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  recurring BOOLEAN DEFAULT false,
  recurring_pattern JSONB,
  plant_id UUID,
  plant_name TEXT,
  completed BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_calendar_tasks_user_date ON calendar_tasks(user_id, start_date);
CREATE INDEX idx_calendar_tasks_garden ON calendar_tasks(garden_id);
CREATE INDEX idx_calendar_tasks_recurring ON calendar_tasks(recurring) WHERE recurring = true;

-- CHALLENGE COMPLETIONS
CREATE TABLE challenge_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  challenge_id TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  actions_completed INTEGER[],
  photo_url TEXT,
  points_awarded INTEGER NOT NULL,
  badge_earned TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);

CREATE INDEX idx_challenge_completions_user ON challenge_completions(user_id);
CREATE INDEX idx_challenge_completions_date ON challenge_completions(completed_at);
CREATE INDEX idx_challenge_completions_challenge ON challenge_completions(challenge_id);

-- USER BADGES
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_id TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  badge_emoji TEXT NOT NULL,
  badge_description TEXT,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_user_badges_user ON user_badges(user_id);
CREATE INDEX idx_user_badges_earned ON user_badges(earned_at);

-- ============================================
-- STEP 4: PROFILES TABLE (con tier system corretto: FREE, PLUS, PRO)
-- ============================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tier TEXT DEFAULT 'FREE' CHECK (tier IN ('FREE', 'PLUS', 'PRO')),
  ai_credits_total INTEGER DEFAULT 0,
  ai_credits_used INTEGER DEFAULT 0,
  ai_credits_reset_date DATE DEFAULT (DATE_TRUNC('month', NOW()) + INTERVAL '1 month')::DATE,
  -- Geolocalizzazione e gamification
  regione TEXT,
  provincia TEXT,
  comune TEXT,
  zona TEXT CHECK (zona IN ('nord','centro','sud','isole')),
  clima TEXT CHECK (clima IN ('alpino','continentale','mediterraneo','subtropicale')),
  location_lat FLOAT,
  location_lng FLOAT,
  location_manual BOOLEAN DEFAULT false,
  streak_current INTEGER DEFAULT 0,
  streak_longest INTEGER DEFAULT 0,
  streak_last_date DATE,
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- STEP 5: AI CREDIT TRANSACTIONS
-- ============================================

CREATE TABLE ai_credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('monthly_grant', 'purchase', 'usage', 'bonus', 'refund')),
  feature TEXT,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_credit_transactions_user ON ai_credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created ON ai_credit_transactions(created_at DESC);

-- ============================================
-- STEP 6: PROFESSIONAL SCHEMA (con tutte le correzioni)
-- ============================================

-- PROFESSIONAL ANALYTICS
CREATE TABLE professional_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  crop_name TEXT NOT NULL,
  season TEXT NOT NULL CHECK (season IN ('Summer', 'Winter')),
  year INTEGER NOT NULL,
  total_kg DECIMAL(10, 2),
  total_revenue DECIMAL(10, 2),
  total_costs DECIMAL(10, 2),
  roi_percentage DECIMAL(5, 2),
  yield_per_sqm DECIMAL(8, 2),
  costs_breakdown JSONB,
  production_breakdown JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_professional_analytics_user ON professional_analytics(user_id);
CREATE INDEX idx_professional_analytics_garden ON professional_analytics(garden_id);
CREATE INDEX idx_professional_analytics_year ON professional_analytics(year);
CREATE INDEX idx_professional_analytics_crop ON professional_analytics(crop_name);

-- TREATMENT REGISTER
CREATE TABLE treatment_register (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  crop_name TEXT NOT NULL,
  treatment_date DATE NOT NULL,
  product_name TEXT NOT NULL,
  active_ingredient TEXT,
  dosage DECIMAL(8, 2),
  dosage_unit TEXT CHECK (dosage_unit IN ('ml', 'g', 'kg', 'L')),
  area_treated DECIMAL(8, 2),
  method TEXT CHECK (method IN ('spray', 'soil', 'seed', 'foliar')),
  reason TEXT CHECK (reason IN ('preventive', 'curative', 'pest_control', 'disease_control', 'nutrient')),
  weather_conditions JSONB,
  operator_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_treatment_register_user ON treatment_register(user_id);
CREATE INDEX idx_treatment_register_date ON treatment_register(treatment_date DESC);
CREATE INDEX idx_treatment_register_garden ON treatment_register(garden_id);
CREATE INDEX idx_treatment_register_crop ON treatment_register(crop_name);

-- MECHANICAL WORK REGISTER (con tutte le nuove lavorazioni)
CREATE TABLE mechanical_work_register (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  work_type TEXT NOT NULL CHECK (work_type IN (
    -- Suolo (esistenti)
    'Plowing', 'Subsoiling', 'Harrowing', 'Tilling', 'Rolling', 'Hoeing', 'EarthingUp', 'Mulching', 'PostSowingRolling',
    -- Preparazione Terreno (nuove)
    'Clearing', 'Stumping', 'StoneRemoval', 'Leveling', 'DeepSubsoiling',
    'Digging', 'DeepHarrowing', 'Crumbling', 'Scraping', 'SurfaceLeveling',
    -- Tecniche Moderne
    'MinimumTillage', 'StripTillage', 'NoTill',
    -- Chioma
    'FormativePruning', 'MaintenancePruning', 'RejuvenationPruning', 'SummerPruning', 'WinterPruning', 
    'Thinning', 'Suckering', 'Defoliation', 'Tying', 'OliveShredding', 'RunnerManagement', 
    'StrawberryMulching', 'StrawberryCleaning', 'CaneRemoval', 'TipPruning', 'RaspberryTying', 
    'SuckerThinning', 'FruitBagging', 'ExoticThinning', 'Shredding',
    -- Generale
    'Topping', 'Pruning'
  )),
  work_date DATE NOT NULL,
  area_m2 DECIMAL(10, 2) NOT NULL,
  depth_cm DECIMAL(5, 2),
  equipment_type TEXT CHECK (equipment_type IN (
    'Tractor', 'RotaryHarrow', 'Shredder', 'FertilizerSpreader', 'Seeder', 
    'Topper', 'Defoliator', 'PrePruner', 'Thinner',
    'Rototiller', 'Cultivator', 'Mower', 'BrushCutter', 'TrackedCart', 'BackpackSprayer',
    'ElectricTier', 'ElectricPruner', 'TelescopicPruner',
    'Manual'
  )),
  equipment_attachment TEXT,
  work_metadata JSONB,
  weather_conditions JSONB,
  operator_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mechanical_work_user ON mechanical_work_register(user_id);
CREATE INDEX idx_mechanical_work_date ON mechanical_work_register(work_date DESC);
CREATE INDEX idx_mechanical_work_garden ON mechanical_work_register(garden_id);
CREATE INDEX idx_mechanical_work_type ON mechanical_work_register(work_type);

-- CROP MECHANICAL WORKS
CREATE TABLE crop_mechanical_works (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_id TEXT NOT NULL,
  crop_name TEXT NOT NULL,
  work_type TEXT NOT NULL,
  priority INTEGER DEFAULT 0 CHECK (priority >= 0 AND priority <= 10),
  timing JSONB,
  equipment_suggested TEXT[],
  critical BOOLEAN DEFAULT false,
  frequency TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_crop_mechanical_works_crop_id ON crop_mechanical_works(crop_id);
CREATE INDEX idx_crop_mechanical_works_work_type ON crop_mechanical_works(work_type);
CREATE INDEX idx_crop_mechanical_works_priority ON crop_mechanical_works(priority DESC);

-- CUSTOM CROPS (Pro Feature - Learning System)
CREATE TABLE custom_crops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  garden_id UUID REFERENCES gardens(id) ON DELETE SET NULL,
  
  common_name TEXT NOT NULL,
  scientific_name TEXT,
  family TEXT,
  
  -- Dati iniziali opzionali (il sistema impara)
  initial_data JSONB DEFAULT '{}'::jsonb,
  
  -- Pattern appresi dal sistema
  learned_patterns JSONB DEFAULT '{}'::jsonb,
  
  -- Statistiche
  stats JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_custom_crops_user_id ON custom_crops(user_id);
CREATE INDEX idx_custom_crops_garden_id ON custom_crops(garden_id);
CREATE INDEX idx_custom_crops_common_name ON custom_crops(common_name);

-- CROP LEARNING EVENTS (Pro Feature - Learning System)
CREATE TABLE crop_learning_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  custom_crop_id UUID REFERENCES custom_crops(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  garden_id UUID REFERENCES gardens(id) ON DELETE SET NULL,
  
  event_type TEXT NOT NULL CHECK (event_type IN ('planting', 'harvest', 'work', 'treatment', 'problem', 'fertilize')),
  event_data JSONB NOT NULL,
  outcome JSONB, -- Risultato (es. yield, success/failure)
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_learning_events_crop_id ON crop_learning_events(custom_crop_id);
CREATE INDEX idx_learning_events_user_id ON crop_learning_events(user_id);
CREATE INDEX idx_learning_events_type ON crop_learning_events(event_type);
CREATE INDEX idx_learning_events_created_at ON crop_learning_events(created_at DESC);

-- GARDEN MEMORY TABLES (se non esistono già, vengono create qui)
-- Queste tabelle supportano il sistema di memoria contestuale del giardino
CREATE TABLE IF NOT EXISTS garden_zone_memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  zone_id UUID, -- Riferimento a garden_beds.id o garden_points.id (può essere NULL per orti senza zone)
  zone_name TEXT, -- Nome zona (cache per query veloci)
  custom_crop_id UUID REFERENCES custom_crops(id) ON DELETE SET NULL, -- Supporto per colture personalizzate
  
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

CREATE TABLE IF NOT EXISTS garden_tree_memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  tree_id UUID, -- Identificatore univoco dell'albero
  tree_name TEXT NOT NULL,
  custom_crop_id UUID REFERENCES custom_crops(id) ON DELETE SET NULL, -- Supporto per colture personalizzate
  
  -- Storia produzione
  production_history JSONB DEFAULT '[]'::jsonb,
  
  -- Pattern alternanza
  alternance_pattern JSONB DEFAULT '{}'::jsonb,
  
  -- Storia potature
  pruning_history JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS garden_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  pattern_type TEXT NOT NULL, -- 'planting_timing', 'harvest_timing', 'problem_recurrence', etc.
  custom_crop_id UUID REFERENCES custom_crops(id) ON DELETE SET NULL, -- Supporto per colture personalizzate
  pattern_data JSONB NOT NULL,
  confidence DECIMAL(3, 2) DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS garden_correlations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  correlation_type TEXT NOT NULL, -- 'work_yield', 'treatment_problem', etc.
  custom_crop_id UUID REFERENCES custom_crops(id) ON DELETE SET NULL, -- Supporto per colture personalizzate
  factor_a TEXT NOT NULL,
  factor_b TEXT NOT NULL,
  strength DECIMAL(3, 2) DEFAULT 0.5 CHECK (strength >= 0 AND strength <= 1),
  correlation_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS garden_season_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  season TEXT NOT NULL CHECK (season IN ('Spring', 'Summer', 'Fall', 'Winter')),
  year INTEGER NOT NULL,
  analysis_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(garden_id, season, year)
);

-- Indici per garden memory
CREATE INDEX IF NOT EXISTS idx_zone_memories_garden_id ON garden_zone_memories(garden_id);
CREATE INDEX IF NOT EXISTS idx_zone_memories_custom_crop_id ON garden_zone_memories(custom_crop_id);
CREATE INDEX IF NOT EXISTS idx_tree_memories_garden_id ON garden_tree_memories(garden_id);
CREATE INDEX IF NOT EXISTS idx_tree_memories_custom_crop_id ON garden_tree_memories(custom_crop_id);
CREATE INDEX IF NOT EXISTS idx_patterns_garden_id ON garden_patterns(garden_id);
CREATE INDEX IF NOT EXISTS idx_patterns_custom_crop_id ON garden_patterns(custom_crop_id);
CREATE INDEX IF NOT EXISTS idx_correlations_garden_id ON garden_correlations(garden_id);
CREATE INDEX IF NOT EXISTS idx_correlations_custom_crop_id ON garden_correlations(custom_crop_id);
CREATE INDEX IF NOT EXISTS idx_season_analyses_garden_id ON garden_season_analyses(garden_id);

-- ============================================
-- STEP 7: FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION deduct_credits(p_user_id UUID, p_amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET ai_credits_used = ai_credits_used + p_amount
  WHERE id = p_user_id
    AND (ai_credits_total - ai_credits_used) >= p_amount;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'insufficient_credits';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION grant_credits(p_user_id UUID, p_amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET ai_credits_total = ai_credits_total + p_amount
  WHERE id = p_user_id;
  
  -- Se il profilo non esiste, crealo
  IF NOT FOUND THEN
    INSERT INTO profiles (id, tier, ai_credits_total, ai_credits_used)
    VALUES (p_user_id, 'FREE', p_amount, 0)
    ON CONFLICT (id) DO UPDATE
    SET ai_credits_total = profiles.ai_credits_total + p_amount;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION handle_new_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  -- Usa un blocco con gestione errori per evitare che errori blocchino il login
  BEGIN
    -- Crea profilo se non esiste
    INSERT INTO profiles (id, tier, ai_credits_total, ai_credits_used)
    VALUES (NEW.id, 'FREE', 3, 0)
    ON CONFLICT (id) DO NOTHING;
    
    -- Verifica se il bonus welcome è già stato dato
    IF NOT EXISTS (
      SELECT 1 FROM ai_credit_transactions 
      WHERE user_id = NEW.id 
        AND type = 'bonus' 
        AND description LIKE '%Welcome%'
    ) THEN
      -- Concedi crediti iniziali
      PERFORM grant_credits(NEW.id, 3);
      
      -- Registra transazione
      INSERT INTO ai_credit_transactions (user_id, amount, type, description)
      VALUES (NEW.id, 3, 'bonus', 'Welcome bonus - 3 free AI credits')
      ON CONFLICT DO NOTHING;
    END IF;
    
  EXCEPTION
    WHEN OTHERS THEN
      -- Log errore ma non bloccare il login
      -- In produzione, potresti voler loggare questo errore
      RAISE WARNING 'Error in handle_new_user_credits for user %: %', NEW.id, SQLERRM;
      -- Continua comunque, non bloccare il login
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- ============================================
-- ADMIN FUNCTIONS (Superadmin Management)
-- ============================================

-- Function to create superadmin user
CREATE OR REPLACE FUNCTION create_superadmin(
  p_email TEXT,
  p_password TEXT DEFAULT 'SuperAdmin123!'
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_email;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User % does not exist in auth.users. Please create the user via Supabase Auth API first.', p_email;
  END IF;
  
  INSERT INTO profiles (id, tier, ai_credits_total, ai_credits_used)
  VALUES (v_user_id, 'PRO', 999999, 0)
  ON CONFLICT (id) DO UPDATE
  SET tier = 'PRO',
      ai_credits_total = 999999,
      ai_credits_used = 0;
  
  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function to set user tier (admin only)
CREATE OR REPLACE FUNCTION set_user_tier(
  p_user_id UUID,
  p_tier TEXT
)
RETURNS VOID AS $$
BEGIN
  IF p_tier NOT IN ('FREE', 'PLUS', 'PRO', 'PRO_CONSUMER', 'PRO_PROFESSIONAL') THEN
    RAISE EXCEPTION 'Invalid tier: %. Must be FREE, PLUS, PRO (or legacy PRO_CONSUMER, PRO_PROFESSIONAL)', p_tier;
  END IF;
  
  INSERT INTO profiles (id, tier)
  VALUES (p_user_id, p_tier::TEXT)
  ON CONFLICT (id) DO UPDATE
  SET tier = p_tier::TEXT,
      updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function to grant credits to user
CREATE OR REPLACE FUNCTION admin_grant_credits(
  p_user_id UUID,
  p_amount INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET ai_credits_total = ai_credits_total + p_amount
  WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User % not found', p_user_id;
  END IF;
  
  INSERT INTO ai_credit_transactions (user_id, amount, type, description)
  VALUES (p_user_id, p_amount, 'bonus', 'Admin granted credits');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function to list all users (admin view)
CREATE OR REPLACE FUNCTION list_all_users()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  tier TEXT,
  credits_total INTEGER,
  credits_used INTEGER,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    COALESCE(p.tier, 'FREE')::TEXT as tier,
    COALESCE(p.ai_credits_total, 0) as credits_total,
    COALESCE(p.ai_credits_used, 0) as credits_used,
    u.created_at
  FROM auth.users u
  LEFT JOIN profiles p ON p.id = u.id
  ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- ============================================
-- STEP 8: TRIGGERS
-- ============================================

CREATE TRIGGER update_gardens_updated_at BEFORE UPDATE ON gardens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_garden_beds_updated_at BEFORE UPDATE ON garden_beds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_garden_tasks_updated_at BEFORE UPDATE ON garden_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seed_inventory_updated_at BEFORE UPDATE ON seed_inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seedling_batches_updated_at BEFORE UPDATE ON seedling_batches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_plans_updated_at BEFORE UPDATE ON custom_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agronomists_updated_at BEFORE UPDATE ON agronomists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_garden_obstacles_updated_at BEFORE UPDATE ON garden_obstacles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_tasks_updated_at BEFORE UPDATE ON calendar_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_crops_updated_at BEFORE UPDATE ON custom_crops
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER on_user_created_credits
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user_credits();

-- ============================================
-- STEP 9: ROW LEVEL SECURITY (RLS)
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
ALTER TABLE custom_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE agronomists ENABLE ROW LEVEL SECURITY;
ALTER TABLE agronomist_consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE agronomist_advice ENABLE ROW LEVEL SECURITY;
ALTER TABLE garden_obstacles ENABLE ROW LEVEL SECURITY;
ALTER TABLE garden_accessories ENABLE ROW LEVEL SECURITY;
ALTER TABLE hydroponic_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE aquaponic_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_register ENABLE ROW LEVEL SECURITY;
ALTER TABLE mechanical_work_register ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_mechanical_works ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_learning_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE garden_zone_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE garden_tree_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE garden_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE garden_correlations ENABLE ROW LEVEL SECURITY;
ALTER TABLE garden_season_analyses ENABLE ROW LEVEL SECURITY;

-- Gardens policies
CREATE POLICY "Users can only access their gardens"
  ON gardens FOR ALL
  USING ((select auth.uid()) = user_id);

-- Garden Beds policies
CREATE POLICY "Users can only access beds in their gardens"
  ON garden_beds FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = garden_beds.garden_id
      AND gardens.user_id = (select auth.uid())
    )
  );

-- Bed Planting History policies
CREATE POLICY "Users can only access history in their beds"
  ON bed_planting_history FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM garden_beds
      JOIN gardens ON gardens.id = garden_beds.garden_id
      WHERE garden_beds.id = bed_planting_history.bed_id
      AND gardens.user_id = (select auth.uid())
    )
  );

-- Garden Tasks policies
CREATE POLICY "Users can only access tasks in their gardens"
  ON garden_tasks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = garden_tasks.garden_id
      AND gardens.user_id = (select auth.uid())
    )
  );

-- Harvest Logs policies
CREATE POLICY "Users can only access harvests in their gardens"
  ON harvest_logs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = harvest_logs.garden_id
      AND gardens.user_id = (select auth.uid())
    )
  );

-- Photo Logs policies
CREATE POLICY "Users can only access photos in their gardens"
  ON photo_logs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = photo_logs.garden_id
      AND gardens.user_id = (select auth.uid())
    )
  );

-- Seed Inventory policies
CREATE POLICY "Users can only access their own seeds"
  ON seed_inventory FOR ALL
  USING ((select auth.uid()) = user_id);

-- Seedling Batches policies
CREATE POLICY "Users can access seedling batches in their gardens"
  ON seedling_batches FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = seedling_batches.garden_id
      AND gardens.user_id = (select auth.uid())
    )
  );

-- Weather Cache policies
CREATE POLICY "Weather cache is publicly readable"
  ON weather_cache FOR SELECT
  USING (true);

CREATE POLICY "Users can insert weather cache"
  ON weather_cache FOR INSERT
  WITH CHECK (true);

-- Custom Plans policies
CREATE POLICY "Users can view their own or public custom plans"
  ON custom_plans FOR SELECT
  USING ((select auth.uid()) = user_id OR is_public = true);

CREATE POLICY "Users can create their own custom plans"
  ON custom_plans FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own custom plans"
  ON custom_plans FOR UPDATE
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own custom plans"
  ON custom_plans FOR DELETE
  USING ((select auth.uid()) = user_id);

-- Agronomists policies
CREATE POLICY "Users can manage their own agronomists"
  ON agronomists FOR ALL
  USING ((select auth.uid()) = user_id);

-- Consultations policies
CREATE POLICY "Users can manage their own consultations"
  ON agronomist_consultations FOR ALL
  USING ((select auth.uid()) = user_id);

-- Advice policies
CREATE POLICY "Users can view advice from their consultations"
  ON agronomist_advice FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM agronomist_consultations
      WHERE agronomist_consultations.id = agronomist_advice.consultation_id
      AND agronomist_consultations.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can update advice from their consultations"
  ON agronomist_advice FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM agronomist_consultations
      WHERE agronomist_consultations.id = agronomist_advice.consultation_id
      AND agronomist_consultations.user_id = (select auth.uid())
    )
  );

-- Garden Obstacles policies
CREATE POLICY "Users can view obstacles in their gardens"
  ON garden_obstacles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = garden_obstacles.garden_id
      AND gardens.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can create obstacles in their gardens"
  ON garden_obstacles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = garden_obstacles.garden_id
      AND gardens.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can update obstacles in their gardens"
  ON garden_obstacles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = garden_obstacles.garden_id
      AND gardens.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can delete obstacles in their gardens"
  ON garden_obstacles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = garden_obstacles.garden_id
      AND gardens.user_id = (select auth.uid())
    )
  );

-- Garden Accessories policies
CREATE POLICY "Users can access accessories in their gardens"
  ON garden_accessories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = garden_accessories.garden_id
      AND gardens.user_id = (select auth.uid())
    )
  );

-- Hydroponic Readings policies
CREATE POLICY "Users can access hydroponic readings in their gardens"
  ON hydroponic_readings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = hydroponic_readings.garden_id
      AND gardens.user_id = (select auth.uid())
    )
  );

-- Aquaponic Readings policies
CREATE POLICY "Users can access aquaponic readings in their gardens"
  ON aquaponic_readings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = aquaponic_readings.garden_id
      AND gardens.user_id = (select auth.uid())
    )
  );

-- Profiles policies
CREATE POLICY "Users can only access their own profile"
  ON profiles FOR ALL
  USING ((select auth.uid()) = id);

-- Credit Transactions policies
CREATE POLICY "Users can only access their own transactions"
  ON ai_credit_transactions FOR ALL
  USING ((select auth.uid()) = user_id);

-- Professional Analytics policies
CREATE POLICY "Users can only access their own analytics"
  ON professional_analytics FOR ALL
  USING ((select auth.uid()) = user_id);

-- Treatment Register policies
CREATE POLICY "Users can only access their own treatments"
  ON treatment_register FOR ALL
  USING ((select auth.uid()) = user_id);

-- Mechanical Work Register policies
CREATE POLICY "Users can only access their own mechanical work"
  ON mechanical_work_register FOR ALL
  USING ((select auth.uid()) = user_id);

-- Crop Mechanical Works policies (public read)
CREATE POLICY "Crop mechanical works are publicly readable"
  ON crop_mechanical_works FOR SELECT
  USING (true);

-- Custom Crops policies
CREATE POLICY "Users can manage their own custom crops" ON custom_crops
  FOR ALL USING ((select auth.uid()) = user_id);

-- Learning Events policies
CREATE POLICY "Users can manage their own learning events" ON crop_learning_events
  FOR ALL USING ((select auth.uid()) = user_id);

-- Garden Memory policies
CREATE POLICY "Users can manage their own zone memories" ON garden_zone_memories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = garden_zone_memories.garden_id
      AND gardens.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can manage their own tree memories" ON garden_tree_memories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = garden_tree_memories.garden_id
      AND gardens.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can manage their own patterns" ON garden_patterns
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = garden_patterns.garden_id
      AND gardens.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can manage their own correlations" ON garden_correlations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = garden_correlations.garden_id
      AND gardens.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can manage their own season analyses" ON garden_season_analyses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = garden_season_analyses.garden_id
      AND gardens.user_id = (select auth.uid())
    )
  );

-- Calendar Tasks policies
CREATE POLICY "Users can view their own calendar tasks"
  ON calendar_tasks FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own calendar tasks"
  ON calendar_tasks FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own calendar tasks"
  ON calendar_tasks FOR UPDATE
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own calendar tasks"
  ON calendar_tasks FOR DELETE
  USING ((select auth.uid()) = user_id);

-- Challenge Completions policies
CREATE POLICY "Users can view their own challenge completions"
  ON challenge_completions FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own challenge completions"
  ON challenge_completions FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own challenge completions"
  ON challenge_completions FOR UPDATE
  USING ((select auth.uid()) = user_id);

-- User Badges policies
CREATE POLICY "Users can view their own badges"
  ON user_badges FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own badges"
  ON user_badges FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

-- ============================================
-- COMPLETATO!
-- ============================================
-- Il database è stato ricostruito completamente con:
-- ✅ Tier system corretto (FREE, PLUS, PRO)
-- ✅ Tutte le nuove lavorazioni meccaniche
-- ✅ Tutte le tabelle professional
-- ✅ Tutte le RLS policies corrette
-- ✅ Tutte le funzioni e trigger
-- ============================================

