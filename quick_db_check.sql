-- QUICK DATABASE CHECK - OrtoMio
-- Esegui questo in Supabase per vedere cosa manca

-- 🔍 CHECK TABELLE CRITICHE
SELECT 
  '📊 TABELLE' as categoria,
  table_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = expected.table_name)
    THEN '✅ EXISTS' 
    ELSE '❌ MISSING - MIGRAZIONE NECESSARIA'
  END as status
FROM (VALUES
  ('globalgap_compliance_checklist'),
  ('globalgap_self_assessments'),
  ('individual_plants'),
  ('plant_operations'),
  ('prescription_maps'),
  ('prescription_zones'),
  ('operation_sync_log')
) AS expected(table_name)

UNION ALL

-- 🔍 CHECK COLONNE CRITICHE
SELECT 
  '📋 COLONNE' as categoria,
  table_name || '.' || column_name as table_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = expected.table_name AND column_name = expected.column_name)
    THEN '✅ EXISTS' 
    ELSE '❌ MISSING - MIGRAZIONE NECESSARIA'
  END as status
FROM (VALUES
  ('watering_logs', 'field_row_id'),
  ('fertilizer_application_logs', 'field_row_id'),
  ('treatment_register', 'field_row_id')
) AS expected(table_name, column_name)

ORDER BY categoria, table_name;

-- 📊 RIEPILOGO STATO DATABASE
SELECT 
  'RIEPILOGO' as tipo,
  COUNT(*) FILTER (WHERE table_type = 'BASE TABLE') as tabelle_totali,
  COUNT(*) FILTER (WHERE table_name LIKE 'globalgap_%') as tabelle_globalgap,
  COUNT(*) FILTER (WHERE table_name LIKE '%plant%') as tabelle_plant,
  COUNT(*) FILTER (WHERE table_name LIKE 'prescription_%') as tabelle_prescription
FROM information_schema.tables 
WHERE table_schema = 'public';
