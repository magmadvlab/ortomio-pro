# Analisi: Campo Aperto, Serra, e Sistema Meteo

**Data**: 2026-02-13  
**Domande**: 
1. Le fragole esistono anche in campo aperto?
2. Come avviene la gestione di coltivazioni in serra?
3. Sono agganciate lavorazioni specifiche per le serre?
4. Vengono registrate?
5. Il meteo è predittivo e avvisa anche in caso di vento forte?

---

## 🔍 RISPOSTA RAPIDA

1. **Fragole in campo aperto**: ✅ SÌ, supportate
2. **Gestione serra**: ⚠️ PARZIALE (configurazione sì, operazioni specifiche NO)
3. **Lavorazioni specifiche serra**: ❌ NO (non implementate)
4. **Registrazione operazioni serra**: ❌ NO (non tracciabili)
5. **Meteo predittivo vento**: ⚠️ PARZIALE (alert vento >50 km/h, ma non integrato con serra)

---

## 📊 ANALISI DETTAGLIATA

### 1. FRAGOLE IN CAMPO APERTO

**Risposta**: ✅ SÌ, completamente supportate

**Evidenza dal codice**:
```typescript
// types.ts - GardenType
export type GardenType = 
  | 'OpenField'           // Campo aperto tradizionale ✅
  | 'Greenhouse'          // Serra tradizionale ✅
  | 'Tunnel'              // Tunnel/polytunnel ✅
  | 'RaisedBed'           // Aiuola/cassone rialzato ✅
  | 'Pot'                 // Vasi/Contenitori ✅
  | ...
```

**Tracciamento fragole campo aperto**:
- ✅ Posizione pianta (fila + posizione)
- ✅ Parametri suolo (pH, umidità, temperatura)
- ✅ Gestione coltura (rinnovo, stoloni, pacciamatura)
- ✅ Codice univoco (es. "STRAW-R1-P5")

**Implementato in**:
- `types.ts` - strawberryHarvest con plantPosition
- `QuickHarvestForm.tsx` - sezione "🍓 Dati Fragola"
- Funziona per TUTTI i tipi di orto (OpenField, Greenhouse, Tunnel, ecc.)

---

### 2. GESTIONE COLTIVAZIONI IN SERRA

**Risposta**: ⚠️ PARZIALE - Configurazione sì, operazioni specifiche NO

#### 2.1 Cosa È Implementato ✅

**Configurazione Serra**:
```typescript
// types.ts - Garden
interface Garden {
  gardenType?: GardenType  // Può essere 'Greenhouse'
  greenhouseConfig?: GreenhouseConfig  // Configurazione serra
}

// types/greenhouse.ts
interface GreenhouseConfig {
  type: 'Cold' | 'Warm' | 'Tropical'
  hasHeating: boolean
  hasVentilation: boolean
  hasShadingSystem: boolean
  hasIrrigation: boolean
  coverMaterial: 'Glass' | 'Polycarbonate' | 'Plastic'
  sizeSqMeters: number
}
```

**Rilevamento Tipo Serra**:
- ✅ Serra fredda (Cold) - no riscaldamento
- ✅ Serra calda (Warm) - riscaldamento moderato
- ✅ Serra tropicale (Tropical) - riscaldamento intenso

**Modificatori Temperatura**:
```typescript
// services/sensorDataService.ts
if (garden.gardenType === 'Greenhouse' && garden.greenhouseConfig) {
  // Modificatore SERRA: +5-10°C se riscaldata
  const hasHeating = garden.greenhouseConfig.hasHeating
  if (hasHeating) {
    effectiveTemp += 7  // +7°C con riscaldamento
  }
}
```

**Suggerimenti Stagionali**:
```typescript
// services/gardenSuggestionsService.ts
if (garden.gardenType === 'Greenhouse') {
  suggestions.push({
    id: 'greenhouse-winter',
    type: 'seasonal',
    title: 'Coltivazioni in serra',
    description: 'Approfitta della serra per coltivare anche in inverno'
  })
}
```

#### 2.2 Cosa NON È Implementato ❌

