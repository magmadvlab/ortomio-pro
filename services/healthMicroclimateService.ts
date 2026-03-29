import type { Garden, SmartDevice } from '@/types'
import {
  getLatestSensorReading,
  getLatestSensorReadingForSensorIds,
  type SensorReading,
  type SensorType,
} from '@/services/sensorDataService'

export type HealthRiskLevel = 'none' | 'low' | 'medium' | 'high'

export function healthRiskLevelToScore(level: HealthRiskLevel): number {
  switch (level) {
    case 'high':
      return 3
    case 'medium':
      return 2
    case 'low':
      return 1
    default:
      return 0
  }
}

type HealthMicroclimateKey =
  | 'leafWetness'
  | 'dewPoint'
  | 'vpd'
  | 'rainGaugeLocal'
  | 'airHumidity'
  | 'airTemperature'
  | 'canopyTemperature'
  | 'soilMoisture10cm'
  | 'soilMoisture30cm'
  | 'soilMoisture60cm'
  | 'soilTensionKpa'

export interface HealthMicroclimateSnapshot {
  gardenId: string
  zoneId?: string
  fieldRowId?: string
  treeId?: string
  plantId?: string
  vpd?: number
  dewPointGapC?: number
  soilTensionKpa?: number
  readings: Partial<Record<HealthMicroclimateKey, SensorReading | null>>
  metrics: {
    leafWetness?: number
    dewPoint?: number
    vpd?: number
    rainGaugeLocalMm?: number
    airHumidity?: number
    airTemperature?: number
    canopyTemperature?: number
    canopyDeltaC?: number
    dewPointSpreadC?: number
    soilMoisture10cm?: number
    soilMoisture30cm?: number
    soilMoisture60cm?: number
    soilTensionKpa?: number
  }
  fungalPressure: HealthRiskLevel
  waterStress: HealthRiskLevel
  heatStress: HealthRiskLevel
  hasRecentData: boolean
  supportingSignals: string[]
  resolutionScopeType?: 'garden' | 'zone' | 'field_row' | 'tree' | 'plant'
  resolutionScopeId?: string
  matchedDeviceIds?: string[]
}

export interface HealthSensorScope {
  zoneId?: string
  fieldRowId?: string
  treeId?: string
  plantId?: string
}

export interface HealthMicroclimateResolveOptions extends HealthSensorScope {
  devices?: SmartDevice[]
  maxAgeHours?: number
}

function roundMetric(value?: number): number | undefined {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return undefined
  }

  return Math.round(value * 10) / 10
}

function computeFungalPressure(metrics: HealthMicroclimateSnapshot['metrics']): HealthRiskLevel {
  const favorableTemp =
    metrics.airTemperature !== undefined && metrics.airTemperature >= 10 && metrics.airTemperature <= 28
  const prolongedLeafWetness =
    metrics.leafWetness !== undefined && metrics.leafWetness >= 70
  const moderateLeafWetness =
    metrics.leafWetness !== undefined && metrics.leafWetness >= 50
  const highHumidity = metrics.airHumidity !== undefined && metrics.airHumidity >= 85
  const moderateHumidity = metrics.airHumidity !== undefined && metrics.airHumidity >= 78
  const localRain = metrics.rainGaugeLocalMm !== undefined && metrics.rainGaugeLocalMm >= 2
  const dewPointTight =
    metrics.dewPointSpreadC !== undefined && metrics.dewPointSpreadC <= 2
  const dewPointModerate =
    metrics.dewPointSpreadC !== undefined && metrics.dewPointSpreadC <= 3.5
  const lowVpd = metrics.vpd !== undefined && metrics.vpd <= 1

  if (
    favorableTemp &&
    ((prolongedLeafWetness && highHumidity) || (localRain && dewPointTight) || (prolongedLeafWetness && lowVpd))
  ) {
    return 'high'
  }

  if (
    favorableTemp &&
    ((moderateLeafWetness && moderateHumidity) || (localRain && dewPointModerate) || lowVpd)
  ) {
    return 'medium'
  }

  if (moderateLeafWetness || moderateHumidity || localRain) {
    return 'low'
  }

  return 'none'
}

