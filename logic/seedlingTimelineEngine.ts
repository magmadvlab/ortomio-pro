/**
 * Seedling Timeline Engine
 * Calcoli avanzati per timing germinazione, nursing, hardening e trapianto
 */

import { SeedlingBatch } from '../services/seedlingService';
import { PlantMasterSheet, Garden } from '../types';
import { getMasterSheet } from '../services/plantMasterService';
import { getWeatherForecast7Days, WeatherForecast } from '../services/weatherService';
import { calculateMoonPhase, isIdealPhaseFor } from './lunarCalendar';
import { analyzeNightTemperatures } from './nightTempAnalysis';
import { getSeasonForDate } from '../utils/seasonalAdjustment';

export interface SeedlingTimeline {
  germination: {
    startDate: Date;
    expectedEndDate: Date;
    daysRemaining: number;
    status: 'NotStarted' | 'InProgress' | 'Completed';
  };
  nursing: {
    startDate: Date;
    expectedEndDate: Date;
    daysRemaining: number;
    status: 'NotStarted' | 'InProgress' | 'Completed';
    leafCount?: number; // Foglie vere attese
  };
  hardening: {
    startDate: Date | null;
    expectedEndDate: Date | null;
    daysRemaining: number | null;
    status: 'NotStarted' | 'InProgress' | 'Ready';
    recommendedStartDate?: Date;
  };
  transplant: {
    recommendedDate: Date;
    isOptimal: boolean;
    reasons: string[];
    warnings: string[];
  };
}

/**
 * Calcola timeline completa per un batch
 */
