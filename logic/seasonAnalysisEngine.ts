/**
 * Season Analysis Engine
 * Analizza stagione completa per identificare successi, fallimenti, correlazioni e suggerimenti per anno successivo
 */

import { Garden, GardenTask, HarvestLogData } from '../types';
import { ZoneMemory, SeasonAnalysis, PlantingRecord } from '../types/memory';
import { getZoneMemory } from '../services/gardenMemoryService';
import { getSeasonForDate } from '../utils/seasonalAdjustment';

/**
 * Analizza una stagione completa
 */
export async function analyzeSeason(
  garden: Garden,
  year: number,
  season: 'Summer' | 'Winter'
): Promise<SeasonAnalysis> {
  const successes: SeasonAnalysis['successes'] = [];
  const failures: SeasonAnalysis['failures'] = [];
  const insights: SeasonAnalysis['insights'] = [];
  const nextYearAdjustments: SeasonAnalysis['nextYearAdjustments'] = [];

  // Recupera memoria di tutte le zone
  const zoneMemories: Map<string, ZoneMemory> = new Map();
  
  // Per ora assumiamo che garden.id possa essere usato come zoneId
  // In futuro, recuperare tutte le zone del giardino
  const zoneMemory = await getZoneMemory(garden.id, garden.id);
  if (zoneMemory) {
    zoneMemories.set(garden.id, zoneMemory);
  }

  // Analizza piantagioni della stagione
  for (const [zoneId, memory] of zoneMemories) {
    const seasonPlantings = memory.plantingHistory.filter((p) => {
      const plantingSeason = getSeasonForDate(p.date, garden.coordinates?.latitude || 0);
      return p.year === year && plantingSeason === season;
    });

    if (seasonPlantings.length === 0) continue;

    // Confronta con anno precedente
    const previousYearPlantings = memory.plantingHistory.filter(
      (p) => p.year === year - 1 && getSeasonForDate(p.date, garden.coordinates?.latitude || 0) === season
    );

    // Identifica successi
    const seasonSuccesses = identifySuccesses(
      seasonPlantings,
      previousYearPlantings,
      zoneId,
      memory
    );
    successes.push(...seasonSuccesses);

    // Identifica fallimenti
    const seasonFailures = identifyFailures(
      seasonPlantings,
      previousYearPlantings,
      zoneId,
      memory
    );
    failures.push(...seasonFailures);

    // Trova correlazioni
    const seasonCorrelations = findCorrelations(seasonPlantings, memory);
    insights.push(...seasonCorrelations);

    // Genera aggiustamenti per anno successivo
    const adjustments = generateNextYearRecommendations(
      seasonPlantings,
      seasonSuccesses,
      seasonFailures,
      zoneId
    );
    nextYearAdjustments.push(...adjustments);
  }

  // Calcola statistiche generali
  const statistics = calculateStatistics(successes, failures, zoneMemories, year, season);

  return {
    gardenId: garden.id,
    year,
    season,
    successes,
    failures,
    insights,
    nextYearAdjustments,
    statistics,
    analyzedAt: new Date(),
    userReviewed: false,
  };
}

/**
 * Identifica successi e loro cause probabili
 */
function identifySuccesses(
  currentPlantings: PlantingRecord[],
  previousPlantings: PlantingRecord[],
  zoneId: string,
  memory: ZoneMemory
): SeasonAnalysis['successes'] {
  const successes: SeasonAnalysis['successes'] = [];

  for (const current of currentPlantings) {
    // Trova piantagione equivalente nell'anno precedente
    const previous = previousPlantings.find(
      (p) => p.plant === current.plant && p.variety === current.variety
    );

    if (!previous) continue;

    // Calcola miglioramento
    const yieldImprovement = ((current.result.yield - previous.result.yield) / previous.result.yield) * 100;
    const qualityImprovement = current.result.quality - previous.result.quality;

    // Se miglioramento significativo (>20% resa o +1 qualità)
    if (yieldImprovement > 20 || qualityImprovement >= 1) {
      // Identifica cause probabili
      const likelyCause = identifyLikelyCause(current, previous, memory);

      successes.push({
        plant: current.plant,
        zone: zoneId,
        improvement: Math.round(yieldImprovement),
        likelyCause,
        recommendation: generateSuccessRecommendation(current, previous, likelyCause),
      });
    }
  }

  return successes;
}

