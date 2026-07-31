/**
 * Annual Planner Engine
 * Genera e gestisce piani annuali completi con rotazioni, proiezioni e successioni
 */

import { Garden } from '../types';
import { Season, getSeasonForDate } from '../utils/seasonalAdjustment';
import { BedRotation, optimizeBedRotation } from './rotationOptimizer';
import { getAllMasterSheets } from '../services/plantMasterService';
import { getSoilCompatibility } from '../utils/soilTemperatureUtils';
import { adjustPlantingDates, calculateAltitudePlantingDelay } from '../utils/altitudeUtils';
import { adjustDateForSoilType } from '../utils/soilTemperatureUtils';
import { PlantingWindow } from '../services/plantingWindowOptimizer';

export interface PlannedPlanting {
  plantName: string;
  month: number; // 1-12
  method: 'Seed' | 'Seedling';
  quantity: number;
  bed?: string; // Aiuola assegnata
  variety?: string;
}

export interface PlannedHarvest {
  plantName: string;
  month: number;
  estimatedYield: number; // kg
  bed?: string;
}

export interface PlannedMaintenance {
  type: 'Fertilize' | 'Prune' | 'Treatment';
  plantName: string;
  month: number;
  description: string;
}

export interface QuarterPlan {
  season: Season;
  plantings: PlannedPlanting[];
  harvests: PlannedHarvest[];
  maintenance: PlannedMaintenance[];
}

export interface AnnualPlan {
  year: number;
  gardenId: string;
  plantingWindows: PlantingWindow[];
  quarters: {
    Q1: QuarterPlan;
    Q2: QuarterPlan;
    Q3: QuarterPlan;
    Q4: QuarterPlan;
  };
  rotations: BedRotation[];
  projections: {
    totalYield: number; // kg stimati
    costSavings: number; // € risparmiati
    breakEvenDate?: string; // Data break-even
  };
}

/**
 * Genera piano annuale completo
 */
export const generateAnnualPlan = (
  garden: Garden,
  preferences?: {
    preferredPlants?: string[];
    targetYield?: number;
  },
  plantingWindows: PlantingWindow[] = []
): AnnualPlan => {
  const currentYear = new Date().getFullYear();

  const masterSheets = getAllMasterSheets();
  let availablePlants = preferences?.preferredPlants ||
    masterSheets.map(p => p.commonName);

  // Filtra per compatibilità terreno
  availablePlants = availablePlants.filter(plantName => {
    const soilCompatibility = getSoilCompatibility(plantName, garden.soilType);
    return soilCompatibility.compatible;
  });

  // Determina stagioni per quarters
  const latitude = garden.coordinates?.latitude || 0;
  const q1Season = getSeasonForDate(new Date(currentYear, 0, 15), latitude); // Gennaio
  const q2Season = getSeasonForDate(new Date(currentYear, 3, 15), latitude); // Aprile
  const q3Season = getSeasonForDate(new Date(currentYear, 6, 15), latitude); // Luglio
  const q4Season = getSeasonForDate(new Date(currentYear, 9, 15), latitude); // Ottobre

  // Genera quarters
  const quarters = {
    Q1: generateQuarterPlan(1, 3, q1Season, availablePlants, plantingWindows),
    Q2: generateQuarterPlan(4, 6, q2Season, availablePlants, plantingWindows),
    Q3: generateQuarterPlan(7, 9, q3Season, availablePlants, plantingWindows),
    Q4: generateQuarterPlan(10, 12, q4Season, availablePlants, plantingWindows)
  };

  // Genera rotazioni per ogni aiuola
  const rotations: BedRotation[] = [];
  // TODO: Implementare logica aiuole se disponibile

  // Calcola proiezioni
  const projections = calculateProjections(quarters, garden);

  return {
    year: currentYear,
    gardenId: garden.id,
    plantingWindows,
    quarters,
    rotations,
    projections
  };
};

/**
 * Genera piano per un quarter
 */
