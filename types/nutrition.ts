// Advanced Nutrition System Types
// Comprehensive type definitions for professional nutrition and treatment management

import type { IrrigationWaterQualityBand } from './irrigation'

export interface FertilizerProduct {
  id: string
  gardenId: string
  name: string
  brand?: string
  productCode?: string
  
  // Product Classification
  fertilizerType: 'organic' | 'mineral' | 'chemical' | 'mixed' | 'bio_stimulant'
  category: 'base' | 'foliar' | 'liquid' | 'granular' | 'slow_release' | 'water_soluble'
  
  // Nutritional Composition
  npkRatio?: string // e.g., "20-20-20"
  nitrogenPercentage?: number
  phosphorusPercentage?: number
  potassiumPercentage?: number
  
  // Secondary and Micro Nutrients
  calciumPercentage?: number
  magnesiumPercentage?: number
  sulfurPercentage?: number
  microNutrients?: MicroNutrient[]
  
  // Application Details
  recommendedDosage: number // g/m² or ml/L
  dosageUnit: 'g_per_sqm' | 'ml_per_liter' | 'kg_per_ha' | 'l_per_ha'
  applicationMethod: 'soil' | 'foliar' | 'fertigation' | 'granular_broadcast' | 'side_dress'
  
  // Compatibility and Restrictions
  phRange?: { min: number; max: number }
  compatibleProducts?: string[] // IDs of compatible products
  incompatibleProducts?: string[] // IDs of incompatible products
  organicApproved: boolean
  
  // Inventory Management
  currentStock?: number
  stockUnit?: 'kg' | 'liters' | 'bags' | 'bottles'
  costPerUnit?: number
  supplier?: string
  purchaseDate?: string
  expiryDate?: string
  
  // Usage Guidelines
  applicationFrequency?: string
  seasonalRestrictions?: string[]
  cropSpecificNotes?: string
  safetyNotes?: string
  
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface MicroNutrient {
  element: 'iron' | 'manganese' | 'zinc' | 'copper' | 'boron' | 'molybdenum' | 'chlorine'
  percentage: number
  form?: string // e.g., 'chelated', 'sulfate', 'oxide'
}

export interface TreatmentProduct {
  id: string
  gardenId: string
  name: string
  brand?: string
  productCode?: string
  
  // Product Classification
  treatmentType: 'pesticide' | 'fungicide' | 'herbicide' | 'insecticide' | 'bactericide' | 'nematicide'
  activeIngredient: string
  concentration: number // percentage or g/L
  concentrationUnit: 'percentage' | 'g_per_liter' | 'mg_per_liter'
  
  // Application Details
  recommendedDosage: number
  dosageUnit: 'ml_per_liter' | 'g_per_liter' | 'l_per_ha' | 'kg_per_ha'
  applicationMethod: 'spray' | 'soil_drench' | 'seed_treatment' | 'trunk_injection' | 'fumigation'
  
  // Target and Efficacy
  targetPests?: string[]
  targetDiseases?: string[]
  targetWeeds?: string[]
  efficacyRating?: number // 1-10 scale
  
  // Safety and Compliance
  organicApproved: boolean
  preharvest_interval_days: number // PHI - Pre-Harvest Interval
  reentry_interval_hours: number // REI - Restricted Entry Interval
  toxicityClass?: 'I' | 'II' | 'III' | 'IV' // WHO classification
  
  // Environmental Considerations
  beeHazard: boolean
  aquaticHazard: boolean
  soilPersistence?: 'low' | 'medium' | 'high'
  
  // Resistance Management
  modeOfAction?: string
  resistanceGroup?: string
  maxApplicationsPerSeason?: number
  
  // Inventory Management
  currentStock?: number
  stockUnit?: 'liters' | 'kg' | 'bottles' | 'bags'
  costPerUnit?: number
  supplier?: string
  purchaseDate?: string
  expiryDate?: string
  
