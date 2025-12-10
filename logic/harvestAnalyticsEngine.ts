/**
 * Harvest Analytics Engine
 * Calculates economic value and savings from harvests
 */

import { HarvestLogData, HarvestAnalytics } from '../types';
import { getMarketPrice } from '../data/marketPrices';

/**
 * Calculate harvest analytics for a period
 */
export const calculateHarvestAnalytics = (
  harvests: HarvestLogData[],
  startDate?: Date,
  endDate?: Date
): HarvestAnalytics => {
  // Filter by date range if provided
  let filteredHarvests = harvests;
  
  if (startDate || endDate) {
    filteredHarvests = harvests.filter(h => {
      const harvestDate = new Date(h.date);
      if (startDate && harvestDate < startDate) return false;
      if (endDate && harvestDate > endDate) return false;
      return true;
    });
  }

  // Calculate total kg produced
  const totalKgProduced = filteredHarvests.reduce((sum, h) => {
    let kg = 0;
    if (h.unit === 'kg') {
      kg = h.quantity;
    } else if (h.unit === 'g') {
      kg = h.quantity / 1000;
    } else {
      // units - estimate 0.1kg per unit
      kg = h.quantity * 0.1;
    }
    return sum + kg;
  }, 0);

  // Calculate market value
  const marketValueEuro = filteredHarvests.reduce((sum, h) => {
    // Determine season from date
    const harvestDate = new Date(h.date);
    const month = harvestDate.getMonth();
    const season = (month >= 5 && month <= 8) ? 'Summer' : 'Winter';
    
    const pricePerKg = getMarketPrice(h.plantName || 'UNKNOWN', season);
    
    let kg = 0;
    if (h.unit === 'kg') {
      kg = h.quantity;
    } else if (h.unit === 'g') {
      kg = h.quantity / 1000;
    } else {
      kg = h.quantity * 0.1;
    }
    
    return sum + (kg * pricePerKg);
  }, 0);

  // Estimate costs (simplified)
  const estimatedCosts = {
    water: totalKgProduced * 0.05, // €0.05 per kg (irrigazione)
    fertilizer: totalKgProduced * 0.10, // €0.10 per kg (concime)
    seeds: filteredHarvests.length * 0.50, // €0.50 per varietà
    tools: 0, // Optional - user can add
  };

  const totalCosts = estimatedCosts.water + estimatedCosts.fertilizer + estimatedCosts.seeds + (estimatedCosts.tools || 0);
  const netSavings = marketValueEuro - totalCosts;

  // Calculate average rating
  const ratings = filteredHarvests.filter(h => h.rating).map(h => h.rating!);
  const avgRating = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
    : 0;

  // Group by month
  const byMonth = new Map<number, { kg: number; harvests: number; value: number }>();
  
  filteredHarvests.forEach(h => {
    const date = new Date(h.date);
    const month = date.getMonth() + 1; // 1-12
    
    const existing = byMonth.get(month) || { kg: 0, harvests: 0, value: 0 };
    
    let kg = 0;
    if (h.unit === 'kg') {
      kg = h.quantity;
    } else if (h.unit === 'g') {
      kg = h.quantity / 1000;
    } else {
      kg = h.quantity * 0.1;
    }
    
    const season = (date.getMonth() >= 5 && date.getMonth() <= 8) ? 'Summer' : 'Winter';
    const pricePerKg = getMarketPrice(h.plantName || 'UNKNOWN', season);
    
    existing.kg += kg;
    existing.harvests += 1;
    existing.value += kg * pricePerKg;
    
    byMonth.set(month, existing);
  });

  // Group by plant
  const byPlant = new Map<string, { totalKg: number; harvests: number; value: number }>();
  
  filteredHarvests.forEach(h => {
    const plantName = h.plantName || 'UNKNOWN';
    const existing = byPlant.get(plantName) || { totalKg: 0, harvests: 0, value: 0 };
    
    let kg = 0;
    if (h.unit === 'kg') {
      kg = h.quantity;
    } else if (h.unit === 'g') {
      kg = h.quantity / 1000;
    } else {
      kg = h.quantity * 0.1;
    }
    
    const date = new Date(h.date);
    const season = (date.getMonth() >= 5 && date.getMonth() <= 8) ? 'Summer' : 'Winter';
    const pricePerKg = getMarketPrice(plantName, season);
    
    existing.totalKg += kg;
    existing.harvests += 1;
    existing.value += kg * pricePerKg;
    
    byPlant.set(plantName, existing);
  });

  return {
    totalKgProduced: Math.round(totalKgProduced * 100) / 100,
    marketValueEuro: Math.round(marketValueEuro * 100) / 100,
    estimatedCosts,
    netSavings: Math.round(netSavings * 100) / 100,
    harvestCount: filteredHarvests.length,
    avgRating: Math.round(avgRating * 100) / 100,
    byMonth: Array.from(byMonth.entries()).map(([month, data]) => ({
      month,
      kg: Math.round(data.kg * 100) / 100,
      harvests: data.harvests,
      value: Math.round(data.value * 100) / 100,
    })),
    byPlant: Array.from(byPlant.entries()).map(([plantName, data]) => ({
      plantName,
      totalKg: Math.round(data.totalKg * 100) / 100,
      harvests: data.harvests,
      value: Math.round(data.value * 100) / 100,
    })),
  };
};

