-- =====================================================
-- TEST SPECIFIC ISSUES - OrtoMio PRO
-- Test problemi specifici che potrebbero ancora esistere
-- =====================================================

-- 1. TEST RLS POLICIES FUNZIONANTI
SELECT '=== RLS POLICIES TEST ===' as test_section;

-- Verifica che le policy esistano
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('garden_plants', 'prescription_maps', 'plant_operations')
ORDER BY tablename, policyname;

-- 2. TEST COLONNE ROW TRACKING
SELECT '=== ROW TRACKING COLUMNS TEST ===' as test_section;

-- Verifica field_row_id nelle tabelle operations
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('watering_logs', 'nutrition_logs', 'mechanical_work_logs')
AND column_name = 'field_row_id'
ORDER BY table_name;

-- 3. TEST FOREIGN KEYS FIELD_ROW_ID
SELECT '=== FIELD_ROW_ID FOREIGN KEYS TEST ===' as test_section;

SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_schema = 'public'
AND kcu.column_name = 'field_row_id'
ORDER BY tc.table_name;

-- 4. TEST TABELLE FIELD_ROWS
SELECT '=== FIELD_ROWS TABLE TEST ===' as test_section;

-- Verifica che field_rows esista
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'field_rows';

-- Verifica struttura field_rows
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'field_rows'
ORDER BY ordinal_position;

-- 5. TEST GARDEN_PLANTS STRUCTURE
SELECT '=== GARDEN_PLANTS STRUCTURE TEST ===' as test_section;

-- Verifica colonne critiche in garden_plants
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'garden_plants'
AND column_name IN ('plant_code', 'row_id', 'field_row_id', 'status', 'health_score')
ORDER BY column_name;

-- 6. TEST VIEW INDIVIDUAL_PLANTS
SELECT '=== INDIVIDUAL_PLANTS VIEW TEST ===' as test_section;

-- Verifica che la view esista e sia accessibile
DO $$
BEGIN
    BEGIN
        PERFORM 1 FROM individual_plants LIMIT 1;
        RAISE NOTICE 'SUCCESS: individual_plants view is accessible';
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'PROBLEM: individual_plants view error: %', SQLERRM;
    END;
END $$;

-- 7. TEST PRESCRIPTION_ZONES TABLE
SELECT '=== PRESCRIPTION_ZONES TEST ===' as test_section;

-- Verifica che prescription_zones esista
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'prescription_zones';

-- 8. TEST JOIN CRITICI
SELECT '=== CRITICAL JOINS TEST ===' as test_section;

-- Test join garden_plants + garden_rows
DO $$
BEGIN
    BEGIN
        PERFORM COUNT(*) 
        FROM garden_plants gp 
        LEFT JOIN garden_rows gr ON gp.row_id = gr.id 
        LIMIT 1;
        RAISE NOTICE 'SUCCESS: garden_plants + garden_rows join works';
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'PROBLEM: garden_plants + garden_rows join fails: %', SQLERRM;
    END;
END $$;

-- Test join garden_plants + field_rows
DO $$
BEGIN
    BEGIN
        PERFORM COUNT(*) 
        FROM garden_plants gp 
        LEFT JOIN field_rows fr ON gp.field_row_id = fr.id 
        LIMIT 1;
        RAISE NOTICE 'SUCCESS: garden_plants + field_rows join works';
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'PROBLEM: garden_plants + field_rows join fails: %', SQLERRM;
    END;
END $$;

-- 9. TEST DATI SAMPLE
SELECT '=== SAMPLE DATA TEST ===' as test_section;

-- Conta record nelle tabelle principali
SELECT 
    'gardens' as table_name,
    COUNT(*) as count
FROM gardens
UNION ALL
SELECT 
    'garden_rows' as table_name,
    COUNT(*) as count
FROM garden_rows
UNION ALL
SELECT 
    'field_rows' as table_name,
    COUNT(*) as count
FROM field_rows
UNION ALL
SELECT 
    'garden_plants' as table_name,
    COUNT(*) as count
FROM garden_plants
UNION ALL
SELECT 
    'prescription_maps' as table_name,
    COUNT(*) as count
FROM prescription_maps;

-- 10. TEST FUNZIONI/TRIGGER
SELECT '=== FUNCTIONS AND TRIGGERS TEST ===' as test_section;

-- Verifica funzioni per sync
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%sync%'
ORDER BY routine_name;

-- SUMMARY
SELECT '=== TEST SUMMARY ===' as final_section;
SELECT 'Review all sections above for specific issues' as instruction;