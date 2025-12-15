import { Garden } from '../types';
import {
  calculateDailySunHours,
  calculateOptimalPeriod,
  getExposureType,
  getCropRecommendation,
  Obstacle3D,
} from './preciseSunCalculator';

export interface SunExposureData {
  estimatedHours: number; // Ore di sole stimate
  exposure: 'FullSun' | 'PartialSun' | 'PartialShade' | 'FullShade';
  recommendation: string; // Suggerimento basato su esposizione
}

/**
 * Calcola l'esposizione solare stimata basata su latitudine, stagione e orientamento
 * Supporta anche calcolo preciso con ostacoli 3D e data specifica
 */
export const calculateSunExposure = (
  lat: number,
  lng: number,
  orientation?: Garden['aspectDirection'],
  obstacles?: Obstacle3D[],
  date?: Date
): SunExposureData => {
  const targetDate = date || new Date();
  
  // Se ci sono ostacoli definiti, usa calcolo preciso
  if (obstacles && obstacles.length > 0) {
    const dailyHours = calculateDailySunHours(lat, lng, targetDate, obstacles);
    const exposure = getExposureType(dailyHours);
    const recommendation = getCropRecommendation(exposure);
    
    return {
      estimatedHours: dailyHours,
      exposure,
      recommendation,
    };
  }
  
  // Altrimenti usa calcolo base basato su stagione (backward compatibility)
  const month = targetDate.getMonth() + 1;
  const season = month >= 3 && month <= 5 ? 'Spring' : 
                 month >= 6 && month <= 8 ? 'Summer' :
                 month >= 9 && month <= 11 ? 'Autumn' : 'Winter';
  
  // Stima base basata su latitudine (Italia: ~36-47°N)
  // In estate: più ore di sole, in inverno meno
  let baseHours = 0;
  
  if (season === 'Summer') {
    baseHours = 8 + (lat - 40) * 0.2; // 8-10 ore in estate
  } else if (season === 'Spring' || season === 'Autumn') {
    baseHours = 6 + (lat - 40) * 0.15; // 5-7 ore in primavera/autunno
  } else {
    baseHours = 4 + (lat - 40) * 0.1; // 3-5 ore in inverno
  }
  
  // Aggiusta in base all'orientamento
  if (orientation) {
    const orientationMultiplier: Record<string, number> = {
      'South': 1.2,      // Sud: massima esposizione
      'Southeast': 1.1,
      'Southwest': 1.1,
      'East': 1.0,       // Est: buona al mattino
      'West': 1.0,       // Ovest: buona al pomeriggio
      'Northeast': 0.8,
      'Northwest': 0.8,
      'North': 0.6       // Nord: meno esposizione
    };
    baseHours *= orientationMultiplier[orientation] || 1.0;
  }
  
  // Clamp tra 0 e 12 ore
  baseHours = Math.max(0, Math.min(12, baseHours));
  
  // Determina tipo di esposizione
  const exposure = getExposureType(baseHours);
  const recommendation = getCropRecommendation(exposure);
  
  return {
    estimatedHours: Math.round(baseHours * 10) / 10, // Arrotonda a 1 decimale
    exposure,
    recommendation
  };
};

/**
 * Ottiene l'esposizione solare per un giardino
 * Supporta calcolo preciso con ostacoli se disponibili
 */
export const getGardenSunExposure = (
  garden: Garden,
  date?: Date
): SunExposureData | null => {
  if (!garden.coordinates) {
    return null;
  }
  
  // Se già calcolata manualmente E non ci sono ostacoli, usa quella
  // (con ostacoli, ricalcoliamo sempre per precisione)
  if (garden.sunExposure && garden.dailySunHours && (!garden.obstacles || garden.obstacles.length === 0)) {
    return {
      estimatedHours: garden.dailySunHours,
      exposure: convertSunExposure(garden.sunExposure),
      recommendation: getRecommendationForExposure(garden.sunExposure)
    };
  }
  
  // Calcola con ostacoli se disponibili, altrimenti usa calcolo base
  return calculateSunExposure(
    garden.coordinates.latitude,
    garden.coordinates.longitude,
    garden.aspectDirection,
    garden.obstacles,
    date
  );
};

/**
 * Calcola periodo ottimale per un giardino
 */
export const getGardenOptimalPeriod = (
  garden: Garden,
  minSunHours: number = 6
): ReturnType<typeof calculateOptimalPeriod> | null => {
  if (!garden.coordinates) {
    return null;
  }
  
  return calculateOptimalPeriod(
    garden.coordinates.latitude,
    garden.coordinates.longitude,
    garden.obstacles || [],
    minSunHours
  );
};

/**
 * Converte il tipo di esposizione da Garden a SunExposureData
 */
const convertSunExposure = (exposure: Garden['sunExposure']): SunExposureData['exposure'] => {
  const mapping: Record<string, SunExposureData['exposure']> = {
    'FullSun': 'FullSun',
    'PartSun': 'PartialSun',
    'Shade': 'PartialShade',
  };
  
  return mapping[exposure || 'PartSun'] || 'PartialSun';
};

/**
 * Ottiene raccomandazione basata sul tipo di esposizione
 */
const getRecommendationForExposure = (exposure: Garden['sunExposure']): string => {
  const recommendations: Record<string, string> = {
    'FullSun': 'Esposizione ottimale! Ideale per pomodori, peperoni, zucchine e piante che amano il sole diretto.',
    'PartialSun': 'Buona esposizione. Adatta a molte verdure. Alcune piante potrebbero beneficiare di ombreggiamento nelle ore più calde.',
    'PartialShade': 'Esposizione parziale. Ideale per lattughe, spinaci, rucola e piante che preferiscono ombra parziale.',
    'FullShade': 'Poca esposizione diretta. Considera piante da ombra o valuta di spostare l\'orto in una zona più soleggiata.'
  };
  
  return recommendations[exposure || 'PartialSun'] || recommendations['PartialSun'];
};

