#!/bin/bash

echo "🔍 ANALISI DIFFERENZE SCHEMA DATABASE"
echo "===================================="

echo ""
echo "📊 TABELLE NEL DATABASE ONLINE (dallo schema fornito):"
echo "-----------------------------------------------------"

# Estrai nomi tabelle dallo schema online (dal tuo messaggio)
online_tables="agronomist_advice
agronomist_consultations
agronomists
ai_credit_transactions
api_configurations
aquaponic_readings
bed_planting_history
calendar_tasks
challenge_completions
crop_aliases
crop_archetypes
crop_learning_events
crop_mechanical_works
crop_profiles
custom_crops
custom_plans
fertilization_logs
fertilizer_application_logs
fertilizer_inventory
field_rows
garden_accessories
garden_beds
garden_correlations
garden_obstacles
garden_patterns
garden_rows
garden_season_analyses
garden_tasks
garden_tree_memories
garden_zone_memories
garden_zones
gardens
harvest_logs
hydroponic_readings
irrigation_components
irrigation_systems
irrigation_zones
mechanical_work_register
mechanical_work_sequences
notification_preferences
official_crops
photo_logs
phyto_inventory
plant_families
plant_rules
plant_synonyms
plant_taxonomy
planting_batches
professional_analytics
profiles
sapling_batches
seed_inventory
seedling_batches
sensor_readings
soil_analysis
treatment_register
treatment_registry
user_badges
vegetation_indices
watering_logs
weather_cache
weather_reschedule_logs
yield_predictions"

echo "$online_tables" | sort

echo ""
echo "📊 TABELLE NEL DATABASE LOCALE:"
echo "-------------------------------"
psql postgresql://postgres:postgres@127.0.0.1:54324/postgres -t -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;" | grep -v "^$" | sed 's/^ *//'

echo ""
echo "❌ TABELLE MANCANTI NEL DATABASE LOCALE:"
echo "----------------------------------------"

# Crea file temporanei
online_file=$(mktemp)
local_file=$(mktemp)

# Salva liste in file temporanei
echo "$online_tables" | sort > "$online_file"
psql postgresql://postgres:postgres@127.0.0.1:54324/postgres -t -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;" | grep -v "^$" | sed 's/^ *//' | sort > "$local_file"

# Trova tabelle mancanti nel locale
missing_in_local=$(comm -23 "$online_file" "$local_file")

if [ -z "$missing_in_local" ]; then
    echo "✅ Tutte le tabelle online sono presenti nel database locale!"
else
    echo "$missing_in_local"
    echo ""
    echo "🚨 AZIONE RICHIESTA: Creare le tabelle mancanti"
fi

echo ""
echo "➕ TABELLE EXTRA NEL DATABASE LOCALE:"
echo "------------------------------------"

# Trova tabelle extra nel locale
extra_in_local=$(comm -13 "$online_file" "$local_file")

if [ -z "$extra_in_local" ]; then
    echo "✅ Nessuna tabella extra nel database locale"
else
    echo "$extra_in_local"
    echo ""
    echo "ℹ️  Queste tabelle potrebbero essere state aggiunte dalle migrazioni recenti"
fi

# Pulisci file temporanei
rm "$online_file" "$local_file"

echo ""
echo "🔍 VERIFICA TABELLE ORCHESTRATORE CRITICHE:"
echo "-------------------------------------------"

critical_tables="cultivation_plans cultivation_statistics cultivation_issues detailed_harvests phase_transitions sapling_inventory"

for table in $critical_tables; do
    exists=$(psql postgresql://postgres:postgres@127.0.0.1:54324/postgres -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '$table');" | tr -d ' ')
    if [ "$exists" = "t" ]; then
        echo "✅ $table"
    else
        echo "❌ $table - MANCANTE!"
    fi
done

echo ""
echo "📈 STATISTICHE FINALI:"
echo "----------------------"
online_count=$(echo "$online_tables" | wc -l)
local_count=$(psql postgresql://postgres:postgres@127.0.0.1:54324/postgres -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')
missing_count=$(echo "$missing_in_local" | grep -v "^$" | wc -l)
extra_count=$(echo "$extra_in_local" | grep -v "^$" | wc -l)

echo "Tabelle online: $online_count"
echo "Tabelle locali: $local_count"
echo "Tabelle mancanti: $missing_count"
echo "Tabelle extra: $extra_count"

if [ "$missing_count" -eq 0 ]; then
    echo ""
    echo "🎯 ✅ DATABASE LOCALE COMPLETAMENTE ALLINEATO!"
else
    echo ""
    echo "⚠️  Database locale necessita di $missing_count tabelle aggiuntive"
fi