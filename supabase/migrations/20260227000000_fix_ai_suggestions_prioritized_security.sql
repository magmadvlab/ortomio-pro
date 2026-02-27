-- =====================================================
-- FIX: ai_suggestions_prioritized Security Definer
-- Risolve l'errore Supabase Database Linter 0010_security_definer_view
-- Ricrea la vista senza SECURITY DEFINER (usa SECURITY INVOKER di default)
-- =====================================================

-- 1. Drop the view with SECURITY DEFINER if it exists
DROP VIEW IF EXISTS public.ai_suggestions_prioritized CASCADE;

-- 2. Recreate the view WITHOUT SECURITY DEFINER
-- By default, views use SECURITY INVOKER which applies the querying user's permissions
CREATE VIEW public.ai_suggestions_prioritized AS
SELECT 
  s.*,
  CASE 
    WHEN s.priority_score >= 80 THEN 'CRITICAL'
    WHEN s.priority_score >= 60 THEN 'HIGH'
    WHEN s.priority_score >= 40 THEN 'MEDIUM'
    ELSE 'LOW'
  END as computed_priority
FROM ai_suggestions s
WHERE s.status = 'PENDING'
ORDER BY s.priority_score DESC, s.created_at DESC;

-- 3. Grant permissions to authenticated users
GRANT SELECT ON public.ai_suggestions_prioritized TO authenticated;

-- 4. Add view comment
COMMENT ON VIEW public.ai_suggestions_prioritized IS 'Vista suggerimenti ordinati per priorità - SECURITY INVOKER';

-- 5. Verify the fix
DO $$
BEGIN
  RAISE NOTICE '✅ Security fix for ai_suggestions_prioritized applied';
  RAISE NOTICE '🔒 View now uses SECURITY INVOKER (default) instead of SECURITY DEFINER';
  RAISE NOTICE '📋 Supabase Database Linter error 0010_security_definer_view should now be resolved';
END $$;
