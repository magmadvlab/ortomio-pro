SET ROLE authenticated;
SET request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001';

INSERT INTO public.agronomic_predictions (
  user_id, garden_id, idempotency_key, status, input_hash, input_snapshot,
  model_version, rule_version, source_quality, confidence, horizon_days,
  valid_from, valid_until
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  'prediction-key-1', 'generated', repeat('a', 64), '{"source":"persisted"}',
  'model-v1', 'rules-v1', 'measured', 0.8, 15, now(), now() + interval '15 days'
);

DO $$ BEGIN
  BEGIN
    INSERT INTO public.agronomic_predictions (
      user_id, garden_id, idempotency_key, status, input_hash, input_snapshot,
      model_version, rule_version, source_quality, horizon_days, valid_from, valid_until
    ) VALUES (
      '00000000-0000-0000-0000-000000000001',
      '10000000-0000-0000-0000-000000000001',
      'prediction-key-duplicate', 'generated', repeat('a', 64), '{}',
      'model-v1', 'rules-v1', 'measured', 15, now(), now() + interval '15 days'
    );
    RAISE EXCEPTION 'duplicate reproducibility key was accepted';
  EXCEPTION WHEN unique_violation THEN NULL;
  END;
END $$;

DO $$ BEGIN
  BEGIN
    INSERT INTO public.agronomic_predictions (
      user_id, garden_id, idempotency_key, status, input_hash, input_snapshot,
      model_version, rule_version, source_quality, horizon_days, valid_from, valid_until
    ) VALUES (
      '00000000-0000-0000-0000-000000000001',
      '10000000-0000-0000-0000-000000000002',
      'foreign-garden', 'generated', repeat('b', 64), '{}',
      'model-v1', 'rules-v1', 'measured', 15, now(), now() + interval '15 days'
    );
    RAISE EXCEPTION 'foreign garden prediction was accepted';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END $$;

RESET ROLE;

INSERT INTO public.monitoring_runs (
  garden_id, user_id, idempotency_key, status, checked_at
) VALUES (
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'garden-a:2026-07-17:0', 'completed', now()
);
DO $$ BEGIN
  BEGIN
    INSERT INTO public.monitoring_runs (
      garden_id, user_id, idempotency_key, status, checked_at
    ) VALUES (
      '10000000-0000-0000-0000-000000000001',
      '00000000-0000-0000-0000-000000000001',
      'garden-a:2026-07-17:0', 'completed', now()
    );
    RAISE EXCEPTION 'duplicate monitoring run was accepted';
  EXCEPTION WHEN unique_violation THEN NULL;
  END;
END $$;

INSERT INTO public.health_alerts (
  garden_id, alert_type, severity, source, title, message, fingerprint
) VALUES (
  '10000000-0000-0000-0000-000000000001',
  'weather', 'warning', 'weather_api', 'Test', 'Test', 'fingerprint-1'
);
DO $$ BEGIN
  BEGIN
    INSERT INTO public.health_alerts (
      garden_id, alert_type, severity, source, title, message, fingerprint
    ) VALUES (
      '10000000-0000-0000-0000-000000000001',
      'weather', 'warning', 'weather_api', 'Test duplicate', 'Test', 'fingerprint-1'
    );
    RAISE EXCEPTION 'duplicate open health alert was accepted';
  EXCEPTION WHEN unique_violation THEN NULL;
  END;
END $$;

INSERT INTO public.garden_tasks (garden_id, monitoring_source_key)
VALUES ('10000000-0000-0000-0000-000000000001', 'monitoring:fingerprint-1');
DO $$ BEGIN
  BEGIN
    INSERT INTO public.garden_tasks (garden_id, monitoring_source_key)
    VALUES ('10000000-0000-0000-0000-000000000001', 'monitoring:fingerprint-1');
    RAISE EXCEPTION 'duplicate open monitoring task was accepted';
  EXCEPTION WHEN unique_violation THEN NULL;
  END;
END $$;

SELECT 'P5 SQL assertions passed' AS result;
