# ✅ FASE 2C: Tracciamento Piante Serra - COMPLETATO

**Data:** 13 Febbraio 2026  
**Obiettivo:** Estendere tracciamento piante individuali per serra

---

## 🎯 OBIETTIVO RAGGIUNTO

Esteso il sistema di tracciamento piante individuali per supportare serra:
- ✅ Collegamento piante → bancali serra
- ✅ Posizione 3D su bancale (fila, posizione)
- ✅ Parametri ambientali serra al momento impianto
- ✅ Parametri ambientali serra al momento operazioni
- ✅ Parametri ambientali serra al momento raccolto (+ storico crescita)
- ✅ Aggiornamento automatico conteggio piante su bancale
- ✅ Views per statistiche produzione per bancale
- ✅ Funzione griglia piante su bancale

---

## 📁 FILE MODIFICATI/CREATI

### 1. Migrazione Database
**File:** `supabase/migrations/20260213000001_extend_individual_plants_greenhouse.sql`

**Modifiche tabella `individual_plants`:**
```sql
-- Collegamento bancale serra
greenhouse_bench_id UUID REFERENCES greenhouse_benches(id)

-- Posizione sul bancale
bench_row_number INTEGER
position_in_bench_row INTEGER
bench_name TEXT (helper per display)

-- Parametri ambientali serra (JSONB)
greenhouse_conditions JSONB
```

**Modifiche tabella `individual_plant_operations`:**
```sql
-- Parametri ambientali serra al momento operazione (JSONB)
greenhouse_conditions JSONB
```

**Modifiche tabella `plant_harvests`:**
```sql
-- Parametri ambientali serra al momento raccolto + storico (JSONB)
greenhouse_conditions JSONB
```

---

### 2. Storage Provider
**File:** `packages/storage-cloud/SupabaseStorageProvider.ts`

**Metodi aggiunti:**
- `getPlantHarvests(plantId)` - Lista raccolti per pianta
- `createPlantHarvest(harvest)` - Crea raccolto
- `updatePlantHarvest(id, updates)` - Aggiorna raccolto
- `deletePlantHarvest(id)` - Elimina raccolto
- `mapPlantHarvestFromDB(db)` - Mapping DB → TypeScript
- `mapPlantHarvestToDB(harvest)` - Mapping TypeScript → DB

**Metodi aggiornati:**
- `mapIndividualPlantFromDB()` - Aggiunto supporto campi serra
- `mapIndividualPlantToDB()` - Aggiunto supporto campi serra
- `getPlantOperations()` - Aggiunto supporto greenhouseConditions
- `createPlantOperation()` - Aggiunto supporto greenhouseConditions

---

### 3. Interface Storage Provider
**File:** `packages/core/storage/interface.ts`

**Metodi aggiunti:**
```typescript
// Individual Plant Harvests
getPlantHarvests?(plantId: string): Promise<PlantHarvest[]>;
createPlantHarvest?(harvest: Omit<PlantHarvest, 'id' | 'createdAt'>): Promise<PlantHarvest>;
updatePlantHarvest?(id: string, updates: Partial<PlantHarvest>): Promise<PlantHarvest>;
deletePlantHarvest?(id: string): Promise<void>;
```

---

## 🗄️ DATABASE

### Tabella: individual_plants (ESTESA)

**Nuove colonne:**
```sql
greenhouse_bench_id UUID          -- FK → greenhouse_benches
bench_row_number INTEGER          -- Fila sul bancale (1, 2, 3...)
position_in_bench_row INTEGER     -- Posizione nella fila
bench_name TEXT                   -- Nome bancale (helper)
greenhouse_conditions JSONB       -- Parametri serra al momento impianto
```

**Struttura greenhouseConditions (JSONB):**
```json
{
  "internalTemperature": 22.5,
  "internalHumidity": 65,
  "co2Level": 800,
  "lightIntensity": 15000,
  "ventilationActive": false,
  "heatingActive": true,
  "shadingActive": false,
  "temperatureDelta": 7.5,
  "humidityDelta": -5
}
```

