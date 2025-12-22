/**
 * Predictive Analytics Service
 * Previsioni per agricoltura di precisione: data raccolto ottimale, resa, rischio malattie, fabbisogno idrico
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { GardenTask, PlantMasterSheet, HarvestLogData } from '../types';
import { getMasterSheetSync } from './plantMasterService';
import { calculateDaysActive } from './taskCalculationService';
import { determineLifecyclePhase } from '../logic/lifecycleEngine';
import { getWeatherForecast7Days } from './weatherService';
import { calculateHarvestAnalytics } from '../logic/harvestAnalyticsEngine';

export interface HarvestPrediction {
  optimalHarvestDate: Date;
  confidence: number; // 0-1
  factors: {
    daysActive: number;
    expectedDaysToMaturity: number;
    currentPhase: string;
    weatherConditions: string;
    growthRate: 'slow' | 'normal' | 'fast';
  };
  earliestHarvestDate?: Date;
  latestHarvestDate?: Date;
}

export interface YieldPrediction {
  predictedYieldKg: number;
  predictedYieldPerSqm: number;
  confidence: number; // 0-1
  factors: {
    historicalAverage?: number;
    currentGrowthRate: 'slow' | 'normal' | 'fast';
    healthScore: number; // 0-1
    weatherConditions: string;
    fertilizationLevel: 'low' | 'medium' | 'high';
  };
  range: {
    min: number;
    max: number;
  };
}

export interface DiseaseRiskPrediction {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  diseases: Array<{
    name: string;
    probability: number; // 0-1
    conditions: string[];
    prevention: string[];
  }>;
  factors: {
    humidity: number;
    temperature: number;
    precipitation: number;
    plantHealth: number;
    historicalPatterns: boolean;
  };
}

export interface WaterRequirementPrediction {
  next7Days: Array<{
    date: Date;
    litersPerSqm: number;
    totalLiters: number;
    reason: string;
  }>;
  next14Days: Array<{
    date: Date;
    litersPerSqm: number;
    totalLiters: number;
    reason: string;
  }>;
  averageDailyRequirement: number;
  factors: {
    currentSoilMoisture?: number;
    expectedPrecipitation: number;
    evapotranspiration: number;
    plantPhase: string;
  };
}

/**
 * Prevede data raccolto ottimale per un task
 */
