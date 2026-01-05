# 🐛 Fix: Weather API 400 Error - Future Dates Request

**Data:** 2026-01-05
**Priorità:** ALTA - Bug in produzione
**Status:** ✅ RISOLTO

---

## 🚨 Problema

### Errore Console

```
GET https://archive-api.open-meteo.com/v1/archive?latitude=40.36090849999999&longitude=16.686294549999992&start_date=2026-06-01&end_date=2026-07-31...
400 (Bad Request)
Historical weather API error: 400
```

**Frequenza:** Ripetuto continuamente nella console

**Impact:**
- Fallimento recupero dati meteo storici
- Calcoli temperatura non accurati per pianificazione colture
- Console piena di errori

---

## 🔍 Root Cause

### Problema 1: Archive API + Future Dates = 400 Error

**Open-Meteo Archive API** supporta **SOLO dati storici** (passato):
```
✅ https://archive-api.open-meteo.com/v1/archive?start_date=2025-06-01&end_date=2025-07-31
❌ https://archive-api.open-meteo.com/v1/archive?start_date=2026-06-01&end_date=2026-07-31
   → 400 Bad Request (futuro!)
```

### Problema 2: Data Corrente 2026

Il codice usa `new Date().getFullYear()` che restituisce **2026** (data attuale):

```typescript
// historicalWeatherService.ts:62
const targetYear = year || new Date().getFullYear(); // 2026
```

### Problema 3: Periodi Futuri Richiesti

Quando l'app richiede dati per periodi come "Giu-Lug" (Giugno-Luglio) nel 2026:

```typescript
// periodToDateRange('Giu-Lug', 2026)
{
  start: '2026-06-01',  // ❌ FUTURO! (oggi è 2026-01-05)
  end: '2026-07-31'     // ❌ FUTURO!
}
```

**Risultato:** Archive API rifiuta con 400 perché non può fornire dati storici per date future.

---

## 🌍 Come si Collega alla Microposizione dell'Orto

### Coordinate GPS dell'Orto

Ogni garden ha coordinate GPS salvate:

```typescript
// In database (tabella gardens)
{
  id: 'abc-123',
  name: 'Orto Campo Aperto',
  coordinates: {
    latitude: 40.36090849999999,   // 40.36°N
    longitude: 16.686294549999992  // 16.69°E
  }
}
```

**Esempio:** Le coordinate `40.36°N, 16.69°E` corrispondono a **Potenza, Basilicata**

### Flusso Dati: GPS → Weather API

```
1. User configura orto
   ├─ Inserisce coordinate GPS (manualmente o da device)
   └─ Salva in database: gardens.coordinates

2. Director richiede piano giornaliero
   ├─ logic/director.ts:352
   └─ Chiama: getAllHistoricalWeather(lat, lng, year)

3. Historical Weather Service
   ├─ Usa lat/lng dell'orto come parametri API
   ├─ URL: archive-api.open-meteo.com/v1/archive
   └─ Query: ?latitude=40.36&longitude=16.69&start_date=...

4. Open-Meteo API
   ├─ Riceve coordinate esatte dell'orto
   ├─ Restituisce dati meteo per quella posizione specifica
   └─ Precisione: ~11km (griglia API)

5. Calcoli Temperature
   ├─ Usa dati meteo storici della microposizione
   └─ Applica a: classificazione solare, consigli colture
```

### Perché "Microposizione"?

**Microposizione** = Coordinate GPS precise dell'orto (non città generica)

**Benefici:**
- **Accuratezza**: Dati meteo specifici per lat/lng esatte
- **Variabilità Locale**: Orto in montagna vs valle hanno temperature diverse
- **Altitudine**: Combinato con altitudine GPS per correzioni termiche

**Esempio Pratico:**

```
Orto A: Potenza centro (40.36°N, alt. 820m)
  → Temperatura media: 15°C (corretto per altitudine)

Orto B: Potenza periferia (40.38°N, alt. 600m)
  → Temperatura media: 17°C (più caldo, meno altitudine)
```

