# OrtoMio Pro - Piano master di completamento

- **Versione:** 1.1
- **Data di apertura:** 24 luglio 2026
- **Repository:** `magmadvlab/ortomio-pro`
- **Branch di lavoro iniziale:** `claude/migrations-feature-flags-cd3c51`
- **Baseline iniziale:** `8c37854f51b93585720e6c54e1a84b8b1c7c6879`
- **Stato generale:** in corso; prodotto non ancora certificato per la release commerciale 1.0
- **Stato esecuzione:** 2 milestone chiuse per la release (M01-M02); 3 baseline/censimenti locali conclusi ma con gate o residui trasferiti (M03-M05); 10 milestone aperte o bloccate (M06-M15); M16 non iniziata
- **Deploy readiness:** `false`
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
| M04 | `[L]` locale | Suolo persistente e seed senza fallback mock | Migrazione staging; helper seed trasferiti a M09 (`O03-O04`) |
| M05 | `[L]` censimento | Baseline iniziale di 203 occorrenze; gate nuove voci | 172 voci correnti assegnate a M09-M15 (`O05`) |
| M06 | `[!]` bloccato | Inventario migrazioni e runbook | Staging, dump, duplicati, orfana e applicazione controllata (`O06-O09`) |
| M07 | `[!]` bloccato | Script backup/restore e template | Drill reale, restore selettivo, RPO/RTO (`O10-O12`) |
| M08 | `[!]` bloccato | Matrice RLS pronta | Prove SQL/API/UI, storage/admin e Security Advisor (`O13-O15`) |
| M09 | `[-]` in corso | Cloud fail-closed; seed confermati; quattro fallback e garden mock rimossi | Helper legacy, 46 voci, staging (`O16-O18`) |
| M10 | `[-]` parziale | Preferenze fail-closed e `sentAt` corretto | Intero lifecycle delivery (`O19-O24`) |
| M11 | `[-]` parziale | Baseline core e protocollo giornata | Transizioni, ruoli, DST e prova staging (`O25-O28`) |
| M12 | `[!]` bloccato | Protocollo pilot e guardrail | Azienda/dati/mezzi e ciclo reale (`O29-O30`) |
| M13 | `[-]` parziale | Smoke Open-Meteo reale | Provider avanzato e gestione operativa (`O31-O33`) |
| M14 | `[-]` parziale | Regressioni locali 9/9 | Dataset, periodo shadow, metriche e firma (`O34-O37`) |
| M15 | `[-]` parziale | Capability censite; token invito non loggato | Lifecycle commerciale completo (`O38-O43`) |
| M16 | `[ ]` non iniziato | — | Audit finale e decisione go/no-go (`O44`) |

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
- **Rischio residuo:** la migrazione `20260724120000_land_zones_garden_ownership.sql` e' verificata localmente ma deve ancora essere applicata e provata su staging. Le operazioni legacy di aggiornamento, cambio stato ed eliminazione restano protette dalle RLS rafforzate, ma non sono ancora migrate alla nuova API server.

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
- **Verifiche correnti:** `npm run audit:release-debt` verde il 24/07/2026; 192 voci totali: 46 assegnate a M09, 12 a M10, 39 a M11, 28 a M12, 20 a M13, 21 a M14 e 6 a M15; 10 accettate; 10 isolate come sviluppo/laboratorio.
- **Rischio residuo:** il censimento non equivale alla correzione delle 172 voci correnti pianificate. Il gate impedisce nuove voci non classificate, mentre la rimozione o implementazione viene verificata nei milestone proprietari. M05 non conta come chiuso per la release finche' il manifest non riflette gli esiti finali di M09-M15.

### M06 - Riconciliazione completa delle migrazioni

