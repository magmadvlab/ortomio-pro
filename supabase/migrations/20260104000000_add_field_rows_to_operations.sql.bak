-- ============================================
-- Add Field Rows Support to All Operations
-- Data: 2026-01-04
-- Descrizione: Aggiunge field_row_id a tutte le tabelle operative
--              per supportare gestione filari di campo aperto
-- ============================================

-- IMPORTANTE: Strategia di naming
-- - row_id → bed_row_id (filari di aiuole/letti)
-- - field_row_id (nuovo, filari di campo aperto)

-- ============================================
-- 1. TREATMENT_REGISTER (Trattamenti Fitosanitari)
-- ============================================

-- Rinomina row_id esistente per chiarezza
ALTER TABLE IF EXISTS treatment_register
  RENAME COLUMN row_id TO bed_row_id;

-- Aggiungi supporto field_rows
ALTER TABLE IF EXISTS treatment_register
  ADD COLUMN IF NOT EXISTS field_row_id UUID REFERENCES field_rows(id) ON DELETE SET NULL;

-- Commento esplicativo
COMMENT ON COLUMN treatment_register.bed_row_id IS 'Riferimento a garden_rows (filari di aiuole/letti)';
COMMENT ON COLUMN treatment_register.field_row_id IS 'Riferimento a field_rows (filari di campo aperto)';

-- Constraint: non puoi specificare sia bed_row che field_row
ALTER TABLE IF EXISTS treatment_register
  ADD CONSTRAINT IF NOT EXISTS check_treatment_row_reference
  CHECK (
    (bed_row_id IS NOT NULL AND field_row_id IS NULL) OR
    (bed_row_id IS NULL AND field_row_id IS NOT NULL) OR
    (bed_row_id IS NULL AND field_row_id IS NULL)
  );

-- Indice per performance
CREATE INDEX IF NOT EXISTS idx_treatment_register_field_row
  ON treatment_register(field_row_id)
  WHERE field_row_id IS NOT NULL;

-- ============================================
-- 2. FERTILIZATION_LOGS (Fertilizzazioni)
-- ============================================

-- Verifica se esiste la tabella (potrebbe avere nomi diversi)
DO $$
BEGIN
  -- fertilization_logs
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fertilization_logs') THEN
    -- Rinomina row_id esistente
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'fertilization_logs' AND column_name = 'row_id') THEN
      ALTER TABLE fertilization_logs RENAME COLUMN row_id TO bed_row_id;
    END IF;

    -- Aggiungi field_row_id
    ALTER TABLE fertilization_logs
      ADD COLUMN IF NOT EXISTS field_row_id UUID REFERENCES field_rows(id) ON DELETE SET NULL;

    -- Commenti
    EXECUTE 'COMMENT ON COLUMN fertilization_logs.bed_row_id IS ''Riferimento a garden_rows (filari di aiuole/letti)''';
    EXECUTE 'COMMENT ON COLUMN fertilization_logs.field_row_id IS ''Riferimento a field_rows (filari di campo aperto)''';

    -- Constraint
    ALTER TABLE fertilization_logs
      ADD CONSTRAINT IF NOT EXISTS check_fertilization_row_reference
      CHECK (
        (bed_row_id IS NOT NULL AND field_row_id IS NULL) OR
        (bed_row_id IS NULL AND field_row_id IS NOT NULL) OR
        (bed_row_id IS NULL AND field_row_id IS NULL)
      );

    -- Indice
    CREATE INDEX IF NOT EXISTS idx_fertilization_logs_field_row
      ON fertilization_logs(field_row_id)
      WHERE field_row_id IS NOT NULL;
  END IF;

  -- fertilizer_application_logs
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fertilizer_application_logs') THEN
    -- Rinomina row_id esistente
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'fertilizer_application_logs' AND column_name = 'row_id') THEN
      ALTER TABLE fertilizer_application_logs RENAME COLUMN row_id TO bed_row_id;
    END IF;

    -- Aggiungi field_row_id
    ALTER TABLE fertilizer_application_logs
      ADD COLUMN IF NOT EXISTS field_row_id UUID REFERENCES field_rows(id) ON DELETE SET NULL;

    -- Commenti
    EXECUTE 'COMMENT ON COLUMN fertilizer_application_logs.bed_row_id IS ''Riferimento a garden_rows (filari di aiuole/letti)''';
    EXECUTE 'COMMENT ON COLUMN fertilizer_application_logs.field_row_id IS ''Riferimento a field_rows (filari di campo aperto)''';

    -- Constraint
    ALTER TABLE fertilizer_application_logs
      ADD CONSTRAINT IF NOT EXISTS check_fertilizer_app_row_reference
      CHECK (
        (bed_row_id IS NOT NULL AND field_row_id IS NULL) OR
        (bed_row_id IS NULL AND field_row_id IS NOT NULL) OR
        (bed_row_id IS NULL AND field_row_id IS NULL)
      );

    -- Indice
    CREATE INDEX IF NOT EXISTS idx_fertilizer_application_field_row
      ON fertilizer_application_logs(field_row_id)
      WHERE field_row_id IS NOT NULL;
  END IF;
