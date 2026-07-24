# M06 - Runbook di riconciliazione migrazioni

## Stato

Riconciliazione inventariata ma applicazione bloccata. Il database collegato non deve ricevere `db push` finche' i conflitti di history non sono risolti e non esiste un target staging con snapshot recuperabile.

## Evidenze read-only

- `supabase migration list`: 40 versioni remote e 119 righe locali riconosciute dalla CLI.
- Record remoto orfano: `20260108220000`.
- File speciali non eseguibili: `20260104000000_add_field_rows_to_operations.sql.bak`, `20260111000000_integrate_plant_row_tracking.sql.skip`, `EMERGENCY_fix_tier_online.sql`.
- Timestamp attivi duplicati: `20260120000000`, `20260213000001`, `20260717000000`.
- Il dump schema collegato non e' stato acquisito: la CLI richiede Docker Desktop, non attivo sulla macchina.

Il dettaglio canonico e' in `M06_MIGRATION_RECONCILIATION_2026-07-24.csv`, rigenerabile con `node scripts/audit-migration-history.mjs`.

## Sequenza sicura

1. Creare un progetto Supabase staging isolato.
2. Acquisire snapshot consistente e verificare un restore su un secondo target.
3. Esportare schema `public`, history `supabase_migrations.schema_migrations`, policy, indici e funzioni.
4. Risolvere prima i tre timestamp duplicati assegnando versioni univoche senza modificare file gia' applicati.
5. Recuperare o ricostruire il contenuto della migrazione remota orfana `20260108220000`.
6. Per ogni batch `Bxx`, verificare gli oggetti dichiarati contro lo schema staging prima dell'applicazione.
7. Applicare un solo batch, eseguire test RLS e smoke test, quindi acquisire un nuovo snapshot.
8. Interrompere al primo errore; ripristinare lo snapshot invece di alterare manualmente la history.

## Preflight per batch

- nessun timestamp duplicato;
- dipendenze di tabelle, colonne, enum e funzioni presenti;
- istruzioni distruttive elencate e approvate;
- policy confrontate per ruolo e garden;
- rollback o restore point disponibile;
- `supabase migration list` coerente dopo il batch.

## Condizione di sblocco

M06 puo' diventare completato solo con schema dump staging, classificazione oggetto-per-oggetto, applicazione ordinata di tutti i batch e history finale senza righe orfane o conflitti.
