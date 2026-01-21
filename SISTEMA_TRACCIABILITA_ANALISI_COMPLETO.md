# 🔍 Sistema Completo di Tracciabilità e Analisi Dati

## 📊 PANORAMICA SISTEMA

Il sistema registra **TUTTE** le operazioni agricole e permette di analizzarle per colture successive:

```
┌─────────────────────────────────────────────────────────────┐
│                  SISTEMA DI TRACCIABILITÀ                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. LAVORAZIONI MECCANICHE                                  │
│     ├─ Aratura, Fresatura, Vangatura                       │
│     ├─ Potature, Sarchiatura, Pacciamatura                 │
│     └─ Tutte le lavorazioni del terreno                    │
│                                                              │
│  2. TRATTAMENTI FITOSANITARI                                │
│     ├─ Fertilizzazioni (NPK, organici)                     │
│     ├─ Antiparassitari (bio e convenzionali)               │
│     └─ Fungicidi, Erbicidi, Insetticidi                    │
│                                                              │
│  3. IRRIGAZIONI                                             │
│     ├─ Volumi erogati                                       │
│     ├─ Durata e frequenza                                   │
│     └─ Fertirrigazione                                      │
│                                                              │
│  4. RACCOLTI                                                │
│     ├─ Quantità e qualità                                   │
│     ├─ Date e condizioni                                    │
│     └─ Rese per m²                                          │
│                                                              │
│  5. DIARIO OPERATIVO                                        │
│     ├─ Correlazioni automatiche                             │
│     ├─ Analytics e trend                                    │
│     └─ Suggerimenti AI                                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 1️⃣ LAVORAZIONI MECCANICHE

### **COSA VIENE REGISTRATO:**

```typescript
// FORM COMPLETO LAVORAZIONI
{
  // IDENTIFICAZIONE
  id: "work-20260121-001",
  gardenId: "orto-mario-123",
  bedIds: ["bed-001", "bed-002"], // Zone lavorate
  rowIds: ["row-003", "row-004"], // Filari lavorati
  
  // TIPO LAVORAZIONE
  workType: "Tilling", // Fresatura
  equipmentType: "Rototiller", // Motozappa
  equipmentAttachment: "Fresa rotativa 80cm",
  
  // QUANDO
  workDate: "2026-01-21",
  durationMinutes: 120, // 2 ore
  
  // DOVE E QUANTO
  areaCoveredSqm: 150, // m²
  depthCm: 20, // Profondità lavorazione
  
  // CHI E QUANTO COSTA
  operatorName: "Mario Rossi",
  cost: 50.00, // €
  
  // CONDIZIONI
  weatherConditions: {
    temperature: 15,
    rainMm: 0,
    soilMoisture: "optimal" // In tempera
  },
  
  // NOTE
  notes: "Terreno in ottime condizioni, rimosso molte erbacce",
  completed: true
}
```

### **TIPI DI LAVORAZIONI TRACCIABILI:**

**Lavorazioni Suolo:**
- ✅ Aratura (Plowing)
- ✅ Ripuntatura (Subsoiling)
- ✅ Erpicatura (Harrowing)
- ✅ Fresatura (Tilling)
- ✅ Rullatura (Rolling)
- ✅ Sarchiatura (Hoeing)
- ✅ Rincalzatura (EarthingUp)
- ✅ Pacciamatura (Mulching)
- ✅ Vangatura (Digging)
- ✅ Livellamento (Leveling)

**Potature:**
- ✅ Potatura Formazione
- ✅ Potatura Mantenimento
- ✅ Potatura Ringiovanimento
- ✅ Potatura Verde (estiva)
- ✅ Potatura Invernale

**Altre Operazioni:**
- ✅ Diradamento
- ✅ Scacchiatura
- ✅ Defogliazione
- ✅ Legatura

---

## 2️⃣ TRATTAMENTI FITOSANITARI

### **COSA VIENE REGISTRATO:**

```typescript
// FORM COMPLETO TRATTAMENTI
{
  // IDENTIFICAZIONE
  id: "treatment-20260121-001",
  gardenId: "orto-mario-123",
  bedId: "bed-001",
  rowId: "row-003",
  
  // COLTURA
  cropName: "Pomodoro San Marzano",
  
  // PRODOTTO
  productName: "Nitrato di Calcio 15.5-0-0",
  activeIngredient: "Azoto 15.5%",
  dosage: 1.08,
  dosageUnit: "kg",
  areaTreated: 30, // m²
  
  // METODO E MOTIVO
  method: "fertigation", // Fertirrigazione
  reason: "nutrient", // Nutrizione
  
  // QUANDO
  treatmentDate: "2026-01-21",
  
  // CONDIZIONI METEO
  weatherConditions: {
    temperature: 18,
    windSpeed: 5,
    rain: false
  },
  
  // OPERATORE
  operatorName: "Mario Rossi",
  
  // NOTE
  notes: "Applicato via fertirrigazione mattutina"
}
```

### **TIPI DI TRATTAMENTI TRACCIABILI:**

- ✅ **Fertilizzazioni** (NPK, organici, microelementi)
- ✅ **Antiparassitari** (afidi, tripidi, cocciniglie)
- ✅ **Fungicidi** (peronospora, oidio, alternaria)
- ✅ **Erbicidi** (controllo infestanti)
- ✅ **Insetticidi** (lepidotteri, coleotteri)
- ✅ **Battericidi** (batteriosi)

---

## 3️⃣ IRRIGAZIONI

### **COSA VIENE REGISTRATO:**

```typescript
// FORM COMPLETO IRRIGAZIONI
{
  // IDENTIFICAZIONE
  id: "irrigation-20260121-001",
  gardenId: "orto-mario-123",
  zoneId: "zone-001",
  fieldRowId: "row-003",
  
  // SISTEMA
  systemType: "drip", // Goccia
  
  // VOLUMI
  volumeLiters: 150, // Litri erogati
  durationMinutes: 45,
  flowRateLph: 200, // Litri/ora
  
  // QUANDO
  date: "2026-01-21",
  time: "08:30",
  
  // FERTIRRIGAZIONE
  fertigation: {
    productName: "Nitrato di Calcio",
    quantity: 1.08,
    unit: "kg"
  },
  
  // CONDIZIONI
  soilMoistureBefore: 35, // %
  soilMoistureAfter: 65, // %
  weatherTemp: 18,
  
  // NOTE
  notes: "Irrigazione con fertirrigazione"
}
```

---

## 4️⃣ RACCOLTI

### **COSA VIENE REGISTRATO:**

```typescript
// FORM COMPLETO RACCOLTI
{
  // IDENTIFICAZIONE
  id: "harvest-20260121-001",
  gardenId: "orto-mario-123",
  bedId: "bed-001",
  rowId: "row-003",
  
  // COLTURA
  cropName: "Pomodoro San Marzano",
  variety: "San Marzano DOP",
  
  // QUANTITÀ
  quantityKg: 18.5,
  clusterCount: 24,
  
  // QUALITÀ
  quality: 4.5, // 1-5
  brixDegree: 6.2,
  defectPercentage: 5,
  
  // QUANDO
  harvestDate: "2026-01-21",
  harvestTime: "07:30",
  
  // OPERATORE
  operatorName: "Mario Rossi",
  
  // DESTINAZIONE
  destination: "vendita", // vendita/consumo/conservazione
  
  // NOTE
  notes: "Ottima qualità, pochi difetti"
}
```

---

## 5️⃣ DIARIO OPERATIVO INTELLIGENTE

### **CORRELAZIONI AUTOMATICHE:**

Il sistema **collega automaticamente** tutte le operazioni:

```typescript
// ESEMPIO CORRELAZIONE AUTOMATICA

