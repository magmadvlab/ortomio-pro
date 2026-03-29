# Piano Controlled Environment 2026

Data: 2026-03-11

## Obiettivo

Portare `serra`, `indoor`, `idroponica`, `acquaponica` e `aeroponica` da supporto da wizard/configurazione a modulo operativo vero, richiamabile anche dopo la creazione iniziale e coerente con il backbone di precision farming.

Il principio chiave e:

- `outdoor` usa il modello `irrigazione + fertilizzazione + trattamenti`
- `controlled environment` usa il modello `loop acqua/nutrienti + ambiente + siti coltivati + osservazioni + outcome`

Questi due mondi devono condividere:

- task
- osservazioni
- foto
- outcome
- storico pianta/albero
- provenance e lineage

Ma non devono forzarsi nello stesso ledger fisico di esecuzione.

## Verita attuale del codice

### Gia presenti e utili

- configurazioni dominio:
  - [indoorGrowing.ts](/Volumes/990P/ortomio-main/types/indoorGrowing.ts)
  - [gardenSpaces.ts](/Volumes/990P/ortomio-main/types/gardenSpaces.ts)
  - [greenhouse.ts](/Volumes/990P/ortomio-main/types/greenhouse.ts)
- onboarding e strutture:
  - [GardenTypeWizard.tsx](/Volumes/990P/ortomio-main/components/GardenTypeWizard.tsx)
  - [GardenOnboarding.tsx](/Volumes/990P/ortomio-main/components/GardenOnboarding.tsx)
  - [SizeConfigurationStep.tsx](/Volumes/990P/ortomio-main/components/gardens/SizeConfigurationStep.tsx)
  - [AddStructureModal.tsx](/Volumes/990P/ortomio-main/components/gardens/AddStructureModal.tsx)
  - [GardenStructuresEditor.tsx](/Volumes/990P/ortomio-main/components/gardens/GardenStructuresEditor.tsx)
- motori logici:
  - [hydroponicEngine.ts](/Volumes/990P/ortomio-main/logic/hydroponicEngine.ts)
  - [aquaponicEngine.ts](/Volumes/990P/ortomio-main/logic/aquaponicEngine.ts)
  - [hydroponicDirector.ts](/Volumes/990P/ortomio-main/logic/hydroponicDirector.ts)
  - [aquaponicDirector.ts](/Volumes/990P/ortomio-main/logic/aquaponicDirector.ts)
  - [greenhouseDirector.ts](/Volumes/990P/ortomio-main/logic/greenhouseDirector.ts)
- form letture:
  - [ReadingForm.tsx](/Volumes/990P/ortomio-main/components/hydroponic/ReadingForm.tsx)
- microclima:
  - [sensorDataService.ts](/Volumes/990P/ortomio-main/services/sensorDataService.ts)
- migrazioni gia presenti:
  - [20260213000000_create_greenhouse_tracking.sql](/Volumes/990P/ortomio-main/supabase/migrations/20260213000000_create_greenhouse_tracking.sql)
  - [20260213000000_add_hydroponic_harvest_fields.sql](/Volumes/990P/ortomio-main/supabase/migrations/20260213000000_add_hydroponic_harvest_fields.sql)
  - [20260213000001_extend_individual_plants_greenhouse.sql](/Volumes/990P/ortomio-main/supabase/migrations/20260213000001_extend_individual_plants_greenhouse.sql)

### Gap attuali

1. Non esiste ancora una sezione operativa primaria tipo:
   - `/app/controlled-environment`
   - oppure `/app/hydroponic`, `/app/aquaponic`, `/app/greenhouse`

2. Le configurazioni sono soprattutto richiamabili da wizard iniziale o editor impostazioni, non da un modulo operativo dedicato.

3. Acqua e nutrienti sono ancora pensati soprattutto con logica outdoor:
   - `watering_logs`
   - `fertilizer_application_logs`

4. Manca il concetto operativo di:
   - `reservoir`
   - `recirculation loop`
   - `grow site`
   - `solution adjustment`
   - `solution change`
   - `water top-up`
   - `fish feeding`
   - `biofilter state`

5. I motori logici esistono, ma non leggono da un ledger operativo dedicato e persistito in modo uniforme.

## Decisione architetturale

Non creare un prodotto separato. Estendere il backbone esistente con una seconda famiglia di esecuzioni:

- `executionMode: outdoor`
- `executionMode: recirculating`

Questo vale per:

- `UnifiedOperationsService`
- task
- advice
- monitoring
- AI
- outcome

## Modello target

## 1. Profili strutturali

### 1.1 ControlledEnvironmentProfile

Rappresenta la struttura fisica principale.

Campi minimi:

- `id`
- `gardenId`
- `environmentType`
  - `greenhouse`
  - `indoor`
  - `hydroponic`
  - `aquaponic`
  - `aeroponic`
- `systemMode`
  - `soil_protected`
  - `recirculating`
  - `drain_to_waste`
- `validFrom`
- `validTo`
- `lightingProfile`
- `climateProfile`
- `structureProfile`
- `automationProfile`

### 1.2 ReservoirProfile

Campi minimi:

- `id`
- `gardenId`
- `environmentProfileId`
- `name`
- `capacityLiters`
- `usableVolumeLiters`
- `waterSource`
- `isShared`
- `validFrom`
- `validTo`

### 1.3 LoopProfile

Rappresenta il circuito di distribuzione.

Campi minimi:

- `id`
- `gardenId`
- `environmentProfileId`
- `reservoirId`
- `loopType`
  - `nft`
  - `dwc`
  - `ebb_flow`
  - `drip_recirculating`
  - `aquaponic_media_bed`
  - `aquaponic_nft`
  - `aeroponic`
- `pumpFlowRate`
- `cycleFrequency`
- `cycleDuration`
- `drainMode`
- `validFrom`
- `validTo`

### 1.4 GrowSiteProfile

Il target fisico vero del sistema controllato.

Puo essere:

- canale
- torre
- bucket
- tavolo
- letto
- raft
- media bed
- grow tray
- net pot lane

Campi minimi:

- `id`
- `gardenId`
- `environmentProfileId`
- `loopId`
- `siteType`
- `siteName`
- `positionIndex`
- `capacityPlants`
- `rowLikeIndex`
- `zoneLikeLabel`
- `validFrom`
- `validTo`

## 2. Baseline pianta

Lato pianta il modello resta comune ma va esteso con campi environment-aware.

Campi aggiuntivi:

- `environmentProfileId`
- `growSiteId`
- `netPotPosition`
- `substrateType`
- `cultivationSystem`
- `transplantIntoSystemDate`
- `rootZoneVolumeLiters`
- `batchId`

Questo vale per:

- piantine
- piante singole
- lotti omogenei indoor

## 3. Ledger operativo dedicato

## 3.1 ControlledEnvironmentExecution

Un execution ledger separato da `watering_logs`, ma agganciato allo stesso backbone concettuale.

Campi minimi:

- `id`
- `gardenId`
- `environmentProfileId`
- `reservoirId`
- `loopId`
- `growSiteIds`
- `plantIds`
- `executionMode = recirculating`
- `operationType`
  - `solution_prepare`
  - `solution_change`
  - `solution_top_up`
  - `ph_adjustment`
  - `ec_adjustment`
  - `circulation_cycle`
  - `flush`
  - `oxygenation`
  - `fish_feed`
  - `biofilter_maintenance`
  - `water_test`
  - `system_clean`
  - `transplant`
  - `pruning`
  - `harvest`
  - `treatment`
  - `inspection`
- `operationDate`
- `operationTime`
- `sourceType`
- `actorType`
- `parentExecutionId`
- `notes`

### 3.2 SolutionSnapshot

Ogni execution sul loop puo avere uno snapshot chimico/fisico.

Campi minimi:

- `ph`
- `ec`
- `temperatureCelsius`
- `dissolvedOxygen`
- `reservoirVolumeLiters`
- `salinity`
- `orp`
- `ammonia`
- `nitrite`
- `nitrate`

### 3.3 Dose/Adjustment payload

Per i sistemi recirculating non basta `quantity/unit`.

Servono:

- `waterAddedLiters`
- `solutionRemovedLiters`
- `nutrientProductId`
- `nutrientProductName`
- `nutrientDoseAmount`
- `nutrientDoseUnit`
- `phAdjusterProductId`
- `phAdjusterAmount`
- `bufferAdded`
- `fishFeedType`
- `fishFeedAmountGrams`

## 4. Observation ledger

Qui il modello resta coerente col piano generale, ma con osservazioni dedicate.

### 4.1 ControlledEnvironmentObservation

Campi minimi:

- `id`
- `gardenId`
- `environmentProfileId`
- `reservoirId`
- `loopId`
- `growSiteId`
- `plantId`
- `observationType`
  - `reading`
  - `inspection`
  - `ai_photo`
  - `plant_health`
  - `root_health`
  - `water_quality`
  - `fish_health`
  - `equipment_status`
- `observedAt`
- `source`
  - `manual`
  - `sensor`
  - `iot`
  - `ai`
- `payload`

## 5. Outcome ledger

### 5.1 ControlledEnvironmentOutcome

Campi minimi:

