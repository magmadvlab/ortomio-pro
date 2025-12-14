/**
 * Harvest Engine
 * Gestisce indici maturazione, raccolta scalare, conservazione
 */

import { GardenTask } from '../types';
import { harvestIndicators } from '../data/harvestIndicators';

export interface HarvestReadiness {
  isReady: boolean;
  readinessScore: number; // 0-100
  indicators: string[];
  optimalWindow: { start: Date; end: Date };
  urgency: 'low' | 'medium' | 'high';
}

/**
 * Verifica se pronto per raccolta
 */
export function checkHarvestReadiness(
  task: GardenTask,
  plantName: string,
  currentDate: Date
): HarvestReadiness {
  const indicator = harvestIndicators[plantName];
  if (!indicator) {
    return {
      isReady: false,
      readinessScore: 0,
      indicators: [],
      optimalWindow: { start: currentDate, end: currentDate },
      urgency: 'low',
    };
  }

  const plantingDate = new Date(task.date);
  const daysFromPlanting = Math.ceil(
    (currentDate.getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const window = indicator.optimalHarvestWindow.daysFromPlanting;
  const isInWindow = daysFromPlanting >= window.min && daysFromPlanting <= window.max;

  // Calcola score di maturazione
  let readinessScore = 0;
  if (daysFromPlanting < window.min) {
    readinessScore = (daysFromPlanting / window.min) * 50; // 0-50% se troppo presto
  } else if (daysFromPlanting <= window.max) {
    readinessScore = 50 + ((daysFromPlanting - window.min) / (window.max - window.min)) * 50; // 50-100%
  } else {
    readinessScore = 100 - Math.min(30, (daysFromPlanting - window.max) * 2); // Cala dopo finestra
  }

  const urgency: 'low' | 'medium' | 'high' =
    daysFromPlanting > window.max ? 'high' : isInWindow ? 'medium' : 'low';

  const optimalWindow = {
    start: new Date(plantingDate.getTime() + window.min * 24 * 60 * 60 * 1000),
    end: new Date(plantingDate.getTime() + window.max * 24 * 60 * 60 * 1000),
  };

  return {
    isReady: readinessScore >= 70,
    readinessScore: Math.max(0, Math.min(100, readinessScore)),
    indicators: [...indicator.visualIndicators, ...indicator.tactileIndicators],
    optimalWindow,
    urgency,
  };
}

/**
 * Suggerisce raccolta scalare
 */
export function suggestScalarHarvest(
  plantName: string,
  lastHarvestDate?: Date
): { shouldHarvest: boolean; interval: number; reason: string } {
  const intervals: Record<string, number> = {
    Zucchina: 2, // giorni
    Fagiolo: 3,
    Pomodoro: 4,
    Peperone: 5,
    Lattuga: 7,
  };

  const interval = intervals[plantName] || 7;

  if (!lastHarvestDate) {
    return {
      shouldHarvest: true,
      interval,
      reason: `Prima raccolta per ${plantName}`,
    };
  }

  const daysSinceLastHarvest = Math.ceil(
    (new Date().getTime() - lastHarvestDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return {
    shouldHarvest: daysSinceLastHarvest >= interval,
    interval,
    reason: daysSinceLastHarvest >= interval
      ? `${plantName}: ${daysSinceLastHarvest} giorni dall'ultima raccolta. Controlla maturazione.`
      : `Prossima raccolta tra ${interval - daysSinceLastHarvest} giorni`,
  };
}

