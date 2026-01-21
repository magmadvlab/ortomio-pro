# 📊 Guida Rapida: Come Vedere lo Storico Reale delle Piante

## 🎯 PROBLEMA

Vedi dati "placeholder" o di esempio perché il sistema non ha ancora dati reali registrati.

## ✅ SOLUZIONE: Inizia a Registrare Operazioni

---

## 1️⃣ DOVE REGISTRARE LE OPERAZIONI

### **A. Lavorazioni Meccaniche**

📍 **Pagina**: `/app/mechanical-work`

**Cosa registrare:**
- Aratura, fresatura, vangatura
- Potature, sarchiatura
- Pacciamatura, rincalzatura

**Come fare:**
1. Vai su "Lavorazioni Meccaniche"
2. Click "Nuova Lavorazione"
3. Compila il form:
   - Tipo lavorazione (es. Fresatura)
   - Attrezzatura (es. Motozappa)
   - Data lavorazione
   - Area lavorata (m²)
   - Durata e costo
   - Operatore
   - Condizioni meteo
   - Note
4. Salva

**Risultato**: La lavorazione apparirà nello storico con tutti i dettagli.

---

### **B. Trattamenti Fitosanitari**

📍 **Pagina**: `/app/nutrition`

**Cosa registrare:**
- Fertilizzazioni (NPK, organici)
- Antiparassitari
- Fungicidi
- Trattamenti preventivi

**Come fare:**
1. Vai su "Nutrizione"
2. Click "Nuovo Trattamento"
3. Compila il form:
   - Coltura trattata (es. Pomodoro)
   - Aiuola/Filare (opzionale)
   - Data trattamento
   - Prodotto (es. Nitrato di Calcio)
   - Dosaggio e unità
   - Area trattata
   - Metodo applicazione
   - Motivo trattamento
   - Condizioni meteo
   - Operatore
   - Note
4. Salva

**Risultato**: Il trattamento apparirà nello storico con correlazioni automatiche.

---

### **C. Irrigazioni**

📍 **Pagina**: `/app/irrigation`

**Cosa registrare:**
- Volumi erogati
- Durata irrigazione
- Fertirrigazione
- Sistema usato

**Come fare:**
1. Vai su "Irrigazione"
2. Click "Nuova Irrigazione"
3. Compila il form:
   - Zona/Filare
   - Sistema (goccia, sprinkler, manuale)
   - Volume litri
   - Durata minuti
   - Fertirrigazione (se applicata)
   - Data e ora
   - Umidità terreno prima/dopo
   - Note
4. Salva

**Risultato**: L'irrigazione apparirà nello storico con calcoli automatici.

---

### **D. Raccolti**

📍 **Pagina**: `/app/garden` (dalla vista orto)

**Cosa registrare:**
- Quantità raccolta (kg)
- Qualità (1-5 stelle)
- Brix (se misurato)
- Difetti
- Destinazione

**Come fare:**
1. Vai sulla vista del tuo orto
2. Seleziona la pianta/aiuola
3. Click "Registra Raccolta"
4. Compila il form:
   - Coltura
   - Quantità kg
   - Qualità (1-5)
   - Brix (opzionale)
   - Difetti %
   - Data e ora
   - Destinazione (vendita/consumo)
   - Note
5. Salva

**Risultato**: Il raccolto apparirà nello storico con analytics ROI.

---

### **E. Foto Timeline**

📍 **Pagina**: `/app/plants` (piante individuali)

**Cosa registrare:**
- Foto crescita
- Foto problemi
- Foto prima/dopo trattamenti
- Foto raccolti

**Come fare:**
1. Vai su "Piante"
2. Seleziona una pianta
3. Click "Aggiungi Foto"
4. Carica foto:
   - Seleziona file
   - Tipo foto (generale, problema, crescita, etc.)
   - Note
5. Salva

**Risultato**: La foto apparirà nella timeline con data e tipo.

---

## 2️⃣ DOVE VEDERE LO STORICO

### **A. Diario Operativo**

📍 **Pagina**: `/app/diary`

**Cosa vedi:**
- Timeline completa di TUTTE le operazioni
- Correlazioni automatiche
- Analytics e trend
- Suggerimenti AI

**Filtri disponibili:**
- Per tipo (operazione, osservazione, risultato, problema)
- Per categoria (semina, crescita, cura, protezione, raccolto)
- Per data (ultima settimana, mese, anno)
- Per ricerca (testo libero)

