/**
 * Seasonal Sun Windows Service
 * Calcola le 4 finestre stagionali solari e classifica il tipo di orto
 */

import {
  calculateMonthlySunHours,
  calculateDailySunHours,
  calculateSunPosition,
  Obstacle3D,
} from './preciseSunCalculator';
import { HistoricalWeatherData } from './historicalWeatherService';
import { calculateEffectiveTemperature } from '../utils/altitudeUtils';
import { calculateSoilHeatingRate } from '../utils/soilTemperatureUtils';

export interface SeasonalSunWindow {
  period: 'Feb-Mar' | 'Apr-Mag' | 'Giu-Lug' | 'Ago-Set';
  avgHours: number;
  minHours: number;
  maxHours: number;
  peakHours?: { start: number; end: number }; // Es. 9:30-16:30
  effectiveTemperature?: number; // Temperatura effettiva considerando altitudine (opzionale)
}

export interface GardenClassification {
  type: 'Estivo' | 'NonEstivo' | 'Misto';
  summerScore: number; // 0-1
  springAutumnScore: number; // 0-1
  windows: SeasonalSunWindow[];
  recommendations: string[];
}

/**
 * Calcola le 4 finestre stagionali solari per un giardino
 * 
 * @param lat Latitudine
 * @param lng Longitudine
 * @param obstacles Array di ostacoli 3D
 * @param year Anno per cui calcolare (default: anno corrente)
 * @returns Array di 4 finestre stagionali
 */
export function calculateSeasonalWindows(
  lat: number,
  lng: number,
  obstacles: Obstacle3D[] = [],
  year: number = new Date().getFullYear(),
  altitudeMeters?: number,
  soilType?: 'Loamy' | 'Sandy' | 'Clay' | 'Silty' | 'Peaty' | 'Chalky',
  historicalWeather?: HistoricalWeatherData[]
): SeasonalSunWindow[] {
  const windows: SeasonalSunWindow[] = [];
  
  // Helper per calcolare temperatura effettiva per un periodo
  const getEffectiveTempForPeriod = (period: HistoricalWeatherData['period']): number | undefined => {
    const weather = historicalWeather?.find(w => w.period === period);
    if (!weather) return undefined;

    // Temperatura base da meteo storico
    let effectiveTemp = weather.avgTemp;

    // Correzione altitudine
    if (altitudeMeters && altitudeMeters > 0) {
      effectiveTemp = calculateEffectiveTemperature(altitudeMeters, effectiveTemp);
    }

    // Correzione tipo terreno (temperatura suolo)
    if (soilType) {
      effectiveTemp = calculateSoilHeatingRate(soilType, effectiveTemp);
    }

    return Math.round(effectiveTemp * 10) / 10;
  };
  
  // Feb-Mar: Avvio primaverile
  const febMar = aggregateMonths(lat, lng, obstacles, year, [2, 3]);
  windows.push({
    period: 'Feb-Mar',
    ...febMar,
    effectiveTemperature: getEffectiveTempForPeriod('Feb-Mar'),
  });
  
  // Apr-Mag: Crescita vegetativa
  const aprMag = aggregateMonths(lat, lng, obstacles, year, [4, 5]);
  windows.push({
    period: 'Apr-Mag',
    ...aprMag,
    effectiveTemperature: getEffectiveTempForPeriod('Apr-Mag'),
  });
  
  // Giu-Lug: Massimo solare estivo
  const giuLug = aggregateMonths(lat, lng, obstacles, year, [6, 7]);
  const peakHours = calculatePeakSunHoursForPeriod(lat, lng, obstacles, year, 6, 7);
  windows.push({
    period: 'Giu-Lug',
    ...giuLug,
    peakHours,
    effectiveTemperature: getEffectiveTempForPeriod('Giu-Lug'),
  });
  
  // Ago-Set: Maturazione + stress
  const agoSet = aggregateMonths(lat, lng, obstacles, year, [8, 9]);
  windows.push({
    period: 'Ago-Set',
    ...agoSet,
    effectiveTemperature: getEffectiveTempForPeriod('Ago-Set'),
  });
  
  return windows;
}

/**
 * Aggrega dati di più mesi per una finestra stagionale
 */
