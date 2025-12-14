# Gestione Colture Specializzate - OrtoMio AI

## Panoramica

OrtoMio AI gestisce diverse colture specializzate con funzionalità dedicate. Queste sono **feature Pro** disponibili solo per utenti con tier PRO.

## Colture Supportate

### ✅ Implementate

1. **Alberi da Frutto** (`FruitTree`)
2. **Fragole** (`Strawberry`)
3. **Olive/Olio** (`Olive`)
4. **Vite** (`Vine`)
5. **Erbe Aromatiche** (`Aromatic`)
6. **Frutti Esotici** (`ExoticFruit`)
7. **Lamponi** (`Raspberry`)

### ❌ Mancanti

1. **Kiwi** (`Kiwifruit`) - NON implementato

---

## 1. Alberi da Frutto (FruitTree)

### Architettura

**File principali:**
- `types/fruitTree.ts` - Interfacce TypeScript
- `data/fruitTreeMasterSheets.ts` - Database varietà (Melo, Pero, Pesco, etc.)
- `logic/fruitTreeEngine.ts` - Logica calcolo task
- `components/FruitTreeManagement.tsx` - UI gestione

### Caratteristiche

#### Tipi di Alberi Supportati
- **Pome**: Mele, Pere
- **Stone**: Pesche, Albicocche, Ciliegie
- **Citrus**: Agrumi
- **Nut**: Noci, Mandorle
- **Berry**: Piccoli frutti (non lamponi)

#### Dati Gestiti
```typescript
fruitTreeData: {
  treeAge: number;                    // Anni dall'impianto
  pruningType?: 'Formative' | 'Maintenance' | 'Rejuvenation';
  pruningSeason?: 'Winter' | 'Summer';
  graftingInfo?: {                    // Info innesto
    type: string;
    date: string;
    success: boolean;
  };
  fruitThinning?: {                    // Diradamento frutti
    date: string;
    quantityRemoved: number;
  };
  treeCoordinates?: GeoLocation;       // Posizione albero
}
```

#### Funzionalità Engine
- ✅ Calcolo task potatura (invernale/estiva)
- ✅ Gestione impollinazione (self-fertile/sterile)
- ✅ Verifica chill hours (ore di freddo necessarie)
- ✅ Calcolo finestra raccolta
- ✅ Gestione diradamento frutti
- ✅ Record potatura e innesto

#### Varietà Disponibili
- Melo: Golden Delicious, Fuji, Gala, Granny Smith
- Pero: Abate Fetel, Conference, Williams
- Pesco: Redhaven, Springcrest, Fayette
- Albicocco: Reale d'Imola, Tonda di Costigliole
- Ciliegio: Ferrovia, Bigarreau
- Agrumi: Arancio, Limone, Mandarino
- Noci: Noce comune, Mandorlo

### Esempio Utilizzo

```typescript
// Il sistema identifica automaticamente se una pianta è un frutteto
const task = {
  plantName: 'MELO GOLDEN DELICIOUS',
  fruitTreeData: {
    treeAge: 5,
    pruningType: 'Maintenance',
    pruningSeason: 'Winter'
  }
};

// Engine calcola task automatici
const advice = calculateFruitTreeTasks(fruitTreeCrop, treeAge);
// Ritorna: potatura, concimazione, diradamento, etc.
```

---

## 2. Fragole (Strawberry)

### Architettura

**File principali:**
- `types/strawberry.ts` - Interfacce TypeScript
- `data/strawberryMasterSheets.ts` - Database varietà
- `logic/strawberryEngine.ts` - Logica calcolo task
- `components/StrawberryManagement.tsx` - UI gestione

### Caratteristiche

#### Tipi di Fragole
- **June-bearing**: Produzione concentrata (maggio-giugno)
- **Ever-bearing**: Produzione continua (primavera-autunno)
- **Day-neutral**: Produzione indipendente dal fotoperiodo

#### Dati Gestiti
```typescript
strawberryData: {
  varietyType: 'June-bearing' | 'Ever-bearing' | 'Day-neutral';
  runnerAction?: 'Remove' | 'Keep' | 'Propagate';  // Gestione stoloni
  mulchingApplied?: boolean;                        // Pacciamatura
  renovationCompleted?: boolean;                    // Rinnovo impianto
}
```

