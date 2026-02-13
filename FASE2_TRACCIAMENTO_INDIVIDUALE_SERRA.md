# 🌱 FASE 2: Tracciamento Individuale Piante in Serra

**Data:** 13 Febbraio 2026  
**Obiettivo:** Estendere il sistema di tracciamento individuale piante anche alla serra

---

## 🎯 OBIETTIVO

Permettere il tracciamento pianta-per-pianta in serra con:
- Posizione specifica (bancale, fila, posizione)
- Operazioni individuali (irrigazione, fertilizzazione, trattamenti)
- Parametri ambientali serra (temperatura, umidità, CO2)
- Raccolti per singola pianta
- Analytics e correlazioni

---

## ✅ SISTEMA ESISTENTE

### 1. Tracciamento Individuale (GardenPlant)

**Già implementato per campo aperto:**
```typescript
interface GardenPlant {
  id: string
  gardenId: string
  
  // Posizione
  gardenRowId?: string      // garden_rows (aiuole)
  fieldRowId?: string       // field_rows (campo aperto)
  positionInRow: number     // 1, 2, 3, 4...
  plantCode: string         // "F1-P001", "F2-P015"
  
  // Pianta
  plantName: string
  variety?: string
  plantingDate?: string
  expectedHarvestDate?: string
  
  // Stato
  status: 'healthy' | 'diseased' | 'dead' | 'harvested' | 'transplanted'
  healthScore: number       // 0-100
  
  // Tracciabilità
  seedlingBatchId?: string
  saplingBatchId?: string
  seedPacketId?: string
  
  // Contesto impianto (meteo, luna)
  plantingContext?: {...}
  
  // Media
  photos: string[]
  notes?: string
}
```

**✅ Punti di forza:**
- Sistema completo per campo aperto
- Tracciabilità origine (semi, vivaio)
- Contesto ambientale al momento impianto
- Collegamento a filari

**❌ Limitazioni per serra:**
- ❌ NO supporto bancali serra
- ❌ NO parametri ambientali serra (temp, umidità, CO2)
- ❌ NO tracciamento posizione 3D (bancale, livello, posizione)
- ❌ NO collegamento a GreenhouseConfig

---

### 2. Operazioni Individuali (PlantOperation)

**Già implementato:**
```typescript
interface PlantOperation {
  id: string
  plantId: string
  gardenId: string
  
  // Tipo operazione
  operationType: 'watering' | 'fertilizing' | 'treatment' | 'pruning' | 
                 'harvest' | 'transplanting' | 'thinning' | 'staking' | 
                 'mulching' | 'work' | 'health'
  
  // Dettagli
  date: string
  operationTime?: string
  quantity?: number
  unit?: string
  productName?: string
  
  // Risultati
  effectivenessScore?: number
  plantResponse?: 'positive' | 'negative' | 'neutral'
  
  // Contesto ambientale
  context?: {...}
  
  photos: string[]
  notes?: string
}
```

**✅ Punti di forza:**
- Operazioni complete per singola pianta
- Tracciamento efficacia
- Contesto ambientale

**❌ Limitazioni per serra:**
- ❌ NO parametri serra specifici (temp interna, umidità, CO2)
- ❌ NO tracciamento ventilazione/riscaldamento attivi
- ❌ NO correlazione parametri serra → risultato operazione

---

### 3. Raccolti Individuali (PlantHarvest)

**Già implementato:**
```typescript
interface PlantHarvest {
  id: string
  plantId: string
  gardenId: string
  
  harvestDate: string
  quantityKg: number
  qualityGrade?: 'excellent' | 'good' | 'fair' | 'poor'
  qualityScore?: number
  
  sizeCategory?: 'large' | 'medium' | 'small'
  ripenessLevel?: 'unripe' | 'perfect' | 'overripe'
  
  destination?: 'consumption' | 'storage' | 'processing' | 'sale' | 'seed'
  marketValue?: number
  
  photos: string[]
  notes?: string
}
```

**✅ Punti di forza:**
- Tracciamento completo raccolto per pianta
- Qualità e destinazione

