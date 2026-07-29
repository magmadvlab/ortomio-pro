# OrtoMio Pro - Piano master di completamento

- **Versione:** 1.2
- **Data di apertura:** 24 luglio 2026
- **Repository:** `magmadvlab/ortomio-pro`
- **Branch di lavoro iniziale:** `claude/migrations-feature-flags-cd3c51`
- **Baseline iniziale:** `8c37854f51b93585720e6c54e1a84b8b1c7c6879`
- **Stato generale:** in corso; prodotto non ancora certificato per la release commerciale 1.0
- **Stato esecuzione:** 2 milestone chiuse per la release (M01-M02); 13 dei 44 obiettivi originali chiusi, 5 parziali e 26 ancora dipendenti da prove remote o input esterni; M16 eseguita con decisione NO-GO motivata il 26/07/2026
- **Deploy codice Production:** `Ready` — ultimo avanzamento verificato in Production: PR `#96`, merge commit `14069cccb79f4d0dbf2090ac58e7dbae6697b2d3`, 28/07/2026.
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

## 2.2 Cruscotto operativo corrente - 28 luglio 2026

Questa e' la vista da usare per capire dove siamo e quanto manca. I 44
obiettivi originali e le scoperte successive sono conteggiati separatamente:
un nuovo problema non modifica retroattivamente il denominatore O01-O44.

| Perimetro | Chiuso | Parziale | Aperto | Lettura corretta |
|---|---:|---:|---:|---|
| Piano originale O01-O44 | **13** | **5** | **26** | I 13 chiusi sono O02, O04, O16-O17, O19-O22, O24-O26, O40 e O44. O38-O39 e O41-O43 hanno codice/schema in Production ma attendono E2E. |
| Scoperte O45-O67 | **14** | **0** | **9** | Sono aperti O48 (sicurezza credenziali provider), O60 (fonti dati pianta/suolo e resa attesa in `prescriptionMapsService.ts`), O61 (segnali agronomici estesi mai popolati in `advancedIrrigationService.ts`), O62 (sotto-sistema lettura/aggregazione irraggiungibile e con mappature errate in `unifiedOperationsService.ts`), O63 (colonne `irrigation_zones` assenti su Production, evidenza concreta del drift M06), O64 (motore ottimizzazione costi interamente mock in `costOptimizationService.ts`, dichiarato in UI ma mai implementato), O65 (raccolti non attribuibili a un filare in `fieldRowPredictiveService.ts`, `HarvestLogData` privo di `fieldRowId`/`plantId`), O66 (accettare un suggerimento AI nel Planner non crea mai i task corrispondenti, manca una mappatura suggerimento->task) e O67 (`zoneManagementService.ts` interroga tabelle inesistenti e riceve il tipo client sbagliato, "Analizza zona" fallisce silenziosamente in produzione). Le altre 14 scoperte sono chiuse e pubblicate. |
| Debito lint T01 | **1.576 warning rimossi** | — | **1.066 warning** | Baseline operativa 2.642 -> 1.066 in 71 lotti. T01 non equivale a 1.066 funzionalita': ogni lotto distingue pulizia sicura da nuovi gap di prodotto. |
| Milestone release M01-M16 | **2 release-ready** | **9 locali/parziali** | **4 bloccate + M16 NO-GO** | M16 e' stato eseguito, ma il suo esito resta NO-GO finche' le prove mancanti non sono raccolte. |

### Che cosa manca davvero negli O01-O44

I **26 obiettivi originali aperti** non sono altri 26 moduli da costruire:

- **16 richiedono un ambiente/prova remota:** O01, O03, O06-O15, O18, O23,
  O27 e O28. Riguardano staging isolato, migrazioni, restore, RLS,
  delivery provider e giornata operativa;
- **10 richiedono una decisione o un soggetto esterno:** O05 e O29-O37.
  Riguardano pilot reale, scelta Sentinel/ThingsBoard, dataset shadow,
  metriche e firma agronomica;
- i **5 parziali** O38-O39 e O41-O43 richiedono prove lifecycle E2E su due
  aziende e un provider inviti reale; l'implementazione e lo schema sono gia'
  in Production.

Con il piano Supabase Free non esiste oggi uno staging isolato con backup
provider. Applicare migrazioni direttamente in Production ha pubblicato il
codice, ma non ha prodotto le evidenze di staging/restore richieste per
chiudere O01, O03 e O06-O15. Questi ID non verranno fatti passare per chiusi.

### Coda eseguibile senza attendere soggetti esterni

1. **T01:** selezionare il prossimo servizio vivo dalla classifica lint; ogni
   gap funzionale riceve un ID distinto e una prova, senza essere nascosto
   come lint. O59 e' chiuso in Production.
2. **O48 sicurezza provider:** cifratura autenticata, rotazione e chiamate
   esclusivamente server-side; la chiusura finale dipende poi dalle
   credenziali del provider scelto in O31.
3. **Decisioni di prodotto gia' diagnosticate:** offset panoramica, export UTM,
   storico registrazioni e motori M14; entrano nel registro prima di essere
   implementati o esclusi.
4. **Prove remote appena esiste il target:** O01/O03, poi O06-O15, O18, O23,
   O27-O28 e infine gli E2E O38-O43.
5. **Pilot e validazione:** O29-O37; al termine si riesegue M16 per ottenere
   un GO oppure un nuovo NO-GO motivato.

Il prossimo traguardo tecnico non e' “finire un altro numero di lotto”, ma
esaurire la coda locale verificabile senza aumentare la coda nascosta. Il
traguardo di release resta invece la chiusura documentata delle prove remote
e la riesecuzione M16.

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
- **Scoperta 24/07/2026 durante T01 lotto 6, chiusa 29/07/2026 nel T01 lotto 59:** `components/GardenOnboarding.tsx::analyzePanoramicPhotoWithOffset` riceveva un `offset` di calibrazione Nord (calcolato tramite orientamento dispositivo, EXIF o calibratore manuale a bussola in `handlePanoramicPhotoChange`) ma non lo usava mai — passava solo la foto a `analyzePanoramic360(base64)` (`services/photoAnalysisService.ts:297`), la cui firma non accettava un offset. **Decisione dell'utente il 24/07 sera: non toccarlo in quella sessione** (ha scelto di collegare invece il wizard "input visivo" nello stesso file, vedi T01 lotto 6); **riaperto e chiuso su decisione esplicita dell'utente nel lotto 59**: `analyzePanoramic360` accetta ora `northOffsetDegrees` opzionale e ruota `aspectDirection`/`exposureByDirection`/direzione ostacoli dal sistema di riferimento della foto a quello reale; `GardenOnboarding.tsx` passa l'offset invece di scartarlo. Verificato che `services/obstacleExtractor.ts`, secondo consumer di `analyzePanoramic360`, applicava gia' una correzione equivalente in autonomia e non e' stato impattato (firma retrocompatibile, default `0`).
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
| O59 | M09 | ~~Convergere il servizio alberelli vivo sul solo contratto `sapling_batches`/`sapling_items` e rendere atomiche creazione, resize, stato e messa a dimora~~ **Chiuso 28/07/2026:** migrazione `20260728070000` applicata e registrata dopo inventario del drift reale; history/tabelle/quattro RPC/RLS/permessi verdi, `batches_without_items=0`. PR #96 unita (`14069cc`) e deploy Vercel Production verde. | Schema e codice Production coerenti; zero ID o dati inventati; creazione/resize/stato/planting atomici; errori distinti dal dataset vuoto; regressioni verdi |
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
| O60 | M09/M14 | **Scoperto 28/07/2026 durante T01 lotto 43, `services/prescriptionMapsService.ts` (vivo su `/app/prescription-maps`):** `getPlantLevelData`/`getSoilData` ignorano `gardenId`/`bounds`/date e restituiscono sempre `[]`, per cui i pesi `plantHealthWeight`/`soilWeight` configurabili dall'utente non hanno mai effetto sulla mappa prescrittiva; `expectedYieldIncrease = 0.15` e' una costante di resa non validata usata per proiettare `expectedRevenue`; `clusters[i].confidence = 0.8` sovrascrive con un valore fisso la confidence reale calcolata per punto, mostrata come `dataQuality`/confidenza in UI. Nessuna azione presa: richiede provider dati pianta/suolo reali (non esistenti oggi, a differenza di NDVI che ha `ndvi_data_cache`) e una decisione agronomica sul valore di resa attesa, non una correzione meccanica. | Fonti dati pianta/suolo reali o capability nascosta esplicitamente; nessuna confidence/KPI di business fissa mostrata come misura reale |
| O63 | M06 | **Scoperto 29/07/2026 in Production, segnalato dall'utente dalla console reale, non durante un lotto T01:** `GET .../irrigation_zones?select=id,drainage_quality,water_retention,slope_percentage,soil_type&garden_id=eq...` restituisce `400 Bad Request`. Le quattro colonne sono definite nella migrazione locale `20260117010000_create_advanced_irrigation_system.sql` ma, coerentemente con il blocco M06 gia' tracciato (`safeToApply=false`, nessuno staging), risultano assenti sullo schema Production reale - evidenza concreta e riproducibile del drift generico gia' descritto in M06, non un difetto isolato. Interessa almeno `buildNutritionWaterQualityInsight` in `services/advancedNutritionService.ts` (query diretta) ed e' probabile che coinvolga altri consumer delle stesse colonne. **Verificato nella stessa sessione che `compute-field-alerts` (422) non e' un bug**: la edge function rifiuta di proposito il calcolo quando il garden non ha coordinate geografiche (comportamento fail-closed atteso). Nessuna correzione qui: la chiusura appartiene alla sequenza remota O06-O09 di M06 (dump schema, riconciliazione, applicazione controllata), non a un fix puntuale. | Le quattro colonne esistono sullo schema Production e la query restituisce `200`, oppure il codice che le richiede viene esplicitamente adattato allo schema reale con dichiarazione del gap |
| O62 | M05/M09 | **Scoperto 28/07/2026 durante T01 lotto 47, `services/unifiedOperationsService.ts`:** la meta' "lettura e aggregazione" della classe (`getUnifiedOperations`, `getOperationStatistics` e sette helper privati) non ha alcun chiamante esterno nel repository - solo `executeUnifiedOperation` e i suoi helper di esecuzione sono raggiunti. Indipendentemente dalla raggiungibilita', `readWateringLogs`/`readFertilizerLogs`/`readMechanicalWorks` leggono nomi di campo (`amount`, `quantity`, `waterAmount`, `duration_minutes`, `machine_name`) assenti sui tipi database reali (`WateringLog.litersApplied`, nessuna durata su `MechanicalWorkRecord`): se mai collegato a una UI, quantita'/unita' risulterebbero quasi sempre vuote. Due metodi (`getLatestSyncLog`, `getPlantOperationsBySource`) sono stub che restituiscono sempre `null`/`[]`. Nessuna correzione: decidere la mappatura corretta e se riattivare questo sotto-sistema e' una decisione di prodotto, non di tipizzazione. | Sotto-sistema riattivato con mappature verificate contro i tipi reali, oppure rimosso come codice morto in M05 |
| O66 | M09 | **Scoperto 29/07/2026 durante T01 lotto 57, `components/planner/tabs/PlannerAISuggestions.tsx` (vivo su `/app/planner`):** accettare un suggerimento AI di tipo `PLANTING_PLAN`/`HARVEST_TIMING`/`ROTATION_PLAN` chiama solo `collaborativeAIService.acceptSuggestion` (che registra la decisione) ma non invoca mai `onCreateTasks`, la prop passata da `app/app/planner/page.tsx` con un'implementazione reale (`storageProvider.createTask` per ogni task). Verificato che non esiste nel codebase alcuna conversione suggerimento -> task: `AISuggestion.suggested_parameters` e' un `Record<string, unknown>` generico senza schema fisso per tipo di suggerimento, mostrato come coppie chiave/valore grezze anche in `components/ai/AISuggestionCard.tsx` (nessun precedente di parsing strutturato altrove). Nessuna correzione presa: mappare ogni tipo di suggerimento a task concreti (che taskType, quale data, quale pianta) e' una decisione agronomica/di prodotto da progettare, non un collegamento meccanico - esplicitamente rifiutato come fix rapido dall'utente in favore della registrazione. | Ogni tipo di suggerimento ha una mappatura dichiarata verso task concreti e `onCreateTasks` viene invocato all'accettazione, oppure la limitazione (accettare registra solo la decisione, non crea task) viene dichiarata esplicitamente in UI |
| O65 | M09 | **Scoperto 29/07/2026 durante T01 lotto 52, `services/fieldRowPredictiveService.ts` (vivo su `/app/garden/rows`):** `predictYield` filtra `operations.filter(op => op.type === 'harvest')` per costruire lo storico raccolti da passare al modello di previsione resa, ma `loadRecentOperations` non chiama mai `getHarvestLogs` - carica solo fertilizzazioni, trattamenti e irrigazioni. Anche collegandolo, l'attribuzione al filare giusto non sarebbe comunque possibile: `HarvestLogData` (in `types.ts`) non ha ne' `fieldRowId` ne' `plantId`, solo `taskId` e `plantName` (stringa libera). A differenza delle fertilizzazioni/trattamenti (normalizzati nello stesso lotto: `applicationDate`/`field_row_id`/`treatment_date` mappati sui nomi attesi dalla pipeline), qui manca proprio il collegamento nello schema, non solo la chiamata. Nessuna correzione presa: collegare `getHarvestLogs` con un'euristica di corrispondenza per nome coltura (non un vero ID di riga) e' stato esplicitamente rifiutato dall'utente come soluzione parziale/fuorviante. Decidere se aggiungere `fieldRowId`/`plantId` allo schema harvest (richiede migrazione) o accettare che la previsione resa dei filari resti senza storico raccolti reale e' una decisione di prodotto. | `HarvestLogData` porta un collegamento reale al filare (o alla pianta) e `predictYield` riceve storico raccolti vero per il filare, oppure la limitazione viene dichiarata esplicitamente in UI |
| O64 | M09/M14 | **Scoperto 29/07/2026 durante T01 lotto 51, `services/costOptimizationService.ts` (vivo via `CostOptimizationPanel.tsx` -> `PrescriptionMapsDashboard.tsx`, route `/app/prescription-maps`):** l'intero motore di ottimizzazione costi (genetico, simulated annealing, particle swarm, gradient descent, Pareto frontier multi-obiettivo, stato di avanzamento realtime) e' mock end-to-end, non solo su un singolo calcolo. `evolvePopulation` e' un no-op dichiarato "Simplified" che non fa mai selezione/crossover/mutazione; `runParticleSwarmOptimization`/`runGradientDescent` restituiscono `solution: {}` con quality score fissi scritti a mano; `calculateExpectedYield`/`calculateOptimizedCost`/i quattro `calculateSolution*` restituiscono sempre la stessa costante (`4.2`, `2340`, ecc., tutti commentati `// Mock value`); `getRealTimeOptimizationStatus` restituisce sempre lo stesso progresso finto (65%, costo 2340) a prescindere dall'`optimizationId` richiesto, perche' `runRealTimeOptimization` e' un corpo vuoto ("This would run in background..."). A differenza di O60 (stesso file `prescriptionMapsService.ts`, dati mai collegati ma presentati come reali), qui la natura dimostrativa e' gia' dichiarata esplicitamente: `CostOptimizationPanel.tsx` mostra un banner "Valori dimostrativi" che avverte l'utente di non usare questi numeri per decisioni operative. Nessuna azione presa nel lotto 51 (solo pulizia lint, comportamento identico): implementare un motore reale richiede (1) un algoritmo di ottimizzazione vero, non solo tipizzato, (2) un provider di dati resa/costo per coltura e zona - stessa lacuna gia' registrata in O60, non esistente oggi nel sistema - e (3) una decisione agronomica sulla curva di risposta costo/resa da usare, non una correzione meccanica. | Motore di ottimizzazione collegato a dati costo/resa reali e a un algoritmo che converge davvero, oppure la capability rimossa/mantenuta esplicitamente come solo dimostrativa senza pretesa di essere abilitata in futuro |
| O61 | M13/M14 | **Scoperto 28/07/2026 durante T01 lotto 43, `services/advancedIrrigationService.ts` (vivo su `/app/irrigation`):** `getAvailableAgronomicSignals`/`calculateAgronomicConfidenceLevel`/`buildAgronomicReasoning` verificano la disponibilita' di segnali agronomici estesi (umidita' suolo a 10/30/60cm, umidita' fogliare, VPD, punto di rugiada, temperatura chioma, portata/pressione linea, osservazione fenologica, risultato qualita', riferimento registro operazioni, NDVI, vigore satellitare) per pesare la confidenza del fabbisogno idrico calcolato. Con gli unici chiamanti attuali, l'oggetto passato e' sempre di tipo `WeatherData` (temperatura/umidita'/vento/radiazione/pioggia/qualita' acqua): nessuno di quei segnali estesi viene mai popolato, quindi i rami restanti sono strutturalmente irraggiungibili e la confidenza per le colture con segnali P0 in quelle categorie e' sistematicamente penalizzata. Nessuna azione presa: NDVI esiste gia' altrove (`ndvi_data_cache` in `prescriptionMapsService.ts`) ma non e' collegato qui; gli altri segnali (sensori suolo a profondita', umidita' fogliare, fenologia) potrebbero non avere alcuna fonte dati nel sistema. Decidere quali segnali collegare, da quale provider, e se il resto va rimosso come aspirazionale e' una decisione agronomica/di prodotto, non di tipizzazione. | Ogni segnale controllato ha una fonte dati reale collegata oppure viene rimosso dal calcolo; nessun ramo di confidenza strutturalmente morto |
| O67 | M06/M09 | **Scoperto 29/07/2026 durante T01 lotto 69, `services/zoneManagementService.ts` (vivo via `components/prescription/ZoneManagementPanel.tsx` -> `PrescriptionMapsDashboard.tsx`, route `/app/prescription-maps`):** la classe interroga tabelle `zones`, `zone_fields` e `zone_rows` assenti in qualunque migrazione del repository (verificato con grep ricorsivo su `supabase/migrations/`; la tabella reale e' `land_zones`, creata in `20260204120000_add_land_zones_and_soil_memory.sql`). Il costruttore riceve inoltre `storageProvider` (`IStorageProvider`, l'astrazione di dominio usata ovunque nel progetto) ma il corpo chiama `this.supabase.from(...)` come un client Postgrest grezzo — `IStorageProvider` non espone alcun metodo `.from`. Il metodo pubblico `analyzeZone()` e' realmente invocato dal pannello live (`ZoneManagementPanel.tsx:129`): ogni "Analizza zona" cliccata da un utente reale fallisce silenziosamente (catturato da un try/catch che logga e rilancia). Nessuna correzione presa: serve rimappare l'intero servizio sullo schema `land_zones` reale (tabelle, colonne) e sostituire l'iniezione con un vero client Supabase o i metodi `IStorageProvider` equivalenti — una sessione dedicata, non un fix di lint. | Il servizio legge/scrive sulle tabelle reali dello schema Production e "Analizza zona" produce un risultato o un errore esplicito dichiarato, non un fallimento silenzioso |
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

