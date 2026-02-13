-- =====================================================
-- EXTEND INDIVIDUAL PLANTS FOR GREENHOUSE TRACKING
-- Estende tracciamento piante individuali per serra
-- Data: 13 Febbraio 2026
-- Fase 2C
-- =====================================================

-- =====================================================
-- INDIVIDUAL_PLANTS: Aggiungi campi serra
-- =====================================================

-- Collegamento bancale serra
ALTER TABLE individual_plants 
ADD COLUMN IF NOT EXISTS greenhouse_bench_id UUID REFERENCES greenhouse_benches(id) ON DELETE SET NULL;

-- Posizione sul bancale
ALTER TABLE individual_plants 
ADD COLUMN IF NOT EXISTS bench_row_number INTEGER;

ALTER TABLE individual_plants 
ADD COLUMN IF NOT EXISTS position_in_bench_row INTEGER;

-- Nome bancale (helper per display)
ALTER TABLE individual_plants 
ADD COLUMN IF NOT EXISTS bench_name TEXT;

-- Parametri ambientali serra al momento impianto (JSONB)
ALTER TABLE individual_plants 
ADD COLUMN IF NOT EXISTS greenhouse_conditions JSONB;

-- Commenti
COMMENT ON COLUMN individual_plants.greenhouse_bench_id IS 'Collegamento al bancale serra (se pianta in serra)';
COMMENT ON COLUMN individual_plants.bench_row_number IS 'Numero fila sul bancale (1, 2, 3...)';
COMMENT ON COLUMN individual_plants.position_in_bench_row IS 'Posizione nella fila del bancale';
COMMENT ON COLUMN individual_plants.bench_name IS 'Nome bancale (helper per display)';
COMMENT ON COLUMN individual_plants.greenhouse_conditions IS 'Parametri ambientali serra al momento impianto (temp, umidità, CO2, luce, sistemi attivi)';

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_individual_plants_greenhouse_bench 
ON individual_plants(greenhouse_bench_id) 
WHERE greenhouse_bench_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_individual_plants_bench_position 
ON individual_plants(greenhouse_bench_id, bench_row_number, position_in_bench_row) 
WHERE greenhouse_bench_id IS NOT NULL;

-- Constraint: posizione valida se bancale specificato
ALTER TABLE individual_plants 
ADD CONSTRAINT check_greenhouse_position 
CHECK (
  (greenhouse_bench_id IS NULL) OR 
  (greenhouse_bench_id IS NOT NULL AND bench_row_number IS NOT NULL AND position_in_bench_row IS NOT NULL)
);

-- =====================================================
-- INDIVIDUAL_PLANT_OPERATIONS: Aggiungi parametri serra
-- =====================================================

-- Parametri ambientali serra al momento operazione (JSONB)
ALTER TABLE individual_plant_operations 
ADD COLUMN IF NOT EXISTS greenhouse_conditions JSONB;

-- Commenti
COMMENT ON COLUMN individual_plant_operations.greenhouse_conditions IS 'Parametri ambientali serra al momento operazione (temp, umidità, CO2, luce, sistemi attivi, differenziali)';

-- =====================================================
-- PLANT_HARVESTS: Aggiungi parametri serra
-- =====================================================

-- Verifica se tabella esiste, altrimenti creala
CREATE TABLE IF NOT EXISTS plant_harvests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id UUID NOT NULL REFERENCES individual_plants(id) ON DELETE CASCADE,
  garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  
  -- Dettagli raccolta
  harvest_date DATE NOT NULL,
  harvest_time TIME,
  
  -- Quantità
  quantity_kg NUMERIC(10,3) NOT NULL,
  quality_grade TEXT CHECK (quality_grade IN ('excellent', 'good', 'fair', 'poor')),
  quality_score INTEGER CHECK (quality_score BETWEEN 0 AND 100),
  
  -- Classificazione
  size_category TEXT CHECK (size_category IN ('large', 'medium', 'small')),
  ripeness_level TEXT CHECK (ripeness_level IN ('unripe', 'perfect', 'overripe')),
  
  -- Destinazione
  destination TEXT CHECK (destination IN ('consumption', 'storage', 'processing', 'sale', 'seed')),
  market_value NUMERIC(10,2),
  storage_method TEXT CHECK (storage_method IN ('fresh', 'refrigerated', 'frozen', 'dried')),
  
  -- Condizioni
  weather_conditions JSONB,
  
  -- Media
  photos TEXT[] DEFAULT '{}',
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Indici
  CONSTRAINT positive_quantity CHECK (quantity_kg > 0)
);

