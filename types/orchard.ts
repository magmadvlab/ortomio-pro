// ============================================================================
// ORCHARD MANAGEMENT SYSTEM TYPES
// Comprehensive TypeScript definitions for professional orchard management
// ============================================================================

// ============================================================================
// CORE ORCHARD TYPES
// ============================================================================

export interface OrchardConfiguration {
  id: string
  gardenId: string
  
  // Basic Configuration
  name: string
  description?: string
  orchardType: OrchardType
  
  // Planting Information
  establishedDate?: string
  totalAreaSqm?: number
  totalTrees: number
  treesPerHectare?: number
  
  // Layout Configuration
  rowSpacingM?: number
  treeSpacingM?: number
  trainingSystem?: string
  
  // Varieties and Rootstocks
  mainVarieties: VarietyInfo[]
  rootstockTypes: RootstockInfo[]
  
  // Climate and Soil
  climateZone?: string
  soilType?: string
  irrigationSystem?: string
  irrigationDefaults?: OrchardIrrigationDefaults
  
  // Management Settings
  organicCertified: boolean
  precisionManagement: boolean
  
  // Metadata
  createdAt: string
  updatedAt: string
  createdBy?: string
}

export type OrchardType = 
  | 'mixed' 
  | 'apple' 
  | 'pear' 
  | 'peach' 
  | 'apricot' 
  | 'cherry' 
  | 'plum'
  | 'citrus' 
  | 'olive' 
  | 'walnut' 
  | 'hazelnut' 
  | 'almond' 
  | 'tropical'

export interface OrchardIrrigationDefaults {
  lineType: 'Dripline' | 'PipeWithDrippers' | 'MicroSprinkler'
  pipeDiameterMm?: number
  emitterSpacingCm?: number
  emitterFlowRateLph?: number
}

export interface VarietyInfo {
  variety: string
  percentage: number
  plantingDate?: string
  expectedYield?: number
  harvestPeriod?: string
  notes?: string
}

export interface RootstockInfo {
  rootstock: string
  percentage: number
  characteristics: string[]
  soilAdaptation: string[]
  vigorControl: 'dwarfing' | 'semi_dwarfing' | 'standard' | 'vigorous'
}

// ============================================================================
// INDIVIDUAL TREE MANAGEMENT
// ============================================================================

export interface OrchardTree {
  id: string
  orchardId: string
  gardenId: string
  
  // Tree Identification
  treeNumber: string
  qrCode?: string
  
  // Location Information
  zoneId?: string
  fieldRowId?: string
  sectionId?: string
  
  // Precise Position
  rowNumber?: number
  positionInRow?: number
  gpsLatitude?: number
  gpsLongitude?: number
  
  // Tree Characteristics
  variety: string
  rootstock?: string
  plantingDate?: string
  treeAgeYears?: number
  
  // Physical Characteristics
  trunkDiameterCm?: number
  treeHeightM?: number
  canopyWidthM?: number
  trainingSystem?: string
  
  // Health and Status
  healthStatus: TreeHealthStatus
  vigorLevel: TreeVigorLevel
  productivityStatus: TreeProductivityStatus
  
  // Production Data
  expectedYieldKg?: number
  lastHarvestKg?: number
  lastHarvestDate?: string
  cumulativeYieldKg: number
  
  // Management Notes
  notes?: string
  specialRequirements?: string
  
  // Status Flags
  needsPruning: boolean
  needsTreatment: boolean
  needsReplacement: boolean
  isActive: boolean
  
  // Metadata
  createdAt: string
  updatedAt: string
}

export type TreeHealthStatus = 
  | 'healthy' 
  | 'stressed' 
  | 'diseased' 
  | 'pest_damage' 
  | 'weather_damage' 
  | 'dead'

export type TreeVigorLevel = 
  | 'very_low' 
  | 'low' 
  | 'normal' 
  | 'high' 
  | 'excessive'

export type TreeProductivityStatus = 
  | 'young' 
  | 'establishing' 
  | 'productive' 
  | 'peak' 
  | 'declining' 
  | 'senescent'

// ============================================================================
// TREE DOCUMENTATION AND PHOTOS
// ============================================================================

export interface TreePhoto {
  id: string
  treeId: string
  
  // Photo Information
  photoUrl: string
  photoType: TreePhotoType
  
  // Photo Metadata
  takenDate: string
  phenologicalStage?: string
  
  // Analysis Data
  aiAnalysis?: AIPhotoAnalysis
  annotations?: PhotoAnnotation[]
  
