/**
 * Germination Tracker Service
 * Rileva quando un task entra in fase Germination e gestisce notifiche
 */

import { GardenTask } from '../types';
import { PlantMasterSheet } from '../types';
import { calculateDaysActive } from './taskCalculationService';

export interface GerminationCheck {
  taskId: string;
  plantName: string;
  currentPhase: 'Sowing' | 'Germination' | 'Nursing' | 'Hardening' | 'Transplanting' | 'Production';
  expectedGerminationDate: Date;
  daysUntilGermination: number;
  daysSinceSowing: number;
  inGerminationWindow: boolean;
  germinationWindowStart: Date;
  germinationWindowEnd: Date;
  shouldNotify: boolean;
}

/**
 * Verifica lo stato di germinazione di un task
 */
export function checkGerminationStatus(
  task: GardenTask,
  masterData: PlantMasterSheet,
  currentDate: Date = new Date()
): GerminationCheck {
  const sowingDate = new Date(task.date);
  const daysSinceSowing = calculateDaysActive(task);
  
  // Calcola finestra di germinazione attesa
  const avgGerminationDays = (masterData.germination.emergenceDays.min + masterData.germination.emergenceDays.max) / 2;
  const germinationWindowStart = new Date(sowingDate);
  germinationWindowStart.setDate(germinationWindowStart.getDate() + masterData.germination.emergenceDays.min);
  
  const germinationWindowEnd = new Date(sowingDate);
  germinationWindowEnd.setDate(germinationWindowEnd.getDate() + masterData.germination.emergenceDays.max + 3); // +3 giorni tolleranza
  
  const expectedGerminationDate = new Date(sowingDate);
  expectedGerminationDate.setDate(expectedGerminationDate.getDate() + avgGerminationDays);
  
  const daysUntilGermination = Math.max(0, Math.ceil((germinationWindowStart.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)));
  
  // Determina fase corrente
  let currentPhase: GerminationCheck['currentPhase'] = 'Sowing';
  if (daysSinceSowing === 0) {
    currentPhase = 'Sowing';
  } else if (daysSinceSowing >= masterData.germination.emergenceDays.min && 
             daysSinceSowing <= masterData.germination.emergenceDays.max + 3) {
    if (task.userResponses?.germinationConfirmed) {
      currentPhase = 'Nursing';
    } else {
      currentPhase = 'Germination';
    }
  } else if (daysSinceSowing > masterData.germination.emergenceDays.max + 3) {
    currentPhase = 'Nursing';
  }
  
  // Verifica se è nella finestra di germinazione
  const inGerminationWindow = currentDate >= germinationWindowStart && currentDate <= germinationWindowEnd;
  
  // Dovrebbe notificare se:
  // - È entrato nella finestra di germinazione oggi o ieri
  // - Non ha ancora confermato la germinazione
  // - È ancora in fase Sowing o Germination
  const shouldNotify = inGerminationWindow && 
                      !task.userResponses?.germinationConfirmed &&
                      (currentPhase === 'Sowing' || currentPhase === 'Germination') &&
                      daysSinceSowing >= masterData.germination.emergenceDays.min;
  
  return {
    taskId: task.id,
    plantName: task.plantName,
    currentPhase,
    expectedGerminationDate,
    daysUntilGermination,
    daysSinceSowing,
    inGerminationWindow,
    germinationWindowStart,
    germinationWindowEnd,
    shouldNotify
  };
}

/**
 * Trova tutti i task che necessitano notifica germinazione
 */
export async function findTasksNeedingGerminationNotification(
  tasks: GardenTask[],
  masterDataMap: Map<string, PlantMasterSheet>,
  currentDate: Date = new Date()
): Promise<GerminationCheck[]> {
  const checks: GerminationCheck[] = [];
  
  for (const task of tasks) {
    // Solo task di semina non completati
    if (task.taskType !== 'Sowing' || task.completed) {
      continue;
    }
    
    const masterData = masterDataMap.get(task.plantName);
    if (!masterData) {
      continue;
    }
    
    const check = checkGerminationStatus(task, masterData, currentDate);
    if (check.shouldNotify) {
      checks.push(check);
    }
  }
  
  return checks;
}

/**
 * Conferma germinazione per un task
 */
export function confirmGermination(task: GardenTask): GardenTask {
  return {
    ...task,
    userResponses: {
      ...task.userResponses,
      germinationConfirmed: true
    },
    lifecycleState: 'Nursing'
  };
}

