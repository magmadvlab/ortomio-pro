/**
 * Pattern Recognition Engine
 * Rileva pattern locali da dati storici (meteo, malattie, resa, timing)
 */

import { LocalPattern } from '../types/memory';
import { Garden, GardenTask, HarvestLogData } from '../types';
import { getZoneMemory } from '../services/gardenMemoryService';

/**
 * Analizza dati storici per rilevare pattern
 */
export async function analyzeHistoricalData(
  garden: Garden,
  years: number = 3
): Promise<LocalPattern[]> {
  const patterns: LocalPattern[] = [];
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - years;

  // Analizza pattern meteo
  const weatherPatterns = await detectWeatherPatterns(garden, startYear, currentYear);
  patterns.push(...weatherPatterns);

  // Analizza pattern malattie
  const diseasePatterns = await detectDiseasePatterns(garden, startYear, currentYear);
  patterns.push(...diseasePatterns);

  // Analizza pattern resa
  const yieldPatterns = await detectYieldPatterns(garden, startYear, currentYear);
  patterns.push(...yieldPatterns);

  // Analizza pattern timing
  const timingPatterns = await detectTimingPatterns(garden, startYear, currentYear);
  patterns.push(...timingPatterns);

  return patterns;
}

/**
 * Rileva pattern meteo (gelate tardive, siccità, ondate di calore)
 */
async function detectWeatherPatterns(
  garden: Garden,
  startYear: number,
  endYear: number
): Promise<LocalPattern[]> {
  const patterns: LocalPattern[] = [];

  // TODO: Integrare con dati meteo storici quando disponibili
  // Per ora, analizza pattern da memoria zone
  if (!garden.coordinates) return patterns;

  // Pattern gelate tardive (dopo aprile)
  // Cerca nelle memorie zone problemi correlati a gelate
  // Questo è un esempio semplificato - in produzione si userebbero dati meteo reali

  return patterns;
}

/**
 * Rileva pattern malattie (quando, dove, condizioni)
 */
async function detectDiseasePatterns(
  garden: Garden,
  startYear: number,
  endYear: number
): Promise<LocalPattern[]> {
  const patterns: LocalPattern[] = [];

  // Analizza memorie zone per problemi ricorrenti
  // TODO: Quando abbiamo accesso a tutte le zone del giardino
  // Per ora, esempio base

  return patterns;
}

/**
 * Rileva pattern resa (date migliori/peggiori)
 */
async function detectYieldPatterns(
  garden: Garden,
  startYear: number,
  endYear: number
): Promise<LocalPattern[]> {
  const patterns: LocalPattern[] = [];

  // Analizza memorie zone per pattern resa
  // TODO: Quando abbiamo accesso a tutte le zone

  return patterns;
}

/**
 * Rileva pattern timing (quando piantare/trapiantare per migliori risultati)
 */
async function detectTimingPatterns(
  garden: Garden,
  startYear: number,
  endYear: number
): Promise<LocalPattern[]> {
  const patterns: LocalPattern[] = [];

  // Analizza memorie zone per pattern timing
  // TODO: Quando abbiamo accesso a tutte le zone

  return patterns;
}

/**
 * Predice prossima occorrenza di un pattern
 */
export function predictNextOccurrence(pattern: LocalPattern): LocalPattern {
  if (!pattern.prediction) {
    // Calcola predizione basata su occorrenze storiche
    const currentYear = new Date().getFullYear();
    const lastOccurrence = pattern.lastOccurrence
      ? new Date(pattern.lastOccurrence)
      : new Date(currentYear - 1, 0, 1);

    // Se pattern è stagionale (ha mesi specifici)
    if (pattern.patternData.months && pattern.patternData.months.length > 0) {
      const avgMonth =
        pattern.patternData.months.reduce((sum, m) => sum + m, 0) /
        pattern.patternData.months.length;
      const nextDate = new Date(currentYear, Math.round(avgMonth) - 1, 15);

      pattern.prediction = {
        nextLikelyDate: nextDate,
        probability: Math.min(0.9, 0.5 + pattern.patternData.confidence * 0.4),
      };
    } else {
      // Pattern non stagionale, predici basandosi su frequenza
      const daysSinceLast = Math.floor(
        (new Date().getTime() - lastOccurrence.getTime()) / (1000 * 60 * 60 * 24)
      );
      const avgDaysBetween = 365 / Math.max(1, pattern.patternData.occurrences);
      const nextDate = new Date(
        lastOccurrence.getTime() + avgDaysBetween * 24 * 60 * 60 * 1000
      );

      pattern.prediction = {
        nextLikelyDate: nextDate,
        probability: Math.min(0.8, pattern.patternData.confidence),
      };
    }
  }

  return pattern;
}

/**
 * Rileva pattern specifico da memoria zona
 */
export async function detectPatternFromZoneMemory(
  zoneId: string,
  gardenId: string,
  patternType: LocalPattern['patternType']
): Promise<LocalPattern | null> {
  const memory = await getZoneMemory(zoneId, gardenId);
  if (!memory) return null;

  // Analizza memoria per pattern specifico
  if (patternType === 'timing') {
    // Pattern timing: date migliori/peggiori
    if (memory.patterns.bestPlantingDate && memory.patterns.worstPlantingDate) {
      const pattern: LocalPattern = {
        gardenId,
        patternType: 'timing',
        patternName: `best_planting_date_zone_${zoneId}`,
        patternDescription: `Data migliore per piantagioni in questa zona`,
        patternData: {
          occurrences: memory.plantingHistory.length,
          confidence: Math.min(0.9, memory.plantingHistory.length / 10),
          months: [memory.patterns.bestPlantingDate.getMonth() + 1],
        },
        affectedZones: [zoneId],
        status: 'active',
        userConfirmed: false,
      };

      return predictNextOccurrence(pattern);
    }
  } else if (patternType === 'disease') {
    // Pattern malattie: problemi ricorrenti
    if (memory.patterns.recurringProblems.length > 0) {
      const mostFrequent = memory.patterns.recurringProblems[0];
      const pattern: LocalPattern = {
        gardenId,
        patternType: 'disease',
        patternName: `recurring_${mostFrequent.problem.toLowerCase().replace(/\s+/g, '_')}_zone_${zoneId}`,
        patternDescription: `${mostFrequent.problem} ricorrente in questa zona`,
        patternData: {
          occurrences: mostFrequent.frequency,
          confidence: Math.min(0.9, mostFrequent.frequency / 5),
          months: mostFrequent.months,
        },
        affectedZones: [zoneId],
        status: 'active',
        userConfirmed: false,
      };

      return predictNextOccurrence(pattern);
    }
  }

  return null;
}

/**
 * Calcola confidence di un pattern basato su occorrenze
 */
export function calculatePatternConfidence(occurrences: number, totalObservations: number): number {
  if (totalObservations === 0) return 0;

  // Confidence aumenta con occorrenze ma ha limite superiore
  const baseConfidence = occurrences / totalObservations;
  
  // Più occorrenze = più confidence (fino a 0.9)
  const occurrenceBonus = Math.min(0.3, occurrences * 0.05);
  
  return Math.min(0.9, baseConfidence + occurrenceBonus);
}

/**
 * Verifica se un pattern è ancora valido o è scaduto
 */
export function isPatternExpired(pattern: LocalPattern, maxAgeYears: number = 3): boolean {
  if (!pattern.firstDetected) return false;

  const ageYears =
    (new Date().getTime() - new Date(pattern.firstDetected).getTime()) /
    (1000 * 60 * 60 * 24 * 365);

  return ageYears > maxAgeYears && pattern.patternData.occurrences < 2;
}

