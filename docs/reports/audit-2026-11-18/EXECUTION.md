# Esecuzione delle correzioni dell’app autenticata — 18 novembre 2026

Stato: implementazione e collaudo locale; **rilascio completo non concluso**. La coda resta il [piano master, §5.1–5.2](../execution-plans/ORTOMIO_PIANO_MASTER_COMPLETAMENTO_2026-07-24.md). Questo documento registra prove, limiti e modifiche; non sostituisce il registro.

## Versioni e ambiente

- Worktree condiviso `/Volumes/990P/ortomio-pro-check`, branch `codex/manuale-audit-locale`, base `0dcd9769`; modifiche non committate, comprese quelle concorrenti a manuale/UI. Non è un candidato immutabile già distribuito.
- Docker: progetto separato `ortomio-audit-local`, API 55421, DB 55422, app 3004. Schema `public/private` letto dal progetto `qhmujoivfxftlrcrluaj`, senza dati utenti di produzione. Fixture sintetiche con due proprietari e login Supabase effettivo.
- Il replay integrale della storia si ferma su `20260111000000` per assenza di `individual_plants`. Il clone da snapshot consente i test delle tre nuove migrazioni, **non risolve il drift storico M06**.
- Produzione identificata via Vercel dopo autorizzazione del team: progetto `ortomio-pro`, `prj_MXFbzku9A87ZBAT03d6D1nhQDuTO`, deployment `dpl_5A5UrTkqdmfZMVN45psaFFufUW7D`, commit `d1435e2799ee61e839c1a643d31de456f7b84672`, 28 ottobre 2026. Dominio `www.ortomioapp.it`.

## Esiti per lotto e rilievo

`[L]` significa verificato nel candidato locale, non chiuso in produzione. `Contenuto` significa che l’app non presenta più il risultato inventato, ma la capacità completa resta aperta.

