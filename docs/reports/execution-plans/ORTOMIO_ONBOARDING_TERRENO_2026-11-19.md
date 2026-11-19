# Dal primo terreno al briefing dell’orchestratore

19 novembre 2026 · Collaudo locale completato · Versione esaminata `63cc6cda`, pubblicata il 19 novembre.

L’utente entra in /app, sceglie «Crea il tuo orto», descrive il terreno e lo ritrova dopo un nuovo accesso. Il primo briefing deve usare i dati del terreno selezionato e indicare quali informazioni servono ancora. La verifica iniziale ha seguito il codice. Il registro sotto riporta le prove eseguite dopo le correzioni.

## Ordine di lavoro e criteri di chiusura

| Ordine | Intervento | Prova richiesta |
|---|---|---|
| 1 | Tracciare ogni campo dal modulo alla scrittura, alla rilettura e al suo utilizzatore. Includere tipo di spazio, superficie, posizione, quota, suolo, pH, sole, vento, ostacoli, strutture e configurazioni specializzate. Per ciascuno registrare unità, origine e trattamento del valore assente. | Una tabella campo per campo indica quali valori alimentano il Director, quali servono ad altri moduli e dove si perde informazione. |
| 2 | Correggere il ripiego su Roma quando il GPS fallisce. Consentire un nuovo tentativo o l’inserimento manuale e conservare una posizione già confermata. | Con GPS negato o indisponibile il record non acquisisce coordinate predefinite. Con coordinate confermate il Director usa la latitudine riletta. La prova comprende latitudine zero. |
| 3 | Conservare gli ostacoli d’ombra durante creazione, modifica e rilettura. Verificare anche la persistenza dei dati visivi e dell’orientamento della foto. | Un terreno con due ostacoli ne conserva due dopo un nuovo accesso e il Director ne riceve due. Togliendone uno il conteggio scende a uno. Un vecchio terreno senza il dato resta utilizzabile. |
| 4 | Completare il passaggio alla dashboard per idroponica, acquaponica e aeroponica dopo la conferma di salvataggio. Verificare separatamente i percorsi con configurazione aggiuntiva per frutteto, oliveto e vigneto. | Per ogni percorso si apre il terreno corretto. Un doppio clic non crea due terreni. Se il salvataggio fallisce l’utente vede l’errore e può riprovare conservando i dati. |
| 5 | Collaudare insieme salvataggio, nuovo accesso, cambio terreno e primo briefing su Supabase locale in Docker. | Il confronto tra dati inseriti, record riletto e input effettivo del Director coincide per ciascun campo usato. Il briefing distingue i dati mancanti e non eredita valori da un altro terreno. |

## Caso di accettazione

Con un account di prova creare il terreno A con suolo argilloso, pH 6,5, esposizione sud, cinque ore di sole e due ostacoli. Negare il GPS e verificare il risultato salvato. Inserire poi manualmente la posizione reale della fixture. Creare il terreno B con caratteristiche diverse. Uscire, rientrare e aprire prima B e poi A. Per entrambi confrontare l’ID del terreno attivo, i valori persistiti e il contesto usato per elaborare i suggerimenti. Ripetere con un terreno senza colture o suggerimenti per verificare cosa vede un nuovo utente al primo ingresso.

## Registro delle prove

| Data | Stato | Evidenza |
|---|---|---|
| 19 novembre 2026 | Verifica del codice completata | [Ingresso dopo il login](../../../app/app/page.tsx), [modulo terreno](../../../components/GardenOnboarding.tsx), [coordinate predefinite](../../../services/geolocationService.ts), [completamento per tipo](../../../components/GardenTypeWizard.tsx), [persistenza Supabase](../../../packages/storage-cloud/SupabaseStorageProvider.ts), [contesto del Director](../../../services/directorService.ts). Rilevati ripiego su Roma, perdita degli ostacoli e mancata conclusione dei tre percorsi fuori suolo. |
| 19 novembre | Browser locale con sessione Supabase | Dal primo ingresso sono stati creati orto, idroponica NFT, acquaponica, aeroponica, frutteto, oliveto e vigneto. Verificati gli ID salvati, il tipo e il briefing del terreno. I tre impianti arborei hanno completato anche la seconda configurazione. Doppio clic su «Completa» nei sei percorsi specializzati, un record per prova. |
| 19 novembre | GPS e nuovo tentativo | GPS negato, campi vuoti, latitudine 0 inserita manualmente e riletta dopo ricarica. Con risposta 503 al primo salvataggio il modulo segnala il problema. Al secondo tentativo il terreno compare una sola volta. |
| 19 novembre | Supabase locale, Docker | Lo [script ripetibile](../../../scripts/audit/onboarding-roundtrip.ts) crea due terreni, esce, rientra e confronta i briefing. Con un suggerimento di prova verifica il conteggio degli ostacoli prima e dopo la modifica e l’isolamento della cancellazione tra terreni. |
| 19 novembre | Cambio terreno su schermo mobile | Dal selettore è stato aggiunto B, poi è stato riselezionato A. La dashboard ha mostrato il briefing di A anche dopo la ricarica. Nel database sono rimasti esattamente due terreni. Corrette la doppia creazione dalla dashboard e la sovrapposizione della chat al pulsante Avanti. |
| 19 novembre | Regressioni | Superati 108 test esistenti del Director e della persistenza. Build di produzione compilata in locale. |
| Da eseguire dopo il rilascio | Produzione | Applicare prima la migrazione dei dati di onboarding, distribuire la versione corrispondente e ripetere il primo ingresso con un terreno di prova. |

