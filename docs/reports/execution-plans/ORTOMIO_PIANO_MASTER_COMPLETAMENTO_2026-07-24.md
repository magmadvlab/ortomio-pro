# OrtoMio Pro - Piano master di completamento

- **Versione:** 1.1
- **Data di apertura:** 24 luglio 2026
- **Repository:** `magmadvlab/ortomio-pro`
- **Branch di lavoro iniziale:** `claude/migrations-feature-flags-cd3c51`
- **Baseline iniziale:** `8c37854f51b93585720e6c54e1a84b8b1c7c6879`
- **Stato generale:** in corso; prodotto non ancora certificato per la release commerciale 1.0
- **Stato esecuzione:** 2 milestone chiuse per la release (M01-M02); baseline e implementazioni locali disponibili fino a M15 ma con gate remoti aperti; M16 eseguita con decisione NO-GO motivata il 26/07/2026
- **Deploy codice Production:** `Ready` — PR `#62` confluita in `main`, merge commit `b99c53f41ea91d28adf11f730a94dfd38497dedd`, deploy Vercel Production completato il 26/07/2026.
- **Schema commerciale Production:** `Ready` — cinque migrazioni M15 applicate il 26/07/2026; probe PostgREST `schemaReady=true`.
- **Deploy readiness (certificazione 1.0):** `false` — codice e schema M15 pubblicati non equivalgono alla certificazione: staging, restore, isolamento, provider, pilot e validazione agronomica restano aperti. Il verbale `M16_GO_NO_GO_2026-07-26.md` elenca tutte le evidenze remote mancanti.
- **Coda canonica:** questo documento

## 1. Scopo

Questo documento e' la fonte di verita' per il lavoro residuo necessario a portare OrtoMio Pro dalla release candidate locale a una release commerciale verificabile.

Assorbe la coda operativa residua dei documenti precedenti senza sostituirne le evidenze storiche:

- `ORTOMIO_PIANO_ESECUTIVO_COMPLETAMENTO_2026-07-16.md`;
- `ORTOMIO_ROADMAP_INDUSTRIALIZZAZIONE_2026-07-22.md`;
- `ROADMAP_COMPLETAMENTO_ORTOMIO_PRO.md`;
- Specifica di completamento e industrializzazione v1.1 del 22 luglio 2026.

Nuove scoperte, decisioni e prove devono essere registrate qui. Non devono essere creati piani concorrenti per lo stesso perimetro.

## 2. Regole di avanzamento

Ogni blocco viene affrontato in ordine, salvo dipendenza tecnica documentata.

Uno stato puo' essere:

- `[ ]` non iniziato;
- `[-]` in corso;
- `[L]` implementazione o preparazione locale conclusa, ma gate release ancora aperto;
- `[x]` completato e verificato per la release, senza residui del perimetro nascosti o trasferiti;
- `[!]` bloccato da decisione, autorizzazione o sistema esterno.

Un blocco passa a completato solo quando:

1. il comportamento richiesto e' implementato o la capability e' rimossa/nascosta consapevolmente;
2. non restano mock, fallback o identita' fittizie nel percorso production interessato;
3. type-check e test proporzionati al rischio sono verdi;
4. build, lint, migrazioni, sicurezza o E2E sono eseguiti quando applicabili;
5. la documentazione e il registro avanzamento sono aggiornati;
6. esiste un commit dedicato o un riferimento preciso all'evidenza esterna;
7. il rischio residuo e' dichiarato.

`localReady` non equivale a `deployReady`. Nessun test locale sostituisce staging, restore drill, provider reale o pilot.

### Regole anti-riapertura

Per evitare che il lavoro sembri concluso e ricompaia in seguito:

1. ogni residuo ha un solo milestone proprietario e resta visibile nel registro aperti;
2. un residuo trasferito non viene contato due volte, ma il milestone originario indica dove e' stato trasferito;
3. `[L]` non conta come milestone chiusa per la release;
4. una nuova scoperta deve aggiornare nello stesso commit il milestone, il registro aperti e il riepilogo numerico;
5. una voce puo' essere rimossa dal registro soltanto con evidenza e criterio di uscita soddisfatto;
6. percentuali non supportate da un inventario atomico non devono essere usate.

## 2.1 Quadro reale al 24 luglio 2026

| Blocco | Stato release | Fatto | Resta da chiudere |
|---|---|---|---|
| M01 | `[x]` chiuso | Feature flag morti rimossi e gate riallineato | Nulla nel perimetro M01 |
| M02 | `[x]` chiuso | Dashboard senza dati inventati; lint eseguibile | Debito warning separato in `T01` |
| M03 | `[L]` locale | Creazione zona autorizzata end-to-end | Migrazione staging e convergenza API operazioni legacy (`O01-O02`) |
| M04 | `[L]` locale | Suolo persistente e seed senza fallback/cache autorevoli | Migrazione staging (`O03`) |
| M05 | `[L]` censimento | Baseline iniziale di 203 occorrenze; gate nuove voci; M15 locale azzerato | 75 voci correnti assegnate a M13-M14 (`O05`) |
| M06 | `[!]` bloccato | Inventario migrazioni e runbook; audit dashboard 26/07: 48 record, ultimo `20260724082916` | Piano Free, nessun branch/staging; servono dump, duplicati, orfana e applicazione controllata (`O06-O09`) |
| M07 | `[!]` bloccato | Script backup/restore e template; dashboard conferma `No backups` | Piano Free senza backup provider; servono drill reale, restore selettivo, RPO/RTO (`O10-O12`) |
| M08 | `[!]` bloccato | Matrice RLS pronta | Prove SQL/API/UI, storage/admin e Security Advisor (`O13-O15`) |
| M09 | `[L]` locale | Provider production convergenti; zero voci manifest M09; seed interamente asincroni | Certificazione staging (`O18`) |
| M10 | `[L]` locale | Coda, scheduler, deduplica, retry, dead-letter, rate limit, webhook e metriche | Consegna provider reale in staging (`O23`) |
| M11 | `[L]` locale | Transizioni auditabili, ricorrenze/DST e protocollo giornata | Giornata e riconciliazione staging (`O27-O28`) |
| M12 | `[!]` bloccato | Protocollo pilot e guardrail | Azienda/dati/mezzi e ciclo reale (`O29-O30`) |
| M13 | `[-]` parziale | Smoke Open-Meteo reale | Provider avanzato e gestione operativa (`O31-O33`) |
| M14 | `[-]` parziale | Regressioni locali 9/9 | Dataset, periodo shadow, metriche e firma (`O34-O37`) |
| M15 | `[L]` codice e schema in Production | O38-O43 confluiti tramite PR #62; cinque migrazioni applicate e probe `schemaReady=true`; O40 single-PRO | Provider inviti reale e prove lifecycle E2E su due aziende |
| M16 | `[x]` audit eseguito | Verbale formale **NO-GO** del 26/07/2026; gate automatico esteso a M15 | Rieseguire per GO soltanto dopo la chiusura delle evidenze remote |

Il conteggio corretto non e' “M01-M05 completati”. Sono chiuse per la release soltanto **M01 e M02**. M03-M05 hanno prodotto risultati locali utili, ma non autorizzano a considerarli conclusi ai fini della release commerciale.

## 3. Piano sequenziale

### M01 - Consolidamento feature flag e chiusura D5

- **Stato:** `[x]` completato il 24/07/2026
- **Obiettivo:** eliminare flag morti e riallineare registro, documentazione e release-check.
- **Risultato:** rimossi 13 flag relativi a componenti mai costruiti; aggiornati esempi e gate locale.
- **Evidenza:** commit `c458bd92a08ad4d947813e65ca6319f7bc184318`.
- **Verifiche:** type-check verde; capability test 7/7; release-check locale verde; `deployReady=false` invariato.
- **Rischio residuo:** nessuno specifico a D5. Eventuali moduli futuri dovranno essere progettati e implementati da zero.

### M02 - Dashboard senza dati fittizi

- **Stato:** `[x]` completato il 24/07/2026
- **Obiettivo:** rimuovere valori casuali o non fondati dai percorsi dashboard production.
- **Perimetro iniziale:** `components/garden/DailyGardenReport.tsx`, empty state della dashboard e stato garden duplicato in `AISuggestionsWidget`.
- **Attivita':**
  - eliminare `Math.random()` da irrigazione e raccolta;
  - eliminare il punteggio salute costruito da valore fisso, ora e stagione;
  - mostrare valori reali oppure `dati insufficienti`;
  - aggiungere empty state espliciti per orti senza piante, task o segnali;
  - fare usare ai widget lo stesso garden autorevole della pagina;
  - aggiungere test di regressione per zero dati e dati parziali.
- **Criterio di uscita:** nessun dato simulato viene presentato come misura reale nella dashboard.
- **Risultato:** salute e inventario piante senza fonte sono mostrati come `dati insufficienti`; irrigazioni e raccolte derivano soltanto da task persistiti aperti; rimossi fallback di suggerimento inventati; garden AI passato dal padre; stati vuoto/errore meteo distinti.
- **Evidenza:** commit `583902a9` (`fix: make dashboard data truthful and restore lint gate`).
- **Verifiche:** type-check verde; lint reale con 0 errori e 2.733 warning censiti; capability test 9/9; suite release 288/288; build produzione 145 pagine.
- **Rischio residuo:** il conteggio piante resta `dati insufficienti` finche' la dashboard non riceve un inventario autorevole. I warning lint sono debito visibile da classificare in M05.

### M03 - Creazione zone end-to-end

- **Stato:** `[L]` implementazione locale completata il 24/07/2026; gate release aperto
- **Obiettivo:** completare azienda/garden -> zona con persistenza e ownership.
- **Perimetro iniziale:** `app/app/garden/zones/page.tsx` e servizi/API collegati.
- **Attivita':**
  - sostituire il modal TODO con form completo;
  - validare nome, geometria/dimensioni, garden e campi obbligatori;
  - usare identita' e garden autorizzati lato server;
  - gestire successo, errore, retry e aggiornamento lista;
  - coprire accesso cross-garden negativo.
- **Criterio di uscita:** una zona puo' essere creata, riletta e usata nei flussi successivi senza scritture ambigue.
- **Risultato:** sostituito il modal TODO con form validato per rettangolo o area personalizzata; lettura e creazione passano dalla route server `/api/garden/zones`; identita' e garden sono derivati dal controllo autorizzativo server; la lista viene riletta dopo la scrittura e l'errore resta visibile per consentire il retry.
- **Evidenza:** commit `fed4732` (`feat: complete authorized land zone creation`).
- **Verifiche:** type-check verde; 5 test M03 verdi; persistenza e sicurezza 24/24; suite release 297/297; lint mirato con 0 errori e 10 warning gia' censiti nel perimetro; build produzione 146 pagine.
- **O02 chiuso il 24/07/2026** (commit `fcd97de`, `fix: migrate legacy zone update/delete to canonical server API`): aggiunte `PATCH`/`DELETE` a `/api/garden/zones` con lo stesso pattern `requireGardenAccess` + verifica di ownership della zona nel garden autorizzato, whitelist esplicita dei campi scrivibili (blocca `garden_id`/`user_id` lato client). `updateLandZone`/`deleteLandZone`/`toggleZoneStatus` in `services/landZoneService.ts` ora passano dalla route invece di scrivere Supabase direttamente dal client. 3 nuovi test in `__tests__/persistence/landZones.test.ts`; persistenza 61/61; type-check e build produzione verdi.
- **Rischio residuo:** la migrazione `20260724120000_land_zones_garden_ownership.sql` e' stata applicata al Supabase di produzione il 24/07/2026 (vedi §8), ma senza la certificazione staging che O01 richiede formalmente.

