-- Precision execution projection for prescription map field applications.
-- The cloud provider already persists PrescriptionExecutionRecord rows in
-- variable_rate_applications; this view exposes that existing table without
-- creating a duplicate prescription_execution_records table.

DROP VIEW IF EXISTS public.agronomic_precision_execution_projection;

CREATE OR REPLACE VIEW public.agronomic_precision_execution_projection AS
SELECT
  ('variable_rate_application:' || application.id::text) AS projection_id,
  application.id AS execution_record_id,
  application.prescription_map_id,
  application.prescription_zone_id,
  map.garden_id,
  gardens.user_id,
  map.name AS prescription_map_name,
  map.map_type AS prescription_map_type,
  application.application_date,
  application.product_name,
  application.product_type,
  application.planned_rate,
  application.actual_rate,
  application.unit,
  application.planned_area_sqm,
  application.area_applied_sqm,
  application.total_product_used,
  application.machinery_used,
  application.operator_name,
  application.gps_track,
  application.application_accuracy,
  application.application_quality,
  application.notes,
  application.weather_conditions,
  application.product_cost,
  application.application_cost,
  application.total_cost,
  application.execution_status,
  application.execution_scope_type,
  application.execution_scope_id,
  application.source_operation_type,
  application.source_operation_id,
  application.prescription_export_id,
  application.smart_device_id,
  export.export_format,
  export.file_name AS export_file_name,
  export.field_status AS export_field_status,
  export.machinery_brand,
  export.machinery_model,
  export.machinery_profile_id,
  export.compatibility_score,
  export.field_imported_at,
  export.applied_at AS export_applied_at,
  CASE
    WHEN application.execution_status = 'completed'
      AND COALESCE(application.application_accuracy, 0) >= 90
      THEN 'aligned'
    WHEN application.execution_status = 'completed'
      THEN 'completed_with_variance'
    WHEN application.execution_status = 'partial'
      THEN 'partial'
    WHEN application.execution_status = 'missed'
      THEN 'missed'
    ELSE 'planned_or_unknown'
  END AS variance_class,
  CASE
    WHEN application.actual_rate IS NULL OR application.planned_rate IS NULL OR application.planned_rate = 0
      THEN NULL::numeric
    ELSE ROUND(((application.actual_rate - application.planned_rate) / application.planned_rate) * 100, 2)
  END AS rate_deviation_percent,
  CASE
    WHEN application.area_applied_sqm IS NULL OR application.planned_area_sqm IS NULL OR application.planned_area_sqm = 0
      THEN NULL::numeric
    ELSE ROUND((application.area_applied_sqm / application.planned_area_sqm) * 100, 2)
  END AS area_coverage_percent,
  jsonb_build_object(
    'sourceTable', 'variable_rate_applications',
    'sourceOperationType', application.source_operation_type,
    'sourceOperationId', application.source_operation_id,
    'prescriptionExportId', application.prescription_export_id,
    'smartDeviceId', application.smart_device_id,
    'exportFieldStatus', export.field_status,
    'exportWarnings', export.warnings,
    'exportMetadata', export.metadata
  ) AS execution_metadata,
  application.created_at,
  application.updated_at
FROM public.variable_rate_applications application
JOIN public.prescription_maps map ON map.id = application.prescription_map_id
JOIN public.gardens gardens ON gardens.id = map.garden_id
LEFT JOIN public.prescription_map_exports export ON export.id = application.prescription_export_id;

GRANT SELECT ON public.agronomic_precision_execution_projection TO authenticated;

COMMENT ON VIEW public.agronomic_precision_execution_projection
  IS 'Virtual projection for prescription map field execution records persisted in variable_rate_applications.';
