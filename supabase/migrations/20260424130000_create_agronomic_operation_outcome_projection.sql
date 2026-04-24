-- Canonical decision -> operation -> outcome projection.
-- This first projection is centered on agronomic queue outcomes because they already
-- connect decision snapshots, suggested tasks, execution evidence and measured outcomes.

DROP VIEW IF EXISTS public.agronomic_operation_outcome_projection;

CREATE OR REPLACE VIEW public.agronomic_operation_outcome_projection AS
SELECT
  outcome.id AS projection_id,
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
  COALESCE(outcome.field_row_id::text, decision.field_row_id::text, task.bed_id::text) AS field_row_id,
  COALESCE(outcome.tree_id::text, decision.tree_id::text) AS tree_id,
  COALESCE(outcome.plant_id::text, decision.plant_id::text) AS plant_id,
  outcome.actor_type AS outcome_actor_type,
  outcome.source_type AS outcome_source_type,
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
  ON task.id = outcome.task_id;

GRANT SELECT ON public.agronomic_operation_outcome_projection TO authenticated;

COMMENT ON VIEW public.agronomic_operation_outcome_projection
  IS 'Canonical projection for decision -> task/operation -> evidence -> measured agronomic outcome.';
