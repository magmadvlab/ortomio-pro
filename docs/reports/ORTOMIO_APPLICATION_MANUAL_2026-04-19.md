# ORTOMIO APPLICATION MANUAL

Data aggiornamento: 2026-04-29
Versione: riallineata agli ultimi avanzamenti funzionali

## 1. Scopo del manuale

Questo manuale descrive cosa fa oggi OrtoMio dal punto di vista utente e operativo.

Non descrive ambizioni future come se fossero gia disponibili. Documenta lo stato reale attuale dell'applicazione.

## 2. Obiettivo dell'applicazione

OrtoMio serve a supportare il lavoro agronomico quotidiano attraverso un ciclo continuo:

1. lettura del contesto
2. suggerimento di priorita operative
3. esecuzione dei task
4. registrazione degli esiti
5. conservazione della memoria decisionale

## 3. Funzioni principali disponibili

### 3.1 Planner e task agronomici

L'applicazione consente di:

- visualizzare task e priorita operative
- organizzare il lavoro agronomico in una coda gestibile
- collegare il task al contesto che lo ha generato
- avviare la chiusura operativa del task da un fast path mobile con riepilogo, evidenze richieste, note rapide e feedback essenziale
- usare la chat AI del planner come supporto assistivo contestuale sui task aperti, quando piano utente e credits AI lo consentono

### 3.2 Decision support

Il sistema supporta la generazione di raccomandazioni agronomiche contestuali.

Le decisioni possono dipendere da:

- stato colturale
- segnali ambientali
- dati meteo
- regole agronomiche del dominio
- storico operativo disponibile
- contesto raffinato di coltura, sottosistema e profilo sito quando disponibile

Con gli ultimi riallineamenti P1, il contesto raffinato viene propagato in modo piu uniforme nel loop decisionale. Director, prescription, irrigation queue, phenology queue e health queue possono conservare nei metadata decisionali informazioni come cultivar/specie, intento produttivo, sottosistema colturale e profilo operativo del sito, senza forzare valori non espliciti.

Il director usa anche il profilo garden-level raccolto dal wizard quando trasforma i suggerimenti in azioni prioritarie. Per i garden in campo aperto questo include, dove disponibili, tipo di terreno, pH, altitudine, esposizione solare, ore di sole stimate, orientamento, protezione dal vento e ostacoli che generano ombre. Questi dati entrano nel refined context, nelle spiegazioni decisionali e, in forma prudente, nel priority scoring: terreno sabbioso, sole pieno, esposizione e bassa protezione dal vento possono aumentare la pressione idrica; ombra e poche ore di sole possono aumentare la pressione sanitaria; pH acido o alcalino puo aumentare la priorita nutrizionale; quota elevata e pendenza possono aumentare la pressione di monitoraggio qualita. Le regole restano conservative e non forzano inferenze quando il dato non e disponibile.

Lo stesso profilo sito viene ora riusato anche nei report di efficienza irrigua, nelle priorita di prescription e negli alert di monitoraggio salute quando il dato e disponibile. Questo significa che due zone con efficienza simile non vengono trattate come equivalenti se una e molto esposta e sabbiosa, e che gli alert sanitari possono distinguere meglio un contesto ombreggiato, riparato o esposto a nord da uno piu aperto e ventilato. Le zone delle prescription maps possono ora portare anche pH, ore di sole, esposizione, protezione dal vento, ombre, quota e pendenza nel source data, non solo il tipo di suolo.

In particolare, il motore oggi distingue in modo prudente:

- suolo sabbioso, sole pieno, esposizione calda e protezione dal vento bassa come segnali di pressione idrica piu alta
- ombra, poche ore di sole, sito riparato, esposizione fredda e suolo argilloso come segnali di pressione sanitaria piu alta
- pH acido o alcalino come segnale di pressione nutrizionale
- quota elevata, pendenza e insolazione ridotta come segnali di pressione qualita

Questi fattori non vengono trattati come tassonomie rigide. Sono usati solo quando supportano una decisione o una spiegazione piu difendibile.

La chat AI integrata resta assistiva: puo spiegare, suggerire priorita e indicare moduli da aprire, ma non registra task o operazioni al posto dell'utente.

### 3.3 Spiegazione della decisione

Una parte importante del sistema e la spiegazione della decisione proposta.

Dove previsto, l'utente puo leggere piu chiaramente:

- perche il sistema propone un'azione
- quali segnali hanno inciso
- quale contesto ha portato a quella priorita
- se il suggerimento dipende da cultivar, intento produttivo, sottosistema o profilo sito

### 3.4 Ledger delle decisioni

L'applicazione mantiene uno storico delle decisioni agronomiche.

Questo consente di:

- rileggere decisioni precedenti
- collegare task e snapshot contestuale
- osservare l'esito di alcune azioni nel tempo

### 3.5 Monitoraggio ambientale e meteo