  // Context
  weatherConditions?: WeatherConditions
  notes?: string
  
  // Metadata
  createdAt: string
  createdBy?: string
}

export type TreePhotoType = 
  | 'overview' 
  | 'trunk' 
  | 'canopy' 
  | 'leaves' 
  | 'flowers' 
  | 'fruit'
  | 'disease' 
  | 'pest_damage' 
  | 'weather_damage' 
  | 'pruning_before'
  | 'pruning_after' 
  | 'harvest'

export interface AIPhotoAnalysis {
  confidence: number
  detectedIssues: string[]
  healthScore: number
  recommendations: string[]
  phenologyStage?: string
  fruitCount?: number
  diseaseDetection?: DiseaseDetection[]
}

export interface DiseaseDetection {
  disease: string
  confidence: number
  severity: 'low' | 'medium' | 'high' | 'severe'
  affectedArea: number // percentage
  recommendations: string[]
}

export interface PhotoAnnotation {
  id: string
  x: number // pixel coordinates
  y: number
  width: number
  height: number
  label: string
  description?: string
  severity?: string
}

// ============================================================================
// PHENOLOGICAL MONITORING
// ============================================================================

export interface PhenologicalObservation {
  id: string
  treeId?: string
  orchardId?: string
  
  // Observation Details
  observationDate: string
  phenologicalStage: PhenologicalStage
  stageIntensity?: number // 0-100%
  
  // BBCH Scale Integration
  bbchCode?: string
  bbchDescription?: string
  
  // Environmental Conditions
  temperatureC?: number
  humidityPercent?: number
  weatherConditions?: string
  
  // Observation Method
  observationMethod: ObservationMethod
  confidenceLevel?: number // 0-100%
  
  // Additional Data
  photos: string[] // Photo IDs
  notes?: string
  
  // Metadata
  createdAt: string
  createdBy?: string
}

export type PhenologicalStage = 
  | 'dormancy'
  | 'bud_swell'
  | 'bud_break'
  | 'leaf_emergence'
  | 'flowering'
  | 'petal_fall'
  | 'fruit_set'
  | 'fruit_development'
  | 'fruit_maturation'
  | 'harvest'
  | 'leaf_fall'

export type ObservationMethod = 
  | 'visual' 
  | 'sensor' 
  | 'ai_analysis' 
  | 'drone_survey'

// ============================================================================
// PRUNING MANAGEMENT
// ============================================================================

export interface PruningSchedule {
  id: string
  orchardId: string
  
  // Schedule Information
  name: string
  pruningType: PruningType
  
  // Timing
  scheduledStartDate: string
  scheduledEndDate?: string
  optimalPhenologicalStage?: string
  
  // Target Trees
  targetCriteria: TreeSelectionCriteria
  estimatedTrees?: number
  
  // Pruning Specifications
  pruningIntensity: PruningIntensity
  pruningObjectives: PruningObjective[]
  techniques: PruningTechnique[]
  
  // Resource Planning
  estimatedHoursPerTree?: number
  totalEstimatedHours?: number
  requiredTools: string[]
  
  // Status
  status: ScheduleStatus
  completionPercentage: number
  
  // Results
  actualStartDate?: string
  actualEndDate?: string
  actualHours?: number
  treesPruned: number
  
  // Notes
  instructions?: string
  notes?: string
  
  // Metadata
  createdAt: string
  updatedAt: string
  createdBy?: string
}

export type PruningType = 
  | 'winter' 
  | 'summer' 
  | 'training' 
  | 'production' 
  | 'renovation' 
  | 'corrective'

export type PruningIntensity = 
  | 'light' 
  | 'moderate' 
  | 'heavy' 
  | 'severe'

export type PruningObjective = 
  | 'shape_formation'
  | 'light_penetration'
  | 'air_circulation'
  | 'disease_prevention'
  | 'yield_optimization'
  | 'size_control'
  | 'rejuvenation'
  | 'mechanical_harvest_prep'

export type PruningTechnique = 
  | 'heading_back'
  | 'thinning_out'
  | 'renewal_pruning'
  | 'spur_pruning'
  | 'cane_pruning'
  | 'topping'
  | 'dehorning'

export interface TreeSelectionCriteria {
  varieties?: string[]
  ageRange?: { min: number; max: number }
  healthStatus?: TreeHealthStatus[]
  vigorLevel?: TreeVigorLevel[]
  zones?: string[]
  rows?: number[]
  customCriteria?: string
}

