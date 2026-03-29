# PRECISION AGRICULTURE CONSOLIDATED ROADMAP (2026-03-20)

## Obiettivo
Unificare il piano originario, la gap map e l'audit tecnico in una sola roadmap operativa.

La regola da seguire da ora in poi e:
- non aprire nuove aree mentre restano fragilita sul blocco gia costruito
- distinguere chiaramente `chiuso`, `parziale`, `rimandato`, `non iniziato`
- lavorare per una sola linea: `hardening P0 -> validazione reale -> P1`

## Stato consolidato

### Chiuso lato sviluppo
- `P0-A1` catalogo sensori prioritari
- `P0-A2` metadati qualita letture
- `P0-A3` binding agronomico device -> zona/filare/pianta
- `P0-B1` telemetria irrigua nel dominio
- `P0-B2` comando/conferma/timeout/log
- `P0-B3` closed loop irriguo, KPI, benchmark, correzioni, rollback
- `P0-C1` segnali microclimatici
- `P0-C2` modelli coltura-specifici di primo livello
- `P0-C3` alert con fattori usati e confidenza

### Chiuso lato database
- migrazioni sensori P0 applicate
- migrazioni `smart_devices` applicate
- migrazioni `smart_device_automation_logs` applicate
- smoke test remoto su Supabase eseguito con esito positivo

### Rimandato ma non mancante come sviluppo
- verifica `UI -> Supabase`
- verifica `automation logs -> Supabase`
- verifica `ThingsBoard webhook -> update device`

### Ancora parziale
- hardening runtime del blocco Smart Hub / telemetry / analytics
- copertura test automatica del nuovo stack
- validazione reale sul campo di soglie e modelli

### Non iniziato
- `P1-A1` fenologia strutturata
- `P1-A2` qualita raccolta
- `P1-B1` prescrizione persistita con versione
- `P1-B2` legame prescrizione -> esecuzione
- `P1-B3` valutazione efficacia prescrizione

## Audit dei punti ancora aperti

## Blocco H0 - Hardening del P0

### H0-1 - Eliminare il fallback silenzioso cloud -> locale
Problema:
- se Supabase fallisce, oggi alcune operazioni ricadono su `localStorage`
- il rischio e stato divergente tra browser e cloud

Da fare:
1. decidere policy unica:
   - o `strict cloud` quando Supabase e disponibile
   - oppure `degraded mode` esplicito in UI
2. propagare errore a pagina e componenti
3. mostrare badge/stato persistenza reale nello Smart Hub
4. impedire che un comando venga mostrato come riuscito se e solo locale

Accettazione:
- nessuna scrittura cloud fallita viene percepita come successo pieno

### H0-2 - Rendere il webhook telemetrico atomicamente affidabile
Problema:
- il device puo aggiornarsi anche se il log di audit fallisce

Da fare:
1. decidere se `device update` e `log insert` devono essere entrambi obbligatori
2. se non si usa transazione completa, almeno:
   - marcare il device come `audit_incomplete`
   - esporre errore osservabile
   - prevedere retry del log
3. aggiungere logging strutturato server-side

Accettazione:
- nessuna conferma telemetrica rilevante viene persa senza evidenza operativa

### H0-3 - Isolare i fallimenti parziali della pagina Smart Hub
Problema:
- un errore nel fetch qualità sensore puo azzerare anche la diagnostica irrigua

Da fare:
1. separare fetch `scopeDiagnostics` e `sensorQuality`
2. usare stato errore distinto per ciascun blocco
3. lasciare visibile il dato valido anche quando un sotto-servizio fallisce

Accettazione:
- un sottosistema degradato non spegne tutta la lettura operativa della pagina

### H0-4 - Ridurre fragilita analytics
Problema:
- alcune parti analytics sono corrette ma fragili a refactor futuri

Da fare:
1. eliminare sort mutabili su array condivisi nel benchmark
2. introdurre helper puri e testabili per:
   - best scope
   - worst scope
   - gap ranking
   - raccomandazioni
3. verificare coerenza tra analytics e UI cards

Accettazione:
- benchmark e raccomandazioni sono deterministici e facili da testare

### H0-5 - Copertura test minima del nuovo blocco
Problema:
- il nuovo stack e quasi tutto privo di test automatici

Da fare:
1. completato:
   - test provider cloud su `create/update/log`
   - test route `/api/iot/devices/telemetry`
   - test route `/api/iot/devices/command`
   - test health microclimate snapshot e trigger principali
   - test analytics su benchmark/gap/actions
   - test rollback/action history con `rolledBack` e confronto `prima/dopo`

Accettazione:
- i flussi critici P0 hanno copertura minima anti-regressione

## Blocco V0 - Validazione operativa reale

### V0-1 - UI verso Supabase
Completato:
1. creato device temporaneo via provider cloud reale
2. aggiornato il device sul DB remoto
3. confermato record su `smart_devices`

### V0-2 - Log verso Supabase
Completato:
1. scritto un log automazione reale via provider cloud
2. confermato record su `smart_device_automation_logs`
3. verificato cleanup finale dei dati temporanei

