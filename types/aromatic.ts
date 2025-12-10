import { PlantMasterSheet, GardenTask, HarvestLogData } from './types';

/**
 * Interfaccia per erbe aromatiche e officinali (Pro Feature)
 */
export interface AromaticMedicinalCrop extends PlantMasterSheet {
  cropType: 'Aromatic' | 'Medicinal';
  harvestType: 'Leaves' | 'Flowers' | 'Stems' | 'Roots' | 'Seeds';
  harvestTiming: 'BeforeFlowering' | 'DuringFlowering' | 'AfterFlowering';
  dryingRequired: boolean;
  dryingMethod?: 'Air' | 'Dehydrator' | 'Oven';
  dryingTime?: number; // Giorni stimati
  storageMethod: 'Fresh' | 'Dried' | 'Frozen' | 'Oil';
  multiplicationMethod: 'Seed' | 'Cutting' | 'Division' | 'Layering';
  essentialOilYield?: number; // ml/kg, se applicabile
}

/**
 * Estensione di GardenTask per erbe aromatiche
 */
export interface AromaticTask extends GardenTask {
  aromaticData?: {
    harvestType: 'Leaves' | 'Flowers' | 'Stems' | 'Roots' | 'Seeds';
    harvestTiming: 'BeforeFlowering' | 'DuringFlowering' | 'AfterFlowering';
    multiplicationMethod?: 'Seed' | 'Cutting' | 'Division' | 'Layering';
  };
}

/**
 * Record di essiccazione
 */
export interface DryingRecord {
  id: string;
  aromaticCropId: string;
  harvestId: string;
  dryingStartDate: string;
  dryingEndDate?: string;
  dryingMethod: 'Air' | 'Dehydrator' | 'Oven';
  initialWeight: number; // kg fresco
  finalWeight?: number; // kg secco
  moistureContent?: number; // % finale
  qualityRating?: number; // 1-5
  notes?: string;
}

/**
 * Estensione di HarvestLogData per erbe aromatiche
 */
export interface AromaticHarvest extends HarvestLogData {
  harvestPart?: 'Leaves' | 'Flowers' | 'Stems' | 'Roots' | 'Seeds';
  requiresDrying?: boolean;
  dryingMethod?: 'Air' | 'Dehydrator' | 'Oven';
  essentialOilExtracted?: number; // ml
}

