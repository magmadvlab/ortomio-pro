# 🌱 Guida Pratica: Come Gestire le Zone del Tuo Orto

**Data:** 15 Gennaio 2026  
**Per:** Utente OrtoMio PRO

---

## 🎯 Risposta Rapida alla Tua Domanda

**"Come individuo e gestisco le zone del mio orto per fare trattamenti, lavorazioni, fertilizzazione e irrigazione?"**

### Risposta Breve
Il tuo orto è organizzato in **4 livelli gerarchici**:

```
🏡 ORTO
  ↓
🗺️ ZONE (es: Zona Nord, Zona Sud)
  ↓
📏 FILARI (es: Filare 1, Filare 2)
  ↓
✂️ PORZIONI (es: Inizio 0-33m, Centro 33-66m, Fine 66-100m)
```

Quando fai un'operazione (irrigazione, trattamento, ecc.), puoi scegliere **esattamente dove** applicarla usando un menu a tendina che ti mostra tutte le zone, filari e porzioni disponibili.

---

## 📍 Come Funziona il Sistema

### 1. Struttura del Tuo Orto

Immagina il tuo orto come una **mappa organizzata**:

```
┌─────────────────────────────────────────────────────┐
│                  🏡 ORTO PRINCIPALE                  │
│                     (1000 m²)                        │
├─────────────────────────────────────────────────────┤
│                                                      │
│  🗺️ ZONA NORD (300 m²)                              │
│  ├─ 📏 Filare 1 (100m, sesto 50cm)                  │
│  │  ├─ ✂️ Inizio (0-33.33m) → 67 piante            │
│  │  ├─ ✂️ Centro (33.33-66.66m) → 67 piante        │
│  │  └─ ✂️ Fine (66.66-100m) → 67 piante            │
│  │                                                   │
│  └─ 📏 Filare 2 (80m, sesto 40cm)                   │
│     ├─ ✂️ Inizio (0-26.66m) → 67 piante            │
│     ├─ ✂️ Centro (26.66-53.33m) → 67 piante        │
│     └─ ✂️ Fine (53.33-80m) → 67 piante             │
│                                                      │
│  🗺️ ZONA SUD (400 m²)                               │
│  ├─ 📏 Filare 3 (120m, sesto 60cm)                  │
│  └─ 📏 Filare 4 (100m, sesto 50cm)                  │
│                                                      │
│  🗺️ SERRA 1 (300 m²)                                │
│  └─ 📏 Bancale 1 (20m)                              │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## 🎨 Come Individui le Zone nell'App

### Interfaccia Visuale

Quando apri un'operazione (es: "Nuovo Trattamento"), vedi questo menu:

```
┌─────────────────────────────────────────────────────┐
│ 📍 Seleziona zona, filare o porzione...          ▼ │
└─────────────────────────────────────────────────────┘
```

**Cliccando** si apre un menu organizzato:

```
┌─────────────────────────────────────────────────────┐
│ ZONE                                                 │
│ ─────────────────────────────────────────────────── │
│ 🗺️ Zona Nord                                        │
│    Area settentrionale • 300 m²                     │
│                                                      │
│ 🗺️ Zona Sud                                         │
│    Area meridionale • 400 m²                        │
│                                                      │
│ 🗺️ Serra 1                                          │
│    Serra riscaldata • 300 m²                        │
│                                                      │
├─────────────────────────────────────────────────────┤
│ FILARI                                               │
│ ─────────────────────────────────────────────────── │
│ 📏 Zona Nord - Filare 1                             │
│    100m • Sesto 50cm • 200 piante                   │
│                                                      │
│ 📏 Zona Nord - Filare 2                             │
│    80m • Sesto 40cm • 200 piante                    │
│                                                      │
│ 📏 Zona Sud - Filare 3                              │
│    120m • Sesto 60cm • 200 piante                   │
│                                                      │
├─────────────────────────────────────────────────────┤
│ PORZIONI DI FILARE                                   │
│ ─────────────────────────────────────────────────── │
│ ✂️ Zona Nord - Filare 1 - Inizio                   │
│    0-33.33m (33.3m) • 67 piante                     │
│                                                      │
│ ✂️ Zona Nord - Filare 1 - Centro                   │
│    33.33-66.66m (33.3m) • 67 piante                 │
│                                                      │
│ ✂️ Zona Nord - Filare 1 - Fine                     │
│    66.66-100m (33.3m) • 67 piante                   │
│                                                      │
├─────────────────────────────────────────────────────┤
│ GENERALE                                             │
│ ─────────────────────────────────────────────────── │
│ 📍 Tutto l'orto                                     │
│    Orto Principale • 1000 m²                        │
└─────────────────────────────────────────────────────┘
```

---

## 💧 Esempio Pratico: Irrigazione

### Scenario: Vuoi irrigare solo il Filare 1 della Zona Nord

**PASSO 1: Apri Form Irrigazione**
- Vai su "Irrigazione" nel menu
- Click su "Nuova Irrigazione"

**PASSO 2: Seleziona Location**
```
┌─────────────────────────────────────────┐
│ 📍 Dove vuoi irrigare?                  │
│                                       ▼ │
└─────────────────────────────────────────┘
  ↓ (click)
