# Analisi: Operazioni Specifiche per Sistemi Idroponici e Indoor

## Data: 2026-02-13

---

## 🎯 PROBLEMA IDENTIFICATO

I sistemi idroponici, acquaponici, aeroponici e indoor hanno operazioni completamente diverse rispetto alle coltivazioni in campo aperto, ma il sistema attuale usa gli stessi TaskType per tutti i tipi di orto.

### Differenze Critiche

| Operazione | Campo Aperto | Idroponica/Indoor |
|------------|--------------|-------------------|
| **Irrigazione** | Necessaria, schedulata | NON NECESSARIA (radici in soluzione) |
| **Fertilizzazione** | Concimi solidi/liquidi al suolo | Gestita tramite EC della soluzione nutritiva |
| **Controllo Nutrienti** | Analisi suolo periodica | Controllo pH/EC giornaliero/settimanale |
| **Trattamenti Fitosanitari** | Antiparassitari, fungicidi al suolo | Prevenzione alghe, funghi in soluzione, H2O2 |
| **Operazioni Manutenzione** | Sarchiatura, pacciamatura, rincalzo | Cambio soluzione, pulizia sistema, controllo pompe |
| **Monitoraggio** | Visivo, occasionale | Continuo (pH, EC, temperatura, ossigeno) |

---

## 📊 STATO ATTUALE

### TaskType Esistenti (types.ts)
```typescript
taskType: 'Sowing' | 'Transplant' | 'Fertilize' | 'Prune' | 'Harvest' | 
          'Treatment' | 'Irrigation' | 'Photo' | ...
```

### Problemi
1. ❌ `'Irrigation'` non ha senso per idroponica (radici sempre in soluzione)
2. ❌ `'Fertilize'` non rappresenta la gestione EC/nutrienti in soluzione
3. ❌ `'Treatment'` non distingue tra trattamenti al suolo vs in soluzione
4. ❌ Mancano operazioni specifiche: cambio soluzione, controllo pH/EC, pulizia sistema
5. ❌ Il Director genera suggerimenti di irrigazione/fertilizzazione anche per orti idroponici

### Dati Esistenti (Database)
✅ `hydroponic_readings` table - per salvare letture pH/EC/temperatura
✅ `gardens.hydroponic_config` JSONB - configurazione sistema
✅ Storage methods esistenti per CRUD readings

---

## 🎯 SOLUZIONE PROPOSTA

### Approccio 1: TaskType Specifici per Idroponica (RACCOMANDATO)

Aggiungere nuovi TaskType specifici per sistemi idroponici:

```typescript
// Nuovi TaskType per idroponica
taskType: ... | 
  'HydroNutrientCheck' |      // Controllo pH/EC/temperatura
  'HydroSolutionChange' |     // Cambio completo soluzione
  'HydroSystemClean' |        // Pulizia sistema (ugelli, canali, serbatoio)
  'HydroPhAdjust' |           // Correzione pH
  'HydroEcAdjust' |           // Correzione EC (aggiunta nutrienti)
  'HydroAlgaeControl' |       // Controllo alghe (H2O2, pulizia)
  'HydroEquipmentCheck' |     // Controllo pompe, aeratori, timer
  'AquaponicFishFeed' |       // Alimentazione pesci (acquaponica)
  'AquaponicWaterTest' |      // Test ammoniaca/nitriti/nitrati
  'AeroponicNozzleClean'      // Pulizia ugelli (aeroponica)
```

**Vantaggi:**
- ✅ Chiaro e specifico
- ✅ Facile filtrare task per tipo sistema
- ✅ Suggerimenti Director mirati
- ✅ Analytics separate per tipo operazione

**Svantaggi:**
- ⚠️ Aumenta complessità TaskType enum
- ⚠️ Richiede aggiornamenti UI per mostrare nuovi tipi

### Approccio 2: Task Generici + Metadata (ALTERNATIVO)

Usare TaskType generici ma con metadata specifico:

```typescript
// Task generico
taskType: 'Maintenance' | 'Monitoring' | 'Treatment'

// Con metadata specifico
hydroponicTaskData?: {
  operationType: 'nutrient_check' | 'solution_change' | 'ph_adjust' | 'ec_adjust' | 
                 'algae_control' | 'system_clean' | 'equipment_check'
  systemType: 'NFT' | 'DWC' | 'EbbFlow' | ...
  readings?: {
    ph?: number
    ec?: number
    temperature?: number
    volume?: number
  }
}
```

