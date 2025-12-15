-- Migration: Add sun_exposure column to garden_beds table
-- This column was missing from the original schema but is used by the application

-- Add sun_exposure column to garden_beds if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'garden_beds' 
    AND column_name = 'sun_exposure'
  ) THEN
    ALTER TABLE garden_beds 
    ADD COLUMN sun_exposure TEXT CHECK (sun_exposure IN ('FullSun', 'PartSun', 'Shade'));
    
    -- Add comment for documentation
    COMMENT ON COLUMN garden_beds.sun_exposure IS 'Sun exposure level for the bed: FullSun, PartSun, or Shade';
  END IF;
END $$;
