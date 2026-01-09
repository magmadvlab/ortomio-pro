/**
 * Market Prices Database
 * Prezzi medi mercato biologico per ortaggio (€/kg)
 * Prezzi variano per stagione (estate vs inverno)
 */

import { MarketPrice } from '../types';

export const marketPrices: MarketPrice[] = [
  // Pomodori
  {
    plantName: 'POMODORO',
    pricePerKg: 4.50, // €/kg biologico
    season: 'Summer',
  },
  {
    plantName: 'POMODORO',
    pricePerKg: 6.00, // Più caro in inverno (serra)
    season: 'Winter',
  },
  
  // Peperoncini
  {
    plantName: 'PEPERONCINO',
    pricePerKg: 8.00,
    season: 'Summer',
  },
  {
    plantName: 'PEPERONCINO',
    pricePerKg: 12.00,
    season: 'Winter',
  },
  
  // Zucchine
  {
    plantName: 'ZUCCHINA',
    pricePerKg: 2.50,
    season: 'Summer',
  },
  {
    plantName: 'ZUCCHINA',
    pricePerKg: 4.00,
    season: 'Winter',
  },
  
  // Melanzane
  {
    plantName: 'MELANZANA',
    pricePerKg: 3.50,
    season: 'Summer',
  },
  {
    plantName: 'MELANZANA',
    pricePerKg: 5.50,
    season: 'Winter',
  },
  
  // Lattuga
  {
    plantName: 'LATTUGA',
    pricePerKg: 3.00,
    season: 'Summer',
  },
  {
    plantName: 'LATTUGA',
    pricePerKg: 4.50,
    season: 'Winter',
  },
  
  // Basilico
  {
    plantName: 'BASILICO',
    pricePerKg: 15.00, // Erbe aromatiche più costose
    season: 'Summer',
  },
  {
    plantName: 'BASILICO',
    pricePerKg: 20.00,
    season: 'Winter',
  },
  
  // Fagioli
  {
    plantName: 'FAGIOLO',
    pricePerKg: 5.00,
    season: 'Summer',
  },
  {
    plantName: 'FAGIOLO',
    pricePerKg: 7.00,
    season: 'Winter',
  },
  
  // Piselli
  {
    plantName: 'PISELLO',
    pricePerKg: 6.00,
    season: 'Summer',
  },
  {
    plantName: 'PISELLO',
    pricePerKg: 8.00,
    season: 'Winter',
  },
  
  // Carote
  {
    plantName: 'CAROTA',
    pricePerKg: 2.00,
    season: 'Summer',
  },
  {
    plantName: 'CAROTA',
    pricePerKg: 2.50,
    season: 'Winter',
  },
  
  // Cipolle
  {
    plantName: 'CIPOLLA',
    pricePerKg: 1.50,
    season: 'Summer',
  },
  {
    plantName: 'CIPOLLA',
    pricePerKg: 2.00,
    season: 'Winter',
  },
  
  // Erbe aromatiche
  {
    plantName: 'ROSMARINO',
    pricePerKg: 18.00,
    season: 'Summer',
  },
  {
    plantName: 'SALVIA',
    pricePerKg: 20.00,
    season: 'Summer',
  },
  {
    plantName: 'TIMO',
    pricePerKg: 25.00,
    season: 'Summer',
  },
  {
    plantName: 'ORIGANO',
    pricePerKg: 22.00,
    season: 'Summer',
  },
  {
    plantName: 'MENTA',
    pricePerKg: 15.00,
    season: 'Summer',
  },
  {
    plantName: 'LAVANDA',
    pricePerKg: 30.00,
    season: 'Summer',
  },
];

/**
 * Get market price for a plant
 */
export const getMarketPrice = (
  plantName: string,
  season: 'Summer' | 'Winter' = 'Summer'
): number => {
  const price = marketPrices.find(
    p => p.plantName === plantName && p.season === season
  );
  
  if (price) {
    return price.pricePerKg;
  }
  
  // Default price if not found
  return 3.00; // €/kg default
};

/**
 * Get all market prices for a plant (both seasons)
 */
export const getMarketPrices = (plantName: string): MarketPrice[] => {
  return marketPrices.filter(p => p.plantName === plantName);
};

