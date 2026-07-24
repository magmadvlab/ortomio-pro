# OrtoMio Pro — Roadmap di industrializzazione (W0→W6)

- **Versione:** 1.0
- **Data:** 22 luglio 2026
- **Repository:** `magmadvlab/ortomio-pro`, branch `main`
- **Baseline verificata:** `origin/main` = `c2ac887` (PR #40 mergiata)
- **Database verificato:** Supabase `qhmujoivfxftlrcrluaj` (query dirette eseguite in questa sessione, non solo lette da documento)
- **Fonti:** `OrtoMio_Pro_Specifica_Completamento_Industrializzazione_v1.1_22luglio.docx` (matrice 29 capability, fasi W0-W6, DoD) + verifica live di questa sessione + `docs/reports/execution-plans/ORTOMIO_PIANO_ESECUTIVO_COMPLETAMENTO_2026-07-16.md` (piano precedente P0-P9)

## 0. Relazione con i documenti precedenti

Esistono tre livelli, non ridondanti:

1. **Piano P0-P9 (16/07)** — dichiarato "completato e verificato per la baseline locale" ma **non verificato in produzione/remoto**. La Specifica v1.1 lo ha riclassificato: molte capability che il piano P0-P9 considerava chiuse risultano oggi `COLLEGATO PARZIALE`, `PRESENTE NON DIMOSTRATO` o `DISATTIVATO`. Lezione da non ripetere in questo documento: **non dichiarare mai uno stato superiore a quello dimostrato da una query o da un test eseguito realmente**.
2. **Specifica v1.1 (18-22/07)** — l'audit statico più recente e la matrice delle 29 capability, con le fasi esecutive W0-W6. Resta la fonte di verità per **cosa** va fatto e in **che ordine**. Non riscritta qui.
3. **Questo documento** — aggiunge lo **stato verificato con prove dirette** (git + query SQL reali, non letture di documento) e trasforma la fase W1 in task eseguibili con percorsi e numeri esatti.

## 1. Stato verificato oggi (con prova, non per lettura di documento)

| Fatto | Prova |
|---|---|
| PR #40 mergiata | `origin/main` = `c2ac887`, contiene il merge |
| `daily_weather_log` scrive righe reali | Query diretta: 4 righe `2026-07-22 13:43`, `garden_id` valorizzato |
| Migrazioni tracciate remote | `SELECT count(*) FROM supabase_migrations.schema_migrations` = **40** |
| `IRRIGATION_ZONES` | `true` in `config/features.ts` su `origin/main` |
| `AI_PREDICTIONS` | `false` — blocchi tecnici chiusi, resta solo decisione di prodotto |
| File di migrazione locali totali | 118 `.sql` + 2 rinominati (`.bak`, `.skip`) + 1 senza timestamp (`EMERGENCY_fix_tier_online.sql`) = 121 |
| **Migrazioni locali non presenti nella history remota** | **79** (nuovo conteggio esatto, sostituisce la stima "~68" della sessione precedente) |
| **Orfano remoto non ancora individuato prima d'ora** | `20260108220000` è tracciato in `schema_migrations` ma **non esiste alcun file locale corrispondente** — un 13° caso oltre ai 12 già ripuliti il 21/07 |

Nota operativa: la copia locale `/Users/magma/Downloads/ortomio-main` (checkout separato, non questo worktree) è ferma 26 commit indietro rispetto a `origin/main` (`8b1ab4b`) — è antenato, non un ramo divergente, ma va aggiornata con `git pull` prima di usarla per verifiche, altrimenti si leggono flag e file vecchi.

## 2. Le fasi W0-W6 (dalla Specifica v1.1 §6), stato aggiornato

### W0 — Ricertificazione della baseline: **CHIUSA**
Gate di uscita richiesto: "Repository inventariata, build/test baseline registrati, matrice allineata al commit effettivo." Soddisfatto: baseline `ffa27f9b` confermata antenata diretta di `origin/main` con soli 18 commit di distanza (tutti noti, elencati in §9 della Specifica). Nessuna capability della matrice richiede un nuovo giro di inventario prima di W1.

### W1 — Fondazione dati e sicurezza: **IN CORSO**
Gate di uscita richiesto: "Un provider autorevole per dominio, test RLS verdi, restore drill completato." Non ancora raggiunto. Lavoro residuo concreto:

1. **Riconciliazione migrazioni (79 file)** — vedi §3 sotto per il piano operativo.
2. **Orfano `20260108220000`** — capire cosa introduceva (nessun file locale, solo il record in `schema_migrations`); decidere se è innocuo (drift già coperto da altre migrazioni) o se manca davvero uno schema.
3. **3 file a naming rotto** (`20260104000000_add_field_rows_to_operations.sql.bak`, `20260111000000_integrate_plant_row_tracking.sql.skip`, `EMERGENCY_fix_tier_online.sql`) — mai valutati nel merito, solo notati come "da decidere" da tre sessioni.
4. **Pilot RLS multi-azienda** — la Specifica (capability #1) richiede "fixture multi-azienda e test di accessi incrociati negativi": mai eseguito, né in locale né in remoto.
5. **Convergenza storage provider** (capability #27) — mappare dominio→provider per ogni reader/writer e rimuovere fallback silenziosi residui.

### W2-W6 — non iniziate
Restano allo stato descritto nella Specifica v1.1 §6 (Core operativo, Operazioni agronomiche, Integrazioni/precision farming, Verticali avanzati/AI, Release candidate). Nessun lavoro di questa sessione le ha toccate. Non duplico qui il contenuto — resta valido quello scritto nella Specifica.

## 3. Piano operativo per chiudere W1 — migrazioni (79 file)

Vincolo noto: piano Supabase **free**, nessun branch/staging disponibile. Il metodo sicuro già validato nelle sessioni precedenti è: query di sola lettura su `information_schema` per ogni oggetto (tabella/colonna/indice) che la migrazione dichiara di creare, **prima** di qualunque `apply_migration`.

**Passi:**

1. Per ciascuno dei 79 file, estrarre gli oggetti dichiarati (`CREATE TABLE`, `ALTER TABLE ... ADD COLUMN`, `CREATE INDEX`, policy RLS).
2. Eseguire una query `information_schema.columns` / `information_schema.tables` / `pg_policies` per verificare se l'oggetto esiste già (drift preesistente, come già accaduto con P5) o manca davvero.
3. Classificare ogni file in tre gruppi:
   - **Drift confermato** → applicare comunque (idempotente, sicuro, come fatto con `20260717030000_p5_health_prediction_monitoring`), solo per allineare `schema_migrations` alla realtà.
   - **Mancante davvero** → richiede review dell'SQL prima di un `apply_migration` reale su produzione (nessun rollback automatico disponibile).
   - **Obsoleto/superato** → da rimuovere dal repository (come già fatto il 21/07 per 4 duplicati), non da applicare.
4. Procedere in lotti piccoli (5-10 file per volta), non un unico batch da 79 — ogni lotto deve produrre una query di verifica post-apply prima di passare al successivo.
5. Per l'orfano `20260108220000`: cercare nei log/PR storici (`git log --all --grep=20260108`) se un file con questo timestamp è mai esistito e fu rinominato/cancellato; se non si trova nulla, verificare via `information_schema` quali oggetti sono comparsi in quella finestra temporale e decidere con l'utente se accettare il gap.
6. Per i 3 file a naming rotto: leggere il contenuto SQL di ciascuno, capire se è già coperto da migrazioni successive (probabile, dato che sono i più vecchi del lotto, gennaio 2026) e proporre a l'utente: ripristinare rinominandoli, oppure eliminarli con motivazione scritta nel commit.

## 4. Decisioni di prodotto che bloccano W2+ (non eseguibili da soli)

La Specifica vieta esplicitamente di decidere questi punti per inferenza. Elenco ridotto ai soli item che bloccano l'avvio di W2, con raccomandazione:

| Decisione | Raccomandazione | Perché blocca |
|---|---|---|
| **AI_PREDICTIONS**: accendere ora (stato "dati insufficienti" onesto) o attendere accumulo dati reali | Accendere ora — coerente con la regola della Specifica "l'assenza di dati produce insufficient_data, non valori fittizi"; il rischio di un flag spento a tempo indeterminato è peggiore di una UI che dice onestamente "sto raccogliendo dati" | Gate W5 esplicito nella Specifica |
| **3 file di migrazione a naming rotto**: ripristinare, rinominare o eliminare | Leggerli prima di decidere (punto 6 sopra) — nessuna raccomandazione cieca su dati che potrebbero essere ancora necessari | Blocca la chiusura formale di W1 |
| **Orfano `20260108220000`**: accettare il gap o investigare a fondo | Investigare prima di accettare — è un secondo caso dopo i 12 già trovati, potrebbe indicare un pattern (migrazioni applicate a mano fuori dal repo) che vale la pena capire una volta per tutte | Rischio che si ripresenti ad ogni riconciliazione |
| **Ritmo di lavoro sulle 79 migrazioni**: procedere subito in questa sessione o pianificare sessioni dedicate | — | Determina se W1 si chiude questa settimana o in più sessioni |

## 5. Definition of Done (invariata, dalla Specifica v1.1 §8)

Non ripetuta per intero qui — resta quella della Specifica: inventario versionato, catena end-to-end per capability, nessun writer critico su storage non autorizzato, RLS testata negativamente, ogni feature flag con owner/gate/rollback, ogni provider esterno con contract test, regole agronomiche versionate su dataset reale, osservabilità con alert, release riproducibile con report firmato.

## 6. Prossimo passo immediato

Eseguire il punto 1-3 di §3 sul primo lotto di 10 file (i più vecchi, gennaio 2026 — probabilmente il gruppo con più drift preesistente, stesso pattern già visto con P5) e riportare evidenza prima di procedere al lotto successivo.

## 7. Registro decisioni D1-D17 — bilancio reale al 22/07 sera

Fonte del registro: `ROADMAP_COMPLETAMENTO_ORTOMIO_PRO.md` (21/07), colonna "Decisione da concordare" lasciata vuota per D1-D17. Stato aggiornato con verifica diretta del codice/DB in questa sessione, non per dichiarazione.

| ID | Stato 21/07 | Stato verificato 22/07 sera | Prova |
|---|---|---|---|
| D0 | Approvato | Invariato, approvato | — |
| D1 | Aperto — checkout non riproducibile | **RISOLTO** | lockfile canonico, `npm ci` pulito, type-check verde |
| D2 | Aperto — P1-P8 mai applicate a remoto | **PARZIALE, progresso reale** | history remota 50→40 migrazioni tracciate (12 orfani rimossi, 4 duplicati puliti, 2 riconciliate); restano 79 file da valutare + 1 nuovo orfano (`20260108220000`) + 3 file naming rotto |
| D3 | Core tecnico locale solido | Invariato — nessuna riscrittura fatta, come raccomandato | — |
| D4 | Diario/journal parziale, mock in GardenView | **Un mock rimosso** (`OperationalDiary.tsx` eliminato, PR #38) | file non esiste più nel repo |
| D5 | 15 flag spenti, nessuna decisione per flag | **1 flag riallineato** (`IRRIGATION_ZONES` era già montato senza gate, il flag mentiva: corretto a `true`) | `config/features.ts:67` |
| D6 | Mock/fallback in 25+ file | **1 rimosso su 25+**, resto non affrontato | `seedInventoryService.ts` conferma ancora fallback mock oggi |
| D7 | TODO in 65+ file | **Non affrontato** | verificato oggi ancora presenti in `soilStateService.ts`, `intelligentNotificationService.ts`, `iotSensorService.ts` |
| D8 | Identità fittizie (`current-user`) | **Non riverificato oggi** — non dare per scontato lo stato 21/07 senza un nuovo grep | — |
| D9 | Chiave Gemini esposta client-side | **Confermato ancora aperto** | `NEXT_PUBLIC_GEMINI_API_KEY` presente oggi in 6 file (Planner, PlannerSearch, photoAnalysisService, recipeService, diseaseDiagnosisEngine) |
| D10 | Nessun provider collaudato | **Parziale su un sotto-pezzo**: persistenza meteo interna ora funziona con dati reali; il contract test/SLA del provider esterno resta non fatto | query diretta `daily_weather_log` |
| D11 | Notifiche con TODO | **Non affrontato**, confermato invariato | — |
| D12 | UX incompleta (zone TODO, upload, export) | **Parziale**: form modifica orto collegato (PR #36), calendario in nav (PR #38); form creazione zone **ancora TODO**, confermato oggi | `app/app/garden/zones/page.tsx:430-435` |
| D13 | Validazione agronomica assente | Non affrontato | — |
| D14 | Lint saltato | **Confermato ancora saltato** | `package.json:22` |
| D15 | Backup/restore non dimostrato | Non affrontato | — |
| D16 | Drone/blockchain laboratorio | Non affrontato, nessuna decisione presa | — |
| D17 | Lifecycle commerciale assente | Non affrontato | — |

**Bilancio onesto:** su 17 decisioni, 1 chiusa (D1), 5 con progresso parziale reale e verificato (D2, D4, D5, D10, D12), 1 da riverificare (D8), le restanti 10 invariate rispetto al 21/07. I 5 punti con il rapporto rischio/sforzo migliore per il prossimo lotto di lavoro, in ordine: **D9** (rischio sicurezza reale, fix probabilmente rapido — spostare le chiamate Gemini lato server), **D14** (lint finto, rischio che bug reali passino inosservati, fix di configurazione), **D2** (lotto migrazioni già pianificato in §3), **D12** (form creazione zone, UI puntuale), **D6/D7** (mock e TODO residui, da classificare prima di toccare).

**Follow-up 24/07:** D5 **chiuso**. Le 13 flag rimanenti (`IRRIGATION_ZONES` escluso, già risolto il 22/07) sono state verificate una per una: nessun componente referenziato nei commenti di `config/features.ts` esisteva nel repo, e nessuna delle 13 era letta da `isFeatureEnabled`/`<FeatureGate>`/`FEATURES_BY_PHASE` altrove — flag create in anticipo per moduli mai scritti, non funzionalità spente. Rimosse da `config/features.ts` insieme all'intera sezione "MODULI MEDI - Fase 3". Dettaglio in `MASTERDOC.md` §44.3.
