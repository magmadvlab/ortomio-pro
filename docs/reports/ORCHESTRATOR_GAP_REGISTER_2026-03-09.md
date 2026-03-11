# ORCHESTRATOR GAP REGISTER (2026-03-09)

## Scala priorita
- P0: blocca affidabilita dati o coerenza operativa.
- P1: degrada fortemente qualita tracciamento/predizione.
- P2: miglioramento importante ma non bloccante immediato.

## Gap list
| ID | Pri | Gap | Evidenze | Rischio | Direzione correzione | Criterio di accettazione |
|---|---|---|---|---|---|---|
| G-001 | P0 | `context` operazione non persistito in `individual_plant_operations` | `types/individualPlant.ts:145-169`, `components/plants/PlantHarvestModal.tsx:47-66`, `packages/storage-cloud/SupabaseStorageProvider.ts:4441-4454` | Impossibile analisi causale meteo/intervento | Estendere write/read provider con `weather_conditions` + `operation_context` JSONB | Ogni nuova operazione contiene snapshot contesto completo persistito |
| G-002 | P0 | Contratto orchestratore senza campi contesto | `services/unifiedOperationsService.ts:56-80` | Operazioni manuali/IOT non standardizzate sul contesto | Aggiungere `contextSnapshot` obbligatorio lato orchestratore (oppure resolver interno obbligatorio) | Nessuna operazione salvata senza contesto validato |
| G-003 | P0 | Drift schema `daily_weather_log` (campi/user scope) | `supabase/migrations/20260128000000_add_missing_diary_tables.sql:5-17`, `services/dailyDiaryService.ts:205-208`, `services/dailyDiaryService.ts:233-234` | Query/insert incoerenti, dati persi o errori runtime | Allineare naming e chiavi (`garden_id` + `temperature_min/max`) e aggiornare servizio | CRUD diario giornaliero verde su ambiente reale |
| G-004 | P0 | Query diario non filtrano sempre per garden | `services/dailyDiaryService.ts:974-981` | Mix dati tra orti dello stesso utente | Applicare filtro `garden_id` in tutte le query tracking/events | Nessuna entry di altri orti nelle query giorno/periodo |
| G-005 | P0 | Fallback meteo Roma in percorso operativo | `services/weatherService.ts:258-263`, `components/shared/HomeDashboard.tsx:540-547`, `services/dailyDiaryService.ts:281-285` | Meteo non rappresentativo del sito coltura | Rendere coordinate garden mandatory per meteo operativo; fallback solo esplicito e tracciato | Ogni meteo operativo indica `source=garden_coordinates` o stato "missing coordinates" |
| G-006 | P0 | `user_id` valorizzato con `gardenId` in orchestrator | `services/cultivationOrchestrator.ts:503`, `services/cultivationOrchestrator.ts:581` | Violazioni RLS/ownership e dati orfani | Recuperare `auth.uid` reale o owner garden da DB prima insert | Nessun record con `user_id` non valido |
| G-007 | P1 | Placeholder/empty result in servizi unificati | `services/unifiedOperationsService.ts:472-487`, `services/unifiedOperationsService.ts:496-509`, `services/unifiedOperationsService.ts:556-577` | Dashboard/storico orchestratore incompleti | Implementare query reali su viste/tabelle sync | API unificate restituiscono dati reali e consistenti |
| G-008 | P1 | Sync filare->pianta "hack" + data non sorgente | `services/plantRowSyncService.ts:183`, `services/plantRowSyncService.ts:213`, `services/plantRowSyncService.ts:328` | Storico temporale falsato, errori in predizioni | Refactor sync con mapping deterministico row/zone e `operationDate` sorgente | Operazioni figlie ereditano `source_operation_timestamp` corretto |
| G-009 | P1 | Registro/diario in-memory (non persistente) | `services/operationRegistryService.ts:108`, `services/operationRegistryService.ts:118`, `services/operationalDiaryService.ts:56-57` | Perdita dati su refresh/redeploy | Portare storage su DB con transazioni e idempotenza | Ripristino completo storico dopo restart applicativo |
| G-010 | P1 | Incoerenza colonne trattamenti (`row_id` vs `bed_row_id`) | `packages/storage-cloud/SupabaseStorageProvider.ts:2781`, `packages/storage-cloud/SupabaseStorageProvider.ts:2849` | Filtri/relazioni filare non affidabili | Normalizzare mapping su un unico naming canonico | Query trattamenti per filare sempre coerenti |
| G-011 | P1 | Frutteto diario rapido copre pochi casi e poco contesto | `components/orchard/TreeManager.tsx:1457-1463`, `components/orchard/TreeManager.tsx:1391`, `types/orchard.ts:633-636` | Interventi manuali non tracciati con dettaglio richiesto | Introdurre orchestratore albero con tipi completi + context snapshot | Ogni intervento albero (manuale/IOT) ha meteo+geo+agro contesto |
| G-012 | P1 | Dati ostacoli/esposizione non persistiti end-to-end | `components/GardenOnboarding.tsx:604-620`, `packages/storage-cloud/SupabaseStorageProvider.ts:1055-1089` | Predizioni microclima incomplete | Persistenza `garden_obstacles` + riferimento versionato nel context snapshot | Snapshot operazione include `obstacles_version` valido |
| G-013 | P1 | Errore 400 su bulk trees legato a drift schema ambiente | `services/orchardService.ts:222-233`, `components/orchard/TreeManager.tsx:240` | Creazione batch fallisce in produzione | Verifica e allineamento migrazioni orchard su ambiente deploy | Bulk create trees funziona su ambiente reale con test e2e |
| G-014 | P2 | Modalita sorgente IOT/manuale non sempre tracciata in forma canonica | `components/plants/PlantDetailModal.tsx:190-195`, `packages/storage-cloud/SupabaseStorageProvider.ts:4464-4483` | Ambiguita nelle analisi per origine evento | Uniformare `source_type`, `actor_type`, `device_id` | 100% operazioni con origine tracciabile |
| G-015 | P2 | Fallback multi-tabella saplings produce warning rumorosi | `services/saplingService.ts:204-299` | Rumore console e diagnosi difficile | Hardening fallback + telemetria "schema mismatch" dedicata | Nessun warning non-azione in console utente |

## Sequenza raccomandata (execution order)
1. P0 schema + write path (`G-001..G-006`).
2. P1 orchestrazione e frutteto (`G-007..G-013`).
3. P2 hardening e osservabilita (`G-014..G-015`).

## Dipendenze chiave
- `G-001` dipende da migration DB per colonne context.
- `G-003` e prerequisito per rendere affidabile qualunque analytics giornaliera.
- `G-013` dipende da audit ambiente deploy (migrazioni applicate/non applicate).