**Operazioni Specifiche Serra**:
- ❌ Apertura/chiusura finestre ventilazione
- ❌ Regolazione riscaldamento
- ❌ Gestione ombreggiamento
- ❌ Controllo umidità
- ❌ Pulizia copertura
- ❌ Manutenzione struttura
- ❌ Disinfezione serra
- ❌ Gestione CO2

**Tracciamento Parametri Serra**:
- ❌ Temperatura interna vs esterna
- ❌ Umidità relativa
- ❌ Livelli CO2
- ❌ Intensità luce
- ❌ Ore ventilazione
- ❌ Consumo riscaldamento

**Alert Specifici Serra**:
- ❌ Temperatura troppo alta (>35°C)
- ❌ Umidità eccessiva (>90%)
- ❌ Necessità ventilazione
- ❌ Rischio malattie fungine
- ❌ Necessità ombreggiamento

---

### 3. LAVORAZIONI SPECIFICHE SERRA

**Risposta**: ❌ NO - Non implementate

#### 3.1 Lavorazioni Meccaniche Esistenti

**Campo Aperto** (implementate):
```typescript
// services/mechanicalWorkService.ts
const sequences = [
  {
    name: 'Preparazione Orto Estivo Completa',
    gardenType: 'OpenField',  // ✅ Solo campo aperto
    steps: [
      { work: 'Plowing', equipment: 'Tractor' },
      { work: 'Harrowing', equipment: 'Tractor' },
      { work: 'Tilling', equipment: 'Rototiller' }
    ]
  }
]
```

**Serra** (NON implementate):
- ❌ Nessuna sequenza per gardenType: 'Greenhouse'
- ❌ Nessuna operazione specifica serra

#### 3.2 Operazioni Serra Mancanti

**Operazioni Stagionali**:
1. **Primavera**:
   - Pulizia copertura (rimozione alghe/sporco)
   - Disinfezione struttura
   - Controllo guarnizioni
   - Test sistema riscaldamento
   - Preparazione sistema ombreggiamento

2. **Estate**:
   - Gestione ombreggiamento (apertura/chiusura)
   - Ventilazione intensiva
   - Controllo temperatura
   - Irrigazione nebulizzazione
   - Gestione umidità

3. **Autunno**:
   - Pulizia finale copertura
   - Controllo isolamento
   - Preparazione riscaldamento
   - Sigillatura fessure
   - Controllo drenaggio

4. **Inverno**:
   - Monitoraggio riscaldamento
   - Rimozione neve da copertura
   - Controllo condensa
   - Ventilazione minima
   - Gestione umidità

**Operazioni Quotidiane**:
- Apertura/chiusura finestre (mattina/sera)
- Controllo temperatura
- Controllo umidità
- Irrigazione
- Ventilazione

**Operazioni Straordinarie**:
- Disinfezione post-malattia
- Sostituzione copertura danneggiata
- Riparazione struttura
- Pulizia sistema irrigazione
- Manutenzione riscaldamento

---

### 4. REGISTRAZIONE OPERAZIONI SERRA

**Risposta**: ❌ NO - Non tracciabili

#### 4.1 Sistema Task Esistente

**TaskType supportati**:
```typescript
// types.ts
taskType: 
  | 'Sowing' | 'Transplant' | 'Fertilize' | 'Prune' | 'Harvest' 
  | 'Treatment' | 'Irrigation' | 'Photo'
  | 'Plowing' | 'Harrowing' | 'Tilling' | ...  // Lavorazioni meccaniche
  | 'HydroNutrientCheck' | 'HydroSolutionChange' | ...  // Idroponica
  | 'AquaponicFishFeed' | 'AquaponicWaterTest' | ...  // Acquaponica
  | 'AeroponicNozzleClean' | ...  // Aeroponica
```

**Mancano TaskType per serra**:
- ❌ 'GreenhouseVentilation'
- ❌ 'GreenhouseHeating'
- ❌ 'GreenhouseShading'
- ❌ 'GreenhouseCleaning'
- ❌ 'GreenhouseDisinfection'
- ❌ 'GreenhouseMaintenance'

#### 4.2 Tracciamento Parametri

**Idroponica** (implementato):
```typescript
interface HydroponicReading {
  ph: number
  ec: number
  waterTemperature: number
  timestamp: string
}
```