export async function predictOptimalHarvestDate(
  task: GardenTask,
  masterData: PlantMasterSheet,
  garden: { coordinates?: { latitude: number; longitude: number }; sizeSqMeters?: number },
  currentDate: Date = new Date()
): Promise<HarvestPrediction> {
  const daysActive = calculateDaysActive(task);
  const currentPhase = determineLifecyclePhase(daysActive, masterData, task);
  
  // Calcola giorni attesi alla maturità da harvestWindow o default
  let expectedDaysToMaturity = 90; // Default
  if (masterData.harvestWindow) {
    if (typeof masterData.harvestWindow === 'string') {
      // Estrai numeri da stringhe come "60-90 giorni"
      const match = masterData.harvestWindow.match(/(\d+)-?(\d+)?/);
      if (match) {
        const min = parseInt(match[1], 10);
        const max = match[2] ? parseInt(match[2], 10) : min;
        expectedDaysToMaturity = Math.round((min + max) / 2); // Media
      }
    }
  }
  const daysRemaining = Math.max(0, expectedDaysToMaturity - daysActive);
  
  // Ottieni previsioni meteo
  let weatherImpact = 'normal';
  let weatherDays = 0;
  if (garden.coordinates) {
    try {
      const forecast = await getWeatherForecast7Days(
        garden.coordinates.latitude,
        garden.coordinates.longitude
      );
      if (forecast && forecast.length > 0) {
        // Verifica condizioni favorevoli per raccolto
        const avgTemp = forecast.reduce((sum, f) => {
          const tempMax = f.tempMax ?? f.temp ?? 0;
          const tempMin = f.tempMin ?? f.temp ?? 0;
          return sum + (tempMax + tempMin) / 2;
        }, 0) / forecast.length;
        const hasRain = forecast.some(f => f.rainForecastMm > 5);
        
        if (avgTemp > 20 && !hasRain) {
          weatherImpact = 'favorable';
          weatherDays = 7;
        } else if (hasRain) {
          weatherImpact = 'unfavorable';
        }
      }
    } catch (error) {
      console.warn('Error fetching weather for harvest prediction:', error);
    }
  }
  
  // Determina crescita basata su fase e giorni
  let growthRate: 'slow' | 'normal' | 'fast' = 'normal';
  if (currentPhase === 'Production' && daysActive < expectedDaysToMaturity * 0.7) {
    growthRate = 'fast';
  } else if (currentPhase !== 'Production' && daysActive > expectedDaysToMaturity * 0.8) {
    growthRate = 'slow';
  }
  
  // Calcola data ottimale
  const baseHarvestDate = new Date(task.date);
  baseHarvestDate.setDate(baseHarvestDate.getDate() + expectedDaysToMaturity);
  
  // Aggiusta per crescita
  if (growthRate === 'fast') {
    baseHarvestDate.setDate(baseHarvestDate.getDate() - 5); // 5 giorni prima
  } else if (growthRate === 'slow') {
    baseHarvestDate.setDate(baseHarvestDate.getDate() + 7); // 7 giorni dopo
  }
  
  // Aggiusta per meteo
  if (weatherImpact === 'favorable' && weatherDays > 0) {
    baseHarvestDate.setDate(baseHarvestDate.getDate() - 2);
  }
  
  const optimalHarvestDate = baseHarvestDate;
  const earliestHarvestDate = new Date(optimalHarvestDate);
  earliestHarvestDate.setDate(earliestHarvestDate.getDate() - 7);
  const latestHarvestDate = new Date(optimalHarvestDate);
  latestHarvestDate.setDate(latestHarvestDate.getDate() + 7);
  
  // Confidence basata su dati disponibili
  let confidence = 0.7;
  if (garden.coordinates && weatherImpact !== 'normal') {
    confidence = 0.8;
  }
  if (daysActive > expectedDaysToMaturity * 0.5) {
    confidence = 0.85;
  }
  
  return {
    optimalHarvestDate,
    confidence,
    factors: {
      daysActive,
      expectedDaysToMaturity,
      currentPhase,
      weatherConditions: weatherImpact,
      growthRate
    },
    earliestHarvestDate,
    latestHarvestDate
  };
}

/**
 * Prevede resa per un task
 */