-- Aggiungi parametri serra (se colonna non esiste)
ALTER TABLE plant_harvests 
ADD COLUMN IF NOT EXISTS greenhouse_conditions JSONB;

-- Commenti
COMMENT ON COLUMN plant_harvests.greenhouse_conditions IS 'Parametri ambientali serra al momento raccolto + storico durante crescita (temp, umidità, CO2, giorni ottimali, medie)';

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_plant_harvests_plant ON plant_harvests(plant_id);
CREATE INDEX IF NOT EXISTS idx_plant_harvests_garden ON plant_harvests(garden_id);
CREATE INDEX IF NOT EXISTS idx_plant_harvests_date ON plant_harvests(garden_id, harvest_date DESC);

-- RLS Policies per plant_harvests (se non esistono)
ALTER TABLE plant_harvests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own plant harvests" ON plant_harvests;
CREATE POLICY "Users can view their own plant harvests"
  ON plant_harvests FOR SELECT
  USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create plant harvests in their gardens" ON plant_harvests;
CREATE POLICY "Users can create plant harvests in their gardens"
  ON plant_harvests FOR INSERT
  WITH CHECK (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update their own plant harvests" ON plant_harvests;
CREATE POLICY "Users can update their own plant harvests"
  ON plant_harvests FOR UPDATE
  USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete their own plant harvests" ON plant_harvests;
CREATE POLICY "Users can delete their own plant harvests"
  ON plant_harvests FOR DELETE
  USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- FUNZIONI HELPER
-- =====================================================

-- Funzione: Aggiorna conteggio piante su bancale
CREATE OR REPLACE FUNCTION update_bench_plant_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Se pianta aggiunta a bancale
  IF TG_OP = 'INSERT' AND NEW.greenhouse_bench_id IS NOT NULL THEN
    UPDATE greenhouse_benches 
    SET current_plants = current_plants + 1
    WHERE id = NEW.greenhouse_bench_id;
  END IF;
  
  -- Se pianta rimossa da bancale
  IF TG_OP = 'DELETE' AND OLD.greenhouse_bench_id IS NOT NULL THEN
    UPDATE greenhouse_benches 
    SET current_plants = GREATEST(0, current_plants - 1)
    WHERE id = OLD.greenhouse_bench_id;
  END IF;
  
  -- Se pianta spostata tra bancali
  IF TG_OP = 'UPDATE' THEN
    -- Rimuovi da vecchio bancale
    IF OLD.greenhouse_bench_id IS NOT NULL AND 
       (NEW.greenhouse_bench_id IS NULL OR NEW.greenhouse_bench_id != OLD.greenhouse_bench_id) THEN
      UPDATE greenhouse_benches 
      SET current_plants = GREATEST(0, current_plants - 1)
      WHERE id = OLD.greenhouse_bench_id;
    END IF;
    
    -- Aggiungi a nuovo bancale
    IF NEW.greenhouse_bench_id IS NOT NULL AND 
       (OLD.greenhouse_bench_id IS NULL OR NEW.greenhouse_bench_id != OLD.greenhouse_bench_id) THEN
      UPDATE greenhouse_benches 
      SET current_plants = current_plants + 1
      WHERE id = NEW.greenhouse_bench_id;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger per aggiornamento automatico conteggio
DROP TRIGGER IF EXISTS update_bench_plant_count_trigger ON individual_plants;
CREATE TRIGGER update_bench_plant_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON individual_plants
  FOR EACH ROW
  EXECUTE FUNCTION update_bench_plant_count();

-- =====================================================
-- VIEWS ESTESE
-- =====================================================

-- View: Piante serra con statistiche bancale
CREATE OR REPLACE VIEW greenhouse_plants_with_stats AS
SELECT 
  p.id,
  p.garden_id,
  p.greenhouse_bench_id,
  p.bench_row_number,
  p.position_in_bench_row,
  p.plant_code,
  p.plant_name,
  p.variety,
  p.planting_date,
  p.status,
  p.health_score,
  p.greenhouse_conditions,
  
  -- Info bancale
  b.name AS bench_name,
  b.bench_number,
  b.position AS bench_position,
  b.substrate_type,
  b.has_irrigation,
  b.has_heating,
  
  -- Statistiche operazioni
  COUNT(DISTINCT o.id) AS total_operations,
  MAX(o.operation_date) AS last_operation_date,
  
  -- Statistiche raccolti
  COUNT(DISTINCT h.id) AS total_harvests,
  COALESCE(SUM(h.quantity_kg), 0) AS total_harvest_kg,
  MAX(h.harvest_date) AS last_harvest_date,
  
  -- Metadata
  p.created_at,
  p.updated_at
FROM individual_plants p
LEFT JOIN greenhouse_benches b ON p.greenhouse_bench_id = b.id
LEFT JOIN individual_plant_operations o ON p.id = o.plant_id
LEFT JOIN plant_harvests h ON p.id = h.plant_id
WHERE p.greenhouse_bench_id IS NOT NULL
GROUP BY 
  p.id, p.garden_id, p.greenhouse_bench_id, p.bench_row_number, 
  p.position_in_bench_row, p.plant_code, p.plant_name, p.variety,
  p.planting_date, p.status, p.health_score, p.greenhouse_conditions,
  b.name, b.bench_number, b.position, b.substrate_type, 
  b.has_irrigation, b.has_heating, p.created_at, p.updated_at;

-- View: Statistiche produzione per bancale
CREATE OR REPLACE VIEW bench_production_stats AS
SELECT 
  b.id AS bench_id,
  b.garden_id,
  b.name AS bench_name,
  b.bench_number,
  b.position,
  
  -- Piante
  COUNT(DISTINCT p.id) AS total_plants,
  COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'healthy') AS healthy_plants,
  COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'diseased') AS diseased_plants,
  AVG(p.health_score) AS avg_health_score,
  
  -- Raccolti
  COUNT(DISTINCT h.id) AS total_harvests,
  COALESCE(SUM(h.quantity_kg), 0) AS total_production_kg,
  COALESCE(AVG(h.quantity_kg), 0) AS avg_harvest_per_plant,
  COALESCE(AVG(h.quality_score), 0) AS avg_quality_score,
  
  -- Date
  MIN(p.planting_date) AS first_planting_date,
  MAX(p.planting_date) AS last_planting_date,
  MIN(h.harvest_date) AS first_harvest_date,
  MAX(h.harvest_date) AS last_harvest_date,
  
  -- Parametri ambientali medi (da letture)
  (
    SELECT AVG(internal_temperature)
    FROM greenhouse_readings r
    WHERE r.bench_id = b.id
      AND r.reading_date >= CURRENT_DATE - INTERVAL '30 days'
  ) AS avg_temperature_30d,
  (
    SELECT AVG(internal_humidity)
    FROM greenhouse_readings r
    WHERE r.bench_id = b.id
      AND r.reading_date >= CURRENT_DATE - INTERVAL '30 days'
  ) AS avg_humidity_30d
  
