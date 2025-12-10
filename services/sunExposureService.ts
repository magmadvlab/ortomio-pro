import { Garden } from '../types';

export interface SunExposureData {
  estimatedHours: number; // Ore di sole stimate
  exposure: 'FullSun' | 'PartialSun' | 'PartialShade' | 'FullShade';
  recommendation: string; // Suggerimento basato su esposizione
}

/**
 * Calcola l'esposizione solare stimata basata su latitudine, stagione e orientamento
 */
export const calculateSunExposure = (
  lat: number,
  lng: number,
  orientation?: Garden['orientation']
): SunExposureData => {
  const today = new Date();
  const month = today.getMonth() + 1;
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
  let exposure: 'FullSun' | 'PartialSun' | 'PartialShade' | 'FullShade';
  let recommendation: string;
  
  if (baseHours >= 8) {
    exposure = 'FullSun';
    recommendation = 'Esposizione ottimale! Ideale per pomodori, peperoni, zucchine e piante che amano il sole diretto.';
  } else if (baseHours >= 5) {
    exposure = 'PartialSun';
    recommendation = 'Buona esposizione. Adatta a molte verdure. Alcune piante potrebbero beneficiare di ombreggiamento nelle ore più calde.';
  } else if (baseHours >= 3) {
    exposure = 'PartialShade';
    recommendation = 'Esposizione parziale. Ideale per lattughe, spinaci, rucola e piante che preferiscono ombra parziale.';
  } else {
    exposure = 'FullShade';
    recommendation = 'Poca esposizione diretta. Considera piante da ombra o valuta di spostare l\'orto in una zona più soleggiata.';
  }
  
  return {
    estimatedHours: Math.round(baseHours * 10) / 10, // Arrotonda a 1 decimale
    exposure,
    recommendation
  };
};

/**
 * Ottiene l'esposizione solare per un giardino
 */
export const getGardenSunExposure = (garden: Garden): SunExposureData | null => {
  if (!garden.coordinates) {
    return null;
  }
  
  // Se già calcolata manualmente, usa quella
  if (garden.sunExposure && garden.sunHours) {
    return {
      estimatedHours: garden.sunHours,
      exposure: garden.sunExposure,
      recommendation: getRecommendationForExposure(garden.sunExposure)
    };
  }
  
  // Altrimenti calcola
  return calculateSunExposure(
    garden.coordinates.latitude,
    garden.coordinates.longitude,
    garden.orientation
  );
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