**❌ Limitazioni per serra:**
- ❌ NO parametri serra al momento raccolto
- ❌ NO correlazione parametri → qualità
- ❌ NO tracciamento condizioni serra (ventilazione, riscaldamento)

---

## 🏗️ STRUTTURA SERRA

### Organizzazione Tipica Serra

```
SERRA
├── Bancale 1 (Nord)
│   ├── Fila 1
│   │   ├── Pianta 1
│   │   ├── Pianta 2
│   │   └── Pianta 3
│   └── Fila 2
│       ├── Pianta 1
│       └── Pianta 2
├── Bancale 2 (Centro)
│   └── Fila 1
│       ├── Pianta 1
│       └── Pianta 2
└── Bancale 3 (Sud)
    └── Fila 1
        └── Pianta 1
```

### Differenze vs Campo Aperto

| Aspetto | Campo Aperto | Serra |
|---------|--------------|-------|
| Struttura | File a terra | Bancali rialzati |
| Livelli | 1 (terra) | Multipli (bancali a diverse altezze) |
| Ambiente | Esterno | Controllato |
| Parametri | Meteo esterno | Temp/umidità/CO2 interni |
| Irrigazione | Pioggia + manuale | Solo manuale/automatica |
| Posizione | 2D (x, y) | 3D (bancale, fila, posizione) |

---

## 🔧 ESTENSIONI NECESSARIE

### 1. Nuovo Tipo: GreenhouseBench (Bancale Serra)

```typescript
interface GreenhouseBench {
  id: string
  gardenId: string
  greenhouseId?: string  // Se serra multipla
  
  // Identificazione
  benchNumber: number    // 1, 2, 3...
  name: string          // "Bancale Nord", "Bancale 1"
  
  // Dimensioni
  lengthCm: number
  widthCm: number
  heightCm: number      // Altezza da terra
  
  // Capacità
  rowCount: number      // Numero file sul bancale
  plantsPerRow: number
  totalCapacity: number // rowCount * plantsPerRow
  
  // Materiale
  material?: 'wood' | 'metal' | 'plastic'
  hasDrainage: boolean
  
  // Posizione in serra
  position?: 'north' | 'center' | 'south' | 'east' | 'west'
  level?: number        // Per serre con bancali a più livelli
  
  // Substrato
  substrateType?: 'soil' | 'coco' | 'perlite' | 'rockwool' | 'mixed'
  substrateDepthCm?: number
  
  // Irrigazione
  hasIrrigation?: boolean
  irrigationType?: 'drip' | 'subirrigation' | 'manual'
  
  // Stato
  isActive: boolean
  notes?: string
  
  createdAt: string
  updatedAt: string
}
```

### 2. Estendere GardenPlant per Serra

```typescript
interface GardenPlant {
  // ... campi esistenti
  
  // NUOVO: Posizione serra
  greenhouseBenchId?: string    // Collegamento a bancale serra
  benchRowNumber?: number       // Fila sul bancale (1, 2, 3...)
  positionInBenchRow?: number   // Posizione nella fila del bancale
  
  // NUOVO: Parametri ambientali serra (snapshot al momento impianto)
  greenhouseConditions?: {
    internalTemperature: number    // °C
    internalHumidity: number       // %
    co2Level?: number              // ppm
    lightIntensity?: number        // lux
    ventilationActive: boolean
    heatingActive: boolean
    shadingActive: boolean
  }
}
```

### 3. Nuovo Tipo: GreenhouseReading (Letture Parametri)

```typescript
interface GreenhouseReading {
  id: string
  gardenId: string
  greenhouseId?: string
  
  // Timestamp
  readingDate: string
  readingTime: string
  
  // Parametri ambientali
  internalTemperature: number    // °C
  externalTemperature?: number   // °C (per confronto)
  internalHumidity: number       // %
  externalHumidity?: number      // %
  co2Level?: number              // ppm
  lightIntensity?: number        // lux
  
  // Sistemi attivi
  ventilationActive: boolean
  heatingActive: boolean
  shadingActive: boolean
  
  // Posizione lettura (se sensori multipli)
  benchId?: string
  position?: 'north' | 'center' | 'south'
  
  // Note
  notes?: string
  
  createdAt: string
}
```

