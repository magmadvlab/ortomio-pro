# 📋 Analisi Completa: Field Rows e Integrazione Sistema

**Data:** 2026-01-04
**Scopo:** Chiarire l'architettura dei filari di campo aperto e la loro integrazione con il sistema

---

## 🎯 Domande da Risolvere

1. **Come viene registrata la coltura** quando modifichi i dati del Filare 1 e aggiungi "Pomodori"?
2. **Come si aggiunge irrigazione** al Filare 1?
3. **Come si registrano trattamenti e fertilizzanti** sul Filare 1?
4. **Come gestire superfici molto grandi** (es. 20 ettari)?
5. **Integrazione con Director/Orchestrator**?

---

## 📊 Architettura Attuale

### Gerarchia Database

```
Garden
├── garden_beds (Letti/Aiuole)
│   └── garden_rows (Filari dei letti)
│       ├── Usati per: letti rialzati, contenitori, serre
│       └── Hanno: irrigation_line (JSONB)
│
└── field_rows (Filari di campo aperto) ⭐ NUOVO SISTEMA
    ├── Usati per: campi aperti, grandi superfici
    ├── Collegamenti:
    │   ├── garden_zones (opzionale) - per dividere zone diverse
    │   └── planting_batches - per produzioni scalari
    │
    └── Hanno:
        ├── cultivar (TEXT) - nome coltura
        ├── irrigation_line (JSONB) - config irrigazione
        ├── planted_date (DATE) - data semina/trapianto
        ├── is_active (BOOLEAN) - se in produzione
        └── plant_spacing (cm) → auto-calcola plant_count

```

---

## ✅ Risposta Domanda 1: Registrazione Coltura

### Scenario: Modifichi Filare 1 e aggiungi "Pomodori"

**Cosa succede:**

```typescript
// GardenEditModal.tsx - handleSaveFieldRow()
await storageProvider.updateFieldRow(filareId, {
  cultivar: "Pomodoro Datterino",  // ← Salvato direttamente nel field_row
  planted_date: "2026-01-04",      // ← Data semina
  plant_spacing: 50,                // ← Spaziatura piante (cm)
  is_active: true                   // ← Filare attivo
})
```

**Database:**
```sql
UPDATE field_rows
SET
  cultivar = 'Pomodoro Datterino',
  planted_date = '2026-01-04',
  plant_spacing = 50,
  is_active = true,
  -- TRIGGER auto-calcola:
  plant_count = FLOOR((length_meters * 100) / plant_spacing)
WHERE id = filare_id;
```

**Esempio:**
- Filare lungo 10 metri
- Spaziatura piante: 50 cm
- **Auto-calcolo:** (10 * 100) / 50 = **20 piante**

### ⚠️ PROBLEMA ATTUALE

**Il form di modifica NON ha ancora i campi:**
- `plant_spacing` (spaziatura piante)
- `planted_date` (data semina)
- `orientation` (orientamento N-S, E-W, ecc.)
- `irrigation_line` (configurazione irrigazione)

**Soluzione:** Estendere il form in `GardenEditModal.tsx`

---

## ✅ Risposta Domanda 2: Irrigazione Filare

### Come aggiungere irrigazione al Filare 1?

**Database Schema:**
```typescript
interface FieldRow {
  // ... altri campi
  irrigation_line?: {
    lineType: 'Dripline' | 'PipeWithDrippers' | 'MicroSprinkler'
    pipeDiameterMm?: number
    emitterSpacingCm?: number      // Distanza gocciolatori
    emitterFlowRateLph?: number    // Portata per gocciolatore (L/h)
    flowRatePerMeterLph?: number   // Portata per metro lineare (L/h/m)
  }
}
```

**Esempio Configurazione:**

```typescript
// Filare 1: Ala gocciolante
await storageProvider.updateFieldRow(filare1Id, {
  irrigation_line: {
    lineType: 'Dripline',
    pipeDiameterMm: 16,
    flowRatePerMeterLph: 2.5  // 2.5 L/h per metro
  }
})

// Calcolo automatico fabbisogno:
// - Filare lungo 10m
// - Portata: 10m × 2.5 L/h/m = 25 L/h
```

**Integrazione con Irrigation System:**

Il `director.ts` può usare questi dati per:
1. Calcolare fabbisogno idrico totale dell'orto
2. Pianificare turni di irrigazione
3. Gestire settori/zone irrigue

---

## ✅ Risposta Domanda 3: Trattamenti e Fertilizzanti

