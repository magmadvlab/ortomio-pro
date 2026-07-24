# OrtoMio Pro - Piano master di completamento

- **Versione:** 1.0
- **Data di apertura:** 24 luglio 2026
- **Repository:** `magmadvlab/ortomio-pro`
- **Branch di lavoro iniziale:** `claude/migrations-feature-flags-cd3c51`
- **Baseline iniziale:** `8c37854f51b93585720e6c54e1a84b8b1c7c6879`
- **Stato generale:** in corso; prodotto non ancora certificato per la release commerciale 1.0
- **Stato esecuzione:** M01-M02 completati; M03 e' il prossimo blocco
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
- `[x]` completato e verificato;
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

- **Stato:** `[ ]`
- **Obiettivo:** completare azienda/garden -> zona con persistenza e ownership.
- **Perimetro iniziale:** `app/app/garden/zones/page.tsx` e servizi/API collegati.
- **Attivita':**
  - sostituire il modal TODO con form completo;
  - validare nome, geometria/dimensioni, garden e campi obbligatori;
  - usare identita' e garden autorizzati lato server;
  - gestire successo, errore, retry e aggiornamento lista;
  - coprire accesso cross-garden negativo.
- **Criterio di uscita:** una zona puo' essere creata, riletta e usata nei flussi successivi senza scritture ambigue.

### M04 - Persistenza suolo, seed inventory e fallback production

- **Stato:** `[ ]`
- **Obiettivo:** eliminare provider non autorevoli nei primi servizi operativi identificati.
- **Perimetro iniziale:** `soilStateService.ts`, `seedInventoryService.ts`, servizi collegati.
- **Attivita':**
  - implementare salvataggio e lettura dello stato del suolo;
  - rimuovere fallback automatico a pacchetti seme mock dopo errore DB;
  - distinguere `nessun dato` da `errore provider`;
  - mantenere eventuali dataset demo solo in modalità esplicitamente demo;
  - aggiungere test di errore e isolamento garden.
- **Criterio di uscita:** nessun errore DB viene trasformato silenziosamente in dato operativo simulato.

### M05 - Censimento e chiusura TODO, FIXME e mock della release 1.0

- **Stato:** `[ ]`
- **Obiettivo:** classificare tutto il debito raggiungibile, senza correggere indiscriminatamente codice fuori perimetro.
- **Attivita':**
  - generare manifest versionato per file, route, capability e raggiungibilita';
  - classificare ogni voce come release, demo, laboratorio, legacy o codice morto;
  - correggere/nascondere le voci release;
  - isolare demo e laboratorio;
  - eliminare codice morto solo con prova di assenza chiamanti.
- **Criterio di uscita:** nessun TODO/mock non classificato nei percorsi commerciali.

### M06 - Riconciliazione completa delle migrazioni

- **Stato:** `[ ]`
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

### M07 - Staging, backup, restore e rollback

- **Stato:** `[ ]`
- **Obiettivo:** dimostrare recuperabilita' prima di ulteriori dati cliente.
- **Attivita':**
  - predisporre target isolato o procedura equivalente autorizzata;
  - creare snapshot consistente;
  - eseguire restore drill completo;
  - provare ripristino selettivo di un cliente;
  - misurare RPO/RTO;
  - allegare comandi, esiti e procedura incident.
- **Criterio di uscita:** restore riuscito e ripetibile con evidenza.

### M08 - Certificazione multi-cliente e RLS

- **Stato:** `[ ]`
- **Obiettivo:** provare isolamento end-to-end con almeno due clienti differenti.
- **Attivita':**
  - creare fixture multi-azienda/multi-utente;
  - testare accessi negativi SQL, API e UI;
  - includere cache, cron, export, alert, suggerimenti e processi concorrenti;
  - verificare ruoli amministratore, responsabile e operatore;
  - rieseguire Security Advisor.
- **Criterio di uscita:** nessun percorso legge o modifica risorse dell'altro cliente.

### M09 - Provider autorevoli e convergenza reader/writer

- **Stato:** `[ ]`
- **Obiettivo:** scegliere un'unica verita' persistente per ogni dominio.
- **Attivita':**
  - mappare dominio -> writer -> reader -> tabella/provider;
  - individuare split-write, cache autorevoli improprie e servizi paralleli;
  - migrare i consumatori al contratto canonico;
  - rendere i writer critici fail-closed;
  - aggiungere test di parita' e idempotenza.
- **Criterio di uscita:** ogni stato operativo e' unico, persistente e ricostruibile.

### M10 - Notifiche operative e osservabilita'