END $$;

-- ============================================
-- 3. WATERING_LOGS (Irrigazioni)
-- ============================================

-- Rinomina row_id esistente
ALTER TABLE IF EXISTS watering_logs
  RENAME COLUMN row_id TO bed_row_id;

-- Aggiungi supporto field_rows
ALTER TABLE IF EXISTS watering_logs
  ADD COLUMN IF NOT EXISTS field_row_id UUID REFERENCES field_rows(id) ON DELETE SET NULL;

-- Commenti
COMMENT ON COLUMN watering_logs.bed_row_id IS 'Riferimento a garden_rows (filari di aiuole/letti)';
COMMENT ON COLUMN watering_logs.field_row_id IS 'Riferimento a field_rows (filari di campo aperto)';

-- Constraint
ALTER TABLE IF EXISTS watering_logs
  ADD CONSTRAINT IF NOT EXISTS check_watering_row_reference
  CHECK (
    (bed_row_id IS NOT NULL AND field_row_id IS NULL) OR
    (bed_row_id IS NULL AND field_row_id IS NOT NULL) OR
    (bed_row_id IS NULL AND field_row_id IS NULL)
  );

-- Indice
CREATE INDEX IF NOT EXISTS idx_watering_logs_field_row
  ON watering_logs(field_row_id)
  WHERE field_row_id IS NOT NULL;

-- ============================================
-- 4. MECHANICAL_WORK_LOGS (Lavorazioni Meccaniche)
-- ============================================

-- Verifica esistenza tabella
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mechanical_work_logs') THEN
    -- Rinomina row_id esistente
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'mechanical_work_logs' AND column_name = 'row_id') THEN
      ALTER TABLE mechanical_work_logs RENAME COLUMN row_id TO bed_row_id;
    END IF;

    -- Aggiungi field_row_id
    ALTER TABLE mechanical_work_logs
      ADD COLUMN IF NOT EXISTS field_row_id UUID REFERENCES field_rows(id) ON DELETE SET NULL;

    -- Commenti
    EXECUTE 'COMMENT ON COLUMN mechanical_work_logs.bed_row_id IS ''Riferimento a garden_rows (filari di aiuole/letti)''';
    EXECUTE 'COMMENT ON COLUMN mechanical_work_logs.field_row_id IS ''Riferimento a field_rows (filari di campo aperto)''';

    -- Constraint
    ALTER TABLE mechanical_work_logs
      ADD CONSTRAINT IF NOT EXISTS check_mechanical_work_row_reference
      CHECK (
        (bed_row_id IS NOT NULL AND field_row_id IS NULL) OR
        (bed_row_id IS NULL AND field_row_id IS NOT NULL) OR
        (bed_row_id IS NULL AND field_row_id IS NULL)
      );

    -- Indice
    CREATE INDEX IF NOT EXISTS idx_mechanical_work_field_row
      ON mechanical_work_logs(field_row_id)
      WHERE field_row_id IS NOT NULL;
  END IF;
END $$;

-- ============================================
-- 5. GARDEN_TASKS (Task Operativi)
-- ============================================

-- Aggiungi supporto field_rows ai task
ALTER TABLE IF EXISTS garden_tasks
  ADD COLUMN IF NOT EXISTS field_row_id UUID REFERENCES field_rows(id) ON DELETE SET NULL;

-- Commento
COMMENT ON COLUMN garden_tasks.field_row_id IS 'Task specifico per un filare di campo aperto';

-- Indice
CREATE INDEX IF NOT EXISTS idx_garden_tasks_field_row
  ON garden_tasks(field_row_id)
  WHERE field_row_id IS NOT NULL;

-- ============================================
-- 6. HARVEST_LOGS (Raccolti)
-- ============================================

-- Aggiungi supporto field_rows ai raccolti
ALTER TABLE IF EXISTS harvest_logs
  ADD COLUMN IF NOT EXISTS field_row_id UUID REFERENCES field_rows(id) ON DELETE SET NULL;

-- Commento
COMMENT ON COLUMN harvest_logs.field_row_id IS 'Raccolto da un filare di campo aperto';

-- Indice
CREATE INDEX IF NOT EXISTS idx_harvest_logs_field_row
  ON harvest_logs(field_row_id)
  WHERE field_row_id IS NOT NULL;

-- ============================================
-- 7. VISTE AGGREGATE (Update Views)
-- ============================================

