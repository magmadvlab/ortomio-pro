# Design - Sistema Predittivo Orchestrato

**Feature:** Sistema Predittivo e Adattivo per Agricoltura di Precisione  
**Data:** 20 Gennaio 2026  
**Versione:** 1.0.0  
**Status:** Design Phase

---

## 📋 INDICE

1. [Architettura di Sistema](#architettura-di-sistema)
2. [Componenti Principali](#componenti-principali)
3. [Schema Database](#schema-database)
4. [API Design](#api-design)
5. [Flussi di Dati](#flussi-di-dati)
6. [Algoritmi e Modelli](#algoritmi-e-modelli)
7. [Interfacce Utente](#interfacce-utente)
8. [Sicurezza e Performance](#sicurezza-e-performance)
9. [Testing Strategy](#testing-strategy)
10. [Deployment](#deployment)

---

## 🏗️ ARCHITETTURA DI SISTEMA

### Panoramica Architetturale

Il sistema si basa su un'architettura a 7 layer che estende i servizi esistenti:

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                       │
│  Dashboard │ Mobile UI │ Notifications │ Reports │ Analytics   │
└─────────────────────────────────────────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────┐
│                      ORCHESTRATION LAYER                        │
│                      DirectorService ★NEW★                      │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐ │
│  │   Priority   │   Conflict   │    Action    │   Feedback   │ │
│  │   Manager    │   Resolver   │  Sequencer   │     Loop     │ │
│  └──────────────┴──────────────┴──────────────┴──────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────┐
│                     RECOMMENDATION LAYER                        │
│  ActionRecommendation │ TimingOptimization │ ResourceOptimization│
└─────────────────────────────────────────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────┐
│                       PREDICTION LAYER                          │
│  YieldPrediction │ QualityPrediction │ DiseasePrediction        │
└─────────────────────────────────────────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────┐
│                    ANALYSIS & CORRELATION LAYER                 │
│  CorrelationEngine │ CausalAnalysis │ PatternRecognition        │
└─────────────────────────────────────────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────┐
│                      DATA COLLECTION LAYER                      │
│  Weather │ Diary │ Health │ Irrigation │ Nutrition │ NDVI       │
│  Soil ★NEW★ │ Growth ★NEW★ │ Quality ★NEW★                     │
└─────────────────────────────────────────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────┐
│                       DATA STORAGE LAYER                        │
│  PostgreSQL (Supabase) │ Time-Series Data │ Historical Archive  │
└─────────────────────────────────────────────────────────────────┘
```

### Principi Architetturali

1. **Separation of Concerns**: Ogni layer ha responsabilità ben definite
2. **Extensibility**: Facile aggiungere nuovi servizi/sensori
3. **Resilience**: Graceful degradation se servizi non disponibili
4. **Performance**: Caching intelligente e query ottimizzate
5. **Testability**: Ogni componente testabile indipendentemente

---

## 🔧 COMPONENTI PRINCIPALI

### 1. DirectorService (Orchestratore Centrale) ★NEW★

**Responsabilità:**
- Coordinamento centrale di tutti i servizi
- Gestione priorità azioni
- Risoluzione conflitti tra raccomandazioni
- Sequenziamento ottimale azioni
- Feedback loop per apprendimento

**File:** `services/directorService.ts`

**Interfaccia Principale:**
```typescript
interface DirectorService {
  // Coordinamento
  coordinateServices(userId: string, gardenId: string): Promise<CoordinationResult>
  
  // Prioritizzazione
  prioritizeActions(actions: Action[]): Promise<PrioritizedAction[]>
  
  // Risoluzione conflitti
  resolveConflicts(recommendations: Recommendation[]): Promise<Recommendation[]>
  
  // Sequenziamento
  sequenceActions(actions: Action[]): Promise<ActionSequence>
  
  // Feedback
  recordActionOutcome(actionId: string, outcome: ActionOutcome): Promise<void>
}
```

**Algoritmo Prioritizzazione:**
```typescript
function calculatePriority(action: Action): number {
  const urgency = calculateUrgency(action)      // 0-40 punti
  const impact = calculateImpact(action)        // 0-30 punti
  const feasibility = calculateFeasibility(action) // 0-20 punti
  const cost = calculateCost(action)            // 0-10 punti (inverso)
  
  return urgency + impact + feasibility + cost  // 0-100
}

function calculateUrgency(action: Action): number {
  // Fattori:
  // - Tempo rimanente prima che sia troppo tardi
  // - Severità problema (se reattivo)
  // - Finestra temporale ottimale
  
  if (action.type === 'critical_alert') return 40
  if (action.deadline && isWithin24Hours(action.deadline)) return 35
  if (action.deadline && isWithin3Days(action.deadline)) return 25
  if (action.type === 'preventive') return 15
  return 10
}

function calculateImpact(action: Action): number {
  // Fattori:
  // - Impatto su resa (kg)
  // - Impatto su qualità (%)
  // - Impatto su salute piante
  // - Numero piante/zone affette
  
  const yieldImpact = action.estimatedYieldImpact || 0  // kg
  const qualityImpact = action.estimatedQualityImpact || 0 // %
  const plantsAffected = action.plantsAffected || 1
  
  return Math.min(30, 
    (yieldImpact * 2) + 
    (qualityImpact * 0.5) + 
    (Math.log10(plantsAffected) * 5)
  )
}
```

### 2. SoilMonitoringService ★NEW★

**Responsabilità:**
- Tracking parametri terreno (chimici, fisici, biologici)
- Integrazione sensori automatici
- Validazione e normalizzazione dati
- Alert per valori critici

**File:** `services/soilMonitoringService.ts`

**Parametri Tracciati:**
```typescript
interface SoilMeasurement {
  id: string
  user_id: string
  garden_id: string
  zone_id?: string
  measurement_date: string
  
  // Chimici
  ph?: number                    // 0-14
  ec?: number                    // mS/cm
  nitrogen_ppm?: number          // ppm
  phosphorus_ppm?: number        // ppm
  potassium_ppm?: number         // ppm
  organic_matter_percent?: number // %
  cec?: number                   // meq/100g
  
  // Fisici
  sand_percent?: number          // %
  silt_percent?: number          // %
  clay_percent?: number          // %
  bulk_density?: number          // g/cm³
  porosity_percent?: number      // %
  water_holding_capacity?: number // mm
  
  // Biologici
  soil_respiration?: number      // mg CO2/m²/h
  microbial_biomass?: number     // µg C/g
  enzyme_activity?: number       // arbitrary units
  
  // Ambientali
  temp_5cm?: number              // °C
  temp_10cm?: number             // °C
  temp_20cm?: number             // °C
  moisture_5cm?: number          // %
  moisture_10cm?: number         // %
  moisture_20cm?: number         // %
  
  // Metadati
  measurement_method: 'manual' | 'sensor' | 'lab'
  notes?: string
}
```

### 3. GrowthTrackingService ★NEW★

**Responsabilità:**
- Misure morfologiche piante
- Calcolo indici vegetativi
- Tracking sviluppo radicale
- Confronto con curve attese

**File:** `services/growthTrackingService.ts`

**Parametri Tracciati:**
```typescript
interface GrowthMeasurement {
  id: string
  user_id: string
  cultivation_id: string
  plant_id?: string              // Se pianta individuale
  measurement_date: string
  
  // Morfologici
  height_cm?: number
  stem_diameter_mm?: number
  leaf_count?: number
  leaf_area_cm2?: number
  internode_count?: number
  internode_length_mm?: number
  
  // Indici
  lai?: number                   // Leaf Area Index
  ndvi?: number                  // Da satellite/drone
  fresh_biomass_g?: number
  dry_biomass_g?: number
  relative_growth_rate?: number  // % per giorno
  
  // Radicale (se misurabile)
  root_depth_cm?: number
  root_density?: number          // arbitrary scale
  root_biomass_g?: number
  
  // Fenologia
  phenological_stage?: string
  flowers_count?: number
  fruits_count?: number
  
  // Metadati
  measurement_method: 'manual' | 'image_analysis' | 'sensor'
  photos?: string[]
  notes?: string
}
```

### 4. QualityTrackingService ★NEW★

**Responsabilità:**
- Misure parametri qualità prodotti
- Integrazione strumenti misura (rifrattometro, colorimetro)
- Tracking shelf life
- Correlazione qualità con pratiche agronomiche

**File:** `services/qualityTrackingService.ts`

**Parametri Tracciati:**
```typescript
interface QualityMeasurement {
  id: string
  user_id: string
  cultivation_id: string
  harvest_id?: string
  measurement_date: string
  sample_size: number
  
  // Chimici
  brix?: number                  // °Brix
  titratable_acidity?: number    // g/L
  sugar_acid_ratio?: number
  ph?: number
  vitamin_c_mg?: number          // mg/100g
  lycopene_mg?: number           // mg/kg
  anthocyanins_mg?: number       // mg/kg
  
  // Fisici
  color_l?: number               // L*a*b* color space
  color_a?: number
  color_b?: number
  firmness?: number              // kg/cm²
  specific_gravity?: number
  skin_thickness_mm?: number
  
  // Organolettici (scala 1-10)
  taste_score?: number
  aroma_intensity?: number
  crunchiness?: number
  juiciness?: number
  
  // Shelf life
  storage_days?: number
  weight_loss_percent?: number
  quality_degradation?: number   // 0-100%
  
  // Metadati
  measurement_method: 'manual' | 'instrument' | 'sensory_panel'
  instrument_type?: string
  notes?: string
}
```

### 5. CorrelationEngine (Potenziato)

**Responsabilità:**
- Calcolo correlazioni multi-fattore
- Analisi causale (non solo correlazione)
- Identificazione pattern complessi
- Calcolo significatività statistica

**File:** `services/correlationEngine.ts`

**Algoritmi Implementati:**
```typescript
interface CorrelationEngine {
  // Correlazioni semplici
  calculatePearson(x: number[], y: number[]): CorrelationResult
  calculateSpearman(x: number[], y: number[]): CorrelationResult
  
  // Correlazioni multi-fattore
  calculateMultipleRegression(
    dependent: number[],
    independents: Record<string, number[]>
  ): RegressionResult
  
  // Analisi causale
  performGrangerCausality(
    cause: number[],
    effect: number[],
    maxLag: number
  ): CausalityResult
  
  // Pattern recognition
  identifyPatterns(
    data: TimeSeriesData[],
    minSupport: number
  ): Pattern[]
}

interface CorrelationResult {
  coefficient: number      // -1 to 1
  pValue: number          // Significatività
  confidence: number      // 0-1
  sampleSize: number
  interpretation: string  // "strong positive", "weak negative", etc.
}

interface RegressionResult {
  coefficients: Record<string, number>
  rSquared: number        // 0-1
  adjustedRSquared: number
  pValues: Record<string, number>
  equation: string
  predictions: number[]
  residuals: number[]
}
```

**Correlazioni Multi-Fattore da Calcolare:**

1. **Meteo + Nutrizione → Resa**
   ```typescript
   yield = β0 + β1*GDD + β2*precipitation + β3*NPK + β4*stress_days + ε
   ```

2. **Irrigazione + Temperatura → Qualità**
   ```typescript
   brix = β0 + β1*water_volume + β2*temp_avg + β3*stress_idrico + ε
   ```

3. **Trattamenti + Timing → Efficacia**
   ```typescript
   efficacy = β0 + β1*product_dose + β2*timing_score + β3*weather_conditions + ε
   ```

4. **Lavorazioni + Terreno → Crescita**
   ```typescript
   growth_rate = β0 + β1*tillage_depth + β2*soil_structure + β3*organic_matter + ε
   ```

### 6. PredictionEngines (Nuovi)

#### 6.1 YieldPredictionEngine

**File:** `services/yieldPredictionEngine.ts`

**Modello:**
```typescript
interface YieldPrediction {
  cultivation_id: string
  prediction_date: string
  predicted_yield_kg: number
  confidence_interval: {
    lower: number
    upper: number
    confidence_level: number  // 0.95 = 95%
  }
  factors_considered: {
    gdd_accumulated: number
    weather_score: number
    nutrition_score: number
    health_score: number
    irrigation_score: number
  }
  comparison_to_average: number  // % vs media storica
  accuracy_expected: number      // % basato su dati storici
}
```

**Algoritmo:**
```typescript
function predictYield(cultivation: Cultivation): YieldPrediction {
  // 1. Ottieni dati storici simili
  const historicalData = getHistoricalYields(cultivation.crop_type)
  
  // 2. Calcola fattori correnti
  const gddFactor = calculateGDDFactor(cultivation)
  const weatherFactor = calculateWeatherFactor(cultivation)
  const nutritionFactor = calculateNutritionFactor(cultivation)
  const healthFactor = calculateHealthFactor(cultivation)
  const irrigationFactor = calculateIrrigationFactor(cultivation)
  
  // 3. Regressione multipla
  const baseYield = historicalData.averageYield
  const prediction = baseYield * (
    0.30 * gddFactor +
    0.25 * weatherFactor +
    0.20 * nutritionFactor +
    0.15 * healthFactor +
    0.10 * irrigationFactor
  )
  
  // 4. Calcola confidence interval
  const stdDev = historicalData.standardDeviation
  const confidenceInterval = {
    lower: prediction - (1.96 * stdDev),
    upper: prediction + (1.96 * stdDev),
    confidence_level: 0.95
  }
  
  return {
    predicted_yield_kg: prediction,
    confidence_interval,
    accuracy_expected: calculateExpectedAccuracy(historicalData)
  }
}
```

#### 6.2 DiseasePredictionEngine

**File:** `services/diseasePredictionEngine.ts`

**Modello (basato su MAGDA project - R² 84%):**
```typescript
interface DiseasePrediction {
  cultivation_id: string
  disease_type: string
  prediction_date: string
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  probability: number           // 0-1
  days_to_onset: number         // Giorni stimati
  confidence: number            // 0-1
  
  risk_factors: {
    weather_conditions: number  // 0-1
    plant_susceptibility: number
    disease_pressure: number    // Presenza in zona
    previous_infections: number
  }
  
  preventive_actions: Action[]
  monitoring_frequency: string  // "daily", "every_2_days", etc.
}
```

**Algoritmo (Logistic Regression):**
```typescript
function predictDisease(
  cultivation: Cultivation,
  diseaseType: string,
  forecastDays: number = 7
): DiseasePrediction {
  // 1. Ottieni dati meteo forecast
  const weatherForecast = getWeatherForecast(cultivation.location, forecastDays)
  
  // 2. Calcola fattori di rischio
  const weatherRisk = calculateWeatherRisk(weatherForecast, diseaseType)
  const susceptibility = getPlantSusceptibility(cultivation, diseaseType)
  const diseasePressure = getLocalDiseasePressure(cultivation.location, diseaseType)
  const history = getPreviousInfections(cultivation, diseaseType)
  
  // 3. Logistic regression
  const logit = β0 + 
    β1 * weatherRisk + 
    β2 * susceptibility + 
    β3 * diseasePressure + 
    β4 * history
  
  const probability = 1 / (1 + Math.exp(-logit))
  
  // 4. Determina risk level
  const riskLevel = 
    probability > 0.7 ? 'critical' :
    probability > 0.5 ? 'high' :
    probability > 0.3 ? 'medium' : 'low'
  
  // 5. Stima giorni a onset
  const daysToOnset = estimateDaysToOnset(probability, weatherForecast)
  
  return {
    disease_type: diseaseType,
    risk_level: riskLevel,
    probability,
    days_to_onset: daysToOnset,
    confidence: calculateConfidence(historicalAccuracy),
    preventive_actions: generatePreventiveActions(riskLevel, daysToOnset)
  }
}
```

**Malattie Monitorate:**
- Peronospora (downy mildew)
- Oidio (powdery mildew)
- Botrite (botrytis)
- Alternaria
- Fusarium
- Marciume radicale
- Virus (TSWV, CMV, etc.)

### 7. RecommendationEngine (Potenziato)

**File:** `services/recommendationEngine.ts`

**Tipi di Raccomandazioni:**
```typescript
type RecommendationType = 
  | 'preventive'      // Prevenire problemi
  | 'corrective'      // Risolvere problemi
  | 'optimization'    // Ottimizzare risultati
  | 'timing'          // Timing ottimale azione

interface Recommendation {
  id: string
  user_id: string
  cultivation_id?: string
  zone_id?: string
  
  type: RecommendationType
  category: 'irrigation' | 'nutrition' | 'health' | 'operations' | 'harvest'
  
  priority: number              // 0-100 (calcolato da Director)
  urgency: 'low' | 'medium' | 'high' | 'critical'
  
  title: string
  description: string
  reasoning: string             // Spiegazione chiara
  
  action: {
    type: string                // "irrigate", "fertilize", "treat", etc.
    parameters: Record<string, any>
    timing: {
      optimal_start: string     // ISO date
      optimal_end: string
      latest_by: string         // Deadline
    }
    resources_needed: {
      time_minutes: number
      cost_estimate: number
      materials: string[]
    }
  }
  
  expected_impact: {
    yield_change_kg?: number
    quality_change_percent?: number
    risk_reduction_percent?: number
  }
  
  alternatives?: Recommendation[]  // Azioni alternative
  conflicts_with?: string[]        // IDs raccomandazioni in conflitto
  
  generated_at: string
  valid_until: string
  status: 'pending' | 'accepted' | 'rejected' | 'completed'
}
```

---

## 💾 SCHEMA DATABASE

### Nuove Tabelle

#### 1. soil_measurements
```sql
CREATE TABLE soil_measurements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  zone_id UUID REFERENCES zones(id) ON DELETE SET NULL,
  measurement_date DATE NOT NULL,
  
  -- Chimici
  ph DECIMAL(3,1) CHECK (ph >= 0 AND ph <= 14),
  ec DECIMAL(5,2),  -- mS/cm
  nitrogen_ppm INTEGER,
  phosphorus_ppm INTEGER,
  potassium_ppm INTEGER,
  organic_matter_percent DECIMAL(4,1),
  cec DECIMAL(5,1),  -- meq/100g
  
  -- Fisici
  sand_percent DECIMAL(4,1),
  silt_percent DECIMAL(4,1),
  clay_percent DECIMAL(4,1),
  bulk_density DECIMAL(3,2),  -- g/cm³
  porosity_percent DECIMAL(4,1),
  water_holding_capacity DECIMAL(5,1),  -- mm
  
  -- Biologici
  soil_respiration DECIMAL(6,2),  -- mg CO2/m²/h
  microbial_biomass DECIMAL(8,2),  -- µg C/g
  enzyme_activity DECIMAL(6,2),
  
  -- Ambientali (multi-profondità)
  temp_5cm DECIMAL(4,1),
  temp_10cm DECIMAL(4,1),
  temp_20cm DECIMAL(4,1),
  moisture_5cm DECIMAL(4,1),
  moisture_10cm DECIMAL(4,1),
  moisture_20cm DECIMAL(4,1),
  
  -- Metadati
  measurement_method TEXT CHECK (measurement_method IN ('manual', 'sensor', 'lab')),
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_texture CHECK (
    (sand_percent IS NULL AND silt_percent IS NULL AND clay_percent IS NULL) OR
    (sand_percent + silt_percent + clay_percent = 100)
  )
);

CREATE INDEX idx_soil_measurements_user_date ON soil_measurements(user_id, measurement_date DESC);
CREATE INDEX idx_soil_measurements_garden ON soil_measurements(garden_id);
CREATE INDEX idx_soil_measurements_zone ON soil_measurements(zone_id);

-- RLS
ALTER TABLE soil_measurements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own soil measurements"
  ON soil_measurements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own soil measurements"
  ON soil_measurements FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

#### 2. growth_measurements
```sql
CREATE TABLE growth_measurements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cultivation_id UUID NOT NULL REFERENCES cultivations(id) ON DELETE CASCADE,
  plant_id UUID REFERENCES individual_plants(id) ON DELETE SET NULL,
  measurement_date DATE NOT NULL,
  
  -- Morfologici
  height_cm DECIMAL(6,1),
  stem_diameter_mm DECIMAL(5,1),
  leaf_count INTEGER,
  leaf_area_cm2 DECIMAL(8,2),
  internode_count INTEGER,
  internode_length_mm DECIMAL(5,1),
  
  -- Indici
  lai DECIMAL(4,2),  -- Leaf Area Index
  ndvi DECIMAL(4,3) CHECK (ndvi >= -1 AND ndvi <= 1),
  fresh_biomass_g DECIMAL(8,2),
  dry_biomass_g DECIMAL(8,2),
  relative_growth_rate DECIMAL(5,2),  -- % per giorno
  
  -- Radicale
  root_depth_cm DECIMAL(6,1),
  root_density DECIMAL(4,2),
  root_biomass_g DECIMAL(8,2),
  
  -- Fenologia
  phenological_stage TEXT,
  flowers_count INTEGER,
  fruits_count INTEGER,
  
  -- Metadati
  measurement_method TEXT CHECK (measurement_method IN ('manual', 'image_analysis', 'sensor')),
  photos TEXT[],
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_growth_measurements_cultivation ON growth_measurements(cultivation_id, measurement_date DESC);
CREATE INDEX idx_growth_measurements_plant ON growth_measurements(plant_id);

-- RLS
ALTER TABLE growth_measurements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own growth measurements"
  ON growth_measurements FOR SELECT
  USING (auth.uid() = user_id);
```

#### 3. quality_measurements
```sql
CREATE TABLE quality_measurements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cultivation_id UUID NOT NULL REFERENCES cultivations(id) ON DELETE CASCADE,
  harvest_id UUID REFERENCES harvests(id) ON DELETE SET NULL,
  measurement_date DATE NOT NULL,
  sample_size INTEGER NOT NULL DEFAULT 1,
  
  -- Chimici
  brix DECIMAL(4,1),  -- °Brix
  titratable_acidity DECIMAL(5,2),  -- g/L
  sugar_acid_ratio DECIMAL(5,2),
  ph DECIMAL(3,1),
  vitamin_c_mg DECIMAL(6,2),  -- mg/100g
  lycopene_mg DECIMAL(6,2),  -- mg/kg
  anthocyanins_mg DECIMAL(6,2),  -- mg/kg
  
  -- Fisici
  color_l DECIMAL(5,2),  -- L*a*b*
  color_a DECIMAL(5,2),
  color_b DECIMAL(5,2),
  firmness DECIMAL(5,2),  -- kg/cm²
  specific_gravity DECIMAL(4,3),
  skin_thickness_mm DECIMAL(4,2),
  
  -- Organolettici (scala 1-10)
  taste_score DECIMAL(3,1) CHECK (taste_score >= 1 AND taste_score <= 10),
  aroma_intensity DECIMAL(3,1) CHECK (aroma_intensity >= 1 AND aroma_intensity <= 10),
  crunchiness DECIMAL(3,1) CHECK (crunchiness >= 1 AND crunchiness <= 10),
  juiciness DECIMAL(3,1) CHECK (juiciness >= 1 AND juiciness <= 10),
  
  -- Shelf life
  storage_days INTEGER,
  weight_loss_percent DECIMAL(4,1),
  quality_degradation DECIMAL(4,1) CHECK (quality_degradation >= 0 AND quality_degradation <= 100),
  
  -- Metadati
  measurement_method TEXT CHECK (measurement_method IN ('manual', 'instrument', 'sensory_panel')),
  instrument_type TEXT,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quality_measurements_cultivation ON quality_measurements(cultivation_id, measurement_date DESC);
CREATE INDEX idx_quality_measurements_harvest ON quality_measurements(harvest_id);

-- RLS
ALTER TABLE quality_measurements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quality measurements"
  ON quality_measurements FOR SELECT
  USING (auth.uid() = user_id);
```

#### 4. multi_factor_correlations
```sql
CREATE TABLE multi_factor_correlations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  crop_type TEXT NOT NULL,
  
  -- Definizione correlazione
  dependent_variable TEXT NOT NULL,  -- "yield", "quality", "growth_rate"
  independent_variables JSONB NOT NULL,  -- {"gdd": true, "precipitation": true, ...}
  
  -- Risultati statistici
  correlation_type TEXT NOT NULL,  -- "pearson", "spearman", "multiple_regression"
  coefficients JSONB NOT NULL,  -- {"gdd": 0.85, "precipitation": 0.62, ...}
  r_squared DECIMAL(4,3),
  adjusted_r_squared DECIMAL(4,3),
  p_values JSONB,  -- {"gdd": 0.001, "precipitation": 0.023, ...}
  
  -- Interpretazione
  strength TEXT CHECK (strength IN ('very_weak', 'weak', 'moderate', 'strong', 'very_strong')),
  direction TEXT CHECK (direction IN ('positive', 'negative', 'mixed')),
  significance TEXT CHECK (significance IN ('not_significant', 'significant', 'highly_significant')),
  interpretation TEXT,
  
  -- Metadati
  sample_size INTEGER NOT NULL,
  date_range_start DATE NOT NULL,
  date_range_end DATE NOT NULL,
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_correlations_user_crop ON multi_factor_correlations(user_id, crop_type);
CREATE INDEX idx_correlations_dependent ON multi_factor_correlations(dependent_variable);

-- RLS
ALTER TABLE multi_factor_correlations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own correlations"
  ON multi_factor_correlations FOR SELECT
  USING (auth.uid() = user_id);
```

#### 5. predictions
```sql
CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cultivation_id UUID REFERENCES cultivations(id) ON DELETE CASCADE,
  
  -- Tipo previsione
  prediction_type TEXT NOT NULL CHECK (prediction_type IN (
    'yield', 'quality', 'disease', 'growth', 'harvest_timing'
  )),
  
  -- Previsione
  prediction_date DATE NOT NULL,
  target_date DATE,  -- Data prevista per evento
  predicted_value DECIMAL(10,2),
  predicted_value_unit TEXT,
  
  -- Confidence
  confidence_score DECIMAL(4,3) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  confidence_interval_lower DECIMAL(10,2),
  confidence_interval_upper DECIMAL(10,2),
  confidence_level DECIMAL(3,2) DEFAULT 0.95,  -- 95%
  
  -- Fattori considerati
  factors_considered JSONB NOT NULL,
  model_used TEXT NOT NULL,
  
  -- Validazione
  actual_value DECIMAL(10,2),
  actual_value_recorded_at TIMESTAMPTZ,
  accuracy_percent DECIMAL(5,2),
  was_accurate BOOLEAN,
  
  -- Metadati
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_predictions_cultivation ON predictions(cultivation_id, prediction_date DESC);
CREATE INDEX idx_predictions_type ON predictions(prediction_type);
CREATE INDEX idx_predictions_accuracy ON predictions(was_accurate) WHERE was_accurate IS NOT NULL;

-- RLS
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own predictions"
  ON predictions FOR SELECT
  USING (auth.uid() = user_id);
```

#### 6. recommendations
```sql
CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cultivation_id UUID REFERENCES cultivations(id) ON DELETE CASCADE,
  zone_id UUID REFERENCES zones(id) ON DELETE SET NULL,
  
  -- Tipo e categoria
  recommendation_type TEXT NOT NULL CHECK (recommendation_type IN (
    'preventive', 'corrective', 'optimization', 'timing'
  )),
  category TEXT NOT NULL CHECK (category IN (
    'irrigation', 'nutrition', 'health', 'operations', 'harvest'
  )),
  
  -- Priorità (calcolata da Director)
  priority INTEGER NOT NULL CHECK (priority >= 0 AND priority <= 100),
  urgency TEXT NOT NULL CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
  
  -- Contenuto
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  reasoning TEXT NOT NULL,
  
  -- Azione
  action_type TEXT NOT NULL,
  action_parameters JSONB,
  optimal_start_date DATE,
  optimal_end_date DATE,
  deadline_date DATE,
  
  -- Risorse
  time_minutes INTEGER,
  cost_estimate DECIMAL(8,2),
  materials_needed TEXT[],
  
  -- Impatto atteso
  expected_yield_change_kg DECIMAL(8,2),
  expected_quality_change_percent DECIMAL(5,2),
  expected_risk_reduction_percent DECIMAL(5,2),
  
  -- Gestione conflitti
  conflicts_with UUID[],  -- IDs altre raccomandazioni
  alternatives JSONB,  -- Array di raccomandazioni alternative
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'accepted', 'rejected', 'completed', 'expired'
  )),
  user_feedback TEXT,
  completed_at TIMESTAMPTZ,
  
  -- Metadati
  generated_by TEXT NOT NULL,  -- "director_service", "health_service", etc.
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recommendations_user_status ON recommendations(user_id, status, priority DESC);
CREATE INDEX idx_recommendations_cultivation ON recommendations(cultivation_id);
CREATE INDEX idx_recommendations_urgency ON recommendations(urgency, deadline_date);

-- RLS
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recommendations"
  ON recommendations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own recommendations"
  ON recommendations FOR UPDATE
  USING (auth.uid() = user_id);
```

#### 7. action_outcomes
```sql
CREATE TABLE action_outcomes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recommendation_id UUID REFERENCES recommendations(id) ON DELETE SET NULL,
  cultivation_id UUID REFERENCES cultivations(id) ON DELETE CASCADE,
  
  -- Azione eseguita
  action_type TEXT NOT NULL,
  action_date DATE NOT NULL,
  action_parameters JSONB,
  
  -- Risultati osservati
  outcome_measured_at DATE,
  yield_change_kg DECIMAL(8,2),
  quality_change_percent DECIMAL(5,2),
  health_improvement_percent DECIMAL(5,2),
  cost_actual DECIMAL(8,2),
  time_actual_minutes INTEGER,
  
  -- Confronto con previsioni
  expected_vs_actual JSONB,  -- {"yield": {"expected": 10, "actual": 12}, ...}
  outcome_rating TEXT CHECK (outcome_rating IN (
    'much_worse', 'worse', 'as_expected', 'better', 'much_better'
  )),
  
  -- Feedback utente
  user_satisfaction INTEGER CHECK (user_satisfaction >= 1 AND user_satisfaction <= 5),
  user_notes TEXT,
  would_repeat BOOLEAN,
  
  -- Apprendimento
  lessons_learned TEXT,
  adjustments_needed TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_action_outcomes_cultivation ON action_outcomes(cultivation_id, action_date DESC);
CREATE INDEX idx_action_outcomes_recommendation ON action_outcomes(recommendation_id);
CREATE INDEX idx_action_outcomes_rating ON action_outcomes(outcome_rating);

-- RLS
ALTER TABLE action_outcomes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own action outcomes"
  ON action_outcomes FOR ALL
  USING (auth.uid() = user_id);
```

#### 8. director_coordination_log
```sql
CREATE TABLE director_coordination_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  
  -- Coordinamento
  coordination_date DATE NOT NULL,
  services_coordinated TEXT[] NOT NULL,
  
  -- Raccomandazioni generate
  recommendations_generated INTEGER DEFAULT 0,
  recommendations_prioritized INTEGER DEFAULT 0,
  conflicts_resolved INTEGER DEFAULT 0,
  actions_sequenced INTEGER DEFAULT 0,
  
  -- Risultati
  execution_time_ms INTEGER,
  errors_encountered TEXT[],
  warnings TEXT[],
  
  -- Dettagli
  coordination_details JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_director_log_user_date ON director_coordination_log(user_id, coordination_date DESC);

-- RLS
ALTER TABLE director_coordination_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own coordination logs"
  ON director_coordination_log FOR SELECT
  USING (auth.uid() = user_id);
```

---

## 🔄 FLUSSI DI DATI

### Flusso 1: Registrazione Giornaliera Automatica

```
┌─────────────────────────────────────────────────────────────┐
│                    CRON JOB (23:00 UTC)                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              DailyDiaryService.runDailyRegistration()       │
│  1. Fetch weather data (Open-Meteo API)                    │
│  2. Calculate agronomic indices (GDD, chill hours, etc.)   │
│  3. Update cultivation tracking                            │
│  4. Generate automatic events                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    DirectorService.coordinate()             │
│  1. Analyze new data                                        │
│  2. Trigger prediction engines                             │
│  3. Generate recommendations                               │
│  4. Prioritize and sequence actions                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  NotificationService.notify()               │
│  Send daily summary to user with top 3-5 actions           │
└─────────────────────────────────────────────────────────────┘
```

### Flusso 2: Generazione Raccomandazioni On-Demand

```
┌─────────────────────────────────────────────────────────────┐
│              User opens Dashboard / Requests advice         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│            DirectorService.getDailyRecommendations()        │
│  1. Check cache (< 1 hour old)                             │
│  2. If stale, regenerate                                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              Parallel execution of services:                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ WeatherService → Check alerts                        │  │
│  │ HealthService → Check plant health                   │  │
│  │ IrrigationService → Check water needs                │  │
│  │ NutritionService → Check nutrient status             │  │
│  │ PredictionEngines → Check upcoming events            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│          DirectorService.prioritizeAndResolve()             │
│  1. Calculate priority for each recommendation             │
│  2. Identify conflicts                                      │
│  3. Resolve conflicts using rules                          │
│  4. Sequence actions optimally                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                Return prioritized recommendations           │
│                to user interface                            │
└─────────────────────────────────────────────────────────────┘
```

### Flusso 3: Feedback Loop (Apprendimento)

```
┌─────────────────────────────────────────────────────────────┐
│         User completes action (e.g., harvest)               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│        User records outcome (yield, quality, etc.)          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│          DirectorService.recordActionOutcome()              │
│  1. Store outcome in action_outcomes table                  │
│  2. Compare with prediction                                 │
│  3. Calculate accuracy                                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│            LearningEngine.updateModels()                    │
│  1. Aggregate outcomes by action type                       │
│  2. Recalculate correlation coefficients                    │
│  3. Adjust prediction models                                │
│  4. Update recommendation weights                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              Store updated models in database               │
│              (for next prediction cycle)                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 INTERFACCE UTENTE

### 1. Dashboard Predittivo

**Componente:** `components/director/PredictiveDashboard.tsx`

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│                    DASHBOARD PREDITTIVO                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📊 PANORAMICA OGGI                                         │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐ │
│  │   Meteo     │   Salute    │  Irrigazione│  Nutrizione │ │
│  │   ☀️ 24°C   │   ✅ Buona  │   💧 OK     │   🌱 OK     │ │
│  └─────────────┴─────────────┴─────────────┴─────────────┘ │
│                                                             │
│  🎯 AZIONI PRIORITARIE (3)                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🔴 URGENTE - Irrigare zona A entro 6 ore            │   │
│  │    Stress idrico rilevato. Impatto: -15% resa       │   │
│  │    [Dettagli] [Fatto] [Rimanda]                     │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ 🟡 IMPORTANTE - Trattare contro peronospora         │   │
│  │    Rischio alto (78%) nei prossimi 3 giorni         │   │
│  │    [Dettagli] [Fatto] [Ignora]                      │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ 🟢 OTTIMIZZAZIONE - Fertilizzare pomodori           │   │
│  │    Finestra ottimale: oggi-domani. +10% qualità     │   │
│  │    [Dettagli] [Fatto] [Più tardi]                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  📈 PREVISIONI                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Pomodori San Marzano                                │   │
│  │ Raccolta prevista: 15-18 Luglio (12-15 giorni)     │   │
│  │ Resa stimata: 8.5 kg (±1.2 kg, 85% confidence)     │   │
│  │ Qualità attesa: Ottima (Brix 6.2°)                 │   │
│  │ [Vedi dettagli]                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  📊 TREND SETTIMANALE                                       │
│  [Grafico GDD, stress, salute]                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```