  // Usage Guidelines
  weatherRestrictions?: string[]
  temperatureRange?: { min: number; max: number }
  windSpeedLimit?: number
  rainFastHours?: number
  
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface NutritionTreatment {
  id: string
  gardenId: string
  sourceTaskId?: string
  
  // Location Targeting
  zoneId?: string
  fieldRowId?: string
  sectionId?: string
  plantIds?: string[] // for individual plant treatments
  
  // Treatment Details
  treatmentType: 'fertilization' | 'pest_control' | 'disease_control' | 'weed_control' | 'growth_regulation'
  productId: string // references FertilizerProduct or TreatmentProduct
  productName: string // denormalized for performance
  
  // Application Configuration
  dosage: number
  dosageUnit: string
  applicationMethod: string
  mixingInstructions?: string
  
  // Scheduling
  scheduledDate: string
  actualApplicationDate?: string
  applicationTime?: string // HH:MM format
  
  // Environmental Conditions
  weatherConditions?: WeatherConditions
  soilConditions?: SoilConditions
  
  // Execution Details
  operatorId?: string
  operatorName?: string
  equipmentUsed?: string
  applicationDurationMinutes?: number
  
  // Quality Control
  calibrationCheck: boolean
  mixingRatio?: string
  actualCoverage?: number // area covered in m²
  
  // Results and Monitoring
  effectiveness?: number // 1-10 scale
  sideEffects?: string[]
  plantResponse?: string
  followUpRequired: boolean
  followUpDate?: string
  
  // Compliance and Documentation
  organicCompliant: boolean
  certificationNotes?: string
  photosBeforeIds?: string[]
  photosAfterIds?: string[]
  
  // Cost Tracking
  productCost?: number
  laborCost?: number
  equipmentCost?: number
  totalCost?: number
  
  notes?: string
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled' | 'postponed'
  
  createdAt: string
  updatedAt: string
}

export interface WeatherConditions {
  temperatureCelsius?: number
  humidityPercentage?: number
  windSpeedKmh?: number
  windDirection?: string
  pressure?: number
  rainfall24h?: number
  conditions?: 'sunny' | 'cloudy' | 'overcast' | 'light_rain' | 'heavy_rain' | 'windy'
}

export interface SoilConditions {
  moisturePercentage?: number
  temperatureCelsius?: number
  phLevel?: number
  conductivity?: number // EC in mS/cm
  compaction?: 'low' | 'medium' | 'high'
}

export interface NutritionSchedule {
  id: string
  gardenId: string
  name: string
  description?: string
  
  // Target Area
  zoneId?: string
  fieldRowId?: string
  sectionId?: string
  cropType?: string
  
  // Schedule Configuration
  scheduleType: 'recurring' | 'seasonal' | 'growth_stage' | 'conditional'
  isActive: boolean
  
  // Recurring Schedule
  frequency?: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'custom'
  interval?: number // for custom frequency
  daysOfWeek?: number[] // 0=Sunday
  timeSlots?: string[] // HH:MM format
  
  // Seasonal Schedule
  startDate?: string
  endDate?: string
  seasonalPattern?: 'spring' | 'summer' | 'autumn' | 'winter' | 'growing_season'
  
  // Growth Stage Schedule
  growthStages?: GrowthStageSchedule[]
  
  // Conditional Triggers
  conditions?: ScheduleConditions
  
  // Treatment Configuration
  treatments: ScheduledTreatment[]
  
  // Execution Tracking
  lastExecutionDate?: string
  nextExecutionDate?: string
  executionCount: number
  
