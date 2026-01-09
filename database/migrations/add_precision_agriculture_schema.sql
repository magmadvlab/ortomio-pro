-- Migration: Precision Agriculture Schema
-- Estensioni per agricoltura di precisione: zone mapping, analisi suolo avanzata, 
-- indicatori vegetativi, analisi predittiva, modelli resa
--
-- PREREQUISITE: This migration requires the base schema.sql to be run first
-- The 'gardens' table must exist before running this migration

-- Check if gardens table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'gardens') THEN
    RAISE EXCEPTION 'Prerequisite table "gardens" does not exist. Please run database/schema.sql first.';
  END IF;
END $$;

-- ============================================
-- CLEANUP: Drop tables if they exist without proper structure
-- ============================================
-- This ensures we start fresh if a previous migration attempt failed
DO $$
BEGIN
  -- Drop garden_zones if it exists without garden_id
  IF EXISTS (
    SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'garden_zones'
  ) AND NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'garden_zones' AND column_name = 'garden_id'
  ) THEN
    DROP TABLE garden_zones CASCADE;
    RAISE NOTICE 'Dropped garden_zones table with incorrect structure';
  END IF;
  
  -- Drop soil_analysis if it exists without garden_id
  IF EXISTS (
    SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'soil_analysis'
  ) AND NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'soil_analysis' AND column_name = 'garden_id'
  ) THEN
    DROP TABLE soil_analysis CASCADE;
    RAISE NOTICE 'Dropped soil_analysis table with incorrect structure';
  END IF;
  
  -- Drop yield_predictions if it exists without garden_id
  IF EXISTS (
    SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'yield_predictions'
  ) AND NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'yield_predictions' AND column_name = 'garden_id'
  ) THEN
    DROP TABLE yield_predictions CASCADE;
    RAISE NOTICE 'Dropped yield_predictions table with incorrect structure';
  END IF;
  
  -- Drop irrigation_zones if it exists without garden_id
  IF EXISTS (
    SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'irrigation_zones'
  ) AND NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'irrigation_zones' AND column_name = 'garden_id'
  ) THEN
    DROP TABLE irrigation_zones CASCADE;
    RAISE NOTICE 'Dropped irrigation_zones table with incorrect structure';
  END IF;
  
  -- Drop sensor_readings if it exists without garden_id
  IF EXISTS (
    SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sensor_readings'
  ) AND NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'sensor_readings' AND column_name = 'garden_id'
  ) THEN
    DROP TABLE sensor_readings CASCADE;
    RAISE NOTICE 'Dropped sensor_readings table with incorrect structure';
  END IF;
END $$;

-- ============================================
-- GARDEN ZONES (Zonazione Orto)
-- ============================================
CREATE TABLE IF NOT EXISTS garden_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Geometria zona (coordinate poligono nel Visual Planner)
  coordinates JSONB NOT NULL, -- Array di punti [{x, y}, ...] in cm relativi al Visual Planner
  
  -- Caratteristiche suolo per zona
  soil_type TEXT CHECK (soil_type IN ('Clay', 'Sandy', 'Loamy', 'Peaty', 'Chalky', 'Silty')),
  soil_ph DECIMAL(3, 1) CHECK (soil_ph >= 0 AND soil_ph <= 14),
  water_capacity DECIMAL(5, 2), -- Capacità idrica in mm/m
  soil_depth_cm INTEGER, -- Profondità suolo in cm
  
  -- Caratteristiche esposizione
  sun_exposure TEXT CHECK (sun_exposure IN ('FullSun', 'PartSun', 'Shade')),
  daily_sun_hours INTEGER CHECK (daily_sun_hours >= 0 AND daily_sun_hours <= 24),
  
  -- Area zona (calcolata automaticamente)
  area_sq_meters DECIMAL(8, 2),
  
  -- Metadata
  color TEXT DEFAULT '#3b82f6', -- Colore per visualizzazione
  order_index INTEGER DEFAULT 0, -- Ordine visualizzazione
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_garden_zones_garden_id ON garden_zones(garden_id);
CREATE INDEX IF NOT EXISTS idx_garden_zones_order ON garden_zones(garden_id, order_index);

