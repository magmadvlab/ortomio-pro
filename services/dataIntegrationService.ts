/**
 * Data Integration Service
 * Aggrega dati da multiple sorgenti per analisi avanzate
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { GardenTask, Garden, HarvestLogData } from '../types';
import { getVegetationIndicesByTask } from './vegetationIndexService';
import { getLatestSoilAnalysis } from './soilAnalysisService';
import { getWeatherForecast7Days } from './weatherService';
import { calculateHarvestAnalytics } from '../logic/harvestAnalyticsEngine';

export interface IntegratedData {
  taskId: string;
  plantName: string;
  timestamp: Date;
  
  // Dati sensori (simulati)
  sensorData?: {
    soilMoisture?: number;
    temperature?: number;
    humidity?: number;
    ec?: number;
    ph?: number;
  };
  
  // Dati meteo
  weatherData?: {
    temperature: number;
    precipitation: number;
    humidity: number;
    forecast: any[];
  };
  
  // Analisi foto
  photoAnalysis?: {
    healthScore: number;
    growthRate: 'slow' | 'normal' | 'fast';
    issues: string[];
  };
  
  // Indicatori vegetativi
  vegetationIndices?: {
    ndvi?: number;
    evi?: number;
    lai?: number;
    chlorophyllIndex?: number;
  };
  
  // Analisi suolo
  soilAnalysis?: {
    ph?: number;
    nitrogenN?: number;
    phosphorusP?: number;
    potassiumK?: number;
  };
  
  // Storico raccolti
  harvestHistory?: {
    totalKg: number;
    averageYield: number;
    lastHarvestDate?: Date;
  };
  
  // Task history
  taskHistory?: {
    completedTasks: number;
    pendingTasks: number;
    lastIrrigation?: Date;
    lastFertilization?: Date;
  };
}

export interface DataCorrelation {
  factor1: string;
  factor2: string;
  correlation: number; // -1 to 1
  strength: 'weak' | 'moderate' | 'strong';
  interpretation: string;
}

/**
 * Aggrega dati da tutte le sorgenti per un task
 */
export async function aggregateTaskData(
  supabase: SupabaseClient,
  task: GardenTask,
  garden: Garden
): Promise<IntegratedData> {
  const integrated: IntegratedData = {
    taskId: task.id,
    plantName: task.plantName,
    timestamp: new Date()
  };
  
  // Indicatori vegetativi
  try {
    const indices = await getVegetationIndicesByTask(supabase, task.id);
    if (indices.length > 0) {
      const latest = indices[indices.length - 1];
      integrated.vegetationIndices = {
        ndvi: latest.ndvi,
        evi: latest.evi,
        lai: latest.lai,
        chlorophyllIndex: latest.chlorophyllIndex
      };
    }
  } catch (error) {
    console.warn('Error fetching vegetation indices:', error);
  }
  
  // Analisi suolo (se zona disponibile)
  if (task.zoneId) {
    try {
      const soilAnalysis = await getLatestSoilAnalysis(supabase, task.zoneId, garden.id);
      if (soilAnalysis) {
        integrated.soilAnalysis = {
          ph: soilAnalysis.ph,
          nitrogenN: soilAnalysis.nitrogenN,
          phosphorusP: soilAnalysis.phosphorusP,
          potassiumK: soilAnalysis.potassiumK
        };
      }
    } catch (error) {
      console.warn('Error fetching soil analysis:', error);
    }
  }
  
  // Dati meteo
  if (garden.coordinates) {
    try {
      const forecast = await getWeatherForecast7Days(
        garden.coordinates.latitude,
        garden.coordinates.longitude
      );
      if (forecast && forecast.length > 0) {
        const avgTemp = forecast.reduce((sum, f) => sum + (f.tempMax || f.temp || 0 + f.tempMin || 0) / 2, 0) / forecast.length;
        const totalPrecipitation = forecast.reduce((sum, f) => sum + (f.rainForecastMm || 0), 0);
        
        integrated.weatherData = {
          temperature: avgTemp,
          precipitation: totalPrecipitation,
          humidity: 60, // Default
          forecast
        };
      }
    } catch (error) {
      console.warn('Error fetching weather data:', error);
    }
  }
  
  return integrated;
}

/**
 * Trova correlazioni tra fattori
 */
export function findCorrelations(
  data: IntegratedData[]
): DataCorrelation[] {
  const correlations: DataCorrelation[] = [];
  
  // Esempio correlazioni comuni
  // Crescita vs Irrigazione
  if (data.some(d => d.vegetationIndices?.ndvi && d.sensorData?.soilMoisture)) {
    correlations.push({
      factor1: 'NDVI',
      factor2: 'Umidità Suolo',
      correlation: 0.7,
      strength: 'strong',
      interpretation: 'Alta correlazione positiva: umidità suolo influisce sulla crescita vegetativa'
    });
  }
  
  // Resa vs Fertilizzazione
  if (data.some(d => d.harvestHistory && d.soilAnalysis?.nitrogenN)) {
    correlations.push({
      factor1: 'Resa',
      factor2: 'Azoto Suolo',
      correlation: 0.6,
      strength: 'moderate',
      interpretation: 'Correlazione moderata: azoto disponibile influisce sulla resa'
    });
  }
  
  // Malattie vs Condizioni Meteo
  if (data.some(d => d.weatherData && d.photoAnalysis?.issues)) {
    correlations.push({
      factor1: 'Problemi Pianta',
      factor2: 'Umidità Meteo',
      correlation: 0.5,
      strength: 'moderate',
      interpretation: 'Umidità elevata può favorire sviluppo malattie fungine'
    });
  }
  
  return correlations;
}

/**
 * Genera insights automatici dai dati aggregati
 */
export function generateInsights(data: IntegratedData): string[] {
  const insights: string[] = [];
  
  // Analisi crescita
  if (data.vegetationIndices?.ndvi && data.vegetationIndices.ndvi < 0.3) {
    insights.push('NDVI basso: vegetazione potrebbe essere stressata. Verifica irrigazione e nutrienti.');
  }
  
  // Analisi suolo
  if (data.soilAnalysis) {
    if (data.soilAnalysis.ph && data.soilAnalysis.ph < 6.0) {
      insights.push('pH suolo basso: considera correzione pH per migliorare disponibilità nutrienti.');
    }
    if (data.soilAnalysis.nitrogenN && data.soilAnalysis.nitrogenN < 15) {
      insights.push('Carenza azoto rilevata: considera fertilizzazione azotata.');
    }
  }
  
  // Analisi meteo
  if (data.weatherData) {
    if (data.weatherData.precipitation > 50) {
      insights.push('Precipitazioni elevate previste: riduci irrigazione e monitora malattie fungine.');
    }
    if (data.weatherData.temperature > 30) {
      insights.push('Temperature elevate: aumenta frequenza irrigazione e considera ombreggiamento.');
    }
  }
  
  // Analisi salute
  if (data.photoAnalysis) {
    if (data.photoAnalysis.healthScore < 0.7) {
      insights.push('Salute pianta compromessa: verifica problemi rilevati e agisci prontamente.');
    }
    if (data.photoAnalysis.growthRate === 'slow') {
      insights.push('Crescita lenta: verifica condizioni ambientali e nutrienti.');
    }
  }
  
  return insights;
}

