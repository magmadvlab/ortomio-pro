/**
 * Yield Model Service
 * Modelli predittivi avanzati per resa e ottimizzazione economica
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { GardenTask, PlantMasterSheet, HarvestLogData } from '../types';
import { predictYield } from './predictiveAnalyticsService';
import { getMasterSheetSync } from './plantMasterService';
import { calculateHarvestAnalytics } from '../logic/harvestAnalyticsEngine';

export interface YieldModel {
  taskId: string;
  predictedYieldKg: number;
  predictedYieldPerSqm: number;
  confidence: number;
  factors: {
    historicalAverage?: number;
    currentGrowthRate: 'slow' | 'normal' | 'fast';
    healthScore: number;
    weatherConditions: string;
    fertilizationLevel: 'low' | 'medium' | 'high';
    soilQuality?: number;
  };
  range: {
    min: number;
    max: number;
  };
}

export interface YieldOptimization {
  taskId: string;
  currentPrediction: YieldModel;
  optimizedPrediction: YieldModel;
  recommendations: Array<{
    action: string;
    expectedImpact: string;
    cost?: number;
    roi?: number;
  }>;
}

export interface SeasonalYieldForecast {
  season: 'Summer' | 'Winter';
  year: number;
  totalPredictedYield: number;
  byPlant: Array<{
    plantName: string;
    predictedYield: number;
    confidence: number;
  }>;
  byZone?: Array<{
    zoneId: string;
    zoneName: string;
    predictedYield: number;
  }>;
}

/**
 * Calcola modello predittivo resa per una pianta
 */
export async function calculateYieldModel(
  task: GardenTask,
  masterData: PlantMasterSheet,
  garden: { sizeSqMeters?: number },
  historicalHarvests: HarvestLogData[]
): Promise<YieldModel> {
  const yieldPrediction = await predictYield(task, masterData, garden, historicalHarvests);
  
  return {
    taskId: task.id,
    predictedYieldKg: yieldPrediction.predictedYieldKg,
    predictedYieldPerSqm: yieldPrediction.predictedYieldPerSqm,
    confidence: yieldPrediction.confidence,
    factors: yieldPrediction.factors,
    range: yieldPrediction.range
  };
}

/**
 * Ottimizza resa con suggerimenti di miglioramento
 */
export async function optimizeYield(
  task: GardenTask,
  masterData: PlantMasterSheet,
  garden: { sizeSqMeters?: number },
  historicalHarvests: HarvestLogData[]
): Promise<YieldOptimization> {
  const currentPrediction = await calculateYieldModel(task, masterData, garden, historicalHarvests);
  
  // Simula ottimizzazione con migliori pratiche
  const optimizedFactors = { ...currentPrediction.factors };
  optimizedFactors.fertilizationLevel = 'high';
  optimizedFactors.healthScore = 0.95;
  optimizedFactors.currentGrowthRate = 'fast';
  
  // Calcola resa ottimizzata
  const optimizedYield = currentPrediction.predictedYieldKg * 1.2; // +20% con ottimizzazione
  const optimizedYieldPerSqm = currentPrediction.predictedYieldPerSqm * 1.2;
  
  const optimizedPrediction: YieldModel = {
    ...currentPrediction,
    predictedYieldKg: Math.round(optimizedYield * 10) / 10,
    predictedYieldPerSqm: Math.round(optimizedYieldPerSqm * 10) / 10,
    factors: optimizedFactors,
    range: {
      min: optimizedYield * 0.8,
      max: optimizedYield * 1.2
    }
  };
  
  // Genera raccomandazioni
  const recommendations: YieldOptimization['recommendations'] = [];
  
  if (currentPrediction.factors.fertilizationLevel !== 'high') {
    recommendations.push({
      action: 'Aumenta fertilizzazione',
      expectedImpact: `+${Math.round((optimizedYield - currentPrediction.predictedYieldKg) * 0.3)} kg`,
      cost: 15,
      roi: 2.5
    });
  }
  
  if (currentPrediction.factors.healthScore < 0.9) {
    recommendations.push({
      action: 'Migliora salute pianta (trattamenti preventivi)',
      expectedImpact: `+${Math.round((optimizedYield - currentPrediction.predictedYieldKg) * 0.2)} kg`,
      cost: 10,
      roi: 3.0
    });
  }
  
  return {
    taskId: task.id,
    currentPrediction,
    optimizedPrediction,
    recommendations
  };
}

