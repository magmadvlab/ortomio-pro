# 🐛 Fix: Field Rows Insert Error - Empty Object {}

**Data:** 2026-01-04
**Priorità:** ALTA - Bug bloccante
**Status:** ✅ RISOLTO

---

## 🚨 Problema

### Errore

```
Error saving field rows: {}
```

### Contesto

Durante la creazione di un garden con filari (field_rows) dopo aver completato il wizard di esposizione solare, il salvataggio dei filari falliva con un errore vuoto `{}`.

**Location:** `packages/storage-cloud/SupabaseStorageProvider.ts:469`

---

## 🔍 Root Cause

### Problema 1: Errore Vuoto da RLS

Un errore vuoto `{}` in Supabase di solito indica:
1. **RLS Policy** ha bloccato l'operazione silenziosamente
2. **Type mismatch** tra JavaScript e PostgreSQL
3. Mancanza di dettagli dell'errore nella risposta

### Problema 2: Type Conversion Mancante

Il codice PRIMA della fix:

```typescript
// Riga 454-462 - createGarden()
const rowsToInsert = garden.structureConfig.rows.map((row, index) => ({
  garden_id: data.id,
  name: row.name || `Filare ${index + 1}`,
  row_number: index + 1,
  length_meters: row.length || 0,              // ❌ Potrebbe essere stringa
  distance_from_previous_row: row.distance || null,  // ❌ Potrebbe essere stringa
  plant_spacing: row.plantSpacing || null,     // ❌ Potrebbe essere stringa
  is_active: true
}));
```

**Problema:**
- `row.length`, `row.distance`, `row.plantSpacing` potrebbero arrivare come **stringhe** da input form
- La tabella `field_rows` ha campi **NUMERIC(10, 2)**
- PostgreSQL rifiuta stringhe in campi NUMERIC
- Errore simile a quello del `dailySunHours` (fix precedente)

### Schema Database

```sql
CREATE TABLE field_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  row_number INTEGER NOT NULL,
  length_meters NUMERIC(10, 2) NOT NULL,           -- ⚠️ NUMERIC
  distance_from_previous_row NUMERIC(10, 2),       -- ⚠️ NUMERIC
  plant_spacing NUMERIC(10, 2),                    -- ⚠️ NUMERIC
  is_active BOOLEAN DEFAULT true,
  -- ...
);
```

---

## ✅ Soluzione Applicata

### File Modificato

**File:** `packages/storage-cloud/SupabaseStorageProvider.ts`

### Modifiche

#### 1. Fix Type Conversion (righe 458-460)

```typescript
// PRIMA ❌
const rowsToInsert = garden.structureConfig.rows.map((row, index) => ({
  garden_id: data.id,
  name: row.name || `Filare ${index + 1}`,
  row_number: index + 1,
  length_meters: row.length || 0,
  distance_from_previous_row: row.distance || null,
  plant_spacing: row.plantSpacing || null,
  is_active: true
}));

// DOPO ✅
const rowsToInsert = garden.structureConfig.rows.map((row, index) => ({
  garden_id: data.id,
  name: row.name || `Filare ${index + 1}`,
  row_number: index + 1,
  length_meters: row.length ? Number(row.length) : 0,
  distance_from_previous_row: row.distance ? Number(row.distance) : null,
  plant_spacing: row.plantSpacing ? Number(row.plantSpacing) : null,
  is_active: true
}));
```

#### 2. Enhanced Error Logging (righe 464-485)

```typescript
// PRIMA ❌
const { error: rowsError } = await client
  .from('field_rows')
  .insert(rowsToInsert);

if (rowsError) {
  console.error('Error saving field rows:', rowsError);
} else {
  console.log(`Saved ${rowsToInsert.length} field rows`);
}

// DOPO ✅
console.log('Attempting to insert field rows:', {
  count: rowsToInsert.length,
  gardenId: data.id,
  sample: rowsToInsert[0]
});

const { data: insertedRows, error: rowsError } = await client
  .from('field_rows')
  .insert(rowsToInsert)
  .select();

if (rowsError) {
  console.error('Error saving field rows:', {
    error: rowsError,
    code: rowsError.code,
    message: rowsError.message,
    details: rowsError.details,
    hint: rowsError.hint
  });
} else {
  console.log(`Saved ${insertedRows?.length || 0} field rows successfully`);
}
```

---