OPERAZIONE 1: Fresatura terreno
├─ Data: 01/01/2026
├─ Area: 30m²
└─ Filare: Filare 3

OPERAZIONE 2: Trapianto pomodori
├─ Data: 15/01/2026
├─ Area: 30m²
├─ Filare: Filare 3
└─ CORRELATA A: Fresatura (15 giorni prima)

OPERAZIONE 3: Fertilizzazione
├─ Data: 21/01/2026
├─ Prodotto: Nitrato Calcio 1.08kg
├─ Filare: Filare 3
└─ CORRELATA A: Trapianto (6 giorni dopo)

OPERAZIONE 4: Irrigazione
├─ Data: 21/01/2026
├─ Volume: 150L
├─ Filare: Filare 3
└─ CORRELATA A: Fertilizzazione (stesso giorno)

OPERAZIONE 5: Raccolta
├─ Data: 15/03/2026
├─ Quantità: 18.5kg
├─ Qualità: 4.5/5
├─ Filare: Filare 3
└─ CORRELATA A: Tutte le operazioni precedenti
```

### **ANALYTICS AUTOMATICHE:**

```typescript
// ANALYTICS GENERATE AUTOMATICAMENTE

{
  // STATISTICHE GENERALI
  totalEntries: 48,
  operationsCount: 32,
  resultsCount: 12,
  issuesCount: 4,
  
  // PERFORMANCE
  averageEfficiency: 85, // %
  totalROI: 245, // %
  
  // TOP OPERAZIONI
  topPerformingOperations: [
    {
      title: "Fertilizzazione Nitrato Calcio",
      effectiveness: 92,
      roi: 180
    },
    {
      title: "Irrigazione Goccia Mattutina",
      effectiveness: 88,
      roi: 150
    }
  ],
  
  // TREND RECENTI
  recentTrends: {
    efficiency: +5, // In aumento
    effectiveness: +8, // In aumento
    issues: -2 // In diminuzione
  },
  
  // CORRELAZIONI
  correlations: {
    // Operazione → Risultato
    operationToResult: [
      {
        operation: "fertilization_Pomodoro",
        avgTimeToResult: 45, // giorni
        successRate: 85, // %
        avgROI: 180 // %
      }
    ],
    
    // Impatto Meteo
    weatherImpact: [
      {
        condition: "sunny",
        avgEfficiency: 90,
        issueRate: 5
      },
      {
        condition: "rainy",
        avgEfficiency: 70,
        issueRate: 15
      }
    ],
    
    // Pattern Stagionali
    seasonalPatterns: [
      {
        month: "Gen",
        bestOperations: ["Fresatura", "Vangatura"],
        commonIssues: ["Terreno troppo bagnato"]
      },
      {
        month: "Mar",
        bestOperations: ["Trapianto", "Semina"],
        commonIssues: ["Gelate tardive"]
      }
    ]
  }
}
```

---

## 🔍 COME INTERROGARE I DATI

### **1. QUERY PER FILARE SPECIFICO**

```typescript
// Ottieni TUTTE le operazioni su un filare
const operations = await getOperationsByRow("row-003")

