import { getSupabaseClient } from '@/config/supabase'
import type { SensorReading, SensorType } from '@/services/sensorDataService'
import { getLatestSensorReading } from '@/services/sensorDataService'
import { normalizeGeoCoordinates } from '@/utils/coordinates'

type PersistedWeatherDataSource = 'api' | 'manual' | 'station'

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
  signalQuality: 'measured' | 'mixed' | 'estimated'
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
  confidence: 'high' | 'medium' | 'low' | 'estimated'
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

export interface EnvironmentalMonitoringSnapshot {
  date: string
  weather: {
    persisted: boolean
    sourceClass: PersistedWeatherLineage['signalClass'] | 'unknown'
    primarySource: PersistedWeatherLineage['primarySource'] | 'unknown'
    signalQuality: PersistedWeatherLineage['signalQuality'] | 'unknown'
    regionalConfidence: 'high' | 'medium' | 'low' | 'unknown'
    localConfidence: 'high' | 'medium' | 'low' | 'unknown'
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
  sensors: {
    precedence: 'sensor_local' | 'sensor_garden' | 'persisted_weather' | 'estimated'
    availableSignals: SensorType[]
    readingCount: number
    freshestReadingAt?: string
  }
  soilWater: {
    deficitMm?: number
    availableWaterMm?: number
    lastCalculatedAt?: string
    stressLevel: 'low' | 'medium' | 'high' | 'unknown'
  }
  circulation: {
    impacts: Array<'crop_tracking' | 'irrigation' | 'nutrition' | 'health' | 'operations'>
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

const normalizeDateString = (value?: string | null) => {
  if (!value) return null
  return value.split('T')[0] || null
}

const toFiniteNumber = (value: unknown): number | undefined => {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : undefined
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

export function buildPersistedForecastSnapshots(
  forecast: {
    dates: string[]
    tempMin: Array<number | null | undefined>
    tempMax: Array<number | null | undefined>
    precipitationMm: Array<number | null | undefined>
    humidityMin?: Array<number | null | undefined>
    humidityMax?: Array<number | null | undefined>
    windSpeedMax?: Array<number | null | undefined>
    conditions?: Array<string | null | undefined>
  },
  options: {
    generatedFromDate: string
    generatedAt?: string
    source: PersistedForecastSnapshot['source']
    maxDays?: number
  }
): PersistedForecastSnapshot[] {
  const generatedAt = options.generatedAt || new Date().toISOString()
  const generatedFromDate = normalizeDateString(options.generatedFromDate)
  if (!generatedFromDate) {
    return []
  }

  const maxDays = options.maxDays ?? 7
  return forecast.dates
    .slice(0, maxDays)
    .map((forecastDate, index) => {
      const normalizedDate = normalizeDateString(forecastDate)
      const tempMin = toFiniteNumber(forecast.tempMin[index])
      const tempMax = toFiniteNumber(forecast.tempMax[index])
      const precipitationMm = toFiniteNumber(forecast.precipitationMm[index]) ?? 0
      if (!normalizedDate || tempMin === undefined || tempMax === undefined) {
        return null
      }

      const humidityMin = toFiniteNumber(forecast.humidityMin?.[index])
      const humidityMax = toFiniteNumber(forecast.humidityMax?.[index])
      const daysAhead = Math.max(0, index)
      const confidence: PersistedForecastSnapshot['confidence'] =
        options.source === 'synthetic_fallback'
          ? 'estimated'
          : daysAhead <= 1
            ? 'high'
            : daysAhead <= 4
              ? 'medium'
              : 'low'

      return {
        forecastDate: normalizedDate,
        generatedFromDate,
        generatedAt,
        daysAhead,
        source: options.source,
        confidence,
        tempMin,
        tempMax,
        precipitationMm,
        humidityAvg:
          humidityMin !== undefined && humidityMax !== undefined
            ? Number(((humidityMin + humidityMax) / 2).toFixed(1))
            : humidityMax ?? humidityMin,
        windSpeedMax: toFiniteNumber(forecast.windSpeedMax?.[index]),
        condition: forecast.conditions?.[index] || undefined,
      }
    })
    .filter((snapshot): snapshot is PersistedForecastSnapshot => Boolean(snapshot))
}

export function buildSiteWeatherBinding(input: {
  latitude?: number
  longitude?: number
  altitudeMeters?: number
  slopePercentage?: number
  sunExposure?: string
}): SiteWeatherBinding {
  const notes: string[] = []
  const slopePercentage = toFiniteNumber(input.slopePercentage)
  const altitudeMeters = toFiniteNumber(input.altitudeMeters)
  const normalizedExposure = (input.sunExposure || '').toLowerCase()

  const exposureClass: SiteWeatherBinding['exposureClass'] =
    normalizedExposure.includes('shade')
      ? 'sheltered'
      : normalizedExposure.includes('full')
        ? 'exposed'
        : normalizedExposure
          ? 'balanced'
          : 'unknown'

  const slopeClass: SiteWeatherBinding['slopeClass'] =
    slopePercentage === undefined
      ? 'unknown'
      : slopePercentage < 3
        ? 'flat'
        : slopePercentage < 12
          ? 'rolling'
          : 'steep'

  let dryingPowerAdjustment: SiteWeatherBinding['dryingPowerAdjustment'] = 'neutral'
  let diseasePressureAdjustment: SiteWeatherBinding['diseasePressureAdjustment'] = 'neutral'
  let thermalLoadAdjustment: SiteWeatherBinding['thermalLoadAdjustment'] = 'neutral'

  if (exposureClass === 'exposed') {
    dryingPowerAdjustment = 'higher'
    diseasePressureAdjustment = 'lower'
    thermalLoadAdjustment = 'higher'
    notes.push('Full exposure increases drying power and heat load relative to the regional forecast.')
  } else if (exposureClass === 'sheltered') {
    dryingPowerAdjustment = 'lower'
    diseasePressureAdjustment = 'higher'
    thermalLoadAdjustment = 'lower'
    notes.push('Sheltered exposure can keep foliage wet longer than the regional forecast suggests.')
  }

  if (slopeClass === 'rolling') {
    dryingPowerAdjustment = dryingPowerAdjustment === 'lower' ? 'neutral' : 'higher'
    notes.push('Rolling slope can accelerate runoff and shorten effective water residence.')
  } else if (slopeClass === 'steep') {
    dryingPowerAdjustment = 'higher'
    thermalLoadAdjustment = thermalLoadAdjustment === 'lower' ? 'neutral' : 'higher'
    notes.push('Steep slope amplifies runoff risk and can tighten timing windows after rain or irrigation.')
  }

  if (altitudeMeters !== undefined) {
    if (altitudeMeters >= 700) {
      thermalLoadAdjustment = thermalLoadAdjustment === 'higher' ? 'neutral' : 'lower'
      notes.push('Higher altitude likely lowers night temperatures relative to the regional forecast grid.')
    } else if (altitudeMeters <= 80) {
      thermalLoadAdjustment = thermalLoadAdjustment === 'lower' ? 'neutral' : 'higher'
      notes.push('Low-altitude site is likely closer to the warmer regional baseline.')
    }
  }

  return {
    latitude: toFiniteNumber(input.latitude),
    longitude: toFiniteNumber(input.longitude),
    altitudeMeters,
    slopePercentage,
    sunExposure: input.sunExposure,
    exposureClass,
    slopeClass,
    dryingPowerAdjustment,
    diseasePressureAdjustment,
    thermalLoadAdjustment,
    notes,
  }
}

type WaterRequirementLike = {
  calculation_date?: string
  soil_water_deficit_mm?: number
  available_water_mm?: number
}

export function derivePersistedWeatherLineage(
  weather: Pick<PersistedDailyWeatherLike, 'log_date' | 'data_source' | 'raw_data'>,
  options?: {
    recordedAt?: string
    now?: Date
  }
): PersistedWeatherLineage {
  const now = options?.now || new Date()
  const recordedAt = options?.recordedAt || now.toISOString()
  const today = now.toISOString().split('T')[0]
  const fallback = weather.raw_data?.fallback === true
  const isHistorical = weather.log_date < today

  if (weather.data_source === 'station') {
    return {
      sourceType: 'station',
      primarySource: 'local_station',
      signalClass: 'station',
      signalQuality: 'measured',
      observationDate: weather.log_date,
      recordedAt,
      persisted: true,
    }
  }

  if (weather.data_source === 'manual' && fallback) {
    return {
      sourceType: 'manual',
      primarySource: 'synthetic_fallback',
      signalClass: 'synthetic_fallback',
      signalQuality: 'estimated',
      observationDate: weather.log_date,
      recordedAt,
      persisted: true,
    }
  }

  if (weather.data_source === 'manual') {
    return {
      sourceType: 'manual',
      primarySource: 'manual_entry',
      signalClass: 'manual',
      signalQuality: 'mixed',
      observationDate: weather.log_date,
      recordedAt,
      persisted: true,
    }
  }

  return {
    sourceType: 'api',
    primarySource: isHistorical ? 'open_meteo_archive' : 'open_meteo_forecast',
    signalClass: isHistorical ? 'historical_archive' : 'forecast',
    signalQuality: isHistorical ? 'mixed' : 'mixed',
    observationDate: weather.log_date,
    recordedAt,
    persisted: true,
  }
}

export function deriveWeatherIndicators(
  weather: Pick<
    PersistedDailyWeatherLike,
    'temp_min' | 'temp_max' | 'precipitation_mm' | 'humidity_avg' | 'eto_calculated'
  >
): DerivedWeatherIndicators {
  const thermalAmplitudeC =
    Number.isFinite(weather.temp_max) && Number.isFinite(weather.temp_min)
      ? Number((weather.temp_max - weather.temp_min).toFixed(1))
      : undefined
  const precipitationToEtoRatio =
    typeof weather.eto_calculated === 'number' && weather.eto_calculated > 0
      ? Number((weather.precipitation_mm / weather.eto_calculated).toFixed(2))
      : undefined

  let waterBalanceClass: DerivedWeatherIndicators['waterBalanceClass'] = 'neutral'
  if ((weather.eto_calculated || 0) >= 4 && weather.precipitation_mm <= 1) {
    waterBalanceClass = 'deficit'
  } else if (precipitationToEtoRatio !== undefined && precipitationToEtoRatio >= 1.15) {
    waterBalanceClass = 'surplus'
  }

  let diseasePressureClass: DerivedWeatherIndicators['diseasePressureClass'] = 'low'
  if ((weather.humidity_avg || 0) >= 80 && weather.precipitation_mm >= 3) {
    diseasePressureClass = 'high'
  } else if ((weather.humidity_avg || 0) >= 70 || weather.precipitation_mm >= 1) {
    diseasePressureClass = 'medium'
  }

  let dryingPowerClass: DerivedWeatherIndicators['dryingPowerClass'] = 'medium'
  if ((weather.humidity_avg || 0) >= 85 && weather.precipitation_mm > 0) {
    dryingPowerClass = 'low'
  } else if ((weather.humidity_avg || 0) <= 45 && (weather.eto_calculated || 0) >= 4) {
    dryingPowerClass = 'high'
  }

  return {
    thermalAmplitudeC,
    precipitationToEtoRatio,
    waterBalanceClass,
    diseasePressureClass,
    dryingPowerClass,
  }
}

export function buildPersistedWeatherEnvelope(
  weather: PersistedDailyWeatherLike,
  options?: {
    recordedAt?: string
    providerPayload?: Record<string, unknown>
    forecastSnapshots?: PersistedForecastSnapshot[]
    siteWeatherBinding?: SiteWeatherBinding
    now?: Date
  }
): Record<string, unknown> {
  const lineage = derivePersistedWeatherLineage(weather, {
    recordedAt: options?.recordedAt,
    now: options?.now,
  })
  const indicators = deriveWeatherIndicators(weather)

  return {
    ...(weather.raw_data || {}),
    environmentalLineage: lineage,
    derivedIndicators: indicators,
    forecastSnapshots:
      options?.forecastSnapshots ??
      (Array.isArray(weather.raw_data?.forecastSnapshots)
        ? weather.raw_data?.forecastSnapshots
        : undefined),
    siteWeatherBinding:
      options?.siteWeatherBinding ??
      (weather.raw_data?.siteWeatherBinding &&
      typeof weather.raw_data.siteWeatherBinding === 'object'
        ? weather.raw_data.siteWeatherBinding
        : undefined),
    providerPayload: options?.providerPayload ?? weather.raw_data?.providerPayload ?? weather.raw_data,
  }
}

export function resolvePersistedWeatherLogForDate(
  weatherLogs: PersistedDailyWeatherLike[],
  targetDate: string,
  options?: {
    now?: Date
  }
): PersistedDailyWeatherLike | null {
  const normalizedTargetDate = normalizeDateString(targetDate)
  if (!normalizedTargetDate || weatherLogs.length === 0) {
    return null
  }

  const exactMatch = weatherLogs.find((log) => log.log_date === normalizedTargetDate)
  if (exactMatch) {
    return exactMatch
  }

  const snapshotSourceLog = [...weatherLogs]
    .sort((left, right) => right.log_date.localeCompare(left.log_date))
    .find((log) => {
      const snapshots = Array.isArray(log.raw_data?.forecastSnapshots)
        ? (log.raw_data?.forecastSnapshots as PersistedForecastSnapshot[])
        : []
      return snapshots.some((snapshot) => snapshot.forecastDate === normalizedTargetDate)
    })

  if (!snapshotSourceLog) {
    return null
  }

  const snapshot = (snapshotSourceLog.raw_data?.forecastSnapshots as PersistedForecastSnapshot[])
    .find((entry) => entry.forecastDate === normalizedTargetDate)
  if (!snapshot) {
    return null
  }

  const syntheticLog: PersistedDailyWeatherLike = {
    log_date: normalizedTargetDate,
    temp_min: snapshot.tempMin,
    temp_max: snapshot.tempMax,
    temp_avg: Number(((snapshot.tempMin + snapshot.tempMax) / 2).toFixed(1)),
    precipitation_mm: snapshot.precipitationMm,
    humidity_avg: snapshot.humidityAvg,
    weather_conditions: snapshot.condition,
    data_source: snapshot.source === 'synthetic_fallback' ? 'manual' : 'api',
    raw_data: buildPersistedWeatherEnvelope(
      {
        log_date: normalizedTargetDate,
        temp_min: snapshot.tempMin,
        temp_max: snapshot.tempMax,
        temp_avg: Number(((snapshot.tempMin + snapshot.tempMax) / 2).toFixed(1)),
        precipitation_mm: snapshot.precipitationMm,
        humidity_avg: snapshot.humidityAvg,
        weather_conditions: snapshot.condition,
        data_source: snapshot.source === 'synthetic_fallback' ? 'manual' : 'api',
        raw_data: {
          forecastSnapshot: snapshot,
          persistedFromLogDate: snapshotSourceLog.log_date,
          siteWeatherBinding: snapshotSourceLog.raw_data?.siteWeatherBinding,
        },
      },
      {
        recordedAt: snapshot.generatedAt,
        providerPayload:
          snapshotSourceLog.raw_data?.providerPayload &&
          typeof snapshotSourceLog.raw_data.providerPayload === 'object'
            ? (snapshotSourceLog.raw_data.providerPayload as Record<string, unknown>)
            : undefined,
        siteWeatherBinding:
          snapshotSourceLog.raw_data?.siteWeatherBinding &&
          typeof snapshotSourceLog.raw_data.siteWeatherBinding === 'object'
            ? (snapshotSourceLog.raw_data.siteWeatherBinding as SiteWeatherBinding)
            : undefined,
        now: options?.now,
      }
    ),
  }

  return syntheticLog
}

export function upsertZoneEnvironmentalLedger(
  rawData: Record<string, unknown> | undefined,
  entry: EnvironmentalZoneLedgerEntry
): Record<string, unknown> {
  const base = rawData && typeof rawData === 'object' ? { ...rawData } : {}
  const currentLedger = Array.isArray(base.zoneEnvironmentalLedger)
    ? ([...base.zoneEnvironmentalLedger] as EnvironmentalZoneLedgerEntry[])
    : []
  const deduped = currentLedger.filter(
    (current) =>
      !(
        current &&
        current.gardenId === entry.gardenId &&
        current.zoneId === entry.zoneId &&
        current.snapshot?.date === entry.snapshot.date
      )
  )

  deduped.push(entry)
  deduped.sort((left, right) => {
    const leftKey = `${left.snapshot?.date || ''}:${left.gardenId}:${left.zoneId}`
    const rightKey = `${right.snapshot?.date || ''}:${right.gardenId}:${right.zoneId}`
    return leftKey.localeCompare(rightKey)
  })

  return {
    ...base,
    zoneEnvironmentalLedger: deduped,
  }
}

export function extractZoneEnvironmentalHistory(
  weatherLogs: Array<Pick<PersistedDailyWeatherLike, 'log_date' | 'raw_data'>>,
  filters: {
    gardenId?: string
    zoneId: string
  }
): EnvironmentalZoneLedgerEntry[] {
  return weatherLogs
    .flatMap((log) => {
      const ledger = Array.isArray(log.raw_data?.zoneEnvironmentalLedger)
        ? (log.raw_data?.zoneEnvironmentalLedger as EnvironmentalZoneLedgerEntry[])
        : []
      return ledger.filter((entry) => {
        if (!entry || entry.zoneId !== filters.zoneId) {
          return false
        }

        if (filters.gardenId && entry.gardenId !== filters.gardenId) {
          return false
        }

        return true
      })
    })
    .sort((left, right) => left.snapshot.date.localeCompare(right.snapshot.date))
}

export function extractGardenEnvironmentalHistory(
  weatherLogs: Array<Pick<PersistedDailyWeatherLike, 'log_date' | 'raw_data'>>,
  filters: {
    gardenId: string
  }
): EnvironmentalZoneLedgerEntry[] {
  return weatherLogs
    .flatMap((log) => {
      const ledger = Array.isArray(log.raw_data?.zoneEnvironmentalLedger)
        ? (log.raw_data?.zoneEnvironmentalLedger as EnvironmentalZoneLedgerEntry[])
        : []
      return ledger.filter((entry) => entry?.gardenId === filters.gardenId)
    })
    .sort((left, right) => left.snapshot.date.localeCompare(right.snapshot.date))
}

function summarizeEnvironmentalEntries(entries: EnvironmentalZoneLedgerEntry[]) {
  const latest = entries[entries.length - 1]
  const sourceClassCounts = new Map<string, number>()
  for (const entry of entries) {
    const sourceClass = entry.snapshot.weather.sourceClass || 'unknown'
    sourceClassCounts.set(sourceClass, (sourceClassCounts.get(sourceClass) || 0) + 1)
  }

  const dominantWeatherSourceClass =
    [...sourceClassCounts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ||
    'unknown'

  return {
    latest,
    dominantWeatherSourceClass,
    highSoilWaterStressDays: entries.filter(
      (entry) => entry.snapshot.soilWater.stressLevel === 'high'
    ).length,
    mediumSoilWaterStressDays: entries.filter(
      (entry) => entry.snapshot.soilWater.stressLevel === 'medium'
    ).length,
    highDiseasePressureDays: entries.filter(
      (entry) => entry.snapshot.weather.diseasePressureClass === 'high'
    ).length,
    sensorLocalDays: entries.filter(
      (entry) => entry.snapshot.sensors.precedence === 'sensor_local'
    ).length,
    deficitWaterBalanceDays: entries.filter(
      (entry) => entry.snapshot.weather.waterBalanceClass === 'deficit'
    ).length,
    surplusWaterBalanceDays: entries.filter(
      (entry) => entry.snapshot.weather.waterBalanceClass === 'surplus'
    ).length,
    lowDryingPowerDays: entries.filter(
      (entry) => entry.snapshot.weather.dryingPowerClass === 'low'
    ).length,
  }
}

export function summarizeZoneEnvironmentalHistory(
  entries: EnvironmentalZoneLedgerEntry[]
): ZoneEnvironmentalHistorySummary | null {
  if (entries.length === 0) {
    return null
  }

  const summary = summarizeEnvironmentalEntries(entries)

  return {
    zoneId: summary.latest.zoneId,
    gardenId: summary.latest.gardenId,
    entries: entries.length,
    highSoilWaterStressDays: summary.highSoilWaterStressDays,
    mediumSoilWaterStressDays: summary.mediumSoilWaterStressDays,
    highDiseasePressureDays: summary.highDiseasePressureDays,
    sensorLocalDays: summary.sensorLocalDays,
    deficitWaterBalanceDays: summary.deficitWaterBalanceDays,
    surplusWaterBalanceDays: summary.surplusWaterBalanceDays,
    lowDryingPowerDays: summary.lowDryingPowerDays,
    latestSensorPrecedence: summary.latest.snapshot.sensors.precedence,
    latestSoilWaterStressLevel: summary.latest.snapshot.soilWater.stressLevel,
    dominantWeatherSourceClass: summary.dominantWeatherSourceClass,
  }
}

export function summarizeGardenEnvironmentalHistory(
  entries: EnvironmentalZoneLedgerEntry[]
): GardenEnvironmentalHistorySummary | null {
  if (entries.length === 0) {
    return null
  }

  const summary = summarizeEnvironmentalEntries(entries)
  const trackedZones = new Set(
    entries.map((entry) => entry.zoneId).filter((zoneId): zoneId is string => Boolean(zoneId))
  ).size

  return {
    gardenId: summary.latest.gardenId,
    entries: entries.length,
    trackedZones,
    highSoilWaterStressDays: summary.highSoilWaterStressDays,
    mediumSoilWaterStressDays: summary.mediumSoilWaterStressDays,
    highDiseasePressureDays: summary.highDiseasePressureDays,
    sensorLocalDays: summary.sensorLocalDays,
    deficitWaterBalanceDays: summary.deficitWaterBalanceDays,
    surplusWaterBalanceDays: summary.surplusWaterBalanceDays,
    lowDryingPowerDays: summary.lowDryingPowerDays,
    latestSensorPrecedence: summary.latest.snapshot.sensors.precedence,
    latestSoilWaterStressLevel: summary.latest.snapshot.soilWater.stressLevel,
    dominantWeatherSourceClass: summary.dominantWeatherSourceClass,
  }
}

function inferSensorPrecedence(
  readings: SensorReading[],
  zoneId?: string
): EnvironmentalMonitoringSnapshot['sensors']['precedence'] {
  if (readings.length === 0) {
    return 'persisted_weather'
  }

  if (zoneId && readings.some((reading) => reading.zone_id === zoneId)) {
    return 'sensor_local'
  }

  return 'sensor_garden'
}

function inferSoilWaterStress(
  waterRequirement?: WaterRequirementLike | null
): EnvironmentalMonitoringSnapshot['soilWater']['stressLevel'] {
  const deficit = Number(waterRequirement?.soil_water_deficit_mm ?? 0)
  const available = Number(waterRequirement?.available_water_mm ?? 0)

  if (!waterRequirement || !Number.isFinite(deficit) || !Number.isFinite(available) || available <= 0) {
    return 'unknown'
  }

  const ratio = deficit / available
  if (ratio >= 0.65) return 'high'
  if (ratio >= 0.35) return 'medium'
  return 'low'
}

export function buildEnvironmentalMonitoringSnapshot(params: {
  date: string
  weatherLog?: PersistedDailyWeatherLike | null
  sensorReadings?: SensorReading[]
  waterRequirement?: WaterRequirementLike | null
  zoneId?: string
  siteWeatherBinding?: SiteWeatherBinding | null
}): EnvironmentalMonitoringSnapshot {
  const readings = (params.sensorReadings || []).filter(Boolean)
  const availableSignals = Array.from(new Set(readings.map((reading) => reading.sensor_type)))
  const freshestReadingAt = readings
    .map((reading) => reading.reading_date)
    .filter(Boolean)
    .sort()
    .at(-1)

  const lineage =
    params.weatherLog?.raw_data?.environmentalLineage &&
    typeof params.weatherLog.raw_data.environmentalLineage === 'object'
      ? (params.weatherLog.raw_data.environmentalLineage as PersistedWeatherLineage)
      : params.weatherLog
        ? derivePersistedWeatherLineage(params.weatherLog)
        : null
  const indicators =
    params.weatherLog?.raw_data?.derivedIndicators &&
    typeof params.weatherLog.raw_data.derivedIndicators === 'object'
      ? (params.weatherLog.raw_data.derivedIndicators as DerivedWeatherIndicators)
      : params.weatherLog
        ? deriveWeatherIndicators(params.weatherLog)
        : null
  const forecastSnapshot =
    params.weatherLog?.raw_data?.forecastSnapshot &&
    typeof params.weatherLog.raw_data.forecastSnapshot === 'object'
      ? (params.weatherLog.raw_data.forecastSnapshot as PersistedForecastSnapshot)
      : null
  const siteWeatherBinding =
    params.siteWeatherBinding ||
    (params.weatherLog?.raw_data?.siteWeatherBinding &&
    typeof params.weatherLog.raw_data.siteWeatherBinding === 'object'
      ? (params.weatherLog.raw_data.siteWeatherBinding as SiteWeatherBinding)
      : null)

  const precedence =
    readings.length > 0
      ? inferSensorPrecedence(readings, params.zoneId)
      : params.weatherLog
        ? 'persisted_weather'
        : 'estimated'

  const notes: string[] = []
  if (precedence === 'sensor_local') {
    notes.push('Zone-local sensors are taking precedence over generic weather context.')
  } else if (precedence === 'sensor_garden') {
    notes.push('Garden-wide sensors are active, but no fresher zone-local reading is available.')
  } else if (params.weatherLog) {
    notes.push('Persisted daily weather history is the primary environmental source for this snapshot.')
  } else {
    notes.push('No persisted weather or fresh sensors found: downstream engines are likely relying on estimated context.')
  }

  const impacts: EnvironmentalMonitoringSnapshot['circulation']['impacts'] = [
    'crop_tracking',
    'irrigation',
    'nutrition',
    'health',
    'operations',
  ]

  const soilWaterStress = inferSoilWaterStress(params.waterRequirement)
  if (soilWaterStress === 'high') {
    notes.push('Persisted soil-water balance indicates a high deficit relative to available water.')
  } else if (soilWaterStress === 'medium') {
    notes.push('Soil-water balance shows a moderate deficit that should influence irrigation and nutrition timing.')
  }

  if (indicators?.diseasePressureClass === 'high') {
    notes.push('Weather-derived disease pressure is elevated in the persisted daily history.')
  }

  if (forecastSnapshot) {
    notes.push(
      `Persisted forecast snapshot reused for +${forecastSnapshot.daysAhead} day(s) from ${forecastSnapshot.generatedFromDate}.`
    )
  }

  if (siteWeatherBinding?.notes?.length) {
    notes.push(...siteWeatherBinding.notes)
  }

  let regionalConfidence: EnvironmentalMonitoringSnapshot['weather']['regionalConfidence'] = 'unknown'
  if (forecastSnapshot) {
    regionalConfidence =
      forecastSnapshot.confidence === 'estimated'
        ? 'low'
        : forecastSnapshot.confidence
  } else if (lineage?.signalClass === 'station') {
    regionalConfidence = 'high'
  } else if (lineage?.signalClass === 'historical_archive' || lineage?.signalClass === 'manual') {
    regionalConfidence = 'high'
  } else if (lineage?.signalClass === 'forecast') {
    regionalConfidence = 'medium'
  } else if (lineage?.signalClass === 'synthetic_fallback') {
    regionalConfidence = 'low'
  }

  const localConfidence: EnvironmentalMonitoringSnapshot['weather']['localConfidence'] =
    precedence === 'sensor_local'
      ? 'high'
      : precedence === 'sensor_garden'
        ? 'medium'
        : siteWeatherBinding
          ? 'medium'
          : params.weatherLog
            ? 'low'
            : 'unknown'

  return {
    date: params.date,
    weather: {
      persisted: Boolean(params.weatherLog),
      sourceClass: lineage?.signalClass || 'unknown',
      primarySource: lineage?.primarySource || 'unknown',
      signalQuality: lineage?.signalQuality || 'unknown',
      regionalConfidence,
      localConfidence,
      forecastDaysAhead: forecastSnapshot?.daysAhead,
      temperatureMinC: params.weatherLog?.temp_min,
      temperatureMaxC: params.weatherLog?.temp_max,
      temperatureAvgC: params.weatherLog?.temp_avg,
      precipitationMm: params.weatherLog?.precipitation_mm,
      etoMm: params.weatherLog?.eto_calculated,
      condition: params.weatherLog?.weather_conditions,
      waterBalanceClass: indicators?.waterBalanceClass,
      diseasePressureClass: indicators?.diseasePressureClass,
      dryingPowerClass: indicators?.dryingPowerClass,
      siteBinding: siteWeatherBinding || undefined,
    },
    sensors: {
      precedence,
      availableSignals,
      readingCount: readings.length,
      freshestReadingAt,
    },
    soilWater: {
      deficitMm: params.waterRequirement?.soil_water_deficit_mm,
      availableWaterMm: params.waterRequirement?.available_water_mm,
      lastCalculatedAt: params.waterRequirement?.calculation_date,
      stressLevel: soilWaterStress,
    },
    circulation: {
      impacts,
      notes,
    },
  }
}

export async function getEnvironmentalMonitoringSnapshot(params: {
  userId: string
  gardenId: string
  zoneId?: string
  date?: string | Date
  maxSensorAgeHours?: number
}): Promise<EnvironmentalMonitoringSnapshot> {
  const supabase = getSupabaseClient()
  const dateStr =
    typeof params.date === 'string'
      ? params.date
      : (params.date || new Date()).toISOString().split('T')[0]

  if (!supabase) {
    return buildEnvironmentalMonitoringSnapshot({
      date: dateStr,
    })
  }

  const lookupStart = new Date(`${dateStr}T12:00:00.000Z`)
  lookupStart.setDate(lookupStart.getDate() - 7)
  const lookupStartDate = lookupStart.toISOString().split('T')[0]

  const [weatherRes, waterRequirementRes, zoneSiteRes, gardenSiteRes, ...sensorReadings] = await Promise.all([
    supabase
      .from('daily_weather_log')
      .select('*')
      .eq('user_id', params.userId)
      .gte('log_date', lookupStartDate)
      .lte('log_date', dateStr)
      .order('log_date', { ascending: false }),
    params.zoneId
      ? supabase
          .from('water_requirements')
          .select('calculation_date, soil_water_deficit_mm, available_water_mm')
          .eq('zone_id', params.zoneId)
          .lte('calculation_date', dateStr)
          .order('calculation_date', { ascending: false })
          .limit(1)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    params.zoneId
      ? supabase
          .from('irrigation_zones')
          .select('id, slope_percentage, sun_exposure')
          .eq('id', params.zoneId)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    supabase
      .from('gardens')
      .select('id, coordinates')
      .eq('id', params.gardenId)
      .maybeSingle(),
    ...([
      'temperature_air',
      'humidity_air',
      'rain_gauge_local',
      'soil_moisture_10cm',
      'soil_moisture_30cm',
      'soil_moisture_60cm',
      'soil_tension_kpa',
      'leaf_wetness',
      'dew_point',
      'vpd',
      'canopy_temperature',
    ] as SensorType[]).map((sensorType) =>
      getLatestSensorReading(
        params.gardenId,
        sensorType,
        params.zoneId,
        params.maxSensorAgeHours || 24
      )
    ),
  ])

  const gardenCoords =
    normalizeGeoCoordinates(gardenSiteRes.data?.coordinates) ||
    (gardenSiteRes.data?.coordinates && typeof gardenSiteRes.data.coordinates === 'object'
      ? ({
          latitude: (gardenSiteRes.data.coordinates as { latitude?: number }).latitude,
          longitude: (gardenSiteRes.data.coordinates as { longitude?: number }).longitude,
        } as { latitude?: number; longitude?: number })
      : null)
  const siteWeatherBinding =
    gardenCoords?.latitude !== undefined && gardenCoords?.longitude !== undefined
      ? buildSiteWeatherBinding({
          latitude: gardenCoords.latitude,
          longitude: gardenCoords.longitude,
          slopePercentage: zoneSiteRes.data?.slope_percentage,
          sunExposure: zoneSiteRes.data?.sun_exposure,
        })
      : null
  const resolvedWeatherLog = resolvePersistedWeatherLogForDate(
    ((weatherRes.data || []) as PersistedDailyWeatherLike[]),
    dateStr,
    { now: new Date() }
  )

  return buildEnvironmentalMonitoringSnapshot({
    date: dateStr,
    weatherLog: resolvedWeatherLog || undefined,
    sensorReadings: sensorReadings.filter(
      (reading): reading is SensorReading => Boolean(reading)
    ),
    waterRequirement: (waterRequirementRes as { data: WaterRequirementLike | null }).data,
    zoneId: params.zoneId,
    siteWeatherBinding,
  })
}

export async function getPersistedZoneEnvironmentalHistory(params: {
  userId: string
  zoneId: string
  gardenId?: string
  startDate: string
  endDate: string
}): Promise<EnvironmentalZoneLedgerEntry[]> {
  const supabase = getSupabaseClient()

  if (!supabase) {
    return []
  }

  const { data } = await supabase
    .from('daily_weather_log')
    .select('log_date, raw_data')
    .eq('user_id', params.userId)
    .gte('log_date', params.startDate)
    .lte('log_date', params.endDate)
    .order('log_date', { ascending: true })

  return extractZoneEnvironmentalHistory(
    ((data || []) as Array<Pick<PersistedDailyWeatherLike, 'log_date' | 'raw_data'>>),
    {
      gardenId: params.gardenId,
      zoneId: params.zoneId,
    }
  )
}

export async function getPersistedZoneEnvironmentalHistorySummary(params: {
  userId: string
  zoneId: string
  gardenId?: string
  startDate: string
  endDate: string
}): Promise<ZoneEnvironmentalHistorySummary | null> {
  const history = await getPersistedZoneEnvironmentalHistory(params)
  return summarizeZoneEnvironmentalHistory(history)
}

export async function getPersistedGardenEnvironmentalHistory(params: {
  userId: string
  gardenId: string
  startDate: string
  endDate: string
}): Promise<EnvironmentalZoneLedgerEntry[]> {
  const supabase = getSupabaseClient()

  if (!supabase) {
    return []
  }

  const { data } = await supabase
    .from('daily_weather_log')
    .select('log_date, raw_data')
    .eq('user_id', params.userId)
    .gte('log_date', params.startDate)
    .lte('log_date', params.endDate)
    .order('log_date', { ascending: true })

  return extractGardenEnvironmentalHistory(
    ((data || []) as Array<Pick<PersistedDailyWeatherLike, 'log_date' | 'raw_data'>>),
    {
      gardenId: params.gardenId,
    }
  )
}

export async function getPersistedGardenEnvironmentalHistorySummary(params: {
  userId: string
  gardenId: string
  startDate: string
  endDate: string
}): Promise<GardenEnvironmentalHistorySummary | null> {
  const history = await getPersistedGardenEnvironmentalHistory(params)
  return summarizeGardenEnvironmentalHistory(history)
}
