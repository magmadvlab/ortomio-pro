# 📋 REGISTRO ATTIVITÀ

[← Torna all'Indice](./README.md)

---

## 🎯 STATO MODULO

**Stato attuale**: **Ibrido**

Il registro attività di OrtoMio contiene già dati persistiti utili, ma non tutte le scritture dell'app passano ancora dallo stesso ledger operativo unificato.

---

## ✅ COSA È TRACCIATO OGGI IN MODO AFFIDABILE

- `garden_tasks` creati da planner e da alcune azioni `advice` e `health`
- registri irrigazione, trattamenti, concimazioni e lavorazioni
- molte operazioni filare -> pianta propagate con più contesto di prima
- date, note, quantità e riferimenti orto/filare in buona parte dei flussi principali
- per i task agronomici avanzati, snapshot decisionale e riferimenti di contesto salvati come metadata tecnici del task

---

## ⚠️ LIMITI ATTUALI

- non tutte le funzioni AI o smart scrivono nello stesso registro storico
- alcune osservazioni, diagnosi AI e flussi rapidi restano ancora parziali o non completamente persistiti
- la copertura dello storico è migliore nei registri tecnici che nei moduli predittivi o smart
- la distinzione completa tra `piano`, `operazione`, `osservazione` e `risultato` non è ancora uniforme in tutto il prodotto

---

## 🧭 COME USARLO OGGI

Per avere uno storico utile anno su anno:

- usa il planner per generare task persistiti
- registra irrigazioni, trattamenti, concimazioni e lavorazioni nei moduli dedicati
- usa note strutturate quando l'automazione non è ancora completa
- confronta task e registri tecnici, non solo i suggerimenti AI

---

## 📈 COSA PERMETTE GIÀ DI FARE

- ricostruire buona parte delle attività eseguite
- confrontare periodi e stagioni
- vedere se un intervento è stato pianificato ed eseguito
- collegare parte delle operazioni a filari e piante
- distinguere, in parte dei flussi agronomici, perche un task e nato e con quale livello di confidence

---

## 🚧 COSA MANCA PER UNO STORICO DEFINITIVO

- ledger unico `piano -> operazione -> osservazione -> risultato`
- persistenza uniforme di foto, diagnosi AI e outcome
- tracciamento completo sorgente `manuale / AI / IoT / device`
- confronto automatico multi-annuale su resa, salute, input e meteo
- normalizzazione completa del contratto di evidence operativo tra planner, moduli di esecuzione e outcome

---

[← Torna all'Indice](./README.md)