#### Funzionalità Engine
- ✅ Gestione stoloni (runner management)
- ✅ Pacciamatura invernale
- ✅ Rinnovo impianto (per June-bearing)
- ✅ Calcolo finestra raccolta
- ✅ Gestione sistema impianto (Matted Row, Spaced Row, Hill System)

#### Varietà Disponibili
- Fragola di Bosco
- Fragola Rifiorente
- Fragola Alba
- Fragola Elsanta
- Fragola Camarosa

### Esempio Utilizzo

```typescript
const task = {
  plantName: 'FRAGOLA DI BOSCO',
  strawberryData: {
    varietyType: 'June-bearing',
    runnerAction: 'Remove',  // Rimuovi stoloni durante produzione
    renovationCompleted: false
  }
};

// Engine calcola:
// - Runner management (giugno-luglio)
// - Mulching invernale (ottobre-novembre)
// - Rinnovo impianto (luglio)
```

---

## 3. Olive/Olio (Olive)

### Architettura

**File principali:**
- `types/olive.ts` - Interfacce TypeScript
- `data/oliveMasterSheets.ts` - Database varietà
- `logic/oliveEngine.ts` - Logica calcolo task
- `components/OliveHarvest.tsx` - UI raccolta e frangitura

### Caratteristiche

#### Tipi di Olivo
- **Table**: Da tavola (es. Ascolana)
- **Oil**: Da olio (es. Frantoio, Leccino)
- **Dual-purpose**: Entrambi (es. Taggiasca)

#### Dati Gestiti
```typescript
oliveData: {
  varietyType: 'Table' | 'Oil' | 'Dual-purpose';
  harvestMethod?: 'Manual' | 'Mechanical' | 'Shaking';
  pruningType?: 'Winter' | 'Summer';
}

// Per raccolta:
oliveHarvest: {
  oliveQuantity: number;        // kg olive
  millingDate?: string;         // Data frangitura
  oilProduced?: number;         // litri olio
  oilQuality?: {                // Qualità olio
    acidity: number;            // % acido oleico
    polyphenols: number;        // mg/kg
  };
  harvestMethod?: 'Manual' | 'Mechanical' | 'Shaking';
}
```

#### Funzionalità Engine
- ✅ Potatura invernale (febbraio-marzo)
- ✅ Potatura verde estiva (giugno-luglio)
- ✅ Concimazione pre-fioritura
- ✅ Calcolo finestra raccolta (ottobre-dicembre)
- ✅ Calcolo resa olio attesa (kg olio/100kg olive)
- ✅ Urgenza frangitura (entro 24-48h dalla raccolta)
- ✅ Gestione qualità olio (acidità, polifenoli)

#### Varietà Disponibili
- Frantoio (olio)
- Leccino (olio)
- Taggiasca (dual-purpose)
- Ascolana (tavola)
- Moraiolo (olio)
- Pendolino (olio, impollinatore)

### Esempio Utilizzo

```typescript
// Raccolta olive
const harvest = {
  oliveQuantity: 100,  // kg
  date: '2024-11-15',
  harvestMethod: 'Manual'
};

// Engine calcola:
const expectedOil = calculateExpectedOilYield(100, 18); // 18% resa
// Ritorna: ~18 litri di olio

// Verifica urgenza frangitura
const isUrgent = isMillingUrgent(harvest.date);
// Ritorna: true se passate >24h dalla raccolta
```

---

## 4. Vite (Vine)

### Architettura

**File principali:**
- `types/vine.ts` - Interfacce TypeScript
- `data/vineMasterSheets.ts` - Database varietà
- `logic/vineEngine.ts` - Logica calcolo task
- `components/VineHarvest.tsx` - UI vendemmia e vinificazione
- `components/BrixMonitor.tsx` - Monitoraggio gradi Brix

### Caratteristiche

#### Tipi di Vite
- **Wine**: Da vino (Sangiovese, Chardonnay, etc.)
- **Table**: Da tavola (uva da tavola)
- **Raisin**: Per uva passa

#### Sistemi di Allevamento
- **Guyot**: Sistema a cordone speronato
- **Cordon**: Sistema a cordone permanente
- **Pergola**: Sistema a pergola
- **Alberello**: Sistema tradizionale

