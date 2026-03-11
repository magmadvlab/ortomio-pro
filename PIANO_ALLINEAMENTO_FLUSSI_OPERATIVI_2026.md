# Piano Allineamento Flussi Operativi 2026

Data: 2026-03-10

## Obiettivo

Portare OrtoMio da sistema ibrido a sistema operativo coerente, dove:

1. ogni sezione produce o legge dati dallo stesso backbone
2. irrigazione, fertilizzazione, trattamenti e lavorazioni hanno un solo circuito esecutivo
3. task, planner, advice, health, NDVI e IoT non creano mondi paralleli
4. ogni evento resta storicizzato e confrontabile anno su anno

## Verita attuale del codice

Oggi convivono almeno 5 circuiti diversi:

1. `UnifiedOperationsService`
   - scrive nei registri reali `watering_logs`, `fertilizer_application_logs`, `treatment_register`, `mechanical_work_register`
   - propaga filare -> pianta per `watering`, `fertilizing`, `treatment`

2. `AdvancedIrrigationService`
   - gestisce un circuito separato con `irrigation_zones`, `irrigation_systems`, `irrigation_logs`, `irrigation_schedules`
   - non scrive nel ledger operativo unificato

3. `AdvancedNutritionService`
   - gestisce un circuito separato con `fertilizer_products`, `treatment_products`, `nutrition_treatments`, `nutrition_schedules`, `inventory`
   - non scrive nel ledger operativo unificato

4. `garden_tasks`
   - planner, advice, health e varie UI creano task persistiti
   - il task non equivale a una esecuzione operativa

5. percorsi legacy o bypass
   - writer diretti verso `watering_logs`, `fertilizer_application_logs`, `treatments`
   - componenti mock o shell che non persistono nulla

## Dove passa davvero l'esecuzione oggi

### 1. Irrigazione

Percorsi reali:

- `services/unifiedOperationsService.ts`
  - livello `row` -> `createWateringLog(...)`
  - poi `autoSyncRowOperation(...)` verso le piante

- `services/integratedFieldOperationsService.ts`
  - ramo persistito: `irrigation -> watering -> UnifiedOperationsService`
  - ramo legacy: crea operazioni solo in memoria

- `components/irrigation/WateringLogFormWithFieldRows.tsx`
  - crea `watering_logs`
  - poi prova a sincronizzare le piante chiamando `autoSyncRowOperation(...)`
  - limite attuale: la sync non riceve l'id del log creato, quindi lavora in modo indiretto

- `components/Dashboard.tsx`
  - scrive direttamente con `storageProvider.logWatering(log)`
  - bypassa il backbone unificato

Percorsi paralleli:

- `services/advancedIrrigationService.ts`
  - `startIrrigation(...)` scrive in `irrigation_logs`
  - dashboard e zone manager lavorano su quel dominio, non sul ledger operativo

Conclusione:

- l'irrigazione ha due ledger separati:
  - `watering_logs` come registro operativo
  - `irrigation_logs` come registro sistemi/controllo
- manca una regola unica su quale dei due rappresenti la verita esecutiva

### 2. Fertilizzazione e trattamenti

Percorsi reali:

- `services/unifiedOperationsService.ts`
  - `fertilizing -> createFertilizerApplicationLog(...)`
  - `treatment -> createTreatment(...)`
  - sync filare -> pianta per entrambe

- `services/integratedFieldOperationsService.ts`
  - ramo persistito: `fertilization -> fertilizing`
  - ramo persistito: `treatment -> treatment`

- `components/plants/PlantDetailModal.tsx`
- `components/orchard/TreeManager.tsx`
- `components/vineyard/VineManager.tsx`
  - registrano operazioni singole correttamente via `UnifiedOperationsService`

Percorsi diretti o ibridi:

- `components/shared/HomeDashboard.tsx`
  - `onFertilize` chiama direttamente `storageProvider.createFertilizerApplicationLog(...)`

- `components/fertilizer/FertilizerApplicationModal.tsx`
  - usa callback esterna `onApply(...)`
  - in caso di fertigation prova anche `autoSyncRowOperation(...)`
  - ma non passa per l'orchestratore come percorso obbligatorio

