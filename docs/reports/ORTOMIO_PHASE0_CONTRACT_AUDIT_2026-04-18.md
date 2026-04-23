# ORTOMIO - PHASE 0 CONTRACT AUDIT (2026-04-18)

Companion documents:
- `docs/reports/ORTOMIO_PHASE0_KICKOFF_BACKLOG_2026-04-18.md`
- `docs/reports/ORTOMIO_TECHNICAL_IMPLEMENTATION_PLAN_2026-04-18.md`

## Obiettivo dell'audit
Questo audit serve a rispondere a una domanda molto concreta:

quali contratti tecnici esistono gia oggi nel codice per:
- contesto ambientale
- priorita agronomica
- razionale economico
- orchestrazione verso l'esecuzione

e quali lacune impediscono oggi di avere:
- un payload ambientale unico
- un payload decisionale unico
- una vera decision trace persistibile

## File analizzati
- `services/environmentalMonitoringService.ts`
- `services/weatherService.ts`
- `services/weatherCacheService.ts`
- `services/operationContextService.ts`
- `services/agronomicPriorityService.ts`
- `services/agronomicEconomicPriorityService.ts`
- `services/taskExecutionOrchestratorService.ts`

## Sintesi esecutiva
L'audit mostra un quadro abbastanza netto.

### 1. Il contratto ambientale e gia piu maturo del contratto decisionale
La parte ambientale ha gia una base forte in:
- `EnvironmentalMonitoringSnapshot`
- `PersistedWeatherLineage`
- `PersistedForecastSnapshot`
- `SiteWeatherBinding`

Questa parte e gia vicina a diventare contratto canonico.

### 2. Il contratto decisionale e ancora spezzato in due
Oggi la decisione e divisa tra:
- `AgronomicPriorityScoreResult`
- `AgronomicEconomicPrioritySummary`

Il primo contiene score, confidence e signal coverage.
Il secondo contiene ROI, scenario comparison e rationale economico.

Manca pero un payload unificato che dica:
- cosa e stato deciso
- perche
- con quali segnali
- con quali limiti
- con quale razionale finale leggibile

### 3. L'orchestratore oggi non e ancora un decision trace system
`taskExecutionOrchestratorService.ts` gestisce soprattutto bootstrap e routing verso i moduli di esecuzione.
Non conserva ancora un vero snapshot della decisione che ha portato al task o al launch dell'esecuzione.

### 4. Il problema principale non e l'assenza di logica
Il problema principale e la dispersione del significato tecnico:
- metadati ambientali duplicati
- confidence con forme diverse
- rationale solo in alcune parti
- nessun envelope canonico che colleghi contesto, decisione ed esecuzione

## Sezione A - Contratto ambientale attuale

## A.1 Contratti esistenti
I payload ambientali oggi piu importanti sono:

### `WeatherSnapshot` in `services/weatherService.ts`
Contiene:
- temperatura
- umidita
- precipitazione
- vento
- condizione
- pressione
- `source`
- `sourceClass`
- `primarySource`
- `signalQuality`
- `regionalConfidence`
- `localConfidence`

Ruolo attuale:
- snapshot meteo leggero e riusabile
- adatto a servizi runtime o di contesto operativo

### `OperationContext.weather` in `services/operationContextService.ts`
Contiene quasi gli stessi campi di `WeatherSnapshot`:
- temperatura
- umidita
- precipitazione
- vento
- condizione
- pressione
- `source`
- `sourceClass`
- `primarySource`
- `signalQuality`
- `regionalConfidence`
- `localConfidence`

Ruolo attuale:
- contesto di un'operazione, arricchito con luna, stagione e daylight

### `EnvironmentalMonitoringSnapshot` in `services/environmentalMonitoringService.ts`
Contiene invece un contratto piu ricco:
- weather summary
- lineage
- forecast horizon
- site binding
- sensors summary
- soil water summary
- circulation notes

Ruolo attuale:
- fotografia ambientale strutturata per uso downstream
- base migliore per diventare contratto canonico

## A.2 Overlap e duplicazioni
Le principali duplicazioni oggi sono:

### Duplicazione 1 - Metadati meteo
I campi:
- `source`
- `sourceClass`
- `primarySource`
- `signalQuality`
- `regionalConfidence`
- `localConfidence`

compaiono sia in `WeatherSnapshot` sia in `OperationContext.weather`.

Problema:
- semantica molto vicina
- nessun tipo condiviso unico
- rischio di drift tra i due payload

