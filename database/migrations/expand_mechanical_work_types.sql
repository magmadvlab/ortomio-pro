-- Migration: Expand Mechanical Work Types and Equipment Types
-- Adds new work types (preparazione terreno, cura pianta, lavorazioni pianta)
-- Adds new equipment types (piccoli mezzi, elettrificati, attrezzi trattore)
-- Adds equipment_attachment field for tractor attachments

-- Step 1: Drop existing CHECK constraints
ALTER TABLE mechanical_work_register 
  DROP CONSTRAINT IF EXISTS mechanical_work_register_work_type_check;

ALTER TABLE mechanical_work_register 
  DROP CONSTRAINT IF EXISTS mechanical_work_register_equipment_type_check;

-- Step 2: Add new CHECK constraint for work_type with all new types
ALTER TABLE mechanical_work_register
  ADD CONSTRAINT mechanical_work_register_work_type_check 
  CHECK (work_type IN (
    -- Suolo
    'Plowing', 'Subsoiling', 'Harrowing', 'Tilling', 'Rolling', 'Hoeing', 'EarthingUp', 'Mulching', 'PostSowingRolling',
    -- Chioma
    'FormativePruning', 'MaintenancePruning', 'RejuvenationPruning', 'SummerPruning', 'WinterPruning', 
    'Thinning', 'Suckering', 'Defoliation', 'Tying', 'OliveShredding', 'RunnerManagement', 
    'StrawberryMulching', 'StrawberryCleaning', 'CaneRemoval', 'TipPruning', 'RaspberryTying', 
    'SuckerThinning', 'FruitBagging', 'ExoticThinning', 'Shredding',
    -- Generale
    'Topping', 'Pruning'
  ));

-- Step 3: Add new CHECK constraint for equipment_type with all new types
ALTER TABLE mechanical_work_register
  ADD CONSTRAINT mechanical_work_register_equipment_type_check 
  CHECK (equipment_type IN (
    -- Trattore e attrezzi trattore
    'Tractor', 'RotaryHarrow', 'Shredder', 'FertilizerSpreader', 'Seeder', 
    'Topper', 'Defoliator', 'PrePruner', 'Thinner',
    -- Piccoli mezzi
    'Rototiller', 'Cultivator', 'Mower', 'BrushCutter', 'TrackedCart', 'BackpackSprayer',
    -- Attrezzi elettrificati
    'ElectricTier', 'ElectricPruner', 'TelescopicPruner',
    -- Manuale
    'Manual'
  ));

-- Step 4: Add equipment_attachment column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mechanical_work_register' 
    AND column_name = 'equipment_attachment'
  ) THEN
    ALTER TABLE mechanical_work_register 
    ADD COLUMN equipment_attachment TEXT;
  END IF;
END $$;

-- Step 5: Add work_metadata column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mechanical_work_register' 
    AND column_name = 'work_metadata'
  ) THEN
    ALTER TABLE mechanical_work_register 
    ADD COLUMN work_metadata JSONB;
  END IF;
END $$;

-- Step 6: Create crop_mechanical_works table if it doesn't exist
CREATE TABLE IF NOT EXISTS crop_mechanical_works (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_id TEXT NOT NULL,
  crop_name TEXT NOT NULL,
  work_type TEXT NOT NULL,
  priority INTEGER DEFAULT 0 CHECK (priority >= 0 AND priority <= 10),
  timing JSONB,
  equipment_suggested TEXT[],
  critical BOOLEAN DEFAULT false,
  frequency TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crop_mechanical_works_crop_id ON crop_mechanical_works(crop_id);
CREATE INDEX IF NOT EXISTS idx_crop_mechanical_works_work_type ON crop_mechanical_works(work_type);
CREATE INDEX IF NOT EXISTS idx_crop_mechanical_works_priority ON crop_mechanical_works(priority DESC);

-- Enable RLS on crop_mechanical_works
ALTER TABLE crop_mechanical_works ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Crop mechanical works are publicly readable"
  ON crop_mechanical_works FOR SELECT
  USING (true);

-- Note: Existing data with 'Plowing', 'Tilling', 'Tractor', 'Manual' remains valid
-- No data migration needed as old values are still in the new CHECK constraints

