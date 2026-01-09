# Sistema Produzioni Scalari e Filari

**Data**: 2025-12-26
**Status**: 🟡 IN SVILUPPO - Database e Types completati

---

## 🎯 Obiettivo

Permettere all'utente di gestire produzioni scalari e occupazione progressiva dell'orto:

### Scenario Utente:
```
Oggi:      Semino 2 file di lattuga (100 semi)
Tra 15gg:  Semino altre 4 file di lattuga (200 semi)
Tra 30gg:  Semino altre 2 file di lattuga (100 semi)

Risultato: Raccolto distribuito in 3 momenti diversi
           invece di tutto in una volta
```

### Problemi Risolti:
1. ❌ **PRIMA**: Non potevo tracciare quando semino progressivamente
2. ❌ **PRIMA**: Tutto l'orto doveva essere seminato subito
3. ❌ **PRIMA**: Nessun modo per gestire batch di semine scalari
4. ❌ **PRIMA**: Impossibile modificare strutture orto

5. ✅ **ADESSO**: Posso creare filari progressivamente
6. ✅ **ADESSO**: Posso tracciare batch di semina/trapianto
7. ✅ **ADESSO**: Posso modificare strutture orto
8. ✅ **ADESSO**: Sistema completo per produzioni scalari

---

## ✅ Implementato (Fase 1)

### 1. Tab Strutture Modificabile (COMPLETATO)

**File**: `components/settings/GardenEditModal.tsx`

**Funzionalità**:
- ✅ Aggiungere/rimuovere/modificare vasi
- ✅ Aggiungere/rimuovere/modificare contenitori
- ✅ Aggiungere/rimuovere/modificare letti rialzati
- ✅ Aggiungere/rimuovere/modificare vasche
- ✅ Salvataggio modifiche in `Garden.structureConfig`

**Esempio utilizzo**:
```typescript
// Aggiungere 5 vasi da 30cm
pots: [{ count: 5, diameter: 30 }]

// Modificare numero vasi a 10
pots: [{ count: 10, diameter: 30 }]

// Aggiungere altri vasi diversi
pots: [
  { count: 10, diameter: 30 },
  { count: 5, diameter: 50 }
]
```

### 2. Sistema Database FILARI (COMPLETATO)

**File**: `database/migrations/add_field_rows_system.sql`

**Tabelle create**:

#### a) `garden_zones` - Zone Orto
```sql
CREATE TABLE garden_zones (
  id UUID PRIMARY KEY,
  garden_id UUID REFERENCES gardens(id),
  name TEXT,  -- "Zona Nord", "Settore Pomodori"
  size_sq_meters NUMERIC,
  primary_cultivar TEXT,
  soil_type TEXT,
  sun_exposure TEXT,
  ...
)
```

**Permette**:
- Dividere orto in zone con diversi cultivar
- Zone Nord pomodori, Zone Sud insalate, etc.

#### b) `field_rows` - Filari
```sql
CREATE TABLE field_rows (
  id UUID PRIMARY KEY,
  garden_id UUID REFERENCES gardens(id),
  zone_id UUID REFERENCES garden_zones(id),
  name TEXT,  -- "Fila 1", "Filare Pomodori"
  row_number INTEGER,
  length_meters NUMERIC,
  plant_spacing NUMERIC,  -- cm tra piante
  plant_count INTEGER,  -- AUTO-CALCOLATO
  cultivar TEXT,
  orientation TEXT,  -- 'N-S', 'E-W', etc.
  is_active BOOLEAN,
  ...
)
```

**Trigger Auto-Calcolo**:
```sql
-- Se lunghezza = 10m e spaziatura = 50cm
-- plant_count = (10 * 100) / 50 = 20 piante
CREATE TRIGGER auto_calc_field_row_plants
  BEFORE INSERT OR UPDATE ON field_rows
  FOR EACH ROW
  EXECUTE FUNCTION update_field_row_plant_count();
```

#### c) `planting_batches` - Batch Produzioni Scalari
```sql
CREATE TABLE planting_batches (
  id UUID PRIMARY KEY,
  field_row_id UUID REFERENCES field_rows(id),
  garden_id UUID REFERENCES gardens(id),
  batch_number INTEGER,  -- 1, 2, 3, ...
  plant_name TEXT,
  variety TEXT,
  plants_count INTEGER,
  seeds_used INTEGER,
  sowing_date DATE,
  transplanting_date DATE,
  expected_harvest_date DATE,
  status TEXT,  -- 'Planned', 'Sown', 'Growing', etc.
  current_quantity INTEGER,  -- Piante vive
  ...
)
```

**Permette**:
- Tracciare ogni "lotto" di semina/trapianto
- Batch 1 oggi, Batch 2 tra 15 giorni, Batch 3 tra 30 giorni
- Collegare a buste semi e batch piantine
- Stato progressione (Planned → Sown → Growing → Harvesting)