- **Stato:** `[!]` inventario completato; applicazione bloccata
- **Obiettivo:** allineare repository e schema remoto senza applicazioni cieche.
- **Baseline nota:** 40 migrazioni remote tracciate; 79 file locali da riconciliare.
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
- **Evidenza:** commit `95c324f` (`chore: inventory migration reconciliation blockers`), `M06_MIGRATION_RECONCILIATION_2026-07-24.csv` e `M06_MIGRATION_RUNBOOK_2026-07-24.md`.
- **Blocco:** manca un target staging isolato con snapshot/restore. Il dump schema read-only via CLI non e' stato eseguito perche' Docker Desktop non e' attivo. Nessun `db push` e nessuna riparazione della history sono autorizzati sul progetto collegato.
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
- **Blocco:** nessun source/target staging isolato e nessuno snapshot provider identificato; il drill non e' stato eseguito sul progetto collegato.

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
- **Risultato parziale:** mappa canonica dei domini prioritari; `createStorageProvider('cloud')` non degrada piu' a local storage; `StorageContext` non espone piu' il provider locale temporaneo ai consumer autenticati e non degrada silenziosamente su errore cloud; il diario attende lettura, persistenza e rilettura autorevole dell'inventario sementi; trattamenti, lavori meccanici, supporto ed esposizione solare falliscono esplicitamente senza database invece di simulare dati o successo.
- **Evidenza:** commit `270a214`, `bd2ed53`, test persistenza 22/22 e `M09_CANONICAL_PROVIDER_MAP_2026-07-24.md`.
- **Residuo:** helper cache sementi legacy, 46 voci M09 da verificare o riclassificare e certificazione staging.

### M10 - Notifiche operative e osservabilita'

- **Stato:** `[-]` semantica fail-closed corretta; delivery lifecycle incompleto
- **Obiettivo:** completare reminder essenziali senza falsi stati di consegna.
- **Attivita':**
  - scheduler persistente;
  - delivery reale osservabile;
  - retry e dead-letter;
  - deduplica e soppressione;
  - stato inviato/fallito confermato dal provider;
  - metriche, alert e runbook.
- **Criterio di uscita:** una notifica e' tracciabile dalla generazione alla consegna o al fallimento.
- **Risultato parziale:** un errore nella lettura preferenze sopprime l'invio invece di abilitarlo; `sentAt` resta legato al successo provider; gap delivery censiti.
- **Evidenza:** commit `2e55ac4` e `M10_NOTIFICATION_DELIVERY_GAPS_2026-07-24.md`.
- **Residuo:** coda persistente, scheduler, deduplica, retry/dead-letter, provider message ID, webhook e metriche.

### M11 - Core operativo end-to-end

- **Stato:** `[-]` baseline locale verificata; giornata staging mancante
- **Obiettivo:** ricertificare planner -> task -> esecuzione -> diario -> ledger -> outcome.
- **Attivita':**
  - consolidare stati e transizioni;
  - verificare annullamento, riapertura, retry e idempotenza;
  - verificare timezone Europe/Rome e ricorrenze;
  - eseguire giornata simulata con ruoli reali;
  - riconciliare manualmente il risultato finale.
- **Criterio di uscita:** ogni operazione ha un unico stato autorevole e auditabile.
- **Risultato parziale:** raccolte le prove locali su diario, idempotenza, task/ledger, outcome, timezone ed export; definita la sequenza della giornata simulata.
- **Evidenza:** commit `078bc55` e `M11_CORE_OPERATIONAL_DAY_2026-07-24.md`.
- **Residuo:** ruoli reali, riapertura/annullamento uniforme, ricorrenze/DST e riconciliazione staging.

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
- **Risultato parziale:** protocollo e guardrail definiti per irrigazione, nutrizione, trattamenti e salute; test lifecycle locali disponibili.
- **Evidenza:** commit `a23fefe` e `M12_AGRONOMIC_PILOT_PROTOCOL_2026-07-24.md`.
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

### M15 - Lifecycle commerciale e ruoli

