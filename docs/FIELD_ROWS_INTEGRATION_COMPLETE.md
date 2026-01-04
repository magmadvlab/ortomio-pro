# ✅ Field Rows - Integrazione Completa

**Data:** 2026-01-04
**Stato:** Migration Database + TypeScript Interfaces COMPLETATE

---

## 🎯 Obiettivo

Integrare completamente i `field_rows` (filari di campo aperto) con TUTTE le operazioni agronomiche:
- ✅ Trattamenti fitosanitari
- ✅ Fertilizzazioni
- ✅ Irrigazioni
- ✅ Lavorazioni meccaniche
- ✅ Task operativi
- ✅ Raccolti

---

## ✅ Lavoro Completato

### 1. Migration Database

**File:** [`supabase/migrations/20260104000000_add_field_rows_to_operations.sql`](../supabase/migrations/20260104000000_add_field_rows_to_operations.sql)

**Tabelle modificate:**

| Tabella | Azione | Colonne |
|---------|--------|---------|
| `treatment_register` | ✅ Aggiornata | `row_id` → `bed_row_id` + nuovo `field_row_id` |
| `fertilization_logs` | ✅ Aggiornata | `row_id` → `bed_row_id` + nuovo `field_row_id` |
| `fertilizer_application_logs` | ✅ Aggiornata | `row_id` → `bed_row_id` + nuovo `field_row_id` |
| `watering_logs` | ✅ Aggiornata | `row_id` → `bed_row_id` + nuovo `field_row_id` |
| `mechanical_work_logs` | ✅ Aggiornata | `row_id` → `bed_row_id` + nuovo `field_row_id` |
| `garden_tasks` | ✅ Aggiornata | Nuovo `field_row_id` |
| `harvest_logs` | ✅ Aggiornata | Nuovo `field_row_id` |

**Viste create:**
- ✅ `operations_by_location` - Vista unificata tutte operazioni per location
- ✅ `field_row_operations_summary` - Riepilogo operazioni per field_row
- ✅ Funzione `get_field_row_history()` - Storico completo operazioni filare

**Constraint aggiunti:**
- ✅ Check constraint: O `bed_row_id` O `field_row_id`, non entrambi
- ✅ Indici per performance su tutte le colonne `field_row_id`

---

### 2. TypeScript Interfaces

#### File Aggiornati:

**A. [`types.ts`](../types.ts)**

```typescript
// PRIMA (errato - row_id ambiguo)
export interface TreatmentRecordDB {
  row_id?: string  // ❌ Ambiguo - quale tipo di filare?
}

// DOPO (corretto - separazione chiara)
export interface TreatmentRecordDB {
  bed_row_id?: string    // ✅ garden_rows (filari di aiuole/letti)
  field_row_id?: string  // ✅ field_rows (filari di campo aperto)
  zone_id?: string       // ✅ garden_zones (zone dell'orto)
}
```

**Interfaces aggiornate:**
- ✅ `MechanicalWorkRecord` - bed_row_id + zone_id + field_row_id
- ✅ `TreatmentRecordDB` - bed_row_id + zone_id + field_row_id
- ✅ `FertilizerApplicationLogDB` - bedRowId + zoneId + fieldRowId

**B. [`types/microzoneTracking.ts`](../types/microzoneTracking.ts)**

```typescript
// PRIMA
export interface MicroZoneReference {
  rowId?: string  // ❌ Ambiguo
}

// DOPO
export interface MicroZoneReference {
  bedId?: string        // garden_beds (aiuole/letti)
  bedRowId?: string     // garden_rows (filari di aiuole/letti)
  zoneId?: string       // garden_zones (zone dell'orto)
  fieldRowId?: string   // field_rows (filari di campo aperto) ⭐ NUOVO
}
```

**Interfaces aggiornate:**
- ✅ `MicroZoneReference` - Base interface estesa
- ✅ `TreatmentByMicrozone` - Vista trattamenti con field_row
- ✅ `FertilizationByMicrozone` - Vista fertilizzazioni con field_row
- ✅ `IrrigationByMicrozone` - Vista irrigazioni con field_row
- ✅ `MicroZoneFilter` - Filtri estesi con field_row
- ✅ `MicroZoneStats` - Statistiche con field_row

---

## 📊 Architettura Finale

### Gerarchia Completa

