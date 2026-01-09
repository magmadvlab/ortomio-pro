#!/bin/bash

# ============================================
# DEPLOY AUTOMATICO MIGRAZIONI PRODUZIONE
# ============================================
# Applica tutte le nostre migrazioni al database online

echo "🚀 DEPLOY ORTOMIO PRO - DATABASE ONLINE"
echo "======================================"

# Configurazione
PROJECT_REF="your-project-ref-here"  # Sostituire con il vero project ref
DB_PASSWORD="your-db-password"       # Sostituire con la vera password

# URL database online (formato Supabase)
DB_URL="postgresql://postgres:${DB_PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres"

echo ""
echo "📋 MIGRAZIONI DA APPLICARE:"
echo "--------------------------"
echo "1. Sistema Tassonomia Piante"
echo "2. Seed Archetipi (19 archetipi)"
echo "3. Sistema Orchestratore Completo"
echo "4. Tabelle Critiche Mancanti"
echo "5. Gamification e Giardino Avanzato"
echo "6. Tabelle Rimanenti"

read -p "Continuare con il deploy? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deploy annullato."
    exit 1
fi

# Backup
echo ""
echo "📦 Creando backup database online..."
BACKUP_FILE="backup_pre_deploy_$(date +%Y%m%d_%H%M%S).sql"
pg_dump "$DB_URL" > "$BACKUP_FILE"
echo "✅ Backup salvato: $BACKUP_FILE"

# Applicare migrazioni in ordine
echo ""
echo "🔧 Applicando migrazioni..."

echo "  1/6 Sistema Tassonomia Piante..."
psql "$DB_URL" -f supabase/migrations/20260105060000_add_plant_taxonomy_system.sql
if [ $? -eq 0 ]; then
    echo "  ✅ Tassonomia applicata"
else
    echo "  ❌ Errore tassonomia"
    exit 1
fi

echo "  2/6 Seed Archetipi..."
psql "$DB_URL" -f supabase/migrations/20260105070000_seed_crop_archetypes.sql
if [ $? -eq 0 ]; then
    echo "  ✅ Archetipi applicati"
else
    echo "  ❌ Errore archetipi"
    exit 1
fi

echo "  3/6 Sistema Orchestratore..."
psql "$DB_URL" -f supabase/migrations/20260105000000_add_cultivation_orchestrator.sql
psql "$DB_URL" -f supabase/migrations/20260105010000_add_orchestrator_triggers.sql
psql "$DB_URL" -f supabase/migrations/20260105020000_add_orchestrator_analytics.sql
if [ $? -eq 0 ]; then
    echo "  ✅ Orchestratore applicato"
else
    echo "  ❌ Errore orchestratore"
    exit 1
fi

echo "  4/6 Tabelle Critiche..."
psql "$DB_URL" -f supabase/migrations/20260105080000_add_missing_critical_tables.sql
if [ $? -eq 0 ]; then
    echo "  ✅ Tabelle critiche applicate"
else
    echo "  ❌ Errore tabelle critiche"
    exit 1
fi

echo "  5/6 Gamification..."
psql "$DB_URL" -f supabase/migrations/20260105090000_add_gamification_and_garden_advanced.sql
if [ $? -eq 0 ]; then
    echo "  ✅ Gamification applicata"
else
    echo "  ❌ Errore gamification"
    exit 1
fi

echo "  6/6 Tabelle Rimanenti..."
psql "$DB_URL" -f supabase/migrations/20260105100000_add_remaining_missing_tables.sql
if [ $? -eq 0 ]; then
    echo "  ✅ Tabelle rimanenti applicate"
else
    echo "  ❌ Errore tabelle rimanenti"
    exit 1
fi

# Verifica risultato
echo ""
echo "✅ Verificando risultato..."
TOTAL_TABLES=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')
ARCHETIPI=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM crop_archetypes;" | tr -d ' ')
PROFILI=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM crop_profiles;" | tr -d ' ')

echo ""
echo "📊 RISULTATO DEPLOY:"
echo "-------------------"
echo "Tabelle totali: $TOTAL_TABLES"
echo "Archetipi: $ARCHETIPI"
echo "Profili: $PROFILI"

if [ "$TOTAL_TABLES" -ge 70 ] && [ "$ARCHETIPI" -eq 19 ] && [ "$PROFILI" -eq 16 ]; then
    echo ""
    echo "🎉 DEPLOY COMPLETATO CON SUCCESSO!"
    echo "   Database online allineato con locale"
else
    echo ""
    echo "⚠️  DEPLOY PARZIALE - Verificare manualmente"
fi

echo ""
echo "📋 PROSSIMI PASSI:"
echo "-----------------"
echo "1. Testare funzionalità app online"
echo "2. Verificare performance query"
echo "3. Controllare RLS policies"
echo "4. Aggiornare documentazione"