### Aggiornamento T01 - lotto 42 / O59 (28/07/2026)

`services/saplingService.ts` passa da 19 warning a zero e converge sul solo
backend canonico `sapling_batches`/`sapling_items`. La pulizia ha eliminato
fallback tra tre schemi, quantita' `0` risuscitate tramite `||`, date/quantita'
inventate, ID planting generati nel browser e fallimenti di lettura presentati
come dataset vuoti.

La migrazione `20260728070000_canonical_sapling_persistence.sql` introduce RPC
atomiche per batch+items, resize, stato e messa a dimora, oltre al timeline foto
con RLS. Anche i 3 warning residui della dashboard viva sono stati chiusi;
type-check, regressione O59 5/5 e persistenza 80/80 sono verdi.
Baseline globale: **0 errori, 1.768 warning** (`1.791 -> 1.768`).

Il primo invio Production e' stato interamente annullato dalla transazione
perche' `sapling_items` non esisteva nello schema remoto, evidenziando il drift
rispetto al file storico locale. Dopo l'inventario, la migrazione finale ha
esteso e backfillato il `sapling_batches` legacy senza eliminare dati, creato
items/timeline e mantenuto sincronizzati i campi legacy. Versione
`20260728070000` registrata; probe indipendente:
history/tabelle/quattro RPC/RLS/permessi tutti verdi e
`batches_without_items=0`. PR #96 unita in `main` (`14069cc`) e deploy Vercel
Production verde: O59 e' chiuso.

### Aggiornamento T01 - lotto 43 (28/07/2026)

Durante la selezione del prossimo candidato vivo e' stato esaminato
`services/prescriptionMapsService.ts` (33 warning, vivo su
`/app/prescription-maps` e consumato anche da `directorService.ts`). L'analisi
ha confermato un gap funzionale, non un semplice debito lint, con lo stesso
pattern gia' visto su `fieldRowPredictiveService.ts` (lotto 27): `getPlantLevelData`
e `getSoilData` ignorano `gardenId`/`bounds`/date e restituiscono sempre `[]`,
per cui i pesi configurabili `plantHealthWeight`/`soilWeight` non hanno mai
alcun effetto sulla mappa prescrittiva generata; `expectedYieldIncrease = 0.15`
(15%) e' una costante di business non validata usata per proiettare
`expectedRevenue` come se fosse una stima reale; `clusters[i].confidence = 0.8`
sovrascrive con un valore fisso la confidence realmente calcolata per punto,
poi mostrata come percentuale di `dataQuality`/confidenza nella UI. **File
escluso da questo lotto e registrato come nuovo gap aperto (`O60`, vedi
registro §5.1)**, coerentemente con la regola anti-riapertura: nessuna
implementazione e' stata scritta qui in attesa di una decisione esplicita
sull'origine dei dati pianta/suolo e sul valore di resa attesa.

Il lotto 43 e' stato eseguito sul candidato successivo in classifica,
`services/advancedIrrigationService.ts` (vivo in `/app/irrigation`, usato
anche da `directorService.ts`), da 31 warning a zero: rimossi 4 import di tipi
mai usati (`IrrigationSensor`, `SensorReading`, `IrrigationAlert`,
`SystemStatus` — funzionalita' di allerta/stato sistema non ancora
implementate, gia' onestamente rappresentate da array vuoti con commento
esplicito, non un gap nuovo) e tipizzati tutti i 27 `any` con contratti
snake_case derivati dai tipi dominio (`DatabaseRow<T>`, stesso pattern gia'
introdotto in `orchardService.ts` nel lotto 41) o con interfacce raw dedicate
dove il file appiattisce oggetti di configurazione annidati (sistema, log,
schedulazione, fabbisogno idrico). La tipizzazione ha scoperto e corretto un
difetto reale: `getIrrigationZones` restituiva, nel ramo con sistemi
associati, righe grezze snake_case al posto di `IrrigationSystem[]` mappati —
non visibile oggi perche' l'unico consumer legge solo `.length`, ma avrebbe
prodotto `undefined` su qualunque campo camelCase letto in futuro; corretto
applicando `mapSystemFromDatabase` anche in quel ramo. Introdotta inoltre
`AgronomicSignalInputData`, l'interfaccia reale (superset di `WeatherData`)
gia' attesa da `getAvailableAgronomicSignals`/`calculateAgronomicConfidenceLevel`
per segnali estesi (umidita' suolo a piu' profondita', umidita' fogliare,
VPD, NDVI, vigore satellitare, ecc.): la tipizzazione mostra che, con gli
attuali chiamanti, quei segnali non sono mai popolati e i rami restano
strutturalmente irraggiungibili, penalizzando sistematicamente la confidenza
per le colture con segnali P0 in quelle categorie. Non corretto perche'
decidere da dove questi segnali dovrebbero arrivare e' una decisione
agronomica/di prodotto, non di tipizzazione — **registrato come O61** nel
registro aperti (§5.1), non solo in questo paragrafo, per rispettare la
regola anti-riapertura del piano.

Baseline globale verificata: **0 errori, 1.737 warning** (`1.768 -> 1.737`);
suite `test:release` 434/434 (9 suite), type-check e build produzione 153/153
pagine verdi.

### Aggiornamento T01 - lotto 44 (28/07/2026)

Nella classifica aggiornata i primi quattro candidati restavano esclusi:
`costOptimizationService.ts` (KPI statici gia' noti in M14),
`fieldRowPredictiveService.ts` (O-pending dal lotto 27),
`prescriptionMapsService.ts` (O60, appena escluso) e `aiPlanningService.ts`,
riverificato e confermato ancora parte del cluster "AI Planner" morto di M05
(tutti i suoi importer sono altri file dello stesso cluster, nessuna route
reale).

Il lotto 44 e' stato eseguito su `services/advancedNutritionService.ts` (vivo
in `/app/nutrition`, usato da cinque componenti Product/Analytics/Inventory/
Treatment/Dashboard), da 20 warning a zero: rimossi 3 import di tipi mai usati
(`TreatmentHistory`, `DateRange`, `ComplianceRecord`) e tipizzati tutti i 17
`any` con lo stesso pattern `DatabaseRow<T>` gia' introdotto in
`orchardService.ts`/`advancedIrrigationService.ts`, incluse le eccezioni per i
campi annidati appiattiti in colonne separate (`phRange`/`temperatureRange`)
e per il rename non derivabile `interval` -> `interval_days`. Rimosso anche un
cast `supabase as any` non necessario (il tipo del client era gia'
compatibile). Nessun gap funzionale nuovo trovato: i placeholder gia'
presenti (`treatmentsByZone`, `treatmentsByProduct`, `monthlyTrends`,
`seasonalPatterns`, `costPerSqm`) sono array/zero espliciti con commento
"Would need X data", stesso standard onesto gia' visto altrove, non dati
finti.

Baseline globale verificata: **0 errori, 1.717 warning** (`1.737 -> 1.717`);
suite `test:release` 434/434 (9 suite), type-check e build produzione 153/153
pagine verdi.

### Aggiornamento T01 - lotto 45 (28/07/2026)

Nella classifica aggiornata, dopo i quattro esclusi gia' noti, il candidato
successivo era in parita' a 19 warning tra `services/plantRowSyncService.ts` e
`components/Planner.tsx`. Verificato che `components/Planner.tsx` (2569
righe) ha zero importer nelle route reali (`/app/planner` usa `SmartPlanner`
e `CropRotationPlanner`, non questo file): e' lo stesso file gia' elencato nel
cluster morto "AI Planner" di M05, riconfermato ancora escluso.

Il lotto 45 e' stato eseguito su `services/plantRowSyncService.ts` (vivo,
usato da `SmartPlantManager.tsx` e da `unifiedOperationsService.ts`), da 19
warning a zero: rimosso l'import di tipo morto `PlantOperation`; tipizzato il
provider di storage con `Pick<IStorageProvider, ...>` sulle 10 sole funzioni
realmente usate; introdotte interfacce dedicate per le righe di
configurazione (`RowSyncSource`, `IrrigationLineConfigSource`) e per i
dettagli operazione multi-sorgente (`SyncOperationDetailsSource`, che
riflette fedelmente la lettura difensiva sia camelCase sia snake_case gia'
presente su tre tabelle diverse - annaffiatura, fertilizzante, trattamento -
senza cambiarne il comportamento). Un `catch (error: any)` e' stato convertito
in `catch (error: unknown)` con cast esplicito per l'accesso ai campi errore.

Durante la selezione e' emerso che `batchAssignPlantsToRow`, funzione
esportata dal file, non ha alcun chiamante in tutto il repository (verificato
con grep mirato) - zero importer, stesso pattern degli altri candidati M05.
Il parametro `startPosition`, gia' segnalato come mai cablato dal commento
"This would need additional method to update position", e' stato rimosso
dalla firma percheé genuinamente morto all'interno di una funzione essa
stessa irraggiungibile; la funzione non e' stata rimossa in questo lotto,
resta un candidato per il prossimo censimento M05 insieme agli altri orfani
gia' registrati.

Baseline globale verificata: **0 errori, 1.698 warning** (`1.717 -> 1.698`);
persistenza mirata (`plantRowSyncIntegrity.test.ts`) 2/2, suite `test:release`
434/434 (9 suite), type-check e build produzione 153/153 pagine verdi.

### Aggiornamento T01 - lotto 46 (28/07/2026)

Alla parita' a 18 warning tra `services/unifiedAgronomicMemoryService.ts`,
`services/directorService.ts`, `components/orchard/TreeManager.tsx` e
`components/garden/ListView.tsx`, verificata la raggiungibilita': `ListView.tsx`
ha zero importer (conferma della nota gia' registrata nel lotto 22, candidato
codice morto M05); `TreeManager.tsx` e' vivo (`/app/orchard`, `/app/olives`)
ed era gia' stato segnalato nel lotto 11 come rinviato a un lotto dedicato per
la sua estensione e complessita'.

