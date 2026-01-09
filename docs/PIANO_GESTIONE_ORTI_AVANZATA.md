# Piano Gestione Orti Avanzata

**Data**: 2025-12-26
**Obiettivo**: Sistema completo per configurare, modificare e gestire orti con strutture professionali

---

## 🎯 Requisiti Utente

### 1. **Modifica Completa Orto**
- ❌ ATTUALE: Posso solo eliminare
- ✅ OBIETTIVO: Posso modificare TUTTO (metratura, nome, tipo, strutture, zone)

### 2. **Strutture Professionali**
- ✅ GIÀ ESISTONO: pots, beds, containers, tanks
- ❌ MANCANO: **FILARI** (rows in field - non GardenRow che è fila in bed)
- ❌ MANCANO: Serre con dimensioni
- ❌ MANCANO: Zone multiple con cultivar diverse

### 3. **Gestione Filari Professionali**
Serve tracciare:
- **Numero filari** (es. 10 filari)
- **Distanza tra filari** (es. 2.5m tra fila e fila)
  - Fissa (tutti uguali)
  - Variabile (fila 1-2: 2m, fila 2-3: 3m, etc.)
- **Lunghezza filari** (es. 50m)
- **Distanza piante nel filare** (es. 0.8m tra pianta e pianta)

### 4. **Multi-Zone con Cultivar Diverse**
Esempio:
```
Orto Casa (5000m²)
├─ Zona Nord (2000m²) → Pomodori Datterino
├─ Zona Sud (2000m²) → Zucchine Romanesco
└─ Serra (1000m²) → Lattuga Canasta
```

### 5. **Wizard Iniziale Migliorato**
- Step chiari per ogni tipo di struttura
- Supporto monocultura e pluricoltura
- Configurazione filari guidata
- Anteprima configurazione

---

## 📊 Analisi Struttura Attuale

### Types Esistenti

#### ✅ Garden (già completo)
```typescript
interface Garden {
  id: string
  name: string
  sizeSqMeters: number
  structureConfig?: StructureConfig  // ✅ Esiste
  gardenType?: GardenType
  primaryCrop?: PrimaryCrop
  // ... molti altri
}
```

#### ✅ StructureConfig (parziale)
```typescript
interface StructureConfig {
  openField?: { size: number; unit: string }
  pots?: Array<{ count, diameter }>
  beds?: Array<{ count, length, width, height, holes }>
  containers?: Array<{ ... }>
  tanks?: Array<{ ... }>
  // ❌ MANCA: rows (filari campo aperto)
  // ❌ MANCA: greenhouses
  // ❌ MANCA: zones (zone multiple)
}
```

#### ✅ GardenBed (aiuole - già completo)
```typescript
interface GardenBed {
  id: string
  gardenId: string
  name: string
  lengthMeters: number
  widthMeters: number
  soilType?: string
  // ...
}
```

#### ✅ GardenRow (file dentro aiuola - già completo)
```typescript
interface GardenRow {
  id: string
  gardenId: string
  bedId: string
  name: string
  rowNumber?: number
  lengthMeters: number
  irrigationLine: IrrigationLineConfig
}
```

#### ❌ FieldRow (filari campo aperto - NON ESISTE)
Serve per:
- Frutteti (file di alberi)
- Oliveti (file di olivi)
- Vigneti (file di viti)
- Ortaggi in pieno campo (file di pomodori, zucchine, etc.)

---

## 🏗️ Nuove Strutture da Implementare

### 1. FieldRow (Filari Campo Aperto)

