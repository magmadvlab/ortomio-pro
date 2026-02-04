-- Migration: Land Zones and Soil Memory System (ADAPTED TO REAL SCHEMA)
-- Date: 2026-02-04
-- Purpose: Separare filari temporanei da macro-zone stabili + memoria permanente terreno

-- ============================================
-- 1. LAND ZONES (Macro-zone stabili)
-- ============================================

CREATE TABLE IF NOT EXISTS land_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- References (usa garden_zone_id per compatibilità con schema esistente)
  garden_zone_id UUID NOT NULL REFERENCES garden_zones(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Zone Identification
  zone_name TEXT NOT NULL,
  zone_code TEXT,
  
  -- Area
  area_hectares DECIMAL(10, 4) NOT NULL,
  
  -- Status
  current_status TEXT DEFAULT 'active' CHECK (current_status IN ('active', 'resting')),
  status_since TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Soil Characteristics
  soil_type TEXT,
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. SOIL MEMORY (Memoria permanente terreno)
-- ============================================

CREATE TABLE IF NOT EXISTS soil_memory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- References
  land_zone_id UUID NOT NULL REFERENCES land_zones(id) ON DELETE CASCADE,
  garden_zone_id UUID NOT NULL REFERENCES garden_zones(id) ON DELETE CASCADE,
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

-- ============================================
-- 3. LINK FILARI A LAND ZONES
-- ============================================

-- Aggiungi colonna land_zone_id a garden_rows
ALTER TABLE garden_rows 
ADD COLUMN IF NOT EXISTS land_zone_id UUID REFERENCES land_zones(id) ON DELETE SET NULL;

-- Aggiungi colonna is_active se non esiste (per gestire archiviazione)
ALTER TABLE garden_rows 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- ============================================
-- 4. RIUTILIZZO ROW_NUMBER DOPO ARCHIVIAZIONE
-- ============================================

-- Rimuovi constraint univoco su row_number (se esiste)
ALTER TABLE garden_rows DROP CONSTRAINT IF EXISTS garden_rows_garden_zone_id_row_number_key;
ALTER TABLE garden_rows DROP CONSTRAINT IF EXISTS garden_rows_row_number_unique;

-- Aggiungi constraint univoco solo per filari attivi
-- Questo permette di riutilizzare row_number dopo archiviazione
DROP INDEX IF EXISTS garden_rows_active_row_number_unique;
CREATE UNIQUE INDEX garden_rows_active_row_number_unique 
ON garden_rows(garden_zone_id, row_number) 
WHERE is_active = true;

-- ============================================
-- 5. INDEXES
-- ============================================

-- Land Zones
CREATE INDEX IF NOT EXISTS idx_land_zones_garden_zone_id ON land_zones(garden_zone_id);
CREATE INDEX IF NOT EXISTS idx_land_zones_user_id ON land_zones(user_id);
CREATE INDEX IF NOT EXISTS idx_land_zones_status ON land_zones(current_status);

-- Soil Memory
CREATE INDEX IF NOT EXISTS idx_soil_memory_zone_id ON soil_memory(land_zone_id);
CREATE INDEX IF NOT EXISTS idx_soil_memory_garden_zone_id ON soil_memory(garden_zone_id);
CREATE INDEX IF NOT EXISTS idx_soil_memory_user_id ON soil_memory(user_id);
CREATE INDEX IF NOT EXISTS idx_soil_memory_dates ON soil_memory(planting_date, harvest_date);
CREATE INDEX IF NOT EXISTS idx_soil_memory_crop_family ON soil_memory(crop_family);
CREATE INDEX IF NOT EXISTS idx_soil_memory_season ON soil_memory(season_year, season_type);

-- Garden Rows
CREATE INDEX IF NOT EXISTS idx_garden_rows_land_zone ON garden_rows(land_zone_id);
CREATE INDEX IF NOT EXISTS idx_garden_rows_active ON garden_rows(is_active);

-- ============================================
-- 6. RLS POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE land_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE soil_memory ENABLE ROW LEVEL SECURITY;

-- Land Zones Policies
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

-- Soil Memory Policies
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

-- ============================================
-- 7. HELPER FUNCTIONS
-- ============================================

-- Funzione per ottenere filari attivi di una zona
CREATE OR REPLACE FUNCTION get_zone_active_field_rows(zone_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  row_number INTEGER,
  length_meters DECIMAL,
  cultivar TEXT,
  planted_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gr.id,
    gr.name,
    gr.row_number,
    gr.length_meters,
    gr.cultivar,
    gr.planted_date
  FROM garden_rows gr
  WHERE gr.land_zone_id = zone_id
    AND gr.is_active = true
  ORDER BY gr.row_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per contare filari attivi in una zona
CREATE OR REPLACE FUNCTION count_zone_active_field_rows(zone_id UUID)
RETURNS INTEGER AS $$
DECLARE
  row_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO row_count
  FROM garden_rows
  WHERE land_zone_id = zone_id
    AND is_active = true;
  
  RETURN COALESCE(row_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per ottenere storico zona
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

-- Funzione per calcolare salute terreno zona
CREATE OR REPLACE FUNCTION calculate_zone_soil_health(zone_id UUID)
RETURNS JSONB AS $$
DECLARE
  zone_record land_zones;
  health_score INTEGER := 75;
  nitrogen_balance INTEGER := 0;
  diversity_score INTEGER := 50;
  recent_crops_count INTEGER := 0;
BEGIN
  -- Get zone
  SELECT * INTO zone_record FROM land_zones WHERE id = zone_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Zone not found');
  END IF;
  
  -- Count recent crops (last 2 years)
  SELECT COUNT(DISTINCT crop_family)
  INTO recent_crops_count
  FROM soil_memory
  WHERE land_zone_id = zone_id
    AND planting_date >= NOW() - INTERVAL '2 years';
  
  -- Calculate diversity score
  diversity_score := LEAST(100, recent_crops_count * 20);
  
  -- Calculate nitrogen balance (simplified)
  SELECT COALESCE(SUM(nitrogen_impact), 0)
  INTO nitrogen_balance
  FROM soil_memory
  WHERE land_zone_id = zone_id
    AND planting_date >= NOW() - INTERVAL '2 years';
  
  -- Calculate health score
  health_score := LEAST(100, GREATEST(0, 
    50 + diversity_score / 2 + nitrogen_balance
  ));
  
  RETURN jsonb_build_object(
    'zone_id', zone_id,
    'zone_name', zone_record.zone_name,
    'health_score', health_score,
    'nitrogen_balance', nitrogen_balance,
    'diversity_score', diversity_score,
    'recent_crops_count', recent_crops_count,
    'recommendation', CASE
      WHEN health_score >= 80 THEN 'Excellent soil health'
      WHEN health_score >= 60 THEN 'Good soil health'
      WHEN health_score >= 40 THEN 'Fair soil health - consider rotation'
      ELSE 'Poor soil health - rotation needed'
    END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per suggerimenti rotazione zona
CREATE OR REPLACE FUNCTION get_zone_rotation_suggestions(
  zone_id UUID,
  years_back INTEGER DEFAULT 4
)
RETURNS JSONB AS $$
DECLARE
  suggestions JSONB := '[]'::jsonb;
  last_families TEXT[];
BEGIN
  -- Get last crop families
  SELECT ARRAY_AGG(DISTINCT crop_family ORDER BY crop_family)
  INTO last_families
  FROM soil_memory
  WHERE land_zone_id = zone_id
    AND planting_date >= NOW() - (years_back || ' years')::INTERVAL
  LIMIT 5;
  
  -- Generate suggestions (simplified)
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
    ),
    jsonb_build_object(
      'family', 'Cucurbitacee',
      'reason', 'Richiedono terreno fertile',
      'score', 70,
      'nitrogen_benefit', 'low'
    )
  );
  
  RETURN suggestions;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Migration completed successfully!';
  RAISE NOTICE 'Tables created: land_zones, soil_memory';
  RAISE NOTICE 'Columns added: garden_rows.land_zone_id, garden_rows.is_active';
  RAISE NOTICE 'Constraint updated: row_number reusable after archiving';
  RAISE NOTICE 'Functions created: get_zone_history, calculate_zone_soil_health, get_zone_rotation_suggestions';
END $$;
