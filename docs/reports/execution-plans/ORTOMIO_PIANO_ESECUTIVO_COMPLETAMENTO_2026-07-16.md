# OrtoMio — Piano esecutivo di completamento

- **Versione:** 1.0
- **Data:** 16 luglio 2026
- **Repository:** `/Volumes/990P/ortomio-main`
- **Baseline:** `main` al commit `cc5f99f26c7f1d9d75e83759d547f7802046184e`
- **Fonte di verita prodotto:** [`MASTERDOC.md`](../../../MASTERDOC.md)
- **Stato iniziale:** pianificato, non ancora avviato
- **Stato esecuzione:** P0 e P2 completate; P1 e P3 implementate e verificate in locale con gate remoto in attesa di staging/backup
- **Obiettivo finale:** portare OrtoMio a una baseline produttiva sicura, persistente, verificabile e documentata senza presentare funzioni ibride o simulate come complete.

## 1. Ruolo di questo piano

Questo documento e la coda di esecuzione derivata dall'analisi reale del checkout 990P.

La gerarchia documentale e:

1. il codice e lo schema applicato definiscono il comportamento reale;
2. `MASTERDOC.md` descrive prodotto, architettura, maturita e destinazione;
3. questo piano governa il lavoro necessario per chiudere i gap;
4. `docs/manual/*` descrive soltanto il comportamento effettivamente rilasciato;
5. `public/docs/manual/*` deve essere una copia sincronizzata del manuale sorgente.

Questo piano non sostituisce `MASTERDOC.md` e non deve diventare un secondo masterplan. Quando il piano sara completato, manuale e masterdoc dovranno essere aggiornati sulla base delle evidenze finali, come previsto nella fase P9.

### 1.1 Ordine vincolante: prima l'app, poi la documentazione

La priorita assoluta e correggere e concludere le parti incomplete dell'applicazione.

L'ordine non puo essere invertito:

1. correggere sicurezza, ownership e RLS;
2. completare navigazione e capability reali;
3. rendere durevoli Diario, piante, memoria, suolo e trattamenti;
4. chiudere Smart Hub, irrigazione e nutrizione;
5. completare salute, predizioni e monitoraggio;
6. rendere reali o isolare NDVI, drone e blockchain;
7. completare certificazioni, export e Admin;
8. verificare staging, produzione, osservabilita e rollback;
9. soltanto dopo aggiornare manuale, Help, README e `MASTERDOC.md`.

P9 e quindi bloccata finche P0-P8 non sono completate o finche ogni eventuale residuo non e stato esplicitamente rimosso dal perimetro della release. Non e ammesso aggiornare la documentazione per far sembrare conclusa una funzione ancora incompleta nel codice.

## 2. Risultato atteso

Al completamento:

- tutte le route sensibili applicano autenticazione e ownership server-side;
- schema locale, migrazioni, RLS e produzione coincidono;
- Diario, piante, suolo, memoria e trattamenti sono DB-first;
- nessun write critico degrada silenziosamente a memoria o browser storage;
- Smart Hub separa comando richiesto, inviato, confermato e fallito;
- predizioni e alert usano input autorizzati, versionati e verificabili;
- NDVI reale e simulato hanno contratti distinti;
- drone e blockchain restano demo isolate oppure ricevono un'integrazione reale verificabile;
- certificazioni ed export non includono dati demo come evidenza;
- navigazione, feature flag e capability coincidono;
- manuale, pagina Help e `MASTERDOC.md` descrivono il prodotto rilasciato senza promesse non implementate.

## 3. Baseline tecnica da preservare

Verifiche gia superate il 16 luglio 2026:

- `npm run type-check`;
- `npm run test:precision-hub` — 228 test superati;
- `npm run build` — 140 pagine generate;
- 53 route API rilevate;
- 39 route prodotto principali sotto `/app`, oltre alle sottoroute.

Funzioni gia avanzate da non riscrivere senza necessita:

- Director e priorita agronomica/economica;
- contesto raffinato colturale e di sito;
- decision ledger, queue outcome ed evidence;
- unified agronomic memory e operational ledger;
- fotoperiodo e fase lunare;
- mappe di prescrizione, versioni, esecuzioni e outcome;
- Smart Device persistence e automation audit;
- bridge piante individuali verso health alert;
- lineage delle operazioni;
- pagina Export;
- pagina e API Admin.

## 4. Regole di esecuzione

### 4.1 Verita prima della UI

L'ordine di lavoro e:

```text
contratto dati
  -> migrazione e RLS
  -> servizio/writer/reader
  -> API e ownership
  -> UI
  -> test E2E
  -> rollout
  -> manuale e masterdoc
```

### 4.2 Stati ammessi

