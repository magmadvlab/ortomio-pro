import type { AgronomicSignalKey } from './agronomicKernel'

// Advanced + legacy irrigation system types
// This file intentionally models both the new "advanced irrigation" domain
// and the still-active legacy UI/storage contracts used across the app.

export type WateringMethod =
  | 'Manual'
  | 'Automatic'
  | 'Timer'
  | 'Hose'
  | 'Dripline'
  | 'Drippers'
  | 'MicroSprinkler'
  | 'Sprinkler'
  | 'Mixed'

export type LegacyIrrigationSystemType =
  | 'Drip'
  | 'Sprinkler'
  | 'MicroSprinkler'
  | 'Micro'
  | 'Soaker'
  | 'Manual'
  | 'Mixed'

export type IrrigationWaterSource =
  | 'Municipal'
  | 'Well'
  | 'Consortium'
  | 'Rainwater'
  | 'River'
  | 'Pond'
  | 'Tank'

export type IrrigationCultivationType =
  | 'orto'
  | 'frutteto'
  | 'uliveto'
  | 'vigneto'
  | 'serra'
  | 'giardino'
  | 'campo_aperto'

export interface IrrigationZoneScheduleSummary {
  days?: string[]
  time?: string
  duration?: number
}

export type IrrigationComponentType =
  | 'Dripline'
  | 'Dripper'
  | 'MicroSprinkler'
  | 'Sprinkler'
  | 'Valve'
  | 'Filter'
  | 'Pump'

export interface IrrigationComponent {
  id: string
  zoneId: string
  type: IrrigationComponentType
  lengthMeters?: number
  flowRatePerMeterLph?: number
  dripperSpacing?: number
  dripperFlowRateLph?: number
  quantity?: number
  flowRateLph?: number
  brand?: string
  model?: string
  notes?: string
  createdAt: string
}

export interface IrrigationTemplateComponent {
  type: IrrigationComponentType
  defaultDripperSpacing?: number
  defaultFlowRate?: number
  defaultQuantity?: number
}

export interface IrrigationTemplate {
  id: string
  name?: string
  icon: string
  description: string
  method: WateringMethod
  defaultFlowRateLph: number
  typicalUse: string[]
  components: IrrigationTemplateComponent[]
}

export interface IrrigationTask {
  zoneId: string
  zoneName: string
  litersNeeded: number
  durationMinutes: number
  priority: 'Critical' | 'High' | 'Medium' | 'Low'
  valveId?: string
  manualMode?: 'liters' | 'minutes'
  showLitersOnly?: boolean
  weatherAdjustment?: {
    action: 'PROCEED' | 'REDUCE' | 'CANCEL'
    adjustedDuration?: number
    reason?: string
  }
  fertigationInfo?: Record<string, unknown>
}

export interface IrrigationZone {
  id: string
  gardenId?: string
  systemId?: string
  name: string
  description?: string
  areaSqm?: number
  soilType?: 'clay' | 'loam' | 'sand' | 'mixed'
  slopePercentage?: number
  sunExposure?: 'full' | 'partial' | 'shade'
  drainageQuality?: 'excellent' | 'good' | 'fair' | 'poor'
  waterRetention?: 'high' | 'medium' | 'low'
  phLevel?: number
  organicMatterPercentage?: number
  isActive?: boolean
  method?: WateringMethod
  flowRateLph?: number
  valveId?: string
  bedIds?: string[]
  rowIds?: string[]
  plantTaskIds?: string[]
  plantTypes?: string[]
  isAutomated?: boolean
  schedule?: IrrigationZoneScheduleSummary | string
  lastWateredAt?: string
  notes?: string
  calculatedFromComponents?: boolean
  manualConfig?: {
    mode: 'liters' | 'minutes'
    estimatedFlowRateLph?: number
  }
  driplineConfig?: {
    lengthMeters: number
    spacing?: number
    dripperFlowRate?: number
    flowRatePerMeter?: number
  }
  drippersConfig?: {
    count: number
    flowRateLph: number
  }
  microSprinklerConfig?: {
    count: number
    flowRateLph: number
  }
  systems?: IrrigationSystem[]
  createdAt: string
  updatedAt: string
}