### M04 - Persistenza suolo, seed inventory e fallback production

- **Stato:** `[L]` implementazione locale completata il 24/07/2026; gate release aperto
- **Obiettivo:** eliminare provider non autorevoli nei primi servizi operativi identificati.
- **Perimetro iniziale:** `soilStateService.ts`, `seedInventoryService.ts`, servizi collegati.
- **Attivita':**
  - implementare salvataggio e lettura dello stato del suolo;
  - rimuovere fallback automatico a pacchetti seme mock dopo errore DB;
  - distinguere `nessun dato` da `errore provider`;
  - mantenere eventuali dataset demo solo in modalità esplicitamente demo;
  - aggiungere test di errore e isolamento garden.
- **Criterio di uscita:** nessun errore DB viene trasformato silenziosamente in dato operativo simulato.
- **Risultato:** `soilStateService` legge e salva tramite API server autorizzata per garden e zona; aggiunta persistenza `garden_soil_states` con vincoli fisici e RLS; `seedInventoryService` usa la tabella canonica `seed_inventory`; rimossi pacchetti demo e fallback che trasformavano errore o inventario vuoto in dati simulati.
- **Evidenza:** commit `83aeef7` (`fix: persist soil state and remove seed fallbacks`).
- **Verifiche:** type-check verde; 4 test M04 verdi; suite release 301/301; lint mirato con 0 errori e 2 warning legacy nel seed mapper; build produzione 147 pagine.
- **Rischio residuo:** la migrazione `20260724130000_garden_soil_states.sql` deve essere applicata e provata su staging. Gli helper sincroni legacy dell'inventario mantengono una cache solo di dati gia' letti e saranno ricondotti al reader asincrono canonico in M09.

### M05 - Censimento e chiusura TODO, FIXME e mock della release 1.0

- **Stato:** `[L]` censimento completato il 24/07/2026; correzioni trasferite e ancora aperte
- **Obiettivo:** classificare tutto il debito raggiungibile, senza correggere indiscriminatamente codice fuori perimetro.
- **Attivita':**
  - generare manifest versionato per file, route, capability e raggiungibilita';
  - classificare ogni voce come release, demo, laboratorio, legacy o codice morto;
  - correggere/nascondere le voci release;
  - isolare demo e laboratorio;
  - eliminare codice morto solo con prova di assenza chiamanti.
- **Criterio di uscita:** nessun TODO/mock non classificato nei percorsi commerciali.
- **Risultato:** introdotto un audit riproducibile e il manifest `M05_RELEASE_DEBT_MANIFEST_2026-07-24.csv`; baseline iniziale di 203 occorrenze tecniche classificate, zero voci release non classificate. Le voci non innocue sono assegnate ai blocchi M09-M15 che ne possiedono la chiusura funzionale.
- **Evidenza:** commit `aac8046` (`chore: classify release debt for M05`).
- **Verifiche correnti:** `npm run audit:release-debt` verde il 26/07/2026; 98 voci totali: zero assegnate a M09-M12 e M15, 27 a M13, 48 a M14; 13 accettate; 10 isolate come sviluppo/laboratorio.
- **Rischio residuo:** il censimento non equivale alla correzione delle 75 voci ancora pianificate per M13-M14. Il gate impedisce nuove voci non classificate, mentre la rimozione o implementazione viene verificata nei milestone proprietari. M05 non conta come chiuso per la release finche' il manifest non riflette gli esiti finali di M13-M14.
- **Scoperta 24/07/2026 durante T01 lotto 6, non ancora nel manifest:** `components/GardenOnboarding.tsx::analyzePanoramicPhotoWithOffset` riceve un `offset` di calibrazione Nord (calcolato tramite orientamento dispositivo, EXIF o calibratore manuale a bussola in `handlePanoramicPhotoChange`) ma non lo usa mai — passa solo la foto a `analyzePanoramic360(base64)` (`services/photoAnalysisService.ts:297`), la cui firma non accetta un offset. La foto panoramica 360° e' comunque analizzata (l'utente riceve un risultato), ma senza la correzione di orientamento che tutta l'infrastruttura di calibrazione e' stata costruita per fornire. **Decisione dell'utente il 24/07 sera: non toccarlo in questa sessione** (ha scelto di collegare invece il wizard "input visivo" nello stesso file, vedi T01 lotto 6). Resta un candidato per il censimento M05, gia' con la diagnosi pronta: per chiuderlo, estendere la firma di `analyzePanoramic360` per accettare l'offset e applicarlo alla logica di analisi.
- **Scoperta 24/07/2026 durante T01, non ancora nel manifest:** un intero sotto-sistema "AI Planner" (~6.100 righe, 8 file) risulta irraggiungibile da qualunque route — `components/Planner.tsx` (2569 righe), `components/PlannerWithAI.tsx`, `components/ai/AIPlanningWizard.tsx`, `components/ai/PlanPreviewModal.tsx`, `components/planner/tabs/PlannerSuggestions.tsx`, `components/planner/tabs/PlannerSearch.tsx`, `components/ai/FloatingAIWidget.tsx`, `services/aiPlanningService.ts`. Verifica esaustiva (24/07/2026): nessun `import()` dinamico, nessun test, nessuno Storybook, nessuna rewrite in `next.config`, nessuna stringa di require dinamico; tutte le route reali sotto `app/app/` che citano "Planner" usano componenti diversi (`SmartPlanner`, `PlannerAISuggestions`, `ClassicPlannerWithRotation`, `TreatmentPlanner`, `CropRotationPlanner`). Dentro il cluster, `aiPlanningService.ts::optimizePlan()` chiama davvero un LLM (Groq) e poi ne scarta la risposta restituendo testo fisso; `getSeasonalSuggestions()` ignora le coordinate — ma nessun utente reale ci arriva, quindi non e' un caso D6/M14 attivo. Alcuni file del cluster sono stati toccati incidentalmente da fix di sicurezza reali il 22/07 (D8 su `AIPlanningWizard.tsx`, D9 su `PlannerSearch.tsx`) senza che nessuno si accorgesse fossero morti. **Decisione dell'utente il 24/07 sera: lasciarlo intatto per ora**, nessuna rimozione ne' ulteriore pulizia lint in questo cluster; resta un candidato per la classificazione "codice morto" del prossimo censimento M05, con prova di assenza chiamanti gia' raccolta qui.
- **Verifica 25/07/2026 dei 6 candidati zero-importer emersi durante T01 lotto 11**: l'utente ha chiesto esplicitamente di controllare se fossero doppioni di componenti vivi prima di classificarli come morti — verificato uno per uno con grep sulle route reali, non per inferenza dal nome:
  - `components/planner/ProfessionalCalendar.tsx` (394 righe) — sostituito da `components/planner/TaskCalendar.tsx`, montato da `/app/planner` e `/app/planner-classic`.
  - `components/shared/EnhancedDashboard.tsx` (261 righe) — sostituito da `components/shared/HomeDashboard.tsx`, montato da `/app`.
  - `components/irrigation/IrrigationZonesWidget.tsx` (242 righe) — sostituito da `components/irrigation/IrrigationZoneManager.tsx`, montato da `/app/irrigation`. **Attenzione**: ha ricevuto un commit reale il 24/07/2026 ("fix: persist irrigation zone widget state") — un bug su codice morto e' stato corretto senza che nessuno si accorgesse che il componente non e' raggiungibile, stesso pattern gia' visto su `Planner.tsx` nel lotto 3. Durante questa verifica scoperto anche un **settimo orfano non ancora censito**: `components/irrigation/IrrigationDashboardWidget.tsx`, zero importer, sostituito da `ProfessionalIrrigationDashboard.tsx`.
  - `components/OnboardingTier.tsx` (104 righe) — sostituito dal flusso reale a 7 step in `components/onboarding/OnboardingStep1-7*.tsx`.
  - `components/vineyard/VineyardPruningManager.tsx` (630 righe) — non ha un sostituto diretto: la potatura vigneto oggi passa dalla pagina condivisa `/app/mechanical-work?filter=Pruning`, non da un componente Manager dedicato. L'orchard ha invece `components/orchard/PruningManager.tsx` (958 righe, vivo, sistemato in T01 lotto 7) che resta specifico frutteto/oliveto.
  - `components/MigrationWizard.tsx` (338 righe) — non e' un doppione di nulla: e' un tool one-shot per migrare dati da `localStorage` a Supabase, da un'epoca pre-cloud del progetto. Nessuna route lo referenzia e il provider cloud e' ormai lo standard esclusivo (vedi M09). Candidato a rimozione diretta piu' che a "quale versione tenere".
  - **Nessuna azione presa**: solo censimento verificato, in attesa di decisione esplicita dell'utente su rimozione vs classificazione demo/legacy per M05.

### M06 - Riconciliazione completa delle migrazioni

- **Stato:** `[!]` inventario completato; applicazione bloccata
- **Obiettivo:** allineare repository e schema remoto senza applicazioni cieche.
- **Baseline iniziale:** 40 migrazioni remote tracciate; 79 file locali da riconciliare.
- **Baseline remota aggiornata 26/07/2026:** audit iniziale di 48 record con ultimo `20260724082916_archive_completed_garden_tasks`; dopo la decisione Production, history a 53 record con le cinque migrazioni M15 in testa. La riconciliazione delle altre migrazioni locali resta aperta.
- **Casi speciali:**
  - migrazione remota orfana `20260108220000`;
  - `20260104000000_add_field_rows_to_operations.sql.bak`;
  - `20260111000000_integrate_plant_row_tracking.sql.skip`;
  - `EMERGENCY_fix_tier_online.sql`.
- **Attivita':**
  - analizzare in lotti da 5-10 file;
  - estrarre oggetti SQL dichiarati;
  - verificare `information_schema`, indici e policy prima di scrivere;
  - classificare drift, mancante o obsoleto;
  - produrre verifica post-lotto e rollback applicabile.
- **Criterio di uscita:** nessun file o record remoto privo di classificazione e schema coerente con la history.
- **Risultato parziale:** snapshot read-only della history remota e manifest locale prodotti; 119 file SQL attivi, 40 versioni remote, 39 file gia' applicati, 74 file in preflight, 6 file coinvolti in timestamp duplicati, 3 file speciali e un record remoto orfano.
- **Evidenza:** commit `95c324f` (`chore: inventory migration reconciliation blockers`), `M06_MIGRATION_RECONCILIATION_2026-07-24.csv`, `M06_MIGRATION_RUNBOOK_2026-07-24.md` e `M06_SUPABASE_REMOTE_AUDIT_2026-07-26.md`.
- **Blocco verificato nel dashboard 26/07:** organizzazione Supabase `Free`, solo branch `main` Production, nessun branch persistente/Preview e `Create branch` disabilitato. Il dump schema read-only via CLI non e' stato eseguito perche' mancano credenziali CLI e Docker Desktop non e' attivo. Nessun `db push` e nessuna riparazione della history sono autorizzati sul progetto collegato.
- **Condizione di ripresa:** staging disponibile, dump schema acquisito, duplicati rinumerati consapevolmente e migrazione orfana ricostruita.

### M07 - Staging, backup, restore e rollback

- **Stato:** `[!]` strumenti pronti; drill staging bloccato
- **Obiettivo:** dimostrare recuperabilita' prima di ulteriori dati cliente.
- **Attivita':**
  - predisporre target isolato o procedura equivalente autorizzata;
  - creare snapshot consistente;
  - eseguire restore drill completo;
  - provare ripristino selettivo di un cliente;
  - misurare RPO/RTO;
  - allegare comandi, esiti e procedura incident.