/**
 * Identifica fallimenti e loro cause
 */
function identifyFailures(
  currentPlantings: PlantingRecord[],
  previousPlantings: PlantingRecord[],
  zoneId: string,
  memory: ZoneMemory
): SeasonAnalysis['failures'] {
  const failures: SeasonAnalysis['failures'] = [];

  for (const current of currentPlantings) {
    const previous = previousPlantings.find(
      (p) => p.plant === current.plant && p.variety === current.variety
    );

    // Se non c'è precedente, confronta con media zona
    const expectedYield = previous
      ? previous.result.yield
      : memory.plantingHistory
          .filter((p) => p.plant === current.plant)
          .reduce((sum, p) => sum + p.result.yield, 0) /
        Math.max(1, memory.plantingHistory.filter((p) => p.plant === current.plant).length);

    const loss = expectedYield > 0 ? ((expectedYield - current.result.yield) / expectedYield) * 100 : 0;

    // Se perdita significativa (>30%)
    if (loss > 30) {
      const likelyCause = identifyFailureCause(current, previous, memory);
      const correlation = identifyFailureCorrelations(current, memory);

      failures.push({
        plant: current.plant,
        zone: zoneId,
        loss: Math.round(loss),
        likelyCause,
        correlation,
        recommendation: generateFailureRecommendation(current, likelyCause, correlation),
      });
    }
  }

  return failures;
}

/**
 * Trova correlazioni nascoste
 */
function findCorrelations(
  plantings: PlantingRecord[],
  memory: ZoneMemory
): SeasonAnalysis['insights'] {
  const insights: SeasonAnalysis['insights'] = [];

  // Analizza correlazioni esistenti nella memoria
  for (const correlation of memory.correlations) {
    if (correlation.strength > 0.6 && correlation.examplesCount >= 3) {
      insights.push({
        type: 'correlation',
        finding: `${correlation.factorDescription || correlation.factorType}: ${
          correlation.impactType === 'positive' ? 'miglioramento' : 'peggioramento'
        } di ${Math.round(correlation.strength * 100)}%`,
        confidence: correlation.strength,
        action: correlation.impactType === 'positive'
          ? `Ripeti questa strategia`
          : `Evita questa condizione`,
      });
    }
  }

  // Analizza pattern di timing
  const timingInsights = analyzeTimingPatterns(plantings, memory);
  insights.push(...timingInsights);

  return insights;
}

/**
 * Analizza pattern di timing
 */
function analyzeTimingPatterns(
  plantings: PlantingRecord[],
  memory: ZoneMemory
): SeasonAnalysis['insights'] {
  const insights: SeasonAnalysis['insights'] = [];

  // Raggruppa per pianta
  const plantGroups = new Map<string, PlantingRecord[]>();
  for (const planting of plantings) {
    if (!plantGroups.has(planting.plant)) {
      plantGroups.set(planting.plant, []);
    }
    plantGroups.get(planting.plant)!.push(planting);
  }

  for (const [plant, records] of plantGroups) {
    if (records.length < 2) continue;

    // Trova data migliore e peggiore
    const sortedByYield = [...records].sort((a, b) => b.result.yield - a.result.yield);
    const best = sortedByYield[0];
    const worst = sortedByYield[sortedByYield.length - 1];

    if (best.result.yield > worst.result.yield * 1.5) {
      const daysDiff = Math.abs(
        (best.date.getTime() - worst.date.getTime()) / (1000 * 60 * 60 * 24)
      );

      insights.push({
        type: 'timing',
        finding: `${plant}: resa ${Math.round(
          (best.result.yield / worst.result.yield) * 100
        )}% migliore trapiantando il ${best.date.toLocaleDateString('it-IT', {
          month: 'long',
          day: 'numeric',
        })} invece del ${worst.date.toLocaleDateString('it-IT', { month: 'long', day: 'numeric' })}`,
        confidence: 0.7,
        action: `Ripeti trapianto intorno al ${best.date.toLocaleDateString('it-IT', {
          month: 'long',
          day: 'numeric',
        })}`,
      });
    }
  }

  return insights;
}