**Serra** (NON implementato):
```typescript
// MANCANTE
interface GreenhouseReading {
  internalTemperature: number
  externalTemperature: number
  humidity: number
  co2Level?: number
  lightIntensity?: number
  ventilationStatus: 'Open' | 'Closed' | 'Partial'
  heatingStatus: 'On' | 'Off'
  shadingStatus: 'Open' | 'Closed' | 'Partial'
  timestamp: string
}
```

---

### 5. SISTEMA METEO PREDITTIVO

**Risposta**: ⚠️ PARZIALE - Alert vento implementato ma non integrato con serra

#### 5.1 Cosa È Implementato ✅

**API Meteo**:
```typescript
// services/weatherService.ts
async function getWeatherForecast(lat: number, lng: number, days: number = 7) {
  // Usa Open-Meteo API
  const data = await fetch('https://api.open-meteo.com/v1/forecast', {
    params: {
      daily: [
        'temperature_2m_max',
        'temperature_2m_min',
        'precipitation_sum',
        'wind_speed_10m_max',  // ✅ Velocità vento
        'uv_index_max'
      ]
    }
  })
}
```

**Alert Vento**:
```typescript
// services/weatherService.ts
function generateWeatherAlerts(forecast: any[]): WeatherAlert[] {
  const alerts: WeatherAlert[] = []
  
  // Wind alerts ✅
  if (today.wind_speed > 50) {
    alerts.push({
      severity: 'HIGH',
      message: 'Vento forte - proteggi piante alte',
      type: 'wind'
    })
  }
  
  return alerts
}
```

**Altri Alert Meteo**:
```typescript
// Temperature
if (today.temp_max > 35) {
  alerts.push({
    severity: 'HIGH',
    message: 'Temperature estreme previste - proteggi le piante'
  })
}

if (today.temp_min < 0) {
  alerts.push({
    severity: 'HIGH',
    message: 'Rischio gelo - proteggi piante sensibili'
  })
}

// Pioggia
if (today.precipitation > 20) {
  alerts.push({
    severity: 'HIGH',
    message: 'Pioggia intensa prevista - sospendi irrigazione'
  })
}
```

**UrgentAlert nel Director**:
```typescript
// types.ts
interface UrgentAlert {
  type: 'Frost' | 'Heat' | 'Drought' | 'Storm' | ...
  message: string
  action: string
  blockOperations?: boolean  // ✅ Può bloccare operazioni
  timing?: 'now' | 'tomorrow' | 'this_week'
}
```

#### 5.2 Cosa NON È Implementato ❌

**Alert Specifici Serra**:
- ❌ "Vento forte - chiudi finestre serra"
- ❌ "Temperatura alta - attiva ombreggiamento"
- ❌ "Rischio grandine - proteggi copertura"
- ❌ "Tempesta in arrivo - verifica chiusura serra"
- ❌ "Neve prevista - rimuovi accumulo da copertura"

**Integrazione Serra-Meteo**:
- ❌ Suggerimenti automatici apertura/chiusura finestre
- ❌ Regolazione automatica riscaldamento
- ❌ Attivazione ombreggiamento in base a previsioni
- ❌ Alert manutenzione pre-tempesta

**Alert Avanzati**:
- ❌ Previsione malattie fungine (umidità + temperatura)
- ❌ Rischio stress termico piante
- ❌ Necessità ventilazione notturna
- ❌ Ottimizzazione consumo energetico

---

## 📋 CONFRONTO: CAMPO APERTO vs SERRA

| Feature | Campo Aperto | Serra |
|---------|-------------|-------|
| **Configurazione** | ✅ Supportata | ✅ Supportata |
| **Lavorazioni meccaniche** | ✅ 15+ operazioni | ❌ 0 operazioni |
| **Operazioni specifiche** | ✅ Aratura, erpicatura, ecc. | ❌ Nessuna |
| **Tracciamento parametri** | ⚠️ Suolo (pH, umidità) | ❌ Nessuno |
| **Alert meteo** | ✅ Gelo, caldo, pioggia | ⚠️ Generici (non specifici) |
| **Alert vento** | ✅ >50 km/h | ⚠️ Generico (non integrato) |
| **Suggerimenti stagionali** | ✅ Implementati | ⚠️ Limitati |
| **Tracciamento raccolti** | ✅ Completo | ✅ Completo |

