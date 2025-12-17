/**
 * Custom Crop Service
 * Gestisce colture personalizzate e apprendimento automatico
 */

import { CustomCrop, CropLearningEvent, LearnedPatterns, CropStats } from '../types/customCrop';
import { useStorage } from '../packages/core/hooks/useStorage';

/**
 * Crea una nuova coltura personalizzata
 */
export const createCustomCrop = async (
  commonName: string,
  scientificName?: string,
  family?: string,
  gardenId?: string,
  initialData?: CustomCrop['initial_data']
): Promise<CustomCrop> => {
  const { storageProvider } = useStorage();
  
  const newCrop: Omit<CustomCrop, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
    garden_id: gardenId,
    common_name: commonName,
    scientific_name: scientificName,
    family,
    initial_data: initialData,
    learned_patterns: {
      plantingTiming: { successfulDates: [], failedDates: [], confidence: 0 },
      harvestTiming: { successfulDates: [], confidence: 0 },
      successfulWorks: [],
      successfulTreatments: [],
      recurringProblems: []
    },
    stats: {
      totalPlantings: 0,
      totalHarvests: 0,
      successRate: 0
    }
  };
  
  return await storageProvider.createCustomCrop(newCrop);
};

/**
 * Aggiorna i pattern appresi dopo un evento
 */
