-- Migration: Add Land Zones and Soil Memory System (SIMPLIFIED VERSION)
-- Created: 2026-02-04
-- Purpose: Gestire macro-zone del terreno e memoria storica indipendente dai filari
-- Approach: Zone fisse semplici, nessun GPS, focus su nome + superficie

-- ============================================
-- LAND_ZONES (Macro-Zone del Terreno) - VERSIONE SEMPLIFICATA
-- ============================================
CREATE TABLE IF NOT EXISTS land_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Riferimenti
  garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Identificazione Zona (SEMPLICE)
  zone_name TEXT NOT NULL, -- "Zona A", "Zona B", "Zona Nord"
  zone_code TEXT, -- "ZA", "ZB", "ZN" (opzionale)
  
  -- Superficie (OBBLIGATORIO)
  area_hectares DECIMAL(10, 4) NOT NULL, -- Superficie in ettari (es. 2.0)
  
  -- Stato Attuale (SEMPLICE)
  current_status TEXT DEFAULT 'active', -- active, resting
  status_since TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Caratteristiche Terreno (OPZIONALI)
  soil_type TEXT, -- argilloso, sabbioso, limoso, misto
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_land_zones_garden_id ON land_zones(garden_id);
CREATE INDEX IF NOT EXISTS idx_land_zones_user_id ON land_zones(user_id);
CREATE INDEX IF NOT EXISTS idx_land_zones_status ON land_zones(current_status);

-- RLS Policies
ALTER TABLE land_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their land zones"
  ON land_zones FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their land zones"
  ON land_zones FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their land zones"
  ON land_zones FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their land zones"
  ON land_zones FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- SOIL_MEMORY (Memoria del Terreno)
-- ============================================
CREATE TABLE IF NOT EXISTS soil_memory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Riferimenti
  land_zone_id UUID NOT NULL REFERENCES land_zones(id) ON DELETE CASCADE,
  garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Riferimento Opzionale al Filare (se esiste ancora)
  field_row_id UUID REFERENCES garden_rows(id) ON DELETE SET NULL,
  
  -- Dati Coltura (copiati da field_row_crop_history)
  crop_name TEXT NOT NULL,
  crop_variety TEXT,
  crop_family TEXT NOT NULL,
  crop_type TEXT,
  
  -- Date e Durata
  planting_date TIMESTAMP WITH TIME ZONE NOT NULL,
  harvest_date TIMESTAMP WITH TIME ZONE,
  days_to_harvest INTEGER,
  season_year INTEGER, -- Anno della stagione
  season_type TEXT, -- spring, summer, autumn, winter
  
  -- Performance
  yield_kg DECIMAL(10, 2),
  yield_per_hectare DECIMAL(10, 2), -- Resa per ettaro
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  
  -- Impatto sul Terreno
  nitrogen_impact INTEGER, -- -100 (consuma molto) a +100 (arricchisce molto)
  organic_matter_added DECIMAL(10, 2), -- kg/mq di sostanza organica aggiunta
  soil_structure_impact INTEGER, -- -10 (peggiora) a +10 (migliora)
  
  -- Trattamenti e Gestione
  fertilization_type TEXT, -- bio, traditional, mixed, none
  irrigation_method TEXT,
  treatments_count INTEGER DEFAULT 0,
  pesticides_used BOOLEAN DEFAULT false,
  
  -- Problemi e Malattie
  diseases_occurred JSONB DEFAULT '[]'::jsonb,
  pests_occurred JSONB DEFAULT '[]'::jsonb,
  weather_issues JSONB DEFAULT '[]'::jsonb,
  
  -- Contesto Ambientale
  planting_context JSONB DEFAULT '{}'::jsonb,
  
  -- AI Learning
  success_score INTEGER CHECK (success_score >= 1 AND success_score <= 100),
  ai_notes JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_soil_memory_zone_id ON soil_memory(land_zone_id);
CREATE INDEX IF NOT EXISTS idx_soil_memory_garden_id ON soil_memory(garden_id);
CREATE INDEX IF NOT EXISTS idx_soil_memory_user_id ON soil_memory(user_id);
CREATE INDEX IF NOT EXISTS idx_soil_memory_dates ON soil_memory(planting_date, harvest_date);
CREATE INDEX IF NOT EXISTS idx_soil_memory_crop_family ON soil_memory(crop_family);
CREATE INDEX IF NOT EXISTS idx_soil_memory_season ON soil_memory(season_year, season_type);

-- RLS Policies
ALTER TABLE soil_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their soil memory"
  ON soil_memory FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their soil memory"
  ON soil_memory FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their soil memory"
  ON soil_memory FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their soil memory"
  ON soil_memory FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- AGGIUNGI CAMPO ZONA AI FILARI