export interface TreePruningRecord {
  id: string
  treeId: string
  pruningScheduleId?: string
  
  // Pruning Details
  pruningDate: string
  pruningType: PruningType
  
  // Work Details
  operatorName?: string
  durationMinutes?: number
  
  // Pruning Specifications
  branchesRemoved?: number
  woodRemovedKg?: number
  pruningIntensity: PruningIntensity
  techniquesUsed: PruningTechnique[]
  
  // Tree Condition
  treeConditionBefore?: string
  treeConditionAfter?: string
  
  // Quality Assessment
  pruningQuality?: QualityRating
  objectivesMet: PruningObjective[]
  
  // Documentation
  beforePhotos: string[]
  afterPhotos: string[]
  notes?: string
  
  // Follow-up
  followUpRequired: boolean
  followUpDate?: string
  followUpNotes?: string
  
  // Metadata
  createdAt: string
  createdBy?: string
}

export type QualityRating = 'excellent' | 'good' | 'fair' | 'poor'

// ============================================================================
// HARVEST MANAGEMENT
// ============================================================================

export interface HarvestSchedule {
  id: string
  orchardId: string
  
  // Schedule Information
  name: string
  variety: string
  harvestType: HarvestType
  
  // Timing
  estimatedStartDate: string
  estimatedEndDate?: string
  optimalMaturityIndices?: MaturityIndices
  
  // Target Areas
  targetZones: string[] // Zone/row/section IDs
  estimatedTrees?: number
  estimatedYieldKg?: number
  
  // Quality Specifications
  qualityStandards?: QualityStandards
  harvestMethod: HarvestMethod
  
  // Logistics
  containersNeeded?: number
  storageRequirements?: string
  transportArrangements?: string
  
  // Market Information
  targetMarket?: TargetMarket
  expectedPricePerKg?: number
  
  // Status
  status: ScheduleStatus
  completionPercentage: number
  
  // Results
  actualStartDate?: string
  actualEndDate?: string
  actualYieldKg?: number
  actualTreesHarvested?: number
  
  // Quality Results
  averageQualityScore?: number
  qualityDistribution?: QualityDistribution
  
  // Economic Results
  actualPricePerKg?: number
  totalRevenue?: number
  harvestCosts?: number
  
  // Notes
  instructions?: string
  notes?: string
  
  // Metadata
  createdAt: string
  updatedAt: string
  createdBy?: string
}

export type HarvestType = 
  | 'commercial' 
  | 'thinning' 
  | 'sampling' 
  | 'quality_test'

export type HarvestMethod = 
  | 'manual' 
  | 'mechanical' 
  | 'selective' 
  | 'strip_picking'

export type TargetMarket = 
  | 'fresh' 
  | 'processing' 
  | 'export' 
  | 'local' 
  | 'premium' 
  | 'organic'

export interface MaturityIndices {
  brixMin?: number
  brixMax?: number
  firmnessMin?: number // kg/cm²
  firmnessMax?: number
  colorScore?: number
  starchIndex?: number
  acidityLevel?: number
  oilContent?: number // For olives, nuts
}

export interface QualityStandards {
  sizeMin?: number // mm diameter
  sizeMax?: number
  colorRequirements?: string[]
  defectTolerance?: number // percentage
  uniformityRequirement?: number
}

export interface QualityDistribution {
  premium: number // percentage
  first: number
  second: number
  processing: number
  waste: number
}

export interface TreeHarvestRecord {
  id: string
  treeId: string
  harvestScheduleId?: string
  
  // Harvest Details
  harvestDate: string
  harvestTime?: string
  
  // Operator Information
  operatorName?: string
  pickerId?: string
  
  // Quantity and Quality
  quantityKg: number
  fruitCount?: number
  averageFruitWeightG?: number
  
  // Quality Assessment
  qualityClass: QualityClass
  brixLevel?: number
  firmnessKgCm2?: number
  colorScore?: number
  defectsPercentage?: number
  
  // Maturity Indices
  starchIndex?: number
  acidityLevel?: number
  oilContentPercentage?: number
  
  // Environmental Conditions
  weatherConditions?: string
  temperatureC?: number
  humidityPercent?: number
  
  // Container and Logistics
  containerId?: string
  storageLocation?: string
  
  // Documentation
  photos: string[]
  qualityPhotos: string[]
  notes?: string
  
  // Traceability
  batchNumber?: string
  lotNumber?: string
  
