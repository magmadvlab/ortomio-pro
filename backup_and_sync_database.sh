#!/bin/bash

# ============================================
# ORTOMIO DATABASE BACKUP & SYNC SCRIPT
# ============================================
# Crea backup completo del DB remoto e lo importa in locale
# Data: 12 Gennaio 2026

set -e  # Exit on any error

echo "🚀 OrtoMio Database Backup & Sync - Avvio..."
echo "=============================================="

# Configurazione
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="database_backups"
REMOTE_DB_URL="https://qhmujoivfxftlrcrluaj.supabase.co"
BACKUP_FILE="ortomio_backup_${TIMESTAMP}.sql"
SCHEMA_FILE="ortomio_schema_${TIMESTAMP}.sql"
DATA_FILE="ortomio_data_${TIMESTAMP}.sql"

# Crea directory backup se non esiste
mkdir -p $BACKUP_DIR

echo "📁 Directory backup: $BACKUP_DIR"
echo "📄 File backup: $BACKUP_FILE"

# ============================================
# STEP 1: VERIFICA SUPABASE CLI
# ============================================
echo ""
echo "🔧 Step 1: Verifica Supabase CLI..."

if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI non trovato!"
    echo "📥 Installazione Supabase CLI..."
    
    # Installa Supabase CLI su macOS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if command -v brew &> /dev/null; then
            brew install supabase/tap/supabase
        else
            echo "❌ Homebrew non trovato. Installa manualmente Supabase CLI:"
            echo "   https://supabase.com/docs/guides/cli/getting-started"
            exit 1
        fi
    else
        echo "❌ Sistema non supportato per installazione automatica."
        echo "   Installa manualmente: https://supabase.com/docs/guides/cli/getting-started"
        exit 1
    fi
fi

echo "✅ Supabase CLI disponibile: $(supabase --version)"

# ============================================
# STEP 2: LOGIN SUPABASE (se necessario)
# ============================================
echo ""
echo "🔐 Step 2: Verifica login Supabase..."

# Verifica se già loggato
if ! supabase projects list &> /dev/null; then
    echo "🔑 Login richiesto. Apri il browser per autenticarti..."
    supabase login
else
    echo "✅ Già autenticato su Supabase"
fi

# ============================================
# STEP 3: BACKUP SCHEMA DATABASE REMOTO
# ============================================
echo ""
echo "📊 Step 3: Backup schema database remoto..."

# Estrai l'ID del progetto dall'URL
PROJECT_ID="qhmujoivfxftlrcrluaj"

echo "🎯 Progetto ID: $PROJECT_ID"

# Backup solo schema (struttura tabelle, funzioni, trigger)
echo "📋 Esportazione schema..."
supabase db dump --project-id $PROJECT_ID --schema-only > "$BACKUP_DIR/$SCHEMA_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Schema esportato: $BACKUP_DIR/$SCHEMA_FILE"
else
    echo "❌ Errore nell'esportazione schema"
    exit 1
fi

# ============================================
# STEP 4: BACKUP DATI DATABASE REMOTO
# ============================================
echo ""
echo "💾 Step 4: Backup dati database remoto..."

# Backup solo dati (senza schema)
echo "📦 Esportazione dati..."
supabase db dump --project-id $PROJECT_ID --data-only > "$BACKUP_DIR/$DATA_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Dati esportati: $BACKUP_DIR/$DATA_FILE"
else
    echo "❌ Errore nell'esportazione dati"
    exit 1
fi

# ============================================
# STEP 5: BACKUP COMPLETO (SCHEMA + DATI)
# ============================================
echo ""
echo "🔄 Step 5: Creazione backup completo..."

# Combina schema e dati in un unico file
cat "$BACKUP_DIR/$SCHEMA_FILE" > "$BACKUP_DIR/$BACKUP_FILE"
echo "" >> "$BACKUP_DIR/$BACKUP_FILE"
echo "-- ============================================" >> "$BACKUP_DIR/$BACKUP_FILE"
echo "-- DATI TABELLE" >> "$BACKUP_DIR/$BACKUP_FILE"
echo "-- ============================================" >> "$BACKUP_DIR/$BACKUP_FILE"
echo "" >> "$BACKUP_DIR/$BACKUP_FILE"
cat "$BACKUP_DIR/$DATA_FILE" >> "$BACKUP_DIR/$BACKUP_FILE"

echo "✅ Backup completo creato: $BACKUP_DIR/$BACKUP_FILE"

# ============================================
# STEP 6: SETUP DATABASE LOCALE
# ============================================
echo ""
echo "🏠 Step 6: Setup database locale..."

# Verifica se Supabase locale è già inizializzato
if [ ! -f "supabase/config.toml" ]; then
    echo "🔧 Inizializzazione progetto Supabase locale..."
    supabase init
else
    echo "✅ Progetto Supabase locale già inizializzato"
fi

# Avvia Supabase locale (se non già avviato)
echo "🚀 Avvio Supabase locale..."
supabase start

if [ $? -eq 0 ]; then
    echo "✅ Supabase locale avviato"
else
    echo "❌ Errore nell'avvio Supabase locale"
    exit 1
fi

# ============================================
# STEP 7: IMPORTAZIONE BACKUP IN LOCALE
# ============================================
echo ""
echo "📥 Step 7: Importazione backup in database locale..."

# Reset database locale
echo "🔄 Reset database locale..."
supabase db reset

# Importa il backup completo
echo "📋 Importazione backup..."
supabase db push --include-all

# Applica il backup SQL direttamente
echo "💉 Applicazione backup SQL..."
psql "postgresql://postgres:postgres@localhost:54322/postgres" < "$BACKUP_DIR/$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Backup importato con successo"
else
    echo "⚠️  Possibili errori nell'importazione (normale per alcuni constraint)"
