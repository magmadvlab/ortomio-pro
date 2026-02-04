-- Migration: Add Land Zones and Soil Memory System
-- Created: 2026-02-04
-- Purpose: Gestire macro-zone del terreno e memoria storica indipendente dai filari

-- ============================================
-- LAND_ZONES (Macro-Zone del Terreno)
-- ============================================
CREATE TABLE IF NOT EXISTS land_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Riferimenti
  garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Identificazione Zona
  zone_name TEXT NOT NULL, -- "Zona Nord", "Appezzamento A", etc.
  zone_code TEXT, -- "ZN-01", "APP-A", etc.
  zone_type TEXT DEFAULT 'cultivation', -- cultivation, rest, fallow, permanent
  
  -- Geometria e Posizione
  area_hectares DECIMAL(10, 4), -- Superficie in ettari
  gps_boundaries JSONB, -- Poligono GPS della zona
  -- {
  --   "type": "Polygon",
  --   "coordinates": [
  --     [lat1, lng1],
  --     [lat2, lng2],
  --     [lat3, lng3],
  --     [lat4, lng4],
  --     [lat1, lng1] // chiude il poligono
  --   ]
  -- }
  gps_center JSONB, -- Centro della zona
  -- { "lat": 45.123, "lng": 11.456 }
  
  -- Caratteristiche Terreno
  soil_type TEXT, -- argilloso, sabbioso, limoso, misto
  soil_ph DECIMAL(3, 1), -- pH del terreno (4.0-9.0)
  soil_quality_score INTEGER CHECK (soil_quality_score >= 1 AND soil_quality_score <= 100),
  drainage_quality TEXT, -- excellent, good, fair, poor
  sun_exposure TEXT, -- full_sun, partial_shade, shade
  slope_percentage DECIMAL(5, 2), -- Pendenza in %
  
  -- Stato Attuale
  current_status TEXT DEFAULT 'active', -- active, resting, fallow, preparation
  status_since TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  planned_rest_until TIMESTAMP WITH TIME ZONE, -- Data fine riposo programmato
  
  -- Rotazione e Gestione
  rotation_cycle_years INTEGER DEFAULT 4, -- Ciclo di rotazione in anni
  last_major_work_date TIMESTAMP WITH TIME ZONE, -- Ultima lavorazione profonda
  last_amendment_date TIMESTAMP WITH TIME ZONE, -- Ultimo ammendamento
  
  -- Note e Osservazioni
  notes TEXT,
  restrictions JSONB DEFAULT '[]'::jsonb, -- Limitazioni (es. zone protette)
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_land_zones_garden_id ON land_zones(garden_id);
CREATE INDEX IF NOT EXISTS idx_land_zones_user_id ON land_zones(user_id);
CREATE INDEX IF NOT EXISTS idx_land_zones_status ON land_zones(current_status);
CREATE INDEX IF NOT EXISTS idx_land_zones_type ON land_zones(zone_type);

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
-- SEASON_CYCLES (Cicli Stagionali)
-- ============================================
CREATE TABLE IF NOT EXISTS season_cycles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Riferimenti
  land_zone_id UUID NOT NULL REFERENCES land_zones(id) ON DELETE CASCADE,
  garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Identificazione Ciclo
  cycle_name TEXT NOT NULL, -- "Orto Estivo 2026", "Ciclo Autunnale 2026"
  cycle_year INTEGER NOT NULL,
  cycle_season TEXT NOT NULL, -- spring, summer, autumn, winter
  
  -- Date
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  planned_end_date TIMESTAMP WITH TIME ZONE,
  
  -- Stato
  status TEXT DEFAULT 'active', -- planning, active, completed, archived
  
  -- Configurazione Filari (snapshot)
  field_rows_config JSONB DEFAULT '[]'::jsonb,
  -- [
  --   {
  --     "row_id": "uuid",
  --     "row_name": "Filare 1",
  --     "length_meters": 10,
  --     "crop": "Pomodoro",
  --     "planting_date": "2026-04-15"
  --   }
  -- ]
  
  -- Risultati Aggregati
  total_yield_kg DECIMAL(10, 2),
  total_area_used DECIMAL(10, 4), -- ettari utilizzati
  avg_quality_rating DECIMAL(3, 2),
  success_rate DECIMAL(5, 2), -- % di successo
  
  -- Lavorazioni del Terreno
  soil_preparation JSONB DEFAULT '{}'::jsonb,
  -- {
  --   "tilling_date": "2026-03-01",
  --   "amendments": ["compost", "lime"],
  --   "amendments_kg_per_mq": 5.0,
  --   "cover_crop_previous": "vetch"
  -- }
  
  -- Note
  notes TEXT,
  lessons_learned JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_season_cycles_zone_id ON season_cycles(land_zone_id);
