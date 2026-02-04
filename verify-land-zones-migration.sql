-- ============================================
-- VERIFICA MIGRAZIONE LAND ZONES E SOIL MEMORY
-- ============================================
-- Esegui questo script nel SQL Editor di Supabase Dashboard
-- https://supabase.com/dashboard/project/qhmujoivfxftlrcrluaj/editor

-- 1. Verifica esistenza tabelle
SELECT 
  'Tabelle esistenti' as check_type,
  table_name,
  CASE 
    WHEN table_name IN ('land_zones', 'soil_memory') THEN '✅ OK'
    ELSE '❌ MANCANTE'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('land_zones', 'soil_memory', 'garden_rows')
ORDER BY table_name;

-- 2. Verifica colonna land_zone_id in garden_rows
SELECT 
  'Colonna land_zone_id' as check_type,
  column_name,
  data_type,
  '✅ OK' as status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'garden_rows'
  AND column_name = 'land_zone_id';

-- 3. Verifica constraint univoco su row_number (solo per filari attivi)
SELECT 
  'Constraint row_number' as check_type,
  indexname as constraint_name,
  indexdef as definition,
  '✅ OK' as status
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'garden_rows'
  AND indexname = 'garden_rows_active_row_number_unique';

-- 4. Verifica funzioni helper
SELECT 
  'Funzioni helper' as check_type,
  routine_name as function_name,
  '✅ OK' as status
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'get_zone_active_field_rows',
    'count_zone_active_field_rows',
    'get_zone_history',
    'calculate_zone_soil_health',
    'get_zone_rotation_suggestions'
  )
ORDER BY routine_name;

-- 5. Verifica RLS policies
SELECT 
  'RLS Policies' as check_type,
  tablename,
  policyname,
  '✅ OK' as status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('land_zones', 'soil_memory')
ORDER BY tablename, policyname;

-- 6. Conta record esistenti
SELECT 
  'Record esistenti' as check_type,
  'land_zones' as table_name,
  COUNT(*) as record_count
FROM land_zones
UNION ALL
SELECT 
  'Record esistenti' as check_type,
  'soil_memory' as table_name,
  COUNT(*) as record_count
FROM soil_memory
UNION ALL
SELECT 
  'Record esistenti' as check_type,
  'garden_rows con land_zone_id' as table_name,
  COUNT(*) as record_count
FROM garden_rows
WHERE land_zone_id IS NOT NULL;

-- ============================================
-- RISULTATO ATTESO
-- ============================================
-- Se la migrazione è applicata correttamente, dovresti vedere:
-- ✅ 2 tabelle: land_zones, soil_memory
-- ✅ 1 colonna: garden_rows.land_zone_id
-- ✅ 1 constraint: garden_rows_active_row_number_unique
-- ✅ 5 funzioni helper
-- ✅ 8 RLS policies (4 per land_zones + 4 per soil_memory)
