# ORTOMIO - PRESENTAZIONE PER STAKEHOLDER ACCADEMICI E TECNICI (2026-04-18)

## Premessa
Questo documento non nasce come materiale marketing.

Nasce per spiegare in modo chiaro, difendibile e leggibile da uno stakeholder tecnico o accademico:
- che cosa OrtoMio e oggi
- fino a che livello di precisione si e spinto il progetto
- che cosa il sistema calcola realmente
- quali colture o verticali risultano oggi piu mature
- quale potrebbe essere una seconda fase di consolidamento
- quale potrebbe essere un obiettivo di terza fase con supporto universitario

Regola metodologica:
- le parti su `stato attuale` derivano solo da codice verificato nel repository locale
- le parti su `fase successiva` e `obiettivo di ricerca` sono proposte progettuali, non funzionalita gia completate

Documento tecnico di base da cui questo testo deriva:
- `docs/reports/ORTOMIO_APPLICATION_CURRENT_STATE_2026-04-18.md`

## Contesto: AI e agricoltura
L'uso dell'intelligenza artificiale in agricoltura ha valore reale solo quando non si limita a generare testo o suggerimenti generici.

Per essere utile in un contesto agricolo, un sistema deve:
- leggere un contesto colturale reale
- distinguere tra colture, fasi, priorita e rischi differenti
- organizzare i dati in modo operativo
- trasformare segnali e osservazioni in decisioni tracciabili
- collegare la raccomandazione al lavoro sul campo e al risultato osservato

In questa prospettiva, OrtoMio non nasce come chatbot agricolo.
Nasce come tentativo di costruire una piattaforma orchestrale, decisionale e predittiva in cui l'AI e i motori di regole abbiano una funzione concreta: aiutare a decidere, prioritizzare, eseguire e poi verificare.

## Nota sul percorso di sviluppo
E importante dichiarare apertamente un aspetto del progetto.

Il sistema e stato sviluppato senza una formazione agronomica specialistica completa da parte di chi lo ha realizzato.
La costruzione delle logiche presenti oggi si e basata su:
- esperienza empirica maturata sul campo e sull'uso reale
- studio progressivo di nozioni agronomiche apprese durante lo sviluppo
- osservazione dei problemi operativi che un agricoltore incontra lungo il ciclo colturale
- tentativo di trasformare tali problemi in strutture software coerenti e migliorabili

Questo non riduce il valore della base realizzata.
Al contrario, definisce correttamente la natura del progetto:
- non un sistema che pretende di sostituire il sapere agronomico
- ma una base software seria che prova a organizzarlo, renderlo operativo e metterlo a disposizione

La posizione corretta oggi e quindi questa:
se la base risulta architetturalmente solida, coerente e tecnicamente promettente, esiste una forte disponibilita a metterla a disposizione di competenze agronomiche piu avanzate per migliorarla, calibrarla e renderla pienamente fruibile.

## Sintesi esecutiva
OrtoMio oggi non e un semplice diario agricolo e non e solo una dashboard.

Dal codice emerge come una piattaforma applicativa di gestione agricola e supporto decisionale che unisce:
- modellazione del contesto colturale
- pianificazione operativa
- registrazione delle esecuzioni
- monitoraggio salute, irrigazione, raccolta e qualita
- moduli di precision agriculture
- verticali dedicati per frutteto, oliveto e vigneto

Il livello di precisione gia raggiunto e significativo per una piattaforma applicativa:
- precisione spaziale: appezzamento, zona, filare, pianta individuale, albero, vite
- precisione decisionale: priorita diverse per acqua, nutrizione, salute e qualita
- precisione colturale: profili agronomici distinti per 15 famiglie/verticali colturali
- precisione operativa: collegamento tra suggerimento, task, esecuzione, feedback ed export
- precisione contestuale: per i task agronomici piu evoluti il sistema conserva anche snapshot decisionale, confidence, segnali mancanti e contesto cultivar/sotto-sistema/sito

Il punto importante, pero, e questo:
OrtoMio oggi e gia una base tecnica seria di decision support agronomico, ma non e ancora un sistema scientificamente calibrato e validato in modo completo su tutte le colture e su tutti i moduli.

