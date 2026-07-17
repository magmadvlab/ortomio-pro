# P3 — Evidenze persistenza del nucleo operativo

- **Data:** 17 luglio 2026
- **Branch:** `codex/ortomio-p3-persistence`
- **Migrazione:** `20260717010000_p3_core_persistence.sql`
- **Stato:** implementazione e verifica locale completate; rollout remoto sospeso per assenza di staging/backup

## Contratti canonici

| Ambito | Fonte canonica | Decisione |
|---|---|---|
| eventi operativi | `diary_events` | writer/reader unico, idempotenza, edit/void con revisioni audit |
| snapshot giornaliero | `daily_diary_entries` | resta il riepilogo meteo/agronomico automatico, non un secondo registro operativo |
| memoria agronomica | `agronomic_memory_events` | sostituisce i fatti scritti nelle preferenze profilo; backfill idempotente incluso |
| piante individuali | `individual_plants` + `individual_plant_operations` | operazioni singole/bulk via provider, lineage e idempotency key |
| trattamenti | `treatment_register` | registro regolatorio canonico; campi applicativi append-only |
| inventario fito | `phyto_inventory` | scorte DB-first; consumo soltanto su esecuzione confermata |
| suolo | `soil_memory` e ledger ambientali esistenti | nessun nuovo writer concorrente |

I servizi critici riconoscono `persistenceKind=local` e rifiutano il write. Il local storage resta ammesso soltanto per preferenze UI e flussi non regolatori.

## Diario

- il tipo unico include garden, zona, filare, pianta, autore, fonte, task, allegati, stato e revisione;
- il quick event usa il writer reale e rilegge il record dopo il salvataggio;
- upload foto usa lo storage provider esistente;
- modifica e annullamento sono disponibili dalla timeline;
- ogni update salva lo snapshot precedente in `diary_event_revisions`;
- `/app/journal` resta soltanto alias verso `/app/diary`.

## Piante, trattamenti e inventario

- eliminate le simulazioni di salvataggio e gli URL `example.com` da `plantOperationsService`;
- bulk retry reso idempotente per data/tipo/pianta/scope;
- il trattamento non modifica automaticamente la salute: serve un outcome osservato;
- trattamento e inventario usano il provider DB, includono lotto, dose, operatore, meteo, carenza e outcome efficacia;
- i campi prodotto/data/dose/carenza del registro sono protetti da trigger append-only;
- una scorta può essere scalata soltanto con `confirmedExecution=true`.

## Verifiche

- `npm run test:persistence` — 9/9;
- test SQL PostgreSQL 16 usa-e-getta — migrazione applicata due volte, audit, RLS cross-garden, guardia regolatoria e backfill idempotente verdi;
- `npm run type-check` — verde;
- `npm run test:security` — 10/10;
- `npm run test:precision-hub` — 228/228;
- `npm run build` — 141/141 pagine;
- `git diff --check` — verde.

## Gate remoto

La migrazione non viene applicata a Supabase `main`: il progetto non dispone di branch/staging ne backup sul piano corrente. Restano quindi obbligatori snapshot pre-migrazione, prova allegato cross-user sullo storage remoto, report pre/post e rollback operativo prima della produzione.
