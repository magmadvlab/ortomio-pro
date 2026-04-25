-- Companion projection for specialized operation, device and quality signals.
-- Keeps specialized histories virtual and separate from the main task/outcome view.

DROP VIEW IF EXISTS public.agronomic_operation_signal_projection;

CREATE OR REPLACE VIEW public.agronomic_operation_signal_projection AS
SELECT
  ('individual_plant_operation:' || ipo.id::text) AS projection_id,
  'individual_plant_operations'::text AS source_table,
  ipo.id::text AS source_record_id,
  gardens.user_id,
  ipo.garden_id,
  NULL::uuid AS task_id,
  ipo.parent_operation_id::text AS parent_operation_id,
  ipo.parent_operation_table,
  'plant_operation'::text AS signal_role,
  ipo.operation_type::text AS operation_kind,
  CASE
    WHEN ipo.operation_type = 'watering' THEN 'irrigation'
    WHEN ipo.operation_type = 'fertilizing' THEN 'nutrition'
    WHEN ipo.operation_type = 'treatment' THEN 'protection'
    WHEN ipo.operation_type = 'harvest' THEN 'quality'
    ELSE 'operations'
  END AS operation_category,
  ipo.operation_date AS signal_date,
  (ipo.operation_date || ' ' || COALESCE(ipo.operation_time::text, '12:00'))::timestamptz AS signal_at,
  NULL::text AS zone_id,
  NULL::text AS field_row_id,
  NULL::text AS tree_id,
  ipo.plant_id::text AS plant_id,
  ipo.quantity AS quantity,
  ipo.unit,
  ipo.product_name,
  COALESCE(ipo.actor_type, 'manual') AS actor_type,
  COALESCE(ipo.source_type, 'individual_plant_operation') AS source_type,
  NULL::text AS device_id,
  NULL::text AS decision,
  NULL::text AS command_status,
  NULL::boolean AS commanded_valve_state,
  NULL::boolean AS confirmed_valve_state,
  NULL::numeric AS target_liters,
  NULL::numeric AS session_liters,
  NULL::numeric AS quality_score,
  NULL::numeric AS marketable_yield_kg,
  NULL::numeric AS rejected_yield_kg,
  NULL::numeric AS brix,
  CASE
    WHEN ipo.operation_type = 'harvest' THEN 'measured_result'
    WHEN ipo.parent_operation_id IS NOT NULL THEN 'propagated_operation'
    ELSE 'direct_operation'
  END AS result_class,
  ipo.notes,
  jsonb_build_object(
    'operationContext', ipo.operation_context,
    'weatherConditions', ipo.weather_conditions,
    'geoSnapshot', ipo.geo_snapshot,
    'greenhouseConditions', ipo.greenhouse_conditions
  ) AS metadata,
  ipo.created_at,
  ipo.updated_at
FROM public.individual_plant_operations ipo
JOIN public.gardens gardens ON gardens.id = ipo.garden_id

UNION ALL

SELECT
  ('smart_device_automation:' || log.id::text) AS projection_id,
  'smart_device_automation_logs'::text AS source_table,
  log.id::text AS source_record_id,
  log.user_id,
  log.garden_id,
  NULL::uuid AS task_id,
  NULL::text AS parent_operation_id,
  NULL::text AS parent_operation_table,
  'device_automation'::text AS signal_role,
  COALESCE(log.event_type, 'device_event') AS operation_kind,
  'irrigation'::text AS operation_category,
  log.event_at::date AS signal_date,
  log.event_at AS signal_at,
  log.zone_id,
  log.field_row_id,
  log.tree_id,
  log.plant_id,
  COALESCE(log.session_liters, log.target_liters) AS quantity,
  CASE WHEN COALESCE(log.session_liters, log.target_liters) IS NOT NULL THEN 'L' ELSE NULL END AS unit,
  log.provider AS product_name,
  'device'::text AS actor_type,
  COALESCE(log.source, 'smart_device') AS source_type,
  log.device_id::text AS device_id,
  log.decision,
  log.command_status,
  log.commanded_valve_state,
  log.confirmed_valve_state,
  log.target_liters,
  log.session_liters,
  NULL::numeric AS quality_score,
  NULL::numeric AS marketable_yield_kg,
  NULL::numeric AS rejected_yield_kg,
  NULL::numeric AS brix,
  CASE
    WHEN log.irrigation_outcome IS NOT NULL THEN log.irrigation_outcome
    WHEN log.command_status IN ('confirmed', 'completed', 'success') THEN 'device_execution_confirmed'
    WHEN log.command_status IN ('failed', 'error') THEN 'device_execution_failed'
    ELSE 'device_signal'
  END AS result_class,
  log.reason AS notes,
  log.metadata,
  log.created_at,
  log.created_at AS updated_at
FROM public.smart_device_automation_logs log

UNION ALL

