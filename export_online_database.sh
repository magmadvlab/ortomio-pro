#!/bin/bash

echo "🔽 EXPORT DATABASE ONLINE"
echo "========================"

PROJECT_REF="qhmujoivfxftlrcrluaj"
DATE=$(date +%Y%m%d_%H%M%S)

echo ""
echo "📋 OPZIONI EXPORT:"
echo "1. Solo schema (struttura tabelle)"
echo "2. Schema + dati (backup completo)"
echo "3. Solo dati (senza struttura)"
echo ""

read -p "Scegli opzione (1-3): " OPTION

case $OPTION in
    1)
        echo "📊 Esportando solo schema..."
        supabase db dump --schema-only > "schema_online_${DATE}.sql"
        echo "✅ Schema esportato: schema_online_${DATE}.sql"
        ;;
    2)
        echo "💾 Esportando database completo..."
        supabase db dump > "database_online_completo_${DATE}.sql"
        echo "✅ Database completo esportato: database_online_completo_${DATE}.sql"
        ;;
    3)
        echo "📄 Esportando solo dati..."
        supabase db dump --data-only > "dati_online_${DATE}.sql"
        echo "✅ Dati esportati: dati_online_${DATE}.sql"
        ;;
    *)
        echo "❌ Opzione non valida"
        exit 1
        ;;
esac

# Verifica file creato
EXPORTED_FILE=$(ls -t *online*${DATE}.sql | head -1)
if [ -f "$EXPORTED_FILE" ]; then
    FILE_SIZE=$(ls -lh "$EXPORTED_FILE" | awk '{print $5}')
    echo ""
    echo "📊 INFORMAZIONI FILE:"
    echo "Nome: $EXPORTED_FILE"
    echo "Dimensione: $FILE_SIZE"
    
    if [[ "$EXPORTED_FILE" == *"schema"* ]]; then
        TABLE_COUNT=$(grep -c "CREATE TABLE" "$EXPORTED_FILE")
        echo "Tabelle trovate: $TABLE_COUNT"
        
        echo ""
        echo "📋 LISTA TABELLE:"
        grep "CREATE TABLE" "$EXPORTED_FILE" | sed 's/CREATE TABLE public\./  - /' | sed 's/ (.*//'
    fi
else
    echo "❌ Errore: File non creato"
    exit 1
fi

echo ""
echo "🎯 PROSSIMI PASSI:"
echo "1. Analizzare schema esportato"
echo "2. Confrontare con database locale"
echo "3. Identificare tabelle mancanti"
echo "4. Creare piano di sincronizzazione"