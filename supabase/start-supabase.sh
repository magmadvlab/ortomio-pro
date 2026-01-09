#!/bin/bash
# Script per avviare Supabase locale

export PATH="/opt/homebrew/bin:$PATH"

cd "$(dirname "$0")/.."

echo "🔍 Verifica Docker Desktop..."
if ! docker ps > /dev/null 2>&1; then
    echo "❌ Docker Desktop non è avviato o non risponde"
    echo "📦 Apri Docker Desktop e attendi che l'icona diventi verde"
    echo "⏳ Poi riprova questo script"
    exit 1
fi

echo "✅ Docker Desktop funzionante"
echo ""
echo "🚀 Avvio Supabase..."
supabase start

echo ""
echo "📊 Stato Supabase:"
supabase status

echo ""
echo "✅ Supabase avviato!"
echo "🌐 Studio: http://localhost:54323"
echo "🌐 API: http://localhost:54321"