-- Vista operazioni per microzone (estesa con field_rows)
CREATE OR REPLACE VIEW operations_by_location AS
SELECT
  'treatment' as operation_type,
  garden_id,
  bed_id,
  zone_id,
  bed_row_id,
  field_row_id,  -- NUOVO
  treatment_date as operation_date,
  crop_name,
  product_name as product,
  notes
FROM treatment_register

UNION ALL

SELECT
  'irrigation' as operation_type,
  garden_id,
  bed_id,
  NULL as zone_id,
  bed_row_id,
  field_row_id,  -- NUOVO
  watering_date as operation_date,
  NULL as crop_name,
  CAST(duration_minutes AS TEXT) || ' min' as product,
  notes
FROM watering_logs

UNION ALL

SELECT
  'fertilization' as operation_type,
  garden_id,
  bed_id,
  zone_id,
  bed_row_id,
  field_row_id,  -- NUOVO
  application_date as operation_date,
  crop_name,
  fertilizer_name as product,
  notes
FROM fertilization_logs
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fertilization_logs')

ORDER BY operation_date DESC;

-- Vista riepilogo per field_rows
CREATE OR REPLACE VIEW field_row_operations_summary AS
SELECT
  fr.id as field_row_id,
  fr.name as field_row_name,
  fr.cultivar,
  gz.name as zone_name,

  -- Conteggio operazioni
  COUNT(DISTINCT t.id) as treatments_count,
  COUNT(DISTINCT w.id) as irrigations_count,
  COUNT(DISTINCT f.id) as fertilizations_count,
  COUNT(DISTINCT h.id) as harvests_count,

  -- Date ultime operazioni
  MAX(t.treatment_date) as last_treatment_date,
  MAX(w.watering_date) as last_irrigation_date,
  MAX(f.application_date) as last_fertilization_date,
  MAX(h.harvest_date) as last_harvest_date

FROM field_rows fr
LEFT JOIN garden_zones gz ON gz.id = fr.zone_id
LEFT JOIN treatment_register t ON t.field_row_id = fr.id
LEFT JOIN watering_logs w ON w.field_row_id = fr.id
LEFT JOIN fertilization_logs f ON f.field_row_id = fr.id
  WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fertilization_logs')
LEFT JOIN harvest_logs h ON h.field_row_id = fr.id

GROUP BY fr.id, fr.name, fr.cultivar, gz.name;

-- ============================================
-- 8. FUNZIONI HELPER
-- ============================================

-- Funzione per ottenere tutte le operazioni di un field_row
CREATE OR REPLACE FUNCTION get_field_row_history(p_field_row_id UUID)
RETURNS TABLE (
  operation_type TEXT,
  operation_date DATE,
  product TEXT,
  details JSONB
) AS $$
BEGIN
  RETURN QUERY

  -- Trattamenti
  SELECT
    'treatment'::TEXT,
    treatment_date,
    product_name,
    jsonb_build_object(
      'crop', crop_name,
      'dosage', dosage,
      'method', method,
      'notes', notes
    )
  FROM treatment_register
  WHERE field_row_id = p_field_row_id

  UNION ALL

  -- Irrigazioni
  SELECT
    'irrigation'::TEXT,
    watering_date,
    CAST(duration_minutes AS TEXT) || ' minuti',
    jsonb_build_object(
      'water_mm', water_mm,
      'notes', notes
    )
  FROM watering_logs
  WHERE field_row_id = p_field_row_id

  UNION ALL

  -- Fertilizzazioni
  SELECT
    'fertilization'::TEXT,
    application_date,
    fertilizer_name,
    jsonb_build_object(
      'quantity', quantity,
      'unit', unit,
      'method', application_method,
      'notes', notes
    )
  FROM fertilization_logs
  WHERE field_row_id = p_field_row_id
    AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fertilization_logs')

  ORDER BY operation_date DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 9. RLS POLICIES (Row Level Security)
-- ============================================

-- Le policy RLS esistenti sulle tabelle operative continuano a funzionare
-- basandosi su garden_id, che è presente in field_rows tramite foreign key

-- ============================================
-- COMMENTI FINALI
-- ============================================

COMMENT ON TABLE field_rows IS 'Filari di campo aperto con supporto completo per tutte le operazioni agronomiche';

-- Notifica successo
DO $$
BEGIN
  RAISE NOTICE 'Migration completata: field_rows integrati in tutte le operazioni';
  RAISE NOTICE '- treatment_register: ✓';
  RAISE NOTICE '- fertilization_logs: ✓';
  RAISE NOTICE '- watering_logs: ✓';
  RAISE NOTICE '- mechanical_work_logs: ✓';
  RAISE NOTICE '- garden_tasks: ✓';
  RAISE NOTICE '- harvest_logs: ✓';
END $$;