export async function predictYield(
  task: GardenTask,
  masterData: PlantMasterSheet,
  garden: { sizeSqMeters?: number },
  historicalHarvests: HarvestLogData[],
  currentDate: Date = new Date()
): Promise<YieldPrediction> {
  const daysActive = calculateDaysActive(task);
  const currentPhase = determineLifecyclePhase(daysActive, masterData, task);
  
  // Calcola resa storica media per questa pianta
  const plantHarvests = historicalHarvests.filter(h => h.plantName === task.plantName);
  let historicalAverage: number | undefined;
  if (plantHarvests.length > 0) {
    const totalKg = plantHarvests.reduce((sum, h) => {
      let kg = 0;
      if (h.unit === 'kg') kg = h.quantity;
      else if (h.unit === 'g') kg = h.quantity / 1000;
      else kg = h.quantity * 0.1;
      return sum + kg;
    }, 0);
    historicalAverage = totalKg / plantHarvests.length;
  }
  
  // Resa attesa basata su master data
  const expectedYieldPerSqm = 2; // kg/m² default (non disponibile in PlantMasterSheet)
  const areaSqm = garden.sizeSqMeters || 1;
  const baseYield = expectedYieldPerSqm * areaSqm;
  
  // Determina crescita e salute
  let growthRate: 'slow' | 'normal' | 'fast' = 'normal';
  let healthScore = 0.8; // Default
  
  // Determina crescita basata su fase e giorni
  // TODO: Integrare analisi foto per determinare crescita reale
  const expectedDaysToMaturity = 90; // Default, potrebbe essere calcolato da harvestWindow
  if (currentPhase === 'Production' && daysActive < expectedDaysToMaturity * 0.7) {
    growthRate = 'fast';
  } else if (currentPhase !== 'Production' && daysActive > expectedDaysToMaturity * 0.8) {
    growthRate = 'slow';
  }
  
  // Calcola resa prevista
  let predictedYield = baseYield;
  
  // Aggiusta per resa storica se disponibile
  if (historicalAverage) {
    predictedYield = (predictedYield + historicalAverage) / 2;
  }
  
  // Aggiusta per crescita
  if (growthRate === 'fast') {
    predictedYield *= 1.15; // +15%
  } else if (growthRate === 'slow') {
    predictedYield *= 0.85; // -15%
  }
  
  // Aggiusta per salute
  predictedYield *= healthScore;
  
  // Aggiusta per fase
  if (currentPhase === 'Production') {
    predictedYield *= 1.1; // +10% se già in produzione
  } else if (currentPhase === 'Nursing' || currentPhase === 'Germination') {
    predictedYield *= 0.9; // -10% se ancora in crescita iniziale
  }
  
  const predictedYieldPerSqm = predictedYield / areaSqm;
  
  // Range di confidenza (±20%)
  const range = {
    min: predictedYield * 0.8,
    max: predictedYield * 1.2
  };
  
  // Confidence
  let confidence = 0.6;
  if (historicalAverage) confidence = 0.75;
  if (currentPhase === 'Production') confidence = 0.8;
  
  return {
    predictedYieldKg: Math.round(predictedYield * 10) / 10,
    predictedYieldPerSqm: Math.round(predictedYieldPerSqm * 10) / 10,
    confidence,
    factors: {
      historicalAverage,
      currentGrowthRate: growthRate,
      healthScore,
      weatherConditions: 'normal', // Potrebbe essere migliorato con previsioni meteo
      fertilizationLevel: 'medium' // Potrebbe essere migliorato con analisi suolo
    },
    range
  };
}

/**
 * Prevede rischio malattie
 */