**Vantaggi:**
- ✅ Non modifica TaskType enum
- ✅ Flessibile per aggiungere nuovi tipi operazione

**Svantaggi:**
- ⚠️ Meno chiaro a prima vista
- ⚠️ Richiede sempre controllare metadata
- ⚠️ Più complesso filtrare/aggregare

---

## 🔧 IMPLEMENTAZIONE RACCOMANDATA

### Fase 1: Estendere TaskType (Approccio 1)

#### 1.1 Aggiornare types.ts
```typescript
export type HydroponicTaskType = 
  | 'HydroNutrientCheck'
  | 'HydroSolutionChange'
  | 'HydroSystemClean'
  | 'HydroPhAdjust'
  | 'HydroEcAdjust'
  | 'HydroAlgaeControl'
  | 'HydroEquipmentCheck';

export type AquaponicTaskType =
  | 'AquaponicFishFeed'
  | 'AquaponicWaterTest'
  | 'AquaponicFilterClean';

export type AeroponicTaskType =
  | 'AeroponicNozzleClean'
  | 'AeroponicPressureCheck';

// Aggiungere a TaskType esistente
taskType: ... | HydroponicTaskType | AquaponicTaskType | AeroponicTaskType
```

#### 1.2 Aggiornare taskTranslations.ts
```typescript
export const taskTypeTranslations: Record<string, string> = {
  // ... esistenti
  'HydroNutrientCheck': 'Controllo Nutrienti',
  'HydroSolutionChange': 'Cambio Soluzione',
  'HydroSystemClean': 'Pulizia Sistema',
  'HydroPhAdjust': 'Correzione pH',
  'HydroEcAdjust': 'Correzione EC',
  'HydroAlgaeControl': 'Controllo Alghe',
  'HydroEquipmentCheck': 'Controllo Attrezzature',
  'AquaponicFishFeed': 'Alimentazione Pesci',
  'AquaponicWaterTest': 'Test Acqua',
  'AquaponicFilterClean': 'Pulizia Filtri',
  'AeroponicNozzleClean': 'Pulizia Ugelli',
  'AeroponicPressureCheck': 'Controllo Pressione',
};
```

