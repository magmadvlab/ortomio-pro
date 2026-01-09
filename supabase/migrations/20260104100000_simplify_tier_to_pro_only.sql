-- ============================================
-- Simplify Tier System - Only PRO
-- Data: 2026-01-04
-- ============================================
-- Questo database supporta SOLO tier PRO
-- In futuro verrà creato un repo separato per tier FREE
-- ============================================

-- 1. Rimuovi il vecchio constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_tier_check;

-- 2. Aggiorna tutti i profili esistenti a PRO
UPDATE profiles
SET tier = 'PRO'
WHERE tier != 'PRO';

-- 3. Aggiungi il nuovo constraint con solo PRO
ALTER TABLE profiles
ADD CONSTRAINT profiles_tier_check
CHECK (tier = 'PRO');

-- 4. Aggiorna il default per nuovi utenti
ALTER TABLE profiles
ALTER COLUMN tier SET DEFAULT 'PRO';

-- 5. Commento esplicativo
COMMENT ON COLUMN profiles.tier IS 'Tier utente - Solo PRO supportato in questo database. FREE avrà repo separato.';

-- ============================================
-- Aggiorna trigger per creare profili con tier PRO
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_credits INTEGER := 3;
  welcome_bonus INTEGER := 3;
  is_superadmin BOOLEAN := FALSE;
BEGIN
  -- Check se è superadmin (roberto.lalinga@gmail.com)
  IF NEW.email = 'roberto.lalinga@gmail.com' THEN
    is_superadmin := TRUE;
    default_credits := 999999;
    welcome_bonus := 0;
  END IF;

  -- Crea profilo con tier PRO (unico tier supportato)
  INSERT INTO public.profiles (id, tier, ai_credits_total, ai_credits_used)
  VALUES (
    NEW.id,
    'PRO',
    default_credits + welcome_bonus,
    0
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Verifica finale
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Tier system semplificato';
  RAISE NOTICE '   - Solo tier PRO supportato';
  RAISE NOTICE '   - Tier FREE avrà repo separato';
  RAISE NOTICE '   - Default credits: 6 (3 iniziali + 3 bonus)';
  RAISE NOTICE '   - Superadmin: 999999 credits';
END $$;
