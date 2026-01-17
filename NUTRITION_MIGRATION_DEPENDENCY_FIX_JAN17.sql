-- NUTRITION MIGRATION DEPENDENCY FIX
-- Date: January 17, 2026
-- Fix: Corrected table references from 'zones' to 'garden_zones'

-- This file contains the corrected foreign key references
-- Apply this if you need to fix existing tables

-- Fix nutrition_treatments table
ALTER TABLE nutrition_treatments 
DROP CONSTRAINT IF EXISTS nutrition_treatments_zone_id_fkey;

ALTER TABLE nutrition_treatments 
ADD CONSTRAINT nutrition_treatments_zone_id_fkey 
FOREIGN KEY (zone_id) REFERENCES garden_zones(id) ON DELETE SET NULL;

-- Fix nutrition_schedules table  
ALTER TABLE nutrition_schedules 
DROP CONSTRAINT IF EXISTS nutrition_schedules_zone_id_fkey;

ALTER TABLE nutrition_schedules 
ADD CONSTRAINT nutrition_schedules_zone_id_fkey 
FOREIGN KEY (zone_id) REFERENCES garden_zones(id) ON DELETE SET NULL;

-- Verify the fixes
SELECT 
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name IN ('nutrition_treatments', 'nutrition_schedules')
  AND tc.constraint_type = 'FOREIGN KEY'
  AND kcu.column_name = 'zone_id';