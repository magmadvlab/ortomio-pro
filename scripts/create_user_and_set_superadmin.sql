-- ============================================
-- Crea utente e imposta superadmin
-- Usa questo script se l'utente non esiste ancora
-- ============================================

-- Step 1: Crea l'utente in auth.users
DO $$
DECLARE
  user_id UUID;
BEGIN
  -- Verifica se l'utente esiste già
  SELECT id INTO user_id
  FROM auth.users
  WHERE email = 'roberto.lalinga@gmail.com';
  
  -- Se non esiste, crealo
  IF user_id IS NULL THEN
    user_id := gen_random_uuid();
    
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      user_id,
      'authenticated',
      'authenticated',
      'roberto.lalinga@gmail.com',
      crypt('testadmin123@', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      NOW(),
      NOW()
    );
    
    RAISE NOTICE 'Utente creato con ID: %', user_id;
  ELSE
    RAISE NOTICE 'Utente già esistente con ID: %', user_id;
  END IF;
END $$;

-- Step 2: Imposta superadmin
UPDATE profiles 
SET tier = 'PRO', 
    ai_credits_total = 999999,
    ai_credits_used = 0,
    updated_at = NOW()
WHERE id = (SELECT id FROM auth.users WHERE email = 'roberto.lalinga@gmail.com');

-- Step 3: Se il profilo non esiste, crealo
INSERT INTO profiles (id, tier, ai_credits_total, ai_credits_used)
SELECT id, 'PRO', 999999, 0
FROM auth.users
WHERE email = 'roberto.lalinga@gmail.com'
ON CONFLICT (id) DO UPDATE
SET tier = 'PRO',
    ai_credits_total = 999999,
    ai_credits_used = 0,
    updated_at = NOW();

-- Step 4: Verifica il risultato
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

-- Messaggio finale
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'roberto.lalinga@gmail.com') THEN
        RAISE NOTICE '✅ Superadmin configurato correttamente!';
        RAISE NOTICE '📧 Email: roberto.lalinga@gmail.com';
        RAISE NOTICE '🔑 Password: testadmin123@';
        RAISE NOTICE '🎯 Tier: PRO';
    ELSE
        RAISE NOTICE '⚠️  Errore: Utente non trovato dopo la creazione';
    END IF;
END $$;

