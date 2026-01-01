#!/bin/bash
# Script di Restore Database OrtoMio
# Ripristina il database da un backup

set -e

# Configurazione
BACKUP_DIR="$HOME/ortomio-backups"
DB_HOST="127.0.0.1"
DB_PORT="54324"
DB_NAME="postgres"
DB_USER="postgres"
DB_PASSWORD="postgres"

# Verifica argomento
if [ -z "$1" ]; then
    echo "❌ Errore: Specifica il file di backup da ripristinare"
    echo ""
    echo "Uso: $0 <file_backup.sql.gz>"
    echo ""
    echo "📁 Backup disponibili:"
    ls -lh "$BACKUP_DIR"/ortomio_backup_*.sql.gz 2>/dev/null || echo "Nessun backup trovato"
    exit 1
fi

BACKUP_FILE="$1"

# Verifica file esiste
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Errore: File $BACKUP_FILE non trovato"
    exit 1
fi

echo "⚠️  ATTENZIONE: Stai per sovrascrivere il database corrente!"
echo "📁 File di backup: $BACKUP_FILE"
echo ""
read -p "Sei sicuro di voler continuare? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "❌ Operazione annullata"
    exit 0
fi

echo ""
echo "🔄 Inizio ripristino database..."

# Decomprimi se necessario
if [[ $BACKUP_FILE == *.gz ]]; then
    TEMP_FILE=$(mktemp)
    gunzip -c "$BACKUP_FILE" > "$TEMP_FILE"
    RESTORE_FILE="$TEMP_FILE"
else
    RESTORE_FILE="$BACKUP_FILE"
fi

# Ripristina database
PGPASSWORD=$DB_PASSWORD psql \
  -h $DB_HOST \
  -p $DB_PORT \
  -U $DB_USER \
  -d $DB_NAME \
  -f "$RESTORE_FILE"

# Pulisci file temporaneo
if [ ! -z "$TEMP_FILE" ]; then
    rm -f "$TEMP_FILE"
fi

echo ""
echo "✅ Database ripristinato con successo!"
echo "🔄 Riavvia l'applicazione per applicare le modifiche"
