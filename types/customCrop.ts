/**
 * Custom Crop Types
 * Supporta colture personalizzate aggiunte dall'utente con sistema di apprendimento automatico
 */

export interface CustomCrop {
  id: string;
  user_id: string;
  garden_id?: string;
  
  common_name: string;
  scientific_name?: string;
  family?: string;
  
  // Dati iniziali opzionali (il sistema impara)
  initial_data?: {
    plantingWindow?: string;
    harvestWindow?: string;
    waterNeeds?: 'Low' | 'Medium' | 'High';
    notes?: string;
  };
  
  // Pattern appresi dal sistema
  learned_patterns: LearnedPatterns;
  
  // Statistiche
  stats: CropStats;
  
  created_at: string;
  updated_at: string;
}

export interface LearnedPatterns {
  plantingTiming: {
    successfulDates: string[];
    failedDates: string[];
    bestMonth?: number;
    confidence: number; // 0-1
  };
  harvestTiming: {
    successfulDates: string[];
    avgDaysToHarvest?: number;
    bestMonth?: number;
    confidence: number;
  };
  successfulWorks: Array<{
    workType: string;
    timing: string; // "prima di semina", "dopo raccolta", etc.
    frequency: number;
  }>;
  successfulTreatments: Array<{
    productName: string;
    timing: string;
    problemSolved: string;
    frequency: number;
  }>;
  recurringProblems: Array<{
    problem: string;
    month: number;
    frequency: number;
    suggestedSolution?: string;
  }>;
}

export interface CropStats {
  totalPlantings: number;
  totalHarvests: number;
  avgYield?: number;
  successRate: number; // 0-1 (percentuale di successo)
}

export interface CropLearningEvent {
  id: string;
  custom_crop_id?: string;
  user_id: string;
  garden_id?: string;
  
  event_type: 'planting' | 'harvest' | 'work' | 'treatment' | 'problem' | 'fertilize';
  event_data: {
    date: string;
    plantName?: string;
    quantity?: number;
    yield?: number;
    quality?: number;
    workType?: string;
    productName?: string;
    problem?: string;
    [key: string]: any;
  };
  outcome?: {
    success: boolean;
    yield?: number;
    quality?: number;
    notes?: string;
    [key: string]: any;
  };
  
  created_at: string;
}

