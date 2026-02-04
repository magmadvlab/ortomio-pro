-- Verifica se le tabelle esistono già in Supabase
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('land_zones', 'soil_memory', 'field_row_crop_history')
ORDER BY table_name;

-- Verifica se la colonna land_zone_id esiste in garden_rows
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'garden_rows'
  AND column_name = 'land_zone_id';

-- Verifica constraint univoco su row_number
SELECT
  conname as constraint_name,
  pg_get_constraintdef(c.oid) as constraint_definition
FROM pg_constraint c
JOIN pg_namespace n ON n.oid = c.connamespace
WHERE conrelid = 'public.garden_rows'::regclass
  AND conname LIKE '%row_number%';