Il lotto 46 e' stato eseguito su `components/orchard/TreeManager.tsx`
(2645 righe), da 18 warning a zero. Due `as any` sulla creazione bulk alberi
erano superflui: `treesToCreate` era gia' tipizzato correttamente e
`bulkCreateTrees` si aspettava esattamente quel tipo, senza alcun cast
necessario. Introdotte interfacce locali (`OrchestratorOperationRecord`,
`GardenCoordinateSource`, `FieldRowConfigSource`, `RowIrrigationConfigSource`,
`QuickEntryContextSnapshot`) per modellare fedelmente le letture difensive
gia' esistenti su oggetti multi-sorgente (operazioni orchestratore con doppio
nome di campo, config irrigazione filare, coordinate giardino con formati
legacy) senza cambiarne il comportamento. Il canale `operationDetails`
allegato al contesto operazione - gia' scritto e riletto nel file ma non
modellato dal tipo condiviso `PlantOperation['context']` - resta gestito con
un cast esplicito verso il tipo locale invece di un `any` generico; estendere
`PlantOperation['context']` stesso e' fuori perimetro per questo lotto
(tipo condiviso, impatto su tutti i consumer).

Corretti anche i tre `react-hooks/exhaustive-deps`: `loadTreePhotos`,
`loadTimeline` e la stima idrica sono stati avvolti in `useCallback` con le
dipendenze reali (inclusi gli helper `parseNumber`, `getRowIrrigationConfig`,
`mapSourceFromOperation`, `getWeatherSummary`, `getGeoSummary`, anch'essi
stabilizzati) cosi' che gli effect corrispondenti dipendano dalla funzione
memoizzata invece che da un array di dipendenze incompleto; nessun nuovo
rischio di loop, verificato leggendo l'intera catena di dipendenze.

**Verifica non eseguibile in browser:** il refactor degli hook e' stato
controllato solo a livello statico (type-check, lint, build, lettura
completa del diff) - il server di sviluppo richiede credenziali applicative
non disponibili in questa sessione per verificare interattivamente la pagina
Frutteto.

Baseline globale verificata: **0 errori, 1.680 warning** (`1.698 -> 1.680`);
suite `test:release` 434/434 (9 suite), type-check e build produzione
153/153 pagine verdi.

### Aggiornamento T01 - lotto 47 (28/07/2026)

Alla parita' a 18 warning tra `services/unifiedAgronomicMemoryService.ts` e
`services/directorService.ts`: il primo risulta importato solo da test, non
da alcun consumer di produzione; il secondo e' il Direttore agronomico core,
usato ovunque - entrambi rinviati per rischio/ambiguita' di raggiungibilita'
piu' alta del normale. Sceso al livello 17, confermato vivo
`services/unifiedOperationsService.ts` (usato da `TreeManager.tsx`,
`VineManager.tsx`, `PlantDetailModal.tsx`, `operationExecutionBridgeService.ts`,
`integratedFieldOperationsService.ts`).

Il lotto 47 e' stato eseguito su `services/unifiedOperationsService.ts`
(1204 righe), da 17 warning a zero: rimossi 3 import di tipi mai usati
(`GardenPlant`, `BulkRowOperation`, `BulkOperationResult`) e tipizzati tutti
i 12 `any` con interfacce locali (`WateringLogSource`, `FertilizerLogSource`,
`TreatmentLogSource`, `MechanicalWorkSource`, `PlantOperationSource`) che
riflettono fedelmente le letture difensive multi-nome gia' presenti, senza
cambiare comportamento.

**Scoperta durante la tipizzazione, registrata come O62:** la meta' "lettura
e aggregazione" della classe (`getUnifiedOperations`, `getOperationStatistics`
e sette helper privati, inclusi due stub che restituiscono sempre `null`/`[]`
con commento "For now") non ha alcun chiamante esterno in tutto il
repository - solo la meta' "esecuzione" (`executeUnifiedOperation` e helper)
e' raggiunta. Indipendentemente dalla raggiungibilita', `readWateringLogs`,
`readFertilizerLogs` e `readMechanicalWorks` leggono nomi di campo
(`log.amount`/`log.quantity`/`log.waterAmount`, `log.duration_minutes`,
`log.machine_name`) che non esistono affatto sui tipi database reali
(`WateringLog.litersApplied`, assenza di durata su `MechanicalWorkRecord`):
se questo sotto-sistema venisse mai collegato a una UI, quantita' e unita'
risulterebbero quasi sempre vuote. Nessuna correzione qui: unire "quale
mappatura e' quella giusta" a "il percorso e' comunque irraggiungibile oggi"
e' una decisione di prodotto, non una tipizzazione. I due metodi stub
(`getLatestSyncLog`, `getPlantOperationsBySource`) sono stati lasciati in
sede - solo i parametri mai usati sono stati rimossi dalla firma perche'
il metodo stesso non ha chiamanti - e restano candidati per il censimento
codice morto M05 insieme al resto del sotto-sistema.

Baseline globale verificata: **0 errori, 1.663 warning** (`1.680 -> 1.663`);
test mirato `unifiedOperationsService.test.ts` 3/3, suite `test:release`
434/434 (9 suite), type-check e build produzione 153/153 pagine verdi.

### Aggiornamento T01 - lotto 48 (29/07/2026)

`components/irrigation/WateringLogFormWithFieldRows.tsx` (17 warning, in
classifica dopo i quattro esclusi noti) e' risultato a zero importer,
coerente con la nota gia' registrata nel lotto 25 - confermato morto,
escluso. `components/planner/tabs/PlannerWizard.tsx` e
`components/VisualGardenPlanner.tsx` (15 warning), controllati durante la
selezione, sono risultati rispettivamente a zero importer e con unico
importer `Planner.tsx` (il file morto del cluster "AI Planner" di M05) -
entrambi morti, esclusi. Confermato ancora vivo `services/aiProviderAdapter.ts`
(usato da `geminiService.ts`, `contextAwareAIService.ts`, `aiProxyService.ts`,
`complianceAIService.ts`).

Il lotto 48 e' stato eseguito su `services/aiProviderAdapter.ts` (253 righe),
da 15 warning a zero: tipizzati i quattro costruttori di provider
(Gemini/OpenAI/Ollama/Anthropic) con `APIConfiguration['config']` gia'
esistente in `apiConfigurationService.ts`, estratta l'interfaccia condivisa
`GenerateContentOptions` al posto di quattro copie inline. Il file fa parte
del perimetro gia' noto di O48 (le chiavi provider arrivano in chiaro al
client): la tipizzazione non tocca ne' peggiora quel gate, gia' registrato.

**Bug reale trovato e corretto tipizzando il provider Gemini:** la richiesta
al SDK (`@google/generative-ai`) passava `contents` come stringa semplice e
`systemInstruction` annidato dentro `generationConfig`, mentre il tipo reale
del SDK richiede `contents: Content[]` (`{role, parts}`) e `systemInstruction`
come campo di primo livello della request, non dentro `generationConfig`.
Con `any` l'errore era silenzioso: l'istruzione di sistema personalizzata
veniva costruita e passata ma il provider Gemini custom la ignorava sempre,
rispondendo con il comportamento generico del modello. L'impatto e' reale e
ampio: `contextAwareAIService.ts`, `complianceAIService.ts` (assistente
GlobalG.A.P. certificazioni/rischio/richiamo/formazione),
`aiProxyService.ts` e `geminiService.ts` passano tutti `systemInstruction`
attraverso questo adapter quando e' configurato un provider Gemini
personalizzato. Corretto costruendo `contents` nel formato richiesto dal SDK
e spostando `systemInstruction` a livello della request; verificato con
`tsc --noEmit` contro i tipi ufficiali del pacchetto.

Baseline globale verificata: **0 errori, 1.648 warning** (`1.663 -> 1.648`);
suite `test:release` 434/434 (9 suite), type-check e build produzione
153/153 pagine verdi.

### Aggiornamento T01 - lotto 49 (29/07/2026)

Durante questo lotto l'utente ha segnalato dalla console del browser
Production due errori reali: `POST .../compute-field-alerts` 422 e
`GET .../irrigation_zones` 400. Diagnosi rapida prima di riprendere T01: il
422 e' comportamento fail-closed intenzionale della edge function quando il
garden non ha coordinate geografiche (non un difetto); il 400 e' evidenza
concreta del drift M06 gia' tracciato - le colonne richieste esistono nella
migrazione locale `20260117010000_create_advanced_irrigation_system.sql` ma
non risultano applicate su Production. Registrato come **O63** (owner M06),
nessuna correzione qui: appartiene alla sequenza remota O06-O09.

Confermato vivo `services/geminiService.ts` (14 warning), usato da flussi
produzione multipli. Il lotto 49 e' stato eseguito su questo file (877
righe), da 14 warning a zero: rimossi 5 import mai usati
(`findVariety`, `suggestVarieties`, `generateCompleteGuide`,
`getMasterVarietyInfo`, `getSeasonForDate`) e tipizzati i 9 `any` con
`LegacyGeminiContents` (unione stringa/contenuto multimodale) ed `ErrorLike`
condivisa per i sette blocchi `catch`, senza cambiare comportamento.

Baseline globale verificata: **0 errori, 1.634 warning** (`1.648 -> 1.634`);
suite `test:release` 434/434 (9 suite), type-check e build produzione
153/153 pagine verdi.

### Aggiornamento T01 - lotto 50 (29/07/2026)

`services/integratedStaggeringService.ts` (13 warning) e' risultato con
unico importer `aiPlanningService.ts`, il file morto del cluster "AI
Planner" di M05 - escluso. `services/blockchainTraceabilityService.ts` (13
warning) e' raggiungibile via `app/api/blockchain/traceability/route.ts` e
`app/api/blockchain/consumer/route.ts`.

