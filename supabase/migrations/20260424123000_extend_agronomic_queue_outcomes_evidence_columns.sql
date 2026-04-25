-- Queryable evidence columns for agronomic queue outcomes.
-- JSON snapshots stay canonical for full detail; these columns make audit and analytics efficient.

ALTER TABLE public.agronomic_queue_outcomes
  ADD COLUMN IF NOT EXISTS evidence_status TEXT
    CHECK (evidence_status IN ('pending', 'completed_unverified', 'execution_verified', 'outcome_measured')),
  ADD COLUMN IF NOT EXISTS execution_verified BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS measured_outcome_recorded BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS high_confidence_execution BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS operator_evidence_captured BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS last_evidence_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS execution_evidence_kind TEXT
    CHECK (execution_evidence_kind IN ('watering', 'fertilization', 'treatment', 'mechanical_work')),
  ADD COLUMN IF NOT EXISTS execution_evidence_log_id TEXT,
  ADD COLUMN IF NOT EXISTS execution_evidence_date DATE,
  ADD COLUMN IF NOT EXISTS execution_evidence_confidence TEXT
    CHECK (execution_evidence_confidence IN ('high', 'medium')),
  ADD COLUMN IF NOT EXISTS measurement_evidence_kind TEXT
    CHECK (measurement_evidence_kind IN ('harvest')),
  ADD COLUMN IF NOT EXISTS measurement_evidence_record_id TEXT,
  ADD COLUMN IF NOT EXISTS measurement_evidence_recorded_at DATE,
  ADD COLUMN IF NOT EXISTS agronomic_outcome_status TEXT
    CHECK (agronomic_outcome_status IN ('positive', 'mixed', 'negative', 'unknown')),
  ADD COLUMN IF NOT EXISTS agronomic_outcome_matched_by TEXT
    CHECK (agronomic_outcome_matched_by IN ('task', 'plant', 'focus', 'none')),
  ADD COLUMN IF NOT EXISTS agronomic_outcome_recorded_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_agronomic_queue_outcomes_evidence_status
  ON public.agronomic_queue_outcomes(garden_id, evidence_status, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_agronomic_queue_outcomes_execution_evidence
  ON public.agronomic_queue_outcomes(execution_evidence_kind, execution_evidence_log_id);
CREATE INDEX IF NOT EXISTS idx_agronomic_queue_outcomes_measurement_evidence
  ON public.agronomic_queue_outcomes(measurement_evidence_kind, measurement_evidence_record_id);
CREATE INDEX IF NOT EXISTS idx_agronomic_queue_outcomes_agronomic_status
  ON public.agronomic_queue_outcomes(garden_id, agronomic_outcome_status, completed_at DESC);

COMMENT ON COLUMN public.agronomic_queue_outcomes.evidence_status
  IS 'Queryable status derived from execution evidence, measurement evidence and measured agronomic outcome.';
COMMENT ON COLUMN public.agronomic_queue_outcomes.execution_evidence_log_id
  IS 'Source operation log id matched to the task execution evidence.';
COMMENT ON COLUMN public.agronomic_queue_outcomes.measurement_evidence_record_id
  IS 'Source measurement/outcome record id matched to the completed task.';