## Dati raccolti e uso effettivo

Le colonne si riferiscono a `gardens`, salvo dove indicato. Le verifiche con fixture coprono suolo, pH, ore, direzione, coordinate, orientamento, risposte visive e ostacoli. Per gli altri parametri la tabella descrive il percorso nel codice.

| Dato del modulo | Scrittura e rilettura | Uso e comportamento in assenza del dato |
|---|---|---|
| Nome e tipo di spazio | `name`, `garden_type` | Il nome identifica il terreno nel briefing. Il tipo seleziona le configurazioni e contribuisce al contesto agronomico. |
| Superficie e unità | `size_sq_meters`, `size_unit` | Il modulo richiede una superficie positiva e converte in m². La dashboard mostra la superficie. |
| GPS o coordinate manuali | `coordinates`, gradi decimali | La latitudine alimenta il fotoperiodo. Senza posizione il briefing indica il dato mancante. |
| Quota | `altitude_meters`, metri | Contesto dei suggerimenti se disponibile. |
| Suolo e pH | `soil_type`, `soil_ph` | Contesto delle priorità. Il primo briefing distingue gli spazi coltivati in suolo dai sistemi fuori suolo. |
| Esposizione, ore, direzione, protezione dal vento | `sun_exposure`, `daily_sun_hours`, `aspect_direction`, `wind_protection` | Profilo del sito usato per valutare i suggerimenti. Le ore dirette inserite o stimate restano distinte dal fotoperiodo astronomico. |
| Risposte visive e orientamento panoramico | `visual_sun_input`, `photo_north_offset` (gradi) | Le risposte alimentano la stima delle ore. Per la panoramica si usa la direzione EXIF oppure la calibrazione manuale. Zero gradi è un valore valido. |
| Ostacoli misurati | `garden_obstacles` per ID terreno, azimut e larghezza in gradi, altezza e distanza in metri | Geometria per l’analisi solare e conteggio per il Director. Un terreno senza righe ha un elenco vuoto. Le osservazioni testuali da foto restano distinte dagli ostacoli misurati. |
| Strutture, compost e dati tecnici | `structure_config`, `has_compost_bin`, configurazioni di serra, indoor e sistemi fuori suolo | Gestione del terreno e dei rispettivi impianti. Il primo briefing non elabora singolarmente ogni dettaglio costruttivo. |
| Configurazione di frutteto, oliveto e vigneto | Il secondo wizard riceve l’ID del terreno appena salvato | La conferma apre la dashboard dello stesso terreno. Chi chiude la configurazione ritrova il terreno base già creato. |

Il [piano master](./ORTOMIO_PIANO_MASTER_COMPLETAMENTO_2026-07-24.md) mantiene lo stato complessivo dell’audit.

## Collaudo successivo dalla semina al raccolto

**Esito del 19 novembre 2026: continuità parziale.** Prova sui servizi applicativi con Supabase locale in Docker, account temporaneo, meteo fisso e una zona irrigua manuale. Gli eventi sono stati registrati in sequenza nella stessa esecuzione, con una semina datata 90 giorni prima. Il diario è stato invocato esplicitamente. Il confronto riguarda riepilogo, raccomandazioni, indicatori e titoli e punteggi della coda del Director. [Script ripetibile](../../../scripts/audit/crop-cycle.ts).

