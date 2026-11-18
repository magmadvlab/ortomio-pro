# OrtoMio — audit locale e manuale operativo

Data: 18 novembre 2026. Questo rapporto conserva evidenze e limiti della verifica; non è una seconda coda di lavoro. Il proprietario degli interventi è il [piano master, registro §5.1](./execution-plans/ORTOMIO_PIANO_MASTER_COMPLETAMENTO_2026-07-24.md). Il contenuto destinato agli utenti è il [manuale](../manual/README.md).

## Esito corrente: correzioni e manuale

Il lavoro comprende ora modifiche funzionali, oltre al manuale integrato in 45 capitoli. Le guide spiegano i percorsi corretti, i dati richiesti e i controlli da fare: il registro dei difetti resta nel piano master e in questo rapporto tecnico.

Correzioni locali O68-O73:

- **Impostazioni:** profilo, categorie email, password e tema hanno writer, gestione degli errori e rilettura. La password attuale viene verificata prima del cambio. Il tema viene applicato e conservato nel profilo.
- **Dati:** il download conduce al modulo Export canonico. La chiusura è una **richiesta amministrativa persistente**, con conferma esplicita, identificativo e possibilità di ritiro; l’amministratore la legge in una sezione dedicata. Non è stata implementata una cancellazione automatica e non viene dichiarato cancellato l’account alla registrazione della richiesta. La cancellazione effettiva resta parte del lifecycle amministrativo da verificare.
- **Consulto:** destinatario scelto tra i propri contatti, campi effettivamente inviati, richiesta persistita nella coda canonica e storico per terreno. Il server verifica ownership di terreno e contatto; il provider deve restituire un ID prima dello stato `sent`. Idempotenza, retry e stato fallito sostituiscono il falso successo e la promessa delle 24 ore.
- **Piante:** Aggiungi Pianta apre un modulo reale, conserva il filare e aggiorna l’inventario. Rimossa la generazione di piante demo come sostituto di un archivio vuoto o in errore; il provider propaga il fallimento di lettura.
- **Navigazione:** gli appezzamenti specializzati aprono il rispettivo modulo conservando `garden`; un identificativo non disponibile non seleziona silenziosamente un altro terreno.
- **Satellite:** test riservato all’amministratore, errori HTTP/schema/timeout espliciti, nessun segreto al browser. Corretto anche l’endpoint OAuth Copernicus usato dall’acquisizione NDVI e riutilizzato il token ancora valido.
- **Mappe:** anteprima della revisione salvata con geometrie, selezione zone, legenda, area, dose/unità, prodotto e metadati delle fonti. La finestra è utilizzabile su mobile e da tastiera.

Il codice resta nel branch locale `codex/manuale-audit-locale`. Nessun push, deploy, migrazione remota, invio email reale o cancellazione account è stato eseguito in questa sessione. Le correzioni locali non costituiscono una certificazione dell’intera app: consegna provider, database reale, ciclo operativo e gate release richiedono le rispettive prove.

## Prove delle correzioni

- Test di regressione in `__tests__/audit-fixes/`: validazione, persistenza/rilettura con client controllato, errori, autenticazione, routing, geometrie, OAuth e idempotenza email. Il comando `test:app` include ora suite applicative, queste regressioni, meteo e manuale; `test:release` aggiunge la landing.
- TypeScript e build di produzione verificati con configurazione Supabase svuotata. Le prove del manuale passano e le 46 sorgenti Markdown (45 capitoli più indice) sono sincronizzate.
- Browser dei componenti reali con dipendenze sostituite da fixture locali: profilo salvato e riletto dopo reload; errore senza falso successo; pianta salvata nel filare preselezionato con dati osservati; richiesta consulto con campi e stato, invio disabilitato dopo conferma; connessione satellite positiva e fallimento successivo senza messaggio positivo residuo; tema scuro persistente; richiesta chiusura creata e ritirata; link Export corretto.
- Anteprima a 375×812: dialog dentro il viewport, nessun overflow della pagina, due geometrie reali della fixture e selezione visiva della zona. A 1440×1000: Enter apre, Escape chiude e il focus torna al pulsante. Nessun errore/warning nella console del caso finale.
- Le fixture sono state servite esclusivamente su localhost e non hanno inviato email, modificato dati remoti o sostituito prove RLS/provider reali. Gli artefatti temporanei sono in `/tmp/ortomio-ui-qa-20261118`; log in `/tmp/ortomio-audit-2026-11-18`.
- Nel workspace sono presenti anche modifiche concorrenti alla pipeline/orchestratore ed export geografico, con relativo rapporto `audit-2026-11-18/REPORT.md`. Sono state preservate. Il vecchio test di integrità Shapefile richiedeva il messaggio di funzione non implementata: è stato riallineato all’encoder reale, mantenendo i controlli contro file/URL fabbricati e i test binari aggiunti nel lavoro concorrente.

