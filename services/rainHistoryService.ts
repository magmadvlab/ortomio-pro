/**
 * Rain History Service
 * Gestisce storico e aggregazione delle precipitazioni
 */

import { WeatherForecast } from './weatherService';
import { RainEvent, calculateEffectiveRain } from '../logic/rainManager';
import { Garden } from '../types';

export interface RainHistoryDay {
  date: string;
  precipitationMM: number;
  effectiveWaterMM: number;
  intensity: 'light' | 'moderate' | 'heavy';
}

export interface RainHistorySummary {
  totalDays: number;
  totalRainfall: number;
  totalEffectiveWater: number;
  averageDaily: number;
  days: RainHistoryDay[];
  lastRainDate?: string;
  daysSinceLastRain: number;
}

/**
 * Aggrega storico precipitazioni da previsioni meteo
 */
export const aggregateRainHistory = (
  forecasts: WeatherForecast[],
  garden: Garden,
  days: number = 7
): RainHistorySummary => {
  const recentForecasts = forecasts.slice(0, days);
  
  const rainDays: RainHistoryDay[] = recentForecasts
    .filter(f => f.rainMm > 0)
    .map(f => {
      const rainEvent: RainEvent = {
        date: f.date || new Date().toISOString().split('T')[0],
        precipitationMM: f.rainMm,
        duration: 60,
        intensity: f.rainMm > 10 ? 'heavy' : f.rainMm > 5 ? 'moderate' : 'light',
      };

      const effective = calculateEffectiveRain([rainEvent], garden.soilType);

      return {
        date: rainEvent.date,
        precipitationMM: f.rainMm,
        effectiveWaterMM: effective.effectiveWater,
        intensity: rainEvent.intensity,
      };
    });

  const totalRainfall = rainDays.reduce((sum, d) => sum + d.precipitationMM, 0);
  const totalEffectiveWater = rainDays.reduce((sum, d) => sum + d.effectiveWaterMM, 0);
  const averageDaily = rainDays.length > 0 ? totalRainfall / rainDays.length : 0;

  // Calcola giorni dall'ultima pioggia
  const lastRainDate = rainDays.length > 0 
    ? rainDays[rainDays.length - 1].date 
    : undefined;
  
  const daysSinceLastRain = lastRainDate
    ? Math.floor((new Date().getTime() - new Date(lastRainDate).getTime()) / (1000 * 60 * 60 * 24))
    : days; // Se non c'è pioggia, usa il numero di giorni analizzati

  return {
    totalDays: days,
    totalRainfall,
    totalEffectiveWater,
    averageDaily,
    days: rainDays,
    lastRainDate,
    daysSinceLastRain,
  };
};

/**
 * Verifica se l'irrigazione dovrebbe essere saltata basandosi sullo storico
 */
export const shouldSkipIrrigation = (
  history: RainHistorySummary,
  thresholdMM: number = 20
): { skip: boolean; reason: string } => {
  if (history.totalEffectiveWater >= thresholdMM) {
    return {
      skip: true,
      reason: `Pioggia abbondante negli ultimi ${history.totalDays} giorni (${history.totalEffectiveWater.toFixed(1)}mm effettivi). Irrigazione non necessaria.`,
    };
  }

  if (history.daysSinceLastRain < 2 && history.totalEffectiveWater > 10) {
    return {
      skip: true,
      reason: `Pioggia recente (${history.totalEffectiveWater.toFixed(1)}mm effettivi). Sospendi irrigazione per oggi.`,
    };
  }

  return {
    skip: false,
    reason: 'Nessuna pioggia significativa. Irrigazione necessaria.',
  };
};