┌─────────────────────────────────────────┐
│ 📏 Zona Nord - Filare 1                 │  ← SELEZIONI QUESTO
│    100m • Sesto 50cm                    │
└─────────────────────────────────────────┘
```

**PASSO 3: Compila Dati**
```
┌─────────────────────────────────────────┐
│ Location: Zona Nord - Filare 1          │
│                                          │
│ Quantità acqua: [100] litri             │
│ Durata: [30] minuti                     │
│ Data: [15/01/2026]                      │
│ Note: [Irrigazione mattutina]           │
│                                          │
│ [Salva Irrigazione]                     │
└─────────────────────────────────────────┘
```

**PASSO 4: Sistema Salva**
Il sistema registra:
- ✅ Orto: Orto Principale
- ✅ Zona: Zona Nord
- ✅ Filare: Filare 1
- ✅ Acqua: 100 litri
- ✅ Data: 15/01/2026

**RISULTATO:**
Ora puoi vedere:
- Storico irrigazioni per quel filare
- Consumo acqua per filare
- Frequenza irrigazioni
- Report per certificazioni

---

## 🌿 Esempio Pratico: Trattamento

### Scenario: Vuoi trattare solo l'inizio del Filare 1 (primi 33 metri)

**PASSO 1: Apri Form Trattamento**
- Vai su "Trattamenti" nel menu
- Click su "Nuovo Trattamento"

**PASSO 2: Seleziona Location Precisa**
```
┌─────────────────────────────────────────┐
│ 📍 Dove vuoi applicare il trattamento?  │
│                                       ▼ │
└─────────────────────────────────────────┘
  ↓ (click)
┌─────────────────────────────────────────┐
│ ✂️ Zona Nord - Filare 1 - Inizio       │  ← SELEZIONI QUESTO
│    0-33.33m (33.3m) • 67 piante         │
└─────────────────────────────────────────┘
```

**PASSO 3: Compila Dati Trattamento**
```
┌─────────────────────────────────────────┐
│ Location: Zona Nord - Filare 1 - Inizio │
│           (0-33.33m)                     │
│                                          │
│ Tipo: [Fungicida ▼]                     │
│ Prodotto: [Rame Ossicloruro]            │
│ Dosaggio: [2] g/L                       │
│ Quantità: [10] litri                    │
│ Data: [15/01/2026]                      │
│ Note: [Trattamento preventivo]          │
│                                          │
│ [Salva Trattamento]                     │
└─────────────────────────────────────────┘
```

**PASSO 4: Sistema Salva**
Il sistema registra:
- ✅ Orto: Orto Principale
- ✅ Zona: Zona Nord
- ✅ Filare: Filare 1
- ✅ Porzione: Inizio (0-33.33m)
- ✅ Prodotto: Rame Ossicloruro
- ✅ Dosaggio: 2g/L
- ✅ Quantità: 10 litri
- ✅ Data: 15/01/2026

**RISULTATO:**
- ✅ Tracciabilità completa per certificazioni bio
- ✅ Storico trattamenti per quella porzione specifica
- ✅ Calcolo tempi di carenza
- ✅ Report per GlobalGAP

---

## 🚜 Esempio Pratico: Lavorazione Meccanica

### Scenario: Vuoi arare tutta la Zona Sud

**PASSO 1: Apri Form Lavorazioni**
- Vai su "Lavorazioni Meccaniche" nel menu
- Click su "Nuova Lavorazione"

**PASSO 2: Seleziona Zona**
```
┌─────────────────────────────────────────┐
│ 📍 Dove vuoi lavorare?                  │
│                                       ▼ │
└─────────────────────────────────────────┘
  ↓ (click)
