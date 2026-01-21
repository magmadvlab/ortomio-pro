# 📊 Guida: Registrazione Manuale Trattamenti Nutrizione

## 🎯 Come Funziona il Sistema di Nutrizione

Il sistema di nutrizione di OrtomIO registra **tutti i dati** dei trattamenti, sia per sistemi manuali che IOT, con tracciabilità completa per certificazioni biologiche.

---

## 📝 Cosa Viene Registrato

### 1. **Dati del Trattamento**

```typescript
{
  // QUANDO
  scheduledDate: "2026-01-21",           // Data programmata
  actualApplicationDate: "2026-01-21",   // Data effettiva applicazione
  applicationTime: "08:30",              // Ora applicazione
  
  // DOVE
  gardenId: "uuid",                      // Orto/Campo
  zoneId: "uuid",                        // Zona specifica (opzionale)
  fieldRowId: "uuid",                    // Filare specifico
  sectionId: "uuid",                     // Sezione filare (opzionale)
  plantIds: ["uuid1", "uuid2"],          // Piante individuali (opzionale)
  
  // COSA
  treatmentType: "fertilization",        // Tipo: fertilizzazione, antiparassitario, ecc.
  productId: "uuid",                     // Prodotto utilizzato
  productName: "Concime NPK 20-20-20",   // Nome prodotto
  dosage: 50,                            // Quantità
  dosageUnit: "g_per_sqm",              // Unità di misura
  applicationMethod: "fertigation",      // Metodo: manuale, fertirrigazione, ecc.
  
  // COME
  mixingInstructions: "Diluire in 10L", // Istruzioni miscelazione
  mixingRatio: "50g/10L",               // Rapporto miscelazione
  equipmentUsed: "Pompa irroratrice",   // Attrezzatura usata
  calibrationCheck: true,                // Calibrazione verificata
  actualCoverage: 100,                   // Area coperta (m²)
  applicationDurationMinutes: 30,        // Durata applicazione
  
  // CHI
  operatorId: "uuid",                    // ID operatore
  operatorName: "Mario Rossi",           // Nome operatore
  
  // CONDIZIONI AMBIENTALI
  weatherConditions: {
    temperatureCelsius: 22,
    humidityPercentage: 65,
    windSpeedKmh: 5,
    windDirection: "N",
    conditions: "sunny"
  },
  
  // CONDIZIONI TERRENO
  soilConditions: {
    moisturePercentage: 45,
    temperatureCelsius: 18,
    phLevel: 6.5,
    conductivity: 1.2
  },
  
  // RISULTATI
  effectiveness: 8,                      // Efficacia 1-10
  plantResponse: "Crescita migliorata",  // Risposta piante
  sideEffects: [],                       // Effetti collaterali
  followUpRequired: false,               // Follow-up necessario
  
  // COSTI
  productCost: 15.50,                    // Costo prodotto
  laborCost: 20.00,                      // Costo manodopera
  equipmentCost: 5.00,                   // Costo attrezzatura
  totalCost: 40.50,                      // Costo totale
  
  // CERTIFICAZIONI
  organicCompliant: true,                // Conforme bio
  certificationNotes: "Prodotto certificato bio",
  photosBeforeIds: ["photo1"],           // Foto prima
  photosAfterIds: ["photo2"],            // Foto dopo
  
  // NOTE
  notes: "Applicato al mattino presto",
  status: "completed"                    // Stato: pianificato, completato, ecc.
}
```

---

## 🔍 Come Vedere i Dati Registrati

### Opzione 1: Dashboard Nutrizione

**Percorso:** `Nutrizione` → `Dashboard`

**Cosa vedi:**
- ✅ **Trattamenti Recenti** - Ultimi 5 trattamenti con data, prodotto, stato
- 📊 **Statistiche Rapide** - Biologico %, Efficacia media, Costo mensile
- 📅 **Programmazioni Attive** - Trattamenti schedulati
- ⚠️ **Alert** - Stock basso, efficacia ridotta

```
┌─────────────────────────────────────────────────────┐
│  Trattamenti Recenti                                │
├─────────────────────────────────────────────────────┤
│  🌱 Concime NPK 20-20-20                           │
│     21 Gen 2026 • Completato                        │
│     Filare Pomodori • 50 g/m² • Fertirrigazione    │
│                                                      │
│  🐛 Antiparassitario Bio                           │
│     20 Gen 2026 • Completato                        │
│     Filare Melanzane • 30 ml/L • Spray             │
└─────────────────────────────────────────────────────┘
```

