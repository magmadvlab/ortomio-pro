-- Test semplice per verificare che la migrazione sia stata applicata

-- 1. Verifica che le colonne siano state aggiunte
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'treatment_register' 
AND column_name IN ('treatment_type', 'organic_approved', 'registration_number', 'pre_harvest_interval_days')
ORDER BY column_name;

-- 2. Verifica che gli indici siano stati creati
SELECT 
    indexname, 
    indexdef
FROM pg_indexes 
WHERE tablename = 'treatment_register' 
AND (indexname LIKE '%type%' OR indexname LIKE '%organic%');

-- 3. Test inserimento semplice (solo se hai giardini)
-- NOTA: Esegui solo se hai almeno un giardino nel database
/*
INSERT INTO treatment_register (
    user_id,
    garden_id, 
    crop_name, 
    treatment_date, 
    product_name,
    treatment_type,
    organic_approved,
    registration_number,
    pre_harvest_interval_days
) VALUES (
    auth.uid(),
    (SELECT id FROM gardens WHERE user_id = auth.uid() LIMIT 1),
    'Test Bio',
    CURRENT_DATE,
    'Prodotto Test Bio',
    'organic',
    true,
    'TEST123',
    3
);

-- Verifica inserimento
SELECT 
    crop_name,
    product_name,
    treatment_type,
    organic_approved,
    registration_number,
    pre_harvest_interval_days
FROM treatment_register 
WHERE crop_name = 'Test Bio';

-- Cleanup
DELETE FROM treatment_register WHERE crop_name = 'Test Bio';
*/