### Duplicazione 2 - Confidence ambientale
La confidence ambientale compare:
- come `regionalConfidence` e `localConfidence` in `WeatherSnapshot`
- come `regionalConfidence` e `localConfidence` in `OperationContext.weather`
- come `regionalConfidence` e `localConfidence` in `EnvironmentalMonitoringSnapshot.weather`

Problema:
- il significato e sostanzialmente lo stesso
- la definizione non e centralizzata

### Duplicazione 3 - Fallback semantics
Nel codice esistono diverse espressioni del fallback:
- `fallback`
- `estimated`
- `synthetic_fallback`
- `fallback_estimated`

Problema:
- il concetto esiste, ma oggi e distribuito su piu livelli
- manca una tassonomia unica tra:
  - source type
  - source class
  - confidence

## A.3 Gap del contratto ambientale attuale
Pur essendo la parte piu matura, il contratto ambientale ha ancora questi limiti:

### Gap 1 - Nessun envelope unico condiviso da tutti gli engine
Oggi esistono snapshot forti, ma non un unico payload ufficiale verso cui convergere.

### Gap 2 - `OperationContext` e troppo leggero per diventare contratto canonico
Mancano:
- sensor precedence
- available signals
- soil-water summary
- circulation notes
- site binding esplicito strutturato

### Gap 3 - `EnvironmentalMonitoringSnapshot` e forte ma ancora poco “shared”
E il candidato migliore, ma oggi non e ancora chiaramente dichiarato come interfaccia comune per:
- irrigation
- health
- prediction
- decision priority
- prescription

## A.4 Conclusione tecnica sul contratto ambientale
Conclusione:

Il contratto ambientale canonico non va inventato da zero.
Va costruito per convergenza, usando `EnvironmentalMonitoringSnapshot` come base primaria e assorbendo:
- la leggerezza di `WeatherSnapshot`
- gli elementi contestuali di `OperationContext`

## Sezione B - Contratto decisionale attuale

## B.1 Contratti esistenti

### `AgronomicPriorityScoreResult` in `services/agronomicPriorityService.ts`
Contiene:
- `score`
- `confidence`
- `signalCoverage`
- `measuredFeedbackSummary`
- `economicSummary`
- `environmentalSummary`

Ruolo attuale:
- risultato numerico della priorita agronomica

Punto forte:
- include gia il blocco `signalCoverage`, molto importante

Limite:
- non contiene un rationale leggibile
- non contiene un messaggio di decisione
- non contiene warning operativi

### `AgronomicEconomicPrioritySummary` in `services/agronomicEconomicPriorityService.ts`
Contiene:
- `status`
- costi stimati
- valore protetto
- impatto netto
- ROI
- `actionComparison`
- `scoreAdjustment`
- `confidenceAdjustment`
- `rationale`

Ruolo attuale:
- razionale economico e confronto tra alternative

Punto forte:
- e gia molto vicino a un explanation block

Limite:
- spiega bene l'economia della decisione
- non spiega da solo la decisione agronomica complessiva

## B.2 Overlap e divergenze

### Overlap 1 - La confidence esiste su due livelli
Esiste:
- `confidence` in `AgronomicPriorityScoreResult`
- `confidenceAdjustment` in `AgronomicEconomicPrioritySummary`

Problema:
- sono utili entrambe
- ma oggi non sono presentate dentro un'unica struttura di decisione

### Overlap 2 - I summary dipendono l'uno dall'altro ma non convergono
`AgronomicPriorityScoreResult` contiene `economicSummary`.
`economicSummary` contiene gia parte importante del razionale finale.

Problema:
- la struttura e composita ma non ancora canonica
- il consumatore finale deve capire da solo come leggere il risultato

### Divergenza 1 - C'e signal coverage ma non c'e rationale agronomico strutturato
Il motore priority sa:
- quali segnali P0 servono
- quali mancano
- quanta coverage c'e

Pero non restituisce ancora un payload del tipo:
- “decision taken”
- “why”
- “what is missing”
- “what reduces trust”

### Divergenza 2 - C'e rationale economico, ma non c'e rationale decisionale completo
Il motore economico produce `rationale: string[]`.
Il motore di priorita no.

Problema:
- la spiegazione finale rimane sbilanciata verso l'economia
- manca uno strato finale di decision explanation unificata

## B.3 Gap del contratto decisionale attuale

### Gap 1 - Nessun `DecisionExplanation` canonico
Manca una struttura che includa insieme:
- focus decisionale
- crop profile risolto
- source del profilo
- score finale
- confidence finale
- signal coverage
- rationale agronomico
- rationale economico
- warnings
- eventuale recommended urgency

