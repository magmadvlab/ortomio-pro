-- ============================================
-- EMERGENCY FIX: Tier System Database Online
-- Data: 2026-01-04
-- Priorità: MASSIMA
-- ============================================
-- PROBLEMA: Database online ha constraint vecchio (FREE/PLUS/PRO)
--           ma trigger locale crea profili con tier='PRO'
--           causando errore 400 durante registrazione
-- ============================================

BEGIN;

-- ============================================
-- STEP 1: Backup Tabella Profiles
-- ============================================
CREATE TABLE IF NOT EXISTS profiles_backup_20260104 AS
SELECT * FROM profiles;

RAISE NOTICE '✅ Step 1/7: Backup profiles creato';

-- ============================================
-- STEP 2: Drop Vecchio Constraint
-- ============================================
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_tier_check;

RAISE NOTICE '✅ Step 2/7: Vecchio constraint rimosso';

-- ============================================
-- STEP 3: Converti Utenti Esistenti a PRO
-- ============================================
UPDATE profiles
SET tier = 'PRO'
WHERE tier IN ('FREE', 'PLUS')
  AND tier != 'PRO';

RAISE NOTICE '✅ Step 3/7: Utenti esistenti convertiti a PRO';

-- ============================================
-- STEP 4: Nuovo Constraint PRO-Only
-- ============================================
ALTER TABLE profiles
ADD CONSTRAINT profiles_tier_check
CHECK (tier = 'PRO');

RAISE NOTICE '✅ Step 4/7: Nuovo constraint PRO-only applicato';

-- ============================================
-- STEP 5: Default PRO per Nuovi Utenti
-- ============================================
ALTER TABLE profiles
ALTER COLUMN tier SET DEFAULT 'PRO';

RAISE NOTICE '✅ Step 5/7: Default tier impostato a PRO';

-- ============================================
-- STEP 6: Commento Esplicativo
-- ============================================
COMMENT ON COLUMN profiles.tier IS
  'Tier utente - Solo PRO supportato in questo database. FREE avrà repo separato.';

RAISE NOTICE '✅ Step 6/7: Commento aggiunto';

-- ============================================
-- STEP 7: Verifica Finale
-- ============================================
DO $$
DECLARE
  tier_count INTEGER;
  pro_count INTEGER;
  total_count INTEGER;
BEGIN
  -- Conta tier diversi
  SELECT COUNT(DISTINCT tier) INTO tier_count FROM profiles;

  -- Conta utenti PRO
  SELECT COUNT(*) INTO pro_count FROM profiles WHERE tier = 'PRO';

  -- Conta totale utenti
  SELECT COUNT(*) INTO total_count FROM profiles;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'VERIFICA FINALE:';
  RAISE NOTICE '  - Tier diversi trovati: %', tier_count;
  RAISE NOTICE '  - Utenti con tier PRO: %', pro_count;
  RAISE NOTICE '  - Totale utenti: %', total_count;
  RAISE NOTICE '========================================';

  IF tier_count = 1 AND pro_count = total_count THEN
    RAISE NOTICE '✅ ✅ ✅ MIGRATION COMPLETATA CON SUCCESSO ✅ ✅ ✅';
    RAISE NOTICE 'Tutti gli utenti hanno tier = PRO';
  ELSE
    RAISE EXCEPTION '❌ ERRORE - Trovati % tier diversi (atteso: 1)', tier_count;
  END IF;
END $$;

COMMIT;

-- ============================================
-- POST-MIGRATION: Query di Verifica
-- ============================================

-- Verifica distribuzione tier
SELECT
  tier,
  COUNT(*) as user_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM profiles
GROUP BY tier
ORDER BY user_count DESC;

-- Verifica constraint attivo
SELECT
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'profiles'::regclass
  AND conname = 'profiles_tier_check';

-- ============================================
-- ROLLBACK PLAN (se necessario)
-- ============================================
-- Se qualcosa va storto, eseguire:
--
-- BEGIN;
-- DROP TABLE IF EXISTS profiles CASCADE;
-- CREATE TABLE profiles AS SELECT * FROM profiles_backup_20260104;
-- -- Ricreare constraints e foreign keys
-- COMMIT;
-- ============================================
