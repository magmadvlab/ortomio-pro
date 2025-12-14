/**
 * Planting Window Optimizer Service
 * Calcola finestre ottimali di impianto considerando seme vs piantina
 */

import { SeasonalSunWindow, GardenClassification } from './seasonalSunWindows';
import { PlantSuggestionForWindow } from './seasonalPlantSuggestions';
import { PlantMasterSheet, getMasterSheetById } from '../data/plantMasterSheets';
import { calculateDailySunHours, Obstacle3D } from './preciseSunCalculator';
import { Garden } from '../types';
import {
  calculateSoilWarmingDelay,
  adjustDateForSoilType,
} from '../utils/soilTemperatureUtils';
import {
  calculateAltitudePlantingDelay,
  adjustPlantingDates,
} from '../utils/altitudeUtils';
import { HistoricalWeatherData } from './historicalWeatherService';
import { getMasterSheet } from '../services/plantMasterService';

export interface PlantingWindow {
  category: 'Estivo' | 'Primaverile' | 'Autunnale' | 'FogliaEstiva';
  startDate: Date;
  endDate: Date;
  method: 'Seed' | 'Seedling';
  recommendedPlants: string[];
  reason: string;
  cycles: number; // Cicli multipli possibili
  adjustedStartDate?: Date; // Data aggiustata per metodo (seme anticipa)
  // Aggiustamenti terreno e altitudine
  soilAdjustedDate?: Date; // Data aggiustata per tipo terreno
  altitudeAdjustedDate?: Date; // Data aggiustata per altitudine
  finalAdjustedDate?: Date; // Data finale con entrambi gli aggiustamenti
}

/**
 * Trova finestre ottimali di impianto per ogni categoria
 * 
 * @param classification Classificazione del tipo di orto
 * @param windows Finestre stagionali solari
 * @param lat Latitudine
 * @param lng Longitudine
 * @param obstacles Ostacoli 3D (opzionale)
 * @param year Anno per cui calcolare
 * @returns Array di finestre di impianto
 */
/**
 * Helper per aggiustare data considerando terreno e altitudine
 */
function adjustPlantingDateForConditions(
  baseDate: Date,
  soilType?: Garden['soilType'],
  altitudeMeters?: number,
  plantType: 'early' | 'standard' | 'late' = 'standard'
): Date {
  let adjustedDate = new Date(baseDate);

  // 1. Applica ritardo altitudine
  if (altitudeMeters && altitudeMeters > 200) {
    const altitudeDelay = calculateAltitudePlantingDelay(altitudeMeters, plantType);
    adjustedDate.setDate(adjustedDate.getDate() + altitudeDelay);
  }

  // 2. Applica correzione tipo terreno
  const soilDelay = calculateSoilWarmingDelay(soilType);
  adjustedDate.setDate(adjustedDate.getDate() + soilDelay);

  return adjustedDate;
}

