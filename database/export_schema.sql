-- Export Schema Script
-- Genera script completo per export schema database OrtoMio
-- Include tutte le tabelle, indici, trigger, funzioni, RLS policies
-- Formato compatibile per deployment online

-- ============================================
-- SETUP
-- ============================================
SET search_path = public;

-- ============================================
-- EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE SCHEMA
-- ============================================
-- Include schema base da database/schema.sql
-- (Questo script assume che schema.sql sia già stato eseguito)

-- ============================================
-- PRECISION AGRICULTURE SCHEMA
-- ============================================
-- Include migrazione precision agriculture
-- (Questo script assume che add_precision_agriculture_schema.sql sia già stato eseguito)

-- ============================================
-- VERIFICA CONSISTENZA
-- ============================================

-- Verifica che tutte le tabelle precision agriculture esistano
DO $$
DECLARE
  missing_tables TEXT[];
BEGIN
  SELECT array_agg(tablename)
  INTO missing_tables
  FROM (
    SELECT 'garden_zones' AS tablename
    UNION SELECT 'soil_analysis'
    UNION SELECT 'vegetation_indices'
    UNION SELECT 'yield_predictions'
    UNION SELECT 'irrigation_zones'
    UNION SELECT 'sensor_readings'
  ) AS required_tables
  WHERE NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = required_tables.tablename
  );
  
  IF missing_tables IS NOT NULL AND array_length(missing_tables, 1) > 0 THEN
    RAISE WARNING 'Tabelle mancanti: %', array_to_string(missing_tables, ', ');
  END IF;
END $$;

-- Verifica che i campi precision agriculture siano presenti
DO $$
BEGIN
  -- Verifica gardens.has_zones
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'gardens' 
    AND column_name = 'has_zones'
  ) THEN
    ALTER TABLE gardens ADD COLUMN has_zones BOOLEAN DEFAULT false;
  END IF;
  
  -- Verifica gardens.precision_mode_enabled
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'gardens' 
    AND column_name = 'precision_mode_enabled'
  ) THEN
    ALTER TABLE gardens ADD COLUMN precision_mode_enabled BOOLEAN DEFAULT false;
  END IF;
  
  -- Verifica garden_tasks.zone_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'garden_tasks' 
    AND column_name = 'zone_id'
  ) THEN
    ALTER TABLE garden_tasks ADD COLUMN zone_id UUID REFERENCES garden_zones(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_garden_tasks_zone_id ON garden_tasks(zone_id);
  END IF;
  
  -- Verifica photo_logs.vegetation_indices_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'photo_logs' 
    AND column_name = 'vegetation_indices_id'
  ) THEN
    ALTER TABLE photo_logs ADD COLUMN vegetation_indices_id UUID REFERENCES vegetation_indices(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_photo_logs_vegetation_indices ON photo_logs(vegetation_indices_id);
  END IF;
END $$;

-- ============================================
-- INDICI MANCANTI
-- ============================================

-- Indici per performance query comuni
CREATE INDEX IF NOT EXISTS idx_garden_zones_garden_id ON garden_zones(garden_id);
CREATE INDEX IF NOT EXISTS idx_garden_zones_order ON garden_zones(garden_id, order_index);
CREATE INDEX IF NOT EXISTS idx_soil_analysis_zone_id ON soil_analysis(zone_id);
CREATE INDEX IF NOT EXISTS idx_soil_analysis_garden_id ON soil_analysis(garden_id);
CREATE INDEX IF NOT EXISTS idx_soil_analysis_date ON soil_analysis(analysis_date DESC);
CREATE INDEX IF NOT EXISTS idx_vegetation_indices_photo_log ON vegetation_indices(photo_log_id);
CREATE INDEX IF NOT EXISTS idx_vegetation_indices_task ON vegetation_indices(task_id);
CREATE INDEX IF NOT EXISTS idx_vegetation_indices_zone ON vegetation_indices(zone_id);
CREATE INDEX IF NOT EXISTS idx_vegetation_indices_date ON vegetation_indices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_yield_predictions_task ON yield_predictions(task_id);
CREATE INDEX IF NOT EXISTS idx_yield_predictions_zone ON yield_predictions(zone_id);
CREATE INDEX IF NOT EXISTS idx_yield_predictions_garden ON yield_predictions(garden_id);
CREATE INDEX IF NOT EXISTS idx_yield_predictions_date ON yield_predictions(prediction_date DESC);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_garden ON sensor_readings(garden_id);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_zone ON sensor_readings(zone_id);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_type_date ON sensor_readings(sensor_type, reading_date DESC);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_date ON sensor_readings(reading_date DESC);

-- ============================================
-- TRIGGERS
-- ============================================

-- Funzione update_updated_at_column (se non esiste)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger per garden_zones
DROP TRIGGER IF EXISTS update_garden_zones_updated_at ON garden_zones;
CREATE TRIGGER update_garden_zones_updated_at
  BEFORE UPDATE ON garden_zones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger per soil_analysis
DROP TRIGGER IF EXISTS update_soil_analysis_updated_at ON soil_analysis;
CREATE TRIGGER update_soil_analysis_updated_at
  BEFORE UPDATE ON soil_analysis
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger per yield_predictions
DROP TRIGGER IF EXISTS update_yield_predictions_updated_at ON yield_predictions;
CREATE TRIGGER update_yield_predictions_updated_at
  BEFORE UPDATE ON yield_predictions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Abilita RLS su tutte le tabelle precision agriculture
ALTER TABLE garden_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE soil_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE vegetation_indices ENABLE ROW LEVEL SECURITY;
ALTER TABLE yield_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE irrigation_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;

-- Policies per garden_zones (se non esistono)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'garden_zones' 
    AND policyname = 'Users can view their own garden zones'
  ) THEN
    CREATE POLICY "Users can view their own garden zones"
      ON garden_zones FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM gardens 
          WHERE gardens.id = garden_zones.garden_id 
          AND gardens.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Policies per soil_analysis (se non esistono)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'soil_analysis' 
    AND policyname = 'Users can view their own soil analysis'
  ) THEN
    CREATE POLICY "Users can view their own soil analysis"
      ON soil_analysis FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM gardens 
          WHERE gardens.id = soil_analysis.garden_id 
          AND gardens.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Policies per vegetation_indices (se non esistono)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'vegetation_indices' 
    AND policyname = 'Users can view their own vegetation indices'
  ) THEN
    CREATE POLICY "Users can view their own vegetation indices"
      ON vegetation_indices FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM garden_tasks 
          WHERE garden_tasks.id = vegetation_indices.task_id 
          AND garden_tasks.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Policies per yield_predictions (se non esistono)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'yield_predictions' 
    AND policyname = 'Users can view their own yield predictions'
  ) THEN
    CREATE POLICY "Users can view their own yield predictions"
      ON yield_predictions FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM gardens 
          WHERE gardens.id = yield_predictions.garden_id 
          AND gardens.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Policies per sensor_readings (se non esistono)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'sensor_readings' 
    AND policyname = 'Users can view their own sensor readings'
  ) THEN
    CREATE POLICY "Users can view their own sensor readings"
      ON sensor_readings FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM gardens 
          WHERE gardens.id = sensor_readings.garden_id 
          AND gardens.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- ============================================
