#!/bin/bash

# Script per generare API keys Supabase da JWT_SECRET
# Uso: ./generate-keys.sh [JWT_SECRET]

if [ -z "$1" ]; then
    echo "Genera JWT_SECRET casuale..."
    JWT_SECRET=$(openssl rand -base64 32)
    echo "JWT_SECRET generato: $JWT_SECRET"
else
    JWT_SECRET=$1
fi

# Per Supabase locale, le keys sono semplicemente derivate da JWT_SECRET
# In produzione, vengono generate in modo più complesso, ma per locale va bene così

echo ""
echo "Aggiungi queste variabili al file .env:"
echo ""
echo "JWT_SECRET=$JWT_SECRET"
echo "POSTGRES_PASSWORD=$(openssl rand -base64 24)"
echo ""
echo "NOTA: Le ANON_KEY e SERVICE_ROLE_KEY verranno generate automaticamente"
echo "      quando avvii Supabase. Puoi ottenerle da Studio → Settings → API"
echo "      oppure dai log: docker-compose logs studio | grep -i key"

