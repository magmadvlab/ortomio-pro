-- =====================================================
-- SCRIPT 1: Fix ai_suggestions_prioritized (0010_security_definer_view)
-- Esegui questo direttamente nell'editor SQL di Supabase
-- =====================================================

-- Drop the view with SECURITY DEFINER if it exists
DROP VIEW IF EXISTS public.ai_suggestions_prioritized CASCADE;

-- Recreate the view WITHOUT SECURITY DEFINER
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

-- Grant permissions
GRANT SELECT ON public.ai_suggestions_prioritized TO authenticated;

-- Add comment
COMMENT ON VIEW public.ai_suggestions_prioritized IS 'Vista suggerimenti ordinati per priorità - SECURITY INVOKER';

SELECT 'SUCCESS: ai_suggestions_prioritized fixed ✅' as result;
