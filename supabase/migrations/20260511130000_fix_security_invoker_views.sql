-- Fix Supabase linter security_definer_view findings.
-- These views only need invoker semantics so RLS is evaluated for the caller.

ALTER VIEW public.ai_suggestions_prioritized SET (security_invoker = true);
ALTER VIEW public.crop_performance_by_family SET (security_invoker = true);
ALTER VIEW public.agronomic_precision_execution_projection SET (security_invoker = true);
ALTER VIEW public.agronomic_operation_outcome_projection SET (security_invoker = true);
ALTER VIEW public.field_row_rotation_analysis SET (security_invoker = true);
ALTER VIEW public.agronomic_operation_signal_projection SET (security_invoker = true);

COMMENT ON VIEW public.ai_suggestions_prioritized IS 'Vista suggerimenti ordinati per priorità - SECURITY INVOKER';
COMMENT ON VIEW public.crop_performance_by_family IS 'Vista performance colture per famiglia - SECURITY INVOKER';
COMMENT ON VIEW public.agronomic_precision_execution_projection IS 'Virtual projection for prescription map field execution records persisted in variable_rate_applications.';
COMMENT ON VIEW public.agronomic_operation_outcome_projection IS 'Canonical projection for decision -> task/operation -> evidence -> measured agronomic outcome.';
COMMENT ON VIEW public.field_row_rotation_analysis IS 'Vista analisi rotazione filare - SECURITY INVOKER';
COMMENT ON VIEW public.agronomic_operation_signal_projection IS 'Canonical projection for specialized agronomic operation and signal histories.';
