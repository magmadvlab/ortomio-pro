import { GardenTask, PlantMasterSheet, Garden } from '../types';
import { calculateDaysActive } from '../services/taskCalculationService';
import { calculateNutrientNeeds, NutrientAdvice } from './nutrientEngine';
import { calculateHealthStrategy, HealthAdvice } from './healthEngine';
import { checkTransplantConditions } from '../services/weatherService';
import { calculateMoonPhase, isIdealPhaseFor, getMoonPhaseName } from './lunarCalendar';
import { isPlantNearHarvestEnd, checkEmptySpaceOpportunity } from './successionEngine';
import { getAllMasterSheets } from '../services/plantMasterService';

export type LifecyclePhase = 'Sowing' | 'Germination' | 'Nursing' | 'Hardening' | 'Transplanting' | 'Production';

export type LifecycleAdviceType = 'CHECK' | 'TASK' | 'WARNING' | 'INFO';

export interface LifecycleAdvice {
  phase: LifecyclePhase;
  type: LifecycleAdviceType;
  message: string;
  actionYes?: string; // Cosa fare se l'utente risponde "Sì"
  actionNo?: string; // Cosa fare se l'utente risponde "No"
  subTasks?: string[]; // Lista di sotto-task da completare
  postponeDays?: number; // Quanti giorni rimandare se necessario
  relatedAdvice?: {
    nutrients?: NutrientAdvice;
    health?: HealthAdvice;
  };
}

/**
 * Determina la fase corrente del ciclo vitale basandosi sui giorni trascorsi
 */
const determineLifecyclePhase = (
  daysAlive: number,
  masterData: PlantMasterSheet,
  task: GardenTask
): LifecyclePhase => {
  // Se l'utente ha già risposto alle domande, usa lo stato salvato
  if (task.lifecycleState) {
    return task.lifecycleState;
  }

  // Fase 0: Semina (giorno 0)
  if (daysAlive === 0) {
    return 'Sowing';
  }

  // Fase 1: Germinazione (entro il range di emergenceDays)
  if (daysAlive >= masterData.germination.emergenceDays.min && 
      daysAlive <= masterData.germination.emergenceDays.max + 3) { // +3 giorni di tolleranza
    // Se l'utente ha già confermato la germinazione, passa a Nursing
    if (task.userResponses?.germinationConfirmed) {
      return 'Nursing';
    }
    return 'Germination';
  }

  // Fase 2: Nursing (dopo germinazione fino a ~30 giorni)
  if (daysAlive > masterData.germination.emergenceDays.max + 3 && daysAlive < 50) {
    return 'Nursing';
  }

  // Fase 3: Hardening (50-60 giorni, preparazione al trapianto)
  if (daysAlive >= 50 && daysAlive < 65) {
    return 'Hardening';
  }

  // Fase 4: Trapianto (60+ giorni, o se taskType è già Transplant)
  if (daysAlive >= 60 || task.taskType === 'Transplant') {
    // Se l'utente ha già trapiantato, passa a Production
    if (task.userResponses?.transplantReady || task.taskType === 'Transplant') {
      return 'Production';
    }
    return 'Transplanting';
  }

  // Fase 5: Produzione (dopo trapianto o 90+ giorni)
  if (daysAlive >= 90) {
    return 'Production';
  }

  // Default: Nursing
  return 'Nursing';
};

/**
 * Genera suggerimenti per la fase di Semina
 */
const generateSowingAdvice = (task: GardenTask, masterData: PlantMasterSheet): LifecycleAdvice | null => {
  const sowingDate = new Date(task.date);
  const moonInfo = calculateMoonPhase(sowingDate);
  const moonCheck = isIdealPhaseFor('sowing', masterData.nutrientCategory, sowingDate);
  
  const subTasks: string[] = [
    'Assicurati di avere tutti gli strumenti necessari',
    'Mantieni il terreno umido con il nebulizzatore',
    'Controlla la temperatura ideale per la germinazione'
  ];
  
  let message = `Hai appena seminato ${task.plantName}. ${masterData.baseInstructions.introduction}`;
  let adviceType: LifecycleAdviceType = 'INFO';
  
  // Check lunare per semina
  if (!moonCheck.ideal) {
    // Warning specifico per piante che montano a seme facilmente (LEAFY)
    if (masterData.nutrientCategory === 'LEAFY' && moonCheck.daysUntilIdeal) {
      message += ` ⚠️ Attenzione: La luna è ${getMoonPhaseName(sowingDate)}. Per evitare che ${task.plantName} monti a seme, sarebbe meglio aspettare ${moonCheck.daysUntilIdeal} giorni che la luna diventi Calante.`;
      adviceType = 'WARNING';
      subTasks.unshift(`🌙 ${moonCheck.reason}`);
    } else if (moonCheck.daysUntilIdeal) {
      message += ` 🌙 ${moonCheck.reason}`;
      adviceType = 'WARNING';
      subTasks.unshift(`Luna: ${moonCheck.reason}`);
    }
  } else {
    subTasks.unshift(`🌙 Luna ${moonInfo.name}: ${moonCheck.reason}`);
  }
  
  return {
    phase: 'Sowing',
    type: adviceType,
    message,
    subTasks
  };
};

