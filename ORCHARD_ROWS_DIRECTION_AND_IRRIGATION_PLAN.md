# Orchard Rows Direction And Irrigation Plan

## Obiettivo

Rendere la vista `Filari` del frutteto una vista affidabile e informativa, basata su filari reali e non solo su alberi raggruppati per `rowNumber`.

Obiettivi principali:

- collegare davvero gli `orchard_trees` ai filari
- definire una direzione canonica dei filari e della numerazione piante
- mostrare il tipo di impianto irriguo collegato a ciascun filare
- mantenere la pagina `Filari` come vista di consultazione, non come schermata operativa
- aggiungere animazioni leggere per migliorare la leggibilità

---

## Problema Attuale

Oggi la vista `Filari`:

- raggruppa gli alberi del frutteto per `rowNumber`
- non garantisce che ogni gruppo corrisponda a un `field_row` reale
- non ha una direzione canonica di numerazione
- non può mostrare in modo affidabile l'impianto irriguo del filare se manca il collegamento a `fieldRowId`

Questo crea ambiguità:

- la `Fila 1` può cambiare semanticamente se il campo viene osservato dal lato opposto
- `positionInRow = 1` non basta per sapere quale sia davvero la prima pianta
- il dato irriguo esiste nei `field_rows`, ma non sempre è associato agli alberi del frutteto

---

## Principio Guida

La numerazione dei filari e delle piante non deve dipendere dal punto di vista dell'utente, ma da una regola assoluta.

La regola deve essere definita tramite:

- asse del filare
- lato di origine della numerazione filari
- lato di origine della numerazione piante dentro il filare

Esempio:

- filari orientati `N-S`
- `Fila 1` = filare più a Ovest
- `Pianta 1` = pianta più a Sud

---

## Fase 1 - Modello Dati Canonico

### Obiettivo

Eliminare l'ambiguità di `rowNumber`.

### Da introdurre

Per il filare:

- `rowAxis`
- `rowOrdering`
- `plantOrderingInRow`

### Valori suggeriti

`rowAxis`:

- `N-S`
- `E-W`
- `NE-SW`
- `NW-SE`

`rowOrdering`:

- `west_to_east`
- `east_to_west`
- `north_to_south`
- `south_to_north`

`plantOrderingInRow`:

- `west_to_east`
- `east_to_west`
- `north_to_south`
- `south_to_north`

### Note

- `rowNumber` resta utile, ma non deve più essere l'unica base logica
- `positionInRow` resta utile, ma deve avere una direzione esplicita

---

## Fase 2 - Collegamento Reale Tra Alberi E Filari

### Obiettivo

Fare in modo che ogni albero appartenga a un filare reale.

### Da fare

- usare `fieldRowId` come collegamento strutturale tra albero e filare
- trattare `rowNumber` come supporto e non come unica chiave logica
- aggiornare la creazione batch degli alberi per assegnare anche `fieldRowId`

### Risultato atteso

Ogni albero del frutteto deve poter dire:

- a quale filare appartiene
- quale posizione occupa nel filare
- secondo quale direzione è stato numerato

---

## Fase 3 - Migrazione E Backfill Dati Esistenti

### Obiettivo

Non perdere compatibilità con i frutteti già creati.

### Da fare

- leggere tutti gli `orchard_trees` esistenti
- raggrupparli per `rowNumber`
- creare i `field_rows` mancanti
- associare ogni albero al relativo `fieldRowId`
- marcare i casi ambigui come `direzione da confermare`

### Caso critico

Se i dati esistenti non contengono abbastanza informazione sulla direzione:

- non inventare il verso
- mostrare uno stato da completare

---

## Fase 4 - Configurazione Guidata Della Direzione

### Obiettivo

Permettere all'utente di fissare una regola stabile.

### Da chiedere all'utente

- da che lato parte la numerazione dei filari
- da che lato parte la numerazione delle piante nel filare

### UX suggerita

Mini wizard con:

- piccola anteprima top-down
- nord in alto
- scelta esplicita del lato di partenza
- conferma visuale del risultato

### Risultato atteso

La numerazione resta stabile anche se il campo viene osservato dal lato opposto.

---

## Fase 5 - Evoluzione Della Vista Filari

### Obiettivo

Trasformare `Filari` in una vista informativa forte.

### Ogni card filare dovrebbe mostrare

- nome filare
- numero alberi
- varietà prevalente
- orientamento
- direzione numerazione
- stato salute sintetico
- impianto irriguo collegato

### Dati irrigui da mostrare quando disponibili

- tipo linea: `Dripline`, `PipeWithDrippers`, `MicroSprinkler`
- diametro tubo
- passo gocciolatori
- portata gocciolatore
- eventuale portata stimata del filare

### Regola importante

Se il filare non è davvero associato a un impianto:

- mostrare `impianto non associato`
- non mostrare valori presunti

---

## Fase 6 - Rifinitura Visiva E Animazioni

### Obiettivo

Migliorare la leggibilità senza rendere la pagina pesante.

### Animazioni consigliate

- ingresso sfalsato delle card filari
- transizione morbida sui badge irrigazione
- hover più chiaro sui riquadri albero
- piccola animazione di caricamento strutturale

### Vincoli

- animazioni brevi
- nessun effetto invasivo
- mantenere la pagina veloce e leggibile

---

## Ordine Di Implementazione Consigliato

1. definire il modello dati canonico
2. collegare davvero `orchard_trees` e `field_rows`
3. fare migrazione e backfill
4. creare il wizard di direzione
5. aggiornare la vista `Filari`
6. aggiungere animazioni leggere