#### Dati Gestiti
```typescript
vineData: {
  varietyType: 'Wine' | 'Table' | 'Raisin';
  trainingSystem?: 'Guyot' | 'Cordon' | 'Pergola' | 'Alberello';
  pruningType?: 'Winter' | 'Summer';
  operationType?: 'Pruning' | 'Tying' | 'ShootThinning' | 'LeafRemoval';
}

// Per vendemmia:
vineHarvest: {
  grapeQuantity: number;        // kg uva
  brixAtHarvest: number;        // Gradi Brix
  harvestDate: string;
  winemakingDate?: string;      // Data vinificazione
  wineProduced?: number;        // litri vino
  wineType?: 'Red' | 'White' | 'Rosé' | 'Sparkling';
  wineAnalysis?: {              // Analisi vino
    alcohol: number;            // % vol
    acidity: number;            // g/L
    pH: number;
  };
}
```

#### Funzionalità Engine
- ✅ Potatura invernale (dicembre-febbraio)
- ✅ Potatura verde estiva (giugno-agosto)
- ✅ Gestione germogli (spollonatura, cimatura)
- ✅ Diradamento grappoli
- ✅ Calcolo finestra vendemmia
- ✅ Monitoraggio Brix (gradi zuccherini)
- ✅ Verifica momento ottimale vendemmia
- ✅ Urgenza vinificazione (entro 24h per vini rossi)
- ✅ Stima resa vino (70-80% peso uva)

#### Varietà Disponibili
**Viti Rosse:**
- Sangiovese
- Nebbiolo
- Barbera
- Montepulciano
- Primitivo

**Viti Bianche:**
- Chardonnay
- Pinot Grigio
- Trebbiano
- Vermentino
- Moscato

### Esempio Utilizzo

```typescript
// Monitoraggio Brix
const brixTarget = 22;  // Gradi Brix target per vendemmia
const currentBrix = 20;

// Engine verifica se è momento ottimale
const isReady = isOptimalHarvestTime(vineCrop, currentBrix, date);
// Ritorna: true se Brix >= target

// Vendemmia
const harvest = {
  grapeQuantity: 500,  // kg
  brixAtHarvest: 22,
  harvestDate: '2024-09-15',
  wineType: 'Red'
};

// Stima vino prodotto
const wineYield = grapeQty * 0.75;  // 75% resa per vino rosso
// Ritorna: ~375 litri di vino
```

---

## 5. Kiwi - MANCANTE ❌

### Stato Attuale
- ❌ **NON implementato** come coltura specializzata
- ❌ Nessun file dedicato (`types/kiwi.ts`, `data/kiwiMasterSheets.ts`, etc.)
- ❌ Nessun engine (`logic/kiwiEngine.ts`)
- ❌ Nessun componente UI (`components/KiwiManagement.tsx`)

### Cosa Serve per Implementarlo

1. **Creare interfacce TypeScript** (`types/kiwi.ts`):
   ```typescript
   export interface KiwiCrop extends PlantMasterSheet {
     cropType: 'Kiwi';
     varietyType: 'Hayward' | 'Green' | 'Gold';
     gender: 'Male' | 'Female';  // Kiwi è dioico!
     pollinatorRequired: boolean;
     trainingSystem: 'T-bar' | 'Pergola';
     harvestWindow: { startMonth: number; endMonth: number; };
   }
   ```

2. **Creare master sheets** (`data/kiwiMasterSheets.ts`):
   - Varietà comuni: Hayward, Bruno, Tomuri (maschio)
   - Gestione impollinazione (1 maschio ogni 5-8 femmine)
   - Potatura invernale ed estiva
   - Gestione pergola/T-bar

3. **Creare engine** (`logic/kiwiEngine.ts`):
   - Calcolo task potatura
   - Gestione impollinazione
   - Calcolo finestra raccolta (ottobre-novembre)
   - Gestione conservazione (kiwi si conserva mesi)

4. **Creare componente UI** (`components/KiwiManagement.tsx`):
   - Gestione piante maschio/femmina
   - Monitoraggio maturazione
   - Gestione raccolta e conservazione

5. **Aggiungere al database schema**:
   - Campo `kiwi_data JSONB` in `garden_tasks`
   - Tabelle per record potatura kiwi

---

## 6. Lamponi (Raspberry)

