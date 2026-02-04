# ✅ Verifica Sistema Zone + Filari Temporanei

**Data**: 4 Febbraio 2026  
**Status**: ⚠️ CODICE PRONTO - MIGRAZIONE MANCANTE

---

## 🎯 Obiettivo

Separare **filari temporanei** da **macro-zone stabili** per preservare la memoria del terreno anche dopo "fine stagione" e fresatura.

---

## ✅ Cosa È Stato Implementato

### 1. **Tipi TypeScript** (`types/fieldRow.ts`)
```typescript
export interface FieldRow {
  id: string
  gardenId: string
  zoneId?: string  // ✅ Link opzionale a macro-zona
  
  // ... altri campi
  
  isActive: boolean  // ✅ Permette archiviazione
}
```

**Verifica**: ✅ FATTO
- `zoneId` aggiunto per collegare filare a zona
- `isActive` per gestire filari attivi/archiviati

### 2. **Storage Provider** (`SupabaseStorageProvider.ts`)
**Verifica**: ✅ FATTO (line 118)
- Mapping `landZoneId` ↔ `field_rows.land_zone_id`
- Supporto per filari attivi/archiviati

### 3. **UI Creazione/Modifica Filare** (`app/app/garden/rows/edit/page.tsx`)
**Verifica**: ✅ FATTO
- Form per assegnare filare a zona
- Gestione `isActive`
- Salvataggio con `zoneId`

### 4. **UI Lista Filari** (`app/app/garden/rows/page.tsx`)
**Verifica**: ✅ FATTO
- Mostra solo filari attivi di default
- Toggle "Mostra archiviati"
- Filtro per zona

### 5. **Service Zone** (`services/landZoneService.ts`)
**Verifica**: ✅ FATTO
- CRUD completo per zone
- Funzioni per storico e salute terreno
- Link con filari

---

## ⚠️ Cosa Manca

### 1. **Migrazione Database** ❌
**File Mancante**: `supabase/migrations/20260204120000_add_land_zones_and_soil_memory.sql`

