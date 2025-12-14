import { PlantMasterSheet } from '../types';

/**
 * Interfaccia per colture di fragole (Pro Feature)
 */
export interface StrawberryCrop extends PlantMasterSheet {
  cropType: 'Strawberry';
  varietyType: 'June-bearing' | 'Ever-bearing' | 'Day-neutral';
  plantingSystem: 'Matted Row' | 'Spaced Row' | 'Hill System';
  runnerManagement: {
    removeRunners: boolean;
    keepForPropagation: boolean;
  };
  mulching: {
    material: 'Straw' | 'Plastic' | 'Organic';
    thickness: number; // cm
  };
  harvestWindow: {
    startMonth: number; // 1-12
    endMonth: number; // 1-12
  };
  renovationRequired: boolean; // Per June-bearing
  renovationMonth?: number; // Mese rinnovo (tipicamente luglio)
}

/**
 * Estensione di GardenTask per fragole
 */
export interface StrawberryTask extends GardenTask {
  strawberryData?: {
    varietyType: 'June-bearing' | 'Ever-bearing' | 'Day-neutral';
    runnerAction?: 'Remove' | 'Keep' | 'Propagate';
    mulchingApplied?: boolean;
    renovationCompleted?: boolean;
  };
}

/**
 * Estensione di HarvestLogData per fragole
 */
export interface StrawberryHarvest extends HarvestLogData {
  harvestType?: 'FirstFlush' | 'MainHarvest' | 'LateHarvest';
  berrySize?: 'Small' | 'Medium' | 'Large';
  qualityNotes?: string;
}

