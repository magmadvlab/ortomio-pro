/**
 * Staggered Planting Engine (Scaglionatura)
 * Suggests optimal batch intervals and number of batches for continuous harvest
 */

import { PlantMasterSheet } from '../types';

export interface StaggeredPlantingAdvice {
  recommended: boolean;
  reason: string;
  optimalBatches: number;
  optimalIntervalDays: number;
  expectedHarvestWindow: {
    firstHarvest: Date;
    lastHarvest: Date;
    totalDays: number;
  };
  benefits: string[];
}

/**
 * Plants that benefit most from staggered planting
 */
const STAGGERED_PRIORITY_PLANTS: Record<string, { batches: number; interval: number }> = {
  'LATTUGA': { batches: 4, interval: 14 }, // Lattuga: raccolto continuo
  'RAVANELLO': { batches: 5, interval: 10 }, // Ravanelli: ciclo molto breve
  'SPINACI': { batches: 4, interval: 14 },
  'RUCOLA': { batches: 4, interval: 12 },
  'BASILICO': { batches: 3, interval: 21 }, // Basilico: raccolto foglie continue
  'PREZZEMOLO': { batches: 3, interval: 30 },
  'CAROTA': { batches: 3, interval: 21 }, // Carote: raccolto scalare
  'FAGIOLO': { batches: 3, interval: 14 }, // Fagioli: raccolto continuo
  'PISELLO': { batches: 3, interval: 14 },
  'ZUCCHINA': { batches: 2, interval: 21 }, // Zucchine: produzione continua ma più lunga
  'CETRIOLO': { batches: 2, interval: 21 },
};

/**
 * Calculate optimal staggered planting for a plant
 */
export const calculateStaggeredPlanting = (
  plant: PlantMasterSheet,
  startDate: Date = new Date(),
  harvestWindowDays?: number // Optional: days from planting to first harvest
): StaggeredPlantingAdvice => {
  const plantName = plant.commonName.toUpperCase();
  const priority = STAGGERED_PRIORITY_PLANTS[plantName];

  // If plant has successionIntervalDays in master sheet, use it
  // (This would require adding it to PlantMasterSheet interface)
  
  // Determine if plant benefits from staggered planting
  const isShortCycle = plant.family === 'Asteraceae' || // Lattughe, spinaci
                       plant.family === 'Brassicaceae' || // Ravanelli, rucola
                       plant.nutrientCategory === 'LEAFY'; // Piante da foglia

  const isContinuousHarvest = plant.family === 'Cucurbitaceae' || // Zucchine, cetrioli
                               plant.family === 'Fabaceae' || // Fagioli, piselli
                               plant.family === 'Leguminosae';

  if (!isShortCycle && !isContinuousHarvest && !priority) {
    return {
      recommended: false,
      reason: `${plant.commonName} ha un ciclo lungo e raccolto concentrato. La scaglionatura non è necessaria.`,
      optimalBatches: 1,
      optimalIntervalDays: 0,
      expectedHarvestWindow: {
        firstHarvest: new Date(startDate),
        lastHarvest: new Date(startDate),
        totalDays: 0,
      },
      benefits: [],
    };
  }

  // Calculate optimal batches and interval
  let batches: number;
  let interval: number;

  if (priority) {
    // Use predefined optimal values
    batches = priority.batches;
    interval = priority.interval;
  } else if (isShortCycle) {
    // Short cycle plants: 4 batches, 14 days apart
    batches = 4;
    interval = 14;
  } else if (isContinuousHarvest) {
    // Continuous harvest: 3 batches, 21 days apart
    batches = 3;
    interval = 21;
  } else {
    // Default: 2 batches, 21 days apart
    batches = 2;
    interval = 21;
  }

  // Estimate harvest window
  // For short cycle: 40-60 days from planting
  // For continuous: 60-90 days from planting
  const daysToFirstHarvest = isShortCycle ? 45 : 70;
  const harvestDuration = isShortCycle ? 20 : 60; // Days of continuous harvest

  const firstHarvest = new Date(startDate);
  firstHarvest.setDate(firstHarvest.getDate() + daysToFirstHarvest);

  const lastPlantingDate = new Date(startDate);
  lastPlantingDate.setDate(lastPlantingDate.getDate() + ((batches - 1) * interval));

  const lastHarvest = new Date(lastPlantingDate);
  lastHarvest.setDate(lastHarvest.getDate() + daysToFirstHarvest + harvestDuration);

  const totalDays = Math.ceil((lastHarvest.getTime() - firstHarvest.getTime()) / (1000 * 60 * 60 * 24));

  // Generate benefits
  const benefits: string[] = [];
  if (isShortCycle) {
    benefits.push('Raccolto continuo per tutta la stagione');
    benefits.push('Evita sovraproduzione concentrata');
    benefits.push('Mantiene qualità ottimale (piante giovani)');
  } else if (isContinuousHarvest) {
    benefits.push('Estende periodo di raccolta');
    benefits.push('Riduce stress da raccolta eccessiva');
    benefits.push('Migliora gestione spazio');
  }

  return {
    recommended: true,
    reason: `${plant.commonName} beneficia della scaglionatura: ${isShortCycle ? 'ciclo breve' : 'raccolto continuo'}.`,
    optimalBatches: batches,
    optimalIntervalDays: interval,
    expectedHarvestWindow: {
      firstHarvest,
      lastHarvest,
      totalDays,
    },
    benefits,
  };
};

/**
 * Get suggested batches for a plant based on its characteristics
 */
export const getSuggestedBatches = (plant: PlantMasterSheet): { batches: number; interval: number } => {
  const plantName = plant.commonName.toUpperCase();
  const priority = STAGGERED_PRIORITY_PLANTS[plantName];

  if (priority) {
    return priority;
  }

  const isShortCycle = plant.family === 'Asteraceae' || plant.family === 'Brassicaceae';
  const isContinuousHarvest = plant.family === 'Cucurbitaceae' || plant.family === 'Fabaceae';

  if (isShortCycle) {
    return { batches: 4, interval: 14 };
  }
  if (isContinuousHarvest) {
    return { batches: 3, interval: 21 };
  }

  return { batches: 1, interval: 0 }; // No staggering recommended
};

/**
 * Calculate next batch date
 */
export const getNextBatchDate = (
  firstBatchDate: Date,
  batchNumber: number,
  intervalDays: number
): Date => {
  const nextDate = new Date(firstBatchDate);
  nextDate.setDate(nextDate.getDate() + (batchNumber * intervalDays));
  return nextDate;
};

/**
 * Generate all batch dates for staggered planting
 */
export const generateBatchDates = (
  startDate: Date,
  numBatches: number,
  intervalDays: number
): Date[] => {
  const dates: Date[] = [];
  for (let i = 0; i < numBatches; i++) {
    const batchDate = new Date(startDate);
    batchDate.setDate(batchDate.getDate() + (i * intervalDays));
    dates.push(batchDate);
  }
  return dates;
};

