-- ============================================
-- QUERY PER ANALIZZARE SCHEMA DATABASE ONLINE
-- ============================================
-- Esegui queste query nel SQL Editor di Supabase

-- 1. CONTA TABELLE TOTALI
SELECT COUNT(*) as total_tables 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- 2. LISTA TUTTE LE TABELLE
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 3. TABELLE CON DETTAGLI
SELECT 
    table_name,
    table_type,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 4. VERIFICA TABELLE SPECIFICHE CHE CI INTERESSANO
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'crop_archetypes' AND table_schema = 'public') 
        THEN '✅ crop_archetypes EXISTS' 
        ELSE '❌ crop_archetypes MISSING' 
    END as crop_archetypes_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cultivation_plans' AND table_schema = 'public') 
        THEN '✅ cultivation_plans EXISTS' 
        ELSE '❌ cultivation_plans MISSING' 
    END as cultivation_plans_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'api_configurations' AND table_schema = 'public') 
        THEN '✅ api_configurations EXISTS' 
        ELSE '❌ api_configurations MISSING' 
    END as api_configurations_status;

-- 5. CERCA TABELLE CHE POTREBBERO MANCARE NEL LOCALE
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name NOT IN (
    -- Lista delle nostre tabelle principali (aggiorna se necessario)
    'crop_archetypes', 'crop_profiles', 'cultivation_plans', 
    'cultivation_statistics', 'gardens', 'garden_zones', 'users'
  )
ORDER BY table_name;