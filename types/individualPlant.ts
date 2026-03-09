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
  
  // NUOVO: Collegamento bancale serra
  greenhouseBenchId?: string; // greenhouse_benches (serra)
  benchRowNumber?: number; // Fila sul bancale (1, 2, 3...)
  positionInBenchRow?: number; // Posizione nella fila del bancale
  
  // Posizione nel filare (campo aperto/aiuole)
  positionInRow: number; // 1, 2, 3, 4...
  plantCode: string; // "F1-P001", "F2-P015", "B1-R2-P003"
  
  // Informazioni pianta
  plantName: string;
  variety?: string;
  plantingDate?: string; // ISO date
  plantedDate?: string; // Alias for compatibility
  expectedHarvestDate?: string; // ISO date
  
  // Stato e salute
  status: 'healthy' | 'diseased' | 'dead' | 'harvested' | 'transplanted';
  healthScore: number; // 0-100
  
  // Origine tracciabilità
  seedlingBatchId?: string;
  saplingBatchId?: string;
  seedPacketId?: string;
  source?: 'seed' | 'nursery' | 'transplant'; // Origine pianta
  
  // Contesto di impianto (meteo, luna, stagione)
  plantingContext?: {
    timestamp: string;
    weather: {
      temperature: number;
      humidity: number;
      precipitation: number;
      windSpeed: number;
      condition: string;
      pressure: number;
    };
    lunar: {
      phase: string;
      phaseEmoji: string;
      illumination: number;
      isWaxing: boolean;
      dayInCycle: number;
    };
    season: string;
    daylight: {
      sunrise: string;
      sunset: string;
      hoursOfLight: number;
    };
  };
  
  // NUOVO: Parametri ambientali serra (snapshot al momento impianto)
  greenhouseConditions?: {
    internalTemperature: number; // °C
    internalHumidity: number; // %
    co2Level?: number; // ppm
    lightIntensity?: number; // lux
    ventilationActive: boolean;
    heatingActive: boolean;
    shadingActive: boolean;
    
    // Differenziali esterno/interno
    temperatureDelta?: number; // Interno - Esterno
    humidityDelta?: number; // Interno - Esterno
  };
  
  // Coordinate precise (per mapping futuro)
  coordinates?: {
    x: number; // metri
    y: number; // metri
  };
  
  // Media e note
  photos: string[]; // URLs
  notes?: string;
  
  // Helper fields for display
  fieldRowName?: string; // Nome del filare (per display)
  benchName?: string; // Nome del bancale (per display)
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  orchestratorEnabled?: boolean;
}

export interface PlantOperation {
  id: string;
  
  // Collegamento pianta
  plantId: string;
  gardenId: string;
  
  // Tipo operazione
  operationType: 'watering' | 'fertilizing' | 'treatment' | 'pruning' | 'harvest' | 
                 'transplanting' | 'thinning' | 'staking' | 'mulching' | 'work' | 'health';
  operationCategory?: 'irrigation' | 'nutrition' | 'protection' | 'maintenance';
  
  // Dettagli operazione
  date: string; // ISO date
  operationDate?: string; // Alias for compatibility
  operationTime?: string; // HH:MM
  
  // Quantità e prodotti
  quantity?: number;
  unit?: string; // 'L', 'ml', 'g', 'kg'
  productName?: string;
  product?: string; // Alias
  concentration?: number; // % o dosaggio
  dosage?: string; // Dosaggio testuale
  
  // Dettagli specifici per tipo
  duration?: number; // minuti (per irrigazione, lavori)
  waterAmount?: number; // litri (per irrigazione)
  fertilizerType?: string; // tipo fertilizzante
  npkRatio?: string; // es. "10-10-10"
  treatmentType?: 'preventive' | 'curative'; // tipo trattamento
  targetPest?: string; // parassita target
  workType?: string; // tipo lavorazione
  
  // Salute
  healthScoreBefore?: number;
  healthScoreAfter?: number;
  
  // Risultati
  effectivenessScore?: number; // 1-10
  plantResponse?: 'positive' | 'negative' | 'neutral';
  
  // Contesto ambientale (meteo, luna, stagione)
  context?: {
    timestamp: string;
    weather: {
      temperature: number;
      humidity: number;
      precipitation: number;
      windSpeed: number;
      condition: string;
      pressure: number;
    };
    lunar: {
      phase: string;
      phaseEmoji: string;
      illumination: number;
      isWaxing: boolean;
      dayInCycle: number;
    };
    season: string;
    daylight: {
      sunrise: string;
      sunset: string;
      hoursOfLight: number;
    };
  };
  
  // NUOVO: Parametri serra al momento operazione
  greenhouseConditions?: {
    internalTemperature: number; // °C
    internalHumidity: number; // %
    co2Level?: number; // ppm
    lightIntensity?: number; // lux
    ventilationActive: boolean;
    heatingActive: boolean;
    shadingActive: boolean;
    
    // Differenziali esterno/interno
    temperatureDelta?: number; // Interno - Esterno
    humidityDelta?: number; // Interno - Esterno
  };
  
  // Condizioni ambientali (legacy)
  weatherConditions?: {
    temp?: number;
    humidity?: number;
    wind?: string;
    [key: string]: any;
  };
  
  // Media e documentazione
  photos: string[];
  notes?: string;
  
  // Flag per operazioni di filare
  isFieldRowOperation?: boolean;
  fieldRowName?: string;
  fieldRowId?: string;

  // Tracciamento sorgente (orchestratore/manuale/IOT)
  parentOperationId?: string;
  parentOperationTable?: string;
  sourceType?: 'manual' | 'iot' | 'orchestrator_auto' | 'orchestrator_sync';
  actorType?: 'manual' | 'iot' | 'orchestrator';
  deviceId?: string;
  recordedBy?: 'user' | 'iot' | 'system';
  
  // Snapshot persistito per analytics predittiva (retrocompatibile)
  operationContext?: PlantOperation['context'];
  geoSnapshot?: {
    latitude?: number;
    longitude?: number;
    altitudeMeters?: number;
    sunExposure?: string;
    aspectDirection?: string;
    obstacles?: Array<Record<string, any>>;
    source?: string;
  };
  
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
  qualityScore?: number; // Numeric quality score (0-100)
  
  // Classificazione prodotto
  sizeCategory?: 'large' | 'medium' | 'small';
  ripenessLevel?: 'unripe' | 'perfect' | 'overripe';
  
  // Destinazione
  destination?: 'consumption' | 'storage' | 'processing' | 'sale' | 'seed';
  marketValue?: number;
  
  // Condizioni
  weatherConditions?: Record<string, any>;
  storageMethod?: 'fresh' | 'refrigerated' | 'frozen' | 'dried';
  
  // NUOVO: Parametri serra al momento raccolto
  greenhouseConditions?: {
    internalTemperature: number; // °C
    internalHumidity: number; // %
    co2Level?: number; // ppm
    
    // Storico parametri durante crescita
    avgTemperature?: number;
    avgHumidity?: number;
    avgCo2?: number;
    
    // Giorni con condizioni ottimali
    daysOptimalTemp?: number;
    daysOptimalHumidity?: number;
    daysOptimalCo2?: number;
    
    // Differenziali medi
    avgTemperatureDelta?: number;
    avgHumidityDelta?: number;
  };
  
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