**Indici aggiunti:**
- `idx_individual_plants_greenhouse_bench` - Query per bancale
- `idx_individual_plants_bench_position` - Query per posizione su bancale

**Constraint:**
- `check_greenhouse_position` - Se bancale specificato, deve avere fila e posizione

---

### Tabella: individual_plant_operations (ESTESA)

**Nuova colonna:**
```sql
greenhouse_conditions JSONB       -- Parametri serra al momento operazione
```

**Struttura greenhouseConditions (JSONB):**
```json
{
  "internalTemperature": 23.0,
  "internalHumidity": 68,
  "co2Level": 850,
  "lightIntensity": 18000,
  "ventilationActive": true,
  "heatingActive": false,
  "shadingActive": false,
  "temperatureDelta": 8.0,
  "humidityDelta": -2
}
```

---

### Tabella: plant_harvests (CREATA/ESTESA)

**Struttura completa:**
```sql
id UUID PRIMARY KEY
plant_id UUID NOT NULL REFERENCES individual_plants(id)
garden_id UUID NOT NULL REFERENCES gardens(id)

-- Dettagli raccolta
harvest_date DATE NOT NULL
harvest_time TIME

-- Quantità
quantity_kg NUMERIC(10,3) NOT NULL
quality_grade TEXT (excellent|good|fair|poor)
quality_score INTEGER (0-100)

-- Classificazione
size_category TEXT (large|medium|small)
ripeness_level TEXT (unripe|perfect|overripe)

-- Destinazione
destination TEXT (consumption|storage|processing|sale|seed)
market_value NUMERIC(10,2)
storage_method TEXT (fresh|refrigerated|frozen|dried)

-- Condizioni
weather_conditions JSONB
greenhouse_conditions JSONB  -- NUOVO

-- Media
photos TEXT[]
notes TEXT

-- Metadata
created_at TIMESTAMPTZ
```

**Struttura greenhouseConditions (JSONB):**
```json
{
  "internalTemperature": 24.0,
  "internalHumidity": 70,
  "co2Level": 900,
  
  // Storico parametri durante crescita
  "avgTemperature": 22.8,
  "avgHumidity": 67,
  "avgCo2": 850,
  
  // Giorni con condizioni ottimali
  "daysOptimalTemp": 45,
  "daysOptimalHumidity": 42,
  "daysOptimalCo2": 38,
  
  // Differenziali medi
  "avgTemperatureDelta": 7.2,
  "avgHumidityDelta": -3
}
```

**Indici:**
- `idx_plant_harvests_plant` - Query per pianta
- `idx_plant_harvests_garden` - Query per orto
- `idx_plant_harvests_date` - Query per data

**RLS Policies:**
- ✅ SELECT: solo dati propri
- ✅ INSERT: solo nei propri orti
- ✅ UPDATE: solo dati propri
- ✅ DELETE: solo dati propri

---

## 🔧 FUNZIONALITÀ IMPLEMENTATE

### 1. Collegamento Piante → Bancali

✅ **Posizione 3D completa:**
- Bancale (greenhouseBenchId)
- Fila sul bancale (benchRowNumber: 1, 2, 3...)
- Posizione nella fila (positionInBenchRow: 1, 2, 3...)

✅ **Codice pianta esteso:**
- Campo aperto: "F1-P001" (Filare 1, Pianta 001)
- Serra: "B1-R2-P003" (Bancale 1, Riga 2, Pianta 003)

✅ **Helper display:**
- benchName per visualizzazione rapida
- fieldRowName per compatibilità campo aperto

---

### 2. Parametri Ambientali Serra

✅ **Al momento impianto (GardenPlant):**
- Temperatura interna/esterna
- Umidità interna/esterna
- CO2 (ppm)
- Intensità luminosa (lux)
- Sistemi attivi (ventilazione, riscaldamento, ombreggiamento)
- Differenziali (interno - esterno)