- **Criterio di uscita:** restore riuscito e ripetibile con evidenza.
- **Risultato parziale:** backup custom con controllo versione, validazione archivio e checksum SHA-256; restore con autorizzazione esplicita, target separato, verifica checksum, `--exit-on-error` e controllo schema finale; template RPO/RTO predisposto.
- **Evidenza:** commit `769a052` (`chore: harden backup and restore drill`) e `M07_BACKUP_RESTORE_DRILL_2026-07-24.md`.
- **Blocco verificato nel dashboard 26/07:** nessun source/target staging isolato; overview `No backups`; la pagina Backups dichiara esplicitamente che il piano Free non include backup di progetto. Il drill non e' stato eseguito sul progetto collegato.

### M08 - Certificazione multi-cliente e RLS

- **Stato:** `[!]` matrice pronta; certificazione staging bloccata
- **Obiettivo:** provare isolamento end-to-end con almeno due clienti differenti.
- **Attivita':**
  - creare fixture multi-azienda/multi-utente;
  - testare accessi negativi SQL, API e UI;
  - includere cache, cron, export, alert, suggerimenti e processi concorrenti;
  - verificare ruoli amministratore, responsabile e operatore;
  - rieseguire Security Advisor.
- **Criterio di uscita:** nessun percorso legge o modifica risorse dell'altro cliente.
- **Risultato parziale:** consolidate fixture SQL esistenti e matrice di verifica per garden, zone, core operativo, operazioni, export, cron, provider, organizzazioni, storage e admin.
- **Evidenza:** `M08_MULTI_CLIENT_RLS_MATRIX_2026-07-24.md`; test locali di sicurezza, persistenza e isolamento provider.
- **Blocco:** M06-M07 non consentono ancora di creare due clienti sullo schema candidato in staging; Security Advisor remoto non rieseguito.

### M09 - Provider autorevoli e convergenza reader/writer

- **Stato:** `[-]` mappa pronta e cloud fail-closed; convergenza incompleta
- **Obiettivo:** scegliere un'unica verita' persistente per ogni dominio.
- **Attivita':**
  - mappare dominio -> writer -> reader -> tabella/provider;
  - individuare split-write, cache autorevoli improprie e servizi paralleli;
  - migrare i consumatori al contratto canonico;
  - rendere i writer critici fail-closed;
  - aggiungere test di parita' e idempotenza.
- **Criterio di uscita:** ogni stato operativo e' unico, persistente e ricostruibile.
- **Risultato parziale:** mappa canonica dei domini prioritari; `createStorageProvider('cloud')` non degrada piu' a local storage; `StorageContext` non espone piu' il provider locale temporaneo ai consumer autenticati e non degrada silenziosamente su errore cloud; il diario attende lettura, persistenza e rilettura autorevole dell'inventario sementi; trattamenti, lavori meccanici, supporto ed esposizione solare falliscono esplicitamente senza database invece di simulare dati o successo. Correzione runtime 26/07: il Director non usa piu' `garden.id` come falso `zone_id` nel controllo tillage; l'API espone una lettura garden-wide esplicita dell'ultimo stato suolo persistito.
- **Evidenza:** commit `270a214`, `bd2ed53`, test persistenza 22/22 e `M09_CANONICAL_PROVIDER_MAP_2026-07-24.md`.
- **Residuo:** helper cache sementi legacy e certificazione staging.

### M10 - Notifiche operative e osservabilita'

- **Stato:** `[L]` lifecycle locale completato; certificazione provider aperta
- **Obiettivo:** completare reminder essenziali senza falsi stati di consegna.
- **Attivita':**
  - scheduler persistente;
  - delivery reale osservabile;
  - retry e dead-letter;
  - deduplica e soppressione;
  - stato inviato/fallito confermato dal provider;
  - metriche, alert e runbook.
- **Criterio di uscita:** una notifica e' tracciabile dalla generazione alla consegna o al fallimento.
- **Risultato locale:** preferenze fail-closed; coda persistente; claim concorrente; deduplica; retry/backoff; dead-letter; rate limit persistente; cron; provider message ID; webhook autenticato; metriche readiness e runbook.
- **Evidenza:** commit `2e55ac4`, avanzamento PR `#48` e `M10_NOTIFICATION_DELIVERY_GAPS_2026-07-24.md`.
- **Residuo:** applicazione migrazione e prova provider/webhook end-to-end in staging (`O23`).

### M11 - Core operativo end-to-end

- **Stato:** `[L]` transizioni e ricorrenze verificate localmente; giornata staging mancante
- **Obiettivo:** ricertificare planner -> task -> esecuzione -> diario -> ledger -> outcome.
- **Attivita':**
  - consolidare stati e transizioni;
  - verificare annullamento, riapertura, retry e idempotenza;
  - verificare timezone Europe/Rome e ricorrenze;
  - eseguire giornata simulata con ruoli reali;
  - riconciliare manualmente il risultato finale.
- **Criterio di uscita:** ogni operazione ha un unico stato autorevole e auditabile.
- **Risultato parziale:** raccolte le prove locali su diario, task/ledger, outcome, timezone ed export; `O25` completato con transizioni auditabili; `O26` completato con motore `Europe/Rome`, DST primavera/autunno, mensili e range fail-closed.
- **Evidenza:** commit `078bc55`, avanzamento PR `#48` e `M11_CORE_OPERATIONAL_DAY_2026-07-24.md`.
- **Residuo:** giornata con ruoli reali e riconciliazione staging (`O27-O28`).

### M12 - Pilot delle operazioni agronomiche

- **Stato:** `[!]` protocollo pronto; pilot reale non eseguito
- **Obiettivo:** provare irrigazione, nutrizione, trattamenti e salute su dati/impianti reali.
- **Attivita':**
  - irrigazione con portata misurata e nessuna auto-attuazione;
  - nutrizione con catalogo, unita' e stock reali;
  - trattamenti con registro, responsabile, intervalli e catalogo verificato;
  - salute con cron, deduplica, task e outcome;
  - approvazione umana per ogni azione operativa.
- **Criterio di uscita:** almeno un ciclo completo segnale -> decisione -> esecuzione -> outcome.
- **Risultato parziale:** protocollo e guardrail definiti; debito software M12 azzerato. Analytics, export, foto, calcolo nutrizionale, preparati, compost e registri convergono su motori o persistenza canonici.
- **Evidenza:** commit `a23fefe`, avanzamento PR `#48` e `M12_AGRONOMIC_PILOT_PROTOCOL_2026-07-24.md`.
- **Blocco:** azienda, mezzi, cataloghi, responsabili e outcome reali non identificati.

### M13 - Provider esterni

- **Stato:** `[-]` Open-Meteo verificato; provider avanzato non configurato
- **Obiettivo:** validare Open-Meteo e un solo provider avanzato iniziale.
- **Attivita':**
  - contract test, cache, timeout, retry e SLA Open-Meteo;
  - scegliere Sentinel oppure ThingsBoard per il primo pilot;
  - configurare credenziali staging;
  - registrare latenza, errori, costi e owner;
  - mantenere kill switch e nessun comando fisico non presidiato.
- **Criterio di uscita:** integrazione reale osservabile, recuperabile e documentata.
- **Risultato parziale:** smoke Open-Meteo reale verde con timezone Europe/Rome e serie richieste; Sentinel e ThingsBoard rilevati come non configurati e non chiamati.
- **Evidenza:** commit `a8b082a` e `M13_PROVIDER_SMOKE_2026-07-24.md`.
- **Residuo:** contract test periodico, scelta di un provider avanzato, credenziali staging, SLA/costi/owner.
- **Gap credenziali rilevato il 28/07/2026 durante T01 lotto 29 (`O48`):** `api_configurations` non applica cifratura reale a riposo ma soltanto Base64; la route autenticata per servizio decodifica e restituisce la chiave in chiaro al browser, dove gli adapter AI e meteo la consumano direttamente. Il flusso resta intatto in questo lotto per non interrompere i provider: la chiusura richiede migrazione cifrata, rotazione e chiamate provider esclusivamente server-side, non una correzione lint.

### M14 - Direttore, regole agronomiche e AI in shadow

- **Stato:** `[-]` regressione locale verde; shadow reale mancante
- **Obiettivo:** misurare utilita' e sicurezza prima dell'uso operativo.
- **Attivita':**
  - creare dataset regressivo approvato;
  - versionare profili, regole e soglie;
  - mostrare fonti, confidenza e segnali mancanti;
  - misurare falsi positivi, azioni accettate e outcome;
  - mantenere `insufficient_data` e approvazione umana;
  - definire soglie di rollback.