```
Garden
├── garden_beds (Aiuole/Letti)
│   └── garden_rows (Filari di aiuole/letti)
│       ├── Used by: Letti rialzati, Contenitori, Serre
│       └── Referenced as: bed_row_id
│
├── garden_zones (Zone dell'orto)
│   └── field_rows (Filari di campo aperto) ⭐
│       ├── Used by: Campi aperti, Grandi superfici
│       ├── Referenced as: field_row_id
│       └── Has: cultivar, irrigation_line, plant_spacing, planted_date
│
└── Tutte le operazioni possono riferirsi a:
    ├── bed_id (Aiuola/Letto intero)
    ├── bed_row_id (Filare specifico di aiuola)
    ├── zone_id (Zona intera)
    └── field_row_id (Filare specifico di campo aperto) ⭐
```

---

## 💡 Esempi Uso

### Esempio 1: Registrare Trattamento su Filare Campo Aperto

```typescript
// Filare 1 del campo aperto
await storageProvider.createTreatmentRecord({
  garden_id: gardenId,
  field_row_id: filare1Id,  // ⭐ Riferimento field_row
  crop_name: "Pomodoro Datterino",
  treatment_date: "2026-01-04",
  product_name: "Rame fungicida",
  dosage: 200,
  dosage_unit: "g",
  area_treated: 10,  // 10 metri lineari
  method: "spray"
})
```

### Esempio 2: Irrigazione Filare

```typescript
await storageProvider.createWateringLog({
  garden_id: gardenId,
  field_row_id: filare1Id,  // ⭐ Riferimento field_row
  watering_date: "2026-01-04",
  duration_minutes: 30,
  liters_applied: 75,  // Calcolato: 10m × 2.5 L/h/m × 0.5h
  method: "Automatic"
})
```

### Esempio 3: Fertilizzazione Zone Intera

```typescript
// Fertilizza tutti i filari della zona Nord
await storageProvider.createFertilizationLog({
  garden_id: gardenId,
  zone_id: zonaNordId,  // ⭐ Applica a tutta la zona
  fertilizer_name: "NPK 20-20-20",
  application_date: "2026-01-04",
  quantity: 25000,  // 25 kg per 5 ettari
  unit: "g",
  application_method: "fertirrigazione"
})
```

### Esempio 4: Lavorazione Meccanica Filare

```typescript
await storageProvider.createMechanicalWorkLog({
  garden_id: gardenId,
  field_row_id: filare1Id,  // ⭐ Lavorazione su filare specifico
  work_type: "Sarchiatura",
  work_date: "2026-01-04",
  area_m2: 10,  // 10 metri lineari
  equipment_type: "Erpice rotante",
  notes: "Eliminazione infestanti tra le file"
})
```

---

## 🔧 Prossimi Passi

### ⚠️ Da Completare:

#### 1. Form UI - Campi Mancanti

**File:** `components/settings/GardenEditModal.tsx`

Aggiungere al form field_rows:

```typescript
// Campi attuali
✅ name
✅ rowNumber
✅ lengthMeters
✅ distanceFromPreviousRow
✅ cultivar

// DA AGGIUNGERE
❌ plant_spacing (cm) - Auto-calcola plant_count
❌ planted_date (Date) - Data semina/trapianto
❌ orientation ('N-S' | 'E-W' | 'NE-SW' | 'NW-SE')
❌ irrigation_line (JSONB config completa)
  ├── lineType: 'Dripline' | 'PipeWithDrippers' | 'MicroSprinkler'
  ├── pipeDiameterMm: number
  ├── emitterSpacingCm: number (se PipeWithDrippers)
  ├── emitterFlowRateLph: number (se PipeWithDrippers)
  └── flowRatePerMeterLph: number (se Dripline)
```

#### 2. Storage Provider - Metodi da Aggiornare

**File:** `packages/storage-cloud/SupabaseStorageProvider.ts`

Aggiornare metodi:

```typescript
// Trattamenti
✅ createTreatmentRecord() - Già supporta garden_id
❌ Aggiornare per supportare field_row_id

// Fertilizzazioni
✅ createFertilizationLog() - Già supporta garden_id
❌ Aggiornare per supportare field_row_id

// Irrigazioni
✅ createWateringLog() - Già supporta garden_id
❌ Aggiornare per supportare field_row_id

// Lavorazioni
✅ createMechanicalWorkLog() - Già supporta garden_id
❌ Aggiornare per supportare field_row_id
```

#### 3. Director Integration

**File:** `logic/director.ts`

Aggiungere metodi:

```typescript
// Calcolo fabbisogni idrici field_rows
async calculateFieldRowsWaterNeeds(gardenId: string): Promise<number>

// Pianificazione trattamenti per field_rows
async planFieldRowTreatments(gardenId: string): Promise<Task[]>

// Pianificazione fertilizzazione field_rows
async planFieldRowFertilization(gardenId: string): Promise<Task[]>

// Generazione task automatici per field_rows
async generateFieldRowTasks(gardenId: string): Promise<Task[]>
```

