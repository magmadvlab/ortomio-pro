-- ============================================
-- FIELD ROWS & SCALAR PRODUCTION SYSTEM
-- Data: 2025-12-26
-- Descrizione: Sistema completo per gestire filari e produzioni scalari
-- ============================================

-- 1. GARDEN ZONES (Zone Orto)
-- ============================================
CREATE TABLE IF NOT EXISTS garden_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,

  -- Identificazione
  name TEXT NOT NULL,
  description TEXT,

  -- Dimensioni
  size_sq_meters NUMERIC(10, 2) NOT NULL,
  length_meters NUMERIC(10, 2),
  width_meters NUMERIC(10, 2),

  -- Posizione (per visual mapping)
  position_x NUMERIC(5, 2),  -- % 0-100
  position_y NUMERIC(5, 2),  -- % 0-100

  -- Coltura
  primary_cultivar TEXT,
  crop_type TEXT CHECK (crop_type IN ('Vegetables', 'Fruits', 'Herbs', 'Mixed')),

  -- Caratteristiche zona
  soil_type TEXT CHECK (soil_type IN ('Clay', 'Sandy', 'Loamy', 'Peaty', 'Chalky', 'Silty')),
  soil_ph NUMERIC(3, 1),
  sun_exposure TEXT CHECK (sun_exposure IN ('FullSun', 'PartSun', 'Shade')),

  -- Metadata
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_dimensions CHECK (
    (length_meters IS NULL AND width_meters IS NULL) OR
    (length_meters > 0 AND width_meters > 0)
  )
);

-- Index per performance
CREATE INDEX idx_garden_zones_garden ON garden_zones(garden_id);

-- RLS Policy
ALTER TABLE garden_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own garden zones"
  ON garden_zones FOR SELECT
  USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own garden zones"
  ON garden_zones FOR INSERT
  WITH CHECK (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own garden zones"
  ON garden_zones FOR UPDATE
  USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own garden zones"
  ON garden_zones FOR DELETE
  USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

-- 2. FIELD ROWS (Filari)
-- ============================================
CREATE TABLE IF NOT EXISTS field_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  zone_id UUID REFERENCES garden_zones(id) ON DELETE SET NULL,

  -- Identificazione
  name TEXT NOT NULL,
  row_number INTEGER NOT NULL,

  -- Dimensioni
  length_meters NUMERIC(10, 2) NOT NULL,
  distance_from_previous_row NUMERIC(10, 2),  -- cm
  plant_spacing NUMERIC(10, 2),  -- cm

  -- Coltura
  cultivar TEXT,
  plant_count INTEGER,  -- Auto-calcolato

  -- Orientamento
  orientation TEXT CHECK (orientation IN ('N-S', 'E-W', 'NE-SW', 'NW-SE')),

  -- Irrigazione
  irrigation_line JSONB,

  -- Tracking
  planted_date DATE,
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_garden_row_number UNIQUE (garden_id, row_number),
  CONSTRAINT positive_length CHECK (length_meters > 0),
  CONSTRAINT positive_spacing CHECK (plant_spacing IS NULL OR plant_spacing > 0)
);

-- Trigger per auto-calcolo numero piante
CREATE OR REPLACE FUNCTION update_field_row_plant_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.length_meters IS NOT NULL AND NEW.plant_spacing IS NOT NULL THEN
    -- Calcola: (lunghezza in cm) / (spaziatura in cm)
    NEW.plant_count := FLOOR((NEW.length_meters * 100) / NEW.plant_spacing)::INTEGER;
  ELSE
    NEW.plant_count := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_calc_field_row_plants
  BEFORE INSERT OR UPDATE ON field_rows
  FOR EACH ROW
  EXECUTE FUNCTION update_field_row_plant_count();

-- Index per performance
CREATE INDEX idx_field_rows_garden ON field_rows(garden_id);
CREATE INDEX idx_field_rows_zone ON field_rows(zone_id);
CREATE INDEX idx_field_rows_active ON field_rows(is_active);

