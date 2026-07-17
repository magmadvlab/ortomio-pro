/**
 * Prescription Maps Types
 * Sistema completo per generazione mappe prescrizione precision farming
 */

export interface PrescriptionMap {
  id: string;
  
  // Garden context
  gardenId: string;
  gardenName: string;
  
  // Map metadata
  name: string;
  description?: string;
  mapType: 'fertilizer' | 'seeding' | 'irrigation' | 'treatment' | 'harvest';
  
  // Generation parameters
  generationDate: string;
  dataSourcePeriod: {
    startDate: string;
    endDate: string;
  };
  
  // Data sources used
  dataSources: {
    ndviData: boolean;
    plantLevelData: boolean;
    rowLevelData: boolean;
    soilData: boolean;
    weatherData: boolean;
  };
  
  // Zones and prescriptions
  zones: PrescriptionZone[];
  totalZones: number;
  totalAreaSqm: number;
  
  // Export formats available
  exportFormats: {
    shapefile: boolean;
    kml: boolean;
    isoxml: boolean;
    geojson: boolean;
    csv: boolean;
  };
  
  // Area and zones
  areaHectares: number;
  zonesCount: number;
  
  // Application details
  applicationRate: {
    min: number;
    max: number;
    unit: string;
  };
  
  // Cost metrics
  costSavings: number;
  inputReduction: number; // percentage
  
  // Status
  status: 'pending' | 'generating' | 'completed' | 'failed';

  // Operational versioning
  versionNumber?: number;
  versionLabel?: string;
  rootVersionId?: string;
  parentVersionId?: string;
  lastExportedAt?: string;
  exportCount?: number;
  lastExecutedAt?: string;
  algorithmMetadata?: {
    algorithmVersion: string;
    inputHash: string;
    sourceQuality: 'measured' | 'mixed' | 'estimated' | 'insufficient';
    generatedFrom: string[];
  };
  contentChecksum?: string;
  
  // Validation and quality
  validationStatus: 'pending' | 'valid' | 'invalid' | 'warning';
  qualityScore: number; // 0-100
  dataCompleteness: number; // 0-100
  validationErrors?: string[];
  