```typescript
export interface FieldRow {
  id: string
  gardenId: string
  zoneId?: string  // Opzionale: se fa parte di una zona specifica

  // Identificazione
  name: string  // es. "Fila 1", "Filare Nord 3"
  rowNumber: number  // 1, 2, 3, ...

  // Dimensioni
  lengthMeters: number  // Lunghezza filare (es. 50m)

  // Distanze
  distanceFromPreviousRow?: number  // Metri dalla fila precedente (es. 2.5m)
  plantSpacing?: number  // Distanza tra piante nel filare (es. 0.8m)

  // Coltura
  cultivar?: string  // Es. "Pomodoro Datterino"
  plantCount?: number  // Numero piante nel filare (calc: length / plantSpacing)

  // Orientamento
  orientation?: 'N-S' | 'E-W' | 'NE-SW' | 'NW-SE'  // Orientamento filare

  // Irrigazione
  irrigationLine?: IrrigationLineConfig

  // Metadata
  notes?: string
  createdAt: string
  updatedAt: string
}
```

### 2. GardenZone (Zone Multiple)

```typescript
export interface GardenZone {
  id: string
  gardenId: string

  // Identificazione
  name: string  // es. "Zona Nord", "Settore A"
  description?: string

  // Dimensioni
  sizeSqMeters: number
  dimensions?: { length: number; width: number }

  // Posizione (opzionale per visual mapping)
  position?: {
    x: number  // % 0-100
    y: number  // % 0-100
  }

  // Coltura principale zona
  primaryCultivar?: string
  cropType?: 'Vegetables' | 'Fruits' | 'Herbs' | 'Mixed'

  // Microclima zona
  sunExposure?: 'FullSun' | 'PartSun' | 'Shade'
  soilType?: SoilType

  // Strutture nella zona
  hasGreenhouse?: boolean
  greenhouseType?: 'Tunnel' | 'MultiTunnel' | 'GlassGreenhouse'

  // Filari in questa zona
  fieldRows?: string[]  // IDs dei FieldRow

  // Metadata
  notes?: string
  createdAt: string
  updatedAt: string
}
```

### 3. GreenhouseStructure (Serra Dettagliata)

```typescript
export interface GreenhouseStructure {
  id: string
  gardenId: string
  zoneId?: string

  // Identificazione
  name: string  // es. "Serra 1", "Tunnel Nord"
  type: 'Tunnel' | 'MultiTunnel' | 'GlassGreenhouse' | 'Polycarbonate'

  // Dimensioni
  lengthMeters: number
  widthMeters: number
  heightMeters?: number
  areaS qMeters: number  // Calcolato

  // Struttura interna
  hasHeating?: boolean
  hasCooling?: boolean
  hasAutomation?: boolean
  ventilationType?: 'Manual' | 'Automatic' | 'None'

  // Configurazione letti/bancali dentro serra
  internalBeds?: Array<{
    count: number
    lengthMeters: number
    widthMeters: number
  }>

  // Colture
  cultivars?: string[]

  // Metadata
  notes?: string
  createdAt: string
  updatedAt: string
}
```

### 4. Estensione StructureConfig

```typescript
export interface StructureConfig {
  // ✅ Esistenti
  openField?: { size: number; unit: 'sqm' | 'are' | 'hectare' }
  pots?: Array<{ count: number; diameter: number }>
  beds?: Array<{ count: number; length: number; width: number; height: number; holes?: number }>
  containers?: Array<{ count: number; length: number; width: number; height: number; holes?: number }>
  tanks?: Array<{ count: number; length: number; width: number; height: number; holes?: number }>

  // ✅ NUOVI
  fieldRows?: {
    count: number  // Numero totale filari
    avgLengthMeters: number  // Lunghezza media
    spacingType: 'fixed' | 'variable'
    fixedSpacing?: number  // Se fissa, distanza in metri
    variableSpacings?: number[]  // Se variabile, array distanze
    plantSpacing?: number  // Distanza piante nel filare
    orientation?: 'N-S' | 'E-W' | 'NE-SW' | 'NW-SE'
  }

  greenhouses?: Array<{
    type: 'Tunnel' | 'MultiTunnel' | 'GlassGreenhouse'
    lengthMeters: number
    widthMeters: number
    heightMeters?: number
  }>

  zones?: Array<{
    name: string
    sizeSqMeters: number
    primaryCultivar?: string
    hasGreenhouse?: boolean
  }>
}
```