**Conclusione**: Campo aperto è MOLTO PIÙ supportato della serra!

---

## 🚨 GAP CRITICI IDENTIFICATI

### 1. NO Operazioni Specifiche Serra
**Problema**: 
- Serra ha configurazione ma nessuna operazione specifica
- Utente non può registrare "Apertura finestre", "Pulizia copertura", ecc.
- Nessun suggerimento automatico per gestione serra

**Impatto**: 
- Impossibile tracciare gestione quotidiana serra
- Impossibile ottimizzare parametri serra
- Impossibile analytics su efficienza serra

### 2. NO Tracciamento Parametri Serra
**Problema**:
- Idroponica ha `HydroponicReading` (pH, EC, temperatura)
- Serra NON ha `GreenhouseReading` (temperatura interna, umidità, CO2)

**Impatto**:
- Impossibile monitorare condizioni serra
- Impossibile correlare parametri → resa
- Impossibile alert automatici (es. temperatura troppo alta)

### 3. NO Integrazione Meteo-Serra
**Problema**:
- Alert vento generico "proteggi piante alte"
- NON dice "chiudi finestre serra"
- NON suggerisce azioni specifiche serra

**Impatto**:
- Utente deve interpretare alert manualmente
- Nessuna automazione gestione serra
- Rischio danni da eventi meteo

### 4. NO TaskType Serra
**Problema**:
- Esistono TaskType per idroponica (HydroNutrientCheck, ecc.)
- NON esistono TaskType per serra (GreenhouseVentilation, ecc.)

**Impatto**:
- Impossibile creare task specifici serra
- Impossibile tracciare operazioni serra
- Impossibile analytics su gestione serra

---

## 🎯 COSA SERVE PER PARITÀ SERRA

### Fase 1: TaskType e Operazioni Base (2-3 giorni)

**1.1 Estendere TaskType**:
```typescript
// types.ts
taskType: 
  | ... // esistenti
  | 'GreenhouseVentilation'      // Apertura/chiusura finestre
  | 'GreenhouseHeating'          // Regolazione riscaldamento
  | 'GreenhouseShading'          // Gestione ombreggiamento
  | 'GreenhouseCleaning'         // Pulizia copertura
  | 'GreenhouseDisinfection'     // Disinfezione
  | 'GreenhouseMaintenance'      // Manutenzione struttura
  | 'GreenhouseHumidityControl'  // Controllo umidità
  | 'GreenhouseCO2Management'    // Gestione CO2
```

**1.2 Creare GreenhouseDirector**:
```typescript
// logic/greenhouseDirector.ts
export function generateGreenhouseSuggestions(
  garden: Garden,
  weather: WeatherForecast[],
  readings?: GreenhouseReading[]
): GreenhouseTaskAdvice {
  const suggestions: GardenTask[] = []
  
  // Alert temperatura alta
  if (readings?.internalTemperature > 35) {
    suggestions.push({
      taskType: 'GreenhouseVentilation',
      priority: 'Critical',
      message: 'Temperatura serra troppo alta - apri finestre'
    })
  }
  
  // Alert vento forte
  if (weather[0].wind_speed > 50) {
    suggestions.push({
      taskType: 'GreenhouseVentilation',
      priority: 'Critical',
      message: 'Vento forte previsto - chiudi finestre serra'
    })
  }
  
  // Alert umidità eccessiva
  if (readings?.humidity > 90) {
    suggestions.push({
      taskType: 'GreenhouseVentilation',
      priority: 'High',
      message: 'Umidità eccessiva - ventila serra'
    })
  }
  
  return { suggestions, alerts: [] }
}
```

**1.3 Integrare nel Director Principale**:
```typescript
// logic/director.ts
import { generateGreenhouseSuggestions } from './greenhouseDirector'

if (garden.gardenType === 'Greenhouse') {
  const greenhouseAdvice = generateGreenhouseSuggestions(
    garden,
    weatherForecast,
    latestGreenhouseReading
  )
  allSuggestions.push(...greenhouseAdvice.suggestions)
}
```

