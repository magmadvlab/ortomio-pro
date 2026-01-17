// ============================================================================
// VINEYARD MANAGEMENT SYSTEM TYPES
// Comprehensive TypeScript definitions for professional vineyard management
// ============================================================================

// ============================================================================
// CORE VINEYARD TYPES
// ============================================================================

export interface VineyardConfiguration {
  id: string
  gardenId: string
  
  // Basic Configuration
  name: string
  description?: string
  vineyardType: VineyardType
  
  // Planting Information
  establishedDate?: string
  totalAreaSqm?: number
  totalVines: number
  vinesPerHectare?: number
  
  // Layout Configuration
  rowSpacingM?: number
  vineSpacingM?: number
  trainingSystem?: string
  
  // Varieties and Rootstocks
  mainVarieties: VarietyInfo[]
  rootstockTypes: RootstockInfo[]
  
  // Climate and Soil
  climateZone?: string
  soilType?: string
  irrigationSystem?: string
  
  // Management Settings
  organicCertified: boolean
  precisionManagement: boolean
  
  // Metadata
  createdAt: string
  updatedAt: string
  createdBy?: string
}

export type VineyardType = 
  | 'wine' 
  | 'table' 
  | 'raisin' 
  | 'mixed'

export interface VarietyInfo {
  variety: string
  percentage: number
  plantingDate?: string
  expectedYield?: number
  harvestPeriod?: string
  wineStyle?: string // red, white, rosé, sparkling
  notes?: string
}

export interface RootstockInfo {
  rootstock: string
  percentage: number
  characteristics: string[]
  soilAdaptation: string[]
  vigorControl: 'dwarfing' | 'semi_dwarfing' | 'standard' | 'vigorous'
  phylloxeraResistance: boolean
}

// ============================================================================
// INDIVIDUAL VINE MANAGEMENT
// ============================================================================

export interface VineyardVine {
  id: string
  vineyardId: string
  gardenId: string
  
  // Vine Identification
  vineNumber: string
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
  
  // Vine Characteristics
  variety: string
  rootstock?: string
  plantingDate?: string
  vineAgeYears?: number
  
  // Physical Characteristics
  trunkDiameterCm?: number
  vineHeightM?: number
  canopyWidthM?: number
  trainingSystem?: string
  
  // Health and Status
  healthStatus: VineHealthStatus
  vigorLevel: VineVigorLevel
  productivityStatus: VineProductivityStatus
  
  // Production Data
  expectedYieldKg?: number
  lastHarvestKg?: number
  lastHarvestDate?: string
  cumulativeYieldKg: number
  
  // Wine-specific Data
  sugarContentBrix?: number
  acidityLevel?: number
  phLevel?: number
  
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

export type VineHealthStatus = 
  | 'healthy' 
  | 'stressed' 
  | 'diseased' 
  | 'pest_damage' 
  | 'weather_damage' 
  | 'dead'

export type VineVigorLevel = 
  | 'very_low' 
  | 'low' 
  | 'normal' 
  | 'high' 
  | 'excessive'

export type VineProductivityStatus = 
  | 'young' 
  | 'establishing' 
  | 'productive' 
  | 'peak' 
  | 'declining' 
  | 'senescent'

// ============================================================================
// VINEYARD-SPECIFIC PRUNING TYPES
// ============================================================================

export type VineyardPruningType = 
  | 'winter' 
  | 'summer' 
  | 'green' 
  | 'spur' 
  | 'cane' 
  | 'renewal'

export type VineyardPruningObjective = 
  | 'yield_control'
  | 'quality_improvement'
  | 'canopy_management'
  | 'disease_prevention'
  | 'vigor_control'
  | 'shape_maintenance'
  | 'air_circulation'
  | 'light_exposure'

// ============================================================================
// VINEYARD-SPECIFIC HARVEST TYPES
// ============================================================================

export type VineyardHarvestType = 
  | 'wine_harvest' 
  | 'table_grape' 
  | 'selective_harvest' 
  | 'late_harvest'
  | 'ice_wine'

export interface VineyardMaturityIndices {
  brixMin?: number
  brixMax?: number
  acidityMin?: number // g/L
  acidityMax?: number
  phMin?: number
  phMax?: number
  phenolicMaturity?: number // 0-100 scale
  seedMaturity?: number // 0-100 scale
}

// ============================================================================
// WINE QUALITY ASSESSMENT
// ============================================================================

export interface WineQualityAssessment {
  id: string
  vineId: string
  harvestDate: string
  