RISULTATO:
[
  {
    date: "01/01/2026",
    type: "mechanical_work",
    operation: "Fresatura",
    depth: 20,
    cost: 50
  },
  {
    date: "15/01/2026",
    type: "planting",
    crop: "Pomodoro San Marzano",
    quantity: 30
  },
  {
    date: "21/01/2026",
    type: "fertilization",
    product: "Nitrato Calcio",
    dosage: "1.08kg"
  },
  {
    date: "21/01/2026",
    type: "irrigation",
    volume: "150L",
    duration: "45min"
  },
  {
    date: "15/03/2026",
    type: "harvest",
    quantity: "18.5kg",
    quality: 4.5
  }
]
```

### **2. QUERY PER COLTURA**

```typescript
// Ottieni storico completo di una coltura
const history = await getCropHistory("Pomodoro San Marzano")

RISULTATO:
{
  crop: "Pomodoro San Marzano",
  totalCycles: 3, // Cicli coltivati
  
  // LAVORAZIONI
  mechanicalWorks: [
    { type: "Fresatura", frequency: 3, avgCost: 50 },
    { type: "Vangatura", frequency: 2, avgCost: 30 }
  ],
  
  // TRATTAMENTI
  treatments: [
    { product: "Nitrato Calcio", frequency: 6, avgDosage: "1kg" },
    { product: "Rame", frequency: 4, avgDosage: "200g" }
  ],
  
  // IRRIGAZIONI
  irrigations: {
    totalVolume: 4500, // Litri totali
    avgPerCycle: 1500,
    frequency: "ogni 3 giorni"
  },
  
  // RACCOLTI
  harvests: {
    totalKg: 55.5,
    avgPerCycle: 18.5,
    avgQuality: 4.3,
    bestMonth: "Marzo"
  },
  
  // PROBLEMI COMUNI
  commonIssues: [
    { issue: "Peronospora", frequency: 2, solution: "Rame preventivo" },
    { issue: "Afidi", frequency: 1, solution: "Sapone molle" }
  ],
  
  // COSTI E ROI
  economics: {
    totalCost: 245, // €
    totalRevenue: 665, // €
    roi: 171 // %
  }
}
```

### **3. QUERY PER PERIODO**

```typescript
// Ottieni tutte le operazioni in un periodo
const operations = await getOperationsByPeriod({
  startDate: "2026-01-01",
  endDate: "2026-03-31"
})