export interface IrrigationSystem {
  id: string
  gardenId?: string
  zoneId?: string
  name?: string
  systemType?: 'drip' | 'sprinkler' | 'micro' | 'subsurface' | 'manual'
  type?: LegacyIrrigationSystemType
  waterSource?: IrrigationWaterSource
  brand?: string
  model?: string
  installationDate?: string
  
  // Flow and pressure specifications
  flowRateLh?: number
  pressureBar?: number
  operatingPressureMinBar?: number
  operatingPressureMaxBar?: number
  
  // Pipe configuration
  pipeConfig?: PipeConfiguration
  
  // Emitter configuration (for drip/micro systems)
  emitterConfig?: EmitterConfiguration
  
  // Coverage configuration (for sprinkler systems)
  coverageConfig?: CoverageConfiguration
  
  // Performance metrics
  efficiencyPercentage?: number
  uniformityCoefficient?: number
  
  // Status and maintenance
  isActive?: boolean
  hasTimer?: boolean
  hasValve?: boolean
  bedIds?: string[]
  rowIds?: string[]
  cultivationType?: IrrigationCultivationType
  lastMaintenanceDate?: string
  nextMaintenanceDate?: string
  maintenanceIntervalDays?: number
  
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface PipeConfiguration {
  diameterMm?: number
  material?: 'pvc' | 'pe' | 'rubber' | 'metal' | 'other'
  lengthM?: number
}

export interface EmitterConfiguration {
  type?: string // dripper, micro-sprinkler, nebulizer
  spacingCm?: number
  flowRateLh?: number // individual emitter flow
  count?: number
}

export interface CoverageConfiguration {
  radiusM?: number
  angleDegrees?: number
  overlapPercentage?: number
}

export interface IrrigationLog {
  id: string
  zoneId: string
  systemId?: string
  
  // Timing information
  startTime: string
  endTime?: string
  plannedDurationMinutes: number
  actualDurationMinutes?: number
  
  // Volume information
  plannedVolumeLiters: number
  actualVolumeLiters?: number
  flowRateMeasuredLh?: number
  
  // Pressure monitoring
  pressureData?: PressureData
  
  // Environmental conditions
  environmentalData?: EnvironmentalData
  
  // Operational data
  irrigationType: 'scheduled' | 'manual' | 'emergency' | 'test'
  triggerSource?: string
  operatorId?: string
  operatorNotes?: string
  
  // Quality metrics
  distributionUniformity?: number
  applicationEfficiency?: number
  
  // Issues and alerts
  issuesDetected?: string[]
  alertsTriggered?: string[]
  
  // Cost tracking
  waterCostEuros?: number
  energyCostEuros?: number
  
  createdAt: string
}

export interface PressureData {
  startBar?: number
  endBar?: number
  avgBar?: number
  variations?: number[] // array of pressure readings
}

export interface EnvironmentalData {
  weatherConditions?: string
  temperatureCelsius?: number
  humidityPercentage?: number
  windSpeedKmh?: number
  soilMoistureBefore?: number
  soilMoistureAfter?: number
  soilTemperatureCelsius?: number
}

export interface IrrigationSchedule {
  id?: string
  zoneId: string
  systemId?: string
  zoneName?: string
  
  name?: string
  description?: string
  isActive?: boolean
  
  // Schedule type and timing
  scheduleType?: 'daily' | 'weekly' | 'interval' | 'conditional'
  startDate?: string
  endDate?: string
  
  // Daily/Weekly scheduling
  daysOfWeek?: number[] // 0=Sunday, 1=Monday, etc.
  timeSlots?: string[] // array of start times
  durationMinutes?: number
  
