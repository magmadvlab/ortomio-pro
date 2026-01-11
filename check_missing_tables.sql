-- Database Check Script
-- Run this in Supabase SQL Editor to see what's missing

-- Check missing tables
SELECT 
  'TABLE' as object_type,
  table_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = expected_tables.table_name
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
FROM (
  VALUES 
    ('globalgap_compliance_checklist'),
    ('globalgap_self_assessments'),
    ('globalgap_ggn_codes'),
    ('globalgap_recall_procedures'),
    ('globalgap_risk_management_plans'),
    ('globalgap_health_safety_managers'),
    ('individual_plants'),
    ('garden_plants'),
    ('plant_operations'),
    ('plant_harvests'),
    ('plant_health_records'),
    ('plant_growth_stages'),
    ('prescription_maps'),
    ('prescription_zones'),
    ('variable_rate_applications'),
    ('prescription_map_exports'),
    ('machinery_compatibility'),
    ('ndvi_data_cache'),
    ('operation_sync_log')
) AS expected_tables(table_name)
ORDER BY table_name;

-- Check missing columns
SELECT 'watering_logs.field_row_id' as column_check,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'watering_logs' AND column_name = 'field_row_id'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT 'watering_logs.plant_ids' as column_check,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'watering_logs' AND column_name = 'plant_ids'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT 'fertilizer_application_logs.field_row_id' as column_check,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'fertilizer_application_logs' AND column_name = 'field_row_id'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT 'fertilizer_application_logs.plant_ids' as column_check,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'fertilizer_application_logs' AND column_name = 'plant_ids'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT 'treatment_register.field_row_id' as column_check,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'treatment_register' AND column_name = 'field_row_id'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT 'treatment_register.plant_ids' as column_check,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'treatment_register' AND column_name = 'plant_ids'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
;