export async function predictDiseaseRisk(
  task: GardenTask,
  masterData: PlantMasterSheet,
  garden: { coordinates?: { latitude: number; longitude: number } },
  currentDate: Date = new Date()
): Promise<DiseaseRiskPrediction> {
  const diseases: DiseaseRiskPrediction['diseases'] = [];
  
  // Ottieni previsioni meteo
  let humidity = 60; // Default
  let temperature = 20; // Default
  let precipitation = 0; // Default
  
  if (garden.coordinates) {
    try {
      const forecast = await getWeatherForecast7Days(
        garden.coordinates.latitude,
        garden.coordinates.longitude
      );
      if (forecast && forecast.length > 0) {
        temperature = forecast.reduce((sum, f) => {
          const tempMax = f.tempMax ?? f.temp ?? 0;
          const tempMin = f.tempMin ?? f.temp ?? 0;
          return sum + (tempMax + tempMin) / 2;
        }, 0) / forecast.length;
        precipitation = forecast.reduce((sum, f) => sum + f.rainForecastMm, 0);
        humidity = precipitation > 10 ? 80 : 60; // Approssimazione
      }
    } catch (error) {
      console.warn('Error fetching weather for disease risk:', error);
    }
  }
  
  // Determina malattie comuni per questa pianta/famiglia
  const plantFamily = masterData.family || 'Unknown';
  const commonDiseases = getCommonDiseasesForFamily(plantFamily);
  
  // Calcola probabilità per ogni malattia
  for (const disease of commonDiseases) {
    let probability = 0.1; // Base probability
    
    // Aumenta probabilità per condizioni favorevoli
    if (disease.conditions.includes('high_humidity') && humidity > 70) {
      probability += 0.3;
    }
    if (disease.conditions.includes('high_precipitation') && precipitation > 20) {
      probability += 0.2;
    }
    if (disease.conditions.includes('warm_temperature') && temperature > 25) {
      probability += 0.15;
    }
    if (disease.conditions.includes('cool_temperature') && temperature < 15) {
      probability += 0.1;
    }
    
    probability = Math.min(1, probability);
    
    if (probability > 0.2) { // Solo malattie con probabilità significativa
      diseases.push({
        name: disease.name,
        probability: Math.round(probability * 100) / 100,
        conditions: disease.conditions,
        prevention: disease.prevention
      });
    }
  }
  
  // Determina livello rischio generale
  const maxProbability = diseases.length > 0 
    ? Math.max(...diseases.map(d => d.probability))
    : 0;
  
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (maxProbability > 0.7) {
    riskLevel = 'critical';
  } else if (maxProbability > 0.5) {
    riskLevel = 'high';
  } else if (maxProbability > 0.3) {
    riskLevel = 'medium';
  }
  
  return {
    riskLevel,
    diseases,
    factors: {
      humidity,
      temperature,
      precipitation,
      plantHealth: 0.8, // Default, potrebbe essere migliorato
      historicalPatterns: false // Potrebbe essere migliorato con storico
    }
  };
}

/**
 * Prevede fabbisogno idrico per i prossimi 7-14 giorni
 */
export async function predictWaterRequirement(
  task: GardenTask,
  masterData: PlantMasterSheet,
  garden: { coordinates?: { latitude: number; longitude: number }; sizeSqMeters?: number },
  currentDate: Date = new Date()
): Promise<WaterRequirementPrediction> {
  const daysActive = calculateDaysActive(task);
  const currentPhase = determineLifecyclePhase(daysActive, masterData, task);
  const areaSqm = garden.sizeSqMeters || 1;
  
  // Fabbisogno base per fase (litri per m² per giorno)
  const baseRequirementPerSqm = getWaterRequirementForPhase(currentPhase, masterData);
  
  // Ottieni previsioni meteo
  let expectedPrecipitation = 0;
  let evapotranspiration = 4; // mm/giorno default
  
  if (garden.coordinates) {
    try {
      const forecast = await getWeatherForecast7Days(
        garden.coordinates.latitude,
        garden.coordinates.longitude
      );
      if (forecast && forecast.length > 0) {
        expectedPrecipitation = forecast.reduce((sum, f) => sum + f.rainForecastMm, 0);
        // Stima evapotranspiration basata su temperatura
        const avgTemp = forecast.reduce((sum, f) => {
          const tempMax = f.tempMax ?? f.temp ?? 0;
          const tempMin = f.tempMin ?? f.temp ?? 0;
          return sum + (tempMax + tempMin) / 2;
        }, 0) / forecast.length;
        evapotranspiration = Math.max(2, Math.min(8, avgTemp / 3)); // Approssimazione
      }
    } catch (error) {
      console.warn('Error fetching weather for water requirement:', error);
    }
  }
  
  // Calcola fabbisogno giornaliero
  const next7Days: WaterRequirementPrediction['next7Days'] = [];
  const next14Days: WaterRequirementPrediction['next14Days'] = [];
  
  for (let i = 0; i < 14; i++) {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + i);
    
    // Fabbisogno giornaliero (litri per m²)
    let dailyRequirementPerSqm = baseRequirementPerSqm;
    
    // Aggiusta per evapotranspiration
    dailyRequirementPerSqm += evapotranspiration * 0.1; // Conversione mm -> litri/m²
    
    // Riduci per precipitazioni previste (solo per primi 7 giorni)
    if (i < 7 && garden.coordinates) {
      try {
        const forecast = await getWeatherForecast7Days(
          garden.coordinates.latitude,
          garden.coordinates.longitude
        );
        if (forecast && forecast[i]) {
          const dailyPrecipitation = forecast[i].rainForecastMm || 0;
          dailyRequirementPerSqm = Math.max(0, dailyRequirementPerSqm - dailyPrecipitation * 0.1);
        }
      } catch (error) {
        // Ignora errori
      }
    }
    
    const totalLiters = dailyRequirementPerSqm * areaSqm;
    
    const dayData = {
      date,
      litersPerSqm: Math.round(dailyRequirementPerSqm * 10) / 10,
      totalLiters: Math.round(totalLiters * 10) / 10,
      reason: getWaterRequirementReason(currentPhase, dailyRequirementPerSqm)
    };
    
    if (i < 7) {
      next7Days.push(dayData);
    }
    next14Days.push(dayData);
  }
  
  const averageDailyRequirement = next7Days.reduce((sum, d) => sum + d.litersPerSqm, 0) / next7Days.length;
  
  return {
    next7Days,
    next14Days,
    averageDailyRequirement: Math.round(averageDailyRequirement * 10) / 10,
    factors: {
      currentSoilMoisture: undefined, // Potrebbe essere migliorato con sensori
      expectedPrecipitation,
      evapotranspiration,
      plantPhase: currentPhase
    }
  };
}