  // Chemical Analysis
  sugarContent: number // Brix
  totalAcidity: number // g/L
  phLevel: number
  malicAcid: number // g/L
  
  // Physical Assessment
  berrySize: 'small' | 'medium' | 'large'
  skinThickness: 'thin' | 'medium' | 'thick'
  seedMaturity: number // 0-100 scale
  
  // Sensory Evaluation
  colorIntensity: number // 0-10 scale
  aromaIntensity: number // 0-10 scale
  flavorProfile: string[]
  
  // Quality Classification
  qualityGrade: WineQualityGrade
  wineStyle: WineStyle
  
  // Notes
  tastingNotes?: string
  recommendations?: string
  
  // Metadata
  createdAt: string
  createdBy?: string
}

export type WineQualityGrade = 
  | 'premium' 
  | 'reserve' 
  | 'standard' 
  | 'bulk'

export type WineStyle = 
  | 'red_dry' 
  | 'red_sweet' 
  | 'white_dry' 
  | 'white_sweet' 
  | 'rosé' 
  | 'sparkling' 
  | 'dessert'

// ============================================================================
// VINEYARD DASHBOARD DATA
// ============================================================================

export interface VineyardDashboardData {
  totalVineyards: number
  totalVines: number
  vinesNeedingAttention: number
  upcomingHarvests: number
  recentActivities: VineyardActivity[]
  
  // Quick Stats
  healthyVinesPercentage: number
  averageYieldPerVine: number
  totalYieldThisYear: number
  averageBrix: number
  
  // Alerts
  criticalAlerts: VineyardAlert[]
  upcomingTasks: VineyardTask[]
}

export interface VineyardActivity {
  id: string
  type: 'harvest' | 'pruning' | 'treatment' | 'planting' | 'observation' | 'tasting'
  date: string
  vineNumber?: string
  variety?: string
  description: string
  quantityKg?: number
  brixLevel?: number
  operator?: string
}

export interface VineyardAlert {
  id: string
  type: 'disease' | 'pest' | 'weather' | 'harvest_ready' | 'maintenance' | 'quality'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  affectedVines: number
  actionRequired: string
  dueDate?: string
}

export interface VineyardTask {
  id: string
  type: 'pruning' | 'harvest' | 'treatment' | 'observation' | 'canopy_management'
  title: string
  dueDate: string
  estimatedDuration: number // hours
  priority: 'low' | 'medium' | 'high'
  assignedTo?: string
}

// ============================================================================
// VINEYARD WIZARD DATA
// ============================================================================

export interface VineyardWizardData {
  step: number
  totalSteps: number
  
  // Step 1: Basic Information
  basicInfo?: {
    gardenId: string
    name: string
    description?: string
    vineyardType: VineyardType
    establishedDate?: string
    totalAreaSqm?: number
  }
  
  // Step 2: Layout and Design
  layout?: {
    rowSpacingM: number
    vineSpacingM: number
    trainingSystem: string
    irrigationSystem?: string
  }
  
  // Step 3: Varieties and Rootstocks
  varieties?: {
    mainVarieties: VarietyInfo[]
    rootstockTypes: RootstockInfo[]
  }
  
  // Step 4: Vine Planting
  vines?: {
    plantingMethod: 'manual' | 'bulk' | 'import'
    vineData: Partial<VineyardVine>[]
  }
  
  // Step 5: Management Settings
  management?: {
    organicCertified: boolean
    precisionManagement: boolean
    climateZone?: string
    soilType?: string
  }
}

// ============================================================================
// SEARCH AND FILTER TYPES
// ============================================================================

export interface VineyardFilters {
  vineyardTypes?: VineyardType[]
  varieties?: string[]
  healthStatus?: VineHealthStatus[]
  productivityStatus?: VineProductivityStatus[]
  ageRange?: { min: number; max: number }
  yieldRange?: { min: number; max: number }
  brixRange?: { min: number; max: number }
  zones?: string[]
  dateRange?: { startDate: string; endDate: string }
  organicOnly?: boolean
  needsAttention?: boolean
}

export interface VineSearchCriteria {
  vineNumber?: string
  variety?: string
  healthStatus?: VineHealthStatus[]
  vigorLevel?: VineVigorLevel[]
  productivityStatus?: VineProductivityStatus[]
  needsPruning?: boolean
  needsTreatment?: boolean
  harvestReady?: boolean
  brixRange?: { min: number; max: number }
  location?: {
    zoneId?: string
    fieldRowId?: string
    sectionId?: string
    rowNumber?: number
  }
}