- **Criterio di uscita:** report shadow approvato, senza auto-esecuzione critica.
- **Risultato parziale:** 9/9 test mirati verdi su sei scenari canonici, determinismo, `insufficient_data`, confidenza, deduplica e outcome.
- **Evidenza:** commit `f94d760` e `M14_AI_SHADOW_VALIDATION_2026-07-24.md`.
- **Residuo:** dataset reale approvato, periodo shadow, metriche e firma agronomica.
- **Mitigazione interinale 24/07/2026 (scoperta durante T01, non un nuovo item di debito):** `services/costOptimizationService.ts` era gia' censito nel manifest M05 (12 voci `mock`, `scheduled:M14`) ma non aveva alcun avviso visibile in UI — il pannello `CostOptimizationPanel.tsx`, raggiungibile da produzione (`/app/prescription-maps`), presentava costo/resa/impatto/efficienza come calcoli reali quando sono in realta' valori hardcoded (algoritmo genetico che non evolve nulla, commenti "// Mock value" nel sorgente). Aggiunto un banner esplicito nel pannello ("Valori dimostrativi... non usarli per decisioni operative") come mitigazione immediata; il motore stesso resta non implementato, la chiusura reale e' ancora M14/O34-O37.
- **Scoperta 25/07/2026, durante il ripristino UI di pianificazione ambientale (vedi spec `docs/superpowers/specs/2026-07-25-environmental-planning-restoration-design.md`):** l'utente ha chiesto se l'onboarding fosse pensato per alimentare un orchestratore/predittore con tutti i parametri raccolti (sole, suolo, altitudine, ostacoli) proprio per tenere conto delle condizioni che influenzano resa e andamento generale dell'orto. Verificato: **`services/agronomicPredictionPipelineService.ts` e' vivo** (`/app/ai-predictions`, flag `AI_PREDICTIONS: true` in `config/features.ts`, non piu' `false` come registrato in una nota di memoria precedente — verificare sempre lo stato corrente, non fidarsi di note vecchie) e produce 3 predizioni reali (rischio malattie, resa attesa, ottimizzazione risorse idriche) usando pH/sostanza organica del suolo, meteo persistito e punteggio salute pianta. **Ma non usa affatto altitudine, esposizione solare/classificazione solare o ostacoli** — zero riferimenti in tutto il file — nonostante questi dati siano raccolti in onboarding (`AdvancedSunExposureWizard.tsx`, live) e nonostante esista gia' una logica molto piu' precisa per finestre di raccolto per-archetipo basata su questi fattori (`services/plantingWindowOptimizer.ts`, nel cluster orfano di cui sopra, mai collegata). La finestra di raccolto nella pipeline live e' una costante fissa `harvestDays = 60` per qualunque pianta. Non esiste inoltre una metrica di "andamento generale dell'orto": la pipeline produce solo le 3 predizioni separate, nessuna traiettoria di salute complessiva unificata. **Nessuna azione presa, gap registrato su richiesta esplicita dell'utente** ("registralo come gap separato, non ora") — estendere questa pipeline tocca un sistema in produzione con cron e dati persistiti (`persistPredictionBundle`, versionato `PREDICTION_MODEL_VERSION`/`PREDICTION_RULE_VERSION`), e decidere COME l'altitudine/sole/ostacoli dovrebbero pesare sulla resa e sull'andamento e' una decisione agronomica, non solo di wiring — richiede una sessione di design dedicata (brainstorming), non un fix rapido.

### M15 - Lifecycle commerciale e ruoli

- **Stato:** `[L]` lifecycle implementato localmente; prove staging e provider aperti
- **Obiettivo:** rendere il prodotto attivabile e amministrabile per clienti reali.
- **Attivita':**
  - provisioning azienda;
  - inviti e ruoli amministratore/responsabile/operatore;
  - piano/licenza e limiti;
  - rinnovo, sospensione e cancellazione;
  - fatturazione o procedura amministrativa iniziale;
  - assistenza e accesso amministratore OrtoMio auditato.
- **Criterio di uscita:** un cliente puo' attraversare l'intero ciclo commerciale senza interventi tecnici non documentati.
- **Risultato:** registrazione, provisioning transazionale, inviti/delivery/accettazione, ruoli, modello unico PRO, procedura economica, rinnovo, sospensione/riattivazione, export, cancellazione, retention/legal hold e assistenza auditata sono implementati. Il 26/07/2026 O38-O43 sono confluiti in Production; le cinque migrazioni M15 sono state applicate e il probe PostgREST restituisce `schemaReady=true`. O40 e' chiuso per decisione prodotto esplicita single-PRO. Restano provider reale e prove E2E su due aziende prima dello stato `[x]`.
- **Evidenza:** commit `19cb061` e `M15_COMMERCIAL_LIFECYCLE_GAPS_2026-07-24.md`.
- **Residuo:** provider inviti configurato e prove E2E O38-O43 su due aziende; l'assenza di staging/restore resta posseduta da M06-M08.

### M16 - Audit finale e go/no-go

- **Stato:** `[x]` audit eseguito il 26/07/2026; decisione **NO-GO**
- **Obiettivo:** produrre la decisione formale sulla release commerciale 1.0.
- **Attivita':**
  - type-check, lint, test, build e E2E sulla baseline finale;
  - migrazioni e rollback riproducibili;
  - test sicurezza e restore;
  - provider health e monitoraggio;
  - incident drill;
  - classificazione finale di tutte le capability;
  - verbale rischi residui e go/no-go.
- **Criterio di uscita:** soddisfatto per il deliverable O44 tramite no-go motivato; la certificazione commerciale resta bloccata finche' `deployReady=true` non e' supportato da evidenze remote.
- **Risultato:** `M16_GO_NO_GO_2026-07-26.md`; readiness estesa a schema commerciale e gate migrazioni/isolamento/lifecycle/shadow/revisione.

## 4. Questioni trasversali aperte

### D14 - Lint reale

Il 24/07/2026 `npm run lint` inizialmente avviava ESLint ma terminava con:

`You are linting ".", but all of the files matching the glob pattern "." are ignored.`

La correzione M02 ha:

- reso esplicito il perimetro `app components services lib hooks config`;
- aggirato in modo dichiarato l'ignore ereditato dal percorso worktree;
- corretto 42 errori bloccanti, incluse violazioni delle regole Hooks;
- lasciato visibili 2.733 warning storici.

**Stato:** il gate errori e' chiuso nel commit `583902a9`; i 2.733 warning non risultano atomizzati dal manifest M05 e restano debito trasversale `T01`. Non sono un gate bloccante gia' dimostrato, ma non devono essere descritti come eliminati o interamente classificati.

### File generato fuori perimetro

`tsconfig.tsbuildinfo` risulta modificato nel worktree ma non appartiene ai commit intenzionali del piano. Non deve essere incluso automaticamente nei commit successivi.

## 5. Registro avanzamento

| Data | Blocco | Stato | Evidenza | Note |
|---|---|---|---|---|
| 24/07/2026 | M01 / D5 | Completato | `c458bd92a08ad4d947813e65ca6319f7bc184318` | 13 flag morti rimossi; gate locale riallineato |
| 24/07/2026 | M02 / D14 | Completato | `583902a9` | Dashboard veritiera; lint reale con 0 errori; 2.733 warning registrati |
| 24/07/2026 | M03 | Completato localmente | `fed4732` | Creazione e rilettura zone autorizzate; applicazione migrazione su staging ancora richiesta |
| 24/07/2026 | M04 | Completato localmente | `83aeef7` | Stato suolo persistente; inventario sementi senza fallback simulati |
| 24/07/2026 | M05 | Censimento baseline completato | `aac8046` | 203 voci iniziali classificate; il totale corrente e' aggiornato nella sezione M05 |
| 24/07/2026 | M06 | Bloccato dopo inventario | `95c324f` | `safeToApply=false`: staging e restore richiesti prima di ogni applicazione |
| 24/07/2026 | M07 | Bloccato dopo preparazione | `769a052` | Script e template pronti; RPO/RTO e restore remoto non misurati |
| 24/07/2026 | M08 | Bloccato dopo preparazione | `M08_MULTI_CLIENT_RLS_MATRIX_2026-07-24.md` | Matrice pronta; prove SQL/API/UI staging mancanti |
| 24/07/2026 | M09 | Parziale | `270a214` + avanzamento locale successivo | Cloud e consumer autenticati fail-closed; sementi confermate dal backend; convergenza completa ancora aperta |
| 24/07/2026 | M10 | Parziale | `2e55ac4` | Preferenze fail-closed; coda e conferma delivery mancanti |
| 24/07/2026 | M11 | Parziale | `078bc55` | Catena locale censita; giornata con ruoli reali mancante |
| 24/07/2026 | M12 | Bloccato dopo preparazione | `a23fefe` | Protocollo pilot pronto; nessun ciclo reale |
| 24/07/2026 | M13 | Parziale | `a8b082a` | Open-Meteo reale verde; provider avanzato assente |
| 24/07/2026 | M14 | Parziale | `f94d760` | Regressione 9/9; shadow reale non eseguito |
| 24/07/2026 | M15 | Parziale | `19cb061` | Token invito non loggato; lifecycle commerciale incompleto |
| 24/07/2026 | M09 / O16-O17 | Completato localmente | avanzamento PR `#48` | 44 voci riclassificate; coordinate e memoria agronomica convergenti; zero voci M09 nel manifest |
| 24/07/2026 | M09 / O04 | Completato localmente | avanzamento PR `#48` | Cache seed rimossa; reader e consumer interamente asincroni |
| 24/07/2026 | M09 locale | Gate verde | avanzamento PR `#48` | Type-check; persistenza 27/27; release 314/314; build 147 pagine; resta O18 staging |
| 24/07/2026 | M10 / O19-O22, O24 | Completato localmente | avanzamento PR `#48` | Lifecycle delivery persistente e operabile; resta O23 provider staging |
| 24/07/2026 | M10 locale | Gate verde | avanzamento PR `#48` | Type-check; rollout 13/13; release 318/318; build 149 pagine; zero voci M10 |
| 24/07/2026 | M11 / O25 | Completato localmente | avanzamento PR `#48` | Riapertura e annullamento uniformi e auditabili; type-check e persistenza 29/29 |
| 24/07/2026 | M11 / O26 | Completato localmente | avanzamento PR `#48` | Europe/Rome e DST deterministici; ricorrenze giornaliere, settimanali e mensili; persistenza 33/33 |

## 5.1 Registro unico del lavoro aperto

Questo registro contiene i deliverable ancora necessari. Gli ID sono stabili: una nuova scoperta aggiunge una riga; non rinumera o nasconde le precedenti.

| ID | Owner | Deliverable aperto | Condizione di chiusura |
|---|---|---|---|
| O01 | M03 | Applicare e provare la migrazione ownership zone in staging | Create/read e accesso cross-garden verdi sullo schema candidato |
| O02 | M03 | ~~Migrare update, cambio stato ed eliminazione zone legacy alla API canonica~~ **Chiuso 24/07/2026** (`fcd97de`) | Nessuna mutazione production parallela — verificato: solo `/api/garden/zones` scrive `land_zones` dal client |
| O03 | M04 | Applicare e provare `garden_soil_states` in staging | Read/write e RLS verificate sullo schema candidato |
| O05 | M05 | **M15 riconciliato 26/07/2026:** 6 -> 0 voci; restano 27 M13 e 48 M14 dipendenti dai rispettivi gate reali | Manifest finale senza voce `scheduled` irrisolta |
| O06 | M06 | `[!]` Dashboard 26/07: piano Free, nessun branch, `Create branch` disabilitato e nessun backup; rendere disponibile uno staging isolato con snapshot | Target e rollback identificati |
| O07 | M06 | `[-]` History dashboard acquisita: 48 record, ultimo `20260724082916`; resta dump schema e confronto oggetto per oggetto | Drift classificato per ogni oggetto |
| O08 | M06 | Risolvere timestamp duplicati e migrazione remota orfana | History univoca e motivata |
| O09 | M06 | Applicare e verificare i batch di migrazioni | Audit post-batch verde e rollback disponibile |
| O10 | M07 | `[!]` Piano Free senza backup provider; predisporre target e poi eseguire backup/restore drill reale | Restore completo ripetibile |
| O11 | M07 | Provare ripristino selettivo di un cliente | Dati cliente riconciliati |
| O12 | M07 | Misurare e approvare RPO/RTO | Valori registrati nel runbook |
| O13 | M08 | Eseguire matrice isolamento SQL/API/UI con due clienti | Tutti i negativi attesi risultano negati |
| O14 | M08 | Certificare storage, cron, export, cache e admin | Nessun percorso cross-tenant |
| O15 | M08 | Rieseguire Security Advisor | Nessun finding release-blocking aperto |
| O18 | M09 | Certificare reader/writer canonici in staging | Stato ricostruibile per ogni dominio prioritario |
| O23 | M10 | Registrare provider message ID e webhook delivery | Stato finale confermato dal provider |
| O27 | M11 | Eseguire giornata completa con ruoli reali | Planner-outcome completato senza interventi fuori flusso |
| O28 | M11 | Riconciliare ledger e risultato su staging | Stato finale unico e ricostruibile |
| O29 | M12 | Identificare azienda, dataset, mezzi, cataloghi e responsabile pilot | Input pilot approvati |
| O30 | M12 | Eseguire ciclo agronomico reale con approvazione umana | Segnale-decisione-esecuzione-outcome documentato |
| O31 | M13 | Scegliere Sentinel oppure ThingsBoard e assegnare owner | Decisione e perimetro registrati |
| O32 | M13 | Configurare credenziali e smoke staging | Provider reale osservabile |
| O33 | M13 | Definire SLA, costi, monitoraggio e kill switch | Runbook provider approvato |
| O48 | M13 | Proteggere le credenziali provider: sostituire il Base64 di `api_configurations` con cifratura autenticata a riposo, migrare/ruotare i valori esistenti e spostare ogni chiamata provider dietro endpoint server-side; oggi la route per servizio restituisce la chiave decodificata al client e gli adapter browser la usano direttamente. | Nessun segreto provider in payload/browser; cifratura autenticata e rotazione verificate; provider reali funzionanti soltanto server-side |
| O49 | M14 | ~~Rendere atomici quota tecnica AI e ledger~~ **Chiuso 28/07/2026:** migrazione Production `20260728050000_atomic_ai_credit_consumption.sql` applicata e registrata; RPC service-role-only aggiorna `profiles.ai_credits_used` e inserisce `ai_credit_transactions` nella stessa transazione. Revocata ai client anche la vecchia `deduct_credits`. Le cinque route vive usano esclusivamente il nuovo adapter, derivano i costi dal catalogo server e non inventano piu' saldo `999` senza Supabase. Probe remoto anon: `401/42501 permission denied`; colonne ledger `HTTP 200`. | Nessun successo AI senza quota+ledger coerenti; RPC non invocabile dal client; saldo sempre autorevole |
| O50 | Trasversale | ~~Eliminare le azioni vive verso `/app/progress`, route inesistente~~ **Chiuso 28/07/2026:** modale Aggiungi, quick action globale e quick action dashboard convergono su `/app/harvest`; `?action=add` apre realmente il modal di registrazione. Il riquadro traguardo, privo di una pagina dettaglio canonica, non finge piu' di essere navigabile. Regressione capability dedicata. | Zero destinazioni `/app/progress` nei quattro consumer vivi; creazione raccolto raggiungibile e modal aperto |
| O51 | M14 | ~~Eliminare i KPI inventati dalla Business Intelligence~~ **Chiuso 28/07/2026:** la route Analytics non impone piu' minimi o fallback fittizi per piante, raccolto, acqua, CO2, efficienza, risparmio, ROI e ore; rimosse anche variazioni, resa, ciclo, utilizzo risorse, tempo medio e automazione hardcoded. Le metriche derivabili usano task/raccolti persistiti filtrati dal periodo; quelle senza baseline mostrano `n/d` e la condizione mancante. | Dataset vuoto produce solo zero osservati o `null`; nessun KPI simulato; filtro temporale applicato; regressione capability verde |
| O52 | Trasversale | ~~Rendere operativo lo storico delle zone terreno~~ **Chiuso 28/07/2026:** il pulsante `Storico` in `/app/garden/zones`, prima limitato a impostare uno stato mai letto, apre ora un dialogo alimentato dalla RPC persistita `get_zone_history`. La UI distingue caricamento, errore e assenza di cicli colturali, senza inventare record; statistiche e righe zona sono tipizzate. | Click verificabilmente operativo; dati solo da `soil_memory`; stati vuoto/errore espliciti; regressione capability verde |
| O53 | Trasversale | ~~Alimentare le statistiche nutrizione con registri reali~~ **Chiuso 28/07/2026:** la scheda Bio/Tradizionale non riceve piu' `treatments={[]}` e `fertilizers={[]}`; legge trattamenti e inventario fertilizzanti dal provider persistente e classifica i contratti reali. Dataset vuoto mostra percentuali `n/d`, errore provider mostra dati non disponibili. Rimosso il wizard interno mai renderizzato e gia' sostituito dal planner persistente. | Nessuno zero/100% costruito da array costanti; classificazione testata; errore distinto da dataset vuoto; codice duplicato rimosso |
| O54 | Trasversale | ~~Rimuovere il falso lifecycle in memoria delle lavorazioni meccaniche~~ **Chiuso 28/07/2026:** la route `/app/mechanical-work` non presenta piu' attrezzature e pianificazioni inizializzate sempre vuote e salvate soltanto in React, ne' pulsanti Modifica/Usa/Calendario/Export privi di azione. Registro e creazione usano il provider persistente; le analytics mostrano solo misure supportate dai record e `n/d` per il costo assente. | Nessuna entita' apparentemente salvata ma persa al reload; zero pulsanti morti; metriche soltanto osservate; regressione capability verde |
| O55 | Trasversale | ~~Rimuovere dati demo e destinazioni vuote dalla route Irrigazione~~ **Chiuso 28/07/2026:** eliminati KPI hardcoded (`85L`, `3`, `15%`, `68%`), zone campione 2024, wizard/analytics interni mai renderizzati e tab che mostravano soltanto “componente in sviluppo”. Dashboard, zone, sistemi e log restano collegati ai servizi persistenti; selezionare una zona filtra davvero i sistemi. | Zero KPI/zone campione; zero tab placeholder; azioni opzionali visibili solo con handler; registrazione singola/batch testata |
| O56 | Trasversale | ~~Rimuovere dalla route Frutteto il prototipo tropicale statico e irraggiungibile~~ **Chiuso 28/07/2026:** eliminate 347 righe di `TropicalExoticSection`, mai importate, invocate o renderizzate, inclusi catalogo statico e KPI fissi `24°C`/`75%`. La rimozione riguarda soltanto il prototipo morto, non il concetto prodotto tropicale implementato correttamente in O57. Gli alberi e i gruppi filare vivi sono tipizzati con `OrchardTree`; dashboard e flussi persistenti restano invariati. | Zero prototipo orfano e zero KPI statici irraggiungibili; route Frutteto 0 warning; test mapping/filari e build verdi |
| O57 | Trasversale | ~~Differenziare i frutteti tropicali come sottocategoria reale di Frutteto~~ **Chiuso 28/07/2026:** il wizard principale espone `Tropicale/Subtropicale` e sincronizza bidirezionalmente la categoria botanica `ESOTICHE` con il valore persistito `orchardType=tropical`, gia' supportato dal vincolo database. Cambiando categoria non resta una classificazione tropicale obsoleta; la dashboard mostra nome e icona dedicati. | Tropicale resta nel dominio Frutteto; scelta persistita senza dati mock; coerenza bidirezionale testata; dashboard riconoscibile |
| O58 | Trasversale | ~~Correggere il bulk alberi del wizard Frutteto e tipizzare il servizio persistente~~ **Chiuso 28/07/2026:** `createOrchardFromWizard` non passa piu' righe snake_case a `bulkCreateTrees`, che le rimappava come oggetti camelCase e poteva perdere `orchardId`/`gardenId`. Un builder dedicato mantiene entrambi gli scope fino al mapper, valida numero albero e varieta' prima dell'insert e applica default di stato espliciti. Se il bulk fallisce, la configurazione appena creata viene compensata; un doppio fallimento resta esplicito. I mapper Supabase usano contratti derivati dai tipi dominio. | Scope garden/frutteto presenti nel bulk insert; nessuna identita' inventata; nessun frutteto parziale silenzioso; regressioni persistenti verdi; servizio 0 warning |
| O34 | M14 | Approvare dataset regressivo reale | Dataset versionato e firmato |
| O35 | M14 | Eseguire periodo shadow | Raccomandazioni e decisioni raccolte |
| O36 | M14 | Calcolare metriche e soglie rollback | Falsi positivi, accettazione e outcome misurati |
| O37 | M14 | Ottenere revisione agronomica firmata | Report shadow approvato |
| O38 | M15 | **Codice e schema Production 26/07/2026:** provisioning RPC applicato e registrato in history; resta prova E2E | Cliente attivato senza intervento DB manuale |
| O39 | M15 | **Codice e schema Production 26/07/2026:** colonne delivery e RPC applicate/verificate; restano provider reale e prova E2E | Invito consegnato, accettato e auditato |
| O40 | M15 | ~~Implementare licenze, piani e limiti~~ **Chiuso 26/07/2026 per decisione prodotto:** unica versione PRO, nessun piano/limite commerciale; gate legacy rimossi. Correzione runtime 26/07: rimossi anche limite e messaggio FREE residui dal semenzaio. **Prova Production autenticata 26/07:** sia `Nuovo Batch` sia `Crea Primo Batch` aprono e portano a vista `Crea Nuovo Batch`; `Annulla` richiude il form e la verifica non ha creato dati. | Contratto single-PRO verificato, nessuna capability nascosta per tier |
| O41 | M15 | **Codice e schema Production 26/07/2026:** relazioni e RPC billing applicate/verificate; resta prova E2E su due aziende | Ciclo economico documentato |
| O42 | M15 | **Codice e schema Production 26/07/2026:** relazioni, RPC e policy sospensione applicate/verificate; resta prova E2E | Accessi e dati coerenti |
| O43 | M15 | **Codice e schema Production 26/07/2026:** lifecycle uscita/assistenza applicato e verificato; resta prova E2E | Lifecycle di uscita verificato |
| O45 | M05 | ~~Eliminare gli 8 file orfani verificati~~ **Chiuso e pubblicato tramite PR #62 il 26/07/2026:** nuova verifica zero-importer, sostituti vivi confermati e rimossi soltanto `ProfessionalCalendar`, `EnhancedDashboard`, i due widget irrigazione, `OnboardingTier`, `VineyardPruningManager`, `MigrationWizard` e `cultivationOrchestrator.ts`. Rimossi anche i due test testuali rimasti orfani su `IrrigationZonesWidget` e `cultivationOrchestrator`. I quattro candidati non analizzati restano esclusi. | Tutti gli 8 file confermati e i relativi test orfani rimossi, type-check/build/test verdi, nessun importer residuo |
| O44 | M16 | ~~Eseguire audit finale e verbale go/no-go~~ **Chiuso 26/07/2026:** verbale `M16_GO_NO_GO_2026-07-26.md`, decisione NO-GO motivata e gate automatico esteso | `deployReady=true` con evidenze oppure no-go motivato |
| O46 | M09 | ~~Allineare e verificare la persistenza batch Semenzaio~~ **Chiuso 26/07/2026:** migrazione `20260726180000_seedling_batch_sources.sql` applicata e registrata (`history_ok/source_ok/purchase_date_ok/nursery_name_ok = true`, PostgREST `HTTP 200`); PR #68 unita in `main` (`997b401`) e deploy Production verde. Prova E2E autenticata: creati e riletti un batch `home` e uno `nursery`; cleanup SQL mirato ha restituito `deleted_count=2`, sorgenti `[home,nursery]`, e il reload ha confermato zero marcatori residui. | Migrazione applicata e registrata in Production; creazione semina interna e piantina acquistata entrambe verificate |
| O47 | M14 | ~~Rimuovere identita' vegetali simulate dal widget Salute Piante~~ **Chiuso 28/07/2026:** il widget `/app` non passa piu' una lista task vuota; il motore non contiene piu' `samplePlants` (`Melo`, `Pomodoro San Marzano`, `Pesco giovane`, `Vite da vino`, `Olivo da olio`) ne' codici sintetici `ORC-01`/`ROW-01`/`VIN-01`/`OLV-01`. Le regole usano solo nomi coltura persistiti nei task o nelle configurazioni reali del giardino e, senza identita' reale, non generano una scheda vegetale. Gli alert da calendario sono presentati come promemoria stagionali, esplicitamente non diagnosi; lo stato vuoto non dichiara piu' falsamente che tutte le piante sono sane. I pulsanti rapidi, prima limitati a `console.log`, aprono ora il flusso Salute. Test regressivi, lint mirato, type-check e build verdi. | Nessuna pianta/codice campione nella UI; origine e natura non diagnostica esplicite; azioni navigabili |
| T01 | Trasversale | Inventariare e ridurre i 2.733 warning lint storici — **in corso 25/07/2026**: 2642 -> 2589 -> 2563 -> 2516 -> 2496 -> 2486 -> 2476 -> 2453 -> 2429 -> 2413 -> 2386 -> 2344 -> 2329 -> 2298 dopo 13 lotti (`docs/reports/T01_LINT_DEBT_BASELINE_2026-07-24.md`); lotto 1 `HomeDashboard.tsx` 49->0 (+ scoperto un pannello con dati finti, vedi nota M14 sopra), lotto 2 `ContinuousMonitoringDashboard.tsx` 26->0, lotto 3 `PlantLifecycleManager.tsx` 24->0 e `Planner.tsx` 19->0 (+ sistemati 2 bottoni stagionali morti; scoperto poi il cluster "AI Planner" morto, ~6.100 righe/8 file, vedi nota M05 sopra — escluso da T01 su decisione dell'utente), lotto 4 `OrganizationManager.tsx` 11->0 e `ActivityRegistry.tsx` 9->0 dopo aver verificato la raggiungibilita' di ogni candidato, lotto 5 `aiPredictiveEngine.ts` 13->5 (+ trovato e corretto un gap algoritmico reale: evapotranspirazione/capacita' idrica del suolo calcolate e scartate, mai la formula finale — diverso da dato finto, qui i numeri usati erano reali ma la copertura piu' stretta del dichiarato), lotto 6 `GardenOnboarding.tsx` 11->1 (+ collegato su richiesta dell'utente il wizard "input visivo" mai raggiungibile prima; trovato ma lasciato non toccato un secondo gap, calibrazione bussola panoramica calcolata e mai passata all'analisi — vedi nota M05 sopra), lotto 7 (25/07) `PruningManager.tsx` 12->0 e `HarvestManager.tsx` 11->0 (entrambi vivi, montati da `/app/orchard` e `/app/olives`). Lotti 6 e 7 confluiti su `main` il 25/07/2026. Lotto 8 (25/07) `SeedlingManager.tsx` 13->1 e `NutritionAnalytics.tsx` 12->0 (entrambi vivi: il primo montato da `HomeDashboard`/`SeedlingReadyWidget`, il secondo da `/app/nutrition`): rimossi import/variabili morte, tipizzato `location` del batch semenzaio con l'union reale del service al posto di `as any`, `exhaustive-deps` sistemato con `useCallback`; lasciato 1 warning intenzionale `no-img-element` (foto batch in base64 data-URI, la conversione a `next/image` e' un cambio di comportamento non lint). Lotto 9 (25/07) `DailyGardenReport.tsx` 7->0 e `ProfessionalIrrigationDashboard.tsx` 9->0 (vivi: il primo via `GardenView`/`GardenCard`, il secondo da `/app/irrigation`): solo import morti, `exhaustive-deps` con `useCallback` e un `as any` sostituito con `{ message?: string }` gia' garantito dal guard; scartati per irraggiungibilita' (zero importer, verificato 25/07) `PrescriptionMapsDashboard_Mobile.tsx` e `FieldPlantManager.tsx` — candidati "codice morto" per il prossimo censimento M05 insieme al cluster AI Planner. Lotto 10 (25/07) `UnifiedTimelineDiary.tsx` 19->0 (vivo: `/app/diary` + `GardenView`; tipizzati props e foto con i tipi reali `Garden`/`GardenTask`/shape di `PhotoTimeline`) e `geoExportService.ts` 12->4 (vivo via `MapExportModal`/`PrescriptionMapsDashboard`; `storageProvider: any` tipizzato con `Pick<IStorageProvider,...>`): i 4 warning residui sono lasciati intenzionalmente su due stub onesti, `getMachineryCompatibility` (dichiara "return null for now", i chiamanti gestiscono il null) e `transformCoordinates`. **Gap funzionale trovato nel lotto 10, NON toccato (da decidere, stesso pattern M14):** `transformCoordinates` restituisce le zone in WGS84 non trasformate anche quando l'utente sceglie il sistema UTM nell'export — il file esportato dichiara UTM ma contiene coordinate WGS84, silenziosamente; anche `ZoneMemoryView.tsx` (e con lui `gardenMemoryService.ts`) risulta a zero importer, altro candidato codice morto M05. Lotto 11 (25/07), 5 file vivi: `ProfessionalNutritionDashboard.tsx` 7->0, `WeatherTaskAlert.tsx` 8->0, `VineyardDashboard.tsx` 8->0, `ProfessionalDashboard.tsx` 10->3 e `TreeManager.tsx` 30->18 (import morti, `useCallback` sui data-loader, due parametri modal mai usati rimossi da firma e chiamata). Su `TreeManager.tsx` e `ProfessionalDashboard.tsx` lasciati intenzionalmente i warning `no-explicit-any` (rispettivamente 12 e 3): file troppo estesi/rischiosi per una retipizzazione in questo lotto, candidati per un lotto dedicato futuro. Altri 5 file (`ProfessionalCalendar.tsx`, `EnhancedDashboard.tsx`, `MigrationWizard.tsx`, `OnboardingTier.tsx`, `IrrigationZonesWidget.tsx`, `VineyardPruningManager.tsx`) risultano a zero importer durante la verifica — nuovi candidati codice morto M05, ora registrati in O45. Lotto 12 (25/07): `plantMasterService.ts` 6->0 (import morti + parametri `lat`/`lng` di `convertMasterSheetToSpecificInfo` mai usati nel corpo, rimossi da firma e dal call site in `geminiService.ts`), `plantingWindowOptimizer.ts` 6->1 (5 import morti; lasciato apposta il warning su `historicalWeather`, **gap reale trovato**: `logic/solarClassificationHelper.ts` recupera e passa dati meteo storici veri a `findPlantingWindows`, che li ignora silenziosamente — stesso pattern M14 di aiPredictiveEngine nel lotto 5, non implementato qui), `app/app/orchard/page.tsx` 7 unused-vars +2 exhaustive-deps risolti su 28 totali (import morto, parametro handler morto, due `useCallback`; lasciati intenzionalmente i 17 `no-explicit-any` e la funzione `TropicalExoticSection` mai renderizzata nel file, candidata separata per M05). Scartati per irraggiungibilita' durante la selezione: `complianceAIService.ts`, `cultivationOrchestrator.ts`, `dominanceIntegrationService.ts`, `components/Dashboard.tsx` (tutti zero importer, da aggiungere a O45 se confermati). Totale 2344 -> 2329. Gap funzionali trovati nel lotto 7 e NON toccati (da decidere): in entrambi i detail modal il tab Registrazioni mostra sempre vuoto (`setRecords` mai chiamato, nessun fetch dei record) e i bottoni Play/Edit sulle card e "Nuova/Prima Registrazione" nei tab non hanno alcun `onClick` — stesso pattern bottoni-morti gia' visto nel Vigneto. Lotto 13 (25/07), 6 file vivi verificati uno per uno: `ComplianceChecklist.tsx` 5->0 e `TimelineView.tsx` 5->0 (zero warning residui), `Advice.tsx` 5->3, `AddCropWizard.tsx` 5->3 (lasciato apposta l'`exhaustive-deps` su `handleSearch`: wrapparlo in `useCallback` coi deps corretti includerebbe `foundArchetype`/`fuzzySuggestions`, che la funzione stessa aggiorna — rischio concreto di loop infinito, non e' un fix meccanico sicuro), `AddWoodyCropWizard.tsx` 7->6 (`exhaustive-deps` sistemato in sicurezza, era un semplice gate su props esterne non settate dallo stesso effect), `QuickEventModal.tsx` 5->2. Import morti, coppie state morte, parametri modal richiesti dall'interfaccia ma mai letti nel corpo (tenuti in interfaccia, solo non destrutturati, stesso pattern gia' usato su `PruningManager`/`ComplianceChecklist`). Confermato vivo `Advice.tsx` tramite `CropRotationPlanner.tsx` (`/app/advice` + `/app/planner`) e `ComplianceChecklist.tsx` tramite `BiologicalControlDashboard.tsx` (montato direttamente in `/app/planner`). Nuovo orfano trovato: `components/compliance/RecallProcedure.tsx` (zero importer, non ancora analizzato per O45). Totale 2329 -> 2298 | Baseline per categoria e trend registrati; zero warning release-blocking |

