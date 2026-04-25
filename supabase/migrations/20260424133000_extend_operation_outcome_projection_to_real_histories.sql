-- Extend the canonical operation/outcome projection to real operational histories.
-- This keeps the ledger virtual: existing operation tables remain the source of truth.

ALTER TABLE public.watering_logs
  ADD COLUMN IF NOT EXISTS task_id UUID REFERENCES public.garden_tasks(id) ON DELETE SET NULL;

ALTER TABLE public.fertilizer_application_logs
  ADD COLUMN IF NOT EXISTS task_id UUID REFERENCES public.garden_tasks(id) ON DELETE SET NULL;

ALTER TABLE public.treatment_register
  ADD COLUMN IF NOT EXISTS task_id UUID REFERENCES public.garden_tasks(id) ON DELETE SET NULL;

ALTER TABLE public.mechanical_work_register
  ADD COLUMN IF NOT EXISTS task_id UUID REFERENCES public.garden_tasks(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_watering_logs_task_id
  ON public.watering_logs(task_id)
  WHERE task_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_fertilizer_application_logs_task_id
  ON public.fertilizer_application_logs(task_id)
  WHERE task_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_treatment_register_task_id
  ON public.treatment_register(task_id)
  WHERE task_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_mechanical_work_register_task_id
  ON public.mechanical_work_register(task_id)
  WHERE task_id IS NOT NULL;

DROP VIEW IF EXISTS public.agronomic_operation_outcome_projection;

CREATE OR REPLACE VIEW public.agronomic_operation_outcome_projection AS
WITH operation_sources AS (
  SELECT
    'watering_logs'::text AS operation_source_table,
    wl.id::text AS operation_source_id,
    wl.garden_id,
    gardens.user_id,
    COALESCE(wl.task_id::text, substring(wl.notes from 'SOURCE_TASK::([A-Za-z0-9-]+)')) AS source_task_id,
    'watering'::text AS operation_kind,
    'irrigation'::text AS operation_category,
    wl.date AS operation_date,
    wl.watered_at AS operation_timestamp,
    wl.liters_applied AS operation_quantity,
    'L'::text AS operation_unit,
    NULL::text AS operation_product_name,
    wl.notes AS operation_notes,
    wl.bed_id::text AS bed_id,
    wl.bed_row_id::text AS bed_row_id,
    wl.field_row_id::text AS field_row_id,
    NULL::text AS zone_id,
    NULL::text AS plant_id,
    wl.completed AS operation_success,
    'manual_or_device'::text AS actor_type,
    CASE WHEN wl.valve_id IS NOT NULL OR wl.method IN ('Automatic', 'Timer') THEN 'device_or_automation' ELSE 'manual' END AS source_type,
    wl.created_at
  FROM public.watering_logs wl
  JOIN public.gardens gardens ON gardens.id = wl.garden_id

  UNION ALL

  SELECT
    'fertilizer_application_logs'::text AS operation_source_table,
    fal.id::text AS operation_source_id,
    fal.garden_id,
    gardens.user_id,
    COALESCE(fal.task_id::text, substring(fal.notes from 'SOURCE_TASK::([A-Za-z0-9-]+)')) AS source_task_id,
    'fertilization'::text AS operation_kind,
    'nutrition'::text AS operation_category,
    fal.application_date AS operation_date,
    fal.application_date::timestamptz AS operation_timestamp,
    fal.dosage AS operation_quantity,
    fal.dosage_unit AS operation_unit,
    fal.fertilizer_name AS operation_product_name,
    fal.notes AS operation_notes,
    fal.bed_id::text AS bed_id,
    fal.bed_row_id::text AS bed_row_id,
    fal.field_row_id::text AS field_row_id,
    fal.zone_id::text AS zone_id,
    NULL::text AS plant_id,
    TRUE AS operation_success,
    'manual'::text AS actor_type,
    'manual'::text AS source_type,
    fal.created_at
  FROM public.fertilizer_application_logs fal
  JOIN public.gardens gardens ON gardens.id = fal.garden_id

  UNION ALL

  SELECT
    'treatment_register'::text AS operation_source_table,
    tr.id::text AS operation_source_id,
    tr.garden_id,
    tr.user_id,
    COALESCE(tr.task_id::text, substring(tr.notes from 'SOURCE_TASK::([A-Za-z0-9-]+)')) AS source_task_id,
    'treatment'::text AS operation_kind,
    'protection'::text AS operation_category,
    tr.treatment_date AS operation_date,
    tr.treatment_date::timestamptz AS operation_timestamp,
    tr.dosage AS operation_quantity,
    tr.dosage_unit AS operation_unit,
    tr.product_name AS operation_product_name,
    tr.notes AS operation_notes,
    tr.bed_id::text AS bed_id,
    tr.bed_row_id::text AS bed_row_id,
    tr.field_row_id::text AS field_row_id,
    tr.zone_id::text AS zone_id,
    NULL::text AS plant_id,
    TRUE AS operation_success,
    'manual'::text AS actor_type,
    'manual'::text AS source_type,
    tr.created_at
  FROM public.treatment_register tr

  UNION ALL

  SELECT
    'mechanical_work_register'::text AS operation_source_table,
    mw.id::text AS operation_source_id,
    mw.garden_id,
    mw.user_id,
    COALESCE(mw.task_id::text, substring(mw.notes from 'SOURCE_TASK::([A-Za-z0-9-]+)')) AS source_task_id,
    'mechanical_work'::text AS operation_kind,
    'operations'::text AS operation_category,
    mw.work_date AS operation_date,
    mw.work_date::timestamptz AS operation_timestamp,
    COALESCE(mw.area_m2, mw.area_covered_sqm) AS operation_quantity,
    'm2'::text AS operation_unit,
    mw.work_type::text AS operation_product_name,
    mw.notes AS operation_notes,
    mw.bed_id::text AS bed_id,
    mw.bed_row_id::text AS bed_row_id,
    mw.field_row_id::text AS field_row_id,
    mw.zone_id::text AS zone_id,
    NULL::text AS plant_id,
    TRUE AS operation_success,
    'manual'::text AS actor_type,
    'manual'::text AS source_type,
    mw.created_at
  FROM public.mechanical_work_register mw

  UNION ALL

  SELECT
    'harvest_logs'::text AS operation_source_table,
    hl.id::text AS operation_source_id,
    hl.garden_id,
    gardens.user_id,
    COALESCE(hl.task_id::text, substring(hl.notes from 'SOURCE_TASK::([A-Za-z0-9-]+)')) AS source_task_id,
    'harvest'::text AS operation_kind,
    'quality'::text AS operation_category,
    hl.harvest_date AS operation_date,
    hl.harvest_date::timestamptz AS operation_timestamp,
    hl.quantity AS operation_quantity,
    hl.unit AS operation_unit,
    hl.plant_name AS operation_product_name,
    hl.notes AS operation_notes,
    NULL::text AS bed_id,
    NULL::text AS bed_row_id,
    NULL::text AS field_row_id,
    NULL::text AS zone_id,
    NULL::text AS plant_id,
    TRUE AS operation_success,
    'manual'::text AS actor_type,
    'manual'::text AS source_type,
    hl.created_at
  FROM public.harvest_logs hl
  JOIN public.gardens gardens ON gardens.id = hl.garden_id
),
queue_projection AS (
  SELECT
    ('queue_outcome:' || outcome.id::text) AS projection_id,
    'agronomic_queue_outcome'::text AS projection_source,
    outcome.user_id,
    outcome.garden_id,
    outcome.task_id,
    outcome.queue_item_id,
    decision.id AS decision_ledger_id,
    decision.source AS decision_source,
    decision.focus AS decision_focus,
    decision.agronomic_profile_id,
    decision.decision_snapshot,
    decision.created_at AS decision_created_at,
    decision.task_created_at,
    task.task_type AS planned_task_type,
    task.plant_name AS planned_plant_name,
    task.date AS planned_date,
    task.completed AS task_completed,
    task.completed_at AS task_completed_at,
    outcome.completed_at AS outcome_completed_at,
    outcome.task_type AS outcome_task_type,
    outcome.plant_name AS outcome_plant_name,
    outcome.success AS operation_success,
    outcome.evidence_status,
    outcome.execution_verified,
    outcome.measured_outcome_recorded,
    outcome.high_confidence_execution,
    outcome.operator_evidence_captured,
    outcome.last_evidence_at,
    outcome.execution_evidence_kind,
    outcome.execution_evidence_log_id,
    outcome.execution_evidence_date,
    outcome.execution_evidence_confidence,
    outcome.measurement_evidence_kind,
    outcome.measurement_evidence_record_id,
    outcome.measurement_evidence_recorded_at,
    outcome.agronomic_outcome_status,
    outcome.agronomic_outcome_matched_by,
    outcome.agronomic_outcome_recorded_at,
    outcome.execution_evidence,
    outcome.measurement_evidence,
    outcome.evidence_snapshot,
    outcome.operator_evidence,
    outcome.metadata AS outcome_metadata,
    COALESCE(outcome.zone_id::text, decision.zone_id::text, task.zone_id::text) AS zone_id,
    COALESCE(outcome.field_row_id::text, decision.field_row_id::text, task.bed_id::text, task.bed_row_id::text, task.field_row_id::text) AS field_row_id,
    COALESCE(outcome.tree_id::text, decision.tree_id::text) AS tree_id,
    COALESCE(outcome.plant_id::text, decision.plant_id::text) AS plant_id,
    outcome.actor_type AS outcome_actor_type,
    outcome.source_type AS outcome_source_type,
    NULL::text AS operation_source_table,
    NULL::text AS operation_source_id,
    outcome.execution_evidence_kind AS operation_kind,
    NULL::text AS operation_category,
    outcome.execution_evidence_date AS operation_date,
    outcome.execution_evidence_date::timestamptz AS operation_timestamp,
    NULL::numeric AS operation_quantity,
    NULL::text AS operation_unit,
    NULL::text AS operation_product_name,
    NULL::text AS operation_notes,
    CASE
      WHEN outcome.agronomic_outcome_status IN ('positive', 'mixed', 'negative') THEN TRUE
      ELSE FALSE
    END AS has_measured_result,
    CASE
      WHEN outcome.agronomic_outcome_status = 'positive' THEN 'beneficial'
      WHEN outcome.agronomic_outcome_status = 'negative' THEN 'harmful_or_ineffective'
      WHEN outcome.agronomic_outcome_status = 'mixed' THEN 'mixed'
      WHEN outcome.execution_verified THEN 'executed_no_measured_result'
      ELSE 'planned_or_completed_without_evidence'
    END AS result_class,
    outcome.created_at,
    outcome.updated_at
  FROM public.agronomic_queue_outcomes outcome
  LEFT JOIN public.agronomic_decision_ledger_entries decision
    ON decision.queue_item_id = outcome.queue_item_id
    AND decision.garden_id = outcome.garden_id
  LEFT JOIN public.garden_tasks task
    ON task.id = outcome.task_id
),
operation_projection AS (
  SELECT
    ('operation:' || operation_sources.operation_source_table || ':' || operation_sources.operation_source_id) AS projection_id,
    'operation_history'::text AS projection_source,
    operation_sources.user_id,
    operation_sources.garden_id,
    task.id AS task_id,
    decision.queue_item_id,
    decision.id AS decision_ledger_id,
    decision.source AS decision_source,
    decision.focus AS decision_focus,
    decision.agronomic_profile_id,
    decision.decision_snapshot,
    decision.created_at AS decision_created_at,
    decision.task_created_at,
    task.task_type AS planned_task_type,
    task.plant_name AS planned_plant_name,
    task.date AS planned_date,
    task.completed AS task_completed,
    task.completed_at AS task_completed_at,
    operation_sources.operation_timestamp AS outcome_completed_at,
    task.task_type AS outcome_task_type,
    COALESCE(task.plant_name, operation_sources.operation_product_name) AS outcome_plant_name,
    operation_sources.operation_success,
    CASE
      WHEN operation_sources.operation_kind = 'harvest' THEN 'measurement_only'
      ELSE 'execution_only'
    END AS evidence_status,
    operation_sources.operation_kind <> 'harvest' AS execution_verified,
    operation_sources.operation_kind = 'harvest' AS measured_outcome_recorded,
    operation_sources.source_task_id IS NOT NULL AS high_confidence_execution,
    TRUE AS operator_evidence_captured,
    operation_sources.operation_timestamp AS last_evidence_at,
    CASE WHEN operation_sources.operation_kind <> 'harvest' THEN operation_sources.operation_kind ELSE NULL END AS execution_evidence_kind,
    CASE WHEN operation_sources.operation_kind <> 'harvest' THEN operation_sources.operation_source_id ELSE NULL END AS execution_evidence_log_id,
    CASE WHEN operation_sources.operation_kind <> 'harvest' THEN operation_sources.operation_date ELSE NULL END AS execution_evidence_date,
    CASE
      WHEN operation_sources.operation_kind <> 'harvest' AND operation_sources.source_task_id IS NOT NULL THEN 'high'
      WHEN operation_sources.operation_kind <> 'harvest' THEN 'medium'
      ELSE NULL
    END AS execution_evidence_confidence,
    CASE WHEN operation_sources.operation_kind = 'harvest' THEN 'harvest' ELSE NULL END AS measurement_evidence_kind,
    CASE WHEN operation_sources.operation_kind = 'harvest' THEN operation_sources.operation_source_id ELSE NULL END AS measurement_evidence_record_id,
    CASE WHEN operation_sources.operation_kind = 'harvest' THEN operation_sources.operation_timestamp ELSE NULL END AS measurement_evidence_recorded_at,
    CASE WHEN operation_sources.operation_kind = 'harvest' THEN 'mixed' ELSE 'unknown' END AS agronomic_outcome_status,
    CASE WHEN operation_sources.source_task_id IS NOT NULL THEN 'task' ELSE 'none' END AS agronomic_outcome_matched_by,
    CASE WHEN operation_sources.operation_kind = 'harvest' THEN operation_sources.operation_timestamp ELSE NULL END AS agronomic_outcome_recorded_at,
    CASE
      WHEN operation_sources.operation_kind <> 'harvest' THEN jsonb_build_object(
        'kind', operation_sources.operation_kind,
        'logId', operation_sources.operation_source_id,
        'executionDate', operation_sources.operation_date,
        'confidence', CASE WHEN operation_sources.source_task_id IS NOT NULL THEN 'high' ELSE 'medium' END,
        'sourceTable', operation_sources.operation_source_table
      )
      ELSE NULL::jsonb
    END AS execution_evidence,
    CASE
      WHEN operation_sources.operation_kind = 'harvest' THEN jsonb_build_object(
        'kind', 'harvest',
        'recordId', operation_sources.operation_source_id,
        'recordedAt', operation_sources.operation_date,
        'sourceTable', operation_sources.operation_source_table
      )
      ELSE NULL::jsonb
    END AS measurement_evidence,
    jsonb_build_object(
      'sourceTable', operation_sources.operation_source_table,
      'sourceId', operation_sources.operation_source_id,
      'sourceTaskId', operation_sources.source_task_id,
      'operationKind', operation_sources.operation_kind,
      'operationCategory', operation_sources.operation_category
    ) AS evidence_snapshot,
    jsonb_build_object(
      'captured', TRUE,
      'notes', operation_sources.operation_notes
    ) AS operator_evidence,
    jsonb_build_object(
      'sourceTable', operation_sources.operation_source_table,
      'sourceId', operation_sources.operation_source_id
    ) AS outcome_metadata,
    COALESCE(operation_sources.zone_id, task.zone_id::text) AS zone_id,
    COALESCE(operation_sources.field_row_id, operation_sources.bed_row_id, task.field_row_id::text, task.bed_row_id::text, task.bed_id::text) AS field_row_id,
    NULL::text AS tree_id,
    operation_sources.plant_id,
    operation_sources.actor_type AS outcome_actor_type,
    operation_sources.source_type AS outcome_source_type,
    operation_sources.operation_source_table,
    operation_sources.operation_source_id,
    operation_sources.operation_kind,
    operation_sources.operation_category,
    operation_sources.operation_date,
    operation_sources.operation_timestamp,
    operation_sources.operation_quantity,
    operation_sources.operation_unit,
    operation_sources.operation_product_name,
    operation_sources.operation_notes,
    operation_sources.operation_kind = 'harvest' AS has_measured_result,
    CASE
      WHEN operation_sources.operation_kind = 'harvest' THEN 'measured_result_without_queue_decision'
      WHEN task.id IS NOT NULL THEN 'executed_from_task_without_queue_outcome'
      ELSE 'operation_without_measured_result'
    END AS result_class,
    operation_sources.created_at,
    operation_sources.created_at AS updated_at
  FROM operation_sources
  LEFT JOIN public.garden_tasks task
    ON task.id::text = operation_sources.source_task_id
    AND task.garden_id = operation_sources.garden_id
  LEFT JOIN public.agronomic_decision_ledger_entries decision
    ON decision.task_id = task.id
    AND decision.garden_id = operation_sources.garden_id
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.agronomic_queue_outcomes outcome
    WHERE outcome.garden_id = operation_sources.garden_id
      AND (
        (
          operation_sources.operation_kind <> 'harvest'
          AND outcome.execution_evidence_kind = operation_sources.operation_kind
          AND outcome.execution_evidence_log_id = operation_sources.operation_source_id
        )
        OR (
          operation_sources.operation_kind = 'harvest'
          AND outcome.measurement_evidence_kind = 'harvest'
          AND outcome.measurement_evidence_record_id = operation_sources.operation_source_id
        )
      )
  )
)
SELECT * FROM queue_projection
UNION ALL
SELECT * FROM operation_projection;

GRANT SELECT ON public.agronomic_operation_outcome_projection TO authenticated;

COMMENT ON VIEW public.agronomic_operation_outcome_projection
  IS 'Outcome-first projection over agronomic queue outcomes plus real operational histories, without creating a competing ledger table.';
