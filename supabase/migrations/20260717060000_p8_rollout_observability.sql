-- P8: rollout server-side, telemetria release e rollback auditabile.

CREATE TABLE IF NOT EXISTS public.release_capability_rollouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_flag text NOT NULL,
  scope_type text NOT NULL CHECK (scope_type IN ('global', 'user')),
  scope_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled boolean NOT NULL DEFAULT false,
  stage text NOT NULL CHECK (stage IN ('off', 'shadow', 'pilot', 'production', 'rollback')),
  reason text NOT NULL,
  thresholds jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((scope_type = 'global' AND scope_id IS NULL) OR (scope_type = 'user' AND scope_id IS NOT NULL))
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_release_rollout_global ON public.release_capability_rollouts(feature_flag) WHERE scope_type='global';
CREATE UNIQUE INDEX IF NOT EXISTS uq_release_rollout_user ON public.release_capability_rollouts(feature_flag, scope_id) WHERE scope_type='user';
ALTER TABLE public.release_capability_rollouts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS release_rollouts_admin_read ON public.release_capability_rollouts;
CREATE POLICY release_rollouts_admin_read ON public.release_capability_rollouts FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND (p.role='admin' OR p.is_superadmin=true)));

CREATE TABLE IF NOT EXISTS public.release_observability_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain text NOT NULL,
  operation text NOT NULL,
  status text NOT NULL CHECK (status IN ('success', 'partial', 'failure', 'retry', 'dead_letter')),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  garden_id uuid REFERENCES public.gardens(id) ON DELETE CASCADE,
  trace_id text,
  latency_ms integer CHECK (latency_ms IS NULL OR latency_ms >= 0),
  retry_count integer NOT NULL DEFAULT 0 CHECK (retry_count >= 0),
  outcome_missing boolean NOT NULL DEFAULT false,
  error_code text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_release_observability_domain_time ON public.release_observability_events(domain, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_release_observability_failures ON public.release_observability_events(occurred_at DESC) WHERE status IN ('failure','dead_letter');
ALTER TABLE public.release_observability_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS release_observability_owner_read ON public.release_observability_events;
CREATE POLICY release_observability_owner_read ON public.release_observability_events FOR SELECT TO authenticated
USING (
  user_id=auth.uid()
  OR EXISTS (SELECT 1 FROM public.gardens g WHERE g.id=garden_id AND g.user_id=auth.uid())
  OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND (p.role='admin' OR p.is_superadmin=true))
);

CREATE TABLE IF NOT EXISTS public.release_rollout_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_flag text NOT NULL,
  previous_stage text,
  next_stage text NOT NULL,
  actor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  reason text NOT NULL,
  readiness_snapshot jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.release_rollout_audit ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS release_rollout_audit_admin_read ON public.release_rollout_audit;
CREATE POLICY release_rollout_audit_admin_read ON public.release_rollout_audit FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND (p.role='admin' OR p.is_superadmin=true)));

CREATE OR REPLACE FUNCTION public.prevent_release_audit_mutation()
RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN RAISE EXCEPTION USING ERRCODE='55000', MESSAGE='release_rollout_audit_is_append_only'; END;
$$;
DROP TRIGGER IF EXISTS release_rollout_audit_append_only ON public.release_rollout_audit;
CREATE TRIGGER release_rollout_audit_append_only BEFORE UPDATE OR DELETE ON public.release_rollout_audit
FOR EACH ROW EXECUTE FUNCTION public.prevent_release_audit_mutation();

CREATE OR REPLACE FUNCTION public.set_release_capability_rollout(
  p_feature_flag text, p_scope_type text, p_scope_id uuid, p_enabled boolean,
  p_stage text, p_reason text, p_thresholds jsonb, p_readiness_snapshot jsonb
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_id uuid; v_previous text;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND (p.role='admin' OR p.is_superadmin=true)) THEN
    RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='admin_required';
  END IF;
  IF p_scope_type NOT IN ('global','user') OR p_stage NOT IN ('off','shadow','pilot','production','rollback') THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='invalid_rollout_state';
  END IF;
  SELECT id, stage INTO v_id, v_previous FROM public.release_capability_rollouts
  WHERE feature_flag=p_feature_flag AND scope_type=p_scope_type AND scope_id IS NOT DISTINCT FROM p_scope_id FOR UPDATE;
  IF v_id IS NULL THEN
    INSERT INTO public.release_capability_rollouts(feature_flag,scope_type,scope_id,enabled,stage,reason,thresholds,updated_by)
    VALUES(p_feature_flag,p_scope_type,p_scope_id,p_enabled,p_stage,p_reason,COALESCE(p_thresholds,'{}'::jsonb),auth.uid()) RETURNING id INTO v_id;
  ELSE
    UPDATE public.release_capability_rollouts SET enabled=p_enabled,stage=p_stage,reason=p_reason,
      thresholds=COALESCE(p_thresholds,'{}'::jsonb),updated_by=auth.uid(),updated_at=now() WHERE id=v_id;
  END IF;
  INSERT INTO public.release_rollout_audit(feature_flag,previous_stage,next_stage,actor_id,reason,readiness_snapshot)
  VALUES(p_feature_flag,v_previous,p_stage,auth.uid(),p_reason,COALESCE(p_readiness_snapshot,'{}'::jsonb));
  RETURN v_id;
END;
$$;

REVOKE ALL ON public.release_capability_rollouts, public.release_rollout_audit FROM anon, authenticated;
REVOKE UPDATE, DELETE ON public.release_observability_events FROM anon, authenticated;
GRANT SELECT ON public.release_capability_rollouts, public.release_rollout_audit TO authenticated;
GRANT SELECT ON public.release_observability_events TO authenticated;
REVOKE ALL ON FUNCTION public.set_release_capability_rollout(text,text,uuid,boolean,text,text,jsonb,jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_release_capability_rollout(text,text,uuid,boolean,text,text,jsonb,jsonb) TO authenticated;