FROM greenhouse_benches b
LEFT JOIN individual_plants p ON p.greenhouse_bench_id = b.id
LEFT JOIN plant_harvests h ON h.plant_id = p.id
GROUP BY b.id, b.garden_id, b.name, b.bench_number, b.position;

-- Funzione: Ottieni piante per bancale con posizione
CREATE OR REPLACE FUNCTION get_bench_plants_grid(p_bench_id UUID)
RETURNS TABLE (
  row_number INTEGER,
  position INTEGER,
  plant_id UUID,
  plant_code TEXT,
  plant_name TEXT,
  status TEXT,
  health_score INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.bench_row_number,
    p.position_in_bench_row,
    p.id,
    p.plant_code,
    p.plant_name,
    p.status,
    p.health_score
  FROM individual_plants p
  WHERE p.greenhouse_bench_id = p_bench_id
  ORDER BY p.bench_row_number, p.position_in_bench_row;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTI FINALI
-- =====================================================

COMMENT ON VIEW greenhouse_plants_with_stats IS 'Piante in serra con statistiche bancale, operazioni e raccolti';
COMMENT ON VIEW bench_production_stats IS 'Statistiche produzione e salute per bancale serra';
COMMENT ON FUNCTION get_bench_plants_grid IS 'Griglia piante su bancale con posizione (per visualizzazione 2D)';
COMMENT ON FUNCTION update_bench_plant_count IS 'Aggiorna automaticamente conteggio piante su bancale';

