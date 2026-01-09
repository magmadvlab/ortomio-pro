# 🐛 Fix: Integer Type Error - dailySunHours

**Data:** 2026-01-04
**Priorità:** ALTA - Bug bloccante
**Status:** ✅ RISOLTO

---

## 🚨 Problema

### Errore

```
POST http://127.0.0.1:54321/rest/v1/gardens 400 (Bad Request)
Error: invalid input syntax for type integer: "4.2"
```

### Contesto

Durante la creazione di un nuovo garden tramite l'onboarding wizard, l'applicazione crashava con errore 400.

**Dati inviati:**
```json
{
  "name": "orto rob",
  "daily_sun_hours": "4.2",  // ❌ Stringa decimale
  "altitude_meters": "500",
  // ...
}
```

**Schema Database:**
```sql
CREATE TABLE gardens (
  daily_sun_hours integer,  -- ❌ INTEGER, non accetta decimali
  altitude_meters integer,
  delay_factor_days integer,
  -- ...
);
```

---

## 🔍 Root Cause

Il problema era nel file [packages/storage-cloud/SupabaseStorageProvider.ts](../packages/storage-cloud/SupabaseStorageProvider.ts):

### Codice PRIMA (Errato)

```typescript
// Riga 992 - mapGardenToDB()
if (garden.dailySunHours !== undefined) db.daily_sun_hours = garden.dailySunHours;
//                                                            ^^^^^^^^^^^^^^^^^^^^
//                                                            Passato così com'è (stringa "4.2")

// Riga 989-990
if (garden.altitudeMeters !== undefined) db.altitude_meters = garden.altitudeMeters;
if (garden.delayFactorDays !== undefined) db.delay_factor_days = garden.delayFactorDays;
```

**Problema:**
- Se `garden.dailySunHours` è una stringa `"4.2"` (da form input)
- Viene passata al database senza conversione
- Database rifiuta perché `daily_sun_hours` è `INTEGER` (non accetta decimali)

---

## ✅ Soluzione Applicata

### File Modificato

**File:** `packages/storage-cloud/SupabaseStorageProvider.ts`

### Modifiche

#### 1. Fix `mapGardenToDB()` - gardens (righe 989-992)

```typescript
// PRIMA
if (garden.altitudeMeters !== undefined) db.altitude_meters = garden.altitudeMeters;
if (garden.delayFactorDays !== undefined) db.delay_factor_days = garden.delayFactorDays;
if (garden.dailySunHours !== undefined) db.daily_sun_hours = garden.dailySunHours;

// DOPO ✅
if (garden.altitudeMeters !== undefined) db.altitude_meters = Math.round(Number(garden.altitudeMeters));
if (garden.delayFactorDays !== undefined) db.delay_factor_days = Math.round(Number(garden.delayFactorDays));
if (garden.dailySunHours !== undefined) db.daily_sun_hours = Math.round(Number(garden.dailySunHours));
```

#### 2. Fix `mapGardenZoneToDB()` - garden_zones (riga 90)

```typescript
// PRIMA
if (zone.dailySunHours !== undefined) db.daily_sun_hours = zone.dailySunHours;

// DOPO ✅
if (zone.dailySunHours !== undefined) db.daily_sun_hours = Math.round(Number(zone.dailySunHours));
```

#### 3. Fix `createGardenBed()` - garden_beds (riga 1963)

```typescript
// PRIMA
daily_sun_hours: bed.dailySunHours,

// DOPO ✅
daily_sun_hours: bed.dailySunHours ? Math.round(Number(bed.dailySunHours)) : undefined,
```

#### 4. Fix `updateGardenBed()` - garden_beds (riga 2012)

```typescript
// PRIMA
if (updates.dailySunHours !== undefined) dbData.daily_sun_hours = updates.dailySunHours;

// DOPO ✅
if (updates.dailySunHours !== undefined) dbData.daily_sun_hours = Math.round(Number(updates.dailySunHours));
```

---

## 🎯 Spiegazione Fix

### Conversione Sicura con `Math.round(Number())`

```typescript
Math.round(Number(garden.dailySunHours))
```