- `components/nutrition/TreatmentPlanner.tsx`
  - crea `nutrition_treatments`
  - e un planner/scheduler, non un registro esecutivo
  - il form interno e ancora marcato "Form in sviluppo"

- `services/advancedNutritionService.ts`
  - dashboard, trattamenti, schedule e inventory lavorano su `nutrition_treatments`
  - non convertono automaticamente una esecuzione in `fertilizer_application_logs` o `treatment_register`

Percorsi legacy da eliminare:

- `components/treatments/TreatmentPlanner.tsx`
  - scrive direttamente su tabella `treatments`
  - usa `garden_id: 'default'`

- `components/treatments/TreatmentDashboard.tsx`
  - legge e muta la stessa tabella `treatments`

Conclusione:

- oggi esistono tre mondi distinti:
  - registro operativo reale
  - planner nutrizione/trattamenti
  - legacy `treatments`
- devono essere ridotti a uno solo per l'esecuzione, lasciando gli altri come pianificazione o catalogo

### 3. Lavorazioni

Percorsi reali:

- `services/unifiedOperationsService.ts`
  - `work -> createMechanicalWork(...)`

- `services/integratedFieldOperationsService.ts`
  - ramo persistito: `cultivation -> work`

Limiti strutturali:

- `services/unifiedOperationsService.ts`
  - oggi `work` non viene propagato a livello pianta

- `components/mechanicalWork/MechanicalWorkLogForm.tsx`
  - form ben strutturato ma non agganciato a un flusso vivo

- `app/app/mechanical-work/page.tsx`
  - shell ibrida
  - configurazioni simulate
  - attrezzature simulate
  - nessun percorso chiaro verso `mechanical_work_register`

Conclusione:

- la lavorazione esiste a livello registro e orchestratore
- ma l'interfaccia principale non la mette davvero "in circolo"
- manca anche una scelta chiara su come rappresentare l'impatto della lavorazione sulle singole piante

## Matrice sezioni -> stato reale

| Sezione | Stato | Cosa scrive oggi | Verdetto |
|---|---|---|---|
| `components/plants/PlantDetailModal.tsx` | operativo | `UnifiedOperationsService` | buono |
| `components/orchard/TreeManager.tsx` | operativo | `UnifiedOperationsService` | buono |
| `components/vineyard/VineManager.tsx` | operativo | `UnifiedOperationsService` | buono |
| `components/fieldrows/IntegratedFieldOperationsModal.tsx` | quasi allineato | `IntegratedFieldOperationsService` -> ramo persistito su `UnifiedOperationsService` | da consolidare |
| `components/fieldrows/QuickOperationModal.tsx` | quasi allineato | `IntegratedFieldOperationsService` | da consolidare |
| `app/app/irrigation/page.tsx` | ibrido | dashboard pro + shell mock | da rifare parzialmente |
| `components/irrigation/ProfessionalIrrigationDashboard.tsx` | ibrido | `AdvancedIrrigationService` | separato dal ledger |
| `components/irrigation/IrrigationZoneManager.tsx` | operativo lato configurazione | `AdvancedIrrigationService` | va mantenuto come config, non come ledger |
| `components/irrigation/WateringLogFormWithFieldRows.tsx` | operativo ma bypass | `watering_logs` diretto + sync manuale | da reindirizzare |
| `components/Dashboard.tsx` | legacy/bypass | `logWatering(...)` diretto | da dismettere |
| `app/app/nutrition/page.tsx` | ibrido | dashboard pro + shell mock | da rifare parzialmente |
| `components/nutrition/ProfessionalNutritionDashboard.tsx` | ibrido | `AdvancedNutritionService` | separato dal ledger |
| `components/nutrition/TreatmentPlanner.tsx` | ibrido | `nutrition_treatments` / `nutrition_schedules` | planner, non esecuzione |
| `components/shared/HomeDashboard.tsx` | bypass | `createFertilizerApplicationLog(...)` diretto | da riallineare |
| `components/fertilizer/FertilizerApplicationModal.tsx` | ibrido | callback esterna + sync manuale | da riallineare |
| `app/app/mechanical-work/page.tsx` | placeholder/ibrido | nessun writer reale | da attivare davvero |
| `components/mechanicalWork/MechanicalWorkLogForm.tsx` | pronto ma scollegato | dipende da `onSubmit` esterno | da collegare |
| `app/app/planner/page.tsx` | task-only | `garden_tasks` | da collegare all'esecuzione |
| `components/planner/SmartPlanner.tsx` | locale/mock | stato React | da rifare |
| `components/planner/tabs/PlannerAISuggestions.tsx` | task/AI decision | accetta/rifiuta suggestion | non esegue nulla |
| `app/app/planner-classic/page.tsx` | task/planning | `planting_plans` + `garden_tasks` | orto-centrico |
| `components/planner/ClassicPlannerWithRotation.tsx` | pianificazione | `planting_plans` | non esecuzione |
| `app/app/advice/page.tsx` | task-only + mock | `garden_tasks` + advice mock | da riallineare |
| `app/app/health/page.tsx` | task-only + euristiche | `garden_tasks` | da collegare al ledger |
| `components/monitoring/ContinuousMonitoringDashboard.tsx` | demo/ibrido | monitoring service con mock | da rifare |
| `components/treatments/TreatmentDashboard.tsx` | legacy | tabella `treatments` | da rimuovere |
| `components/treatments/TreatmentPlanner.tsx` | legacy | tabella `treatments` | da rimuovere |
| `components/ndvi/NDVIDashboard.tsx` | ibrido | interventi e wizard, ma analisi non ancora piena | da collegare al ledger |
| `components/smart/IntegratedSmartHub.tsx` | ibrido | sensori reali, device/control no | da consolidare |