- **Stato:** `[ ]`
- **Obiettivo:** completare reminder essenziali senza falsi stati di consegna.
- **Attivita':**
  - scheduler persistente;
  - delivery reale osservabile;
  - retry e dead-letter;
  - deduplica e soppressione;
  - stato inviato/fallito confermato dal provider;
  - metriche, alert e runbook.
- **Criterio di uscita:** una notifica e' tracciabile dalla generazione alla consegna o al fallimento.

### M11 - Core operativo end-to-end

- **Stato:** `[ ]`
- **Obiettivo:** ricertificare planner -> task -> esecuzione -> diario -> ledger -> outcome.
- **Attivita':**
  - consolidare stati e transizioni;
  - verificare annullamento, riapertura, retry e idempotenza;
  - verificare timezone Europe/Rome e ricorrenze;
  - eseguire giornata simulata con ruoli reali;
  - riconciliare manualmente il risultato finale.
- **Criterio di uscita:** ogni operazione ha un unico stato autorevole e auditabile.

### M12 - Pilot delle operazioni agronomiche

- **Stato:** `[ ]`
- **Obiettivo:** provare irrigazione, nutrizione, trattamenti e salute su dati/impianti reali.
- **Attivita':**
  - irrigazione con portata misurata e nessuna auto-attuazione;
  - nutrizione con catalogo, unita' e stock reali;
  - trattamenti con registro, responsabile, intervalli e catalogo verificato;
  - salute con cron, deduplica, task e outcome;
  - approvazione umana per ogni azione operativa.
- **Criterio di uscita:** almeno un ciclo completo segnale -> decisione -> esecuzione -> outcome.

### M13 - Provider esterni

- **Stato:** `[ ]`
- **Obiettivo:** validare Open-Meteo e un solo provider avanzato iniziale.
- **Attivita':**
  - contract test, cache, timeout, retry e SLA Open-Meteo;
  - scegliere Sentinel oppure ThingsBoard per il primo pilot;
  - configurare credenziali staging;
  - registrare latenza, errori, costi e owner;
  - mantenere kill switch e nessun comando fisico non presidiato.
- **Criterio di uscita:** integrazione reale osservabile, recuperabile e documentata.

### M14 - Direttore, regole agronomiche e AI in shadow

- **Stato:** `[ ]`
- **Obiettivo:** misurare utilita' e sicurezza prima dell'uso operativo.
- **Attivita':**
  - creare dataset regressivo approvato;
  - versionare profili, regole e soglie;
  - mostrare fonti, confidenza e segnali mancanti;
  - misurare falsi positivi, azioni accettate e outcome;
  - mantenere `insufficient_data` e approvazione umana;
  - definire soglie di rollback.
- **Criterio di uscita:** report shadow approvato, senza auto-esecuzione critica.

### M15 - Lifecycle commerciale e ruoli

- **Stato:** `[ ]`
- **Obiettivo:** rendere il prodotto attivabile e amministrabile per clienti reali.
- **Attivita':**
  - provisioning azienda;
  - inviti e ruoli amministratore/responsabile/operatore;
  - piano/licenza e limiti;
  - rinnovo, sospensione e cancellazione;
  - fatturazione o procedura amministrativa iniziale;
  - assistenza e accesso amministratore OrtoMio auditato.
- **Criterio di uscita:** un cliente puo' attraversare l'intero ciclo commerciale senza interventi tecnici non documentati.

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

**Stato:** chiuso per gli errori bloccanti nel commit `583902a9`. La riduzione e classificazione dei warning prosegue in M05.

### File generato fuori perimetro

`tsconfig.tsbuildinfo` risulta modificato nel worktree ma non appartiene ai commit intenzionali del piano. Non deve essere incluso automaticamente nei commit successivi.

## 5. Registro avanzamento

| Data | Blocco | Stato | Evidenza | Note |
|---|---|---|---|---|
| 24/07/2026 | M01 / D5 | Completato | `c458bd92a08ad4d947813e65ca6319f7bc184318` | 13 flag morti rimossi; gate locale riallineato |
| 24/07/2026 | M02 / D14 | Completato | `583902a9` | Dashboard veritiera; lint reale con 0 errori; 2.733 warning registrati |

## 6. Prossima azione

Avviare M03:

1. ricostruire il contratto dati e le API esistenti per le zone;
2. sostituire il modal TODO con un form validato;
3. usare identita' e garden autorizzati lato server;
4. aggiungere test di persistenza e accesso cross-garden negativo;
5. aggiornare questo registro e creare un commit dedicato.