### 4. Estendere PlantOperation per Serra

```typescript
interface PlantOperation {
  // ... campi esistenti
  
  // NUOVO: Parametri serra al momento operazione
  greenhouseConditions?: {
    internalTemperature: number
    internalHumidity: number
    co2Level?: number
    lightIntensity?: number
    ventilationActive: boolean
    heatingActive: boolean
    shadingActive: boolean
    
    // Differenziale esterno/interno
    temperatureDelta?: number  // Interno - Esterno
    humidityDelta?: number     // Interno - Esterno
  }
}
```

### 5. Estendere PlantHarvest per Serra

```typescript
interface PlantHarvest {
  // ... campi esistenti
  
  // NUOVO: Parametri serra al momento raccolto
  greenhouseConditions?: {
    internalTemperature: number
    internalHumidity: number
    co2Level?: number
    
    // Storico parametri durante crescita
    avgTemperature?: number
    avgHumidity?: number
    avgCo2?: number
    
    // Giorni con condizioni ottimali
    daysOptimalTemp?: number
    daysOptimalHumidity?: number
    daysOptimalCo2?: number
  }
}
```

---

## 📊 ANALYTICS SERRA

### 1. Correlazioni Parametri → Resa/Qualità

```typescript
interface GreenhouseAnalytics {
  gardenId: string
  period: { from: string; to: string }
  
  // Range ottimali identificati
  optimalRanges: {
    temperature: { min: number; max: number; avg: number }
    humidity: { min: number; max: number; avg: number }
    co2: { min: number; max: number; avg: number }
  }
  
  // Correlazioni
  correlations: {
    temp_vs_yield: number        // -1 to 1
    temp_vs_quality: number
    humidity_vs_yield: number
    humidity_vs_quality: number
    co2_vs_yield: number
    co2_vs_quality: number
    light_vs_yield: number
  }
  
  // Performance per bancale
  benchPerformance: Array<{
    benchId: string
    benchName: string
    avgYieldPerPlant: number
    avgQuality: number
    avgHealthScore: number
    totalPlants: number
  }>
  
  // Suggerimenti
  recommendations: Array<{
    type: 'temperature' | 'humidity' | 'co2' | 'ventilation' | 'heating'
    priority: 'high' | 'medium' | 'low'
    message: string
    expectedImprovement: string
  }>
}
```

### 2. Confronto Bancali

```typescript
interface BenchComparison {
  gardenId: string
  benches: Array<{
    benchId: string
    benchName: string
    position: string
    
    // Condizioni medie
    avgTemperature: number
    avgHumidity: number
    avgCo2: number
    avgLight: number
    
    // Performance
    totalPlants: number
    avgYieldPerPlant: number
    avgQuality: number
    avgHealthScore: number
    
    // Ranking
    yieldRank: number      // 1 = migliore
    qualityRank: number
    healthRank: number
  }>
  
  // Identificazione problemi
  issues: Array<{
    benchId: string
    issue: string
    severity: 'high' | 'medium' | 'low'
    suggestion: string
  }>
}
```

---

## 🎯 PIANO IMPLEMENTAZIONE

### FASE 2A: Struttura Bancali (2-3 giorni)

**Task 2A.1**: Creare tipo GreenhouseBench
- Definire interfaccia completa
- Aggiungere a types.ts

**Task 2A.2**: Storage Provider
- Aggiungere metodi CRUD per bancali
- Creare tabella `greenhouse_benches`
- Migrazione database

**Task 2A.3**: UI Gestione Bancali
- Form creazione bancale
- Lista bancali
- Modifica/eliminazione

### FASE 2B: Tracciamento Parametri (2-3 giorni)

**Task 2B.1**: Creare tipo GreenhouseReading
- Definire interfaccia completa
- Aggiungere a types.ts

**Task 2B.2**: Storage Provider
- Aggiungere metodi per letture
- Creare tabella `greenhouse_readings`
- Migrazione database

