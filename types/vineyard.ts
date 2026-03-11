// ============================================================================
// VINEYARD MANAGEMENT TYPES
// Professional types for vineyard operations and analytics
// ============================================================================

export type VineyardType = 'wine' | 'table' | 'raisin' | 'mixed' | 'dual-purpose'

export type VineyardTrainingSystem = 'guyot' | 'cordon' | 'pergola' | 'tendone' | 'sylvoz' | 'other'

export type VineyardHarvestType =
  | 'wine_harvest'
  | 'table_grape'
  | 'selective_harvest'
  | 'late_harvest'
  | 'ice_wine'

export type VineyardPruningType =
  | 'winter'
  | 'summer'
  | 'green'
  | 'spur'
  | 'cane'
  | 'renewal'

export interface VarietyInfo {
  variety: string
  percentage: number
  cloneCode?: string
  wineStyle?: 'red' | 'white' | 'rose' | 'sparkling' | 'table'
  harvestPeriod?: string
  notes?: string
}

export interface RootstockInfo {
  rootstock: string
  percentage: number
  characteristics: string[]
  soilAdaptation: string[]
  vigorControl: 'dwarfing' | 'semi_dwarfing' | 'standard' | 'vigorous'
  phylloxeraResistance?: boolean
}

export interface VineyardConfiguration {
  id: string
  gardenId: string
  name: string
  description?: string
  vineyardType: VineyardType
  establishedDate?: string
  totalAreaSqm?: number
  hectares?: number
  totalVines: number
  vinesPerHectare?: number
  mainVarieties: VarietyInfo[]
  rootstockTypes: RootstockInfo[]
  trainingSystem?: VineyardTrainingSystem
  rowSpacingM?: number
  vineSpacingM?: number
  rowSpacing?: number
  vineSpacing?: number
  climateZone?: string
  soilType?: string
  irrigationSystem?: string
  organicCertified: boolean
  precisionManagement: boolean
  createdAt: string
  updatedAt: string
  createdBy?: string
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

export interface VineyardVine {
  id: string
  vineyardId: string
  gardenId: string
  vineNumber: string
  qrCode?: string
  zoneId?: string
  fieldRowId?: string
  sectionId?: string
  rowNumber?: number
  positionInRow?: number
  gpsLatitude?: number
  gpsLongitude?: number
  variety: string
  rootstock?: string
  plantingDate?: string
  vineAgeYears?: number
  trunkDiameterCm?: number
  vineHeightM?: number
  canopyWidthM?: number
  trainingSystem?: VineyardTrainingSystem | string
  healthStatus: VineHealthStatus
  vigorLevel: VineVigorLevel
  productivityStatus: VineProductivityStatus
  expectedYieldKg?: number
  lastHarvestKg?: number
  lastHarvestDate?: string
  cumulativeYieldKg: number
  sugarContentBrix?: number
  acidityLevel?: number
  phLevel?: number
  notes?: string
  specialRequirements?: string
  needsPruning: boolean
  needsTreatment: boolean
  needsReplacement: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface VineyardRecentActivity {
  id: string
  type: 'harvest' | 'pruning' | 'treatment' | 'observation' | 'canopy_management'
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
  actionRequired?: string
  dueDate?: string
}

export interface VineyardTask {
  id: string
  type: 'pruning' | 'harvest' | 'treatment' | 'observation' | 'canopy_management'
  title: string
  dueDate: string
  estimatedDuration?: number
  priority: 'low' | 'medium' | 'high'
  assignedTo?: string
}

export interface VineyardDashboardData {
  totalVineyards: number
  totalVines: number
  vinesNeedingAttention: number
  upcomingHarvests: number
  recentActivities: VineyardRecentActivity[]
  healthyVinesPercentage: number
  averageYieldPerVine: number
  totalYieldThisYear: number
  averageBrix: number
  criticalAlerts: VineyardAlert[]
  upcomingTasks: VineyardTask[]
}

export interface VineLocationCriteria {
  zoneId?: string
  fieldRowId?: string
  rowNumber?: number
}

export interface VineSearchCriteria {
  variety?: string
  healthStatus?: VineHealthStatus[]
  vigorLevel?: VineVigorLevel[]
  productivityStatus?: VineProductivityStatus[]
  needsPruning?: boolean
  needsTreatment?: boolean
  harvestReady?: boolean
  location?: VineLocationCriteria
}

export interface VineyardFilters {
  vineyardTypes?: VineyardType[]
  varieties?: string[]
  healthStatus?: VineHealthStatus[]
  productivityStatus?: VineProductivityStatus[]
  ageRange?: { min: number; max: number }
  brixRange?: { min: number; max: number }
  zones?: string[]
}

export interface VineyardWizardBasicInfo {
  gardenId: string
  name: string
  description?: string
  vineyardType: VineyardType
  establishedDate?: string
  totalAreaSqm?: number
}

export interface VineyardWizardLayout {
  rowSpacingM: number
  vineSpacingM: number
  trainingSystem?: VineyardTrainingSystem
  irrigationSystem?: string
}

export interface VineyardWizardVarieties {
  mainVarieties: VarietyInfo[]
  rootstockTypes: RootstockInfo[]
}

export interface VineyardWizardVines {
  plantingMethod: 'manual' | 'bulk' | 'import'
  vineData: Partial<VineyardVine>[]
}

export interface VineyardWizardManagement {
  organicCertified: boolean
  precisionManagement: boolean
  climateZone?: string
  soilType?: string
}

export interface VineyardWizardData {
  step: number
  totalSteps: number
  basicInfo?: VineyardWizardBasicInfo
  layout?: VineyardWizardLayout
  varieties?: VineyardWizardVarieties
  vines?: VineyardWizardVines
  management?: VineyardWizardManagement
}

// ============================================================================
// BUD LOAD AND MATURITY TRACKING
// ============================================================================

export interface BudLoadData {
  id: string
  vineyardId: string
  season: string
  pruningDate: string
  pruningWoodWeight: number
  harvestDate?: string
  grapeYield: number
  ravazIndex?: number
  budsPerVine?: number
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface RavazIndexCalculation {
  ravazIndex: number
  interpretation: 'under-production' | 'optimal' | 'over-production' | 'severe-over-production'
  recommendation: string
  color: string
  icon: string
}

export interface GrapeMaturityData {
  id: string
  vineyardId: string
  measurementDate: string
  brix: number
  ph?: number
  totalAcidity?: number
  malicAcid?: number
  tartaricAcid?: number
  estimatedAlcohol?: number
  berryWeight?: number
  berryColor?: 'green' | 'yellow' | 'pink' | 'red' | 'purple' | 'black'
  tastingNotes?: string
  harvestRecommendation?: 'too-early' | 'wait' | 'optimal' | 'harvest-soon' | 'overripe'
  location?: string
  variety?: string
  createdAt: string
  updatedAt: string
}

export interface GreenOperation {
  id: string
  vineyardId: string
  operationType: 'defoliation' | 'topping' | 'shoot-thinning' | 'cluster-thinning'
  operationDate: string
  intensity: 'light' | 'medium' | 'heavy'
  zone?: 'basal' | 'apical' | 'lateral' | 'all'
  affectedVines: number
  estimatedHours: number
  actualHours?: number
  operator?: string
  notes?: string
  photos?: string[]
  createdAt: string
  updatedAt: string
}

export interface DefoliationData extends GreenOperation {
  operationType: 'defoliation'
  leavesRemoved: 'basal' | 'apical' | 'both'
  timing: 'pre-flowering' | 'fruit-set' | 'veraison' | 'pre-harvest'
  benefits: string[]
}

export interface ToppingData extends GreenOperation {
  operationType: 'topping' | 'shoot-thinning'
  shootsRemoved?: number
  heightReduction?: number
  vigorControl: 'low' | 'medium' | 'high'
}

export interface ClusterThinningData extends GreenOperation {
  operationType: 'cluster-thinning'
  clustersPerVine: number
  clustersRemoved: number
  targetYield: number
  qualityGoal: 'standard' | 'premium' | 'reserve'
}

export interface VineyardKPIs {
  vineyardId: string
  season: string
  totalYield: number
  yieldPerVine: number
  yieldPerHectare: number
  averageClusterWeight: number
  averageBrix: number
  averagePh: number
  averageAcidity: number
  ravazIndex: number
  qualityScore: number
  estimatedWineProduction?: number
  estimatedRevenue?: number
}
