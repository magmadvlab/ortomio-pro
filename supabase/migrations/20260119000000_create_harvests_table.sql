-- ============================================================================
-- HARVEST REGISTRATION SYSTEM - UPDATE EXISTING TABLE
-- Adds missing fields to harvest_logs table for smart harvest registration
-- ============================================================================

-- Add missing columns to harvest_logs table
ALTER TABLE harvest_logs 
ADD COLUMN IF NOT EXISTS variety TEXT,
ADD COLUMN IF NOT EXISTS zone_id UUID REFERENCES garden_zones(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS field_id TEXT, -- For field row references
ADD COLUMN IF NOT EXISTS is_tracked BOOLEAN DEFAULT false; -- true if connected to a tracked crop

-- Create additional indexes for new fields
CREATE INDEX IF NOT EXISTS idx_harvest_logs_zone_id ON harvest_logs(zone_id);
CREATE INDEX IF NOT EXISTS idx_harvest_logs_is_tracked ON harvest_logs(is_tracked);
CREATE INDEX IF NOT EXISTS idx_harvest_logs_variety ON harvest_logs(variety);

-- Add comments for new fields
COMMENT ON COLUMN harvest_logs.variety IS 'Plant variety (e.g., Datterino, San Marzano)';
COMMENT ON COLUMN harvest_logs.zone_id IS 'Reference to garden zone where harvest occurred';
COMMENT ON COLUMN harvest_logs.field_id IS 'Field row identifier for precision agriculture tracking';
COMMENT ON COLUMN harvest_logs.is_tracked IS 'True if harvest is connected to a tracked planting task';

-- Update unit constraint to include additional units supported by the component
ALTER TABLE harvest_logs DROP CONSTRAINT IF EXISTS harvest_logs_unit_check;
ALTER TABLE harvest_logs ADD CONSTRAINT harvest_logs_unit_check 
    CHECK (unit IN ('kg', 'g', 'pz', 'mazzi', 'cassette', 'litri', 'units'));

-- Update the units constraint to be more flexible for future additions
COMMENT ON COLUMN harvest_logs.unit IS 'Unit of measurement: kg, g, pz (pieces), mazzi (bunches), cassette (crates), litri (liters), units';