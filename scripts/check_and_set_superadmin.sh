#!/bin/bash
# Script per verificare la connessione e impostare superadmin

set -e

DB_URL="postgresql://postgres:postgres@127.0.0.1:54324/postgres"
EMAIL="roberto.lalinga@gmail.com"

echo "🔍 Verificando connessione al database..."

# Verifica se il database è accessibile
if psql "$DB_URL" -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Database accessibile!"
    echo ""
    echo "🔧 Impostando superadmin per: $EMAIL"
    
    # Esegui lo script SQL
    psql "$DB_URL" -f scripts/set_superadmin_direct.sql
    
    echo ""
    echo "✅ Completato!"
else
    echo "❌ Database NON accessibile!"
    echo ""
    echo "🔧 Per risolvere:"
    echo "  1. Avvia Supabase: supabase start"
    echo "  2. Se c'è un errore con storage, rimuovi i volumi Docker"
    echo "  3. Poi riprova questo script"
    echo ""
    echo "💡 Verifica lo stato: supabase status"
    exit 1
fi

