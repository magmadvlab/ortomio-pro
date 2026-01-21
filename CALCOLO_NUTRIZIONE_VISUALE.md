# 🧮 Come il Sistema Calcola Automaticamente i Quantitativi di Nutrizione

## 📊 SCHEMA VISUALE DEL CALCOLO

```
┌─────────────────────────────────────────────────────────────┐
│                    INPUT UTENTE                              │
├─────────────────────────────────────────────────────────────┤
│  • Filare 3: 30 piante di pomodoro                          │
│  • Lunghezza filare: 20 metri                               │
│  • Problema: Foglie gialle (carenza azoto)                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              CALCOLO AUTOMATICO AREA                         │
├─────────────────────────────────────────────────────────────┤
│  30 piante × 1m²/pianta = 30m²                              │
│  OPPURE                                                      │
│  5 filari × 20m × 1.5m larghezza = 150m²                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│         ANALISI TIPO PIANTA E FASE                          │
├─────────────────────────────────────────────────────────────┤
│  Tipo: FRUITING (pomodoro)                                  │
│  Fase: Vegetativa (45 giorni)                               │
│  Dosaggio base: 30g/m²                                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│            ADATTAMENTO PER URGENZA                          │
├─────────────────────────────────────────────────────────────┤
│  Problema: Foglie gialle → URGENZA ALTA                     │
│  Moltiplicatore: × 1.2                                      │
│  Dosaggio finale: 30g × 1.2 = 36g/m²                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│           CALCOLO QUANTITÀ TOTALE                           │
├─────────────────────────────────────────────────────────────┤
│  36g/m² × 30m² = 1.080g = 1.08kg                           │
│                                                              │
│  📦 QUANTITÀ DA PREPARARE: 1.08kg                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│            VERIFICA CONDIZIONI METEO                        │
├─────────────────────────────────────────────────────────────┤
│  ✅ Temperatura: 22°C (OK, range 15-30°C)                   │
│  ✅ Vento: 5km/h (OK, max 15km/h)                          │
│  ✅ Pioggia: 0mm (OK per applicazione)                      │
│  ✅ Umidità: 60% (OK)                                       │
│                                                              │
│  🟢 CONDIZIONI OTTIMALI - PROCEDI                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│         REGISTRAZIONE AUTOMATICA COMPLETA                   │
├─────────────────────────────────────────────────────────────┤
│  📅 Data: 21/01/2026 ore 08:30                             │
│  🌱 Dove: Filare 3, 30 piante                              │
│  💧 Quanto: 1.08kg Nitrato di Calcio                       │
│  🌡️ Meteo: 22°C, 60% umidità, vento 5km/h                 │
│  👤 Operatore: Mario Rossi                                  │
│  💰 Costo: €21.00 (prodotto + manodopera)                  │
│  ✅ Conformità: Biologico                                   │
│  📸 Foto: 4 foto (prima/dopo)                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 ESEMPI PRATICI

### **Esempio 1: Campo Intero**

```
INPUT:
Campo di lattuga: 100m²
Prodotto: Compost organico
Dosaggio: 200g/m²

CALCOLO AUTOMATICO:
200g/m² × 100m² = 20.000g = 20kg

RISULTATO:
"Preparare 20kg di compost organico per 100m² di campo"
```

---

### **Esempio 2: Filari Specifici**

```
INPUT:
5 filari di pomodori
Lunghezza: 20 metri ciascuno
Prodotto: NPK 20-20-20
Dosaggio: 50g/m²

CALCOLO AUTOMATICO:
Area = 5 filari × 20m × 1.5m = 150m²
Quantità = 50g/m² × 150m² = 7.500g = 7.5kg

RISULTATO:
"Preparare 7.5kg di NPK 20-20-20 per 5 filari (150m²)"
```

---

### **Esempio 3: Piante Individuali**

```
INPUT:
30 piante di basilico in vaso
Prodotto: Fertilizzante liquido
Dosaggio: 5ml/pianta

CALCOLO AUTOMATICO:
5ml × 30 piante = 150ml

RISULTATO:
"Preparare 150ml di fertilizzante liquido per 30 piante"
```

---

## 🌡️ ADATTAMENTO METEO AUTOMATICO

### **Scenario 1: Pioggia Prevista**

```
METEO: Pioggia 10mm prevista oggi

TRATTAMENTO FOGLIARE:
❌ RIMANDA
"🌧️ Pioggia prevista. Il trattamento sarà dilavato.
   Rimandare di 2-3 giorni."

FERTILIZZANTE RADICALE:
✅ PROCEDI
"🌧️ Pioggia prevista. Ottimo per fertilizzanti radicali.
   Migliore assorbimento garantito."
```

---

### **Scenario 2: Temperatura Troppo Alta**

```
METEO: 35°C previsti