/**
 * Genera raccomandazioni per anno successivo
 */
function generateNextYearRecommendations(
  plantings: PlantingRecord[],
  successes: SeasonAnalysis['successes'],
  failures: SeasonAnalysis['failures'],
  zoneId: string
): SeasonAnalysis['nextYearAdjustments'] {
  const adjustments: SeasonAnalysis['nextYearAdjustments'] = [];

  // Da successi: ripeti strategie vincenti
  for (const success of successes) {
    if (success.improvement > 30) {
      adjustments.push({
        zone: zoneId,
        plant: success.plant,
        change: success.recommendation,
        reason: `Miglioramento del ${success.improvement}% nell'anno corrente`,
      });
    }
  }

  // Da fallimenti: evita errori
  for (const failure of failures) {
    if (failure.loss > 40) {
      adjustments.push({
        zone: zoneId,
        plant: failure.plant,
        change: failure.recommendation,
        reason: `Perdita del ${failure.loss}% nell'anno corrente: ${failure.likelyCause}`,
      });
    }
  }

  return adjustments;
}

/**
 * Identifica causa probabile di successo
 */
function identifyLikelyCause(
  current: PlantingRecord,
  previous: PlantingRecord,
  memory: ZoneMemory
): string {
  const causes: string[] = [];

  // Confronta date
  const daysDiff = (current.date.getTime() - previous.date.getTime()) / (1000 * 60 * 60 * 24);
  if (Math.abs(daysDiff) > 7) {
    causes.push(
      daysDiff > 0
        ? `Trapianto ${Math.round(daysDiff)} giorni dopo`
        : `Trapianto ${Math.round(Math.abs(daysDiff))} giorni prima`
    );
  }

  // Confronta condizioni meteo
  if (current.weatherConditions.rain < previous.weatherConditions.rain * 0.7) {
    causes.push('Irrigazione più controllata');
  }

  // Confronta problemi
  if (current.result.problems.length < previous.result.problems.length) {
    causes.push('Meno problemi fitosanitari');
  }

  // Confronta trattamenti efficaci
  const effectiveTreatments = current.result.treatments.filter((t) => t.effective).length;
  const previousEffective = previous.result.treatments.filter((t) => t.effective).length;
  if (effectiveTreatments > previousEffective) {
    causes.push('Trattamenti più efficaci');
  }

  return causes.length > 0 ? causes.join(', ') : 'Condizioni migliori generali';
}

/**
 * Identifica causa probabile di fallimento
 */
function identifyFailureCause(
  current: PlantingRecord,
  previous: PlantingRecord | undefined,
  memory: ZoneMemory
): string {
  const causes: string[] = [];

  // Problemi registrati
  if (current.result.problems.length > 0) {
    causes.push(`Problemi: ${current.result.problems.join(', ')}`);
  }

  // Gelate durante ciclo
  if (current.weatherConditions.frosts > 0) {
    causes.push(`${current.weatherConditions.frosts} gelate durante ciclo`);
  }

  // Confronta con precedente se disponibile
  if (previous) {
    const daysDiff = (current.date.getTime() - previous.date.getTime()) / (1000 * 60 * 60 * 24);
    if (daysDiff < -14) {
      causes.push(`Trapianto troppo presto (${Math.round(Math.abs(daysDiff))} giorni prima)`);
    } else if (daysDiff > 14) {
      causes.push(`Trapianto troppo tardi (${Math.round(daysDiff)} giorni dopo)`);
    }
  }

  // Qualità bassa
  if (current.result.quality < 3) {
    causes.push('Qualità bassa del raccolto');
  }

  return causes.length > 0 ? causes.join(', ') : 'Cause non identificate';
}

/**
 * Identifica correlazioni per fallimento
 */