### V0-3 - Webhook ThingsBoard
Completato:
1. inviato payload telemetrico di prova al route handler reale
2. verificato update stato device su DB remoto
3. verificato log telemetrico generato e cleanup finale

Accettazione:
- il ciclo end-to-end funziona in ambiente reale, non solo in codice

## Blocco P1-A - Fenologia e qualita

### P1-A1 - Fenologia strutturata
Stato: `completato il 20 marzo 2026`

Microstep:
1. definire enum fasi per vigneto, oliveto, frutteto
2. creare entita `phenology_observations`
3. legare osservazione a `garden/zone/field_row/tree/plant`
4. aggiungere storico fase con data osservazione e fonte
5. esporre fase corrente al motore salute

Accettazione:
- ogni alert sanitario puo leggere la fase fenologica reale dello scope

### P1-A2 - Qualita raccolta
Stato: `completato il 20 marzo 2026`

Microstep:
1. creare entita `quality_results`
2. definire metriche per coltura
3. legare la qualita a scope, data, lotto e raccolta
4. mostrare storico qualita per area omogenea

Accettazione:
- resa e qualita possono essere confrontate con interventi e condizioni

## Blocco P1-B - Prescrizione, esecuzione, outcome

### P1-B1 - Prescrizione persistita
Stato: `completato il 21 marzo 2026`

Microstep:
1. creare `prescription_runs`
2. salvare versione, fonte dati, scope, finestra temporale
3. salvare dettaglio zona/filare

### P1-B2 - Esecuzione reale
Stato: `completato il 21 marzo 2026`

Microstep:
1. collegare prescrizione a operazione eseguita
2. distinguere eseguito totale, parziale, mancato
3. collegare device/log/intervento alla prescrizione

### P1-B3 - Valutazione finale
Stato: `completato il 21 marzo 2026`

Microstep:
1. confronto prescrizione vs esecuzione `completato il 21 marzo 2026`
2. confronto esecuzione vs outcome `completato il 21 marzo 2026`
3. score efficacia per regola, coltura, zona, stagione `completato il 21 marzo 2026`

Accettazione:
- OrtoMio chiude davvero il ledger `decisione -> esecuzione -> risultato`

## Unica strada da seguire

### Fase 1 - Chiudere i parziali del P0
Ordine:
1. `H0-1`
2. `H0-2`
3. `H0-3`
4. `H0-4`
5. `H0-5`

### Fase 2 - Fare le 3 validazioni reali rimandate
Ordine:
1. `V0-1`
2. `V0-2`
3. `V0-3`

### Fase 3 - Ripartire con il piano originale
Ordine:
1. `P1-A1`
2. `P1-A2`
3. `P1-B1`
4. `P1-B2`
5. `P1-B3`

### Fase 4 - Blocco Successivo Post-P1
Ordine:
1. `O1 Outcome+`
2. `O2 Export / Field Ops`
3. `O3 Cloud Hardening`
4. `O4 Agronomic Intelligence`

## Blocco O1 - Outcome+
Stato: `completato il 21 marzo 2026`

Microstep:
1. integrare outcome qualita nel ledger post-esecuzione `completato il 21 marzo 2026`
2. integrare salute/microclima nello score post-intervento `completato il 21 marzo 2026`
3. integrare risposta suolo e irrigazione nello score post-intervento `completato il 21 marzo 2026`
4. unificare il punteggio agronomico finale per zona, coltura e stagione `completato il 21 marzo 2026`

Accettazione:
- OrtoMio misura il risultato non solo con la qualita, ma anche con salute e risposta agronomica

## Blocco O2 - Export / Field Ops
Stato: `completato il 21 marzo 2026`

Microstep:
1. rendere stabile il versioning operativo delle prescription maps `completato il 21 marzo 2026`
2. rafforzare export macchina e tracciamento export `completato il 21 marzo 2026`
3. chiudere la lettura `mappa esportata -> operazione eseguita sul campo` `completato il 21 marzo 2026`

Accettazione:
- una prescription map puo essere esportata, eseguita e rintracciata senza zone d ombra

## Blocco O3 - Cloud Hardening
Stato: `completato il 21 marzo 2026`

Microstep:
1. ridurre warning legacy nei servizi cloud e prescription `completato in modo mirato il 21 marzo 2026`
2. eliminare fallback residui non espliciti `completato il 21 marzo 2026`
3. aumentare i test sulle aree cloud e export `completato il 21 marzo 2026`

Accettazione:
- il runtime cloud diventa piu prevedibile e piu facile da mantenere

## Blocco O4 - Agronomic Intelligence
Stato: `completato il 21 marzo 2026`

Microstep:
1. suggerimenti automatici sulle regole per coltura e stagione `completato il 21 marzo 2026`
2. confronto tra strategie storiche `completato il 21 marzo 2026`
3. priorita operative basate su efficacia reale `completato il 21 marzo 2026`

Accettazione:
- il sistema non solo traccia, ma propone miglioramenti basati sui risultati ottenuti

## Decisione operativa consigliata
Da oggi il piano non va considerato:
- "P0 finito e basta"

Ma:
- `P0 implementato`
- `P0 da hardenizzare e validare`
- `P1 ancora da aprire`

Questa e la classificazione piu rigorosa e piu utile per non disperdere il lavoro.
