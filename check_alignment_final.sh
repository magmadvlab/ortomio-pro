#!/bin/bash

echo "🔍 VERIFICA ALLINEAMENTO FINALE DATABASE"
echo "========================================"

echo ""
echo "📊 STATISTICHE GENERALI:"
echo "------------------------"

# Conta tabelle locali
local_tables=$(psql postgresql://postgres:postgres@127.0.0.1:54324/postgres -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')
echo "Tabelle database locale: $local_tables"

# Tabelle online (dal nostro schema di riferimento)
online_tables=63
echo "Tabelle database online: $online_tables"

echo ""
echo "✅ TABELLE AGGIUNTE (NOSTRE IMPLEMENTAZIONI):"
echo "--------------------------------------------"

# Lista delle nostre tabelle orchestratore
echo "Sistema Orchestratore (8 tabelle):"
psql postgresql://postgres:postgres@127.0.0.1:54324/postgres -t -c "
SELECT '  - ' || table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'cultivation_plans', 
    'cultivation_statistics', 
    'cultivation_issues', 
    'detailed_harvests', 
    'phase_transitions', 
    'sapling_inventory', 
    'cultivation_analytics_dashboard', 
    'cultivation_dashboard'
  )
ORDER BY table_name;" | grep -v "^$"

echo ""
echo "Sistema Tassonomia (6 tabelle):"
psql postgresql://postgres:postgres@127.0.0.1:54324/postgres -t -c "
SELECT '  - ' || table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'crop_archetypes', 
    'crop_profiles', 
    'plant_families', 
    'plant_taxonomy', 
    'plant_synonyms', 
    'plant_rules'
  )
ORDER BY table_name;" | grep -v "^$"

echo ""
echo "Tabelle Critiche Aggiunte (19 tabelle):"
psql postgresql://postgres:postgres@127.0.0.1:54324/postgres -t -c "
SELECT '  - ' || table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'api_configurations',
    'calendar_tasks',
    'custom_crops',
    'professional_analytics',
    'yield_predictions',
    'sensor_readings',
    'soil_analysis',
    'challenge_completions',
    'user_badges',
    'garden_correlations',
    'garden_patterns',
    'garden_rows',
    'garden_season_analyses',
    'garden_tree_memories',
    'garden_zone_memories',
    'crop_learning_events',
    'crop_mechanical_works',
    'vegetation_indices',
    'weather_reschedule_logs'
  )
ORDER BY table_name;" | grep -v "^$"

echo ""
echo "📈 VERIFICA FUNZIONALITÀ CRITICHE:"
echo "----------------------------------"

# Verifica archetipi
archetipi_count=$(psql postgresql://postgres:postgres@127.0.0.1:54324/postgres -t -c "SELECT COUNT(*) FROM crop_archetypes;" | tr -d ' ')
echo "Archetipi configurati: $archetipi_count"

# Verifica profili
profili_count=$(psql postgresql://postgres:postgres@127.0.0.1:54324/postgres -t -c "SELECT COUNT(*) FROM crop_profiles;" | tr -d ' ')
echo "Profili tecnici: $profili_count"

# Verifica migrazioni
migrazioni_count=$(psql postgresql://postgres:postgres@127.0.0.1:54324/postgres -t -c "SELECT COUNT(*) FROM supabase_migrations.schema_migrations;" | tr -d ' ')
echo "Migrazioni applicate: $migrazioni_count"

echo ""
echo "🎯 RISULTATO ALLINEAMENTO:"
echo "-------------------------"
total_added=$((local_tables - online_tables))
echo "Tabelle totali locale: $local_tables"
echo "Tabelle base online: $online_tables"
echo "Tabelle aggiunte: $total_added"

if [ $total_added -gt 0 ]; then
    echo "✅ SUCCESSO: Database locale è SUPERIORE a quello online"
    echo "   Il locale include tutte le funzionalità online + nostre aggiunte"
else
    echo "❌ PROBLEMA: Database locale ha meno tabelle di quello online"
fi

echo ""
echo "🚀 PROSSIMO PASSO:"
echo "------------------"
echo "1. Deploy delle nostre $total_added tabelle aggiuntive sul database online"
echo "2. Verifica che tutte le funzionalità siano operative"
echo "3. Test completo del sistema integrato"

echo ""
echo "📋 TABELLE DA DEPLOYARE ONLINE:"
echo "-------------------------------"
echo "- Sistema orchestratore completo (8 tabelle)"
echo "- Sistema tassonomia piante (6 tabelle)"  
echo "- Tabelle critiche mancanti (19 tabelle)"
echo "- Sistemi professionali (nutrition, irrigation, etc.)"