### Opzione 2: Storico Trattamenti

**Percorso:** `Nutrizione` → `Trattamenti` → `Storico`

**Filtri disponibili:**
- 📅 Per data (range)
- 🌱 Per tipo trattamento
- 📍 Per zona/filare
- ✅ Per stato
- 🍃 Solo biologici

**Dettagli visualizzabili:**
- Data e ora esatta
- Prodotto utilizzato
- Dosaggio e metodo
- Operatore
- Condizioni meteo
- Efficacia
- Costi
- Foto prima/dopo

### Opzione 3: Timeline Filare

**Percorso:** `Filari` → Seleziona filare → `Timeline`

**Cosa vedi:**
```
┌─────────────────────────────────────────────────────┐
│  Timeline Filare Pomodori                           │
├─────────────────────────────────────────────────────┤
│  21 Gen 2026 08:30                                  │
│  🌱 Fertilizzazione                                 │
│  Concime NPK 20-20-20 • 50 g/m²                    │
│  Fertirrigazione • 30 min                           │
│  Meteo: ☀️ 22°C, 65% umidità                       │
│  Operatore: Mario Rossi                             │
│  Efficacia: ⭐⭐⭐⭐⭐⭐⭐⭐ (8/10)                    │
│  Costo: €40.50                                      │
│  [Foto Prima] [Foto Dopo]                           │
│                                                      │
│  20 Gen 2026 07:00                                  │
│  🐛 Antiparassitario                                │
│  ...                                                 │
└─────────────────────────────────────────────────────┘
```

### Opzione 4: Diario Operativo

**Percorso:** `Diario` → `Operativo`

**Cosa vedi:**
- Tutte le operazioni per data
- Inclusi trattamenti nutrizione
- Raggruppati per giorno
- Con meteo del giorno
- Operatore che ha eseguito

### Opzione 5: Report Certificazioni

**Percorso:** `Certificazioni` → `Report`

**Cosa vedi:**
- Tutti i trattamenti per periodo
- Conformità biologica
- Prodotti utilizzati
- Dosaggi applicati
- Intervalli di sicurezza rispettati
- Documentazione fotografica

---

## 📱 Come Registrare un Trattamento Manuale

### Passo 1: Apri Form Registrazione

**Percorso:** `Nutrizione` → `Nuovo Trattamento`

### Passo 2: Seleziona Dove

```
☑ Filare Specifico
  └─ Seleziona: Filare Pomodori

☐ Zona Irrigua
☐ Sezione Filare
☐ Piante Individuali
```

### Passo 3: Seleziona Cosa

```
Tipo Trattamento: [Fertilizzazione ▼]

Prodotto: [Concime NPK 20-20-20 ▼]
  • Stock disponibile: 5 kg
  • Dosaggio raccomandato: 50 g/m²
  • Metodo: Fertirrigazione
  • Biologico: ✅ Sì
```

### Passo 4: Configura Dosaggio

```
Dosaggio: [50] g/m²

Area da trattare: 100 m²
Volume totale necessario: 5 kg

Metodo Applicazione: [Fertirrigazione ▼]
  • Manuale
  • Fertirrigazione ✓
  • Spray fogliare
  • Granulare
```

### Passo 5: Istruzioni Miscelazione (se necessario)

```
Istruzioni: [Diluire 50g in 10L di acqua]

Rapporto: [50g/10L]

Attrezzatura: [Pompa irroratrice]

Calibrazione verificata: ☑
```

### Passo 6: Quando

```
Data: [21/01/2026]
Ora: [08:30]

Durata stimata: 30 minuti
```

### Passo 7: Condizioni (Opzionale ma Consigliato)

```
┌─ Condizioni Meteo ─────────────────┐
│  Temperatura: [22] °C              │
│  Umidità: [65] %                   │
│  Vento: [5] km/h                   │
│  Condizioni: [Soleggiato ▼]       │
└────────────────────────────────────┘

┌─ Condizioni Terreno ───────────────┐
│  Umidità suolo: [45] %             │
│  Temperatura suolo: [18] °C        │
│  pH: [6.5]                         │
└────────────────────────────────────┘
```