-- ============================================
-- SOIL ANALYSIS (Analisi Suolo Avanzata)
-- ============================================
CREATE TABLE IF NOT EXISTS soil_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID REFERENCES garden_zones(id) ON DELETE CASCADE,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  
  -- Data analisi
  analysis_date DATE NOT NULL,
  lab_name TEXT, -- Nome laboratorio se analisi esterna
  analysis_type TEXT CHECK (analysis_type IN ('basic', 'complete', 'professional')) DEFAULT 'basic',
  
  -- Macro-nutrienti (mg/kg o %)
  nitrogen_n DECIMAL(6, 2), -- Azoto totale (N)
  phosphorus_p DECIMAL(6, 2), -- Fosforo disponibile (P)
  potassium_k DECIMAL(6, 2), -- Potassio scambiabile (K)
  
  -- Micro-nutrienti (mg/kg)
  iron_fe DECIMAL(6, 2),
  manganese_mn DECIMAL(6, 2),
  zinc_zn DECIMAL(6, 2),
  copper_cu DECIMAL(6, 2),
  boron_b DECIMAL(6, 2),
  
  -- Proprietà fisico-chimiche
  ph DECIMAL(3, 1) CHECK (ph >= 0 AND ph <= 14),
  organic_matter_percent DECIMAL(5, 2), -- Materia organica %
  organic_carbon_percent DECIMAL(5, 2), -- Carbonio organico %
  cec DECIMAL(6, 2), -- Capacità di Scambio Cationico (meq/100g)
  
  -- Texture
  sand_percent DECIMAL(5, 2),
  silt_percent DECIMAL(5, 2),
  clay_percent DECIMAL(5, 2),
  
  -- Note e raccomandazioni
  notes TEXT,
  recommendations JSONB, -- Suggerimenti fertilizzazione basati su carenze
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_soil_analysis_zone_id ON soil_analysis(zone_id);
CREATE INDEX IF NOT EXISTS idx_soil_analysis_garden_id ON soil_analysis(garden_id);
CREATE INDEX IF NOT EXISTS idx_soil_analysis_date ON soil_analysis(analysis_date DESC);