Il sistema utilizza dati meteo e ambientali in modo piu coerente rispetto al passato.

Con gli ultimi aggiornamenti:

- vengono riutilizzati meglio log persistiti e forecast snapshot
- il contesto ambientale e piu stabile
- il precision hub puo basarsi su segnali piu coerenti
- il profilo sito garden-level puo entrare anche nei monitoraggi salute e nelle priorita di alert quando il dato e disponibile

### 3.6 Domini funzionali gia credibili

Le aree oggi piu mature o piu credibili includono:

- irrigazione
- execution mobile dei task principali
- planner agronomico
- diary e log operativi
- monitoraggio e task guidati dal contesto
- memoria decisionale
- contesto raffinato riusabile nella coda agronomica e negli snapshot dei task
- report irrigui, prescription agronomiche e alert salute che riflettono anche il profilo sito del garden

### 3.7 Execution mobile e raccolta evidence

Nei flussi esecutivi principali l'utente puo chiudere un task registrando rapidamente:

- contesto del task sorgente
- contratto minimo di evidence richiesto
- note operative rapide
- feedback sintetico sull'esito e sull'eventuale follow-up
- campi essenziali specifici per dominio

I domini coperti dal fast path includono irrigazione, nutrizione/trattamenti, raccolto e lavorazioni meccaniche.

Il fast path non sostituisce i dettagli avanzati quando servono, ma riduce i campi duplicati e porta in alto le informazioni che contano per chiudere il lavoro sul campo.

Con gli ultimi riallineamenti del loop esecutivo:

- quick feedback e follow-up vengono riportati in modo coerente nel payload operativo, nelle evidence e nei feedback misurati
- il contesto di lancio del task viene sfruttato meglio nei flussi harvest e mechanical
- lo scope operativo salvato e piu leggibile nei riepiloghi di nutrition e harvest
- i riepiloghi operativi possono mostrare anche elementi del profilo sito, come esposizione e pendenza, quando presenti nel refined context
- i riepiloghi dei task da coda agronomica possono mostrare anche quota, pH, ore di sole e presenza di ombre quando questi dati arrivano dal wizard del garden
- le spiegazioni decisionali possono riportare anche orientamento del sito e protezione dal vento, cosi il peso del profilo sito resta auditabile quando influenza priorita o confronto economico
- il fast path rimane deliberatamente leggero: non sostituisce i dettagli avanzati quando servono, ma riduce attrito e duplicazione nei campi essenziali

La tranche corrente di P2 e quindi vicina alla chiusura sul fast path. Il lavoro residuo utile non e piu l'aggiunta di nuova UI esecutiva, ma la misurazione degli attriti residui e l'eventuale introduzione di scouting breve o offline solo dove i percorsi critici lo giustificano davvero.

## 4. Aree presenti ma non ancora mature end-to-end

Gli utenti devono sapere che alcune aree sono ancora in maturazione:

- scouting strutturato con esperienza rapida offline
- integrazioni industriali con sensori e macchine
- reporting avanzato per compliance e stakeholder esterni
- uso ancora piu profondo del contesto raffinato dentro scoring e action comparison su tutti i domini, oltre ai primi aggiustamenti gia attivi su acqua, nutrizione, salute e qualita
- delayed sync o offline robusto nei percorsi critici di campo

## 5. Come usare OrtoMio correttamente oggi

Il modo corretto di usare l'app oggi e questo:

1. usare OrtoMio come centro di priorita e task agronomici
2. leggere il contesto e le spiegazioni disponibili prima dell'azione
3. avviare il fast path esecutivo quando il task va chiuso sul campo
4. registrare evidenze minime, note rapide e feedback operativo
5. usare lo storico come memoria per decisioni successive

Il prodotto esprime piu valore quando il ciclo viene chiuso fino all'outcome.

## 6. Limiti da conoscere

Per evitare aspettative errate, e utile esplicitare questi limiti attuali:

- non tutte le aree della precision agriculture sono allo stesso livello di maturita
- non tutte le integrazioni esterne sono gia disponibili o consolidate
- l'esperienza mobile di campo sui task principali e oggi credibile e molto piu stretta del passato, ma scouting strutturato e offline/delayed sync restano da consolidare
- alcune funzioni AI richiedono accesso autorizzato e credits disponibili
- il refined context e gia presente nel loop decisionale principale, ma il suo peso comportamentale andra ancora aumentato in modo selettivo dove produce differenze agronomiche reali
- prescription e health path usano gia il profilo sito in modo piu incisivo, ma non tutte le superfici decisionali hanno ancora la stessa profondita di trattamento

## 7. Sintesi finale

OrtoMio oggi e uno strumento serio per il supporto decisionale e operativo in agricoltura, soprattutto dove serve legare contesto, task e memoria delle decisioni.

La parte piu forte del prodotto non e la promessa di coprire tutto, ma la qualita con cui collega ragionamento agronomico e operativita.
