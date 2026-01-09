#!/bin/bash

# ============================================================================
# Pre-Deploy Check Script
# ============================================================================
# Questo script verifica:
# 1. Errori TypeScript
# 2. Errori Linter
# 3. Build Next.js
# 4. Schema database (opzionale)
# 
# Uso: ./scripts/pre-deploy-check.sh [--skip-build]
# ============================================================================

set -e  # Exit on error

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Flag per skip build
SKIP_BUILD=false
if [[ "$1" == "--skip-build" ]]; then
  SKIP_BUILD=true
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Pre-Deploy Check - OrtoMio${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Funzione per stampare errori
print_error() {
  echo -e "${RED}❌ $1${NC}"
}

# Funzione per stampare successi
print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

# Funzione per stampare warning
print_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

# Funzione per stampare info
print_info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

# Contatore errori
ERROR_COUNT=0

# ============================================================================
# 1. Verifica TypeScript
# ============================================================================
echo -e "${BLUE}[1/4] Verifica TypeScript...${NC}"
if npm run type-check > /dev/null 2>&1; then
  print_success "TypeScript: Nessun errore trovato"
else
  print_error "TypeScript: Errori trovati!"
  print_info "Esegui 'npm run type-check' per vedere i dettagli"
  ERROR_COUNT=$((ERROR_COUNT + 1))
fi
echo ""

# ============================================================================
# 2. Verifica Linter
# ============================================================================
echo -e "${BLUE}[2/4] Verifica Linter...${NC}"
if npm run lint > /dev/null 2>&1; then
  print_success "Linter: Nessun errore trovato"
else
  print_error "Linter: Errori trovati!"
  print_info "Esegui 'npm run lint' per vedere i dettagli"
  ERROR_COUNT=$((ERROR_COUNT + 1))
fi
echo ""

# ============================================================================
# 3. Verifica Build Next.js
# ============================================================================
if [ "$SKIP_BUILD" = false ]; then
  echo -e "${BLUE}[3/4] Verifica Build Next.js...${NC}"
  print_info "Questo potrebbe richiedere alcuni minuti..."
  
  if npm run build:next > /dev/null 2>&1; then
    print_success "Build: Compilazione riuscita"
  else
    print_error "Build: Errore durante la compilazione!"
    print_info "Esegui 'npm run build:next' per vedere i dettagli"
    ERROR_COUNT=$((ERROR_COUNT + 1))
  fi
  echo ""
else
  print_warning "[3/4] Build Next.js: SKIPPATO (usa --skip-build per saltare)"
  echo ""
fi

# ============================================================================
# 4. Verifica Schema Database (opzionale)
# ============================================================================
echo -e "${BLUE}[4/4] Verifica Schema Database...${NC}"

# Verifica che il file di riferimento esista
if [ -f "database_schema_online_reference.sql" ]; then
  print_success "File schema di riferimento trovato"
  
  # Verifica che non ci siano extensions.uuid_generate_v4() nel file di riferimento
  if grep -q "extensions.uuid_generate_v4()" database_schema_online_reference.sql 2>/dev/null; then
    print_error "Schema: Trovato 'extensions.uuid_generate_v4()' nel file di riferimento!"
    print_info "Dovrebbe essere 'gen_random_uuid()' per Supabase"
    ERROR_COUNT=$((ERROR_COUNT + 1))
  else
    print_success "Schema: Usa gen_random_uuid() correttamente"
  fi
  
  # Verifica che ci siano le RLS policies per INSERT
  if grep -q "Users can insert their own profile" database_schema_online_reference.sql 2>/dev/null && \
     grep -q "Users can insert their gardens" database_schema_online_reference.sql 2>/dev/null; then
    print_success "Schema: RLS policies per INSERT presenti"
  else
    print_warning "Schema: RLS policies per INSERT potrebbero mancare"
    print_info "Verifica che profiles e gardens abbiano policy INSERT esplicite"
  fi
else
  print_warning "Schema: File di riferimento non trovato (opzionale)"
fi
echo ""

# ============================================================================
# Riepilogo
# ============================================================================
echo -e "${BLUE}========================================${NC}"
if [ $ERROR_COUNT -eq 0 ]; then
  print_success "Tutti i controlli superati! ✅"
  echo ""
  echo -e "${GREEN}Pronto per commit e deploy!${NC}"
  exit 0
else
  print_error "Trovati $ERROR_COUNT errore/i! ❌"
  echo ""
  echo -e "${RED}Correggi gli errori prima di fare commit o deploy.${NC}"
  echo ""
  echo "Comandi utili:"
  echo "  npm run type-check    # Verifica TypeScript"
  echo "  npm run lint          # Verifica Linter"
  echo "  npm run build:next    # Verifica Build"
  exit 1
fi