-- ============================================
-- VEGETATION INDICES (Indicatori Vegetativi)
-- ============================================
CREATE TABLE IF NOT EXISTS vegetation_indices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_log_id UUID REFERENCES photo_logs(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES garden_tasks(id) ON DELETE CASCADE NOT NULL,
  zone_id UUID REFERENCES garden_zones(id) ON DELETE SET NULL,
  
  -- Indicatori calcolati
  ndvi DECIMAL(4, 3) CHECK (ndvi >= -1 AND ndvi <= 1), -- Normalized Difference Vegetation Index
  evi DECIMAL(4, 3) CHECK (evi >= -1 AND evi <= 1), -- Enhanced Vegetation Index
  lai DECIMAL(5, 2) CHECK (lai >= 0), -- Leaf Area Index
  chlorophyll_index DECIMAL(5, 2) CHECK (chlorophyll_index >= 0), -- Chlorophyll Index
  
  -- Valori RGB utilizzati per calcolo (per debug)
  r_value INTEGER CHECK (r_value >= 0 AND r_value <= 255),
  g_value INTEGER CHECK (g_value >= 0 AND g_value <= 255),
  b_value INTEGER CHECK (b_value >= 0 AND b_value <= 255),
  
  -- Metadata
  calculation_method TEXT DEFAULT 'rgb_approximation', -- 'rgb_approximation' | 'satellite' | 'drone'
  confidence DECIMAL(3, 2) CHECK (confidence >= 0 AND confidence <= 1) DEFAULT 0.7,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vegetation_indices_photo_log ON vegetation_indices(photo_log_id);
CREATE INDEX IF NOT EXISTS idx_vegetation_indices_task ON vegetation_indices(task_id);
CREATE INDEX IF NOT EXISTS idx_vegetation_indices_zone ON vegetation_indices(zone_id);
CREATE INDEX IF NOT EXISTS idx_vegetation_indices_date ON vegetation_indices(created_at DESC);

-- ============================================
-- YIELD PREDICTIONS (Previsioni Resa)
-- ============================================
CREATE TABLE IF NOT EXISTS yield_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES garden_tasks(id) ON DELETE CASCADE NOT NULL,
  zone_id UUID REFERENCES garden_zones(id) ON DELETE SET NULL,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  
  -- Previsione
  predicted_yield_kg DECIMAL(8, 2) NOT NULL,
  predicted_yield_per_sqm DECIMAL(6, 2), -- kg per m²
  confidence_level DECIMAL(3, 2) CHECK (confidence_level >= 0 AND confidence_level <= 1),
  
  -- Date previsione
  predicted_harvest_date DATE,
  prediction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Fattori utilizzati per previsione
  factors JSONB, -- { growthRate, healthScore, weatherConditions, historicalYield, etc. }
  
  -- Risultato reale (popolato dopo raccolto)
  actual_yield_kg DECIMAL(8, 2),
  actual_harvest_date DATE,
  accuracy_percent DECIMAL(5, 2), -- Accuratezza previsione dopo raccolto
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_yield_predictions_task ON yield_predictions(task_id);
CREATE INDEX IF NOT EXISTS idx_yield_predictions_zone ON yield_predictions(zone_id);
CREATE INDEX IF NOT EXISTS idx_yield_predictions_garden ON yield_predictions(garden_id);
CREATE INDEX IF NOT EXISTS idx_yield_predictions_date ON yield_predictions(prediction_date DESC);

-- ============================================
-- IRRIGATION ZONES (Zone Irrigazione)
-- ============================================
-- Nota: Potrebbe già esistere, verificare prima di creare
CREATE TABLE IF NOT EXISTS irrigation_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  zone_id UUID REFERENCES garden_zones(id) ON DELETE SET NULL, -- Riferimento a garden_zones se esiste
  
  name TEXT NOT NULL,
  description TEXT,
  
  -- Configurazione irrigazione
  irrigation_method TEXT CHECK (irrigation_method IN ('Drip', 'Sprinkler', 'Manual', 'Flood', 'NFT', 'DWC', 'EbbFlow', 'Wick', 'Kratky')) DEFAULT 'Drip',
  flow_rate_lpm DECIMAL(6, 2), -- Litri per minuto
  target_moisture_percent DECIMAL(5, 2) CHECK (target_moisture_percent >= 0 AND target_moisture_percent <= 100),
  
  -- Sensori associati (simulati per ora)
  sensor_ids UUID[], -- Array di ID sensori simulati
  
  -- Automazione
  auto_irrigation_enabled BOOLEAN DEFAULT false,
  auto_threshold_percent DECIMAL(5, 2), -- Soglia umidità per attivazione automatica
  
  -- Metadata
  area_sq_meters DECIMAL(8, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_irrigation_zones_garden ON irrigation_zones(garden_id);
CREATE INDEX IF NOT EXISTS idx_irrigation_zones_zone ON irrigation_zones(zone_id);

-- ============================================
-- SENSOR READINGS (Storico Letture Sensori)
-- ============================================
-- Check if table exists with incorrect structure and fix it
DO $$
BEGIN
  -- If table exists but doesn't have garden_id column, drop it so it can be recreated properly
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'sensor_readings'
  ) THEN
    -- Check if it has the required column
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'sensor_readings' 
      AND column_name = 'garden_id'
    ) THEN
      -- Table exists but is missing required column - drop it
      DROP TABLE sensor_readings CASCADE;
      RAISE NOTICE 'Dropped sensor_readings table with incorrect structure - will be recreated';
    END IF;
  END IF;
END $$;