#### 1.3 Creare hydroponicDirector.ts
```typescript
/**
 * Director specializzato per sistemi idroponici
 * Genera suggerimenti specifici per NFT, DWC, Ebb&Flow, Drip, Wick, Kratky
 */
export function generateHydroponicSuggestions(
  garden: Garden,
  tasks: GardenTask[],
  readings: HydroponicReading[],
  currentDate: Date
): DirectorPrompt[] {
  const prompts: DirectorPrompt[] = [];
  
  if (!garden.hydroponicConfig) return prompts;
  
  const config = garden.hydroponicConfig;
  const lastReading = readings[0]; // Assume sorted by date desc
  
  // 1. Controllo pH fuori range
  if (lastReading?.ph) {
    const phTarget = config.nutrientSolution.phTarget;
    const phDiff = Math.abs(lastReading.ph - phTarget);
    
    if (phDiff > 0.5) {
      prompts.push({
        id: `hydro_ph_alert_${garden.id}`,
        category: 'urgent_alert',
        priority: 'Critical',
        title: '⚠️ pH Fuori Range',
        body: `Il pH attuale (${lastReading.ph}) è ${lastReading.ph > phTarget ? 'troppo alto' : 'troppo basso'}. Target: ${phTarget}. Correggi immediatamente per evitare blocco nutrienti.`,
        options: [{
          label: 'Correggi pH',
          createTask: {
            gardenId: garden.id,
            plantName: `Correzione pH (attuale: ${lastReading.ph}, target: ${phTarget})`,
            taskType: 'HydroPhAdjust',
            date: format(currentDate, 'yyyy-MM-dd'),
            completed: false,
            isSuggested: true,
            suggestedBy: 'hydroponic_director'
          }
        }]
      });
    }
  }
  
  // 2. Controllo EC fuori range
  if (lastReading?.ec) {
    const ecTarget = config.nutrientSolution.ecTarget;
    const ecDiff = Math.abs(lastReading.ec - ecTarget);
    
    if (ecDiff > 0.3) {
      prompts.push({
        id: `hydro_ec_alert_${garden.id}`,
        category: 'urgent_alert',
        priority: 'High',
        title: '⚠️ EC Fuori Range',
        body: `L'EC attuale (${lastReading.ec} mS/cm) è ${lastReading.ec > ecTarget ? 'troppo alta' : 'troppo bassa'}. Target: ${ecTarget}. ${lastReading.ec > ecTarget ? 'Diluisci con acqua' : 'Aggiungi nutrienti'}.`,
        options: [{
          label: 'Correggi EC',
          createTask: {
            gardenId: garden.id,
            plantName: `Correzione EC (attuale: ${lastReading.ec}, target: ${ecTarget})`,
            taskType: 'HydroEcAdjust',
            date: format(currentDate, 'yyyy-MM-dd'),
            completed: false,
            isSuggested: true,
            suggestedBy: 'hydroponic_director'
          }
        }]
      });
    }
  }
  
  // 3. Promemoria controllo periodico pH/EC
  const daysSinceLastCheck = lastReading 
    ? differenceInDays(currentDate, new Date(lastReading.readingDate))
    : 999;
  
  const checkFrequency = config.maintenance.phCheckFrequencyDays;
  
  if (daysSinceLastCheck >= checkFrequency) {
    const hasOpenCheckTask = tasks.some(t => 
      t.taskType === 'HydroNutrientCheck' && !t.completed
    );
    
    if (!hasOpenCheckTask) {
      prompts.push({
        id: `hydro_check_reminder_${garden.id}`,
        category: 'routine',
        priority: 'Medium',
        title: '📊 Controllo Nutrienti Programmato',
        body: `È passato ${daysSinceLastCheck} giorni dall'ultimo controllo. Frequenza consigliata: ogni ${checkFrequency} giorni. Controlla pH, EC e temperatura della soluzione.`,
        options: [{
          label: 'Registra Controllo',
          createTask: {
            gardenId: garden.id,
            plantName: 'Controllo pH/EC/Temperatura',
            taskType: 'HydroNutrientCheck',
            date: format(currentDate, 'yyyy-MM-dd'),
            completed: false,
            isSuggested: true,
            suggestedBy: 'hydroponic_director'
          }
        }]
      });
    }
  }
  
  // 4. Promemoria cambio soluzione
  const lastChange = config.maintenance.lastReservoirChange 
    ? new Date(config.maintenance.lastReservoirChange)
    : null;
  
  const daysSinceChange = lastChange 
    ? differenceInDays(currentDate, lastChange)
    : 999;
  
  const changeFrequency = config.maintenance.changeFrequencyDays;
  
  if (daysSinceChange >= changeFrequency) {
    const hasOpenChangeTask = tasks.some(t => 
      t.taskType === 'HydroSolutionChange' && !t.completed
    );
    
    if (!hasOpenChangeTask) {
      prompts.push({
        id: `hydro_change_reminder_${garden.id}`,
        category: 'routine',
        priority: 'High',
        title: '🔄 Cambio Soluzione Programmato',
        body: `È passato ${daysSinceChange} giorni dall'ultimo cambio soluzione. Frequenza consigliata: ogni ${changeFrequency} giorni. Cambia completamente la soluzione e pulisci il serbatoio.`,
        options: [{
          label: 'Programma Cambio',
          createTask: {
            gardenId: garden.id,
            plantName: 'Cambio Soluzione Nutritiva',
            taskType: 'HydroSolutionChange',
            date: format(currentDate, 'yyyy-MM-dd'),
            completed: false,
            isSuggested: true,
            suggestedBy: 'hydroponic_director',
            notes: `Capacità serbatoio: ${config.nutrientSolution.reservoirCapacity}L. Marca nutrienti: ${config.nutrientSolution.nutrientBrand || 'n/d'}.`
          }
        }]
      });
    }
  }
  
  // 5. Suggerimenti specifici per tipo sistema
  switch (config.systemType) {
    case 'NFT':
      // Controllo flusso canali
      if (config.nftConfig) {
        prompts.push({
          id: `nft_flow_check_${garden.id}`,
          category: 'routine',
          priority: 'Low',
          title: '🌊 Controllo Flusso NFT',
          body: `Verifica che il flusso nei canali sia costante (${config.nftConfig.flowRate} L/min). Controlla che non ci siano ostruzioni o accumuli di alghe.`,
          options: [{
            label: 'Registra Controllo',
            createTask: {
              gardenId: garden.id,
              plantName: 'Controllo Flusso Canali NFT',
              taskType: 'HydroEquipmentCheck',
              date: format(addDays(currentDate, 7), 'yyyy-MM-dd'),
              completed: false,
              isSuggested: true,
              suggestedBy: 'hydroponic_director'
            }
          }]
        });
      }
      break;
      
    case 'DWC':
      // Controllo ossigenazione
      if (config.dwcConfig) {
        prompts.push({
          id: `dwc_oxygen_check_${garden.id}`,
          category: 'routine',
          priority: 'Medium',
          title: '💨 Controllo Ossigenazione DWC',
          body: `Verifica che la pompa aria funzioni correttamente e che le pietre porose producano bolle fini. L'ossigenazione è critica per DWC.`,
          options: [{
            label: 'Registra Controllo',
            createTask: {
              gardenId: garden.id,
              plantName: 'Controllo Pompa Aria e Pietre Porose',
              taskType: 'HydroEquipmentCheck',
              date: format(addDays(currentDate, 3), 'yyyy-MM-dd'),
              completed: false,
              isSuggested: true,
              suggestedBy: 'hydroponic_director'
            }
          }]
        });
      }
      break;
      
    case 'EbbFlow':
      // Controllo cicli allagamento
      if (config.ebbFlowConfig) {
        prompts.push({
          id: `ebbflow_cycle_check_${garden.id}`,
          category: 'routine',
          priority: 'Medium',
          title: '⏱️ Controllo Cicli Ebb&Flow',
          body: `Verifica che i cicli di allagamento/scolo funzionino correttamente (${config.ebbFlowConfig.floodFrequency} volte/giorno, ${config.ebbFlowConfig.floodDuration} min). Controlla timer e valvole.`,
          options: [{
            label: 'Registra Controllo',
            createTask: {
              gardenId: garden.id,
              plantName: 'Controllo Timer e Cicli Allagamento',
              taskType: 'HydroEquipmentCheck',
              date: format(addDays(currentDate, 7), 'yyyy-MM-dd'),
              completed: false,
              isSuggested: true,
              suggestedBy: 'hydroponic_director'
            }
          }]
        });
      }
      break;
  }
  
  return prompts;
}
```

#### 1.4 Integrare nel Director Principale
```typescript
// logic/director.ts