**Passaggi:**
1. `Number(garden.dailySunHours)` → Converte stringa a numero
   - `"4.2"` → `4.2`
   - `"5"` → `5`
   - `5` → `5` (già numero, nessun cambio)

2. `Math.round(...)` → Arrotonda a intero più vicino
   - `4.2` → `4`
   - `4.7` → `5`
   - `5` → `5`

**Risultato:** Sempre un INTEGER valido per il database

---

## 📊 Campi INTEGER Modificati

### Tabella `gardens`

| Campo | Tipo DB | Conversione Applicata | Esempio |
|-------|---------|----------------------|---------|
| `daily_sun_hours` | INTEGER | `Math.round(Number())` | `"4.2"` → `4` |
| `altitude_meters` | INTEGER | `Math.round(Number())` | `"500"` → `500` |
| `delay_factor_days` | INTEGER | `Math.round(Number())` | `"3"` → `3` |

### Tabella `garden_zones`

| Campo | Tipo DB | Conversione Applicata | Esempio |
|-------|---------|----------------------|---------|
| `daily_sun_hours` | INTEGER | `Math.round(Number())` | `"6.8"` → `7` |

### Tabella `garden_beds`

| Campo | Tipo DB | Conversione Applicata | Esempio |
|-------|---------|----------------------|---------|
| `daily_sun_hours` | INTEGER | `Math.round(Number())` | `"5.5"` → `6` |

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
  name: 'orto rob',
  dailySunHours: "4.2",      // Stringa decimale
  altitudeMeters: "500",     // Stringa intera
  delayFactorDays: 3,        // Già numero
};
```

**Output Database:**
```sql
INSERT INTO gardens (
  name,
  daily_sun_hours,    -- 4 (arrotondato da "4.2")
  altitude_meters,    -- 500 (convertito da "500")
  delay_factor_days   -- 3 (passato così com'è)
) VALUES (...)
```

**Risultato:** ✅ Insert riuscito, nessun errore 400

---

## 🚨 Altri Campi INTEGER da Monitorare

Questi campi esistono nel database ma **NON sono ancora mappati** nel codice:

### Tabella `gardens`

- `pot_count` (INTEGER) - Non mappato
- `bed_count` (INTEGER) - Non mappato
- `container_count` (INTEGER) - Non mappato

**Azione:** Se in futuro vengono mappati, applicare la stessa conversione:
```typescript
if (garden.potCount !== undefined) db.pot_count = Math.round(Number(garden.potCount));
```

---

## 📝 Best Practice

### Quando Mappare da TypeScript a Database

**Regola:**
- **INTEGER DB** → Usa `Math.round(Number(value))`
- **NUMERIC DB** → Usa `Number(value)` (senza round)
- **TEXT DB** → Usa `String(value)` o passaggio diretto
- **BOOLEAN DB** → Usa `Boolean(value)` o `!!value`

### Pattern Sicuro

```typescript
// ❌ SBAGLIATO - Passaggio diretto
if (garden.dailySunHours !== undefined) {
  db.daily_sun_hours = garden.dailySunHours;  // Potrebbe essere stringa!
}

// ✅ CORRETTO - Conversione esplicita
if (garden.dailySunHours !== undefined) {
  db.daily_sun_hours = Math.round(Number(garden.dailySunHours));
}
```

---

## 🎯 Impatto

### Prima del Fix
- ❌ Creazione garden falliva con errore 400
- ❌ Onboarding bloccato
- ❌ Utenti non potevano completare setup

### Dopo il Fix
- ✅ Creazione garden funzionante
- ✅ Onboarding completo end-to-end
- ✅ Valori decimali arrotondati automaticamente

---

## 🔗 File Correlati

- [packages/storage-cloud/SupabaseStorageProvider.ts](../packages/storage-cloud/SupabaseStorageProvider.ts) - File modificato
- [Database Schema](../supabase/migrations/) - Schema tables

---

**Conclusione:** Fix applicato e testato. Il problema era la mancanza di conversione esplicita da stringa/numero decimale a INTEGER quando si mappano i dati verso il database.
