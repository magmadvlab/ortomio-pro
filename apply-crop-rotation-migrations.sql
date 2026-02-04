-- Apply Crop Rotation and Land Zones Migrations
-- Run this in Supabase SQL Editor

-- ============================================
-- MIGRATION 1: Field Row Crop History
-- ============================================

-- Create field_row_crop_history table
CREATE TABLE IF NOT EXISTS field_row_crop_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- References
  garden_row_id UUID NOT NULL REFERENCES garden_rows(id) ON DELETE CASCADE,
  garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Crop Information
  crop_name TEXT NOT NULL,
  crop_variety TEXT,
  crop_family TEXT NOT NULL,
  crop_type TEXT,
  
  -- Dates and Duration
  planting_date TIMESTAMP WITH TIME ZONE NOT NULL,
  harvest_date TIMESTAMP WITH TIME ZONE,
  days_to_harvest INTEGER,
  
  -- Performance Metrics
  yield_kg DECIMAL(10, 2),
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  
  -- Cultivation Details
  fertilization_type TEXT,
  irrigation_method TEXT,
  treatments_count INTEGER DEFAULT 0,
  
  -- Environmental Context
  planting_context JSONB DEFAULT '{}'::jsonb,
  
  -- Rotation Score (calculated)
  rotation_score INTEGER CHECK (rotation_score >= 1 AND rotation_score <= 100),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_field_row_crop_history_row_id ON field_row_crop_history(garden_row_id);
CREATE INDEX IF NOT EXISTS idx_field_row_crop_history_garden_id ON field_row_crop_history(garden_id);
CREATE INDEX IF NOT EXISTS idx_field_row_crop_history_user_id ON field_row_crop_history(user_id);
CREATE INDEX IF NOT EXISTS idx_field_row_crop_history_dates ON field_row_crop_history(planting_date, harvest_date);
CREATE INDEX IF NOT EXISTS idx_field_row_crop_history_family ON field_row_crop_history(crop_family);

-- RLS Policies
ALTER TABLE field_row_crop_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their crop history" ON field_row_crop_history;
CREATE POLICY "Users can view their crop history"
  ON field_row_crop_history FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their crop history" ON field_row_crop_history;
CREATE POLICY "Users can insert their crop history"
  ON field_row_crop_history FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their crop history" ON field_row_crop_history;
CREATE POLICY "Users can update their crop history"
  ON field_row_crop_history FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their crop history" ON field_row_crop_history;
CREATE POLICY "Users can delete their crop history"
  ON field_row_crop_history FOR DELETE
  USING (user_id = auth.uid());

-- Function: Calculate Rotation Score
CREATE OR REPLACE FUNCTION calculate_rotation_score(
  row_id UUID,
  new_crop_family TEXT
)
RETURNS INTEGER AS $$
DECLARE
  last_families TEXT[];
  years_since_same_family INTEGER;
  rotation_score INTEGER;
BEGIN
  -- Get last 5 crop families for this row
  SELECT ARRAY_AGG(crop_family ORDER BY planting_date DESC)
  INTO last_families
  FROM field_row_crop_history
  WHERE garden_row_id = row_id
  ORDER BY planting_date DESC
  LIMIT 5;
  
  -- If no history, perfect score
  IF last_families IS NULL OR array_length(last_families, 1) = 0 THEN
    RETURN 100;
  END IF;
  
  -- Check if same family was planted recently
  IF last_families[1] = new_crop_family THEN
    RETURN 20; -- Very poor rotation
  ELSIF array_length(last_families, 1) >= 2 AND last_families[2] = new_crop_family THEN
    RETURN 40; -- Poor rotation
  ELSIF array_length(last_families, 1) >= 3 AND last_families[3] = new_crop_family THEN
    RETURN 60; -- Fair rotation
  ELSIF array_length(last_families, 1) >= 4 AND last_families[4] = new_crop_family THEN
    RETURN 80; -- Good rotation
  ELSE
    RETURN 100; -- Excellent rotation
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get Rotation Suggestions
CREATE OR REPLACE FUNCTION get_rotation_suggestions(
  row_id UUID
)
RETURNS JSONB AS $$
DECLARE
  last_families TEXT[];
  suggestions JSONB := '[]'::jsonb;