┌─────────────────────────────────────────┐
│ 🗺️ Zona Sud                             │  ← SELEZIONI QUESTO
│    Area meridionale • 400 m²            │
└─────────────────────────────────────────┘
```

**PASSO 3: Compila Dati**
```
┌─────────────────────────────────────────┐
│ Location: Zona Sud (400 m²)             │
│                                          │
│ Tipo: [Lavorazione del Terreno ▼]      │
│ Attrezzatura: [Trattore John Deere ▼]  │
│ Operatore: [Mario Rossi]                │
│ Durata stimata: [4] ore                 │
│ Data: [15/01/2026]                      │
│ Note: [Aratura pre-semina]              │
│                                          │
│ [Salva Lavorazione]                     │
└─────────────────────────────────────────┘
```

**RISULTATO:**
- ✅ Registro completo lavorazioni per zona
- ✅ Calcolo ore lavoro
- ✅ Consumo carburante
- ✅ Costi operativi

---

## 🌾 Esempio Pratico: Pianificazione con Rotazione

### Scenario: Vuoi piantare pomodori nel Filare 2, ma vuoi sapere se è compatibile con la coltura precedente

**PASSO 1: Apri Planner Classico**
- Vai su "Planner" nel menu
- Seleziona "Planner Classico"

**PASSO 2: Seleziona Filare**
```
┌─────────────────────────────────────────┐
│ 📍 Dove vuoi piantare?                  │
│                                       ▼ │
└─────────────────────────────────────────┘
  ↓ (click)
