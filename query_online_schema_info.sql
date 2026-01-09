-- Query per ottenere informazioni schema database online
-- Eseguire nel SQL Editor di Supabase Dashboard

-- 1. Conteggio tabelle totali
SELECT 'TOTAL_TABLES' as info, COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public';

-- 2. Lista completa tabelle
SELECT 'TABLE_LIST' as info, table_name
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 3. Tabelle che abbiamo in locale ma potrebbero mancare online
SELECT 'MISSING_ONLINE' as info, table_name
FROM (VALUES 
    ('cultivation_plans'),
    ('cultivation_statistics'),
    ('cultivation_issues'),
    ('detailed_harvests'),
    ('phase_transitions'),
    ('sapling_inventory'),
    ('cultivation_analytics_dashboard'),
    ('cultivation_dashboard'),
    ('crop_archetypes'),
    ('crop_profiles'),
    ('plant_families'),
    ('plant_taxonomy'),
    ('plant_synonyms'),
    ('plant_rules')
) AS local_tables(table_name)
WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = local_tables.table_name
);

-- 4. Verifica archetipi se esistono
SELECT 'ARCHETYPES_COUNT' as info, 
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'crop_archetypes' AND table_schema = 'public')
            THEN (SELECT COUNT(*)::text FROM crop_archetypes)
            ELSE 'TABLE_NOT_EXISTS'
       END as count;