### PROBLEMA: Schema Attuale NON supporta field_rows

**Tabelle attuali:**
```sql
-- treatment_registry
CREATE TABLE treatment_registry (
  bed_id UUID REFERENCES garden_beds,    -- ✅ Supporta beds
  zone_id UUID REFERENCES garden_zones,  -- ✅ Supporta zones
  row_id UUID REFERENCES garden_rows     -- ❌ Riferisce garden_rows (filari dei letti)
);

-- fertilization_logs
CREATE TABLE fertilization_logs (
  bed_id UUID REFERENCES garden_beds,    -- ✅ Supporta beds
  zone_id UUID REFERENCES garden_zones,  -- ✅ Supporta zones
  row_id UUID REFERENCES garden_rows     -- ❌ Riferisce garden_rows (filari dei letti)
);
```

### 🔧 SOLUZIONE NECESSARIA

**Migration richiesta:**

```sql
-- Rinominare colonne esistenti per chiarezza
ALTER TABLE treatment_registry
  RENAME COLUMN row_id TO bed_row_id;

ALTER TABLE fertilization_logs
  RENAME COLUMN row_id TO bed_row_id;

-- Aggiungere supporto field_rows
ALTER TABLE treatment_registry
  ADD COLUMN field_row_id UUID REFERENCES field_rows(id) ON DELETE SET NULL;

ALTER TABLE fertilization_logs
  ADD COLUMN field_row_id UUID REFERENCES field_rows(id) ON DELETE SET NULL;

-- Constraint: o bed_row_id o field_row_id, non entrambi
ALTER TABLE treatment_registry
  ADD CONSTRAINT check_row_reference
  CHECK (
    (bed_row_id IS NOT NULL AND field_row_id IS NULL) OR
    (bed_row_id IS NULL AND field_row_id IS NOT NULL) OR
    (bed_row_id IS NULL AND field_row_id IS NULL)
  );

-- Indici
CREATE INDEX idx_treatment_field_row ON treatment_registry(field_row_id);
CREATE INDEX idx_fertilization_field_row ON fertilization_logs(field_row_id);
```

**Uso dopo la migration:**

```typescript
// Registra trattamento sul Filare 1
await storageProvider.createTreatmentRecord({
  garden_id: gardenId,
  field_row_id: filare1Id,  // ← Nuovo campo
  crop_name: "Pomodoro Datterino",
  treatment_date: "2026-01-04",
  product_name: "Rame fungicida",
  dosage: 200,
  dosage_unit: "g",
  area_treated: 10,  // 10 metri lineari
  method: "spray"
})

// Registra fertilizzazione sul Filare 1
await storageProvider.createFertilizationLog({
  garden_id: gardenId,
  field_row_id: filare1Id,  // ← Nuovo campo
  fertilizer_name: "NPK 20-20-20",
  application_date: "2026-01-04",
  quantity: 500,
  unit: "g",
  application_method: "fertirrigazione"
})
```

---

## ✅ Risposta Domanda 4: Scalabilità per Grandi Superfici

### Scenario: 20 ettari (200.000 m²)

**Problemi scalabilità:**
1. ❌ 200 filari singoli → troppo complesso gestire
2. ❌ Un unico field_row da 20 ettari → troppo generico
3. ✅ **Soluzione:** Usare `garden_zones` per dividere aree

### Architettura Consigliata

```
Garden: 20 ettari
│
├── Zone 1: "Settore Nord - Pomodori" (5 ettari)
│   ├── Field Row 1: 100m
│   ├── Field Row 2: 100m
│   └── ... (50 filari)
│
├── Zone 2: "Settore Sud - Lattuga" (5 ettari)
│   ├── Field Row 1: 100m
│   └── ... (50 filari)
│
├── Zone 3: "Settore Est - Meloni" (5 ettari)
│   └── ... (40 filari)
│
└── Zone 4: "Settore Ovest - Peperoni" (5 ettari)
    └── ... (40 filari)
```

**Vantaggi:**
- ✅ Gestione per zone omogenee (stessa coltura)
- ✅ Trattamenti/fertilizzazioni per zona intera
- ✅ Irrigazione settoriale
- ✅ Report aggregati per zona

**Implementazione:**

