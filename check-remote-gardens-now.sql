-- Query per verificare gardens nel database remoto
-- Esegui su Supabase SQL Editor

-- 1. Verifica utente
SELECT 
  id,
  email,
  created_at,
  last_sign_in_at
FROM auth.users 
WHERE email = 'magmadvlab@gmail.com';

-- 2. Verifica gardens per questo utente
SELECT 
  id,
  name,
  type,
  size,
  location,
  created_at,
  updated_at
FROM gardens 
WHERE user_id = '73317116-7df0-4c34-a1f7-d2828a92ac39';

-- 3. Conta tutte le gardens nel database
SELECT COUNT(*) as total_gardens FROM gardens;

-- 4. Verifica user_profiles
SELECT 
  id,
  name,
  onboarding_completed,
  created_at
FROM user_profiles 
WHERE id = '73317116-7df0-4c34-a1f7-d2828a92ac39';

-- 5. Se gardens esiste, verifica piante
SELECT 
  g.name as garden_name,
  COUNT(p.id) as plant_count
FROM gardens g
LEFT JOIN plants p ON p.garden_id = g.id
WHERE g.user_id = '73317116-7df0-4c34-a1f7-d2828a92ac39'
GROUP BY g.id, g.name;
