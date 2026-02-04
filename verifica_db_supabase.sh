#!/bin/bash

# Script per verificare migrazioni in Supabase
# Usage: ./verifica_db_supabase.sh

echo "🔍 Verifica Migrazioni Supabase"
echo "================================"
echo ""

# Connessione a Supabase
# Nota: Ti chiederà la password
psql -h db.qhmujoivfxftlrcrluaj.supabase.co -p 5432 -d postgres -U postgres << 'EOF'

-- ============================================
-- VERIFICA MIGRAZIONI APPLICATE
-- ============================================

\echo ''
\echo '📊 1. VERIFICA TABELLE'
\echo '====================='
SELECT 
  table_name,
  CASE 
    WHEN table_name = 'land_zones' THEN '✅ Zone terreno'
    WHEN table_name = 'soil_memory' THEN '✅ Memoria suolo'
    WHEN table_name = 'field_row_crop_history' THEN '✅ Storico rotazione'
  END as descrizione
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('land_zones', 'soil_memory', 'field_row_crop_history')
ORDER BY table_name;

\echo ''
\echo '📊 2. VERIFICA COLONNA land_zone_id'
\echo '===================================='
SELECT 
  column_name,
  data_type,
  is_nullable,
  '✅ Link filari → zone' as descrizione
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'garden_rows'
  AND column_name = 'land_zone_id';

\echo ''
\echo '📊 3. VERIFICA CONSTRAINT row_number'
\echo '====================================='
SELECT
  conname as constraint_name,
  pg_get_constraintdef(c.oid) as definizione
FROM pg_constraint c
JOIN pg_namespace n ON n.oid = c.connamespace
WHERE conrelid = 'public.garden_rows'::regclass
  AND (conname LIKE '%row_number%' OR conname LIKE '%active%');

\echo ''
\echo '📊 4. VERIFICA FUNZIONI SQL'
\echo '==========================='
SELECT 
  routine_name as funzione,
  CASE 
    WHEN routine_name = 'get_zone_history' THEN '✅ Storico zona'
    WHEN routine_name = 'calculate_zone_soil_health' THEN '✅ Salute terreno'
    WHEN routine_name = 'get_zone_rotation_suggestions' THEN '✅ Suggerimenti zona'
    WHEN routine_name = 'calculate_rotation_score' THEN '✅ Punteggio filare'
    WHEN routine_name = 'get_rotation_suggestions' THEN '✅ Suggerimenti filare'
    WHEN routine_name = 'get_field_row_history' THEN '✅ Storico filare'
  END as descrizione
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'get_zone_history',
    'calculate_zone_soil_health',
    'get_zone_rotation_suggestions',
    'calculate_rotation_score',
    'get_rotation_suggestions',
    'get_field_row_history'
  )
ORDER BY routine_name;

\echo ''
\echo '📊 RIEPILOGO'
\echo '============'
\echo ''

-- Conta risultati
SELECT 
  'Tabelle trovate' as tipo,
  COUNT(*) as numero,
  CASE 
    WHEN COUNT(*) = 3 THEN '✅ TUTTE PRESENTI'
    WHEN COUNT(*) > 0 THEN '⚠️ PARZIALI'
    ELSE '❌ MANCANTI'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('land_zones', 'soil_memory', 'field_row_crop_history')

UNION ALL

SELECT 
  'Colonna land_zone_id' as tipo,
  COUNT(*) as numero,
  CASE 
    WHEN COUNT(*) = 1 THEN '✅ PRESENTE'
    ELSE '❌ MANCANTE'
  END as status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'garden_rows'
  AND column_name = 'land_zone_id'

UNION ALL

SELECT 
  'Funzioni SQL' as tipo,
  COUNT(*) as numero,
  CASE 
    WHEN COUNT(*) = 6 THEN '✅ TUTTE PRESENTI'
    WHEN COUNT(*) > 0 THEN '⚠️ PARZIALI'
    ELSE '❌ MANCANTI'
  END as status
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'get_zone_history',
    'calculate_zone_soil_health',
    'get_zone_rotation_suggestions',
    'calculate_rotation_score',
    'get_rotation_suggestions',
    'get_field_row_history'
  );

\echo ''
\echo '✅ Verifica completata!'
\echo ''

EOF

echo ""
echo "================================"
echo "Verifica completata!"
echo ""