  // Cost analysis
  costAnalysis?: PrescriptionCostAnalysis;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface PrescriptionZone {
  id: string;
  prescriptionMapId: string;
  
  // Zone identification
  zoneNumber: number;
  zoneName: string;
  zoneType: 'uniform' | 'variable' | 'exclusion';
  
  // Geographic data
  geometry: {
    type: 'Polygon';
    coordinates: number[][][]; // GeoJSON format
  };
  centroid: {
    latitude: number;
    longitude: number;
  };
  areaSqm: number;
  
  // Prescription data
  prescription: ZonePrescription;
  
  // Data sources for this zone
  sourceData: {
    avgNdvi?: number;
    plantCount?: number;
    avgPlantHealth?: number;
    soilType?: string;
    soilPh?: number;
    dailySunHours?: number;
    sunExposure?: string;
    aspectDirection?: string;
    windProtection?: string;
    shadowObstaclesCount?: number;
    altitudeMeters?: number;
    slopePercentage?: number;
    irrigationHistory?: number;
    yieldHistory?: number;
  };
  
  // Quality metrics
  dataQuality: number; // 0-100
  confidence: number; // 0-100
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface ZonePrescription {
  // Application rates
  applicationRate: number;
  unit: string; // 'kg/ha', 'L/ha', 'seeds/m2', etc.
  
  // Product information
  productName?: string;
  productType?: string;
  concentration?: number;
  
  // Application method
  applicationMethod: 'broadcast' | 'banded' | 'spot' | 'variable_rate';
  applicationTiming?: string;
  
  // Variable rate parameters (if applicable)
  variableRate?: {
    minRate: number;
    maxRate: number;
    rateFunction: 'linear' | 'exponential' | 'step' | 'custom';
    parameters?: Record<string, any>;
  };
  
  // Restrictions and conditions
  restrictions?: {
    weatherConditions?: string[];
    soilConditions?: string[];
    timeRestrictions?: string[];
  };
  
  // Expected outcomes
  expectedOutcome?: {
    yieldIncrease?: number;
    costReduction?: number;
    environmentalBenefit?: string;
  };
}

export interface PrescriptionCostAnalysis {
  // Input costs
  totalInputCost: number;
  costPerHectare: number;
  costPerZone: Record<string, number>;
  
  // Labor and machinery
  applicationCost: number;
  machineryHours: number;
  laborHours: number;
  
  // Expected returns
  expectedYieldIncrease: number;
  expectedRevenue: number;
  expectedProfit: number;
  roi: number; // Return on Investment %
  
  // Comparison with uniform application
  uniformApplicationCost: number;
  savingsVsUniform: number;
  efficiencyGain: number; // %
  
  // Environmental impact
  inputReduction: number; // % reduction in total inputs
  environmentalScore: number; // 0-100
}

export interface PrescriptionGenerationRequest {
  gardenId: string;
  mapType: PrescriptionMap['mapType'];
  name: string;
  description?: string;
  
  // Data source configuration
  dataSources: {
    ndviWeight: number; // 0-1
    plantHealthWeight: number; // 0-1
    soilWeight: number; // 0-1
    historicalWeight: number; // 0-1
  };
  
  // Zone generation parameters
  zoneConfig: {
    minZoneSize: number; // m²
    maxZones: number;
    similarityThreshold: number; // 0-1
    smoothingFactor: number; // 0-1
  };
  
  // Prescription parameters
  prescriptionConfig: {
    baseRate: number;
    unit: string;
    productName?: string;
    variableRateEnabled: boolean;
    maxVariation: number; // % variation from base rate
  };
  
  // Export requirements
  exportFormats: string[];
  
  // Time period for data analysis
  analysisPeriod: {
    startDate: string;
    endDate: string;
  };
}

export interface PrescriptionGenerationResult {
  success: boolean;
  prescriptionMapId?: string;
  errors?: string[];
  warnings?: string[];
  
  // Generation statistics
  stats: {
    zonesGenerated: number;
    totalArea: number;
    dataPointsAnalyzed: number;
    processingTimeMs: number;
  };
  
  // Quality metrics
  quality: {
    overallScore: number;
    dataCompleteness: number;
    spatialAccuracy: number;
    temporalRelevance: number;
  };
}

export interface MachineryCompatibility {
  id: string;
  
  // Machinery information
  brand: string;
  model: string;
  type: 'tractor' | 'sprayer' | 'seeder' | 'fertilizer_spreader' | 'harvester';
  
  // Supported formats
  supportedFormats: {
    shapefile: boolean;
    kml: boolean;
    isoxml: boolean;
    geojson: boolean;
    csv: boolean;
    proprietary?: string[];
  };
  
  // Technical specifications
  gpsAccuracy: number; // meters
  variableRateCapable: boolean;
  minApplicationRate: number;
  maxApplicationRate: number;
  workingWidth: number; // meters
  
  // Integration details
  connectionType: 'usb' | 'bluetooth' | 'wifi' | 'cellular' | 'manual';
  softwareRequired?: string;
  firmwareVersion?: string;
  
  // Validation status
  tested: boolean;
  lastTestedDate?: string;
  compatibilityScore: number; // 0-100
  
  // User feedback
  userRating?: number; // 1-5
  userComments?: string[];
}

export interface ExportConfiguration {
  format: 'shapefile' | 'kml' | 'isoxml' | 'geojson' | 'csv';
  
  // Coordinate system
  coordinateSystem: 'WGS84' | 'UTM' | 'local';
  utmZone?: string;
  
  // File options
  compression: boolean;
  includeMetadata: boolean;
  includePreview: boolean;
  machineryBrand?: string;
  machineryModel?: string;
  
  // Format-specific options
  shapefileOptions?: {
    includeDbf: boolean;
    encoding: 'UTF-8' | 'ASCII';
  };
  
  kmlOptions?: {
    includeGroundOverlay?: boolean;
    stylePolygons?: boolean;
    colorScheme?: 'default' | 'ndvi' | 'yield' | 'custom';
  };
  
  isoxmlOptions?: {
    taskDataVersion?: '3.0' | '4.0';
    includeTaskController?: boolean;
    machineryProfile?: string;
  };
  
  csvOptions?: {
    delimiter?: ',' | ';' | '\t';
    includeHeaders?: boolean;
    coordinateFormat?: 'decimal' | 'dms';
  };
}

export interface PrescriptionMapStats {
  // Usage statistics
  totalMapsGenerated: number;
  mapsGeneratedThisMonth: number;
  totalAreaCovered: number; // hectares
  
  // Popular configurations
  popularMapTypes: Record<string, number>;
  popularExportFormats: Record<string, number>;
  averageZonesPerMap: number;
  
  // Quality metrics
  averageQualityScore: number;
  averageDataCompleteness: number;
  successRate: number; // %
  
  // Cost savings
  totalCostSavings: number;
  averageRoi: number;
  inputReductionAchieved: number; // %
  
  // User engagement
  activeUsers: number;
  mapsDownloaded: number;
  machineryIntegrations: number;
}

export type PrescriptionExecutionStatus =
  | 'planned'
  | 'completed'
  | 'partial'
  | 'missed';

export type PrescriptionExecutionScopeType =
  | 'garden'
  | 'zone'
  | 'field_row'
  | 'tree'
  | 'plant';

export interface PrescriptionExecutionRecord {
  id: string;
  prescriptionMapId: string;
  prescriptionZoneId?: string;
  applicationDate: string;
  productName: string;
  productType?: string;
  plannedRate: number;
  actualRate?: number;
  unit: string;
  plannedAreaSqm?: number;
  areaAppliedSqm?: number;
  totalProductUsed?: number;
  machineryUsed?: string;
  operatorName?: string;
  gpsTrack?: Array<{
    latitude: number;
    longitude: number;
    timestamp: string;
  }>;
  applicationAccuracy?: number;
  applicationQuality?: number;
  notes?: string;
  weatherConditions?: Record<string, unknown>;
  productCost?: number;
  applicationCost?: number;
  totalCost?: number;
  executionStatus: PrescriptionExecutionStatus;
  executionScopeType?: PrescriptionExecutionScopeType;
  executionScopeId?: string;
  sourceOperationType?: 'irrigation' | 'fertilization' | 'treatment' | 'manual' | 'export';
  sourceOperationId?: string;
  prescriptionExportId?: string;
  smartDeviceId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PrescriptionMapExportRecord {
  id: string;
  prescriptionMapId: string;
  gardenId: string;
  versionNumber: number;
  format: ExportConfiguration['format'];
  coordinateSystem: ExportConfiguration['coordinateSystem'];
  compression: boolean;
  includeMetadata: boolean;
  includePreview: boolean;
  fileName: string;
  filePath?: string;
  downloadUrl?: string;
  fileSize?: number;
  status: 'generated' | 'downloaded' | 'field_imported' | 'field_applied';
  machineryBrand?: string;
  machineryModel?: string;
  machineryProfileId?: string;
  compatibilityScore?: number;
  warnings?: string[];
  metadata?: Record<string, string | number | boolean | null>;
  exportedAt: string;
  downloadedAt?: string;
  fieldImportedAt?: string;
  appliedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Utility types for calculations
export interface NDVIDataPoint {
  latitude: number;
  longitude: number;
  ndviValue: number;
  date: string;
  quality: number;
  sourceKind?: 'real' | 'estimated' | 'simulated' | 'fallback';
  algorithmVersion?: string;
}

export interface PlantDataPoint {
  plantId: string;
  latitude: number;
  longitude: number;
  healthScore: number;
  yieldData?: number;
  operationsCount: number;
  lastOperationDate: string;
}

export interface SoilDataPoint {
  latitude: number;
  longitude: number;
  soilType: string;
  ph?: number;
  organicMatter?: number;
  nitrogen?: number;
  phosphorus?: number;
  potassium?: number;
}

// Algorithm configuration types
export interface ZoneGenerationAlgorithm {
  name: 'kmeans' | 'hierarchical' | 'grid' | 'contour' | 'hybrid';
  parameters: Record<string, any>;
}

export interface PrescriptionAlgorithm {
  name: 'linear_interpolation' | 'machine_learning' | 'expert_rules' | 'hybrid';
  parameters: Record<string, any>;
  trainingData?: any[];
}

// Historical Comparison Types
export interface HistoricalComparisonRequest {
  gardenId: string;
  mapIds: string[];
  comparisonType: 'temporal' | 'seasonal' | 'treatment_response' | 'yield_correlation';
  timeRange: {
    startDate: string;
    endDate: string;
  };
  analysisMetrics: string[];
}

export interface HistoricalComparisonResult {
  success: boolean;
  comparisonId: string;
  
  // Temporal analysis
  temporalTrends: {
    metric: string;
    trend: 'increasing' | 'decreasing' | 'stable' | 'cyclical';
    changeRate: number; // % change per period
    confidence: number;
    dataPoints: Array<{
      date: string;
      value: number;
      mapId: string;
    }>;
  }[];
  
  // Zone evolution
  zoneEvolution: {
    zoneId: string;
    zoneName: string;
    evolution: Array<{
      date: string;
      mapId: string;
      applicationRate: number;
      dataQuality: number;
      expectedOutcome: number;
      actualOutcome?: number;
    }>;
    performanceScore: number;
    recommendations: string[];
  }[];
  
  // Seasonal patterns
  seasonalPatterns: {
    season: 'spring' | 'summer' | 'autumn' | 'winter';
    averageApplicationRate: number;
    variability: number;
    effectiveness: number;
    recommendations: string[];
  }[];
  
  // Treatment response analysis
  treatmentResponse: {
    treatmentType: string;
    responseTime: number; // days
    effectivenessScore: number;
    optimalDosage: number;
    costEffectiveness: number;
    sideEffects: string[];
  }[];
  
  // Yield correlation
  yieldCorrelation: {
    correlationCoefficient: number;
    significanceLevel: number;
    predictiveAccuracy: number;
    optimalRateRange: {
      min: number;
      max: number;
      unit: string;
    };
    yieldImpactAnalysis: Array<{
      applicationRate: number;
      expectedYield: number;
      actualYield?: number;
      variance: number;
    }>;
  };
  
  // Summary insights
  insights: {
    keyFindings: string[];
    recommendations: string[];
    riskFactors: string[];
    opportunities: string[];
    nextActions: string[];
  };
  
  // Quality metrics
  quality: {
    dataCompleteness: number;
    temporalCoverage: number;
    spatialAccuracy: number;
    confidenceScore: number;
    adaptiveBenchmarkScore?: number;
    adaptiveAlertFloorScore?: number;
    averageBenchmarkGap?: number;
    brixTarget?: number;
    benchmarkStatus?: 'above_target' | 'watch' | 'below_target' | 'no_data';
    notes?: string[];
  };
}

export interface TrendAnalysis {
  metric: string;
  timeframe: string;
  trend: {
    direction: 'up' | 'down' | 'stable';
    magnitude: number;
    acceleration: number;
    seasonality: boolean;
  };
  forecast: {
    nextPeriod: number;
    confidence: number;
    range: { min: number; max: number };
  };
  drivers: {
    factor: string;
    impact: number;
    confidence: number;
  }[];
}

// Cost Optimization Types
export interface CostOptimizationRequest {
  prescriptionMapId: string;
  optimizationGoals: {
    minimizeCost: number; // 0-1 weight
    maximizeYield: number; // 0-1 weight
    minimizeEnvironmentalImpact: number; // 0-1 weight
    maximizeEfficiency: number; // 0-1 weight
  };
  constraints: {
    maxBudget?: number;
    minYieldTarget?: number;
    maxEnvironmentalImpact?: number;
    regulatoryLimits?: Record<string, number>;
  };
  optimizationAlgorithm: 'genetic' | 'simulated_annealing' | 'particle_swarm' | 'gradient_descent';
}

export interface CostOptimizationResult {
  success: boolean;
  optimizationId: string;
  
  // Original vs optimized comparison
  original: {
    totalCost: number;
    expectedYield: number;
    environmentalScore: number;
    efficiencyScore: number;
  };
  
  optimized: {
    totalCost: number;
    expectedYield: number;
    environmentalScore: number;
    efficiencyScore: number;
  };
  
  // Improvements achieved
  improvements: {
    costReduction: number; // %
    yieldIncrease: number; // %
    environmentalImprovement: number; // %
    efficiencyGain: number; // %
    roi: number; // %
  };
  
  // Optimized zones
  optimizedZones: Array<{
    zoneId: string;
    originalRate: number;
    optimizedRate: number;
    rationale: string;
    expectedImpact: {
      costChange: number;
      yieldChange: number;
      environmentalChange: number;
    };
    confidence: number;
  }>;
  
  // Implementation plan
  implementationPlan: {
    phases: Array<{
      phase: number;
      description: string;
      zones: string[];
      estimatedCost: number;
      expectedBenefits: number;
      timeframe: string;
      priority: 'high' | 'medium' | 'low';
    }>;
    totalImplementationCost: number;
    paybackPeriod: number; // months
    riskAssessment: string[];
  };
  
  // Sensitivity analysis
  sensitivityAnalysis: {
    parameter: string;
    impact: number;
    scenarios: Array<{
      change: number; // % change in parameter
      costImpact: number;
      yieldImpact: number;
    }>;
  }[];
  
  // Quality metrics
  quality: {
    convergenceScore: number;
    solutionStability: number;
    constraintSatisfaction: number;
    overallConfidence: number;
  };
}

export interface RealTimeOptimization {
  optimizationId: string;
  status: 'running' | 'completed' | 'failed';
  progress: number; // 0-100
  
  currentBestSolution: {
    cost: number;
    yield: number;
    environmental: number;
    efficiency: number;
  };
  
  iterationHistory: Array<{
    iteration: number;
    cost: number;
    yield: number;
    convergence: number;
  }>;
  
  estimatedTimeRemaining: number; // seconds
}
