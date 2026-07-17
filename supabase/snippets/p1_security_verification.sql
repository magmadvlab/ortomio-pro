-- Read-only post-deploy verification for P1 security hardening.

SELECT c.relname AS view_name, c.reloptions
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN (
    'ai_suggestions_prioritized',
    'field_row_rotation_analysis',
    'crop_performance_by_family',
    'agronomic_operation_outcome_projection',
    'agronomic_operation_signal_projection',
    'agronomic_precision_execution_projection'
  )
ORDER BY c.relname;

SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'organizations',
    'roles',
    'organization_members',
    'organization_invitations',
    'garden_assignments',
    'agronomic_decision_ledger_entries',
    'agronomic_queue_outcomes'
  )
ORDER BY tablename, policyname;

SELECT
  n.nspname AS schema_name,
  p.proname,
  pg_get_function_identity_arguments(p.oid) AS arguments,
  p.prosecdef AS security_definer,
  p.proconfig,
  has_function_privilege('anon', p.oid, 'EXECUTE') AS anon_execute,
  has_function_privilege('authenticated', p.oid, 'EXECUTE') AS authenticated_execute
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname IN ('public', 'private')
  AND (
    p.prosecdef
    OR p.proname IN (
      'update_orchard_updated_at',
      'set_updated_at_timestamp',
      'get_field_row_history',
      'calculate_rotation_score',
      'get_rotation_suggestions',
      'sync_sensor_readings_timestamp_columns',
      'update_agronomic_ledger_updated_at',
      'generate_ggn_code',
      'generate_lot_code'
    )
  )
ORDER BY n.nspname, p.proname, arguments;