  // Metadata
  createdAt: string
  createdBy?: string
}

export type QualityClass = 
  | 'premium' 
  | 'first' 
  | 'second' 
  | 'processing' 
  | 'waste'

// ============================================================================
// TREE TREATMENTS
// ============================================================================

export interface TreeTreatment {
  id: string
  treeId: string
  
  // Treatment Information
  treatmentDate: string
  treatmentType: TreatmentType
  
  // Product Information
  productName?: string
  activeIngredient?: string
  concentration?: number
  dosage?: number
  dosageUnit?: string
  
  // Application Details
  applicationMethod?: string
  equipmentUsed?: string
  operatorName?: string
  
  // Target and Reason
  targetPestDisease?: string
  treatmentReason?: string
  severityLevel: SeverityLevel
  
  // Environmental Conditions
  weatherConditions?: string
  temperatureC?: number
  windSpeedKmh?: number
  humidityPercent?: number
  
  // Effectiveness Tracking
  effectivenessRating?: number // 0-10 scale
  effectivenessNotes?: string
  followUpRequired: boolean
  followUpDate?: string
  
  // Safety and Compliance
  preharvestIntervalDays?: number
  reentryIntervalHours?: number
  organicApproved: boolean
  
  // Documentation
  beforePhotos: string[]
  afterPhotos: string[]
  notes?: string
  
  // Costs
  productCost?: number
  laborCost?: number
  totalCost?: number
  
  // Metadata
  createdAt: string
  createdBy?: string
}

export type TreatmentType = 
  | 'fertilization' 
  | 'pest_control' 
  | 'disease_control' 
  | 'weed_control'
  | 'growth_regulation' 
  | 'soil_amendment' 
  | 'foliar_nutrition'

export type SeverityLevel = 
  | 'preventive' 
  | 'low' 
  | 'medium' 
  | 'high' 
  | 'severe' 
  | 'emergency'

// ============================================================================
// ANALYTICS AND REPORTING
// ============================================================================

export interface OrchardAnalytics {
  id: string
  orchardId: string
  
  // Analysis Period
  analysisDate: string
  periodStart: string
  periodEnd: string
  
  // Production Metrics
  totalYieldKg?: number
  yieldPerTreeKg?: number
  yieldPerHectareKg?: number
  
  // Quality Metrics
  averageQualityScore?: number
  premiumPercentage?: number
  firstClassPercentage?: number
  processingPercentage?: number
  
  // Economic Metrics
  totalRevenue?: number
  revenuePerTree?: number
  revenuePerHectare?: number
  totalCosts?: number
  profitMarginPercentage?: number
  
  // Efficiency Metrics
  laborHoursPerTree?: number
  costPerKg?: number
  treesPerLaborHour?: number
  
  // Health Metrics
  healthyTreesPercentage?: number
  diseasedTreesCount?: number
  pestDamagePercentage?: number
  mortalityRatePercentage?: number
  
  // Sustainability Metrics
  organicTreatmentsPercentage?: number
  waterUsagePerTree?: number
  carbonFootprintKg?: number
  
  // Comparative Data
  industryBenchmarkYield?: number
  performanceVsBenchmark?: number // Percentage difference
  
  // Metadata
  createdAt: string
  createdBy?: string
}

export interface OrchardDashboardData {
  totalOrchards: number
  totalTrees: number
  treesNeedingAttention: number
  upcomingHarvests: number
  recentActivities: RecentActivity[]
  
  // Quick Stats
  healthyTreesPercentage: number
  averageYieldPerTree: number
  totalYieldThisYear: number
  profitabilityScore: number
  adaptiveQualityScore?: number
  qualityTargetScore?: number
  qualityAlertFloorScore?: number
  qualityBenchmarkStatus?: 'above_target' | 'watch' | 'below_target' | 'no_data'
  
  // Alerts
  criticalAlerts: OrchardAlert[]
  upcomingTasks: UpcomingTask[]
}

export interface RecentActivity {
  id: string
  type: 'harvest' | 'pruning' | 'treatment' | 'planting' | 'observation'
  date: string
  treeNumber?: string
  variety?: string
  description: string
  quantityKg?: number
  operator?: string
}

export interface OrchardAlert {
  id: string
  type: 'disease' | 'pest' | 'weather' | 'harvest_ready' | 'maintenance'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  affectedTrees: number
  actionRequired: string
  dueDate?: string
}