-- RLS Policy
ALTER TABLE field_rows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own field rows"
  ON field_rows FOR SELECT
  USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own field rows"
  ON field_rows FOR INSERT
  WITH CHECK (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own field rows"
  ON field_rows FOR UPDATE
  USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own field rows"
  ON field_rows FOR DELETE
  USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

-- 3. PLANTING BATCHES (Batch Semina Scalare)
-- ============================================
CREATE TABLE IF NOT EXISTS planting_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_row_id UUID REFERENCES field_rows(id) ON DELETE CASCADE NOT NULL,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,

  -- Identificazione batch
  batch_number INTEGER NOT NULL,
  plant_name TEXT NOT NULL,
  variety TEXT,

  -- Quantità
  plants_count INTEGER NOT NULL,
  seeds_used INTEGER,

  -- Date
  sowing_date DATE,
  transplanting_date DATE,
  expected_harvest_date DATE,

  -- Tracking origine
  seed_packet_id UUID,  -- Link a tabella seed_packets (se esiste)
  seedling_batch_id UUID,  -- Link a tabella seedling_batches (se esiste)

  -- Stato
  status TEXT NOT NULL DEFAULT 'Planned' CHECK (
    status IN ('Planned', 'Sown', 'Transplanted', 'Growing', 'Harvesting', 'Completed')
  ),
  current_quantity INTEGER NOT NULL,  -- Piante ancora vive

  -- Metadata
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT positive_plants CHECK (plants_count > 0),
  CONSTRAINT valid_current_quantity CHECK (current_quantity >= 0 AND current_quantity <= plants_count),
  CONSTRAINT unique_field_row_batch UNIQUE (field_row_id, batch_number)
);

-- Index per performance
CREATE INDEX idx_planting_batches_field_row ON planting_batches(field_row_id);
CREATE INDEX idx_planting_batches_garden ON planting_batches(garden_id);
CREATE INDEX idx_planting_batches_status ON planting_batches(status);
CREATE INDEX idx_planting_batches_sowing_date ON planting_batches(sowing_date);
CREATE INDEX idx_planting_batches_expected_harvest ON planting_batches(expected_harvest_date);

-- RLS Policy
ALTER TABLE planting_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own planting batches"
  ON planting_batches FOR SELECT
  USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own planting batches"
  ON planting_batches FOR INSERT
  WITH CHECK (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own planting batches"
  ON planting_batches FOR UPDATE
  USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own planting batches"
  ON planting_batches FOR DELETE
  USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- HELPER FUNCTIONS & VIEWS
-- ============================================

-- Funzione per ottenere occupazione filare
CREATE OR REPLACE FUNCTION get_field_row_occupancy(p_field_row_id UUID)
RETURNS TABLE (
  field_row_id UUID,
  field_row_name TEXT,
  total_length NUMERIC,
  max_plants INTEGER,
  current_plants INTEGER,
  occupancy_percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    fr.id,
    fr.name,
    fr.length_meters,
    fr.plant_count,
    COALESCE(SUM(pb.current_quantity)::INTEGER, 0),
    CASE
      WHEN fr.plant_count > 0 THEN
        ROUND((COALESCE(SUM(pb.current_quantity), 0) / fr.plant_count * 100), 2)
      ELSE 0
    END
  FROM field_rows fr
  LEFT JOIN planting_batches pb ON pb.field_row_id = fr.id
  WHERE fr.id = p_field_row_id
  GROUP BY fr.id, fr.name, fr.length_meters, fr.plant_count;
END;
$$ LANGUAGE plpgsql;

-- Vista per calendario produzioni scalari
CREATE OR REPLACE VIEW scalar_production_timeline AS
SELECT
  pb.garden_id,
  pb.field_row_id,
  fr.zone_id,
  pb.batch_number,
  pb.plant_name,
  pb.variety,
  pb.plants_count,
  pb.sowing_date,
  pb.transplanting_date,
  pb.expected_harvest_date,
  pb.status,
  pb.current_quantity,
  fr.name as field_row_name,
  gz.name as zone_name
FROM planting_batches pb
JOIN field_rows fr ON fr.id = pb.field_row_id
LEFT JOIN garden_zones gz ON gz.id = fr.zone_id
ORDER BY
  COALESCE(pb.sowing_date, pb.transplanting_date, pb.expected_harvest_date);

-- ============================================
-- COMMENTS (Documentazione)
-- ============================================

COMMENT ON TABLE garden_zones IS 'Zone dell''orto per dividere aree con diversi cultivar';
COMMENT ON TABLE field_rows IS 'Filari per campo aperto con calcolo automatico numero piante';
COMMENT ON TABLE planting_batches IS 'Batch di semina/trapianto scalare per produzioni diluite nel tempo';

COMMENT ON COLUMN field_rows.plant_count IS 'Auto-calcolato da trigger: (length_meters * 100) / plant_spacing';
COMMENT ON COLUMN planting_batches.batch_number IS 'Numero progressivo batch: 1=prima semina, 2=seconda scalare, etc.';
COMMENT ON COLUMN planting_batches.current_quantity IS 'Piante ancora vive in questo batch (può diminuire per perdite)';