Verificato prima di procedere: i `Math.random()` per hash/indirizzi e i
valori "Simplified"/hardcoded (`'garden_1'`) nel file non sono un gap
nascosto. Entrambe le route dichiarano esplicitamente `simulated: true,
certificationEligible: false` in ogni risposta, e il `POST` del consumer
endpoint e' disabilitato con `501` e messaggio esplicito
`'traceability_demo_only'` ("QR commerciale disabilitato: il ledger
disponibile e' simulato"). A differenza dei KPI finti gia' corretti in
O51/M14, qui la natura simulata e' dichiarata al confine API, non nascosta.

Il lotto 50 e' stato eseguito su `services/blockchainTraceabilityService.ts`
(881 righe), da 13 warning a zero: rimosso l'import inutilizzato `Garden`;
tipizzati `Record<string, any>`/`any[]` con `unknown` equivalenti (dati
generici gia' trattati come bag opachi, nessuna lettura tipizzata li
riguardava); rimossi i parametri mai usati da quattro helper della
simulazione (`getFarmerWalletAddress`, `generateNFTImage`,
`getGardenIdFromPlant`, `getGardenIdFromProduct` - tutti gia' a
implementazione fissa/semplificata) aggiornando i sei call site coinvolti.

Baseline globale verificata: **0 errori, 1.621 warning** (`1.634 -> 1.621`);
suite `test:release` 434/434 (9 suite), type-check e build produzione
153/153 pagine verdi.

### Aggiornamento T01 - lotto 51 (29/07/2026)

`services/costOptimizationService.ts` (90 warning, il file vivo con piu'
warning residui nell'intero censimento) e' raggiungibile via
`components/prescription/CostOptimizationPanel.tsx`, montato da
`PrescriptionMapsDashboard.tsx` sulla route `/app/prescription-maps`
(confermata viva; `PrescriptionMapsDashboard_Mobile.tsx` resta invece a
zero importer, coerente con quanto gia' registrato).

Verificato prima di procedere: l'intero motore "ottimizzazione costi"
(genetico, simulated annealing, particle swarm, gradient descent, Pareto
frontier multi-obiettivo, stato di avanzamento realtime) restituisce
esclusivamente valori mock hardcoded (`return 2340; // Mock value`, quality
score fissi per algoritmo, popolazione genetica che non evolve mai -
`evolvePopulation` e' un no-op dichiarato "Simplified", `generateParetoFrontier`
restituisce sempre `[]`). A differenza di O60 (stesso file
`prescriptionMapsService.ts` dell'area prescription-maps, dati mai collegati
ma presentati come reali), qui la natura dimostrativa e' dichiarata
esplicitamente in UI: `CostOptimizationPanel.tsx` mostra un banner "Valori
dimostrativi" che avverte l'utente che costo/resa/impatto ambientale/
efficienza non derivano dai dati reali dell'orto e non vanno usati per
decisioni operative. Stesso pattern gia' accettato per
`blockchainTraceabilityService.ts` nel lotto 50: nessun gap nascosto da
registrare, solo debito lint meccanico.

Il lotto 51 e' stato eseguito su `services/costOptimizationService.ts` (857
righe), da 90 warning a 2: rimosso l'import inutilizzato
`PrescriptionCostAnalysis`; introdotto un tipo locale `OptimizationProblem`
al posto di `any` per l'intera catena di risoluzione (setup, i quattro
algoritmi, popolazione genetica, vicinato per annealing); tipizzato
`storageProvider` con `Pick<IStorageProvider, 'getPrescriptionMap'>` al
posto di `any` (stesso pattern gia' usato su `geoExportService.ts` nel
lotto 10); rimossi i parametri mai letti da oltre venti helper della
simulazione (`calculateExpectedYield`, `calculateEfficiencyScore`,
`calculateVariableBounds`, i quattro `calculateOptimized*`, i quattro
`calculateSolution*`, `evaluateParameterImpact`,
`calculateParameterSensitivity`, `generateParetoFrontier`,
`findRecommendedSolution`, `getCurrentObjectiveValue`, `evolvePopulation`)
aggiornando tutti i call site coinvolti; eliminato `modifyProblemParameter`,
rimasto senza chiamanti dopo la pulizia. Lasciati intenzionalmente i 2
warning residui su `runRealTimeOptimization(optimizationId, request)`:
entrambi i parametri sono inerti (lo stub e' un "would run in background"
mai implementato), ma `request` appartiene alla firma pubblica di
`startRealTimeOptimization` chiamata dal pannello - rimuoverlo sarebbe un
cambio di contratto pubblico, non una correzione lint.

Baseline globale verificata: **0 errori, 1.533 warning** (`1.621 -> 1.533`);
suite `test:release` 434/434 (9 suite), type-check e build produzione verdi.

### Aggiornamento T01 - lotto 52 (29/07/2026)

`services/fieldRowPredictiveService.ts` (35 warning) e' risultato vivo:
raggiungibile direttamente da `app/app/garden/rows/page.tsx` e da
`components/fieldrows/FieldRowPredictionWidget.tsx`. A differenza dei lotti
precedenti, qui la tipizzazione ha smascherato **quattro bug reali gia'
presenti in produzione**, tutti nascosti da `any` che impediva al
type-checker di segnalarli. Verificati e corretti tutti nello stesso lotto,
su decisione esplicita dell'utente dopo aver presentato ciascuno:

1. **Rischio malattie mai calcolato:** `predictDiseaseRisk` (gia' reale,
   gia' usato in `components/analytics/PredictiveDashboard.tsx`, gia'
   coperto da test) era importato ma mai chiamato. Il punteggio salute dei
   filari ignorava completamente il rischio malattie. Ora
   `analyzeHealthStatus` lo invoca quando esiste `masterData` e ne integra
   `riskLevel`/`diseases`/`prevention` in punteggio, `mainIssues` e
   `preventiveActions`.
2. **Integrazione meteo interamente morta:** `getWeatherForecast` restituisce
   un array (`WeatherForecast[]`), ma `context.weatherForecast` veniva letto
   ovunque come un singolo oggetto (`context.weatherForecast.rainForecastMm`,
   `.temperature` - quest'ultimo campo inesistente sul tipo, che ha solo
   `tempMax`/`tempMin`). Essendo un array, ogni confronto restituiva sempre
   `undefined` (quindi sempre `false`): stress da caldo/gelo nel punteggio
   salute, suggerimento fertilizzazione in tempo secco, aggiustamento
   irrigazione da pioggia prevista e l'azione consigliata "verifica
   irrigazione" non sono **mai** scattati. Corretto indicizzando
   `weatherForecast?.[0]` in tutti e quattro i punti coinvolti e mappando
   `temperature` su `tempMax` (stress da caldo) e `tempMin` (rischio gelo).
3. **`fieldRow.irrigationConfig?.enabled`:** il tipo `FieldRow['irrigationLine']`
   non ha mai avuto un campo `enabled` (solo `lineType`/`pipeDiameterMm`/
   `emitterSpacingCm`/`emitterFlowRateLph`). La condizione era sempre
   `undefined` quindi sempre falsa: l'analisi irrigazione nel punteggio
   salute, il flag `irrigationEnabled` nel contesto filare e l'azione
   consigliata "verifica irrigazione" non si attivavano mai. Corretto
   usando la sola presenza di `irrigationConfig` come segnale di
   abilitazione (`Boolean(fieldRow.irrigationConfig)`), coerente con la
   semantica del tipo (un filare ha una linea configurata oppure no).
4. **Typo `fieldRowId` invece di `rowId`:** `buildFieldRowContext` cercava
   `(task as any).fieldRowId` per dedurre la data di semina dai task quando
   mancava sul filare, ma `GardenTask` ha `rowId`, non `fieldRowId` - il
   cast ad `any` nascondeva l'errore di tipo che avrebbe altrimenti
   segnalato il campo inesistente. Corretto in `task.rowId`.

**Registrato invece come nuovo item aperto (O65), non corretto:** l'intera
pipeline `recentOperations` aveva mismatch di nomi campo tra i tipi DB
reali e le letture del file. Investigati tutti e tre le fonti:
`FertilizerApplicationLogDB` usa `applicationDate` (camelCase, non
`application_date`) ma il `fieldRowId` combacia gia'; `TreatmentRecordDB`
usa `field_row_id`/`treatment_date` (snake_case, nomi diversi da
`fieldRowId`/`date`) quindi i trattamenti non venivano mai attribuiti al
filare giusto ne' la loro data letta; `WateringLog` invece era gia'
corretto (`fieldRowId`/`date` combaciano). **Normalizzati fertilizzazioni e
trattamenti alla fonte** in `loadRecentOperations` (aggiunti
`application_date`/`fieldRowId` calcolati dai campi reali), cosi' il resto
della pipeline che li legge funziona davvero. Resta pero' aperto e
registrato come **O65** (owner M09): `HarvestLogData` non ha ne'
`fieldRowId` ne' `plantId` - i raccolti non sono strutturalmente
attribuibili a un filare specifico con lo schema attuale, quindi
`getHarvestLogs` non e' stato collegato in questo lotto (avrebbe richiesto
un'euristica di corrispondenza per nome coltura, non un vero collegamento
per ID, esplicitamente rifiutata dall'utente come soluzione).

Il lotto 52 e' stato eseguito su `services/fieldRowPredictiveService.ts`
(864 righe), da 35 warning a 0: oltre ai quattro fix funzionali sopra,
rimosso l'import morto `React` (file `.ts` senza JSX), introdotti i tipi
locali `FieldRowSource` (`FieldRow` reale + due campi legacy letti in
difesa) e `FieldRowOperationRecord` per l'unione eterogenea di log
operazioni, sostituito `storageProvider: any` con `IStorageProvider` reale,
tipizzato `masterData` con `PlantMasterSheet`, `plants` con `GardenPlant[]`;
rimosso il parametro `rowContext` mai usato da `predictHarvest`; sistemato
`[_, expiry]` in `getCacheStats` con `.values()`.

Baseline globale verificata: **0 errori, 1.498 warning** (`1.533 -> 1.498`);
suite `test:release` 434/434 (9 suite), type-check e build produzione verdi.

### Aggiornamento T01 - lotto 53 (29/07/2026)

`services/droneIntegrationService.ts` (11 warning) e' risultato vivo:
raggiungibile via `components/smart/IntegratedSmartHub.tsx` (montato su
`/app/smart`), che chiama `app/api/drone/auto-plan`,
`app/api/drone/execute` e `app/api/drone/flight-plans`. Verificati e
confermati morti durante la selezione (zero importer reali, non solo
sostringa "Dashboard"/nome file che generava falsi positivi nel grep
iniziale): `components/Dashboard.tsx` e `services/dominanceIntegrationService.ts`.

Verificato prima di procedere: l'intero servizio genera dati simulati
(`Math.random()` per meteo, stress, copertura infestanti; `getGarden`
restituisce sempre un giardino di test hardcoded ignorando `gardenId`;
`getGardenTasks` restituisce sempre `[]`). A differenza di O60/O64, qui la
natura simulata e' gia' dichiarata esplicitamente nella UI che la
raggiunge: `IntegratedSmartHub.tsx` mostra "Modulo in beta: i piani sono
mantenuti nello scaffold interno e l'esecuzione produce risultati
simulati. Non invia comandi a droni reali, non registra telemetria fisica
e non sostituisce autorizzazioni o procedure di volo." Nessun gap nascosto
da registrare, stesso pattern gia' accettato per
`blockchainTraceabilityService.ts` (lotto 50) e `costOptimizationService.ts`
(lotto 51/O64).

Il lotto 53 e' stato eseguito su `services/droneIntegrationService.ts`
(825 righe), da 11 warning a zero: tipizzati `Waypoint.parameters` e
`Dronesensor.settings` con `Record<string, unknown>`; introdotto il tipo
locale `GardenBounds` al posto di `bounds: any` in
`generateGridPattern`/`generateMonitoringPattern`/
`generatePrescriptionPattern`/`generateEmergencyPattern`; rimosso il campo
privato `activeFlights: Map<string, any>`, mai letto ne' scritto altrove
nel file; rimossi i parametri mai usati da `generateWeedMapping`,
`checkWeatherConditions` e `getGardenTasks` (tutti mock che ignoravano
l'input), aggiornando i rispettivi call site.

Baseline globale verificata: **0 errori, 1.487 warning** (`1.498 -> 1.487`);
suite `test:release` 434/434 (9 suite), type-check e build produzione verdi.

### Aggiornamento T01 - lotto 54 (29/07/2026)

Fuori dalla campagna T01, nella stessa sessione e' stato corretto un bug di
produzione segnalato dall'utente dai log reali: `api_configurations.service_type`
non e' mai esistita (la migrazione `20260105080000_add_missing_critical_tables.sql`
definisce la colonna come `service_name`), causa a monte del fallimento nel
recupero della chiave Gemini salvata. Fix in PR #110 (mersata), non registrato
in questo registro T01 perche' non e' debito lint ne' un nuovo O-item: era un
bug singolo, riproducibile, gia' risolto.

`services/agronomicPredictionPipelineService.ts` (10 warning) e' risultato
vivo: unico consumer `app/api/ai/predictions/route.ts` (la stessa route
coinvolta nel log dell'errore Gemini, ma per un problema distinto e non
collegato). Verificato prima di procedere: l'intera pipeline (previsione
malattie, resa, ottimizzazione risorse) e' un motore deterministico reale,
calcolato da dati Supabase autentici (`garden_tasks`, `daily_weather_log`,
`soil_analysis`, `garden_plants`, `sensor_readings`) - nessun `Math.random()`,
nessun valore mock spacciato per reale. La tabella `baseYield` per coltura e'
un riferimento agronomico dichiarato, non un dato fittizio. Nessun gap da
registrare.

Il lotto 54 e' stato eseguito su `services/agronomicPredictionPipelineService.ts`
(ora ~375 righe), da 10 warning a zero: introdotte quattro interfacce locali
(`TaskRow`, `WeatherLogRow`, `SensorRow`, `SoilRow`, `PlantRow`) per le righe
Supabase non tipizzate, al posto di `any` sparsi tra caricamento task, meteo,
sensori, analisi suolo e piante in `loadCanonicalPredictionInput`.

Baseline globale verificata: **0 errori, 1.477 warning** (`1.487 -> 1.477`);
suite `test:release` 434/434 (9 suite), type-check e build produzione verdi.

### Aggiornamento T01 - lotto 55 (29/07/2026)

`services/aiPredictiveEngine.ts` (10 warning) e' risultato vivo: consumato
da `app/app/ai-predictions/page.tsx` e dalle card della dashboard
(`YieldPredictionsCard.tsx`, `AIPredictionsDashboard.tsx`,
`ResourceOptimizationCard.tsx`, `DiseasePredictionsCard.tsx`), oltre che da
`services/agronomicPredictionPipelineService.ts` (pulito nel lotto 54, ne
importa solo i tipi). Il file era gia' stato parzialmente lavorato nel
lotto 5 (13->5 warning, con un gap algoritmico reale trovato e corretto
allora); i 10 warning di questo lotto sono su codice diverso, non
sovrapposto a quella correzione.

Verificato prima di procedere: `optimizeLaborSchedule` e
`optimizeEnergyUsage` sono stub dichiarati esplicitamente ("Not
implemented in this version", restituiscono sempre `null`) - stesso
pattern gia' accettato altrove nella campagna, nessun gap nascosto (gia'
onestamente non implementati, non finti). Tre campi privati
(`diseaseModels`, `yieldModels`, `optimizationModels`, tutti
`Map<string, any>`) risultavano dichiarati ma mai letti ne' scritti in
nessun punto del file - stesso pattern del campo morto `activeFlights`
gia' rimosso nel lotto 53.

Il lotto 55 e' stato eseguito su `services/aiPredictiveEngine.ts`, da 10
warning a zero: rimossi i tre campi privati morti; introdotta
un'interfaccia locale `DiseaseRule` al posto di `any` per
`getDiseaseRules()`/`calculateDiseaseProbability()`; rimossi i parametri
mai usati dai due stub di ottimizzazione, aggiornando il call site in
`optimizeResources`.

Baseline globale verificata: **0 errori, 1.467 warning** (`1.477 -> 1.467`);
suite `test:release` 434/434 (9 suite), type-check e build produzione verdi.

### Aggiornamento T01 - lotto 56 (29/07/2026)

`components/planner/SmartPlanner.tsx` (10 warning) e' risultato vivo su
`/app/planner` - un planner distinto dal vecchio cluster morto
"AI Planner" (`Planner.tsx`/`PlannerWizard.tsx`/`VisualGardenPlanner.tsx`),
gia' confermato e usato insieme a `PlannerAISuggestions.tsx` (9 warning,
stessa route, non ancora affrontato). Verificato prima di procedere:
previsioni meteo caricate realmente via `smartOperationsService`, nessun
dato finto.

Il lotto 56 e' stato eseguito su `SmartPlanner.tsx`, da 10 warning a 1:
rimossi quattro import morti (`CheckCircle`, `Thermometer`, `Wind`,
`addDays`); introdotta un'interfaccia locale `NewOperationFormData` al
posto di `any` per il form nuova operazione; sostituiti due cast `as any`
con union type reali (`SmartOperation['type']`, `typeof activeView`);
rimosso il parametro `date` mai usato nella callback `onDateClick`
(il tipo della prop lo rende opzionale). Lasciato intenzionalmente 1
warning `react-hooks/exhaustive-deps`: `analyzeOperationsWeather` ritorna
sempre un nuovo array (`.map`), quindi includere `smartOperations` per
intero nelle dipendenze causerebbe un loop infinito - stesso tipo di
rischio gia' documentato nel lotto 13.

Baseline globale verificata: **0 errori, 1.458 warning** (`1.467 -> 1.458`);
suite `test:release` 434/434 (9 suite), type-check e build produzione verdi.

### Aggiornamento T01 - lotto 57 (29/07/2026)

`components/planner/tabs/PlannerAISuggestions.tsx` (9 warning) e' risultato
vivo su `/app/planner`, montato insieme a `SmartPlanner.tsx` (lotto 56).
Tipizzando `garden: any` -> `Garden` reale, il type-checker ha smascherato
un **bug attivo** (non dormiente, a differenza di quelli dei lotti
precedenti): `handleAccept`/`handleReject` chiamavano
`collaborativeAIService.acceptSuggestion(garden.user_id, ...)` e
`rejectSuggestion(garden.user_id, ...)`, ma `Garden` non ha mai avuto un
campo `user_id` - il primo argomento atteso da quei metodi e' in realta'
l'ID dell'utente corrente (`userId`), gia' disponibile nello stesso file
come `user.id` da `useAuth()` e gia' usato correttamente in
`loadSuggestions`. Ogni accept/reject ha quindi sempre registrato la
decisione con `userId: undefined`. Corretto sostituendo `garden.user_id`
con `user.id` in entrambi i punti, con guardia `!user?.id` prima della
chiamata.