### Architettura

**File principali:**
- `types/raspberry.ts` - Interfacce TypeScript
- `data/raspberryMasterSheets.ts` - Database varietà (Tulameen, Glen Ample, Heritage, Autumn Bliss)
- `logic/raspberryEngine.ts` - Logica calcolo task
- `components/RaspberryManagement.tsx` - UI gestione

### Caratteristiche

#### Tipi di Varietà Supportate
- **Summer-bearing**: Produzione estiva su canne floricane (es. Tulameen, Glen Ample)
- **Ever-bearing**: Produzione continua su canne primocane (es. Heritage)
- **Fall-bearing**: Produzione autunnale su canne primocane (es. Autumn Bliss)

#### Tipi di Canne
- **Primocane**: Canne dell'anno corrente (producono nello stesso anno per varietà rifiorenti)
- **Floricane**: Canne dell'anno precedente (producono nell'estate del secondo anno)

#### Dati Gestiti
```typescript
raspberryData: {
  varietyType: 'Summer-bearing' | 'Ever-bearing' | 'Fall-bearing';
  canesType: 'Primocane' | 'Floricane';
  trainingSystem: 'Trellis' | 'Free-standing';
  pruningCompleted?: boolean;
  canesRemoved?: number;
  supportInstalled?: boolean;
}
```

#### Funzionalità Engine
- ✅ Gestione canne (rimozione canne floricane esaurite dopo raccolta)
- ✅ Potatura differenziata per tipo varietà
- ✅ Calcolo finestra raccolta
- ✅ Gestione supporti (trelis)
- ✅ Propagazione (polloni basali)

#### Varietà Disponibili
- Tulameen (Summer-bearing, Floricane)
- Glen Ample (Summer-bearing, Floricane)
- Heritage (Ever-bearing, Primocane)
- Autumn Bliss (Fall-bearing, Primocane)

### Esempio Utilizzo

```typescript
const task = {
  plantName: 'LAMPONE TULAMEEN',
  raspberryData: {
    varietyType: 'Summer-bearing',
    canesType: 'Floricane',
    trainingSystem: 'Trellis',
    supportInstalled: true
  }
};

// Engine calcola:
// - Rimozione canne floricane esaurite (agosto-settembre)
// - Potatura invernale primocane (dicembre-febbraio)
// - Raccolta (giugno-luglio)
// - Installazione supporti (marzo-aprile)
```

---

## 6. Frutti Esotici (ExoticFruit)

### Architettura

**File principali:**
- `types/exoticFruit.ts` - Interfacce TypeScript (ExoticFruitCrop, ExoticFruitVariety, FeasibilityResult)
- `data/exoticFruitMasterSheets.ts` - Database frutti esotici con varietà e metadati climatici
- `services/geographicMatchingService.ts` - Servizio matching geografico e calcolo fattibilità
- `services/userLocationService.ts` - Servizio gestione profilo posizione utente
- `components/planner/GeographicFeasibilityCard.tsx` - Card fattibilità geografica
- `components/planner/VarietySelector.tsx` - Selettore varietà
- `components/planner/CultivationSystemSelector.tsx` - Selettore sistema coltivazione
- `components/shared/GeographicMatchingWidget.tsx` - Widget dashboard
- `components/ExoticFruitManagement.tsx` - UI gestione

### Caratteristiche

#### Tipi di Frutti Supportati
- **Tropical**: Mango, Papaya, Banane, Ananas
- **Subtropical**: Avocado, Feijoa, Kiwi
- **MediterraneanExotic**: Fico d'India, Kumquat

#### Matching Geografico

Il sistema calcola automaticamente la fattibilità di ogni pianta esotica per la zona dell'utente:

**Algoritmo Fattibilità:**
- Score iniziale: 100
- Penalità zona USDA: -40 se non compatibile, -20 se borderline
- Penalità altitudine: -30 se supera limite massimo
- Penalità distanza mare: -15 se pianta beneficia mare ma troppo lontana
- Determina sistema consigliato: openField / container / greenhouse
- Suggerisce varietà migliore basata su cold hardiness e container-friendly

