-- Popola colonne normalized per dati esistenti
-- Esegui dopo add_normalized_fields.sql

-- Popola normalized_name per crops esistenti
UPDATE official_crops 
SET normalized_name = normalize_text(name)
WHERE normalized_name IS NULL OR normalized_name = '';

-- Popola normalized_alias per aliases esistenti
UPDATE crop_aliases 
SET normalized_alias = normalize_text(alias_text)
WHERE normalized_alias IS NULL OR normalized_alias = '';

-- Verifica risultati
SELECT 
  'official_crops' as table_name,
  COUNT(*) as total_rows,
  COUNT(normalized_name) as normalized_rows
FROM official_crops
UNION ALL
SELECT 
  'crop_aliases' as table_name,
  COUNT(*) as total_rows,
  COUNT(normalized_alias) as normalized_rows
FROM crop_aliases;