Ogni task del piano usa uno di questi stati:

- `[ ]` non iniziato;
- `[-]` in corso;
- `[x]` completato e verificato;
- `[!]` bloccato con evidenza e dipendenza esplicita;
- `[-R]` rimosso per decisione documentata.

### 4.3 Vincoli

- non cambiare una feature flag in `true` senza superare il relativo gate;
- non usare `user_id`, `gardenId` o `organizationId` ricevuti dal client come prova di ownership;
- non introdurre un secondo writer per lo stesso dato;
- non usare fallback locale per write regolatori o operativi critici;
- non mescolare cleanup massivo e cambio di comportamento nella stessa PR;
- non eliminare dati o migrazioni gia applicate senza piano di riconciliazione;
- non aggiornare il manuale come se una fase fosse completa prima della verifica finale;
- aggiornare il registro evidenze del piano dopo ogni fase.

### 4.4 Worktree e pubblicazione

Il worktree contiene file locali non correlati. Per ogni PR:

- creare un branch `codex/ortomio-<fase>`;
- controllare `git status -sb` prima e dopo;
- aggiungere esplicitamente solo i file della fase;
- non includere backup SQL, dashboard locali o documenti estranei;
- eseguire `git diff --check`;
- pubblicare soltanto dopo i gate della fase.

## 5. Dipendenze tra le fasi

```text
P0 Inventario e baseline
  -> P1 Sicurezza e ownership
    -> P2 Capability e navigazione
    -> P3 Persistenza core
       -> P4 Smart Hub, irrigazione, nutrizione
       -> P5 Salute, predizioni, monitoraggio
          -> P6 NDVI e precision farming
             -> P7 Certificazioni, export, Admin
                -> P8 Produzione e osservabilita
                   -> P9 Manuale e MASTERDOC finali
```

P2 puo iniziare dopo il contratto capability di P1. P4 e P5 possono procedere in parallelo soltanto dopo la chiusura dei writer canonici di P3.

## 6. P0 — Inventario eseguibile e baseline di produzione

### Obiettivo

Congelare la fotografia iniziale e trasformare l'audit in controlli ripetibili.

### Attivita

- [x] creare `docs/security/API_CAPABILITY_MATRIX.md` con tutte le 53 route e i metodi;
- [x] classificare ogni metodo come `public`, `authenticated`, `admin`, `cron` o `device`;
- [x] registrare risorsa, ownership, service-role, rate limit e test richiesti;
- [x] produrre inventario delle route `/app` e della loro esposizione desktop/mobile;
- [x] mappare tabelle usate per Diario, piante, suolo, trattamenti, device, certificazioni ed export;
- [x] confrontare migrazioni locali e schema remoto;
- [x] esportare i finding Security Advisor e associarli a una remediation;
- [x] riconciliare `TASKS.md` e il vecchio execution master index con il codice corrente;
- [x] marcare come superati i piani di giugno gia implementati;
- [x] salvare i risultati iniziali di type-check, test e build nel registro evidenze.

### File principali

- `app/api/**/route.ts`;
- `app/app/**/page.tsx`;
- `components/professional/Sidebar.tsx`;
- `components/shared/MobileMenu.tsx`;
- `components/shared/MobileBottomNav.tsx`;
- `supabase/migrations/*.sql`;
- `TASKS.md`;
- `docs/reports/ORTOMIO_EXECUTION_PLAN_MASTER_INDEX_2026-04-19.md`.

### Criterio di uscita

- 100% route classificate;
- schema remoto identificato e confrontabile;
- nessun task storico gia completato resta indicato come attivo;
- baseline riproducibile salvata.

## 7. P1 — Sicurezza server, ownership e RLS

### Obiettivo

Impedire accessi anonimi, cross-user e cross-organization ai dati operativi.

### 7.1 Sessione e autorizzazione canoniche

- [x] consolidare gli helper server-only in `lib/auth.server.ts` o modulo dedicato;
- [x] implementare `requireUser`;
- [x] implementare `requireAdmin`;
- [x] implementare `requireGardenAccess`;
- [x] implementare `requireOrganizationAccess`;
- [x] implementare `requireCron` con protezione replay minima;
- [x] implementare `requireDeviceSource` con credenziale specifica per device;
- [x] restituire errori 401/403/404 coerenti senza rivelare risorse altrui;
- [x] mantenere il bypass soltanto su localhost development.

### 7.2 Protezione pagine

- [x] aggiungere `proxy.ts` o il meccanismo Next 16 equivalente per `/app/*`;
- [x] mantenere `AuthGuard` come UX, non come unica barriera;
- [x] verificare sessione/ruolo prima del payload Admin;
- [x] testare anonimo, utente, PRO non-admin e admin.