-- Create table (will create if dropped above, or skip if already exists with correct structure)
CREATE TABLE IF NOT EXISTS sensor_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  zone_id UUID REFERENCES garden_zones(id) ON DELETE SET NULL,
  irrigation_zone_id UUID REFERENCES irrigation_zones(id) ON DELETE SET NULL,
  
  -- Tipo sensore
  sensor_type TEXT CHECK (sensor_type IN ('moisture', 'temperature_soil', 'temperature_air', 'humidity_air', 'ec', 'ph', 'light', 'wind')) NOT NULL,
  
  -- Lettura
  value DECIMAL(8, 2) NOT NULL,
  unit TEXT NOT NULL, -- '%', '°C', 'pH', 'mS/cm', 'lux', 'km/h', etc.
  
  -- Timestamp lettura
  reading_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Metadata
  sensor_id UUID, -- ID sensore simulato o reale
  is_simulated BOOLEAN DEFAULT true, -- true se simulato, false se da hardware reale
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verify garden_id column exists before creating indexes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'sensor_readings' 
    AND column_name = 'garden_id'
  ) THEN
    RAISE EXCEPTION 'sensor_readings table is missing garden_id column. Cannot create indexes.';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_sensor_readings_garden ON sensor_readings(garden_id);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_zone ON sensor_readings(zone_id);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_irrigation_zone ON sensor_readings(irrigation_zone_id);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_type_date ON sensor_readings(sensor_type, reading_date DESC);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_date ON sensor_readings(reading_date DESC);

-- ============================================
-- MODIFICHE TABELLE ESISTENTI
-- ============================================

-- Gardens: Aggiungere flag precision mode
ALTER TABLE gardens 
ADD COLUMN IF NOT EXISTS has_zones BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS precision_mode_enabled BOOLEAN DEFAULT false;

-- Garden Tasks: Aggiungere riferimento a zona
ALTER TABLE garden_tasks
ADD COLUMN IF NOT EXISTS zone_id UUID REFERENCES garden_zones(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_garden_tasks_zone_id ON garden_tasks(zone_id);

-- Photo Logs: Aggiungere campi per indici vegetativi
-- (già aggiunto in extend_photo_logs.sql, ma aggiungiamo riferimento a vegetation_indices)
ALTER TABLE photo_logs
ADD COLUMN IF NOT EXISTS vegetation_indices_id UUID REFERENCES vegetation_indices(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_photo_logs_vegetation_indices ON photo_logs(vegetation_indices_id);

-- ============================================
-- TRIGGERS E FUNZIONI
-- ============================================

-- Trigger per aggiornare updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Applica trigger a tutte le tabelle con updated_at
DROP TRIGGER IF EXISTS update_garden_zones_updated_at ON garden_zones;
CREATE TRIGGER update_garden_zones_updated_at
  BEFORE UPDATE ON garden_zones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_soil_analysis_updated_at ON soil_analysis;
CREATE TRIGGER update_soil_analysis_updated_at
  BEFORE UPDATE ON soil_analysis
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_yield_predictions_updated_at ON yield_predictions;
CREATE TRIGGER update_yield_predictions_updated_at
  BEFORE UPDATE ON yield_predictions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_irrigation_zones_updated_at ON irrigation_zones;
CREATE TRIGGER update_irrigation_zones_updated_at
  BEFORE UPDATE ON irrigation_zones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Funzione per calcolare area zona da coordinate
CREATE OR REPLACE FUNCTION calculate_zone_area(coordinates JSONB, garden_size_sq_meters DECIMAL)
RETURNS DECIMAL AS $$
DECLARE
  area_cm2 DECIMAL;
  area_m2 DECIMAL;
BEGIN
  -- Calcolo area poligono usando Shoelace formula (approssimato)
  -- Per ora restituisce area approssimativa basata su bounding box
  -- In futuro si può implementare calcolo preciso poligono
  
  -- Se coordinates è un array di punti, calcola bounding box
  IF jsonb_typeof(coordinates) = 'array' THEN
    -- Approssimazione: usa bounding box
    -- In produzione implementare calcolo preciso poligono
    area_m2 := garden_size_sq_meters * 0.1; -- Default 10% dell'orto
  ELSE
    area_m2 := NULL;
  END IF;
  
  RETURN area_m2;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Garden Zones
ALTER TABLE garden_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own garden zones"
  ON garden_zones FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM gardens 
      WHERE gardens.id = garden_zones.garden_id 
      AND gardens.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own garden zones"
  ON garden_zones FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM gardens 
      WHERE gardens.id = garden_zones.garden_id 
      AND gardens.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own garden zones"
  ON garden_zones FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM gardens 
      WHERE gardens.id = garden_zones.garden_id 
      AND gardens.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own garden zones"
  ON garden_zones FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM gardens 
      WHERE gardens.id = garden_zones.garden_id 
      AND gardens.user_id = auth.uid()
    )
  );

