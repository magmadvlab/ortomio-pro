-- Migration: Migrate Tiers from 4-tier to 3-tier System

-- Step 1: Update PRO_CONSUMER to PLUS
UPDATE profiles
SET tier = 'PLUS'
WHERE tier = 'PRO_CONSUMER';

-- Step 2: Update legacy PRO to PLUS
UPDATE profiles
SET tier = 'PLUS'
WHERE tier = 'PRO';

-- Step 3: Update PRO_PROFESSIONAL to PRO
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