-- FUNZIONI DATABASE
-- ============================================

-- Funzione calcolo area zona (se non esiste)
CREATE OR REPLACE FUNCTION calculate_zone_area(coordinates JSONB, garden_size_sq_meters DECIMAL)
RETURNS DECIMAL AS $$
DECLARE
  area_cm2 DECIMAL;
  area_m2 DECIMAL;
BEGIN
  -- Calcolo area poligono usando Shoelace formula (approssimato)
  IF jsonb_typeof(coordinates) = 'array' THEN
    area_m2 := garden_size_sq_meters * 0.1; -- Default 10% dell'orto
  ELSE
    area_m2 := NULL;
  END IF;
  
  RETURN area_m2;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMMENTI
-- ============================================

COMMENT ON TABLE garden_zones IS 'Zone dell''orto con caratteristiche specifiche per agricoltura di precisione';
COMMENT ON TABLE soil_analysis IS 'Analisi suolo avanzate per zona con macro/micro-nutrienti';
COMMENT ON TABLE vegetation_indices IS 'Indicatori vegetativi calcolati da foto (NDVI, EVI, LAI, etc.)';
COMMENT ON TABLE yield_predictions IS 'Previsioni resa basate su modelli predittivi';
COMMENT ON TABLE irrigation_zones IS 'Zone irrigazione con configurazione specifica e sensori';
COMMENT ON TABLE sensor_readings IS 'Storico letture sensori (simulati o reali) per analisi trend';

COMMENT ON COLUMN gardens.has_zones IS 'Flag per indicare se l''orto ha zone mappate';
COMMENT ON COLUMN gardens.precision_mode_enabled IS 'Flag per abilitare modalità agricoltura di precisione';
COMMENT ON COLUMN garden_tasks.zone_id IS 'Riferimento alla zona precision agriculture (opzionale)';
COMMENT ON COLUMN photo_logs.vegetation_indices_id IS 'Riferimento agli indici vegetativi calcolati da questa foto';

-- ============================================
-- VERIFICA FINALE
-- ============================================

-- Report finale
DO $$
DECLARE
  table_count INTEGER;
  index_count INTEGER;
  trigger_count INTEGER;
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM pg_tables
  WHERE schemaname = 'public'
  AND tablename IN ('garden_zones', 'soil_analysis', 'vegetation_indices', 'yield_predictions', 'irrigation_zones', 'sensor_readings');
  
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes
  WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
  AND (
    tablename IN ('garden_zones', 'soil_analysis', 'vegetation_indices', 'yield_predictions', 'sensor_readings')
    OR indexname LIKE '%zone%' OR indexname LIKE '%vegetation%' OR indexname LIKE '%yield%'
  );
  
  SELECT COUNT(*) INTO trigger_count
  FROM pg_trigger
  WHERE tgname LIKE '%precision%' OR tgname LIKE '%zone%' OR tgname LIKE '%soil%' OR tgname LIKE '%yield%';
  
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename IN ('garden_zones', 'soil_analysis', 'vegetation_indices', 'yield_predictions', 'sensor_readings');
  
  RAISE NOTICE 'Export Schema Completato:';
  RAISE NOTICE '  - Tabelle Precision Agriculture: %', table_count;
  RAISE NOTICE '  - Indici creati: %', index_count;
  RAISE NOTICE '  - Trigger creati: %', trigger_count;
  RAISE NOTICE '  - RLS Policies: %', policy_count;
END $$;




