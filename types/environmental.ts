import type { SensorType } from '@/services/sensorDataService'

export type PersistedWeatherDataSource = 'api' | 'manual' | 'station'

export type EnvironmentalWeatherSource =
  | 'current'
  | 'forecast'
  | 'historical'
  | 'estimated'
  | 'fallback'

export type EnvironmentalWeatherSourceClass =
  | 'forecast'
  | 'historical_archive'
  | 'current_runtime'
  | 'station'
  | 'manual'
  | 'synthetic_fallback'

export type EnvironmentalPrimarySource =
  | 'open_meteo_forecast'
  | 'open_meteo_archive'
  | 'local_station'
  | 'manual_entry'
  | 'synthetic_fallback'
  | 'fallback_estimated'

export type EnvironmentalSignalQuality = 'measured' | 'mixed' | 'estimated'

export type EnvironmentalConfidence = 'high' | 'medium' | 'low'
export type EnvironmentalConfidenceOrUnknown = EnvironmentalConfidence | 'unknown'
export type EnvironmentalConfidenceWithEstimated = EnvironmentalConfidence | 'estimated'

export interface PersistedDailyWeatherLike {
  log_date: string
  temp_min: number
  temp_max: number
  temp_avg: number
  precipitation_mm: number
  humidity_avg?: number
  weather_conditions?: string
  eto_calculated?: number
  data_source: PersistedWeatherDataSource
  raw_data?: Record<string, unknown>
}

export interface PersistedWeatherLineage {
  sourceType: PersistedWeatherDataSource
  primarySource:
    | 'open_meteo_forecast'
    | 'open_meteo_archive'
    | 'local_station'
    | 'manual_entry'
    | 'synthetic_fallback'
  signalClass: 'forecast' | 'historical_archive' | 'station' | 'manual' | 'synthetic_fallback'
  signalQuality: EnvironmentalSignalQuality
  observationDate: string
  recordedAt: string
  persisted: true
}

export interface PersistedForecastSnapshot {
  forecastDate: string
  generatedFromDate: string
  generatedAt: string
  daysAhead: number
  source: 'open_meteo_forecast' | 'synthetic_fallback'
  confidence: EnvironmentalConfidenceWithEstimated
  tempMin: number
  tempMax: number
  precipitationMm: number
  humidityAvg?: number
  windSpeedMax?: number
  condition?: string
}

export interface SiteWeatherBinding {
  latitude?: number
  longitude?: number
  altitudeMeters?: number
  slopePercentage?: number
  sunExposure?: string
  exposureClass: 'sheltered' | 'balanced' | 'exposed' | 'unknown'
  slopeClass: 'flat' | 'rolling' | 'steep' | 'unknown'
  dryingPowerAdjustment: 'lower' | 'neutral' | 'higher'
  diseasePressureAdjustment: 'lower' | 'neutral' | 'higher'
  thermalLoadAdjustment: 'lower' | 'neutral' | 'higher'
  notes: string[]
}

export interface DerivedWeatherIndicators {
  thermalAmplitudeC?: number
  precipitationToEtoRatio?: number
  waterBalanceClass: 'deficit' | 'neutral' | 'surplus'
  diseasePressureClass: 'low' | 'medium' | 'high'
  dryingPowerClass: 'low' | 'medium' | 'high'
}

export interface EnvironmentalWeatherTelemetry {
  source?: EnvironmentalWeatherSource
  sourceClass?: EnvironmentalWeatherSourceClass
  primarySource?: EnvironmentalPrimarySource
  signalQuality?: EnvironmentalSignalQuality
  regionalConfidence?: EnvironmentalConfidence
  localConfidence?: EnvironmentalConfidence
}

export interface WeatherSnapshot extends EnvironmentalWeatherTelemetry {
  temperature: number
  humidity: number
  precipitation: number
  windSpeed: number
  condition: string
  pressure: number
}