### 7.3 Chiusura API P0

- [x] disabilitare `/api/test` e `/test` in produzione;
- [x] rendere admin-only `/api/ndvi/config-status`;
- [x] eliminare il write runtime di `.env.local` da `/api/ndvi/save-credentials`;
- [x] eliminare l'esecuzione script da `/api/ndvi/setup-credentials`;
- [x] derivare `user_id` dalla sessione in `/api/ai/suggestions`;
- [x] derivare `user_id` dalla sessione nelle API calendario/challenge;
- [x] verificare ownership garden in `/api/ai/predictions`;
- [x] proteggere le write blockchain e drone;
- [x] autenticare `/api/iot/telemetry`;
- [x] applicare rate limit a AI, supporto e provider esterni.

### 7.4 RLS

- [x] scrivere migrazioni additive per policy mancanti;
- [x] coprire SELECT/INSERT/UPDATE/DELETE;
- [x] testare accesso cross-user e cross-organization;
- [x] verificare che le route service-role applichino gli stessi vincoli;
- [ ] applicare le migrazioni in staging;
- [ ] rieseguire Security Advisor;
- [x] preparare query di verifica e strategia di rollback sicura; il rollback post-commit richiede staging/snapshot.

### Test obbligatori

- [x] route authenticated senza sessione → 401;
- [x] garden di altro utente → 403/404;
- [x] PRO non-admin → 403 Admin;
- [x] cron senza secret → 401;
- [x] device senza credenziale → 401;
- [x] route setup/test in produzione → 404/disabled;
- [x] test RLS con due utenti e due organizzazioni.

### Criterio di uscita

Nessuna route sensibile usa identificativi client come autorita e nessun test cross-tenant riesce ad accedere a dati altrui.

## 8. P2 — Capability e navigazione unica

### Obiettivo

Mostrare soltanto funzioni disponibili per ruolo, tier, schema, provider e maturita.

### Attivita

- [x] creare un descriptor unico di navigazione/capability;
- [x] includere route, label, gruppo, ruolo, tier, provider, maturity badge e target mobile/desktop;
- [x] usare il descriptor in `ProfessionalSidebar`;
- [x] riallineare o rimuovere `MobileMenu` e `FreeSidebar`;
- [x] usare lo stesso descriptor nella ricerca globale e nella pagina Help;
- [x] nascondere Admin ai non-admin;
- [x] rendere satellite-config admin-only;
- [x] consolidare `/app/diary` e `/app/journal` nel percorso deciso da P3;
- [x] rimuovere o reindirizzare `/app/smart-simple`;
- [x] classificare `compare`, `reports`, `zones` e `pianifica` come route contestuali o tecniche;
- [x] eliminare link Help verso capitoli inesistenti di gamification/social/badge oppure ripristinare consapevolmente i capitoli;
- [x] aggiungere badge persistenti `Beta` e `Simulazione` dove richiesto.

### File principali

- `components/professional/Sidebar.tsx`;
- `components/shared/MobileMenu.tsx`;
- `components/shared/FreeSidebar.tsx`;
- `components/shared/MobileBottomNav.tsx`;
- `components/shared/GlobalSearch.tsx`;
- `app/app/help/page.tsx`;
- `config/features.ts`.

### Test obbligatori

- [x] ogni link visibile risolve una pagina esistente;
- [x] desktop e mobile espongono le stesse capability;
- [x] Admin non compare a un PRO non-admin;
- [x] pagine beta/simulate mostrano il badge;
- [x] nessun link Help restituisce 404.

### Criterio di uscita

Esistenza, visibilita e operativita coincidono per ogni funzione esposta.

## 9. P3 — Persistenza del nucleo operativo

### Obiettivo

Eliminare le due verita tra nuovo storage DB-first e servizi legacy in memoria/browser.

### 9.1 Diario canonico

- [x] definire un unico tipo `DiaryEvent` con garden, zona, filare, pianta, autore, fonte, task e allegati;
- [x] scegliere tabelle canoniche tra `daily_diary_entries`, `diary_events` e relativi ledger;
- [x] creare writer e reader unici;
- [x] migrare `operationalDiaryService` dalla `Map` al provider;
- [x] collegare il quick event al writer reale;
- [x] implementare edit/annullamento con audit;
- [x] implementare upload foto reale;
- [x] consolidare `/app/diary` e `/app/journal`;
- [x] rileggere il record dopo il write prima di mostrare successo.

### 9.2 Piante individuali

- [x] portare `plantOperationsService` su `IStorageProvider`;
- [x] implementare operazioni singole e bulk;
- [x] mantenere lineage garden/zona/filare/pianta;
- [x] sostituire URL `example.com` con storage reale;
- [x] rendere health update dipendente da osservazione/outcome;
- [x] gestire concorrenza e idempotenza;
- [x] verificare lettura dopo reload.