**Visualizzazioni:**
- Timeline (cronologica)
- Calendario (per data)
- Analytics (statistiche)
- Trend (grafici)

---

### **B. Storico per Filare**

📍 **Pagina**: `/app/garden` → Seleziona Filare

**Cosa vedi:**
- Tutte le operazioni su quel filare specifico
- Lavorazioni meccaniche
- Trattamenti
- Irrigazioni
- Raccolti
- Foto

**Ordinamento**: Cronologico (più recenti prima)

---

### **C. Storico per Coltura**

📍 **Pagina**: `/app/planner` → Cerca coltura

**Cosa vedi:**
- Tutti i cicli storici di quella coltura
- Rese medie
- Problemi comuni
- Trattamenti efficaci
- Costi e ROI

**Analisi**: Comparativa tra cicli diversi

---

### **D. Analytics Avanzate**

📍 **Pagina**: `/app/analytics`

**Cosa vedi:**
- Statistiche generali
- Costi totali
- ROI per coltura
- Efficienza operazioni
- Trend problemi
- Correlazioni operazione → risultato
- Impatto meteo
- Pattern stagionali

---

## 3️⃣ ESEMPIO PRATICO: Registra il Tuo Primo Ciclo

### **SCENARIO**: Hai piantato pomodori il 15 Gennaio

#### **STEP 1: Registra Preparazione Terreno**

```
Pagina: /app/mechanical-work
Click: "Nuova Lavorazione"

Compila:
- Tipo: Fresatura
- Attrezzatura: Motozappa
- Data: 10/01/2026
- Area: 30 m²
- Durata: 60 minuti
- Costo: €30
- Operatore: Mario Rossi
- Meteo: 15°C, terreno in tempera
- Note: "Terreno ben preparato, rimosso erbacce"

Salva ✅
```

#### **STEP 2: Registra Trapianto**

```
Pagina: /app/garden
Seleziona: Aiuola Nord → Filare 3
Click: "Aggiungi Pianta"

Compila:
- Coltura: Pomodoro San Marzano
- Quantità: 10 piante
- Data trapianto: 15/01/2026
- Distanza: 50cm
- Note: "Piantine da semenzaio"

Salva ✅
```

#### **STEP 3: Registra Prima Fertilizzazione**

```
Pagina: /app/nutrition
Click: "Nuovo Trattamento"

Compila:
- Coltura: Pomodoro San Marzano
- Aiuola: Zona Nord
- Filare: Filare 3
- Data: 21/01/2026
- Prodotto: Nitrato di Calcio 15.5-0-0
- Dosaggio: 1.08 kg
- Area: 30 m²
- Metodo: Fertirrigazione
- Motivo: Nutrizione
- Meteo: 18°C, vento 5km/h, no pioggia
- Operatore: Mario Rossi
- Note: "Applicato via fertirrigazione mattutina"

Salva ✅
```

#### **STEP 4: Registra Irrigazione**

```
Pagina: /app/irrigation
Click: "Nuova Irrigazione"

Compila:
- Zona: Zona Nord
- Filare: Filare 3
- Sistema: Goccia
- Volume: 150 litri
- Durata: 45 minuti
- Fertirrigazione: Sì (Nitrato Calcio 1.08kg)
- Data: 21/01/2026
- Ora: 08:30
- Umidità prima: 35%
- Umidità dopo: 65%
- Note: "Irrigazione con fertirrigazione"

Salva ✅
```

#### **STEP 5: Carica Foto Crescita**

```
Pagina: /app/plants
Seleziona: Pomodoro San Marzano (Filare 3)
Click: "Aggiungi Foto"

Compila:
- Seleziona foto dal telefono
- Tipo: Crescita
- Note: "Piantine dopo 7 giorni dal trapianto"

Salva ✅
```

#### **STEP 6: Registra Problema (se presente)**

```
Pagina: /app/diary
Click: "Nuova Registrazione"

Compila:
- Tipo: Problema
- Categoria: Protezione
- Titolo: "Afidi su foglie"
- Descrizione: "Rilevati afidi neri sulle foglie giovani"
- Pianta: Pomodoro San Marzano
- Area: Filare 3
- Data: 28/01/2026
- Salute: 70%
- Note: "Applicare sapone molle"

Salva ✅
```

#### **STEP 7: Registra Trattamento Problema**

