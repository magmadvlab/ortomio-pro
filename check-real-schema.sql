-- Verifica schema reale delle tabelle esistenti

-- 1. Verifica colonne di gardens
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'gardens' 
ORDER BY ordinal_position;

-- 2. Verifica colonne di garden_rows
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'garden_rows' 
ORDER BY ordinal_position;

-- 3. Verifica foreign keys di garden_rows
SELECT
    tc.constraint_name,
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
  AND tc.table_name = 'garden_rows';