### Risultati consolidati delle verifiche locali

| Controllo | Risultato |
| --- | --- |
| `npm run test:app` | **472/472 passati**: 424 suite applicative preesistenti, 25 regressioni audit, 13 meteo, 10 manuale |
| `npm run type-check` | Passato |
| `npm run build` | Passata |
| `npm run lint` | 0 errori, 634 warning; baseline iniziale 637 |
| `npm run docs:check` | Passato; 46 file sincronizzati |
| `npm run test:landing` | 17/30, gli stessi 13 fallimenti preesistenti; O74 |
| `npm run docs:hygiene` | Non passa: allowlist e nomi storici già fuori policy; O75 |

La suite release complessiva resta non verde per la landing. Non sono stati rimossi i relativi test né alterata la pagina commerciale per ripristinare vecchie frasi. Il comando applicativo separato rende ripetibile la verifica del perimetro autenticato, senza nascondere l’esito della release.

## Configurazione del consulto e del satellite

Il consulto riusa `notification_delivery_queue` e il job `/api/cron/notification-delivery`: richiede la migrazione canonica già prevista `20260724140000_notification_delivery_lifecycle.sql`, autenticazione server e servizio email. Le variabili server sono `RESEND_API_KEY` e `AGRONOMIST_REQUEST_FROM` (oppure il mittente già configurato `ORGANIZATION_INVITATION_FROM`). Il mittente deve essere abilitato dal provider; il richiedente deve avere email confermata. Nessuna nuova migrazione è necessaria per queste correzioni. Retry oltre la finestra di idempotenza sono fermati invece di rischiare invii duplicati. Una risposta email accettata non equivale a una risposta del professionista.