```
Pagina: /app/nutrition
Click: "Nuovo Trattamento"

Compila:
- Coltura: Pomodoro San Marzano
- Filare: Filare 3
- Data: 29/01/2026
- Prodotto: Sapone Molle Potassico
- Dosaggio: 200 ml
- Area: 30 m²
- Metodo: Spray fogliare
- Motivo: Controllo Parassiti
- Note: "Trattamento contro afidi"

Salva ✅
```

#### **STEP 8: Registra Raccolta**

```
Pagina: /app/garden
Seleziona: Filare 3
Click: "Registra Raccolta"

Compila:
- Coltura: Pomodoro San Marzano
- Quantità: 18.5 kg
- Qualità: 4.5/5
- Brix: 6.2
- Difetti: 5%
- Data: 15/03/2026
- Ora: 07:30
- Destinazione: Vendita
- Note: "Ottima qualità, pochi difetti"

Salva ✅
```

---

## 4️⃣ VISUALIZZA LO STORICO COMPLETO

### **Opzione 1: Diario Operativo**

```
Vai su: /app/diary

Vedrai TUTTE le operazioni in ordine cronologico:

📅 15/03/2026 - Raccolto Pomodori (18.5kg, qualità 4.5/5)
📅 29/01/2026 - Trattamento Sapone Molle (contro afidi)
📅 28/01/2026 - Problema: Afidi su foglie
📅 21/01/2026 - Irrigazione + Fertirrigazione (150L)
📅 21/01/2026 - Fertilizzazione Nitrato Calcio (1.08kg)
📅 15/01/2026 - Trapianto Pomodori (10 piante)
📅 10/01/2026 - Fresatura terreno (30m²)
```

### **Opzione 2: Storico per Filare**

```
Vai su: /app/garden
Seleziona: Zona Nord → Filare 3

Vedrai SOLO le operazioni su quel filare:

📍 Filare 3 - Storico Completo
├─ Lavorazioni: 1 (Fresatura 10/01)
├─ Trapianti: 1 (Pomodori 15/01)
├─ Trattamenti: 2 (Nitrato 21/01, Sapone 29/01)
├─ Irrigazioni: 1 (150L 21/01)
├─ Problemi: 1 (Afidi 28/01)
├─ Raccolti: 1 (18.5kg 15/03)
└─ Foto: 5 (crescita, problema, trattamento, raccolta)
```

### **Opzione 3: Analytics**

```
Vai su: /app/analytics

Vedrai statistiche complete:

📊 RIEPILOGO CICLO POMODORI
├─ Durata: 60 giorni (15/01 → 15/03)
├─ Resa: 18.5 kg (1.85 kg/pianta)
├─ Qualità: 4.5/5 ⭐⭐⭐⭐⭐
├─ Costi Totali: €85
│   ├─ Lavorazioni: €30
│   ├─ Piantine: €20
│   ├─ Fertilizzanti: €15
│   ├─ Trattamenti: €10
│   └─ Irrigazione: €10
├─ Ricavi: €240 (€13/kg × 18.5kg)
├─ ROI: +182% 🎉
└─ Problemi: 1 (afidi, risolto)

💡 SUGGERIMENTI AI:
- Resa superiore del 21% rispetto alla media
- Qualità migliorata grazie a fertirrigazione
- Problema afidi risolto efficacemente
- Per prossimo ciclo: ripetere stesso protocollo
```

---

## 5️⃣ QUERY AVANZATE

### **A. Confronta Due Cicli**

```
Vai su: /app/analytics
Seleziona: "Confronto Cicli"

Scegli:
- Ciclo 1: Pomodori Q1 2025
- Ciclo 2: Pomodori Q1 2026

Vedrai:
- Differenze resa
- Differenze qualità
- Differenze costi
- Cosa è cambiato
- Cosa ha funzionato meglio
```

### **B. Storico per Coltura**

```
Vai su: /app/planner
Cerca: "Pomodoro San Marzano"

Vedrai:
- Tutti i cicli storici
- Rese medie
- Problemi comuni
- Trattamenti efficaci
- Costi medi
- ROI medio
- Suggerimenti per prossimo ciclo
```

### **C. Export per Certificazioni**

```
Vai su: /app/export
Seleziona: "Diario Operativo"

Scegli:
- Formato: PDF
- Periodo: 01/01/2026 - 31/03/2026
- Includi foto: Sì

Scarica PDF con:
- Tutte le operazioni
- Tutti i trattamenti
- Tutte le foto
- Conformità biologica
- Firme operatori
```

