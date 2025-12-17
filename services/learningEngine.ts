/**
 * Learning Engine
 * Analizza pattern e genera suggerimenti basati su apprendimento automatico
 */

import { CustomCrop, CropLearningEvent, LearnedPatterns } from '../types/customCrop';
import { updateLearnedPatterns, getSuggestions } from './customCropService';

/**
 * Processa un evento e aggiorna i pattern appresi
 */
export const processEvent = async (
  cropId: string,
  event: CropLearningEvent
): Promise<CustomCrop> => {
  return await updateLearnedPatterns(cropId, event);
};

/**
 * Calcola il miglior periodo per la semina
 */
export const calculatePlantingTiming = (crop: CustomCrop): {
  bestMonth?: number;
  confidence: number;
  message: string;
} => {
  const patterns = crop.learned_patterns.plantingTiming;
  
  if (patterns.bestMonth !== undefined && patterns.confidence > 0.4) {
    const monthNames = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
      'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
    
    return {
      bestMonth: patterns.bestMonth,
      confidence: patterns.confidence,
      message: `Periodo migliore: ${monthNames[patterns.bestMonth]} (confidenza: ${Math.round(patterns.confidence * 100)}%)`
    };
  }
  
  return {
    confidence: 0,
    message: 'Dati insufficienti per suggerire un periodo ottimale'
  };
};

/**
 * Calcola il miglior periodo per la raccolta
 */
export const calculateHarvestTiming = (crop: CustomCrop): {
  avgDays?: number;
  confidence: number;
  message: string;
} => {
  const patterns = crop.learned_patterns.harvestTiming;
  
  if (patterns.avgDaysToHarvest && patterns.confidence > 0.4) {
    return {
      avgDays: patterns.avgDaysToHarvest,
      confidence: patterns.confidence,
      message: `Raccolta prevista dopo ${patterns.avgDaysToHarvest} giorni dalla semina (confidenza: ${Math.round(patterns.confidence * 100)}%)`
    };
  }
  
  return {
    confidence: 0,
    message: 'Dati insufficienti per calcolare il periodo di raccolta'
  };
};

/**
 * Trova correlazioni tra lavorazioni e risultati
 */
export const findCorrelations = (crop: CustomCrop): Array<{
  workType: string;
  impact: 'positive' | 'negative' | 'neutral';
  frequency: number;
  message: string;
}> => {
  return crop.learned_patterns.successfulWorks.map(work => ({
    workType: work.workType,
    impact: 'positive' as const,
    frequency: work.frequency,
    message: `La lavorazione "${work.workType}" è stata efficace ${work.frequency} volte`
  }));
};

/**
 * Genera suggerimenti contestuali basati su pattern appresi
 */
export const generateSuggestions = (crop: CustomCrop): {
  planting?: string;
  harvest?: string;
  works?: string[];
  treatments?: string[];
  problems?: string[];
} => {
  const suggestions = getSuggestions(crop);
  const result: any = {};
  
  if (suggestions.planting) {
    result.planting = suggestions.planting.message;
  }
  
  if (suggestions.harvest) {
    result.harvest = suggestions.harvest.message;
  }
  
  if (suggestions.works) {
    result.works = suggestions.works.map(w => w.message);
  }
  
  if (suggestions.treatments) {
    result.treatments = suggestions.treatments.map(t => t.message);
  }
  
  if (crop.learned_patterns.recurringProblems.length > 0) {
    result.problems = crop.learned_patterns.recurringProblems
      .filter(p => p.frequency >= 2)
      .map(p => {
        const monthNames = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
          'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
        return `Problema ricorrente: "${p.problem}" nel mese di ${monthNames[p.month]} (${p.frequency} volte)`;
      });
  }
  
  return result;
};