CREATE INDEX IF NOT EXISTS idx_season_cycles_garden_id ON season_cycles(garden_id);
CREATE INDEX IF NOT EXISTS idx_season_cycles_user_id ON season_cycles(user_id);
CREATE INDEX IF NOT EXISTS idx_season_cycles_year_season ON season_cycles(cycle_year, cycle_season);
CREATE INDEX IF NOT EXISTS idx_season_cycles_status ON season_cycles(status);

-- RLS Policies
ALTER TABLE season_cycles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their season cycles"
  ON season_cycles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their season cycles"
  ON season_cycles FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their season cycles"
  ON season_cycles FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their season cycles"
  ON season_cycles FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- FUNZIONI HELPER
-- ============================================

-- Funzione per chiudere un ciclo stagionale e preservare la memoria
CREATE OR REPLACE FUNCTION close_season_cycle(
  cycle_id UUID,
  end_date_param TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS JSONB AS $$
DECLARE
  cycle_record season_cycles;
  memory_records_created INTEGER := 0;
  field_row_record RECORD;
BEGIN
  -- Ottieni il ciclo
  SELECT * INTO cycle_record
  FROM season_cycles
  WHERE id = cycle_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Cycle not found'
    );
  END IF;
  
  -- Per ogni filare nel ciclo, copia lo storico in soil_memory
  FOR field_row_record IN
    SELECT h.*
    FROM field_row_crop_history h
    WHERE h.garden_id = cycle_record.garden_id
      AND h.planting_date >= cycle_record.start_date
      AND (h.harvest_date IS NULL OR h.harvest_date <= end_date_param)
  LOOP
    -- Inserisci in soil_memory
    INSERT INTO soil_memory (
      land_zone_id,
      garden_id,
      user_id,
      field_row_id,
      crop_name,
      crop_variety,
      crop_family,
      crop_type,
      planting_date,
      harvest_date,
      days_to_harvest,
      season_year,
      season_type,
      yield_kg,
      quality_rating,
      fertilization_type,
      irrigation_method,
      treatments_count,
      planting_context,
      success_score
    )
    SELECT
      cycle_record.land_zone_id,
      field_row_record.garden_id,
      field_row_record.user_id,
      field_row_record.garden_row_id,
      field_row_record.crop_name,
      field_row_record.crop_variety,
      field_row_record.crop_family,
      field_row_record.crop_type,
      field_row_record.planting_date,
      field_row_record.harvest_date,
      field_row_record.days_to_harvest,
      cycle_record.cycle_year,
      cycle_record.cycle_season,
      field_row_record.yield_kg,
      field_row_record.quality_rating,
      field_row_record.fertilization_type,
      field_row_record.irrigation_method,
      field_row_record.treatments_count,
      field_row_record.planting_context,
      field_row_record.rotation_score;
    
    memory_records_created := memory_records_created + 1;
  END LOOP;
  
  -- Aggiorna stato ciclo
  UPDATE season_cycles
  SET 
    status = 'completed',
    end_date = end_date_param,
    updated_at = NOW()
  WHERE id = cycle_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'cycle_id', cycle_id,
    'memory_records_created', memory_records_created,
    'message', 'Season cycle closed successfully'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
  -- (Logica simile a get_rotation_suggestions ma considera tutta la zona)
  
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

CREATE TRIGGER update_season_cycles_updated_at
  BEFORE UPDATE ON season_cycles
  FOR EACH ROW
  EXECUTE FUNCTION update_land_zones_updated_at();

COMMENT ON TABLE land_zones IS 'Macro-zone del terreno con caratteristiche e stato';
COMMENT ON TABLE soil_memory IS 'Memoria permanente del terreno indipendente dai filari';
COMMENT ON TABLE season_cycles IS 'Cicli stagionali con snapshot configurazione';
COMMENT ON FUNCTION close_season_cycle IS 'Chiude un ciclo stagionale preservando la memoria del terreno';
COMMENT ON FUNCTION get_zone_rotation_suggestions IS 'Suggerimenti rotazione basati su memoria zona';
COMMENT ON FUNCTION calculate_zone_soil_health IS 'Calcola salute del terreno di una zona';
