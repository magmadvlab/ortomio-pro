#!/bin/bash

# Script per applicare migrazioni database su Supabase online
# 
# USAGE:
#   ./apply_migrations_online.sh [SUPABASE_DB_URL] [SUPABASE_PASSWORD]
#
# NOTA: Questo script richiede psql installato e accesso al database Supabase
# 
# ALTERNATIVA: Usa Supabase SQL Editor invece di questo script

set -e  # Exit on error

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Directory migrazioni
MIGRATIONS_DIR="database/migrations_online"

# Verifica che la directory esista
if [ ! -d "$MIGRATIONS_DIR" ]; then
  echo -e "${RED}Errore: Directory $MIGRATIONS_DIR non trovata${NC}"
  exit 1
fi

# Verifica parametri
if [ -z "$1" ]; then
  echo -e "${YELLOW}Usage: $0 [SUPABASE_DB_URL] [SUPABASE_PASSWORD]${NC}"
  echo -e "${YELLOW}Esempio: $0 postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres${NC}"
  echo ""
  echo -e "${YELLOW}NOTA: Per sicurezza, è consigliato usare Supabase SQL Editor invece di questo script${NC}"
  exit 1
fi

DB_URL="$1"
DB_PASSWORD="${2:-}"

# Lista migrazioni in ordine
MIGRATIONS=(
  "01_core_schema.sql"
  "02_user_profiles.sql"
  "03_plant_taxonomy.sql"
  "03b_plant_taxonomy_seed.sql"
  "04_garden_features.sql"
  "05_irrigation_system.sql"
  "06_sapling_seedling.sql"
  "07_advanced_features.sql"
  "08_performance_fixes.sql"
  "09_tier_system.sql"
)

echo -e "${GREEN}=== Applicazione Migrazioni Database ===${NC}"
echo ""

# Verifica connessione
echo -e "${YELLOW}Verifica connessione al database...${NC}"
if ! psql "$DB_URL" -c "SELECT 1;" > /dev/null 2>&1; then
  echo -e "${RED}Errore: Impossibile connettersi al database${NC}"
  echo -e "${YELLOW}Verifica URL e password${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Connessione OK${NC}"
echo ""

# Applica migrazioni
SUCCESS_COUNT=0
FAILED_COUNT=0
FAILED_MIGRATIONS=()

for migration in "${MIGRATIONS[@]}"; do
  migration_path="$MIGRATIONS_DIR/$migration"
  
  if [ ! -f "$migration_path" ]; then
    echo -e "${RED}✗ File non trovato: $migration${NC}"
    FAILED_COUNT=$((FAILED_COUNT + 1))
    FAILED_MIGRATIONS+=("$migration")
    continue
  fi
  
  echo -e "${YELLOW}Applicando: $migration...${NC}"
  
  if psql "$DB_URL" -f "$migration_path" > /tmp/migration_${migration}.log 2>&1; then
    echo -e "${GREEN}✓ $migration applicata con successo${NC}"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  else
    echo -e "${RED}✗ Errore applicando $migration${NC}"
    echo -e "${YELLOW}Log: /tmp/migration_${migration}.log${NC}"
    FAILED_COUNT=$((FAILED_COUNT + 1))
    FAILED_MIGRATIONS+=("$migration")
    
    # Chiedi se continuare
    read -p "Continuare con le migrazioni successive? (s/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
      echo -e "${YELLOW}Migrazione interrotta dall'utente${NC}"
      break
    fi
  fi
  
  echo ""
done

# Riepilogo
echo -e "${GREEN}=== Riepilogo ===${NC}"
echo -e "${GREEN}Migrazioni applicate con successo: $SUCCESS_COUNT${NC}"
echo -e "${RED}Migrazioni fallite: $FAILED_COUNT${NC}"

if [ $FAILED_COUNT -gt 0 ]; then
  echo -e "${RED}Migrazioni fallite:${NC}"
  for failed in "${FAILED_MIGRATIONS[@]}"; do
    echo -e "  - $failed"
  done
  echo ""
  echo -e "${YELLOW}Verifica i log in /tmp/migration_*.log${NC}"
  exit 1
else
  echo -e "${GREEN}Tutte le migrazioni sono state applicate con successo!${NC}"
  exit 0
fi

