-- =====================================================
-- CHECK DATABASE ISSUES - OrtoMio PRO
-- Verifica problemi reali che potrebbero esistere ancora
-- =====================================================

-- 1. VERIFICA TABELLE MANCANTI
SELECT 'Missing Tables Check' as check_name;

SELECT 
    'prescription_maps' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'prescription_maps' AND table_schema = 'public')
         THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
    'prescription_zones' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'prescription_zones' AND table_schema = 'public')
         THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
    'garden_plants' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'garden_plants' AND table_schema = 'public')
         THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
    'plant_operations' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'plant_operations' AND table_schema = 'public')
         THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
    'field_rows' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'field_rows' AND table_schema = 'public')
         THEN 'EXISTS' ELSE 'MISSING' END as status;

-- 2. VERIFICA COLONNE MANCANTI
SELECT 'Missing Columns Check' as check_name;

-- Controlla se field_row_id esiste nelle tabelle operations
SELECT 
    'watering_logs.field_row_id' as column_check,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'watering_logs' 
        AND column_name = 'field_row_id' 
        AND table_schema = 'public'
    ) THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
    'nutrition_logs.field_row_id' as column_check,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'nutrition_logs' 
        AND column_name = 'field_row_id' 
        AND table_schema = 'public'
    ) THEN 'EXISTS' ELSE 'MISSING' END as status;

-- 3. VERIFICA RLS POLICIES
SELECT 'RLS Policies Check' as check_name;

SELECT 
    schemaname,
    tablename,
    CASE WHEN rowsecurity THEN 'RLS ENABLED' ELSE 'RLS DISABLED' END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('prescription_maps', 'garden_plants', 'plant_operations', 'prescription_zones')
ORDER BY tablename;

-- 4. VERIFICA VIEW ESISTENTI
SELECT 'Views Check' as check_name;

SELECT 
    table_name,
    CASE WHEN table_type = 'VIEW' THEN 'EXISTS' ELSE 'NOT VIEW' END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'individual_plants',
    'plant_operations_complete', 
    'plant_production_summary',
    'plants_per_row_summary',
    'row_health_summary'
)
ORDER BY table_name;

-- 5. VERIFICA FOREIGN KEYS PROBLEMATICHE
SELECT 'Foreign Keys Check' as check_name;

SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_schema = 'public'
AND (tc.table_name LIKE '%plant%' OR tc.table_name LIKE '%prescription%')
ORDER BY tc.table_name;

-- 6. VERIFICA DATI INCONSISTENTI
SELECT 'Data Consistency Check' as check_name;

-- Controlla se ci sono garden_plants senza garden_id valido
SELECT 
    'Orphaned garden_plants' as issue,
    COUNT(*) as count
FROM garden_plants gp
LEFT JOIN gardens g ON gp.garden_id = g.id
WHERE g.id IS NULL;

-- 7. VERIFICA PERMESSI MANCANTI
SELECT 'Permissions Check' as check_name;

SELECT DISTINCT
    table_name,
    privilege_type,
    grantee
FROM information_schema.table_privileges 
WHERE table_schema = 'public' 
AND table_name IN ('prescription_maps', 'garden_plants', 'plant_operations')
AND grantee = 'authenticated'
ORDER BY table_name, privilege_type;