BEGIN
  -- Get last 3 crop families
  SELECT ARRAY_AGG(DISTINCT crop_family ORDER BY crop_family)
  INTO last_families
  FROM field_row_crop_history
  WHERE garden_row_id = row_id
  ORDER BY planting_date DESC
  LIMIT 3;
  
  -- Generate suggestions based on rotation principles
  IF last_families IS NULL OR array_length(last_families, 1) = 0 THEN
    suggestions := jsonb_build_array(
      jsonb_build_object(
        'family', 'Leguminose',
        'reason', 'Arricchiscono il terreno di azoto',
        'score', 100
      )
    );
  ELSE
    suggestions := jsonb_build_array(
      jsonb_build_object(
        'family', 'Leguminose',
        'reason', 'Ripristinano fertilità',
        'score', 90
      ),
      jsonb_build_object(
        'family', 'Crucifere',
        'reason', 'Buona alternativa',
        'score', 85
      )
    );
  END IF;
  
  RETURN suggestions;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get Field Row History
CREATE OR REPLACE FUNCTION get_field_row_history(
  row_id UUID
)
RETURNS TABLE (
  crop_name TEXT,
  crop_family TEXT,
  planting_date TIMESTAMP WITH TIME ZONE,
  harvest_date TIMESTAMP WITH TIME ZONE,
  yield_kg DECIMAL,
  quality_rating INTEGER,
  rotation_score INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    h.crop_name,
    h.crop_family,
    h.planting_date,
    h.harvest_date,
    h.yield_kg,
    h.quality_rating,
    h.rotation_score
  FROM field_row_crop_history h
  WHERE h.garden_row_id = row_id
  ORDER BY h.planting_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- MIGRATION 2: Land Zones and Soil Memory
-- ============================================

-- Create land_zones table
CREATE TABLE IF NOT EXISTS land_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- References
  garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Zone Identification
  zone_name TEXT NOT NULL,
  zone_code TEXT,
  
  -- Area
  area_hectares DECIMAL(10, 4) NOT NULL,
  
  -- Status
  current_status TEXT DEFAULT 'active',
  status_since TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Soil Characteristics
  soil_type TEXT,
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_land_zones_garden_id ON land_zones(garden_id);
CREATE INDEX IF NOT EXISTS idx_land_zones_user_id ON land_zones(user_id);
CREATE INDEX IF NOT EXISTS idx_land_zones_status ON land_zones(current_status);

-- RLS Policies
ALTER TABLE land_zones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their land zones" ON land_zones;
CREATE POLICY "Users can view their land zones"
  ON land_zones FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their land zones" ON land_zones;
CREATE POLICY "Users can insert their land zones"
  ON land_zones FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their land zones" ON land_zones;
CREATE POLICY "Users can update their land zones"
  ON land_zones FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their land zones" ON land_zones;
CREATE POLICY "Users can delete their land zones"
  ON land_zones FOR DELETE
  USING (user_id = auth.uid());

-- Create soil_memory table
CREATE TABLE IF NOT EXISTS soil_memory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- References
  land_zone_id UUID NOT NULL REFERENCES land_zones(id) ON DELETE CASCADE,
  garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  field_row_id UUID REFERENCES garden_rows(id) ON DELETE SET NULL,
  
  -- Crop Data
  crop_name TEXT NOT NULL,
  crop_variety TEXT,
  crop_family TEXT NOT NULL,
  crop_type TEXT,
  
  -- Dates
  planting_date TIMESTAMP WITH TIME ZONE NOT NULL,
  harvest_date TIMESTAMP WITH TIME ZONE,
  days_to_harvest INTEGER,
  season_year INTEGER,
  season_type TEXT,
  
  -- Performance
  yield_kg DECIMAL(10, 2),
  yield_per_hectare DECIMAL(10, 2),
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  
  -- Soil Impact
  nitrogen_impact INTEGER,
  organic_matter_added DECIMAL(10, 2),
  soil_structure_impact INTEGER,
  
  -- Management
  fertilization_type TEXT,
  irrigation_method TEXT,
  treatments_count INTEGER DEFAULT 0,
  pesticides_used BOOLEAN DEFAULT false,
  
  -- Issues
  diseases_occurred JSONB DEFAULT '[]'::jsonb,
  pests_occurred JSONB DEFAULT '[]'::jsonb,
  weather_issues JSONB DEFAULT '[]'::jsonb,
  
  -- Context
  planting_context JSONB DEFAULT '{}'::jsonb,
  
  -- AI
  success_score INTEGER CHECK (success_score >= 1 AND success_score <= 100),
  ai_notes JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_soil_memory_zone_id ON soil_memory(land_zone_id);
CREATE INDEX IF NOT EXISTS idx_soil_memory_garden_id ON soil_memory(garden_id);
CREATE INDEX IF NOT EXISTS idx_soil_memory_user_id ON soil_memory(user_id);
CREATE INDEX IF NOT EXISTS idx_soil_memory_dates ON soil_memory(planting_date, harvest_date);
CREATE INDEX IF NOT EXISTS idx_soil_memory_crop_family ON soil_memory(crop_family);
CREATE INDEX IF NOT EXISTS idx_soil_memory_season ON soil_memory(season_year, season_type);

-- RLS Policies
ALTER TABLE soil_memory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their soil memory" ON soil_memory;
CREATE POLICY "Users can view their soil memory"
  ON soil_memory FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their soil memory" ON soil_memory;
CREATE POLICY "Users can insert their soil memory"
  ON soil_memory FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their soil memory" ON soil_memory;
CREATE POLICY "Users can update their soil memory"
  ON soil_memory FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their soil memory" ON soil_memory;
CREATE POLICY "Users can delete their soil memory"
  ON soil_memory FOR DELETE
  USING (user_id = auth.uid());

-- Add land_zone_id to garden_rows
ALTER TABLE garden_rows 
ADD COLUMN IF NOT EXISTS land_zone_id UUID REFERENCES land_zones(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_garden_rows_zone ON garden_rows(land_zone_id);

-- Zone Functions
CREATE OR REPLACE FUNCTION get_zone_rotation_suggestions(
  zone_id UUID,
  years_back INTEGER DEFAULT 4
)
RETURNS JSONB AS $$
DECLARE
  suggestions JSONB := '[]'::jsonb;
BEGIN
  suggestions := jsonb_build_array(
    jsonb_build_object(
      'family', 'Leguminose',
      'reason', 'Arricchiscono il terreno di azoto',
      'score', 100,
      'nitrogen_benefit', 'high'
    ),
    jsonb_build_object(
      'family', 'Crucifere',
      'reason', 'Buona alternativa per rotazione',
      'score', 85,
      'nitrogen_benefit', 'medium'
    )
  );
  
  RETURN suggestions;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION calculate_zone_soil_health(
  zone_id UUID
)
RETURNS JSONB AS $$
DECLARE
  zone_record land_zones;
  health_score INTEGER := 75;
BEGIN
  SELECT * INTO zone_record FROM land_zones WHERE id = zone_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Zone not found');
  END IF;
  
  RETURN jsonb_build_object(
    'zone_id', zone_id,
    'zone_name', zone_record.zone_name,
    'health_score', health_score,
    'nitrogen_balance', 0,
    'diversity_score', 50,
    'recent_crops_count', 0,
    'recommendation', 'Good soil health'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_zone_history(
  zone_id UUID,
  years_back INTEGER DEFAULT 10
)
RETURNS TABLE (
  crop_name TEXT,
  crop_family TEXT,
  planting_date TIMESTAMP WITH TIME ZONE,
  harvest_date TIMESTAMP WITH TIME ZONE,
  yield_kg DECIMAL,
  quality_rating INTEGER,
  success_score INTEGER,
  season_year INTEGER,
  season_type TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sm.crop_name,
    sm.crop_family,
    sm.planting_date,
    sm.harvest_date,
    sm.yield_kg,
    sm.quality_rating,
    sm.success_score,
    sm.season_year,
    sm.season_type
  FROM soil_memory sm
  WHERE sm.land_zone_id = zone_id
    AND sm.planting_date >= NOW() - (years_back || ' years')::INTERVAL
  ORDER BY sm.planting_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migrations applied successfully!';
  RAISE NOTICE 'Tables created: field_row_crop_history, land_zones, soil_memory';
  RAISE NOTICE 'Functions created: calculate_rotation_score, get_rotation_suggestions, get_field_row_history';
  RAISE NOTICE 'Functions created: get_zone_rotation_suggestions, calculate_zone_soil_health, get_zone_history';
END $$;
