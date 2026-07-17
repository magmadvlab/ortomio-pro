-- P5: previsioni riproducibili, alert deduplicati e monitoraggio durevole.

CREATE TABLE IF NOT EXISTS public.agronomic_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  garden_id uuid NOT NULL REFERENCES public.gardens(id) ON DELETE CASCADE,
  idempotency_key text NOT NULL,
  prediction_type text NOT NULL DEFAULT 'garden_bundle'
    CHECK (prediction_type IN ('garden_bundle', 'disease', 'yield', 'resource')),
  status text NOT NULL CHECK (status IN ('generated', 'insufficient_data', 'failed')),
  input_hash text NOT NULL CHECK (char_length(input_hash) = 64),
  input_snapshot jsonb NOT NULL,
  output_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  missing_signals text[] NOT NULL DEFAULT '{}',
  model_version text NOT NULL,
  rule_version text NOT NULL,
  source_quality text NOT NULL CHECK (source_quality IN ('measured', 'mixed', 'estimated', 'insufficient')),
  confidence numeric(5,4) CHECK (confidence BETWEEN 0 AND 1),
  horizon_days integer NOT NULL CHECK (horizon_days BETWEEN 1 AND 365),
  valid_from timestamptz NOT NULL,
  valid_until timestamptz NOT NULL,
  calibration_score numeric(5,4) CHECK (calibration_score BETWEEN 0 AND 1),
  outcome_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (garden_id, input_hash, model_version, rule_version)
);
CREATE INDEX IF NOT EXISTS idx_agronomic_predictions_garden_created
  ON public.agronomic_predictions (garden_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.agronomic_prediction_outcomes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prediction_id uuid NOT NULL REFERENCES public.agronomic_predictions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  garden_id uuid NOT NULL REFERENCES public.gardens(id) ON DELETE CASCADE,
  outcome_type text NOT NULL CHECK (outcome_type IN ('yield', 'disease', 'resource', 'other')),
  idempotency_key text NOT NULL,
  observed_at timestamptz NOT NULL,
  observed_value jsonb NOT NULL,
  predicted_value jsonb NOT NULL,
  absolute_error numeric,
  percentage_error numeric,
  brier_score numeric,
  calibration_score numeric(5,4) CHECK (calibration_score BETWEEN 0 AND 1),
  evidence_source text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (prediction_id, idempotency_key)
);
CREATE INDEX IF NOT EXISTS idx_prediction_outcomes_prediction
  ON public.agronomic_prediction_outcomes (prediction_id, observed_at DESC);

CREATE TABLE IF NOT EXISTS public.monitoring_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  garden_id uuid NOT NULL REFERENCES public.gardens(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  idempotency_key text NOT NULL,
  status text NOT NULL CHECK (status IN ('running', 'completed', 'partial', 'failed')),
  checked_at timestamptz NOT NULL,
  completed_at timestamptz,
  input_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  result_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (garden_id, idempotency_key)
);

CREATE TABLE IF NOT EXISTS public.monitoring_error_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid REFERENCES public.monitoring_runs(id) ON DELETE SET NULL,
  garden_id uuid REFERENCES public.gardens(id) ON DELETE CASCADE,
  stage text NOT NULL,
  error_code text NOT NULL,
  error_message text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  attempts integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'retrying', 'resolved', 'dead_letter')),
  next_retry_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.health_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  garden_id uuid NOT NULL REFERENCES public.gardens(id) ON DELETE CASCADE,
  plant_id text,
  alert_type text NOT NULL CHECK (alert_type IN ('weather', 'water', 'disease', 'pest', 'nutrient')),
  severity text NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  source text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  recommendation text,
  resolved boolean NOT NULL DEFAULT false,
  resolved_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.health_alerts
  ADD COLUMN IF NOT EXISTS fingerprint text,
  ADD COLUMN IF NOT EXISTS source_kind text DEFAULT 'predicted'
    CHECK (source_kind IN ('observed', 'predicted', 'simulated')),
  ADD COLUMN IF NOT EXISTS rule_id text,
  ADD COLUMN IF NOT EXISTS rule_version text,
  ADD COLUMN IF NOT EXISTS confidence numeric(5,4) CHECK (confidence BETWEEN 0 AND 1),
  ADD COLUMN IF NOT EXISTS input_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS freshness_hours numeric,
  ADD COLUMN IF NOT EXISTS contraindications text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS first_seen_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS last_seen_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS occurrence_count integer NOT NULL DEFAULT 1;