### 9.3 Memoria e suolo

- [x] definire mapping tra garden memory legacy, unified agronomic memory, soil memory e ledger;
- [x] creare un solo writer per fatti durevoli;
- [x] registrare fonte, freshness e confidence;
- [x] migrare pattern accettati/rifiutati;
- [x] impedire che pattern presunti diventino regole senza conferma;
- [x] lasciare in local storage soltanto preferenze UI.

### 9.4 Trattamenti e inventario

- [x] scegliere registro trattamento canonico;
- [x] migrare `treatmentRegistryService` dal browser al DB;
- [x] migrare `phytoInventoryService` al provider;
- [x] collegare garden/zona/filare/pianta/task;
- [x] registrare prodotto, lotto, dose, unita, operatore e meteo;
- [x] calcolare e persistere carenza/intervallo di sicurezza;
- [x] scaricare stock soltanto dopo esecuzione confermata;
- [x] registrare outcome ed efficacia;
- [x] rendere append-only i campi regolatori.

### 9.5 Migrazioni e backfill

- [x] creare migrazioni additive datate al momento dell'esecuzione;
- [x] non modificare migrazioni gia applicate;
- [x] definire backfill idempotenti;
- [x] riconciliare varianti `fixed`, `v2`, `simple`, `safe`, `minimal`;
- [!] provare upgrade su snapshot — bloccato: nessuno staging/snapshot remoto disponibile;
- [x] produrre report pre/post migrazione locale;
- [!] conservare rollback logico e backup — rollback logico definito, backup remoto non disponibile.

### Test obbligatori

- [x] write → reload → read;
- [x] write → restart → read;
- [x] errore cloud → errore visibile;
- [x] nessun fallback silenzioso;
- [x] bulk parziale → retry idempotente;
- [!] allegato non accessibile da altro utente — da verificare sullo storage staging remoto;
- [x] carenza e stock corretti;
- [x] backfill ripetibile senza duplicati.

### Criterio di uscita

Diario, piante, suolo, memoria e trattamenti sono durevoli, autorizzati e leggibili dallo stesso contratto usato dal Director.

## 10. P4 — Smart Hub, irrigazione e nutrizione

### 10.1 Smart Hub

- [ ] definire command lifecycle `requested/sent/acknowledged/failed/timed_out`;
- [ ] aggiungere idempotency key;
- [ ] legare device a organization/garden/zona;
- [ ] validare source, timestamp, unita e range telemetry;
- [ ] separare desired state e observed state;
- [ ] implementare retry e dead-letter log;
- [ ] mostrare successo UI solo dopo ack;
- [ ] mantenere Tuya disabilitato finche manca l'adapter reale;
- [ ] testare ThingsBoard con device staging.

### 10.2 Irrigazione

- [ ] rimuovere il task mock da `irrigationService`;
- [ ] usare task, meteo persistito, sensori e soil hydraulic profile reali;
- [ ] distinguere fabbisogno, piano, comando, esecuzione e misura;
- [ ] registrare volume previsto e misurato;
- [ ] implementare fallback esplicito senza sensori;
- [ ] attivare zone, scheduling e analytics separatamente.

### 10.3 Nutrizione

- [ ] collegare inventario, dose e compatibilita alle tabelle canoniche;
- [ ] validare unita e concentrazioni;
- [ ] distinguere suggerimento, piano, applicazione e outcome;
- [ ] scaricare stock su esecuzione confermata;
- [ ] attivare le feature avanzate una alla volta.

### Test obbligatori

- [ ] comando duplicato non produce doppia attuazione;
- [ ] timeout non appare come successo;
- [ ] device di altro garden non e comandabile;
- [ ] volume calcolato e misurato restano distinti;
- [ ] stock non cambia su suggerimento non eseguito;
- [ ] fallback stimato e visibile come tale.

### Criterio di uscita

Ogni azione fisica ha stato, provenienza, conferma e outcome; nessuna simulazione appare come attuatore reale.

## 11. P5 — Salute, predizioni e monitoraggio

### 11.1 Salute

- [ ] collegare gli engine legacy alla memoria ambientale canonica;
- [ ] rimuovere placeholder di pattern storici;
- [ ] deduplicare alert e task;
- [ ] applicare vento, pioggia, temperatura, carenza e disponibilita prodotto;
- [ ] mostrare input, regola, confidence, freshness e controindicazioni;
- [ ] separare rischio, diagnosi, proposta ed esecuzione.

### 11.2 Predizioni AI