export const updateLearnedPatterns = async (
  cropId: string,
  event: CropLearningEvent
): Promise<CustomCrop> => {
  const { storageProvider } = useStorage();
  const crop = await storageProvider.getCustomCrop(cropId);
  
  if (!crop) {
    throw new Error(`Custom crop ${cropId} not found`);
  }
  
  const patterns = { ...crop.learned_patterns };
  
  // Aggiorna pattern in base al tipo di evento
  switch (event.event_type) {
    case 'planting':
      patterns.plantingTiming.successfulDates.push(event.event_data.date);
      // Calcola miglior mese
      const plantingMonths = patterns.plantingTiming.successfulDates.map(d => new Date(d).getMonth());
      const monthCounts = plantingMonths.reduce((acc, month) => {
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);
      const bestMonth = Object.entries(monthCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
      if (bestMonth) {
        patterns.plantingTiming.bestMonth = parseInt(bestMonth);
      }
      patterns.plantingTiming.confidence = Math.min(0.9, patterns.plantingTiming.successfulDates.length / 5);
      break;
      
    case 'harvest':
      patterns.harvestTiming.successfulDates.push(event.event_data.date);
      if (event.outcome?.yield) {
        const yields = patterns.harvestTiming.successfulDates
          .map(d => {
            // Trova evento harvest corrispondente per ottenere yield
            return event.outcome?.yield || 0;
          })
          .filter(y => y > 0);
        if (yields.length > 0) {
          const avgYield = yields.reduce((a, b) => a + b, 0) / yields.length;
          // Calcola giorni medi a raccolta se abbiamo date di planting
          // Questo richiederebbe di correlare con eventi planting
        }
      }
      patterns.harvestTiming.confidence = Math.min(0.9, patterns.harvestTiming.successfulDates.length / 5);
      break;
      
    case 'work':
      const workType = event.event_data.workType;
      if (workType) {
        const existingWork = patterns.successfulWorks.find(w => w.workType === workType);
        if (existingWork) {
          existingWork.frequency++;
        } else {
          patterns.successfulWorks.push({
            workType,
            timing: event.event_data.date,
            frequency: 1
          });
        }
      }
      break;
      
    case 'treatment':
      const productName = event.event_data.productName;
      const problem = event.event_data.problem;
      if (productName && problem) {
        const existingTreatment = patterns.successfulTreatments.find(
          t => t.productName === productName && t.problemSolved === problem
        );
        if (existingTreatment) {
          existingTreatment.frequency++;
        } else {
          patterns.successfulTreatments.push({
            productName,
            timing: event.event_data.date,
            problemSolved: problem,
            frequency: 1
          });
        }
      }
      break;
      
    case 'problem':
      const problemMonth = new Date(event.event_data.date).getMonth();
      const existingProblem = patterns.recurringProblems.find(
        p => p.problem === event.event_data.problem && p.month === problemMonth
      );
      if (existingProblem) {
        existingProblem.frequency++;
      } else {
        patterns.recurringProblems.push({
          problem: event.event_data.problem || 'Unknown',
          month: problemMonth,
          frequency: 1
        });
      }
      break;
  }
  
  // Aggiorna statistiche
  const stats: CropStats = {
    ...crop.stats,
    totalPlantings: patterns.plantingTiming.successfulDates.length,
    totalHarvests: patterns.harvestTiming.successfulDates.length,
    successRate: patterns.plantingTiming.successfulDates.length > 0
      ? patterns.harvestTiming.successfulDates.length / patterns.plantingTiming.successfulDates.length
      : 0
  };
  
  return await storageProvider.updateCustomCrop(cropId, {
    learned_patterns: patterns,
    stats
  });
};

/**
 * Ottiene suggerimenti basati su pattern appresi
 */
export const getSuggestions = (crop: CustomCrop): {
  planting?: { month: number; confidence: number; message: string };
  harvest?: { avgDays: number; confidence: number; message: string };
  works?: Array<{ workType: string; timing: string; message: string }>;
  treatments?: Array<{ productName: string; problem: string; message: string }>;
} => {
  const suggestions: any = {};
  
  // Suggerimento semina
  if (crop.learned_patterns.plantingTiming.bestMonth !== undefined && 
      crop.learned_patterns.plantingTiming.confidence > 0.4) {
    suggestions.planting = {
      month: crop.learned_patterns.plantingTiming.bestMonth,
      confidence: crop.learned_patterns.plantingTiming.confidence,
      message: `Basandoti sulla tua storia, il periodo migliore per seminare è il mese ${crop.learned_patterns.plantingTiming.bestMonth + 1}`
    };
  }
  
  // Suggerimento raccolta
  if (crop.learned_patterns.harvestTiming.avgDaysToHarvest && 
      crop.learned_patterns.harvestTiming.confidence > 0.4) {
    suggestions.harvest = {
      avgDays: crop.learned_patterns.harvestTiming.avgDaysToHarvest,
      confidence: crop.learned_patterns.harvestTiming.confidence,
      message: `In media, la raccolta avviene dopo ${crop.learned_patterns.harvestTiming.avgDaysToHarvest} giorni dalla semina`
    };
  }
  
  // Suggerimenti lavorazioni
  if (crop.learned_patterns.successfulWorks.length > 0) {
    suggestions.works = crop.learned_patterns.successfulWorks
      .filter(w => w.frequency >= 2)
      .map(w => ({
        workType: w.workType,
        timing: w.timing,
        message: `La lavorazione "${w.workType}" ha funzionato bene ${w.frequency} volte`
      }));
  }
  
  // Suggerimenti trattamenti
  if (crop.learned_patterns.successfulTreatments.length > 0) {
    suggestions.treatments = crop.learned_patterns.successfulTreatments
      .filter(t => t.frequency >= 2)
      .map(t => ({
        productName: t.productName,
        problem: t.problemSolved,
        message: `"${t.productName}" ha risolto "${t.problemSolved}" ${t.frequency} volte`
      }));
  }
  
  return suggestions;
};

/**
 * Analizza la storia degli eventi e calcola pattern
 */
export const analyzeHistory = async (cropId: string): Promise<LearnedPatterns> => {
  const { storageProvider } = useStorage();
  const events = await storageProvider.getLearningEvents(cropId);
  const crop = await storageProvider.getCustomCrop(cropId);
  
  if (!crop) {
    throw new Error(`Custom crop ${cropId} not found`);
  }
  
  // Processa ogni evento per aggiornare pattern
  for (const event of events) {
    await updateLearnedPatterns(cropId, event);
  }
  
  const updatedCrop = await storageProvider.getCustomCrop(cropId);
  return updatedCrop!.learned_patterns;
};

