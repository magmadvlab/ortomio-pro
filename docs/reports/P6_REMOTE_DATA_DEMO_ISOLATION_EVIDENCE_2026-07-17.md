# P6 — Evidenze dati remoti e isolamento demo

- **Data:** 17 luglio 2026
- **Branch:** `codex/ortomio-p6-remote-data-demo-isolation`
- **Migrazione:** `20260717040000_p6_remote_data_provenance.sql`
- **Stato:** implementazione locale completata; migrazione e prove con provider/dataset reali restano chiuse fino al rollout staging P8

## NDVI reale

- `POST /api/ndvi/sentinel` richiede autenticazione e ownership del garden prima di accedere al provider;
- bounding box, intervallo e soglia cloud sono validati e inclusi nell'hash di input;
- il backend acquisisce un token OAuth server-side e invia un evalscript NDVI alla Sentinel Hub Statistical API;
- il risultato usa solo intervalli con statistiche valide e persiste provider, intervallo di acquisizione, bbox, risoluzione, filtro cloud, percentuale di pixel mascherati, algoritmo, qualita, statistiche e SHA-256;
- credenziali mancanti, risposta vuota, qualita rifiutata o errore provider producono uno stato esplicito, mai un valore casuale;
- il client accetta soltanto `sourceKind=real`; la cache e lo storico leggono soltanto sorgenti reali con qualita `accepted` o `warning`;
- una statistica aggregata sul bbox non viene trasformata in finte differenze di zona o poligoni di stress;
- lo storico aggrega soltanto osservazioni persistite dello stesso giorno, senza interpolazioni sintetiche.

Implementazione basata sul contratto ufficiale della [Sentinel Hub Statistical API](https://docs.sentinel-hub.com/api/latest/api/statistical/) e sui relativi [esempi ufficiali](https://docs.sentinel-hub.com/api/latest/api/statistical/examples/). L'endpoint statistico non espone da solo un'identita di scena e non separa necessariamente nuvole da tutti gli altri pixel mascherati: scene id e cloud osservato restano un gate Catalog/provider P8, senza essere inventati.

## Prescription Maps

- la generazione richiede geometria reale del garden e un dataset NDVI spaziale minimo, con valori e posizioni distinti;
- algoritmo, versione, hash input, qualita sorgente e checksum contenuto accompagnano ogni nuova mappa;
- export GeoJSON, ISOXML e Shapefile includono provenance; mappe legacy o revisioni prive di checksum ricalcolato sono bloccate;
- prescrizione, export, import in campo, applicazione e outcome rimangono eventi distinti;
- inserimento mappa e zone avviene tramite una RPC atomica che valida geometria e area: un errore non lascia mappe orfane;
- la validazione su outcome reale e il percorso mappa → attrezzatura → outcome richiedono dataset/provider e attrezzatura staging in P8.

## Drone e blockchain

- l'interfaccia dichiara `Simulatore missione drone` e l'API richiede esplicitamente `mode=simulation`;
- una simulazione restituisce `operationalLedgerEligible=false` e `certificationEligible=false`, senza segnare il piano come realmente eseguito;
- senza `mode=simulation` l'API risponde `501 drone_provider_unavailable`;
- le route di mutazione blockchain, NFT e QR commerciale sono autenticate ma rispondono `501` come laboratorio;
- letture e tracciabilita dichiarano `simulated=true` e `certificationEligible=false`; hash sintetici non sostengono claim commerciali.

## Verifiche

- `npm run test:remote-data-isolation` — 7/7;
- `npm run test:security` — 10/10;
- `npm run test:capabilities` — 7/7;
- `npm run test:precision-hub` — 228/228;
- `npm run type-check` — verde;
- `npm run build` — 142/142 pagine;
- PostgreSQL 16 usa-e-getta — migrazione applicata due volte; RLS cross-garden, insert NDVI reale, RPC valida e rollback completo su zona non valida verdi;
- `git diff --check` — verde.

## Gate non forzati

La migrazione non viene applicata a Supabase `main` perche non e stato identificato uno staging con snapshot e rollback. Le credenziali deploy non vengono modificate e non viene chiamato il provider reale da questo worktree. Smoke OAuth/Statistics, metadata Catalog, dataset spaziale reale, scene/cloud provenance, attrezzatura e outcome di campo appartengono al rollout P8.
