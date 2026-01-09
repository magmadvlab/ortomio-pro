/**
 * Market Engine
 * Calcola timing ottimale vendita, suggerisce canali, stima valore mercato
 */

import { getMarketPrices, getPriceTrends, getSeasonalPricePeaks } from '../services/marketDataService';
import { getWeatherForecast } from '../services/weatherService';

export interface OptimalHarvestTiming {
  recommendedDate: Date;
  reason: string;
  expectedPrice: number;
  urgency: 'low' | 'medium' | 'high';
}

/**
 * Calcola timing ottimale vendita
 */
export async function calculateOptimalHarvestTiming(
  plantName: string,
  region: string,
  currentMaturity: number, // 0-100
  weatherForecast?: { tempMax?: number }
): Promise<OptimalHarvestTiming> {
  const trends = await getPriceTrends(plantName, '1m');
  const peaks = await getSeasonalPricePeaks(plantName);
  const now = new Date();

  // Se prezzo in aumento, anticipa raccolta se maturo
  if (trends.trend === 'increasing' && currentMaturity >= 80) {
    return {
      recommendedDate: now,
      reason: `Prezzo in aumento (+${trends.changePercent.toFixed(1)}%). Raccolta consigliata ora.`,
      expectedPrice: trends.currentPrice,
      urgency: 'high',
    };
  }

  // Se picco stagionale vicino, aspetta
  const nearestPeak = peaks
    .filter((p) => p > now)
    .sort((a, b) => a.getTime() - b.getTime())[0];

  if (nearestPeak) {
    const daysToPeak = Math.ceil((nearestPeak.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysToPeak <= 14 && currentMaturity >= 70) {
      return {
        recommendedDate: nearestPeak,
        reason: `Picco stagionale tra ${daysToPeak} giorni. Aspetta se possibile.`,
        expectedPrice: trends.currentPrice * 1.2, // Stima aumento prezzo
        urgency: 'medium',
      };
    }
  }

  // Se caldo estremo previsto, anticipa per evitare sovramaturazione
  if (weatherForecast?.tempMax && weatherForecast.tempMax > 35 && currentMaturity >= 75) {
    return {
      recommendedDate: now,
      reason: 'Caldo estremo previsto. Rischio sovramaturazione. Raccolta consigliata ora.',
      expectedPrice: trends.currentPrice,
      urgency: 'high',
    };
  }

  return {
    recommendedDate: now,
    reason: 'Raccolta quando maturo',
    expectedPrice: trends.currentPrice,
    urgency: 'low',
  };
}

