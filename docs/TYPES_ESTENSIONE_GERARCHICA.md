# 📦 Estensione TypeScript Types per Sistema Gerarchico

Data: 2025-12-26

## 🎯 Obiettivo

Estendere i TypeScript types per supportare la nuova struttura gerarchica degli spazi coltivabili (Campo Aperto, Serra, Indoor) come descritto in `WIZARD_DESIGN_GERARCHICO.md`.

---

## ✅ Modifiche Effettuate

### 1. Creato `types/gardenSpaces.ts` (NUOVO FILE)

File completo con la struttura gerarchica degli spazi coltivabili.

**Tipi Principali:**

```typescript
// Sistema di coltivazione
export type GrowingSystem =
  | 'Soil'          // In terra
  | 'Hydroponic'    // Idroponica
  | 'Aquaponic'     // Acquaponica
  | 'Aeroponic'     // Aeroponica
  | 'Substrate'     // Substrato inerte

// Strutture comuni (vasi, cassoni, letti, filari)
export interface SpaceStructures {
  pots?: Array<{count: number, diameter: number}>
  containers?: Array<{count: number, length: number, width: number, height: number}>
  beds?: Array<{count: number, length: number, width: number, height: number}>
  rows?: Array<{count: number, length: number, spacing: number, rowSpacing?: number}>
}

// Campo Aperto
export interface OpenFieldSpace {
  system: GrowingSystem
  size: number
  unit: 'sqm' | 'are' | 'hectare'
  structures?: SpaceStructures
  hydroponicConfig?: HydroponicSystemConfig
  aquaponicConfig?: AquaponicSystemConfig
  aeroponicConfig?: AeroponicSystemConfig
}

// Serra
export interface GreenhouseSpace {
  structureType: GreenhouseStructureType
  dimensions: GreenhouseDimensions
  system: GrowingSystem
  structures?: SpaceStructures
  hydroponicConfig?: HydroponicSystemConfig
  aquaponicConfig?: AquaponicSystemConfig
  aeroponicConfig?: AeroponicSystemConfig
  coveringType?: string
  coveringThickness?: number
  archSpacing?: number
  archMaterial?: string
  hasVentilation?: boolean
  hasHeating?: boolean
  minTemp?: number
  maxTemp?: number
}

// Indoor
export interface IndoorSpace {
  systemType: IndoorSystemType
  hydroponicConfig?: HydroponicSystemConfig
  aquaponicConfig?: AquaponicSystemConfig
  aeroponicConfig?: AeroponicSystemConfig
  verticalConfig?: VerticalFarmingConfig
  growBoxConfig?: GrowBoxConfig
}

// Helper per info spazi
export interface GardenSpacesInfo {
  hasOpenField: boolean
  hasGreenhouse: boolean
  hasIndoor: boolean
  openFieldSpace?: OpenFieldSpace
  greenhouseSpace?: GreenhouseSpace
  indoorSpace?: IndoorSpace
}
```

**Tipi Ausiliari:**

```typescript
export interface GreenhouseDimensions {
  width: number         // Larghezza (m)
  length: number        // Lunghezza (m)
  grondaHeight: number  // Altezza gronda (m)
  ridgeHeight: number   // Altezza colmo (m)
}

export type IndoorSystemType =
  | 'Hydroponic'
  | 'Aquaponic'
  | 'Aeroponic'
  | 'Vertical'
  | 'GrowBox'

export interface VerticalFarmingConfig {
  levels: number
  towerCount?: number
  ledType?: string
  ledWatts?: number
  area?: number  // m²
}

export interface GrowBoxConfig {
  count: number
  length: number   // cm
  width: number    // cm
  height: number   // cm
  ledWatts?: number
}
```

---

### 2. Esteso `types.ts` - Interfaccia Garden

**Import aggiunti (riga 104-112):**

```typescript
// Hierarchical Garden Spaces Types (GardenWizardV2)
import type {
  OpenFieldSpace,
  GreenhouseSpace,
  IndoorSpace,
  GardenSpacesInfo,
  GrowingSystem,
  SpaceStructures
} from './types/gardenSpaces';
```

**Campi aggiunti all'interfaccia Garden (riga 344-356):**

```typescript
export interface Garden {
  // ... campi esistenti ...

  // NUOVO: Sistema gerarchico spazi coltivabili (GardenWizardV2)
  // Strategia organizzativa dell'orto
  strategy?: 'unified' | 'separated'; // unified = tutto in un orto, separated = più orti indipendenti

  // Flags per identificare quali spazi sono presenti
  hasOpenField?: boolean;
  hasGreenhouse?: boolean;
  hasIndoor?: boolean;

  // Configurazioni spazi gerarchici
  openFieldSpace?: OpenFieldSpace;
  greenhouseSpace?: GreenhouseSpace;
  indoorSpace?: IndoorSpace;

  // ... altri campi ...
}
```

**Re-export per comodità (riga 1772-1783):**

```typescript
// ============================================
// HIERARCHICAL GARDEN SPACES TYPES
// ============================================

export type {
  OpenFieldSpace,
  GreenhouseSpace,
  IndoorSpace,
  GardenSpacesInfo,
  GrowingSystem,
  SpaceStructures,
  GreenhouseDimensions,
  IndoorSystemType,
  VerticalFarmingConfig,
  GrowBoxConfig
} from './types/gardenSpaces';
```

---

## 🔗 Compatibilità con Tipi Esistenti

### Riutilizzo di Tipi Esistenti

