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
