/**
 * Greenhouse Bench Types
 * Bancali/tavoli per coltivazione in serra
 */

export interface GreenhouseBench {
  id: string;
  gardenId: string;
  greenhouseId?: string; // Se serra multipla (future-proof)
  
  // Identificazione
  benchNumber: number; // 1, 2, 3...
  name: string; // "Bancale Nord", "Bancale 1", "Tavolo A"
  
  // Dimensioni
  lengthCm: number;
  widthCm: number;
  heightCm: number; // Altezza da terra
  
  // Capacità
  rowCount: number; // Numero file sul bancale
  plantsPerRow: number;
  totalCapacity: number; // rowCount * plantsPerRow
  currentPlants?: number; // Piante attualmente presenti
  
  // Materiale e costruzione
  material?: 'wood' | 'metal' | 'plastic' | 'concrete';
  hasDrainage: boolean;
  drainageType?: 'holes' | 'slope' | 'gutter';
  
  // Posizione in serra
  position?: 'north' | 'center' | 'south' | 'east' | 'west';
  level?: number; // Per serre con bancali a più livelli (1 = terra, 2 = primo livello, ecc.)
  
  // Substrato
  substrateType?: 'soil' | 'coco' | 'perlite' | 'rockwool' | 'mixed' | 'hydroponic';
  substrateDepthCm?: number;
  substrateNotes?: string;
  
  // Irrigazione
  hasIrrigation?: boolean;
  irrigationType?: 'drip' | 'subirrigation' | 'manual' | 'mist' | 'flood';
  emitterSpacingCm?: number; // Per gocciolatori
  emitterFlowRateLph?: number; // Litri per ora per gocciolatore
  
  // Riscaldamento
  hasHeating?: boolean;
  heatingType?: 'cable' | 'mat' | 'pipe' | 'air';
  
  // Stato
  isActive: boolean;
  notes?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

/**
 * Configurazione bancale per wizard creazione
 */
export interface BenchWizardConfig {
  // Step 1: Dimensioni
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  
  // Step 2: Capacità
  rowCount: number;
  plantsPerRow: number;
  plantSpacingCm?: number; // Distanza tra piante
  rowSpacingCm?: number; // Distanza tra file
  
  // Step 3: Identificazione
  benchNumber: number;
  name: string;
  position?: GreenhouseBench['position'];
  
  // Step 4: Configurazione avanzata
  material?: GreenhouseBench['material'];
  hasDrainage: boolean;
  substrateType?: GreenhouseBench['substrateType'];
  substrateDepthCm?: number;
  
  // Step 5: Sistemi
  hasIrrigation?: boolean;
  irrigationType?: GreenhouseBench['irrigationType'];
  hasHeating?: boolean;
  
  // Auto-calcoli (readonly)
  calculatedCapacity?: number;
  calculatedAreaSqm?: number;
  calculatedVolumeLiters?: number;
}

/**
 * Statistiche bancale
 */
export interface BenchStats {
  benchId: string;
  benchName: string;
  benchNumber: number;
  
  // Occupazione
  totalCapacity: number;
  currentPlants: number;
  occupancyRate: number; // 0-100%
  availableSpots: number;
  
  // Salute piante
  healthyPlants: number;
  diseasedPlants: number;
  deadPlants: number;
  avgHealthScore: number; // 0-100
  
  // Produzione
  totalHarvests: number;
  totalYieldKg: number;
  avgYieldPerPlant: number;
  avgQuality: number; // 0-100
  
  // Condizioni ambientali medie (se disponibili)
  avgTemperature?: number;
  avgHumidity?: number;
  avgCo2?: number;
  
  // Date
  firstPlantingDate?: string;
  lastPlantingDate?: string;
  lastHarvestDate?: string;
  
  // Performance ranking (1 = migliore)
  yieldRank?: number;
  qualityRank?: number;
  healthRank?: number;
}

/**
 * Confronto performance tra bancali
 */
export interface BenchComparison {
  gardenId: string;
  period: {
    from: string;
    to: string;
  };
  
  benches: Array<{
    benchId: string;
    benchName: string;
    benchNumber: number;
    position?: string;
    
    // Condizioni medie
    avgTemperature?: number;
    avgHumidity?: number;
    avgCo2?: number;
    avgLight?: number;
    
    // Performance
    totalPlants: number;
    avgYieldPerPlant: number;
    avgQuality: number;
    avgHealthScore: number;
    
    // Ranking
    yieldRank: number; // 1 = migliore
    qualityRank: number;
    healthRank: number;
    overallRank: number;
  }>;
  
  // Best performer
  bestBench: {
    benchId: string;
    benchName: string;
    reason: string;
  };
  
  // Identificazione problemi
  issues: Array<{
    benchId: string;
    benchName: string;
    issue: string;
    severity: 'high' | 'medium' | 'low';
    suggestion: string;
  }>;
  
  // Suggerimenti generali
  recommendations: string[];
}

/**
 * Layout serra con bancali
 */
export interface GreenhouseLayout {
  gardenId: string;
  greenhouseId?: string;
  
  // Dimensioni serra
  greenhouseLengthCm: number;
  greenhouseWidthCm: number;
  greenhouseHeightCm: number;
  
  // Bancali
  benches: GreenhouseBench[];
  
  // Calcoli
  totalBenches: number;
  totalCapacity: number;
  totalOccupied: number;
  occupancyRate: number; // 0-100%
  
  // Spazio disponibile
  usedAreaSqm: number;
  availableAreaSqm: number;
  utilizationRate: number; // 0-100%
}

/**
 * Operazione di massa su bancale
 */
export interface BenchBulkOperation {
  benchId: string;
  operationType: 'watering' | 'fertilizing' | 'treatment' | 'pruning' | 'health';
  operationDate: string;
  operationTime?: string;
  
  // Quantità per pianta
  quantityPerPlant?: number;
  unit?: string;
  productName?: string;
  concentration?: number;
  
  // Filtri piante
  plantStatus?: 'healthy' | 'diseased' | 'dead' | 'harvested' | 'transplanted';
  plantIds?: string[]; // Piante specifiche
  rowNumbers?: number[]; // File specifiche
  
  // Parametri serra al momento operazione
  greenhouseConditions?: {
    internalTemperature: number;
    internalHumidity: number;
    co2Level?: number;
    ventilationActive: boolean;
    heatingActive: boolean;
  };
  
  notes?: string;
  photos?: string[];
}

/**
 * Risultato operazione di massa su bancale
 */
export interface BenchBulkOperationResult {
  success: boolean;
  benchId: string;
  benchName: string;
  operationsCreated: number;
  plantsAffected: number;
  errors?: string[];
  operationIds: string[];
  
  // Riepilogo
  summary: {
    totalPlants: number;
    operatedPlants: number;
    skippedPlants: number;
    failedPlants: number;
  };
}
