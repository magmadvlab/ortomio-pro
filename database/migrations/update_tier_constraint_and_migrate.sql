-- Migration: Update Tier Constraint and Migrate Data
-- This migration:
-- 1. Updates the CHECK constraint to allow new tiers (PLUS, PRO)
-- 2. Migrates existing tier data from old to new system
-- 3. Optionally removes old tier values from constraint (commented out for safety)

-- Step 1: Drop existing CHECK constraint
ALTER TABLE profiles 
  DROP CONSTRAINT IF EXISTS profiles_tier_check;

-- Step 2: Add new CHECK constraint with all tiers (old + new for migration)
ALTER TABLE profiles
  ADD CONSTRAINT profiles_tier_check 
  CHECK (tier IN ('FREE', 'PLUS', 'PRO', 'PRO_CONSUMER', 'PRO_PROFESSIONAL'));

-- Step 3: Migrate data
-- Update PRO_CONSUMER to PLUS
UPDATE profiles
SET tier = 'PLUS'
WHERE tier = 'PRO_CONSUMER';

-- Update legacy PRO to PLUS
UPDATE profiles
SET tier = 'PLUS'
WHERE tier = 'PRO';

-- Update PRO_PROFESSIONAL to PRO
UPDATE profiles
SET tier = 'PRO'
WHERE tier = 'PRO_PROFESSIONAL';

-- Step 4: Verify migration
SELECT 
  tier,
  COUNT(*) as count
FROM profiles
GROUP BY tier
ORDER BY tier;

-- Step 5 (Optional): Remove old tier values from constraint after migration
-- Uncomment these lines ONLY after verifying that no users have old tiers
-- ALTER TABLE profiles DROP CONSTRAINT profiles_tier_check;
-- ALTER TABLE profiles ADD CONSTRAINT profiles_tier_check CHECK (tier IN ('FREE', 'PLUS', 'PRO'));

