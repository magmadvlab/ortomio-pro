-- ============================================
-- Script SQL diretto per impostare superadmin
-- Usa questo script quando Supabase è accessibile via psql
-- ============================================

-- Crea il profilo se non esiste e imposta superadmin
INSERT INTO profiles (id, tier, ai_credits_total, ai_credits_used, updated_at)
SELECT 
    id,
    'PRO',
    999999,
    0,
    NOW()
FROM auth.users
WHERE email = 'roberto.lalinga@gmail.com'
ON CONFLICT (id) DO UPDATE
SET tier = 'PRO',
    ai_credits_total = 999999,
    ai_credits_used = 0,
    updated_at = NOW();

-- Verifica il risultato
SELECT 
    p.id,
    u.email,
    p.tier,
    p.ai_credits_total,
    p.ai_credits_used,
    u.email_confirmed_at
FROM profiles p 
JOIN auth.users u ON p.id = u.id 
WHERE u.email = 'roberto.lalinga@gmail.com';

-- Se l'utente non esiste, mostra un messaggio
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'roberto.lalinga@gmail.com') THEN
        RAISE NOTICE '⚠️  Utente roberto.lalinga@gmail.com non trovato!';
        RAISE NOTICE 'Crea prima l''utente tramite registrazione o manualmente.';
    ELSE
        RAISE NOTICE '✅ Superadmin configurato correttamente!';
    END IF;
END $$;

