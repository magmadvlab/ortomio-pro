/**
 * Predictive Analytics Service
 * Previsioni per agricoltura di precisione: data raccolto ottimale, resa, rischio malattie, fabbisogno idrico
 */

import { GardenTask, PlantMasterSheet, HarvestLogData } from '../types';
import { calculateDaysActive } from './taskCalculationService';
import { determineLifecyclePhase } from '../logic/lifecycleEngine';
import { getWeatherForecast7Days } from './weatherService';
import { getSupabaseClient } from '@/config/supabase'
import {
  getPersistedGardenEnvironmentalHistorySummary,
  getPersistedZoneEnvironmentalHistorySummary,
  type GardenEnvironmentalHistorySummary,
  type ZoneEnvironmentalHistorySummary,
} from '@/services/environmentalMonitoringService'

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
    environmentalPressure?: string;
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
    environmentalPressure?: string;
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
    environmentalPressure?: string;
  };
}

type PredictiveEnvironmentalSummary =
  | GardenEnvironmentalHistorySummary
  | ZoneEnvironmentalHistorySummary

type PredictiveGardenContext = {
  id?: string
  user_id?: string
  userId?: string
  ownerId?: string
  coordinates?: { latitude: number; longitude: number }
  sizeSqMeters?: number
}

interface PredictiveEnvironmentalOptions {
  environmentalHistorySummary?: PredictiveEnvironmentalSummary | null
}

function hasPersistentDryStress(summary?: PredictiveEnvironmentalSummary | null): boolean {
  return (
    (summary?.highSoilWaterStressDays || 0) >= 2 ||
    (summary?.deficitWaterBalanceDays || 0) >= 3
  )
}

function hasPersistentWetPressure(summary?: PredictiveEnvironmentalSummary | null): boolean {
  return (
    (summary?.highDiseasePressureDays || 0) >= 2 ||
    (summary?.surplusWaterBalanceDays || 0) >= 2 ||
    (summary?.lowDryingPowerDays || 0) >= 2
  )
}

function describeEnvironmentalPressure(summary?: PredictiveEnvironmentalSummary | null): string | undefined {
  if (!summary) {
    return undefined
  }

  if (hasPersistentDryStress(summary) && hasPersistentWetPressure(summary)) {
    return 'unstable_environment'
  }

  if (hasPersistentDryStress(summary)) {
    return 'persistent_deficit'
  }

  if (hasPersistentWetPressure(summary)) {
    return 'persistent_humidity'
  }

  return summary.entries > 0 ? 'stable_history' : undefined
}

async function resolveGardenOwnerId(garden: PredictiveGardenContext): Promise<string | null> {
  const directCandidate = garden.user_id || garden.userId || garden.ownerId
  if (directCandidate) {
    return directCandidate
  }

  if (!garden.id) {
    return null
  }

  const supabase = getSupabaseClient()
  if (!supabase) {
    return null
  }

  const { data } = await supabase
    .from('gardens')
    .select('user_id')
    .eq('id', garden.id)
    .maybeSingle()

  return typeof data?.user_id === 'string' ? data.user_id : null
}

async function getPredictiveEnvironmentalSummary(
  task: GardenTask,
  garden: PredictiveGardenContext,
  currentDate: Date,
  override?: PredictiveEnvironmentalSummary | null
): Promise<PredictiveEnvironmentalSummary | null> {
  if (override !== undefined) {
    return override
  }

  if (!garden.id) {
    return null
  }

  const userId = await resolveGardenOwnerId(garden)
  if (!userId) {
    return null
  }

  const endDate = currentDate.toISOString().split('T')[0]
  const startDate = new Date(currentDate)
  startDate.setDate(startDate.getDate() - 6)
  const startDateStr = startDate.toISOString().split('T')[0]

  if (task.zoneId) {
    const zoneSummary = await getPersistedZoneEnvironmentalHistorySummary({
      userId,
      gardenId: garden.id,
      zoneId: task.zoneId,
      startDate: startDateStr,
      endDate,
    }).catch(() => null)

    if (zoneSummary) {
      return zoneSummary
    }
  }

  return getPersistedGardenEnvironmentalHistorySummary({
    userId,
    gardenId: garden.id,
    startDate: startDateStr,
    endDate,
  }).catch(() => null)
}