### Aggiornamento T01 - lotto 14 (26/07/2026)

La branch di completamento e' stata riallineata ai lotti 1-13 gia' confluiti in `main`. Il lotto 14 porta `IrrigationZoneManager.tsx`, `ProductManager.tsx`, `BulkOperationModal.tsx` e `SeedlingDashboard.tsx` da 31 warning complessivi a zero. Baseline globale verificata: **0 errori, 2.267 warning** (`2.298 -> 2.267`); type-check verde. O45 e i gap di prodotto M14 restano separati e non sono stati mascherati come lint.

### Aggiornamento T01 - lotto 15 (26/07/2026)

Il lotto 15 porta `FertilizerApplicationModal.tsx`, `QuickHarvestForm.tsx` e `InventoryManager.tsx` da 30 warning complessivi a zero. Baseline globale verificata: **0 errori, 2.237 warning** (`2.267 -> 2.237`); lint mirato e type-check verdi. Il dosaggio fertilizzante ora deriva dall'area reale del letto selezionato e accetta solo le fasi previste dal contratto del log. O45 e i gap di prodotto M14 restano separati.

### Aggiornamento T01 - lotto 16 (26/07/2026)

Il lotto 16 porta i componenti vivi `HealthAlertSystem.tsx` e `DiaryPlannerIntegration.tsx` da 22 warning complessivi a zero. Baseline globale verificata: **0 errori, 2.215 warning** (`2.237 -> 2.215`); lint mirato e type-check verdi. Il widget geografico emerso nella stessa selezione non ha importer verificati ed e' stato lasciato intatto per la successiva classificazione O45.