| Evento | Evidenza nel briefing o nel diario |
|---|---|
| Terreno iniziale | Il briefing legge il fotoperiodo e il meteo. Compare già «Irrigazione Unknown Zone», priorità 78, pur avendo creato una zona con nome. |
| Semina di pomodoro | La coda acquisisce «Pomodoro - Segni di stress», priorità 78. Questa prova dimostra che il Director legge la coltura. Lo stress non è stato misurato. |
| Aggiornamento a fioritura | La fase Flowering viene riletta dal database. I titoli, le priorità e le raccomandazioni osservati rimangono uguali. |
| Irrigazione manuale di 20 L | Il registro restituisce 20 L per la coltura. Il rapporto fallisce sulla colonna assente irrigation_zones.description e restituisce una zona sconosciuta. |
| Registrazione giornaliera | Con meteo disponibile il diario cerca public.cultivations, assente nello schema locale. Restituisce zero coltivazioni aggiornate e una lista errori vuota. |
| Raccolto di 3 kg e fase Harvested | Il raccolto viene riletto. La coda mantiene l’avviso di stress per la coltura raccolta. |

Criteri per chiudere i difetti: il diario deve elaborare la coltura registrata e segnalare eventuali fallimenti; il rapporto irriguo deve attribuire l’evento alla zona e usare il volume effettivo; una coltura conclusa deve uscire dalle azioni per colture attive, distinguendo il raccolto parziale dalla chiusura. Ripetere con una seconda coltura ancora attiva per verificare l’isolamento delle azioni. La prova riguarda il flusso software di un orto in pieno campo.

### Correzioni verificate il 19 novembre in Docker

| Verifica | Risultato |
|---|---|
| Diario con due colture | Il diario legge semine e trapianti del terreno. Registra il pomodoro in fioritura e il peperone in fase vegetativa. Una seconda esecuzione nello stesso giorno mantiene due sole registrazioni. |
| Irrigazione | Il briefing attribuisce alla zona Pomodori i 20 L registrati. Senza un volume pianificato abbinato a una misura, l’efficienza resta indeterminata. Una misura separata di 8 L su 10 L pianificati produce l’80% del volume previsto. |
| Raccolto | Registrare 3 kg conserva l’avviso per il pomodoro ancora attivo. Chiudere il ciclo rimuove il suo avviso e il suo contributo agli indici del briefing corrente. Il peperone resta attivo. Lo storico giornaliero resta consultabile. |
| Secondo terreno | Lo spinacio compare solo nel suo terreno. Il diario usa il meteo specifico di ciascun terreno. |
| Fallimento e recupero | Un errore indotto nel tracking viene riportato tra gli errori della registrazione. Il conteggio del cron indica un utente fallito, zero riusciti. |

La [prova ripetibile](../../../scripts/audit/crop-cycle.ts) verifica i servizi dell’app e i dati salvati. Il meteo e i volumi della prova sono controllati. Il risultato verifica il passaggio dei dati e la gestione delle priorità osservate. La validazione agronomica sul campo e il collaudo del cron in produzione restano aperti.

Per il rilascio applicare la [migrazione del diario per coltura](../../../supabase/migrations/20261119100000_crop_daily_tracking.sql) prima del codice che la utilizza. La migrazione crea una tabella distinta per le misure per coltura e giorno. Le annotazioni storiche del terreno mantengono la loro tabella.

### Riuso delle operazioni dopo il login · 19 novembre 2026

Prova su un terreno temporaneo in Supabase Docker attraverso i servizi usati dall’app. Si confrontano i dati letti dal motore predittivo prima e dopo ciascuna scrittura, mantenendo fissa l’ora di riferimento. Il test sul filare usa la registrazione unificata con propagazione alle singole piante disattivata. Il feedback della schermata dedicata è provato separatamente invocando il servizio che conclude l’azione. [Script di verifica](../../../scripts/audit/operation-reuse.ts)

| Percorso | Esito osservato | Riuso verificato |
|---|---|---|
| Irrigazione per zona | Il registro conserva i 20 L erogati. Per la stessa zona e data esiste un fabbisogno di 15 L. | Il motore calcola 5 L di scostamento, pari al 25% del volume erogato. È un confronto storico. |
| Irrigazione per filare | Zero registrazioni. Il servizio omette la zona irrigua richiesta dal registro. | Il consumo manca dal confronto. |
| Lavorazione per filare | Il servizio registra una lavorazione su 1 m² anche quando l’operatore indica 50 m². Il tipo di lavoro è fissato a Tilling. | Il contenuto letto dal motore predittivo rimane identico. |
| Lavorazione dalla schermata dedicata | Il servizio di conclusione salva un feedback che il provider rilegge con una seconda richiesta. | Il Director e i servizi per lo storico delle decisioni leggono questo archivio. La prova non ha rilevato variazioni negli input del motore predittivo principale. |
| Trattamento e concimazione per filare | Entrambe le scritture falliscono sul database locale migrato. Il codice del provider usa campi diversi dallo schema del registro. | Zero registrazioni e nessuna variazione degli input. Il planner nutrizionale ha un percorso distinto per concludere un trattamento e registrare feedback. |
| Semina, raccolto parziale, chiusura | Il test del ciclo colturale documentato sopra distingue le tre transizioni. | Si aggiornano il diario o le priorità della coltura interessata. |