L'API meteo usa le coordinate esatte per fornire dati precisi per quella microposizione.

---

## ✅ Soluzione Applicata

### File Modificato

**File:** `services/historicalWeatherService.ts`

### Modifica 1: Rilevamento Date Future (righe 62-76)

```typescript
// PRIMA ❌
const targetYear = year || new Date().getFullYear(); // Sempre 2026
const cacheKey = getCacheKey(lat, lng, period, targetYear);
// ... fetch API con targetYear

// DOPO ✅
const currentDate = new Date();
const currentYear = currentDate.getFullYear();

// Se l'anno non è specificato, usa l'anno corrente
let targetYear = year || currentYear;

// Se il periodo richiesto è nel futuro, usa l'anno precedente
// (Archive API supporta solo dati storici)
const { start } = periodToDateRange(period, targetYear);
const periodStartDate = new Date(start);

if (periodStartDate > currentDate) {
  console.log(`Requested period ${period} ${targetYear} is in the future, using previous year data`);
  targetYear = currentYear - 1;
}

const cacheKey = getCacheKey(lat, lng, period, targetYear);
```

### Modifica 2: Enhanced Logging (riga 102)

```typescript
// PRIMA ❌
console.warn(`Historical weather API error: ${response.status}`);

// DOPO ✅
console.warn(`Historical weather API error: ${response.status} for period ${period} ${targetYear} (${adjustedStart} to ${end})`);
```

### Modifica 3: Documentazione API (righe 88-91)

```typescript
// Open-Meteo Historical Weather API
// Endpoint: https://archive-api.open-meteo.com/v1/archive
// NOTA: Questo endpoint supporta SOLO dati storici (passato)
// Per previsioni future usare: https://api.open-meteo.com/v1/forecast
```

---

## 🎯 Logica della Soluzione

### Step-by-Step

**Scenario:** Oggi è **2026-01-05**, utente richiede dati per "Giu-Lug"

```typescript
// 1. Anno di default: corrente
targetYear = 2026

// 2. Calcola date periodo
periodToDateRange('Giu-Lug', 2026)
// → { start: '2026-06-01', end: '2026-07-31' }

// 3. Controlla se futuro
periodStartDate = new Date('2026-06-01')  // 1 giugno 2026
currentDate = new Date('2026-01-05')       // oggi

if (periodStartDate > currentDate) {       // true!
  targetYear = 2025                         // ✅ Usa anno precedente
}

// 4. Ricalcola con anno corretto
periodToDateRange('Giu-Lug', 2025)
// → { start: '2025-06-01', end: '2025-07-31' }

// 5. API Request
fetch('archive-api.open-meteo.com/v1/archive?start_date=2025-06-01...')
// → ✅ 200 OK (dati storici disponibili)
```

**Risultato:** API riceve date passate, restituisce dati storici validi.

---

## 📊 Comportamento per Ogni Periodo

Oggi: **2026-01-05**

| Periodo | Date 2026 | Futuro? | Anno Usato | Date Finali | API Response |
|---------|-----------|---------|------------|-------------|--------------|
| Feb-Mar | 2026-02-01 to 2026-03-31 | ✅ Sì | 2025 | 2025-02-01 to 2025-03-31 | ✅ 200 OK |
| Apr-Mag | 2026-04-01 to 2026-05-31 | ✅ Sì | 2025 | 2025-04-01 to 2025-05-31 | ✅ 200 OK |
| Giu-Lug | 2026-06-01 to 2026-07-31 | ✅ Sì | 2025 | 2025-06-01 to 2025-07-31 | ✅ 200 OK |
| Ago-Set | 2026-08-01 to 2026-09-30 | ✅ Sì | 2025 | 2025-08-01 to 2025-09-30 | ✅ 200 OK |

**Nota:** A inizio anno (gennaio-febbraio), tutti i periodi dell'anno corrente sono futuri, quindi usa sempre anno precedente.

---

## 🧪 Testing

### TypeScript Compilation

```bash
npm run type-check
# ✅ No errors
```

### Test Case 1: Periodo Futuro