export function findPlantingWindows(
  classification: GardenClassification,
  windows: SeasonalSunWindow[],
  lat: number,
  lng: number,
  obstacles: Obstacle3D[] = [],
  year: number = new Date().getFullYear(),
  soilType?: Garden['soilType'],
  altitudeMeters?: number,
  historicalWeather?: HistoricalWeatherData[]
): PlantingWindow[] {
  const plantingWindows: PlantingWindow[] = [];
  
  const giuLug = windows.find(w => w.period === 'Giu-Lug');
  const febMar = windows.find(w => w.period === 'Feb-Mar');
  const aprMag = windows.find(w => w.period === 'Apr-Mag');
  const agoSet = windows.find(w => w.period === 'Ago-Set');
  
  if (!giuLug || !febMar || !aprMag || !agoSet) {
    return plantingWindows;
  }
  
  // ORTO ESTIVO
  if (classification.type === 'Estivo' || classification.summerScore >= 0.7) {
    if (giuLug.avgHours >= 6) {
      const startDate = findFirstDateWithHours(lat, lng, obstacles, year, 6, [5, 6, 7]);
      const endDate = findLastDateWithHours(lat, lng, obstacles, year, 6, [6, 7, 8], 8);
      
      plantingWindows.push({
        category: 'Estivo',
        startDate,
        endDate,
        method: 'Seedling',
        recommendedPlants: ['Pomodoro', 'Peperone', 'Melanzana', 'Zucchina', 'Cetriolo'],
        reason: 'Periodo con sole continuo ottimale per piante da frutto. Resa massima garantita.',
        cycles: calculateCycles(startDate, endDate, 120), // ~120 giorni ciclo estivo
      });
    }
  }
  
  // ORTO PRIMAVERILE/AUTUNNALE
  if (classification.type === 'NonEstivo' || classification.springAutumnScore >= 0.7) {
    const marAprAvg = (febMar.avgHours + aprMag.avgHours) / 2;
    if (marAprAvg >= 3 && giuLug.avgHours <= 7) {
      const baseStartDate = findFirstDateWithHours(lat, lng, obstacles, year, 3, [2, 3, 4]);
      const baseEndDate = findLastDateWithHours(lat, lng, obstacles, year, 3, [4, 5], 7);
      
      // Applica aggiustamenti terreno e altitudine
      const adjustedStartDate = adjustPlantingDateForConditions(
        baseStartDate,
        soilType,
        altitudeMeters,
        'early' // Piante primaverili sono precoci
      );
      const adjustedEndDate = adjustPlantingDateForConditions(
        baseEndDate,
        soilType,
        altitudeMeters,
        'early'
      );
      
      plantingWindows.push({
        category: 'Primaverile',
        startDate: adjustedStartDate,
        endDate: adjustedEndDate,
        method: 'Seed',
        recommendedPlants: ['Insalata', 'Spinaci', 'Rucola', 'Piselli', 'Cipolle', 'Fave'],
        reason: 'Orto primaverile/autunnale con sole moderato ideale per foglie e radici. Produzione più lunga e meno stress.',
        cycles: calculateCycles(adjustedStartDate, adjustedEndDate, 60), // ~60 giorni ciclo primaverile
        adjustedStartDate: adjustedStartDate,
      });
    }
  }
  
  // ORTO FOGLIA ESTIVA
  if (giuLug.avgHours >= 3 && giuLug.avgHours <= 5 && 
      giuLug.peakHours && giuLug.peakHours.end <= 13) {
    const baseStartDate = new Date(year, 5, 1); // Giugno
    const baseEndDate = new Date(year, 8, 30); // Agosto
    
    // Applica aggiustamenti terreno e altitudine
    const adjustedStartDate = adjustPlantingDateForConditions(
      baseStartDate,
      soilType,
      altitudeMeters,
      'early' // Foglie estive sono precoci
    );
    const adjustedEndDate = adjustPlantingDateForConditions(
      baseEndDate,
      soilType,
      altitudeMeters,
      'early'
    );
    
    plantingWindows.push({
      category: 'FogliaEstiva',
      startDate: adjustedStartDate,
      endDate: adjustedEndDate,
      method: 'Seed',
      recommendedPlants: ['Basilico', 'Prezzemolo', 'Coriandolo', 'Lattuga Estiva'],
      reason: 'Sole mattutino con ombra pomeridiana ideale per foglie estive. Cicli rapidi.',
      cycles: calculateCycles(adjustedStartDate, adjustedEndDate, 40), // ~40 giorni ciclo foglia estiva
      adjustedStartDate: adjustedStartDate,
    });
  }
  
  // ORTO MISTO - Finestre aggiuntive
  if (classification.type === 'Misto') {
    if (classification.summerScore >= 0.3) {
      const baseStartDate = findFirstDateWithHours(lat, lng, obstacles, year, 5, [5, 6]);
      const baseEndDate = findLastDateWithHours(lat, lng, obstacles, year, 5, [7, 8], 8);
      
      const adjustedStartDate = adjustPlantingDateForConditions(
        baseStartDate,
        soilType,
        altitudeMeters,
        'standard'
      );
      const adjustedEndDate = adjustPlantingDateForConditions(
        baseEndDate,
        soilType,
        altitudeMeters,
        'standard'
      );
      
      plantingWindows.push({
        category: 'Estivo',
        startDate: adjustedStartDate,
        endDate: adjustedEndDate,
        method: 'Seedling',
        recommendedPlants: ['Pomodoro', 'Zucchina'],
        reason: 'Possibile coltivazione estiva con resa moderata.',
        cycles: calculateCycles(adjustedStartDate, adjustedEndDate, 120),
        adjustedStartDate: adjustedStartDate,
      });
    }
    
    if (classification.springAutumnScore >= 0.3) {
      const baseStartDate2 = findFirstDateWithHours(lat, lng, obstacles, year, 3, [3, 4]);
      const baseEndDate2 = findLastDateWithHours(lat, lng, obstacles, year, 3, [5, 6], 7);
      
      const adjustedStartDate2 = adjustPlantingDateForConditions(
        baseStartDate2,
        soilType,
        altitudeMeters,
        'early'
      );
      const adjustedEndDate2 = adjustPlantingDateForConditions(
        baseEndDate2,
        soilType,
        altitudeMeters,
        'early'
      );
      
      plantingWindows.push({
        category: 'Primaverile',
        startDate: adjustedStartDate2,
        endDate: adjustedEndDate2,
        method: 'Seed',
        recommendedPlants: ['Insalata', 'Spinaci', 'Rucola'],
        reason: 'Possibile coltivazione primaverile/autunnale con sole moderato.',
        cycles: calculateCycles(adjustedStartDate2, adjustedEndDate2, 60),
        adjustedStartDate: adjustedStartDate2,
      });
    }
  }
  
  return plantingWindows;
}

