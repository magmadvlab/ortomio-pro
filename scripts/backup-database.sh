#!/bin/bash
# Script di Backup Automatico Database OrtoMio
# Crea backup giornalieri del database PostgreSQL

set -e

# Configurazione
BACKUP_DIR="$HOME/ortomio-backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_HOST="127.0.0.1"
DB_PORT="54324"
DB_NAME="postgres"
DB_USER="postgres"
DB_PASSWORD="postgres"
RETENTION_DAYS=30

# Crea directory backup se non esiste
mkdir -p "$BACKUP_DIR"

# Nome file backup
BACKUP_FILE="$BACKUP_DIR/ortomio_backup_$DATE.sql"
BACKUP_FILE_GZ="$BACKUP_FILE.gz"

echo "🔄 Inizio backup database OrtoMio..."
echo "📅 Data: $(date)"

# Esegui backup
PGPASSWORD=$DB_PASSWORD pg_dump \
  -h $DB_HOST \
  -p $DB_PORT \
  -U $DB_USER \
  -d $DB_NAME \
  --clean \
  --if-exists \
  --no-owner \
  --no-acl \
  -f "$BACKUP_FILE"

# Comprimi backup
gzip "$BACKUP_FILE"

echo "✅ Backup completato: $BACKUP_FILE_GZ"
echo "📊 Dimensione: $(du -h "$BACKUP_FILE_GZ" | cut -f1)"

# Rimuovi backup vecchi (oltre retention_days)
echo "🧹 Pulizia backup vecchi (oltre $RETENTION_DAYS giorni)..."
find "$BACKUP_DIR" -name "ortomio_backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete

# Lista backup esistenti
echo ""
echo "📁 Backup disponibili:"
ls -lh "$BACKUP_DIR"/ortomio_backup_*.sql.gz 2>/dev/null | tail -5 || echo "Nessun backup trovato"

echo ""
echo "✨ Backup completato con successo!"
