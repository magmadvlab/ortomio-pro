#!/bin/bash

echo "🔍 CONFRONTO DATABASE LOCALE vs ONLINE"
echo "====================================="

echo ""
echo "📊 ANALISI DATABASE LOCALE"
echo "-------------------------"

# Conteggio tabelle locale
LOCALE_TABLES=$(psql postgresql://postgres:postgres@127.0.0.1:54324/postgres -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
echo "Tabelle totali locale: $LOCALE_TABLES"

# Lista tabelle locale
echo ""
echo "📋 LISTA TABELLE LOCALE:"
psql postgresql://postgres:postgres@127.0.0.1:54324/postgres -t -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;" | sed 's/^[ \t]*/  - /'

echo ""
echo "🌱 VERIFICA ARCHETIPI LOCALE:"
ARCHETIPI_LOCALE=$(psql postgresql://postgres:postgres@127.0.0.1:54324/postgres -t -c "SELECT COUNT(*) FROM crop_archetypes;" 2>/dev/null || echo "0")
echo "Archetipi configurati: $ARCHETIPI_LOCALE"

echo ""
echo "📊 VERIFICA PROFILI LOCALE:"
PROFILI_LOCALE=$(psql postgresql://postgres:postgres@127.0.0.1:54324/postgres -t -c "SELECT COUNT(*) FROM crop_profiles;" 2>/dev/null || echo "0")
echo "Profili configurati: $PROFILI_LOCALE"

echo ""
echo "🤖 VERIFICA ORCHESTRATORE LOCALE:"
PIANI_LOCALE=$(psql postgresql://postgres:postgres@127.0.0.1:54324/postgres -t -c "SELECT COUNT(*) FROM cultivation_plans;" 2>/dev/null || echo "0")
echo "Piani coltivazione: $PIANI_LOCALE"

echo ""
echo "🎯 TABELLE NOSTRE IMPLEMENTAZIONI:"
echo "  Sistema Orchestratore (8 tabelle):"
for table in cultivation_plans cultivation_statistics cultivation_issues detailed_harvests phase_transitions sapling_inventory cultivation_analytics_dashboard cultivation_dashboard; do
    EXISTS=$(psql postgresql://postgres:postgres@127.0.0.1:54324/postgres -t -c "SELECT CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = '$table' AND table_schema = 'public') THEN 'SI' ELSE 'NO' END;" 2>/dev/null)
    echo "    - $table: $EXISTS"
done

echo ""
echo "  Sistema Tassonomia (6 tabelle):"
for table in crop_archetypes crop_profiles plant_families plant_taxonomy plant_synonyms plant_rules; do
    EXISTS=$(psql postgresql://postgres:postgres@127.0.0.1:54324/postgres -t -c "SELECT CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = '$table' AND table_schema = 'public') THEN 'SI' ELSE 'NO' END;" 2>/dev/null)
    echo "    - $table: $EXISTS"
done

echo ""
echo "📋 QUERY PER DATABASE ONLINE"
echo "============================"
echo ""
echo "Copia e incolla questa query nel SQL Editor di Supabase Dashboard:"
echo "https://supabase.com/dashboard/project/qhmujoivfxftlrcrluaj/sql/new"
echo ""
echo "-- ANALISI SCHEMA DATABASE ONLINE"
echo "SELECT 'TOTAL_TABLES' as info, COUNT(*) as count"
echo "FROM information_schema.tables WHERE table_schema = 'public';"
echo ""
echo "-- LISTA TABELLE ONLINE"
echo "SELECT table_name FROM information_schema.tables"
echo "WHERE table_schema = 'public' ORDER BY table_name;"
echo ""
echo "-- VERIFICA NOSTRE TABELLE ONLINE"
echo "SELECT 'ORCHESTRATOR_TABLES' as category,"
echo "       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cultivation_plans' AND table_schema = 'public') THEN 'EXISTS' ELSE 'MISSING' END as cultivation_plans,"
echo "       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cultivation_statistics' AND table_schema = 'public') THEN 'EXISTS' ELSE 'MISSING' END as cultivation_statistics,"
echo "       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'crop_archetypes' AND table_schema = 'public') THEN 'EXISTS' ELSE 'MISSING' END as crop_archetypes;"
echo ""
echo "-- CONTEGGIO DATI SE ESISTONO"
echo "SELECT 'DATA_COUNT' as info,"
echo "       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'crop_archetypes' AND table_schema = 'public')"
echo "            THEN (SELECT COUNT(*)::text FROM crop_archetypes)"
echo "            ELSE 'TABLE_NOT_EXISTS' END as archetipi,"
echo "       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'crop_profiles' AND table_schema = 'public')"
echo "            THEN (SELECT COUNT(*)::text FROM crop_profiles)"
echo "            ELSE 'TABLE_NOT_EXISTS' END as profili;"

echo ""
echo "🎯 PROSSIMI PASSI:"
echo "1. Esegui le query sopra nel Dashboard Supabase"
echo "2. Confronta i risultati con quelli locali"
echo "3. Identifica le tabelle mancanti online"
echo "4. Applica le migrazioni mancanti tramite SQL Editor"
echo ""
echo "📁 File di supporto creati:"
echo "  - query_online_schema_info.sql (query pronta per Dashboard)"
echo "  - SOLUZIONE_ALLINEAMENTO_MANUALE.md (guida completa)"