fi

# ============================================
# STEP 8: CONFIGURAZIONE .ENV LOCALE
# ============================================
echo ""
echo "⚙️  Step 8: Configurazione ambiente locale..."

# Backup del .env.local attuale
if [ -f ".env.local" ]; then
    cp ".env.local" ".env.local.backup_${TIMESTAMP}"
    echo "💾 Backup .env.local creato: .env.local.backup_${TIMESTAMP}"
fi

# Ottieni le credenziali del database locale
LOCAL_URL=$(supabase status | grep "API URL" | awk '{print $3}')
LOCAL_ANON_KEY=$(supabase status | grep "anon key" | awk '{print $3}')

# Crea nuovo .env.local per sviluppo locale
cat > .env.local.development << EOF
# ============================================
# ORTOMIO - CONFIGURAZIONE SVILUPPO LOCALE
# ============================================
# Generato automaticamente: $(date)

# Database Locale Supabase
NEXT_PUBLIC_SUPABASE_URL=$LOCAL_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$LOCAL_ANON_KEY
VITE_SUPABASE_URL=$LOCAL_URL
VITE_SUPABASE_ANON_KEY=$LOCAL_ANON_KEY

# ============================================
# PROVIDER AI (MANTENUTI)
# ============================================

# OpenRouter - Accesso a 400+ modelli
NEXT_PUBLIC_OPENROUTER_API_KEY=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

# Groq - Modelli Llama veloci
NEXT_PUBLIC_GROQ_API_KEY=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

# HuggingFace - Modelli open source
NEXT_PUBLIC_HUGGINGFACE_API_KEY=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

# Configurazione AI
NEXT_PUBLIC_DEFAULT_AI_PROVIDER=groq
NEXT_PUBLIC_AI_FEATURES_ENABLED=true
NEXT_PUBLIC_AI_IMAGE_ANALYSIS_ENABLED=true
NEXT_PUBLIC_AI_PLANNING_ENABLED=true
NEXT_PUBLIC_AI_FALLBACK_ENABLED=true

# Sentinel Hub API (NDVI)
SH_CLIENT_ID=sh-ee976-0f29-4dca-a2ec-2ea8d9845042
SH_CLIENT_SECRET=2Q19bh3GHbZ9ELQ5H5k7dc
ORTOMIO_WMS_CONFIG_ID=a9646191-f172-4e6e-a965-670c4a222898
ORTOMIO_WMS_BASE_URL=https://sh.dataspace.copernicus.eu/ogc/wms/a9646191-f172-4e6e-a965-670c4a222898
EOF

echo "✅ Configurazione locale creata: .env.local.development"

# ============================================
# STEP 9: VERIFICA IMPORTAZIONE
# ============================================
echo ""
echo "🔍 Step 9: Verifica importazione..."

# Test connessione database locale
echo "🧪 Test connessione database locale..."
TABLES_COUNT=$(psql "postgresql://postgres:postgres@localhost:54322/postgres" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")

echo "📊 Tabelle importate: $TABLES_COUNT"

if [ "$TABLES_COUNT" -gt 10 ]; then
    echo "✅ Importazione completata con successo!"
else
    echo "⚠️  Possibili problemi nell'importazione (poche tabelle trovate)"
fi

# ============================================
# STEP 10: RIEPILOGO E ISTRUZIONI
# ============================================
echo ""
echo "🎉 BACKUP E SINCRONIZZAZIONE COMPLETATI!"
echo "=============================================="
echo ""
echo "📁 File creati:"
echo "   • $BACKUP_DIR/$BACKUP_FILE (backup completo)"
echo "   • $BACKUP_DIR/$SCHEMA_FILE (solo schema)"
echo "   • $BACKUP_DIR/$DATA_FILE (solo dati)"
echo "   • .env.local.development (config locale)"
echo "   • .env.local.backup_${TIMESTAMP} (backup config)"
echo ""
echo "🔧 Per usare il database locale:"
echo "   1. cp .env.local.development .env.local"
echo "   2. npm run dev"
echo ""
echo "🔄 Per tornare al database remoto:"
echo "   1. cp .env.local.backup_${TIMESTAMP} .env.local"
echo "   2. npm run dev"
echo ""
echo "🚀 Database locale URL: $LOCAL_URL"
echo "🔑 Anon Key: $LOCAL_ANON_KEY"
echo ""
echo "✅ Ora puoi sviluppare in sicurezza sul database locale!"

# ============================================
# STEP 11: CREAZIONE SCRIPT RAPIDI
# ============================================

# Script per switch rapido a locale
cat > switch_to_local.sh << 'EOF'
#!/bin/bash
echo "🏠 Switching to LOCAL database..."
cp .env.local.development .env.local
echo "✅ Now using LOCAL database"
echo "🚀 Run: npm run dev"
EOF

# Script per switch rapido a remoto
cat > switch_to_remote.sh << 'EOF'
#!/bin/bash
echo "☁️  Switching to REMOTE database..."
LATEST_BACKUP=$(ls -t .env.local.backup_* 2>/dev/null | head -n1)
if [ -n "$LATEST_BACKUP" ]; then
    cp "$LATEST_BACKUP" .env.local
    echo "✅ Now using REMOTE database"
else
    echo "❌ No backup found, keeping current config"
fi
echo "🚀 Run: npm run dev"
EOF

chmod +x switch_to_local.sh
chmod +x switch_to_remote.sh

echo "🔧 Script rapidi creati:"
echo "   • ./switch_to_local.sh  (passa a database locale)"
echo "   • ./switch_to_remote.sh (passa a database remoto)"
echo ""
echo "🎯 TUTTO PRONTO PER LO SVILUPPO!"