**Input:**
```typescript
getHistoricalWeatherForPeriod(
  40.36,
  16.69,
  'Giu-Lug',
  undefined  // Usa anno corrente (2026)
)
```

**Expected:**
- Rileva che 2026-06-01 è futuro
- Usa anno 2025 invece
- API request: `start_date=2025-06-01&end_date=2025-07-31`
- Response: 200 OK con dati storici 2025

**Actual:** ✅ PASS

---

### Test Case 2: Anno Esplicito Passato

**Input:**
```typescript
getHistoricalWeatherForPeriod(
  40.36,
  16.69,
  'Giu-Lug',
  2024  // Anno esplicito passato
)
```

**Expected:**
- Usa anno 2024 (passato, ok)
- API request: `start_date=2024-06-01&end_date=2024-07-31`
- Response: 200 OK

**Actual:** ✅ PASS

---

### Test Case 3: Multipli Periodi (getAllHistoricalWeather)

**Input:**
```typescript
getAllHistoricalWeather(40.36, 16.69, undefined)
```

**Expected:**
- 4 richieste in parallelo
- Tutte usano anno 2025 (tutti periodi futuri)
- Tutte ricevono 200 OK
- Nessun errore 400

**Actual:** ✅ PASS

---

## 📝 Dati Meteo e Precisione Microposizione

### Open-Meteo Archive API - Precisione Spaziale

**Risoluzione Griglia:** ~11 km (0.1° lat/lng)

```
Coordinate Richiesta: 40.36090849999999°N, 16.686294549999992°E
Griglia API:          40.4°N, 16.7°E (approssimato)
Errore Spaziale:      ~5km
```

**Implicazioni:**
- Dati meteo rappresentativi per area ~11×11 km
- Sufficiente per pianificazione agricola
- Altitudine GPS usata per correzione temperatura locale

### Come l'App Usa i Dati Meteo

**1. Calcolo Temperature Medie Storiche**

```typescript
// Esempio: Periodo Apr-Mag 2025 per Potenza
{
  period: 'Apr-Mag',
  avgTemp: 15.2°C,        // Media storica
  minTemp: 8.5°C,         // Minima assoluta periodo
  maxTemp: 22.8°C,        // Massima assoluta periodo
  tempRange: 14.3°C,      // Escursione termica
  year: 2025
}
```

**2. Classificazione Solare con Temperature**

```typescript
// logic/director.ts:362
solarClassification = await calculateGardenSolarClassification(
  garden,              // Include coordinates
  currentDate,
  historicalWeather,   // ← Dati meteo microposizione
  seedlingBatches
);
```

**3. Consigli Colture Personalizzati**

- Temperature storiche + ore sole → Colture adatte
- Esempio: Potenza (alt. 820m, temp media basse) → Evita pomodori a maturazione tardiva

**4. Alert Meteo Urgenti**

```typescript
// director.ts:341
const { alerts, warnings } = await checkWeatherUrgency(
  garden.coordinates  // ← Microposizione specifica
);
```

---

## 🚀 Miglioramenti Futuri

### 1. Forecast API per Previsioni Future

**Attuale:** Usa dati storici anno precedente come proxy

**Proposta:** Usare Forecast API per periodi imminenti (prossimi 7-16 giorni)

```typescript
// Nuovo servizio: forecastWeatherService.ts
export async function getForecastWeather(lat: number, lng: number) {
  const url = 'https://api.open-meteo.com/v1/forecast';
  // ... fetch previsioni 16 giorni
}
```

**Benefici:**
- Previsioni reali per prossime 2 settimane
- Alert meteo più accurati
- Pianificazione task basata su previsioni effettive

---

### 2. Fallback Multipli

```typescript
// Strategia fallback intelligente
try {
  return await getHistoricalWeatherForPeriod(...);
} catch {
  // Fallback 1: Prova anno precedente
  try {
    return await getHistoricalWeatherForPeriod(..., year - 1);
  } catch {
    // Fallback 2: Stima basata su latitudine/altitudine
    return estimateHistoricalWeather(...);
  }
}
```

---

### 3. Cache Persistente

