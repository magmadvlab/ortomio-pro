-- =====================================================
-- GREENHOUSE TRACKING SYSTEM
-- Tracciamento bancali e parametri ambientali serra
-- Data: 13 Febbraio 2026
-- =====================================================

-- =====================================================
-- GREENHOUSE BENCHES (Bancali Serra)
-- =====================================================

CREATE TABLE IF NOT EXISTS greenhouse_benches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  greenhouse_id UUID, -- Future-proof per serre multiple
  
  -- Identificazione
  bench_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  
  -- Dimensioni
  length_cm INTEGER NOT NULL,
  width_cm INTEGER NOT NULL,
  height_cm INTEGER NOT NULL, -- Altezza da terra
  
  -- Capacità
  row_count INTEGER NOT NULL, -- Numero file sul bancale
  plants_per_row INTEGER NOT NULL,
  total_capacity INTEGER NOT NULL, -- row_count * plants_per_row
  current_plants INTEGER DEFAULT 0, -- Piante attualmente presenti
  
  -- Materiale e costruzione
  material TEXT CHECK (material IN ('wood', 'metal', 'plastic', 'concrete')),
  has_drainage BOOLEAN NOT NULL DEFAULT true,
  drainage_type TEXT CHECK (drainage_type IN ('holes', 'slope', 'gutter')),
  
  -- Posizione in serra
  position TEXT CHECK (position IN ('north', 'center', 'south', 'east', 'west')),
  level INTEGER DEFAULT 1, -- Per bancali a più livelli
  
  -- Substrato
  substrate_type TEXT CHECK (substrate_type IN ('soil', 'coco', 'perlite', 'rockwool', 'mixed', 'hydroponic')),
  substrate_depth_cm INTEGER,
  substrate_notes TEXT,
  
  -- Irrigazione
  has_irrigation BOOLEAN DEFAULT false,
  irrigation_type TEXT CHECK (irrigation_type IN ('drip', 'subirrigation', 'manual', 'mist', 'flood')),
  emitter_spacing_cm INTEGER, -- Distanza tra gocciolatori
  emitter_flow_rate_lph NUMERIC(5,2), -- Litri per ora per gocciolatore
  
  -- Riscaldamento
  has_heating BOOLEAN DEFAULT false,
  heating_type TEXT CHECK (heating_type IN ('cable', 'mat', 'pipe', 'air')),
  
  -- Stato
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_bench_number_per_garden UNIQUE (garden_id, bench_number),
  CONSTRAINT positive_dimensions CHECK (length_cm > 0 AND width_cm > 0 AND height_cm > 0),
  CONSTRAINT positive_capacity CHECK (row_count > 0 AND plants_per_row > 0 AND total_capacity > 0),
  CONSTRAINT valid_current_plants CHECK (current_plants >= 0 AND current_plants <= total_capacity)
);

-- Indici per performance
CREATE INDEX idx_greenhouse_benches_garden ON greenhouse_benches(garden_id);
CREATE INDEX idx_greenhouse_benches_active ON greenhouse_benches(garden_id, is_active);
CREATE INDEX idx_greenhouse_benches_position ON greenhouse_benches(garden_id, position);

-- Trigger per aggiornamento automatico updated_at
CREATE TRIGGER update_greenhouse_benches_updated_at
  BEFORE UPDATE ON greenhouse_benches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE greenhouse_benches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own greenhouse benches"
  ON greenhouse_benches FOR SELECT
  USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create greenhouse benches in their gardens"
  ON greenhouse_benches FOR INSERT
  WITH CHECK (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own greenhouse benches"
  ON greenhouse_benches FOR UPDATE
  USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own greenhouse benches"
  ON greenhouse_benches FOR DELETE
  USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- GREENHOUSE READINGS (Letture Parametri Ambientali)
-- =====================================================

CREATE TABLE IF NOT EXISTS greenhouse_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  greenhouse_id UUID, -- Future-proof per serre multiple
  
  -- Timestamp
  reading_date DATE NOT NULL,
  reading_time TIME NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL, -- Timestamp completo per ordinamento
  
  -- Parametri ambientali interni
  internal_temperature NUMERIC(5,2) NOT NULL, -- °C
  internal_humidity NUMERIC(5,2) NOT NULL, -- %
  co2_level INTEGER, -- ppm (parts per million)
  light_intensity INTEGER, -- lux
  
  -- Parametri esterni (per confronto)
  external_temperature NUMERIC(5,2), -- °C
  external_humidity NUMERIC(5,2), -- %
  
  -- Differenziali (calcolati automaticamente)
  temperature_delta NUMERIC(5,2), -- Interno - Esterno
  humidity_delta NUMERIC(5,2), -- Interno - Esterno
  
  -- Sistemi attivi al momento lettura
  ventilation_active BOOLEAN NOT NULL DEFAULT false,
  heating_active BOOLEAN NOT NULL DEFAULT false,
  shading_active BOOLEAN NOT NULL DEFAULT false,
  irrigation_active BOOLEAN DEFAULT false,
  
  -- Posizione lettura (se sensori multipli)
  bench_id UUID REFERENCES greenhouse_benches(id) ON DELETE SET NULL,
  position TEXT CHECK (position IN ('north', 'center', 'south', 'east', 'west')),
  height_cm INTEGER, -- Altezza sensore da terra
  
  -- Qualità aria
  air_quality TEXT CHECK (air_quality IN ('excellent', 'good', 'fair', 'poor')),
  
  -- Note e osservazioni
  notes TEXT,
  observations TEXT[], -- Array di osservazioni
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT valid_temperature CHECK (internal_temperature BETWEEN -20 AND 60),
  CONSTRAINT valid_humidity CHECK (internal_humidity BETWEEN 0 AND 100),
  CONSTRAINT valid_co2 CHECK (co2_level IS NULL OR co2_level BETWEEN 0 AND 5000),
  CONSTRAINT valid_light CHECK (light_intensity IS NULL OR light_intensity >= 0)
);