**Task 2B.3**: Form Registrazione Letture
- Form semplice per registrare parametri
- Auto-popolamento ultima lettura
- Validazione range

**Task 2B.4**: Dashboard Parametri
- Grafici temperatura/umidità/CO2
- Storico letture
- Alert fuori range

### FASE 2C: Estendere Tracciamento Piante (3-4 giorni)

**Task 2C.1**: Estendere GardenPlant
- Aggiungere campi serra (benchId, greenhouseConditions)
- Aggiornare storage provider
- Migrazione database

**Task 2C.2**: Estendere PlantOperation
- Aggiungere greenhouseConditions
- Auto-popolamento da ultima lettura
- Aggiornare storage provider

**Task 2C.3**: Estendere PlantHarvest
- Aggiungere greenhouseConditions
- Calcolare medie parametri durante crescita
- Aggiornare storage provider

**Task 2C.4**: UI Piante Serra
- Selezione bancale/fila/posizione
- Visualizzazione parametri
- Heatmap bancali

### FASE 2D: Analytics Serra (2-3 giorni)

**Task 2D.1**: Servizio GreenhouseAnalyticsService
- Calcolo correlazioni parametri → resa/qualità
- Identificazione range ottimali
- Confronto performance bancali

**Task 2D.2**: Dashboard Analytics
- Grafici correlazioni
- Confronto bancali
- Suggerimenti ottimizzazione

**Task 2D.3**: Integrazione con GreenhouseDirector
- Alert basati su analytics
- Suggerimenti personalizzati
- Predizioni resa

---

## 📋 PRIORITÀ

### CRITICAL (Fase 2A + 2B)
- Struttura bancali
- Tracciamento parametri base
- Form registrazione letture

**Perché**: Fondamentale per iniziare a tracciare piante in serra

### HIGH (Fase 2C)
- Estendere tracciamento piante
- Collegamento bancali → piante
- Parametri al momento operazioni/raccolti

**Perché**: Permette tracciamento completo pianta-per-pianta

### MEDIUM (Fase 2D)
- Analytics correlazioni
- Confronto bancali
- Suggerimenti ottimizzazione

**Perché**: Ottimizzazione basata su dati, ma non blocca uso base

---

## 🔗 FILE DA CREARE/MODIFICARE

### Nuovi File
1. `types/greenhouseBench.ts` - Tipo bancale serra
2. `types/greenhouseReading.ts` - Tipo letture parametri
3. `services/greenhouseAnalyticsService.ts` - Analytics serra
4. `components/greenhouse/BenchManager.tsx` - Gestione bancali
5. `components/greenhouse/ReadingForm.tsx` - Form letture
6. `components/greenhouse/ParametersDashboard.tsx` - Dashboard parametri
7. `components/greenhouse/BenchHeatmap.tsx` - Heatmap bancali

### File da Modificare
1. `types/individualPlant.ts` - Estendere GardenPlant, PlantOperation, PlantHarvest
2. `types.ts` - Export nuovi tipi
3. `packages/core/storage/interface.ts` - Aggiungere metodi bancali/letture
4. `packages/storage-cloud/SupabaseStorageProvider.ts` - Implementare metodi
5. `logic/greenhouseDirector.ts` - Integrare analytics
6. `components/plants/SmartPlantManager.tsx` - Supporto bancali serra

---

## ⏱️ EFFORT STIMATO

- Fase 2A: 2-3 giorni
- Fase 2B: 2-3 giorni
- Fase 2C: 3-4 giorni
- Fase 2D: 2-3 giorni

**TOTALE: 9-13 giorni**

---

## ✅ RISULTATO ATTESO

Dopo Fase 2, la serra avrà:
- ✅ Tracciamento pianta-per-pianta su bancali
- ✅ Registrazione parametri ambientali (temp, umidità, CO2)
- ✅ Operazioni individuali con contesto serra
- ✅ Raccolti per pianta con parametri
- ✅ Analytics correlazioni parametri → resa/qualità
- ✅ Confronto performance bancali
- ✅ Suggerimenti ottimizzazione basati su dati

**Stesso livello di tracciamento di idroponica, ma per serra!**
