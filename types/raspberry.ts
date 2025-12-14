import { PlantMasterSheet, GardenTask, HarvestLogData } from './types';

/**
 * Interfaccia per colture di lamponi (Pro Feature)
 */
export interface RaspberryCrop extends PlantMasterSheet {
  cropType: 'Raspberry';
  varietyType: 'Summer-bearing' | 'Ever-bearing' | 'Fall-bearing';
  canesType: 'Primocane' | 'Floricane'; // Tipo di canne che producono
  trainingSystem: 'Trellis' | 'Free-standing';
  harvestWindow: {
    startMonth: number; // 1-12
    endMonth: number; // 1-12
  };
  pruningRequired: boolean;
  propagationMethod: 'Suckers' | 'TipLayering' | 'Division';
  supportRequired: boolean; // Se richiede supporti/trelis
}

/**
 * Estensione di GardenTask per lamponi
 */
export interface RaspberryTask extends GardenTask {
  raspberryData?: {
    varietyType: 'Summer-bearing' | 'Ever-bearing' | 'Fall-bearing';
    canesType: 'Primocane' | 'Floricane';
    trainingSystem: 'Trellis' | 'Free-standing';
    pruningCompleted?: boolean;
    canesRemoved?: number; // Numero canne rimosse dopo raccolta
    supportInstalled?: boolean;
  };
}

/**
 * Record di potatura canne
 */
export interface CanePruningRecord {
  id: string;
  raspberryId: string;
  pruningDate: string;
  canesRemoved: number;
  canesType: 'Primocane' | 'Floricane';
  reason: 'PostHarvest' | 'Diseased' | 'Weak' | 'Thinning';
  notes?: string;
  createdAt: string;
}

/**
 * Estensione di HarvestLogData per lamponi
 */
export interface RaspberryHarvest extends HarvestLogData {
  harvestType?: 'FirstFlush' | 'MainHarvest' | 'LateHarvest';
  berrySize?: 'Small' | 'Medium' | 'Large';
  qualityNotes?: string;
  canesType?: 'Primocane' | 'Floricane';
}