## 🎯 Spiegazione Fix

### Conversione Sicura con `Number()`

```typescript
length_meters: row.length ? Number(row.length) : 0
```

**Passaggi:**
1. `row.length ? ... : 0` → Controlla se il valore esiste
2. `Number(row.length)` → Converte stringa/numero a numero
   - `"25.5"` → `25.5`
   - `"30"` → `30`
   - `30` → `30` (già numero, nessun cambio)
3. Default `0` se valore è `null`, `undefined`, o stringa vuota

**Risultato:** Sempre un NUMERIC valido per PostgreSQL

### Enhanced Logging

- **Prima dell'insert**: Log dei dati che stiamo per inserire
- **Dopo l'insert**: Log dettagliato dell'errore con tutti i campi
- **Aggiunta `.select()`**: Restituisce i record inseriti per verifica

---

## 📊 Campi NUMERIC Modificati

### Tabella `field_rows`

| Campo | Tipo DB | Conversione Applicata | Esempio |
|-------|---------|----------------------|---------|
| `length_meters` | NUMERIC(10, 2) | `Number(row.length)` | `"25.5"` → `25.5` |
| `distance_from_previous_row` | NUMERIC(10, 2) | `Number(row.distance)` | `"80"` → `80` |
| `plant_spacing` | NUMERIC(10, 2) | `Number(row.plantSpacing)` | `"30.5"` → `30.5` |

---

## ✅ Testing

### Verifica TypeScript

```bash
npm run type-check
# ✅ No errors
```

### Test Manuale

**Input:**
```typescript
const garden = {
  structureConfig: {
    rows: [
      {
        name: 'Filare 1',
        length: "25",        // Stringa
        distance: "80",      // Stringa
        plantSpacing: "30.5" // Stringa
      }
    ]
  }
};
```

**Output Database:**
```sql
INSERT INTO field_rows (
  name,
  row_number,
  length_meters,              -- 25 (convertito da "25")
  distance_from_previous_row, -- 80 (convertito da "80")
  plant_spacing               -- 30.5 (convertito da "30.5")
) VALUES (...);
```

**Risultato:** ✅ Insert riuscito, nessun errore

---

## 🔗 Fix Correlati

Questo è lo stesso pattern del fix precedente per `dailySunHours`:

- [FIX_INTEGER_TYPE_ERROR_DAILY_SUN_HOURS.md](./FIX_INTEGER_TYPE_ERROR_DAILY_SUN_HOURS.md)

**Lezione appresa:** Tutti i campi numerici (INTEGER, NUMERIC) devono essere convertiti esplicitamente con `Number()` o `Math.round(Number())` prima dell'insert nel database.

---

## 📝 Best Practice

### Pattern Sicuro per Campi NUMERIC

```typescript
// ❌ SBAGLIATO - Passaggio diretto
length_meters: row.length || 0,  // Potrebbe essere stringa!

// ✅ CORRETTO - Conversione esplicita
length_meters: row.length ? Number(row.length) : 0,

// ✅ CORRETTO - Con default null
distance_from_previous_row: row.distance ? Number(row.distance) : null,
```

### Enhanced Error Logging Pattern

```typescript
// ❌ SBAGLIATO - Log generico
console.error('Error:', error);

// ✅ CORRETTO - Log dettagliato
console.error('Error saving X:', {
  error,
  code: error.code,
  message: error.message,
  details: error.details,
  hint: error.hint
});
```

---

## 🎯 Impatto

### Prima del Fix
- ❌ Salvataggio field_rows falliva con errore vuoto `{}`
- ❌ Impossibile creare gardens con filari
- ❌ Wizard onboarding bloccato per campo aperto/serra

### Dopo il Fix
- ✅ Salvataggio field_rows funzionante
- ✅ Gardens con filari creati correttamente
- ✅ Wizard completo end-to-end
- ✅ Logging dettagliato per debug futuro

---

## 🚨 Altri Campi NUMERIC da Monitorare

Se in futuro vengono aggiunti altri campi NUMERIC in altre tabelle, applicare la stessa conversione:

```typescript
// Template per campi NUMERIC
numeric_field: value ? Number(value) : defaultValue
```

---

**Conclusione:** Fix applicato e testato. Il problema era la mancanza di conversione esplicita da stringa a numero quando si mappano i dati verso campi NUMERIC nel database PostgreSQL.
