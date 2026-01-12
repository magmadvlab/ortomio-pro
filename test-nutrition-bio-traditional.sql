-- Test per verificare l'implementazione Bio/Tradizionale
-- Questo file testa la migrazione e le funzionalità

-- 1. Verifica che le colonne siano state aggiunte
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'treatment_register' 
AND column_name IN ('treatment_type', 'organic_approved', 'registration_number', 'pre_harvest_interval_days', 'certification_compliance')
ORDER BY column_name;

-- 2. Verifica che gli indici siano stati creati
SELECT 
    indexname, 
    indexdef
FROM pg_indexes 
WHERE tablename = 'treatment_register' 
AND indexname LIKE '%type%' OR indexname LIKE '%organic%';

-- 3. Verifica che la vista sia stata creata
SELECT * FROM information_schema.views WHERE table_name = 'nutrition_statistics_by_type';

-- 4. Verifica che le funzioni siano state create
SELECT 
    routine_name, 
    routine_type
FROM information_schema.routines 
WHERE routine_name IN ('validate_treatment_certification_compatibility', 'check_treatment_certification_compliance');

-- 5. Test inserimento trattamento biologico
INSERT INTO treatment_register (
    user_id,
    garden_id, 
    crop_name, 
    treatment_date, 
    product_name,
    treatment_type,
    organic_approved,
    registration_number,
    pre_harvest_interval_days,
    active_ingredient,
    dosage,
    dosage_unit,
    method,
    reason,
    notes
) VALUES (
    auth.uid(),
    (SELECT id FROM gardens WHERE user_id = auth.uid() LIMIT 1),
    'Pomodoro Test',
    CURRENT_DATE,
    'Rame Bio Test',
    'organic',
    true,
    'TEST123',
    3,
    'Ossicloruro di rame',
    2.5,
    'g',
    'spray',
    'preventive',
    'Test trattamento biologico'
);

-- 6. Test inserimento trattamento tradizionale
INSERT INTO treatment_register (
    user_id,
    garden_id, 
    crop_name, 
    treatment_date, 
    product_name,
    treatment_type,
    organic_approved,
    registration_number,
    pre_harvest_interval_days,
    active_ingredient,
    dosage,
    dosage_unit,
    method,
    reason,
    notes
) VALUES (
    auth.uid(),
    (SELECT id FROM gardens WHERE user_id = auth.uid() LIMIT 1),
    'Pomodoro Test',
    CURRENT_DATE,
    'Fungicida Tradizionale Test',
    'conventional',
    false,
    'TEST456',
    7,
    'Principio attivo chimico',
    1.0,
    'ml',
    'spray',
    'curative',
    'Test trattamento tradizionale'
);

-- 7. Verifica che i dati siano stati inseriti correttamente
SELECT 
    crop_name,
    product_name,
    treatment_type,
    organic_approved,
    registration_number,
    pre_harvest_interval_days
FROM treatment_register 
WHERE crop_name = 'Pomodoro Test'
ORDER BY treatment_type;

-- 8. Test della vista statistiche
SELECT * FROM nutrition_statistics_by_type 
WHERE garden_id = (SELECT id FROM gardens WHERE user_id = auth.uid() LIMIT 1);

-- 9. Test funzione validazione
SELECT validate_treatment_certification_compatibility(
    (SELECT id FROM gardens WHERE user_id = auth.uid() LIMIT 1),
    'organic',
    true
) as organic_valid;

SELECT validate_treatment_certification_compatibility(
    (SELECT id FROM gardens WHERE user_id = auth.uid() LIMIT 1),
    'conventional',
    false
) as conventional_valid;

-- 10. Cleanup - rimuovi i dati di test
DELETE FROM treatment_register WHERE crop_name = 'Pomodoro Test';

-- 11. Verifica struttura fertilizer_application_logs
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'fertilizer_application_logs' 
AND column_name = 'fertilizer_type';

-- Test completo per verificare implementazione Bio/Tradizionale nel sistema nutrizione