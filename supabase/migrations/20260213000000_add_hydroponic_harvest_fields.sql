-- Migration: Add Hydroponic/Aquaponic/Aeroponic fields to harvest_logs
-- Date: 2026-02-13
-- Description: Adds JSONB columns for tracking position and parameters for hydroponic/aquaponic/aeroponic harvests

-- Add hydroponic position tracking
ALTER TABLE harvest_logs 
ADD COLUMN IF NOT EXISTS hydroponic_position JSONB;

-- Add hydroponic parameters tracking
ALTER TABLE harvest_logs 
ADD COLUMN IF NOT EXISTS hydroponic_parameters JSONB;

-- Add aquaponic position tracking
ALTER TABLE harvest_logs 
ADD COLUMN IF NOT EXISTS aquaponic_position JSONB;

-- Add aquaponic parameters tracking
ALTER TABLE harvest_logs 
ADD COLUMN IF NOT EXISTS aquaponic_parameters JSONB;

-- Add aeroponic position tracking
ALTER TABLE harvest_logs 
ADD COLUMN IF NOT EXISTS aeroponic_position JSONB;

-- Add aeroponic parameters tracking
ALTER TABLE harvest_logs 
ADD COLUMN IF NOT EXISTS aeroponic_parameters JSONB;

-- Add comments for documentation
COMMENT ON COLUMN harvest_logs.hydroponic_position IS 'Position tracking for hydroponic systems (systemType, channelId, channelNumber, bucketId, position, plantCode)';
COMMENT ON COLUMN harvest_logs.hydroponic_parameters IS 'Parameters at harvest time for hydroponic systems (ph, ec, waterTemperature, daysSinceLastChange, nutrientBrand, readingId)';
COMMENT ON COLUMN harvest_logs.aquaponic_position IS 'Position tracking for aquaponic systems (systemType, bedId, bedNumber, position, plantCode)';
COMMENT ON COLUMN harvest_logs.aquaponic_parameters IS 'Parameters at harvest time for aquaponic systems (ph, ammonia, nitrite, nitrate, waterTemperature, dissolvedOxygen, fishBiomass, fishSpecies, readingId)';
COMMENT ON COLUMN harvest_logs.aeroponic_position IS 'Position tracking for aeroponic systems (systemType, chamberId, chamberNumber, position, plantCode)';
COMMENT ON COLUMN harvest_logs.aeroponic_parameters IS 'Parameters at harvest time for aeroponic systems (ph, ec, waterTemperature, mistingPressure, mistingFrequency, reservoirVolume, readingId)';

-- Create indexes for better query performance on JSONB fields
CREATE INDEX IF NOT EXISTS idx_harvest_logs_hydroponic_position ON harvest_logs USING GIN (hydroponic_position);
CREATE INDEX IF NOT EXISTS idx_harvest_logs_hydroponic_parameters ON harvest_logs USING GIN (hydroponic_parameters);
CREATE INDEX IF NOT EXISTS idx_harvest_logs_aquaponic_position ON harvest_logs USING GIN (aquaponic_position);
CREATE INDEX IF NOT EXISTS idx_harvest_logs_aquaponic_parameters ON harvest_logs USING GIN (aquaponic_parameters);
CREATE INDEX IF NOT EXISTS idx_harvest_logs_aeroponic_position ON harvest_logs USING GIN (aeroponic_position);
CREATE INDEX IF NOT EXISTS idx_harvest_logs_aeroponic_parameters ON harvest_logs USING GIN (aeroponic_parameters);
