# 🔍 Analisi Wizard Esistente

Data: 2025-12-26

## 📁 File Analizzato

`components/GardenOnboarding.tsx` (1444 righe)

---

## 📊 Struttura Attuale

### Step del Wizard:

1. **Step 1: Nome Giardino**
   - Input: Nome orto

2. **Step 2: Tipo Giardino**
   - Selezione `gardenType`:
     - Garden, Orchard, OliveGrove, Vineyard
     - Indoor, Hydroponic, Aquaponic, Aeroponic
   - Configurazioni specifiche per tipo:
     - `greenhouseConfig` (Serra)
     - `hydroponicConfig` (Idroponica)
     - `aquaponicConfig` (Acquaponica)
     - `aeroponicConfig` (Aeroponica)
     - `indoorConfig` (Indoor)

3. **Step 3: Posizione Geografica** (condizionale)
   - Mostrato solo se `needsLocation = true`
   - Skippa per: Indoor, Hydroponic, Aquaponic, Aeroponic, Orchard, OliveGrove, Vineyard
   - Input: Lat, Lon, Altitude

4. **Step 4: Configurazione Strutture e Dimensioni**
   - Vasi (count, diameter)
   - Letti (count, length, width, height, holes)
   - Contenitori (count, length, width, height, holes)
   - Vasche (count, length, width, height, holes)
   - Campo Aperto (size, unit)
   - Salva tutto in `structureConfig`

5. **Step 5: Suolo**
   - Tipo suolo
   - pH

6. **Step 6: Microclima**
   - Esposizione solare
   - Ore di sole giornaliere
   - Direzione pendenza
   - Protezione vento
   - Compost bin
   - Ostacoli 3D
   - Visual Sun Input
   - Photo Analysis (Pro)

---

## ⚠️ Problemi Identificati

### 1. **Manca Gerarchia Chiara**
- `gardenType` include sia spazi (Indoor) che sistemi (Hydroponic)
- Non distingue tra "DOVE" (campo/serra/indoor) e "COME" (vasi/letti/filari)

### 2. **Campo Aperto e Serra Confusi**
- Campo aperto è dentro `structureConfig.openField`
- Serra (greenhouse) ha `greenhouseConfig` separato
- Ma entrambi dovrebbero poter avere vasi/letti/filari

### 3. **Indoor Troppo Specifico**
- `gardenType: 'Indoor'` è generico
- `gardenType: 'Hydroponic'` è troppo specifico
- Indoor dovrebbe essere categoria padre con sistemi come figli

### 4. **Strutture Non Linkate allo Spazio**
- `structureConfig.pots` → Dove sono? Campo o serra?
- Manca il concetto di "vasi IN serra" vs "vasi IN campo"

---

## 🎯 Cosa Serve

### Nuova Gerarchia:

```
Garden {
  strategy: 'unified' | 'separated'

  // Spazi presenti (multi-select)
  hasOpenField: boolean
  hasGreenhouse: boolean
  hasIndoor: boolean

  // Config campo aperto (se hasOpenField)
  openFieldConfig: {
    size: number
    unit: AreaUnit
    structures: {
      pots?: ...
      beds?: ...
      containers?: ...
      rows?: ... // NUOVO: filari
    }
  }

  // Config serra (se hasGreenhouse)
  greenhouseConfig: {
    structureType: ...
    length, width, height
    structures: {
      pots?: ...
      beds?: ...
      containers?: ...
      rows?: ... // NUOVO: filari
    }
  }

  // Config indoor (se hasIndoor)
  indoorConfig: {
    systemType: 'Hydroponic' | 'Aquaponic' | 'Aeroponic' | 'GrowBox'
    hydroponicConfig?: ...
    aquaponicConfig?: ...
    aeroponicConfig?: ...
  }
}
```

---

## 🚀 Approccio Implementativo

### Opzione A: Modificare GardenOnboarding.tsx ❌
**Pro**: Mantiene continuità
**Contro**: File troppo grande (1444 righe), rischioso da modificare

### Opzione B: Creare GardenWizardV2.tsx ✅
**Pro**:
- Partire da zero con design pulito
- Mantenere vecchio wizard come fallback
- Migrare gradualmente

**Contro**:
- Doppio codice temporaneamente
- Serve switch per abilitare nuovo wizard

