/**
 * Rotation Engine
 * Checks crop rotation compliance based on bed planting history
 */

import { RotationAdvice, BedHistory } from '../types';
import { PlantMasterSheet } from '../types';

/**
 * Ideal rotation matrix
 * Maps previous family to ideal next family
 */
const IDEAL_ROTATION_MATRIX: Record<string, string[]> = {
  'Solanaceae': ['Leguminosae', 'Fabaceae'], // Pomodori → Fagioli
  'Cucurbitaceae': ['Solanaceae'], // Zucchine → Pomodori
  'Brassicaceae': ['Cucurbitaceae'], // Cavoli → Zucchine
  'Leguminosae': ['Brassicaceae'], // Fagioli → Cavoli
  'Fabaceae': ['Brassicaceae'], // Alternative name
  'Amaryllidaceae': ['Solanaceae'], // Cipolle → Pomodori
  'Apiaceae': ['Solanaceae'], // Carote → Pomodori
  'Asteraceae': ['Solanaceae'], // Lattughe → Pomodori
};

/**
 * Check rotation compliance for a bed
 */
export const checkRotationCompliance = (
  lastPlantingFamily: string | null,
  newPlantFamily: string
): RotationAdvice => {
  // If no history, rotation is OK
  if (!lastPlantingFamily) {
    return {
      allowed: true,
      severity: 'SUCCESS',
      message: 'Aiuola nuova - nessuna rotazione da rispettare',
    };
  }

  // Check if same family (ERROR)
  if (lastPlantingFamily === newPlantFamily) {
    return {
      allowed: false,
      severity: 'ERROR',
      message: `Stessa famiglia botanica dell'anno scorso (${lastPlantingFamily}). Rischio malattie!`,
      suggestion: getSuggestedRotation(lastPlantingFamily),
    };
  }

  // Check if ideal rotation
  const idealNext = IDEAL_ROTATION_MATRIX[lastPlantingFamily];
  if (idealNext && idealNext.includes(newPlantFamily)) {
    return {
      allowed: true,
      severity: 'SUCCESS',
      message: `Rotazione ideale! ${newPlantFamily} rigenererà il terreno dopo ${lastPlantingFamily}.`,
    };
  }

  // Rotation OK but not ideal
  return {
    allowed: true,
    severity: 'WARNING',
    message: `Rotazione OK, ma non ideale. Dopo ${lastPlantingFamily}, sarebbe meglio piantare: ${getSuggestedRotation(lastPlantingFamily)}`,
    suggestion: getSuggestedRotation(lastPlantingFamily),
  };
};

/**
 * Get suggested rotation for a family
 */
const getSuggestedRotation = (family: string): string => {
  const suggestions = IDEAL_ROTATION_MATRIX[family];
  if (suggestions && suggestions.length > 0) {
    return suggestions[0];
  }
  return 'Una famiglia diversa';
};

/**
 * Get last planting for a bed from history
 */
export const getLastPlanting = (
  bedHistory: BedHistory | null
): { plantFamily: string; plantName: string; year: number; season: 'Summer' | 'Winter' } | null => {
  if (!bedHistory || bedHistory.plantingHistory.length === 0) {
    return null;
  }

  // Get most recent planting
  const last = bedHistory.plantingHistory[0];
  return {
    plantFamily: last.plantFamily,
    plantName: last.plantName,
    year: last.year,
    season: last.season,
  };
};

/**
 * Check rotation compliance with full context
 */
export const checkRotationComplianceFull = (
  bedHistory: BedHistory | null,
  newPlant: PlantMasterSheet
): RotationAdvice => {
  const lastPlanting = getLastPlanting(bedHistory);
  
  if (!lastPlanting) {
    return {
      allowed: true,
      severity: 'SUCCESS',
      message: 'Aiuola nuova - nessuna rotazione da rispettare',
    };
  }

  const advice = checkRotationCompliance(lastPlanting.plantFamily, newPlant.family);
  
  return {
    ...advice,
    lastPlanting: {
      plantName: lastPlanting.plantName,
      plantFamily: lastPlanting.plantFamily,
      year: lastPlanting.year,
      season: lastPlanting.season,
    },
  };
};

