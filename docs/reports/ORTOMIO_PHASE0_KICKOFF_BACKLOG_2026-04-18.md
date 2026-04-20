# ORTOMIO - PHASE 0 KICKOFF BACKLOG (2026-04-18)

Companion documents:
- `docs/reports/ORTOMIO_TECHNICAL_IMPLEMENTATION_PLAN_2026-04-18.md`
- `docs/reports/ORTOMIO_APPLICATION_CURRENT_STATE_2026-04-18.md`
- `docs/reports/ORTOMIO_STAKEHOLDER_PRESENTATION_2026-04-18.md`

## Obiettivo del kickoff
Questo backlog serve ad avviare il primo ciclo tecnico reale del piano.

Non punta ancora a:
- rifare tutti i motori
- chiudere tutta la precision agriculture
- espandere nuove superfici UI

Punta invece a fare una cosa piu importante:

stabilire i due contratti canonici che sbloccano il resto del lavoro:
- contratto ambientale unico
- contratto di spiegazione decisionale unico

Il perimetro pilota consigliato per questo kickoff e:
- verticale `vigneto`
- focus `irrigazione`
- focus `priorita agronomica`

## Deliverable atteso a fine kickoff
Alla fine di questo primo blocco il sistema deve essere in grado di:
- leggere un contesto ambientale coerente e riconoscibile
- generare una priorita leggibile e spiegabile
- mostrare quali segnali ha usato e quali mancavano
- esporre un razionale minimo agronomico ed economico
- lasciare una traccia riusabile del suggerimento generato

## Task 1 - Audit dei contratti attuali
Stato:
- completato il 2026-04-18

Obiettivo:
- mappare con precisione dove oggi esistono gia contratti simili e dove invece ci sono varianti non allineate

File da leggere come base:
- `services/environmentalMonitoringService.ts`
- `services/weatherService.ts`
- `services/weatherCacheService.ts`
- `services/operationContextService.ts`
- `services/agronomicPriorityService.ts`
- `services/agronomicEconomicPriorityService.ts`
- `services/taskExecutionOrchestratorService.ts`

Output richiesto:
- tabella o nota tecnica con:
  - payload ambientali attuali
  - payload decisionali attuali
  - campi duplicati
  - campi mancanti
  - divergenze di naming o semantica

Criterio di completamento:
- esiste una mappa chiara delle interfacce attuali
- e chiaro cosa puo essere riusato e cosa deve essere introdotto

Avanzamento reale:
- audit completato nel documento `docs/reports/ORTOMIO_PHASE0_CONTRACT_AUDIT_2026-04-18.md`
- confermato che il contratto ambientale e piu maturo del contratto decisionale
- confermato che il contratto decisionale e ancora distribuito tra priority score ed economic summary

## Task 2 - Definizione del contratto ambientale canonico
Stato:
- in corso

Obiettivo:
- definire un payload unico che rappresenti il contesto ambientale letto dagli engine

File principali coinvolti:
- `services/environmentalMonitoringService.ts`
- `services/operationContextService.ts`
- eventuale nuovo file tipi condivisi in `types/` o `services/`

Campi minimi raccomandati:
- riferimento temporale
- weather observed
- weather forecast
- sensori locali
- indicatori derivati
- soil water summary
- source lineage
- signal quality
- confidence regionale
- confidence locale
- precedence source
- site weather binding

Decisione tecnica importante:
- il contratto deve distinguere in modo esplicito:
  - osservato
  - forecast
  - sensore
  - derivato
  - fallback

Output richiesto:
- interfaccia TypeScript canonica
- nota breve su regole di compilazione del payload

Criterio di completamento:
- esiste una sola interfaccia target verso cui convergere
- il contratto e abbastanza ricco da servire irrigazione, health e prediction

Avanzamento reale:
- introdotto il file condiviso `types/environmental.ts` come primo contratto ambientale canonico
- riallineati `services/environmentalMonitoringService.ts`, `services/operationContextService.ts` e `services/weatherService.ts` per usare i tipi condivisi
- mantenute le riesportazioni dai service esistenti per non rompere i consumer attuali
- controllo tipi mirato sui file toccati completato senza errori residui specifici del refactor

## Task 3 - Definizione del contratto di spiegazione decisionale
Stato:
- in corso

Obiettivo:
- rendere ogni raccomandazione rilevante spiegabile e auditabile

File principali coinvolti:
- `services/agronomicPriorityService.ts`
- `services/agronomicEconomicPriorityService.ts`
- `services/taskExecutionOrchestratorService.ts`

Campi minimi raccomandati:
- focus decisionale
- crop profile risolto
- source del profilo risolto
- score finale
- confidence finale
- segnali disponibili
- segnali P0 coperti
- segnali P0 mancanti
- stadio critico o non critico
- environmental summary usato
- economic summary usato
- rationale agronomico
- rationale economico
- warnings

Output richiesto:
- interfaccia TypeScript canonica per la decision explanation
- regole minime su cosa deve essere sempre popolato

Criterio di completamento:
- una raccomandazione critica puo essere letta da un tecnico e capita senza leggere il codice del motore