- [ ] rimuovere/disabilitare GET mock;
- [ ] caricare input server-side dal garden autorizzato;
- [ ] non fidarsi di weather/soil/health inviati dal client;
- [ ] versionare regola/modello;
- [ ] dichiarare orizzonte e data di validita;
- [ ] mostrare `dati insufficienti` quando necessario;
- [ ] persistere forecast e outcome;
- [ ] calcolare errore e calibrazione delle confidence;
- [ ] esporre la pagina nel menu soltanto dopo il gate E2E.

### 11.3 Continuous monitoring

- [ ] persistere alert e ultimo controllo;
- [ ] spostare l'esecuzione su job/cron durevole;
- [ ] rendere idempotente la creazione task;
- [ ] applicare preferenze/consenso notifiche;
- [ ] implementare error queue;
- [ ] distinguere alert osservato, previsto e simulato.

### Test obbligatori

- [ ] previsione riproducibile dagli input registrati;
- [ ] garden non autorizzato rifiutato;
- [ ] input mancanti → stato insufficiente;
- [ ] task monitoraggio non duplicato;
- [ ] restart non perde alert;
- [ ] dato simulato non aumenta confidence reale.

### Criterio di uscita

Ogni alert o previsione e autorizzato, riproducibile, persistente e confrontabile con un outcome.

## 12. P6 — NDVI, Prescription Maps e isolamento demo

### 12.1 NDVI reale

- [ ] spostare le credenziali nel secret manager del deploy;
- [ ] processare realmente raster/statistics Sentinel;
- [ ] persistere provider, scena, data, geometria, cloud cover e risoluzione;
- [ ] versionare algoritmo e quality status;
- [ ] distinguere nel tipo `real`, `estimated`, `simulated`, `fallback`;
- [ ] impedire source `sentinel-hub-connected` per valori casuali;
- [ ] costruire storico reale;
- [ ] implementare quality gate prima dell'uso nel Director.

### 12.2 Prescription Maps

- [ ] richiedere geometrie e dataset minimi;
- [ ] verificare versionamento algoritmo/input;
- [ ] esportare metadati e checksum;
- [ ] separare prescrizione da applicazione effettiva;
- [ ] validare variance e outcome su casi reali;
- [ ] usare RPC/transazione per update multi-tabella critici;
- [ ] eseguire E2E mappa → export → applicazione → outcome.

### 12.3 Drone e blockchain

- [ ] rinominare il drone `Simulatore missione` finche usa `simulateFlightExecution`;
- [ ] impedire a risultati drone simulati di alimentare ledger/certificazioni reali;
- [ ] mantenere blockchain/NFT in laboratorio demo;
- [ ] impedire a hash/transazioni sintetiche di sostenere tracciabilita commerciale;
- [ ] definire un piano separato solo se viene scelto un provider reale.

### Test obbligatori

- [ ] dato simulato non confluisce in KPI reali;
- [ ] NDVI reale conserva provenance completa;
- [ ] errore provider non produce valore casuale mascherato;
- [ ] aggiornamento mappa non perde zone su errore;
- [ ] outcome resta separato dalla prescrizione.

### Criterio di uscita

Ogni dato remoto dichiara fonte e qualita; moduli demo non possono essere confusi con funzioni operative.

## 13. P7 — Certificazioni, export e Admin

### 13.1 Certificazioni

- [ ] verificare CRUD e RLS GlobalGAP/Bio;
- [ ] rendere append-only gli eventi regolatori;
- [ ] proteggere documenti e foto;
- [ ] collegare evidenza a owner, garden, operatore, data e fonte;
- [ ] escludere dati demo dai dossier;
- [ ] aggiungere report di completezza/anomalie;
- [ ] mantenere fuori scope submission ufficiale non implementata.

### 13.2 Export

- [ ] definire dataset autorizzati per ruolo e garden;
- [ ] stabilizzare CSV e formati data/unita;
- [ ] generare PDF reale con paginazione;
- [ ] completare diario e registro trattamenti;
- [ ] includere periodo, fonte, timezone e versione schema;
- [ ] registrare export sensibili;
- [ ] minimizzare dati personali.

### 13.3 Admin

- [ ] risolvere capability server-side;
- [ ] validare le colonne usate dalle statistiche;
- [ ] completare o rimuovere azioni placeholder;
- [ ] mostrare provider health senza secret;
- [ ] registrare audit admin;
- [ ] verificare che il tier da solo non conceda visibilita/accesso.

### Test obbligatori

- [ ] dossier senza dati demo;
- [ ] documento di altro garden non accessibile;
- [ ] PDF leggibile e riproducibile;
- [ ] export sensibile auditato;
- [ ] Admin invisibile e inaccessibile al non-admin.

### Criterio di uscita

