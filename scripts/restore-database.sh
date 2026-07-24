#!/usr/bin/env bash
set -euo pipefail

if [[ "${ALLOW_RESTORE:-}" != "yes" ]]; then
  echo "Restore bloccato: impostare ALLOW_RESTORE=yes su un database staging esplicito." >&2
  exit 2
fi
if [[ -z "${RESTORE_DATABASE_URL:-}" || -z "${1:-}" ]]; then
  echo "Uso: RESTORE_DATABASE_URL=... ALLOW_RESTORE=yes $0 backup.dump" >&2
  exit 2
fi
if [[ ! -f "$1" ]]; then
  echo "Backup non trovato: $1" >&2
  exit 2
fi
if [[ -n "${SOURCE_DATABASE_URL:-}" && "$SOURCE_DATABASE_URL" == "$RESTORE_DATABASE_URL" ]]; then
  echo "Restore bloccato: source e target coincidono." >&2
  exit 2
fi

PG_RESTORE_BIN="${PG_RESTORE_BIN:-pg_restore}"
PSQL_BIN="${PSQL_BIN:-psql}"
SERVER_MAJOR="$($PSQL_BIN "$RESTORE_DATABASE_URL" -Atc 'show server_version_num' | awk '{print int($1/10000)}')"
RESTORE_MAJOR="$($PG_RESTORE_BIN --version | awk '{print $3}' | cut -d. -f1)"
if [[ "$SERVER_MAJOR" != "$RESTORE_MAJOR" ]]; then
  echo "Versione client/server non allineata: pg_restore $RESTORE_MAJOR, server $SERVER_MAJOR." >&2
  exit 3
fi

$PG_RESTORE_BIN --list "$1" >/dev/null
if [[ -f "$1.sha256" ]]; then
  shasum -a 256 -c "$1.sha256"
else
  echo "Checksum assente per il backup: $1.sha256" >&2
  exit 2
fi
$PG_RESTORE_BIN --dbname="$RESTORE_DATABASE_URL" --clean --if-exists --no-owner --no-acl --exit-on-error "$1"
RESTORE_GARDENS_TABLE="$($PSQL_BIN "$RESTORE_DATABASE_URL" -Atc "select to_regclass('public.gardens') is not null")"
if [[ "$RESTORE_GARDENS_TABLE" != "t" ]]; then
  echo "Restore non valido: public.gardens assente." >&2
  exit 4
fi
echo "Restore staging completato e verificato dal codice di uscita di pg_restore."