function aggregateMonths(
  lat: number,
  lng: number,
  obstacles: Obstacle3D[],
  year: number,
  months: number[]
): { avgHours: number; minHours: number; maxHours: number } {
  const allHours: number[] = [];
  
  for (const month of months) {
    const monthly = calculateMonthlySunHours(lat, lng, year, month, obstacles);
    // Campiona alcuni giorni per avere più dati
    const daysInMonth = new Date(year, month, 0).getDate();
    const sampleDays = [5, 15, 25].filter(d => d <= daysInMonth);
    
    for (const day of sampleDays) {
      const date = new Date(year, month - 1, day);
      const hours = calculateDailySunHours(lat, lng, date, obstacles);
      allHours.push(hours);
    }
  }
  
  if (allHours.length === 0) {
    return { avgHours: 0, minHours: 0, maxHours: 0 };
  }
  
  const avgHours = allHours.reduce((sum, h) => sum + h, 0) / allHours.length;
  const minHours = Math.min(...allHours);
  const maxHours = Math.max(...allHours);
  
  return {
    avgHours: Math.round(avgHours * 10) / 10,
    minHours: Math.round(minHours * 10) / 10,
    maxHours: Math.round(maxHours * 10) / 10,
  };
}

/**
 * Calcola le ore di picco del sole per un periodo (quando arriva il sole)
 * Restituisce l'intervallo orario principale (es. 9:30-16:30)
 */
function calculatePeakSunHoursForPeriod(
  lat: number,
  lng: number,
  obstacles: Obstacle3D[],
  year: number,
  startMonth: number,
  endMonth: number
): { start: number; end: number } {
  // Campiona alcuni giorni rappresentativi del periodo
  const sampleDates: Date[] = [];
  for (let month = startMonth; month <= endMonth; month++) {
    const daysInMonth = new Date(year, month, 0).getDate();
    sampleDates.push(new Date(year, month - 1, Math.floor(daysInMonth / 2)));
  }
  
  // Calcola per ogni ora del giorno quando c'è sole
  const hourPresence: number[] = new Array(24).fill(0);
  const samplesPerHour = sampleDates.length;
  
  for (const date of sampleDates) {
    for (let hour = 6; hour < 18; hour += 0.5) {
      const sunPos = calculateSunPosition(lat, lng, date, hour);
      
      if (sunPos.elevation > 0) {
        const isBlocked = obstacles.some(obs => {
          const obstacleElevation = Math.atan2(obs.height, obs.distance) * 180 / Math.PI;
          const azimuthDiff = Math.abs(sunPos.azimuth - obs.azimuth);
          const minAzimuthDiff = Math.min(azimuthDiff, 360 - azimuthDiff);
          
          if (minAzimuthDiff <= obs.widthDegrees / 2) {
            return sunPos.elevation < obstacleElevation;
          }
          return false;
        });
        
        if (!isBlocked) {
          const hourIndex = Math.floor(hour);
          hourPresence[hourIndex] += 1 / samplesPerHour;
        }
      }
    }
  }
  
  // Trova l'intervallo con più presenza di sole
  let maxStart = 9;
  let maxEnd = 16;
  let maxPresence = 0;
  
  for (let start = 6; start <= 12; start++) {
    for (let end = start + 3; end <= 18; end++) {
      let presence = 0;
      for (let h = start; h < end; h++) {
        presence += hourPresence[h] || 0;
      }
      
      if (presence > maxPresence) {
        maxPresence = presence;
        maxStart = start;
        maxEnd = end;
      }
    }
  }
  
  return {
    start: maxStart,
    end: maxEnd,
  };
}

// Usa calculateSunPosition esportata da preciseSunCalculator

/**
 * Classifica il tipo di orto basandosi sulle finestre stagionali
 * 
 * @param windows Array di 4 finestre stagionali
 * @returns Classificazione del tipo di orto
 */