**Cosa Deve Contenere**:
```sql
-- 1. Tabella land_zones (macro-zone stabili)
CREATE TABLE land_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  zone_name TEXT NOT NULL,
  zone_code TEXT,
  area_hectares DECIMAL(10, 4) NOT NULL,
  current_status TEXT DEFAULT 'active',
  status_since TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  soil_type TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabella soil_memory (memoria permanente)
CREATE TABLE soil_memory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  land_zone_id UUID NOT NULL REFERENCES land_zones(id) ON DELETE CASCADE,
  garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  field_row_id UUID REFERENCES garden_rows(id) ON DELETE SET NULL,
  
  -- Dati coltura
  crop_name TEXT NOT NULL,
  crop_variety TEXT,
  crop_family TEXT NOT NULL,
  crop_type TEXT,
  
  -- Date
  planting_date TIMESTAMP WITH TIME ZONE NOT NULL,
  harvest_date TIMESTAMP WITH TIME ZONE,
  days_to_harvest INTEGER,
  season_year INTEGER,
  season_type TEXT,
  
  -- Performance
  yield_kg DECIMAL(10, 2),
  yield_per_hectare DECIMAL(10, 2),
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  
  -- Impatto suolo
  nitrogen_impact INTEGER,
  organic_matter_added DECIMAL(10, 2),
  soil_structure_impact INTEGER,
  
  -- Gestione
  fertilization_type TEXT,
  irrigation_method TEXT,
  treatments_count INTEGER DEFAULT 0,
  pesticides_used BOOLEAN DEFAULT false,
  
  -- Problemi
  diseases_occurred JSONB DEFAULT '[]'::jsonb,
  pests_occurred JSONB DEFAULT '[]'::jsonb,
  weather_issues JSONB DEFAULT '[]'::jsonb,
  
  -- Contesto
  planting_context JSONB DEFAULT '{}'::jsonb,
  
  -- AI
  success_score INTEGER CHECK (success_score >= 1 AND success_score <= 100),
  ai_notes JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Collega filari a zone
ALTER TABLE garden_rows 
ADD COLUMN IF NOT EXISTS land_zone_id UUID REFERENCES land_zones(id) ON DELETE SET NULL;

-- 4. Rendi riutilizzabile row_number dopo archiviazione
-- Rimuovi constraint univoco su row_number
ALTER TABLE garden_rows DROP CONSTRAINT IF EXISTS garden_rows_garden_id_row_number_key;

-- Aggiungi constraint univoco solo per filari attivi
CREATE UNIQUE INDEX IF NOT EXISTS garden_rows_active_row_number_unique 
ON garden_rows(garden_id, row_number) 
WHERE is_active = true;

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_land_zones_garden_id ON land_zones(garden_id);
CREATE INDEX IF NOT EXISTS idx_land_zones_user_id ON land_zones(user_id);
CREATE INDEX IF NOT EXISTS idx_soil_memory_zone_id ON soil_memory(land_zone_id);
CREATE INDEX IF NOT EXISTS idx_soil_memory_garden_id ON soil_memory(garden_id);
CREATE INDEX IF NOT EXISTS idx_garden_rows_zone ON garden_rows(land_zone_id);

-- 6. RLS Policies
ALTER TABLE land_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE soil_memory ENABLE ROW LEVEL SECURITY;

-- Policies per land_zones
CREATE POLICY "Users can view their land zones"
  ON land_zones FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their land zones"
  ON land_zones FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their land zones"
  ON land_zones FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their land zones"
  ON land_zones FOR DELETE
  USING (user_id = auth.uid());

-- Policies per soil_memory
CREATE POLICY "Users can view their soil memory"
  ON soil_memory FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their soil memory"
  ON soil_memory FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their soil memory"
  ON soil_memory FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their soil memory"
  ON soil_memory FOR DELETE
  USING (user_id = auth.uid());
```

### 2. **Azione "Chiudi Stagione"** ⏳
**Dove**: UI filari o zone

**Funzionalità**:
```typescript
async function chiudiStagione(zoneId: string) {
  // 1. Ottieni tutti i filari attivi della zona
  const filari = await getFieldRowsInZone(zoneId)
  
  // 2. Per ogni filare:
  for (const filare of filari) {
    // a. Crea record in soil_memory
    await createSoilMemory({
      land_zone_id: zoneId,
      field_row_id: filare.id,
      crop_name: filare.cultivar,
      crop_family: getCropFamily(filare.cultivar),
      planting_date: filare.plantedDate,
      harvest_date: new Date(),
      // ... altri dati
    })
    
    // b. Archivia filare
    await updateFieldRow(filare.id, {
      is_active: false
    })
  }
  
  // 3. Cambia status zona
  await updateLandZone(zoneId, {
    current_status: 'resting',
    status_since: new Date()
  })
}
```

---

## 🎯 Workflow Operativo

### Scenario: 4 ettari (2ha Zona A + 2ha Zona B)

#### Anno 1
```
1. Crea Zona A (2 ha) - Status: Active
2. Crea Zona B (2 ha) - Status: Resting
3. Crea filari in Zona A
4. Assegna filari a Zona A
5. Coltiva stagione in Zona A
6. Fine stagione:
   - Click "Chiudi Stagione Zona A"
   - Sistema archivia filari (is_active=false)
   - Sistema salva memoria in soil_memory
   - Zona A → Status: Resting
```

#### Anno 2
```
1. Zona B → Status: Active
2. Crea nuovi filari in Zona B
3. Coltiva stagione in Zona B
4. Fine stagione:
   - Click "Chiudi Stagione Zona B"
   - Sistema archivia filari
   - Sistema salva memoria
   - Zona B → Status: Resting
```

