-- Verifica giardini nel database
SELECT 
  id,
  name,
  user_id,
  garden_type,
  size_sq_meters,
  created_at
FROM gardens
ORDER BY created_at DESC
LIMIT 10;

-- Verifica user ID corrente
SELECT 
  id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;
