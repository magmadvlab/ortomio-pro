-- ============================================
-- GRUPPO 9: TIER SYSTEM
-- ============================================
-- Sistema di tier e migrazione da 4-tier a 3-tier
-- 
-- Include:
-- - migrate_tiers_to_three_tier (FREE, PLUS, PRO)
-- - update_tier_constraint
-- 
-- ORDINE: Dopo user profiles (02)

-- ============================================
-- UPDATE TIER CONSTRAINT
-- ============================================
-- Aggiorna il constraint per supportare il nuovo sistema 3-tier
DO $$ 
BEGIN
  -- Rimuovi constraint esistente se presente
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_tier_check' 
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE profiles DROP CONSTRAINT profiles_tier_check;
  END IF;
  
  -- Aggiungi nuovo constraint con 3-tier system
  ALTER TABLE profiles 
  ADD CONSTRAINT profiles_tier_check 
  CHECK (tier IN ('FREE', 'PLUS', 'PRO', 'PRO_CONSUMER', 'PRO_PROFESSIONAL'));
  -- Manteniamo anche i vecchi valori per compatibilità durante la migrazione
END $$;

-- ============================================
-- MIGRATE TIERS TO THREE-TIER SYSTEM
-- ============================================
-- Step 1: Update PRO_CONSUMER to PLUS
UPDATE profiles
SET tier = 'PLUS'
WHERE tier = 'PRO_CONSUMER';

-- Step 2: Update legacy PRO to PLUS (se non è già PRO_PROFESSIONAL)
UPDATE profiles
SET tier = 'PLUS'
WHERE tier = 'PRO' 
  AND id NOT IN (
    SELECT id FROM profiles WHERE tier = 'PRO_PROFESSIONAL'
  );

-- Step 3: Update PRO_PROFESSIONAL to PRO
UPDATE profiles
SET tier = 'PRO'
WHERE tier = 'PRO_PROFESSIONAL';

-- Step 4: Verifica migrazione
-- SELECT tier, COUNT(*) as count
-- FROM profiles
-- GROUP BY tier
-- ORDER BY tier;

-- ============================================
-- UPDATE CONSTRAINT FINALE (solo 3-tier)
-- ============================================
-- Dopo la migrazione, aggiorna il constraint per accettare solo 3-tier
DO $$ 
BEGIN
  -- Rimuovi constraint esistente
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_tier_check' 
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE profiles DROP CONSTRAINT profiles_tier_check;
  END IF;
  
  -- Aggiungi constraint finale con solo 3-tier
  ALTER TABLE profiles 
  ADD CONSTRAINT profiles_tier_check 
  CHECK (tier IN ('FREE', 'PLUS', 'PRO'));
END $$;

