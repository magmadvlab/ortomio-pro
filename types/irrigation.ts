// Advanced Irrigation System Types
// Comprehensive type definitions for professional irrigation management

export interface IrrigationZone {
  id: string
  gardenId: string
  name: string
  description?: string
  areaSqm: number
  soilType: 'clay' | 'loam' | 'sand' | 'mixed'
  slopePercentage: number
  sunExposure: 'full' | 'partial' | 'shade'
  drainageQuality: 'excellent' | 'good' | 'fair' | 'poor'
  waterRetention: 'high' | 'medium' | 'low'
  phLevel?: number
  organicMatterPercentage?: number
  isActive: boolean
  systems?: IrrigationSystem[]
  createdAt: string
  updatedAt: string
}

export interface IrrigationSystem {
  id: string
  zoneId: string
  name: string
  systemType: 'drip' | 'sprinkler' | 'micro' | 'subsurface' | 'manual'
  brand?: string
  model?: string
  installationDate?: string
  
  // Flow and pressure specifications
  flowRateLh: number
  pressureBar: number
  operatingPressureMinBar?: number
  operatingPressureMaxBar?: number
  
  // Pipe configuration
  pipeConfig?: PipeConfiguration
  
  // Emitter configuration (for drip/micro systems)
  emitterConfig?: EmitterConfiguration
  
  // Coverage configuration (for sprinkler systems)
  coverageConfig?: CoverageConfiguration
  
  // Performance metrics
  efficiencyPercentage: number
  uniformityCoefficient?: number
  
  // Status and maintenance
  isActive: boolean
  lastMaintenanceDate?: string
  nextMaintenanceDate?: string
  maintenanceIntervalDays: number
  
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
  id: string
  zoneId: string
  systemId?: string
  
  name: string
  description?: string
  isActive: boolean
  
  // Schedule type and timing
  scheduleType: 'daily' | 'weekly' | 'interval' | 'conditional'
  startDate: string
  endDate?: string
  
  // Daily/Weekly scheduling
  daysOfWeek?: number[] // 0=Sunday, 1=Monday, etc.
  timeSlots?: string[] // array of start times
  durationMinutes: number
  
  // Interval scheduling
  frequencyDays?: number
  lastExecutionDate?: string
  nextExecutionDate?: string
  
  // Conditional triggers
  conditions?: ScheduleConditions
  
  // Override settings
  allowManualOverride: boolean
  priorityLevel: number // 1=low, 5=high
  
  // Seasonal adjustments
  seasonalAdjustmentPercentage: number
  
  createdAt: string
  updatedAt: string
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