**Ordine degli interventi e criteri di verifica**

1. Allineare le scritture allo schema per filare. Verificare dalla schermata autenticata che zona, filare, data, quantità, unità e superficie persistano dopo il ricaricamento. Rendere visibile l’errore se manca una relazione indispensabile.
2. Collegare ogni esecuzione al lavoro di origine e al terreno. Ripetere l’invio dalla stessa schermata e verificare un solo evento. Due interventi distinti nello stesso giorno devono conservare due registrazioni.
3. Per ciascun calcolo dichiarare quali eventi legge, in quali unità, su quale intervallo e quali misure successive servono per valutare l’esito. Quantità applicata, costo sostenuto ed efficacia osservata sono grandezze diverse.
4. Ripetere il ciclo con due terreni e due colture. Per ogni evento confrontare registrazione, storico del Director e risultato prima/dopo. Verificare separatamente i percorsi per pianta, per intero terreno e per ambiente controllato. La precisione predittiva richiede dati di campo con esiti successivi misurati.

Ripetizione del test con il Supabase Docker di audit attivo: `NODE_OPTIONS=--conditions=react-server npx tsx scripts/audit/operation-reuse.ts`.

**Verifica del rilascio.** Applicate le due migrazioni dell’onboarding e del diario per coltura. Il primo collaudo Vercel ha rilevato parametri temporali incompatibili nella richiesta a Open-Meteo. Dopo la correzione della richiesta, il database rifiutava un’umidità media frazionaria nella colonna intera. Entrambe le correzioni sono in produzione sul commit `c9a541e1`. Il cron del diario, avviato manualmente da Vercel, si è concluso in 14,2 secondi. Supabase contiene un record meteo giornaliero per ciascuno dei sei terreni, di cui due con meteo del provider e quattro con fallback sintetico. Non c’erano colture idonee a verificare il tracking per coltura in produzione. Il ciclo con colture è stato provato in Docker.

### Correzioni dei registri e delle analisi · 19 novembre 2026

Il test Docker ora richiede una scrittura e una variazione dei dati di analisi per ciascuna delle quattro operazioni per filare. Un diserbo di 50 m² conserva tipo e superficie. Il registro idrico accetta un filare manuale di proprietà dell’utente e conserva la zona irrigua quando indicata. Il confronto irriguo usa le zone abbinate ai loro fabbisogni. I litri dei filari manuali figurano nel totale delle operazioni. Le concimazioni e i trattamenti conservano dosi e unità. Le quantità su base ettaro restano distinte dai quantitativi assoluti.

La pagina Predizioni dell’app mostra il numero di esecuzioni degli ultimi 15 giorni e il costo delle lavorazioni presente nei feedback. Gli snapshot conservano i totali per operazione, filare, prodotto e unità. Gli eventi propagati alle piante sono esclusi dal totale del terreno quando è già presente il lavoro di origine. Un piano nutrizionale esteso al terreno viene registrato una volta. Il test include due completamenti concorrenti dello stesso piano e la ripetizione di un piano per singola pianta.

Il collaudo impiega un utente Supabase locale e i servizi applicativi. Copre il confronto di 20 L con un fabbisogno di 15 L in presenza di una registrazione manuale separata, e la rilettura di 12 euro di costo effettivo anche dal client usato dal server. L’efficacia agronomica dei trattamenti e la precisione delle stime richiedono osservazioni in campo. Le superfici storiche prive di misura attendibile restano da riconciliare.

La prova HTTP autenticata ha rilevato e verificato la correzione dell’errore 500 causato dalla chiave obbligatoria mancante al salvataggio delle predizioni. Con l’app Docker di audit in ascolto sulla porta 3004, aggiungere `AUDIT_LOCAL_HTTP=1` al comando di prova. La risposta deve contenere un ID di previsione, i 3 L del trattamento pianificato e i 12 euro misurati.

Verificato anche il ciclo del planner nutrizionale con giacenza iniziale di 10 g. La registrazione di 3 g sul filare porta la giacenza a 7 g, conserva la categoria fertilizzante e produce un totale analitico di 3 g.
