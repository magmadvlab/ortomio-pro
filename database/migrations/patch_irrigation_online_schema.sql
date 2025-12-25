-- Migration: Patch Irrigation Schema (Online -> Full)
-- Obiettivo: allineare le tabelle irrigation_* e watering_logs allo schema completo usato dall'app.
-- Sicuro da rieseguire: usa IF NOT EXISTS / DO blocks.

-- Enable UUID extension (se non già abilitato)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- irrigation_systems: aggiungi colonne mancanti
-- ============================================
ALTER TABLE irrigation_systems
  ADD COLUMN IF NOT EXISTS type TEXT,
  ADD COLUMN IF NOT EXISTS water_source TEXT,
  ADD COLUMN IF NOT EXISTS pressure_bar DECIMAL(4,2),
  ADD COLUMN IF NOT EXISTS has_timer BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS has_valve BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS notes TEXT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'irrigation_systems'
      AND column_name = 'type'
  ) THEN
    BEGIN
      ALTER TABLE irrigation_systems
        ADD CONSTRAINT irrigation_systems_type_check
        CHECK (type IN ('Manual', 'Drip', 'Sprinkler', 'Micro', 'Soaker'));
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'irrigation_systems'
      AND column_name = 'water_source'
  ) THEN
    BEGIN
      ALTER TABLE irrigation_systems
        ADD CONSTRAINT irrigation_systems_water_source_check
        CHECK (water_source IN ('Municipal', 'Well', 'Rainwater', 'River', 'Pond', 'Consortium'));
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
  END IF;
END $$;

-- ============================================
-- irrigation_zones: aggiungi colonne mancanti
-- ============================================
ALTER TABLE irrigation_zones
  ADD COLUMN IF NOT EXISTS system_id UUID,
  ADD COLUMN IF NOT EXISTS area_sqm DECIMAL(8,2),
  ADD COLUMN IF NOT EXISTS method TEXT,
  ADD COLUMN IF NOT EXISTS flow_rate_lph DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS valve_id UUID,
  ADD COLUMN IF NOT EXISTS bed_ids UUID[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS plant_task_ids UUID[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS plant_types JSONB,
  ADD COLUMN IF NOT EXISTS is_automated BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS schedule JSONB,
  ADD COLUMN IF NOT EXISTS last_watered_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS calculated_from_components BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS manual_config JSONB,
  ADD COLUMN IF NOT EXISTS dripline_config JSONB,
  ADD COLUMN IF NOT EXISTS drippers_config JSONB,
  ADD COLUMN IF NOT EXISTS micro_sprinkler_config JSONB;

-- Backfill system_id da eventuale colonna legacy (es. irrigation_system_id)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'irrigation_zones'
      AND column_name = 'system_id'
  ) THEN
    -- se esiste una colonna legacy, migra verso system_id
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'irrigation_zones'
        AND column_name = 'irrigation_system_id'
    ) THEN
      EXECUTE 'UPDATE irrigation_zones SET system_id = irrigation_system_id WHERE system_id IS NULL AND irrigation_system_id IS NOT NULL';
    END IF;
  END IF;
END $$;

-- Se system_id è ancora NULL, crea un sistema "Default" per garden e collega le zone
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'irrigation_zones'
      AND column_name = 'garden_id'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'irrigation_zones'
      AND column_name = 'system_id'
  ) THEN
    -- crea un sistema di irrigazione per ogni garden che non ne ha uno
    INSERT INTO irrigation_systems (id, garden_id, name, type, created_at, updated_at)
    SELECT
      uuid_generate_v4(),
      g.id,
      'Sistema irrigazione (Default)',
      'Drip',
      NOW(),
      NOW()
    FROM gardens g
    WHERE EXISTS (SELECT 1 FROM irrigation_zones z WHERE z.garden_id = g.id)
      AND NOT EXISTS (SELECT 1 FROM irrigation_systems s WHERE s.garden_id = g.id);

    -- collega le zone al sistema più recente del garden (fallback robusto)
    WITH latest_system AS (
      SELECT DISTINCT ON (garden_id)
        garden_id,
        id
      FROM irrigation_systems
      ORDER BY garden_id, created_at DESC
    )
    UPDATE irrigation_zones z
    SET system_id = ls.id
    FROM latest_system ls
    WHERE z.garden_id = ls.garden_id
      AND z.system_id IS NULL;
  END IF;