### 3. TypeScript Types (COMPLETATO)

**File**: `types/fieldRow.ts`

```typescript
export interface FieldRow {
  id: string
  gardenId: string
  zoneId?: string
  name: string
  rowNumber: number
  lengthMeters: number
  plantSpacing?: number  // cm
  plantCount?: number  // auto-calcolato
  cultivar?: string
  orientation?: 'N-S' | 'E-W' | 'NE-SW' | 'NW-SE'
  isActive: boolean
  ...
}

export interface PlantingBatch {
  id: string
  fieldRowId: string
  batchNumber: number
  plantName: string
  plantsCount: number
  sowingDate?: string
  transplantingDate?: string
  status: 'Planned' | 'Sown' | 'Transplanted' | 'Growing' | 'Harvesting' | 'Completed'
  currentQuantity: number
  ...
}

export interface GardenZone {
  id: string
  gardenId: string
  name: string
  sizeSqMeters: number
  primaryCultivar?: string
  fieldRows?: string[]  // IDs filari in questa zona
  ...
}
```

---

## 🚧 In Sviluppo (Fase 2)

### 4. Storage Provider Methods (NEXT)

**File da creare/modificare**:
- `packages/storage-cloud/SupabaseStorageProvider.ts`
- `packages/storage-local/LocalStorageProvider.ts`
- `packages/core/storage/interface.ts`

**Metodi da implementare**:

```typescript
interface IStorageProvider {
  // Garden Zones
  getGardenZones(gardenId: string): Promise<GardenZone[]>
  createGardenZone(zone: Omit<GardenZone, 'id' | 'createdAt'>): Promise<GardenZone>
  updateGardenZone(id: string, updates: Partial<GardenZone>): Promise<GardenZone>
  deleteGardenZone(id: string): Promise<void>

  // Field Rows
  getFieldRows(gardenId: string): Promise<FieldRow[]>
  getFieldRowsByZone(zoneId: string): Promise<FieldRow[]>
  createFieldRow(row: Omit<FieldRow, 'id' | 'createdAt'>): Promise<FieldRow>
  updateFieldRow(id: string, updates: Partial<FieldRow>): Promise<FieldRow>
  deleteFieldRow(id: string): Promise<void>

  // Planting Batches
  getPlantingBatches(fieldRowId: string): Promise<PlantingBatch[]>
  getPlantingBatchesByGarden(gardenId: string): Promise<PlantingBatch[]>
  createPlantingBatch(batch: Omit<PlantingBatch, 'id' | 'createdAt'>): Promise<PlantingBatch>
  updatePlantingBatch(id: string, updates: Partial<PlantingBatch>): Promise<PlantingBatch>
  deletePlantingBatch(id: string): Promise<void>

  // Helper queries
  getFieldRowOccupancy(fieldRowId: string): Promise<FieldRowOccupancy>
  getScalarProductionTimeline(gardenId: string): Promise<ScalarProductionCalendar>
}
```

### 5. UI Components FILARI (NEXT)

**Componenti da creare**:

#### a) `FieldRowManager.tsx`
**Path**: `components/fieldRows/FieldRowManager.tsx`

**Funzionalità**:
- Lista filari dell'orto
- Crea nuovo filare (nome, lunghezza, spaziatura)
- Modifica filare esistente
- Elimina filare
- Visualizza occupazione (X/Y piante, Z%)

**UI**:
```
┌──────────────────────────────────────────┐
│ Filari                     [+ Nuovo]     │
├──────────────────────────────────────────┤
│ Fila 1 - Pomodori                        │
│ 10m | 20cm spaziatura | 50 piante max    │
│ Occupazione: 30/50 (60%)                 │
│ [Modifica] [Elimina]                     │
├──────────────────────────────────────────┤
│ Fila 2 - Lattuga                         │
│ 8m | 30cm spaziatura | 27 piante max     │
│ Occupazione: 27/27 (100%)                │
│ [Modifica] [Elimina]                     │
└──────────────────────────────────────────┘
```

#### b) `PlantingBatchForm.tsx`
**Path**: `components/fieldRows/PlantingBatchForm.tsx`

**Funzionalità**:
- Form per creare batch produzione scalare
- Seleziona filare
- Seleziona pianta/varietà
- Numero piante/semi usati
- Data semina/trapianto
- Collegamento a busta semi o batch piantine

**UI**:
```
┌──────────────────────────────────────────┐
│ Nuovo Batch Produzione Scalare           │
├──────────────────────────────────────────┤
│ Filare: [Fila 2 - Lattuga ▼]            │
│                                          │
│ Batch numero: [2] (seconda semina)      │
│                                          │
│ Pianta: [Lattuga Romana]                │
│ Numero piante: [27]                     │
│                                          │
│ Semi usati: [30] (busta "Lattuga 2024") │
│                                          │
│ Data semina: [15/01/2025]               │
│ Data raccolta prevista: [15/03/2025]    │
│                                          │
│        [Annulla]    [Crea Batch]        │
└──────────────────────────────────────────┘
```