**`GreenhouseStructureType`**
- Riutilizzato da `types/greenhouse.ts`
- Valori: `'Arched' | 'Tunnel' | 'ColdFrame' | 'Polytunnel'`
- Import aggiunto in `gardenSpaces.ts`

**Config Sistemi Fuori Suolo**
- `HydroponicSystemConfig` da `types/indoorGrowing.ts`
- `AquaponicSystemConfig` da `types/indoorGrowing.ts`
- `AeroponicSystemConfig` da `types/indoorGrowing.ts`

### Backward Compatibility

I campi esistenti in `Garden` rimangono invariati:
- `gardenType?: GardenType` (vecchio sistema)
- `greenhouseConfig?: GreenhouseConfig` (vecchia config serra)
- `indoorConfig?: IndoorGrowingConfig` (vecchia config indoor)
- `structureConfig?: StructureConfig` (vecchie strutture)

Questo permette:
1. **Coesistenza**: vecchio e nuovo sistema coesistono
2. **Migrazione graduale**: wizard vecchio continua a funzionare
3. **Feature flag**: possibile switch tra vecchio e nuovo wizard

---

## 📊 Struttura Gerarchica Implementata

```
Garden {
  strategy: 'unified' | 'separated'

  // Flags spazi presenti
  hasOpenField: boolean
  hasGreenhouse: boolean
  hasIndoor: boolean

  // Campo Aperto (se hasOpenField = true)
  openFieldSpace: {
    system: GrowingSystem  // Soil, Hydroponic, etc.
    size: number
    unit: AreaUnit
    structures: {
      pots?: [...]
      beds?: [...]
      containers?: [...]
      rows?: [...]  // NUOVO: supporto filari
    }
    // Config fuori suolo (se system != 'Soil')
    hydroponicConfig?: {...}
    aquaponicConfig?: {...}
    aeroponicConfig?: {...}
  }

  // Serra (se hasGreenhouse = true)
  greenhouseSpace: {
    structureType: GreenhouseStructureType
    dimensions: {
      width: number
      length: number
      grondaHeight: number
      ridgeHeight: number
    }
    system: GrowingSystem
    structures: {
      pots?: [...]
      beds?: [...]
      containers?: [...]
      rows?: [...]
    }
    // Config fuori suolo
    hydroponicConfig?: {...}
    aquaponicConfig?: {...}
    aeroponicConfig?: {...}
  }

  // Indoor (se hasIndoor = true)
  indoorSpace: {
    systemType: 'Hydroponic' | 'Aquaponic' | 'Aeroponic' | 'Vertical' | 'GrowBox'
    hydroponicConfig?: {...}
    aquaponicConfig?: {...}
    aeroponicConfig?: {...}
    verticalConfig?: {...}
    growBoxConfig?: {...}
  }
}
```

---

## 🧪 Testing TypeScript

**Comando eseguito:**
```bash
npx tsc --noEmit
```

**Risultato:** ✅ Nessun errore di compilazione

**File modificati:**
- ✅ `types/gardenSpaces.ts` (CREATO)
- ✅ `types.ts` (ESTESO)

**File non modificati (backward compatibility):**
- `types/greenhouse.ts` (riutilizzato `GreenhouseStructureType`)
- `types/indoorGrowing.ts` (riutilizzati config fuori suolo)
- `types/fieldRow.ts` (supporto filari già presente)

---

## 🎯 Prossimi Step

1. ✅ TypeScript types estesi
2. ⏳ Creare GardenWizardV2 MVP
3. ⏳ Creare componenti wizard modulari:
   - `SpaceTypeSelector.tsx`
   - `OpenFieldConfig.tsx`
   - `GreenhouseConfig.tsx`
   - `IndoorConfig.tsx`
   - `StructurePicker.tsx`
4. ⏳ Implementare Storage Provider methods per nuovi campi
5. ⏳ Testing con dati reali
6. ⏳ Feature flag per switch wizard

---

## 📝 Note Implementative

### Perché `strategy`?

Il campo `strategy` permette due approcci organizzativi:

**Unified (Consigliato)**
- Un unico Garden con `hasOpenField=true`, `hasGreenhouse=true`, `hasIndoor=true`
- Calendario unificato
- Report complessivi
- Gestione centralizzata

**Separated**
- Più Garden separati, ognuno con un solo spazio
- Garden 1: `hasOpenField=true` (Campo Aperto)
- Garden 2: `hasGreenhouse=true` (Serra)
- Garden 3: `hasIndoor=true` (Indoor)
- Utile per location diverse o gestione autonoma

### Compatibilità Filari

Il supporto per `rows` (filari) è già presente nel database (`field_rows`, `garden_zones`, `planting_batches`) grazie alla migration `CARICA_QUESTO_SQL.sql`.

La struttura `SpaceStructures.rows` è il punto di configurazione nel wizard, che poi si tradurrà in righe della tabella `field_rows`.

### GrowingSystem vs Location

**Separazione netta:**
- **WHERE** (Location): OpenField, Greenhouse, Indoor
- **HOW** (GrowingSystem): Soil, Hydroponic, Aquaponic, Aeroponic

**Esempi validi:**
- Campo Aperto + Soil → Orto tradizionale
- Campo Aperto + Hydroponic → Idroponica outdoor
- Serra + Soil → Serra con terra
- Serra + Aeroponic → Serra con aeroponica
- Indoor + Hydroponic → Grow room idroponica

---

**Documento creato il:** 2025-12-26
**Status:** ✅ Implementazione TypeScript completata
**Branch:** main
**Prossimo task:** Creare GardenWizardV2 MVP
