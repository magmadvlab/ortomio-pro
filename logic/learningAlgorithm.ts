/**
 * Learning Algorithm
 * Algoritmi avanzati per l'apprendimento automatico dalle azioni dell'utente
 */

import { CustomCrop, CropLearningEvent, LearnedPatterns } from '../types/customCrop';

/**
 * Calcola la confidenza basata sul numero di eventi
 */
export const calculateConfidence = (eventCount: number, minEvents: number = 3): number => {
  if (eventCount < minEvents) {
    return Math.min(0.4, eventCount / minEvents);
  }
  if (eventCount < 5) {
    return 0.4 + ((eventCount - minEvents) / (5 - minEvents)) * 0.3; // 0.4 - 0.7
  }
  return Math.min(0.9, 0.7 + ((eventCount - 5) / 10) * 0.2); // 0.7 - 0.9
};

/**
 * Analizza pattern di timing per identificare il miglior periodo
 */
export const analyzeTimingPattern = (
  successfulDates: string[],
  failedDates: string[] = []
): {
  bestMonth?: number;
  confidence: number;
  avgDayOfYear?: number;
} => {
  if (successfulDates.length === 0) {
    return { confidence: 0 };
  }

  // Estrai mesi dalle date di successo
  const months = successfulDates.map(date => new Date(date).getMonth());
  const monthCounts = months.reduce((acc, month) => {
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  // Trova il mese più frequente
  const bestMonth = Object.entries(monthCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0];

  // Calcola giorno medio dell'anno per maggiore precisione
  const dayOfYears = successfulDates.map(date => {
    const d = new Date(date);
    const start = new Date(d.getFullYear(), 0, 0);
    const diff = d.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  });
  const avgDayOfYear = dayOfYears.reduce((a, b) => a + b, 0) / dayOfYears.length;

  // Calcola confidenza
  const confidence = calculateConfidence(successfulDates.length);

  return {
    bestMonth: bestMonth ? parseInt(bestMonth) : undefined,
    confidence,
    avgDayOfYear: Math.round(avgDayOfYear)
  };
};

/**
 * Calcola giorni medi tra semina e raccolta
 */
export const calculateDaysToHarvest = (
  plantingEvents: CropLearningEvent[],
  harvestEvents: CropLearningEvent[]
): number | undefined => {
  if (plantingEvents.length === 0 || harvestEvents.length === 0) {
    return undefined;
  }

  const days: number[] = [];

  // Per ogni raccolto, trova la semina più recente
  for (const harvest of harvestEvents) {
    const harvestDate = new Date(harvest.event_data.date);
    const recentPlantings = plantingEvents
      .filter(p => new Date(p.event_data.date) <= harvestDate)
      .sort((a, b) => new Date(b.event_data.date).getTime() - new Date(a.event_data.date).getTime());

    if (recentPlantings.length > 0) {
      const plantingDate = new Date(recentPlantings[0].event_data.date);
      const diffTime = harvestDate.getTime() - plantingDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 0) {
        days.push(diffDays);
      }
    }
  }

  if (days.length === 0) {
    return undefined;
  }

  // Calcola media
  return Math.round(days.reduce((a, b) => a + b, 0) / days.length);
};

/**
 * Identifica correlazioni tra lavorazioni e risultati
 */
export const identifyWorkCorrelations = (
  workEvents: CropLearningEvent[],
  harvestEvents: CropLearningEvent[]
): Array<{
  workType: string;
  timing: string; // "X giorni prima semina", "dopo raccolta", etc.
  impact: number; // 0-1, impatto positivo sulla resa
  frequency: number;
}> => {
  const correlations: Array<{
    workType: string;
    timing: string;
    impact: number;
    frequency: number;
  }> = [];

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

  // Per ogni tipo di lavorazione, calcola l'impatto
  for (const [workType, works] of Object.entries(workByType)) {
    // Trova raccolti successivi a queste lavorazioni
    let positiveOutcomes = 0;
    let totalOutcomes = 0;

    for (const work of works) {
      const workDate = new Date(work.event_data.date);
      const subsequentHarvests = harvestEvents.filter(
        h => new Date(h.event_data.date) > workDate
      );

      for (const harvest of subsequentHarvests) {
        totalOutcomes++;
        if (harvest.outcome?.success && harvest.outcome.yield) {
          positiveOutcomes++;
        }
      }
    }

    if (totalOutcomes > 0) {
      const impact = positiveOutcomes / totalOutcomes;
      const timing = works.length > 0 
        ? `${Math.round(works.reduce((sum, w) => {
            const daysDiff = (new Date(w.event_data.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
            return sum + daysDiff;
          }, 0) / works.length)} giorni dalla data attuale`
        : 'Variabile';

      correlations.push({
        workType,
        timing,
        impact,
        frequency: works.length
      });
    }
  }

  return correlations.sort((a, b) => b.impact - a.impact);
};

/**
 * Identifica problemi ricorrenti per mese
 */
export const identifyRecurringProblems = (
  problemEvents: CropLearningEvent[]
): Array<{
  problem: string;
  month: number;
  frequency: number;
  suggestedSolution?: string;
}> => {
  const problemsByMonth: Record<number, Record<string, number>> = {};

  for (const event of problemEvents) {
    const month = new Date(event.event_data.date).getMonth();
    const problem = event.event_data.problem || 'Unknown';

    if (!problemsByMonth[month]) {
      problemsByMonth[month] = {};
    }
    if (!problemsByMonth[month][problem]) {
      problemsByMonth[month][problem] = 0;
    }
    problemsByMonth[month][problem]++;
  }

  const recurring: Array<{
    problem: string;
    month: number;
    frequency: number;
    suggestedSolution?: string;
  }> = [];

  for (const [monthStr, problems] of Object.entries(problemsByMonth)) {
    const month = parseInt(monthStr);
    for (const [problem, frequency] of Object.entries(problems)) {
      if (frequency >= 2) {
        recurring.push({
          problem,
          month,
          frequency,
          // In futuro, si potrebbe aggiungere una logica per suggerire soluzioni
          // basandosi su trattamenti che hanno risolto problemi simili
        });
      }
    }
  }

  return recurring.sort((a, b) => b.frequency - a.frequency);
};

/**
 * Aggiorna i pattern appresi basandosi su tutti gli eventi
 */
export const updatePatternsFromEvents = async (
  events: CropLearningEvent[],
  currentPatterns: LearnedPatterns
): Promise<LearnedPatterns> => {
  const plantingEvents = events.filter(e => e.event_type === 'planting');
  const harvestEvents = events.filter(e => e.event_type === 'harvest');
  const workEvents = events.filter(e => e.event_type === 'work');
  const treatmentEvents = events.filter(e => e.event_type === 'treatment');
  const problemEvents = events.filter(e => e.event_type === 'problem');

  // Aggiorna planting timing
  const successfulPlantings = plantingEvents
    .filter(e => e.outcome?.success !== false)
    .map(e => e.event_data.date);
  const failedPlantings = plantingEvents
    .filter(e => e.outcome?.success === false)
    .map(e => e.event_data.date);
  
  const plantingTiming = analyzeTimingPattern(successfulPlantings, failedPlantings);

  // Aggiorna harvest timing
  const successfulHarvests = harvestEvents
    .filter(e => e.outcome?.success !== false)
    .map(e => e.event_data.date);
  const harvestTiming = analyzeTimingPattern(successfulHarvests);
  
  // Calcola giorni medi a raccolta
  const avgDaysToHarvest = calculateDaysToHarvest(plantingEvents, harvestEvents);

  // Identifica correlazioni lavorazioni
  const workCorrelations = identifyWorkCorrelations(workEvents, harvestEvents);
  const successfulWorks = workCorrelations.map(corr => ({
    workType: corr.workType,
    timing: corr.timing,
    frequency: corr.frequency
  }));

  // Identifica trattamenti efficaci
  const treatmentByProduct: Record<string, { solved: number; total: number }> = {};
  for (const treatment of treatmentEvents) {
    const product = treatment.event_data.productName || 'Unknown';
    const problem = treatment.event_data.problem || 'Unknown';
    
    if (!treatmentByProduct[product]) {
      treatmentByProduct[product] = { solved: 0, total: 0 };
    }
    treatmentByProduct[product].total++;
    if (treatment.outcome?.success) {
      treatmentByProduct[product].solved++;
    }
  }

  const successfulTreatments = Object.entries(treatmentByProduct)
    .filter(([_, stats]) => stats.solved >= 2)
    .map(([product, stats]) => {
      const treatment = treatmentEvents.find(t => t.event_data.productName === product);
      return {
        productName: product,
        timing: treatment?.event_data.date || 'Variabile',
        problemSolved: treatment?.event_data.problem || 'Unknown',
        frequency: stats.solved
      };
    });

  // Identifica problemi ricorrenti
  const recurringProblems = identifyRecurringProblems(problemEvents);

  return {
    plantingTiming: {
      successfulDates: successfulPlantings,
      failedDates: failedPlantings,
      bestMonth: plantingTiming.bestMonth,
      confidence: plantingTiming.confidence
    },
    harvestTiming: {
      successfulDates: successfulHarvests,
      avgDaysToHarvest,
      bestMonth: harvestTiming.bestMonth,
      confidence: harvestTiming.confidence
    },
    successfulWorks,
    successfulTreatments,
    recurringProblems
  };
};