  createdAt: string
  updatedAt: string
}

export interface GrowthStageSchedule {
  stage: 'germination' | 'seedling' | 'vegetative' | 'flowering' | 'fruiting' | 'maturity' | 'dormancy'
  daysFromPlanting?: number
  treatments: ScheduledTreatment[]
}

export interface ScheduledTreatment {
  productId: string
  productName: string
  treatmentType: string
  dosage: number
  dosageUnit: string
  applicationMethod: string
  priority: 'low' | 'medium' | 'high' | 'critical'
}

export interface ScheduleConditions {
  weatherTriggers?: WeatherTrigger[]
  soilTriggers?: SoilTrigger[]
  plantHealthTriggers?: PlantHealthTrigger[]
  phenologyTriggers?: PhenologyTrigger[]
}

export interface WeatherTrigger {
  parameter: 'temperature' | 'humidity' | 'rainfall' | 'wind_speed'
  operator: 'greater_than' | 'less_than' | 'between' | 'equals'
  value: number
  secondValue?: number // for 'between' operator
  duration?: number // consecutive days/hours
}

export interface SoilTrigger {
  parameter: 'moisture' | 'temperature' | 'ph' | 'conductivity'
  operator: 'greater_than' | 'less_than' | 'between' | 'equals'
  value: number
  secondValue?: number
}

export interface PlantHealthTrigger {
  indicator: 'pest_pressure' | 'disease_symptoms' | 'nutrient_deficiency' | 'stress_level'
  threshold: number
  severity: 'low' | 'medium' | 'high'
}

export interface PhenologyTrigger {
  stage: 'bud_break' | 'flowering' | 'fruit_set' | 'harvest' | 'leaf_fall'
  daysOffset?: number // days before/after stage
}

export interface ProductCompatibility {
  id: string
  product1Id: string
  product2Id: string
  compatibilityType: 'compatible' | 'incompatible' | 'caution' | 'synergistic'
  notes?: string
  testResults?: string
  createdAt: string
}

export interface TreatmentHistory {
  id: string
  treatmentId: string
  gardenId: string
  
  // Historical Data
  applicationDate: string
  productUsed: string
  dosageApplied: number
  areasTreated: string[]
  
  // Results
  effectiveness: number
  costIncurred: number
  sideEffectsObserved?: string[]
  
  // Environmental Impact
  weatherAtApplication: WeatherConditions
  soilConditionsAtApplication: SoilConditions
  
  // Follow-up
  followUpObservations?: FollowUpObservation[]
  
  createdAt: string
}

export interface FollowUpObservation {
  date: string
  daysAfterTreatment: number
  observation: string
  effectiveness: number
  sideEffects?: string[]
  photos?: string[]
}

// Analytics and Reporting Types
export interface NutritionAnalytics {
  period: string
  totalTreatments: number
  totalCost: number
  averageEffectiveness: number
  
  // Treatment Breakdown
  treatmentsByType: TreatmentTypeAnalytics[]
  treatmentsByZone: ZoneAnalytics[]
  treatmentsByProduct: ProductAnalytics[]
  
  // Trends
  monthlyTrends: MonthlyTrend[]
  seasonalPatterns: SeasonalPattern[]
  
  // Efficiency Metrics
  costPerTreatment: number
  costPerSqm: number
  organicPercentage: number
  complianceScore: number
  
  // Recommendations
  recommendations: AnalyticsRecommendation[]
  adaptiveThresholds?: NutritionAdaptiveThresholds
  waterQualityInsight?: NutritionWaterQualityInsight
}

export interface TreatmentTypeAnalytics {
  type: string
  count: number
  totalCost: number
  averageEffectiveness: number
  organicPercentage: number
}

export interface ZoneAnalytics {
  zoneId: string
  zoneName: string
  treatmentCount: number
  totalCost: number
  averageEffectiveness: number
  mostUsedProducts: string[]
}

export interface ProductAnalytics {
  productId: string
  productName: string
  usageCount: number
  totalCost: number
  averageEffectiveness: number
  lastUsed: string
}

export interface MonthlyTrend {
  month: string
  treatmentCount: number
  totalCost: number
  averageEffectiveness: number
  organicPercentage: number
}

export interface SeasonalPattern {
  season: string
  treatmentTypes: string[]
  averageCost: number
  effectiveness: number
}

export interface AnalyticsRecommendation {
  type: 'cost_optimization' | 'effectiveness_improvement' | 'organic_transition' | 'timing_optimization'
  title: string
  description: string
  potentialSavings?: number
  potentialImprovement?: number
  priority: 'low' | 'medium' | 'high'
  actionItems: string[]
}

export interface NutritionAdaptiveThresholds {
  effectivenessTargetPercent: number
  effectivenessAlertFloorPercent: number
  followUpRateThresholdPercent: number
  qualityTargetRating: number
  notes: string[]
}

export interface NutritionWaterQualityInsight {
  hasFertigationExposure: boolean
  zoneCount: number
  monitoredZoneCount: number
  averageQualityScore: number
  worstQualityScore: number
  qualityBand: IrrigationWaterQualityBand
  sourceLabel?: string
  riskFlags: string[]
  recommendations: string[]
}

// Inventory Management Types
export interface ProductInventory {
  productId: string
  productName: string
  productType: 'fertilizer' | 'treatment'
  currentStock: number
  stockUnit: string
  minimumStock: number
  maximumStock: number
  averageUsagePerMonth: number
  lastRestockDate?: string
  nextRestockDate?: string
  supplier?: string
  costPerUnit: number
  totalValue: number
  expiryDate?: string
  storageLocation?: string
  storageConditions?: string
  safetyRequirements?: string[]
}

export interface StockMovement {
  id: string
  productId: string
  movementType: 'purchase' | 'usage' | 'waste' | 'transfer' | 'adjustment'
  quantity: number
  unit: string
  date: string
  reference?: string // treatment ID, purchase order, etc.
  notes?: string
  operatorId?: string
  createdAt: string
}

// Search and Filter Types
export interface NutritionFilters {
  treatmentTypes?: string[]
  productTypes?: string[]
  dateRange?: DateRange
  zoneIds?: string[]
  organicOnly?: boolean
  status?: string[]
  effectiveness?: { min: number; max: number }
  cost?: { min: number; max: number }
}

export interface DateRange {
  startDate: string
  endDate: string
}

// Dashboard and UI Types
export interface NutritionDashboardData {
  activeTreatments: number
  scheduledTreatments: number
  monthlyTreatments: number
  totalProducts: number
  lowStockAlerts: number
  complianceAlerts: number
  