| Lotto / ID | Intervento e prova | Residuo |
|---|---|---|
| L0 / O63 | Tre migrazioni provate nel clone: colonne zone irrigue, `water_requirements` con RLS, riferimenti raccolto, RPC Planner atomica, credenziali riservate al server. Dump/restore in DB temporaneo e ripetizione degli assert SQL riusciti. | Applicazione remota e riallineamento della storia non eseguiti; il restore sintetico non prova il recupero dei dati produttivi. |
| L1 / O48 | AES-256-GCM con chiave server e proprietario come AAD; CRUD restituisce solo metadati. Proxy AI/meteo autenticati; origini custom autorizzate dal server. Impostazioni usa lo stesso archivio dei provider, eliminato il servizio browser `apiKeysService`. Accesso browser revocato anche ad `api_keys`. Chiave vuota in modifica conserva quella salvata. | Rotazione delle chiavi già pubblicate; migrazione dei record legacy e delle configurazioni di organizzazione prima del rilascio. Lo script trasferisce le chiavi personali supportate senza sovrascrivere configurazioni esistenti; archivia cifrati valore e config originali. Credenziali di organizzazione, servizi non mappati e conflitti richiedono revisione esplicita. |
| L1 / O68–O73 | Correzioni concorrenti di impostazioni, consulto persistente, navigazione per coltura, inserimento pianta, satellite e anteprima mantenute e incluse nella suite applicativa. | Si veda il [rapporto manuale](../ORTOMIO_AUDIT_LOCALE_MANUALE_2026-11-18.md) per prove UI con fixture e dipendenze provider. Non attribuite a test locali consegne reali. |
| L2 / O76 | Director legge `weather/tracking` canonici; stress massimo per coltura come indice percentuale, non ore né somma di GDD eterogenei. Test con 40 mm, 39/1 °C e stress di due colture. | Verifica sul deploy. |
| L2 / O77 | Forecast soltanto da snapshot Open-Meteo datati e freschi; storico non trasformato in previsione. Anche health-check distingue pioggia sconosciuta da domani asciutto. | Continuità del writer forecast da osservare in esercizio. |
| L2 / O79 | Confronto retrospettivo di 15 giorni chiusi tra irrigazioni eseguite e fabbisogni persistiti per zona/data, paginazione e deduplica. Costo assente senza tariffa. UI dichiara periodo e natura del confronto. | Non è una stima certificata di risparmio futuro; non prova l’accuratezza agronomica del fabbisogno. |
| L2 / O83 | Timestamp assenti/futuri invalidi penalizzati; sensori simulati, scaduti o di altro contesto esclusi. Predizioni derivate indicate come stimate/miste. | La confidenza è euristica, non una probabilità calibrata. |
| L3 / O78 | Finestra raccolto ancorata a data attesa oppure data impianto + ciclo esplicito identificato; rimosso `oggi + 60`. Test di stabilità cambiando giorno di calcolo. | Dataset cicli specie/varietà approvato non fornito. Senza ancora/ciclo la previsione manca, non è inventata. |
| L3 / O80 | Endpoint passa suolo e quota, incluso zero; prove HTTP autorizzate e cross-tenant. | Storico meteo dichiarato `not_supported` per questa regola; calibrazione agronomica aperta. |
| L3 / O61 | Sensori canonici 10/30/60 cm, tensione, bagnatura, VPD, temperatura chioma, portata e pressione: unità, fonte, data e zona verificate; provenienza conservata nel fabbisogno. | Parte dei segnali estesi è ancora senza fonte. I segnali aggiunti informano qualità e motivazioni; non implicano una nuova formula volumetrica validata. |
| L4 / O65 | Raccolti con `fieldRowId/plantId`, scope DB e cattura del filare del task. Vietata riassegnazione retroattiva per cambio del task; reader usa storico attribuito. | Nessun backfill per somiglianza del nome; storico non attribuibile resta tale. |
| L4 / O66 | Dialogo di revisione di date/tipi/quantità/filare; RPC crea task e decisione nella stessa transazione. Retry idempotente, rollback di input misti invalidi e accesso di altro utente negato. | La giornata completa UI→lavoro fisico→outcome richiede pilot; accettare resta distinto da eseguire. |
| L4 / O67 | Analisi usa la mappa persistita e le sue zone, con identità garden verificata. Conteggi non disponibili restano null, errori visibili. | Nessuna relazione spaziale automatica inventata tra zona prescrittiva e filari. |
| L4 / O62 | Rimosso aggregatore irraggiungibile, mantenuti writer e percorsi operativi utilizzati. | Nessuna capacità nuova dichiarata. |
| L5 / O81–O82 | GeoJSON WGS84; Shapefile binario completo con trasformazione reale UTM 1–60, emisferi, PRJ e codifica attributi. Lettore Shapefile indipendente verifica geometria e attributi. | Applicazione sul campo non certificata dal decoder GIS. |
| L5 / O60/O64/O73 | Rimossi incremento resa fisso 15%, costi inventati e confidenza fissa; pesi senza fonti rifiutati, confine geografico richiesto, default export funzionante. | Fonti pianta/suolo georeferenziate, poligono autorevole e curva costi/resa mancanti: **capacità contenuta, non completata**. |
| L6 / O84 | Verificato `vercel.json` del commit produttivo: solo diario, `0 23 * * *` UTC. Candidato aggiunge salute `0 5 * * *` e delivery `0 7 * * *`. HTTP locale verifica run persistiti, esclusione simulazioni, retry senza duplicati e rispetto opt-out. | Scheduler candidato non distribuito. Nessuna finestra di osservazione reale o invio a clienti. Provider email/destinatario agronomo non configurati; attivazione delivery subordinata a questo controllo. |
| L7 / O75 | Igiene documentale distingue documenti prodotto da tooling/quarantena; manuale sincronizzato. | Landing fuori dal perimetro; suoi fallimenti storici non cancellati. |
| L0/L7 / O85 | Aggiornati Next, jsPDF/AutoTable, Zod e dipendenze transitive: audit npm da 17 vulnerabilità a zero. Build verifica TypeScript, helper non validi nei route file spostati in `handlers.ts`. PDF generato e letto con `pdftotext`. | Zero segnalazioni npm non equivale ad audit di sicurezza completo. |
| L1/L7 / O86 | Proxy Gemini normalizza stringa, `{parts}`, array testo/foto e conversazione. Prova tramite SDK con trasporto intercettato; payload invalido 400, provider assente 503. Proxy esterni spostati sul server, timeout, modello approvato, niente segreti pubblici o usage inventato. | Smoke esterni reali non eseguiti. Le tre analisi fotografiche del planning ora inviano parti immagine esplicite al modello vision; test di contratto dedicato. |

## Matrice dei parametri dell’orchestratore

| Parametro | Percorso verificato / stato |
|---|---|
| Garden, utente, zona, filare | Auth API/RLS → storage canonico → reader circoscritti; test SQL e HTTP con due proprietari. |
| Coordinate, quota, tipo suolo | `gardens` → planting-windows → motore; quota 0 preservata. L’effetto non viene esteso per deduzione a tutti i modelli di resa. |
| Meteo registrato | Diario `weather` / `daily_weather_log` → briefing e condizioni; distinto dai forecast. |
| Meteo previsto | Snapshot `forecastDate/generatedAt/source` → selezione entro orizzonte e freschezza → rischi/previsioni. Mancanza esplicita. |
| Suolo/pH/sostanza organica | Contratto delle zone ampliato; non tutti i segnali hanno osservazioni valide. Nessun dato mancante dichiarato misurato. |
| Impianto/ciclo/raccolto atteso | Ancora persistita + ciclo esplicito → finestra stabile; ciclo non disponibile blocca la relativa previsione. |
| Sensori | `sensor_readings` non simulati, unità/tempo/garden/zona → segnali e provenance; effetti volumetrici aggiuntivi da calibrare. |
| Litri eseguiti | Registro irrigazione completata → aggregazione periodo/zona → confronto con fabbisogni; task generici esclusi. |
| Sole/ostacoli/fenologia/NDVI nella resa | Non dimostrati end-to-end per tutti i motori: restano nei residui M14; non dichiarati rispettati globalmente. |
| Costi/prezzi/resa | Nessun risultato economico arbitrario nelle nuove mappe. Modello completo richiede fonti e curve approvate. |
| Priorità/feedback | Decisione Planner atomica con `implemented=false`; feedback ed esito fisico non derivati automaticamente dall’accettazione. |