function computeWaterStress(metrics: HealthMicroclimateSnapshot['metrics']): HealthRiskLevel {
  const severeTension = metrics.soilTensionKpa !== undefined && metrics.soilTensionKpa >= 120
  const warningTension = metrics.soilTensionKpa !== undefined && metrics.soilTensionKpa >= 80
  const severeVpd = metrics.vpd !== undefined && metrics.vpd >= 2.2
  const warningVpd = metrics.vpd !== undefined && metrics.vpd >= 1.4
  const severeCanopyDelta = metrics.canopyDeltaC !== undefined && metrics.canopyDeltaC >= 4
  const warningCanopyDelta = metrics.canopyDeltaC !== undefined && metrics.canopyDeltaC >= 2
  const deepSoilDry =
    metrics.soilMoisture30cm !== undefined &&
    metrics.soilMoisture60cm !== undefined &&
    metrics.soilMoisture30cm <= 18 &&
    metrics.soilMoisture60cm <= 20
  const moderateSoilDry =
    metrics.soilMoisture30cm !== undefined && metrics.soilMoisture30cm <= 24

  if (severeTension || severeVpd || severeCanopyDelta || deepSoilDry) {
    return 'high'
  }

  if (warningTension || warningVpd || warningCanopyDelta || moderateSoilDry) {
    return 'medium'
  }

  if (metrics.soilMoisture10cm !== undefined && metrics.soilMoisture10cm <= 28) {
    return 'low'
  }

  return 'none'
}

function computeHeatStress(metrics: HealthMicroclimateSnapshot['metrics']): HealthRiskLevel {
  const severeAirHeat = metrics.airTemperature !== undefined && metrics.airTemperature >= 34
  const warningAirHeat = metrics.airTemperature !== undefined && metrics.airTemperature >= 30
  const severeCanopyHeat = metrics.canopyTemperature !== undefined && metrics.canopyTemperature >= 34
  const warningCanopyHeat = metrics.canopyTemperature !== undefined && metrics.canopyTemperature >= 30
  const severeCanopyDelta = metrics.canopyDeltaC !== undefined && metrics.canopyDeltaC >= 4
  const warningCanopyDelta = metrics.canopyDeltaC !== undefined && metrics.canopyDeltaC >= 2
  const severeVpd = metrics.vpd !== undefined && metrics.vpd >= 2.4
  const warningVpd = metrics.vpd !== undefined && metrics.vpd >= 1.6

  if (severeAirHeat || severeCanopyHeat || severeCanopyDelta || severeVpd) {
    return 'high'
  }

  if (warningAirHeat || warningCanopyHeat || warningCanopyDelta || warningVpd) {
    return 'medium'
  }

  return 'none'
}

export function describeMicroclimateSignals(snapshot: HealthMicroclimateSnapshot): string[] {
  const signals: string[] = []

  if (snapshot.metrics.leafWetness !== undefined) {
    signals.push(`bagnatura fogliare ${snapshot.metrics.leafWetness.toFixed(0)}%`)
  }

  if (snapshot.metrics.dewPointSpreadC !== undefined) {
    signals.push(`gap aria-rugiada ${snapshot.metrics.dewPointSpreadC.toFixed(1)}°C`)
  }

  if (snapshot.metrics.vpd !== undefined) {
    signals.push(`VPD ${snapshot.metrics.vpd.toFixed(2)} kPa`)
  }

  if (snapshot.metrics.rainGaugeLocalMm !== undefined) {
    signals.push(`pioggia locale ${snapshot.metrics.rainGaugeLocalMm.toFixed(1)} mm`)
  }

  if (snapshot.metrics.soilTensionKpa !== undefined) {
    signals.push(`tensione suolo ${snapshot.metrics.soilTensionKpa.toFixed(0)} kPa`)
  }

  if (snapshot.metrics.canopyDeltaC !== undefined) {
    signals.push(`delta chioma-aria ${snapshot.metrics.canopyDeltaC.toFixed(1)}°C`)
  }

  return signals
}

const MICROCLIMATE_SENSOR_CONFIG: Array<{
  key: HealthMicroclimateKey
  sensorType: SensorType
}> = [
  { key: 'leafWetness', sensorType: 'leaf_wetness' },
  { key: 'dewPoint', sensorType: 'dew_point' },
  { key: 'vpd', sensorType: 'vpd' },
  { key: 'rainGaugeLocal', sensorType: 'rain_gauge_local' },
  { key: 'airHumidity', sensorType: 'humidity_air' },
  { key: 'airTemperature', sensorType: 'temperature_air' },
  { key: 'canopyTemperature', sensorType: 'canopy_temperature' },
  { key: 'soilMoisture10cm', sensorType: 'soil_moisture_10cm' },
  { key: 'soilMoisture30cm', sensorType: 'soil_moisture_30cm' },
  { key: 'soilMoisture60cm', sensorType: 'soil_moisture_60cm' },
  { key: 'soilTensionKpa', sensorType: 'soil_tension_kpa' },
]

