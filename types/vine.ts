import { PlantMasterSheet } from '../types';

/**
 * Interfaccia per vite (Pro Feature)
 */
export interface VineCrop extends PlantMasterSheet {
  cropType: 'Vine';
  varietyType: 'Wine' | 'Table' | 'Raisin';
  trainingSystem: 'Guyot' | 'Cordon' | 'Pergola' | 'Alberello';
  rootstock: string;
  plantingDensity: number; // Piante/ettaro
  harvestWindow: {
    startMonth: number; // 1-12 (tipicamente agosto-settembre)
    endMonth: number; // 1-12
  };
  harvestMethod: 'Manual' | 'Mechanical';
  brixTarget: number; // Gradi Brix per vendemmia
}

/**
 * Estensione di GardenTask per vite
 */
export interface VineTask extends GardenTask {
  vineData?: {
    varietyType: 'Wine' | 'Table' | 'Raisin';
    trainingSystem?: 'Guyot' | 'Cordon' | 'Pergola' | 'Alberello';
    pruningType?: 'Winter' | 'Summer';
    operationType?: 'Pruning' | 'Tying' | 'ShootThinning' | 'LeafRemoval';
  };
}

/**
 * Analisi vino
 */
export interface WineAnalysis {
  alcohol: number; // % vol
  acidity: number; // g/L (acido tartarico)
  pH: number;
  residualSugar?: number; // g/L
  totalSulfur?: number; // mg/L
}

/**
 * Record di vinificazione
 */
export interface WinemakingRecord {
  id: string;
  harvestId: string;
  vineyardId: string;
  winemakingDate: string;
  grapeQuantity: number; // kg
  brixAtHarvest: number;
  wineType: 'Red' | 'White' | 'Rosé' | 'Sparkling';
  wineProduced: number; // litri
  wineAnalysis?: WineAnalysis;
  winemakingNotes?: string;
  bottlingDate?: string;
  bottlesProduced?: number;
}

/**
 * Estensione di HarvestLogData per vite
 */
export interface VineHarvest extends HarvestLogData {
  grapeQuantity: number; // kg
  brixAtHarvest: number;
  harvestDate: string;
  winemakingDate?: string;
  wineProduced?: number; // litri
  wineType?: 'Red' | 'White' | 'Rosé' | 'Sparkling';
  wineAnalysis?: WineAnalysis;
  harvestMethod?: 'Manual' | 'Mechanical';
}

