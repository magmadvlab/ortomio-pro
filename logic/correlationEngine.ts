/**
 * Correlation Engine
 * Analizza correlazioni avanzate tra fattori e risultati per colture personalizzate
 */

import { CustomCrop, CropLearningEvent } from '../types/customCrop';

export interface Correlation {
  factor: string;
  factorType: 'work' | 'treatment' | 'timing' | 'weather' | 'soil';
  impact: 'positive' | 'negative' | 'neutral';
  strength: number; // 0-1
  confidence: number; // 0-1
  examples: number;
  description: string;
}

/**
 * Analizza correlazioni tra lavorazioni meccaniche e risultati raccolto
 */
export const analyzeWorkYieldCorrelations = (
  workEvents: CropLearningEvent[],
  harvestEvents: CropLearningEvent[]
): Correlation[] => {
  const correlations: Correlation[] = [];

  // Raggruppa lavorazioni per tipo
  const workByType: Record<string, CropLearningEvent[]> = {};
  for (const work of workEvents) {
    const workType = work.event_data.workType;
    if (workType) {
      if (!workByType[workType]) {
        workByType[workType] = [];
      }
      workByType[workType].push(work);
    }
  }

  // Per ogni tipo di lavorazione, calcola correlazione con resa
  for (const [workType, works] of Object.entries(workByType)) {
    if (works.length < 2) continue; // Serve almeno 2 esempi

    const yields: number[] = [];
    const noWorkYields: number[] = [];

    for (const work of works) {
      const workDate = new Date(work.event_data.date);
      
      // Trova raccolti successivi (entro 6 mesi)
      const subsequentHarvests = harvestEvents.filter(h => {
        const harvestDate = new Date(h.event_data.date);
        const daysDiff = (harvestDate.getTime() - workDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff > 0 && daysDiff < 180; // Entro 6 mesi
      });

      for (const harvest of subsequentHarvests) {
        if (harvest.outcome?.yield) {
          yields.push(harvest.outcome.yield);
        }
      }
    }

    // Trova raccolti senza questa lavorazione (gruppo di controllo)
    // Questo è semplificato - in produzione si potrebbe fare un'analisi più sofisticata
    const allHarvests = harvestEvents.filter(h => h.outcome?.yield);
    const avgYieldWithWork = yields.length > 0 
      ? yields.reduce((a, b) => a + b, 0) / yields.length 
      : 0;
    const avgYieldWithoutWork = allHarvests.length > 0
      ? allHarvests.map(h => h.outcome!.yield!).reduce((a, b) => a + b, 0) / allHarvests.length
      : 0;

    if (avgYieldWithWork > 0 && avgYieldWithoutWork > 0) {
      const impactRatio = avgYieldWithWork / avgYieldWithoutWork;
      const strength = Math.min(1, Math.abs(impactRatio - 1));
      const impact = impactRatio > 1.1 ? 'positive' : impactRatio < 0.9 ? 'negative' : 'neutral';
      const confidence = Math.min(0.9, works.length / 5); // Più esempi = più confidenza

      if (strength > 0.1) { // Solo correlazioni significative
        correlations.push({
          factor: workType,
          factorType: 'work',
          impact,
          strength,
          confidence,
          examples: works.length,
          description: `La lavorazione "${workType}" ha ${impact === 'positive' ? 'migliorato' : impact === 'negative' ? 'peggiorato' : 'non influenzato'} la resa del ${Math.round(Math.abs(impactRatio - 1) * 100)}%`
        });
      }
    }
  }

  return correlations.sort((a, b) => b.strength - a.strength);
};

/**
 * Identifica trattamenti che risolvono problemi specifici
 */
export const identifyEffectiveTreatments = (
  treatmentEvents: CropLearningEvent[]
): Correlation[] => {
  const correlations: Correlation[] = [];

  // Raggruppa per prodotto e problema
  const treatmentGroups: Record<string, CropLearningEvent[]> = {};
  for (const treatment of treatmentEvents) {
    const product = treatment.event_data.productName || 'Unknown';
    const problem = treatment.event_data.problem || 'Unknown';
    const key = `${product}::${problem}`;
    
    if (!treatmentGroups[key]) {
      treatmentGroups[key] = [];
    }
    treatmentGroups[key].push(treatment);
  }

  for (const [key, treatments] of Object.entries(treatmentGroups)) {
    if (treatments.length < 2) continue; // Serve almeno 2 esempi

    const [product, problem] = key.split('::');
    const successCount = treatments.filter(t => t.outcome?.success).length;
    const successRate = successCount / treatments.length;
    const strength = successRate;
    const confidence = Math.min(0.9, treatments.length / 5);

    if (successRate >= 0.6) { // Almeno 60% di successo
      correlations.push({
        factor: product,
        factorType: 'treatment',
        impact: 'positive',
        strength,
        confidence,
        examples: treatments.length,
        description: `"${product}" ha risolto "${problem}" nel ${Math.round(successRate * 100)}% dei casi`
      });
    }
  }

  return correlations.sort((a, b) => b.strength - a.strength);
};

/**
 * Calcola il miglior timing per ogni operazione
 */
export const calculateOptimalTiming = (
  events: CropLearningEvent[],
  operationType: 'planting' | 'harvest' | 'work' | 'treatment'
): {
  bestMonth?: number;
  bestDayOfYear?: number;
  confidence: number;
  message: string;
} => {
  const filteredEvents = events.filter(e => {
    switch (operationType) {
      case 'planting':
        return e.event_type === 'planting';
      case 'harvest':
        return e.event_type === 'harvest';
      case 'work':
        return e.event_type === 'work';
      case 'treatment':
        return e.event_type === 'treatment';
      default:
        return false;
    }
  });

  if (filteredEvents.length === 0) {
    return {
      confidence: 0,
      message: 'Dati insufficienti per calcolare il timing ottimale'
    };
  }

  const successfulEvents = filteredEvents.filter(e => e.outcome?.success !== false);
  
  if (successfulEvents.length === 0) {
    return {
      confidence: 0,
      message: 'Nessun evento di successo trovato'
    };
  }

  // Calcola mese migliore
  const months = successfulEvents.map(e => new Date(e.event_data.date).getMonth());
  const monthCounts = months.reduce((acc, month) => {
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const bestMonth = Object.entries(monthCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0];

  // Calcola giorno medio dell'anno
  const dayOfYears = successfulEvents.map(e => {
    const d = new Date(e.event_data.date);
    const start = new Date(d.getFullYear(), 0, 0);
    const diff = d.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  });
  const bestDayOfYear = Math.round(
    dayOfYears.reduce((a, b) => a + b, 0) / dayOfYears.length
  );

  const confidence = Math.min(0.9, successfulEvents.length / 5);
  const monthNames = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];

  const parsedBestMonth = bestMonth ? parseInt(bestMonth) : undefined;
  return {
    bestMonth: parsedBestMonth,
    bestDayOfYear,
    confidence,
    message: parsedBestMonth !== undefined && parsedBestMonth >= 0 && parsedBestMonth < 12
      ? `Periodo ottimale: ${monthNames[parsedBestMonth]} (confidenza: ${Math.round(confidence * 100)}%)`
      : 'Timing ottimale calcolato'
  };
};

/**
 * Trova tutte le correlazioni per una coltura personalizzata
 */
export const findAllCorrelations = (crop: CustomCrop, events: CropLearningEvent[]): Correlation[] => {
  const workEvents = events.filter(e => e.event_type === 'work');
  const harvestEvents = events.filter(e => e.event_type === 'harvest');
  const treatmentEvents = events.filter(e => e.event_type === 'treatment');

  const workCorrelations = analyzeWorkYieldCorrelations(workEvents, harvestEvents);
  const treatmentCorrelations = identifyEffectiveTreatments(treatmentEvents);

  return [...workCorrelations, ...treatmentCorrelations];
};