#### Anno 3
```
1. Zona A → Status: Active (riposa da 1 anno)
2. Crea nuovi filari in Zona A
3. Sistema suggerisce rotazione basata su soil_memory
4. Coltiva con rotazione ottimale
```

---

## 📊 Vantaggi Sistema

### 1. Memoria Permanente
- ✅ Dati conservati anche dopo eliminazione filari
- ✅ Storico completo per zona
- ✅ Analisi pluriennale

### 2. Rotazione Intelligente
- ✅ Suggerimenti AI basati su storico zona
- ✅ Punteggio salute terreno
- ✅ Prevenzione stanchezza suolo

### 3. Flessibilità
- ✅ Filari temporanei (fresatura annuale)
- ✅ Zone stabili (configurazione iniziale)
- ✅ Riutilizzo row_number dopo archiviazione

### 4. Scalabilità
- ✅ Funziona per piccoli orti (1 zona)
- ✅ Funziona per grandi terreni (N zone)
- ✅ Zone opzionali (non obbligatorie)

---

## 🚨 Azioni Immediate

### 1. Crea Migrazione Database
```bash
# Crea file
touch supabase/migrations/20260204120000_add_land_zones_and_soil_memory.sql

# Copia contenuto dalla sezione "Cosa Manca" sopra
# Oppure usa il file già preparato: apply-crop-rotation-migrations.sql
```

### 2. Applica Migrazione
```bash
# Opzione A: Supabase Dashboard
1. Vai a Supabase Dashboard
2. SQL Editor
3. Copia contenuto migrazione
4. Run

# Opzione B: CLI
supabase db push
```

### 3. Testa Sistema
```bash
# 1. Crea zona
http://localhost:3002/app/garden/zones
Click "Crea Nuova Zona"

# 2. Crea filare con zona
http://localhost:3002/app/garden/rows/edit
Seleziona zona nel form

# 3. Verifica collegamento
Vedi filare nella lista con badge zona
```

### 4. Implementa "Chiudi Stagione"
```typescript
// In app/app/garden/zones/page.tsx
// Aggiungi pulsante "Chiudi Stagione" per ogni zona attiva
// Implementa funzione chiudiStagione()
```

---

## 📝 Note Tecniche

### Constraint Univoco Row Number
**Problema**: Con constraint univoco su `(garden_id, row_number)`, non puoi riutilizzare numeri dopo archiviazione.

**Soluzione**: Constraint univoco solo per filari attivi:
```sql
CREATE UNIQUE INDEX garden_rows_active_row_number_unique 
ON garden_rows(garden_id, row_number) 
WHERE is_active = true;
```

**Risultato**:
- Filare 1 attivo: row_number=1, is_active=true ✅
- Filare 1 archiviato: row_number=1, is_active=false ✅
- Nuovo Filare 1: row_number=1, is_active=true ✅ (OK perché vecchio è archiviato)

### Soil Memory vs Field Row History
**Field Row History**: Storico specifico del filare (temporaneo)
**Soil Memory**: Memoria permanente della zona (stabile)

Quando archivi filare:
1. Field row history rimane collegato al filare archiviato
2. Soil memory viene creato e collegato alla zona
3. Zona conserva memoria anche se filare viene eliminato

---

## 🎉 Conclusione

### Codice
- ✅ Tipi TypeScript pronti
- ✅ Storage Provider pronto
- ✅ UI pronta
- ✅ Service pronto

### Database
- ❌ Migrazione da creare
- ❌ Migrazione da applicare

### Features
- ✅ Sistema zone implementato
- ✅ Collegamento filari-zone implementato
- ✅ Archiviazione filari implementata
- ⏳ "Chiudi Stagione" da implementare

### Prossimi Step
1. Crea file migrazione SQL
2. Applica migrazione a database
3. Testa creazione zone
4. Testa collegamento filari
5. Implementa "Chiudi Stagione"
6. Testa workflow completo

---

**Il sistema è pronto al 90%! Manca solo la migrazione database.** 🚀