// Helper functions

function getWaterRequirementForPhase(
  phase: string,
  masterData: PlantMasterSheet
): number {
  // Litri per m² per giorno per fase
  const requirements: Record<string, number> = {
    'Sowing': 1,
    'Germination': 1.5,
    'Nursing': 2,
    'Hardening': 2.5,
    'Transplanting': 3,
    'Production': 4
  };
  
  return requirements[phase] || 2;
}

function getWaterRequirementReason(phase: string, requirement: number): string {
  if (phase === 'Production') {
    return 'Fase produzione: alto fabbisogno idrico';
  } else if (phase === 'Germination') {
    return 'Germinazione: mantenere terreno umido';
  } else if (requirement > 3) {
    return 'Alta evapotranspiration prevista';
  }
  return 'Fabbisogno normale per fase crescita';
}

function getCommonDiseasesForFamily(family: string): Array<{
  name: string;
  conditions: string[];
  prevention: string[];
}> {
  const diseases: Record<string, Array<{ name: string; conditions: string[]; prevention: string[] }>> = {
    'Solanaceae': [
      {
        name: 'Peronospora',
        conditions: ['high_humidity', 'high_precipitation', 'cool_temperature'],
        prevention: ['Rotazione colture', 'Spazio tra piante', 'Trattamenti preventivi rame']
      },
      {
        name: 'Alternaria',
        conditions: ['high_humidity', 'warm_temperature'],
        prevention: ['Ventilazione', 'Riduzione umidità', 'Trattamenti preventivi']
      }
    ],
    'Cucurbitaceae': [
      {
        name: 'Oidio',
        conditions: ['high_humidity', 'warm_temperature'],
        prevention: ['Trattamenti zolfo', 'Ventilazione', 'Irrigazione a goccia']
      },
      {
        name: 'Peronospora',
        conditions: ['high_humidity', 'high_precipitation'],
        prevention: ['Rotazione', 'Trattamenti rame']
      }
    ],
    'Brassicaceae': [
      {
        name: 'Ernia del cavolo',
        conditions: ['high_precipitation', 'cool_temperature'],
        prevention: ['Rotazione lunga', 'Drenaggio terreno']
      }
    ]
  };
  
  return diseases[family] || [
    {
      name: 'Malattie fungine generiche',
      conditions: ['high_humidity', 'high_precipitation'],
      prevention: ['Ventilazione', 'Rotazione colture', 'Trattamenti preventivi']
    }
  ];
}

