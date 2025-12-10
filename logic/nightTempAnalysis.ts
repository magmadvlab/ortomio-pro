/**
 * Night Temperature Analysis
 * Analizza temperature minime notturne per decisioni trapianto
 */

import { PlantMasterSheet } from '../types';
import { WeatherForecast } from '../services/weatherService';

export interface NightTempAnalysis {
  avgNightTemp: number;
  minNightTemp: number;
  frostRiskDays: number;
  safeForTransplant: boolean;
  recommendation: string;
  consecutiveSafeNights: number;
}

/**
 * Conta notti consecutive con temperatura sopra la soglia minima
 */
const countConsecutiveSafeNights = (
  temps: number[],
  minTemp: number
): number => {
  let count = 0;
  let maxCount = 0;

  for (const temp of temps) {
    if (temp >= minTemp) {
      count++;
      maxCount = Math.max(maxCount, count);
    } else {
      count = 0;
    }
  }

  return maxCount;
};

/**
 * Analizza temperature notturne per determinare se è sicuro trapiantare
 * Regola critica: minimo 3 notti consecutive sopra la temperatura minima richiesta
 */
export const analyzeNightTemperatures = (
  forecast: WeatherForecast[],
  plant: PlantMasterSheet
): NightTempAnalysis => {
  // Prendi prossimi 7 giorni
  const next7Days = forecast.slice(0, 7);
  
  // Estrai temperature minime (notturne)
  const nightTemps = next7Days
    .map(f => f.tempMin !== undefined ? f.tempMin : f.temp)
    .filter((t): t is number => t !== undefined);

  if (nightTemps.length === 0) {
    return {
      avgNightTemp: 0,
      minNightTemp: 0,
      frostRiskDays: 0,
      safeForTransplant: false,
      recommendation: 'Impossibile analizzare temperature. Verifica connessione meteo.',
      consecutiveSafeNights: 0,
    };
  }

  const avgNight = nightTemps.reduce((a, b) => a + b, 0) / nightTemps.length;
  const minNight = Math.min(...nightTemps);
  const frostRiskDays = nightTemps.filter(t => t < 2).length;

  // Temperatura minima richiesta dalla pianta
  const plantMinTemp = plant.transplanting?.minTemp || 10;

  // Regola critica: 3 notti consecutive sopra minTemp
  const consecutiveSafeNights = countConsecutiveSafeNights(nightTemps, plantMinTemp);
  const safeForTransplant = consecutiveSafeNights >= 3 && frostRiskDays === 0;

  let recommendation = '';

  if (frostRiskDays > 0) {
    recommendation = `🥶 ATTENZIONE: ${frostRiskDays} notti con rischio gelo previste (min: ${minNight}°C). NON trapiantare ${plant.commonName}. Attendi almeno 1 settimana o fino a quando le temperature minime notturne saranno stabilmente sopra ${plantMinTemp}°C.`;
  } else if (minNight < plantMinTemp) {
    const daysToWait = Math.ceil((plantMinTemp - minNight) / 0.5); // ~0.5°C/giorno in primavera
    recommendation = `❄️ Minima notturna troppo bassa (${minNight.toFixed(1)}°C). ${plant.commonName} richiede minimo ${plantMinTemp}°C. Attendi ~${daysToWait} giorni o fino a quando le notti saranno più calde.`;
  } else if (consecutiveSafeNights < 3) {
    recommendation = `⚠️ Temperature minime appena sufficienti (min: ${minNight.toFixed(1)}°C, media: ${avgNight.toFixed(1)}°C) ma solo ${consecutiveSafeNights} notti consecutive sicure. Trapianta ma tieni pronto telo TNT per emergenze.`;
  } else {
    recommendation = `✅ Temperature notturne stabili (min: ${minNight.toFixed(1)}°C, media: ${avgNight.toFixed(1)}°C, ${consecutiveSafeNights} notti consecutive sicure). Sicuro per trapianto ${plant.commonName}.`;
  }

  return {
    avgNightTemp: parseFloat(avgNight.toFixed(1)),
    minNightTemp: parseFloat(minNight.toFixed(1)),
    frostRiskDays,
    safeForTransplant,
    recommendation,
    consecutiveSafeNights,
  };
};

/**
 * Verifica se una data specifica è sicura per trapianto
 */
export const isDateSafeForTransplant = (
  date: Date,
  forecast: WeatherForecast[],
  plant: PlantMasterSheet
): { safe: boolean; reason: string } => {
  const plantMinTemp = plant.transplanting?.minTemp || 10;
  
  // Trova previsione per la data specifica
  const dateStr = date.toISOString().split('T')[0];
  const dayForecast = forecast.find(f => f.date === dateStr);

  if (!dayForecast) {
    return {
      safe: false,
      reason: 'Previsione meteo non disponibile per questa data.',
    };
  }

  const minTemp = dayForecast.tempMin !== undefined ? dayForecast.tempMin : dayForecast.temp;

  if (minTemp < plantMinTemp) {
    return {
      safe: false,
      reason: `Temperatura minima prevista (${minTemp.toFixed(1)}°C) è inferiore a quella richiesta (${plantMinTemp}°C).`,
    };
  }

  // Verifica anche le notti precedenti e successive
  const dateIndex = forecast.findIndex(f => f.date === dateStr);
  if (dateIndex >= 0) {
    const prevNight = dateIndex > 0 
      ? (forecast[dateIndex - 1].tempMin !== undefined ? forecast[dateIndex - 1].tempMin : forecast[dateIndex - 1].temp)
      : minTemp;
    const nextNight = dateIndex < forecast.length - 1
      ? (forecast[dateIndex + 1].tempMin !== undefined ? forecast[dateIndex + 1].tempMin : forecast[dateIndex + 1].temp)
      : minTemp;

    if (prevNight !== undefined && prevNight < plantMinTemp) {
      return {
        safe: false,
        reason: `La notte precedente sarà troppo fredda (${prevNight.toFixed(1)}°C).`,
      };
    }

    if (nextNight !== undefined && nextNight < plantMinTemp) {
      return {
        safe: false,
        reason: `La notte successiva sarà troppo fredda (${nextNight.toFixed(1)}°C).`,
      };
    }
  }

  return {
    safe: true,
    reason: `Temperature notturne adatte (min: ${minTemp.toFixed(1)}°C).`,
  };
};