export function buildHealthMicroclimateSnapshot(
  garden: Pick<Garden, 'id'>,
  readings: Partial<Record<HealthMicroclimateKey, SensorReading | null>>,
  scope: HealthSensorScope = {},
  resolution?: {
    scopeType?: HealthMicroclimateSnapshot['resolutionScopeType']
    scopeId?: string
    deviceIds?: string[]
  }
): HealthMicroclimateSnapshot {
  const metrics: HealthMicroclimateSnapshot['metrics'] = {
    leafWetness: roundMetric(readings.leafWetness?.value),
    dewPoint: roundMetric(readings.dewPoint?.value),
    vpd: roundMetric(readings.vpd?.value),
    rainGaugeLocalMm: roundMetric(readings.rainGaugeLocal?.value),
    airHumidity: roundMetric(readings.airHumidity?.value),
    airTemperature: roundMetric(readings.airTemperature?.value),
    canopyTemperature: roundMetric(readings.canopyTemperature?.value),
    soilMoisture10cm: roundMetric(readings.soilMoisture10cm?.value),
    soilMoisture30cm: roundMetric(readings.soilMoisture30cm?.value),
    soilMoisture60cm: roundMetric(readings.soilMoisture60cm?.value),
    soilTensionKpa: roundMetric(readings.soilTensionKpa?.value),
  }

  if (metrics.airTemperature !== undefined && metrics.dewPoint !== undefined) {
    metrics.dewPointSpreadC = roundMetric(metrics.airTemperature - metrics.dewPoint)
  }

  if (metrics.airTemperature !== undefined && metrics.canopyTemperature !== undefined) {
    metrics.canopyDeltaC = roundMetric(metrics.canopyTemperature - metrics.airTemperature)
  }

  const snapshot: HealthMicroclimateSnapshot = {
    gardenId: garden.id,
    zoneId: scope.zoneId,
    fieldRowId: scope.fieldRowId,
    treeId: scope.treeId,
    plantId: scope.plantId,
    vpd: metrics.vpd,
    dewPointGapC: metrics.dewPointSpreadC,
    soilTensionKpa: metrics.soilTensionKpa,
    readings,
    metrics,
    fungalPressure: computeFungalPressure(metrics),
    waterStress: computeWaterStress(metrics),
    heatStress: computeHeatStress(metrics),
    hasRecentData: Object.values(readings).some(Boolean),
    supportingSignals: [],
    resolutionScopeType: resolution?.scopeType,
    resolutionScopeId: resolution?.scopeId,
    matchedDeviceIds: resolution?.deviceIds,
  }

  snapshot.supportingSignals = describeMicroclimateSignals(snapshot)
  return snapshot
}

function isScopeCompatible(device: SmartDevice, scope: HealthSensorScope): boolean {
  if (scope.plantId) return device.plantId === scope.plantId
  if (scope.treeId) return device.treeId === scope.treeId
  if (scope.fieldRowId) return device.fieldRowId === scope.fieldRowId
  if (scope.zoneId) return device.zoneId === scope.zoneId
  return !device.scopeType || !device.scopeId
}

function getScopedSensorDevices(devices: SmartDevice[] = [], scope: HealthSensorScope): SmartDevice[] {
  return devices.filter(
    (device) => device.type === 'Sensor' && Boolean(device.sensorId) && isScopeCompatible(device, scope)
  )
}

async function buildSnapshotFromDevices(
  garden: Pick<Garden, 'id'>,
  scope: HealthSensorScope,
  devices: SmartDevice[],
  maxAgeHours: number
): Promise<HealthMicroclimateSnapshot | null> {
  const scopedDevices = getScopedSensorDevices(devices, scope)
  const sensorIds = scopedDevices
    .map((device) => device.sensorId)
    .filter((sensorId): sensorId is string => Boolean(sensorId))

  if (sensorIds.length === 0) {
    return null
  }

  const readings = await Promise.all(
    MICROCLIMATE_SENSOR_CONFIG.map(async ({ key, sensorType }) => [
      key,
      await getLatestSensorReadingForSensorIds(garden.id, sensorType, sensorIds, maxAgeHours),
    ] as const)
  )

  const snapshot = buildHealthMicroclimateSnapshot(
    garden,
    Object.fromEntries(readings) as Partial<Record<HealthMicroclimateKey, SensorReading | null>>,
    scope,
    {
      scopeType: scope.plantId
        ? 'plant'
        : scope.treeId
          ? 'tree'
          : scope.fieldRowId
            ? 'field_row'
            : scope.zoneId
              ? 'zone'
              : 'garden',
      scopeId: scope.plantId || scope.treeId || scope.fieldRowId || scope.zoneId,
      deviceIds: scopedDevices.map((device) => device.id),
    }
  )

  return snapshot.hasRecentData ? snapshot : null
}

