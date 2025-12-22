-- Comprehensive diagnostic script for "column garden_id does not exist" error
-- Run this in your SQL editor to identify the exact issue

-- ============================================
-- 1. Check which tables have garden_id column
-- ============================================
SELECT 
  'Tables with garden_id column:' AS check_type,
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE column_name = 'garden_id' 
AND table_schema = 'public'
ORDER BY table_name;

-- ============================================
-- 2. Check sensor_readings table specifically
-- ============================================
SELECT 
  'sensor_readings table status:' AS check_type,
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sensor_readings')
    THEN 'EXISTS'
    ELSE 'DOES NOT EXIST'
  END AS table_exists,
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'sensor_readings' 
      AND column_name = 'garden_id'
    )
    THEN 'HAS garden_id'
    ELSE 'MISSING garden_id ⚠️'
  END AS garden_id_status;

-- List all columns in sensor_readings (if it exists)
SELECT 
  'sensor_readings columns:' AS check_type,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'sensor_readings'
ORDER BY ordinal_position;

-- ============================================
-- 3. Find policies that reference garden_id
-- ============================================
SELECT 
  'Policies referencing garden_id:' AS check_type,
  pol.polname AS policy_name,
  cls.relname AS table_name,
  pol.polcmd AS command_type,
  pg_get_policydef(pol.oid) AS policy_definition
FROM pg_policy pol
JOIN pg_class cls ON pol.polrelid = cls.oid
JOIN pg_namespace nsp ON cls.relnamespace = nsp.oid
WHERE nsp.nspname = 'public'
AND pg_get_policydef(pol.oid) ILIKE '%garden_id%'
ORDER BY cls.relname, pol.polname;

-- ============================================
-- 4. Find functions/triggers referencing garden_id
-- ============================================
SELECT 
  'Functions referencing garden_id:' AS check_type,
  p.proname AS function_name,
  pg_get_function_identity_arguments(p.oid) AS arguments,
  LEFT(pg_get_functiondef(p.oid), 200) AS definition_preview
FROM pg_proc p
JOIN pg_namespace nsp ON p.pronamespace = nsp.oid
WHERE nsp.nspname = 'public'
AND pg_get_functiondef(p.oid) ILIKE '%garden_id%'
ORDER BY p.proname;

-- ============================================
-- 5. Find views referencing garden_id
-- ============================================
SELECT 
  'Views referencing garden_id:' AS check_type,
  table_name AS view_name,
  LEFT(view_definition, 200) AS definition_preview
FROM information_schema.views
WHERE table_schema = 'public'
AND view_definition ILIKE '%garden_id%'
ORDER BY table_name;

-- ============================================
-- 6. Check indexes on sensor_readings
-- ============================================
SELECT 
  'Indexes on sensor_readings:' AS check_type,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename = 'sensor_readings'
ORDER BY indexname;

-- ============================================
-- 7. Check for foreign key constraints
-- ============================================
SELECT 
  'Foreign keys referencing gardens.id:' AS check_type,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
AND ccu.table_name = 'gardens'
AND ccu.column_name = 'id'
ORDER BY tc.table_name, kcu.column_name;

-- ============================================
-- 8. Summary: Tables that should have garden_id but don't
-- ============================================
SELECT 
  'Tables missing garden_id (should have it):' AS check_type,
  table_name,
  'Missing garden_id column' AS issue
FROM (
  SELECT 'garden_zones' AS table_name
  UNION SELECT 'soil_analysis'
  UNION SELECT 'yield_predictions'
  UNION SELECT 'irrigation_zones'
  UNION SELECT 'sensor_readings'
) AS expected_tables
WHERE NOT EXISTS (
  SELECT FROM information_schema.columns
  WHERE table_schema = 'public'
  AND table_name = expected_tables.table_name
  AND column_name = 'garden_id'
)
ORDER BY table_name;