## Prove eseguite

Riepilogo strutturato: [verification.json](./verification.json).

- Suite `test:app`: **481 test passati**, zero fallimenti, inclusi 34 test audit, 13 meteo e 10 manuale. Non è una prova browser completa né un pilot agronomico.
- Build Next 16.4.6 con controllo TypeScript obbligatorio riuscita. Generazione dei tipi inclusa in `type-check`, ripetibile da checkout pulito.
- Contratti SQL, isolamento, rollback delle fixture e dump/restore del clone Docker riusciti.
- Contratti HTTP con login reale locale: credenziali cifrate/rilette, vecchio e nuovo archivio inaccessibili al browser, operazioni cross-owner negate, input AI invalidi e provider mancanti espliciti, monitoraggio/idempotenza/opt-out.
- PDF: estrazione indipendente; Shapefile: decoder indipendente e CRS verificato.
- Lint: zero errori, 629 warning residui. Igiene documentale: 162 documenti ammessi; 46 capitoli del manuale sincronizzati. Audit npm: zero vulnerabilità segnalate. `git diff --check` pulito.
- Nessun invio a indirizzi reali, nessuna attuazione fisica, nessuna migrazione del database produttivo, nessuna pubblicazione del candidato.

## Configurazione Vercel effettivamente modificata

Aggiunti `GEMINI_API_KEY` (production/preview) e `API_CONFIGURATION_ENCRYPTION_KEY` (chiavi distinte production e preview), tipo sensitive. La chiave Gemini esistente è stata trasferita al nome server: **non è una rotazione presso il provider**. Le variabili entrano in uso con un nuovo deployment. Nessun valore segreto è in questo rapporto.

Prima del rilascio: ruotare e revocare le chiavi esposte; migrare gli archivi legacy con backup e verifiche; usare un DB isolato per preview (attualmente le variabili Supabase sono condivise tra ambienti); configurare provider email e destinatario effettivo; verificare backup/ripristino produttivo, pubblicare un candidato immutabile e osservare i job. La mancanza di agronomo/dataset approvati impedisce di chiudere validazione e pilot.