**Score di Fattibilità:**
- **80-100 (Ideale)**: Perfettamente adatta alla zona, nessuna protezione speciale necessaria
- **50-79 (Possibile)**: Può crescere con alcune accortezze o protezioni temporanee
- **20-49 (Difficile)**: Richiede protezioni significative o sistemi controllati (serra)
- **0-19 (Sconsigliato)**: Clima non adatto, considera alternative o sistemi completamente controllati

#### Dati Gestiti
```typescript
exoticFruitData: {
  varietyId?: string;              // ID varietà selezionata
  cultivationSystem: 'openField' | 'container' | 'greenhouse';
  feasibilityResult?: FeasibilityResult; // Risultato calcolo fattibilità
  protectionInstalled?: boolean;   // Protezioni invernali installate
  movedIndoor?: boolean;           // Spostato indoor per inverno (container)
}

// Per pianta esotica:
ExoticFruitCrop: {
  varieties?: ExoticFruitVariety[]; // Array varietà disponibili
  climateCompatibility: {
    usdaZones: number[];            // Zone USDA compatibili
    optimalUsdaZones: number[];     // Zone USDA ottimali
    tempMinSurvival: number;        // Temp minima sopravvivenza (°C)
    tempMinGrowth: number;          // Temp minima crescita (°C)
    tempOptimal: { min: number; max: number }; // Range ottimale
    tempMax: number;                // Temp massima tollerata (°C)
    maxAltitudeMeters?: number;     // Altitudine massima
    benefitsFromSea?: boolean;      // Beneficia clima marittimo
    seaDistanceKm?: number;         // Distanza ottimale dal mare
  };
  cultivationSystems: {
    openField: {
      possible: boolean;
      requires: {
        minUsdaZone?: number;
        protection?: 'None' | 'Temporary' | 'Permanent';
        protectionType?: 'TNT' | 'Mulch' | 'Windbreak';
      };
    };
    container: {
      possible: boolean;
      minSizeLiters?: number;
      moveableIndoor?: boolean;
      indoorMonths?: number[];
    };
    greenhouse: {
      required: boolean;
      type: 'Cold' | 'Warm' | 'Tropical';
      heatingRequired: boolean;
      minTempGreenhouse?: number;
    };
  };
}
```

#### Funzionalità Engine
- ✅ Calcolo automatico fattibilità geografica basata su posizione utente
- ✅ Auto-detect zona USDA da coordinate GPS
- ✅ Suggerimento varietà ottimale per zona climatica
- ✅ Suggerimento sistema coltivazione (piena terra/vaso/serra)
- ✅ Calcolo protezioni necessarie per inverno
- ✅ Alert quando temperatura scende sotto soglia critica
- ✅ Timeline personalizzata basata su clima locale
- ✅ Gestione spostamento indoor per piante in vaso

#### Varietà Disponibili

**Mango:**
- Irwin (nano, container-friendly, USDA 10-11)
- Kent (vigoroso, USDA 10-11)
- Keitt (tardivo, resistente malattie, USDA 10-11)

**Avocado:**
- Hass (standard, USDA 9-11)
- Fuerte (resistente freddo, USDA 9-11)
- Bacon (più rustico, USDA 8-11)

**Papaya:**
- Solo (nano, container-friendly, USDA 10-11)
- Waimanalo (tropicale, USDA 11)

**Altri:**
- Banano (Dwarf Cavendish)
- Ananas (Smooth Cayenne)

#### Componenti UI

**GeographicFeasibilityCard:**
- Mostra score fattibilità (0-100)
- Badge colore in base a fattibilità (verde/giallo/arancione/rosso)
- Lista protezioni necessarie
- Warnings climatici
- Varietà e sistema consigliati

**VarietySelector:**
- Card per ogni varietà disponibile
- Badge "Consigliata" per varietà suggerita
- Info resistenza freddo, maturità, container-friendly
- Filtri per clima/vaso/nane

**CultivationSystemSelector:**
- Card per piena terra, vaso, serra
- Badge "Consigliato" per sistema suggerito
- Requisiti per ogni sistema
- Protezioni necessarie per zona utente

**GeographicMatchingWidget (Dashboard):**
- Sezione "Piante Ideali" (score 80+)
- Sezione "Nuove Opportunità" (score 50-79)
- Sezione "Attenzione Clima" (score <50)
- Link diretto al Planner per esplorare tutte le piante

### Esempio Utilizzo