/**
 * Prevede resa stagionale per un giardino
 */
export async function forecastSeasonalYield(
  tasks: GardenTask[],
  garden: { sizeSqMeters?: number },
  historicalHarvests: HarvestLogData[],
  season: 'Summer' | 'Winter',
  year: number
): Promise<SeasonalYieldForecast> {
  const seasonTasks = tasks.filter(task => {
    const taskDate = new Date(task.date);
    const taskMonth = taskDate.getMonth() + 1;
    const isSummerTask = taskMonth >= 5 && taskMonth <= 8;
    return season === 'Summer' ? isSummerTask : !isSummerTask;
  });
  
  const byPlant: SeasonalYieldForecast['byPlant'] = [];
  let totalPredictedYield = 0;
  
  for (const task of seasonTasks) {
    const masterData = getMasterSheetSync(task.plantName);
    if (!masterData) continue;
    
    const yieldModel = await calculateYieldModel(task, masterData, garden, historicalHarvests);
    
    byPlant.push({
      plantName: task.plantName,
      predictedYield: yieldModel.predictedYieldKg,
      confidence: yieldModel.confidence
    });
    
    totalPredictedYield += yieldModel.predictedYieldKg;
  }
  
  return {
    season,
    year,
    totalPredictedYield: Math.round(totalPredictedYield * 10) / 10,
    byPlant
  };
}

/**
 * Calcola ROI per fertilizzazione
 */
export function calculateFertilizationROI(
  currentYield: number,
  optimizedYield: number,
  fertilizationCost: number,
  marketPricePerKg: number
): {
  additionalYield: number;
  additionalRevenue: number;
  netProfit: number;
  roi: number;
} {
  const additionalYield = optimizedYield - currentYield;
  const additionalRevenue = additionalYield * marketPricePerKg;
  const netProfit = additionalRevenue - fertilizationCost;
  const roi = fertilizationCost > 0 ? (netProfit / fertilizationCost) * 100 : 0;
  
  return {
    additionalYield: Math.round(additionalYield * 10) / 10,
    additionalRevenue: Math.round(additionalRevenue * 10) / 10,
    netProfit: Math.round(netProfit * 10) / 10,
    roi: Math.round(roi * 10) / 10
  };
}

/**
 * Trova timing ottimale raccolto per massimizzare resa
 */
export function findOptimalHarvestTiming(
  currentYield: number,
  daysToMaturity: number,
  currentDays: number
): {
  optimalDays: number;
  expectedYieldAtOptimal: number;
  reason: string;
} {
  const daysRemaining = daysToMaturity - currentDays;
  
  // Timing ottimale è generalmente 2-3 giorni prima della maturità completa
  // per evitare sovramaturazione
  const optimalDays = Math.max(0, daysRemaining - 3);
  
  // Resa aumenta fino a maturità, poi diminuisce leggermente
  const yieldMultiplier = daysRemaining > 0 
    ? 1 + (daysRemaining / daysToMaturity) * 0.1
    : 0.95; // -5% se sovramaturo
  
  const expectedYieldAtOptimal = currentYield * yieldMultiplier;
  
  return {
    optimalDays,
    expectedYieldAtOptimal: Math.round(expectedYieldAtOptimal * 10) / 10,
    reason: daysRemaining > 3 
      ? `Raccogli tra ${optimalDays} giorni per massimizzare resa`
      : 'Raccogli presto per evitare sovramaturazione'
  };
}