Avanzamento reale:
- introdotto `services/agronomicDecisionExplanationService.ts` come primo contratto condiviso di decision explanation
- il payload canonico ora raccoglie score, confidence, urgency, profilo risolto, coverage segnali, summary economico, summary ambientale, feedback misurato, rationale e warning
- integrato sul flusso irriguo tramite `services/advancedIrrigationService.ts`
- integrato sul flusso prescription tramite `services/prescriptionAgronomicIntelligenceService.ts`
- propagato nel queue metadata tramite `services/agronomicActionQueueService.ts`

## Task 4 - Prima integrazione reale sul flusso pilota
Stato:
- in corso

Obiettivo:
- applicare i due contratti a un flusso reale prima di toccare tutto il sistema

Flusso pilota:
- vigneto
- irrigazione
- priorita agronomica

File piu probabili:
- `services/advancedIrrigationService.ts`
- `services/agronomicPriorityService.ts`
- `services/agronomicEconomicPriorityService.ts`
- `services/environmentalMonitoringService.ts`
- `services/operationContextService.ts`

Implementazione minima attesa:
- il motore irriguo deve produrre o ricevere il contratto ambientale canonico
- la priorita associata deve produrre il contratto di spiegazione canonico
- il flusso deve esporre chiaramente:
  - quali segnali sono entrati
  - quale profilo colturale e stato risolto
  - quale livello di confidenza e stato assegnato

Criterio di completamento:
- su almeno un caso pilota vigneto il sistema genera una raccomandazione leggibile con spiegazione strutturata

Avanzamento reale:
- il contratto decisionale viene ora prodotto nei flussi `irrigation` e `prescription`
- il payload spiegabile viene propagato nella coda azioni e nel metadata dei task suggeriti
- il validation harness restituisce anche la decision explanation per i candidati di scenario
- il pilota piu vicino alla chiusura e `vigneto -> irrigazione/priorita -> task queue`

## Task 5 - Snapshot del suggerimento e traccia verso l'esecuzione
Stato:
- avviato in forma minima

Obiettivo:
- non perdere il suggerimento al momento della generazione

File principali coinvolti:
- `services/taskExecutionOrchestratorService.ts`
- `services/agronomicMeasuredFeedbackService.ts`
- eventuale nuovo service di trace o snapshot

Implementazione minima attesa:
- quando viene generata una raccomandazione critica, si salva almeno:
  - timestamp
  - focus
  - score
  - confidence
  - explanation payload
  - source task se presente
  - contesto giardino/zona/filare

Non serve ancora una soluzione completa enterprise.
Serve un primo ledger minimo ma coerente.

Criterio di completamento:
- una decisione importante puo essere riletta dopo
- si puo collegare il suggerimento all'eventuale task o esecuzione successiva

Avanzamento reale:
- il metadata dei task della coda agronomica ora include un `decisionSnapshot` strutturato
- lo snapshot conserva score, confidence, urgency, profilo risolto, segnali mancanti, explanation ed economics
- `agronomicQueueOutcomeService` puo contare quante decisioni completate mantengono ancora la spiegazione associata
- introdotto `services/agronomicDecisionLedgerService.ts` come ledger separato delle decisioni generate dalla coda
- il ledger viene alimentato alla creazione del task e aggiornato al completamento del task
- introdotto `services/agronomicDecisionLedgerAnalyticsService.ts` per leggere tasso di chiusura, verifica esecutiva, esiti misurati e tempi medi del ciclo decisionale
- il pannello planner espone ora una prima timeline storica filtrabile per `vigneto`, `oliveto` e `frutteto`
- il confronto decisione vs outcome usa oggi una coerenza di tipo evidenziale: task chiuso, esecuzione verificata, evidenza forte ed esito misurato
- dove presenti, i `AgronomicMeasuredFeedbackRecord` vengono ora usati per una prima lettura di outcome agronomico reale su acqua, nutrizione e qualita

## Ordine consigliato di esecuzione
1. Task 1 - audit contratti attuali
2. Task 2 - contratto ambientale canonico
3. Task 3 - contratto decision explanation canonico
4. Task 4 - integrazione su flusso pilota vigneto/irrigazione
5. Task 5 - persistenza snapshot della decisione

## Cosa non fare in questo kickoff
Per evitare dispersione, in questo primo blocco non conviene:
- intervenire subito su tutte le verticali
- rifare tutta la prescription logic
- aprire una nuova grande superficie UI
- aggiungere nuova AI generativa
- cercare di chiudere subito anche nutrition, health e reports

## Risultato atteso dopo il kickoff
Se il kickoff viene completato bene, OrtoMio non avra ancora "chiuso" il salto di qualita.

Pero avra ottenuto il passaggio piu importante:
- da logiche forti ma sparse

a:
- una base canonica e leggibile per far crescere tutto il sistema

## Passo successivo dopo questo backlog
Il blocco immediatamente successivo dovrebbe essere:
- estendere il contratto ambientale e decisionale a `health`
- poi a `field row prediction`
- poi al `director`
- solo dopo alle `prescription maps`