---

## 📝 Piano Implementativo

### Fase 1: Nuovo Wizard Minimal (MVP)
Crea `components/wizard/GardenWizardV2.tsx` con:
- Step 1: Nome + Strategia (Unico/Separato)
- Step 2: Tipo Spazio (Campo/Serra/Indoor - multi-select)
- Step 3A: Config Campo Aperto (se selezionato)
- Step 3B: Config Serra (se selezionato)
- Step 3C: Config Indoor (se selezionato)
- Step 4: Riepilogo e Conferma

**Skippa** (per MVP):
- Posizione GPS (usa default)
- Suolo
- Microclima
- Photo Analysis

### Fase 2: Componenti Modulari
Crea componenti riutilizzabili:
- `SpaceTypeSelector.tsx` → Multi-select Campo/Serra/Indoor
- `OpenFieldConfigForm.tsx` → Form config campo
- `GreenhouseConfigForm.tsx` → Form config serra
- `IndoorConfigForm.tsx` → Form config indoor
- `StructurePicker.tsx` → Checkbox Vasi/Letti/Cassoni/Filari

### Fase 3: Integrazione
- Feature flag in settings: `useNewWizard: boolean`
- Se `true` → GardenWizardV2
- Se `false` → GardenOnboarding (vecchio)

### Fase 4: Migrazione Dati
- Migrazione automatica da vecchia struttura a nuova
- Backward compatibility per orti esistenti

---

## 🎨 Componenti da Creare

### 1. `GardenWizardV2.tsx`
Wizard principale, gestisce step e state globale

### 2. `wizard/StrategySelector.tsx`
```tsx
interface StrategySelectorProps {
  value: 'unified' | 'separated'
  onChange: (value: 'unified' | 'separated') => void
}
```

### 3. `wizard/SpaceTypeSelector.tsx`
```tsx
interface SpaceTypeSelectorProps {
  selected: {
    openField: boolean
    greenhouse: boolean
    indoor: boolean
  }
  onChange: (selected: {...}) => void
}
```

### 4. `wizard/OpenFieldConfig.tsx`
Form completo per campo aperto (size + structures)

### 5. `wizard/GreenhouseConfig.tsx`
Form completo per serra (tipo + dimensioni + structures)

### 6. `wizard/IndoorConfig.tsx`
Form completo per indoor (sistema + config specifica)

### 7. `wizard/StructurePicker.tsx`
Component riusabile per selezionare Vasi/Letti/Cassoni/Filari

---

## 📦 TypeScript Types da Estendere

```typescript
// In types.ts

export interface Garden {
  // ... campi esistenti ...

  // NUOVO: Strategia organizzazione
  strategy?: 'unified' | 'separated'

  // NUOVO: Flags per spazi presenti
  hasOpenField?: boolean
  hasGreenhouse?: boolean
  hasIndoor?: boolean

  // Estende openFieldConfig
  openFieldConfig?: {
    size: number
    unit: AreaUnit
    structures?: {
      pots?: Array<{count: number, diameter: number}>
      beds?: Array<{count: number, length: number, width: number, height: number}>
      containers?: Array<{count: number, length: number, width: number, height: number}>
      // NUOVO
      rows?: Array<{count: number, length: number, spacing: number}>
    }
  }

  // Estende greenhouseConfig
  greenhouseConfig?: GreenhouseConfig & {
    structures?: {
      // Stesse strutture di openFieldConfig
    }
  }

  // Estende indoorConfig
  indoorConfig?: IndoorGrowingConfig & {
    systemType?: 'Hydroponic' | 'Aquaponic' | 'Aeroponic' | 'GrowBox'
  }
}
```

---

## ✅ Prossimi Step

1. ✅ Analisi completata
2. ⏳ Creare types estesi
3. ⏳ Implementare GardenWizardV2 (MVP)
4. ⏳ Creare componenti modulari
5. ⏳ Testing con dati reali
6. ⏳ Feature flag per switch
7. ⏳ Migrazione dati esistenti

---

**Conclusione**: Il wizard esistente è troppo complesso per essere modificato direttamente. L'approccio migliore è creare `GardenWizardV2.tsx` da zero seguendo il design gerarchico documentato in `WIZARD_DESIGN_GERARCHICO.md`.