SISTEMA:
❌ RIMANDA
"🌡️ Temperatura troppo alta (35°C).
   Rischio stress piante e evaporazione rapida.
   Applicare al mattino presto (6-8) o sera (18-20)."
```

---

### **Scenario 3: Vento Forte**

```
METEO: Vento 25km/h

SISTEMA:
❌ RIMANDA
"💨 Vento troppo forte (25km/h, max 15km/h).
   Rischio deriva spray e applicazione non uniforme.
   Attendere condizioni più calme."
```

---

## 🌱 ADATTAMENTO PER TIPO PIANTA

### **Piante da Foglia (Lattuga, Spinaci, Basilico)**

```
CATEGORIA: LEAFY
NUTRIENTE PRINCIPALE: Azoto (N)
DOSAGGIO BASE: 40g/m² (PIÙ ALTO)

ESEMPIO:
100m² di lattuga
40g/m² × 100m² = 4kg di fertilizzante azotato
```

---

### **Piante da Frutto (Pomodori, Peperoni, Melanzane)**

```
CATEGORIA: FRUITING
NUTRIENTI PRINCIPALI: Fosforo (P) + Potassio (K)
DOSAGGIO BASE: 30g/m²

ESEMPIO:
50m² di pomodori
30g/m² × 50m² = 1.5kg di NPK 10-20-20
```

---

### **Piante da Radice (Carote, Patate, Cipolle)**

```
CATEGORIA: ROOT
NUTRIENTE PRINCIPALE: Potassio (K)
DOSAGGIO BASE: 25g/m²

ESEMPIO:
80m² di carote
25g/m² × 80m² = 2kg di fertilizzante potassico
```

---

## 📈 ADATTAMENTO PER FASE DI CRESCITA

### **Fase 1: Piantine Giovani (0-30 giorni)**

```
FASE: Nursing
DOSAGGIO: 50% della dose normale
METODO: Fogliare (più delicato)

ESEMPIO:
Piantine di pomodoro (20 giorni)
Dosaggio normale: 30g/m²
Dosaggio ridotto: 15g/m² (50%)
```

---

### **Fase 2: Crescita Vegetativa (30-60 giorni)**

```
FASE: Vegetativa
DOSAGGIO: 100% dose normale
METODO: Radicale o fertirrigazione

ESEMPIO:
Pomodori in crescita (45 giorni)
Dosaggio: 30g/m² (dose piena)
```

---

### **Fase 3: Produzione (60+ giorni)**

```
FASE: Produttiva
DOSAGGIO: 120% dose normale (+20%)
METODO: Fertirrigazione (più efficiente)

ESEMPIO:
Pomodori in fruttificazione (80 giorni)
Dosaggio normale: 30g/m²
Dosaggio aumentato: 36g/m² (+20%)
```

---

## 📊 TRACCIABILITÀ COMPLETA

### **Cosa Viene Registrato Automaticamente:**

```
┌─────────────────────────────────────────────────────────────┐
│                  SCHEDA TRATTAMENTO                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📅 QUANDO                                                   │
│  • Data: 21/01/2026                                         │
│  • Ora: 08:30                                               │
│  • Durata: 45 minuti                                        │
│                                                              │
│  🌡️ CONDIZIONI METEO                                        │
│  • Temperatura: 18°C                                        │
│  • Umidità: 65%                                             │
│  • Vento: 5 km/h direzione NE                              │
│  • Pioggia 24h: 0mm                                         │
│  • Condizioni: Soleggiato                                   │
│                                                              │
│  🌱 DOVE                                                     │
│  • Orto: Orto di Mario                                      │
│  • Zona: Zona Nord                                          │
│  • Filare: Filare 3                                         │
│  • Piante: 30 pomodori San Marzano                         │
│                                                              │
│  💧 QUANTO                                                   │
│  • Prodotto: Nitrato di Calcio 15.5-0-0                    │
│  • Quantità: 1.08kg                                         │
│  • Dosaggio: 36g/m²                                         │
│  • Area trattata: 30m²                                      │
│  • Metodo: Fertirrigazione                                  │
│  • Diluizione: 1.08kg in 100L acqua                        │
│                                                              │
│  👤 CHI                                                      │
│  • Operatore: Mario Rossi                                   │
│  • Attrezzatura: Pompa irroratrice 15L                     │
│  • Calibrazione: ✅ Verificata                              │
│                                                              │
│  💰 COSTI                                                    │
│  • Prodotto: €8.50                                          │
│  • Manodopera: €12.50                                       │
│  • Attrezzatura: €5.00                                      │
│  • TOTALE: €26.00                                           │
│                                                              │
│  ✅ CONFORMITÀ                                               │
│  • Biologico: ✅ Sì                                         │
│  • Certificazione: Reg. CE 834/2007                         │
│  • Tempo carenza: 0 giorni                                  │
│  • Raccolta possibile: Subito                               │
│                                                              │
│  📸 DOCUMENTAZIONE                                           │
│  • Foto prima: 2 foto                                       │
│  • Foto dopo: 2 foto                                        │
│                                                              │
│  📊 RISULTATI                                                │
│  • Efficacia: 8/10                                          │
│  • Effetti collaterali: Nessuno                             │
│  • Risposta piante: Miglioramento dopo 7 giorni            │
│  • Follow-up: 28/01/2026                                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 COME VEDERE I DATI