-- ============================================
ALTER TABLE garden_rows 
ADD COLUMN IF NOT EXISTS land_zone_id UUID REFERENCES land_zones(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_garden_rows_zone ON garden_rows(land_zone_id);

-- ============================================
-- FUNZIONI HELPER
-- ============================================

-- Funzione per ottenere suggerimenti rotazione basati su memoria del terreno
CREATE OR REPLACE FUNCTION get_zone_rotation_suggestions(
  zone_id UUID,
  years_back INTEGER DEFAULT 4
)
RETURNS JSONB AS $$
DECLARE
  last_families TEXT[];
  suggestions JSONB := '[]'::jsonb;
  cutoff_date TIMESTAMP WITH TIME ZONE;
BEGIN
  cutoff_date := NOW() - (years_back || ' years')::INTERVAL;
  
  -- Ottieni le ultime famiglie coltivate nella zona
  SELECT ARRAY_AGG(DISTINCT crop_family ORDER BY crop_family)
  INTO last_families
  FROM soil_memory
  WHERE land_zone_id = zone_id
    AND planting_date >= cutoff_date
  ORDER BY planting_date DESC
  LIMIT 10;
  
  -- Genera suggerimenti basati su rotazione e memoria del terreno
  IF last_families IS NULL OR array_length(last_families, 1) = 0 THEN
    suggestions := jsonb_build_array(
      jsonb_build_object(
        'family', 'Leguminose',
        'reason', 'Arricchiscono il terreno di azoto - ideale per iniziare',
        'score', 100,
        'nitrogen_benefit', 'high'
      )
    );
  ELSE
    -- Logica di rotazione basata su storico
    suggestions := jsonb_build_array(
      jsonb_build_object(
        'family', 'Leguminose',
        'reason', 'Ripristinano fertilità del terreno',
        'score', 90,
        'nitrogen_benefit', 'high'
      ),
      jsonb_build_object(
        'family', 'Crucifere',
        'reason', 'Buona alternativa per rotazione',
        'score', 85,
        'nitrogen_benefit', 'medium'
      )
    );
  END IF;
  
  RETURN suggestions;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per calcolare salute del terreno di una zona
CREATE OR REPLACE FUNCTION calculate_zone_soil_health(
  zone_id UUID
)
RETURNS JSONB AS $$
DECLARE
  zone_record land_zones;
  recent_crops INTEGER;
  nitrogen_balance INTEGER;
  diversity_score INTEGER;
  health_score INTEGER;
BEGIN
  SELECT * INTO zone_record FROM land_zones WHERE id = zone_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Zone not found');
  END IF;
  
  -- Conta colture recenti (ultimi 2 anni)
  SELECT COUNT(*)
  INTO recent_crops
  FROM soil_memory
  WHERE land_zone_id = zone_id
    AND planting_date >= NOW() - INTERVAL '2 years';
  
  -- Calcola bilancio azoto
  SELECT COALESCE(SUM(nitrogen_impact), 0)
  INTO nitrogen_balance
  FROM soil_memory
  WHERE land_zone_id = zone_id
    AND planting_date >= NOW() - INTERVAL '2 years';
  
  -- Calcola diversità colture
  SELECT COUNT(DISTINCT crop_family) * 10
  INTO diversity_score
  FROM soil_memory
  WHERE land_zone_id = zone_id
    AND planting_date >= NOW() - INTERVAL '2 years';
  
  -- Calcola punteggio salute (0-100)
  health_score := LEAST(100, GREATEST(0,
    50 + -- Base score
    (nitrogen_balance / 10) + -- Nitrogen contribution
    diversity_score + -- Diversity bonus
    (CASE WHEN recent_crops > 0 THEN 10 ELSE -10 END) -- Activity bonus/penalty
  ));
  
  RETURN jsonb_build_object(
    'zone_id', zone_id,
    'zone_name', zone_record.zone_name,
    'health_score', health_score,
    'nitrogen_balance', nitrogen_balance,
    'diversity_score', diversity_score,
    'recent_crops_count', recent_crops,
    'recommendation', CASE
      WHEN health_score >= 80 THEN 'Excellent soil health'
      WHEN health_score >= 60 THEN 'Good soil health'
      WHEN health_score >= 40 THEN 'Fair soil health - consider amendments'
      ELSE 'Poor soil health - rest period recommended'
    END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per ottenere storico completo di una zona
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

-- Trigger per aggiornare updated_at
CREATE OR REPLACE FUNCTION update_land_zones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_land_zones_updated_at
  BEFORE UPDATE ON land_zones
  FOR EACH ROW
  EXECUTE FUNCTION update_land_zones_updated_at();

CREATE TRIGGER update_soil_memory_updated_at
  BEFORE UPDATE ON soil_memory
  FOR EACH ROW
  EXECUTE FUNCTION update_land_zones_updated_at();

-- Comments
COMMENT ON TABLE land_zones IS 'Macro-zone del terreno - versione semplificata senza GPS';
COMMENT ON TABLE soil_memory IS 'Memoria permanente del terreno indipendente dai filari';
COMMENT ON FUNCTION get_zone_rotation_suggestions IS 'Suggerimenti rotazione basati su memoria zona';
COMMENT ON FUNCTION calculate_zone_soil_health IS 'Calcola salute del terreno di una zona';
COMMENT ON FUNCTION get_zone_history IS 'Ottiene storico completo colture di una zona';
