/**
 * Garden Point Scorer Service
 * Calcola score (0-100) per ogni categoria coltura per un punto specifico dell'orto
 */

import { SeasonalSunWindow } from './seasonalSunWindows';
import { HistoricalWeatherData } from './historicalWeatherService';
import { Garden, GardenPoint } from '../types';

export interface GardenPointScore {
  pointId: string;
  pointName: string;
  scores: {
    ortoEstivo: number; // 0-100
    fogliaPrimavera: number;
    fogliaEstate: number;
    aromatiche: number;
  };
  recommendations: {
    category: string;
    score: number;
    message: string;
    cycles: number; // Cicli possibili nell'anno
    resaStimata: number; // kg/m²
  }[];
}

// GardenPoint è ora importato da types.ts
export type { GardenPoint } from '../types';

/**
 * Calcola score per categoria "Orto Estivo"
 * Requisiti: Giu-Lug ≥6h sole E temperatura ≥18°C E escursione <15°C
 */
function calculateOrtoEstivoScore(
  giuLug: SeasonalSunWindow,
  historicalWeather?: HistoricalWeatherData[]
): number {
  const giuLugWeather = historicalWeather?.find(w => w.period === 'Giu-Lug');
  const temp = giuLug.effectiveTemperature || giuLugWeather?.avgTemp;
  const tempRange = giuLugWeather?.tempRange;

  let score = 0;

  // Ore sole (peso 50%)
  if (giuLug.avgHours >= 6) {
    score += 50; // Massimo per ore sole
  } else if (giuLug.avgHours >= 5) {
    score += 35; // Buono ma non ottimale
  } else if (giuLug.avgHours >= 4) {
    score += 20; // Sufficiente
  } else {
    score += 5; // Poco sole
  }

  // Temperatura (peso 30%)
  if (temp !== undefined) {
    if (temp >= 18 && temp <= 28) {
      score += 30; // Ottimale
    } else if (temp >= 15 && temp < 18) {
      score += 20; // Accettabile ma freddo
    } else if (temp > 28 && temp <= 32) {
      score += 25; // Caldo ma gestibile
    } else {
      score += 5; // Troppo freddo o troppo caldo
    }
  } else {
    score += 15; // Se temperatura non disponibile, assume medio
  }

  // Escursione termica (peso 20%)
  if (tempRange !== undefined) {
    if (tempRange < 10) {
      score += 20; // Escursione ottimale
    } else if (tempRange < 15) {
      score += 15; // Escursione accettabile
    } else {
      score += 5; // Escursione troppo alta (stress)
    }
  } else {
    score += 10; // Se escursione non disponibile, assume medio
  }

  return Math.min(100, Math.max(0, score));
}

/**
 * Calcola score per categoria "Foglia Primavera"
 * Requisiti: Feb-Mar/Apr-Mag ≥3h sole E temperatura 10-20°C
 */
function calculateFogliaPrimaveraScore(
  febMar: SeasonalSunWindow,
  aprMag: SeasonalSunWindow,
  historicalWeather?: HistoricalWeatherData[]
): number {
  const marAprAvg = (febMar.avgHours + aprMag.avgHours) / 2;
  const febMarWeather = historicalWeather?.find(w => w.period === 'Feb-Mar');
  const aprMagWeather = historicalWeather?.find(w => w.period === 'Apr-Mag');
  const avgTemp = febMarWeather && aprMagWeather
    ? (febMarWeather.avgTemp + aprMagWeather.avgTemp) / 2
    : febMar.effectiveTemperature || aprMag.effectiveTemperature;

  let score = 0;

  // Ore sole (peso 50%)
  if (marAprAvg >= 4) {
    score += 50;
  } else if (marAprAvg >= 3) {
    score += 40;
  } else if (marAprAvg >= 2) {
    score += 25;
  } else {
    score += 10;
  }

  // Temperatura (peso 50%)
  if (avgTemp !== undefined) {
    if (avgTemp >= 10 && avgTemp <= 20) {
      score += 50; // Ottimale
    } else if (avgTemp >= 8 && avgTemp < 10) {
      score += 35; // Un po' freddo
    } else if (avgTemp > 20 && avgTemp <= 22) {
      score += 40; // Un po' caldo
    } else {
      score += 15; // Fuori range ottimale
    }
  } else {
    score += 25; // Se temperatura non disponibile, assume medio
  }

  return Math.min(100, Math.max(0, score));
}

/**
 * Calcola score per categoria "Foglia Estate"
 * Requisiti: Giu-Lug 3-5h sole (ombra intelligente) E temperatura 15-25°C
 */