### Fase 2: Tracciamento Parametri (2-3 giorni)

**2.1 Creare GreenhouseReading**:
```typescript
// types/greenhouse.ts
export interface GreenhouseReading {
  id: string
  gardenId: string
  timestamp: string
  internalTemperature: number      // °C
  externalTemperature: number      // °C
  humidity: number                 // %
  co2Level?: number                // ppm
  lightIntensity?: number          // lux
  ventilationStatus: 'Open' | 'Closed' | 'Partial'
  heatingStatus: 'On' | 'Off'
  shadingStatus: 'Open' | 'Closed' | 'Partial'
  notes?: string
}
```

**2.2 Creare Tabella Database**:
```sql
CREATE TABLE greenhouse_readings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  internal_temperature NUMERIC(4,1) NOT NULL,
  external_temperature NUMERIC(4,1),
  humidity NUMERIC(4,1) NOT NULL,
  co2_level INTEGER,
  light_intensity INTEGER,
  ventilation_status TEXT CHECK (ventilation_status IN ('Open', 'Closed', 'Partial')),
  heating_status TEXT CHECK (heating_status IN ('On', 'Off')),
  shading_status TEXT CHECK (shading_status IN ('Open', 'Closed', 'Partial')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_greenhouse_readings_garden_timestamp 
ON greenhouse_readings(garden_id, timestamp DESC);
```

**2.3 Form Registrazione Letture**:
```typescript
// components/greenhouse/GreenhouseReadingForm.tsx
<form onSubmit={handleSubmit}>
  <input 
    type="number" 
    label="Temperatura Interna (°C)"
    value={internalTemp}
    onChange={(e) => setInternalTemp(Number(e.target.value))}
  />
  <input 
    type="number" 
    label="Umidità (%)"
    value={humidity}
    onChange={(e) => setHumidity(Number(e.target.value))}
  />
  <select 
    label="Finestre"
    value={ventilationStatus}
    onChange={(e) => setVentilationStatus(e.target.value)}
  >
    <option value="Open">Aperte</option>
    <option value="Closed">Chiuse</option>
    <option value="Partial">Parzialmente aperte</option>
  </select>
  {/* ... altri campi */}
</form>
```

### Fase 3: Alert Meteo Integrati (1-2 giorni)

**3.1 Estendere generateWeatherAlerts**:
```typescript
// services/weatherService.ts
export function generateGreenhouseWeatherAlerts(
  forecast: WeatherForecast[],
  garden: Garden
): WeatherAlert[] {
  const alerts: WeatherAlert[] = []
  
  if (garden.gardenType !== 'Greenhouse') return alerts
  
  const today = forecast[0]
  
  // Vento forte - chiudi finestre
  if (today.wind_speed > 50) {
    alerts.push({
      severity: 'HIGH',
      message: '🌪️ Vento forte previsto - CHIUDI FINESTRE SERRA',
      type: 'wind',
      action: 'close_ventilation'
    })
  } else if (today.wind_speed > 30) {
    alerts.push({
      severity: 'MEDIUM',
      message: '💨 Vento moderato - verifica chiusura finestre',
      type: 'wind',
      action: 'check_ventilation'
    })
  }
  
  // Grandine - proteggi copertura
  if (today.condition === 'stormy' && today.precipitation > 10) {
    alerts.push({
      severity: 'HIGH',
      message: '⛈️ Rischio grandine - proteggi copertura serra',
      type: 'storm',
      action: 'protect_cover'
    })
  }
  
  // Neve - rimuovi accumulo
  if (today.condition === 'snowy') {
    alerts.push({
      severity: 'HIGH',
      message: '❄️ Neve prevista - rimuovi accumulo da copertura',
      type: 'snow',
      action: 'remove_snow'
    })
  }
  
  // Caldo eccessivo - ombreggiamento
  if (today.temp_max > 35) {
    alerts.push({
      severity: 'HIGH',
      message: '🌡️ Caldo eccessivo - attiva ombreggiamento serra',
      type: 'temperature',
      action: 'activate_shading'
    })
  }
  
  return alerts
}
```