export interface UpcomingTask {
  id: string
  type: 'pruning' | 'harvest' | 'treatment' | 'observation'
  title: string
  dueDate: string
  estimatedDuration: number // hours
  priority: 'low' | 'medium' | 'high'
  assignedTo?: string
}

// ============================================================================
// COMMON TYPES
// ============================================================================

export type ScheduleStatus = 
  | 'planned' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled' 
  | 'postponed'

export interface WeatherConditions {
  temperature?: number
  humidity?: number
  windSpeed?: number
  windDirection?: string
  pressure?: number
  rainfall?: number
  conditions?: string
}

// ============================================================================
// SEARCH AND FILTER TYPES
// ============================================================================

export interface OrchardFilters {
  orchardTypes?: OrchardType[]
  varieties?: string[]
  healthStatus?: TreeHealthStatus[]
  productivityStatus?: TreeProductivityStatus[]
  ageRange?: { min: number; max: number }
  yieldRange?: { min: number; max: number }
  zones?: string[]
  dateRange?: { startDate: string; endDate: string }
  organicOnly?: boolean
  needsAttention?: boolean
}

export interface TreeSearchCriteria {
  treeNumber?: string
  variety?: string
  healthStatus?: TreeHealthStatus[]
  vigorLevel?: TreeVigorLevel[]
  productivityStatus?: TreeProductivityStatus[]
  needsPruning?: boolean
  needsTreatment?: boolean
  harvestReady?: boolean
  location?: {
    zoneId?: string
    fieldRowId?: string
    sectionId?: string
    rowNumber?: number
  }
}

// ============================================================================
// EXPORT AND IMPORT TYPES
// ============================================================================

export interface OrchardExportData {
  orchards: OrchardConfiguration[]
  trees: OrchardTree[]
  photos: TreePhoto[]
  observations: PhenologicalObservation[]
  pruningRecords: TreePruningRecord[]
  harvestRecords: TreeHarvestRecord[]
  treatments: TreeTreatment[]
  analytics: OrchardAnalytics[]
}

export interface OrchardImportOptions {
  includeOrchards: boolean
  includeTrees: boolean
  includePhotos: boolean
  includeObservations: boolean
  includePruning: boolean
  includeHarvest: boolean
  includeTreatments: boolean
  includeAnalytics: boolean
  dateRange?: { startDate: string; endDate: string }
  overwriteExisting: boolean
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface OrchardValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  field: string
  message: string
  code: string
  value?: any
}

export interface ValidationWarning {
  field: string
  message: string
  suggestion?: string
  value?: any
}

// ============================================================================
// WIZARD AND SETUP TYPES
// ============================================================================

export interface OrchardWizardData {
  step: number
  totalSteps: number
  
  // Step 1: Basic Information
  basicInfo?: {
    gardenId?: string
    name: string
    description?: string
    orchardType: OrchardType
    establishedDate?: string
    totalAreaSqm?: number
  }
  
  // Step 2: Layout and Design
  layout?: {
    rowSpacingM: number
    treeSpacingM: number
    trainingSystem: string
    irrigationSystem?: string
    irrigationDefaults?: OrchardIrrigationDefaults
  }
  
  // Step 3: Varieties and Rootstocks
  varieties?: {
    mainVarieties: VarietyInfo[]
    rootstockTypes: RootstockInfo[]
  }
  
  // Step 4: Tree Planting
  trees?: {
    plantingMethod: 'manual' | 'bulk' | 'import'
    treeData: Partial<OrchardTree>[]
  }
  
  // Step 5: Management Settings
  management?: {
    organicCertified: boolean
    precisionManagement: boolean
    climateZone?: string
    soilType?: string
  }
}

export interface BulkTreeImport {
  file?: File
  data: BulkTreeData[]
  mapping: FieldMapping
  validation: ImportValidation
}

export interface BulkTreeData {
  treeNumber: string
  variety: string
  rootstock?: string
  rowNumber?: number
  positionInRow?: number
  plantingDate?: string
  notes?: string
}

export interface FieldMapping {
  treeNumber: string
  variety: string
  rootstock?: string
  rowNumber?: string
  positionInRow?: string
  plantingDate?: string
  notes?: string
}

export interface ImportValidation {
  totalRows: number
  validRows: number
  errors: ImportError[]
  warnings: ImportWarning[]
}

export interface ImportError {
  row: number
  field: string
  message: string
  value: any
}

export interface ImportWarning {
  row: number
  field: string
  message: string
  suggestion: string
  value: any
}
