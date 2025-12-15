'use client';

import { GardenTask, PlantMasterSheet, Garden } from '../types';
import { calculateDaysActive } from '../services/taskCalculationService';
import { calculateNutrientNeeds, NutrientAdvice } from './nutrientEngine';
import { calculateHealthStrategy, HealthAdvice } from './healthEngine';
import { checkTransplantConditions } from '../services/weatherService';
import { calculateMoonPhase, isIdealPhaseFor, getMoonPhaseName } from './lunarCalendar';
import { isPlantNearHarvestEnd, checkEmptySpaceOpportunity } from './successionEngine';
import { getAllMasterSheets } from '../services/plantMasterService';
import { calculateAltitudeDelay, calculateAltitudePlantingDelay, adjustPlantingDates } from '../utils/altitudeUtils';
import { scheduleNextTreatment } from './healthEngine';
import { getSoilCompatibility } from '../utils/soilTemperatureUtils';
import { determineWasteDisposal, suggestHumusAddition } from './compostEngine';

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

  // Correzione per altitudine (migliorata)
  if (garden.altitudeMeters && garden.altitudeMeters > 200) {
    // Determina tipo pianta per ritardo differenziato
    const plantNameUpper = masterData.commonName.toUpperCase();
    let plantType: 'early' | 'standard' | 'late' = 'standard';
    if (['LATTUGA', 'INSALATA', 'RUCOLA', 'SPINACIO', 'RAVANELLO'].some(name => plantNameUpper.includes(name))) {
      plantType = 'early';
    } else if (['POMODORO', 'PEPERONE', 'MELANZANA', 'ZUCCHINA', 'CETRIOLO'].some(name => plantNameUpper.includes(name))) {
      plantType = 'late';
    }
    
    const delayDays = calculateAltitudePlantingDelay(garden.altitudeMeters, plantType);
    const adjustedDate = adjustPlantingDates(new Date(), garden.altitudeMeters, plantType);
    
    if (delayDays > 0) {
      warning = `⚠️ Altitudine ${garden.altitudeMeters}m: Ritardo consigliato di ${delayDays} giorni per il trapianto rispetto alla costa. Data ottimale: ${adjustedDate.toLocaleDateString('it-IT')}`;
      subTasks.unshift(`🏔️ Correzione altitudine: Aspetta ${delayDays} giorni in più rispetto alla data standard`);
    }
  }

  // Validazione compatibilità terreno
  const soilCompatibility = getSoilCompatibility(masterData.commonName, garden.soilType);
  if (!soilCompatibility.compatible) {
    warning = `${warning || ''} ⚠️ COMPATIBILITÀ TERRENO: ${soilCompatibility.reason || 'Terreno non ottimale per questa pianta'}`.trim();
    if (soilCompatibility.optimalSoilTypes) {
      subTasks.push(`💡 Terreni ottimali: ${soilCompatibility.optimalSoilTypes.join(', ')}. Considera miglioramenti o varietà resistenti.`);
    }
  } else if (soilCompatibility.optimalSoilTypes && garden.soilType && soilCompatibility.optimalSoilTypes.includes(garden.soilType)) {
    subTasks.push(`✅ Terreno ${garden.soilType} ideale per ${masterData.commonName}`);
  }

  // Controllo temperatura suolo (se disponibile)
  if (masterData.transplanting?.minTemp && garden.coordinates) {
    try {
      // Nota: Questo richiede chiamata API meteo, quindi lo lasciamo opzionale
      // Il Director già gestisce questo controllo con dati meteo reali
      subTasks.push(`🌡️ Verifica temperatura suolo: minimo ${masterData.transplanting.minTemp}°C richiesto`);
    } catch (error) {
      // Ignora errori
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
  
  // Suggerimento humus se disponibile
  const humusSuggestion = suggestHumusAddition(garden, 6); // Assume compost maturo (6+ mesi)
  if (humusSuggestion?.shouldAdd) {
    subTasks.push(`🌱 ${humusSuggestion.suggestion} - ${humusSuggestion.benefit}`);
  }
  
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
 * Calcola la data di fine ciclo per una pianta
 * Fine Ciclo = Data Trapianto + harvestWindow.max + 30 giorni buffer
 */
export const calculateEndOfCycle = (
  task: GardenTask,
  masterData: PlantMasterSheet
): Date => {
  // Trova la data di trapianto (se taskType è Transplant, usa quella, altrimenti stima)
  let transplantDate: Date;
  
  if (task.taskType === 'Transplant') {
    transplantDate = new Date(task.date);
  } else {
    // Stima: 60 giorni dopo semina (media per trapianto)
    transplantDate = new Date(task.date);
    transplantDate.setDate(transplantDate.getDate() + 60);
  }

  // Fine Ciclo = Data Trapianto + harvestWindow.max + 30 giorni buffer
  const endOfCycle = new Date(transplantDate);
  
  // Estrai giorni massimi da harvestWindow (es. "60-90 giorni" -> 90)
  // harvestWindow può essere una stringa o un oggetto con startMonth/endMonth
  const harvestWindow = masterData.harvestWindow || '60-90 giorni';
  let maxHarvestDays = 90; // Default
  
  if (typeof harvestWindow === 'string') {
    // Formato stringa: "60-90 giorni"
    const harvestDaysMatch = harvestWindow.match(/(\d+)\s*-\s*(\d+)/);
    maxHarvestDays = harvestDaysMatch ? parseInt(harvestDaysMatch[2], 10) : 90;
  } else if (typeof harvestWindow === 'object' && harvestWindow !== null) {
    // Formato oggetto: { startMonth: number; endMonth: number; }
    // Per colture specializzate, stima giorni basandosi sulla differenza di mesi
    const monthDiff = harvestWindow.endMonth >= harvestWindow.startMonth 
      ? harvestWindow.endMonth - harvestWindow.startMonth
      : (12 - harvestWindow.startMonth) + harvestWindow.endMonth;
    maxHarvestDays = monthDiff * 30; // Approssimazione: ~30 giorni per mese
  }
  
  endOfCycle.setDate(endOfCycle.getDate() + maxHarvestDays + 30);
  
  return endOfCycle;
};

/**
 * Genera suggerimenti per la fase di Produzione
 */
const generateProductionAdvice = (
  daysAlive: number,
  task: GardenTask,
  masterData: PlantMasterSheet,
  nutrients: NutrientAdvice,
  health: HealthAdvice | null,
  currentDate: Date,
  garden: Garden
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

  // Check fine ciclo
  const endOfCycle = calculateEndOfCycle(task, masterData);
  const daysUntilEnd = Math.floor((endOfCycle.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilEnd <= 7 && daysUntilEnd >= 0) {
    // Fine ciclo imminente
    const wasteAdvice = determineWasteDisposal(masterData, 'Unknown', false, false);
    
    subTasks.push(`⚠️ Fine ciclo tra ${daysUntilEnd} giorni: Prepara la rimozione`);
    subTasks.push(`Smaltimento: ${wasteAdvice.reason}`);
    wasteAdvice.instructions.forEach(instruction => {
      subTasks.push(`  → ${instruction}`);
    });

    if (garden.hasCompostBin && wasteAdvice.canCompost) {
      subTasks.push(`✅ Puoi compostare: ${wasteAdvice.instructions.join(', ')}`);
    }
  }

  return {
    phase: 'Production',
    type: daysUntilEnd <= 7 ? 'TASK' : 'INFO',
    message: `Le tue piante di ${task.plantName} sono in produzione! ${daysUntilEnd <= 7 ? `Fine ciclo tra ${daysUntilEnd} giorni.` : 'Continua a monitorare e curare:'}`,
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
      return generateProductionAdvice(daysAlive, task, masterData, nutrients, health, currentDate, garden);

    default:
      return null;
  }
};

/**
 * Genera automaticamente il prossimo task di trattamento quando uno è completato
 * Chiamato quando un task con taskType 'Treatment' viene marcato come completed
 */
export const generateNextTreatmentTask = (
  completedTask: GardenTask,
  allTasks: GardenTask[]
): GardenTask | null => {
  // Verifica che sia un task di trattamento completato
  if (completedTask.taskType !== 'Treatment' || !completedTask.completed) {
    return null;
  }

  // Verifica che abbia un productId
  if (!completedTask.treatmentProductId) {
    return null;
  }

  // Verifica che non esista già un task futuro per lo stesso prodotto e pianta
  const existingFutureTask = allTasks.find(t => 
    t.gardenId === completedTask.gardenId &&
    t.plantName === completedTask.plantName &&
    t.taskType === 'Treatment' &&
    t.treatmentProductId === completedTask.treatmentProductId &&
    !t.completed &&
    new Date(t.date) > new Date(completedTask.date)
  );

  if (existingFutureTask) {
    return null; // Già esiste un task futuro
  }

  // Genera prossimo task
  return scheduleNextTreatment(
    completedTask.id,
    completedTask.treatmentProductId,
    completedTask.date,
    completedTask.gardenId,
    completedTask.plantName,
    completedTask.variety
  );
};