/**
 * Aggiusta una finestra di impianto per il metodo (seme vs piantina)
 * Per seme: anticipa di 45 giorni (germinazione + nursing)
 * Per piantina: usa finestra direttamente
 * 
 * @param window Finestra di impianto
 * @param method Metodo di impianto (Seed o Seedling)
 * @param plantId ID della pianta (opzionale, per calcolo preciso)
 * @returns Finestra aggiustata
 */
export function adjustForPlantingMethod(
  window: PlantingWindow,
  method: 'Seed' | 'Seedling',
  plantId?: string
): PlantingWindow {
  const adjustedWindow = { ...window };
  
  if (method === 'Seed') {
    // Per seme, devi iniziare prima (tempo germinazione + nursing)
    let daysBefore = 45; // Default: 45 giorni
    
    // Se abbiamo l'ID della pianta, calcola giorni precisi
    if (plantId) {
      const plant = getMasterSheetById(plantId);
      if (plant) {
        const avgGerminationDays = plant.germination?.emergenceDays
          ? (plant.germination.emergenceDays.min + plant.germination.emergenceDays.max) / 2
          : 10;
        const nursingDays = 30;
        daysBefore = avgGerminationDays + nursingDays;
      }
    }
    
    adjustedWindow.adjustedStartDate = new Date(window.startDate);
    adjustedWindow.adjustedStartDate.setDate(adjustedWindow.adjustedStartDate.getDate() - daysBefore);
    adjustedWindow.method = 'Seed';
  } else {
    // Per piantina, puoi iniziare direttamente nella finestra
    adjustedWindow.adjustedStartDate = window.startDate;
    adjustedWindow.method = 'Seedling';
  }
  
  return adjustedWindow;
}

/**
 * Calcola quanti cicli sono possibili in una finestra
 */
function calculateCycles(startDate: Date, endDate: Date, cycleDays: number): number {
  const daysDiff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.floor(daysDiff / cycleDays));
}

/**
 * Trova la prima data quando supera una soglia di ore di sole
 */
function findFirstDateWithHours(
  lat: number,
  lng: number,
  obstacles: Obstacle3D[],
  year: number,
  minHours: number,
  months: number[]
): Date {
  for (const month of months) {
    const daysInMonth = new Date(year, month, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const hours = calculateDailySunHours(lat, lng, date, obstacles);
      if (hours >= minHours) {
        return date;
      }
    }
  }
  return new Date(year, months[0] - 1, 1);
}

/**
 * Trova l'ultima data quando supera una soglia di ore di sole
 * o quando supera un limite di stress
 */
function findLastDateWithHours(
  lat: number,
  lng: number,
  obstacles: Obstacle3D[],
  year: number,
  minHours: number,
  months: number[],
  maxStressHours?: number
): Date {
  let lastValidDate: Date | null = null;
  
  for (const month of months) {
    const daysInMonth = new Date(year, month, 0).getDate();
    for (let day = daysInMonth; day >= 1; day--) {
      const date = new Date(year, month - 1, day);
      const hours = calculateDailySunHours(lat, lng, date, obstacles);
      
      if (maxStressHours && hours > maxStressHours) {
        break;
      }
      
      if (hours >= minHours) {
        if (!lastValidDate || date > lastValidDate) {
          lastValidDate = date;
        }
      }
    }
  }
  
  return lastValidDate || new Date(year, months[months.length - 1] - 1, new Date(year, months[months.length - 1], 0).getDate());
}

