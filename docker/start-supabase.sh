#!/bin/bash
# Script per avviare Supabase - Aggiunge Docker al PATH

export PATH="/Applications/Docker.app/Contents/Resources/bin:$PATH"

cd "$(dirname "$0")"

echo "🚀 Avvio Supabase Docker..."
docker compose up -d

echo ""
echo "⏳ Attesa avvio servizi (20 secondi)..."
sleep 20

echo ""
echo "📊 Stato container:"
docker compose ps

echo ""
echo "✅ Supabase avviato!"
echo "🌐 Supabase Studio: http://localhost:3000"
echo "🌐 API: http://localhost:8000"