### Gap 2 - Nessun envelope unico pronto per UI, audit o persistenza
Oggi il sistema produce buoni mattoni interni, ma non un oggetto finale unico da:
- serializzare
- persistere
- mostrare
- confrontare nel tempo

### Gap 3 - Nessun “decision snapshot”
La decisione esiste come output di funzioni, non ancora come entita tecnica riusabile.

## B.4 Conclusione tecnica sul contratto decisionale
Conclusione:

Il contratto decisionale canonico va costruito sopra l'esistente.
Non bisogna rifare i motori.
Bisogna introdurre un envelope unico che componga:
- `AgronomicPriorityScoreResult`
- `AgronomicEconomicPrioritySummary`
- metadati di risoluzione profilo
- contesto minimo del suggerimento

## Sezione C - Orchestrazione attuale

## C.1 Cosa fa davvero oggi `taskExecutionOrchestratorService.ts`
Il file oggi gestisce soprattutto:
- parsing del contesto di launch
- costruzione dello state iniziale per watering
- bootstrap per nutrition
- bootstrap per harvest
- bootstrap per mechanical work

## C.2 Cosa non fa ancora
Non fa ancora queste cose:
- persistere il suggerimento che ha originato il launch
- conservare score e confidence della decisione
- conservare signal coverage
- conservare rationale agronomico/economico
- collegare formalmente decisione -> task -> execution -> outcome

## C.3 Conclusione tecnica sull'orchestrazione
Il nome "orchestrator" oggi e corretto solo in parte.

Oggi il file e soprattutto un:
- launch/bootstrap router

Non e ancora un:
- decision trace orchestrator

## Sezione D - Merge candidates

## D.1 Contratto ambientale canonico
Base consigliata:
- `EnvironmentalMonitoringSnapshot`

Campi da riassorbire o armonizzare:
- i campi base di `WeatherSnapshot`
- gli aspetti contestuali di `OperationContext`

Forma consigliata:
- un tipo condiviso esplicito, riusabile da tutti i consumer principali

## D.2 Contratto decisionale canonico
Base consigliata:
- nuovo envelope da introdurre

Mattoni da comporre:
- `AgronomicPriorityScoreResult`
- `AgronomicEconomicPrioritySummary`
- `ResolvedAgronomicCropProfile`
- contesto minimo del suggerimento

## D.3 Decision trace minima
Serve introdurre almeno un primo record o snapshot con:
- timestamp
- garden / zone / row / plant scope
- focus decisionale
- score
- confidence
- decision explanation payload
- eventuale source task id

## Sezione E - Naming issues da risolvere

## E.1 Ambientale
Da unificare:
- `fallback`
- `estimated`
- `synthetic_fallback`
- `fallback_estimated`

## E.2 Confidence
Da distinguere con chiarezza:
- confidence del segnale ambientale
- confidence della decisione
- confidence dell'economia osservata

Oggi questi tre livelli esistono, ma non sono ancora incapsulati in modo uniforme.

## Sezione F - Decisione consigliata per il Task 2
La raccomandazione tecnica e questa:

### Per il contratto ambientale
Non creare un payload nuovo da zero.
Prendere `EnvironmentalMonitoringSnapshot` come base canonica e:
- promuoverlo a contratto ufficiale
- estrarre tipi condivisi per source lineage e confidence
- adattare `OperationContext` a usare o derivare da quel contratto

### Per il contratto decisionale
Creare un nuovo envelope, ad esempio:
- `AgronomicDecisionExplanation`

da costruire componendo l'output di:
- `agronomicPriorityService`
- `agronomicEconomicPriorityService`

### Per l'orchestrazione
Non rifare subito l'orchestratore.
Prima introdurre lo snapshot della decisione.
Poi usare quello snapshot per alimentare launch ed esecuzione.

## Conclusione finale
L'audit conferma che il primo blocco del piano e corretto.

La situazione reale oggi e:
- il contratto ambientale e quasi pronto a diventare canonico
- il contratto decisionale non e assente, ma e ancora frammentato
- l'orchestrazione dell'esecuzione esiste, ma la tracciabilita della decisione no

Quindi il prossimo passo corretto non e:
- aggiungere nuove feature

Il prossimo passo corretto e:
- canonizzare l'ambiente
- canonizzare la spiegazione della decisione
- introdurre il primo decision snapshot persistibile