---

## 🎨 UI Components da Creare

### 1. GardenEditModal
**File**: `components/gardens/GardenEditModal.tsx`

**Features**:
- Form completo per modificare orto esistente
- Tabs per sezioni:
  - 📋 Info Base (nome, metratura, coordinate)
  - 🏗️ Strutture (beds, pots, containers, greenhouses)
  - 📏 Filari (numero, distanze, orientamento)
  - 🗺️ Zone (multiple zone con cultivar)
  - 🌤️ Clima (sole, vento, ostacoli)
  - ⚙️ Avanzate (soil type, pH, irrigation)
- Validazione real-time
- Anteprima modifiche
- Salva/Annulla

### 2. FieldRowManager
**File**: `components/gardens/FieldRowManager.tsx`

**Features**:
- Lista filari configurati
- Aggiungi nuovo filare
- Modifica distanze
- Calcolo automatico piante totali
- Visual representation (semplice)

**UI**:
```
Filari Configurati (10)
─────────────────────────────────────
Fila 1  |═══════════════════════════| 50m  (62 piante)  Pomodoro Datterino
        ↕ 2.5m
Fila 2  |═══════════════════════════| 50m  (62 piante)  Pomodoro Datterino
        ↕ 2.5m
Fila 3  |═══════════════════════════| 50m  (62 piante)  Zucchina Romanesco
...

[+ Aggiungi Filare]  [⚙️ Configura Distanze]
```

### 3. ZoneManager
**File**: `components/gardens/ZoneManager.tsx`

**Features**:
- Visual grid dell'orto
- Crea zone drag-and-drop
- Assegna cultivar a zone
- Mostra statistiche zona
- Link a filari della zona

**UI**:
```
┌─────────────────────────────────────┐
│  Orto Casa (5000m²)                 │
├─────────────────────────────────────┤
│  ┌──────────┐  ┌──────────────────┐│
│  │ Zona Nord│  │   Zona Sud       ││
│  │ 2000m²   │  │   2000m²         ││
│  │ Pomodori │  │   Zucchine       ││
│  │ 5 filari │  │   8 filari       ││
│  └──────────┘  └──────────────────┘│
│                                     │
│  ┌─────────────────────────────────┤
│  │ Serra 1 - 1000m²                ││
│  │ Lattuga, Basilico               ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘

[+ Nuova Zona]  [⚙️ Gestisci Filari]
```

### 4. GardenWizardImproved
**File**: `components/onboarding/GardenWizardImproved.tsx`

**Flow Migliorato**:
```
Step 1: Tipo Orto
  ○ Campo Aperto (con filari)
  ○ Serre/Tunnel
  ○ Aiuole Rialzate
  ○ Vasi/Contenitori
  ○ Sistemi Avanzati (idro/acqua/aero)
  ○ Frutteto/Oliveto/Vigneto

Step 2: Dimensioni
  [Input metratura]
  [Coordinate GPS (opzionale)]

Step 3: Struttura (se campo aperto)
  ○ Monocultura → Configura filari unici
  ○ Pluricoltura → Configura zone multiple

  Se Filari:
    ├─ Numero filari: [__]
    ├─ Lunghezza: [__] m
    ├─ Distanza tra filari:
    │  ○ Fissa: [2.5] m
    │  ○ Variabile: [Configura...]
    ├─ Distanza piante: [0.8] m
    └─ Orientamento: [N-S ▼]

Step 4: Colture
  [Seleziona cultivar principale]
  [Aggiungi cultivar secondarie (pluricoltura)]

Step 5: Clima (già esistente)
  [Esposizione sole, vento, etc.]

Step 6: Riepilogo
  ✓ Orto "Casa"
  ✓ 5000m² campo aperto
  ✓ 10 filari da 50m (N-S)
  ✓ Distanza filari: 2.5m fissa
  ✓ Distanza piante: 0.8m
  ✓ Cultivar: Pomodoro Datterino, Zucchina
  ✓ 620 piante totali stimate

[Crea Orto]
```

