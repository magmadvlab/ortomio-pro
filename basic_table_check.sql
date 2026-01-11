-- =====================================================
-- BASIC TABLE CHECK - OrtoMio PRO
-- Test minimo per identificare problemi critici
-- =====================================================

-- 1. Lista tutte le tabelle esistenti
SELECT 'Current tables in database:' as info;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. Lista tutte le view esistenti  
SELECT 'Current views in database:' as info;
SELECT table_name FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;

-- 3. Controlla se garden_plants esiste e ha dati
SELECT 'garden_plants check:' as info;
SELECT COUNT(*) as garden_plants_count FROM garden_plants;

-- 4. Controlla se prescription_maps esiste
SELECT 'prescription_maps check:' as info;
SELECT COUNT(*) as prescription_maps_count FROM prescription_maps;

-- 5. Controlla se field_rows esiste
SELECT 'field_rows check:' as info;
SELECT COUNT(*) as field_rows_count FROM field_rows;

-- 6. Verifica colonne in garden_plants
SELECT 'garden_plants columns:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'garden_plants'
ORDER BY ordinal_position;

-- 7. Verifica colonne in watering_logs
SELECT 'watering_logs columns:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'watering_logs'
ORDER BY ordinal_position;