✅ **Al momento operazione (PlantOperation):**
- Stessi parametri di impianto
- Snapshot condizioni al momento operazione
- Utile per correlazioni operazione → risultato

✅ **Al momento raccolto (PlantHarvest):**
- Parametri correnti al momento raccolto
- **Storico crescita:**
  - Temperatura media durante crescita
  - Umidità media durante crescita
  - CO2 medio durante crescita
- **Giorni ottimali:**
  - Giorni con temperatura ottimale
  - Giorni con umidità ottimale
  - Giorni con CO2 ottimale
- **Differenziali medi:**
  - Delta temperatura medio
  - Delta umidità medio

---

### 3. Aggiornamento Automatico Conteggio

✅ **Trigger `update_bench_plant_count`:**
- Incrementa `current_plants` quando pianta aggiunta a bancale
- Decrementa `current_plants` quando pianta rimossa da bancale
- Gestisce spostamenti tra bancali
- Previene conteggi negativi (GREATEST(0, ...))

✅ **Trigger automatici:**
- INSERT: +1 pianta su bancale
- DELETE: -1 pianta da bancale
- UPDATE: gestisce spostamenti tra bancali

---

### 4. Views Statistiche

#### View: greenhouse_plants_with_stats

**Fornisce:**
- Info pianta completa
- Info bancale (nome, numero, posizione, substrato, sistemi)
- Statistiche operazioni (totale, ultima data)
- Statistiche raccolti (totale, kg totali, ultima data)

**Uso:**
```sql
SELECT * FROM greenhouse_plants_with_stats 
WHERE garden_id = 'xxx' 
ORDER BY bench_number, bench_row_number, position_in_bench_row;
```

---

#### View: bench_production_stats

**Fornisce:**
- Statistiche piante (totale, sane, malate, salute media)
- Statistiche raccolti (totale, kg totali, media per pianta, qualità media)
- Date (primo/ultimo impianto, primo/ultimo raccolto)
- Parametri ambientali medi ultimi 30 giorni (temp, umidità)

**Uso:**
```sql
SELECT * FROM bench_production_stats 
WHERE garden_id = 'xxx' 
ORDER BY total_production_kg DESC;
```

---

### 5. Funzioni Helper

#### Funzione: get_bench_plants_grid(bench_id)

**Fornisce:**
- Griglia piante su bancale
- Ordinata per fila e posizione
- Utile per visualizzazione 2D

**Ritorna:**
```sql
row_number INTEGER
position INTEGER
plant_id UUID
plant_code TEXT
plant_name TEXT
status TEXT
health_score INTEGER
```

**Uso:**
```sql
SELECT * FROM get_bench_plants_grid('bench-id');
```

**Output esempio:**
```
row_number | position | plant_code | plant_name | status  | health_score
-----------+----------+------------+------------+---------+-------------
1          | 1        | B1-R1-P001 | Pomodoro   | healthy | 95
1          | 2        | B1-R1-P002 | Pomodoro   | healthy | 92
2          | 1        | B1-R2-P001 | Pomodoro   | healthy | 88
2          | 2        | B1-R2-P002 | Pomodoro   | diseased| 65
```

---

## 📊 ESEMPI USO

### Esempio 1: Creare Pianta in Serra

```typescript
const plant = await storageProvider.createIndividualPlant({
  gardenId: 'garden-id',
  greenhouseBenchId: 'bench-id',
  benchRowNumber: 2,
  positionInBenchRow: 5,
  plantCode: 'B1-R2-P005',
  plantName: 'Pomodoro',
  variety: 'San Marzano',
  plantingDate: '2026-02-13',
  status: 'healthy',
  healthScore: 100,
  
  // Parametri serra al momento impianto
  greenhouseConditions: {
    internalTemperature: 22.5,
    internalHumidity: 65,
    co2Level: 800,
    lightIntensity: 15000,
    ventilationActive: false,
    heatingActive: true,
    shadingActive: false,
    temperatureDelta: 7.5,
    humidityDelta: -5
  }
});
```

