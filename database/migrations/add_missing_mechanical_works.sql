-- Migration: Add Missing Mechanical Work Types
-- Adds new work types for soil preparation and modern techniques
-- This migration expands the work_type CHECK constraint to include:
-- - Clearing, Stumping, StoneRemoval, Leveling, DeepSubsoiling
-- - Digging, DeepHarrowing, Crumbling, Scraping, SurfaceLeveling
-- - MinimumTillage, StripTillage, NoTill

-- Step 1: Drop existing CHECK constraint
ALTER TABLE mechanical_work_register 
  DROP CONSTRAINT IF EXISTS mechanical_work_register_work_type_check;

-- Step 2: Add new CHECK constraint with all work types (existing + new)
ALTER TABLE mechanical_work_register
  ADD CONSTRAINT mechanical_work_register_work_type_check 
  CHECK (work_type IN (
    -- Suolo (esistenti)
    'Plowing', 'Subsoiling', 'Harrowing', 'Tilling', 'Rolling', 'Hoeing', 'EarthingUp', 'Mulching', 'PostSowingRolling',
    -- Preparazione Terreno (nuove)
    'Clearing', 'Stumping', 'StoneRemoval', 'Leveling', 'DeepSubsoiling',
    'Digging', 'DeepHarrowing', 'Crumbling', 'Scraping', 'SurfaceLeveling',
    -- Tecniche Moderne
    'MinimumTillage', 'StripTillage', 'NoTill',
    -- Chioma
    'FormativePruning', 'MaintenancePruning', 'RejuvenationPruning', 'SummerPruning', 'WinterPruning', 
    'Thinning', 'Suckering', 'Defoliation', 'Tying', 'OliveShredding', 'RunnerManagement', 
    'StrawberryMulching', 'StrawberryCleaning', 'CaneRemoval', 'TipPruning', 'RaspberryTying', 
    'SuckerThinning', 'FruitBagging', 'ExoticThinning', 'Shredding',
    -- Generale
    'Topping', 'Pruning'
  ));

-- Note: Existing data remains valid as all old work types are still in the new CHECK constraint
-- No data migration needed


