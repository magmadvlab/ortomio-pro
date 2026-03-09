-- Extend individual_plant_operations with orchestrator context fields
-- Non-destructive migration: only additive columns/indexes

ALTER TABLE IF EXISTS individual_plant_operations
  ADD COLUMN IF NOT EXISTS operation_context JSONB,
  ADD COLUMN IF NOT EXISTS weather_conditions JSONB,
  ADD COLUMN IF NOT EXISTS geo_snapshot JSONB,
  ADD COLUMN IF NOT EXISTS actor_type TEXT,
  ADD COLUMN IF NOT EXISTS device_id TEXT,
  ADD COLUMN IF NOT EXISTS source_type TEXT,
  ADD COLUMN IF NOT EXISTS greenhouse_conditions JSONB;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'individual_plant_operations'
      AND column_name = 'actor_type'
  ) THEN
    BEGIN
      ALTER TABLE individual_plant_operations
        ADD CONSTRAINT individual_plant_operations_actor_type_check
        CHECK (actor_type IS NULL OR actor_type IN ('manual', 'iot', 'orchestrator'));
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_ipo_actor_type ON individual_plant_operations(actor_type);
CREATE INDEX IF NOT EXISTS idx_ipo_source_type ON individual_plant_operations(source_type);
CREATE INDEX IF NOT EXISTS idx_ipo_operation_context ON individual_plant_operations USING GIN (operation_context);
CREATE INDEX IF NOT EXISTS idx_ipo_weather_conditions ON individual_plant_operations USING GIN (weather_conditions);
CREATE INDEX IF NOT EXISTS idx_ipo_geo_snapshot ON individual_plant_operations USING GIN (geo_snapshot);
