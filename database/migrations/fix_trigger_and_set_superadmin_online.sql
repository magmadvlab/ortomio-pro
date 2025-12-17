-- ============================================
-- Fix Trigger handle_new_user_credits + Set Superadmin Online
-- ============================================
-- Questo script:
-- 1. Corregge il trigger handle_new_user_credits() aggiungendo SECURITY DEFINER
-- 2. Imposta roberto.lalinga@gmail.com come superadmin PRO con accesso completo
-- ============================================

-- ============================================
-- STEP 1: Fix Trigger handle_new_user_credits
-- ============================================
-- Il trigger DEVE avere SECURITY DEFINER per funzionare con Supabase Auth
CREATE OR REPLACE FUNCTION handle_new_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, tier, ai_credits_total, ai_credits_used)
  VALUES (NEW.id, 'FREE', 3, 0)
  ON CONFLICT (id) DO NOTHING;
  
  IF NOT EXISTS (SELECT 1 FROM ai_credit_transactions 
                 WHERE user_id = NEW.id AND type = 'bonus' AND description LIKE '%Welcome%') THEN
    PERFORM grant_credits(NEW.id, 3);
    
    INSERT INTO ai_credit_transactions (user_id, amount, type, description)
    VALUES (NEW.id, 3, 'bonus', 'Welcome bonus - 3 free AI credits');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- ============================================
-- STEP 2: Crea profilo se non esiste
-- ============================================
-- Crea il profilo per roberto.lalinga@gmail.com se non esiste
INSERT INTO profiles (id, tier, ai_credits_total, ai_credits_used, updated_at)
SELECT id, 'FREE', 0, 0, NOW()
FROM auth.users
WHERE email = 'roberto.lalinga@gmail.com'
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 3: Imposta Superadmin PRO con crediti illimitati
-- ============================================
UPDATE profiles
SET 
  tier = 'PRO',
  ai_credits_total = 999999,
  ai_credits_used = 0,
  updated_at = NOW()
WHERE id = (SELECT id FROM auth.users WHERE email = 'roberto.lalinga@gmail.com');

-- ============================================
-- STEP 4: Verifica configurazione
-- ============================================
-- Verifica che l'utente sia configurato correttamente
SELECT 
  u.email,
  p.tier,
  p.ai_credits_total,
  p.ai_credits_used,
  (p.ai_credits_total - p.ai_credits_used) as credits_remaining,
  CASE 
    WHEN p.tier = 'PRO' AND p.ai_credits_total >= 999999 THEN '✅ SUPERADMIN PRO'
    WHEN p.tier = 'PRO' THEN '✅ PRO (non superadmin)'
    WHEN p.tier = 'PLUS' THEN '⚠️  PLUS'
    ELSE '❌ FREE'
  END as status
FROM auth.users u
JOIN profiles p ON p.id = u.id
WHERE u.email = 'roberto.lalinga@gmail.com';

