# ORCHESTRATOR DEEP AUDIT (2026-03-09)

## Contesto e obiettivo
Richiesta funzionale di riferimento:
- Ogni operazione (irrigazione, lavorazione terreno, potatura, sfemminellatura, fertilizzazione, trattamenti) deve essere registrata sotto orchestratore.
- Ogni registrazione deve includere sempre contesto meteo del momento e contesto geografico completo (coordinate, altitudine, esposizione solare, ostacoli).
- I dati devono supportare audit storico, monitoraggio salute/resa e predizioni.

Questo documento fotografa lo stato reale del codice al 9 marzo 2026.

## Metodologia
Analisi statica end-to-end su UI, servizi orchestrazione, provider storage cloud/local e schema migrazioni Supabase.

Aree analizzate:
- orchestratore operazioni: `services/unifiedOperationsService.ts`, `services/plantRowSyncService.ts`, `services/integratedFieldOperationsService.ts`
- diario/registro: `services/dailyDiaryService.ts`, `services/operationRegistryService.ts`, `services/operationalDiaryService.ts`
- meteo/geo-context: `services/weatherService.ts`, `services/operationContextService.ts`, `components/shared/HomeDashboard.tsx`
- frutteto: `components/orchard/TreeManager.tsx`, `services/orchardService.ts`, `types/orchard.ts`
- persistenza: `packages/storage-cloud/SupabaseStorageProvider.ts`, `packages/storage-local/LocalStorageProvider.ts`
- onboarding geo-clima: `components/GardenOnboarding.tsx`
- schema: migrazioni `supabase/migrations/*`

## Findings

### 1) Orchestratore non completato end-to-end
1. `work` non supportato a livello filare in `UnifiedOperationsService`:
   - `services/unifiedOperationsService.ts:252`
2. Metodi core placeholder/non implementati:
   - `getUnifiedOperations` ritorna array vuoto (`services/unifiedOperationsService.ts:472-487`)
   - `getOperationSyncLogs` ritorna array vuoto (`services/unifiedOperationsService.ts:496-509`)
   - `getBedIdForRow` ritorna `undefined` (`services/unifiedOperationsService.ts:545-550`)
   - `getLatestSyncLog` ritorna `null` (`services/unifiedOperationsService.ts:556-564`)
   - `getPlantOperationsBySource` ritorna `[]` (`services/unifiedOperationsService.ts:570-577`)
3. Sync filare->pianta con logica dichiarata "semplificata/hack" e data non allineata:
   - commenti "simplified/hack" (`services/plantRowSyncService.ts:183`, `services/plantRowSyncService.ts:213`)
   - `operationDate` impostata a `new Date().toISOString()` invece della data sorgente (`services/plantRowSyncService.ts:328`)
4. Altri servizi orchestrazione/registro in memoria e non persistenti:
   - `Map` in `OperationRegistryService` (`services/operationRegistryService.ts:108`)
   - TODO esplicito salvataggio DB (`services/operationRegistryService.ts:118`)
   - `Map` in `OperationalDiaryService` (`services/operationalDiaryService.ts:56-57`)
   - `IntegratedFieldOperationsService` registra operazioni sulle piante in array runtime (`services/integratedFieldOperationsService.ts:317-339`)

Impatto: il tracciamento orchestrato non e affidabile come fonte unica storica e analytics.

### 2) Il contesto meteo/ambientale viene spesso calcolato ma non persistito
1. Modello e servizio supportano il contesto:
   - `PlantOperation.context` definito in type (`types/individualPlant.ts:145-169`)
   - `OperationContextService` genera weather/lunar/season/daylight (`services/operationContextService.ts:50-79`)
2. UI lo calcola in alcune operazioni:
   - raccolto (`components/plants/PlantHarvestModal.tsx:47-66`)
   - foto/salute (`components/plants/PlantPhotoHealthModal.tsx:62-88`)
   - trapianto (`services/transplantOrchestrationService.ts:81-90`, `services/transplantOrchestrationService.ts:116`)
3. Ma provider cloud/local non salva `context` in `individual_plant_operations`:
   - cloud `createPlantOperation` salva solo campi base + `greenhouse_conditions` (`packages/storage-cloud/SupabaseStorageProvider.ts:4441-4454`)
   - cloud non rimappa `weather_conditions/context` in lettura (`packages/storage-cloud/SupabaseStorageProvider.ts:4413-4433`)
   - local provider idem (`packages/storage-local/LocalStorageProvider.ts:2219-2239`)
4. Inoltre le richieste manuali orchestratore non includono contesto nel contratto:
   - `UnifiedOperationRequest` non ha campi meteo/geo (`services/unifiedOperationsService.ts:56-80`)
   - entry manuale usa `executeUnifiedOperation` senza capture context (`components/plants/PlantDetailModal.tsx:110-123`)

Impatto: perdita strutturale del dato contestuale richiesto per audit causale e predizioni.

### 3) Meteo non sempre legato alle coordinate del garden (fallback Roma presente)
1. Fallback Roma nel weather service:
   - `services/weatherService.ts:258-263`