## Sommario dei messaggi chiave
Per uno stakeholder tecnico, agronomico o accademico, i punti piu rilevanti sono:
- OrtoMio e gia oggi una piattaforma applicativa ampia e reale, non un prototipo concettuale
- il valore principale del sistema sta nella sua capacita di orchestrare il ciclo decisionale, non solo di archiviare dati
- il software copre il ciclo di vita operativo dalla semina o impianto fino a raccolta, esito qualitativo e chiusura del ciclo
- alcune aree, soprattutto irrigazione avanzata, priorita agronomiche e verticali woody, mostrano gia una struttura tecnica convincente
- altre aree richiedono consolidamento, calibrazione e validazione con competenze agronomiche piu forti
- il progetto ha gia superato il livello del gestionale tradizionale, ma il suo salto di qualita dipendera dalla fase di consolidamento metodologico

## 1. Cosa rappresenta OrtoMio oggi
La lettura del codice porta a una definizione precisa:

OrtoMio e una piattaforma software agricola che prova a collegare in un unico sistema:
- struttura aziendale e colturale
- agenda operativa e task execution
- dati agronomici e segnali ambientali
- supporto decisionale
- storico dei risultati
- strumenti di precision agriculture e export operativo

Questo significa che il progetto non si ferma alla visualizzazione dei dati.
Prova invece a fare un passo in piu: trasformare dati, osservazioni e configurazioni colturali in decisioni operative o in raccomandazioni motivate.

## 1.1 La logica orchestrale del sistema
La caratteristica distintiva di OrtoMio non e semplicemente la presenza di molti moduli.
La caratteristica distintiva e il tentativo di orchestrare un processo completo.

Nel codice questa orchestrazione emerge come sequenza:
- descrizione del contesto colturale
- raccolta o stima dei segnali rilevanti
- interpretazione del contesto tramite profili e motori decisionali
- generazione di priorita o suggerimenti
- trasformazione in task operativi
- esecuzione sul campo
- registrazione dell'outcome
- riuso dello storico per migliorare le decisioni successive

Negli ultimi aggiornamenti questo passaggio si e rafforzato in due modi:
- il contesto agronomico non e piu solo generico, ma puo includere cultivar, intento produttivo, sotto-sistema e profilo operativo del sito
- i task agronomici esposti nel planner possono mostrare gia in frontend se l'esecuzione e pronta, parziale o da verificare, insieme a confidence e segnali mancanti

Questo approccio e importante perche in agricoltura la decisione non e quasi mai un evento isolato.
E un ciclo continuo di osservazione, scelta, azione, verifica e adattamento.

## 2. Fino a che livello di precisione si e spinto il progetto
Il livello di precisione gia raggiunto si puo leggere su quattro piani.

### 2.1 Precisione spaziale
Nel codice esistono livelli distinti di gestione:
- giardino / appezzamento
- zona di terreno
- filare
- pianta individuale
- albero
- vite

Questo e un punto forte del progetto, perche permette di non ragionare solo a livello "azienda" ma di scendere fino all'unita operativa utile.

### 2.2 Precisione agronomica
Il sistema non tratta tutte le colture allo stesso modo.
Esistono profili agronomici distinti con:
- fasi fenologiche
- stadi critici per la decisione
- segnali prioritari richiesti
- priorita diverse tra acqua, nutrizione, salute e qualita
- modificatori economici e operativi per alcune colture

Questa e gia una forma concreta di precisione agronomica, perche la logica decisionale cambia in base alla coltura e al contesto.

### 2.3 Precisione decisionale
Il sistema include motori che cercano di attribuire una priorita operativa alle azioni.
La priorita non dipende solo da un punteggio generico, ma anche da:
- copertura dei segnali ad alta priorita
- fase fenologica critica
- pressione ambientale
- feedback misurato
- confronto economico tra intervenire ora, aspettare il prossimo ciclo o monitorare

Questa e una delle parti piu interessanti del progetto, perche sposta il software da "registro digitale" a "motore di priorita ragionata".

### 2.4 Precisione operativa
Una parte importante del codice collega:
- suggerimento
- task
- esecuzione
- outcome
- export
- storico

Questa tracciabilita e molto rilevante, perche rende il sistema potenzialmente adatto non solo a suggerire, ma anche a misurare se la decisione presa abbia prodotto o meno un risultato.

## 2.5 Precisione lungo il ciclo di vita colturale
Un altro elemento rilevante e che il progetto non si concentra solo su un punto del ciclo.

Dal codice emerge la volonta di coprire l'intero ciclo di vita di colture erbacee e legnose:
- seme
- piantina
- pianta individuale
- filare o zona
- albero
- vite
- olivo
- crescita vegetativa
- fasi fenologiche
- interventi irrigui, nutrizionali, sanitari e meccanici
- raccolta
- valutazione di resa e qualita
- chiusura del ciclo e memoria storica della coltura