-- Indici per performance
CREATE INDEX idx_greenhouse_readings_garden ON greenhouse_readings(garden_id);
CREATE INDEX idx_greenhouse_readings_timestamp ON greenhouse_readings(garden_id, timestamp DESC);
CREATE INDEX idx_greenhouse_readings_date ON greenhouse_readings(garden_id, reading_date DESC);
CREATE INDEX idx_greenhouse_readings_bench ON greenhouse_readings(bench_id);

-- Trigger per calcolo automatico differenziali
CREATE OR REPLACE FUNCTION calculate_greenhouse_deltas()
RETURNS TRIGGER AS $$
BEGIN
  -- Calcola differenziale temperatura
  IF NEW.external_temperature IS NOT NULL THEN
    NEW.temperature_delta := NEW.internal_temperature - NEW.external_temperature;
  END IF;
  
  -- Calcola differenziale umidità
  IF NEW.external_humidity IS NOT NULL THEN
    NEW.humidity_delta := NEW.internal_humidity - NEW.external_humidity;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_greenhouse_deltas_trigger
  BEFORE INSERT OR UPDATE ON greenhouse_readings
  FOR EACH ROW
  EXECUTE FUNCTION calculate_greenhouse_deltas();

-- RLS Policies
ALTER TABLE greenhouse_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own greenhouse readings"
  ON greenhouse_readings FOR SELECT
  USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create greenhouse readings in their gardens"
  ON greenhouse_readings FOR INSERT
  WITH CHECK (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own greenhouse readings"
  ON greenhouse_readings FOR UPDATE
  USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own greenhouse readings"
  ON greenhouse_readings FOR DELETE
  USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- VIEWS E FUNZIONI HELPER
-- =====================================================

-- View: Statistiche bancali
CREATE OR REPLACE VIEW greenhouse_bench_stats AS
SELECT 
  b.id AS bench_id,
  b.garden_id,
  b.name AS bench_name,
  b.bench_number,
  b.total_capacity,
  b.current_plants,
  ROUND((b.current_plants::NUMERIC / b.total_capacity::NUMERIC) * 100, 2) AS occupancy_rate,
  (b.total_capacity - b.current_plants) AS available_spots,
  COUNT(DISTINCT p.id) AS actual_plant_count,
  AVG(p.health_score) AS avg_health_score,
  b.position,
  b.is_active,
  b.created_at
FROM greenhouse_benches b
LEFT JOIN individual_plants p ON p.greenhouse_bench_id = b.id AND p.status != 'dead'
GROUP BY b.id, b.garden_id, b.name, b.bench_number, b.total_capacity, b.current_plants, b.position, b.is_active, b.created_at;

-- View: Ultime letture per bancale
CREATE OR REPLACE VIEW latest_greenhouse_readings AS
SELECT DISTINCT ON (garden_id, bench_id)
  id,
  garden_id,
  bench_id,
  reading_date,
  reading_time,
  timestamp,
  internal_temperature,
  internal_humidity,
  co2_level,
  light_intensity,
  external_temperature,
  external_humidity,
  temperature_delta,
  humidity_delta,
  ventilation_active,
  heating_active,
  shading_active,
  position,
  created_at
FROM greenhouse_readings
ORDER BY garden_id, bench_id, timestamp DESC;

-- Funzione: Ottieni statistiche parametri per periodo
CREATE OR REPLACE FUNCTION get_greenhouse_stats(
  p_garden_id UUID,
  p_from_date DATE,
  p_to_date DATE
)
RETURNS TABLE (
  parameter TEXT,
  min_value NUMERIC,
  max_value NUMERIC,
  avg_value NUMERIC,
  median_value NUMERIC,
  readings_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'temperature'::TEXT,
    MIN(internal_temperature),
    MAX(internal_temperature),
    AVG(internal_temperature),
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY internal_temperature),
    COUNT(*)
  FROM greenhouse_readings
  WHERE garden_id = p_garden_id
    AND reading_date BETWEEN p_from_date AND p_to_date
  
  UNION ALL
  
  SELECT 
    'humidity'::TEXT,
    MIN(internal_humidity),
    MAX(internal_humidity),
    AVG(internal_humidity),
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY internal_humidity),
    COUNT(*)
  FROM greenhouse_readings
  WHERE garden_id = p_garden_id
    AND reading_date BETWEEN p_from_date AND p_to_date
  
  UNION ALL
  
  SELECT 
    'co2'::TEXT,
    MIN(co2_level),
    MAX(co2_level),
    AVG(co2_level),
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY co2_level),
    COUNT(*)
  FROM greenhouse_readings
  WHERE garden_id = p_garden_id
    AND reading_date BETWEEN p_from_date AND p_to_date
    AND co2_level IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTI
-- =====================================================

COMMENT ON TABLE greenhouse_benches IS 'Bancali/tavoli per coltivazione in serra con tracciamento capacità e configurazione';
COMMENT ON TABLE greenhouse_readings IS 'Letture parametri ambientali serra (temperatura, umidità, CO2, luce)';
COMMENT ON VIEW greenhouse_bench_stats IS 'Statistiche occupazione e salute piante per bancale';
COMMENT ON VIEW latest_greenhouse_readings IS 'Ultime letture parametri per ogni bancale';
COMMENT ON FUNCTION get_greenhouse_stats IS 'Statistiche parametri ambientali per periodo specificato';