┌─────────────────────────────────────────┐
│ 📏 Zona Nord - Filare 2                 │  ← SELEZIONI QUESTO
│    80m • Sesto 40cm                     │
└─────────────────────────────────────────┘
```

**PASSO 3: Sistema Mostra Storico**
```
┌─────────────────────────────────────────┐
│ 📊 STORICO ROTAZIONE - Filare 2         │
│                                          │
│ 2025: Lattuga (Leafy)                   │
│ 2024: Carote (Root)                     │
│ 2023: Fagioli (Legume)                  │
│                                          │
│ ─────────────────────────────────────── │
│                                          │
│ Nuova coltura: [Pomodoro ▼]             │
│                                          │
│ 🎯 SCORE COMPATIBILITÀ: 85/100 ✅       │
│                                          │
│ ✅ Ottima rotazione!                    │
│ • Lattuga (Leafy) → Pomodoro (Fruit)   │
│ • Nessun problema di parassiti          │
│ • Buon equilibrio nutrienti             │
│                                          │
│ [Conferma Pianificazione]               │
└─────────────────────────────────────────┘
```

**RISULTATO:**
- ✅ Sistema calcola automaticamente compatibilità
- ✅ Warnings se rotazione sconsigliata
- ✅ Suggerimenti AI per ottimizzazione
- ✅ Storico completo per filare

---

## 🎯 Cosa Puoi Fare con Ogni Livello

### 1. TUTTO L'ORTO 🏡
**Quando usarlo:** Operazioni generali

**Esempi:**
- Analisi generale salute orto
- Report totale produzione
- Statistiche complessive
- Certificazioni globali

---

### 2. ZONA SPECIFICA 🗺️
**Quando usarlo:** Operazioni su area ampia

**Esempi:**
- Irrigare tutta la Zona Nord
- Lavorare tutta la Serra 1
- Analisi per zona
- Confronto tra zone

**Vantaggi:**
- ✅ Più veloce che selezionare ogni filare
- ✅ Utile per operazioni ampie
- ✅ Report aggregati per zona

---

### 3. FILARE SPECIFICO 📏
**Quando usarlo:** Operazioni su filare completo

**Esempi:**
- Trattare tutto il Filare 1
- Irrigare tutto il Filare 2
- Pianificare rotazione per filare
- Analisi produzione per filare

**Vantaggi:**
- ✅ Precisione chirurgica
- ✅ Storico rotazione per filare
- ✅ Tracciabilità completa
- ✅ Ottimizzazione per filare

---

### 4. PORZIONE DI FILARE ✂️
**Quando usarlo:** Massima precisione

**Esempi:**
- Trattare solo l'inizio del filare (piante malate)
- Irrigare solo la fine (terreno più secco)
- Analisi per porzione
- Interventi mirati

**Vantaggi:**
- ✅ Massima precisione
- ✅ Risparmio prodotti
- ✅ Interventi mirati
- ✅ Tracciabilità dettagliata

---

## 📊 Dove Vedi le Informazioni

### 1. Storico Operazioni
```
┌─────────────────────────────────────────┐
│ 📋 STORICO FILARE 1                     │
│                                          │
│ 15/01/2026 - Irrigazione                │
│ └─ Porzione: Inizio (0-33m)             │
│    100L • 30 min                        │
│                                          │
│ 14/01/2026 - Trattamento                │
│ └─ Porzione: Centro (33-66m)            │
│    Rame 2g/L • 10L                      │
│                                          │
│ 13/01/2026 - Lavorazione                │
│ └─ Tutto il filare                      │
│    Sarchiatura • 2h                     │
└─────────────────────────────────────────┘
```

### 2. Analytics per Location
```
┌─────────────────────────────────────────┐
│ 📊 ANALYTICS - Zona Nord                │
│                                          │
│ Filare 1:                               │
│ • Irrigazioni: 12 (360L totali)         │
│ • Trattamenti: 3 (Rame, Zolfo)          │
│ • Lavorazioni: 2 (8h totali)            │
│ • Salute media: 85/100 ✅               │
│                                          │
│ Filare 2:                               │
│ • Irrigazioni: 10 (300L totali)         │
│ • Trattamenti: 2 (Rame)                 │
│ • Lavorazioni: 1 (4h totali)            │
│ • Salute media: 78/100 ⚠️               │
└─────────────────────────────────────────┘
```

### 3. Report Certificazioni
```
┌─────────────────────────────────────────┐
│ 📄 QUADERNO DI CAMPAGNA                 │
│                                          │
│ FILARE 1 - ZONA NORD                    │
│                                          │
│ Trattamenti 2026:                       │
│ ├─ 15/01 - Rame 2g/L (Inizio)          │
│ ├─ 10/01 - Zolfo 3g/L (Centro)         │
│ └─ 05/01 - Rame 2g/L (Fine)            │
│                                          │
│ Irrigazioni 2026:                       │
│ ├─ 15/01 - 100L (Tutto)                │
│ ├─ 12/01 - 80L (Inizio+Centro)         │
│ └─ 08/01 - 100L (Tutto)                │
│                                          │
│ [Esporta PDF] [Stampa]                  │
└─────────────────────────────────────────┘
```

---

## ✅ Vantaggi del Sistema

### 1. Precisione Chirurgica
- ✅ Sai **esattamente** dove hai fatto ogni operazione
- ✅ Storico completo per ogni metro del tuo orto
- ✅ Nessuna confusione su "dove ho trattato?"

### 2. Risparmio Risorse
- ✅ Tratti solo dove serve (risparmio prodotti)
- ✅ Irrighi solo dove serve (risparmio acqua)
- ✅ Lavori solo dove serve (risparmio tempo)

### 3. Certificazioni Facili
- ✅ Tracciabilità completa per bio
- ✅ Report automatici per GlobalGAP
- ✅ Quaderno di campagna sempre aggiornato
- ✅ Export PDF per controlli

### 4. Rotazione Intelligente
- ✅ Sistema ricorda cosa hai piantato per filare
- ✅ Calcola automaticamente compatibilità
- ✅ Warnings per rotazioni sconsigliate
- ✅ Suggerimenti AI per ottimizzazione

### 5. Analytics Dettagliate
- ✅ Confronta produzione tra filari
- ✅ Identifica filari problematici
- ✅ Ottimizza interventi per zona
- ✅ Calcola costi per location

---

## 🚀 Come Iniziare

### STEP 1: Crea le Zone del Tuo Orto
1. Vai su "Impostazioni" → "Gestione Orti"
2. Seleziona il tuo orto
3. Click su "Aggiungi Zona"
4. Inserisci:
   - Nome: "Zona Nord"
   - Descrizione: "Area settentrionale"
   - Area: 300 m²

### STEP 2: Crea i Filari
1. Nella zona appena creata
2. Click su "Aggiungi Filare"
3. Inserisci:
   - Nome: "Filare 1"
   - Lunghezza: 100 metri
   - Sesto di impianto: 50 cm
   - Numero piante: 200

### STEP 3: Sistema Crea Automaticamente le Porzioni
Il sistema divide automaticamente ogni filare in 3 porzioni:
- Inizio (primi 33%)
- Centro (33-66%)
- Fine (ultimi 33%)

### STEP 4: Inizia a Usare le Zone
Ora quando fai qualsiasi operazione, puoi selezionare:
- Tutta la zona
- Un filare specifico
- Una porzione di filare

---

## 💡 Consigli Pratici

### 1. Organizza per Esposizione
```
Zona Nord → Colture che amano ombra
Zona Sud → Colture che amano sole
Zona Est → Colture mattutine
Zona Ovest → Colture pomeridiane
```

### 2. Usa i Filari per Rotazione
```
Filare 1 → Pomodori (2026)
Filare 2 → Lattuga (2026)
Filare 3 → Fagioli (2026)

