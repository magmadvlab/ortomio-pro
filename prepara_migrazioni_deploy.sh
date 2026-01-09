#!/bin/bash

echo "📦 PREPARAZIONE MIGRAZIONI PER DEPLOY ONLINE"
echo "==========================================="

MIGRATIONS_DIR="supabase/migrations"
OUTPUT_DIR="deploy_sql"

# Crea directory output se non esiste
mkdir -p "$OUTPUT_DIR"

echo ""
echo "🎯 ORDINE DEPLOY MIGRAZIONI:"
echo ""

# Array con l'ordine corretto delle migrazioni
MIGRATIONS=(
    "20260105060000_add_plant_taxonomy_system.sql"
    "20260105070000_seed_crop_archetypes.sql" 
    "20260105000000_add_cultivation_orchestrator.sql"
    "20260105010000_add_orchestrator_triggers.sql"
    "20260105020000_add_orchestrator_analytics.sql"
    "20260105080000_add_missing_critical_tables.sql"
    "20260105090000_add_gamification_and_garden_advanced.sql"
    "20260105100000_add_remaining_missing_tables.sql"
)

# Copia le migrazioni nell'ordine corretto
for i in "${!MIGRATIONS[@]}"; do
    MIGRATION="${MIGRATIONS[$i]}"
    STEP=$((i + 1))
    
    if [ -f "$MIGRATIONS_DIR/$MIGRATION" ]; then
        # Copia con nome ordinato
        cp "$MIGRATIONS_DIR/$MIGRATION" "$OUTPUT_DIR/step_${STEP}_${MIGRATION}"
        
        echo "✅ Step $STEP: $MIGRATION"
        echo "   📁 Copiato in: $OUTPUT_DIR/step_${STEP}_${MIGRATION}"
        
        # Mostra prime righe per identificazione
        echo "   📋 Contenuto:"
        head -5 "$MIGRATIONS_DIR/$MIGRATION" | grep -E "^--" | sed 's/^/      /'
        echo ""
    else
        echo "❌ Step $STEP: $MIGRATION - FILE NON TROVATO"
        echo ""
    fi
done

echo ""
echo "📋 ISTRUZIONI DEPLOY:"
echo "===================="
echo ""
echo "1. Vai su: https://supabase.com/dashboard/project/qhmujoivfxftlrcrluaj/sql/new"
echo ""
echo "2. Per ogni step, apri il file corrispondente e:"
echo "   - Copia tutto il contenuto SQL"
echo "   - Incolla nel SQL Editor di Supabase"
echo "   - Clicca 'Run' per eseguire"
echo "   - Verifica che non ci siano errori"
echo "   - Passa al step successivo"
echo ""
echo "3. Ordine di esecuzione:"
for i in "${!MIGRATIONS[@]}"; do
    STEP=$((i + 1))
    echo "   Step $STEP: ${MIGRATIONS[$i]}"
done

echo ""
echo "📊 VERIFICA DOPO OGNI STEP:"
echo "=========================="
echo ""
echo "Esegui questa query dopo ogni migrazione:"
echo ""
echo "SELECT 'STEP_${STEP}' as step, COUNT(*) as total_tables"
echo "FROM information_schema.tables WHERE table_schema = 'public';"
echo ""

echo "🎯 RISULTATI ATTESI:"
echo "=================="
echo "Step 1 (Tassonomia): ~69 tabelle"
echo "Step 2 (Archetipi): ~69 tabelle (+ dati)"
echo "Step 3 (Orchestratore): ~77 tabelle"
echo "Step 4 (Trigger): ~77 tabelle"
echo "Step 5 (Analytics): ~77 tabelle"
echo "Step 6 (Critiche): ~96 tabelle"
echo "Step 7 (Gamification): ~100 tabelle"
echo "Step 8 (Finali): ~70+ tabelle"

echo ""
echo "📁 File preparati in: $OUTPUT_DIR/"
ls -la "$OUTPUT_DIR/" | grep "step_"

echo ""
echo "🚀 PRONTO PER IL DEPLOY!"