function calculateFogliaEstateScore(
  giuLug: SeasonalSunWindow,
  historicalWeather?: HistoricalWeatherData[]
): number {
  const giuLugWeather = historicalWeather?.find(w => w.period === 'Giu-Lug');
  const temp = giuLug.effectiveTemperature || giuLugWeather?.avgTemp;

  let score = 0;

  // Ore sole (peso 60%) - deve essere tra 3-5h (ombra intelligente)
  if (giuLug.avgHours >= 3 && giuLug.avgHours <= 5) {
    score += 60; // Perfetto per foglia estiva
  } else if (giuLug.avgHours >= 2 && giuLug.avgHours < 3) {
    score += 40; // Poco sole ma accettabile
  } else if (giuLug.avgHours > 5 && giuLug.avgHours <= 6) {
    score += 45; // Un po' troppo sole ma gestibile
  } else {
    score += 15; // Troppo poco o troppo sole
  }

  // Temperatura (peso 40%)
  if (temp !== undefined) {
    if (temp >= 15 && temp <= 25) {
      score += 40; // Ottimale
    } else if (temp >= 12 && temp < 15) {
      score += 30; // Un po' freddo
    } else if (temp > 25 && temp <= 28) {
      score += 30; // Un po' caldo
    } else {
      score += 15; // Fuori range
    }
  } else {
    score += 20; // Se temperatura non disponibile, assume medio
  }

  return Math.min(100, Math.max(0, score));
}

/**
 * Calcola score per categoria "Aromatiche"
 * Requisiti: ≥3h sole qualsiasi periodo
 */
function calculateAromaticheScore(
  windows: SeasonalSunWindow[]
): number {
  // Prendi la media delle ore sole di tutti i periodi
  const avgHours = windows.reduce((sum, w) => sum + w.avgHours, 0) / windows.length;

  let score = 0;

  // Ore sole (peso 100% - aromatiche sono flessibili)
  if (avgHours >= 5) {
    score = 90; // Molto sole, ottimo
  } else if (avgHours >= 4) {
    score = 80; // Buon sole
  } else if (avgHours >= 3) {
    score = 70; // Sufficiente
  } else if (avgHours >= 2) {
    score = 50; // Poco sole ma accettabile
  } else {
    score = 25; // Troppo poco sole
  }

  return Math.min(100, Math.max(0, score));
}

/**
 * Calcola score completo per un punto dell'orto
 */
export function calculateGardenPointScores(
  point: GardenPoint,
  windows: SeasonalSunWindow[],
  historicalWeather?: HistoricalWeatherData[],
  soilType?: Garden['soilType'],
  altitudeMeters?: number
): GardenPointScore {
  const giuLug = windows.find((w) => w.period === 'Giu-Lug');
  const febMar = windows.find((w) => w.period === 'Feb-Mar');
  const aprMag = windows.find((w) => w.period === 'Apr-Mag');

  if (!giuLug || !febMar || !aprMag) {
    // Fallback se finestre non disponibili
    return {
      pointId: point.id,
      pointName: point.name,
      scores: {
        ortoEstivo: 0,
        fogliaPrimavera: 0,
        fogliaEstate: 0,
        aromatiche: 0,
      },
      recommendations: [],
    };
  }

  // Calcola score per ogni categoria
  const ortoEstivoScore = calculateOrtoEstivoScore(giuLug, historicalWeather);
  const fogliaPrimaveraScore = calculateFogliaPrimaveraScore(
    febMar,
    aprMag,
    historicalWeather
  );
  const fogliaEstateScore = calculateFogliaEstateScore(giuLug, historicalWeather);
  const aromaticheScore = calculateAromaticheScore(windows);

  // Genera raccomandazioni
  const recommendations: GardenPointScore['recommendations'] = [];

  if (ortoEstivoScore >= 70) {
    recommendations.push({
      category: 'Orto Estivo',
      score: ortoEstivoScore,
      message: 'Perfetto per colture estive da frutto. Resa massima garantita.',
      cycles: 1,
      resaStimata: 8, // kg/m²
    });
  } else if (ortoEstivoScore >= 50) {
    recommendations.push({
      category: 'Orto Estivo',
      score: ortoEstivoScore,
      message: 'Buono per colture estive ma con resa limitata.',
      cycles: 1,
      resaStimata: 5,
    });
  }

  if (fogliaPrimaveraScore >= 80) {
    recommendations.push({
      category: 'Foglia Primavera',
      score: fogliaPrimaveraScore,
      message: 'Perfetto! 3 cicli possibili in primavera/autunno.',
      cycles: 3,
      resaStimata: 4,
    });
  } else if (fogliaPrimaveraScore >= 60) {
    recommendations.push({
      category: 'Foglia Primavera',
      score: fogliaPrimaveraScore,
      message: 'Buono per colture primaverili. 2 cicli possibili.',
      cycles: 2,
      resaStimata: 3,
    });
  }

  if (fogliaEstateScore >= 75) {
    recommendations.push({
      category: 'Foglia Estate',
      score: fogliaEstateScore,
      message: 'Ottimo per foglie estive con ombra intelligente.',
      cycles: 4,
      resaStimata: 3,
    });
  }

  if (aromaticheScore >= 70) {
    recommendations.push({
      category: 'Aromatiche',
      score: aromaticheScore,
      message: 'Buono per basilico, menta, prezzemolo.',
      cycles: 5,
      resaStimata: 2,
    });
  }

  // Ordina raccomandazioni per score (dal più alto)
  recommendations.sort((a, b) => b.score - a.score);

  return {
    pointId: point.id,
    pointName: point.name,
    scores: {
      ortoEstivo: Math.round(ortoEstivoScore),
      fogliaPrimavera: Math.round(fogliaPrimaveraScore),
      fogliaEstate: Math.round(fogliaEstateScore),
      aromatiche: Math.round(aromaticheScore),
    },
    recommendations,
  };
}