RISULTATO:
{
  period: "Q1 2026",
  
  // RIEPILOGO
  summary: {
    mechanicalWorks: 12,
    treatments: 18,
    irrigations: 45,
    harvests: 8
  },
  
  // COSTI
  costs: {
    mechanical: 450,
    treatments: 280,
    irrigation: 120,
    labor: 800,
    total: 1650
  },
  
  // RICAVI
  revenue: {
    sales: 2850,
    consumption: 450,
    total: 3300
  },
  
  // ROI
  roi: 100 // % (3300-1650)/1650
}
```

### **4. QUERY COMPARATIVA**

```typescript
// Confronta due cicli colturali
const comparison = await compareCycles({
  cycle1: "2025-Q1",
  cycle2: "2026-Q1",
  crop: "Pomodoro"
})

RISULTATO:
{
  crop: "Pomodoro",
  
  // CICLO 2025
  cycle1: {
    yield: 15.2, // kg
    quality: 3.8,
    cost: 280,
    roi: 145
  },
  
  // CICLO 2026
  cycle2: {
    yield: 18.5, // kg (+21%)
    quality: 4.5, // (+18%)
    cost: 245, // (-12%)
    roi: 171 // (+18%)
  },
  
  // DIFFERENZE
  improvements: [
    "Resa aumentata del 21% grazie a migliore fertilizzazione",
    "Qualità migliorata del 18% con irrigazione più precisa",
    "Costi ridotti del 12% ottimizzando lavorazioni"
  ],
  
  // COSA È CAMBIATO
  changes: [
    {
      aspect: "Fertilizzazione",
      before: "NPK generico 3 volte",
      after: "Nitrato Calcio mirato 6 volte",
      impact: "+15% resa"
    },
    {
      aspect: "Irrigazione",
      before: "Manuale irregolare",
      after: "Goccia programmata",
      impact: "+10% qualità"
    }
  ]
}
```

---

## 📈 ANALISI PER COLTURE SUCCESSIVE

### **COSA IMPARA IL SISTEMA:**

```typescript
// SUGGERIMENTI AUTOMATICI PER PROSSIMA COLTURA