---

### Esempio 2: Registrare Operazione con Parametri Serra

```typescript
const operation = await storageProvider.createPlantOperation({
  plantId: 'plant-id',
  gardenId: 'garden-id',
  operationType: 'fertilizing',
  date: '2026-02-20',
  productName: 'Concime NPK 10-10-10',
  quantity: 50,
  unit: 'ml',
  
  // Parametri serra al momento operazione
  greenhouseConditions: {
    internalTemperature: 23.0,
    internalHumidity: 68,
    co2Level: 850,
    lightIntensity: 18000,
    ventilationActive: true,
    heatingActive: false,
    shadingActive: false,
    temperatureDelta: 8.0,
    humidityDelta: -2
  }
});
```

---

### Esempio 3: Registrare Raccolto con Storico Crescita

```typescript
const harvest = await storageProvider.createPlantHarvest({
  plantId: 'plant-id',
  gardenId: 'garden-id',
  harvestDate: '2026-04-15',
  quantityKg: 2.5,
  qualityGrade: 'excellent',
  qualityScore: 95,
  sizeCategory: 'large',
  ripenessLevel: 'perfect',
  destination: 'consumption',
  
  // Parametri serra al momento raccolto + storico crescita
  greenhouseConditions: {
    internalTemperature: 24.0,
    internalHumidity: 70,
    co2Level: 900,
    
    // Storico parametri durante crescita (60 giorni)
    avgTemperature: 22.8,
    avgHumidity: 67,
    avgCo2: 850,
    
    // Giorni con condizioni ottimali
    daysOptimalTemp: 45,      // 75% dei giorni
    daysOptimalHumidity: 42,  // 70% dei giorni
    daysOptimalCo2: 38,       // 63% dei giorni
    
    // Differenziali medi
    avgTemperatureDelta: 7.2,
    avgHumidityDelta: -3
  }
});
```

---

### Esempio 4: Query Statistiche Bancale

```typescript
// Via Supabase client
const { data } = await supabase
  .from('bench_production_stats')
  .select('*')
  .eq('garden_id', 'garden-id')
  .order('total_production_kg', { ascending: false });

// Output:
[
  {
    bench_id: 'bench-1',
    bench_name: 'Bancale Nord',
    bench_number: 1,
    position: 'north',
    total_plants: 40,
    healthy_plants: 38,
    diseased_plants: 2,
    avg_health_score: 92.5,
    total_harvests: 120,
    total_production_kg: 95.5,
    avg_harvest_per_plant: 2.39,
    avg_quality_score: 88,
    avg_temperature_30d: 22.8,
    avg_humidity_30d: 67
  },
  // ...
]
```

---

### Esempio 5: Griglia Piante su Bancale

```typescript
// Via Supabase client
const { data } = await supabase
  .rpc('get_bench_plants_grid', { p_bench_id: 'bench-id' });

// Output:
[
  { row_number: 1, position: 1, plant_code: 'B1-R1-P001', plant_name: 'Pomodoro', status: 'healthy', health_score: 95 },
  { row_number: 1, position: 2, plant_code: 'B1-R1-P002', plant_name: 'Pomodoro', status: 'healthy', health_score: 92 },
  { row_number: 2, position: 1, plant_code: 'B1-R2-P001', plant_name: 'Pomodoro', status: 'healthy', health_score: 88 },
  { row_number: 2, position: 2, plant_code: 'B1-R2-P002', plant_name: 'Pomodoro', status: 'diseased', health_score: 65 },
  // ...
]
```

---

## 🔐 SICUREZZA

### Row Level Security (RLS)

✅ **Tabella plant_harvests:**
- SELECT: solo dati propri
- INSERT: solo nei propri orti
- UPDATE: solo dati propri
- DELETE: solo dati propri

✅ **Isolamento completo:**
- Ogni utente vede solo i propri raccolti
- Nessun accesso cross-user

---

## 📈 PERFORMANCE