Documenti, export e funzioni amministrative sono autorizzati, tracciabili e coerenti con la maturita reale.

## 14. P8 — Produzione, osservabilita e rollout

### Attivita

- [ ] applicare tutte le migrazioni su staging da snapshot;
- [ ] eseguire test RLS e smoke test API;
- [ ] eseguire test con provider staging;
- [ ] attivare shadow mode per decisioni/predizioni;
- [ ] confrontare output nuovo e corrente;
- [ ] eseguire pilot su una organizzazione/garden;
- [ ] monitorare write failures, retry, latenza e outcome mancanti;
- [ ] attivare capability una per volta;
- [ ] definire soglie di rollback;
- [ ] verificare backup e restore;
- [ ] applicare in produzione;
- [ ] rieseguire test post-deploy e Security Advisor.

### Rollout

1. sicurezza e core read-only;
2. Diario, piante e trattamenti;
3. Smart Hub, irrigazione e nutrizione;
4. salute e monitoraggio;
5. predizioni;
6. NDVI reale e Prescription Maps;
7. certificazioni ed export.

### Rollback

- capability disattivabile server-side;
- migrazioni additive;
- dual-read temporaneo e single-write canonico;
- nessuna cancellazione legacy prima della riconciliazione;
- provider non disponibile → stato esplicito;
- comandi device disabilitabili senza perdere telemetry;
- query pre/post e backup per ogni migrazione.

### Criterio di uscita

La produzione usa schema e capability attesi, non genera errori critici e permette rollback per dominio.

## 15. P9 — Aggiornamento obbligatorio di manuale e MASTERDOC

### Regola bloccante

Il piano non puo essere marcato completato finche questa fase non e chiusa.

Manuale e masterdoc devono essere aggiornati dopo la verifica produttiva di P8, non sulla base della sola intenzione o del codice non rilasciato.

P9 non puo iniziare con task applicativi P0-P8 ancora aperti, salvo la sola preparazione di un registro evidenze non pubblicato. L'aggiornamento dei contenuti utente parte esclusivamente dalla release verificata.

### 15.1 Raccolta delle evidenze finali

- [ ] registrare commit e release di completamento;
- [ ] registrare migrazioni applicate;
- [ ] salvare risultati type-check, test, build, RLS e Security Advisor;
- [ ] esportare la capability matrix finale;
- [ ] registrare provider realmente attivi;
- [ ] classificare ogni dominio come operativo, beta, simulato, disattivato o rimosso;
- [ ] registrare limiti residui e backlog successivo.

### 15.2 Aggiornamento del manuale sorgente

La fonte servita dall'app e `docs/manual/*`.

- [ ] aggiornare `docs/manual/README.md` con data, versione e matrice reale;
- [ ] aggiornare `01-ai-predictions.md`;
- [ ] aggiornare `02-drone-operations.md`;
- [ ] aggiornare `03-traceability.md`;
- [ ] aggiornare `04-certifications.md` e `04b-bio-certification-guide.md`;
- [ ] aggiornare `05-ndvi-satellite.md`;
- [ ] aggiornare `06-prescription-maps.md`;
- [ ] aggiornare `07-ai-overview.md`;
- [ ] aggiornare `14-smart-hub.md`;
- [ ] aggiornare `15-irrigation-system.md`;
- [ ] aggiornare `16-nutrition-treatments.md`;
- [ ] aggiornare `21-individual-plants.md`;
- [ ] aggiornare `23-export-system.md`;
- [ ] aggiornare `26-integration-api.md`;
- [ ] aggiornare `27-quick-start.md`;
- [ ] aggiornare `29-interface-navigation.md`;
- [ ] aggiornare `32-roadmap.md`;
- [ ] aggiornare `34-director-orchestrator.md`;
- [ ] aggiornare `35-automated-diary.md`;
- [ ] rivedere gli altri capitoli contro la capability matrix;
- [ ] rimuovere claim garantiti, provider non attivi e risultati non verificati;
- [ ] distinguere sempre reale, stimato, beta e simulato.

### 15.3 Sincronizzazione manuale pubblico

- [ ] rendere `docs/manual` la fonte unica;
- [ ] aggiungere `scripts/sync-manual-docs.mjs` o equivalente;
- [ ] sincronizzare `public/docs/manual/*` dalla fonte;
- [ ] aggiungere controllo che fallisca se le copie divergono;
- [ ] verificare che ogni slug servito esista;
- [ ] verificare che la pagina Help non punti a file mancanti;
- [ ] verificare rendering di titoli, liste, link e tabelle.

### 15.4 Aggiornamento pagina Help e README