Nel caso delle colture legnose e delle colture specialistiche, il sistema arriva gia a coprire una parte importante del passaggio da impianto a gestione produttiva e raccolta.
Nel caso delle colture annuali e orticole, la copertura e piu forte sul piano della pianificazione, del filare, dell'operativita e della raccolta.

Quando si parla di "smaltimento" o fine ciclo, la traduzione software oggi piu corretta e:
- chiusura del task
- conclusione del ciclo colturale o produttivo
- registrazione del raccolto e dell'esito
- memoria storica per rotazione, confronto e pianificazione futura

Questa chiusura di ciclo e gia presente come logica applicativa, anche se non tutte le sue espressioni UI sono mature allo stesso livello.

## 3. Che cosa OrtoMio calcola oggi, e come lo calcola
La domanda corretta non e solo "quali moduli ci sono", ma "quali calcoli reali esistono nel codice".

## 3.0 Come vengono prese le decisioni e come nascono i suggerimenti
Uno degli aspetti piu importanti da spiegare a uno stakeholder e che i suggerimenti non nascono, nel codice, come testo casuale.

In termini architetturali, la decisione nasce dalla combinazione di:
- contesto del giardino o del comparto
- tipologia colturale
- profilo agronomico risolto
- stadio fenologico o stadio operativo
- segnali disponibili
- storico delle operazioni
- outcome gia osservati
- pressione ambientale o sanitaria
- valutazione economica del ritardo o dell'intervento

Questa combinazione produce:
- priorita
- raccomandazioni
- task
- volumi o dosi consigliate
- avvisi
- motivazioni testuali

La parte AI, in questo quadro, ha senso soprattutto come strato interpretativo e di supporto.
Il cuore del sistema, pero, e l'orchestrazione delle informazioni e la loro trasformazione in decisioni operative.

### 3.1 Irrigazione avanzata
Questa e una delle aree piu strutturate.

Il motore irriguo calcola oggi:
- ETc come `ET0 x Kc`
- fabbisogno irriguo al netto della pioggia efficace
- correzioni dovute a pendenza ed esposizione
- correzioni dovute alla qualita dell'acqua
- bilancio idrico di suolo stimato
- volume consigliato
- durata irrigua suggerita
- livello di confidenza della raccomandazione
- spiegazione agronomica testuale del risultato

Nel codice il calcolo considera anche:
- profondita radicale del profilo colturale
- field capacity
- wilting point
- acqua disponibile
- deficit idrico
- target di refill
- rischio di compattazione e drenaggio
- salinita, pH e bicarbonati dell'acqua
- efficienza del sistema irriguo

In pratica, la logica non si limita a dire "irriga di piu".
Prova a tradurre il contesto colturale e fisico in un volume e in una motivazione.

Limiti attuali da dichiarare con onesta:
- il coefficiente Kc resta ancora user-provided
- le curve Kc per stadio colturale non sono ancora formalizzate nell'engine
- il fattore agronomico suggerito non viene ancora applicato automaticamente al volume base Penman-Monteith

### 3.2 Motore di priorita agronomica
Il sistema contiene un motore che assegna priorita a decisioni su:
- acqua
- nutrizione
- salute
- qualita

La priorita viene costruita combinando:
- punteggio base
- confidenza
- profilo colturale risolto
- copertura dei segnali P0 richiesti
- stadio critico
- riepilogo economico
- pressione ambientale
- feedback misurato

Il sistema puo quindi aumentare o ridurre il peso di un'azione in funzione del contesto.
Questo e importante perche introduce una forma di decisione contestuale e non puramente statica.

### 3.3 Analisi predittiva dei filari
Il modulo field rows produce oggi, per ciascun filare:
- previsione della data ottimale di raccolta
- previsione di resa attesa
- stato salute con score 0-100
- fabbisogno irriguo sui successivi 7 giorni
- azioni raccomandate

Gli input usati includono:
- coltura o cultivar del filare
- dati meteo
- storico operazioni recenti
- stato delle piante individuali
- schede master della coltura

Questa parte e utile perche mostra un livello intermedio di precisione: non ancora singola pianta pura, ma gia oltre il livello del semplice appezzamento.

Limite attuale:
- parte della logica resta euristica e semplificata, soprattutto nel punteggio salute e nei suggerimenti di fallback

