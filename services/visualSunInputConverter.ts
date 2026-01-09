/**
 * Visual Sun Input Converter Service
 * Converte input visivo dell'utente in ore di sole stimate
 */

import { VisualSunInputData } from '../components/sunExposure/VisualSunInput';

/**
 * Fattori di posizione per tipo di ubicazione
 */
const POSITION_FACTORS: Record<VisualSunInputData['position'], number> = {
  campo: 1.0, // Pieno campo: nessuna riduzione
  muro: 0.8, // Vicino muro: riduzione del 20%
  balcone: 0.6, // Balcone: riduzione del 40%
};

/**
 * Fattori di riduzione per ostacoli
 */
const OBSTACLE_FACTORS: Record<string, number> = {
  edificio_sud: 0.7, // Edificio a Sud: riduzione del 30%
  edificio_est: 0.85, // Edificio a Est: riduzione del 15% (solo mattino)
  edificio_ovest: 0.85, // Edificio a Ovest: riduzione del 15% (solo pomeriggio)
  albero: 0.9, // Albero: riduzione del 10%
  montagna: 0.8, // Montagna: riduzione del 20%
  nessuno: 1.0, // Nessun ostacolo: nessuna riduzione
};

/**
 * Converte scala 1-5 in ore stimate per periodo del giorno
 */
function scaleToHours(scale: number, period: 'morning' | 'noon' | 'afternoon'): number {
  // Scala 1-5 mappata a ore:
  // 1 = 0-1h, 2 = 1-2h, 3 = 2-3h, 4 = 3-4h, 5 = 4-5h
  const baseHours = (scale - 1) * 1.0 + 0.5; // 0.5-4.5h

  // Aggiusta per periodo:
  // Mezzogiorno ha più peso (sole più intenso)
  if (period === 'noon') {
    return baseHours * 1.2; // +20% per mezzogiorno
  }
  // Mattino e pomeriggio hanno peso normale
  return baseHours;
}

/**
 * Stima ore di sole da input visivo
 * 
 * @param morning Scala 1-5 per sole mattutino
 * @param noon Scala 1-5 per sole mezzogiorno
 * @param afternoon Scala 1-5 per sole pomeridiano
 * @param position Tipo di posizione (campo/muro/balcone)
 * @returns Ore di sole stimate per giorno
 */
export function estimateSunHoursFromVisual(
  morning: number,
  noon: number,
  afternoon: number,
  position: VisualSunInputData['position']
): number {
  // Converti scale in ore per periodo
  const morningHours = scaleToHours(morning, 'morning');
  const noonHours = scaleToHours(noon, 'noon');
  const afternoonHours = scaleToHours(afternoon, 'afternoon');

  // Formula pesata: mezzogiorno ha più peso
  // (morning * 2 + noon * 4 + afternoon * 2) / 8
  const weightedAverage =
    (morningHours * 2 + noonHours * 4 + afternoonHours * 2) / 8;

  // Applica fattore posizione
  const positionFactor = POSITION_FACTORS[position];
  const estimatedHours = weightedAverage * positionFactor;

  // Limita tra 0 e 12 ore
  return Math.max(0, Math.min(12, estimatedHours));
}

/**
 * Applica riduzione per ostacoli
 */
function applyObstacleReduction(
  baseHours: number,
  obstacles: string[]
): number {
  if (obstacles.length === 0 || obstacles.includes('nessuno')) {
    return baseHours;
  }

  // Calcola fattore combinato (moltiplicativo)
  // Esempio: edificio_sud (0.7) + albero (0.9) = 0.7 * 0.9 = 0.63
  const combinedFactor = obstacles.reduce((acc, obstacle) => {
    const factor = OBSTACLE_FACTORS[obstacle] || 1.0;
    return acc * factor;
  }, 1.0);

  return baseHours * combinedFactor;
}

/**
 * Converte input visivo completo in ore di sole stimate
 * 
 * @param input Dati input visivo dell'utente
 * @param lat Latitudine (opzionale, per calcoli futuri)
 * @param lng Longitudine (opzionale, per calcoli futuri)
 * @returns Ore di sole stimate per giorno
 */
export function convertVisualInputToSunHours(
  input: VisualSunInputData,
  lat?: number,
  lng?: number
): number {
  // Stima base da slider
  const baseHours = estimateSunHoursFromVisual(
    input.morningSun,
    input.noonSun,
    input.afternoonSun,
    input.position
  );

  // Applica riduzione ostacoli
  const finalHours = applyObstacleReduction(baseHours, input.obstacles);

  // Arrotonda a 1 decimale
  return Math.round(finalHours * 10) / 10;
}

/**
 * Converte ore di sole in input visivo approssimato (per retrocompatibilità)
 * Utile quando si carica un giardino esistente con solo dailySunHours
 */
export function convertSunHoursToVisualInput(
  hours: number,
  position: VisualSunInputData['position'] = 'campo'
): Partial<VisualSunInputData> {
  // Approssimazione inversa
  // Assumiamo distribuzione tipica: mattino medio, mezzogiorno alto, pomeriggio medio
  const positionFactor = POSITION_FACTORS[position];
  const adjustedHours = hours / positionFactor;

  // Stima scale basata su ore totali
  let morning = 3;
  let noon = 5;
  let afternoon = 3;

  if (adjustedHours < 3) {
    morning = 1;
    noon = 2;
    afternoon = 1;
  } else if (adjustedHours < 5) {
    morning = 2;
    noon = 3;
    afternoon = 2;
  } else if (adjustedHours < 7) {
    morning = 3;
    noon = 4;
    afternoon = 3;
  } else if (adjustedHours < 9) {
    morning = 4;
    noon = 5;
    afternoon = 4;
  } else {
    morning = 5;
    noon = 5;
    afternoon = 5;
  }

  return {
    position,
    morningSun: morning,
    noonSun: noon,
    afternoonSun: afternoon,
    obstacles: [],
  };
}