/**
 * Genera suggerimenti per la fase di Germinazione
 */
const generateGerminationAdvice = (
  daysAlive: number,
  task: GardenTask,
  masterData: PlantMasterSheet
): LifecycleAdvice | null => {
  // Se l'utente ha già confermato, non mostrare più
  if (task.userResponses?.germinationConfirmed) {
    return null;
  }

  const isInWindow = daysAlive >= masterData.germination.emergenceDays.min && 
                     daysAlive <= masterData.germination.emergenceDays.max;

  if (isInWindow) {
    return {
      phase: 'Germination',
      type: 'CHECK',
      message: `Dovresti vedere i primi germogli tra ${masterData.germination.emergenceDays.min} e ${masterData.germination.emergenceDays.max} giorni. È spuntato qualcosa?`,
      actionYes: 'Ottimo! Passa alla fase Nursing. Cambia l\'irrigazione: non nebulizzare più, dai acqua da sotto nel sottovaso.',
      actionNo: 'Attendi ancora qualche giorno. Mantieni il terreno umido con il nebulizzatore e controlla la temperatura.'
    };
  }

  // Se siamo oltre il range, chiedi comunque
  if (daysAlive > masterData.germination.emergenceDays.max) {
    return {
      phase: 'Germination',
      type: 'WARNING',
      message: `Sono passati ${daysAlive} giorni dalla semina. Hai visto germogliare qualcosa?`,
      actionYes: 'Ottimo! Passa alla fase Nursing.',
      actionNo: 'Controlla le condizioni: temperatura, umidità, profondità di semina. Potrebbe essere necessario riseminare.'
    };
  }

  return null;
};

/**
 * Genera suggerimenti per la fase di Nursing
 */
const generateNursingAdvice = (
  daysAlive: number,
  task: GardenTask,
  masterData: PlantMasterSheet,
  garden: Garden,
  nutrients: NutrientAdvice,
  health: HealthAdvice | null
): LifecycleAdvice | null => {
  const subTasks: string[] = [];

  // Suggerimento rinvaso intermedio (25-30 giorni)
  if (daysAlive >= 25 && daysAlive <= 35) {
    subTasks.push('Rinvaso intermedio: sposta in un vaso più grande se necessario');
  }

  // Aggiungi suggerimenti nutrizionali
  if (nutrients.shouldFertilize) {
    subTasks.push(`Nutrizione: ${nutrients.adviceTitle} - ${nutrients.adviceBody}`);
  }

  // Aggiungi suggerimenti salute
  if (health) {
    subTasks.push(`Protezione: ${health.productToUse} - ${health.reason}`);
  }

  if (subTasks.length === 0) {
    return null;
  }

  return {
    phase: 'Nursing',
    type: 'TASK',
    message: `Le tue piantine di ${task.plantName} stanno crescendo! Ecco cosa fare ora:`,
    subTasks,
    relatedAdvice: {
      nutrients,
      health: health || undefined
    }
  };
};

/**
 * Genera suggerimenti per la fase di Hardening
 */
const generateHardeningAdvice = (
  task: GardenTask,
  masterData: PlantMasterSheet
): LifecycleAdvice | null => {
  return {
    phase: 'Hardening',
    type: 'TASK',
    message: `È il momento di preparare le piantine di ${task.plantName} al trapianto. Inizia l'acclimatazione:`,
    subTasks: [
      'Metti i vasi fuori di giorno per 2-3 ore (evita il sole diretto)',
      'Aumenta gradualmente il tempo all\'aperto ogni giorno',
      'Riporta dentro la sera per proteggere dal freddo notturno',
      'Dopo 3-5 giorni, le piantine saranno pronte per il trapianto definitivo'
    ]
  };
};

/**
 * Genera suggerimenti per la fase di Trapianto
 */