### 3.4 NDVI e analisi satellitare
Il modulo NDVI calcola o gestisce oggi:
- ultima lettura NDVI disponibile
- analisi per zone
- classificazione salute vegetativa
- identificazione di aree in stress
- trend storico NDVI
- raccomandazioni associate allo stato vegetativo

Il servizio supporta come interfacce:
- Sentinel Hub
- EOSDA

Nel codice sono previsti anche:
- EVI
- SAVI
- cloud coverage
- risoluzione metrica
- fonte satellitare

Limite attuale importante:
- se i dati reali non sono disponibili, il sistema usa fallback simulati
- il trend storico contiene ancora una parte simulata / TODO

Quindi il modulo esiste davvero, ma oggi va presentato come motore ibrido tra integrazione reale e fallback dimostrativo.

### 3.5 Prescription Maps
Questa e una delle aree piu interessanti, ma anche una delle piu delicate da presentare bene.

Il servizio di prescription maps esegue oggi una pipeline logica chiara:
- valida la richiesta
- raccoglie fonti dati
- fonde i dati su una griglia spaziale da 10 metri
- tiene solo i punti con confidenza sufficiente
- genera zone con clustering K-means semplificato
- calcola la dose per zona
- produce statistiche e analisi costi/benefici
- salva mappa, zone, export ed execution records

La dose per zona oggi viene calcolata con una logica di variable rate lineare intorno a una base rate, con limiti min/max.

Il modulo produce anche:
- data quality
- confidence
- summary di efficacia esecutiva
- variance summary
- outcome summary
- intelligence summary agronomica

Questa parte dimostra che il progetto non si e fermato alla visualizzazione della mappa, ma ha gia introdotto:
- versione della mappa
- export
- ritorno dal campo
- confronto tra piano e applicazione reale

Limiti attuali da esplicitare:
- il recupero di NDVI, plant-level data e soil data e ancora placeholder in punti chiave del service
- il valore del suolo nella fusione e ancora semplificato
- il bounding box geografico del giardino e ancora di default in una parte del servizio
- l'analisi economica usa ipotesi interne generiche, non ancora calibrate per coltura/sito
- la preview UX della mappa e ancora incompleta

Conclusione corretta:
le prescription maps esistono gia come architettura applicativa seria, ma non vanno ancora presentate come motore scientifico pienamente chiuso e calibrato su dati reali in ogni passaggio.

### 3.6 Calcolo economico delle priorita
Esiste una logica che prova a stimare:
- costo di intervento
- costo del ritardo
- valore protetto
- impatto netto
- ROI

Il sistema confronta anche scenari alternativi:
- intervenire ora
- agire nel prossimo ciclo
- monitorare

Questo e un segnale importante di maturita progettuale, perche il software non pensa solo in termini biologici, ma anche in termini di convenienza operativa.

Limite attuale:
- la parte economica e ben strutturata ma ancora piu da "motore ingegnerizzato" che da modello scientificamente validato in campo

## 4. Quali colture supporta oggi
Nel motore agronomico esistono oggi 15 profili colturali principali.

Le famiglie o aree supportate includono:
- cereali da pieno campo e vernini: frumento, grano duro, grano tenero, orzo, mais, avena, segale, triticale
- orticole a foglia e brassicacee: lattuga, cicoria, radicchio, spinacio, bietola, rucola, cavolfiore, broccoli, cavoli
- orticole da frutto: pomodoro, peperone, peperoncino, melanzana, zucchina, cetriolo, melone, anguria
- leguminose: fagiolo, fagiolino, pisello, fava, cece, lenticchia, favino, pisello proteico
- aromatiche mediterranee: basilico, rosmarino, salvia, menta, timo, origano
- colture perenni da pieno campo: carciofo, asparago, cardo
- colture industriali o estensive: mais, girasole, colza, soia, bietola da zucchero, sorgo, cotone, tabacco
- frutteto generico
- oliveto
- vigneto
- colture leafy in ambiente controllato, indoor, hydroponic, aquaponic e aeroponic

Questo significa che il progetto non e chiuso su una sola coltura o su una sola filiera.
La struttura attuale punta gia a un impianto multi-coltura e multi-sistema.

## 5. Quali colture o verticali risultano oggi piu avanzate
La maturita non e uniforme.
Se si guarda il codice con rigore, oggi le aree piu avanzate sono queste.

### 5.1 Vigneto
Il vigneto e probabilmente il verticale piu maturo sul piano della combinazione tra dominio e precisione.

