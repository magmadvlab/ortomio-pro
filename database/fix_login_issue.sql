-- ============================================
-- Fix Login Issue - Corregge funzioni SECURITY DEFINER
-- Applica questo script se hai problemi di login con errore "Database error querying schema"
-- ============================================

-- Aggiorna tutte le funzioni con SECURITY DEFINER per aggiungere SET search_path = ''
-- Questo risolve gli issues di sicurezza che possono causare problemi durante il login

-- Admin functions
ALTER FUNCTION IF EXISTS admin_grant_credits(UUID, INTEGER) SET search_path = '';
ALTER FUNCTION IF EXISTS create_superadmin(TEXT, TEXT) SET search_path = '';
ALTER FUNCTION IF EXISTS set_user_tier(UUID, TEXT) SET search_path = '';
ALTER FUNCTION IF EXISTS list_all_users() SET search_path = '';

-- Business logic functions
ALTER FUNCTION IF EXISTS check_rotation_compliance(UUID, TEXT) SET search_path = '';
ALTER FUNCTION IF EXISTS calculate_harvest_stats(UUID, DATE, DATE) SET search_path = '';

-- Verifica che le funzioni siano state aggiornate correttamente
SELECT 
  proname as function_name,
  CASE 
    WHEN proconfig IS NULL OR array_length(proconfig, 1) IS NULL THEN '❌ NO search_path'
    WHEN 'search_path=""' = ANY(proconfig) THEN '✅ OK'
    ELSE '⚠️  CHECK'
  END as status,
  proconfig
FROM pg_proc 
WHERE pronamespace = 'public'::regnamespace
  AND prosecdef = true  -- Solo funzioni SECURITY DEFINER
  AND proname IN (
    'admin_grant_credits',
    'create_superadmin', 
    'set_user_tier',
    'list_all_users',
    'check_rotation_compliance',
    'calculate_harvest_stats'
  )
ORDER BY proname;

-- ============================================
-- COMPLETATO!
-- ============================================
-- Dopo aver applicato questo script, prova a fare login di nuovo.
-- Se il problema persiste, potrebbe essere necessario riavviare Supabase:
--   supabase stop && supabase start
-- ============================================

