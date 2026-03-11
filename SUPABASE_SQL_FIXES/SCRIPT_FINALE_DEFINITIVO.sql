-- =====================================================
-- SUPABASE DATABASE LINTER FIXES - SCRIPT FINALE DEFINITIVO
-- Usa ALTER FUNCTION invece di ricreare le funzioni:
-- - Nessun errore di tipo di ritorno
-- - Nessuna firma da conoscere
-- - Funziona su tutte le funzioni in una volta
-- =====================================================

-- ========== FIX #1: ai_suggestions_prioritized (0010_security_definer_view) ==========
DROP VIEW IF EXISTS public.ai_suggestions_prioritized CASCADE;

CREATE VIEW public.ai_suggestions_prioritized WITH (security_invoker = true) AS
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

GRANT SELECT ON public.ai_suggestions_prioritized TO authenticated;
COMMENT ON VIEW public.ai_suggestions_prioritized IS 'Vista suggerimenti ordinati per priorità - SECURITY INVOKER';

-- ========== FIX #2: weather_cache RLS (0024_permissive_rls_policy) ==========
DROP POLICY IF EXISTS "Users can insert weather cache" ON public.weather_cache;
DROP POLICY IF EXISTS "Users can insert weather cache - authenticated" ON public.weather_cache;
DROP POLICY IF EXISTS "Users can insert weather cache - secure" ON public.weather_cache;

CREATE POLICY "Users can insert weather cache - secure"
  ON public.weather_cache
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ========== FIX #3: pg_trgm extension (0014_extension_in_public) ==========
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'extensions') THEN
    CREATE SCHEMA extensions;
  END IF;
END $$;

ALTER EXTENSION pg_trgm SET SCHEMA extensions;

-- ========== FIX #4: Tutte le funzioni - SET search_path con ALTER FUNCTION ==========
-- Questo approccio non richiede di conoscere le firme e non modifica il tipo di ritorno

DO $$
DECLARE
  func_rec RECORD;
  v_sql    TEXT;
  v_fixed  INTEGER := 0;
  v_failed INTEGER := 0;
BEGIN
  FOR func_rec IN
    SELECT
      p.oid,
      p.proname,
      pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prokind IN ('f', 'p')  -- regular functions and procedures
    ORDER BY p.proname
  LOOP
    BEGIN
      v_sql := format(
        'ALTER FUNCTION public.%I(%s) SET search_path = public',
        func_rec.proname,
        func_rec.args
      );
      EXECUTE v_sql;
      v_fixed := v_fixed + 1;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Skipped %(%): %', func_rec.proname, func_rec.args, SQLERRM;
      v_failed := v_failed + 1;
    END;
  END LOOP;

  RAISE NOTICE '✅ search_path fissato su % funzioni', v_fixed;
  RAISE NOTICE '⚠️  % funzioni saltate (vedi WARNING sopra)', v_failed;
END $$;

-- ========== VERIFICA FINALE ==========
SELECT
  '✅ SCRIPT COMPLETATO!' AS status,
  (SELECT COUNT(*) FROM information_schema.routines
   WHERE routine_schema = 'public' AND routine_type = 'FUNCTION') AS total_functions,
  (SELECT COUNT(*) FROM information_schema.views
   WHERE table_schema = 'public') AS total_views,
  (SELECT extnamespace::regnamespace::text FROM pg_extension
   WHERE extname = 'pg_trgm') AS pg_trgm_schema;
