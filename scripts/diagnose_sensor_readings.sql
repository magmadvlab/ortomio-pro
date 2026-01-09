-- Diagnostic query to check sensor_readings table structure
-- Run this if you're getting "column garden_id does not exist" errors

-- Check if table exists
SELECT 
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sensor_readings')
    THEN '✅ sensor_readings table EXISTS'
    ELSE '❌ sensor_readings table DOES NOT EXIST'
  END AS table_status;

-- List all columns in sensor_readings
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'sensor_readings'
ORDER BY ordinal_position;

-- Check specifically for garden_id column
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'sensor_readings' 
      AND column_name = 'garden_id'
    )
    THEN '✅ garden_id column EXISTS'
    ELSE '❌ garden_id column DOES NOT EXIST - This is the problem!'
  END AS garden_id_status;

-- Check for existing policies on sensor_readings
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
WHERE schemaname = 'public' 
AND tablename = 'sensor_readings';