```typescript
// 1. Crea zone
const zona1 = await storageProvider.createGardenZone({
  garden_id: gardenId,
  name: "Settore Nord - Pomodori",
  size_sq_meters: 50000,  // 5 ettari
  primary_cultivar: "Pomodoro San Marzano",
  soil_type: "Loamy",
  sun_exposure: "FullSun"
})

// 2. Crea filari nella zona
for (let i = 1; i <= 50; i++) {
  await storageProvider.createFieldRow({
    garden_id: gardenId,
    zone_id: zona1.id,  // ← Collegato alla zona
    name: `Filare Nord ${i}`,
    row_number: i,
    length_meters: 100,
    cultivar: "Pomodoro San Marzano",
    plant_spacing: 50,
    irrigation_line: {
      lineType: 'Dripline',
      flowRatePerMeterLph: 2.5
    }
  })
}

// 3. Trattamento su tutta la zona
await storageProvider.createTreatmentRecord({
  garden_id: gardenId,
  zone_id: zona1.id,  // ← Tratta tutta la zona Nord
  crop_name: "Pomodoro San Marzano",
  product_name: "Rame",
  area_treated: 50000  // 5 ettari
})
```

---

## ✅ Risposta Domanda 5: Integrazione Director/Orchestrator

### Director deve gestire field_rows?

**SÌ, assolutamente!** Il `director.ts` è l'orchestratore centrale e deve:

### 1. Calcolo Fabbisogni Idrici

```typescript
// logic/director.ts
async calculateWaterRequirements(gardenId: string) {
  // Carica tutti i field_rows attivi
  const fieldRows = await storageProvider.getFieldRows(gardenId)
  const activeRows = fieldRows.filter(r => r.isActive)

  let totalWaterNeed = 0

  for (const row of activeRows) {
    if (!row.irrigationLine) continue

    // Calcola fabbisogno per filare
    const rowWaterLph = row.lengthMeters *
      (row.irrigationLine.flowRatePerMeterLph || 0)

    // Applica coefficiente coltura
    const cropCoeff = getCropCoefficient(row.cultivar)
    totalWaterNeed += rowWaterLph * cropCoeff
  }

  return totalWaterNeed
}
```

### 2. Pianificazione Trattamenti

```typescript
// logic/director.ts
async planTreatments(gardenId: string) {
  const fieldRows = await storageProvider.getFieldRows(gardenId)
  const tasks = []

  for (const row of fieldRows) {
    if (!row.cultivar || !row.plantedDate) continue

    // Carica piano trattamenti per coltura
    const treatmentPlan = await getTreatmentPlanForCrop(row.cultivar)

    // Genera task basati su giorni dalla semina
    const daysSincePlanting = getDaysSince(row.plantedDate)

    for (const treatment of treatmentPlan) {
      if (daysSincePlanting >= treatment.daysAfterPlanting) {
        tasks.push({
          type: 'treatment',
          fieldRowId: row.id,
          product: treatment.product,
          dueDate: addDays(row.plantedDate, treatment.daysAfterPlanting)
        })
      }
    }
  }

  return tasks
}
```

### 3. Fertilizzazione Programmata

```typescript
// logic/director.ts
async planFertilization(gardenId: string) {
  const fieldRows = await storageProvider.getFieldRows(gardenId)

  for (const row of fieldRows) {
    if (!row.cultivar) continue

    // Carica piano nutrizionale per coltura
    const fertPlan = await getFertilizationPlanForCrop(row.cultivar)

    // Calcola dosaggio basato su lunghezza filare
    const dosage = fertPlan.dosePerMeter * row.lengthMeters

    // Programma fertirrigazione
    await scheduleFertigation({
      fieldRowId: row.id,
      fertilizer: fertPlan.product,
      quantity: dosage,
      frequency: fertPlan.intervalDays
    })
  }
}
```

---

## 🔧 Modifiche Necessarie

### 1. Database Migration

**File:** `supabase/migrations/20260104000000_add_field_row_support.sql`

```sql
-- Estendi treatment_registry
ALTER TABLE treatment_registry
  RENAME COLUMN row_id TO bed_row_id;

ALTER TABLE treatment_registry
  ADD COLUMN field_row_id UUID REFERENCES field_rows(id) ON DELETE SET NULL;

-- Estendi fertilization_logs
ALTER TABLE fertilization_logs
  RENAME COLUMN row_id TO bed_row_id;

ALTER TABLE fertilization_logs
  ADD COLUMN field_row_id UUID REFERENCES field_rows(id) ON DELETE SET NULL;

-- Estendi watering_logs
ALTER TABLE watering_logs
  RENAME COLUMN row_id TO bed_row_id;

ALTER TABLE watering_logs
  ADD COLUMN field_row_id UUID REFERENCES field_rows(id) ON DELETE SET NULL;

-- Estendi mechanical_work_logs
ALTER TABLE mechanical_work_logs
  RENAME COLUMN row_id TO bed_row_id;

ALTER TABLE mechanical_work_logs
  ADD COLUMN field_row_id UUID REFERENCES field_rows(id) ON DELETE SET NULL;
```

