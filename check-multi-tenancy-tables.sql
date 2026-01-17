-- =====================================================
-- VERIFICA RAPIDA TABELLE MULTI-TENANCY
-- =====================================================
-- Questo script verifica se le tabelle del sistema multi-tenancy esistono già

\echo '🔍 Verificando tabelle multi-tenancy...'
\echo ''

-- Controlla esistenza tabelle
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organizations' AND table_schema = 'public')
        THEN '✅ organizations'
        ELSE '❌ organizations (MANCANTE)'
    END as "Tabella Organizations";

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'roles' AND table_schema = 'public')
        THEN '✅ roles'
        ELSE '❌ roles (MANCANTE)'
    END as "Tabella Roles";

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organization_members' AND table_schema = 'public')
        THEN '✅ organization_members'
        ELSE '❌ organization_members (MANCANTE)'
    END as "Tabella Organization Members";

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organization_invitations' AND table_schema = 'public')
        THEN '✅ organization_invitations'
        ELSE '❌ organization_invitations (MANCANTE)'
    END as "Tabella Organization Invitations";

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'garden_assignments' AND table_schema = 'public')
        THEN '✅ garden_assignments'
        ELSE '❌ garden_assignments (MANCANTE)'
    END as "Tabella Garden Assignments";

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'api_keys' AND table_schema = 'public')
        THEN '✅ api_keys'
        ELSE '❌ api_keys (MANCANTE)'
    END as "Tabella API Keys";

\echo ''
\echo '📊 Riepilogo tabelle:'

-- Conta tabelle esistenti
SELECT 
    COUNT(*) as "Tabelle Esistenti",
    CASE 
        WHEN COUNT(*) = 6 THEN '🎉 TUTTE LE TABELLE PRESENTI!'
        WHEN COUNT(*) > 0 THEN '⚠️  ALCUNE TABELLE MANCANTI'
        ELSE '❌ NESSUNA TABELLA TROVATA - APPLICARE MIGRAZIONE'
    END as "Stato"
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'organizations', 
    'roles', 
    'organization_members', 
    'organization_invitations', 
    'garden_assignments', 
    'api_keys'
);

\echo ''
\echo '🔐 Verificando politiche RLS...'

-- Conta politiche RLS
SELECT 
    COUNT(*) as "Politiche RLS",
    CASE 
        WHEN COUNT(*) >= 12 THEN '✅ RLS CONFIGURATO'
        WHEN COUNT(*) > 0 THEN '⚠️  RLS PARZIALE'
        ELSE '❌ RLS NON CONFIGURATO'
    END as "Stato RLS"
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN (
    'organizations', 
    'roles', 
    'organization_members', 
    'organization_invitations', 
    'garden_assignments', 
    'api_keys'
);

\echo ''
\echo '⚡ Verificando indici di performance...'

-- Conta indici
SELECT 
    COUNT(*) as "Indici Performance",
    CASE 
        WHEN COUNT(*) >= 10 THEN '✅ INDICI OTTIMIZZATI'
        WHEN COUNT(*) > 0 THEN '⚠️  INDICI PARZIALI'
        ELSE '❌ INDICI MANCANTI'
    END as "Stato Indici"
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN (
    'organizations', 
    'roles', 
    'organization_members', 
    'organization_invitations', 
    'garden_assignments', 
    'api_keys'
)
AND indexname LIKE 'idx_%';

\echo ''
\echo '🔧 Verificando funzioni di sistema...'

-- Controlla funzioni
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.routines 
            WHERE routine_name = 'create_system_roles_for_organization'
            AND routine_schema = 'public'
        )
        THEN '✅ Funzione creazione ruoli di sistema presente'
        ELSE '❌ Funzione creazione ruoli di sistema MANCANTE'
    END as "Funzioni Sistema";

\echo ''
\echo '📋 ISTRUZIONI:'
\echo ''
\echo 'Se vedi tabelle mancanti, applica la migrazione con uno di questi metodi:'
\echo ''
\echo '1. Supabase CLI:'
\echo '   supabase db push'
\echo ''
\echo '2. Dashboard Supabase:'
\echo '   - Vai su SQL Editor'
\echo '   - Copia il contenuto di supabase/migrations/20260116040000_create_multi_tenancy_system.sql'
\echo '   - Esegui la query'
\echo ''
\echo '3. Script di applicazione:'
\echo '   psql -f APPLY_MULTI_TENANCY_MIGRATION_JAN17.sql'
\echo ''