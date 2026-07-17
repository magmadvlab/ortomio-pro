/**
 * Rain Management System
 * Calcola acqua piovana effettiva e gestisce skip irrigazione basato su precipitazioni
 */

import { Garden, GardenTask } from '../types';
import { WeatherForecast } from '../services/weatherService';

export interface RainEvent {
  date: string;
  precipitationMM: number;
  duration: number; // minuti
  intensity: 'light' | 'moderate' | 'heavy';
}

export interface EffectiveRainResult {
  totalRainfall: number; // mm totali
  effectiveWater: number; // mm effettivamente assorbiti
  irrigationSkipDays: number; // Giorni da saltare irrigazione
  message: string;
}

export interface TaskAdjustment {
  action: 'PROCEED' | 'REDUCE' | 'CANCEL' | 'SKIP';
  message: string;
  adjustedDuration?: number; // Minuti ridotti (se REDUCE)
  nextScheduledDate?: Date; // Nuova data (se CANCEL/SKIP)
}

/** Meteo applicato direttamente a una necessità irrigua, senza task fittizi. */
export const adjustIrrigationNeedForRain = (
  plannedDurationMinutes: number,
  plannedDate: string,
  weatherHistory: WeatherForecast[],
  garden: Garden
): TaskAdjustment => {
  const recentRain: RainEvent[] = weatherHistory
    .slice(0, 3)
    .filter((forecast) => (forecast.rainForecastMm ?? forecast.rainMm ?? 0) > 0)
    .map((forecast) => ({
      date: forecast.date || plannedDate,
      precipitationMM: forecast.rainForecastMm ?? forecast.rainMm ?? 0,
      duration: 60,
      intensity: (forecast.rainForecastMm ?? forecast.rainMm ?? 0) > 10
        ? 'heavy'
        : (forecast.rainForecastMm ?? forecast.rainMm ?? 0) > 5
        ? 'moderate'
        : 'light',
    }))
  if (recentRain.length === 0) return { action: 'PROCEED', message: 'Nessuna pioggia recente. Irrigazione normale.' }

  const rainResult = calculateEffectiveRain(recentRain, garden.soilType)
  if (rainResult.effectiveWater > 20) {
    const nextDate = new Date(plannedDate)
    nextDate.setDate(nextDate.getDate() + rainResult.irrigationSkipDays)
    return { action: 'CANCEL', message: rainResult.message, nextScheduledDate: nextDate }
  }
  if (rainResult.effectiveWater > 10) {
    return {
      action: 'REDUCE',
      message: rainResult.message,
      adjustedDuration: Math.round(plannedDurationMinutes * 0.5),
    }
  }
  return { action: 'PROCEED', message: rainResult.message }
}

/**
 * Calcola l'acqua piovana effettivamente assorbita dal terreno
 * Considera il tipo di terreno e la capacità di assorbimento
 */
export const calculateEffectiveRain = (
  rainEvents: RainEvent[],
  soilType: Garden['soilType'] = 'Loamy'
): EffectiveRainResult => {
  const totalMM = rainEvents.reduce((sum, e) => sum + e.precipitationMM, 0);

  // Fattore assorbimento per tipo terreno
  // Valori basati su capacità di campo e punto di appassimento
  const absorption: Record<string, number> = {
    'Sandy': 0.5,   // 50% assorbito, 50% scorre via (drenaggio rapido)
    'Loamy': 0.8,   // 80% assorbito (ideale)
    'Clay': 0.6,    // 60% assorbito (ristagno possibile)
    'Peaty': 0.9,   // 90% assorbito (alta ritenzione)
    'Chalky': 0.4,  // 40% assorbito (drenaggio molto rapido)
    'Silty': 0.75,  // 75% assorbito
  };

  const absorptionFactor = absorption[soilType] || 0.7; // Default 70%
  const effectiveMM = totalMM * absorptionFactor;

  // Calcola giorni di skip irrigazione
  // Assumiamo ~5mm di acqua = 1 giorno di irrigazione standard
  const irrigationSkipDays = Math.floor(effectiveMM / 5);

  let message = '';
  if (effectiveMM > 20) {
    message = `☔ Piogge abbondanti (${totalMM.toFixed(1)}mm totali, ${effectiveMM.toFixed(1)}mm effettivi). Sospendi irrigazione per ${irrigationSkipDays} giorni.`;
  } else if (effectiveMM > 10) {
    message = `🌧️ Pioggia moderata (${totalMM.toFixed(1)}mm totali, ${effectiveMM.toFixed(1)}mm effettivi). Riduci irrigazione del 50% per ${irrigationSkipDays} giorni.`;
  } else if (effectiveMM > 5) {
    message = `🌦️ Pioggia leggera (${totalMM.toFixed(1)}mm totali, ${effectiveMM.toFixed(1)}mm effettivi). Irrigazione parziale sufficiente.`;
  } else {
    message = `💧 Pioggia minima (${totalMM.toFixed(1)}mm). Irrigazione normale.`;
  }

  return {
    totalRainfall: totalMM,
    effectiveWater: effectiveMM,
    irrigationSkipDays,
    message,
  };
};

/**
 * Aggiusta un task di irrigazione in base alle precipitazioni recenti
 * Integrazione con Director Engine
 */
export const adjustIrrigationForRain = (
  scheduledTask: GardenTask,
  weatherHistory: WeatherForecast[],
  garden: Garden
): TaskAdjustment => {
  return adjustIrrigationNeedForRain(
    scheduledTask.durationMinutes ?? 0,
    scheduledTask.date,
    weatherHistory,
    garden
  )
};

/**
 * Converte WeatherForecast in RainEvent per calcoli
 */
export const forecastToRainEvent = (forecast: WeatherForecast): RainEvent | null => {
  const rainAmount = forecast.rainForecastMm ?? forecast.rainMm ?? 0;

  if (rainAmount <= 0) {
    return null;
  }

  return {
    date: forecast.date || new Date().toISOString().split('T')[0],
    precipitationMM: rainAmount,
    duration: 60, // Stima default
    intensity: rainAmount > 10 ? 'heavy' : rainAmount > 5 ? 'moderate' : 'light',
  };
};
