# Prescription Maps

[← Torna all'Indice](./README.md)

---

## Panoramica

Modulo per creare, salvare, revisionare ed esportare mappe di prescrizione. È più di una preview grafica: esistono schema, persistenza, zone, export e record di applicazione a rateo variabile.

Non è però ancora una catena VRT completamente validata sul campo per ogni macchina, coltura e campagna.

---

## Stato modulo

**Stato attuale**: reale con chiusura campo parziale.

La parte consolidata oggi è:
- route dedicata `/app/prescription-maps`
- dashboard e pannelli per mappe, zone, costi, storico e field ops
- persistenza di mappe su `prescription_maps`
- persistenza zone su `prescription_zones`
- record applicativi su `variable_rate_applications`
- export tracking su `prescription_map_exports`
- revisioni/versioni mappa
- riepiloghi di esecuzione, aderenza, outcome ed efficacia quando i dati esistono
- priorità agronomiche con refined context quando il dato è disponibile
- uso prudente di suolo, pH, profilo sito e storico ambientale nelle spiegazioni e nel ranking operativo

Non va presentato come già chiuso:
- import automatico garantito su tutte le console agricole
- applicazione VRT non supervisionata
- validazione macchina universale
- misurazione outcome sempre disponibile
- collegamento certo tra mappa, esecuzione fisica e risultato agronomico in ogni scenario

---

## Cosa è disponibile ora

Il modulo può gestire:
- mappe per fertilizzazione, semina, irrigazione, trattamenti e raccolta
- zone con geometria, centroide, superficie, prescrizione e qualità dato
- fonti dati dichiarate per NDVI, pianta, fila, suolo e meteo
- qualità, completezza, confidence e stato validazione
- cost analysis e stime gestionali
- export in formati come GeoJSON, KML, CSV, shapefile o ISOXML quando supportati dal flusso
- stato export `generated / downloaded / field_imported / field_applied`
- record di applicazione con dose pianificata, dose reale, area applicata, macchina, operatore, accuratezza, note, meteo e costi
- confronto tra zone con efficacia simile ma profili sito diversi
- motivazioni operative che possono includere suolo sabbioso o argilloso, pH fuori finestra, esposizione, quota, ombra e storico di stress ambientale

---

## Catena operativa reale

La catena più onesta oggi è:

`segnale agronomico o NDVI → bozza mappa → validazione manuale/agronomica → export o record applicativo → riepilogo storico`

Quando sono presenti record su `variable_rate_applications`, il sistema può calcolare:
- zone completate, parziali, saltate o pendenti
- area applicata
- accuratezza media
- deviazione tra dose pianificata e dose reale
- copertura area
- outcome collegati se esistono quality results o feedback misurati
- efficacia indicativa con microclima, suolo e risultati disponibili
- priorità di intervento più sensibili al profilo sito quando il refined context è presente

Questi riepiloghi sono utili per gestione e revisione, ma dipendono dalla qualità dei dati inseriti o importati.

---

## Field operations ed export

Gli export sono tracciati come eventi operativi, non come garanzia che la macchina abbia eseguito correttamente la mappa.

Gli stati export indicano:
- `generated`: file o payload preparato
- `downloaded`: export scaricato
- `field_imported`: indicazione che l'export è stato importato nel processo campo
- `field_applied`: indicazione che l'applicazione è stata marcata come eseguita

Per avere chiusura esecutiva servono record applicativi o evidenze campo coerenti. Senza questi dati, una mappa esportata resta una prescrizione preparata, non una prova di applicazione.

---

## Relazione con NDVI e nutrizione

NDVI può alimentare il ragionamento sulle zone, ma il dato va interpretato secondo la qualità della sorgente: provider reale, cache, fallback o simulazione.

La nutrizione e i trattamenti sono registri operativi separati. Il fatto che esista una mappa di prescrizione non significa automaticamente che sia stata eseguita nel modulo nutrizione o trattamento.

La VRT nutrizionale end-to-end resta quindi un obiettivo di integrazione:

`NDVI/suolo → mappa → export/import macchina → applicazione → record nutrizione/trattamento → outcome`

Oggi questa catena può essere rappresentata a pezzi, ma non è garantita come flusso unico chiuso.

---

## Uso consigliato

Usa Prescription Maps per:
- definire zone omogenee
- preparare prescrizioni operative
- valutare dosi e priorità
- esportare mappe dove il formato è compatibile
- registrare o consultare applicazioni a rateo variabile quando disponibili
- confrontare prescrizione, esecuzione e outcome se i dati sono presenti
- distinguere zone apparentemente simili quando suolo, pH, esposizione o storico ambientale cambiano la priorità agronomica

Non usarlo come:
- automazione finale senza supervisione
- prova macchina certificata
- validazione universale di ISOXML/shapefile per ogni brand
- sostituto di sopralluogo e conferma agronomica

---

## Limiti attuali

- la qualità dipende dalle fonti dati effettivamente disponibili
- alcuni scenari possono partire da dati parziali o fallback
- compatibilità macchina e import campo non sono garantiti universalmente
- outcome ed efficacia sono calcolabili solo se esistono dati post-applicazione
- il collegamento con operazioni meccaniche, nutrizione e trattamenti non è ancora un'unica transazione end-to-end

---

## Backlog tracciato

Da trattare come sviluppo futuro:
- validazione più forte della compatibilità macchina/formato
- import automatico da console o provider agricoli reali
- legame diretto tra export, applicazione fisica e registro operativo finale
- outcome agronomici raccolti in modo sistematico
- integrazione completa con mechanical operations e nutrition/treatments
- governance chiara della qualità fonte NDVI/suolo/meteo prima della generazione mappa

---

[← Torna all'Indice](./README.md)
