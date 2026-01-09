/**
 * Exotic Fruit Engine
 * Calculates tasks and advice for exotic/tropical fruits
 */

import { ExoticFruitCrop } from '../types/exoticFruit';
import { Garden } from '../types';

export interface ExoticFruitTaskAdvice {
  taskType: 'ClimateCheck' | 'GreenhouseManagement' | 'Pruning' | 'Harvest';
  priority: 'High' | 'Medium' | 'Low';
  message: string;
  dueDate: string; // ISO date string
  instructions: string[];
  climateWarning?: boolean;  // If requires climate attention
}

/**
 * Calculate tasks for exotic fruit management
 */
export const calculateExoticFruitTasks = (
  crop: ExoticFruitCrop,
  garden: Garden,
  currentDate: Date = new Date()
): ExoticFruitTaskAdvice[] => {
  const tasks: ExoticFruitTaskAdvice[] = [];
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // 1. CLIMATE CHECK (High priority if temperature requirements not met)
  if (crop.climateRequirements.minTemp > 10) {
    tasks.push({
      taskType: 'ClimateCheck',
      priority: 'High',
      message: `Verifica temperatura ambiente (min richiesta: ${crop.climateRequirements.minTemp}°C)`,
      dueDate: currentDate.toISOString().split('T')[0],
      instructions: [
        'Monitora temperatura giornaliera',
        `Se temperatura scende sotto ${crop.climateRequirements.minTemp}°C, attiva riscaldamento serra`,
        'Proteggi pianta con teli o spostala in ambiente riscaldato',
        `Temperatura ideale: ${crop.climateRequirements.idealTemp}`
      ],
      climateWarning: true
    });
  }

  // 2. GREENHOUSE MANAGEMENT (if required)
  if (crop.greenhouseRequired) {
    tasks.push({
      taskType: 'GreenhouseManagement',
      priority: 'High',
      message: `Gestione serra per ${crop.commonName}`,
      dueDate: currentDate.toISOString().split('T')[0],
      instructions: [
        `Mantieni temperatura tra ${crop.climateRequirements.idealTemp}`,
        `Gestisci umidità: ${crop.climateRequirements.humidity}`,
        'Ventilazione: apri serra nelle ore calde',
        `Riscaldamento: attiva se temperatura scende sotto ${crop.climateRequirements.minTemp}°C`,
        `Tipo serra richiesta: ${crop.greenhouseType || 'Warm'}`
      ]
    });
  }

  // 3. HARVEST (during harvest window)
  const isInHarvestWindow = 
    (currentMonth >= crop.harvestWindow.startMonth && currentMonth <= crop.harvestWindow.endMonth) ||
    (crop.harvestWindow.startMonth > crop.harvestWindow.endMonth && 
     (currentMonth >= crop.harvestWindow.startMonth || currentMonth <= crop.harvestWindow.endMonth));

  if (isInHarvestWindow) {
    tasks.push({
      taskType: 'Harvest',
      priority: 'Medium',
      message: `Raccolta ${crop.commonName}`,
      dueDate: new Date(currentYear, crop.harvestWindow.startMonth - 1, 15).toISOString().split('T')[0],
      instructions: [
        'Raccogli quando i frutti sono maturi',
        'Verifica segni di maturazione specifici per la varietà',
        'Gestisci con cura per mantenere qualità',
        crop.italianClimateNotes ? `Nota clima italiano: ${crop.italianClimateNotes}` : ''
      ]
    });
  }

  // 4. PRUNING (if tree type and applicable)
  if (crop.treeType === 'Tree' && crop.maturityYears && crop.maturityYears > 0) {
    // Pruning typically in late winter/early spring for tropical fruits
    if (currentMonth === 2 || currentMonth === 3) {
      tasks.push({
        taskType: 'Pruning',
        priority: 'Low',
        message: `Potatura ${crop.commonName}`,
        dueDate: new Date(currentYear, 1, 15).toISOString().split('T')[0],
        instructions: [
          'Rimuovi rami secchi o danneggiati',
          'Mantieni forma compatta per coltivazione in serra/vaso',
          'Disinfetta attrezzi prima e dopo la potatura'
        ]
      });
    }
  }

  return tasks;
};

/**
 * Check if climate requirements are met
 */
export const checkClimateRequirements = (
  crop: ExoticFruitCrop,
  currentTemp: number
): { status: 'Optimal' | 'Warning' | 'Critical'; message: string } => {
  const { minTemp, maxTemp, idealTemp } = crop.climateRequirements;

  if (currentTemp < minTemp) {
    return {
      status: 'Critical',
      message: `Temperatura critica: ${currentTemp}°C (min richiesta: ${minTemp}°C). Proteggi immediatamente!`
    };
  }

  if (currentTemp > maxTemp) {
    return {
      status: 'Warning',
      message: `Temperatura elevata: ${currentTemp}°C (max: ${maxTemp}°C). Aumenta ventilazione.`
    };
  }

  return {
    status: 'Optimal',
    message: `Temperatura ottimale: ${currentTemp}°C (range ideale: ${idealTemp})`
  };
};

/**
 * Get greenhouse management tasks
 */
export const getGreenhouseManagementTasks = (
  crop: ExoticFruitCrop
): string[] => {
  if (!crop.greenhouseRequired) {
    return ['Serra non richiesta per questa varietà'];
  }

  const tasks: string[] = [
    `Tipo serra: ${crop.greenhouseType || 'Warm'}`,
    `Temperatura ideale: ${crop.climateRequirements.idealTemp}`,
    `Umidità: ${crop.climateRequirements.humidity}`,
    'Ventilazione: apri durante le ore calde',
    `Riscaldamento: attiva se temperatura < ${crop.climateRequirements.minTemp}°C`
  ];

  return tasks;
};























