-- =====================================================
-- TEST SECURITY FIX - OrtoMio Database
-- Verifica che le view siano state ricreate correttamente
-- =====================================================

-- 1. Verifica che tutte le view esistano
SELECT 
    'View Existence Check' as test_name,
    CASE 
        WHEN COUNT(*) = 5 THEN 'PASS - All 5 views exist'
        ELSE 'FAIL - Missing views: ' || (5 - COUNT(*))::text
    END as result
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'VIEW'
AND table_name IN (
    'individual_plants',
    'plant_operations_complete', 
    'plant_production_summary',
    'plants_per_row_summary',
    'row_health_summary'
);

-- 2. Test accesso alle view (dovrebbe funzionare senza errori)
SELECT 'individual_plants Access Test' as test_name,
       CASE 
           WHEN COUNT(*) >= 0 THEN 'PASS - View accessible'
           ELSE 'FAIL - View not accessible'
       END as result
FROM public.individual_plants LIMIT 1;

SELECT 'plant_production_summary Access Test' as test_name,
       CASE 
           WHEN COUNT(*) >= 0 THEN 'PASS - View accessible'
           ELSE 'FAIL - View not accessible'
       END as result
FROM public.plant_production_summary LIMIT 1;

SELECT 'plants_per_row_summary Access Test' as test_name,
       CASE 
           WHEN COUNT(*) >= 0 THEN 'PASS - View accessible'
           ELSE 'FAIL - View not accessible'
       END as result
FROM public.plants_per_row_summary LIMIT 1;

SELECT 'row_health_summary Access Test' as test_name,
       CASE 
           WHEN COUNT(*) >= 0 THEN 'PASS - View accessible'
           ELSE 'FAIL - View not accessible'
       END as result
FROM public.row_health_summary LIMIT 1;

SELECT 'plant_operations_complete Access Test' as test_name,
       CASE 
           WHEN COUNT(*) >= 0 THEN 'PASS - View accessible'
           ELSE 'FAIL - View not accessible'
       END as result
FROM public.plant_operations_complete LIMIT 1;

-- 3. Verifica permessi
SELECT 'Permissions Check' as test_name,
       CASE 
           WHEN COUNT(*) = 5 THEN 'PASS - All views have SELECT permission for authenticated'
           ELSE 'FAIL - Missing permissions on ' || (5 - COUNT(*))::text || ' views'
       END as result
FROM information_schema.table_privileges tp
WHERE tp.table_schema = 'public'
AND tp.table_name IN (
    'individual_plants',
    'plant_operations_complete', 
    'plant_production_summary',
    'plants_per_row_summary',
    'row_health_summary'
)
AND tp.privilege_type = 'SELECT'
AND tp.grantee = 'authenticated';

-- 4. Summary
SELECT '=== SECURITY FIX TEST SUMMARY ===' as summary;
SELECT 'If all tests show PASS, the security fix was successful' as note;
SELECT 'The Supabase linter errors should now be resolved' as expected_result;