Verificato inoltre un secondo bug, ripetuto identico in altri due file:
`JSON.parse(suggestion.expected_outcomes as any)` in questo file,
`components/irrigation/IrrigationAISuggestionsWidget.tsx` e
`components/nutrition/NutritionAISuggestionsWidget.tsx`.
`AISuggestion.expected_outcomes` e' gia' un array (`ExpectedOutcome[]`),
mai una stringa JSON - `components/ai/AISuggestionCard.tsx` lo tratta
correttamente con `.map()`/`.length` diretti. `JSON.parse` su un array
gia' deserializzato genera un errore runtime; nei due widget era
catturato da un `try/catch` che faceva silenziosamente fallback a `null`
(nessun beneficio/risparmio mai mostrato), qui invece non era protetto e
avrebbe fatto crashare il rendering. Nessun punto del codebase scrive
`expected_outcomes` come stringa, quindi il bug era dormiente finche' un
suggerimento non popola davvero quel campo. Corretti tutti e tre i file
rimuovendo `JSON.parse`, usando l'array direttamente.

**Registrato come nuovo item aperto (O66), non corretto:** accettare un
suggerimento AI (`PLANTING_PLAN`/`HARVEST_TIMING`/`ROTATION_PLAN`) non crea
mai i task corrispondenti nel planner. Il genitore (`app/app/planner/page.tsx`)
passa una `onCreateTasks` con implementazione reale (crea task via
`storageProvider.createTask`), ma `handleAccept` non la invoca mai.
Verificato che non esiste nel codebase alcuna conversione
suggerimento -> task: `suggested_parameters` e' un bag generico
(`Record<string, unknown>`) senza schema fisso per tipo di suggerimento
(confermato anche in `AISuggestionCard.tsx`, che lo mostra come coppie
chiave/valore grezze). Implementarlo richiede una decisione di prodotto
su come mappare ciascun tipo di suggerimento a task concreti, non un
collegamento meccanico.

Il lotto 57 e' stato eseguito su `PlannerAISuggestions.tsx`, da 9 warning
a zero (oltre ai due fix funzionali sopra): rimossi due import morti
(`AlertTriangle`, `useGarden`); tipizzate le prop con `Garden`/`GardenTask`
reali mantenendo `tasks`/`onCreateTasks` nell'interfaccia ma non
distrutturate (restano non utilizzate, coerente con O66); spostata la
costante `planningTypes` a livello di modulo per risolvere
`exhaustive-deps` senza rischio di loop infinito; `loadSuggestions`
avvolta in `useCallback`.

Baseline globale verificata: **0 errori, 1.444 warning** (`1.458 -> 1.444`);
suite `test:release` 434/434 (9 suite), type-check e build produzione verdi.

**Nota operativa:** durante questo lotto la build ha fallito con `ENOSPC`
(disco del Mac al 100%, 229MB liberi su 228GB) per l'accumulo di worktree
T01 gia' mersati da precedenti sessioni (lotti 18-34, 43) mai ripuliti,
ciascuno con il proprio `node_modules`. Rimossi con `git worktree remove`
dopo aver verificato l'assenza di modifiche non salvate (solo
`tsconfig.tsbuildinfo`/`node_modules` non tracciati); liberati ~6.4GB.
Da ora in poi, chiudere/ripulire il worktree del lotto precedente subito
dopo il merge, prima di aprirne uno nuovo.

### Aggiornamento T01 - lotto 58 (29/07/2026)

`components/prescription/MapExportModal.tsx` (9 warning) e' risultato
vivo: raggiungibile via `PrescriptionMapsDashboard.tsx` su
`/app/prescription-maps` (stessa route di O60, gia' accettata come viva
nei lotti precedenti). Nessun gap nascosto: `handleExport` chiama il
servizio export reale (`geoExportService`), nessun dato finto.

