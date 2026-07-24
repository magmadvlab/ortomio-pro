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

Il 24/07/2026 e' stata completata anche la prima convergenza dei consumer autenticati:

- `StorageContext` non monta piu' i consumer durante la risoluzione del provider;
- `initialProvider` viene rispettato nei test e negli embedding espliciti;
- un errore di sessione o provider cloud resta visibile e non provoca uno switch silenzioso a `LocalStorageProvider`;
- il diario carica l'inventario sementi dal reader asincrono;
- il consumo sementi restituisce successo soltanto dopo persistenza e rilettura autorevole;
- gli errori di persistenza sono propagati alla UI.

Verifiche locali: type-check verde, persistenza 22/22, suite release 309/309, build produzione 147 pagine.

## Residuo

- rimuovere o rendere non autorevoli gli helper sincroni dell'inventario semi rimasti per compatibilita';
- verificare i restanti percorsi production che simulano successo o degradano a storage locale;
- riclassificare le voci M09 del manifest che appartengono a export, pilot agronomico o AI shadow;
- applicare e certificare le migrazioni canoniche in staging.
