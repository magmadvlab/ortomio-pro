SET ROLE authenticated;
SET request.jwt.claim.sub='00000000-0000-0000-0000-000000000001';
SELECT set_release_capability_rollout('AI_PREDICTIONS','global',NULL,false,'shadow','P8 test','{"failureRate":1}'::jsonb,'{"ready":false}'::jsonb);
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM release_capability_rollouts WHERE feature_flag='AI_PREDICTIONS' AND stage='shadow' AND enabled=false) THEN
    RAISE EXCEPTION 'rollout not persisted';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM release_rollout_audit WHERE feature_flag='AI_PREDICTIONS' AND next_stage='shadow') THEN
    RAISE EXCEPTION 'rollout audit missing';
  END IF;
END $$;
DO $$ BEGIN
  BEGIN
    UPDATE release_rollout_audit SET reason='changed';
    RAISE EXCEPTION 'release audit mutated';
  EXCEPTION WHEN insufficient_privilege OR object_not_in_prerequisite_state THEN NULL;
  END;
END $$;
SET request.jwt.claim.sub='00000000-0000-0000-0000-000000000002';
DO $$ BEGIN
  BEGIN
    PERFORM set_release_capability_rollout('AI_PREDICTIONS','user','00000000-0000-0000-0000-000000000002',true,'pilot','unauthorized','{}','{}');
    RAISE EXCEPTION 'non-admin changed rollout';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END $$;
RESET ROLE;
SELECT 'P8 SQL assertions passed' AS result;