- `id`
- `gardenId`
- `executionId`
- `growSiteId`
- `plantId`
- `outcomeType`
  - `growth_response`
  - `yield_response`
  - `root_issue`
  - `toxicity`
  - `deficiency`
  - `disease`
  - `fish_loss`
  - `water_instability`
- `measuredAt`
- `severity`
- `notes`

## Integrazione col backbone esistente

## A. UnifiedOperationsService

Estensione proposta:

- aggiungere `executionMode?: 'outdoor' | 'recirculating'`
- aggiungere target:
  - `reservoirId`
  - `loopId`
  - `growSiteIds`
- aggiungere operationType del mondo recirculating

Regola:

- `outdoor` continua a scrivere su `watering_logs`, `fertilizer_application_logs`, `treatment_register`, `mechanical_work_register`
- `recirculating` scrive su un nuovo ledger `controlled_environment_executions`

## B. operationContextService

Per `controlled environment` il contesto non dipende soprattutto dal meteo esterno, ma da:

- clima interno target
- clima interno misurato
- stato soluzione
- stato loop
- stato automazioni

Va quindi aggiunta una seconda strategia di context resolution.

## C. planner/advice/health

Per questi moduli:

- outdoor -> task come irrigazione/concimazione/trattamento
- controlled environment -> task come:
  - controllo pH/EC
  - cambio soluzione
  - refill serbatoio
  - alimentazione pesci
  - pulizia filtro
  - controllo radici

I motori [hydroponicEngine.ts](/Volumes/990P/ortomio-main/logic/hydroponicEngine.ts) e [aquaponicEngine.ts](/Volumes/990P/ortomio-main/logic/aquaponicEngine.ts) vanno reindirizzati a leggere dal ledger vero, non solo da config + readings.

## D. sensorDataService

Questo servizio e gia il punto giusto per:

- temperatura aria indoor
- umidita
- microclima serra

Ma va esteso anche a:

- pH solution
- EC
- dissolved oxygen
- reservoir level
- water temperature
- ammonia/nitrite/nitrate

## E. harvest

La raccolta ha gia alcuni campi hydro/aquaponic.
Va collegata a:

- `growSiteId`
- `loopId`
- `solution snapshot recente`
- `batch / cohort`

## Routing target

Serve una sezione richiamabile anche dopo il wizard:

- `/app/controlled-environment`

Con 5 tab interne:

1. `Panoramica`
2. `Strutture`
3. `Loop & Soluzione`
4. `Letture`
5. `Piante & Siti`

Facoltative:

6. `Pesci` per acquaponica
7. `Analytics`

## Sequenza implementativa

## Sprint CE-1

- creare route `/app/controlled-environment`
- leggere e mostrare configurazioni gia salvate
- mostrare strutture indoor/serra/hydro/aquaponic esistenti

## Sprint CE-2

- introdurre `controlled_environment_executions`
- introdurre `ControlledEnvironmentExecutionService`
- integrare `UnifiedOperationsService` con `executionMode`

## Sprint CE-3

- trasformare `ReadingForm.tsx` in observation ledger reale
- collegare pH/EC/acqua/loop ai task automatici

## Sprint CE-4

- agganciare `hydroponicEngine` e `aquaponicEngine` al ledger operativo
- introdurre outcome e confronto storico

## Sprint CE-5

- integrare `harvest`, `health`, `advice`, `monitoring`
- data quality scoring anche per sistemi recirculating

## File da toccare subito

- [GardenOnboarding.tsx](/Volumes/990P/ortomio-main/components/GardenOnboarding.tsx)
- [GardenStructuresEditor.tsx](/Volumes/990P/ortomio-main/components/gardens/GardenStructuresEditor.tsx)
- [ReadingForm.tsx](/Volumes/990P/ortomio-main/components/hydroponic/ReadingForm.tsx)
- [sensorDataService.ts](/Volumes/990P/ortomio-main/services/sensorDataService.ts)
- [unifiedOperationsService.ts](/Volumes/990P/ortomio-main/services/unifiedOperationsService.ts)
- nuovi:
  - `services/controlledEnvironmentService.ts`
  - `services/controlledEnvironmentExecutionService.ts`
  - `app/app/controlled-environment/page.tsx`

## Criterio di riuscita

Un sistema hydro/aquaponic deve permettere questo flusso:

1. creare la struttura dal wizard
2. riaprirla da una sezione operativa dedicata
3. vedere reservoir, loop, siti coltivati e letture recenti
4. registrare un refill/cambio soluzione/regolazione pH o EC
5. collegare l'evento alle piante o ai grow sites coinvolti
6. osservare la risposta nel tempo
7. confrontare una stagione o un ciclo con i precedenti

Solo a quel punto il supporto indoor/idroponico/acquaponico smette di essere “configurazione prevista” e diventa davvero un modulo operativo di precisione.
