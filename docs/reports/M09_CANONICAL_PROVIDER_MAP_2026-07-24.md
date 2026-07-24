# M09 - Mappa provider canonici

## Regola

`cloud` significa Supabase persistente e deve fallire se Supabase non e' disponibile. `local` e' ammesso solo quando richiesto esplicitamente per sviluppo/demo. Cache e preferenze sono proiezioni non autorevoli e non possono confermare una scrittura.

## Domini prioritari

| Dominio | Writer canonico | Reader canonico | Tabella/provider | Stato |
|---|---|---|---|---|
| garden e zone | API server / Supabase | API server / Supabase | `gardens`, `land_zones` | convergente; staging richiesto |
| stato suolo | API `/api/garden/soil-state` | stessa API | `garden_soil_states` | convergente; staging richiesto |
| semi | `SeedInventoryService` | stesso servizio | `seed_inventory` | fallback demo rimosso; helper cache legacy residui |
| task e diario | storage cloud / servizi canonici | storage cloud | `garden_tasks`, `daily_diary_entries` | test fail-closed presenti |
| operazioni fisiche | pipeline lifecycle | stessa pipeline | eventi persistenti P4 | migrazione staging richiesta |
| prediction e outcome | pipeline predizioni | stessa pipeline | tabelle P5 | migrazione staging richiesta |
| NDVI e mappe | servizi P6 | storage cloud | tabelle P6 | provider reale/staging richiesti |
| export e audit | route server | route server | tabelle P7 | migrazione staging richiesta |
| rollout | RPC server | readiness server | tabelle P8 | migrazione staging richiesta |

## Correzione applicata

`createStorageProvider('cloud')` non degrada piu' a `LocalStorageProvider`: se Supabase non e' disponibile genera un errore. La modalita' locale resta accessibile solo con `createStorageProvider('local')`.

## Residuo

- migrare gli helper sincroni dell'inventario semi al reader asincrono;
- eliminare l'avvio temporaneo su local storage per utenti autenticati nello `StorageContext`;
- chiudere le 52 voci M09 del manifest M05;
- applicare e certificare le migrazioni canoniche in staging.
