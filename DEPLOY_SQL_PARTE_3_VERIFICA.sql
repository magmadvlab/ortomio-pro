-- ============================================
-- ORTOMIO DATABASE - PARTE 3: VERIFICA
-- Esegui questo SQL su Supabase.com SQL Editor DOPO Parte 1 e 2
-- ============================================

-- IMPORTANTE: Questo script VERIFICA che tutto sia configurato correttamente
-- Eseguilo e controlla i risultati

-- ============================================
-- 1. VERIFICA TABELLE PRINCIPALI
-- ============================================

SELECT
  'Tabelle principali' as check_name,
  COUNT(*) as count_found,
  8 as count_expected,
  CASE WHEN COUNT(*) = 8 THEN '✅ OK' ELSE '❌ MANCANTI' END as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'profiles',
  'gardens',
  'garden_beds',
  'garden_zones',
  'calendar_tasks',
  'seed_inventory',
  'ai_credit_transactions',
  'custom_crops'
);

-- ============================================
-- 2. VERIFICA COLONNA PREFERENCES
-- ============================================

SELECT
  'Colonna preferences in profiles' as check_name,
  COUNT(*) as count_found,
  1 as count_expected,
  CASE WHEN COUNT(*) = 1 THEN '✅ OK' ELSE '❌ MANCANTE' END as status
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'profiles'
AND column_name = 'preferences'
AND data_type = 'jsonb';

-- ============================================
-- 3. VERIFICA TRIGGER
-- ============================================

SELECT
  'Trigger on_auth_user_created' as check_name,
  COUNT(*) as count_found,
  1 as count_expected,
  CASE WHEN COUNT(*) = 1 THEN '✅ OK' ELSE '❌ MANCANTE' END as status
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
AND event_object_table = 'users'
AND trigger_name = 'on_auth_user_created';

-- ============================================
-- 4. VERIFICA FUNZIONI CON SECURITY DEFINER
-- ============================================

SELECT
  'Funzioni con SECURITY DEFINER' as check_name,
  COUNT(*) as count_found,
  3 as count_expected,
  CASE WHEN COUNT(*) >= 3 THEN '✅ OK' ELSE '❌ MANCANTI' END as status
FROM pg_proc
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND proname IN ('grant_credits', 'handle_new_user', 'handle_new_user_credits')
AND prosecdef = true;

-- Lista funzioni trovate
SELECT
  proname as function_name,
  CASE WHEN prosecdef THEN '✅ SECURITY DEFINER' ELSE '❌ NO SECURITY' END as security_status
FROM pg_proc
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND proname IN ('grant_credits', 'handle_new_user', 'handle_new_user_credits')
ORDER BY proname;

-- ============================================
-- 5. VERIFICA RLS ABILITATO
-- ============================================

SELECT
  table_name,
  CASE
    WHEN rowsecurity THEN '✅ RLS ENABLED'
    ELSE '❌ RLS DISABLED'
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'profiles',
  'gardens',
  'calendar_tasks',
  'seed_inventory',
  'ai_credit_transactions',
  'garden_beds',
  'garden_zones'
)
ORDER BY tablename;

-- ============================================
-- 6. VERIFICA POLICIES
-- ============================================

SELECT
  'RLS Policies configurate' as check_name,
  COUNT(*) as count_found,
  CASE WHEN COUNT(*) >= 20 THEN '✅ OK' ELSE '⚠️  POCHE' END as status
FROM pg_policies
WHERE schemaname = 'public';

-- Dettaglio policies per tabella
SELECT
  tablename,
  COUNT(*) as policies_count
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
  'profiles',
  'gardens',
  'calendar_tasks',
  'seed_inventory',
  'ai_credit_transactions',
  'garden_beds',
  'garden_zones'
)
GROUP BY tablename
ORDER BY tablename;

-- ============================================
-- 7. VERIFICA PERMESSI SUPABASE_AUTH_ADMIN
-- ============================================

SELECT
  'Permessi su profiles' as check_name,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM information_schema.table_privileges
      WHERE grantee = 'supabase_auth_admin'
      AND table_schema = 'public'
      AND table_name = 'profiles'
      AND privilege_type = 'INSERT'
    ) THEN '✅ OK'
    ELSE '❌ MANCANTI'
  END as status;

SELECT
  'Permessi su ai_credit_transactions' as check_name,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM information_schema.table_privileges
      WHERE grantee = 'supabase_auth_admin'
      AND table_schema = 'public'
      AND table_name = 'ai_credit_transactions'
      AND privilege_type = 'INSERT'
    ) THEN '✅ OK'
    ELSE '❌ MANCANTI'
  END as status;

-- ============================================
-- 8. CONTA TOTALE TABELLE
-- ============================================

SELECT
  'Tabelle totali in schema public' as info,
  COUNT(*) as total_tables
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE';

-- Lista tutte le tabelle
SELECT
  table_name,
  CASE
    WHEN rowsecurity THEN '🔒 RLS'
    ELSE '🔓 NO RLS'
  END as security
FROM information_schema.tables t
LEFT JOIN pg_tables pt ON pt.tablename = t.table_name AND pt.schemaname = t.table_schema
WHERE t.table_schema = 'public'
AND t.table_type = 'BASE TABLE'
ORDER BY table_name;

-- ============================================
-- 9. VERIFICA VINCOLI PROFILI
-- ============================================

SELECT
  constraint_name,
  '✅' as status
FROM information_schema.table_constraints
WHERE table_schema = 'public'
AND table_name = 'profiles'
AND constraint_type = 'CHECK'
ORDER BY constraint_name;

-- ============================================
-- 10. RIEPILOGO FINALE
-- ============================================

SELECT '
╔════════════════════════════════════════════╗
║  RIEPILOGO VERIFICA DATABASE ORTOMIO       ║
╚════════════════════════════════════════════╝

Se tutti i check sopra mostrano:
✅ OK o numeri attesi

Allora il database è configurato correttamente!

Prossimi passi:
1. Vai su Supabase Dashboard > Settings > API
2. Copia URL e API Keys
3. Aggiorna .env.local nel progetto
4. Testa registrazione nuovo utente
5. Verifica che profilo venga creato automaticamente
6. Verifica 6 crediti AI assegnati (3+3 bonus)

' as summary;

-- ============================================
-- FINE PARTE 3
-- ============================================