Anno prossimo ruoti:
Filare 1 → Lattuga (2027)
Filare 2 → Fagioli (2027)
Filare 3 → Pomodori (2027)
```

### 3. Usa le Porzioni per Interventi Mirati
```
Filare 1 - Inizio → Piante malate → Trattamento
Filare 1 - Centro → Piante sane → Nessun trattamento
Filare 1 - Fine → Terreno secco → Irrigazione extra
```

---

## ❓ FAQ

### Q: Devo per forza creare zone e filari?
**A:** No! Puoi sempre selezionare "Tutto l'orto" se preferisci. Le zone/filari sono opzionali ma molto utili per precisione e certificazioni.

### Q: Posso modificare zone e filari dopo averli creati?
**A:** Sì! Vai su "Impostazioni" → "Gestione Orti" e modifica quando vuoi.

### Q: Cosa succede se non seleziono una location?
**A:** L'operazione viene salvata per "Tutto l'orto" (nessuna location specifica).

### Q: Posso vedere tutte le operazioni su un filare?
**A:** Sì! Vai su "Diario" e filtra per filare specifico.

### Q: Il sistema calcola automaticamente le porzioni?
**A:** Sì! Quando crei un filare, il sistema divide automaticamente in 3 porzioni uguali.

---

## 🎯 Riepilogo

**Il sistema zone/filari/porzioni ti permette di:**

✅ **Individuare** esattamente dove fare ogni operazione  
✅ **Gestire** con precisione chirurgica il tuo orto  
✅ **Tracciare** ogni intervento per certificazioni  
✅ **Ottimizzare** rotazioni e risorse  
✅ **Analizzare** performance per location  
✅ **Risparmiare** tempo, acqua e prodotti  

**Tutto tramite un semplice menu a tendina!** 📍

---

**Hai altre domande? Chiedi pure!** 😊
