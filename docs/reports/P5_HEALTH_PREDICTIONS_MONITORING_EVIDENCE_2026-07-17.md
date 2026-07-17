# P5 — Evidenze salute, predizioni e monitoraggio

- **Data:** 17 luglio 2026
- **Branch:** `codex/ortomio-p5-health-predictions-monitoring`
- **Migrazione:** `20260717030000_p5_health_prediction_monitoring.sql`
- **Stato:** implementazione locale completata; migrazione, cron e menu predizioni restano chiusi fino al rollout staging P8

## Salute

- gli engine usano il ledger ambientale persistito e il placeholder dei pattern storici e stato sostituito da riepiloghi misurabili;
- ogni alert durevole contiene fingerprint, fonte `observed`, `predicted` o `simulated`, regola/versione, confidence limitata dalla qualita della fonte, input, freschezza e controindicazioni;
- alert aperti e task di monitoraggio hanno chiavi uniche, quindi restart e retry non generano duplicati;
- vento, pioggia, temperatura, disponibilita del prodotto e verifica dell'intervallo di carenza confluiscono nelle controindicazioni;
- la pagina Salute preferisce gli alert persistiti e mostra evidenze e limiti; in assenza dello schema P5 usa il motore corrente come fallback senza inventare meteo;
- rischio, ipotesi diagnostica, proposta e avvenuta esecuzione non sono piu presentati come lo stesso stato;
- l'analisi foto non genera un costo casuale e non dichiara un task creato automaticamente.

## Predizioni

- `GET /api/ai/predictions` restituisce `405` e non genera piu dati mock;
- `POST` richiede accesso al garden e carica task, meteo persistito, analisi suolo, piante e sensori lato server;
- payload client omonimi per meteo, suolo, salute e task vengono ignorati;
- input canonico, hash SHA-256, modello, regole, qualita fonte, confidence, orizzonte e validita sono persistiti;
- assenza di meteo, suolo/misura umidita o salute osservata produce `insufficient_data` senza forecast inventati;
- gli outcome registrano evidenza, errore assoluto/percentuale o Brier score e aggiornano la calibrazione;
- la lettura di un outcome richiede autenticazione prima della query, evitando enumerazione di prediction id;
- `AI_PREDICTIONS` resta `false`: la pagina non compare nel menu prima della migrazione e dello smoke E2E P8.

## Monitoraggio durevole

- il cron usa il guard canonico con credenziale, timestamp e replay protection;
- ogni finestra di 12 ore produce al massimo una `monitoring_run` per garden;
- alert, ultimo controllo, input/result summary, coda errori e coda notifiche sono persistiti;
- i task critici sono proposte da confermare e usano `monitoring_source_key` idempotente;
- le notifiche rispettano `email_enabled` e `weather_alerts`; altrimenti vengono registrate come `suppressed`;
- il timer browser legacy e disabilitato e non e piu una fonte autorevole di alert o task;
- una fonte simulata ha confidence massima 0,35 e non puo innalzare la confidence reale.

## Verifiche

- `npm run test:health-predictions-monitoring` — 7/7;
- `npm run test:security` — 10/10;
- `npm run test:capabilities` — 7/7;
- `npm run test:persistence` — 9/9;
- `npm run test:physical-operations` — 6/6;
- `npm run test:precision-hub` — 228/228;
- `npm run type-check` — verde;
- `npm run build` — 142/142 pagine;
- PostgreSQL 16 usa-e-getta — migrazione applicata due volte; RLS cross-garden e vincoli su previsione, run, alert e task verdi;
- `git diff --check` — verde.

## Gate non forzati

La migrazione non viene applicata a Supabase `main` perche non e stato identificato uno staging con snapshot e rollback. Il cron non viene invocato contro dati reali e la capability predizioni resta spenta. Applicazione della migrazione, smoke cron, verifica delle code, outcome reale e attivazione del menu appartengono al rollout P8.