### Passo 8: Operatore

```
Operatore: [Mario Rossi ▼]
  (Rilevato automaticamente dall'utente loggato)
```

### Passo 9: Note e Foto

```
Note: [Applicato al mattino presto per evitare evaporazione]

Foto Prima: [📷 Carica foto]
Foto Dopo: [📷 Carica foto] (opzionale, da aggiungere dopo)
```

### Passo 10: Salva

```
[Salva come Pianificato]  [Salva come Completato]
```

---

## 🔄 Differenza Manuale vs Fertirrigazione

### Sistema Manuale

**Registrazione:**
- ✅ Tutti i dati inseriti manualmente
- ✅ Operatore registra dosaggio applicato
- ✅ Durata stimata o cronometrata
- ✅ Condizioni meteo inserite manualmente o da widget meteo
- ✅ Foto prima/dopo opzionali

**Esempio:**
```
Tipo: Manuale
Prodotto: Concime liquido
Dosaggio: 30 ml/L
Metodo: Spray fogliare
Durata: 45 minuti
Volume totale: 20 litri
Area coperta: 50 m²
```

### Sistema Fertirrigazione

**Registrazione:**
- ✅ Dosaggio calcolato automaticamente (se IOT)
- ✅ Durata registrata da sistema irrigazione
- ✅ Volume acqua da sistema irrigazione
- ✅ Concentrazione prodotto inserita manualmente
- ✅ Integrato con log irrigazione

**Esempio:**
```
Tipo: Fertirrigazione
Prodotto: Concime NPK 20-20-20
Concentrazione: 50 g/10L
Irrigazione: 100 litri
Durata: 30 minuti (da sistema irrigazione)
Dosaggio effettivo: 500g totali
Area coperta: 100 m² (da zona irrigua)
```

**Integrazione con Irrigazione:**
```
Log Irrigazione:
  Data: 21/01/2026 08:30
  Filare: Pomodori
  Volume: 100 litri
  Durata: 30 minuti
  
  ↓ Collegato a ↓
  
Log Nutrizione:
  Data: 21/01/2026 08:30
  Filare: Pomodori
  Prodotto: Concime NPK
  Dosaggio: 500g in 100L
  Metodo: Fertirrigazione
```

---

## 📊 Tracciabilità Completa

### Per Ogni Filare Puoi Vedere:

**1. Storico Completo**
```
Filare Pomodori - Storico Trattamenti

21 Gen 2026 08:30 - Fertilizzazione
  • Prodotto: Concime NPK 20-20-20
  • Dosaggio: 50 g/m²
  • Metodo: Fertirrigazione
  • Operatore: Mario Rossi
  • Meteo: ☀️ 22°C, 65% umidità
  • Efficacia: 8/10
  • Costo: €40.50
  • Biologico: ✅

15 Gen 2026 07:00 - Antiparassitario
  • Prodotto: Piretro naturale
  • Dosaggio: 30 ml/L
  • Metodo: Spray
  • Operatore: Luigi Verdi
  • Meteo: ⛅ 18°C, 70% umidità
  • Efficacia: 9/10
  • Costo: €25.00
  • Biologico: ✅
```

**2. Riepilogo Nutrizione**
```
Periodo: Ultimi 30 giorni

Trattamenti totali: 8
Fertilizzazioni: 4
Antiparassitari: 3
Fungicidi: 1

Conformità biologica: 100% ✅
Costo totale: €320.00
Efficacia media: 8.5/10

Prodotti più usati:
  1. Concime NPK 20-20-20 (4 volte)
  2. Piretro naturale (3 volte)
  3. Rame ossicloruro (1 volta)
```

**3. Grafici Andamento**
```
Efficacia Trattamenti
10 │         ●
 9 │     ●       ●
 8 │ ●               ●
 7 │
 6 │
   └─────────────────────
    Gen  Feb  Mar  Apr

Costi Mensili
€500│         ■
€400│     ■       
€300│ ■           ■
€200│
€100│
    └─────────────────────
     Gen  Feb  Mar  Apr
```

---

## 🎯 Vantaggi Sistema Manuale

### 1. **Tracciabilità Totale**
- ✅ Ogni trattamento registrato
- ✅ Data, ora, operatore
- ✅ Condizioni meteo e terreno
- ✅ Foto documentazione

