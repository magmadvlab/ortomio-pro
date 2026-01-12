-- Verifica che tutte le colonne siano state create correttamente
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'treatment_register' 
AND column_name IN ('treatment_type', 'organic_approved', 'registration_number', 'pre_harvest_interval_days')
ORDER BY column_name;