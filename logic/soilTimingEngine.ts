/**
 * Soil Timing Engine
 * Calcola timing ottimale per lavorazioni terreno ("terreno in tempera")
 */

import { Garden } from '../types';
import { getWeatherForecast } from '../services/weatherService';

export interface TemperaWindow {
  startDate: Date;
  endDate: Date;
  confidence: number; // 0-1
  reason: string;
}

/**
 * Calcola quando terreno sarà in tempera
 */
export async function calculateTemperaDate(
  garden: Garden,
  lastRainDate: Date,
  lastRainAmount: number // mm
): Promise<Date> {
  if (!garden.coordinates) {
    throw new Error('Coordinate giardino non disponibili');
  }

  // Recupera previsioni meteo
  const forecast = await getWeatherForecast(garden.coordinates.latitude, garden.coordinates.longitude);

  // Calcola giorni necessari in base a tipo terreno
  let requiredDays = 3; // Default
  if (garden.soilType === 'Clay') {
    requiredDays = 5; // Terreno argilloso: più lento a drenare
  } else if (garden.soilType === 'Sandy') {
    requiredDays = 1; // Terreno sabbioso: drena velocemente
  }

  // Aggiusta in base a quantità pioggia
  if (lastRainAmount > 50) {
    requiredDays += 1; // Pioggia abbondante: più tempo necessario
  }

  // Verifica previsioni: se piove ancora, aggiungi giorni
  if (forecast?.precipitation && forecast.precipitation > 5) {
    requiredDays += 1;
  }

  const temperaDate = new Date(lastRainDate);
  temperaDate.setDate(temperaDate.getDate() + requiredDays);

  return temperaDate;
}

/**
 * Verifica se terreno è in tempera
 */
export async function isSoilInTempera(
  garden: Garden,
  currentConditions: {
    lastRainDate?: Date;
    lastRainAmount?: number;
    currentTemp?: number;
  }
): Promise<{ isTempera: boolean; reason: string }> {
  if (!garden.coordinates) {
    return { isTempera: false, reason: 'Coordinate non disponibili' };
  }

  // Verifica temperatura
  if (currentConditions.currentTemp !== undefined && currentConditions.currentTemp < 0) {
    return { isTempera: false, reason: 'Terreno ghiacciato' };
  }

  // Verifica pioggia recente
  if (currentConditions.lastRainDate && currentConditions.lastRainAmount) {
    const daysSinceRain = Math.ceil(
      (new Date().getTime() - currentConditions.lastRainDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    let requiredDays = 3;
    if (garden.soilType === 'Clay') requiredDays = 5;
    else if (garden.soilType === 'Sandy') requiredDays = 1;

    if (daysSinceRain < requiredDays && currentConditions.lastRainAmount > 10) {
      return {
        isTempera: false,
        reason: `Terreno ancora umido. Aspetta ${requiredDays - daysSinceRain} giorni.`,
      };
    }
  }

  return { isTempera: true, reason: 'Terreno in tempera, pronto per lavorazione' };
}

/**
 * Ottiene finestra ottimale per lavorare
 */
export async function getOptimalWorkWindow(
  garden: Garden,
  lastRainDate: Date,
  lastRainAmount: number
): Promise<TemperaWindow> {
  const startDate = await calculateTemperaDate(garden, lastRainDate, lastRainAmount);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 3); // Finestra di 3 giorni

  // Verifica previsioni meteo per confidence
  let confidence = 0.8;
  if (garden.coordinates) {
    try {
      const forecast = await getWeatherForecast(garden.coordinates.latitude, garden.coordinates.longitude);
      if (forecast?.precipitation && forecast.precipitation > 10) {
        confidence = 0.5; // Pioggia prevista riduce confidence
      }
    } catch (error) {
      // Ignora errori meteo
    }
  }

  return {
    startDate,
    endDate,
    confidence,
    reason: `Terreno sarà in tempera tra ${startDate.toLocaleDateString('it-IT')} e ${endDate.toLocaleDateString('it-IT')}`,
  };
}