Motivi:
- esiste una route dedicata con dashboard e gestione viti
- esiste un profilo agronomico specifico `vineyard_quality`
- il profilo include modificatori decisionali, economici e di confronto azione/rinvio
- esiste uno scenario di validazione dedicato vicino alla maturazione
- esiste un servizio professionale per il Ravaz Index con persistenza Supabase
- esistono strumenti dedicati su maturazione uva e gestione della vendemmia

In termini di ricerca applicata, il vigneto e oggi una delle aree piu promettenti.

### 5.2 Frutteto
Il frutteto e una seconda area molto forte.

Motivi:
- esiste un verticale dedicato con gestione alberi, filari, potature e raccolte
- esiste un profilo `orchard_generic`
- esiste uno scenario di validazione dedicato alla qualita del frutto
- esiste tracking della resa per singolo albero con dati reali via service
- la logica quality-oriented e gia ben rappresentata

Il frutteto oggi e molto interessante come base per ragionare su precisione albero-per-albero.

### 5.3 Oliveto
L'oliveto e forte sul piano del modello agronomico, ma leggermente meno uniforme sul piano dell'applicazione specialistica.

Motivi:
- esiste un verticale dedicato
- esiste un profilo `olive_grove_oil`
- il profilo e fortemente orientato a qualita e resa in olio
- esiste uno scenario di validazione dedicato
- il contesto operativo dell'oliveto e integrato in task, alberi, raccolte e lavori

Punto di attenzione:
- alcuni strumenti specialistici come monitoraggio mosca olearia e indice di Jaen sono oggi piu vicini a tool operativi standalone che a un flusso pienamente persistito e consolidato end-to-end

### 5.4 Cereali vernini e brassicacee di pieno campo
Queste aree non hanno la stessa ricchezza di interfaccia dedicata del vigneto o del frutteto, ma sono forti lato motore decisionale.

Motivi:
- profili agronomici dedicati
- segnali prioritari definiti
- modificatori economici e di decisione
- scenari di validazione presenti nel validation harness

Per una collaborazione con un professore, sono aree molto adatte se si vuole lavorare su calibrazione del motore agronomico e non solo sull'interfaccia.

## 5.5 Il valore trasversale della copertura multi-ciclo
Un elemento da sottolineare con forza e che OrtoMio non ragiona solo per colture isolate, ma per continuita operativa.

Lo si vede dalla presenza combinata di:
- semenzaio
- banca semi
- piantine e sapling
- piante individuali
- filari e zone
- colture legnose
- raccolta e qualita
- export e storico

Questo rende il sistema potenzialmente utile non solo per decidere un singolo intervento, ma per seguire il percorso della coltura dalla fase iniziale fino alla chiusura del ciclo.

## 6. Punto A - Dove siamo oggi
La fotografia piu corretta del punto A e questa:

OrtoMio oggi e gia in grado di funzionare come piattaforma operativa di gestione agricola con una vera struttura di precision agriculture, soprattutto per:
- gestione del contesto colturale
- pianificazione e task orchestration
- irrigazione ragionata
- monitoraggio salute
- analytics e qualita
- verticali woody
- NDVI e prescription maps come architettura applicativa

Il livello attuale e quindi superiore a un software gestionale agricolo semplice.

Pero il sistema, ad oggi, e ancora in una fase in cui convivono:
- moduli molto maturi
- moduli parziali
- moduli con fallback o placeholder

La definizione corretta non e "sistema finito".
La definizione corretta e:

piattaforma avanzata gia operativa, con motori decisionali reali, ma ancora da consolidare e calibrare per raggiungere un livello pienamente scientifico e industriale.

## 7. Punto B - Seconda fase realistica di miglioramento
La seconda fase non dovrebbe puntare a "mettere altre schermate".
Dovrebbe puntare a consolidare scientificamente e operativamente cio che gia c'e.

Le priorita piu sensate sono:

### 7.1 Chiudere la parte dati reali nelle prescription maps
- sostituire placeholder e sample data con ingestion reale di NDVI, pianta e suolo
- usare il vero bounding box del giardino
- sostituire il soil score semplificato con una funzione derivata da analisi pedologica reale
- rafforzare preview e verifica della mappa

### 7.2 Formalizzare il motore irriguo per coltura e fase
- introdurre curve Kc per stadio colturale
- legare meglio il calcolo irriguo alla fenologia osservata
- trasformare il fattore agronomico da informativo a effettivamente integrato nel calcolo, quando validato

### 7.3 Consolidare il feedback loop dal campo
- rendere piu sistematica la raccolta di outcome
- collegare in modo piu forte esecuzione, qualita e ROI
- migliorare i benchmark per zona, coltura e stagione