### **1. Timeline Filare**

```
FILARE 3 - STORICO TRATTAMENTI

21/01/2026 - Nitrato di Calcio 1.08kg
├─ Operatore: Mario Rossi
├─ Meteo: 18°C, soleggiato
├─ Efficacia: 8/10
└─ Costo: €26.00

07/01/2026 - Compost Organico 10kg
├─ Operatore: Luigi Bianchi
├─ Meteo: 12°C, nuvoloso
├─ Efficacia: 7/10
└─ Costo: €15.00

20/12/2025 - NPK 20-20-20 2kg
├─ Operatore: Mario Rossi
├─ Meteo: 8°C, sereno
├─ Efficacia: 9/10
└─ Costo: €18.00
```

---

### **2. Dashboard Nutrizione**

```
┌─────────────────────────────────────────────────────────────┐
│              DASHBOARD NUTRIZIONE - GENNAIO 2026             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📊 STATISTICHE MESE                                         │
│  • Trattamenti totali: 12                                   │
│  • Costo totale: €245.00                                    │
│  • Efficacia media: 8.2/10                                  │
│  • Conformità biologica: 100%                               │
│                                                              │
│  📦 INVENTARIO                                               │
│  • NPK 20-20-20: 23.5kg (⚠️ Sotto soglia)                  │
│  • Compost organico: 150kg (✅ OK)                          │
│  • Nitrato di Calcio: 8.2kg (✅ OK)                         │
│                                                              │
│  📅 PROSSIMI TRATTAMENTI                                     │
│  • 25/01: Filare 1 - Compost (pianificato)                 │
│  • 28/01: Filare 3 - Verifica follow-up                     │
│  • 02/02: Filare 2 - NPK (pianificato)                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

### **3. Report Certificazioni**

```
┌─────────────────────────────────────────────────────────────┐
│         REPORT CERTIFICAZIONE BIOLOGICA 2026                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ✅ CONFORMITÀ: 100%                                         │
│                                                              │
│  📋 TRATTAMENTI ANNO                                         │
│  • Totale: 48 trattamenti                                   │
│  • Biologici: 48 (100%)                                     │
│  • Convenzionali: 0 (0%)                                    │
│                                                              │
│  📦 PRODOTTI UTILIZZATI                                      │
│  1. Compost organico - 450kg                                │
│  2. NPK 20-20-20 (bio) - 85kg                              │
│  3. Nitrato di Calcio - 32kg                                │
│  4. Estratto di alghe - 15L                                 │
│                                                              │
│  💰 COSTI TOTALI                                             │
│  • Prodotti: €1.250,00                                      │
│  • Manodopera: €850,00                                      │
│  • TOTALE: €2.100,00                                        │
│                                                              │
│  📸 DOCUMENTAZIONE                                           │
│  • Foto totali: 192                                         │
│  • Schede sicurezza: 4                                      │
│  • Fatture: 12                                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ RIEPILOGO FINALE

### **Il Sistema Calcola Automaticamente:**

1. ✅ **Area** → Da filari, piante, o campo
2. ✅ **Dosaggio** → In base a pianta, fase, urgenza
3. ✅ **Quantità** → Calcolo preciso in grammi/kg
4. ✅ **Timing** → Verifica meteo in tempo reale
5. ✅ **Metodo** → Fogliare, radicale, o fertirrigazione
6. ✅ **Costi** → Prodotto + manodopera + attrezzatura
7. ✅ **Conformità** → Verifica biologico/convenzionale
8. ✅ **Tracciabilità** → Registrazione completa automatica

### **Tutto Salvato per Certificazioni:**

- 📅 Data e ora esatta
- 🌡️ Condizioni meteo complete
- 🌱 Posizione precisa (zona/filare/piante)
- 💧 Quantità esatta utilizzata
- 👤 Operatore responsabile
- 💰 Costi dettagliati
- 📸 Foto documentazione
- ✅ Conformità certificazioni

---

**CONCLUSIONE**: Non devi calcolare nulla manualmente. Il sistema fa tutto automaticamente e registra ogni dettaglio per la tracciabilità completa richiesta dalle certificazioni biologiche.