---

## 🗄️ Database Migrations

### Migration: add_field_rows_zones.sql

```sql
-- ============================================
-- FILARI CAMPO APERTO (FieldRow)
-- ============================================

CREATE TABLE IF NOT EXISTS field_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  zone_id UUID REFERENCES garden_zones(id) ON DELETE SET NULL,

  -- Identificazione
  name TEXT NOT NULL,
  row_number INTEGER NOT NULL,

  -- Dimensioni
  length_meters NUMERIC(10, 2) NOT NULL,

  -- Distanze
  distance_from_previous_row NUMERIC(10, 2),
  plant_spacing NUMERIC(10, 2),

  -- Coltura
  cultivar TEXT,
  plant_count INTEGER,

  -- Orientamento
  orientation TEXT CHECK (orientation IN ('N-S', 'E-W', 'NE-SW', 'NW-SE')),

  -- Irrigazione
  irrigation_line JSONB,

  -- Metadata
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_garden_row_number UNIQUE (garden_id, row_number)
);

CREATE INDEX idx_field_rows_garden ON field_rows(garden_id);
CREATE INDEX idx_field_rows_zone ON field_rows(zone_id);
CREATE INDEX idx_field_rows_cultivar ON field_rows(cultivar);

-- Auto-update timestamp
CREATE TRIGGER update_field_rows_updated_at
  BEFORE UPDATE ON field_rows
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ZONE MULTIPLE (GardenZone)
-- ============================================

CREATE TABLE IF NOT EXISTS garden_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,

  -- Identificazione
  name TEXT NOT NULL,
  description TEXT,

  -- Dimensioni
  size_sq_meters NUMERIC(10, 2) NOT NULL,
  dimensions JSONB,  -- { length, width }

  -- Posizione (per visual mapping)
  position JSONB,  -- { x, y }

  -- Coltura
  primary_cultivar TEXT,
  crop_type TEXT CHECK (crop_type IN ('Vegetables', 'Fruits', 'Herbs', 'Mixed')),

  -- Microclima
  sun_exposure TEXT CHECK (sun_exposure IN ('FullSun', 'PartSun', 'Shade')),
  soil_type TEXT,

  -- Strutture
  has_greenhouse BOOLEAN DEFAULT false,
  greenhouse_type TEXT CHECK (greenhouse_type IN ('Tunnel', 'MultiTunnel', 'GlassGreenhouse')),

  -- Metadata
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_garden_zones_garden ON garden_zones(garden_id);
CREATE INDEX idx_garden_zones_cultivar ON garden_zones(primary_cultivar);

-- Auto-update timestamp
CREATE TRIGGER update_garden_zones_updated_at
  BEFORE UPDATE ON garden_zones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SERRE DETTAGLIATE (GreenhouseStructure)
-- ============================================

CREATE TABLE IF NOT EXISTS greenhouse_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  zone_id UUID REFERENCES garden_zones(id) ON DELETE SET NULL,

  -- Identificazione
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('Tunnel', 'MultiTunnel', 'GlassGreenhouse', 'Polycarbonate')) NOT NULL,

  -- Dimensioni
  length_meters NUMERIC(10, 2) NOT NULL,
  width_meters NUMERIC(10, 2) NOT NULL,
  height_meters NUMERIC(10, 2),
  area_sq_meters NUMERIC(10, 2) GENERATED ALWAYS AS (length_meters * width_meters) STORED,

  -- Dotazioni
  has_heating BOOLEAN DEFAULT false,
  has_cooling BOOLEAN DEFAULT false,
  has_automation BOOLEAN DEFAULT false,
  ventilation_type TEXT CHECK (ventilation_type IN ('Manual', 'Automatic', 'None')),

  -- Struttura interna
  internal_beds JSONB,  -- Array di { count, lengthMeters, widthMeters }

  -- Colture
  cultivars TEXT[],

  -- Metadata
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_greenhouse_structures_garden ON greenhouse_structures(garden_id);
CREATE INDEX idx_greenhouse_structures_zone ON greenhouse_structures(zone_id);
CREATE INDEX idx_greenhouse_structures_type ON greenhouse_structures(type);

-- Auto-update timestamp
CREATE TRIGGER update_greenhouse_structures_updated_at
  BEFORE UPDATE ON greenhouse_structures
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS POLICIES
-- ============================================

-- FieldRows
ALTER TABLE field_rows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own garden field rows"
  ON field_rows FOR SELECT
  USING (garden_id IN (
    SELECT id FROM gardens WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own garden field rows"
  ON field_rows FOR INSERT
  WITH CHECK (garden_id IN (
    SELECT id FROM gardens WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update own garden field rows"
  ON field_rows FOR UPDATE
  USING (garden_id IN (
    SELECT id FROM gardens WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own garden field rows"
  ON field_rows FOR DELETE
  USING (garden_id IN (
    SELECT id FROM gardens WHERE user_id = auth.uid()
  ));

-- GardenZones
ALTER TABLE garden_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own garden zones"
  ON garden_zones FOR SELECT
  USING (garden_id IN (
    SELECT id FROM gardens WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own garden zones"
  ON garden_zones FOR INSERT
  WITH CHECK (garden_id IN (
    SELECT id FROM gardens WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update own garden zones"
  ON garden_zones FOR UPDATE
  USING (garden_id IN (
    SELECT id FROM gardens WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own garden zones"
  ON garden_zones FOR DELETE
  USING (garden_id IN (
    SELECT id FROM gardens WHERE user_id = auth.uid()
  ));

-- GreenhouseStructures
ALTER TABLE greenhouse_structures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own greenhouses"
  ON greenhouse_structures FOR SELECT
  USING (garden_id IN (
    SELECT id FROM gardens WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own greenhouses"
  ON greenhouse_structures FOR INSERT
  WITH CHECK (garden_id IN (
    SELECT id FROM gardens WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update own greenhouses"
  ON greenhouse_structures FOR UPDATE
  USING (garden_id IN (
    SELECT id FROM gardens WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own greenhouses"
  ON greenhouse_structures FOR DELETE
  USING (garden_id IN (
    SELECT id FROM gardens WHERE user_id = auth.uid()
  ));

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Calcola piante totali in un filare
CREATE OR REPLACE FUNCTION calculate_field_row_plants(
  p_length_meters NUMERIC,
  p_plant_spacing NUMERIC
) RETURNS INTEGER AS $$
BEGIN
  IF p_plant_spacing IS NULL OR p_plant_spacing = 0 THEN
    RETURN NULL;
  END IF;

  RETURN FLOOR(p_length_meters / p_plant_spacing)::INTEGER;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Auto-calcolo piante quando si crea/modifica filare
CREATE OR REPLACE FUNCTION update_field_row_plant_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.length_meters IS NOT NULL AND NEW.plant_spacing IS NOT NULL THEN
    NEW.plant_count := calculate_field_row_plants(NEW.length_meters, NEW.plant_spacing);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_calc_field_row_plants
  BEFORE INSERT OR UPDATE ON field_rows
  FOR EACH ROW
  EXECUTE FUNCTION update_field_row_plant_count();

-- Statistiche orto completo
CREATE OR REPLACE FUNCTION get_garden_structure_stats(p_garden_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'fieldRows', (
      SELECT jsonb_build_object(
        'count', COUNT(*),
        'totalLength', SUM(length_meters),
        'totalPlants', SUM(plant_count),
        'cultivars', array_agg(DISTINCT cultivar) FILTER (WHERE cultivar IS NOT NULL)
      )
      FROM field_rows
      WHERE garden_id = p_garden_id
    ),
    'zones', (
      SELECT jsonb_build_object(
        'count', COUNT(*),
        'totalArea', SUM(size_sq_meters),
        'cultivars', array_agg(DISTINCT primary_cultivar) FILTER (WHERE primary_cultivar IS NOT NULL)
      )
      FROM garden_zones
      WHERE garden_id = p_garden_id
    ),
    'greenhouses', (
      SELECT jsonb_build_object(
        'count', COUNT(*),
        'totalArea', SUM(area_sq_meters),
        'types', array_agg(DISTINCT type)
      )
      FROM greenhouse_structures
      WHERE garden_id = p_garden_id
    ),
    'beds', (
      SELECT jsonb_build_object(
        'count', COUNT(*),
        'totalArea', SUM(length_meters * width_meters)
      )
      FROM garden_beds
      WHERE garden_id = p_garden_id
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;
```

