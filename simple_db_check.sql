-- =====================================================
-- SIMPLE DATABASE CHECK - OrtoMio PRO
-- Versione semplificata senza conflitti di variabili
-- =====================================================

-- 1. VERIFICA TABELLE ESISTENTI
SELECT '=== TABLES CHECK ===' as section;

SELECT 
    t.table_name,
    CASE WHEN t.table_name IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status
FROM (
    VALUES 
    ('gardens'),
    ('garden_rows'), 
    ('field_rows'),
    ('garden_plants'),
    ('plant_operations'),
    ('plant_harvests'),
    ('watering_logs'),
    ('nutrition_logs'),
    ('prescription_maps'),
    ('prescription_zones')
) AS expected(table_name)
LEFT JOIN information_schema.tables t ON t.table_name = expected.table_name AND t.table_schema = 'public'
ORDER BY expected.table_name;

-- 2. VERIFICA COLONNE ROW TRACKING
SELECT '=== ROW TRACKING COLUMNS ===' as section;

SELECT 
    'watering_logs.field_row_id' as column_check,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'watering_logs' 
        AND column_name = 'field_row_id'
    ) THEN 'EXISTS' ELSE 'MISSING' END as status

UNION ALL

SELECT 
    'nutrition_logs.field_row_id' as column_check,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'nutrition_logs' 
        AND column_name = 'field_row_id'
    ) THEN 'EXISTS' ELSE 'MISSING' END as status

UNION ALL

SELECT 
    'garden_plants.plant_code' as column_check,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'garden_plants' 
        AND column_name = 'plant_code'
    ) THEN 'EXISTS' ELSE 'MISSING' END as status

UNION ALL

SELECT 
    'garden_plants.field_row_id' as column_check,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'garden_plants' 
        AND column_name = 'field_row_id'
    ) THEN 'EXISTS' ELSE 'MISSING' END as status;

-- 3. VERIFICA VIEW CRITICHE
SELECT '=== VIEWS CHECK ===' as section;

SELECT 
    v.view_name,
    CASE WHEN v.view_name IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status
FROM (
    VALUES 
    ('individual_plants'),
    ('plant_operations_complete'),
    ('plant_production_summary'),
    ('plants_per_row_summary'),
    ('row_health_summary')
) AS expected(view_name)
LEFT JOIN (
    SELECT table_name as view_name 
    FROM information_schema.views 
    WHERE table_schema = 'public'
) v ON v.view_name = expected.view_name
ORDER BY expected.view_name;

-- 4. VERIFICA RLS STATUS
SELECT '=== RLS STATUS ===' as section;

SELECT 
    tablename,
    CASE WHEN rowsecurity THEN 'RLS ENABLED' ELSE 'RLS DISABLED' END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('prescription_maps', 'garden_plants', 'plant_operations', 'prescription_zones')
ORDER BY tablename;

-- 5. CONTA DATI NELLE TABELLE
SELECT '=== DATA COUNT ===' as section;

SELECT 'gardens' as table_name, COUNT(*) as record_count FROM gardens
UNION ALL
SELECT 'garden_plants' as table_name, COUNT(*) as record_count FROM garden_plants  
UNION ALL
SELECT 'prescription_maps' as table_name, COUNT(*) as record_count FROM prescription_maps
UNION ALL
SELECT 'field_rows' as table_name, COUNT(*) as record_count FROM field_rows
ORDER BY table_name;

-- 6. TEST ACCESSO VIEW
SELECT '=== VIEW ACCESS TEST ===' as section;

-- Test individual_plants
SELECT 
    'individual_plants' as view_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM individual_plants LIMIT 1) THEN 'ACCESSIBLE'
        ELSE 'ERROR'
    END as access_status;

-- SUMMARY
SELECT '=== SUMMARY ===' as section;
SELECT 'Check results above - look for MISSING or ERROR status' as instruction;