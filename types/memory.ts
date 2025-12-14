/**
 * Memory Types
 * Interfacce per memoria contestuale profonda del giardino
 */

import { Garden } from './types';

/**
 * Record completo di una piantagione con contesto
 */
export interface PlantingRecord {
  year: number;
  plant: string;
  variety?: string;
  method: 'Seed' | 'Seedling';
  date: Date;
  soilConditions: {
    type: string;
    pH?: number;
    compaction?: number; // 0-1, 0 = molto compatto, 1 = molto arieggiato
  };
  weatherConditions: {
    avgTemp: number;
    rain: number; // mm totali durante ciclo
    frosts: number; // Numero gelate durante ciclo
  };
  result: {
    yield: number; // kg/m²
    quality: number; // 1-5
    problems: string[]; // ['peronospora', 'afidi']
    treatments: Array<{
      product: string;
      date: Date;
      effective: boolean;
    }>;
  };
}

/**
 * Memoria completa di una zona/aiuola
 */
export interface ZoneMemory {
  zoneId: string;
  zoneName?: string;
  gardenId: string;
  plantingHistory: PlantingRecord[];
  patterns: {
    bestPlantingDate?: Date; // Media date migliori risultati
    worstPlantingDate?: Date; // Media date peggiori risultati
    recurringProblems: Array<{
      problem: string;
      frequency: number; // Quante volte osservato
      months: number[]; // Mesi in cui si verifica
    }>;
    successfulTreatments: Array<{
      problem: string;
      treatment: string;
      successRate: number; // 0-1
    }>;
  };
  correlations: Correlation[];
}

/**
 * Correlazione tra fattore e risultato
 */
export interface Correlation {
  factorType: string; // 'early_planting', 'high_rain', 'clay_soil'
  factorDescription?: string;
  impactType: 'positive' | 'negative';
  strength: number; // 0-1
  examplesCount: number;
  affectedZones?: string[];
  affectedPlants?: string[];
  correlationDetails?: {
    avgImpact: number; // Impatto medio in %
    bestCase: number;
    worstCase: number;
  };
}

/**
 * Memoria completa di un albero da frutto
 */
export interface TreeMemory {
  treeId: string;
  treeName: string;
  treeType?: 'Pome' | 'Stone' | 'Citrus' | 'Nut' | 'Berry';
  treeAge: number;
  gardenId: string;
  productionHistory: Array<{
    year: number;
    yield: number; // kg
    quality: number; // 1-5
    alternance: 'carica' | 'scarica';
    treatments: Array<{
      type: string;
      date: Date;
      effective: boolean;
    }>;
    pruning: {
      date: Date;
      type: string;
      result: 'good' | 'bad';
    };
  }>;
  alternancePattern: {
    lastCarica?: number; // anno
    lastScarica?: number; // anno
    predictedNext?: 'carica' | 'scarica';
  };
  pruningHistory: Array<{
    date: Date;
    type: string;
    result: 'good' | 'bad';
    notes?: string;
  }>;
}

/**
 * Pattern locale riconosciuto
 */
export interface LocalPattern {
  id?: string;
  gardenId: string;
  patternType: 'weather' | 'disease' | 'yield' | 'timing';
  patternName: string; // 'late_frost_after_april_10'
  patternDescription?: string;
  patternData: {
    occurrences: number; // Quante volte osservato
    confidence: number; // 0-1
    months?: number[]; // Mesi in cui si verifica
    conditions?: Record<string, any>; // Condizioni specifiche
  };
  prediction?: {
    nextLikelyDate?: Date;
    probability: number; // 0-1
  };
  affectedZones?: string[];
  status?: 'active' | 'confirmed' | 'rejected' | 'expired';
  userConfirmed?: boolean;
  firstDetected?: Date;
  lastOccurrence?: Date;
}

/**
 * Analisi post-stagione
 */
export interface SeasonAnalysis {
  id?: string;
  gardenId: string;
  year: number;
  season: 'Summer' | 'Winter';
  successes: Array<{
    plant: string;
    zone: string;
    improvement: number; // % vs anno scorso
    likelyCause: string; // "Irrigazione più profonda", "Trapianto anticipato"
    recommendation: string; // "Ripeti questa strategia"
  }>;
  failures: Array<{
    plant: string;
    zone: string;
    loss: number; // % vs previsto
    likelyCause: string; // "Trapianto troppo presto + gelata tardiva"
    correlation: Array<{ factor: string; impact: number }>; // ['early_planting: -30%', 'late_frost: -20%']
    recommendation: string; // "Trapianta dopo 5/4 in questa zona"
  }>;
  insights: Array<{
    type: 'correlation' | 'pattern' | 'timing';
    finding: string; // "Zucchine zona ovest: +40% resa con irrigazione meno frequente"
    confidence: number; // 0-1
    action: string; // "Ripeti strategia irrigazione 2026"
  }>;
  nextYearAdjustments: Array<{
    zone: string;
    plant: string;
    change: string; // "Trapianta dopo 5/4 invece di 20/3"
    reason: string;
  }>;
  statistics?: {
    totalYield: number; // kg totali
    avgQuality: number; // Media qualità 1-5
    totalProblems: number; // Numero problemi totali
  };
  analyzedAt?: Date;
  userReviewed?: boolean;
}