Il lotto 58 e' stato eseguito su `MapExportModal.tsx`, da 9 warning a
zero: tipizzato `exportResult` con `ExportResult` (gia' esportato da
`geoExportService.ts`) al posto di `any`; sostituiti sei cast `as any` con
i tipi reali di `ExportConfiguration` (`format`, `coordinateSystem`,
`kmlOptions.colorScheme`, `csvOptions.delimiter`,
`csvOptions.coordinateFormat`) e con `typeof activeTab` per i tab;
risolto `exhaustive-deps` avvolgendo `checkMachineryCompatibility` in
`useCallback` e memoizzando `exportService` con `useMemo` (altrimenti
sarebbe stato ricreato a ogni render, richiamando la verifica
compatibilita' macchina anche su render non pertinenti). Aggiunta una
guardia `exportResult?.downloadUrl` nei due handler download/copia link,
necessaria perche' il type-checker (prima mascherato da `any`) non
restringe la nullabilita' di uno state React dentro closure annidate nella
JSX, anche se gia' verificata nel blocco condizionale esterno.

Baseline globale verificata: **0 errori, 1.435 warning** (`1.444 -> 1.435`);
suite `test:release` 434/434 (9 suite), type-check e build produzione verdi.

### Aggiornamento T01 - lotto 59 (29/07/2026)

`components/GardenOnboarding.tsx` (9 warning) e' risultato vivo: importato
da `GardenTypeWizard.tsx`, montato direttamente da quattro route reali
(`/app`, `/app/settings`, `/app/plants`, `/app/planner`).

**Riaperta su decisione esplicita dell'utente la calibrazione bussola
panoramica gia' diagnosticata nel lotto 6 e lasciata intenzionalmente non
toccata allora:** `analyzePanoramicPhotoWithOffset` riceveva un `offset`
di calibrazione Nord (calcolato da orientamento dispositivo/EXIF/bussola
manuale) ma lo scartava, passando solo la foto a
`analyzePanoramic360(base64)` - la cui firma non accettava alcun offset.
Verificato prima di implementare che un secondo consumer,
`services/obstacleExtractor.ts`, applica gia' una correzione equivalente
in autonomia (converte le direzioni in azimut e corregge con
`photoNorthOffset` per popolare `Garden.obstacles`) - quel percorso non
era il gap, resta intatto e retrocompatibile con la nuova firma
opzionale.

Implementato in `services/photoAnalysisService.ts`: `analyzePanoramic360`
accetta ora un secondo parametro opzionale `northOffsetDegrees` (default
`0`, nessun cambio per chi non lo passa - `obstacleExtractor.ts` non
tocca alcuna riga). Quando fornito, ruota `aspectDirection`,
`exposureByDirection` (le ore di sole per direzione, rimappando i bucket
Nord/Sud/Est/Ovest) e la `direction` di ogni ostacolo rilevato dal
sistema di riferimento della foto a quello reale, con arrotondamento alla
cardinale/intercardinale piu' vicina. `GardenOnboarding.tsx` ora passa
l'`offset` gia' calcolato invece di scartarlo.

Il lotto 59 e' stato eseguito su `GardenOnboarding.tsx`, da 9 warning a 3
(oltre al fix funzionale sopra): risolto `exhaustive-deps` aggiungendo
`hydroponicConfig`/`latitude`/`longitude`/`needsLocation` alle dipendenze
(ogni ramo dell'effetto e' gia' auto-guardato da un controllo `!X`, nessun
rischio di loop); sostituiti quattro `catch (error: any)` con
`catch (error)` e narrowing esplicito dove serviva il messaggio. Lasciati
intenzionalmente 3 warning `no-img-element`: anteprime locali in base64
data-URI (foto mezzogiorno/orizzonte/panoramica), stesso pattern gia'
accettato nel lotto 8.

Baseline globale verificata: **0 errori, 1.429 warning** (`1.435 -> 1.429`);
suite `test:release` 434/434 (9 suite), type-check e build produzione verdi.

### Aggiornamento T01 - lotto 60 (29/07/2026)

`services/collaborativeAIService.ts` (7 warning) e' risultato vivo:
consumato da `PlannerAISuggestions.tsx` (lotto 57),
`IrrigationAISuggestionsWidget.tsx`, `NutritionAISuggestionsWidget.tsx`,
`CollaborativeAIDashboard.tsx` e `directorService.ts`.

Osservazione (non un gap da registrare, nessun dato falso mostrato):
`applyLearning` - il metodo pubblico che applica aggiustamenti appresi dai
pattern di correzione dell'utente ai parametri di un nuovo suggerimento -
non ha alcun chiamante in tutto il codebase. La logica esiste ed e'
corretta, ma il sistema di "apprendimento dalle correzioni" non e' mai
invocato dalla pipeline dei suggerimenti; coerente con O66 (accettare un
suggerimento non crea nemmeno i task), la parte "collaborativa" del
sistema AI risulta poco cablata nel flusso reale. Non registrato come
nuovo O-item per non duplicare O66, che copre gia' la stessa area.

Il lotto 60 e' stato eseguito su `collaborativeAIService.ts`, da 7
warning a zero: rimossi due import di tipi mai usati (`DecisionType`,
`MetricType`); tipizzati `originalParameters`/`modifiedParameters`/
`baseParameters` con `Record<string, unknown>` (gia' il tipo reale di
`AISuggestion.suggested_parameters`) al posto di `any`.

Baseline globale verificata: **0 errori, 1.422 warning** (`1.429 -> 1.422`);
suite `test:release` 434/434 (9 suite), type-check e build produzione verdi.

### Aggiornamento T01 - lotto 61 (29/07/2026)

`components/advice/BiologicalControlDashboard.tsx` (7 warning) e' risultato
vivo, montato direttamente da `/app/planner` e `/app/advice`.

**Gap funzionale trovato e corretto su decisione esplicita dell'utente:**
il pulsante dettaglio checklist chiamava gia' `loadSubtasks(checklist.id)`
(dati reali da `biologicalControlService.getSubtasks`), ma il modal
dettaglio renderizzava solo `<ComplianceChecklist>` - un componente
generico per la certificazione della categoria, senza alcun collegamento
ai sotto-task appena caricati. I sotto-task venivano quindi scaricati dal
backend e scartati, mai mostrati all'utente. Il backend era gia' completo
(`updateSubtaskStatus` esiste ed era gia' usato altrove nel service).
Aggiunta la lista sotto-attivita' nel modal (checkbox per segnare
completato/non completato, collegata a `updateSubtaskStatus` esistente),
mantenendo `ComplianceChecklist` per la parte di certificazione generica
(le due cose coprono scopi diversi: sotto-task specifici della checklist
vs. requisiti di certificazione della categoria).

Il lotto 61 e' stato eseguito su `BiologicalControlDashboard.tsx`, da 7
warning a zero (oltre al fix funzionale sopra): rimossi due import morti
(`Camera`, `Download`); risolto `exhaustive-deps` avvolgendo
`loadChecklists` in `useCallback`; sostituiti tre cast `as any` con i tipi
reali (`ChecklistStatus | 'ALL'`, `BiologicalControlCategory | 'ALL'`, e
l'oggetto filtri tipizzato sulla firma reale di
`biologicalControlService.getChecklists`).

Baseline globale verificata: **0 errori, 1.415 warning** (`1.422 -> 1.415`);
suite `test:release` 434/434 (9 suite), type-check e build produzione verdi.

### Aggiornamento T01 - lotto 62 (29/07/2026)

`services/apiKeysService.ts` (7 warning) e' risultato vivo: consumato da
`components/settings/APIKeysManager.tsx`, montato su `/app/settings`.
Verificato prima di procedere: cripta/decripta chiavi con Web Crypto reale
(fallback a encoding semplice solo se l'API non e' disponibile, con
warning esplicito in console) e testa le chiavi contro gli endpoint reali
dei provider (OpenAI, Anthropic, Google AI, Sentinel Hub, Weather API) -
nessun dato finto.

Il lotto 62 e' stato eseguito su `apiKeysService.ts`, da 7 warning a
zero: tipizzati con `Record<string, unknown>` i bag di configurazione
generici (`config` in `createAPIKey`/`testAPIKey`, `dbUpdates`/`dbFields`
nel mapper camelCase->snake_case di `updateAPIKey`); tipizzati con
interfacce locali specifiche i parametri di `testOpenAI`
(`{ organization?: string }`) e `testSentinelHub`
(`{ clientId?: string; clientSecret?: string }`), con cast mirato nello
switch di `testAPIKey` dove il bag generico viene instradato al test del
provider corretto; sostituito `catch (error: any)` con `catch (error)` e
narrowing esplicito.

Baseline globale verificata: **0 errori, 1.408 warning** (`1.415 -> 1.408`);
suite `test:release` 434/434 (9 suite), type-check e build produzione verdi.

**Nota disco:** al termine di questo lotto il Mac risultava al 99% di
spazio (3.3GB liberi su 228GB), nonostante la pulizia worktree del lotto
57. Da monitorare da vicino nei prossimi lotti.

### Aggiornamento T01 - lotto 63 (29/07/2026)

**Nota disco (inizio sessione):** 8 worktree orfani in `/private/tmp`
(branch gia' mersati in `main`: `ai-credit-transaction-integrity`,
`health-alerts-real-data`, `m15-production-evidence`,
`o45-remove-orphan-tests`, `o46-production-e2e-close`,
`fix-seedling-batch-actions`, `seedling-runtime-evidence`,
`fix-soil-state-tillage-404`) rimossi con `git worktree remove`, piu' il
worktree del lotto 62 (`ortomio-t01-b62`) dopo il merge della PR #119.
Spazio libero: 8.0GB -> 9.7GB su 228GB (i worktree condividono oggetti
Git via APFS, quindi il guadagno e' inferiore alla somma dei `du`
individuali). Ancora da tenere sotto controllo, non piu' in stato
critico per proseguire.

Classifica ESLint rigenerata su `main` post-lotto 62 (baseline
confermata: 1.408 warning). In cima alla classifica, 3 nuovi candidati
a zero importer (nessun riferimento in `app/`/`components/`/`services/`
al di fuori del file stesso), scartati e registrati per O45:
`components/garden/ListView.tsx` (18 warning), `services/unifiedAgronomicMemoryService.ts`
(18 warning, non importato da nessuno nonostante il nome suggerisca un
ruolo centrale), `components/irrigation/WateringLogFormWithFieldRows.tsx`
(17 warning). Confermati vivi e scelti come target: `services/prescriptionMapsService.ts`
(33 warning, montato su `/app/prescription-maps` via `PrescriptionMapsDashboard.tsx`)
e `services/directorService.ts` (18 warning, usato da `HomeDashboard`,
`Dashboard`, `Planner`, `ProfessionalDashboard`, `DirectorBriefingWidget`
e altri). Il cluster "AI Planner" morto (`aiPlanningService.ts`,
`components/Planner.tsx` incluso in classifica con 19 warning tramite
l'omonimo file orfano, `AIPlanningWizard.tsx`) e altri orfani gia' noti
(`AnnualPlanner.tsx`, `Dashboard.tsx` root, `PrescriptionMapsDashboard_Mobile.tsx`,
`FieldPlantManager.tsx`) restano esclusi per decisione utente/O45 gia'
registrata nei lotti precedenti.

Entrambi i file portati a zero warning tramite tipizzazione, nessuna
modifica di comportamento. `directorService.ts`: rimossi i cast `as any`
in `normalizeLegacyDailyPlanShape` (il tipo `DailyPlan` gia' garantisce
gli array, i cast erano ridondanti); tipizzato `suggestion.action_priority`
(gia' union `ActionPriority` identica al campo target, cast rimosso);
tipizzati `diaryEntry`/`stats` in `generateRecommendations`/`generateSummary`
con interfacce locali. `prescriptionMapsService.ts`: rimossi 2 import
inutilizzati (`ZoneGenerationAlgorithm`, `PrescriptionAlgorithm`);
`storageProvider` tipizzato `IStorageProvider` (costruttore e factory);
`geometry`/bounds/righe NDVI tipizzati con interfacce locali dedicate;
rimossi 3 parametri sempre-inutilizzati da `getNDVIData` (`bounds`),
`getPlantLevelData` e `getSoilData` (tutti e 3 gli argomenti, funzioni
stub che ritornano sempre `[]`) con aggiornamento dei call site.

**Gap trovati durante la tipizzazione, NON toccati (stesso pattern
M14/gap-registrati dei lotti precedenti, comportamento invariato):**
1. `directorService.ts::generateRecommendations`/`generateSummary`:
   `dailyDiaryService.getDailyEntry()` restituisce sempre
   `{weather, tracking, events}` — i rami che leggono
   `diaryEntry.weather_data`/`agronomic_data`/`lunar_phase` sono codice
   morto permanente, questi campi non esistono mai nella risposta reale
   e quei blocchi di raccomandazione non scattano mai.
2. `prescriptionMapsService.ts::getGardenBounds`: prova a derivare i
   bound geografici da `garden.points`, ma `GardenPoint` (types.ts)
   espone solo coordinate a griglia `{x,y}` (`position`/`coordinates`),
   mai lat/lon reali — il ramo "points >= 3" non e' mai raggiungibile,
   si ricade sempre sul buffer di 0.001° attorno a `garden.coordinates`.
3. `prescriptionMapsService.ts`: `getNDVIData` riceveva `bounds` ma non
   lo usava mai (nessun filtro spaziale sulla query NDVI, solo
   `garden_id`+intervallo date); `getPlantLevelData`/`getSoilData` sono
   stub che ignorano tutti i parametri e ritornano sempre `[]`.
4. `prescriptionMapsService.ts::resolveMapOwnerId`: prova
   `garden.user_id`/`userId`/`ownerId`, ma `Garden` non espone alcun
   campo owner lato client — il valore reale arriva sempre dalla query
   Supabase diretta subito dopo.
5. `prescriptionMapsService.ts::createPrescriptionMapRecord`: legge
   `data.gardenName`/`data.createdBy`, ma il chiamante (spread di
   `PrescriptionGenerationRequest`) non li passa mai — restano sempre
   `undefined` (fallback `'Garden'` per il nome, nessun creator
   registrato sulla mappa prescrittiva).

Baseline globale verificata: **0 errori, 1.357 warning** (`1.408 -> 1.357`);
suite `test:release` 434/434 (9 suite), type-check e build produzione verdi.

### Aggiornamento T01 - lotto 64 (29/07/2026)

**Nota disco:** rimosso il worktree del lotto 63 dopo il merge della PR
#120 e aperto quello del lotto 64 da `origin/main` aggiornato. Spazio
libero salito autonomamente da 9.7GB a 37GB su 228GB durante la
sessione (probabile scadenza di snapshot di sistema, non attribuibile
alla pulizia worktree) — non piu' un vincolo per questo lotto.

Classifica ESLint rigenerata (baseline confermata: 1.357 warning). La
verifica di raggiungibilita' su ~30 candidati in classifica ha
**scoperto 14 nuovi file orfani** (zero importer reali, verificato con
grep su `app/`/`components/`/`services/`), oltre ai gia' noti: `components/planner/tabs/PlannerWizard.tsx`,
`services/integratedStaggeringService.ts` (importato solo da `aiPlanningService.ts`,
gia' nel cluster morto), `components/shared/GeographicMatchingWidget.tsx`,
`components/AromaticHarvest.tsx`, `services/autoBackupService.ts`,
`components/OliveHarvest.tsx`, `components/VineHarvest.tsx`,
`components/analytics/PredictiveDashboard.tsx` (raggiungibile solo via
`components/analytics/UnifiedDashboard.tsx`, anch'esso orfano),
`components/analytics/UnifiedDashboard.tsx`, `services/intelligentNotificationService.ts`
(raggiungibile solo via `components/monitoring/ContinuousMonitoringDashboard.tsx`,
anch'esso orfano — nonostante fosse stato portato a zero warning nel
lotto 2 il 24/07/2026, quando era ancora vivo), `components/monitoring/ContinuousMonitoringDashboard.tsx`,
`components/fieldrows/QuickOperationModal.tsx`, `components/plants/PlantPhotoTimeline.tsx`,
`lib/reports/exportReportPDF.ts`, `components/plants/MaturityTracker.tsx`
(non confondere con `components/vineyard/GrapeMaturityTracker.tsx`, vivo
e diverso), `components/plants/TreatmentTracker.tsx`, `components/plants/BrixTracker.tsx`,
`components/shared/GardenBedsWidget.tsx`, `components/HarvestLog.tsx`
(non confondere col tipo `HarvestLogData`, vivo e diverso),
`components/compliance/SelfAssessmentForm.tsx`, `components/fieldrows/IntegratedFieldOperationsModal.tsx`,
`components/health/HealthDashboard.tsx`, `components/ndvi/MultiGardenNDVIDashboard.tsx`,
`components/planner/ZoneMappingTool.tsx` (raggiungibile solo via
`VisualGardenPlanner.tsx`, gia' noto come morto), `components/compliance/RiskManagementPlan.tsx`
e `components/compliance/RecallProcedure.tsx` (gia' segnalato nel lotto
13 come "non ancora analizzato per O45", ora confermato morto). Tutti
registrati qui per il censimento O45; nessuna rimozione fatta in questo
lotto, solo classificazione.

Confermati vivi e scelti come target: le 3 route `app/app/health/page.tsx`,
`app/app/olives/page.tsx`, `app/app/planner/page.tsx` (vive per
definizione, sono pagine montate), piu' 4 componenti verificati con
grep: `components/professional/TreatmentRegisterForm.tsx` (vivo via
`TreatmentRegister.tsx`), `components/compliance/GlobalGapDashboard.tsx`
(vivo via `CertificationsDashboard.tsx`), `components/garden/PlantsView.tsx`
(vivo via `/app/plants` e `GardenView.tsx`), `components/gardens/BedManager.tsx`
(vivo via `GardenView.tsx`). Tutti e 7 portati a zero warning (46 -> 0,
salvo 2 lasciati intenzionalmente, vedi sotto): import morti rimossi,
`exhaustive-deps` risolto con `useCallback` (spostando le funzioni
prima degli effect che le referenziano, altrimenti si crea un
riferimento a variabile non ancora inizializzata nello stesso render),
`as any` sostituiti con union type reali o intersezioni per campi
legacy (vedi gap sotto), parametro `_orchardId` mai usato rimosso da
`handleWizardComplete` (il tipo della prop `onComplete` accetta comunque
una funzione con meno parametri), funzione `getUpcomingTasks` rimossa
per intero in `planner/page.tsx` (risultato calcolato e mai
consumato, insieme ai 4 import `date-fns` diventati orfani di
conseguenza).

**2 warning lasciati intenzionalmente** in `app/app/health/page.tsx`
(`no-img-element` su foto catturate da fotocamera, data-URI/blob:
stesso pattern gia' documentato nel lotto 8, la conversione a
`next/image` e' un cambio di comportamento non un fix lint).

**Gap trovati durante la tipizzazione, NON toccati (stesso pattern dei
lotti precedenti, comportamento invariato):**
1. `app/app/health/page.tsx` e `components/garden/PlantsView.tsx`:
   `Garden` non ha mai avuto `slopePercentage`/`slopeClass` (la
   pendenza si calcola altrove, es. `environmentalMonitoringService.ts`) —
   restano sempre `null` nel contesto costruito per health/maturity.
2. `components/garden/PlantsView.tsx`: `GardenTask` non ha mai avuto
   `fieldRowId` (solo `rowId`) — il fallback e' sempre vuoto, si usa
   sempre `rowId`.
3. `app/app/olives/page.tsx`: `GardenTask` non ha mai avuto
   `fieldRowSectionId`/`fieldRowId` (solo `zoneId`) — il filtro per
   posizione selezionata funziona di fatto solo sulla zona, gli altri
   due livelli (sezione filare, filare) non hanno mai avuto effetto.

Baseline globale verificata: **0 errori, 1.313 warning** (`1.357 -> 1.313`);
suite `test:release` 434/434 (9 suite), type-check e build produzione verdi.

### Aggiornamento T01 - lotto 65 (29/07/2026)

Classifica ESLint rigenerata (baseline confermata: 1.313 warning). In
cima erano quasi tutti candidati gia' noti come morti/orfani (cluster
AI Planner, i 14+ orfani registrati nei lotti 63-64). Verificati con
grep ricorsivo ~20 candidati ulteriori: confermati vivi e scelti come
target `components/garden/ActivityRegistry.tsx` (vivo via `/app/analytics`),
`components/planner/ClassicPlannerWithRotation.tsx` (vivo via
`/app/planner-classic`, route mai censita prima in questa campagna),
`components/smart/IntegratedSmartHub.tsx` (vivo via `/app/smart`),
`components/sunExposure/AdvancedSunExposureWizard.tsx` (vivo via
`GardenOnboarding.tsx`, a sua volta vivo via `GardenTypeWizard.tsx`),
`services/classicPlannerService.ts` (vivo via `ClassicPlannerWithRotation.tsx`),
`services/vineyardService.ts` (vivo via `VineManager.tsx`, `/app/vineyard`),
`services/plantFuzzySearchService.ts` (vivo via `/api/plants/search`).
Scartati durante la stessa verifica, nuovi orfani per O45: `SpecializedCropForm.tsx`
e `AccessoriesSuggestionsSection.tsx` (unico importer `components/Planner.tsx`,
cluster morto), `CollaborativeAIDashboard.tsx`, `SoilAnalysisForm.tsx`,
`IrrigationZoneWizard.tsx`, `OliveManagementDashboard.tsx` (zero importer),
`components/DataBackup.tsx` (zero importer, rende morto anche
`services/importService.ts` che importava solo da li'), l'intera catena
`services/aiProxyService.ts` -> `services/productCardService.ts` ->
`services/integratedTreatmentService.ts` -> `components/treatments/SmartTreatmentWizard.tsx`
-> `components/treatments/TreatmentDashboardWidget.tsx` (zero importer
in fondo alla catena, quindi tutti e 5 irraggiungibili nonostante
`aiProxyService.ts` fosse stato attivamente corretto nel D9 del 22/07 —
il codice che lo consumava a quella data si e' da allora scollegato).

44 -> 1 warning sui 7 file (1 lasciato intenzionalmente su
`AdvancedSunExposureWizard.tsx`: `no-img-element` su foto 360° caricata
dall'utente, data-URI, stesso pattern lotto 8/63/64). Import morti
rimossi, `exhaustive-deps` risolto con `useCallback` (funzioni spostate
prima degli effect), `as any` sostituiti con union type reali o
interfacce locali per le righe Supabase grezze, coppie `useState` con
getter morto ma setter vivo (o viceversa) ridotte al solo binding
necessario, 2 parametri sempre-inutilizzati rimossi da funzioni con
un solo chiamante (`getIdealPlantingDates`, `getSuggestionsForLocation`)
aggiornando i call site.

**Bug reale trovato e corretto (non solo un gap registrato) in
`services/vineyardService.ts::createVineyardFromWizard`:** le viti
create in blocco dal wizard vigneto venivano costruite con campi
snake_case (`vineyard_id`, `garden_id`, `is_active`, `needs_pruning`,
...) prima di passare per `bulkCreateVines` -> `mapVineToDatabase`,
che pero' legge campi camelCase (`vineyardId`, `gardenId`, `isActive`,
...) per poi ri-convertirli lui stesso in snake_case per l'insert. Il
doppio mapping faceva si' che ogni vite creata in blocco finisse nel
database con `vineyard_id`/`garden_id` nulli e `is_active` nullo (la
dashboard filtra `is_active = true`, quindi queste viti sarebbero
risultate invisibili). Corretto passando i campi in camelCase come
richiesto dal mapper interno, rimuovendo il cast `as any` che
nascondeva il disallineamento di tipo.

**Gap trovato durante la tipizzazione, NON toccato:**
`services/classicPlannerService.ts::getIdealPlantingDates` accetta
(accettava) un parametro `plantName` mai usato nel corpo — la funzione
ritorna sempre la stessa finestra di date fisse (oggi+7/+37/+22 giorni)
indipendentemente dalla pianta, nonostante il nome suggerisca un
calcolo specifico per specie. Parametro rimosso per pulizia lint
(nessun altro effetto), ma la mancata differenziazione per pianta
resta un gap di prodotto non affrontato qui.

Baseline globale verificata: **0 errori, 1.270 warning** (`1.313 -> 1.270`);
suite `test:release` 434/434 (9 suite), type-check e build produzione verdi.

### Aggiornamento T01 - lotto 66 (29/07/2026)

**Scoperta rilevante: `components/garden/GardenView.tsx` risulta ora
completamente orfano** (zero riferimenti in tutto `app/`/`components/`,
verificato con grep sull'intero albero) — non solo un file isolato ma
la vecchia vista giardino "monolitica" che il piano master cita
ripetutamente come componente vivo nei lotti passati (es. lotto 64:
"BedManager.tsx vivo via GardenView.tsx"). Non e' chiaro quando sia
stata scollegata; le route reali del giardino oggi passano da altri
componenti (`/app/garden` monta `GardenHubPage`, non `GardenView`).
Cascata di orfani conseguente, tutti verificati zero-importer dopo
GardenView: `components/sunExposure/EnvironmentalPlanningSection.tsx`
(unico importer era GardenView), `components/sunExposure/SunExposureWidget.tsx`
(importer erano solo `components/Dashboard.tsx`, gia' morto, e
`EnvironmentalPlanningSection.tsx`, ora morto anch'esso),
`components/sunExposure/SunExposureDetailModal.tsx` (unico importer
era SunExposureWidget). Tutti e 4 registrati per O45. **Nota
metodologica per O45: quando si verifica un file di grandi dimensioni
gia' dato per vivo in lotti precedenti, riverificare comunque — lo
stato di raggiungibilita' del codebase cambia rapidamente con i
refactor in corso.**

Classifica ESLint rigenerata (baseline confermata: 1.270 warning).
Confermati vivi con grep ricorsivo (nessuno dipende da GardenView):
`components/agronomist/ConsultationForm.tsx` (via `Advice.tsx`,
`/app/advice`), `components/diary/AutomatedDiaryViewer.tsx` (via
`/app/diary`), `components/harvest/HarvestDashboard.tsx` (via
`/app/harvest`), `components/ndvi/NDVIDashboard.tsx` (via `/app/ndvi`),
`components/phyto/TreatmentPlanner.tsx` (via `/app/nutrition`),
`components/planner/TaskCalendar.tsx` (via `/app/planner-classic` e
`/app/planner`), `components/vineyard/VineyardWizard.tsx` (via
`/app/vineyard`), `components/vivaio/TransplantToOrchardModal.tsx`
(via `SeedlingManager.tsx`, montato da `HomeDashboard.tsx`). Altri
candidati verificati vivi ma non scelti in questo lotto (restano
disponibili per il 67): `useDeviceOrientation.ts`, `useProductCards.ts`,
`services/biologicalControlService.ts`, `components/planner/PlannerAIChat.tsx`
(via `DiaryPlannerIntegration.tsx` -> `UnifiedTimelineDiary.tsx`,
`/app/diary`), `components/prescription/CostOptimizationPanel.tsx`
(via `PrescriptionMapsDashboard.tsx`, `/app/prescription-maps`).

40 -> 0 warning sugli 8 file (nessun warning intenzionale lasciato
questa volta). Import morti rimossi, `exhaustive-deps` risolto con
`useCallback` (per funzioni pure senza dipendenze da stato/props,
usata la function-declaration hoisted invece di `useCallback`, es.
`buildDiaryEntries` in `AutomatedDiaryViewer.tsx` — ma quando la
funzione chiude su stato/props del componente, la hoisted declaration
NON basta: ESLint la considera comunque instabile e richiede comunque
`useCallback` anche su di lei, vedi `loadHarvests` in
`HarvestDashboard.tsx`), `as any` sostituiti con union type reali o
interfacce dedicate, coppie `useState` con getter morto ma setter vivo
ridotte al solo binding necessario, variabile calcolata e mai
consumata rimossa (`averageQuality` in `HarvestDashboard.tsx`,
superata da `harvestAnalysis.averageQualityRating`).

**2 bug reali trovati e corretti (non solo gap registrati), stesso
principio D9/lotto 5/lotto 65:**
1. `components/phyto/TreatmentPlanner.tsx::loadRecommendation`:
   `suggestPhytoProduct`/`checkTreatmentTiming` si aspettano le
   previsioni meteo di **un singolo giorno** (`{tempMin, tempMax,
   precipitation, wind}`), ma ricevevano l'intero **array** `WeatherForecast[]`
   restituito da `getWeatherForecast` — e per giunta lo stato
   `weatherForecast` non ancora aggiornato (chiusura sullo state
   precedente, non sul valore appena caricato). Risultato: ogni
   controllo di sicurezza meteo (pioggia/temperatura/vento) prima di
   raccomandare o registrare un trattamento fitosanitario era
   silenziosamente disattivato, sempre. Anche la UI mostrava sempre
   "0mm/0°C/0 km/h" invece delle previsioni reali. Corretto passando
   `forecast?.[0]` (previsione di oggi, dal valore appena caricato) a
   entrambe le funzioni e alla UI.
2. `components/vivaio/TransplantToOrchardModal.tsx::handleTransplant`:
   il conteggio piante del filare veniva aggiornato scrivendo
   `plant_count`, un campo che non esiste su `FieldRow` (il campo
   reale e' `plantCount`) — l'incremento non veniva mai persistito.
   Corretto.

**1 metadato extra senza campo schema corrispondente, lasciato
invariato:** `TransplantToOrchardModal.tsx` scrive anche
`last_transplant` (data/batch/quantita'/operationId) nell'update del
filare, ma `FieldRow` non ha alcun campo con questo nome ne' un
equivalente — probabilmente ignorato dal layer di persistenza.
Tipizzato come metadato extra opzionale per non alterare il
comportamento, non rimosso ne' collegato a un campo reale (richiede
decisione di prodotto/schema).

Baseline globale verificata: **0 errori, 1.230 warning** (`1.270 -> 1.230`);
suite `test:release` 434/434 (9 suite), type-check e build produzione verdi.

### Aggiornamento T01 - lotto 67 (29/07/2026)

Nessuna nuova classificazione: il lotto ha usato i 5 candidati vivi
gia' verificati e registrati nel lotto 66 (`useDeviceOrientation.ts`
via `GardenOnboarding.tsx`, `useProductCards.ts` via
`TreatmentCalendarIntegration.tsx` -> `TaskCalendar.tsx`,
`services/biologicalControlService.ts` via `BiologicalControlDashboard.tsx`,
`components/planner/PlannerAIChat.tsx` via `DiaryPlannerIntegration.tsx`
-> `UnifiedTimelineDiary.tsx`, `components/prescription/CostOptimizationPanel.tsx`
via `PrescriptionMapsDashboard.tsx`), piu' 3 nuovi verificati con grep:
`lib/auth.server.ts` (vivo da molte route `app/api/**`), `services/cropRotationService.ts`
(vivo via `CropRotationPlanner.tsx` e `classicPlannerService.ts`),
`services/organizationService.ts` (vivo via `app/accept-invitation/page.tsx`
e `OrganizationManager.tsx`).

38 -> 0 warning sugli 8 file. Pattern ricorrente: molte mapper
DB->dominio con `data: any` tipizzate con l'interfaccia snake_case
della riga reale invece di un tipo generico; payload di update
dinamici (`dbUpdates: any`) tipizzati con `Record<string, unknown>`;
estensione non standard iOS `DeviceOrientationEvent.requestPermission`
(assente dai tipi DOM di TypeScript) tipizzata con un'interfaccia
locale invece di `any` ripetuto 4 volte.

**Nota di tipizzazione non banale:** in `organizationService.ts::hasPermission`/`getUserAccessibleGardens`,
il join Supabase `roles!inner(permissions)` viene dedotto dal type
checker come array (`{permissions}[]`) anche se a runtime e' un
oggetto singolo (foreign key 1:1) — la funzione autorizzativa
funziona in produzione trattandolo come oggetto singolo, quindi il
comportamento e' quello corretto e il cast e' passato tramite
`unknown` per bypassare la deduzione imprecisa del client Supabase su
questa versione, senza usare `any`.

Baseline globale verificata: **0 errori, 1.191 warning** (`1.230 -> 1.191`);
suite `test:release` 434/434 (9 suite), type-check e build produzione verdi.

### Aggiornamento T01 - lotto 68 (29/07/2026)

7 file vivi verificati con grep sui reali importer (non per inferenza dal
nome): `services/exifReader.ts` (via `GardenOnboarding.tsx`, live),
`services/fieldRowCropHistoryService.ts` (via `app/app/advice/page.tsx`,
route reale), `components/crops/AddWoodyCropWizard.tsx` (via
`AddCropWizard.tsx`, live dal lotto 13), `services/notificationService.ts`
(via le route `app/api/cron/**`), `services/operationExecutionBridgeService.ts`
(via `app/app/irrigation/page.tsx` e `HomeDashboard.tsx`),
`services/sensorDataService.ts` (via `app/app/smart/page.tsx` e
`app/api/sensors/readings/route.ts`), `services/apiConfigurationService.ts`
(vivo transitivamente: `aiProviderAdapter.ts` -> `geminiService.ts` ->
`app/api/ai/generate/route.ts`, route reale).

33 -> 0 warning sugli 7 file. Pattern ricorrente: `supabaseClient: any` tipizzato
con `SupabaseClient` da `@supabase/supabase-js`; payload di update dinamici
tipizzati con l'interfaccia reale della riga o un `Partial<Pick<...>>` mirato;
`catch (error: any)` sostituito da `catch (error)` con `error instanceof Error`;
cast `as any` su union discriminate (esito rilevamento frutteto/oliveto/vigneto,
valori di `<select>`) sostituiti con l'union reale o il cast al tipo specifico.

**Bug reale trovato e corretto, in codice gia' noto come morto:**
`services/continuousMonitoringService.ts::sendAlertNotification` chiamava
`sendNotification(notification, {})`, passando un oggetto vuoto al posto del
client Supabase — prima invisibile perche' il parametro era tipizzato `any`
in `notificationService.ts`; tipizzandolo `SupabaseClient` in questo lotto,
il type-check ha smascherato la chiamata come non valida (`{}.from is not a
function` se mai eseguita). Corretto recuperando un client reale con
`getSupabaseClient()` e uscendo con log se non disponibile, solo per
sbloccare `tsc --noEmit` — nessuna rimozione del file. Il file stesso
(`components/monitoring/ContinuousMonitoringDashboard.tsx`, portato vivo a
zero warning nel lotto 2, e `services/intelligentNotificationService.ts`,
suo unico consumer) risultano gia' orfani **dal lotto 64** (non una
scoperta di questo lotto): la riverifica con grep in questa sessione
conferma solo che la classificazione precedente resta corretta.

**Selezione dei candidati per questo lotto:** la classifica ESLint
rigenerata era ancora dominata da candidati gia' classificati come morti
nei lotti 63-65 (`ListView.tsx`, `VisualGardenPlanner.tsx`,
`SimplifiedPlantingForm.tsx`, `SpecializedCropForm.tsx`,
`RecallProcedure.tsx`, `MaturityTracker.tsx`, `WeeklyPhotoReminder.tsx`,
`integratedStaggeringService.ts`, `AIActionButton.tsx`/`aiProxyService.ts`,
`TreatmentDashboardWidget.tsx`/`SmartTreatmentWizard.tsx`,
`UnifiedDashboard.tsx`/`PredictiveDashboard.tsx`,
`DataBackup.tsx`/`importService.ts`, `WateringLogFormWithFieldRows.tsx`,
`GeographicMatchingWidget.tsx`, `OliveHarvest.tsx`, `VineHarvest.tsx`,
`exportReportPDF.ts`, `QuickOperationModal.tsx`, `BrixTracker.tsx`,
`OliveManagementDashboard.tsx`, `SoilAnalysisForm.tsx`); la riverifica con
grep in questo lotto ha solo confermato che restano zero-importer, nessuna
new entry. **Estensione della cascata GardenView del lotto 66:** quel
lotto aveva registrato `EnvironmentalPlanningSection.tsx`,
`SunExposureWidget.tsx` e `SunExposureDetailModal.tsx` come orfani
conseguenti alla scoperta di `GardenView.tsx` orfano, ma non aveva
verificato `components/gardens/BedManager.tsx` (dato per vivo "via
GardenView.tsx" nel lotto 64) ne' `components/gardens/RowManagerModal.tsx`
(unico importer di `BedManager.tsx`) — grep ricorsivo in questo lotto
conferma che anche questi due sono ormai zero-importer, stessa cascata,
aggiunti a O45. Nuovi candidati zero-importer non ancora censiti prima
d'ora: `components/vineyard/VineyardManagementDashboard.tsx`,
`components/compliance/SelfAssessmentForm.tsx`,
`components/shared/GardenBedsWidget.tsx`, `services/composterService.ts`,
`components/settings/APIConfigurationForm.tsx` (il servizio sottostante
`apiConfigurationService.ts` resta vivo per altra via, vedi sopra).

**Gap noto, non toccato:** `services/fieldRowCropHistoryService.ts::getRotationSuggestions`
accetta un parametro `zoneId` (passato da un chiamante reale,
`FieldRowCropHistoryPanel.tsx`), ma la RPC Postgres `get_rotation_suggestions`
(vedi `supabase/migrations/20260330143000_patch_remote_schema_drift.sql`)
accetta solo `row_id` — non esiste alcun filtro per zona lato database. Non e'
un bug di wiring lato client (il dato non c'e' proprio nello schema): i
suggerimenti di rotazione restano sempre a livello di intero filare,
indipendentemente dalla zona passata. Richiede una nuova RPC/migrazione per
essere chiuso, non un fix di lint. Parametro mantenuto nella firma pubblica
(con `void zoneId` esplicito) per non rompere i chiamanti.

Baseline globale verificata: **0 errori, 1.158 warning** (`1.191 -> 1.158`);
suite `test:release` 434/434 (9 suite), type-check e build produzione (153
pagine) verdi.

### Aggiornamento T01 - lotto 69 (29/07/2026)

8 file vivi verificati con grep sui reali importer (nessuno gia' censito
nei lotti precedenti, controllato preventivamente su questo stesso
documento): `components/FruitTreeManagement.tsx` (via `HomeDashboard.tsx`),
`services/healthAlertEngine.ts` (via `app/api/cron/health-check/route.ts`,
route reale), `services/preciseSunCalculator.ts` (via molteplici route
`app/api/garden/sun-exposure/**`), `services/predictionOutcomeService.ts`
(via `app/api/ai/predictions/[id]/outcome/route.ts`, route reale),
`services/regulatoryExportService.server.ts` (via `app/api/export/pdf` e
`/csv/route.ts`), `services/seedlingService.ts` (via `SeedlingManager.tsx`,
`components/seedling/SeedlingDashboard.tsx` e `seedlingBatchHelper.ts`, gia'
vivi dal lotto 8), `services/globalGapComplianceService.ts` (via
`GlobalGapDashboard.tsx` -> `CertificationsDashboard.tsx`, route
`/app/certifications`), `components/certifications/BioCertificationForm.tsx`
(stessa route, via `CertificationsDashboard.tsx`).

32 -> 0 warning sugli 8 file. Pattern ricorrente: parametri `garden`/
`onUpdateTask` dichiarati ma mai letti nel corpo, rimossi da firma e
aggiornati i 4 call site (non un caso "richiesto dall'interfaccia esterna",
qui erano funzioni interne al progetto); variabili locali calcolate e mai
lette (`stepsPerHour` duplicato in due funzioni, `decemberStart`/
`startMonth`, `totalApplicablePoints`, funzione `daysBetween` intera mai
chiamata, funzione esportata `calculateOptimalSowingDate` mai chiamata da
nessuno — rimossa); `any` su righe JSONB/Supabase tipizzate con
l'interfaccia reale gia' esistente altrove nel progetto
(`PredictionBundle`/`DiseasePredicition`/`YieldPrediction`/
`ResourceOptimization` da `agronomicPredictionPipelineService.ts`/
`aiPredictiveEngine.ts`, `GlobalGapChecklist`/`ChecklistSection`/
`CommunicationTestResult` da `types/globalGapCompliance.ts`); query builder
Supabase generico (`applyPeriod`) tipizzato con un parametro generico
vincolato a un'interfaccia strutturale minima invece di `any`, per
preservare il tipo reale del chiamante lungo tutta la catena; setter React
con valore dipendente dalla chiave (`handleInputChange<K>`) reso generico
invece di accettare `any`.

**Nota di sicurezza tipi:** tipizzare `predictionOutcomeService.ts` ha
esposto che `Array.prototype.find()` puo' restituire `undefined` — il
controllo numerico esistente (`!Number.isFinite(predicted)`) copriva gia'
implicitamente questo caso a runtime (un `prediction` assente produce
`Number(undefined) = NaN`), ma serviva un controllo esplicito `!prediction`
per soddisfare lo strict-null-checking di `tsc`. Nessun cambio di
comportamento, solo la stessa condizione resa esplicita.

**Gap reale trovato, NON toccato — troppo esteso per questo lotto:**
`services/zoneManagementService.ts` (`ZoneManagementService`, usato da
`components/prescription/ZoneManagementPanel.tsx` -> `PrescriptionMapsDashboard.tsx`,
`/app/prescription-maps`, tutti vivi) interroga tabelle `zones`,
`zone_fields` e `zone_rows` che **non esistono in nessuna migrazione del
repository** (verificato con grep ricorsivo su `supabase/migrations/`; la
tabella reale e' `land_zones`, creata in
`20260204120000_add_land_zones_and_soil_memory.sql`, con un proprio schema
per campi/filari sotto nomi diversi). In piu', il costruttore riceve
`storageProvider` (un `IStorageProvider`, l'astrazione di dominio usata
ovunque nel progetto) mentre il corpo della classe chiama
`this.supabase.from(...)` come se fosse un client Postgrest grezzo —
`IStorageProvider` non espone alcun metodo `.from`. Il metodo pubblico
`analyzeZone()` e' effettivamente invocato dal pannello live
(`zoneService.analyzeZone(zone.id)` in `ZoneManagementPanel.tsx:129`): ogni
volta che un utente reale clicca "Analizza zona" nella pagina Prescription
Maps, la chiamata fallisce silenziosamente (catturata da un try/catch che
logga e rilancia l'errore). **Non e' un fix meccanico**: richiede
rimappare l'intero servizio sullo schema `land_zones`/filari reale (nomi
tabella, nomi colonna, e sostituire l'iniezione dello `storageProvider`
con un vero client Supabase o con i metodi `IStorageProvider` equivalenti,
se esistono) — una sessione dedicata, non un lotto di lint. Registrato
come **O67** nel registro §5.1.

Baseline globale verificata: **0 errori, 1.126 warning** (`1.158 -> 1.126`);
suite `test:release` 434/434 (9 suite), type-check e build produzione (153
pagine) verdi.

### Aggiornamento T01 - lotto 70 (29/07/2026)

La classifica ESLint rigenerata era ancora dominata da candidati gia'
classificati come morti nei lotti 63-66 (nessuna nuova verifica necessaria,
gia' confermato dai lotti precedenti). Scendendo oltre il rank 60 sono
emersi 9 servizi piu' piccoli (3 warning ciascuno), tutti nuovi per questa
campagna (verificato con grep sul documento prima di scriverli): `services/orchardDetectionService.ts`
(vivo via `AddWoodyCropWizard.tsx`, gia' noto dal lotto 68),
`services/seasonalPlantSuggestions.ts` (vivo via la route
`app/api/garden/sun-exposure/plant-suggestions/route.ts`),
`services/geoClimateService.ts` (vivo via `GardenOnboarding.tsx`),
`services/authErrorHandler.ts` (vivo via `app/api/auth/register/route.ts`
e le pagine `forgot-password`/`reset-password`), `services/dailyDiaryService.ts`
(vivo via la route `app/api/cron/daily-diary/route.ts` e
`AutomatedDiaryViewer.tsx`), `services/fieldRowPlantIntegrationService.ts`
(vivo via `SmartPlantManager.tsx`), `services/ndviSatelliteService.ts`
(vivo via `NDVIDashboard.tsx`, `/app/ndvi`), `services/notificationDeliveryService.ts`
(vivo via la route `app/api/cron/notification-delivery/route.ts`),
`services/smartOperationsService.ts` (vivo via `SmartPlanner.tsx`).

27 -> 0 warning sui 9 file. Pattern ricorrente: `client: any`/`supabaseClient: any`
tipizzati con `SupabaseClient`; funzioni/parametri esportati mai chiamati da
nessuno rimossi per intero (`handleLoginError` lasciato — e' parte di
un'API di gestione errori con 2 sorelle vive, non una funzione isolata —
ma gli altri due metodi tipizzati con `unknown` + narrowing locale invece
di `any`, dato che i chiamanti reali passano sia oggetti errore Supabase
sia `catch (error: unknown)`); ritorni di funzione tipizzati con
l'interfaccia gia' dichiarata da un'altra funzione sorella nello stesso
file invece di duplicarla (`NDVIStressArea` estratta e riusata 3 volte in
`ndviSatelliteService.ts`); parametro `date` passato a `calculateETo` ma
mai usato nel corpo (il commento della funzione dichiara esplicitamente
"per semplicita' usiamo un valore medio", non un gap nascosto — rimosso
dalla firma e dal call site).

**Bug reale trovato e corretto:** `services/fieldRowPlantIntegrationService.ts::generateDefaultPlantingContext`
costruiva un oggetto con nomi di campo diversi da quelli reali di
`GardenPlant['plantingContext']` (`weather.temp` invece di
`weather.temperature`, `moon` invece di `lunar`, `moon.emoji` invece di
`lunar.phaseEmoji`, `moon.waxing` invece di `lunar.isWaxing`,
`daylight.hours` invece di `daylight.hoursOfLight`, mancavano del tutto
`timestamp` e `weather.precipitation`/`windSpeed`/`pressure` e
`lunar.dayInCycle`) — mascherato finora dal tipo di ritorno `any`.
Confermato un consumer reale che legge esattamente questi campi:
`components/plants/PlantDetailModal.tsx` (righe 316-373). Per ogni pianta
generata in blocco da un filare (`generatePlantsFromFieldRow`/
`generateDemoPlants`), il pannello dettaglio pianta perdeva silenziosamente
l'intera sezione fase lunare (campo `lunar` inesistente) e la temperatura/ore
di luce (nomi di campo diversi), mostrando solo condizione meteo e umidita'
fissi (65%, "sunny", identici per ogni pianta). Corretto rinominando i
campi sullo schema reale e aggiungendo i campi mancanti con valori di
default coerenti con la natura "contesto di fallback" della funzione
(`precipitation: 0`, `windSpeed: 0`, `pressure: 1013`,
`dayInCycle: dayOfMonth`); nessuna modifica alla logica di stima
stagione/fase lunare stessa, solo alla forma dell'oggetto restituito.

Baseline globale verificata: **0 errori, 1.099 warning** (`1.126 -> 1.099`);
suite `test:release` 434/434 (9 suite), type-check e build produzione (153
pagine) verdi.

### Aggiornamento T01 - lotto 71 (29/07/2026)

Nove file vivi portati da 36 warning complessivi a 3 (lasciati intenzionali):
`services/plantingDensityService.ts` 4 -> 0, `components/ai/AISuggestionsWidget.tsx`
4 -> 0, `components/director/DirectorBriefingWidget.tsx` 4 -> 0,
`components/fieldrows/FieldRowCropHistoryPanel.tsx` 4 -> 0,
`components/planner/AlmanaccoIntegration.tsx` 4 -> 0,
`components/plants/PlantHealthHeatmap.tsx` 4 -> 1, `components/seedbank/SeedInventory.tsx`
4 -> 0, `components/settings/OrganizationManager.tsx` 4 -> 1,
`components/sunExposure/CompassCalibrator.tsx` 4 -> 1. Pattern ricorrente:
import morti, loader stabilizzati con `useCallback`, `as any` sostituiti con
i tipi reali gia' dichiarati nel dominio. Lasciati intenzionali 2 `no-img-element`
(foto dichiarate URL o base64, origine non verificata in questo lotto) e 1
`exhaustive-deps` su un effect mount-only che chiama `loadOrganizations` (la
quale a sua volta setta `selectedOrg`): includerla tra le dipendenze
causerebbe un refetch ad ogni cambio di `selectedOrg`, stesso pattern gia'
visto su `AddCropWizard` nel lotto 13.

**Bug reale trovato e corretto in codice vivo:** `DirectorBriefingWidget.tsx`
(montato in `HomeDashboard.tsx`, route `/app`) calcolava la variante del
`Badge` per priorita' e urgenza con due funzioni (`priorityColor`,
`urgencyTone`) che per i casi piu' critici (`CRITICAL`, `immediate`)
restituivano la stringa `'destructive'` — valore assente nell'union type
del componente (`default|secondary|success|warning|error|outline`).
`variantClasses[variant]` risultava quindi `undefined` e il badge perdeva
silenziosamente ogni colore per esattamente le azioni piu' urgenti del
briefing giornaliero, senza errori a runtime. Corretto mappando su
`'error'` (la variante rossa esistente piu' vicina) ed esportando un tipo
`BadgeVariant` da `components/ui/badge.tsx` cosi' che l'incoerenza sia
rilevata a compile-time in futuro.

Verificata la raggiungibilita' di ogni candidato prima di toccarlo (BFS
sugli import fino alle route `app/**/page.tsx`): scartati per
irraggiungibilita' `services/composterService.ts`, `services/diaryPredictiveEngine.ts`,
`services/iotSensorService.ts`, `services/photoLogService.ts` (unico
importer `PhotoTimelapse.tsx`, a sua volta orfano), `services/vineyardBudLoadService.ts`,
`services/continuousMonitoringService.ts` (unico importer vivo apparente
`ContinuousMonitoringDashboard.tsx`, gia' orfano dal lotto 68),
`services/geographicMatchingService.ts` (importer `components/Planner.tsx`,
parte del cluster "AI Planner" morto M05, escluso su decisione utente).
`services/zoneManagementService.ts` e' vivo ma resta il gap noto **O67**
(query su tabelle inesistenti) — lasciato intatto, richiede una sessione
dedicata.

Baseline globale verificata: **0 errori, 1.066 warning** (`1.099 -> 1.066`);
`npx tsc --noEmit` sull'intero progetto senza errori; lint mirato sui 9
file 3/36 residui (tutti intenzionali).

## 6. Verifica trasversale dopo M15

Eseguita il 24/07/2026 sulla baseline locale:

- audit debito release corrente: 104 voci, di cui 81 pianificate, 13 accettate e 10 isolate; nessuna voce release non classificata e zero voci M09-M12;
- audit migrazioni: `safeToApply=false`, coerente con il blocco M06;
- suite release: 355/355 test superati;
- build produzione: completata, 147 pagine generate;
- rischio remoto invariato: queste prove non sostituiscono staging, restore drill, pilot o provider reali.

## 7. Prossima azione

Ordine operativo aggiornato al 28/07/2026:

1. pubblicare questo cruscotto come fonte unica dello stato;
2. riprendere T01 dal lotto 43 sul successivo percorso vivo;
3. chiudere O48 per la parte implementabile senza credenziali provider;
4. registrare e decidere i gap di prodotto gia' diagnosticati, senza
   riaprirli incidentalmente durante altri lotti;
5. quando esiste un target isolato, eseguire la sequenza remota
   O01/O03 -> O06-O15 -> O18/O23/O27-O28 -> O38-O43;
6. con owner e dati reali, eseguire O29-O37;
7. rieseguire M16 soltanto dopo la chiusura o esclusione formale di ogni gate.

M10, M11 e M15 non sono piu' da “implementare”: il loro codice e' gia'
presente. Restano le prove provider, staging ed E2E indicate nel cruscotto.

## 8. Deploy in produzione 24/07/2026 (decisione esplicita, gate O06 non soddisfatto)

Il 24/07/2026, su decisione esplicita dell'utente, il lavoro M01-M09 (branch `agent/completion-roadmap-m01-m09`, commit `2b2afaa`) e' stato portato in produzione senza attendere lo staging previsto da O06:

- **Codice:** fast-forward pulito (`main` era ancestor di `2b2afaa`, nessun conflitto) e push su `origin/main` (`8c37854..2b2afaa`); il deploy Vercel si attiva dall'integrazione GitHub standard su push a `main` e non e' stato verificato direttamente da questa sessione (nessun tool Vercel disponibile).
- **Database:** le 8 migrazioni nuove sono state applicate direttamente al progetto Supabase di produzione (`qhmujoivfxftlrcrluaj`), in ordine: `create_macerate_logs`, `land_zones_garden_ownership`, `garden_soil_states`, `notification_delivery_lifecycle`, `task_transition_ledger`, `link_custom_plans_to_tasks`, `season_adjustment_decisions`, `archive_completed_garden_tasks`. Verifica pre-applicazione: nessuna riga orfana in `land_zones` (query diretta, 0 risultati) prima di imporre `NOT NULL` su `garden_id`. Verifica post-applicazione: tutte e 8 presenti in `list_migrations`; `get_advisors(security)` non segnala nulla di nuovo oltre un WARN atteso (`transition_garden_task` raggiungibile da `anon` via RPC, ma la funzione stessa richiede `auth.uid()` non nullo e solleva `authentication_required` altrimenti — difesa interna gia' presente, non una falla).
- **Rischio esplicitamente accettato:** nessuno staging isolato ha mai validato queste migrazioni (O06-O08 restano aperti); nessun restore drill (O10-O12) le copre; se una di queste emergesse come difettosa in produzione, il rollback non e' stato provato.
- **Non cambia:** il resto del registro O01-O44 (M10-M16) resta nello stato descritto sopra. Questo deploy porta in produzione la convergenza provider M09 e le migrazioni M03/M04, non chiude M06-M08 ne' alcuna milestone successiva.