## Problemi architetturali principali

### A. Piano, task e operazione sono ancora confusi

Oggi il sistema usa oggetti diversi per cose diverse, ma senza una gerarchia chiara:

- piano
- task
- schedule
- operazione eseguita
- osservazione
- risultato

Questo porta a pagine che sembrano operative ma in realta producono solo task o solo planner records.

### B. I ledger operativi non sono unici

Oggi i log veri stanno in piu tabelle e piu servizi:

- `watering_logs`
- `fertilizer_application_logs`
- `treatment_register`
- `mechanical_work_register`
- `irrigation_logs`
- `nutrition_treatments`
- `treatments`

Non tutte hanno lo stesso ruolo, ma l'app le usa spesso come se fossero equivalenti.

### C. La propagazione e incoerente

- `watering`, `fertilizing`, `treatment` hanno una strada di sync filare -> pianta
- `work` no
- alcuni form sincronizzano manualmente fuori orchestratore
- alcune UI scrivono direttamente il registro senza passare dal backbone

### D. Le dashboard professionali sono separate dalla verita esecutiva

- irrigazione pro guarda soprattutto `irrigation_logs`
- nutrizione pro guarda soprattutto `nutrition_treatments`
- i registri operativi reali restano altrove

### E. Molte sezioni sono ancora task-first, non operation-first

Planner, advice, health e parte del monitoring producono task, ma non chiudono il cerchio fino alla esecuzione registrata.

## Architettura target

Ogni dominio deve parlare la stessa lingua:

1. `Plan`
   - intenzione o strategia
   - puo nascere da planner, advice, NDVI, AI, operatore

2. `Task`
   - unita di lavoro assegnabile e schedulabile
   - puo derivare da un piano o da un alert

3. `Execution`
   - evento realmente eseguito
   - unico punto che scrive il ledger operativo
   - deve passare da `UnifiedOperationsService`

4. `Propagation`
   - se l'esecuzione nasce a livello filare, genera derivati coerenti per pianta/albero quando richiesto

5. `Observation`
   - foto, controlli, rilievi, monitoraggi, misure sensori, diagnosi AI

6. `Outcome`
   - effetto osservato dopo una esecuzione o una stagione
   - serve per confronto anno su anno

## Regole da fissare

### 1. Un solo writer per le esecuzioni

Ogni esecuzione di irrigazione, fertilizzazione, trattamento o lavorazione deve passare da `UnifiedOperationsService`.

### 2. Le dashboard pro non sono il ledger