export function classifyGardenType(
  windows: SeasonalSunWindow[]
): GardenClassification {
  const giuLug = windows.find(w => w.period === 'Giu-Lug');
  const febMar = windows.find(w => w.period === 'Feb-Mar');
  const aprMag = windows.find(w => w.period === 'Apr-Mag');
  const agoSet = windows.find(w => w.period === 'Ago-Set');
  
  if (!giuLug || !febMar || !aprMag || !agoSet) {
    return {
      type: 'Misto',
      summerScore: 0.5,
      springAutumnScore: 0.5,
      windows,
      recommendations: ['Dati insufficienti per classificazione precisa'],
    };
  }
  
  // Verifica condizioni ORTO ESTIVO
  // Giu-Lug >= 6h continuo, meglio se sole tra 9:30-16:30
  const isEstivo =
    giuLug.avgHours >= 6 &&
    giuLug.minHours >= 5 && // Almeno 5h anche nei giorni peggiori
    (!giuLug.peakHours || 
     (giuLug.peakHours.start <= 9.5 && giuLug.peakHours.end >= 16.5));
  
  // Verifica condizioni ORTO PRIMAVERILE/AUTUNNALE
  // Mar-Apr >= 3-4h, Giu-Lug <= 6-7h (non troppo sole estivo)
  const marAprAvg = (febMar.avgHours + aprMag.avgHours) / 2;
  const isPrimaverileAutunnale =
    marAprAvg >= 3 &&
    giuLug.avgHours <= 7; // Non troppo sole estivo
  
  // Verifica condizioni ORTO FOGLIA ESTIVA
  // Sole solo mattino (3-5h), ombra pomeriggio
  const isFogliaEstiva =
    giuLug.avgHours >= 3 &&
    giuLug.avgHours <= 5 &&
    giuLug.peakHours &&
    giuLug.peakHours.end <= 13; // Sole solo fino alle 13:00
  
  // Calcola score estivo (0-1)
  let summerScore = 0;
  if (giuLug.avgHours >= 6) {
    summerScore = Math.min(1, (giuLug.avgHours - 6) / 4); // 6h = 0, 10h = 1
  }
  if (giuLug.peakHours && giuLug.peakHours.start <= 9.5 && giuLug.peakHours.end >= 16.5) {
    summerScore = Math.min(1, summerScore + 0.2); // Bonus per sole centrale
  }
  
  // Calcola score primaverile/autunnale (0-1)
  let springAutumnScore = 0;
  if (marAprAvg >= 3) {
    springAutumnScore = Math.min(1, (marAprAvg - 3) / 3); // 3h = 0, 6h = 1
  }
  if (giuLug.avgHours <= 7) {
    springAutumnScore = Math.min(1, springAutumnScore + 0.3); // Bonus per non troppo sole estivo
  }
  
  // Determina tipo
  let type: 'Estivo' | 'NonEstivo' | 'Misto';
  if (isEstivo && summerScore >= 0.7) {
    type = 'Estivo';
  } else if (isPrimaverileAutunnale && springAutumnScore >= 0.7) {
    type = 'NonEstivo';
  } else {
    type = 'Misto';
  }
  
  // Genera raccomandazioni
  const recommendations: string[] = [];
  
  if (type === 'Estivo') {
    recommendations.push('Orto Estivo: Ideale per pomodori, peperoni, melanzane, zucchine, cetrioli');
    recommendations.push(`Periodo ottimale: Maggio-Agosto con ${giuLug.avgHours}h di sole continuo`);
    if (giuLug.peakHours) {
      recommendations.push(`Sole centrale tra le ${Math.floor(giuLug.peakHours.start)}:${Math.floor((giuLug.peakHours.start % 1) * 60)} e le ${Math.floor(giuLug.peakHours.end)}:${Math.floor((giuLug.peakHours.end % 1) * 60)}`);
    }
  } else if (type === 'NonEstivo') {
    recommendations.push('Orto Primaverile/Autunnale: Ideale per insalate, spinaci, rucola, piselli, cipolle, fave');
    recommendations.push(`Periodo ottimale: Marzo-Maggio e Settembre-Ottobre con ${marAprAvg.toFixed(1)}h di sole`);
    recommendations.push('Vantaggi: Produzione più lunga, meno stress, consumo idrico ridotto');
  } else {
    recommendations.push('Orto Misto: Adatto a diverse categorie di colture');
    if (isFogliaEstiva) {
      recommendations.push('Sole mattutino disponibile: Ideale per basilico, prezzemolo, coriandolo, lattughe estive');
      recommendations.push('Cicli rapidi possibili ogni 30-40 giorni');
    }
    if (summerScore > 0.3) {
      recommendations.push(`Possibile coltivazione estiva con resa moderata (${giuLug.avgHours}h di sole)`);
    }
    if (springAutumnScore > 0.3) {
      recommendations.push(`Possibile coltivazione primaverile/autunnale (${marAprAvg.toFixed(1)}h di sole)`);
    }
  }
  
  return {
    type,
    summerScore: Math.round(summerScore * 100) / 100,
    springAutumnScore: Math.round(springAutumnScore * 100) / 100,
    windows,
    recommendations,
  };
}