2. Se garden senza coordinate valide, fallback su user-location (che puo finire su Roma):
   - `services/weatherService.ts:285-287`
3. Dashboard usa fallback hardcoded Roma per widget meteo:
   - `components/shared/HomeDashboard.tsx:540-547`
4. Diario giornaliero usa `profiles.latitude/longitude`, se assenti fallback Roma:
   - `services/dailyDiaryService.ts:274-285`

Impatto: meteo incoerente rispetto a orto/frutteto registrato; invalidazione analisi storica.

### 4) Drift critico tra servizio diario e schema DB
1. Migrazione crea `daily_weather_log` con:
   - `garden_id`, `temperature_min`, `temperature_max` (`supabase/migrations/20260128000000_add_missing_diary_tables.sql:5-17`)
2. Servizio usa invece:
   - filtro per `user_id` (`services/dailyDiaryService.ts:205-208`)
   - campi `temp_min`, `temp_max` (`services/dailyDiaryService.ts:233-234`)
3. Incoerenza interna nello stesso servizio:
   - `getDailyEntry` filtra `daily_weather_log` su `garden_id` (`services/dailyDiaryService.ts:968-971`)
   - `getDiaryEntries` filtra su `user_id` (`services/dailyDiaryService.ts:1005-1008`)
4. Query incomplete su garden scope:
   - `getDailyEntry` per tracking/events filtra solo per data, non per `garden_id` (`services/dailyDiaryService.ts:974-981`)

Impatto: rischio alto di errori runtime, dati mancanti o mescolati tra orti.

### 5) Frutteto: batch creation c'e, ma diario non raggiunge il requisito orchestratore completo
1. Batch multi-fila gia presente lato UI:
   - `rowsCount` e creazione su file consecutive (`components/orchard/TreeManager.tsx:665`, `components/orchard/TreeManager.tsx:782-790`)
   - bulk create su DB (`components/orchard/TreeManager.tsx:240`, `services/orchardService.ts:222-233`)
2. Il 400 visto in console e compatibile con drift schema remoto vs colonne attese dal client (query su `orchard_trees` con molti campi), da verificare su ambiente deploy.
3. Diario albero "quick entry" ridotto:
   - solo `irrigation|treatment` (`components/orchard/TreeManager.tsx:1457-1463`)
   - mapping forzato su `soil_amendment|disease_control` (`components/orchard/TreeManager.tsx:1391`)
4. `tree_treatments` salva meteo semplificato (`weather_conditions`, `temperature_c`, `wind_speed_kmh`, `humidity_percent`) senza snapshot geo completo:
   - schema (`supabase/migrations/20260117030000_create_orchard_management_system.sql:469-472`)
   - type (`types/orchard.ts:633-636`)

Impatto: il diario frutteto non copre il livello di granularita richiesto per orchestrazione predittiva.

### 6) Dati geo-climatici raccolti dal wizard non arrivano completamente alla persistenza
1. Onboarding raccoglie coordinate + altitudine + esposizione + ostacoli:
   - `components/GardenOnboarding.tsx:604-620`
2. Mapping garden su DB non include `obstacles`:
   - `packages/storage-cloud/SupabaseStorageProvider.ts:1055-1089`
3. `createGarden/updateGarden` scrive solo `gardens` (+ strutture), nessuna scrittura `garden_obstacles`:
   - `packages/storage-cloud/SupabaseStorageProvider.ts:467-475`, `packages/storage-cloud/SupabaseStorageProvider.ts:576-600`

Impatto: parte del contesto territoriale richiesto viene perso gia in fase anagrafica.

### 7) Incoerenze colonnari e TODO ad alto rischio
1. Trattamenti: write su `row_id`, read su `bed_row_id`:
   - insert/update (`packages/storage-cloud/SupabaseStorageProvider.ts:2781`, `packages/storage-cloud/SupabaseStorageProvider.ts:2808`)
   - mapper output (`packages/storage-cloud/SupabaseStorageProvider.ts:2849`)
2. `CultivationOrchestrator` usa `user_id = plan.gardenId` (TODO):
   - `services/cultivationOrchestrator.ts:503`, `services/cultivationOrchestrator.ts:581`

Impatto: possibili errori RLS/ownership e tracciamento non affidabile.

## Valutazione complessiva
Stato attuale: parzialmente orchestrato a livello UX, ma non ancora orchestrato in modo consistente a livello dati persistiti.

Bloccanti principali per rispettare la visione richiesta:
1. Mancanza di modello dati unico "operation event + context snapshot" realmente scritto ovunque.
2. Fallback meteo non vincolato rigidamente alle coordinate del garden.
3. Drift schema/servizi sul diario che rompe la base dati storica.
4. Persistenza incompleta del contesto geografico-agronomico (ostacoli/esposizione avanzata).

## Priorita immediate suggerite (prima delle correzioni estese)
1. Allineamento schema/servizi diario (`daily_weather_log`, tracking, events).
2. Write path unico operazioni con context obbligatorio.
3. Rimozione fallback Roma dove esistono coordinate garden.
4. Backfill e normalizzazione dei dati gia registrati.
