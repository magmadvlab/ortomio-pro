# M07 - Backup, restore e rollback

## Stato

Preparazione locale completata; drill remoto non eseguito per assenza di un database staging isolato.

## Controlli disponibili

- `scripts/backup-database.sh` richiede `DATABASE_URL`, verifica la major PostgreSQL, crea un dump custom, ne valida l'indice e produce checksum SHA-256.
- `scripts/restore-database.sh` richiede `ALLOW_RESTORE=yes` e `RESTORE_DATABASE_URL`, rifiuta source e target uguali quando `SOURCE_DATABASE_URL` e' fornito, verifica checksum e archivio, usa `--exit-on-error` e controlla la presenza finale di `public.gardens`.
- Nessun URL, host o segreto di default e' incluso negli script.

## Comando drill

```bash
DATABASE_URL='<source-staging>' BACKUP_DIR='<directory-sicura>' scripts/backup-database.sh
SOURCE_DATABASE_URL='<source-staging>' RESTORE_DATABASE_URL='<target-staging-vuoto>' ALLOW_RESTORE=yes scripts/restore-database.sh '<backup.dump>'
```

## Evidenza obbligatoria

| Campo | Valore |
|---|---|
| Source staging | da registrare |
| Target restore | da registrare |
| Snapshot/provider ID | da registrare |
| SHA-256 dump | da registrare |
| Inizio/fine backup | da registrare |
| Inizio/fine restore | da registrare |
| RPO misurato | da registrare |
| RTO misurato | da registrare |
| Conteggi pre/post | da registrare |
| Restore cliente selettivo | da eseguire |
| Operatore/revisore | da registrare |

## Condizione di uscita

M07 resta bloccato finche' il drill non viene eseguito su target separato, i conteggi e una riga sentinella non vengono riconciliati e RPO/RTO non sono allegati.