- [ ] aggiornare `app/app/help/page.tsx` con navigazione reale;
- [ ] rimuovere link a gamification/social/badge se i capitoli non esistono;
- [ ] filtrare sezioni admin-only tramite capability reale;
- [ ] aggiornare `README.md` eliminando claim economici non verificati;
- [ ] collegare il manuale canonico e il masterdoc senza creare duplicati.

### 15.5 Aggiornamento `MASTERDOC.md`

- [ ] aggiornare versione, data, commit e release verificata;
- [ ] aggiornare la matrice di maturita della sezione 51;
- [ ] aggiornare navigazione e capability della sezione 52;
- [ ] chiudere o mantenere i gap di sicurezza della sezione 53;
- [ ] aggiornare la convergenza dati della sezione 54;
- [ ] aggiornare lo stato delle simulazioni della sezione 55;
- [ ] marcare P0-P8 come completati, rimossi o residui nella sezione 56;
- [ ] sostituire l'ordine PR con la cronologia effettiva;
- [ ] aggiornare test e gate con risultati finali;
- [ ] registrare rollout e rollback realmente eseguiti;
- [ ] aggiornare KPI con misure reali;
- [ ] riscrivere la Definition of Done soltanto se il contratto e cambiato;
- [ ] aggiungere una sezione release finale con limiti residui;
- [ ] verificare che nessun documento generale concorrente venga presentato come canonico.

### 15.6 Verifica documentale finale

- [ ] confronto `manuale → route/UI/codice`;
- [ ] confronto `MASTERDOC → schema/servizi/capability`;
- [ ] confronto `docs/manual → public/docs/manual`;
- [ ] scansione link e slug;
- [ ] ricerca di claim `100%`, `garantito`, `reale`, `automatico`, `certificato` senza evidenza;
- [ ] verifica manuale delle pagine Help principali;
- [ ] `git diff --check`;
- [ ] approvazione finale prodotto/tecnica.

### 15.7 Bonifica documentale e piani storici

La bonifica avviene dopo l'allineamento di manuale e `MASTERDOC.md`, quando la nuova fonte canonica e verificata. Non deve essere anticipata durante P1-P8: piani e report storici possono ancora contenere evidenze utili per ricostruire migrazioni, decisioni o regressioni.

Baseline P0 del 16 luglio 2026:

- 540 file Markdown tracciati nella root, oltre ai file canonici introdotti localmente;
- 85 file `.txt` tracciati nella root, inclusi messaggi commit e frammenti SQL/deploy storici;
- 64 Markdown tracciati sotto `docs/`;
- piani di aprile/giugno e numerosi report `*_COMPLETE`, `SUCCESS`, `SESSION_SUMMARY`, guide duplicate e riepiloghi non piu canonici.

Attivita obbligatorie:

- [ ] generare un manifest completo di Markdown, TXT, piani, report, guide e riepiloghi;
- [ ] classificare ogni file come `keep`, `archive` o `delete`, con motivazione e sostituto canonico;
- [ ] definire una allowlist minima per la root (`README.md`, `MASTERDOC.md`, `TASKS.md` e pochi documenti esplicitamente giustificati);
- [ ] mantenere `docs/manual`, security baseline, evidenze di release e piano corrente come fonti operative;
- [ ] archiviare soltanto decisioni storiche ancora necessarie, sotto `docs/archive/` con un indice e stato `historical`;
- [ ] eliminare report di sessione, file `COMMIT_MESSAGE*`, `PUSH_SUCCESS*`, duplicati `*_COMPLETE`, istruzioni deploy superate e piani integralmente assorbiti;
- [ ] rimuovere o archiviare i piani aprile/giugno dopo aver verificato che ogni residuo sia chiuso, rimosso o trasferito nel backlog canonico;
- [ ] verificare che nessun file candidato sia letto dall'app, dagli script, dalla build, dalla pagina Help o da workflow CI;
- [ ] correggere link e riferimenti prima delle eliminazioni;
- [ ] non spostare backup SQL o credenziali nell'archivio documentale: devono restare esclusi dal repository;
- [ ] aggiungere un controllo `docs:hygiene` che fallisca su nuovi file fuori allowlist, copie manuale divergenti e piani senza stato;
- [ ] produrre un report finale con file mantenuti, archiviati ed eliminati e relativi commit;
- [ ] eseguire la bonifica in una PR separata dalle modifiche applicative e dall'aggiornamento contenuti P9.

### Criterio di uscita P9

- il manuale descrive soltanto il comportamento rilasciato;
- `MASTERDOC.md` descrive stato, architettura e maturita della release effettiva;
- manuale sorgente e copia pubblica coincidono;
- pagina Help non contiene link morti;
- nessuna funzione simulata e presentata come reale;
- la root contiene soltanto i documenti ammessi dall'allowlist;
- nessun piano storico e presentato come coda attiva o fonte canonica;
- report di sessione, messaggi commit e documenti duplicati non restano dispersi nel repository;
- il controllo `docs:hygiene` e verde;
- questo piano contiene evidenze di chiusura per ogni fase.