### Aggiornamento T01 - lotto 17 (26/07/2026)

Il lotto 17 porta `CropRotationPlanner.tsx`, vivo nelle route Planner e Consigli, da 10 warning a zero. Baseline globale verificata: **0 errori, 2.205 warning** (`2.215 -> 2.205`); lint mirato e type-check verdi. `AnnualPlanner.tsx` e' risultato senza importer ed e' rimasto intatto per O45; `GardenEditModal.tsx` resta vivo ma richiede un lotto dedicato.

### Aggiornamento T01 - lotto 18 (26/07/2026)

Il lotto 18 porta `components/settings/GardenEditModal.tsx`, vivo in `/app/settings`, da 9 warning a zero: filari e compatibilita' provider tipizzati, union reali sui select, loader stabilizzato e import morto rimosso. La baseline corrente di `origin/main`, rimisurata prima della modifica, era gia' **0 errori, 2.140 warning** dopo le PR funzionali confluite nel frattempo; il lotto porta il totale a **0 errori, 2.131 warning** (`2.140 -> 2.131`). Lint mirato, type-check e diff-check verdi.

### Aggiornamento T01 - lotto 19 (26/07/2026)

Il lotto 19 porta `components/nutrition/TreatmentPlanner.tsx`, vivo in `/app/nutrition`, da 32 warning a zero: form trattamento/programmazione tipizzato, union reali sui select, loader stabilizzato e import morti rimossi. I payload hanno ora default obbligatori espliciti e gli update senza ID vengono rifiutati. Baseline globale verificata: **0 errori, 2.099 warning** (`2.131 -> 2.099`); lint mirato, type-check e diff-check verdi.

### Aggiornamento T01 - lotto 20 (26/07/2026)

Il lotto 20 porta `components/irrigation/WateringLogForm.tsx`, vivo in `/app/irrigation`, da 21 warning a zero: compatibilita' irrigue legacy tipizzate, metodo log allineato alla union reale, callback di calcolo stabilizzate e stato/import/prop non usati rimossi dal corpo. Baseline globale verificata: **0 errori, 2.078 warning** (`2.099 -> 2.078`); lint mirato, type-check e diff-check verdi.

### Aggiornamento T01 - lotto 21 (26/07/2026)

Il lotto 21 porta `components/plants/PlantDetailModal.tsx`, vivo tramite `SmartPlantManager`, da 20 warning a zero: operazioni, sorgenti e tab tipizzati, foto migrate a `next/image` e loader stabilizzato. Corretto anche il caricamento operazioni filare, che ometteva il `gardenId` richiesto dal provider e poteva fallire silenziosamente. Baseline globale verificata: **0 errori, 2.058 warning** (`2.078 -> 2.058`); lint mirato, type-check e diff-check verdi.