---

## 6️⃣ TIPS PER MASSIMIZZARE LO STORICO

### **✅ BEST PRACTICES**

1. **Registra SUBITO dopo l'operazione**
   - Non aspettare giorni
   - I dettagli si dimenticano

2. **Usa sempre Zona/Filare**
   - Permette tracciabilità precisa
   - Abilita correlazioni automatiche

3. **Aggiungi NOTE dettagliate**
   - Condizioni terreno
   - Osservazioni
   - Problemi rilevati

4. **Carica FOTO regolarmente**
   - Almeno 1 volta a settimana
   - Prima e dopo trattamenti
   - Problemi e soluzioni

5. **Registra METEO**
   - Temperatura
   - Vento
   - Pioggia
   - Umidità terreno

6. **Traccia COSTI**
   - Materiali
   - Manodopera
   - Attrezzature
   - Permette calcolo ROI

---

## 7️⃣ COSA SUCCEDE DOPO

### **CORRELAZIONI AUTOMATICHE**

Il sistema collega automaticamente:

```
OPERAZIONE 1: Fresatura terreno
├─ Data: 10/01/2026
└─ Area: 30m²

OPERAZIONE 2: Trapianto pomodori
├─ Data: 15/01/2026
├─ Area: 30m²
└─ CORRELATA A: Fresatura (5 giorni prima) ✅

OPERAZIONE 3: Fertilizzazione
├─ Data: 21/01/2026
├─ Filare: 3
└─ CORRELATA A: Trapianto (6 giorni dopo) ✅

OPERAZIONE 4: Irrigazione
├─ Data: 21/01/2026
├─ Filare: 3
└─ CORRELATA A: Fertilizzazione (stesso giorno) ✅

OPERAZIONE 5: Problema afidi
├─ Data: 28/01/2026
├─ Filare: 3
└─ CORRELATA A: Tutte le operazioni precedenti ✅

OPERAZIONE 6: Trattamento sapone
├─ Data: 29/01/2026
├─ Filare: 3
└─ CORRELATA A: Problema afidi (1 giorno dopo) ✅

OPERAZIONE 7: Raccolta
├─ Data: 15/03/2026
├─ Quantità: 18.5kg
├─ Qualità: 4.5/5
└─ CORRELATA A: Tutte le operazioni precedenti ✅
```

### **ANALYTICS AUTOMATICHE**

Il sistema calcola automaticamente:

- ✅ Efficienza operazioni (tempo/area)
- ✅ Efficacia trattamenti (problema risolto?)
- ✅ ROI per coltura (ricavi - costi)
- ✅ Tempo medio operazione → risultato
- ✅ Impatto meteo su performance
- ✅ Pattern stagionali
- ✅ Problemi ricorrenti
- ✅ Soluzioni efficaci

### **SUGGERIMENTI AI**

Il sistema genera automaticamente:

- 💡 Suggerimenti per prossima coltura
- 💡 Cosa ripetere (ha funzionato bene)
- 💡 Cosa evitare (ha causato problemi)
- 💡 Timing ottimale operazioni
- 💡 Dosaggi ottimali
- 💡 Prevenzione problemi
- 💡 Previsioni resa e qualità

---

## ✅ RIEPILOGO RAPIDO

### **PER VEDERE STORICO REALE:**

1. ✅ Registra operazioni usando i form
2. ✅ Carica foto regolarmente
3. ✅ Usa sempre Zona/Filare
4. ✅ Aggiungi note dettagliate
5. ✅ Traccia costi e meteo

### **DOVE VEDERE STORICO:**

1. 📖 **Diario Operativo** (`/app/diary`) - Timeline completa
2. 📍 **Vista Filare** (`/app/garden`) - Storico per filare
3. 📊 **Analytics** (`/app/analytics`) - Statistiche e trend
4. 🌱 **Planner** (`/app/planner`) - Storico per coltura
5. 📸 **Piante** (`/app/plants`) - Timeline foto

### **BENEFICI:**

- ✅ Tracciabilità totale
- ✅ Correlazioni automatiche
- ✅ Analytics e trend
- ✅ Suggerimenti AI
- ✅ Miglioramento continuo
- ✅ Ottimizzazione costi
- ✅ Conformità certificazioni

---

**INIZIA ORA**: Registra la tua prima operazione e inizia a costruire lo storico delle tue piante! 🌱