### Indici Ottimizzati

✅ **individual_plants:**
- `idx_individual_plants_greenhouse_bench` - Query per bancale
- `idx_individual_plants_bench_position` - Query per posizione

✅ **plant_harvests:**
- `idx_plant_harvests_plant` - Query per pianta
- `idx_plant_harvests_garden` - Query per orto
- `idx_plant_harvests_date` - Query per data

### Trigger Efficienti

✅ **update_bench_plant_count:**
- Aggiornamento automatico conteggio
- Nessun calcolo runtime necessario
- Performance ottimale

---

## 🔄 COMPATIBILITÀ

### Backward Compatible

✅ **Nessun breaking change:**
- Colonne nullable (opzionali)
- Piante esistenti continuano a funzionare
- Supporto campo aperto + serra

✅ **Graceful degradation:**
- Se greenhouseConditions null → nessun errore
- Se benchId null → pianta campo aperto
- Compatibilità totale con codice esistente

---

## 📝 PROSSIMI PASSI

### Fase 2D: UI Gestione Bancali (2-3 giorni)

**Task 2D.1:** Form Creazione Bancale
- Wizard step-by-step
- Validazione dimensioni
- Calcolo automatico capacità

**Task 2D.2:** Lista Bancali
- Card view con statistiche
- Filtri (attivi, posizione)
- Ordinamento

**Task 2D.3:** Form Registrazione Letture
- Form semplice parametri
- Auto-popolamento ultima lettura
- Validazione range

**Task 2D.4:** Dashboard Parametri
- Grafici temperatura/umidità/CO2
- Storico letture
- Alert fuori range

**Task 2D.5:** Griglia Piante su Bancale
- Visualizzazione 2D bancale
- Drag & drop piante
- Colori per stato salute

---

### Fase 2E: Analytics Serra (2-3 giorni)

**Task 2E.1:** Servizio GreenhouseAnalyticsService
- Calcolo correlazioni parametri → resa/qualità
- Identificazione range ottimali
- Confronto performance bancali

**Task 2E.2:** Dashboard Analytics
- Grafici correlazioni
- Confronto bancali
- Suggerimenti ottimizzazione

**Task 2E.3:** Integrazione con GreenhouseDirector
- Alert basati su analytics
- Suggerimenti personalizzati
- Predizioni resa

---

## ✅ CHECKLIST COMPLETAMENTO

- [x] Estesa tabella individual_plants con campi serra
- [x] Estesa tabella individual_plant_operations con parametri serra
- [x] Creata/estesa tabella plant_harvests con parametri serra
- [x] Aggiornati mapping in SupabaseStorageProvider
- [x] Implementati metodi CRUD per plant_harvests
- [x] Creata migrazione database
- [x] Aggiunti indici per performance
- [x] Configurate RLS policies
- [x] Creato trigger aggiornamento conteggio piante
- [x] Create views statistiche
- [x] Creata funzione griglia piante
- [x] Constraints validazione
- [x] Gestione errori graceful
- [x] Logging operazioni
- [x] Type-safe con import dinamici
- [x] Backward compatible
- [x] Documentazione completa

---

## 🎉 RISULTATO

**Fase 2C completata con successo!**

Il sistema ora supporta:
- ✅ Tracciamento completo piante individuali in serra
- ✅ Posizione 3D su bancale (bancale, fila, posizione)
- ✅ Parametri ambientali serra per impianto/operazioni/raccolti
- ✅ Storico parametri durante crescita
- ✅ Aggiornamento automatico conteggio piante su bancale
- ✅ Statistiche produzione per bancale
- ✅ Griglia piante per visualizzazione 2D
- ✅ Pronto per UI gestione bancali (Fase 2D)

**Stesso livello di tracciamento di idroponica, ma per serra!**

---

**Tempo stimato:** 3-4 giorni  
**Tempo effettivo:** ~1.5 ore (implementazione rapida)

---

**Prossimo step:** Fase 2D - UI gestione bancali e registrazione letture