  // Interval scheduling
  frequencyDays?: number
  lastExecutionDate?: string
  nextExecutionDate?: string
  
  // Conditional triggers
  conditions?: ScheduleConditions
  
  // Override settings
  allowManualOverride?: boolean
  priorityLevel?: number // 1=low, 5=high
  
  // Seasonal adjustments
  seasonalAdjustmentPercentage?: number

  // Legacy irrigation planner output
  litersNeeded?: number
  suggestedDurationMinutes?: number
  priority?: 'Critical' | 'High' | 'Medium' | 'Low'
  nextWatering?: string
  manualMode?: 'liters' | 'minutes'
  showLitersOnly?: boolean
  weatherAdjustment?: {
    action: 'PROCEED' | 'REDUCE' | 'CANCEL'
    adjustedDuration?: number
    reason?: string
  }
  fertigationInfo?: Record<string, unknown>
  
  createdAt?: string
  updatedAt?: string
}

export interface WateringLog {
  id: string
  zoneId: string
  gardenId?: string
  bedId?: string
  rowId?: string
  bedRowId?: string
  fieldRowId?: string
  plantIds?: string[]
  plantsAffected?: number
  waterPerPlantLiters?: number
  wateredAt?: string
  date: string
  durationMinutes: number
  litersApplied: number
  method: 'Manual' | 'Automatic' | 'Timer'
  weatherCondition?: string
  soilMoistureBefore?: number
  soilMoistureAfter?: number
  airTemperatureC?: number
  notes?: string
  valveId?: string
  completed: boolean
  createdAt: string
}

export interface ScheduleConditions {
  weatherConditions?: string[]
  soilMoistureThresholdMin?: number
  soilMoistureThresholdMax?: number
  temperatureThresholdMin?: number
  temperatureThresholdMax?: number
  rainDelayHours?: number
  rainThresholdMm?: number
}

export interface WaterRequirement {
  id: string
  zoneId: string
  calculationDate: string
  
  // Evapotranspiration data
  et0Mm: number // reference evapotranspiration
  kcCoefficient: number // crop coefficient
  etcMm: number // crop evapotranspiration (ET0 * Kc)
  
  // Crop information
  cropStage?: string
  cropAgeDays?: number
  leafAreaIndex?: number
  
  // Weather data
  weatherData?: WeatherData
  
  // Soil water balance
  soilWaterBalance?: SoilWaterBalance
  
  // Irrigation requirements
  irrigationNeedMm: number
  recommendedVolumeLiters: number
  recommendedDurationMinutes?: number
  
  // Calculation metadata
  calculationMethod: string
  weatherDataSource?: string
  confidenceLevel: number
  
  // AI predictions
  aiAdjustmentFactor: number
  aiConfidenceScore?: number
  aiReasoning?: string
  
  createdAt: string
}

export interface WeatherData {
  effectiveRainfallMm: number
  temperatureAvgCelsius?: number
  humidityAvgPercentage?: number
  windSpeedAvgKmh?: number
  solarRadiationMjm2?: number
}

export interface SoilWaterBalance {
  soilWaterDeficitMm?: number
  fieldCapacityMm?: number
  wiltingPointMm?: number
  availableWaterMm?: number
  rootZoneDepthCm?: number
  fieldCapacityVolumetricPercent?: number
  wiltingPointVolumetricPercent?: number
  estimatedInfiltrationRateMmh?: number
  textureClass?: string
  compactionRisk?: 'low' | 'medium' | 'high' | 'unknown'
  hydraulicSource?: 'soil_analysis' | 'estimated_from_partial_analysis'
  notes?: string[]
}

export interface IrrigationSensor {
  id: string
  zoneId: string
  systemId?: string
  
  sensorType: 'soil_moisture' | 'pressure' | 'flow' | 'temperature' | 'ph' | 'ec'
  sensorName: string
  deviceId?: string
  brand?: string
  model?: string
  
