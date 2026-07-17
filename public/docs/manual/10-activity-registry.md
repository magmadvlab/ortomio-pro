# 📋 REGISTRO ATTIVITÀ

[← Torna all'Indice](./README.md)

---

## 🎯 STATO MODULO

**Stato attuale**: **DB-first con fallback degradato**

Il registro attività di OrtoMio è il primo consumer UI del ledger operativo T2. Quando il provider Supabase espone le proiezioni DB, la vista legge lo stream normalizzato dal servizio `operationalLedgerService`. Quando non ci sono eventi ledger o il DB non è disponibile, può mostrare task reali come fallback degradato, ma quel fallback non è un ledger operativo completo.

---

## ✅ COSA È TRACCIATO OGGI IN MODO AFFIDABILE

- `garden_tasks` creati da planner e da alcune azioni `advice` e `health`
- registri irrigazione, trattamenti, concimazioni e lavorazioni
- molte operazioni filare -> pianta propagate con più contesto di prima
- date, note, quantità e riferimenti orto/filare in buona parte dei flussi principali
- per i task agronomici avanzati, snapshot decisionale e riferimenti di contesto salvati come metadata tecnici del task
- nei principali moduli esecutivi task-aware, il minimo contratto di evidenze richieste è ora esplicitato prima del submit
- eventi normalizzati dalle proiezioni `agronomic_operation_outcome_projection`, `agronomic_operation_signal_projection` e `agronomic_precision_execution_projection` quando il DB restituisce dati

---

## ⚠️ LIMITI ATTUALI

- non tutte le funzioni AI o smart scrivono nello stesso registro storico
- alcune osservazioni, diagnosi AI e flussi rapidi restano ancora parziali o non completamente persistiti
- la copertura dello storico è migliore nei registri tecnici che nei moduli predittivi o smart
- la distinzione completa tra `piano`, `operazione`, `osservazione` e `risultato` è disponibile nelle proiezioni T2 dove le fonti hanno i riferimenti necessari, ma non è ancora uniforme in tutto il prodotto
- la produzione può mostrare pochi eventi finché non vengono registrate operazioni reali nelle tabelle sorgente

---

## 🧭 COME USARLO OGGI

Per avere uno storico utile anno su anno:

- usa il planner per generare task persistiti
- registra irrigazioni, trattamenti, concimazioni e lavorazioni nei moduli dedicati
- usa note strutturate quando l'automazione non è ancora completa
- considera la lista task-only come modalità degradata quando non sono disponibili eventi ledger

---

## 📈 COSA PERMETTE GIÀ DI FARE

- ricostruire buona parte delle attività eseguite
- confrontare periodi e stagioni
- vedere se un intervento è stato pianificato ed eseguito
- collegare parte delle operazioni a filari e piante
- distinguere, in parte dei flussi agronomici, perche un task e nato e con quale livello di confidence
- rendere più coerente la raccolta operativa minima di evidenze tra planner ed esecuzione per irrigazione, nutrizione, raccolta e lavorazioni
- leggere un unico stream applicativo normalizzato senza creare una nuova tabella attività duplicata

---

## 🚧 COSA MANCA PER UNO STORICO DEFINITIVO

- persistenza uniforme di foto, diagnosi AI e outcome
- tracciamento completo sorgente `manuale / AI / IoT / device`
- confronto automatico multi-annuale su resa, salute, input e meteo
- normalizzazione completa del contratto di evidence operativo tra planner, moduli di esecuzione e outcome su tutti i moduli, non solo sui flussi task-aware piu recenti
- visual QA con dataset produzione rappresentativo per migliorare etichette e layout delle famiglie evento

---

[← Torna all'Indice](./README.md)
