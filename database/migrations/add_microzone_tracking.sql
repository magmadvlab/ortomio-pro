-- ============================================
-- MICRO-ZONE TRACKING FOR TREATMENTS, FERTILIZATION, IRRIGATION
-- Data: 2025-12-26
-- Descrizione: Aggiunge bed_id, zone_id, row_id per tracking specifico micro-zone
-- ============================================

-- 1. ESTENDI TREATMENT_REGISTRY
-- ============================================
ALTER TABLE treatment_registry
  ADD COLUMN IF NOT EXISTS bed_id UUID REFERENCES garden_beds(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS zone_id UUID REFERENCES garden_zones(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS row_id UUID REFERENCES field_rows(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_treatment_registry_bed ON treatment_registry(bed_id) WHERE bed_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_treatment_registry_zone ON treatment_registry(zone_id) WHERE zone_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_treatment_registry_row ON treatment_registry(row_id) WHERE row_id IS NOT NULL;

COMMENT ON COLUMN treatment_registry.bed_id IS 'Riferimento al letto/cassone specifico trattato';
COMMENT ON COLUMN treatment_registry.zone_id IS 'Riferimento alla zona precision agriculture trattata';
COMMENT ON COLUMN treatment_registry.row_id IS 'Riferimento al filare specifico trattato';

-- 2. CREA FERTILIZATION_LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS fertilization_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES garden_tasks(id) ON DELETE SET NULL,

  -- Micro-zone tracking
  bed_id UUID REFERENCES garden_beds(id) ON DELETE SET NULL,
  zone_id UUID REFERENCES garden_zones(id) ON DELETE SET NULL,
  row_id UUID REFERENCES field_rows(id) ON DELETE SET NULL,

  -- Prodotto
  product_id UUID REFERENCES fertilizer_inventory(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,

  -- Dettagli applicazione
  application_date DATE NOT NULL,
  dosage DECIMAL(10, 2) NOT NULL,
  dosage_unit TEXT NOT NULL CHECK (dosage_unit IN ('kg', 'L', 'g', 'ml', 'kg/ha', 'L/ha')),
  application_method TEXT NOT NULL CHECK (application_method IN ('Broadcast', 'Banding', 'Foliar', 'Fertigation', 'Injection')),

  -- Area trattata
  area_treated_sqm DECIMAL(10, 2),

  -- NPK applicato (calcolato o manuale)
  npk_applied JSONB, -- {n: number, p: number, k: number}

  -- Condizioni
  soil_moisture TEXT CHECK (soil_moisture IN ('Dry', 'Moist', 'Wet')),
  weather_conditions JSONB, -- {temperature: number, wind: string, rain: boolean}

  -- Piante target
  plant_names TEXT[], -- Array di nomi piante fertilizzate

  -- Metadata
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_fertilization_logs_garden ON fertilization_logs(garden_id);
CREATE INDEX idx_fertilization_logs_bed ON fertilization_logs(bed_id) WHERE bed_id IS NOT NULL;
CREATE INDEX idx_fertilization_logs_zone ON fertilization_logs(zone_id) WHERE zone_id IS NOT NULL;
CREATE INDEX idx_fertilization_logs_row ON fertilization_logs(row_id) WHERE row_id IS NOT NULL;
CREATE INDEX idx_fertilization_logs_date ON fertilization_logs(application_date);
CREATE INDEX idx_fertilization_logs_product ON fertilization_logs(product_id) WHERE product_id IS NOT NULL;

-- RLS Policy
ALTER TABLE fertilization_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own fertilization logs"
  ON fertilization_logs FOR SELECT
  USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own fertilization logs"
  ON fertilization_logs FOR INSERT
  WITH CHECK (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own fertilization logs"
  ON fertilization_logs FOR UPDATE
  USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own fertilization logs"
  ON fertilization_logs FOR DELETE
  USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

COMMENT ON TABLE fertilization_logs IS 'Log applicazioni fertilizzanti con tracking micro-zone';
COMMENT ON COLUMN fertilization_logs.bed_id IS 'Letto/cassone specifico fertilizzato';
COMMENT ON COLUMN fertilization_logs.zone_id IS 'Zona precision agriculture fertilizzata';
COMMENT ON COLUMN fertilization_logs.row_id IS 'Filare specifico fertilizzato';

-- 3. ESTENDI WATERING_LOGS
-- ============================================
ALTER TABLE watering_logs
  ADD COLUMN IF NOT EXISTS bed_id UUID REFERENCES garden_beds(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS row_id UUID REFERENCES field_rows(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_watering_logs_bed ON watering_logs(bed_id) WHERE bed_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_watering_logs_row ON watering_logs(row_id) WHERE row_id IS NOT NULL;

COMMENT ON COLUMN watering_logs.bed_id IS 'Letto/cassone specifico irrigato (opzionale se non parte di zona)';
COMMENT ON COLUMN watering_logs.row_id IS 'Filare specifico irrigato';

-- ============================================
-- HELPER VIEWS
-- ============================================

-- Vista unificata trattamenti per micro-zona
CREATE OR REPLACE VIEW treatment_by_microzone AS
SELECT
  tr.id,
  tr.garden_id,
  tr.treatment_date,
  tr.plant_name,
  tr.target_pest_disease,
  tr.dosage,
  'treatment' as operation_type,
  tr.bed_id,
  tr.zone_id,
  tr.row_id,
  gb.name as bed_name,
  gz.name as zone_name,
  fr.name as row_name
FROM treatment_registry tr
LEFT JOIN garden_beds gb ON gb.id = tr.bed_id
LEFT JOIN garden_zones gz ON gz.id = tr.zone_id
LEFT JOIN field_rows fr ON fr.id = tr.row_id;

-- Vista unificata fertilizzazioni per micro-zona
CREATE OR REPLACE VIEW fertilization_by_microzone AS
SELECT
  fl.id,
  fl.garden_id,
  fl.application_date,
  fl.product_name,
  fl.dosage,
  fl.dosage_unit,
  fl.application_method,
  'fertilization' as operation_type,
  fl.bed_id,
  fl.zone_id,
  fl.row_id,
  gb.name as bed_name,
  gz.name as zone_name,
  fr.name as row_name
FROM fertilization_logs fl
LEFT JOIN garden_beds gb ON gb.id = fl.bed_id
LEFT JOIN garden_zones gz ON gz.id = fl.zone_id
LEFT JOIN field_rows fr ON fr.id = fl.row_id;

-- Vista unificata irrigazioni per micro-zona
CREATE OR REPLACE VIEW irrigation_by_microzone AS
SELECT
  wl.id,
  wl.garden_id,
  wl.date,
  wl.duration_minutes,
  wl.liters_applied,
  wl.method,
  'irrigation' as operation_type,
  wl.bed_id,
  wl.zone_id,
  wl.row_id,
  gb.name as bed_name,
  gz.name as zone_name,
  fr.name as row_name
FROM watering_logs wl
LEFT JOIN garden_beds gb ON gb.id = wl.bed_id
LEFT JOIN garden_zones gz ON gz.id = wl.zone_id
LEFT JOIN field_rows fr ON fr.id = wl.row_id;

-- Vista combinata tutte le operazioni
CREATE OR REPLACE VIEW all_operations_by_microzone AS
SELECT * FROM treatment_by_microzone
UNION ALL
SELECT
  id, garden_id, application_date as date,
  product_name as description, dosage::TEXT as detail1, dosage_unit as detail2,
  operation_type, bed_id, zone_id, row_id, bed_name, zone_name, row_name
FROM fertilization_by_microzone
UNION ALL
SELECT
  id, garden_id, date,
  method as description, duration_minutes::TEXT as detail1, liters_applied::TEXT as detail2,
  operation_type, bed_id, zone_id, row_id, bed_name, zone_name, row_name
FROM irrigation_by_microzone
ORDER BY date DESC;

-- ============================================
-- TRIGGER per updated_at
-- ============================================
CREATE TRIGGER update_fertilization_logs_updated_at
  BEFORE UPDATE ON fertilization_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMMENTI FINALI
-- ============================================
COMMENT ON VIEW treatment_by_microzone IS 'Vista trattamenti con dettagli micro-zone (bed/zone/row)';
COMMENT ON VIEW fertilization_by_microzone IS 'Vista fertilizzazioni con dettagli micro-zone (bed/zone/row)';
COMMENT ON VIEW irrigation_by_microzone IS 'Vista irrigazioni con dettagli micro-zone (bed/zone/row)';
COMMENT ON VIEW all_operations_by_microzone IS 'Vista combinata tutte le operazioni agronomiche per micro-zona';