export interface OperationContext {
  timestamp: string
  weather: WeatherSnapshot
  lunar: {
    phase: string
    phaseEmoji: string
    illumination: number
    isWaxing: boolean
    dayInCycle: number
  }
  season: string
  daylight: {
    sunrise: string
    sunset: string
    hoursOfLight: number
  }
}

export interface EnvironmentalMonitoringWeatherSnapshot {
  persisted: boolean
  sourceClass: PersistedWeatherLineage['signalClass'] | 'unknown'
  primarySource: PersistedWeatherLineage['primarySource'] | 'unknown'
  signalQuality: PersistedWeatherLineage['signalQuality'] | 'unknown'
  regionalConfidence: EnvironmentalConfidenceOrUnknown
  localConfidence: EnvironmentalConfidenceOrUnknown
  forecastDaysAhead?: number
  temperatureMinC?: number
  temperatureMaxC?: number
  temperatureAvgC?: number
  precipitationMm?: number
  etoMm?: number
  condition?: string
  waterBalanceClass?: DerivedWeatherIndicators['waterBalanceClass']
  diseasePressureClass?: DerivedWeatherIndicators['diseasePressureClass']
  dryingPowerClass?: DerivedWeatherIndicators['dryingPowerClass']
  siteBinding?: SiteWeatherBinding
}

export type EnvironmentalSensorPrecedence =
  | 'sensor_local'
  | 'sensor_garden'
  | 'persisted_weather'
  | 'estimated'

export type EnvironmentalCirculationImpact =
  | 'crop_tracking'
  | 'irrigation'
  | 'nutrition'
  | 'health'
  | 'operations'

export type SoilWaterStressLevel = 'low' | 'medium' | 'high' | 'unknown'

export interface EnvironmentalMonitoringSnapshot {
  date: string
  weather: EnvironmentalMonitoringWeatherSnapshot
  sensors: {
    precedence: EnvironmentalSensorPrecedence
    availableSignals: SensorType[]
    readingCount: number
    freshestReadingAt?: string
  }
  soilWater: {
    deficitMm?: number
    availableWaterMm?: number
    lastCalculatedAt?: string
    stressLevel: SoilWaterStressLevel
  }
  circulation: {
    impacts: EnvironmentalCirculationImpact[]
    notes: string[]
  }
}

export interface EnvironmentalZoneLedgerEntry {
  gardenId: string
  zoneId: string
  zoneName?: string
  recordedAt: string
  snapshot: EnvironmentalMonitoringSnapshot
}

export interface ZoneEnvironmentalHistorySummary {
  zoneId: string
  gardenId?: string
  entries: number
  highSoilWaterStressDays: number
  mediumSoilWaterStressDays: number
  highDiseasePressureDays: number
  sensorLocalDays: number
  deficitWaterBalanceDays: number
  surplusWaterBalanceDays: number
  lowDryingPowerDays: number
  latestSensorPrecedence?: EnvironmentalMonitoringSnapshot['sensors']['precedence']
  latestSoilWaterStressLevel?: EnvironmentalMonitoringSnapshot['soilWater']['stressLevel']
  dominantWeatherSourceClass?: EnvironmentalMonitoringSnapshot['weather']['sourceClass']
}

export interface GardenEnvironmentalHistorySummary {
  gardenId: string
  entries: number
  trackedZones: number
  highSoilWaterStressDays: number
  mediumSoilWaterStressDays: number
  highDiseasePressureDays: number
  sensorLocalDays: number
  deficitWaterBalanceDays: number
  surplusWaterBalanceDays: number
  lowDryingPowerDays: number
  latestSensorPrecedence?: EnvironmentalMonitoringSnapshot['sensors']['precedence']
  latestSoilWaterStressLevel?: EnvironmentalMonitoringSnapshot['soilWater']['stressLevel']
  dominantWeatherSourceClass?: EnvironmentalMonitoringSnapshot['weather']['sourceClass']
}

export type CanonicalEnvironmentalContext = EnvironmentalMonitoringSnapshot
