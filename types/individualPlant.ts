/**
 * Individual Plant Tracking Types
 * Sistema completo per tracciare ogni singola pianta
 */

export interface GardenPlant {
  id: string;
  
  // Collegamento al filare
  gardenId: string;
  
  // Row connections (integrated approach)
  gardenRowId?: string; // garden_rows (bed rows)
  fieldRowId?: string; // field_rows (open field rows)
  
  // Posizione nel filare
  positionInRow: number; // 1, 2, 3, 4...
  plantCode: string; // "F1-P001", "F2-P015"
  
  // Informazioni pianta
  plantName: string;
  variety?: string;
  plantingDate?: string; // ISO date
  expectedHarvestDate?: string; // ISO date
  
  // Stato e salute
  status: 'healthy' | 'diseased' | 'dead' | 'harvested' | 'transplanted';
  healthScore: number; // 0-100
  
  // Origine tracciabilità
  seedlingBatchId?: string;
  saplingBatchId?: string;
  seedPacketId?: string;
  
  // Coordinate precise (per mapping futuro)
  coordinates?: {
    x: number; // metri
    y: number; // metri
  };
  
  // Media e note
  photos: string[]; // URLs
  notes?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface PlantOperation {
  id: string;
  
  // Collegamento pianta
  plantId: string;
  gardenId: string;
  
  // Tipo operazione
  operationType: 'watering' | 'fertilizing' | 'treatment' | 'pruning' | 'harvest' | 
                 'transplanting' | 'thinning' | 'staking' | 'mulching';
  operationCategory?: 'irrigation' | 'nutrition' | 'protection' | 'maintenance';
  
  // Dettagli operazione
  operationDate: string; // ISO date
  operationTime?: string; // HH:MM
  
  // Quantità e prodotti
  quantity?: number;
  unit?: string; // 'L', 'ml', 'g', 'kg'
  productName?: string;
  concentration?: number; // % o dosaggio
  
  // Risultati
  effectivenessScore?: number; // 1-10
  plantResponse?: 'positive' | 'negative' | 'neutral';
  
  // Condizioni ambientali
  weatherConditions?: {
    temp?: number;
    humidity?: number;
    wind?: string;
    [key: string]: any;
  };
  
  // Media e documentazione
  photos: string[];
  notes?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface PlantHarvest {
  id: string;
  
  // Collegamento pianta
  plantId: string;
  gardenId: string;
  
  // Dettagli raccolta
  harvestDate: string; // ISO date
  harvestTime?: string; // HH:MM
  
  // Quantità raccolta
  quantityKg: number;
  qualityGrade?: 'excellent' | 'good' | 'fair' | 'poor';
  
  // Classificazione prodotto
  sizeCategory?: 'large' | 'medium' | 'small';
  ripenessLevel?: 'unripe' | 'perfect' | 'overripe';
  
  // Destinazione
  destination?: 'consumption' | 'storage' | 'processing' | 'sale' | 'seed';
  marketValue?: number;
  
  // Condizioni
  weatherConditions?: Record<string, any>;
  storageMethod?: 'fresh' | 'refrigerated' | 'frozen' | 'dried';
  
  // Media
  photos: string[];
  notes?: string;
  
  // Metadata
  createdAt: string;
}

// Helper types per calcoli
export interface PlantCalculations {
  maxPlantsInRow: (lengthMeters: number, spacingCm: number) => number;
  minRowLength: (plantsCount: number, spacingCm: number) => number;
  totalArea: (rowCount: number, rowLength: number, rowSpacing: number) => number;
  plantsPerSqMeter: (plantSpacing: number, rowSpacing: number) => number;
}

// Statistiche per filare
export interface RowPlantStats {
  rowId: string;
  rowName: string;
  rowType: 'garden_row' | 'field_row';
  gardenId: string;
  
  totalPlants: number;
  healthyPlants: number;
  diseasedPlants: number;
  deadPlants: number;
  avgHealthScore: number;
  
  firstPlantingDate?: string;
  lastPlantingDate?: string;
  
  // Operazioni recenti
  recentOperations: number;
  lastOperationDate?: string;
}

// Statistiche produzioni per pianta
export interface PlantProductionStats {
  plantId: string;
  plantCode: string;
  plantName: string;
  variety?: string;
  plantingDate?: string;
  
  totalHarvests: number;
  totalProductionKg: number;
  avgHarvestKg: number;
  totalValue: number;
  
  firstHarvestDate?: string;
  lastHarvestDate?: string;
}

// Configurazione campo (per il tuo esempio)
export interface FieldConfiguration {
  gardenId: string;
  zoneName: string;
  
  // Dimensioni
  rowCount: number;
  rowLengthMeters: number;
  plantSpacingCm: number;
  rowSpacingCm: number;
  
  // Calcoli automatici
  totalPlants: number;
  plantsPerRow: number;
  totalAreaSqm: number;
  plantsPerSqMeter: number;
  
  // Coltura
  plantName: string;
  variety?: string;
  plantingDate: string;
}

// Operazioni di massa per filare
export interface BulkRowOperation {
  operationType: PlantOperation['operationType'];
  rowId?: string;
  fieldRowId?: string;
  operationDate: string;
  
  // Quantità per pianta
  quantityPerPlant?: number;
  unit?: string;
  productName?: string;
  
  // Filtri piante
  plantStatus?: GardenPlant['status'];
  plantIds?: string[]; // Piante specifiche
  
  notes?: string;
}

// Risultato operazioni di massa
export interface BulkOperationResult {
  success: boolean;
  operationsCreated: number;
  plantsAffected: number;
  errors?: string[];
  operationIds: string[];
}

// Vista completa pianta con operazioni
export interface PlantWithOperations extends GardenPlant {
  // Statistiche operazioni
  totalOperations: number;
  lastOperationDate?: string;
  
  // Operazioni recenti (ultimi 30 giorni)
  recentOperations: PlantOperation[];
  
  // Raccolti
  harvests: PlantHarvest[];
  totalHarvestKg: number;
  
  // Salute trend
  healthTrend: 'improving' | 'stable' | 'declining';
}

// Configurazione wizard per creazione campo
export interface FieldWizardConfig {
  // Step 1: Dimensioni
  rowCount: number;
  rowLengthMeters: number;
  plantSpacingCm: number;
  rowSpacingCm: number;
  
  // Step 2: Coltura
  plantName: string;
  variety?: string;
  plantingDate: string;
  
  // Step 3: Zona
  zoneName: string;
  zoneDescription?: string;
  
  // Step 4: Opzioni avanzate
  orientation?: 'N-S' | 'E-W' | 'NE-SW' | 'NW-SE';
  irrigationSystem?: {
    type: 'Dripline' | 'PipeWithDrippers' | 'MicroSprinkler';
    emitterSpacingCm?: number;
    emitterFlowRateLph?: number;
  };
  
  // Auto-calcoli (readonly)
  calculatedPlants?: number;
  calculatedAreaSqm?: number;
  calculatedPlantsPerSqm?: number;
}

// All types are exported individually above