CREATE UNIQUE INDEX IF NOT EXISTS uq_health_alerts_open_fingerprint
  ON public.health_alerts (garden_id, fingerprint) WHERE resolved = false AND fingerprint IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.monitoring_notification_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id uuid NOT NULL REFERENCES public.health_alerts(id) ON DELETE CASCADE,
  garden_id uuid NOT NULL REFERENCES public.gardens(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel text NOT NULL CHECK (channel IN ('email', 'push')),
  status text NOT NULL CHECK (status IN ('queued', 'suppressed', 'sent', 'failed')),
  suppression_reason text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (alert_id, channel)
);

ALTER TABLE public.garden_tasks ADD COLUMN IF NOT EXISTS monitoring_source_key text;
CREATE UNIQUE INDEX IF NOT EXISTS uq_garden_tasks_open_monitoring_source
  ON public.garden_tasks (garden_id, monitoring_source_key)
  WHERE completed = false AND monitoring_source_key IS NOT NULL;

CREATE OR REPLACE FUNCTION public.p5_touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
DROP TRIGGER IF EXISTS trg_agronomic_predictions_updated_at ON public.agronomic_predictions;
CREATE TRIGGER trg_agronomic_predictions_updated_at BEFORE UPDATE ON public.agronomic_predictions
FOR EACH ROW EXECUTE FUNCTION public.p5_touch_updated_at();
DROP TRIGGER IF EXISTS trg_monitoring_error_queue_updated_at ON public.monitoring_error_queue;
CREATE TRIGGER trg_monitoring_error_queue_updated_at BEFORE UPDATE ON public.monitoring_error_queue
FOR EACH ROW EXECUTE FUNCTION public.p5_touch_updated_at();

ALTER TABLE public.agronomic_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agronomic_prediction_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitoring_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitoring_error_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitoring_notification_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS agronomic_predictions_owner ON public.agronomic_predictions;
CREATE POLICY agronomic_predictions_owner ON public.agronomic_predictions FOR ALL TO authenticated
USING (
  user_id = auth.uid()
  AND EXISTS (SELECT 1 FROM public.gardens g WHERE g.id = garden_id AND g.user_id = auth.uid())
)
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (SELECT 1 FROM public.gardens g WHERE g.id = garden_id AND g.user_id = auth.uid())
);
DROP POLICY IF EXISTS agronomic_prediction_outcomes_owner ON public.agronomic_prediction_outcomes;
CREATE POLICY agronomic_prediction_outcomes_owner ON public.agronomic_prediction_outcomes FOR ALL TO authenticated
USING (
  user_id = auth.uid()
  AND EXISTS (SELECT 1 FROM public.gardens g WHERE g.id = garden_id AND g.user_id = auth.uid())
)
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (SELECT 1 FROM public.gardens g WHERE g.id = garden_id AND g.user_id = auth.uid())
);
DROP POLICY IF EXISTS monitoring_runs_owner ON public.monitoring_runs;
CREATE POLICY monitoring_runs_owner ON public.monitoring_runs FOR SELECT TO authenticated
USING (user_id = auth.uid());
DROP POLICY IF EXISTS monitoring_errors_owner ON public.monitoring_error_queue;
CREATE POLICY monitoring_errors_owner ON public.monitoring_error_queue FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.gardens g WHERE g.id = garden_id AND g.user_id = auth.uid()));
DROP POLICY IF EXISTS health_alerts_owner ON public.health_alerts;
CREATE POLICY health_alerts_owner ON public.health_alerts FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.gardens g WHERE g.id = garden_id AND g.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.gardens g WHERE g.id = garden_id AND g.user_id = auth.uid()));
DROP POLICY IF EXISTS monitoring_notifications_owner ON public.monitoring_notification_queue;
CREATE POLICY monitoring_notifications_owner ON public.monitoring_notification_queue FOR SELECT TO authenticated
USING (user_id = auth.uid());

GRANT SELECT, INSERT, UPDATE ON public.agronomic_predictions, public.agronomic_prediction_outcomes TO authenticated;
GRANT SELECT ON public.monitoring_runs, public.monitoring_error_queue TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.health_alerts TO authenticated;
GRANT SELECT ON public.monitoring_notification_queue TO authenticated;