END $$;

-- Backfill colonne usate dall'app da colonne legacy (se presenti)
DO $$
BEGIN
  -- method <- irrigation_method
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'irrigation_zones'
      AND column_name = 'irrigation_method'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'irrigation_zones'
      AND column_name = 'method'
  ) THEN
    EXECUTE 'UPDATE irrigation_zones SET method = irrigation_method WHERE method IS NULL AND irrigation_method IS NOT NULL';
  END IF;

  -- flow_rate_lph <- flow_rate_lpm * 60
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'irrigation_zones'
      AND column_name = 'flow_rate_lpm'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'irrigation_zones'
      AND column_name = 'flow_rate_lph'
  ) THEN
    EXECUTE 'UPDATE irrigation_zones SET flow_rate_lph = (flow_rate_lpm * 60) WHERE flow_rate_lph IS NULL AND flow_rate_lpm IS NOT NULL';
  END IF;

  -- area_sqm <- area_sq_meters
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'irrigation_zones'
      AND column_name = 'area_sq_meters'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'irrigation_zones'
      AND column_name = 'area_sqm'
  ) THEN
    EXECUTE 'UPDATE irrigation_zones SET area_sqm = area_sq_meters WHERE area_sqm IS NULL AND area_sq_meters IS NOT NULL';
  END IF;

  -- is_automated <- auto_irrigation_enabled
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'irrigation_zones'
      AND column_name = 'auto_irrigation_enabled'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'irrigation_zones'
      AND column_name = 'is_automated'
  ) THEN
    EXECUTE 'UPDATE irrigation_zones SET is_automated = auto_irrigation_enabled WHERE is_automated IS NULL AND auto_irrigation_enabled IS NOT NULL';
  END IF;

  -- plant_types <- description (best effort: wrap in json)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'irrigation_zones'
      AND column_name = 'description'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'irrigation_zones'
      AND column_name = 'plant_types'
  ) THEN
    EXECUTE 'UPDATE irrigation_zones SET plant_types = jsonb_build_array(description) WHERE plant_types IS NULL AND description IS NOT NULL';
  END IF;
END $$;

-- Backfill garden_id se mancante (deriva da irrigation_systems tramite system_id)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'irrigation_zones'
      AND column_name = 'garden_id'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'irrigation_zones'
      AND column_name = 'system_id'
  ) THEN
    UPDATE irrigation_zones z
    SET garden_id = s.garden_id
    FROM irrigation_systems s
    WHERE z.system_id = s.id
      AND z.garden_id IS NULL;

    BEGIN
      ALTER TABLE irrigation_zones
        ALTER COLUMN garden_id SET NOT NULL;
    EXCEPTION WHEN others THEN
      -- se ci sono ancora NULL non forzare
      NULL;
    END;

    CREATE INDEX IF NOT EXISTS idx_irrigation_zones_garden ON irrigation_zones(garden_id);
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'irrigation_zones'
      AND column_name = 'area_sqm'
  ) THEN
    BEGIN
      ALTER TABLE irrigation_zones
        ALTER COLUMN area_sqm SET NOT NULL;
    EXCEPTION WHEN others THEN
      NULL;
    END;
  END IF;
END $$;