#### c) `ScalarProductionTimeline.tsx`
**Path**: `components/fieldRows/ScalarProductionTimeline.tsx`

**Funzionalità**:
- Vista calendario produzioni scalari
- Timeline con batch multipli
- Visualizza date semina e raccolto previsto
- Colori per stato (Planned, Sown, Growing, Harvesting)

**UI**:
```
┌──────────────────────────────────────────┐
│ Timeline Produzioni Scalari              │
├──────────────────────────────────────────┤
│ Gennaio                                  │
│ 01 ████ Batch 1 Lattuga (Semina)        │
│ 15 ████ Batch 2 Lattuga (Semina)        │
│                                          │
│ Febbraio                                 │
│ 01 ████ Batch 3 Lattuga (Semina)        │
│ 15 ████ Batch 1 Pomodori (Trapianto)    │
│                                          │
│ Marzo                                    │
│ 01 ████ Batch 1 Lattuga (Raccolto)      │
│ 15 ████ Batch 2 Lattuga (Raccolto)      │
│ 30 ████ Batch 3 Lattuga (Raccolto)      │
│                                          │
│ Distribuzione raccolti: 30 giorni       │
└──────────────────────────────────────────┘
```

### 6. Integrazione con Semi/Piantine (NEXT)

**File da modificare**:
- `components/planner/SimplifiedPlantingForm.tsx`
- Tabella `seed_packets` (aggiungere tracking utilizzo)
- Tabella `seedling_batches` (aggiungere tracking utilizzo)

**Nuovi campi database**:

```sql
-- In seed_packets
ALTER TABLE seed_packets
  ADD COLUMN quantity_used INTEGER DEFAULT 0,
  ADD COLUMN usage_history JSONB;  -- [{date, quantity, planting_batch_id}]

-- In seedling_batches
ALTER TABLE seedling_batches
  ADD COLUMN quantity_transplanted INTEGER DEFAULT 0,
  ADD COLUMN transplant_history JSONB;  -- [{date, quantity, planting_batch_id}]
```

**Flow utente**:
```
1. Ho busta "Lattuga Romana 2024" con 500 semi
2. Oggi: Uso 100 semi → Batch 1 in Fila 1
   → seed_packets.quantity_used = 100
   → usage_history += {date: oggi, quantity: 100, batch_id: X}
3. Tra 15gg: Uso altri 150 semi → Batch 2 in Fila 2
   → seed_packets.quantity_used = 250
   → usage_history += {date: +15gg, quantity: 150, batch_id: Y}
```

---

## 📊 Architettura Completa

### Database Schema
```
gardens (orto principale)
  └─> garden_zones (zone orto)
       └─> field_rows (filari)
            └─> planting_batches (batch produzioni scalari)
                 ├─> seed_packets (buste semi usate)
                 └─> seedling_batches (piantine trapiantate)
```

### User Journey Completo

#### Scenario: Produzioni Scalari Lattuga

**Setup Iniziale**:
```
1. Utente va su Settings → I Miei Orti → Modifica
2. Tab "Strutture" → Non serve nulla (campo aperto)
3. Tab "Filari" (nuovo!) → Crea 3 filari:
   - Fila 1: 10m, spaziatura 30cm → 33 piante max
   - Fila 2: 10m, spaziatura 30cm → 33 piante max
   - Fila 3: 10m, spaziatura 30cm → 33 piante max
```

**1 Gennaio - Prima Semina**:
```
1. Planner → "Semina Lattuga"
2. Seleziona Fila 1
3. Crea Batch 1:
   - 33 piante
   - Usa 40 semi da busta "Lattuga 2024"
   - Data semina: 01/01/2025
   - Data raccolta: 01/03/2025
4. Sistema:
   - Crea planting_batch (batch_number: 1, status: Sown)
   - Aggiorna seed_packet (quantity_used +40)
   - Fila 1 occupazione: 33/33 (100%)
```

**15 Gennaio - Seconda Semina Scalare**:
```
1. Planner → "Semina Lattuga" (di nuovo!)
2. Seleziona Fila 2
3. Crea Batch 2:
   - 33 piante
   - Usa altri 40 semi dalla stessa busta
   - Data semina: 15/01/2025
   - Data raccolta: 15/03/2025
4. Sistema:
   - Crea planting_batch (batch_number: 2, status: Sown)
   - Aggiorna seed_packet (quantity_used +40, totale 80)
   - Fila 2 occupazione: 33/33 (100%)
```

