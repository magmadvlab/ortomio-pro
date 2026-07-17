#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL e obbligatoria; nessun host/password di default e ammesso." >&2
  exit 2
fi

BACKUP_DIR="${BACKUP_DIR:-$HOME/ortomio-backups}"
PG_DUMP_BIN="${PG_DUMP_BIN:-pg_dump}"
PG_RESTORE_BIN="${PG_RESTORE_BIN:-pg_restore}"
PSQL_BIN="${PSQL_BIN:-psql}"
SERVER_MAJOR="$($PSQL_BIN "$DATABASE_URL" -Atc 'show server_version_num' | awk '{print int($1/10000)}')"
DUMP_MAJOR="$($PG_DUMP_BIN --version | awk '{print $3}' | cut -d. -f1)"
if [[ "$SERVER_MAJOR" != "$DUMP_MAJOR" ]]; then
  echo "Versione client/server non allineata: pg_dump $DUMP_MAJOR, server $SERVER_MAJOR." >&2
  exit 3
fi
mkdir -p "$BACKUP_DIR"
BACKUP_FILE="${1:-$BACKUP_DIR/ortomio_$(date -u +%Y%m%dT%H%M%SZ).dump}"
$PG_DUMP_BIN "$DATABASE_URL" --format=custom --no-owner --no-acl --file="$BACKUP_FILE"
$PG_RESTORE_BIN --list "$BACKUP_FILE" >/dev/null
chmod 600 "$BACKUP_FILE"
echo "$BACKUP_FILE"
