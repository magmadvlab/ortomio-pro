# Tracciabilita Operativa

[← Torna all'Indice](./README.md)

---

## Stato Modulo

**Stato attuale**: **parziale, DB-backed per le fonti operative principali**

La tracciabilita di OrtoMio oggi non e una blockchain completa e non genera automaticamente una storia commerciale immutabile per ogni prodotto. Il valore reale implementato e la possibilita di ricostruire una catena operativa usando i record persistiti gia presenti nel database: task, decisioni agronomiche, operazioni, osservazioni, segnali specializzati e risultati.

La fonte di verita per la chiusura T2 e il ledger operativo outcome-first descritto nel master plan.

---

## Cosa E Tracciato Oggi

- task agronomici in `garden_tasks`
- decisioni e outcome della coda agronomica in `agronomic_decision_ledger_entries` e `agronomic_queue_outcomes`
- irrigazioni, concimazioni, trattamenti, lavorazioni meccaniche e raccolti nelle rispettive tabelle operative
- operazioni su piante individuali dove il flusso le registra
- segnali da automazioni, qualita e prescription map export tramite proiezioni specializzate
- dati meteo/diario automatico in `daily_weather_log`, `daily_diary_entries` e `diary_events` dove disponibili

Le proiezioni DB principali sono:

- `agronomic_operation_outcome_projection`
- `agronomic_operation_signal_projection`
- `agronomic_precision_execution_projection`

Queste viste non duplicano i dati: leggono le tabelle storiche reali e le espongono in una forma piu coerente per audit, analytics e interfacce.

---

## Cosa Permette Gia

- capire quale task o decisione ha originato parte delle operazioni
- distinguere piani, operazioni, segnali e risultati quando la fonte lo consente
- leggere uno stream normalizzato nel registro attivita
- mostrare evidenze di esecuzione e misurazione quando sono state persistite
- mantenere una singola fonte DB canonicale invece di creare un ledger locale parallelo

---

## Limiti Attuali

- non tutte le azioni AI o smart scrivono ancora nella stessa catena operativa
- alcune evidenze sono ancora riferimenti polimorfici, non foreign key strette verso ogni tabella sorgente
- la produzione puo avere poche o zero righe in alcune proiezioni finche non vengono eseguite operazioni reali
- QR code commerciale, blockchain, certificazioni automatiche e immutabilita crittografica non sono parte della chiusura T2 implementata
- la resilienza offline completa del ledger non e implementata: il ledger operativo e DB/Supabase-first

---

## Uso Consigliato

Per ottenere una tracciabilita utile oggi:

- creare task dal planner quando l'operazione nasce da una raccomandazione o decisione
- registrare l'esecuzione nei moduli operativi dedicati
- compilare note, quantita, data, area e riferimenti a zona/filare/pianta quando disponibili
- usare il registro attivita come vista di lettura, non come sorgente separata
- considerare il fallback task-only come modalita degradata, non come ledger completo

---

## TODO Futuri

- valutare foreign key strette per le evidence source oggi polimorfiche
- estendere la copertura dei flussi AI/smart che non scrivono ancora eventi durevoli
- definire se e quando introdurre QR code commerciale o blockchain verificabile
- definire requisiti separati per una vera modalita offline/read-only del ledger
- fare visual QA con dati produzione rappresentativi quando le proiezioni contengono volumi reali

---

[← Torna all'Indice](./README.md)