### 2. **Certificazioni**
- ✅ Conformità biologica verificata
- ✅ Intervalli di sicurezza rispettati
- ✅ Dosaggi documentati
- ✅ Report automatici per audit

### 3. **Analisi Efficacia**
- ✅ Valutazione risultati
- ✅ Confronto prodotti
- ✅ Ottimizzazione dosaggi
- ✅ Identificazione problemi

### 4. **Gestione Costi**
- ✅ Costo per trattamento
- ✅ Costo per m²
- ✅ Costo per prodotto
- ✅ Trend mensili

### 5. **Inventario Automatico**
- ✅ Stock aggiornato automaticamente
- ✅ Alert stock basso
- ✅ Previsione riordini
- ✅ Storico acquisti

---

## 📋 Esempio Pratico Completo

### Scenario: Fertilizzazione Filare Pomodori

**1. Situazione Iniziale**
```
Filare: Pomodori (100 m²)
Prodotto: Concime NPK 20-20-20
Stock disponibile: 5 kg
Dosaggio raccomandato: 50 g/m²
Metodo: Fertirrigazione
```

**2. Registrazione Trattamento**
```
Data: 21/01/2026
Ora: 08:30
Operatore: Mario Rossi

Dosaggio: 50 g/m²
Volume totale: 5 kg
Concentrazione: 50g/10L acqua
Volume acqua: 100 litri

Durata: 30 minuti
Metodo: Fertirrigazione

Meteo:
  • Temperatura: 22°C
  • Umidità: 65%
  • Vento: 5 km/h
  • Condizioni: Soleggiato

Terreno:
  • Umidità: 45%
  • Temperatura: 18°C
  • pH: 6.5

Costi:
  • Prodotto: €15.50 (5kg × €3.10/kg)
  • Manodopera: €20.00 (30 min × €40/h)
  • Attrezzatura: €5.00
  • Totale: €40.50

Note: "Applicato al mattino presto per evitare evaporazione"
```

**3. Cosa Viene Salvato**
```
✅ Trattamento registrato in database
✅ Stock aggiornato: 5kg → 0kg
✅ Alert stock basso generato
✅ Collegato a log irrigazione
✅ Aggiunto a timeline filare
✅ Incluso in report certificazioni
✅ Costo aggiunto a contabilità
```

**4. Dove Puoi Vederlo**
```
1. Dashboard Nutrizione → Trattamenti Recenti
2. Nutrizione → Storico → Filtro per filare
3. Filari → Pomodori → Timeline
4. Diario Operativo → 21 Gen 2026
5. Certificazioni → Report → Gennaio 2026
6. Analytics → Costi → Gennaio 2026
```

**5. Follow-up (7 giorni dopo)**
```
Data: 28/01/2026
Operatore: Mario Rossi

Osservazioni:
  • Crescita migliorata
  • Foglie più verdi
  • Nessun effetto collaterale

Efficacia: 8/10

Foto dopo: [📷 Caricata]

✅ Follow-up registrato e collegato al trattamento
```

---

## 🚀 Prossimi Sviluppi

### Fase 1: Integrazione IOT (Già Disponibile)
- [ ] Sensori umidità suolo automatici
- [ ] Stazioni meteo integrate
- [ ] Dosatori automatici fertirrigazione
- [ ] Registrazione automatica volumi

### Fase 2: AI Predittiva
- [ ] Suggerimenti dosaggi ottimali
- [ ] Previsione efficacia
- [ ] Alert preventivi carenze
- [ ] Ottimizzazione costi

### Fase 3: Mobile App
- [ ] Registrazione rapida da campo
- [ ] Foto automatiche con GPS
- [ ] Riconoscimento prodotti da barcode
- [ ] Notifiche trattamenti programmati

---

## ✅ Conclusione

Il sistema di nutrizione OrtomIO offre:

✅ **Tracciabilità Completa** - Ogni dato registrato  
✅ **Flessibilità** - Manuale o IOT  
✅ **Certificazioni** - Conformità biologica  
✅ **Analytics** - Efficacia e costi  
✅ **Inventario** - Gestione automatica stock  
✅ **Timeline** - Storico per filare  
✅ **Report** - Export per audit  

**Tutto quello che serve per una gestione professionale della nutrizione!** 🌱

---

**Versione:** 1.0  
**Data:** 21 Gennaio 2026  
**Sistema:** OrtomIO Professional
