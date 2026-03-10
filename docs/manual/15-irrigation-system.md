# 💧 SISTEMA IRRIGAZIONE

[← Torna all'Indice](./README.md)

---

## 🎯 STATO MODULO

**Stato attuale**: **Operativo con componenti avanzate ancora ibride**

Il modulo irrigazione è oggi uno dei blocchi più maturi del prodotto, soprattutto su calcoli, registrazione e integrazione con filari. La parte di automazione hardware e IoT resta invece non ancora completa.

---

## ✅ COSA È DISPONIBILE ORA

- registrazione irrigazioni persistita
- gestione dati irrigui a livello orto, zona, filare e in diversi casi pianta
- calcoli più coerenti su quantità acqua, distanza, portate e diffusori
- migliore stima durata per filari con `totalFlowRate`, `flowRatePerMeter` o passo gocciolatori
- compatibilità del dashboard con schemi database legacy e advanced
- integrazione con contesto meteo e dati data-aware nei flussi consolidati

---

## ⚠️ LIMITI ATTUALI

- automazione completa con valvole e Smart Hub non è ancora chiusa
- non tutti i flussi legacy usano gli stessi tipi e lo stesso orchestratore
- il type system irrigazione nel repo ha ancora debito tecnico
- i consigli irrigui avanzati non sono ancora tutti supportati da sensori reali e attuazione reale

---

## 🧭 COSA SIGNIFICA IN PRATICA

Oggi puoi usare il modulo per:

- stimare e registrare irrigazioni in modo più credibile
- lavorare bene con filari e gocciolatori
- mantenere uno storico utile dei log irrigui
- collegare parte dell'informazione irrigua a piante e filari

Per ora non va venduto come:

- sistema di controllo automatico completo di campo
- piattaforma IoT irrigua totalmente autonoma
- modulo già chiuso a livello compile-time e orchestrazione totale

---

## 🔄 WORKFLOW CONSIGLIATO

### **1. Configura bene il filare**
- distanza tra piante
- tipo impianto
- portata totale o per metro
- passo gocciolatori se presente

### **2. Registra l'intervento**
- durata
- metodo
- contesto meteo se disponibile
- note operative

### **3. Confronta lo storico**
- volumi usati
- stagioni
- differenze tra filari o zone
- risposta della coltura

---

## 🚧 ROADMAP

- unificazione tipi irrigazione legacy
- automazione reale Smart Hub / attuatori
- integrazione sensori suolo e controlli automatici
- confronto pieno tra acqua erogata, meteo, resa e salute

---

[← Torna all'Indice](./README.md)
