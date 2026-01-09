#!/bin/bash
# Script per risolvere il problema del container storage Supabase bloccato

set -e

echo "🔧 Risoluzione problema container storage Supabase..."
echo ""

# Prova a rimuovere il container bloccato
echo "1. Fermando Supabase..."
supabase stop 2>/dev/null || true

echo ""
echo "2. Rimuovendo container storage bloccato..."

# Prova diversi modi per rimuovere il container
CONTAINER_ID="0c8bcefad95e83695bb31c2d90a4e1622cff6c6409309e347c50ddd30de23966"
CONTAINER_NAME="supabase_storage_ortomio-main"

# Se Docker è nel PATH, prova a rimuovere
if command -v docker &> /dev/null; then
    echo "   Rimuovendo container $CONTAINER_ID..."
    docker rm -f "$CONTAINER_ID" 2>/dev/null || true
    
    echo "   Rimuovendo container $CONTAINER_NAME..."
    docker rm -f "$CONTAINER_NAME" 2>/dev/null || true
    
    echo "   Rimuovendo tutti i container supabase..."
    docker ps -aq --filter "name=supabase" | xargs -r docker rm -f 2>/dev/null || true
else
    echo "   ⚠️  Docker non trovato nel PATH"
    echo "   Devi rimuovere manualmente il container da Docker Desktop:"
    echo "   - Container ID: $CONTAINER_ID"
    echo "   - Container Name: $CONTAINER_NAME"
fi

echo ""
echo "3. Rimuovendo volumi storage problematici..."
if command -v docker &> /dev/null; then
    docker volume ls --filter "label=com.supabase.cli.project=ortomio-main" --format "{{.Name}}" | grep storage | xargs -r docker volume rm 2>/dev/null || echo "   Nessun volume da rimuovere"
else
    echo "   ⚠️  Docker non disponibile - rimuovi manualmente i volumi da Docker Desktop"
fi

echo ""
echo "4. Riavviando Supabase..."
supabase start

echo ""
echo "✅ Completato!"
echo ""
echo "💡 Se ci sono ancora errori:"
echo "   1. Apri Docker Desktop"
echo "   2. Rimuovi manualmente tutti i container che iniziano con 'supabase_'"
echo "   3. Rimuovi i volumi che iniziano con 'supabase_storage'"
echo "   4. Poi esegui: supabase start"

