-- Backfill queryable evidence columns from existing JSON snapshots.
-- Safe to rerun: only fills missing derived fields and preserves existing explicit values.

UPDATE public.agronomic_queue_outcomes
SET
  evidence_status = COALESCE(
    evidence_status,
    NULLIF(evidence_snapshot->>'status', '')
  ),
  execution_verified = CASE
    WHEN evidence_snapshot ? 'executionVerified'
      THEN (evidence_snapshot->>'executionVerified')::boolean
    ELSE execution_verified
  END,
  measured_outcome_recorded = CASE
    WHEN evidence_snapshot ? 'measuredOutcomeRecorded'
      THEN (evidence_snapshot->>'measuredOutcomeRecorded')::boolean
    ELSE measured_outcome_recorded
  END,
  high_confidence_execution = CASE
    WHEN evidence_snapshot ? 'highConfidenceExecution'
      THEN (evidence_snapshot->>'highConfidenceExecution')::boolean
    ELSE high_confidence_execution
  END,
  operator_evidence_captured = CASE
    WHEN evidence_snapshot ? 'operatorEvidenceCaptured'
      THEN (evidence_snapshot->>'operatorEvidenceCaptured')::boolean
    ELSE operator_evidence_captured
  END,
  last_evidence_at = COALESCE(
    last_evidence_at,
    NULLIF(evidence_snapshot->>'lastEvidenceAt', '')::timestamptz
  ),
  execution_evidence_kind = COALESCE(
    execution_evidence_kind,
    NULLIF(execution_evidence->>'kind', '')
  ),
  execution_evidence_log_id = COALESCE(
    execution_evidence_log_id,
    NULLIF(execution_evidence->>'logId', '')
  ),
  execution_evidence_date = COALESCE(
    execution_evidence_date,
    NULLIF(execution_evidence->>'executionDate', '')::date
  ),
  execution_evidence_confidence = COALESCE(
    execution_evidence_confidence,
    NULLIF(execution_evidence->>'confidence', '')
  ),
  measurement_evidence_kind = COALESCE(
    measurement_evidence_kind,
    NULLIF(measurement_evidence->>'kind', '')
  ),
  measurement_evidence_record_id = COALESCE(
    measurement_evidence_record_id,
    NULLIF(measurement_evidence->>'recordId', '')
  ),
  measurement_evidence_recorded_at = COALESCE(
    measurement_evidence_recorded_at,
    NULLIF(measurement_evidence->>'recordedAt', '')::date
  ),
  agronomic_outcome_status = COALESCE(
    agronomic_outcome_status,
    NULLIF(evidence_snapshot->'agronomicOutcome'->>'status', '')
  ),
  agronomic_outcome_matched_by = COALESCE(
    agronomic_outcome_matched_by,
    NULLIF(evidence_snapshot->'agronomicOutcome'->>'matchedBy', '')
  ),
  agronomic_outcome_recorded_at = COALESCE(
    agronomic_outcome_recorded_at,
    NULLIF(evidence_snapshot->'agronomicOutcome'->>'recordedAt', '')::timestamptz
  )
WHERE
  evidence_snapshot IS NOT NULL
  OR execution_evidence IS NOT NULL
  OR measurement_evidence IS NOT NULL;