### Aggiornamento T01 - lotto 22 (26/07/2026)

Il lotto 22 porta `components/vineyard/VineManager.tsx`, vivo in `/app/vineyard`, da 14 warning a zero: operazioni tipizzate con `PlantOperation`, callback stabilizzate, import/helper morti rimossi e registrazione rapida allineata ai campi persistiti ufficiali del servizio unificato. Baseline globale verificata: **0 errori, 2.044 warning** (`2.058 -> 2.044`); lint mirato, type-check e diff-check verdi. `components/garden/ListView.tsx` e' stato confermato senza importer ed e' rimasto intatto come candidato codice morto; i 18 warning di `TreeManager.tsx` restano esplicitamente rinviati perche' coinvolgono il contratto condiviso storico `operationContext`.

### Aggiornamento T01 - lotto 23 (26/07/2026)

Il lotto 23 porta `components/plants/SmartPlantManager.tsx`, vivo in quattro route, da 13 warning a zero: mapping e statistiche tipizzati, callback stabilizzate e gestione errori esplicita. Chiuso anche il bottone “Aggiorna Salute”, prima collegato a un modal inesistente e ora instradato al flusso bulk implementato; rimosso il falso comando “Operazione Unificata”, che non eseguiva nulla e mostrava soltanto un avviso di sviluppo. Aggiunta copertura regressiva dedicata. Baseline globale verificata: **0 errori, 2.031 warning** (`2.044 -> 2.031`); capability test 18/18, lint mirato, type-check e diff-check verdi.

### Aggiornamento T01 - lotto 24 (26/07/2026)

Il lotto 24 porta `InterventionWizard.tsx` (vivo in NDVI e Smart Hub) da 11 warning a zero e `interventionService.ts` da 2 a zero. Oltre alla tipizzazione, chiude due difetti di persistenza: i default obbligatori del submit non possono piu' essere sovrascritti dal form parziale e i payload Supabase contengono soltanto le colonne snake_case previste dalla tabella `interventions`, non anche i campi camelCase inesistenti. Aggiunti builder puri e test regressivi insert/update. Baseline globale verificata: **0 errori, 2.018 warning** (`2.031 -> 2.018`); persistenza 64/64, lint mirato, type-check e diff-check verdi.

### Aggiornamento T01 - lotto 25 (26/07/2026)

Il lotto 25 porta i servizi meteo condivisi `weatherService.ts` e `weatherProviderAdapter.ts` da 16 warning complessivi a zero. Le soglie minime delle colture, prima ricevute e ignorate, generano ora allerte specifiche; eliminato anche il fallback che inventava previsioni stagionali e casuali quando provider o geolocalizzazione fallivano: i widget ricevono un errore esplicito invece di dati falsi. Contratti provider tipizzati e test regressivi aggiunti. Baseline globale verificata: **0 errori, 2.002 warning** (`2.018 -> 2.002`); test meteo 13/13, lint mirato, type-check e diff-check verdi. Esclusi e documentati gli orfani `AromaticHarvest`/`WateringLogFormWithFieldRows` e i wizard interni non raggiungibili/non persistenti emersi nelle pagine Nutrizione e Lavorazioni Meccaniche.

### Aggiornamento T01 - lotto 26 (26/07/2026)

Il lotto 26 porta `components/shared/HomeDashboard.tsx`, vivo in `/app`, da 12 warning a zero: tipi reali per filari, piante, opzioni Director e raccolti, dipendenze effect complete e array task stabile. Chiuso anche il fallback ingannevole del piano giornaliero: un errore Director non viene piu' convertito in un piano vuoto apparentemente valido, ma produce stato nullo e alert visibile. Baseline globale verificata: **0 errori, 1.990 warning** (`2.002 -> 1.990`); capability test 19/19, lint mirato, type-check e diff-check verdi. Registrato separatamente `intelligentNotificationService`: importato dalla dashboard Monitoraggio ma mai alimentato, perche' `processAlerts` non ha chiamanti e la UI legge una mappa in memoria vuota.

### Aggiornamento T01 - lotto 27 (28/07/2026)

Il lotto 27 porta le route Production `app/api/cron/health-check/route.ts` e `app/api/garden/sun-exposure/route.ts` da 16 warning complessivi a zero. Il cron salute usa ora contratti espliciti per righe task, meteo e sensori. La route esposizione solare non ignora piu' un errore di lettura `garden_obstacles`: senza ostacoli autorevoli interrompe il calcolo con errore esplicito, invece di produrre ore di sole falsamente ottimistiche assumendo una lista vuota. Aggiunta copertura regressiva fail-closed. Baseline globale verificata: **0 errori, 1.974 warning** (`1.990 -> 1.974`); test mirati 16/16, lint mirato, type-check e diff-check verdi.

Durante la selezione, `services/fieldRowPredictiveService.ts` (35 warning) e' stato escluso dal lotto: e' vivo in `/app/garden/rows`, ma costruisce un `GardenTask` virtuale e possiede predizioni di fallback. Non viene trattato come semplice debito lint finche' l'origine e la veridicita' di quelle predizioni non saranno classificate nel perimetro M14.

### Aggiornamento T01 - lotto 28 (28/07/2026)

Il lotto 28 porta a zero warning sei route cron Production: `weekly-photo-reminders`, `germination-check`, `task-reminders`, `weather-alerts`, `daily-diary` e `reset-credits` (11 warning complessivi). Oltre a rimuovere import morti e `any`, uniforma tutti i job al guard centrale `requireCron`: confronto timing-safe, rifiuto quando `CRON_SECRET` e' assente, validazione timestamp e blocco replay. Quattro route confrontavano direttamente l'header con ``Bearer ${CRON_SECRET}`` senza prima garantire che il secret esistesse, rendendo accettabile la stringa `Bearer undefined` in una configurazione errata. I catch preservano ora anche lo status `409` del replay invece di appiattirlo a `401/500`. Aggiunta una regressione che impone il guard canonico a tutte e sei le route.

Baseline globale verificata: **0 errori, 1.963 warning** (`1.974 -> 1.963`); test sicurezza/observability 17/17, lint mirato, type-check e diff-check verdi.

### Aggiornamento T01 - lotto 29 (28/07/2026)

Il lotto 29 porta a zero warning quattro endpoint Production (`auth/register`, `calendar/tasks`, `mechanical-work`, `treatments`), per una riduzione complessiva di 10 warning. La registrazione non scrive piu' nei log il body sanificato, che includeva comunque la password. Le route registri meccanici e trattamenti usano un client service-role, ma ora verificano esplicitamente l'accesso al `garden_id` sia in lettura sia in scrittura, preservano le risposte canoniche 404 per risorse altrui e non espongono dettagli DB nei 500. Le righe e il pattern delle ricorrenze calendario sono tipizzati con il contratto operativo Europe/Rome.

Durante la selezione, i quattro warning delle route `api-configurations` sono stati lasciati intatti: la chiave provider viene soltanto codificata Base64, poi decodificata e restituita al browser per l'uso negli adapter client. Il problema e' ora registrato come `O48/M13` e richiede cifratura, migrazione/rotazione e proxy server-side, non una pulizia meccanica.

Baseline globale verificata: **0 errori, 1.953 warning** (`1.963 -> 1.953`); test sicurezza 43/43, lint mirato e type-check verdi.

### Aggiornamento T01 - lotto 30 (28/07/2026)

Il lotto 30 porta a zero warning sette endpoint Production: le tre varianti derivate di esposizione solare (`seasonal-windows`, `plant-suggestions`, `planting-windows`), analytics professionali, ricerca e tassonomia piante e il record blockchain lab-only. Le tre route solari non ignorano piu' il fallimento della lettura `garden_obstacles`: senza ostacoli autorevoli restituiscono `garden_obstacles_read_failed`, invece di calcolare finestre e suggerimenti assumendo silenziosamente zero ostacoli. La regressione fail-closed copre ora tutte e quattro le route del gruppo. Gli endpoint di sola lettura non espongono piu' messaggi interni del database nei 500; dal payload blockchain e' rimossa la variabile `plantId` mai utilizzata, senza modificare il contratto 501 lab-only.

Le route AI e crediti emerse nella stessa classifica restano escluse da questo lotto: dopo la risposta del provider chiamano `deduct_credits` e inseriscono il ledger come operazioni separate, e diversi handler non verificano gli errori restituiti. La loro chiusura richiede un intervento dedicato sull'integrita' della quota tecnica, non la sola sostituzione del `catch (error: any)`.

Baseline globale verificata: **0 errori, 1.946 warning** (`1.953 -> 1.946`); test persistenza 65/65, lint mirato e type-check verdi.

### Aggiornamento T01 - lotto 31 / O49 (28/07/2026)

Il lotto 31 chiude il difetto transazionale delle quote tecniche AI emerso nel lotto 30 e porta a zero warning le route `ai/chat`, `ai/diagnose`, `ai/generate`, `ai/recipe`, `credits/deduct` e `credits/status` (7 warning complessivi). Prima, detrazione e ledger erano due operazioni separate; quattro route ignoravano entrambi gli errori e potevano restituire successo senza quota o audit aggiornati. L'endpoint generico accettava inoltre dal client un costo arbitrario e, senza Supabase, gli endpoint credito inventavano un saldo `999`.

La migrazione `20260728050000_atomic_ai_credit_consumption.sql` aggiunge la RPC `consume_ai_credits`: update condizionale del saldo e insert del ledger avvengono nella stessa transazione; il valore rimanente e' restituito dall'update autorevole. L'esecuzione e' revocata a `PUBLIC`, `anon` e `authenticated` e concessa soltanto al `service_role`; la vecchia `deduct_credits` viene parimenti sottratta ai client. Tutte le route usano un adapter server condiviso, trasformano l'esaurimento concorrente in `402`, gli altri fallimenti in `500`, e derivano il costo dal catalogo `CREDIT_COSTS`.

La migrazione e' stata applicata e registrata nella Production unica con versione `20260728050000`. Verifica remota indipendente: select delle nuove colonne `feature,metadata` `HTTP 200`; invocazione anon della RPC `HTTP 401`, codice PostgreSQL `42501 permission denied`. Test sicurezza 48/48, lint mirato e type-check verdi.

Baseline globale verificata: **0 errori, 1.939 warning** (`1.946 -> 1.939`). L'audit storico M06 resta coerentemente `safeToApply=false` per il debito preesistente di history e non viene falsamente chiuso da questa migrazione puntuale.

### Aggiornamento T01 - lotto 32 (28/07/2026)

Il lotto 32 porta a zero warning la route viva `app/app/advice/page.tsx` e il
wizard vivo `components/crops/CreateOrchardWizard.tsx`, per una riduzione
complessiva di 16 warning. La pagina Consigli usa ora i contratti reali di task
e rotazione e un loader con dipendenze complete.

Nel wizard la tipizzazione ha scoperto che categorie frutteto, tipo vigneto e
sistema di allevamento venivano inoltrati ai servizi con gli enum della UI,
incompatibili con gli enum persistiti. Aggiunto un mapping totale e testato:
ogni categoria frutteto produce un `OrchardType` valido; `WINE`/`TABLE` e i
sistemi di allevamento vengono normalizzati al contratto vigneto, usando
`other` per le scelte non rappresentate puntualmente.

Baseline globale verificata: **0 errori, 1.923 warning** (`1.939 -> 1.923`);
lint mirato e type-check verdi; regressione mapping 2/2.