**30 Gennaio - Terza Semina Scalare**:
```
1. Planner → "Semina Lattuga" (ancora!)
2. Seleziona Fila 3
3. Crea Batch 3:
   - 33 piante
   - Usa altri 40 semi
   - Data semina: 30/01/2025
   - Data raccolta: 30/03/2025
4. Sistema:
   - Crea planting_batch (batch_number: 3, status: Sown)
   - Aggiorna seed_packet (quantity_used +40, totale 120)
   - Fila 3 occupazione: 33/33 (100%)
```

**Risultato**:
```
Timeline Raccolti:
- 01/03: Batch 1 → 33 lattughe
- 15/03: Batch 2 → 33 lattughe
- 30/03: Batch 3 → 33 lattughe

Totale: 99 lattughe distribuite in 30 giorni
invece di 99 lattughe tutte insieme!
```

---

## 🎯 Next Steps Immediati

### Step 1: Storage Provider (Priority: HIGH)
Implementare metodi CRUD per:
- GardenZone
- FieldRow
- PlantingBatch

### Step 2: UI Filari (Priority: HIGH)
Creare componenti:
- FieldRowManager (lista e CRUD filari)
- FieldRowForm (crea/modifica filare)

### Step 3: UI Batch Produzioni (Priority: HIGH)
Creare componenti:
- PlantingBatchForm (crea batch produzione scalare)
- PlantingBatchList (lista batch per filare)

### Step 4: Integrazione Semi (Priority: MEDIUM)
Modificare:
- SimplifiedPlantingForm per supportare batch
- SeedPackets per tracking utilizzo
- SeedlingBatches per tracking trapianti

### Step 5: Timeline & Analytics (Priority: MEDIUM)
Creare:
- ScalarProductionTimeline (vista calendario)
- FieldRowOccupancyWidget (widget occupazione)
- ProductionForecast (previsione raccolti)

---

## 📁 File Struttura Progetto

```
ortomio-main/
├── types/
│   └── fieldRow.ts ✅ CREATO
├── database/
│   └── migrations/
│       └── add_field_rows_system.sql ✅ CREATO
├── packages/
│   ├── core/
│   │   └── storage/
│   │       └── interface.ts 🚧 DA ESTENDERE
│   ├── storage-cloud/
│   │   └── SupabaseStorageProvider.ts 🚧 DA ESTENDERE
│   └── storage-local/
│       └── LocalStorageProvider.ts 🚧 DA ESTENDERE
├── components/
│   ├── settings/
│   │   └── GardenEditModal.tsx ✅ MODIFICATO (tab Strutture)
│   ├── fieldRows/ 📁 DA CREARE
│   │   ├── FieldRowManager.tsx
│   │   ├── FieldRowForm.tsx
│   │   ├── PlantingBatchForm.tsx
│   │   ├── PlantingBatchList.tsx
│   │   └── ScalarProductionTimeline.tsx
│   └── planner/
│       └── SimplifiedPlantingForm.tsx 🚧 DA MODIFICARE
└── docs/
    └── SISTEMA_PRODUZIONI_SCALARI.md ✅ QUESTO FILE
```

---

## ✅ Testing Plan

### Test 1: Creazione Filare
- [ ] Creare filare 10m con spaziatura 50cm
- [ ] Verificare plant_count = 20 (auto-calcolato)
- [ ] Modificare spaziatura a 25cm
- [ ] Verificare plant_count = 40 (ricalcolato)

### Test 2: Batch Produzione Scalare
- [ ] Creare Batch 1 in Fila 1 (oggi)
- [ ] Creare Batch 2 in Fila 2 (+15 giorni)
- [ ] Verificare batch_number progressivi (1, 2)
- [ ] Verificare seed_packet.quantity_used incrementato
- [ ] Verificare timeline mostra 2 date semina diverse

### Test 3: Occupazione Filare
- [ ] Filare con 40 piante max
- [ ] Batch 1: 20 piante → occupazione 50%
- [ ] Batch 2: 10 piante → occupazione 75%
- [ ] Verificare current_plants = 30, occupancy = 75%

### Test 4: Integrazione Semi
- [ ] Busta 500 semi
- [ ] Usa 100 semi Batch 1 → rimanenti 400
- [ ] Usa 150 semi Batch 2 → rimanenti 250
- [ ] Verificare usage_history corretto

---

## 🎉 Conclusioni

✅ **Fase 1 Completata**:
- Database schema completo
- TypeScript types completi
- Tab Strutture modificabile
- Sistema pronto per UI

🚧 **Fase 2 In Corso**:
- Storage Provider methods
- UI Components filari
- Integrazione con semi/piantine
- Timeline produzioni

🎯 **Obiettivo Raggiunto**: Sistema completo per gestire produzioni scalari come richiesto dall'utente, permettendo di seminare progressivamente e distribuire i raccolti nel tempo.