---

## 📝 Implementation Plan

### Fase 1: Database & Types (Priorità ALTA)
- [ ] Estendere types.ts con FieldRow, GardenZone, GreenhouseStructure
- [ ] Estendere StructureConfig
- [ ] Creare migration SQL
- [ ] Applicare migration database
- [ ] Testare RLS policies

### Fase 2: Storage Providers (Priorità ALTA)
- [ ] Aggiungere metodi CRUD per FieldRow in IStorageProvider
- [ ] Aggiungere metodi CRUD per GardenZone
- [ ] Aggiungere metodi CRUD per GreenhouseStructure
- [ ] Implementare in SupabaseStorageProvider
- [ ] Implementare in LocalStorageProvider

### Fase 3: UI Components Base (Priorità ALTA)
- [ ] GardenEditModal - Form modifica orto
- [ ] FieldRowManager - Gestione filari
- [ ] ZoneManager - Gestione zone
- [ ] GreenhouseManager - Gestione serre

### Fase 4: Garden Wizard Improved (Priorità MEDIA)
- [ ] Redesign flow con step chiari
- [ ] Aggiungere configurazione filari
- [ ] Aggiungere configurazione zone
- [ ] Anteprima finale migliorata

### Fase 5: Integration (Priorità MEDIA)
- [ ] Integrare GardenEditModal in GardenManager
- [ ] Link rapidi da Dashboard a gestione strutture
- [ ] Aggiornare form lavorazioni per usare FieldRow
- [ ] Statistiche orto con nuove strutture

