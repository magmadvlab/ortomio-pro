/**
 * Annual Planner Engine
 * Genera e gestisce piani annuali completi con rotazioni, proiezioni e successioni
 */

import { Garden } from '../types';
import { Season, getSeasonForDate } from '../utils/seasonalAdjustment';
import { BedRotation, optimizeBedRotation } from './rotationOptimizer';
import { getAllMasterSheets } from '../services/plantMasterService';
import { GardenClassification } from '../services/seasonalSunWindows';
import { validatePlantCompatibility } from './solarClassificationHelper';
import { getSoilCompatibility } from '../utils/soilTemperatureUtils';
import { adjustPlantingDates, calculateAltitudePlantingDelay } from '../utils/altitudeUtils';
import { adjustDateForSoilType } from '../utils/soilTemperatureUtils';

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
  solarClassification?: GardenClassification
): AnnualPlan => {
  const currentYear = new Date().getFullYear();
  const latitude = garden.coordinates?.latitude || 0;

  // Determina stagioni per quarters
  const q1Season = getSeasonForDate(new Date(currentYear, 0, 15), latitude); // Gennaio
  const q2Season = getSeasonForDate(new Date(currentYear, 3, 15), latitude); // Aprile
  const q3Season = getSeasonForDate(new Date(currentYear, 6, 15), latitude); // Luglio
  const q4Season = getSeasonForDate(new Date(currentYear, 9, 15), latitude); // Ottobre

  const masterSheets = getAllMasterSheets();
  let availablePlants = preferences?.preferredPlants || 
    masterSheets.map(p => p.commonName);

  // Filtra piante in base alla classificazione solare se disponibile
  if (solarClassification) {
    // Ottieni finestre stagionali (mock per ora, dovrebbero essere passate)
    const mockWindows = [
      { period: 'Feb-Mar' as const, avgHours: 4, minHours: 3, maxHours: 5 },
      { period: 'Apr-Mag' as const, avgHours: 5, minHours: 4, maxHours: 6 },
      { period: 'Giu-Lug' as const, avgHours: 6, minHours: 5, maxHours: 7 },
      { period: 'Ago-Set' as const, avgHours: 5, minHours: 4, maxHours: 6 },
    ];
    
    availablePlants = availablePlants.filter(plantName => {
      const solarCompatibility = validatePlantCompatibility(
        plantName,
        solarClassification,
        mockWindows
      );
      return solarCompatibility.compatible;
    });
  }

  // Filtra per compatibilità terreno
  availablePlants = availablePlants.filter(plantName => {
    const soilCompatibility = getSoilCompatibility(plantName, garden.soilType);
    return soilCompatibility.compatible;
  });

  // Genera quarters
  const quarters = {
    Q1: generateQuarterPlan(1, 3, q1Season, availablePlants, garden, solarClassification),
    Q2: generateQuarterPlan(4, 6, q2Season, availablePlants, garden, solarClassification),
    Q3: generateQuarterPlan(7, 9, q3Season, availablePlants, garden, solarClassification),
    Q4: generateQuarterPlan(10, 12, q4Season, availablePlants, garden, solarClassification)
  };

  // Genera rotazioni per ogni aiuola
  const rotations: BedRotation[] = [];
  // TODO: Implementare logica aiuole se disponibile

  // Calcola proiezioni
  const projections = calculateProjections(quarters, garden);

  return {
    year: currentYear,
    gardenId: garden.id,
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
  garden: Garden,
  solarClassification?: GardenClassification
): QuarterPlan => {
  const plantings: PlannedPlanting[] = [];
  const harvests: PlannedHarvest[] = [];
  const maintenance: PlannedMaintenance[] = [];

  // Filtra piante per stagione
  const seasonalPlants = availablePlants.filter(plantName => {
    const master = getAllMasterSheets().find(p => p.commonName === plantName);
    if (!master) return false;
    // Considera tutte le piante disponibili per la stagione
    return true;
  });

  // Genera plantings per ogni mese
  for (let month = startMonth; month <= endMonth; month++) {
    // Assegna 1-2 piante per mese
    const plantsForMonth = seasonalPlants.slice(0, 2);
    for (const plantName of plantsForMonth) {
      plantings.push({
        plantName,
        month,
        method: 'Seed',
        quantity: 10
      });
    }
  }

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

  // Trova piante che possono essere piantate dopo questo mese
  const masterSheets = getAllMasterSheets();
  const nextMonths = harvestMonth < 10 ? [harvestMonth + 1, harvestMonth + 2] : [];

  for (const month of nextMonths) {
    const season = getSeasonForDate(new Date(new Date().getFullYear(), month - 1, 15), 0);
    const suitablePlants = masterSheets; // Considera tutte le piante disponibili

    for (const plant of suitablePlants.slice(0, 2)) {
      suggestions.push({
        plantName: plant.commonName,
        month,
        method: 'Seed',
        quantity: 10,
        bed
      });
    }
  }

  return suggestions;
};

