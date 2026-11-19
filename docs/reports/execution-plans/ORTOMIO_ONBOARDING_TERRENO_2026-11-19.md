# Dal primo terreno al briefing dell’orchestratore

19 novembre 2026 · Stato aperto · Versione esaminata `63cc6cda`, pubblicata il 19 novembre.

L’utente entra in /app, sceglie «Crea il tuo orto», descrive il terreno e lo ritrova dopo un nuovo accesso. Il primo briefing deve usare i dati del terreno selezionato e indicare quali informazioni servono ancora. La verifica iniziale ha seguito il codice. Le prove attraverso l’interfaccia sono da eseguire.

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
| Da compilare | Correzioni e prove aperte | Per ogni intervento aggiungere commit, ambiente, scenario provato ed esito. Registrare a parte il collaudo dopo il rilascio. |

Il [piano master](./ORTOMIO_PIANO_MASTER_COMPLETAMENTO_2026-07-24.md) mantiene lo stato complessivo dell’audit.
