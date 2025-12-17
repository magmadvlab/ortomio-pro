-- ============================================
-- Fix Login Schema Error
-- Corregge l'errore "Database error querying schema" durante il login
-- ============================================

-- Step 1: Corregge funzioni SECURITY DEFINER per evitare problemi durante il login
DO $$
BEGIN
  -- Solo se le funzioni esistono, imposta search_path
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'admin_grant_credits' AND pronamespace = 'public'::regnamespace) THEN
    ALTER FUNCTION admin_grant_credits(UUID, INTEGER) SET search_path = '';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'check_rotation_compliance' AND pronamespace = 'public'::regnamespace) THEN
    ALTER FUNCTION check_rotation_compliance(UUID, TEXT) SET search_path = '';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'calculate_harvest_stats' AND pronamespace = 'public'::regnamespace) THEN
    ALTER FUNCTION calculate_harvest_stats(UUID, DATE, DATE) SET search_path = '';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'create_superadmin' AND pronamespace = 'public'::regnamespace) THEN
    ALTER FUNCTION create_superadmin(TEXT, TEXT) SET search_path = '';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'set_user_tier' AND pronamespace = 'public'::regnamespace) THEN
    ALTER FUNCTION set_user_tier(UUID, TEXT) SET search_path = '';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'list_all_users' AND pronamespace = 'public'::regnamespace) THEN
    ALTER FUNCTION list_all_users() SET search_path = '';
  END IF;
END $$;

-- Step 2: Verifica che le funzioni siano corrette
SELECT 
  proname as function_name,
  CASE 
    WHEN proconfig IS NULL OR array_length(proconfig, 1) IS NULL THEN '❌ NO search_path'
    WHEN 'search_path=""' = ANY(proconfig) THEN '✅ OK'
    ELSE '⚠️  CHECK'
  END as status
FROM pg_proc 
WHERE pronamespace = 'public'::regnamespace
  AND prosecdef = true
ORDER BY proname;

-- Step 3: Verifica che il trigger funzioni correttamente
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgenabled as enabled
FROM pg_trigger
WHERE tgname = 'on_user_created_credits';

-- ============================================
-- COMPLETATO!
-- ============================================
-- Dopo aver applicato questo script, prova a fare login di nuovo.
-- Se il problema persiste, potrebbe essere necessario riavviare Supabase:
--   supabase stop && supabase start
-- ============================================

