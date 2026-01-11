-- =====================================================
-- ROW_TRACKING_COLUMNS
-- Auto-generated migration for missing database objects
-- Generated: 2026-01-11T13:34:02.645Z
-- =====================================================


-- MISSING COLUMNS
-- The following columns are missing and will be added:
-- - watering_logs.field_row_id
-- - watering_logs.plant_ids
-- - fertilizer_application_logs.field_row_id
-- - fertilizer_application_logs.plant_ids
-- - treatment_register.field_row_id
-- - treatment_register.plant_ids

-- Add field_row_id to watering_logs
ALTER TABLE watering_logs ADD COLUMN IF NOT EXISTS field_row_id UUID REFERENCES field_rows(id) ON DELETE SET NULL;
COMMENT ON COLUMN watering_logs.field_row_id IS 'Field row ID for row tracking';

-- Add plant_ids to watering_logs
ALTER TABLE watering_logs ADD COLUMN IF NOT EXISTS plant_ids UUID[];
COMMENT ON COLUMN watering_logs.plant_ids IS 'Plant IDs array for individual plant tracking';

-- Add field_row_id to fertilizer_application_logs
ALTER TABLE fertilizer_application_logs ADD COLUMN IF NOT EXISTS field_row_id UUID REFERENCES field_rows(id) ON DELETE SET NULL;
COMMENT ON COLUMN fertilizer_application_logs.field_row_id IS 'Field row ID for row tracking';

-- Add plant_ids to fertilizer_application_logs
ALTER TABLE fertilizer_application_logs ADD COLUMN IF NOT EXISTS plant_ids UUID[];
COMMENT ON COLUMN fertilizer_application_logs.plant_ids IS 'Plant IDs array for individual plant tracking';

-- Add field_row_id to treatment_register
ALTER TABLE treatment_register ADD COLUMN IF NOT EXISTS field_row_id UUID REFERENCES field_rows(id) ON DELETE SET NULL;
COMMENT ON COLUMN treatment_register.field_row_id IS 'Field row ID for row tracking';

-- Add plant_ids to treatment_register
ALTER TABLE treatment_register ADD COLUMN IF NOT EXISTS plant_ids UUID[];
COMMENT ON COLUMN treatment_register.plant_ids IS 'Plant IDs array for individual plant tracking';


-- Migration completed
SELECT 'Migration completed successfully' as status;