const generateTransplantingAdvice = async (
  daysAlive: number,
  task: GardenTask,
  masterData: PlantMasterSheet,
  garden: Garden,
  nutrients: NutrientAdvice,
  health: HealthAdvice | null
): Promise<LifecycleAdvice | null> => {
  const subTasks: string[] = [];
  let warning: string | undefined;

  // Verifica condizioni meteo se abbiamo coordinate
  if (garden.coordinates) {
    const weatherCheck = await checkTransplantConditions(
      garden.coordinates.latitude,
      garden.coordinates.longitude,
      masterData.transplanting.minTemp
    );

    if (!weatherCheck.isSuitable) {
      return {
        phase: 'Transplanting',
        type: 'WARNING',
        message: weatherCheck.reason,
        postponeDays: 7,
        subTasks: [
          'Aspetta che le temperature notturne salgano',
          'Continua l\'acclimatazione delle piantine',
          'Prepara il terreno in anticipo'
        ]
      };
    }
  }

  // Check lunare per trapianto
  const transplantDate = new Date();
  const moonCheck = isIdealPhaseFor('transplant', masterData.nutrientCategory, transplantDate);
  const moonInfo = calculateMoonPhase(transplantDate);
  
  if (!moonCheck.ideal && moonCheck.daysUntilIdeal) {
    subTasks.unshift(`🌙 Luna ${moonInfo.name}: ${moonCheck.reason}`);
    // Non bloccare il trapianto, ma avvisare
  } else {
    subTasks.unshift(`🌙 Luna ${moonInfo.name}: ${moonCheck.reason}`);
  }

  // Preparazione terreno
  subTasks.push('Prepara il terreno: zappatura e arieggiatura');
  subTasks.push(`Prepara le buche: ${masterData.transplanting.holeDepth}cm di profondità, ${masterData.transplanting.holeWidth}cm di larghezza`);
  
  // Concimazione di fondo
  if (nutrients.shouldFertilize) {
    subTasks.push(`Concimazione di fondo: ${nutrients.adviceTitle} - ${nutrients.adviceBody}`);
  }

  // Istruzioni specifiche
  if (masterData.transplanting.buryStem) {
    subTasks.push(`Interra il gambo: ${masterData.transplanting.buryStemInstructions}`);
  }

  if (masterData.transplanting.protectionNeeded) {
    subTasks.push(`Protezione: ${masterData.transplanting.protectionInstructions}`);
  }

  // Aggiungi suggerimenti salute
  if (health) {
    subTasks.push(`Protezione preventiva: ${health.productToUse} - ${health.reason}`);
  }

  return {
    phase: 'Transplanting',
    type: 'TASK',
    message: `Le piantine di ${task.plantName} sono pronte per il trapianto definitivo! Ecco la checklist:`,
    subTasks,
    relatedAdvice: {
      nutrients,
      health: health || undefined
    }
  };
};

/**
 * Genera suggerimenti per la fase di Produzione
 */
const generateProductionAdvice = (
  daysAlive: number,
  task: GardenTask,
  masterData: PlantMasterSheet,
  nutrients: NutrientAdvice,
  health: HealthAdvice | null
): LifecycleAdvice | null => {
  const subTasks: string[] = [];

  // Monitoraggio maturazione
  subTasks.push('Monitora la maturazione dei frutti/ortaggi');
  subTasks.push('Raccogli regolarmente per stimolare la produzione continua');

  // Check lunare per raccolto
  const harvestDate = new Date();
  const moonCheck = isIdealPhaseFor('harvest', masterData.nutrientCategory, harvestDate);
  const moonInfo = calculateMoonPhase(harvestDate);
  
  if (moonCheck.ideal) {
    subTasks.unshift(`🌙 Luna ${moonInfo.name}: ${moonCheck.reason} - Momento ideale per raccogliere`);
  } else if (moonCheck.daysUntilIdeal) {
    subTasks.unshift(`🌙 Luna ${moonInfo.name}: ${moonCheck.reason}`);
  }

  // Aggiungi suggerimenti nutrizionali
  if (nutrients.shouldFertilize) {
    subTasks.push(`Nutrizione: ${nutrients.adviceTitle} - ${nutrients.adviceBody}`);
  }

  // Aggiungi suggerimenti salute
  if (health) {
    subTasks.push(`Protezione: ${health.productToUse} - ${health.reason}`);
  }

  return {
    phase: 'Production',
    type: 'INFO',
    message: `Le tue piante di ${task.plantName} sono in produzione! Continua a monitorare e curare:`,
    subTasks,
    relatedAdvice: {
      nutrients,
      health: health || undefined
    }
  };
};

/**
 * Funzione principale: controlla lo stato del ciclo vitale e genera suggerimenti
 */
export const checkLifecycleStatus = async (
  task: GardenTask,
  masterData: PlantMasterSheet,
  garden: Garden,
  currentDate: Date = new Date()
): Promise<LifecycleAdvice | null> => {
  // Calcola giorni trascorsi
  const daysAlive = calculateDaysActive(task);

  // Determina la fase corrente
  const currentPhase = determineLifecyclePhase(daysAlive, masterData, task);

  // Calcola suggerimenti nutrizionali e di salute
  const nutrients = calculateNutrientNeeds(masterData, daysAlive, garden.soilType);
  const health = calculateHealthStrategy(masterData, daysAlive);

  // Genera suggerimenti in base alla fase
  switch (currentPhase) {
    case 'Sowing':
      return generateSowingAdvice(task, masterData);

    case 'Germination':
      return generateGerminationAdvice(daysAlive, task, masterData);

    case 'Nursing':
      return generateNursingAdvice(daysAlive, task, masterData, garden, nutrients, health);

    case 'Hardening':
      return generateHardeningAdvice(task, masterData);

    case 'Transplanting':
      return await generateTransplantingAdvice(daysAlive, task, masterData, garden, nutrients, health);

    case 'Production':
      return generateProductionAdvice(daysAlive, task, masterData, nutrients, health, currentDate);

    default:
      return null;
  }
};

