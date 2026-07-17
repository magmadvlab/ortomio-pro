# P4 — Evidenze operazioni fisiche

- **Data:** 17 luglio 2026
- **Branch:** `codex/ortomio-p4-physical-operations`
- **Migrazione:** `20260717020000_p4_physical_operation_lifecycle.sql`
- **Stato:** implementazione locale completata; rollout remoto e prova ThingsBoard sospesi fino a staging P8

## Smart Hub

- ogni comando e persistito con lifecycle `requested`, `sent`, `acknowledged`, `failed`, `timed_out` o `dead_letter`;
- la coppia device/idempotency key impedisce la doppia attuazione;
- organization, garden, zona e device restano nello stesso record di comando; ownership e membership vengono verificate prima del dispatch;
- senza persistenza cloud la route risponde `503` e non simula successo;
- soltanto ThingsBoard e dispatchabile; Tuya e device manuali rispondono `501`;
- la risposta di dispatch e `202 sent`, mai successo operativo;
- l'ack richiede command id, stato osservato coerente e telemetria successiva alla richiesta;
- source, timestamp, unita e range telemetrici sono validati;
- il cron protetto gestisce timeout, retry limitato e dead letter;
- rimossa la simulazione client che incrementava litri/umidita e confermava valvole locali.

## Irrigazione

- rimosso il `GardenTask` fittizio usato soltanto per applicare la pioggia;
- il planner espone fonte del fabbisogno e fallback `estimated_no_sensor` visibile;
- fabbisogno, piano, comando, esecuzione e misura hanno stati distinti;
- volume pianificato e volume misurato restano colonne separate;
- una misura richiede fonte `sensor`, `meter` o `operator` e timestamp;
- l'esecuzione di una schedulazione crea un piano calcolato dalla portata reale del sistema, senza dichiarare un'attuazione non confermata.

## Nutrizione

- l'inventario fertilizzanti legacy e ora DB-first e rifiuta il provider locale;
- dose e unita vengono validate insieme;
- la compatibilita legge `product_compatibility`;
- `complete_nutrition_treatment` blocca trattamento e inventario nella stessa transazione;
- suggerimento e piano non modificano le scorte;
- retry dello stesso completamento non scala due volte lo stock;
- errore inventario/unita/scorta impedisce di dichiarare completata l'applicazione.

## Verifiche

- `npm run test:physical-operations` — 6/6;
- `npm run test:precision-hub` — 228/228;
- `npm run test:security` — 10/10;
- `npm run type-check` — verde;
- `npm run build` — 142/142 pagine;
- PostgreSQL 16 usa-e-getta — migrazione applicata due volte; idempotenza comando, RLS cross-garden, evidenza volume e transazione stock verdi;
- `git diff --check` — verde.

## Gate non forzati

La migrazione non viene applicata a Supabase `main` perche non esiste ancora uno staging con snapshot/backup. Le feature flag avanzate irrigazione/nutrizione restano separate e spente. Le variabili ThingsBoard locali non identificano esplicitamente un device staging: nessun comando fisico e stato inviato a un endpoint potenzialmente reale. Questi gate confluiscono nel rollout P8.
