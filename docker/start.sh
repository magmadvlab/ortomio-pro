#!/bin/bash
# Script per avviare Supabase Docker
# Usa questo script se docker non è nel PATH

set -e

echo "🚀 Avvio Supabase Docker per OrtoMio AI..."

# Verifica Docker Desktop
if [ ! -d "/Applications/Docker.app" ]; then
    echo "❌ Docker Desktop non trovato. Installa Docker Desktop da https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Path Docker Compose
DOCKER_COMPOSE="/Applications/Docker.app/Contents/Resources/bin/docker compose"

# Verifica che Docker Desktop sia avviato
if ! $DOCKER_COMPOSE version > /dev/null 2>&1; then
    echo "⚠️  Docker Desktop non sembra essere avviato."
    echo "📦 Tentativo di avvio Docker Desktop..."
    open -a Docker
    echo "⏳ Attendi 10 secondi che Docker Desktop si avvii..."
    sleep 10
fi

# Vai nella directory docker
cd "$(dirname "$0")"

# Verifica file .env
if [ ! -f ".env" ]; then
    echo "📝 Creazione file .env da .env.example..."
    cp .env.example .env
    echo "✅ File .env creato. Puoi modificarlo se necessario."
fi

# Avvia container
echo "🐳 Avvio container Supabase..."
$DOCKER_COMPOSE up -d

echo "⏳ Attesa avvio servizi (15 secondi)..."
sleep 15

# Verifica container
echo ""
echo "📊 Stato container:"
$DOCKER_COMPOSE ps

echo ""
echo "✅ Supabase Docker avviato!"
echo ""
echo "🌐 Servizi disponibili:"
echo "   - Supabase Studio: http://localhost:3000"
echo "   - API: http://localhost:8000"
echo "   - Database: localhost:54322"
echo ""
echo "📝 Prossimi passi:"
echo "   1. Apri http://localhost:3000 in un browser"
echo "   2. Vai su SQL Editor"
echo "   3. Esegui lo schema da ../../database/schema.sql"
echo "   4. Configura .env nella root con:"
echo "      VITE_SUPABASE_URL=http://localhost:8000"
echo "      VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"