### Aggiornamento T01 - lotto 33 / O50 (28/07/2026)

Il lotto 33 porta a zero warning `AddItemModal.tsx`,
`QuickActions.tsx` e la route viva di modifica filari, per una riduzione di 8
warning. I select del filare usano le union reali di orientamento, irrigazione
e frequenza.

Durante la selezione sono state trovate quattro navigazioni vive verso
`/app/progress`, route non esistente: due comandi di registrazione raccolto, un
accesso ai raccolti e il riquadro traguardo. O50 e' chiuso convergendo le azioni
su `/app/harvest`; `?action=add` apre davvero `HarvestRegistrationModal`. Il
riquadro traguardo resta informativo e non mostra piu' una falsa affordance di
navigazione. Una regressione capability verifica l'assenza della route rimossa
nei consumer e il contratto di apertura del modal.

Baseline globale verificata: **0 errori, 1.915 warning** (`1.923 -> 1.915`);
lint mirato e type-check verdi; capability 20/20.

### Aggiornamento T01 - lotto 34 / O51 (28/07/2026)

La route viva `app/app/analytics/page.tsx` e' stata portata da 7 warning a
zero. La pulizia ha scoperto KPI presentati come Business Intelligence anche a
dataset vuoto: 24 piante, 15,6 kg, 120 L, 8,5 kg CO2, efficienza 87,5%,
risparmio 450 euro, ROI 180%, 12 ore, oltre a trend, resa, ciclo e utilizzo
risorse hardcoded.

O51 e' chiuso con il builder puro `operationalStats.ts`: task e raccolti sono
filtrati davvero per mese/trimestre/anno; peso, completamento, semine/trapianti
e durate derivano solo dai record persistiti. ROI, risparmio, acqua, CO2,
automazione e metriche prive di baseline restituiscono `null` e la UI mostra
`n/d` con la causa. Il precedente “Costo/kg”, che mostrava in realta' un prezzo
di vendita adattivo, e' stato rinominato correttamente.

Baseline globale verificata: **0 errori, 1.908 warning** (`1.915 -> 1.908`);
lint mirato e type-check verdi; capability 22/22.

### Aggiornamento T01 - lotto 35 / O52 (28/07/2026)

La route viva `app/app/garden/zones/page.tsx` e
`services/landZoneService.ts` sono stati portati da 10 warning a zero. Tipi
espliciti sostituiscono gli `any` per statistiche, memoria e filari; i loader
React hanno dipendenze complete.

La selezione ha scoperto che `Storico` era un pulsante morto: impostava
`selectedZoneForHistory`, ma nessun componente leggeva quello stato. O52 lo
collega alla RPC persistita `get_zone_history` e presenta in un dialogo i cicli
colturali reali, con stati distinti per caricamento, errore e memoria vuota.

Baseline globale verificata: **0 errori, 1.898 warning** (`1.908 -> 1.898`);
lint mirato e type-check verdi; capability 23/23.

### Aggiornamento T01 - lotto 36 / O53 (28/07/2026)

La route viva Nutrizione e il widget delle statistiche Bio/Tradizionale sono
stati portati da 13 warning a zero. Il wizard interno mai renderizzato,
duplicato del `TreatmentPlanner`, e i due rami `schedule` irraggiungibili sono
stati rimossi.

Il widget non riceve piu' due array vuoti costanti: carica
`treatment_register` e `fertilizer_inventory` tramite lo storage provider. Il
calcolo puro classifica i record con gli enum persistiti; dataset vuoto
restituisce percentuali `null`/`n/d`, mentre errori di lettura non vengono
trasformati in zeri apparentemente autorevoli.

Baseline globale verificata: **0 errori, 1.885 warning** (`1.898 -> 1.885`);
lint mirato e type-check verdi; capability 25/25.

### Aggiornamento T01 - lotto 37 / O54 (28/07/2026)

La route viva Lavorazioni meccaniche e' stata portata da 16 warning a zero e
ricondotta al registro persistente. Rimossi i due lifecycle locali di
attrezzature e lavorazioni programmate, i cui loader restituivano sempre `[]`
e i cui salvataggi sparivano al reload; rimossi anche i comandi privi di
handler per modifica, uso, calendario ed export.

Restano il flusso reale `createMechanicalWork`, il registro
`getMechanicalWorks`, la selezione orto e il resume dei task. Il builder
analytics calcola conteggio, superficie e tipi attrezzatura dai record; il
costo mensile e' `null` senza `standardCost`. Non vengono piu' mostrate ore,
carburante, efficienza e trend fissati a zero.

Baseline globale verificata: **0 errori, 1.869 warning** (`1.885 -> 1.869`);
lint mirato e type-check verdi; capability 28/28.

### Aggiornamento T01 - lotto 38 / O55 (28/07/2026)

La route viva Irrigazione e' stata portata da 17 warning a zero. Rimossi
quattro KPI hardcoded, tre zone campione datate 2024, due componenti interni
mai renderizzati e i tab Analytics/Programmazione che terminavano in un
messaggio di sviluppo.

Dashboard, gestione zone, sistemi e registrazione irrigazione restano sui
servizi persistenti. Il click zona non esegue piu' un `console.log`, ma apre i
sistemi filtrati; i pulsanti opzionali del dashboard vengono mostrati solo
quando la pagina fornisce un handler reale. Il contratto dei log sostituisce
l'`any`, con regressione sui percorsi singolo e batch.

Baseline globale verificata: **0 errori, 1.852 warning** (`1.869 -> 1.852`);
lint mirato e type-check verdi; capability 31/31.

### Aggiornamento T01 - lotto 39 / O56 (28/07/2026)

La route viva Frutteto e' stata portata da 24 warning a zero. Tutti gli alberi,
i gruppi filare e gli helper di riallineamento usano il tipo reale
`OrchardTree`, mantenendo invariati i flussi persistenti.

Rimosso `TropicalExoticSection`, componente interno di 347 righe mai importato,
invocato o renderizzato: conteneva catalogo tropicale statico, KPI fissi
`24°C`/`75%` e un modal a cui nessun utente poteva accedere. Dashboard,
alberi, filari, piante individuali, potature, raccolte e analytics restano
raggiungibili.

Baseline globale verificata: **0 errori, 1.828 warning** (`1.852 -> 1.828`);
lint mirato e type-check verdi; mapping frutteto/sicurezza filari 3/3,
capability 31/31 e build produzione 153/153.

### Aggiornamento T01 - lotto 40 / O57 (28/07/2026)

Su decisione prodotto, le colture tropicali non sono un modulo parallelo ma
una sottocategoria reale di Frutteto. Il contratto `OrchardType` e il vincolo
database ammettevano gia' `tropical`; mancavano la scelta nel wizard principale
e la sincronizzazione con la categoria botanica `ESOTICHE`.

Il wizard ora mantiene coerenti le due rappresentazioni in entrambe le
direzioni e ripulisce la classificazione tropicale quando si torna a una
categoria classica. La dashboard rende `Frutteto tropicale/subtropicale` con
icona dedicata. Non vengono reintrodotti cataloghi, temperature, umidita' o
altri valori statici del vecchio prototipo.

Baseline globale verificata: **0 errori, 1.824 warning** (`1.828 -> 1.824`);
lint mirato e type-check verdi; mapping categoria 5/5, capability 31/31 e build
produzione 153/153.

### Aggiornamento T01 - lotto 41 / O58 (28/07/2026)

`services/orchardService.ts`, servizio vivo di tutte le funzioni Frutteto, e'
stato portato da 33 warning a zero. I mapper database hanno ora contratti
snake_case derivati dai tipi dominio; errori e righe bulk non usano piu'
`any`. Il parametro analytics `period`, privo di chiamanti e ignorato dalla
query, e' stato rimosso senza attribuirgli una semantica arbitraria.

La pulizia ha corretto il bulk alberi del wizard: prima costruiva
`orchard_id`/`garden_id` e passava il risultato a un metodo che si aspetta
`orchardId`/`gardenId`, con rischio di insert senza scope. Il builder puro usa
il contratto `OrchardTree`, richiede scope e identita' reali prima dell'insert
e non genera nomi di fallback. Se il bulk fallisce, elimina la configurazione
appena creata; se fallisce anche la compensazione espone entrambi gli errori.
Cinque regressioni coprono payload, identita', scope, ordine di validazione e
rollback.

Baseline globale verificata: **0 errori, 1.791 warning** (`1.824 -> 1.791`);
lint mirato e type-check verdi; persistenza 75/75, capability 31/31 e build
produzione 153/153.

## 6. Verifica trasversale dopo M15

Eseguita il 24/07/2026 sulla baseline locale:

- audit debito release corrente: 104 voci, di cui 81 pianificate, 13 accettate e 10 isolate; nessuna voce release non classificata e zero voci M09-M12;
- audit migrazioni: `safeToApply=false`, coerente con il blocco M06;
- suite release: 355/355 test superati;
- build produzione: completata, 147 pagine generate;
- rischio remoto invariato: queste prove non sostituiscono staging, restore drill, pilot o provider reali.

## 7. Prossima azione

Riprendere dal primo lavoro locale non bloccato:

1. predisporre staging (`O06`) per sbloccare M03-M04 e M06-M09;
2. implementare M10 (`O19-O24`);
3. proseguire M11 e identificare gli owner esterni di M12-M14;
4. progettare e implementare M15;
5. eseguire M16 soltanto quando `O01-O43` sono chiusi o formalmente esclusi dalla release.

## 8. Deploy in produzione 24/07/2026 (decisione esplicita, gate O06 non soddisfatto)

Il 24/07/2026, su decisione esplicita dell'utente, il lavoro M01-M09 (branch `agent/completion-roadmap-m01-m09`, commit `2b2afaa`) e' stato portato in produzione senza attendere lo staging previsto da O06:

- **Codice:** fast-forward pulito (`main` era ancestor di `2b2afaa`, nessun conflitto) e push su `origin/main` (`8c37854..2b2afaa`); il deploy Vercel si attiva dall'integrazione GitHub standard su push a `main` e non e' stato verificato direttamente da questa sessione (nessun tool Vercel disponibile).
- **Database:** le 8 migrazioni nuove sono state applicate direttamente al progetto Supabase di produzione (`qhmujoivfxftlrcrluaj`), in ordine: `create_macerate_logs`, `land_zones_garden_ownership`, `garden_soil_states`, `notification_delivery_lifecycle`, `task_transition_ledger`, `link_custom_plans_to_tasks`, `season_adjustment_decisions`, `archive_completed_garden_tasks`. Verifica pre-applicazione: nessuna riga orfana in `land_zones` (query diretta, 0 risultati) prima di imporre `NOT NULL` su `garden_id`. Verifica post-applicazione: tutte e 8 presenti in `list_migrations`; `get_advisors(security)` non segnala nulla di nuovo oltre un WARN atteso (`transition_garden_task` raggiungibile da `anon` via RPC, ma la funzione stessa richiede `auth.uid()` non nullo e solleva `authentication_required` altrimenti — difesa interna gia' presente, non una falla).
- **Rischio esplicitamente accettato:** nessuno staging isolato ha mai validato queste migrazioni (O06-O08 restano aperti); nessun restore drill (O10-O12) le copre; se una di queste emergesse come difettosa in produzione, il rollback non e' stato provato.
- **Non cambia:** il resto del registro O01-O44 (M10-M16) resta nello stato descritto sopra. Questo deploy porta in produzione la convergenza provider M09 e le migrazioni M03/M04, non chiude M06-M08 ne' alcuna milestone successiva.