  // Installation details
  installationDate?: string
  depthCm?: number // for soil sensors
  positionDescription?: string
  
  // Calibration data
  calibrationDate?: string
  calibrationOffset: number
  calibrationMultiplier: number
  
  // Operational settings
  readingIntervalMinutes: number
  alertThresholdMin?: number
  alertThresholdMax?: number
  
  isActive: boolean
  batteryLevelPercentage?: number
  lastReadingTime?: string
  
  createdAt: string
  updatedAt: string
}

export interface SensorReading {
  id: string
  sensorId: string
  
  readingTime: string
  rawValue: number
  calibratedValue: number
  unit: string
  
  // Quality indicators
  signalStrength?: number
  batteryVoltage?: number
  temperatureCelsius?: number // sensor temperature
  
  // Data validation
  isValid: boolean
  validationFlags?: string[]
  
  createdAt: string
}

// Analytics and reporting types
export interface WaterAnalytics {
  totalConsumptionLiters: number
  averageDailyConsumption: number
  peakConsumptionDay: string
  efficiencyTrend: number
  costAnalysis: CostAnalysis
  consumptionByZone: ZoneConsumption[]
  monthlyTrends: MonthlyTrend[]
}

export interface CostAnalysis {
  totalWaterCost: number
  totalEnergyCost: number
  costPerLiter: number
  costPerSqm: number
  savingsVsManual: number
}

export interface ZoneConsumption {
  zoneId: string
  zoneName: string
  totalLiters: number
  averageEfficiency: number
  costEuros: number
}

export interface MonthlyTrend {
  month: string
  consumption: number
  efficiency: number
  cost: number
}

export interface EfficiencyReport {
  zoneId: string
  zoneName: string
  period: string
  averageEfficiency: number
  uniformityCoefficient: number
  waterUseEfficiency: number
  recommendations: string[]
  agronomicProfileId?: string
  priorityScore?: number
  priorityConfidence?: number
  missingSignals?: AgronomicSignalKey[]
}

// System configuration types
export interface SystemConfiguration {
  flowRateLh: number
  pressureBar: number
  emitterSpacingCm?: number
  coverageRadiusM?: number
  efficiencyTarget: number
}

export interface ActualIrrigationData {
  actualDurationMinutes: number
  actualVolumeLiters: number
  pressureReadings: number[]
  environmentalConditions: EnvironmentalData
  issues?: string[]
}

// Filter and search types
export interface IrrigationFilters {
  zoneIds?: string[]
  systemTypes?: string[]
  dateRange?: DateRange
  irrigationType?: string[]
  status?: 'active' | 'inactive' | 'all'
}

export interface DateRange {
  startDate: string
  endDate: string
}

// Dashboard and UI types
export interface IrrigationDashboardData {
  activeZones: number
  activeSystems: number
  todayIrrigations: number
  weeklyConsumption: number
  currentAlerts: IrrigationAlert[]
  recentLogs: IrrigationLog[]
  upcomingSchedules: IrrigationSchedule[]
  systemStatus: SystemStatus[]
}

export interface IrrigationAlert {
  id: string
  type: 'low_pressure' | 'high_consumption' | 'sensor_offline' | 'schedule_failed' | 'maintenance_due'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  zoneId?: string
  systemId?: string
  createdAt: string
  acknowledged: boolean
}

export interface SystemStatus {
  systemId: string
  systemName: string
  status: 'online' | 'offline' | 'maintenance' | 'error'
  lastActivity?: string
  currentPressure?: number
  flowRate?: number
}

// Export and import types
export interface IrrigationExportData {
  zones: IrrigationZone[]
  systems: IrrigationSystem[]
  logs: IrrigationLog[]
  schedules: IrrigationSchedule[]
  waterRequirements: WaterRequirement[]
}

export interface IrrigationImportOptions {
  includeZones: boolean
  includeSystems: boolean
  includeLogs: boolean
  includeSchedules: boolean
  dateRange?: DateRange
}

// Validation types
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
