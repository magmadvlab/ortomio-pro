#!/bin/bash

echo "🔍 CONTROLLO MIGRAZIONI ORTOMIO"
echo "================================"

echo ""
echo "📁 MIGRAZIONI DISPONIBILI:"
echo "-------------------------"
ls -1 supabase/migrations/*.sql | grep -v ".bak" | sort

echo ""
echo "✅ MIGRAZIONI APPLICATE (DATABASE LOCALE):"
echo "------------------------------------------"
psql postgresql://postgres:postgres@127.0.0.1:54324/postgres -t -c "SELECT version FROM supabase_migrations.schema_migrations ORDER BY version;" 2>/dev/null | grep -v "^$" | sort

echo ""
echo "❌ MIGRAZIONI MANCANTI (DA APPLICARE):"
echo "-------------------------------------"

# Crea file temporanei
available_file=$(mktemp)
applied_file=$(mktemp)

# Lista migrazioni disponibili (solo i nomi dei file senza estensione)
ls -1 supabase/migrations/*.sql | grep -v ".bak" | xargs -I {} basename {} .sql | sort > "$available_file"

# Lista migrazioni applicate
psql postgresql://postgres:postgres@127.0.0.1:54324/postgres -t -c "SELECT version FROM supabase_migrations.schema_migrations ORDER BY version;" 2>/dev/null | grep -v "^$" | sed 's/^ *//' | sort > "$applied_file"

# Trova le differenze
missing_migrations=$(comm -23 "$available_file" "$applied_file")

if [ -z "$missing_migrations" ]; then
    echo "✅ Tutte le migrazioni sono applicate!"
else
    echo "$missing_migrations"
    echo ""
    echo "🚨 AZIONE RICHIESTA: Applicare le migrazioni mancanti"
fi

# Pulisci file temporanei
rm "$available_file" "$applied_file"

echo ""
echo "📊 STATISTICHE:"
echo "---------------"
available_count=$(ls -1 supabase/migrations/*.sql | grep -v ".bak" | wc -l)
applied_count=$(psql postgresql://postgres:postgres@127.0.0.1:54324/postgres -t -c "SELECT COUNT(*) FROM supabase_migrations.schema_migrations;" 2>/dev/null | tr -d ' ')

echo "Migrazioni disponibili: $available_count"
echo "Migrazioni applicate: $applied_count"
echo "Migrazioni mancanti: $((available_count - applied_count))"