```typescript
// Utente cerca "Mango" nel Planner
const plant = getMasterSheet('MANGO'); // ExoticFruitCrop
const userLocation = await getUserLocationProfile(); // { lat, lon, usdaZone: '9b', ... }

// Sistema calcola fattibilità
const feasibility = calculateFeasibility(plant, userLocation);
// Ritorna: {
//   feasibility: 'Possible',
//   score: 65,
//   recommendedVariety: 'Irwin',
//   recommendedSystem: 'container',
//   requiredProtections: ['Vaso min 100L', 'Spostare indoor in inverno'],
//   warnings: ['La tua zona USDA (9b) non è ideale per questa pianta.']
// }

// UI mostra:
// - GeographicFeasibilityCard con score 65/100
// - VarietySelector con Irwin evidenziata come "Consigliata"
// - CultivationSystemSelector con "Vaso" evidenziato come "Consigliato"
```

### Integrazione con Planner

Nel Planner, quando l'utente cerca una pianta esotica:

1. Sistema rileva automaticamente posizione utente (GPS)
2. Calcola fattibilità in tempo reale
3. Mostra card fattibilità con score e suggerimenti
4. Permette selezione varietà ottimale
5. Permette selezione sistema coltivazione
6. Include dati selezionati nel journal entry quando pianta viene aggiunta

---

## Architettura Generale

### Pattern Comune

Tutte le colture specializzate seguono lo stesso pattern:

```
┌─────────────────────────────────────────┐
│  Types (types/{crop}.ts)                │
│  - Interfacce TypeScript                │
│  - Estensioni GardenTask                │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Data (data/{crop}MasterSheets.ts)      │
│  - Database varietà                     │
│  - Caratteristiche coltura              │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Engine (logic/{crop}Engine.ts)         │
│  - Calcolo task automatici              │
│  - Logica business                      │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Component (components/{Crop}Management) │
│  - UI gestione                          │
│  - Form raccolta                        │
└─────────────────────────────────────────┘
```

### Database Schema

Tutte le colture specializzate usano campi JSONB in `garden_tasks`:

```sql
CREATE TABLE garden_tasks (
  -- ... campi base ...
  
  -- Specialized Crop Data (JSONB per flessibilità)
  strawberry_data JSONB,
  fruit_tree_data JSONB,
  aromatic_data JSONB,
  olive_data JSONB,
  vine_data JSONB,
  exotic_fruit_data JSONB,
  raspberry_data JSONB,
  -- kiwi_data JSONB,      -- DA AGGIUNGERE
);
```

### Feature Flag

Tutte le colture specializzate sono protette da feature flag:

```typescript
// packages/core/config/tiers.ts
features: {
  specializedCrops: boolean; // Pro only
}
```

I componenti verificano il tier:
```typescript
const { can } = useTier();
if (!can('specializedCrops')) {
  return <UpgradePrompt />;
}
```

---

## Prossimi Passi per Implementare Kiwi

### Priorità
1. **Kiwi** - Più complesso (gestione maschio/femmina, pergola)

### Checklist Implementazione

Per Kiwi:

- [ ] Creare `types/kiwi.ts` con interfacce
- [ ] Creare `data/kiwiMasterSheets.ts` con varietà
- [ ] Creare `logic/kiwiEngine.ts` con logica
- [ ] Creare `components/KiwiManagement.tsx` per UI
- [ ] Aggiungere campo `kiwi_data JSONB` in `database/schema.sql`
- [ ] Aggiornare `specializedCropMasterSheets.ts` per esportare
- [ ] Aggiungere al tipo `CropType` in `types.ts`
- [ ] Testare con dati reali
- [ ] Documentare in questo file

---

## Note Tecniche

### Perché JSONB?
- Flessibilità: ogni coltura ha dati diversi
- Estendibilità: facile aggiungere nuovi campi
- Performance: PostgreSQL ottimizza query JSONB
- Compatibilità: funziona con localStorage (serializzazione JSON)

### Perché Feature Pro?
- Complessità: richiedono logica dedicata
- Dati avanzati: tracking dettagliato
- Analytics: analisi produzione
- Valore aggiunto: differenziazione Free vs Pro

---

**Ultimo aggiornamento**: 2025-01-XX
**Stato**: ✅ 7/7 colture implementate (100%)







