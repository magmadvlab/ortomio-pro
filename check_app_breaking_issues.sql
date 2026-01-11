-- =====================================================
-- CHECK APP-BREAKING ISSUES - OrtoMio PRO
-- Verifica problemi che potrebbero rompere l'applicazione
-- =====================================================

-- 1. VERIFICA TABELLE CRITICHE PER L'APP
SELECT '=== CRITICAL TABLES CHECK ===' as section;

DO $$
DECLARE
    missing_tables TEXT[] := ARRAY[]::TEXT[];
    table_name TEXT;
    critical_tables TEXT[] := ARRAY[
        'gardens', 'garden_rows', 'field_rows', 'garden_plants', 
        'plant_operations', 'plant_harvests', 'watering_logs', 
        'nutrition_logs', 'prescription_maps', 'prescription_zones'
    ];
BEGIN
    FOREACH table_name IN ARRAY critical_tables
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = table_name
        ) THEN
            missing_tables := array_append(missing_tables, table_name);
        END IF;
    END LOOP;
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE WARNING 'CRITICAL: Missing tables that will break app: %', array_to_string(missing_tables, ', ');
    ELSE
        RAISE NOTICE 'SUCCESS: All critical tables exist';
    END IF;
END $$;

-- 2. VERIFICA COLONNE CRITICHE MANCANTI
SELECT '=== CRITICAL COLUMNS CHECK ===' as section;

DO $$
DECLARE
    missing_columns TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- Controlla field_row_id in watering_logs
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'watering_logs' AND column_name = 'field_row_id'
    ) THEN
        missing_columns := array_append(missing_columns, 'watering_logs.field_row_id');
    END IF;
    
    -- Controlla field_row_id in nutrition_logs
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'nutrition_logs' AND column_name = 'field_row_id'
    ) THEN
        missing_columns := array_append(missing_columns, 'nutrition_logs.field_row_id');
    END IF;
    
    -- Controlla plant_code in garden_plants
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'garden_plants' AND column_name = 'plant_code'
    ) THEN
        missing_columns := array_append(missing_columns, 'garden_plants.plant_code');
    END IF;
    
    IF array_length(missing_columns, 1) > 0 THEN
        RAISE WARNING 'CRITICAL: Missing columns that will break app: %', array_to_string(missing_columns, ', ');
    ELSE
        RAISE NOTICE 'SUCCESS: All critical columns exist';
    END IF;
END $$;

-- 3. VERIFICA VIEW CRITICHE
SELECT '=== CRITICAL VIEWS CHECK ===' as section;

DO $$
DECLARE
    missing_views TEXT[] := ARRAY[]::TEXT[];
    view_name TEXT;
    critical_views TEXT[] := ARRAY[
        'individual_plants', 'plant_operations_complete', 
        'plant_production_summary', 'plants_per_row_summary', 'row_health_summary'
    ];
BEGIN
    FOREACH view_name IN ARRAY critical_views
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.views 
            WHERE table_schema = 'public' AND table_name = view_name
        ) THEN
            missing_views := array_append(missing_views, view_name);
        END IF;
    END LOOP;
    
    IF array_length(missing_views, 1) > 0 THEN
        RAISE WARNING 'CRITICAL: Missing views that will break app: %', array_to_string(missing_views, ', ');
    ELSE
        RAISE NOTICE 'SUCCESS: All critical views exist';
    END IF;
END $$;

-- 4. VERIFICA RLS SU TABELLE CRITICHE
SELECT '=== RLS SECURITY CHECK ===' as section;

DO $$
DECLARE
    unprotected_tables TEXT[] := ARRAY[]::TEXT[];
    table_rec RECORD;
BEGIN
    FOR table_rec IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN ('prescription_maps', 'garden_plants', 'plant_operations', 'prescription_zones')
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename = table_rec.tablename 
            AND rowsecurity = true
        ) THEN
            unprotected_tables := array_append(unprotected_tables, table_rec.tablename);
        END IF;
    END LOOP;
    
    IF array_length(unprotected_tables, 1) > 0 THEN
        RAISE WARNING 'SECURITY RISK: Tables without RLS: %', array_to_string(unprotected_tables, ', ');
    ELSE
        RAISE NOTICE 'SUCCESS: All critical tables have RLS enabled';
    END IF;
END $$;

-- 5. TEST QUERY CRITICHE CHE L'APP USA
SELECT '=== APP QUERIES TEST ===' as section;

-- Test query che l'app potrebbe usare
DO $$
BEGIN
    -- Test 1: Accesso a garden_plants
    BEGIN
        PERFORM COUNT(*) FROM garden_plants LIMIT 1;
        RAISE NOTICE 'SUCCESS: garden_plants query works';
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'CRITICAL: garden_plants query fails: %', SQLERRM;
    END;
    
    -- Test 2: Accesso a individual_plants view
    BEGIN
        PERFORM COUNT(*) FROM individual_plants LIMIT 1;
        RAISE NOTICE 'SUCCESS: individual_plants view works';
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'CRITICAL: individual_plants view fails: %', SQLERRM;
    END;
    
    -- Test 3: Join garden_plants con garden_rows
    BEGIN
        PERFORM COUNT(*) 
        FROM garden_plants gp 
        LEFT JOIN garden_rows gr ON gp.row_id = gr.id 
        LIMIT 1;
        RAISE NOTICE 'SUCCESS: garden_plants + garden_rows join works';
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'CRITICAL: garden_plants + garden_rows join fails: %', SQLERRM;
    END;
    
    -- Test 4: Prescription maps access
    BEGIN
        PERFORM COUNT(*) FROM prescription_maps LIMIT 1;
        RAISE NOTICE 'SUCCESS: prescription_maps query works';
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'CRITICAL: prescription_maps query fails: %', SQLERRM;
    END;
END $$;

-- 6. VERIFICA DATI SAMPLE PER TEST
SELECT '=== SAMPLE DATA CHECK ===' as section;

SELECT 
    'gardens' as table_name,
    COUNT(*) as record_count,
    CASE WHEN COUNT(*) > 0 THEN 'HAS DATA' ELSE 'EMPTY' END as status
FROM gardens
UNION ALL
SELECT 
    'garden_plants' as table_name,
    COUNT(*) as record_count,
    CASE WHEN COUNT(*) > 0 THEN 'HAS DATA' ELSE 'EMPTY' END as status
FROM garden_plants
UNION ALL
SELECT 
    'prescription_maps' as table_name,
    COUNT(*) as record_count,
    CASE WHEN COUNT(*) > 0 THEN 'HAS DATA' ELSE 'EMPTY' END as status
FROM prescription_maps;

-- SUMMARY
SELECT '=== FINAL SUMMARY ===' as section;
SELECT 'Check complete - review warnings above for critical issues' as result;