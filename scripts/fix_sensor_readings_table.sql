-- Quick fix script for sensor_readings table missing garden_id column
-- Run this ONLY if the diagnostic script shows sensor_readings exists but is missing garden_id
-- WARNING: This will drop and recreate the table, losing any existing data!

-- ============================================
-- OPTION 1: Drop and recreate (loses data)
-- ============================================
-- Uncomment the lines below if you want to drop and recreate:

-- DROP TABLE IF EXISTS sensor_readings CASCADE;
-- 
-- CREATE TABLE sensor_readings (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
--   zone_id UUID REFERENCES garden_zones(id) ON DELETE SET NULL,
--   irrigation_zone_id UUID REFERENCES irrigation_zones(id) ON DELETE SET NULL,
--   
--   -- Tipo sensore
--   sensor_type TEXT CHECK (sensor_type IN ('moisture', 'temperature_soil', 'temperature_air', 'humidity_air', 'ec', 'ph', 'light', 'wind')) NOT NULL,
--   
--   -- Lettura
--   value DECIMAL(8, 2) NOT NULL,
--   unit TEXT NOT NULL,
--   
--   -- Timestamp lettura
--   reading_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
--   
--   -- Metadata
--   sensor_id UUID,
--   is_simulated BOOLEAN DEFAULT true,
--   
--   created_at TIMESTAMPTZ DEFAULT NOW()
-- );
-- 
-- CREATE INDEX IF NOT EXISTS idx_sensor_readings_garden ON sensor_readings(garden_id);
-- CREATE INDEX IF NOT EXISTS idx_sensor_readings_zone ON sensor_readings(zone_id);
-- CREATE INDEX IF NOT EXISTS idx_sensor_readings_irrigation_zone ON sensor_readings(irrigation_zone_id);
-- CREATE INDEX IF NOT EXISTS idx_sensor_readings_type_date ON sensor_readings(sensor_type, reading_date DESC);
-- CREATE INDEX IF NOT EXISTS idx_sensor_readings_date ON sensor_readings(reading_date DESC);

-- ============================================
-- OPTION 2: Add column if table exists but column is missing (preserves data)
-- ============================================
-- This is safer but may fail if table has existing rows (NOT NULL constraint)
-- Uncomment and modify if needed:

-- ALTER TABLE sensor_readings 
-- ADD COLUMN IF NOT EXISTS garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE;
-- 
-- -- If you need to set it to NOT NULL after adding data:
-- -- UPDATE sensor_readings SET garden_id = (SELECT id FROM gardens LIMIT 1) WHERE garden_id IS NULL;
-- -- ALTER TABLE sensor_readings ALTER COLUMN garden_id SET NOT NULL;

-- ============================================
-- RECOMMENDED: Just re-run the migration
-- ============================================
-- The migration should now handle this automatically.
-- If you still get errors, run the diagnostic script first to see what's wrong.