export async function getScopedHealthMicroclimateSnapshot(
  garden: Pick<Garden, 'id'>,
  options: HealthMicroclimateResolveOptions = {}
): Promise<HealthMicroclimateSnapshot> {
  const { devices = [], maxAgeHours = 24, zoneId, fieldRowId, treeId, plantId } = options
  const directScopes: HealthSensorScope[] = []

  if (plantId) directScopes.push({ plantId })
  if (treeId) directScopes.push({ treeId })
  if (fieldRowId) directScopes.push({ fieldRowId })
  if (zoneId) directScopes.push({ zoneId })
  directScopes.push({})

  for (const scope of directScopes) {
    const snapshot = await buildSnapshotFromDevices(garden, scope, devices, maxAgeHours)
    if (snapshot?.hasRecentData) {
      return snapshot
    }
  }

  if (zoneId) {
    const zoneSnapshot = await getHealthMicroclimateSnapshot(garden, zoneId, maxAgeHours)
    if (zoneSnapshot.hasRecentData) {
      zoneSnapshot.fieldRowId = fieldRowId
      zoneSnapshot.treeId = treeId
      zoneSnapshot.plantId = plantId
      return zoneSnapshot
    }
  }

  const gardenSnapshot = await getHealthMicroclimateSnapshot(garden, undefined, maxAgeHours)
  gardenSnapshot.zoneId = zoneId
  gardenSnapshot.fieldRowId = fieldRowId
  gardenSnapshot.treeId = treeId
  gardenSnapshot.plantId = plantId
  return gardenSnapshot
}

export async function getHealthMicroclimateSnapshot(
  garden: Pick<Garden, 'id'>,
  zoneId?: string,
  maxAgeHours: number = 24
): Promise<HealthMicroclimateSnapshot> {
  const [
    leafWetness,
    dewPoint,
    vpd,
    rainGaugeLocal,
    airHumidity,
    airTemperature,
    canopyTemperature,
    soilMoisture10cm,
    soilMoisture30cm,
    soilMoisture60cm,
    soilTensionKpa,
  ] = await Promise.all([
    getLatestSensorReading(garden.id, 'leaf_wetness', zoneId, maxAgeHours),
    getLatestSensorReading(garden.id, 'dew_point', zoneId, maxAgeHours),
    getLatestSensorReading(garden.id, 'vpd', zoneId, maxAgeHours),
    getLatestSensorReading(garden.id, 'rain_gauge_local', zoneId, maxAgeHours),
    getLatestSensorReading(garden.id, 'humidity_air', zoneId, maxAgeHours),
    getLatestSensorReading(garden.id, 'temperature_air', zoneId, maxAgeHours),
    getLatestSensorReading(garden.id, 'canopy_temperature', zoneId, maxAgeHours),
    getLatestSensorReading(garden.id, 'soil_moisture_10cm', zoneId, maxAgeHours),
    getLatestSensorReading(garden.id, 'soil_moisture_30cm', zoneId, maxAgeHours),
    getLatestSensorReading(garden.id, 'soil_moisture_60cm', zoneId, maxAgeHours),
    getLatestSensorReading(garden.id, 'soil_tension_kpa', zoneId, maxAgeHours),
  ])

  return buildHealthMicroclimateSnapshot(
    garden,
    {
      leafWetness,
      dewPoint,
      vpd,
      rainGaugeLocal,
      airHumidity,
      airTemperature,
      canopyTemperature,
      soilMoisture10cm,
      soilMoisture30cm,
      soilMoisture60cm,
      soilTensionKpa,
    },
    { zoneId },
    {
      scopeType: zoneId ? 'zone' : 'garden',
      scopeId: zoneId,
    }
  )
}
