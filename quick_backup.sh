#!/bin/bash

# ============================================
# ORTOMIO QUICK BACKUP SCRIPT
# ============================================
# Backup rapido solo dati essenziali

echo "🚀 OrtoMio Quick Backup..."

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="database_backups"
mkdir -p $BACKUP_DIR

# Backup con pg_dump se disponibile
if command -v pg_dump &> /dev/null; then
    echo "📦 Backup con pg_dump..."
    
    # Usa le credenziali dal .env
    DB_URL="postgresql://postgres:[password]@db.qhmujoivfxftlrcrluaj.supabase.co:5432/postgres"
    
    pg_dump "$DB_URL" > "$BACKUP_DIR/quick_backup_${TIMESTAMP}.sql"
    echo "✅ Backup salvato: $BACKUP_DIR/quick_backup_${TIMESTAMP}.sql"
else
    echo "❌ pg_dump non disponibile. Usa lo script completo: ./backup_and_sync_database.sh"
fi