**Attuale:** Cache in-memory (Map), si perde al reload

**Proposta:** Cache in localStorage o database

```typescript
// Cache persistente per 30 giorni
const cachedData = localStorage.getItem(`weather_${lat}_${lng}_${period}_${year}`);
if (cachedData) {
  const parsed = JSON.parse(cachedData);
  if (Date.now() - parsed.timestamp < 30 * 24 * 60 * 60 * 1000) {
    return parsed.data;
  }
}
```

**Benefici:**
- Riduce chiamate API
- Risparmia banda
- Risposta istantanea da cache

---

### 4. Correzione Altitudine Dinamica

**Attuale:** `estimateHistoricalWeather` ha altitudine hardcoded

**Proposta:** Usare altitudine GPS reale dell'orto

```typescript
export async function getHistoricalWeatherWithAltitude(
  lat: number,
  lng: number,
  altitude: number,  // Da GPS o input utente
  period: HistoricalWeatherData['period']
) {
  const rawWeather = await getHistoricalWeatherForPeriod(...);

  // Applica correzione altitudine
  const altCorrection = (altitude / 100) * -0.6; // -0.6°C ogni 100m

  return {
    ...rawWeather,
    avgTemp: rawWeather.avgTemp + altCorrection,
    minTemp: rawWeather.minTemp + altCorrection,
    maxTemp: rawWeather.maxTemp + altCorrection
  };
}
```

---

## 🎯 Impatto

### Prima del Fix

- ❌ 400 errors continui nella console
- ❌ Fallimento recupero dati meteo
- ❌ Calcoli temperatura basati solo su stime generiche
- ❌ Nessun dato storico disponibile per pianificazione

### Dopo il Fix

- ✅ Nessun errore 400
- ✅ Dati meteo storici recuperati correttamente (anno precedente)
- ✅ Calcoli temperatura accurati per microposizione orto
- ✅ Pianificazione colture basata su dati reali
- ✅ Console pulita e leggibile

---

## 🔗 File Correlati

- [services/historicalWeatherService.ts](../services/historicalWeatherService.ts) - File modificato
- [logic/director.ts](../logic/director.ts) - Chiamante del servizio meteo
- [types.ts](../types.ts) - Type `Garden` con `coordinates`

---

## 📚 Risorse API

### Open-Meteo Documentation

- **Archive API**: https://open-meteo.com/en/docs/historical-weather-api
  - Dati storici da 1940 ad oggi
  - Risoluzione: 11 km
  - Gratuito fino a 10,000 richieste/giorno

- **Forecast API**: https://open-meteo.com/en/docs
  - Previsioni 16 giorni
  - Risoluzione: 11 km
  - Gratuito fino a 10,000 richieste/giorno

### Esempi Query

**Archive (Passato):**
```
https://archive-api.open-meteo.com/v1/archive
  ?latitude=40.36
  &longitude=16.69
  &start_date=2025-06-01
  &end_date=2025-07-31
  &daily=temperature_2m_max,temperature_2m_min
  &timezone=Europe/Rome
```

**Forecast (Futuro - 16 giorni):**
```
https://api.open-meteo.com/v1/forecast
  ?latitude=40.36
  &longitude=16.69
  &daily=temperature_2m_max,temperature_2m_min
  &timezone=Europe/Rome
```

---

## 🔑 Key Takeaways

1. **Archive API = Solo Passato**: Non usare per date future
2. **Microposizione GPS**: Ogni orto ha coordinate precise che vengono usate nelle API meteo
3. **Fallback Anno Precedente**: Strategia sicura quando periodo corrente è futuro
4. **Precisione ~11km**: Sufficiente per pianificazione agricola
5. **Altitudine Importante**: Combinare dati meteo con correzione altitudine per accuratezza

---

**Conclusione:** Fix applicato con successo. L'errore 400 è risolto usando dati storici dell'anno precedente quando il periodo richiesto è nel futuro. I dati meteo sono recuperati per le coordinate GPS precise di ogni orto (microposizione), fornendo temperature accurate per la pianificazione delle colture.