Il limite giornaliero del piano Hobby non garantisce consegna rapida: 10 righe reclamate per esecuzione nel candidato email aggiornato e retry quotidiano richiedono dimensionamento o scheduler più frequente prima di promettere SLA. [Limiti ufficiali Vercel](https://vercel.com/docs/schedules/cron-jobs/usage-and-pricing). Nessun upgrade di piano effettuato.

Le API esterne sono implementate secondo i contratti ufficiali di [Groq](https://console.groq.com/docs/api-reference), [OpenRouter](https://openrouter.ai/docs/api/api-reference/chat/send-chat-completion-request) e [Hugging Face](https://huggingface.co/docs/inference-providers/en/tasks/chat-completion); la compatibilità di un modello reale resta da provare con credenziali abilitate.


## Verifica remota e candidato isolato — 18 novembre, aggiornamento successivo

Inventario remoto in sola lettura: **10 account, 6 terreni, zero righe sia in `api_keys` sia in `api_configurations`**. Le quattro colonne irrigue controllate e `water_requirements` sono ancora assenti. Le credenziali legacy non richiedono trasferimento sui dati attuali; lo script resta disponibile per fixture e futuri casi. [Preflight completo](./remote-preflight.json).

Backup custom PostgreSQL 17.6 di `public/private/auth/supabase_migrations`, comprensivo di permessi, conservato fuori dal repository in directory privata (0700, file 0600), checksum SHA-256 registrato. Ripristino riuscito nel container `ortomio-production-restore-20261118`, **senza rete e senza porte host**. Conteggi e impronta dei terreni corrispondono alla sorgente; le tre nuove migrazioni e gli assert SQL con fixture sono passati sulla copia dei dati reali. Conteggi invariati dopo rollback delle fixture. [Prova strutturata](./production-restore-drill.json).

La prima prova senza ACL e i tentativi preliminari non sono l’evidenza finale: l’ultima importa anche i privilegi, usando il ruolo amministrativo del container per ripristinare i proprietari e i privilegi predefiniti originali. Il tempo del ripristino finale è registrato separatamente dalla preparazione del container e dai tentativi; non viene presentato come RTO completo del servizio. Nessuna modifica al database produttivo.

La storia corrente contiene 56 versioni remote, 137 file locali con timestamp, tre timestamp duplicati e nove versioni remote senza file omonimo. Otto di queste hanno candidati locali con lo stesso nome ma timestamp diverso; i contenuti non sono stati dichiarati equivalenti sulla sola base del nome. Il reset completo e `db push` indiscriminato restano esclusi: il rilascio dovrà applicare le tre migrazioni verificate in modo mirato, registrandole nella storia.

Candidato di rilascio preparato nel worktree separato `/Volumes/990P/ortomio-audit-release`, branch `codex/app-audit-2026-11-18`, dalla versione realmente pubblicata `d1435e27`: le modifiche dell’app/manuale sono copiate senza cambiare la landing, il filmato o il progetto video. Installazione da lockfile riuscita, zero vulnerabilità npm. Il progetto video ha una propria compilazione e viene escluso dal type-check applicativo; i suoi documenti restano distinti dai documenti prodotto. La verifica del candidato è separata dalle precedenti prove sul worktree condiviso.

Questo chiude la prova di ripristino del perimetro DB e il collaudo delle tre migrazioni sui dati reali in isolamento. Non chiude ripristino selettivo per cliente, file Storage, configurazioni di piattaforma, rotazione delle chiavi esposte, provider email, validazione agronomica o rilascio in produzione.


## Correzione trasporto notifiche Resend

La lista delle Edge Functions produttive contiene soltanto `compute-field-alerts`: la chiamata a `send-notification` era quindi irrealizzabile. Il candidato la sostituisce con `notificationDelivery.server.ts` (server-only), Resend, mittente configurabile, timeout 15s e ID provider obbligatorio. Il worker confronta il destinatario con l’email confermata del proprietario, ricontrolla preferenze e limite giornaliero, distingue suppression e failure, verifica la scrittura dello stato e conserva una chiave idempotente per riga. Non ritenta invii ambigui oltre 23h dalla pianificazione: [Resend conserva l’idempotenza 24h](https://resend.com/docs/dashboard/emails/idempotency-keys). Il limite può portare a dead-letter con scheduler giornaliero; non promette SLA rapido. Il trasporto usa testo e campi esplicitamente ammessi, senza serializzare tutto il payload.

Quattro test nuovi coprono risposta assente/malformata, errori e timeout, destinatario estraneo, opt-out, limite, retry scaduto e mancato salvataggio dopo accettazione provider. Insieme ai consulti: 8/8 passati. Dominio `ortomioapp.it` Verified in screenshot utente (regione Irlanda), DKIM/SPF Verified. Prefisso mascherato ricevuto non è una credenziale utilizzabile. Mittenti Production predisposti su Vercel; chiave completa da salvare direttamente come variabile Sensitive. Nessuna email reale inviata.


### Recupero dei job email interrotti

Aggiunta quarta migrazione mirata `20261118213000_notification_delivery_recovery.sql`: recupera lock scaduti dopo 30 minuti, porta in dead-letter i tentativi oltre la finestra idempotente o il massimo e impedisce ai client di inserire falsi stati di invio/provider ID. Applicata soltanto alla copia produttiva Docker, con test SQL: enqueue proprietario consentito, falso invio e claim utente vietati, recupero lock, scadenza, assenza di doppio claim. Fixture annullate: 10 account e 6 terreni originali, zero righe fixture residue. Il cron limita il batch a 10 (timeout provider 15s, budget route 300s), continua sulle altre righe dopo un errore e distingue le notifiche soppresse. I producer riportano accodamenti e non invii; il promemoria foto non avanza dopo un errore di accodamento. Test audit aggiornati 39/39.

Vercel Production: salvati `NOTIFICATION_FROM`, `AGRONOMIST_REQUEST_FROM`, `ORGANIZATION_INVITATION_FROM` = `OrtoMio <notifiche@ortomioapp.it>`. Non attivi sui deployment già esistenti. `RESEND_API_KEY` non ancora verificata presente: il valore fornito in chat è soltanto un prefisso mascherato. Nessun invio reale autorizzato o eseguito.

Verifica finale del candidato aggiornato: **486/486 test applicativi**, build Next con TypeScript obbligatorio riuscita, lint mirato dei file notifiche senza errori né warning, igiene documentale riuscita. Quattro migrazioni candidate; nessuna applicata alla produzione. Chiave Resend ancora assente nell’ultima lettura dei metadati Vercel.