### 7.4 Rendere piu mature le verticali specialistiche
- oliveto: persistenza e storicizzazione piena di mosca olearia e maturazione
- vigneto: rafforzare collegamento tra maturazione, qualita e decisioni
- frutteto: chiudere analytics oggi ancora in sviluppo

### 7.5 Unificare meglio il racconto operativo
- allineare diary, calendar, reports e advice ai dati reali
- ridurre aree mock o parziali
- produrre documentazione utente coerente con lo stato effettivo del software

In altre parole, il punto B non e "aggiungere marketing".
E rendere il sistema tecnicamente piu solido, piu misurabile e piu difendibile.

## 8. Punto C - Obiettivo alto con supporto accademico
Il punto C puo essere formulato cosi:

trasformare OrtoMio da piattaforma applicativa avanzata con logica agronomica strutturata a piattaforma di decision support agronomico validata, spiegabile e scientificamente calibrata.

Questo obiettivo puo includere:
- calibrazione dei modelli decisionali per coltura e fase fenologica
- definizione di protocolli sperimentali per validare i punteggi di priorita
- validazione delle soglie su segnali ambientali e fitosanitari
- calibrazione del motore prescription su dati reali georeferenziati
- costruzione di benchmark agronomici ripetibili
- definizione di metriche scientifiche di performance:
  - accuratezza della raccomandazione
  - riduzione input
  - protezione della qualita
  - impatto economico
  - stabilita del modello tra siti diversi

Se il punto A e "software funzionante" e il punto B e "software consolidato", il punto C e "metodologia validata".

Ed e proprio qui che un professore puo portare il massimo valore.

## 9. In che modo un professore potrebbe aiutare davvero
Il contributo accademico sarebbe particolarmente utile su cinque fronti.

### 9.1 Validazione metodologica
Definire come dimostrare che una priorita o una raccomandazione sia corretta, utile e non solo plausibile.

### 9.2 Calibrazione per coltura
Stabilire dove il motore va calibrato diversamente tra vigneto, oliveto, frutteto, brassicacee, cereali e colture protette.

### 9.3 Disegno sperimentale
Impostare campi prova, lotti di confronto, metriche e protocolli di raccolta dati.

### 9.4 Interpretabilita
Rendere i motori decisionali ancora piu spiegabili e presentabili anche in contesti scientifici o istituzionali.

### 9.5 Priorita della ricerca
Aiutare a scegliere dove investire per prima la seconda fase:
- acqua
- qualita
- salute
- variable rate
- validazione economica

## 10. Messaggio finale da consegnare a uno stakeholder
La formulazione piu corretta, sintetica e onesta e questa:

OrtoMio oggi e gia una piattaforma agricola avanzata che ha superato il livello del semplice gestionale.
Integra struttura colturale, task, monitoraggio, motori decisionali e primi strumenti concreti di precision agriculture.

La parte piu forte oggi non e solo la presenza di moduli separati, ma il fatto che il sistema abbia gia iniziato a collegare segnali, contesto colturale, priorita operative, esecuzione e ritorno dal campo.

Le aree oggi piu mature sono il motore irriguo, il motore di priorita agronomica, il verticale vigneto, il verticale frutteto e il modello agronomico per oliveto, oltre alla struttura generale di NDVI e prescription maps.

Il passaggio da fare adesso non e inventare nuove promesse.
Il passaggio corretto e consolidare, calibrare e validare.

Se questo passaggio viene fatto bene, il progetto puo evolvere dal punto A attuale, che e gia concreto, al punto B di piattaforma consolidata, fino al punto C di sistema decisionale agronomico con ambizione scientifica reale.

## Base tecnica utilizzata per questa presentazione
Le affermazioni sullo stato attuale derivano principalmente da questi file del repository:
- `docs/reports/ORTOMIO_APPLICATION_CURRENT_STATE_2026-04-18.md`
- `services/advancedIrrigationService.ts`
- `services/agronomicPriorityService.ts`
- `services/agronomicEconomicPriorityService.ts`
- `services/fieldRowPredictiveService.ts`
- `services/ndviSatelliteService.ts`
- `services/prescriptionMapsService.ts`
- `data/agronomicCropProfiles.ts`
- `data/agronomicValidationScenarios.ts`
- `services/agronomicValidationHarness.ts`
- `services/vineyardBudLoadService.ts`
- `components/orchard/YieldPerTreeTracker.tsx`