- `AdvancedIrrigationService` resta dominio di configurazione, sistemi, schedule e telemetria
- `AdvancedNutritionService` resta dominio di catalogo prodotti, schedulazione, inventory e compliance
- quando si esegue davvero una operazione, si deve scrivere nel ledger unificato

### 3. Task e planner non possono chiudersi su se stessi

Un task completato deve poter generare o collegarsi a una `Execution`.

### 4. Nessun writer diretto dai componenti

I componenti UI non devono chiamare direttamente:

- `logWatering(...)`
- `createFertilizerApplicationLog(...)`
- raw insert su `treatments`

### 5. Le lavorazioni devono avere una strategia di propagazione

Per `work` dobbiamo scegliere e applicare una sola regola:

- o si propagano vere `plant operations` quando l'intervento e mirato
- o si mantiene una `Execution` di filare con elenco piante/aree impattate e osservazioni collegate

La situazione attuale non e sufficiente per precision farming.

## Decisioni bloccanti da fissare prima del codice

### 1. Source of truth per ogni livello

Va dichiarato in modo esplicito:

- `watering_logs`
  - verita esecutiva agronomica per irrigazione
- `fertilizer_application_logs`
  - verita esecutiva agronomica per fertilizzazione
- `treatment_register`
  - verita esecutiva agronomica per trattamenti
- `mechanical_work_register`
  - verita esecutiva agronomica per lavorazioni

Questi invece non sono il ledger esecutivo:

- `irrigation_logs`
  - telemetria e controllo tecnico impianto
- `nutrition_treatments`
  - piano o schedulazione operativa
- `nutrition_schedules`
  - schedulazione
- `planting_plans`
  - pianificazione colturale
- `garden_tasks`
  - lavoro da fare, non esecuzione

### 2. Modello unico delle posizioni

Ogni `Execution`, `Observation` e `Outcome` deve usare la stessa tassonomia spaziale:

- `garden_id`
- `zone_id`
- `bed_id`
- `bed_row_id`
- `field_row_id`
- `plant_id`
- `tree_id`

Regola:

- una esecuzione puo avere un target principale
- puo avere anche derivati o riferimenti secondari
- non deve esistere ambiguita tra `bed_row` e `field_row`

### 3. Collegamento obbligatorio tra oggetti del ciclo operativo

Ogni record deve poter puntare ai vicini del suo ciclo:

- `plan_id`
- `task_id`
- `execution_id`
- `parent_execution_id`
- `observation_id`
- `outcome_id`

Questo e il requisito minimo per:

- confronto anno su anno
- capire se un task ha portato a una esecuzione vera
- capire se una esecuzione ha avuto un risultato
- audit e tracciabilita end-to-end

### 4. Chiusura task operativi

I task di tipo operativo non possono piu limitarsi a `completed = true`.

Serve una distinzione esplicita:

- `task completato senza esecuzione`
  - consentito solo per task organizzativi o informativi
- `task completato con esecuzione`
  - per irrigazione, fertilizzazione, trattamento, lavorazione, raccolta, potatura, monitoraggio tecnico

Questa regola va applicata soprattutto a:

- planner
- advice
- health
- monitoring
- quick actions

## Piano totale di allineamento

## P0 - Bonifica dei bypass e freeze del legacy

Obiettivo:

- bloccare la proliferazione di nuovi percorsi paralleli

Azioni:

- dismettere o nascondere i legacy:
  - `components/treatments/TreatmentDashboard.tsx`
  - `components/treatments/TreatmentPlanner.tsx`

- smettere di usare writer diretti nei componenti:
  - `components/Dashboard.tsx`
  - `components/shared/HomeDashboard.tsx`
  - `components/fertilizer/FertilizerApplicationModal.tsx`
  - `components/irrigation/WateringLogFormWithFieldRows.tsx`

Output:

- nessuna nuova esecuzione nasce fuori orchestratore

## P1 - Spine operativa unica

Obiettivo:

- fare di `UnifiedOperationsService` il solo entrypoint esecutivo

File principali:

- `services/unifiedOperationsService.ts`
- `services/integratedFieldOperationsService.ts`
- `services/plantRowSyncService.ts`
- `packages/storage-cloud/SupabaseStorageProvider.ts`