### Fase 6: Advanced Features (Priorità BASSA)
- [ ] Visual mapping zone (drag and drop)
- [ ] Calcolo automatico rese per filare
- [ ] Export/Import configurazione orto
- [ ] Template orti predefiniti

---

## 🎨 Mockup UI

### GardenManager con Edit

```
┌─────────────────────────────────────────────────────────┐
│ I Miei Orti (3)                                          │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌───────────────────────────────────────────────────┐  │
│  │ ✓ Attivo    Orto Casa                             │  │
│  │             Campo Aperto • Pomodoro Datterino     │  │
│  │                                                     │  │
│  │  📏 5000 m²    📅 25 Dic 2024    📍 41.9, 12.4    │  │
│  │                                                     │  │
│  │  🌾 10 filari da 50m • 620 piante totali          │  │
│  │  🗺️ 2 zone configurate                            │  │
│  │                                                     │  │
│  │  [Rendi Attivo]  [✏️ Modifica]  [🗑️ Elimina]     │  │
│  └───────────────────────────────────────────────────┘  │
│                                                           │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Serra Fragole                                      │  │
│  │             Serra • Fragole Candonga               │  │
│  │                                                     │  │
│  │  📏 100 m² (10x10m)    📅 15 Gen 2025             │  │
│  │                                                     │  │
│  │  🏗️ Tunnel riscaldato • 6 bancali                │  │
│  │                                                     │  │
│  │  [Rendi Attivo]  [✏️ Modifica]  [🗑️ Elimina]     │  │
│  └───────────────────────────────────────────────────┘  │
│                                                           │
│  [+ Nuovo Orto]                                          │
└─────────────────────────────────────────────────────────┘
```