-- Soil Analysis
ALTER TABLE soil_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own soil analysis"
  ON soil_analysis FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM gardens 
      WHERE gardens.id = soil_analysis.garden_id 
      AND gardens.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own soil analysis"
  ON soil_analysis FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM gardens 
      WHERE gardens.id = soil_analysis.garden_id 
      AND gardens.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own soil analysis"
  ON soil_analysis FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM gardens 
      WHERE gardens.id = soil_analysis.garden_id 
      AND gardens.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own soil analysis"
  ON soil_analysis FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM gardens 
      WHERE gardens.id = soil_analysis.garden_id 
      AND gardens.user_id = auth.uid()
    )
  );

-- Vegetation Indices
ALTER TABLE vegetation_indices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own vegetation indices"
  ON vegetation_indices FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM garden_tasks 
      JOIN gardens ON gardens.id = garden_tasks.garden_id
      WHERE garden_tasks.id = vegetation_indices.task_id 
      AND gardens.user_id = auth.uid()
    )
  );

-- Yield Predictions
ALTER TABLE yield_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own yield predictions"
  ON yield_predictions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM gardens 
      WHERE gardens.id = yield_predictions.garden_id 
      AND gardens.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own yield predictions"
  ON yield_predictions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM gardens 
      WHERE gardens.id = yield_predictions.garden_id 
      AND gardens.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own yield predictions"
  ON yield_predictions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM gardens 
      WHERE gardens.id = yield_predictions.garden_id 
      AND gardens.user_id = auth.uid()
    )
  );

-- Irrigation Zones
ALTER TABLE irrigation_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own irrigation zones"
  ON irrigation_zones FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM gardens 
      WHERE gardens.id = irrigation_zones.garden_id 
      AND gardens.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own irrigation zones"
  ON irrigation_zones FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM gardens 
      WHERE gardens.id = irrigation_zones.garden_id 
      AND gardens.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own irrigation zones"
  ON irrigation_zones FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM gardens 
      WHERE gardens.id = irrigation_zones.garden_id 
      AND gardens.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own irrigation zones"
  ON irrigation_zones FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM gardens 
      WHERE gardens.id = irrigation_zones.garden_id 
      AND gardens.user_id = auth.uid()
    )
  );

-- Sensor Readings
-- Verify table structure before creating policies
DO $$
BEGIN
  -- Double-check that garden_id column exists
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'sensor_readings' 
    AND column_name = 'garden_id'
  ) THEN
    RAISE EXCEPTION 'sensor_readings table is missing garden_id column. Table may not have been created correctly.';
  END IF;
END $$;

ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to allow re-running migration)
DROP POLICY IF EXISTS "Users can view their own sensor readings" ON sensor_readings;
DROP POLICY IF EXISTS "Users can insert their own sensor readings" ON sensor_readings;

CREATE POLICY "Users can view their own sensor readings"
  ON sensor_readings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM gardens 
      WHERE gardens.id = sensor_readings.garden_id 
      AND gardens.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own sensor readings"
  ON sensor_readings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM gardens 
      WHERE gardens.id = sensor_readings.garden_id 
      AND gardens.user_id = auth.uid()
    )
  );

-- ============================================
-- COMMENTI
-- ============================================

COMMENT ON TABLE garden_zones IS 'Zone dell''orto con caratteristiche specifiche per agricoltura di precisione';
COMMENT ON TABLE soil_analysis IS 'Analisi suolo avanzate per zona con macro/micro-nutrienti';
COMMENT ON TABLE vegetation_indices IS 'Indicatori vegetativi calcolati da foto (NDVI, EVI, LAI, etc.)';
COMMENT ON TABLE yield_predictions IS 'Previsioni resa basate su modelli predittivi';
COMMENT ON TABLE irrigation_zones IS 'Zone irrigazione con configurazione specifica e sensori';
COMMENT ON TABLE sensor_readings IS 'Storico letture sensori (simulati o reali) per analisi trend';