/**
 * Prevede data raccolto ottimale per un task
 */
export async function predictOptimalHarvestDate(
  task: GardenTask,
  masterData: PlantMasterSheet,
  garden: PredictiveGardenContext,
  currentDate: Date = new Date(),
  options: PredictiveEnvironmentalOptions = {}
): Promise<HarvestPrediction> {
  const daysActive = calculateDaysActive(task);
  const currentPhase = determineLifecyclePhase(daysActive, masterData, task);
  const environmentalSummary = await getPredictiveEnvironmentalSummary(
    task,
    garden,
    currentDate,
    options.environmentalHistorySummary
  )
  
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

  if (hasPersistentWetPressure(environmentalSummary)) {
    weatherImpact = 'persistent_humidity'
  } else if (hasPersistentDryStress(environmentalSummary) && weatherImpact !== 'unfavorable') {
    weatherImpact = 'dry_window'
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
  } else if (weatherImpact === 'persistent_humidity' || weatherImpact === 'unfavorable') {
    baseHarvestDate.setDate(baseHarvestDate.getDate() + 3);
  } else if (weatherImpact === 'dry_window') {
    baseHarvestDate.setDate(baseHarvestDate.getDate() - 1);
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
  if (environmentalSummary) {
    confidence = Math.min(0.92, confidence + 0.03)
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
  garden: PredictiveGardenContext,
  historicalHarvests: HarvestLogData[],
  currentDate: Date = new Date(),
  options: PredictiveEnvironmentalOptions = {}
): Promise<YieldPrediction> {
  const daysActive = calculateDaysActive(task);
  const currentPhase = determineLifecyclePhase(daysActive, masterData, task);
  const environmentalSummary = await getPredictiveEnvironmentalSummary(
    task,
    garden,
    currentDate,
    options.environmentalHistorySummary
  )
  
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
  const environmentalPressure = describeEnvironmentalPressure(environmentalSummary)
  
  // Determina crescita basata su fase e giorni
  // TODO: Integrare analisi foto per determinare crescita reale
  const expectedDaysToMaturity = 90; // Default, potrebbe essere calcolato da harvestWindow
  if (currentPhase === 'Production' && daysActive < expectedDaysToMaturity * 0.7) {
    growthRate = 'fast';
  } else if (currentPhase !== 'Production' && daysActive > expectedDaysToMaturity * 0.8) {
    growthRate = 'slow';
  }

  if (hasPersistentDryStress(environmentalSummary)) {
    healthScore -= 0.12
    if (growthRate === 'normal') {
      growthRate = 'slow'
    }
  } else if (hasPersistentWetPressure(environmentalSummary)) {
    healthScore -= 0.08
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
  
  // Confidence
  let confidence = 0.6;
  if (historicalAverage) confidence = 0.75;
  if (currentPhase === 'Production') confidence = 0.8;
  if (environmentalSummary) confidence = Math.min(0.88, confidence + 0.05)

  const spreadMultiplier = hasPersistentDryStress(environmentalSummary) || hasPersistentWetPressure(environmentalSummary)
    ? 0.25
    : 0.2
  
  return {
    predictedYieldKg: Math.round(predictedYield * 10) / 10,
    predictedYieldPerSqm: Math.round(predictedYieldPerSqm * 10) / 10,
    confidence,
    factors: {
      historicalAverage,
      currentGrowthRate: growthRate,
      healthScore: Number(healthScore.toFixed(2)),
      weatherConditions: environmentalPressure || 'normal',
      fertilizationLevel: 'medium', // Potrebbe essere migliorato con analisi suolo
      environmentalPressure,
    },
    range: {
      min: predictedYield * (1 - spreadMultiplier),
      max: predictedYield * (1 + spreadMultiplier),
    }
  };
}

/**
 * Prevede rischio malattie
 */
export async function predictDiseaseRisk(
  task: GardenTask,
  masterData: PlantMasterSheet,
  garden: PredictiveGardenContext,
  currentDate: Date = new Date(),
  options: PredictiveEnvironmentalOptions = {}
): Promise<DiseaseRiskPrediction> {
  const diseases: DiseaseRiskPrediction['diseases'] = [];
  const environmentalSummary = await getPredictiveEnvironmentalSummary(
    task,
    garden,
    currentDate,
    options.environmentalHistorySummary
  )
  
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

  const environmentalPressure = describeEnvironmentalPressure(environmentalSummary)
  const historicalPatterns = hasPersistentWetPressure(environmentalSummary)
  if (historicalPatterns) {
    humidity = Math.max(humidity, 82)
    precipitation += 8
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
    if (historicalPatterns) {
      probability += 0.15
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
      historicalPatterns,
      environmentalPressure,
    }
  };
}

/**
 * Prevede fabbisogno idrico per i prossimi 7-14 giorni
 */
export async function predictWaterRequirement(
  task: GardenTask,
  masterData: PlantMasterSheet,
  garden: PredictiveGardenContext,
  currentDate: Date = new Date(),
  options: PredictiveEnvironmentalOptions = {}
): Promise<WaterRequirementPrediction> {
  const daysActive = calculateDaysActive(task);
  const currentPhase = determineLifecyclePhase(daysActive, masterData, task);
  const areaSqm = garden.sizeSqMeters || 1;
  const environmentalSummary = await getPredictiveEnvironmentalSummary(
    task,
    garden,
    currentDate,
    options.environmentalHistorySummary
  )
  
  // Fabbisogno base per fase (litri per m² per giorno)
  const baseRequirementPerSqm = getWaterRequirementForPhase(currentPhase, masterData);
  
  // Ottieni previsioni meteo
  let expectedPrecipitation = 0;
  let evapotranspiration = 4; // mm/giorno default
  let forecast: Awaited<ReturnType<typeof getWeatherForecast7Days>> = []
  
  if (garden.coordinates) {
    try {
      forecast = await getWeatherForecast7Days(
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

  const environmentalPressure = describeEnvironmentalPressure(environmentalSummary)
  const persistentDryStress = hasPersistentDryStress(environmentalSummary)
  const persistentWetPressure = hasPersistentWetPressure(environmentalSummary)
  const environmentalMultiplier = persistentDryStress ? 1.18 : persistentWetPressure ? 0.82 : 1
  
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
    dailyRequirementPerSqm *= environmentalMultiplier
    
    // Riduci per precipitazioni previste (solo per primi 7 giorni)
    if (i < 7 && forecast[i]) {
      const dailyPrecipitation = forecast[i].rainForecastMm || 0;
      dailyRequirementPerSqm = Math.max(0, dailyRequirementPerSqm - dailyPrecipitation * 0.1);
      if (persistentDryStress && dailyPrecipitation > 0 && dailyPrecipitation < 10) {
        dailyRequirementPerSqm += 0.3
      }
      if (persistentWetPressure && dailyPrecipitation > 5) {
        dailyRequirementPerSqm = Math.max(0, dailyRequirementPerSqm - 0.4)
      }
    }
    
    const totalLiters = dailyRequirementPerSqm * areaSqm;
    
    const dayData = {
      date,
      litersPerSqm: Math.round(dailyRequirementPerSqm * 10) / 10,
      totalLiters: Math.round(totalLiters * 10) / 10,
      reason: getWaterRequirementReason(currentPhase, dailyRequirementPerSqm, environmentalPressure)
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
      plantPhase: currentPhase,
      environmentalPressure,
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

function getWaterRequirementReason(
  phase: string,
  requirement: number,
  environmentalPressure?: string
): string {
  const suffix =
    environmentalPressure === 'persistent_deficit'
      ? ' con memoria recente di deficit idrico'
      : environmentalPressure === 'persistent_humidity'
        ? ' con suolo ancora influenzato da umidita persistente'
        : ''
  if (phase === 'Production') {
    return `Fase produzione: alto fabbisogno idrico${suffix}`;
  } else if (phase === 'Germination') {
    return `Germinazione: mantenere terreno umido${suffix}`;
  } else if (requirement > 3) {
    return `Alta evapotranspiration prevista${suffix}`;
  }
  return `Fabbisogno normale per fase crescita${suffix}`;
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