### GardenEditModal

```
┌─────────────────────────────────────────────────────────┐
│ Modifica Orto: Casa                                [✕]   │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  [Info Base] [Strutture] [Filari] [Zone] [Clima]        │
│   ══════════                                             │
│                                                           │
│  Nome Orto *                                             │
│  [Orto Casa                                          ]   │
│                                                           │
│  Tipo Orto *                                             │
│  [Campo Aperto ▼]                                        │
│                                                           │
│  Metratura *                                             │
│  [5000            ] [m² ▼]                               │
│                                                           │
│  Coordinate GPS (opzionale)                              │
│  Latitudine  [41.9028      ]                             │
│  Longitudine [12.4964      ]                             │
│                                                           │
│  Coltura Principale                                      │
│  [Pomodoro Datterino ▼]                                  │
│                                                           │
│  ────────────────────────────────────────────────────   │
│  [Annulla]                    [Salva Modifiche]          │
└─────────────────────────────────────────────────────────┘
```

### Tab "Filari"

```
┌─────────────────────────────────────────────────────────┐
│ Modifica Orto: Casa                                [✕]   │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  [Info Base] [Strutture] [Filari] [Zone] [Clima]        │
│                           ════════                        │
│                                                           │
│  Configurazione Filari Campo Aperto                     │
│                                                           │
│  Numero Filari   [10 ]                                   │
│  Lunghezza       [50 ] m (media o fissa)                │
│  Orientamento    [Nord-Sud ▼]                            │
│                                                           │
│  Distanza tra Filari                                     │
│  ○ Fissa     [2.5 ] m                                    │
│  ○ Variabile [Configura...]                              │
│                                                           │
│  Distanza Piante nel Filare                              │
│  [0.8 ] m                                                │
│                                                           │
│  ✓ Calcolo Automatico                                    │
│    Piante per filare: 62                                 │
│    Piante totali: 620                                    │
│    Superficie occupata: 1,250 m²                         │
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Anteprima Filari                                 │   │
│  │                                                   │   │
│  │  1 |═══════════════| 50m (62 🌱) Pomodoro       │   │
│  │     ↕ 2.5m                                       │   │
│  │  2 |═══════════════| 50m (62 🌱) Pomodoro       │   │
│  │     ↕ 2.5m                                       │   │
│  │  3 |═══════════════| 50m (62 🌱) Zucchina       │   │
│  │  ...                                             │   │
│  │  10|═══════════════| 50m (62 🌱) Zucchina       │   │
│  │                                                   │   │
│  │  [✏️ Modifica Singoli Filari]                    │   │
│  └──────────────────────────────────────────────────┘   │
│                                                           │
│  ────────────────────────────────────────────────────   │
│  [Annulla]                    [Salva Modifiche]          │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ Risultato Finale Atteso

Dopo l'implementazione, l'utente potrà:

1. ✅ **Modificare completamente ogni orto**
   - Nome, metratura, coordinate
   - Tipo, strutture, zone
   - Filari con distanze precise
   - Serre con dimensioni

2. ✅ **Configurare filari professionali**
   - Numero, lunghezza, orientamento
   - Distanza tra filari (fissa o variabile)
   - Distanza piante nel filare
   - Calcolo automatico piante totali

3. ✅ **Gestire zone multiple**
   - Dividere orto in zone
   - Assegnare cultivar diverse per zona
   - Microclima specifico per zona
   - Filari per zona

4. ✅ **Tracciare strutture avanzate**
   - Serre con dimensioni esatte
   - Tunnel con specifiche tecniche
   - Aiuole, cassoni, vasche, vasi
   - Visual mapping (futuro)

5. ✅ **Wizard migliorato**
   - Step chiari e guidati
   - Supporto mono/pluricoltura
   - Anteprima configurazione
   - Template predefiniti (futuro)

---

**Il sistema diventerà veramente professionale e adatto a qualsiasi scala di produzione!** 🚜🌾✨