### 2. TypeScript Interfaces

**File:** `types.ts`

```typescript
export interface TreatmentRecordDB {
  id: string
  user_id: string
  garden_id?: string
  bed_id?: string
  bed_row_id?: string      // ← Rinominato (era row_id)
  zone_id?: string
  field_row_id?: string    // ← NUOVO
  crop_name: string
  // ... resto campi
}

export interface FertilizationLog {
  id: string
  garden_id: string
  bed_id?: string
  bed_row_id?: string      // ← Rinominato
  zone_id?: string
  field_row_id?: string    // ← NUOVO
  // ... resto campi
}
```

### 3. Storage Provider

**File:** `packages/storage-cloud/SupabaseStorageProvider.ts`

Aggiornare metodi:
- `createTreatmentRecord()` - Supporta field_row_id
- `createFertilizationLog()` - Supporta field_row_id
- `createWateringLog()` - Supporta field_row_id

### 4. UI Components

**File:** `components/settings/GardenEditModal.tsx`

Estendere form field_rows con:
- Campo `plant_spacing` (spaziatura piante)
- Campo `planted_date` (data semina/trapianto)
- Campo `orientation` (orientamento filare)
- Sezione configurazione `irrigation_line` completa

### 5. Director Integration

**File:** `logic/director.ts`

Aggiungere metodi:
- `calculateFieldRowsWaterNeeds()`
- `planFieldRowTreatments()`
- `planFieldRowFertilization()`
- `generateFieldRowTasks()`

---

## 📋 Checklist Implementazione

### Fase 1: Database ✅ (Parziale)
- [x] Tabella `field_rows` creata
- [x] Tabella `garden_zones` creata
- [x] Tabella `planting_batches` creata
- [ ] Migration: Aggiungere `field_row_id` a treatment/fertilization/watering
- [ ] Migration: Rinominare `row_id` → `bed_row_id` per chiarezza

### Fase 2: TypeScript
- [x] Interface `FieldRow` in `types/fieldRow.ts`
- [ ] Aggiornare `TreatmentRecordDB` con `field_row_id`
- [ ] Aggiornare `FertilizationLog` con `field_row_id`
- [ ] Aggiornare `WateringLog` con `field_row_id`

### Fase 3: Storage Provider
- [x] Metodi CRUD per `field_rows`
- [x] Metodi CRUD per `garden_zones`
- [ ] Estendere `createTreatmentRecord()` con field_row_id
- [ ] Estendere `createFertilizationLog()` con field_row_id

### Fase 4: UI
- [x] Form base field_rows in GardenEditModal
- [ ] Aggiungere campo `plant_spacing`
- [ ] Aggiungere campo `planted_date`
- [ ] Aggiungere campo `orientation`
- [ ] Form configurazione `irrigation_line`
- [ ] Interfaccia gestione `garden_zones`

### Fase 5: Director
- [ ] Integrazione calcolo fabbisogni field_rows
- [ ] Pianificazione trattamenti per field_rows
- [ ] Pianificazione fertilizzazione per field_rows
- [ ] Generazione task automatici

---

## 🎯 Conclusioni

### Il sistema è pronto?

**NO, manca integrazione completa:**

1. ✅ **Database field_rows** → OK, tabelle create
2. ❌ **Collegamento trattamenti/fertilizzanti** → Serve migration
3. ❌ **UI completa** → Manca config irrigazione, date, spacing
4. ❌ **Director integration** → Non gestisce ancora field_rows
5. ⚠️ **Scalabilità grandi superfici** → Serve usare garden_zones

### Prossimi passi prioritari:

1. **Migration database** - Aggiungere `field_row_id` ovunque
2. **Completare UI** - Form con tutti i campi necessari
3. **Director integration** - Gestione field_rows nell'orchestratore
4. **Testing** - Scenario completo 20 ettari con zone

---

**Domanda per te:** Procediamo con la migration del database per collegare trattamenti/fertilizzanti ai field_rows?
