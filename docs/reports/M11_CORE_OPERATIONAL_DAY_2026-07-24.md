# M11 - Giornata operativa end-to-end

## Evidenze locali disponibili

- diario: scrittura, rilettura dopo ricreazione servizio e fail-closed senza cloud;
- operazioni piante: idempotency key al writer;
- task agronomici: creazione e completamento registrati nel decision ledger;
- outcome: feedback operatore sincronizzato prima dell'evidenza di coda;
- export: timezone canonica `Europe/Rome`;
- comandi fisici: retry limitato, timeout e dead letter.

## Transizioni task uniformi

- `garden_tasks.operational_status` esplicita `open`, `in_progress`, `completed` e `cancelled`;
- riapertura e annullamento richiedono un motivo sia nel client sia nella funzione database;
- `transition_garden_task` serializza la transizione con row lock, verifica il proprietario e limita le transizioni ammesse;
- ogni cambio produce un evento persistente con attore, stato precedente/successivo, motivo e chiave di idempotenza per utente;
- il replay della stessa richiesta e' innocuo, mentre il riuso discordante della chiave viene rifiutato;
- test locali: type-check verde e persistenza 29/29.

## Ricorrenze e cambio ora

- il calendario operativo usa esplicitamente `Europe/Rome`, senza dipendere dalla timezone del processo;
- ricorrenze giornaliere e settimanali conservano l'ora locale attraverso entrambi i cambi DST;
- le ricorrenze mensili mantengono il giorno originario e ripiegano sull'ultimo giorno valido del mese;
- intervalli non positivi e range invertiti falliscono senza produrre occorrenze;
- i task ricorrenti iniziati prima del range richiesto vengono inclusi, mentre l'istanza iniziale non viene duplicata;
- test locali aggiornati: type-check verde e persistenza 50/50.

## Riconciliazione debito core

- la dashboard consumer carica i task reali dell'orto e riattiva il widget ricette sui raccolti effettivi;
- gli alias creati dal wizard colture registrano l'utente autenticato;
- tre occorrenze `placeholder` di soli label/prop UI sono classificate esplicitamente come accettate;
- gli alert salute creano task persistenti collegati e non duplicabili dalla UI; il conteggio attenzione deriva dai task trattamento aperti;
- la condivisione dell'almanacco usa feedback accessibile senza `alert()` e le statistiche zona sommano le piante persistite nei filari;
- le operazioni rapide su filare richiedono un utente autenticato, caricano le foto sul provider cloud e restituiscono gli ID dei registri unificati persistiti, eliminando il registro solo in memoria;
- la creazione di un campo salva filari e piante individuali tramite il provider cloud; un errore parziale attiva la compensazione dei record già creati;
- i piani personalizzati vengono letti dal provider, reidratati dalla scheda master e collegati in modo persistente ai task; un piano mancante fallisce senza aggiornare il task;
- il componente morto `AdvancedTreeManager`, non importato e composto interamente da alberi, misure, operazioni e rese casuali, e' stato rimosso dal runtime;
- anche `InteractiveTrackingInterface`, non importata e basata su meteo e foto inventati, e' stata rimossa invece di lasciare una falsa superficie operativa;
- il duplicato morto `components/SaplingDashboard.tsx` e' stato rimosso; le pagine continuano a usare il dashboard alberelli canonico in `components/seedbank`;
- la route tecnica `/app/compare` e il dettaglio obsoleto sono stati rimossi: puntavano a route legacy inesistenti e descrivevano come placeholder capability specializzate oggi stabili;
- la modifica di un'operazione nel ciclo pianta riusa il form esistente e invoca il callback persistente `onUpdateOperation`, invece di limitarsi a un log console;
- la vista struttura dell'orto collega la gestione zone canonica passando esplicitamente l'ID orto; capability gate 10/10;
- le voci M11 pianificate scendono da 58 a 4; nessuna voce release resta non classificata.
- la Dashboard usa l'inventario fertilizzanti reale, esegue un timer irriguo collegato al log persistente e salva le decisioni di aggiustamento stagionale con RLS proprietario.
- il vecchio `components/Journal.tsx`, non importato da alcun runtime, e' stato rimosso; `/app/journal` converge gia' sul Diario canonico `/app/diary` e un test impedisce la reintroduzione del duplicato.
- acquaponica e aeroponica richiedono l'ingombro reale in m² e lo includono nel riepilogo dimensionale, eliminando i due valori fissi a zero.
- il PDF mensile costruisce una griglia lunedì-domenica con task, stato, meteo, luna e almanacco per ciascun giorno.
- l'orchestratore ripristina il tipo di garden dal record proprietario e risolve la famiglia botanica dalla tassonomia o dall'archetipo prima di creare la coltura.
- gli export geografici generano URL locali reali e ZIP con directory/CRC; Shapefile e' dichiarato indisponibile e fallisce esplicitamente finche' non viene introdotto un encoder binario auditato.
- la sincronizzazione filare-pianta usa solo il writer durevole, fallisce senza capability e calcola le statistiche dalle operazioni realmente eseguite; i cinque helper fittizi non raggiungibili sono stati rimossi.

## Sequenza da certificare

1. Responsabile crea piano e task.
2. Operatore apre il task assegnato.
3. Esecuzione registra misura/evidenza e idempotency key.
4. Task passa a completato una sola volta.
5. Diario riceve evento e revisione.
6. Ledger decisionale collega decisione, task, esecuzione e outcome.
7. Riapertura o annullamento conserva audit e motivo.
8. Export finale riconcilia task, diario, trattamento e ledger.

## Gap

- giornata simulata con utenti e ruoli reali non eseguita;
- il decision ledger conserva ancora una migrazione da preference cache, residuo M09;
- migrazioni P3-P5 non applicate sullo schema candidato.

Le parti locali `O25-O26` sono completate. M11 resta parziale finche' la sequenza completa non viene eseguita e riconciliata su staging.