Il satellite usa `SH_CLIENT_ID` e `SH_CLIENT_SECRET` lato server. Endpoint e formato OAuth verificati sulla [documentazione Copernicus](https://documentation.dataspace.copernicus.eu/APIs/SentinelHub/Overview/Authentication.html); contratto email verificato sulla [documentazione Resend](https://resend.com/docs/api-reference/emails/send-email). Non sono state ruotate o copiate credenziali reali.

La configurazione locale presente non identifica un Supabase Ortomio isolato in esecuzione: le porte locali 54321/54331 appartengono ad altri progetti. Non sono stati avviati reset o migrazioni su quei database. La UI con fixture dimostra i comportamenti dei componenti, non sostituisce il collaudo della stessa build con backend e provider configurati.

## Versione e confronto GitHub

| Elemento | Evidenza |
| --- | --- |
| Directory | `/Volumes/990P/ortomio-pro-check` |
| Repository | `magmadvlab/ortomio-pro` |
| HEAD locale iniziale | `0dcd9769856ad409cefb35d91ebd69ea788e50f7` |
| Main GitHub osservato | `d1435e2799ee61e839c1a643d31de456f7b84672` |
| Differenza | Locale indietro di due commit; 34 file aggiunti e uno modificato, relativi al video promozionale/landing |
| Sincronizzazione | Nessun pull/merge: preservata la baseline oggetto dell'audit |
| Runtime locale | Node.js 22.18.0, npm 10.9.3; dipendenze installate dal lockfile prima dei controlli |

Il confronto è con GitHub main osservato nella sessione, non una prova del commit effettivamente servito dal sito pubblico. Il manuale descrive il codice locale corretto; questo rapporto riporta separatamente ciò che è stato osservato nell’account remoto prima delle modifiche.

## Ambiente e confini della prova

L'utente ha indicato `https://www.ortomioapp.it/` e un account per la verifica. Login riuscito e pagine autenticate aperte in un contesto browser isolato. Poiché l'indirizzo è quello pubblico, sono state effettuate navigazione e lettura: nessun inserimento di dati di prova, invito, richiesta di consulto, comando a dispositivi o modifica di credenziali.

Non è stata dimostrata l'esistenza di uno staging separato da produzione. La presenza dei file `.env.remote` e `.env.local.development` non dimostra che Next carichi quest'ultimo né che il database sia isolato. Non è stato creato un file di credenziali. Per il manuale locale i parametri Supabase sono stati svuotati esplicitamente e il bypass dell'autenticazione disabilitato. La lettura pubblica del manuale non richiede accesso al database.

La visita di una pagina dimostra che il percorso è raggiungibile, non che tutti i pannelli, salvataggi, download o provider abbiano funzionato. Nessun risultato locale qui chiude i gate remoti del piano master.

## Risultati automatici

| Controllo | Risultato | Interpretazione |
| --- | --- | --- |
| `npm ci --no-audit --no-fund` | Completato | Baseline installabile dal lockfile |
| `npm run type-check` | Passa | Controllo TypeScript separato dalla build |
| `npm run build` | Passa | Compilazione produzione sulla baseline e sul manuale aggiornato |
| `npm run lint` prima e dopo | 0 errori, 637 warning | Debito esistente T01, non eliminato |
| Lint dei file applicativi modificati | 0 errori, 0 warning | Reader, indice, catalogo, guide contestuali e helper |
| `npm run test:release` prima e dopo | 454 test: 441 passati, 13 falliti | Stessi 13 fallimenti prima e dopo, tutti nella landing; dettagli sotto |
| `npm run test:capabilities` dopo la modifica | 30/30 | Navigazione e capability ancora coerenti |
| `npm run test:weather` | 13/13 | Suite meteo esistente, ora eseguibile da script dedicato |
| `npm run test:manual` | 10/10 | Link, rendering, input non sicuri, catalogo, ricerca e copia pubblica |
| `npm run docs:sync:check` | Passa, 46 file | 45 capitoli più README identici alla sorgente |
| `npm run docs:hygiene` | Fallisce già prima delle modifiche | Documenti/skill preesistenti fuori allowlist; O75 |
| `npm run release:check` | `localReady=true`, `deployReady=false` | Non equivale a suite release verde né a certificazione remota |
| HTTP locale dei capitoli | 45/45 con stato 200, titolo e articolo | Capitolo inesistente 404; README rediretto 307 all'indice |

`next.config.js` mantiene `typescript.ignoreBuildErrors`: una build verde da sola non verifica i tipi. Per questo è stato eseguito anche `type-check`.

La suite release comprende: security 48/48, capabilities 30/30, persistence 78/78, physical operations 6/6, health/predictions/monitoring 8/8, remote-data isolation 7/7, regulatory/export/admin 7/7, rollout/observability 11/11, precision hub 229/229, landing 17/30. Molte prove controllano contratti locali o sorgenti: non sono 441 percorsi browser eseguiti contro Supabase.

### I 13 fallimenti della landing

I log mostrano quattro gruppi da riconciliare con i requisiti attuali:

- riferimenti al componente rimosso `BenefitsList.tsx` e al suo montaggio;
- copy e ordine delle sezioni diversi dalle stringhe attese;
- frammenti di navigazione e contratto di classi per contrasto/focus non rispettati;
- sitemap: il test attende anche `/come-funziona`, mentre il risultato comprende solo la home.

Sono fallimenti presenti prima del lavoro sul manuale. Non sono stati rimossi o indeboliti i test per ottenere un esito verde. I controlli su navigazione, contrasto e sitemap richiedono una verifica funzionale: non è corretto liquidare l'intero gruppo come semplice obsolescenza dei test. Proprietario: O74/M16.

## Difetti della baseline prima delle correzioni

Le righe si riferiscono ai file applicativi della baseline precedente alle correzioni elencate in apertura. “Alta” indica rischio di far credere eseguita un'azione o verificata una condizione; “media” indica un percorso inutilizzabile; “bassa” un limite già dichiarato dall'interfaccia.

| ID / priorità | Evidenza | Effetto per l'utente | Riproduzione da completare in ambiente di prova |
| --- | --- | --- | --- |
| O68 / alta | `app/app/settings/page.tsx:407`, `:416`, `:468`: pulsanti senza handler; campi generici scollegati da writer | Salva Modifiche non persiste profilo/notifiche/sicurezza/aspetto; i comandi generici backup/eliminazione non fanno l'operazione | Modificare un campo, salvare e ricaricare; controllare che il difetto non venga confuso con i moduli dedicati |
| O69 / alta | `app/app/health/page.tsx:992`: `submitAgronomistRequest` crea un oggetto, `console.log`, chiude il modal e mostra un alert | La richiesta è dichiarata inviata con promessa di risposta, senza persistenza né invio al professionista | Con fixture di alert, inviare e verificare l'assenza di writer/consegna; non eseguito sul sito pubblico |
| O72 / alta | `components/settings/SatelliteCredentialsManager.tsx:68`: nessun `response.ok`; risultato basato solo su `data.simulated` | Un JSON di errore senza quel campo può apparire come test riuscito | Risposta simulata 400/401/500 deve produrre errore; test corretto legato al garden e al dato reale |
| O70 / media | `app/app/plants/page.tsx:163` e `:297`; `app/app/garden/page.tsx:19` | Aggiungi Pianta passa `tab=plants`, ma l'hub legge solo `garden` e non apre l'inserimento | Premere il comando con un terreno selezionato e verificare il modulo effettivamente aperto |
| O71 / media | `components/farm/FarmCommandCenter.tsx:60`; `app/app/garden/page.tsx:26` | Senza alert, anche un frutteto/oliveto/vigneto viene mandato all'hub che filtra quei tipi | Selezionare ciascun tipo senza alert; deve aprirsi il modulo specializzato conservando l'identificativo |
| O73 / bassa | `components/prescription/PrescriptionMapsDashboard.tsx:451` | Anteprima apre soltanto l'avviso di funzione in sviluppo | La prova non deve essere considerata visualizzazione/verifica della mappa |

Queste conclusioni derivano dall'analisi dei gestori e delle destinazioni reali, non dall'assenza di errori in console. Non è stata eseguita una prova remota di scrittura per riprodurle.

Altri limiti sono già nel piano e non ricevono ID duplicati: O60/O64 per dati e costi delle mappe, O65 per attribuzione raccolti ai filari, O66 per suggerimenti Planner che non diventano task, O67 per analisi zone. Analytics del dettaglio Frutteto mostra esplicitamente una funzionalità in sviluppo. Diario e NDVI possono essere assenti dal menu per attivazione/provider: l'assenza non è di per sé un difetto.

## Copertura delle guide e della navigazione

Le seguenti pagine sono state visitate con l'account disponibile: `/app`, `/app/settings`, `/app/planner`, `/app/irrigation`, `/app/health`, `/app/plants`, `/app/orchard`, `/app/olives`, `/app/vineyard`, `/app/nutrition`, `/app/mechanical-work`, `/app/harvest`, `/app/certifications`, `/app/export`, `/app/analytics`, `/app/prescription-maps`, `/app/smart`.

| Area | Capitoli principali | Verifica svolta |
| --- | --- | --- |
| Accesso, menu, Centro operativo | 27, 29, 34, 36, 44 | Codice e login/navigazione; recupero password non inviato |
| Appezzamenti, zone, filari | 37 | Flussi e destinazioni nel codice; creazione non eseguita |
| Piante, semi e vivaio | 21, 46 | Codice; pagina Piante visitata; trapianti non eseguiti |
| Frutteto, Oliveto, Vigneto | 18–20 | Codice e pagine principali; registrazioni non inviate |
| Planner e calendario | 09, 38 | Codice e pagina principale; task non creati |
| Irrigazione, Nutrizione, Lavorazioni | 15–17 | Codice e pagine principali; nessun comando fisico o registro creato |
| Salute e consultazioni | 39, 11 | Codice e pagina; analisi a consumo e consulti non inviati |
| Raccolti, diario, Analytics | 40, 10, 35, 22 | Codice; Raccolti e Analytics visitati; diario condizionato all'attivazione |
| AI e chat | 01, 07, 08 | Contratti e interfacce; nessuna validazione agronomica del modello |
| NDVI, mappe, Smart Hub | 05, 06, 14 | Codice; Mappe e Smart Hub visitati; provider/dispositivi non collaudati |
| Certificazioni ed Export | 04, 04b, 23 | Codice e pagine; nessun valore di certificazione legale o prova di download completo |
| Impostazioni, integrazioni, Admin | 41, 26, 45 | Codice e Impostazioni; nessuna rotazione di chiavi o modifica ruoli |
| Sostenibilità, esempi, assistenza | 24, 28, 30–33, 42–43 | Contenuto coerente con limiti e funzioni attuali |
| Drone, blockchain, ricerca | 02, 03, 25, 31 | Esplicita natura simulata/sperimentale; nessuna promessa di risultato |

## Modifiche realizzate nel manuale e nel lettore

- 45 capitoli con orientamento, preparazione, passaggi, risultato da verificare, momento del controllo e problemi frequenti. Aggiunti accesso, terreni, calendario, salute, raccolti, impostazioni, problemi, glossario, routine, Admin e vivaio.
- Indice in `/app/help` e `/docs/manual`, sei gruppi, tre ingressi rapidi e ricerca nel testo di tutti i capitoli, indipendente da maiuscole/accenti.
- **Guida sezione** nella barra superiore, destinazione determinata dalla route più specifica e dai riferimenti del registro capability.
- Reader Markdown sostituito: elenchi numerati e annidati, tabelle scorribili, grassetti, link interni funzionanti, indice di capitolo e precedente/successivo. Il precedente reader scartava i rimandi `.md` e non rendeva correttamente liste e tabelle.
- HTML incorporato ignorato e URL pericolosi filtrati; slug validati prima di accedere al filesystem. Le guide non espongono credenziali o dati dell'account.
- `react-markdown` e `remark-gfm` aggiunti per il rendering; `tsx` dichiarato tra le dipendenze di sviluppo per eseguire i test in modo riproducibile.
- `docs/manual/` resta la sorgente; `public/docs/manual/` è sincronizzata automaticamente. Nuovi comandi `docs:check`, `test:manual`, `test:weather`.

I test del manuale verificano: riscrittura link/ancore; HTML semantico; rifiuto di URL non sicuri e HTML arbitrario; protezione da traversal; catalogo completo e senza duplicati; link e ancore di tutti i documenti; corrispondenza dei riferimenti delle capability; ricerca completa senza distinzione di accenti; ingressi/label/status dell'indice; identità della copia pubblica.

## Verifica browser del manuale locale

- Tutti i 45 capitoli rispondono 200; documento inesistente 404; README rimanda all'indice.
- Ricerca `password`: 9 capitoli; ricerca senza corrispondenze: zero risultati e pulsante per ripristinare l'elenco.
- Tab dalla ricerca alla prima guida, indicatore di focus visibile ed Enter con apertura del capitolo: verificati.
- Elenchi numerati, tabelle, ancore e assenza di link residui `.md`: verificati su capitoli rappresentativi.
- Layout controllato visivamente a 1440 px (indice), 375 px (irrigazione) e 768 px (problemi). Nessun overflow orizzontale della pagina nei campioni; le tabelle hanno un contenitore scorribile.
- Lighthouse snapshot sull'indice e su Problemi frequenti: accessibilità 100, zero audit falliti (29 e 35 audit passati rispettivamente). È una verifica automatica su due campioni, non una certificazione WCAG o una prova con screen reader.
- Nessun warning/errore console osservato nel percorso locale finale. Non è una dichiarazione sull'intera app.
- Regressione visuale: **INCONCLUSIVE**, manca una baseline di immagini approvata. Non sono misurati Core Web Vitals di produzione sul server di sviluppo.

Esito di consegna: manuale verificato localmente; **DO NOT SHIP come certificazione complessiva dell'app**, perché suite release, gate documentale e verifiche remote restano aperti.

## Ripetere e mantenere la verifica

Per il lavoro applicativo configurare un ambiente Supabase di prova verificato. Per la sola documentazione pubblica si può avviare Next senza credenziali remote e con bypass disabilitato.

```bash
npm ci
npm run docs:check
npm run test:weather
npm run test:release
npm run type-check
npm run lint
npm run build
npm run release:check
npm run docs:hygiene
```

Conservare anche gli esiti non verdi. I log della sessione sono in `/tmp/ortomio-audit-2026-11-18/` e possono essere rimossi dal sistema: questo rapporto conserva i risultati necessari senza includere token o dati personali.

Quando cambia una schermata: aggiornare la guida interessata e la matrice di stato, verificare i nomi dei comandi e il percorso, eseguire `npm run docs:sync` e `npm run docs:check`; per un nuovo capitolo aggiornare anche `config/manual.ts`. Prima di dichiarare risolto un limite operativo servono una prova dell'azione, una rilettura dopo ricaricamento e una verifica dei permessi sull'ambiente corretto. Stato e criteri di chiusura restano nel piano master.