{
  crop: "Pomodoro San Marzano",
  nextCycle: "2026-Q2",
  
  // SUGGERIMENTI BASATI SU DATI STORICI
  recommendations: [
    {
      category: "Lavorazioni",
      suggestion: "Fresatura a 20cm profondità",
      reason: "Nei cicli precedenti ha dato +15% resa",
      confidence: 92
    },
    {
      category: "Fertilizzazione",
      suggestion: "Nitrato Calcio 1kg ogni 15 giorni",
      reason: "Ha ridotto marciume apicale del 80%",
      confidence: 88
    },
    {
      category: "Irrigazione",
      suggestion: "150L ogni 3 giorni ore 8:00",
      reason: "Ha mantenuto umidità ottimale 65%",
      confidence: 85
    },
    {
      category: "Timing",
      suggestion: "Trapianto 15 Marzo",
      reason: "Raccolto migliore (4.5/5) in cicli precedenti",
      confidence: 90
    },
    {
      category: "Prevenzione",
      suggestion: "Rame preventivo ogni 10 giorni",
      reason: "Ha prevenuto peronospora in 2/3 cicli",
      confidence: 75
    }
  ],
  
  // COSA EVITARE
  warnings: [
    {
      issue: "Non irrigare nelle ore calde",
      reason: "Ha causato stress idrico in ciclo 2025-Q2",
      impact: "-10% qualità"
    },
    {
      issue: "Non fertilizzare con terreno asciutto",
      reason: "Ha bruciato radici in ciclo 2025-Q3",
      impact: "-20% resa"
    }
  ],
  
  // PREVISIONI
  predictions: {
    expectedYield: "19-21 kg",
    expectedQuality: "4.3-4.7",
    expectedCost: "240-260 €",
    expectedROI: "165-185 %",
    confidence: 82
  }
}
```

---

## 📊 EXPORT E REPORT

### **FORMATI DISPONIBILI:**

```typescript
// 1. EXPORT JSON (completo)
const jsonExport = await exportData({
  gardenId: "orto-mario-123",
  format: "json",
  period: "2026-Q1"
})

// 2. EXPORT CSV (per Excel)
const csvExport = await exportData({
  gardenId: "orto-mario-123",
  format: "csv",
  period: "2026-Q1"
})

// 3. EXPORT PDF (per certificazioni)
const pdfExport = await exportData({
  gardenId: "orto-mario-123",
  format: "pdf",
  period: "2026-Q1",
  includePhotos: true
})
```

### **REPORT DISPONIBILI:**

1. **Report Operativo** - Tutte le operazioni del periodo
2. **Report Economico** - Costi, ricavi, ROI
3. **Report Qualità** - Rese, qualità, problemi
4. **Report Certificazioni** - Conformità biologica
5. **Report Comparativo** - Confronto tra cicli
6. **Report Predittivo** - Previsioni prossimo ciclo

---

## ✅ RIEPILOGO FINALE

### **COSA VIENE TRACCIATO:**

1. ✅ **Lavorazioni** - Tipo, attrezzatura, area, profondità, costo, operatore, meteo
2. ✅ **Trattamenti** - Prodotto, dosaggio, metodo, motivo, meteo, operatore
3. ✅ **Irrigazioni** - Volume, durata, sistema, fertirrigazione, umidità
4. ✅ **Raccolti** - Quantità, qualità, brix, difetti, destinazione
5. ✅ **Diario** - Correlazioni, analytics, trend, suggerimenti AI

### **COME INTERROGARE:**

1. ✅ **Per Filare** - Storico completo operazioni su filare specifico
2. ✅ **Per Coltura** - Storico completo di una coltura (tutti i cicli)
3. ✅ **Per Periodo** - Tutte le operazioni in un periodo
4. ✅ **Comparativo** - Confronto tra cicli colturali
5. ✅ **Predittivo** - Suggerimenti per prossima coltura

### **BENEFICI:**

- 📊 **Tracciabilità Totale** - Ogni operazione registrata
- 🔍 **Analisi Profonda** - Correlazioni e trend automatici
- 💡 **Suggerimenti AI** - Basati su dati storici
- 📈 **Miglioramento Continuo** - Impara da ogni ciclo
- 💰 **Ottimizzazione Costi** - Identifica sprechi
- ✅ **Conformità** - Export per certificazioni

---

**CONCLUSIONE**: Il sistema registra TUTTO e permette di analizzare i dati per migliorare continuamente le colture successive, ottimizzare costi e massimizzare rese e qualità!