-- ============================================
-- watering_logs: aggiungi colonne mancanti
-- ============================================
ALTER TABLE watering_logs
  ADD COLUMN IF NOT EXISTS garden_id UUID,
  ADD COLUMN IF NOT EXISTS watered_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS weather_condition TEXT,
  ADD COLUMN IF NOT EXISTS soil_moisture_before INTEGER,
  ADD COLUMN IF NOT EXISTS soil_moisture_after INTEGER,
  ADD COLUMN IF NOT EXISTS air_temperature_c DECIMAL(4,2);

-- Backfill watered_at da date se mancante
UPDATE watering_logs
SET watered_at = (date::timestamp AT TIME ZONE 'UTC')
WHERE watered_at IS NULL;

-- Backfill garden_id da zone se mancante
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'watering_logs'
      AND column_name = 'garden_id'
  ) THEN
    UPDATE watering_logs wl
    SET garden_id = z.garden_id
    FROM irrigation_zones z
    WHERE wl.zone_id = z.id
      AND wl.garden_id IS NULL;

    CREATE INDEX IF NOT EXISTS idx_watering_logs_garden ON watering_logs(garden_id);
    CREATE INDEX IF NOT EXISTS idx_watering_logs_watered_at ON watering_logs(watered_at DESC);
  END IF;
END $$;

-- ============================================
-- Trigger: update updated_at
-- ============================================
-- Crea/aggiorna la funzione (safe: CREATE OR REPLACE)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $func$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_irrigation_systems_updated_at ON irrigation_systems;
CREATE TRIGGER update_irrigation_systems_updated_at
  BEFORE UPDATE ON irrigation_systems
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_irrigation_zones_updated_at ON irrigation_zones;
CREATE TRIGGER update_irrigation_zones_updated_at
  BEFORE UPDATE ON irrigation_zones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Trigger: auto-update last_watered_at
-- ============================================
CREATE OR REPLACE FUNCTION update_zone_last_watered()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE irrigation_zones
  SET last_watered_at = NEW.watered_at
  WHERE id = NEW.zone_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_zone_last_watered ON watering_logs;
CREATE TRIGGER trigger_update_zone_last_watered
  AFTER INSERT ON watering_logs
  FOR EACH ROW EXECUTE FUNCTION update_zone_last_watered();

-- ============================================
-- RLS: assicurati che garden_id sia usabile per policy su zones/logs
-- ============================================
ALTER TABLE irrigation_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE irrigation_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE irrigation_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE watering_logs ENABLE ROW LEVEL SECURITY;

-- Policy irrigation_systems
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='irrigation_systems' AND policyname='Users can only access irrigation systems in their gardens'
  ) THEN
    CREATE POLICY "Users can only access irrigation systems in their gardens"
      ON irrigation_systems FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM gardens
          WHERE gardens.id = irrigation_systems.garden_id
          AND gardens.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Policy irrigation_zones
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='irrigation_zones' AND policyname='Users can only access irrigation zones in their systems'
  ) THEN
    CREATE POLICY "Users can only access irrigation zones in their systems"
      ON irrigation_zones FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM irrigation_systems
          JOIN gardens ON gardens.id = irrigation_systems.garden_id
          WHERE irrigation_systems.id = irrigation_zones.system_id
          AND gardens.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Policy irrigation_components
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='irrigation_components' AND policyname='Users can only access irrigation components in their gardens'
  ) THEN
    CREATE POLICY "Users can only access irrigation components in their gardens"
      ON irrigation_components FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM irrigation_zones iz
          JOIN gardens g ON iz.garden_id = g.id
          WHERE iz.id = irrigation_components.zone_id
          AND g.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Policy watering_logs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='watering_logs' AND policyname='Users can only access watering logs in their gardens'
  ) THEN
    CREATE POLICY "Users can only access watering logs in their gardens"
      ON watering_logs FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM irrigation_zones iz
          JOIN gardens g ON iz.garden_id = g.id
          WHERE iz.id = watering_logs.zone_id
          AND g.user_id = auth.uid()
        )
      );
  END IF;
END $$;