---

## Regole Da Non Violare

- non usare solo `rowNumber` come verità assoluta
- non dedurre la direzione dalla prospettiva dell'utente
- non mostrare impianti irrigui se il collegamento dati non è reale
- non trasformare la pagina `Filari` in una schermata operativa complessa

---

## Stato

Documento promemoria iniziale creato dopo definizione del piano.

Prossimo passo tecnico consigliato:

- progettare i campi esatti da aggiungere a `field_rows` e agli oggetti orchard
- definire la strategia di migrazione per i dati già presenti

---

## Checklist Operativa

### 1. Analisi Stato Attuale

- [ ] Verificare quanti `orchard_trees` hanno già `fieldRowId`
- [ ] Verificare quanti alberi hanno solo `rowNumber` e non `fieldRowId`
- [ ] Verificare se esistono già `field_rows` coerenti con i `rowNumber` del frutteto
- [ ] Verificare se i `field_rows` esistenti hanno `irrigationLine` configurato
- [ ] Identificare i casi in cui i dati esistenti sono ambigui o incompleti

### 2. Progettazione Modello Dati

- [ ] Definire i nuovi campi canonici per la direzione del filare
- [ ] Definire i nuovi campi canonici per la direzione delle piante nel filare
- [ ] Stabilire se i campi nuovi vivono solo in `field_rows` o anche in configurazioni orchard
- [ ] Aggiornare i type TypeScript relativi a filari e alberi
- [ ] Documentare i valori ammessi per asse e direzioni

### 3. Persistenza E Migrazioni

- [ ] Progettare la migrazione database per i nuovi campi
- [ ] Aggiungere i campi necessari alle tabelle di riferimento
- [ ] Preparare il backfill per creare i `field_rows` mancanti dai `rowNumber`
- [ ] Preparare il backfill per assegnare `fieldRowId` agli alberi esistenti
- [ ] Definire una strategia per marcare i filari con direzione non confermata

### 4. Collegamento Reale Alberi-Filari

- [ ] Aggiornare il flusso di creazione batch alberi
- [ ] Fare in modo che ogni batch crei o usi un `field_row` reale
- [ ] Salvare `fieldRowId` sugli `orchard_trees` creati
- [ ] Mantenere coerenti `rowNumber` e `positionInRow`
- [ ] Validare che un albero non resti in un filare solo “virtuale”

### 5. Regola Canonica Di Numerazione

- [ ] Definire `rowAxis`
- [ ] Definire `rowOrdering`
- [ ] Definire `plantOrderingInRow`
- [ ] Stabilire regole di default ragionevoli per i nuovi frutteti
- [ ] Impedire che la numerazione dipenda dal lato da cui guarda l'utente

### 6. Wizard Di Configurazione Direzione

- [ ] Progettare una UI semplice per impostare la direzione dei filari
- [ ] Aggiungere una mini anteprima top-down con nord in alto
- [ ] Permettere di scegliere il lato di origine dei filari
- [ ] Permettere di scegliere il lato di origine delle piante nel filare
- [ ] Salvare la configurazione in modo persistente
- [ ] Gestire il caso “da confermare” per i frutteti esistenti

### 7. Vista Filari Come Pagina Informativa

- [ ] Far sì che la vista `Filari` legga prima i `field_rows` reali
- [ ] Usare gli alberi solo come contenuto del filare, non come base unica del raggruppamento
- [ ] Mostrare per ogni filare nome, numero alberi e varietà
- [ ] Mostrare orientamento e direzione di numerazione
- [ ] Mostrare lo stato del filare in modo sintetico
- [ ] Mantenere la vista non operativa e focalizzata sulla consultazione

### 8. Integrazione Impianto Irriguo

- [ ] Leggere `irrigationLine` dal filare reale associato
- [ ] Mostrare tipo impianto: `Dripline`, `PipeWithDrippers`, `MicroSprinkler`
- [ ] Mostrare diametro tubo se disponibile
- [ ] Mostrare passo gocciolatori se disponibile
- [ ] Mostrare portata gocciolatore se disponibile
- [ ] Valutare se mostrare una portata stimata del filare
- [ ] Mostrare `impianto non associato` se il dato non esiste
- [ ] Non mostrare mai valori presunti non verificabili

### 9. UX E Micro-Animazioni

- [ ] Aggiungere ingresso sfalsato delle card filari
- [ ] Aggiungere transizioni leggere sulle badge informative
- [ ] Migliorare hover e focus dei riquadri albero
- [ ] Aggiungere un caricamento morbido della struttura filari
- [ ] Verificare che le animazioni restino leggere su desktop e mobile

### 10. Verifica Funzionale

- [ ] Testare un frutteto nuovo creato con filari configurati correttamente
- [ ] Testare un frutteto esistente migrato da soli `rowNumber`
- [ ] Verificare che la `Fila 1` resti stabile anche cambiando punto di vista
- [ ] Verificare che la `Pianta 1` nel filare resti stabile
- [ ] Verificare che la vista irrigua mostri solo dati reali
- [ ] Verificare che il click sul singolo albero continui ad aprire il dettaglio corretto

### 11. Documentazione

- [ ] Aggiornare questo file man mano che le fasi vengono completate
- [ ] Aggiungere note su eventuali scelte definitive del modello
- [ ] Documentare eventuali limiti noti o casi speciali
- [ ] Annotare la strategia finale di migrazione usata
