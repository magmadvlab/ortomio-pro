-- Migration: Add Pesticide License fields to profiles table
-- Adds support for pesticide license management and treatment preferences

-- Add pesticide license columns to profiles table
DO $$ 
BEGIN
  -- Add pesticide_license_number column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'pesticide_license_number') THEN
    ALTER TABLE profiles ADD COLUMN pesticide_license_number TEXT;
  END IF;
  
  -- Add pesticide_license_expiry column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'pesticide_license_expiry') THEN
    ALTER TABLE profiles ADD COLUMN pesticide_license_expiry DATE;
  END IF;
  
  -- Add preferred_treatment_type column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'preferred_treatment_type') THEN
    ALTER TABLE profiles ADD COLUMN preferred_treatment_type TEXT DEFAULT 'organic' 
      CHECK (preferred_treatment_type IN ('organic', 'classic', 'mixed'));
  END IF;
END $$;

-- Create index on pesticide_license_expiry for efficient queries
CREATE INDEX IF NOT EXISTS idx_profiles_pesticide_license_expiry 
ON profiles(pesticide_license_expiry) 
WHERE pesticide_license_expiry IS NOT NULL;

-- Add comment to columns
COMMENT ON COLUMN profiles.pesticide_license_number IS 'Numero del patentino fitosanitario';
COMMENT ON COLUMN profiles.pesticide_license_expiry IS 'Data di scadenza del patentino fitosanitario';
COMMENT ON COLUMN profiles.preferred_treatment_type IS 'Preferenza tipo trattamento: organic (solo bio), classic (chimici con patentino), mixed (entrambi)';

