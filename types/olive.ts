import { PlantMasterSheet, GardenTask, HarvestLogData } from './types';

/**
 * Interfaccia per olivo (Pro Feature)
 */
export interface OliveCrop extends PlantMasterSheet {
  cropType: 'Olive';
  varietyType: 'Table' | 'Oil' | 'Dual-purpose';
  treeAge: number; // Anni
  treeDensity: number; // Piante/ettaro
  harvestMethod: 'Manual' | 'Mechanical' | 'Shaking';
  harvestWindow: {
    startMonth: number; // 1-12 (tipicamente ottobre)
    endMonth: number; // 1-12 (tipicamente dicembre)
  };
  oilYieldExpected: number; // kg olio/100kg olive
  millingType?: 'Traditional' | 'Continuous' | 'Two-phase';
}

/**
 * Estensione di GardenTask per olivo
 */
export interface OliveTask extends GardenTask {
  oliveData?: {
    varietyType: 'Table' | 'Oil' | 'Dual-purpose';
    harvestMethod?: 'Manual' | 'Mechanical' | 'Shaking';
    pruningType?: 'Winter' | 'Summer'; // Potatura invernale o verde
  };
}

/**
 * Qualità olio
 */
export interface OilQuality {
  acidity: number; // % acido oleico
  peroxide: number; // meq O2/kg
  polyphenols: number; // mg/kg
}

/**
 * Record di frangitura
 */
export interface OliveMilling {
  id: string;
  harvestId: string;
  oliveGroveId: string;
  millingDate: string;
  oliveQuantity: number; // kg
  oilProduced: number; // litri
  millingType: 'Traditional' | 'Continuous' | 'Two-phase';
  oilQuality?: OilQuality;
  millingNotes?: string;
  millName?: string; // Nome frantoio
}

/**
 * Estensione di HarvestLogData per olive
 */
export interface OliveHarvest extends HarvestLogData {
  oliveQuantity: number; // kg
  millingDate?: string;
  oilProduced?: number; // litri
  oilQuality?: OilQuality;
  millingNotes?: string;
  harvestMethod?: 'Manual' | 'Mechanical' | 'Shaking';
}