#### 4. Interfaccia Garden Zones

**File:** `components/gardens/ZoneManager.tsx` (DA CREARE)

Gestione zone per grandi superfici:

```typescript
// Permette di:
- Creare zone dell'orto (5-10 ettari ciascuna)
- Assegnare field_rows a zone specifiche
- Visualizzare riepilogo per zona
- Applicare operazioni a zona intera
```

---

## 📋 Checklist Completa

### Database ✅
- [x] Tabella `field_rows` creata
- [x] Tabella `garden_zones` creata
- [x] Migration: Aggiunti `field_row_id` a treatment/fertilization/watering
- [x] Migration: Rinominato `row_id` → `bed_row_id`
- [x] Indici performance creati
- [x] Constraint check aggiunti
- [x] Viste aggregate create

### TypeScript ✅
- [x] Interface `FieldRow` in `types/fieldRow.ts`
- [x] Aggiornato `MechanicalWorkRecord` con `field_row_id`
- [x] Aggiornato `TreatmentRecordDB` con `field_row_id`
- [x] Aggiornato `FertilizerApplicationLogDB` con `field_row_id`
- [x] Aggiornato `MicroZoneReference` con `field_row_id`
- [x] Aggiornate tutte le viste aggregate

### UI ⚠️ (Parziale)
- [x] Form base field_rows in GardenEditModal
- [x] CRUD completo (create, update, delete)
- [ ] Campo `plant_spacing` + auto-calc plant_count
- [ ] Campo `planted_date`
- [ ] Campo `orientation`
- [ ] Form configurazione `irrigation_line` completo
- [ ] Interfaccia gestione `garden_zones`

### Storage Provider ⚠️ (Da Aggiornare)
- [x] Metodi CRUD per `field_rows`
- [x] Metodi CRUD per `garden_zones`
- [ ] `createTreatmentRecord()` - Supporto field_row_id
- [ ] `createFertilizationLog()` - Supporto field_row_id
- [ ] `createWateringLog()` - Supporto field_row_id
- [ ] `createMechanicalWorkLog()` - Supporto field_row_id

### Director ⚠️ (Non Fatto)
- [ ] Integrazione calcolo fabbisogni field_rows
- [ ] Pianificazione trattamenti per field_rows
- [ ] Pianificazione fertilizzazione per field_rows
- [ ] Generazione task automatici

---

## 🚀 Come Procedere

### Opzione 1: Applicare Migration (CONSIGLIATO)

```bash
# 1. Test locale
supabase db reset

# 2. Verifica migration
supabase migration list

# 3. Push al database online
supabase db push
```

### Opzione 2: Completare UI

Estendere il form in `components/settings/GardenEditModal.tsx` con i campi mancanti.

### Opzione 3: Aggiornare Storage Provider

Modificare i metodi create/update per supportare `field_row_id`.

### Opzione 4: Integrare Director

Implementare la logica di orchestrazione per i field_rows.

---

## ⚠️ Breaking Changes

### Naming Changes

| Vecchio Nome | Nuovo Nome | Motivo |
|--------------|------------|--------|
| `row_id` | `bed_row_id` | Chiarezza: distinguere garden_rows da field_rows |
| `rowId` (TS) | `bedRowId` | Coerenza con SQL |

### Codice da Aggiornare

Tutti i riferimenti a `row_id` nelle query o nel codice TypeScript devono essere aggiornati a `bed_row_id`.

**Cerca e sostituisci:**
```bash
# SQL
row_id → bed_row_id (quando riferisce garden_rows)

# TypeScript
rowId → bedRowId (quando riferisce garden_rows)
```

---

## 📚 Documentazione Correlata

- [`ANALISI_FIELD_ROWS_INTEGRAZIONE.md`](ANALISI_FIELD_ROWS_INTEGRAZIONE.md) - Analisi completa del sistema
- [`RIEPILOGO_SISTEMA_COMPLETO.md`](RIEPILOGO_SISTEMA_COMPLETO.md) - Overview architettura
- [`types/fieldRow.ts`](../types/fieldRow.ts) - TypeScript types
- [`supabase/migrations/20251226083205_add_field_rows_system.sql`](../supabase/migrations/20251226083205_add_field_rows_system.sql) - Migration originale field_rows

---

**Stato:** ✅ Database + TypeScript PRONTI | ⚠️ UI + Storage Provider + Director DA COMPLETARE