## 16. Ordine delle pull request

1. `PR-01` — inventario API, schema e capability matrix;
2. `PR-02` — auth server, ownership e route P0;
3. `PR-03` — RLS e verifica cross-tenant;
4. `PR-04` — capability/navigation/help links;
5. `PR-05` — Diario canonico;
6. `PR-06` — piante individuali e allegati;
7. `PR-07` — memoria, suolo, trattamenti e inventario;
8. `PR-08` — Smart Hub e irrigazione;
9. `PR-09` — nutrizione;
10. `PR-10` — salute, predizioni e monitoring;
11. `PR-11` — NDVI reale e Prescription Maps;
12. `PR-12` — isolamento drone/blockchain demo;
13. `PR-13` — certificazioni, export e Admin;
14. `PR-14` — rollout/observability hardening;
15. `PR-15` — manuale, Help, README e `MASTERDOC.md` finali;
16. `PR-16` — bonifica documentale, archivio storico minimo e gate `docs:hygiene`.

## 17. Gate obbligatorio per ogni PR

```bash
npm run type-check
npm run test:precision-hub
npm run build
git diff --check
git status -sb
```

Aggiungere i test mirati della fase. Una PR non passa se il test globale e verde ma il criterio di uscita funzionale non e dimostrato.

## 18. Registro evidenze

Compilare durante l'esecuzione.

| Fase | Stato | Branch/PR | Migrazioni | Test | Produzione | Note/limiti |
|---|---|---|---|---|---|---|
| P0 | completato | `codex/ortomio-p0-baseline` | inventario 113 file; confronto Neon/Supabase, nessuna migrazione applicata | audit P0 verde; type-check; 228/228 test; build 140/140; diff-check | Neon letto; Security Advisor Supabase esportato | 53 route/69 metodi, 41 pagine; 6 errori/70 warning/2 info assegnati a P1; backend ibrido e drift espliciti |
| P1 | implementazione locale completata; gate remoto bloccato | `codex/ortomio-p1-security` | `20260717000000_p1_security_hardening.sql`; fixture e test RLS transazionale | type-check; security 10/10; precision 228/228; build 140/140; diff-check | Supabase `main` e Production su piano Free; nessun branch/backup; migrazione non applicata | restano staging, password leak protection, Security Advisor post-fix e rollout produzione |
| P2 | completato e verificato localmente | `codex/ortomio-p2-capabilities` | nessuna | capabilities 7/7; type-check; security 10/10; precision 228/228; build 141/141; diff-check | nessuna modifica remota richiesta | descriptor unico; Admin/satellite role-based; Help e ricerca senza route morte; alias consolidati; evidenza `docs/reports/P2_CAPABILITY_NAVIGATION_EVIDENCE_2026-07-17.md` |
| P3 | implementazione locale completata; gate remoto bloccato | `codex/ortomio-p3-persistence` | `20260717010000_p3_core_persistence.sql`; replay doppio e test RLS su PostgreSQL 16 | persistence 9/9; type-check; security 10/10; precision 228/228; build 141/141; diff-check | migrazione non applicata | writer DB-first e fail-closed; restano snapshot/backup e test allegato cross-user remoto; evidenza `docs/reports/P3_CORE_PERSISTENCE_EVIDENCE_2026-07-17.md` |
| P4 | non iniziato | — | — | — | — | — |
| P5 | non iniziato | — | — | — | — | — |
| P6 | non iniziato | — | — | — | — | — |
| P7 | non iniziato | — | — | — | — | — |
| P8 | non iniziato | — | — | — | — | — |
| P9 | non iniziato | — | — | — | — | — |

## 19. Definizione di completamento del piano

Il piano e completato soltanto quando:

1. P0-P9 hanno criterio di uscita verificato;
2. type-check, test e build sono verdi sulla release finale;
3. RLS e ownership sono verificate su staging e produzione;
4. write critici sono durevoli dopo restart;
5. capability e navigazione coincidono;
6. simulazioni sono isolate e dichiarate;
7. rollout e rollback sono stati provati;
8. manuale sorgente e copia pubblica sono aggiornati;
9. pagina Help non contiene link morti;
10. `MASTERDOC.md` e aggiornato alla release completata;
11. limiti residui sono espliciti e trasformati in backlog;
12. il registro evidenze e completo;
13. documenti e piani superati sono archiviati o eliminati e la root rispetta l'allowlist.

La chiusura tecnica senza P9 non e completamento: e soltanto implementazione non ancora documentata.
