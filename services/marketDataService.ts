/**
 * Market Data Service
 * Gestisce dati mercato locale (prezzi, trend, canali vendita)
 */

export interface MarketPrice {
  plantName: string;
  region: string;
  pricePerKg: number;
  date: Date;
  source: 'farmer_market' | 'gas' | 'online';
}

export interface PriceTrend {
  plantName: string;
  currentPrice: number;
  averagePrice: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  changePercent: number;
}

/**
 * Recupera prezzi mercato locale
 */
export async function getMarketPrices(
  region: string,
  season?: 'Spring' | 'Summer' | 'Autumn' | 'Winter'
): Promise<MarketPrice[]> {
  // TODO: Integrare con API prezzi reali
  // Per ora, mock basato su stagione
  const prices: MarketPrice[] = [];
  const now = new Date();

  const basePrices: Record<string, number> = {
    Pomodoro: 3.5,
    Zucchina: 2.0,
    Peperone: 4.0,
    Lattuga: 2.5,
    Basilico: 8.0,
  };

  for (const [plant, basePrice] of Object.entries(basePrices)) {
    // Aggiusta prezzo in base a stagione
    let adjustedPrice = basePrice;
    if (season === 'Summer' && (plant === 'Pomodoro' || plant === 'Zucchina')) {
      adjustedPrice = basePrice * 0.7; // Più economico in stagione
    } else if (season === 'Winter' && plant === 'Lattuga') {
      adjustedPrice = basePrice * 1.3; // Più caro fuori stagione
    }

    prices.push({
      plantName: plant,
      region,
      pricePerKg: adjustedPrice,
      date: now,
      source: 'farmer_market',
    });
  }

  return prices;
}

/**
 * Recupera trend prezzi
 */
export async function getPriceTrends(
  plantName: string,
  period: '1w' | '1m' | '3m'
): Promise<PriceTrend> {
  // TODO: Implementare con dati reali
  const currentPrice = 3.5;
  const averagePrice = 3.2;

  return {
    plantName,
    currentPrice,
    averagePrice,
    trend: currentPrice > averagePrice ? 'increasing' : 'decreasing',
    changePercent: ((currentPrice - averagePrice) / averagePrice) * 100,
  };
}

/**
 * Recupera picchi stagionali prezzo
 */
export async function getSeasonalPricePeaks(plantName: string): Promise<Date[]> {
  // TODO: Implementare con dati storici
  // Picchi comuni: pre-ferragosto, Natale
  const peaks: Date[] = [];
  const currentYear = new Date().getFullYear();

  // Pre-ferragosto (metà luglio)
  peaks.push(new Date(currentYear, 6, 15));

  // Natale (dicembre)
  peaks.push(new Date(currentYear, 11, 20));

  return peaks;
}

