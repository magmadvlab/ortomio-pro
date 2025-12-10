import { PlantMasterSheet, GardenTask, HarvestLogData, GeoLocation } from './types';

/**
 * Interfaccia per frutteti (Pro Feature)
 */
export interface FruitTreeCrop extends PlantMasterSheet {
  cropType: 'FruitTree';
  treeType: 'Pome' | 'Stone' | 'Citrus' | 'Nut' | 'Berry';
  rootstock: string; // Portinnesto
  maturityYears: number; // Anni per maturità produttiva
  pruningSeasons: ('Winter' | 'Summer')[]; // Stagioni potatura
  pollinationType: 'Self-fertile' | 'Self-sterile' | 'Partially-self-fertile';
  pollinatorVarieties?: string[]; // Varietà impollinatrici necessarie
  harvestWindow: {
    startMonth: number; // 1-12
    endMonth: number; // 1-12
  };
  chillHours?: number; // Ore di freddo necessarie (per alcune varietà)
}

/**
 * Estensione di GardenTask per frutteti
 */
export interface FruitTreeTask extends GardenTask {
  fruitTreeData?: {
    treeAge: number; // Anni dall'impianto
    pruningType?: 'Formative' | 'Maintenance' | 'Rejuvenation';
    pruningSeason?: 'Winter' | 'Summer';
    graftingInfo?: {
      type: string; // 'Chip', 'Whip', 'Cleft', etc.
      date: string;
      success: boolean;
    };
    fruitThinning?: {
      date: string;
      quantityRemoved: number; // kg o numero frutti
    };
    treeCoordinates?: GeoLocation; // Posizione albero nel frutteto
  };
}

/**
 * Record di potatura
 */
export interface PruningRecord {
  id: string;
  fruitTreeId: string;
  pruningDate: string;
  pruningType: 'Formative' | 'Maintenance' | 'Rejuvenation';
  season: 'Winter' | 'Summer';
  technique: string; // es. "Guyot renewal", "Thinning cuts"
  notes?: string;
  photos?: string[];
  createdAt: string;
}

/**
 * Record di innesto
 */
export interface GraftingRecord {
  id: string;
  fruitTreeId: string;
  graftingDate: string;
  graftingType: string; // 'Chip', 'Whip', 'Cleft', etc.
  scionVariety: string; // Varietà innestata
  rootstockVariety: string;
  success: boolean;
  notes?: string;
  photos?: string[];
}

/**
 * Estensione di HarvestLogData per frutteti
 */
export interface FruitTreeHarvest extends HarvestLogData {
  treeAge?: number;
  fruitSize?: 'Small' | 'Medium' | 'Large';
  qualityGrade?: 'Extra' | 'First' | 'Second';
  storagePotential?: number; // Giorni di conservazione stimati
}

