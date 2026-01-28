-- Check if garden was created
-- Run this in Supabase SQL Editor after creating a garden

SELECT 
  id,
  name,
  user_id,
  created_at,
  garden_type,
  size_sq_meters
FROM gardens
ORDER BY created_at DESC
LIMIT 5;

-- Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'gardens';
