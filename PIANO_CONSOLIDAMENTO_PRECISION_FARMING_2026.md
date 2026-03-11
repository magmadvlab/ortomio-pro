# Piano Consolidamento Precision Farming 2026

Data: 2026-03-10

## Obiettivo

Portare OrtoMio da sistema ibrido a sistema operativo di precisione realmente coerente per:

- filare
- pianta singola
- albero singolo
- frutteto con eta miste e reimpianti

Il target corretto non e "salvare tutto in ogni operazione", ma separare in modo rigoroso:

1. profili ambientali versionati
2. baseline pianta/albero
3. ledger operazioni
4. ledger osservazioni

## Verita attuale del codice

### Gia centrato su un backbone reale

- `services/unifiedOperationsService.ts`
- `services/plantRowSyncService.ts`
- `services/transplantOrchestrationService.ts`
- `services/orchardService.ts`

### Esiste ma non e ancora pienamente centrale

- `services/operationContextService.ts`
- `services/fieldRowCropHistoryService.ts`
- `components/orchard/TreeManager.tsx`
- `components/orchard/OrchardWizard.tsx`
- `logic/diseaseDiagnosisEngine.ts`

### Esiste ma oggi e parallelo, mock o incompleto

- `services/integratedFieldOperationsService.ts`
- `components/fieldrows/QuickOperationModal.tsx`
- `services/operationRegistryService.ts`
- `services/continuousMonitoringService.ts`
- `services/plantMonitoringService.ts`
- `services/fieldRowPlantIntegrationService.ts`
- `components/Advice.tsx`

## Principi architetturali da fissare prima di implementare

### 1. Un solo entrypoint per le operazioni

Tutte le operazioni manuali, AI, IoT, quick action, filare, pianta, albero e trapianto devono scrivere attraverso `UnifiedOperationsService`.

### 2. Contesto storico reale

Se un evento e avvenuto il 12 maggio 2025, il contesto deve rappresentare il 12 maggio 2025:

- meteo storico o stimato per quella data
- ore di luce di quella data
- fase stagionale di quella data
- profilo ambientale valido in quella data

### 3. Dati statici e semi-statici versionati

Non vanno duplicati ad ogni evento:

- esposizione
- ore di sole stimate
- suolo
- pH
- ostacoli
- drenaggio
- impianto irriguo
- layout e distanze

Vanno versionati con `validFrom` e `validTo`.

### 4. Frutteto: coorti, non rotazione

Per i filari orticoli serve `crop rotation history`.
Per il frutteto serve `cohort and replant history`.

## Backlog esecutivo

## P1 - Backbone operativo unico

### P1.1 - Rendere `UnifiedOperationsService` l'unico percorso di scrittura

Stato: prioritario immediato

File da toccare:

- `services/unifiedOperationsService.ts`
- `services/transplantOrchestrationService.ts`
- `services/integratedFieldOperationsService.ts`
- `components/fieldrows/QuickOperationModal.tsx`
- `services/operationRegistryService.ts`

Azioni:

- confermare `UnifiedOperationsService` come entrypoint unico per ogni `operationType`
- far passare i quick operations da `UnifiedOperationsService`
- ridurre `integratedFieldOperationsService` ad adapter o rimuoverlo dal flusso principale
- spostare `operationRegistryService` da store in-memory a vero adapter di persistenza o eliminarlo se ridondante
- allineare `transplantOrchestrationService` al ledger unico senza logiche duplicate di salvataggio

Output atteso:

- nessuna operazione crea record fuori dal ledger principale
- stesso formato per irrigazione, fertilizzazione, trattamento, lavoro, trapianto
- stesso lineage per operazioni derivate

Criteri di uscita:

- una quick operation su filare produce record persistiti nello stesso ledger usato da piante e alberi
- il trapianto produce operazione ledger piu eventuale storico coltura senza salvataggi paralleli

### P1.2 - Correggere la propagazione filare -> pianta

Stato: prioritario immediato

File da toccare:

- `services/plantRowSyncService.ts`
- `services/unifiedOperationsService.ts`
- `packages/storage-cloud/SupabaseStorageProvider.ts`

Azioni:

- usare sempre `operationDate` e `operationTime` della sorgente, mai `new Date()` locale
- copiare `parentOperationId`, `parentOperationTable`, `sourceType`, `actorType`
- filtrare per `fieldRowId` reale e non per sola zona quando possibile
- allineare i tipi `fertilizing` vs `fertilizer`
- correggere il mapping dei fertilizer logs per non perdere `fieldRowId` e riferimenti operativi

Output atteso:

- ogni operazione derivata sa da quale evento sorgente proviene
- il tracciamento per singola pianta resta coerente con il filare reale

Criteri di uscita:

- da una irrigazione filare, tutte le plant operations derivate hanno stessa data evento e stesso parent
- da una fertilizzazione filare, nessun riferimento `fieldRowId` viene perso in storage

### P1.3 - Rendere storico il contesto operativo

Stato: prioritario immediato

File da toccare:

- `services/operationContextService.ts`
- `services/fieldRowCropHistoryService.ts`
- `services/transplantOrchestrationService.ts`
- eventuale provider meteo storico in `services/weatherService.ts`

Azioni:

- sostituire `getCurrentWeather(...)` con una strategia `getHistoricalWeather(...)` o `getWeatherForDate(...)`
- distinguere il `source` del contesto: `historical`, `estimated`, `fallback`
- passare esplicitamente la data evento in ogni chiamata
- centralizzare il calcolo di daylight e stagione per la data evento

Output atteso:

- lo stesso evento conserva contesto coerente se consultato in futuro
- trapianti e storico filari non usano piu meteo del giorno corrente

Criteri di uscita:

- un trapianto datato 2025-05-12 salva meteo e contesto del 2025-05-12, non del giorno di inserimento

## P2 - Modello dati di precisione

### P2.1 - Introdurre profili ambientali versionati

Stato: subito dopo P1

File da toccare:

- `types.ts`
- `types/orchard.ts`
- `components/GardenOnboarding.tsx`
- `components/orchard/TreeManager.tsx`
- nuove migrazioni Supabase

Azioni:

- definire un `EnvironmentalProfile` versionato per `garden`, `fieldRow`, `tree`
- includere almeno:
  - `soilType`
  - `soilPh`
  - `altitudeMeters`
  - `sunExposure`
  - `dailySunHours`
  - `aspectDirection`
  - `obstacles`
  - `irrigationLayout`
  - `drainageClass`
  - `windProtection`
- fare in modo che le operazioni puntino al profilo valido, non a campi sparsi copiati in modo casuale

Output atteso:

- ambiente sito e micro-sito gestiti come asset temporali, non come snapshot scollegati

Criteri di uscita:

- una pianta/albero puo sapere quale profilo ambientale era valido alla data dell'evento

### P2.2 - Baseline individuale pianta/albero completa

Stato: subito dopo P2.1

File da toccare:

- `types/orchard.ts`
- `services/orchardService.ts`
- `components/orchard/TreeManager.tsx`
- `components/orchard/OrchardWizard.tsx`

Azioni:

- rendere espliciti per ogni albero:
  - `plantingDate`
  - `treeAgeYears`
  - `ageSource`
  - `rootstock`
  - `fieldRowId`
  - `positionInRow`
  - `isReplacement`
  - `replacesTreeId`
  - `cohortId`
- esporre in UI sia data impianto sia eta stimata
- supportare frutteti preesistenti con date incerte e precisione del dato

Output atteso:

- stesso frutteto puo avere alberi storici, reimpianti e fallanze senza perdere coerenza

Criteri di uscita:

- e possibile modellare un frutteto preesistente con alberi di eta diverse nella stessa fila

### P2.3 - Correggere il wizard frutteto

Stato: subito dopo P2.2

File da toccare:

- `components/orchard/OrchardWizard.tsx`
- `types/orchard.ts`
- `services/orchardService.ts`

Azioni:

- salvare realmente `soilPh`
- trasformare `bulk` in generazione effettiva di `treeData`
- progettare `import` CSV come backlog immediato successivo
- aggiungere campi per frutteto preesistente e alberi con date non uniformi

Output atteso:

- il wizard non raccoglie dati che poi vengono persi
- puo avviare frutteti nuovi e preesistenti

Criteri di uscita:

- un wizard completato genera una configurazione coerente e, se previsto, gli alberi reali

## P3 - Osservazioni, foto e AI

### P3.1 - Creare il ledger osservazioni

Stato: dopo P1 e P2 base

File da toccare:

- `services/plantMonitoringService.ts`
- `logic/diseaseDiagnosisEngine.ts`
- `components/DiseaseDiagnosis.tsx`
- `components/Advice.tsx`
- `components/orchard/TreeManager.tsx`
- nuove migrazioni Supabase

Azioni:

- distinguere formalmente `observation` da `operation`
- salvare foto, diagnosi AI, sintomi, note, confidenza, origine e timestamp
- collegare una osservazione a:
  - `plantId` o `treeId`
  - `fieldRowId`
  - `gardenId`
  - eventuale `relatedOperationId`
- trasformare i risultati AI in osservazioni persistite, non solo journal o simulazioni locali

Output atteso:

- una foto analizzata entra nello storico reale della singola pianta/albero

Criteri di uscita:

- da una foto si vede diagnosi, contesto e cronologia nello stesso ledger osservazioni

### P3.2 - Rimuovere simulazioni e mock dal monitoraggio

Stato: subito dopo P3.1

File da toccare:

- `services/plantMonitoringService.ts`
- `services/continuousMonitoringService.ts`
- `services/fieldRowPlantIntegrationService.ts`

Azioni:

- sostituire `URL.createObjectURL(...)` e mock storage con upload reale
- sostituire analisi simulate con provider reale o con flag esplicito di simulazione
- eliminare `generateDemoPlants(...)` dal flusso di produzione
- caricare dati reali in `continuousMonitoringService`

Output atteso:

- niente servizi "centrali" che in realta usano dati finti

Criteri di uscita:

- in produzione non resta alcun path centrale basato su demo data o persistenza locale

## P4 - Agronomia di precisione e motori decisionali

### P4.1 - Acqua, fertilizzazione e trattamenti guidati dallo storico

Stato: dopo chiusura P1-P3

File da toccare:

- `logic/waterRequirementEngine.ts`
- moduli nutrizione e trattamenti gia esistenti
- `logic/director.ts`

Azioni:

- far consumare ai motori non solo meteo e crop profile, ma anche:
  - esposizione
  - ore di sole
  - profilo terreno
  - storico irrigazioni
  - storico fertilizzazioni
  - storico trattamenti
  - coorte/eta della pianta o dell'albero
- introdurre source tagging per ogni suggerimento calcolato

Output atteso:

- raccomandazioni davvero basate sul profilo locale e sullo storico reale

Criteri di uscita:

- una decisione irrigua o nutrizionale puo essere spiegata con dati sorgente verificabili

### P4.2 - Director e orchestrazione decisionale finale

Stato: dopo P4.1

File da toccare:

- `logic/director.ts`
- `services/cultivationOrchestrator.ts`
- eventuali widget e dashboard di sintesi

Azioni:

- fare in modo che il livello decisionale usi il ledger unico e i profili versionati
- evitare che il director legga dati incompleti o derivati da servizi mock

Output atteso:

- il livello AI/predittivo legge dati affidabili e spiegabili

Criteri di uscita:

- ogni suggerimento prioritario ha provenance chiara

## P5 - Qualita dati, migrazioni e rollout

### P5.1 - Data quality scoring

File da toccare:

- nuovi servizi di audit
- dashboard operative

Azioni:

- assegnare ad ogni pianta/albero un punteggio di completezza su:
  - identita
  - profilo ambientale
  - storico eventi
  - storico osservazioni
  - contesto storico valido

Output atteso:

- il sistema sa quanto e affidabile ogni scheda pianta/albero

### P5.2 - Migrazioni e backfill

File da toccare:

- nuove migrazioni Supabase
- script di backfill
- mapping storage

Azioni:

- backfill dei riferimenti mancanti `fieldRowId`, `parentOperationId`, source context
- backfill del `soilPh` frutteto dove oggi viene raccolto ma perso
- migrazione controllata dei moduli paralleli al ledger unico

Output atteso:

- i dati storici non vengono persi nel consolidamento

## Sequenza implementativa consigliata

### Sprint 1

- P1.1 backbone unico
- P1.2 sync filare -> pianta
- P1.3 contesto storico

### Sprint 2

- P2.1 profili ambientali versionati
- P2.2 baseline individuale albero/pianta
- P2.3 wizard frutteto coerente

### Sprint 3

- P3.1 observation ledger
- P3.2 rimozione mock critici

### Sprint 4

- P4.1 motori acqua/nutrizione/trattamenti sullo storico reale
- P4.2 layer director finale

### Sprint 5

- P5.1 data quality scoring
- P5.2 backfill e rollout

## Primo blocco da eseguire subito

Ordine pratico immediato:

1. chiudere `UnifiedOperationsService` come unico entrypoint
2. correggere `plantRowSyncService`
3. correggere `operationContextService`
4. correggere `fieldRowCropHistoryService`
5. correggere `SupabaseStorageProvider` per fertilizer logs
6. scollegare `QuickOperationModal` da `integratedFieldOperationsService`

## File da correggere subito

- `services/unifiedOperationsService.ts`
- `services/plantRowSyncService.ts`
- `services/operationContextService.ts`
- `services/fieldRowCropHistoryService.ts`
- `services/transplantOrchestrationService.ts`
- `packages/storage-cloud/SupabaseStorageProvider.ts`
- `services/integratedFieldOperationsService.ts`
- `components/fieldrows/QuickOperationModal.tsx`

## File da rifattorizzare nel secondo blocco

- `types.ts`
- `types/orchard.ts`
- `components/GardenOnboarding.tsx`
- `components/orchard/TreeManager.tsx`
- `components/orchard/OrchardWizard.tsx`
- `services/orchardService.ts`

## File da lasciare come adapter temporanei

- `services/cultivationOrchestrator.ts`
- `logic/director.ts`

Questi due vanno adattati solo dopo che il backbone dati e operazioni e affidabile.