### Fase 4: Analytics Serra (2-3 giorni)

**4.1 Creare GreenhouseAnalyticsService**:
```typescript
// services/greenhouseAnalyticsService.ts
export class GreenhouseAnalyticsService {
  /**
   * Analizza efficienza serra
   */
  async analyzeGreenhouseEfficiency(
    gardenId: string,
    readings: GreenhouseReading[],
    harvests: HarvestLogData[]
  ): Promise<{
    avgInternalTemp: number
    avgHumidity: number
    ventilationHours: number
    heatingHours: number
    energyConsumption: number
    yieldPerSqm: number
    recommendations: string[]
  }>
  
  /**
   * Correla parametri serra → resa
   */
  async analyzeParameterCorrelations(
    readings: GreenhouseReading[],
    harvests: HarvestLogData[]
  ): Promise<{
    tempOptimal: { min: number; max: number }
    humidityOptimal: { min: number; max: number }
    correlations: {
      temp_vs_yield: number
      humidity_vs_quality: number
    }
  }>
}
```

---

## 📊 EFFORT STIMATO

### Fase 1: TaskType e Operazioni (2-3 giorni)
- Estendere TaskType: 0.5 giorni
- Creare GreenhouseDirector: 1 giorno
- Integrare nel Director: 0.5 giorni
- Testing: 0.5-1 giorno

### Fase 2: Tracciamento Parametri (2-3 giorni)
- Creare GreenhouseReading type: 0.5 giorni
- Migrazione database: 0.5 giorni
- Form registrazione: 1 giorno
- Storage provider: 0.5 giorni
- Testing: 0.5 giorni

### Fase 3: Alert Meteo Integrati (1-2 giorni)
- Estendere generateWeatherAlerts: 0.5 giorni
- Integrare nel Director: 0.5 giorni
- UI alert specifici: 0.5 giorni
- Testing: 0.5 giorni

### Fase 4: Analytics (2-3 giorni)
- Creare GreenhouseAnalyticsService: 1 giorno
- Dashboard analytics: 1 giorno
- Testing: 0.5-1 giorno

**TOTALE**: 7-11 giorni

---

## ✅ CONCLUSIONI

### Stato Attuale

**Campo Aperto**: ⭐⭐⭐⭐⭐ (5/5)
- ✅ Lavorazioni meccaniche complete
- ✅ Alert meteo integrati
- ✅ Tracciamento raccolti completo
- ✅ Suggerimenti stagionali

**Serra**: ⭐⭐ (2/5)
- ✅ Configurazione base
- ✅ Modificatori temperatura
- ⚠️ Alert meteo generici (non specifici)
- ❌ NO operazioni specifiche
- ❌ NO tracciamento parametri
- ❌ NO analytics

**Fragole**: ⭐⭐⭐⭐⭐ (5/5)
- ✅ Supportate in TUTTI i tipi di orto (campo aperto, serra, idroponica)
- ✅ Tracciamento completo (posizione, parametri, gestione)
- ✅ Parità con idroponica

**Meteo**: ⭐⭐⭐⭐ (4/5)
- ✅ API Open-Meteo integrata
- ✅ Previsioni 7 giorni
- ✅ Alert vento >50 km/h
- ✅ Alert temperatura, pioggia, gelo
- ⚠️ Alert generici (non specifici per serra)
- ❌ NO integrazione automatica con serra

### Raccomandazioni

**CRITICAL (Fare Subito)**:
1. Implementare GreenhouseDirector con alert meteo specifici (Fase 1 + Fase 3)
   - Effort: 3-5 giorni
   - ROI: ALTISSIMO (sblocca gestione serra)

**HIGH (Short-Term)**:
2. Implementare tracciamento parametri serra (Fase 2)
   - Effort: 2-3 giorni
   - ROI: ALTO (permette ottimizzazione)

**MEDIUM (Medium-Term)**:
3. Implementare analytics serra (Fase 4)
   - Effort: 2-3 giorni
   - ROI: MEDIO (valore aggiunto Pro)

**Priorità**: Fase 1 + Fase 3 insieme (alert meteo integrati) per sbloccare gestione serra base.