- **Stato:** `[-]` capability esistenti censite; lifecycle commerciale incompleto
- **Obiettivo:** rendere il prodotto attivabile e amministrabile per clienti reali.
- **Attivita':**
  - provisioning azienda;
  - inviti e ruoli amministratore/responsabile/operatore;
  - piano/licenza e limiti;
  - rinnovo, sospensione e cancellazione;
  - fatturazione o procedura amministrativa iniziale;
  - assistenza e accesso amministratore OrtoMio auditato.
- **Criterio di uscita:** un cliente puo' attraversare l'intero ciclo commerciale senza interventi tecnici non documentati.
- **Risultato parziale:** registrazione, schema organizzazioni/ruoli/inviti e UI censiti; eliminato il log del token invito.
- **Evidenza:** commit `19cb061` e `M15_COMMERCIAL_LIFECYCLE_GAPS_2026-07-24.md`.
- **Residuo:** provisioning transazionale, delivery inviti server-side, licenze/limiti, rinnovo, fatturazione, sospensione, cancellazione e retention.

### M16 - Audit finale e go/no-go

- **Stato:** `[ ]`
- **Obiettivo:** produrre la decisione formale sulla release commerciale 1.0.
- **Attivita':**
  - type-check, lint, test, build e E2E sulla baseline finale;
  - migrazioni e rollback riproducibili;
  - test sicurezza e restore;
  - provider health e monitoraggio;
  - incident drill;
  - classificazione finale di tutte le capability;
  - verbale rischi residui e go/no-go.
- **Criterio di uscita:** `deployReady=true` supportato da evidenze remote e verbale approvato.

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

## 5.1 Registro unico del lavoro aperto

Questo registro contiene i deliverable ancora necessari. Gli ID sono stabili: una nuova scoperta aggiunge una riga; non rinumera o nasconde le precedenti.