function identifyFailureCorrelations(
  current: PlantingRecord,
  memory: ZoneMemory
): Array<{ factor: string; impact: number }> {
  const correlations: Array<{ factor: string; impact: number }> = [];

  // Cerca correlazioni negative nella memoria
  for (const corr of memory.correlations) {
    if (corr.impactType === 'negative' && corr.strength > 0.5) {
      // Verifica se si applica a questa piantagione
      const applies = checkCorrelationApplies(corr, current);
      if (applies) {
        correlations.push({
          factor: corr.factorDescription || corr.factorType,
          impact: Math.round(corr.strength * 100),
        });
      }
    }
  }

  return correlations;
}

/**
 * Verifica se una correlazione si applica a una piantagione
 */
function checkCorrelationApplies(
  correlation: ZoneMemory['correlations'][0],
  planting: PlantingRecord
): boolean {
  // Logica semplificata: verifica se il fattore è presente nella piantagione
  const factorType = correlation.factorType.toLowerCase();

  if (factorType.includes('early_planting')) {
    // Verifica se piantagione è stata anticipata
    return true; // Semplificato
  }

  if (factorType.includes('high_rain')) {
    return planting.weatherConditions.rain > 500; // mm
  }

  if (factorType.includes('clay_soil')) {
    return planting.soilConditions.type.toLowerCase().includes('clay');
  }

  return false;
}

/**
 * Genera raccomandazione per successo
 */
function generateSuccessRecommendation(
  current: PlantingRecord,
  previous: PlantingRecord,
  cause: string
): string {
  if (cause.includes('Trapianto')) {
    return `Ripeti trapianto intorno al ${current.date.toLocaleDateString('it-IT', {
      month: 'long',
      day: 'numeric',
    })}`;
  }

  if (cause.includes('Irrigazione')) {
    return 'Mantieni strategia irrigazione controllata';
  }

  if (cause.includes('Trattamenti')) {
    const effectiveTreatments = current.result.treatments
      .filter((t) => t.effective)
      .map((t) => t.product)
      .join(', ');
    return `Ripeti trattamenti efficaci: ${effectiveTreatments}`;
  }

  return 'Ripeti questa strategia';
}

/**
 * Genera raccomandazione per fallimento
 */
function generateFailureRecommendation(
  current: PlantingRecord,
  cause: string,
  correlations: Array<{ factor: string; impact: number }>
): string {
  if (cause.includes('troppo presto')) {
    // Suggerisci data più tardiva
    const suggestedDate = new Date(current.date);
    suggestedDate.setDate(suggestedDate.getDate() + 14);
    return `Trapianta dopo il ${suggestedDate.toLocaleDateString('it-IT', {
      month: 'long',
      day: 'numeric',
    })}`;
  }

  if (cause.includes('gelate')) {
    return 'Evita trapianti prima della fine del rischio gelate';
  }

  if (correlations.length > 0) {
    const topCorrelation = correlations[0];
    return `Evita: ${topCorrelation.factor} (impatto: -${topCorrelation.impact}%)`;
  }

  return 'Verifica condizioni terreno e meteo prima di trapiantare';
}

/**
 * Calcola statistiche generali
 */
function calculateStatistics(
  successes: SeasonAnalysis['successes'],
  failures: SeasonAnalysis['failures'],
  zoneMemories: Map<string, ZoneMemory>,
  year: number,
  season: 'Summer' | 'Winter'
): SeasonAnalysis['statistics'] {
  let totalYield = 0;
  let totalQuality = 0;
  let totalProblems = 0;
  let count = 0;

  for (const memory of zoneMemories.values()) {
    const seasonPlantings = memory.plantingHistory.filter((p) => {
      // Semplificato: assumiamo che memory abbia già i dati della stagione
      return p.year === year;
    });

    for (const planting of seasonPlantings) {
      totalYield += planting.result.yield;
      totalQuality += planting.result.quality;
      totalProblems += planting.result.problems.length;
      count++;
    }
  }

  return {
    totalYield: Math.round(totalYield * 100) / 100,
    avgQuality: count > 0 ? Math.round((totalQuality / count) * 10) / 10 : 0,
    totalProblems,
  };
}

