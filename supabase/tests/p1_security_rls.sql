-- Run after 20260717000000_p1_security_hardening.sql on an isolated staging DB.
-- The transaction always rolls back its two-user fixtures.

BEGIN;

INSERT INTO auth.users (
  id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at
) VALUES
  ('10000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'p1-user-a@example.invalid', '', now(), now(), now()),
  ('20000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'p1-user-b@example.invalid', '', now(), now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.gardens (id, user_id, name) VALUES
  ('10000000-0000-4000-8000-000000000011', '10000000-0000-4000-8000-000000000001', 'P1 Garden A'),
  ('20000000-0000-4000-8000-000000000022', '20000000-0000-4000-8000-000000000002', 'P1 Garden B')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.organizations (id, name, type, owner_id) VALUES
  ('10000000-0000-4000-8000-000000000101', 'P1 Organization A', 'Farm', '10000000-0000-4000-8000-000000000001'),
  ('20000000-0000-4000-8000-000000000202', 'P1 Organization B', 'Farm', '20000000-0000-4000-8000-000000000002')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.roles (organization_id, name)
SELECT o.id, 'Owner'
FROM public.organizations o
WHERE o.id IN (
  '10000000-0000-4000-8000-000000000101',
  '20000000-0000-4000-8000-000000000202'
)
ON CONFLICT (organization_id, name) DO NOTHING;

INSERT INTO public.organization_members (organization_id, user_id, role_id, status)
SELECT
  o.id,
  o.owner_id,
  r.id,
  'Active'
FROM public.organizations o
JOIN public.roles r ON r.organization_id = o.id AND r.name = 'Owner'
WHERE o.id IN (
  '10000000-0000-4000-8000-000000000101',
  '20000000-0000-4000-8000-000000000202'
)
ON CONFLICT (organization_id, user_id) DO NOTHING;

INSERT INTO public.agronomic_decision_ledger_entries (
  id, user_id, garden_id, queue_item_id, source, focus, status
) VALUES
  ('p1-ledger-a', '10000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000011', 'queue-a', 'p1-test', 'test', 'task_created'),
  ('p1-ledger-b', '20000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000022', 'queue-b', 'p1-test', 'test', 'task_created')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.agronomic_queue_outcomes (
  id, user_id, garden_id, queue_item_id, completed_at, task_type, plant_name
) VALUES
  ('p1-outcome-a', '10000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000011', 'queue-a', now(), 'test', 'test'),
  ('p1-outcome-b', '20000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000022', 'queue-b', now(), 'test', 'test')
ON CONFLICT (id) DO NOTHING;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);
SELECT set_config('request.jwt.claim.role', 'authenticated', true);

DO $test_user_a$
BEGIN
  IF (SELECT count(*) FROM public.agronomic_decision_ledger_entries WHERE id LIKE 'p1-ledger-%') <> 1 THEN
    RAISE EXCEPTION 'RLS failure: user A can read another user ledger or cannot read its own';
  END IF;
  IF (SELECT count(*) FROM public.agronomic_queue_outcomes WHERE id LIKE 'p1-outcome-%') <> 1 THEN
    RAISE EXCEPTION 'RLS failure: user A can read another user outcome or cannot read its own';
  END IF;
  IF (SELECT count(*) FROM public.organizations WHERE name LIKE 'P1 Organization %') <> 1 THEN
    RAISE EXCEPTION 'RLS failure: user A can read another organization or cannot read its own';
  END IF;

  BEGIN
    INSERT INTO public.agronomic_decision_ledger_entries (
      id, user_id, garden_id, queue_item_id, source, focus, status
    ) VALUES (
      'p1-cross-insert',
      '10000000-0000-4000-8000-000000000001',
      '20000000-0000-4000-8000-000000000022',
      'queue-cross', 'p1-test', 'test', 'task_created'
    );
    RAISE EXCEPTION 'RLS failure: cross-garden insert unexpectedly succeeded';
  EXCEPTION
    WHEN insufficient_privilege OR check_violation THEN NULL;
  END;
END
$test_user_a$;

RESET ROLE;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000002', true);

DO $test_user_b$
BEGIN
  IF (SELECT count(*) FROM public.agronomic_decision_ledger_entries WHERE id LIKE 'p1-ledger-%') <> 1 THEN
    RAISE EXCEPTION 'RLS failure: user B can read another user ledger or cannot read its own';
  END IF;
  IF (SELECT count(*) FROM public.agronomic_queue_outcomes WHERE id LIKE 'p1-outcome-%') <> 1 THEN
    RAISE EXCEPTION 'RLS failure: user B can read another user outcome or cannot read its own';
  END IF;
  IF (SELECT count(*) FROM public.organizations WHERE name LIKE 'P1 Organization %') <> 1 THEN
    RAISE EXCEPTION 'RLS failure: user B can read another organization or cannot read its own';
  END IF;
END
$test_user_b$;

RESET ROLE;

DO $test_catalog$
DECLARE
  view_name text;
BEGIN
  IF (SELECT count(*) FROM pg_policies WHERE schemaname = 'public' AND policyname IN (
    'agronomic_decision_ledger_owner_all',
    'agronomic_queue_outcomes_owner_all'
  )) <> 2 THEN
    RAISE EXCEPTION 'Catalog failure: P1 owner policies are missing';
  END IF;

  FOREACH view_name IN ARRAY ARRAY[
    'ai_suggestions_prioritized',
    'field_row_rotation_analysis',
    'crop_performance_by_family',
    'agronomic_operation_outcome_projection',
    'agronomic_operation_signal_projection',
    'agronomic_precision_execution_projection'
  ]
  LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public'
        AND c.relname = view_name
        AND 'security_invoker=true' = ANY (coalesce(c.reloptions, ARRAY[]::text[]))
    ) THEN
      RAISE EXCEPTION 'Catalog failure: %.% is not security_invoker', 'public', view_name;
    END IF;
  END LOOP;
END
$test_catalog$;

ROLLBACK;