| ID | Owner | Deliverable aperto | Condizione di chiusura |
|---|---|---|---|
| O01 | M03 | Applicare e provare la migrazione ownership zone in staging | Create/read e accesso cross-garden verdi sullo schema candidato |
| O02 | M03 | Migrare update, cambio stato ed eliminazione zone legacy alla API canonica | Nessuna mutazione production parallela |
| O03 | M04 | Applicare e provare `garden_soil_states` in staging | Read/write e RLS verificate sullo schema candidato |
| O04 | M09 | Eliminare o rendere non autorevoli gli helper sincroni seed legacy | Tutti i consumer usano il reader asincrono |
| O05 | M05 | Riconciliare gli esiti delle 172 voci correnti trasferite a M09-M15 | Manifest finale senza voce `scheduled` irrisolta |
| O06 | M06 | Rendere disponibile uno staging isolato con snapshot | Target e rollback identificati |
| O07 | M06 | Acquisire dump schema e confrontarlo con la history | Drift classificato per ogni oggetto |
| O08 | M06 | Risolvere timestamp duplicati e migrazione remota orfana | History univoca e motivata |
| O09 | M06 | Applicare e verificare i batch di migrazioni | Audit post-batch verde e rollback disponibile |
| O10 | M07 | Eseguire backup e restore drill reale | Restore completo ripetibile |
| O11 | M07 | Provare ripristino selettivo di un cliente | Dati cliente riconciliati |
| O12 | M07 | Misurare e approvare RPO/RTO | Valori registrati nel runbook |
| O13 | M08 | Eseguire matrice isolamento SQL/API/UI con due clienti | Tutti i negativi attesi risultano negati |
| O14 | M08 | Certificare storage, cron, export, cache e admin | Nessun percorso cross-tenant |
| O15 | M08 | Rieseguire Security Advisor | Nessun finding release-blocking aperto |
| O16 | M09 | Verificare o riclassificare le 46 voci M09 residue | Ogni voce corretta, rimossa o assegnata senza duplicazione |
| O17 | M09 | Eliminare altri fallback locali o successi simulati production | Audit mirato e test fail-closed verdi |
| O18 | M09 | Certificare reader/writer canonici in staging | Stato ricostruibile per ogni dominio prioritario |
| O19 | M10 | Implementare coda notifiche persistente | Evento accodato e auditabile |
| O20 | M10 | Implementare scheduler e deduplica/soppressione | Nessun doppio invio nel caso provato |
| O21 | M10 | Implementare retry con backoff | Retry osservabile e limitato |
| O22 | M10 | Implementare dead-letter e procedura recupero | Fallimenti terminali ispezionabili |
| O23 | M10 | Registrare provider message ID e webhook delivery | Stato finale confermato dal provider |
| O24 | M10 | Aggiungere metriche, alert e runbook | Delivery lifecycle operabile |
| O25 | M11 | Uniformare riapertura, annullamento e motivazione | Transizioni auditabili per tutti i task |
| O26 | M11 | Verificare ricorrenze, timezone e DST | Casi Europe/Rome verdi |
| O27 | M11 | Eseguire giornata completa con ruoli reali | Planner-outcome completato senza interventi fuori flusso |
| O28 | M11 | Riconciliare ledger e risultato su staging | Stato finale unico e ricostruibile |
| O29 | M12 | Identificare azienda, dataset, mezzi, cataloghi e responsabile pilot | Input pilot approvati |
| O30 | M12 | Eseguire ciclo agronomico reale con approvazione umana | Segnale-decisione-esecuzione-outcome documentato |
| O31 | M13 | Scegliere Sentinel oppure ThingsBoard e assegnare owner | Decisione e perimetro registrati |
| O32 | M13 | Configurare credenziali e smoke staging | Provider reale osservabile |
| O33 | M13 | Definire SLA, costi, monitoraggio e kill switch | Runbook provider approvato |
| O34 | M14 | Approvare dataset regressivo reale | Dataset versionato e firmato |
| O35 | M14 | Eseguire periodo shadow | Raccomandazioni e decisioni raccolte |
| O36 | M14 | Calcolare metriche e soglie rollback | Falsi positivi, accettazione e outcome misurati |
| O37 | M14 | Ottenere revisione agronomica firmata | Report shadow approvato |
| O38 | M15 | Rendere transazionale il provisioning azienda | Cliente attivato senza intervento DB manuale |
| O39 | M15 | Implementare delivery inviti server-side e ruoli | Invito consegnato, accettato e auditato |
| O40 | M15 | Implementare licenze, piani e limiti | Enforcement verificato |
| O41 | M15 | Implementare rinnovo e fatturazione/procedura iniziale | Ciclo economico documentato |
| O42 | M15 | Implementare sospensione e riattivazione | Accessi e dati coerenti |
| O43 | M15 | Implementare cancellazione, retention e accesso assistenza auditato | Lifecycle di uscita verificato |
| O44 | M16 | Eseguire audit finale e verbale go/no-go | `deployReady=true` con evidenze oppure no-go motivato |
| T01 | Trasversale | Inventariare e ridurre i 2.733 warning lint storici | Baseline per categoria e trend registrati; zero warning release-blocking |

## 6. Verifica trasversale dopo M15

Eseguita il 24/07/2026 sulla baseline locale:

- audit debito release corrente: 192 voci, di cui 172 pianificate, 10 accettate e 10 isolate; nessuna voce release non classificata;
- audit migrazioni: `safeToApply=false`, coerente con il blocco M06;
- suite release: 307/307 test superati;
- build produzione: completata, 147 pagine generate;
- rischio remoto invariato: queste prove non sostituiscono staging, restore drill, pilot o provider reali.

## 7. Prossima azione

Riprendere dal primo lavoro locale non bloccato:

1. completare `O16-O17` di M09, uniche attività locali prioritarie gia' in corso;
2. predisporre staging (`O06`) per sbloccare M03-M04 e M06-M08;
3. implementare M10 (`O19-O24`);
4. proseguire M11 e identificare gli owner esterni di M12-M14;
5. progettare e implementare M15;
6. eseguire M16 soltanto quando `O01-O43` sono chiusi o formalmente esclusi dalla release.