  recentTreatments: NutritionTreatment[]
  upcomingSchedules: NutritionSchedule[]
  lowStockProducts: ProductInventory[]
  effectivenessAlerts: EffectivenessAlert[]
  
  quickStats: {
    organicPercentage: number
    averageEffectiveness: number
    monthlyCost: number
    treatmentFrequency: number
  }
  adaptiveThresholds?: NutritionAdaptiveThresholds
  waterQualityInsight?: NutritionWaterQualityInsight
}

export interface EffectivenessAlert {
  treatmentId: string
  productName: string
  zoneName: string
  effectiveness: number
  expectedEffectiveness: number
  daysAgo: number
  recommendedAction: string
}

// Export and Import Types
export interface NutritionExportData {
  treatments: NutritionTreatment[]
  products: (FertilizerProduct | TreatmentProduct)[]
  schedules: NutritionSchedule[]
  inventory: ProductInventory[]
  analytics: NutritionAnalytics
}

export interface NutritionImportOptions {
  includeTreatments: boolean
  includeProducts: boolean
  includeSchedules: boolean
  includeInventory: boolean
  dateRange?: DateRange
  overwriteExisting: boolean
}

// Validation Types
export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ValidationWarning {
  field: string
  message: string
  suggestion?: string
}

// Compliance and Certification Types
export interface ComplianceRecord {
  id: string
  gardenId: string
  certificationType: 'organic' | 'globalgap' | 'brc' | 'ifs' | 'custom'
  
  // Compliance Tracking
  complianceScore: number
  lastAuditDate?: string
  nextAuditDate?: string
  
  // Violations and Issues
  violations: ComplianceViolation[]
  correctiveActions: CorrectiveAction[]
  
  // Documentation
  certificates?: string[] // file IDs
  auditReports?: string[] // file IDs
  
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ComplianceViolation {
  id: string
  violationType: 'product_usage' | 'dosage_exceeded' | 'phi_violation' | 'documentation' | 'storage'
  severity: 'minor' | 'major' | 'critical'
  description: string
  detectedDate: string
  treatmentId?: string
  productId?: string
  status: 'open' | 'in_progress' | 'resolved'
  resolutionDate?: string
  resolutionNotes?: string
}

export interface CorrectiveAction {
  id: string
  violationId: string
  actionType: 'training' | 'procedure_change' | 'equipment_upgrade' | 'product_substitution'
  description: string
  assignedTo?: string
  dueDate: string
  completedDate?: string
  status: 'planned' | 'in_progress' | 'completed' | 'overdue'
  notes?: string
}