export const calculateSeedlingTimeline = (
  batch: SeedlingBatch,
  garden: Garden,
  weatherForecast?: WeatherForecast[]
): SeedlingTimeline => {
  const masterData = getMasterSheet(batch.plantName);
  if (!masterData) {
    throw new Error(`Pianta ${batch.plantName} non trovata`);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sowingDate = new Date(batch.sowingDate);
  sowingDate.setHours(0, 0, 0, 0);
  const daysSinceSowing = Math.floor((today.getTime() - sowingDate.getTime()) / (1000 * 60 * 60 * 24));

  // Calcoli giorni per fase
  const avgGerminationDays = (masterData.germination.emergenceDays.min + masterData.germination.emergenceDays.max) / 2;
  const nursingDays = 30;
  const hardeningDays = 10;

  // Germinazione
  const germinationStart = new Date(sowingDate);
  const germinationEnd = new Date(sowingDate);
  germinationEnd.setDate(germinationEnd.getDate() + avgGerminationDays);
  
  let germinationStatus: 'NotStarted' | 'InProgress' | 'Completed' = 'NotStarted';
  if (daysSinceSowing >= avgGerminationDays) {
    germinationStatus = 'Completed';
  } else if (daysSinceSowing > 0) {
    germinationStatus = 'InProgress';
  }

  // Nursing
  const nursingStart = new Date(germinationEnd);
  const nursingEnd = new Date(nursingStart);
  nursingEnd.setDate(nursingEnd.getDate() + nursingDays);
  
  let nursingStatus: 'NotStarted' | 'InProgress' | 'Completed' = 'NotStarted';
  if (daysSinceSowing >= avgGerminationDays + nursingDays) {
    nursingStatus = 'Completed';
  } else if (daysSinceSowing >= avgGerminationDays) {
    nursingStatus = 'InProgress';
  }

  // Hardening
  const hardeningStartRecommended = new Date(nursingEnd);
  hardeningStartRecommended.setDate(hardeningStartRecommended.getDate() - 14); // 14 giorni prima fine nursing
  
  let hardeningStatus: 'NotStarted' | 'InProgress' | 'Ready' = 'NotStarted';
  let hardeningStart: Date | null = null;
  let hardeningEnd: Date | null = null;
  
  if (batch.phase === 'Hardening' || batch.phase === 'ReadyToTransplant') {
    hardeningStatus = batch.phase === 'ReadyToTransplant' ? 'Ready' : 'InProgress';
    hardeningStart = hardeningStartRecommended;
    hardeningEnd = new Date(nursingEnd);
  } else if (daysSinceSowing >= avgGerminationDays + nursingDays - 14) {
    hardeningStatus = 'NotStarted'; // Pronto per iniziare
    hardeningStart = null;
    hardeningEnd = null;
  }

  // Trapianto ottimale
  const baseTransplantDate = new Date(nursingEnd);
  baseTransplantDate.setDate(baseTransplantDate.getDate() + hardeningDays);
  
  const transplantResult = calculateOptimalTransplantDate(
    baseTransplantDate,
    batch,
    garden,
    weatherForecast
  );

  return {
    germination: {
      startDate: germinationStart,
      expectedEndDate: germinationEnd,
      daysRemaining: Math.max(0, avgGerminationDays - daysSinceSowing),
      status: germinationStatus
    },
    nursing: {
      startDate: nursingStart,
      expectedEndDate: nursingEnd,
      daysRemaining: Math.max(0, (avgGerminationDays + nursingDays) - daysSinceSowing),
      status: nursingStatus,
      leafCount: Math.floor((daysSinceSowing - avgGerminationDays) / 7) // Stima foglie vere
    },
    hardening: {
      startDate: hardeningStart,
      expectedEndDate: hardeningEnd,
      daysRemaining: hardeningEnd ? Math.max(0, Math.floor((hardeningEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))) : null,
      status: hardeningStatus,
      recommendedStartDate: hardeningStartRecommended
    },
    transplant: transplantResult
  };
};

/**
 * Calcola data trapianto ottimale considerando meteo, luna, temperatura
 */
const calculateOptimalTransplantDate = (
  baseDate: Date,
  batch: SeedlingBatch,
  garden: Garden,
  weatherForecast?: WeatherForecast[]
): {
  recommendedDate: Date;
  isOptimal: boolean;
  reasons: string[];
  warnings: string[];
} => {
  const reasons: string[] = [];
  const warnings: string[] = [];
  
  let recommendedDate = new Date(baseDate);
  let isOptimal = true;

  // Verifica temperatura notturna
  if (weatherForecast && weatherForecast.length > 0) {
    const forecast = weatherForecast[0];
    const masterData = getMasterSheet(batch.plantName);
    
    if (masterData && forecast.tempMin !== undefined) {
      const minTemp = masterData.germination.minTemp || 10; // Default 10°C
      
      if (forecast.tempMin < minTemp) {
        isOptimal = false;
        warnings.push(`Temperatura notturna prevista: ${forecast.tempMin}°C (minimo richiesto: ${minTemp}°C)`);
        
        // Cerca prossima data con temperatura adeguata
        for (let i = 0; i < Math.min(14, weatherForecast.length); i++) {
          const futureForecast = weatherForecast[i];
          if (futureForecast.tempMin && futureForecast.tempMin >= minTemp) {
            recommendedDate = new Date(baseDate);
            recommendedDate.setDate(recommendedDate.getDate() + i);
            reasons.push(`Trapianto spostato a ${i} giorni per temperatura adeguata`);
            break;
          }
        }
      } else {
        reasons.push(`Temperatura notturna adeguata: ${forecast.tempMin}°C`);
      }
    }
  }

  // Verifica fase lunare
  const moonInfo = calculateMoonPhase(recommendedDate);
  const masterData = getMasterSheet(batch.plantName);
  if (masterData) {
    const isIdeal = isIdealPhaseFor('transplant', masterData.nutrientCategory, recommendedDate);
    if (!isIdeal) {
      // Cerca prossima fase lunare ideale (entro 7 giorni)
      for (let i = 1; i <= 7; i++) {
        const testDate = new Date(recommendedDate);
        testDate.setDate(testDate.getDate() + i);
        if (isIdealPhaseFor('transplant', masterData.nutrientCategory, testDate)) {
          recommendedDate = testDate;
          reasons.push(`Trapianto spostato per fase lunare ideale`);
          break;
        }
      }
    } else {
      reasons.push('Fase lunare ideale per trapianto');
    }
  }

  // Verifica stagione
  const season = getSeasonForDate(recommendedDate, garden.coordinates?.latitude || 0);
  if (season === 'Winter' && masterData && masterData.season !== 'Winter') {
    warnings.push('Trapianto in inverno: considerare protezione o posticipare');
    isOptimal = false;
  }

  return {
    recommendedDate,
    isOptimal,
    reasons,
    warnings
  };
};

/**
 * Calcola giorni germinazione basati su temperatura e umidità
 */
export const calculateGerminationDays = (
  plant: PlantMasterSheet,
  temperature: number,
  humidity: number
): number => {
  const baseDays = (plant.germination.emergenceDays.min + plant.germination.emergenceDays.max) / 2;
  const optimalTemp = plant.germination.optimalTemp || 20;
  const minTemp = plant.germination.minTemp || 10;
  const maxTemp = plant.germination.maxTemp || 30;

  // Modificatore temperatura
  let tempModifier = 1;
  if (temperature < optimalTemp) {
    // Sotto temperatura ottimale: rallenta
    const diff = optimalTemp - temperature;
    tempModifier = 1 + (diff / 10); // +10% per ogni grado sotto
  } else if (temperature > optimalTemp) {
    // Sopra temperatura ottimale: accelera leggermente
    const diff = temperature - optimalTemp;
    tempModifier = Math.max(0.8, 1 - (diff / 20)); // -5% per ogni grado sopra (min 0.8)
  }

  // Modificatore umidità (ottimale 70-80%)
  let humidityModifier = 1;
  if (humidity < 60) {
    humidityModifier = 1.2; // Rallenta se troppo secco
  } else if (humidity > 90) {
    humidityModifier = 1.1; // Rallenta se troppo umido
  }

  return Math.round(baseDays * tempModifier * humidityModifier);
};

