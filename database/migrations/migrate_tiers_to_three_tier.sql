-- Migration: Migrate Tiers from 4-tier to 3-tier System
-- This migration updates profiles.tier to use the new tier system:
-- - PRO_CONSUMER → PLUS
-- - PRO_PROFESSIONAL → PRO
-- - PRO (legacy) → PLUS

-- Step 1: Update PRO_CONSUMER to PLUS
UPDATE profiles
SET tier = 'PLUS'
WHERE tier = 'PRO_CONSUMER';

-- Step 2: Update legacy PRO to PLUS (must be done BEFORE step 3)
-- Note: Legacy PRO tier had both consumer and professional features,
-- so we map it to PLUS (which has consumer features)
UPDATE profiles
SET tier = 'PLUS'
WHERE tier = 'PRO';

-- Step 3: Update PRO_PROFESSIONAL to PRO (must be done AFTER step 2)
UPDATE profiles
SET tier = 'PRO'
WHERE tier = 'PRO_PROFESSIONAL';

-- Step 4: Verify migration
-- Check counts for each tier
SELECT 
  tier,
  COUNT(*) as count
FROM profiles
GROUP BY tier
ORDER BY tier;

-- Expected result after migration:
-- FREE: X users
-- PLUS: Y users (from PRO_CONSUMER + legacy PRO)
-- PRO: Z users (from PRO_PROFESSIONAL)