const generateQuarterPlan = (
  startMonth: number,
  endMonth: number,
  season: Season,
  availablePlants: string[],
  plantingWindows: PlantingWindow[]
): QuarterPlan => {
  const plantings: PlannedPlanting[] = [];
  const harvests: PlannedHarvest[] = [];
  const maintenance: PlannedMaintenance[] = [];

  const relevantWindows = plantingWindows.filter(window => {
    const windowStartMonth = window.startDate.getMonth() + 1;
    const windowEndMonth = window.endDate.getMonth() + 1;
    return windowStartMonth <= endMonth && windowEndMonth >= startMonth;
  });

  if (relevantWindows.length > 0) {
    for (const window of relevantWindows) {
      const windowStartMonth = Math.max(startMonth, window.startDate.getMonth() + 1);
      const windowEndMonth = Math.min(endMonth, window.endDate.getMonth() + 1);

      const suitablePlants = window.recommendedPlants.filter(recommended =>
        availablePlants.some(available => available.toUpperCase() === recommended.toUpperCase())
      );

      if (suitablePlants.length === 0) continue;

      for (let month = windowStartMonth; month <= windowEndMonth; month++) {
        for (const plantName of suitablePlants) {
          plantings.push({
            plantName,
            month,
            method: window.method,
            quantity: 10
          });
        }
      }
    }
  } else {
    // Fallback: nessuna finestra reale disponibile (es. orto senza coordinate).
    // Comportamento precedente: distribuisce le prime 2 piante disponibili su ogni mese.
    const seasonalPlants = availablePlants.slice(0, 2);
    for (let month = startMonth; month <= endMonth; month++) {
      for (const plantName of seasonalPlants) {
        plantings.push({
          plantName,
          month,
          method: 'Seed',
          quantity: 10
        });
      }
    }
  }

  const seen = new Set<string>();
  const dedupedPlantings = plantings.filter(p => {
    const key = `${p.plantName}|${p.month}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  plantings.length = 0;
  plantings.push(...dedupedPlantings);

  return {
    season,
    plantings,
    harvests,
    maintenance
  };
};

/**
 * Calcola proiezioni resa/costi
 */
export const calculateProjections = (
  quarters: AnnualPlan['quarters'],
  garden: Garden
): AnnualPlan['projections'] => {
  let totalYield = 0;

  // Stima resa basata su piante pianificate
  for (const quarter of Object.values(quarters)) {
    for (const planting of quarter.plantings) {
      const master = getAllMasterSheets().find(p => p.commonName === planting.plantName);
      if (master) {
        // Stima resa: usa valore di default se non disponibile
        const yieldPerPlant = 1; // kg per pianta (default)
        totalYield += yieldPerPlant * planting.quantity * 0.7; // 70% survival rate
      }
    }
  }

  // Stima risparmio (prezzo medio biologico: 5€/kg)
  const avgPricePerKg = 5;
  const costSavings = totalYield * avgPricePerKg;

  // Break-even: quando risparmio supera costi iniziali (semi, attrezzi, etc.)
  const initialCosts = 100; // € stima
  const breakEvenDate = costSavings >= initialCosts 
    ? new Date(new Date().getFullYear(), 3, 1).toISOString().split('T')[0] // Aprile
    : undefined;

  return {
    totalYield: Math.round(totalYield),
    costSavings: Math.round(costSavings),
    breakEvenDate
  };
};

/**
 * Ottimizza rotazioni per piano annuale
 */
export const optimizeRotations = (
  plan: AnnualPlan,
  garden: Garden
): AnnualPlan => {
  const optimizedRotations = plan.rotations.map(rotation => {
    const availablePlants = Object.values(plan.quarters)
      .flatMap(q => q.plantings.map(p => p.plantName));
    
    const result = optimizeBedRotation(rotation, availablePlants, plan.year);
    return result.optimized;
  });

  return {
    ...plan,
    rotations: optimizedRotations
  };
};

/**
 * Suggerisce successioni ottimali
 */
export const suggestSuccessions = (
  harvestDate: string,
  bed: string,
  currentPlan: AnnualPlan
): PlannedPlanting[] => {
  const harvestMonth = new Date(harvestDate).getMonth() + 1;
  const suggestions: PlannedPlanting[] = [];

  const nextMonths = harvestMonth < 10 ? [harvestMonth + 1, harvestMonth + 2] : [];
  if (nextMonths.length === 0) return suggestions;

  const masterSheets = getAllMasterSheets();
  const availableCommonNames = masterSheets.map(p => p.commonName);

  for (const month of nextMonths) {
    const window = currentPlan.plantingWindows.find(w => {
      const windowStartMonth = w.startDate.getMonth() + 1;
      const windowEndMonth = w.endDate.getMonth() + 1;
      return month >= windowStartMonth && month <= windowEndMonth;
    });

    if (!window) continue;

    const suitablePlants = window.recommendedPlants.filter(recommended =>
      availableCommonNames.some(available => available.toUpperCase() === recommended.toUpperCase())
    );

    for (const plantName of suitablePlants.slice(0, 2)) {
      suggestions.push({
        plantName,
        month,
        method: window.method,
        quantity: 10,
        bed
      });
    }
  }

  return suggestions;
};

