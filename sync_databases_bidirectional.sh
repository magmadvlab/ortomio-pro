#!/bin/bash

echo "🔄 SINCRONIZZAZIONE BIDIREZIONALE DATABASE"
echo "========================================="

# Configurazione
PROJECT_REF="qhmujoivfxftlrcrluaj"
LOCAL_DB="postgresql://postgres:postgres@127.0.0.1:54324/postgres"
ONLINE_DB="postgresql://postgres:[PASSWORD]@db.${PROJECT_REF}.supabase.co:5432/postgres"

echo ""
echo "📊 FASE 1: ANALISI STATO ATTUALE"
echo "--------------------------------"

# Conta tabelle locali
echo "Conteggio tabelle database locale..."
LOCAL_TABLES=$(psql "$LOCAL_DB" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')
echo "Database locale: $LOCAL_TABLES tabelle"

# Conta tabelle online (richiede password)
echo "Conteggio tabelle database online..."
read -s -p "Inserisci password database online: " DB_PASSWORD
echo
ONLINE_DB="postgresql://postgres:${DB_PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres"

ONLINE_TABLES=$(psql "$ONLINE_DB" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ')

if [ $? -eq 0 ]; then
    echo "Database online: $ONLINE_TABLES tabelle"
else
    echo "❌ Errore connessione database online"
    exit 1
fi

echo ""
echo "📋 FASE 2: ESPORTAZIONE SCHEMI"
echo "------------------------------"

# Esporta schema online
echo "Esportando schema database online..."
pg_dump --schema-only "$ONLINE_DB" > schema_online_$(date +%Y%m%d).sql
echo "✅ Schema online salvato: schema_online_$(date +%Y%m%d).sql"

# Esporta schema locale
echo "Esportando schema database locale..."
pg_dump --schema-only "$LOCAL_DB" > schema_locale_$(date +%Y%m%d).sql
echo "✅ Schema locale salvato: schema_locale_$(date +%Y%m%d).sql"

echo ""
echo "🔍 FASE 3: ANALISI DIFFERENZE"
echo "-----------------------------"

# Lista tabelle online
echo "Estraendo lista tabelle online..."
psql "$ONLINE_DB" -t -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;" > tabelle_online.txt

# Lista tabelle locali
echo "Estraendo lista tabelle locali..."
psql "$LOCAL_DB" -t -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;" > tabelle_locali.txt

# Trova differenze
echo ""
echo "📊 TABELLE SOLO ONLINE (da importare nel locale):"
comm -23 <(sort tabelle_online.txt) <(sort tabelle_locali.txt) | sed 's/^/  - /'

echo ""
echo "📊 TABELLE SOLO LOCALI (da esportare online):"
comm -13 <(sort tabelle_online.txt) <(sort tabelle_locali.txt) | sed 's/^/  - /'

echo ""
echo "🎯 FASE 4: PIANO SINCRONIZZAZIONE"
echo "--------------------------------"

MISSING_IN_LOCAL=$(comm -23 <(sort tabelle_online.txt) <(sort tabelle_locali.txt) | wc -l | tr -d ' ')
MISSING_IN_ONLINE=$(comm -13 <(sort tabelle_online.txt) <(sort tabelle_locali.txt) | wc -l | tr -d ' ')

echo "Tabelle da importare nel locale: $MISSING_IN_LOCAL"
echo "Tabelle da esportare online: $MISSING_IN_ONLINE"

if [ "$MISSING_IN_LOCAL" -gt 0 ]; then
    echo ""
    echo "🔽 PASSO 1: Importare tabelle mancanti nel locale"
    echo "   Comando: psql \$LOCAL_DB -f schema_online_$(date +%Y%m%d).sql"
fi

if [ "$MISSING_IN_ONLINE" -gt 0 ]; then
    echo ""
    echo "🔼 PASSO 2: Esportare nostre tabelle online"
    echo "   Comando: supabase db push"
fi

echo ""
echo "📋 FILE GENERATI:"
echo "----------------"
echo "- schema_online_$(date +%Y%m%d).sql (schema completo online)"
echo "- schema_locale_$(date +%Y%m%d).sql (schema completo locale)"
echo "- tabelle_online.txt (lista tabelle online)"
echo "- tabelle_locali.txt (lista tabelle locali)"

# Cleanup
rm -f tabelle_online.txt tabelle_locali.txt

echo ""
echo "✅ ANALISI COMPLETATA"
echo "Ora puoi procedere con la sincronizzazione bidirezionale"