Azioni:

- introdurre adapter espliciti:
  - `executeFromTask(...)`
  - `executeFromPlanner(...)`
  - `executeFromIoT(...)`
  - `executeFromAdvancedIrrigation(...)`
  - `executeFromAdvancedNutrition(...)`

- completare il service:
  - implementare lettura unificata storica
  - implementare sync log reali
  - rimuovere placeholder `getUnifiedOperations()`, `getOperationSyncLogs()`
  - introdurre linking standard tra `plan/task/execution/observation/outcome`

- rendere deterministica la sync:
  - sempre con id del record sorgente
  - mai per inferenza "ultimo record del filare"

- decidere la propagazione per `work`
- fissare il target principale e i target derivati secondo il modello unico delle posizioni

Output:

- un solo writer esecutivo
- una sola strategia di lineage

## P2 - Allineamento irrigazione

Obiettivo:

- distinguere chiaramente configurazione/telemetria da esecuzione agronomica

File principali:

- `services/advancedIrrigationService.ts`
- `components/irrigation/ProfessionalIrrigationDashboard.tsx`
- `components/irrigation/IrrigationZoneManager.tsx`
- `components/irrigation/WateringLogFormWithFieldRows.tsx`
- `app/app/irrigation/page.tsx`

Decisione target:

- `irrigation_zones` e `irrigation_systems` restano dominio di configurazione
- `irrigation_logs` restano dominio tecnico di sistema e device
- `watering_logs` restano ledger agronomico esecutivo

Azioni:

- quando parte o finisce irrigazione da dashboard pro:
  - registrare il fatto anche come `Execution` nel ledger operativo
- collegare zona/sistema -> filari/piante serviti
- rimuovere i quick stats hardcoded da `app/app/irrigation/page.tsx`
- far usare al form un callback che ritorna l'id del log creato, poi sync certa alle piante

Output:

- una irrigazione manuale, automatica o IoT produce sempre storico operativo confrontabile

## P3 - Allineamento fertilizzazione e trattamenti

Obiettivo:

- ridurre a un solo circuito esecutivo tutta la nutrizione e i trattamenti

File principali:

- `services/advancedNutritionService.ts`
- `components/nutrition/ProfessionalNutritionDashboard.tsx`
- `components/nutrition/TreatmentPlanner.tsx`
- `components/shared/HomeDashboard.tsx`
- `components/fertilizer/FertilizerApplicationModal.tsx`
- `services/unifiedOperationsService.ts`

Decisione target:

- `nutrition_treatments` e `nutrition_schedules` diventano piano e schedulazione
- `fertilizer_application_logs` e `treatment_register` diventano esecuzione reale

Azioni:

- il planner nutrizione deve creare:
  - piano/schedule
  - task opzionale
  - mai direttamente l'esecuzione, salvo conferma esplicita

- quando un trattamento viene eseguito:
  - chiamare `UnifiedOperationsService`
  - aggiornare il record `nutrition_treatments` con link alla esecuzione reale

- eliminare il dominio legacy `treatments`

Output:

- catalogo, schedule ed esecuzione restano distinti ma collegati

## P4 - Allineamento lavorazioni

Obiettivo:

- far entrare davvero le lavorazioni nel sistema di precisione

File principali:

- `app/app/mechanical-work/page.tsx`
- `components/mechanicalWork/MechanicalWorkLogForm.tsx`
- `services/unifiedOperationsService.ts`
- `services/integratedFieldOperationsService.ts`

Azioni:

- sostituire shell e dati simulati con lettura da `mechanical_work_register`
- collegare `MechanicalWorkLogForm` a `UnifiedOperationsService`
- definire scope reale:
  - garden
  - zona
  - filare
  - pianta/albero se mirato

- aggiungere osservazioni post-lavorazione:
  - foto
  - note
  - risultato

Output:

- le lavorazioni diventano comparabili con irrigazioni e fertilizzazioni

## P5 - Planner, advice e health nel circuito corretto

Obiettivo:

- trasformare planner e alert in generatori di intenzione, non in pseudo-esecuzioni

File principali:

- `app/app/planner/page.tsx`
- `components/planner/SmartPlanner.tsx`
- `components/planner/tabs/PlannerAISuggestions.tsx`
- `app/app/planner-classic/page.tsx`
- `components/planner/ClassicPlannerWithRotation.tsx`
- `app/app/advice/page.tsx`
- `app/app/health/page.tsx`
- `services/plantHealthMonitoringService.ts`

Azioni:

- `SmartPlanner`:
  - smettere di usare solo stato React
  - creare piani o task persistiti

- `PlannerAISuggestions`:
  - usare davvero `onCreateTasks`
  - poter creare piani/task strutturati

- `Advice`:
  - togliere i mock
  - trasformare i consigli in piani/task basati su dati reali

- `Health`:
  - creare task come oggi
  - ma al completamento guidare verso una osservazione o una esecuzione vera

- `Planner Classic`:
  - restare planner
  - ma quando una pianificazione viene eseguita deve nascere una `Execution` collegata

- task operativi:
  - non devono poter essere chiusi senza scelta esplicita tra `rinviato`, `annullato`, `eseguito con execution`, `chiuso senza esecuzione`

Output:

- piani, task e operazioni restano distinti ma attraversabili end-to-end

## P6 - Storico, osservazioni e risultati

Obiettivo:

- misurare cosa ha funzionato e cosa no

Nuovi blocchi da introdurre o consolidare:

- `ObservationLedger`
  - foto
  - ispezioni
  - rilievi sensori
  - diagnosi AI
  - controlli post-pioggia

- `OutcomeLedger`
  - esito trattamento
  - risposta a fertilizzazione
  - resa
  - qualita
  - fitotossicita
  - problemi emersi

Azioni:

- ogni esecuzione puo avere osservazioni prima e dopo
- ogni stagione puo essere chiusa con outcome strutturati
- confronti anno su anno su stessa zona/filare/pianta/albero

Output:

- analisi storica vera
- confronto tra annate
- base dati per metodo definitivo

## P7 - NDVI, prescription e IoT

Obiettivo:

- farli entrare nel circuito, non restare dashboard isolate

Azioni:

- NDVI e prescription:
  - generano piani o interventi proposti
  - quando applicati producono `Execution`
  - dopo l'applicazione raccolgono `Outcome`

- IoT:
  - sensori e device devono essere persistiti e versionati
  - un comando device che irriga deve creare anche `Execution`

- monitoring:
  - togliere mock
  - alert reali -> task/plan -> execution -> observation

Output:

- moduli avanzati finalmente confrontabili con il resto del sistema

## Cosa deve diventare persistente subito

Questi dati non possono restare solo in stato locale o in tabelle isolate:

- piani colturali e versioni piano
- schedule di irrigazione e nutrizione
- task creati da AI, advice, health, monitoring
- esecuzioni reali
- sync filare -> pianta con lineage
- osservazioni manuali e AI
- esiti e risultati
- device registry IoT
- calibrazioni e configurazioni impianti
- mappe prescrittive generate e applicate
- decisioni AI accettate/rifiutate con motivazione

## Ordine implementativo consigliato

1. fermare bypass e legacy
2. completare `UnifiedOperationsService`
3. riallineare irrigazione
4. riallineare nutrizione e trattamenti
5. attivare davvero le lavorazioni
6. collegare planner, advice e health al circuito corretto
7. introdurre observation/outcome ledger
8. chiudere NDVI, prescription e IoT

## Criterio finale di riuscita

Una qualsiasi azione, per esempio:

- irrigazione da dashboard pro
- concimazione da task
- trattamento da planner nutrizione
- lavorazione da filare
- controllo post-pioggia da health
- intervento suggerito da NDVI

deve poter essere letta sempre nello stesso modo:

1. chi l'ha pianificata
2. chi l'ha eseguita
3. quando e dove e stata eseguita
4. su quali filari/piante/alberi
5. con quali quantita, prodotti, attrezzature e condizioni
6. quale osservazione e stata raccolta dopo
7. quale risultato ha prodotto rispetto agli anni precedenti

Questo e il passaggio necessario per trasformare il prodotto da insieme di moduli forti ma disallineati a sistema agronomico coerente.
