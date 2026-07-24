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

Un secondo lotto ha reso fail-closed anche le route production di trattamenti, lavori meccanici e supporto: l'assenza del database restituisce `503` e una richiesta non viene piu' dichiarata riuscita tramite oggetti temporanei, `localStorage` server-side o semplici log. Le route di esposizione solare non sostituiscono piu' il garden richiesto con coordinate predefinite di Roma e non forniscono suggerimenti mock agli utenti anonimi.

Verifiche del secondo lotto: type-check verde, persistenza 24/24, audit release con 193 voci totali, 47 assegnate a M09 e zero non classificate, build produzione 147 pagine.

Il terzo lotto ha eliminato il hook production `hooks/useGarden.ts`, che costruiva sempre `garden-1` con coordinate, suolo ed esposizione fittizi. Semenzaio e widget AI flottante usano ora il `GardenContext` canonico e il relativo `activeGarden`.

Il quarto lotto ha riclassificato tutte le voci impropriamente assegnate a M09 nei proprietari M11, M12 e M14. Le due convergenze reali residue sono state corrette: la dashboard consumer usa le coordinate del garden o dichiara dati meteo indisponibili; `gardenMemoryService` persiste e rilegge snapshot nel ledger canonico `agronomic_memory_events`, senza fallback `localStorage`.

Verifiche del quarto lotto: type-check verde; audit release con 189 voci totali, zero assegnate a M09 e zero non classificate; test di regressione dedicati.

Il quinto lotto ha eliminato la cache sincrona dell'inventario sementi. Tutti i reader esportati restituiscono `Promise`, i consumer caricano dal servizio/provider autorevole e le mutazioni rileggono il backend prima di aggiornare la UI.

Verifiche di chiusura locale M09: type-check verde; persistenza 27/27; suite release 314/314; audit con zero voci M09; build produzione 147 pagine.

## Residuo

- applicare e certificare le migrazioni canoniche in staging.