SELECT
  ('quality_result:' || result.id::text) AS projection_id,
  'quality_results'::text AS source_table,
  result.id::text AS source_record_id,
  result.user_id,
  result.garden_id,
  harvest.task_id,
  result.harvest_log_id::text AS parent_operation_id,
  CASE WHEN result.harvest_log_id IS NOT NULL THEN 'harvest_logs' ELSE NULL END AS parent_operation_table,
  'measured_quality_result'::text AS signal_role,
  'quality_result'::text AS operation_kind,
  'quality'::text AS operation_category,
  result.recorded_at::date AS signal_date,
  result.recorded_at AS signal_at,
  result.zone_id,
  result.field_row_id,
  result.tree_id,
  result.plant_id,
  COALESCE(result.marketable_yield_kg, result.sample_size) AS quantity,
  CASE
    WHEN result.marketable_yield_kg IS NOT NULL THEN 'kg'
    WHEN result.sample_size IS NOT NULL THEN 'sample'
    ELSE NULL
  END AS unit,
  result.crop_context_id AS product_name,
  'user'::text AS actor_type,
  result.source AS source_type,
  NULL::text AS device_id,
  NULL::text AS decision,
  NULL::text AS command_status,
  NULL::boolean AS commanded_valve_state,
  NULL::boolean AS confirmed_valve_state,
  NULL::numeric AS target_liters,
  NULL::numeric AS session_liters,
  result.quality_score,
  result.marketable_yield_kg,
  result.rejected_yield_kg,
  result.brix,
  CASE
    WHEN result.quality_grade IN ('premium', 'excellent') THEN 'beneficial'
    WHEN result.quality_grade IN ('fair', 'poor') THEN 'negative_quality'
    WHEN result.quality_score IS NOT NULL AND result.quality_score >= 75 THEN 'beneficial'
    WHEN result.quality_score IS NOT NULL AND result.quality_score < 50 THEN 'negative_quality'
    ELSE 'measured_quality'
  END AS result_class,
  result.notes,
  jsonb_build_object(
    'cropContextId', result.crop_context_id,
    'scopeType', result.scope_type,
    'scopeId', result.scope_id,
    'qualityGrade', result.quality_grade,
    'lotCode', result.lot_code,
    'sampleLabel', result.sample_label,
    'metadata', result.metadata
  ) AS metadata,
  result.created_at,
  result.updated_at
FROM public.quality_results result
LEFT JOIN public.harvest_logs harvest ON harvest.id = result.harvest_log_id

UNION ALL

SELECT
  ('prescription_export:' || export.id::text) AS projection_id,
  'prescription_map_exports'::text AS source_table,
  export.id::text AS source_record_id,
  gardens.user_id,
  export.garden_id,
  NULL::uuid AS task_id,
  export.prescription_map_id::text AS parent_operation_id,
  'prescription_maps'::text AS parent_operation_table,
  'prescription_export'::text AS signal_role,
  'prescription_export'::text AS operation_kind,
  'precision_execution'::text AS operation_category,
  COALESCE(export.applied_at, export.field_imported_at, export.created_at)::date AS signal_date,
  COALESCE(export.applied_at, export.field_imported_at, export.created_at) AS signal_at,
  NULL::text AS zone_id,
  NULL::text AS field_row_id,
  NULL::text AS tree_id,
  NULL::text AS plant_id,
  NULL::numeric AS quantity,
  NULL::text AS unit,
  export.export_format AS product_name,
  'user'::text AS actor_type,
  'prescription_map_export'::text AS source_type,
  NULL::text AS device_id,
  NULL::text AS decision,
  export.export_status AS command_status,
  NULL::boolean AS commanded_valve_state,
  NULL::boolean AS confirmed_valve_state,
  NULL::numeric AS target_liters,
  NULL::numeric AS session_liters,
  NULL::numeric AS quality_score,
  NULL::numeric AS marketable_yield_kg,
  NULL::numeric AS rejected_yield_kg,
  NULL::numeric AS brix,
  CASE
    WHEN export.applied_at IS NOT NULL THEN 'field_applied'
    WHEN export.field_imported_at IS NOT NULL THEN 'field_imported'
    WHEN export.export_status = 'completed' THEN 'export_completed_no_execution'
    WHEN export.export_status = 'failed' THEN 'export_failed'
    ELSE 'export_pending'
  END AS result_class,
  export.error_message AS notes,
  jsonb_build_object(
    'fileName', export.file_name,
    'versionNumber', export.version_number,
    'fieldStatus', export.field_status,
    'machineryBrand', export.machinery_brand,
    'machineryModel', export.machinery_model,
    'machineryProfileId', export.machinery_profile_id,
    'compatibilityScore', export.compatibility_score,
    'warnings', export.warnings,
    'metadata', export.metadata
  ) AS metadata,
  export.created_at,
  export.updated_at
FROM public.prescription_map_exports export
JOIN public.gardens gardens ON gardens.id = export.garden_id;

GRANT SELECT ON public.agronomic_operation_signal_projection TO authenticated;

COMMENT ON VIEW public.agronomic_operation_signal_projection
  IS 'Companion virtual projection for specialized plant-level operations, smart-device automation, quality outcomes and prescription export signals.';
