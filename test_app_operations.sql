-- =====================================================
-- TEST APP OPERATIONS - OrtoMio PRO
-- Simula operazioni che l'app dovrebbe poter fare
-- =====================================================

-- IMPORTANTE: Questo test simula operazioni reali dell'app
-- Esegui solo se vuoi testare inserimenti nel database

-- 1. TEST INSERT GARDEN_PLANTS
SELECT '=== TEST INSERT GARDEN_PLANTS ===' as test_section;

DO $$
DECLARE
    test_garden_id UUID;
    test_plant_id UUID;
BEGIN
    -- Prendi un garden esistente o creane uno di test
    SELECT id INTO test_garden_id FROM gardens LIMIT 1;
    
    IF test_garden_id IS NULL THEN
        RAISE WARNING 'No gardens found - cannot test garden_plants insert';
    ELSE
        BEGIN
            -- Prova a inserire una pianta di test
            INSERT INTO garden_plants (
                garden_id, 
                plant_name, 
                plant_code, 
                variety, 
                status, 
                health_score,
                planting_date
            ) VALUES (
                test_garden_id,
                'Test Plant',
                'TEST-001',
                'Test Variety',
                'healthy',
                85,
                CURRENT_DATE
            ) RETURNING id INTO test_plant_id;
            
            RAISE NOTICE 'SUCCESS: garden_plants insert works (ID: %)', test_plant_id;
            
            -- Cleanup - rimuovi il test
            DELETE FROM garden_plants WHERE id = test_plant_id;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'PROBLEM: garden_plants insert fails: %', SQLERRM;
        END;
    END IF;
END $$;

-- 2. TEST INSERT PLANT_OPERATIONS
SELECT '=== TEST INSERT PLANT_OPERATIONS ===' as test_section;

DO $$
DECLARE
    test_garden_id UUID;
    test_plant_id UUID;
    test_operation_id UUID;
BEGIN
    -- Prendi una pianta esistente
    SELECT gp.id, gp.garden_id 
    INTO test_plant_id, test_garden_id 
    FROM garden_plants gp 
    LIMIT 1;
    
    IF test_plant_id IS NULL THEN
        RAISE WARNING 'No garden_plants found - cannot test plant_operations insert';
    ELSE
        BEGIN
            -- Prova a inserire un'operazione di test
            INSERT INTO plant_operations (
                plant_id,
                garden_id,
                operation_type,
                operation_date,
                quantity,
                unit,
                product_name,
                notes
            ) VALUES (
                test_plant_id,
                test_garden_id,
                'fertilization',
                CURRENT_DATE,
                100,
                'ml',
                'Test Fertilizer',
                'Test operation'
            ) RETURNING id INTO test_operation_id;
            
            RAISE NOTICE 'SUCCESS: plant_operations insert works (ID: %)', test_operation_id;
            
            -- Cleanup
            DELETE FROM plant_operations WHERE id = test_operation_id;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'PROBLEM: plant_operations insert fails: %', SQLERRM;
        END;
    END IF;
END $$;

-- 3. TEST INSERT PRESCRIPTION_MAPS
SELECT '=== TEST INSERT PRESCRIPTION_MAPS ===' as test_section;

DO $$
DECLARE
    test_garden_id UUID;
    test_map_id UUID;
BEGIN
    SELECT id INTO test_garden_id FROM gardens LIMIT 1;
    
    IF test_garden_id IS NULL THEN
        RAISE WARNING 'No gardens found - cannot test prescription_maps insert';
    ELSE
        BEGIN
            INSERT INTO prescription_maps (
                garden_id,
                name,
                crop_type,
                map_type,
                status,
                created_date
            ) VALUES (
                test_garden_id,
                'Test Prescription Map',
                'tomato',
                'fertilizer',
                'draft',
                CURRENT_DATE
            ) RETURNING id INTO test_map_id;
            
            RAISE NOTICE 'SUCCESS: prescription_maps insert works (ID: %)', test_map_id;
            
            -- Cleanup
            DELETE FROM prescription_maps WHERE id = test_map_id;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'PROBLEM: prescription_maps insert fails: %', SQLERRM;
        END;
    END IF;
END $$;

-- 4. TEST INSERT WATERING_LOGS WITH FIELD_ROW_ID
SELECT '=== TEST INSERT WATERING_LOGS WITH FIELD_ROW_ID ===' as test_section;

DO $$
DECLARE
    test_garden_id UUID;
    test_field_row_id UUID;
    test_watering_id UUID;
BEGIN
    SELECT id INTO test_garden_id FROM gardens LIMIT 1;
    SELECT id INTO test_field_row_id FROM field_rows LIMIT 1;
    
    IF test_garden_id IS NULL THEN
        RAISE WARNING 'No gardens found - cannot test watering_logs insert';
    ELSIF test_field_row_id IS NULL THEN
        RAISE WARNING 'No field_rows found - cannot test field_row_id functionality';
    ELSE
        BEGIN
            INSERT INTO watering_logs (
                garden_id,
                field_row_id,
                watering_date,
                duration_minutes,
                water_amount_liters,
                method,
                notes
            ) VALUES (
                test_garden_id,
                test_field_row_id,
                CURRENT_DATE,
                30,
                50,
                'drip',
                'Test watering with field row'
            ) RETURNING id INTO test_watering_id;
            
            RAISE NOTICE 'SUCCESS: watering_logs with field_row_id works (ID: %)', test_watering_id;
            
            -- Cleanup
            DELETE FROM watering_logs WHERE id = test_watering_id;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'PROBLEM: watering_logs with field_row_id fails: %', SQLERRM;
        END;
    END IF;
END $$;

-- 5. TEST VIEW QUERIES
SELECT '=== TEST VIEW QUERIES ===' as test_section;

-- Test individual_plants view
DO $$
DECLARE
    plant_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO plant_count FROM individual_plants LIMIT 10;
    RAISE NOTICE 'SUCCESS: individual_plants view returns % records', plant_count;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'PROBLEM: individual_plants view query fails: %', SQLERRM;
END $$;

-- Test plant_operations_complete view
DO $$
DECLARE
    ops_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO ops_count FROM plant_operations_complete LIMIT 10;
    RAISE NOTICE 'SUCCESS: plant_operations_complete view returns % records', ops_count;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'PROBLEM: plant_operations_complete view query fails: %', SQLERRM;
END $$;

-- 6. TEST COMPLEX JOINS (come quelli che usa l'app)
SELECT '=== TEST COMPLEX JOINS ===' as test_section;

-- Test join complesso per plant tracking
DO $$
DECLARE
    result_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO result_count
    FROM garden_plants gp
    LEFT JOIN garden_rows gr ON gp.row_id = gr.id
    LEFT JOIN field_rows fr ON gp.field_row_id = fr.id
    LEFT JOIN plant_operations po ON gp.id = po.plant_id
    WHERE gp.garden_id IS NOT NULL
    LIMIT 10;
    
    RAISE NOTICE 'SUCCESS: Complex plant tracking join returns % records', result_count;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'PROBLEM: Complex plant tracking join fails: %', SQLERRM;
END $$;

-- FINAL SUMMARY
SELECT '=== OPERATIONS TEST SUMMARY ===' as final_section;
SELECT 'Check all SUCCESS/PROBLEM messages above' as instruction;
SELECT 'If all operations work, the database is ready for the app' as conclusion;