import { generateHydroponicSuggestions } from './hydroponicDirector';
import { generateAquaponicSuggestions } from './aquaponicDirector';
import { generateAeroponicSuggestions } from './aeroponicDirector';

// Nel generateDailyPlan()
export async function generateDailyPlan(...) {
  // ... codice esistente
  
  // NUOVO: Suggerimenti per sistemi specializzati
  if (garden.gardenType === 'Hydroponic' && garden.hydroponicConfig) {
    const hydroponicReadings = await storageProvider.getHydroponicReadings?.(garden.id) || [];
    const hydroPrompts = generateHydroponicSuggestions(
      garden, 
      tasks, 
      hydroponicReadings,
      currentDate
    );
    allPrompts.push(...hydroPrompts);
  }
  
  if (garden.gardenType === 'Aquaponic' && garden.aquaponicConfig) {
    const aquaponicReadings = await storageProvider.getAquaponicReadings?.(garden.id) || [];
    const aquaPrompts = generateAquaponicSuggestions(
      garden,
      tasks,
      aquaponicReadings,
      currentDate
    );
    allPrompts.push(...aquaPrompts);
  }
  
  if (garden.gardenType === 'Aeroponic' && garden.aeroponicConfig) {
    const aeroPrompts = generateAeroponicSuggestions(
      garden,
      tasks,
      currentDate
    );
    allPrompts.push(...aeroPrompts);
  }
  
  // IMPORTANTE: Filtrare suggerimenti non applicabili
  // Non suggerire irrigazione/fertilizzazione tradizionale per idroponica
  if (['Hydroponic', 'Aquaponic', 'Aeroponic'].includes(garden.gardenType || '')) {
    allPrompts = allPrompts.filter(p => {
      // Rimuovi suggerimenti di irrigazione tradizionale
      if (p.options?.some(o => o.createTask?.taskType === 'Irrigation')) return false;
      // Rimuovi suggerimenti di fertilizzazione tradizionale
      if (p.options?.some(o => o.createTask?.taskType === 'Fertilize')) return false;
      return true;
    });
  }
  
  // ... resto codice
}
```

---

## 📋 TASK IMPLEMENTAZIONE

### Task 1.5: Operazioni Idroponiche (NUOVO - da aggiungere a Fase 1)
**Effort**: 3 giorni  
**Priority**: CRITICAL (blocca utilizzo reale sistemi idroponici)

- [ ] 1.5.1 Estendere TaskType con tipi idroponici
  - [ ] Aggiungere HydroponicTaskType, AquaponicTaskType, AeroponicTaskType
  - [ ] Aggiornare taskTranslations.ts
  - [ ] Aggiornare UI per mostrare nuovi tipi

- [ ] 1.5.2 Creare hydroponicDirector.ts
  - [ ] Implementare generateHydroponicSuggestions()
  - [ ] Logica controllo pH/EC fuori range
  - [ ] Promemoria controlli periodici
  - [ ] Promemoria cambio soluzione
  - [ ] Suggerimenti specifici per tipo sistema (NFT/DWC/EbbFlow)

- [ ] 1.5.3 Creare aquaponicDirector.ts
  - [ ] Implementare generateAquaponicSuggestions()
  - [ ] Logica controllo ammoniaca/nitriti/nitrati
  - [ ] Promemoria alimentazione pesci
  - [ ] Promemoria pulizia filtri

- [ ] 1.5.4 Creare aeroponicDirector.ts
  - [ ] Implementare generateAeroponicSuggestions()
  - [ ] Logica controllo ugelli
  - [ ] Promemoria pulizia sistema
  - [ ] Controllo pressione (per high pressure)

- [ ] 1.5.5 Integrare nel Director principale
  - [ ] Chiamare director specializzati in base a gardenType
  - [ ] Filtrare suggerimenti non applicabili (no irrigazione/fertilizzazione tradizionale)
  - [ ] Testare con orti idroponici

- [ ] 1.5.6 Aggiornare UI Task
  - [ ] Mostrare icone specifiche per task idroponici
  - [ ] Form registrazione letture pH/EC inline nel task
  - [ ] Collegare task a hydroponic_readings table

---

## 🎯 PRIORITÀ

**CRITICAL**: Questo task deve essere completato prima di considerare la Fase 1 completa. Senza operazioni specifiche, gli orti idroponici sono inutilizzabili nella pratica.

**Ordine Implementazione Fase 1 Rivisto:**
1. ✅ Task 1.1: Wizard Idroponica (COMPLETATO)
2. ⏳ Task 1.5: Operazioni Idroponiche (NUOVO - DA FARE SUBITO)
3. ⏳ Task 1.2: Menu Fragole
4. ⏳ Task 1.3: Dashboard Letture

---

## 📊 IMPATTO

### Senza Questa Implementazione
- ❌ Utenti possono creare orti idroponici ma non gestirli
- ❌ Director suggerisce irrigazione/fertilizzazione (non applicabili)
- ❌ Nessun promemoria per operazioni critiche (pH/EC, cambio soluzione)
- ❌ Nessun alert per parametri fuori range
- ❌ Sistema inutilizzabile per uso reale

### Con Questa Implementazione
- ✅ Gestione completa ciclo vita sistemi idroponici
- ✅ Suggerimenti mirati e specifici
- ✅ Alert automatici per parametri critici
- ✅ Promemoria operazioni manutenzione
- ✅ Sistema pronto per uso professionale

---

## 🔗 RIFERIMENTI

- `types/indoorGrowing.ts` - Tipi esistenti per configurazioni
- `logic/director.ts` - Director principale da estendere
- `database_schema_only_20251218_083258.sql` - Schema database (già pronto)
- `components/hydroponic/ReadingForm.tsx` - Form esistente per letture

---

**Conclusione**: L'implementazione del wizard (Task 1.1) è solo il primo passo. Per rendere i sistemi idroponici realmente utilizzabili, dobbiamo implementare immediatamente le operazioni specifiche (Task 1.5).

