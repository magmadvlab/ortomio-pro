import test from 'node:test'
import assert from 'node:assert/strict'

import { PrescriptionMapsService } from '@/services/prescriptionMapsService'
import {
  computeMicroclimateEfficacy,
  computeSoilResponseEfficacy,
  getPrescriptionExecutionEfficacySummary,
  getPrescriptionExecutionSummary,
  getPrescriptionExecutionOutcomeSummary,
  getPrescriptionExecutionVarianceSummary,
} from '@/services/prescriptionExecutionService'
import type {
  PrescriptionExecutionRecord,
  PrescriptionMap,
  PrescriptionZone,
} from '@/types/prescriptionMaps'
import type { HealthMicroclimateSnapshot } from '@/services/healthMicroclimateService'

const createZone = (overrides: Partial<PrescriptionZone> = {}): PrescriptionZone => ({
  id: overrides.id ?? crypto.randomUUID(),
  prescriptionMapId: overrides.prescriptionMapId ?? 'map-1',
  zoneNumber: overrides.zoneNumber ?? 1,
  zoneName: overrides.zoneName ?? 'Zona 1',
  zoneType: overrides.zoneType ?? 'variable',
  geometry: overrides.geometry ?? {
    type: 'Polygon',
    coordinates: [[[12.1, 41.1], [12.2, 41.1], [12.2, 41.2], [12.1, 41.2], [12.1, 41.1]]],
  },
  centroid: overrides.centroid ?? { latitude: 41.15, longitude: 12.15 },
  areaSqm: overrides.areaSqm ?? 4000,
  prescription: overrides.prescription ?? {
    applicationRate: 120,
    unit: 'kg/ha',
    applicationMethod: 'variable_rate',
    productName: 'NPK Premium',
    productType: 'fertilizer',
  },
  sourceData: overrides.sourceData ?? {
    avgNdvi: 0.72,
    plantCount: 240,
    avgPlantHealth: 84,
    soilType: 'franco',
  },
  dataQuality: overrides.dataQuality ?? 88,
  confidence: overrides.confidence ?? 86,
  createdAt: overrides.createdAt ?? '2026-03-21T10:00:00.000Z',
  updatedAt: overrides.updatedAt ?? '2026-03-21T10:00:00.000Z',
})

const createMap = (zones: PrescriptionZone[]): PrescriptionMap => ({
  id: 'map-1',
  gardenId: 'garden-1',
  gardenName: 'Vigneto Collina',
  name: 'Mappa esecuzione concimazione',
  mapType: 'fertilizer',
  generationDate: '2026-03-21T10:00:00.000Z',
  dataSourcePeriod: {
    startDate: '2026-03-01',
    endDate: '2026-03-20',
  },
  dataSources: {
    ndviData: true,
    plantLevelData: true,
    rowLevelData: false,
    soilData: true,
    weatherData: false,
  },
  zones,
  totalZones: zones.length,
  totalAreaSqm: zones.reduce((sum, zone) => sum + zone.areaSqm, 0),
  exportFormats: {
    shapefile: true,
    kml: true,
    isoxml: false,
    geojson: true,
    csv: true,
  },
  areaHectares: Number((zones.reduce((sum, zone) => sum + zone.areaSqm, 0) / 10000).toFixed(2)),
  zonesCount: zones.length,
  applicationRate: { min: 90, max: 140, unit: 'kg/ha' },
  costSavings: 200,
  inputReduction: 12,
  status: 'completed',
  validationStatus: 'valid',
  qualityScore: 90,
  dataCompleteness: 93,
  createdAt: '2026-03-21T10:00:00.000Z',
  updatedAt: '2026-03-21T10:00:00.000Z',
})

test('getPrescriptionExecutionSummary counts latest zone execution status correctly', async () => {
  const zones = [
    createZone({ id: 'zone-1', zoneNumber: 1, zoneName: 'Zona A' }),
    createZone({ id: 'zone-2', zoneNumber: 2, zoneName: 'Zona B' }),
    createZone({ id: 'zone-3', zoneNumber: 3, zoneName: 'Zona C' }),
  ]

  const records: PrescriptionExecutionRecord[] = [
    {
      id: 'exec-old-zone-1',
      prescriptionMapId: 'map-1',
      prescriptionZoneId: 'zone-1',
      applicationDate: '2026-03-21T08:00:00.000Z',
      productName: 'NPK Premium',
      plannedRate: 120,
      actualRate: 110,
      unit: 'kg/ha',
      areaAppliedSqm: 3200,
      executionStatus: 'partial',
      createdAt: '2026-03-21T08:00:00.000Z',
      updatedAt: '2026-03-21T08:00:00.000Z',
    },
    {
      id: 'exec-latest-zone-1',
      prescriptionMapId: 'map-1',
      prescriptionZoneId: 'zone-1',
      applicationDate: '2026-03-21T12:00:00.000Z',
      productName: 'NPK Premium',
      plannedRate: 120,
      actualRate: 120,
      unit: 'kg/ha',
      areaAppliedSqm: 4000,
      applicationAccuracy: 100,
      executionStatus: 'completed',
      createdAt: '2026-03-21T12:00:00.000Z',
      updatedAt: '2026-03-21T12:00:00.000Z',
    },
    {
      id: 'exec-zone-2',
      prescriptionMapId: 'map-1',
      prescriptionZoneId: 'zone-2',
      applicationDate: '2026-03-21T11:00:00.000Z',
      productName: 'NPK Premium',
      plannedRate: 120,
      actualRate: 84,
      unit: 'kg/ha',
      areaAppliedSqm: 2400,
      applicationAccuracy: 70,
      executionStatus: 'partial',
      createdAt: '2026-03-21T11:00:00.000Z',
      updatedAt: '2026-03-21T11:00:00.000Z',
    },
    {
      id: 'exec-zone-3',
      prescriptionMapId: 'map-1',
      prescriptionZoneId: 'zone-3',
      applicationDate: '2026-03-21T09:00:00.000Z',
      productName: 'NPK Premium',
      plannedRate: 120,
      unit: 'kg/ha',
      areaAppliedSqm: 0,
      applicationAccuracy: 0,
      executionStatus: 'missed',
      createdAt: '2026-03-21T09:00:00.000Z',
      updatedAt: '2026-03-21T09:00:00.000Z',
    },
  ]

  const summary = await getPrescriptionExecutionSummary(
    {
      async getPrescriptionExecutionRecords() {
        return records
      },
    },
    createMap(zones)
  )

  assert.equal(summary.completedZones, 1)
  assert.equal(summary.partialZones, 1)
  assert.equal(summary.missedZones, 1)
  assert.equal(summary.pendingZones, 0)
  assert.equal(summary.totalExecutedAreaSqm, 6400)
  assert.equal(summary.averageAccuracy, 56.67)
  assert.equal(summary.zoneSummaries.find((zone) => zone.zoneId === 'zone-1')?.latestStatus, 'completed')
})

test('recordZoneExecution persists completed and missed outcomes with normalized defaults', async () => {
  const zones = [createZone({ id: 'zone-9', zoneName: 'Zona Test', areaSqm: 5000 })]
  const map = createMap(zones)
  const createdPayloads: Array<Omit<PrescriptionExecutionRecord, 'id' | 'createdAt' | 'updatedAt'>> = []

  const service = new PrescriptionMapsService({
    async createPrescriptionExecutionRecord(
      record: Omit<PrescriptionExecutionRecord, 'id' | 'createdAt' | 'updatedAt'>
    ) {
      createdPayloads.push(record)
      return {
        ...record,
        id: crypto.randomUUID(),
        createdAt: '2026-03-21T15:00:00.000Z',
        updatedAt: '2026-03-21T15:00:00.000Z',
      }
    },
  })

  await service.recordZoneExecution(map, zones[0], {
    executionStatus: 'completed',
    operatorName: 'Tecnico campo',
  })

  await service.recordZoneExecution(map, zones[0], {
    executionStatus: 'missed',
    notes: 'Pioggia in arrivo',
  })

  assert.equal(createdPayloads.length, 2)
  assert.equal(createdPayloads[0].executionStatus, 'completed')
  assert.equal(createdPayloads[0].actualRate, 120)
  assert.equal(createdPayloads[0].areaAppliedSqm, 5000)
  assert.equal(createdPayloads[0].applicationAccuracy, 100)
  assert.equal(createdPayloads[0].executionScopeType, 'zone')
  assert.equal(createdPayloads[1].executionStatus, 'missed')
  assert.equal(createdPayloads[1].actualRate, undefined)
  assert.equal(createdPayloads[1].areaAppliedSqm, 0)
  assert.equal(createdPayloads[1].applicationAccuracy, 0)
})

test('getPrescriptionExecutionVarianceSummary classifies aligned, partial, off-target, missed and pending zones', async () => {
  const zones = [
    createZone({ id: 'zone-a', zoneName: 'Zona A', areaSqm: 5000 }),
    createZone({ id: 'zone-b', zoneName: 'Zona B', areaSqm: 5000 }),
    createZone({ id: 'zone-c', zoneName: 'Zona C', areaSqm: 5000 }),
    createZone({ id: 'zone-d', zoneName: 'Zona D', areaSqm: 5000 }),
    createZone({ id: 'zone-e', zoneName: 'Zona E', areaSqm: 5000 }),
  ]

  const varianceSummary = await getPrescriptionExecutionVarianceSummary(
    {
      async getPrescriptionExecutionRecords() {
        return [
          {
            id: 'aligned',
            prescriptionMapId: 'map-1',
            prescriptionZoneId: 'zone-a',
            applicationDate: '2026-03-21T12:00:00.000Z',
            productName: 'NPK Premium',
            plannedRate: 120,
            actualRate: 118,
            unit: 'kg/ha',
            areaAppliedSqm: 4800,
            executionStatus: 'completed',
            createdAt: '2026-03-21T12:00:00.000Z',
            updatedAt: '2026-03-21T12:00:00.000Z',
          },
          {
            id: 'partial',
            prescriptionMapId: 'map-1',
            prescriptionZoneId: 'zone-b',
            applicationDate: '2026-03-21T12:30:00.000Z',
            productName: 'NPK Premium',
            plannedRate: 120,
            actualRate: 95,
            unit: 'kg/ha',
            areaAppliedSqm: 3200,
            executionStatus: 'partial',
            createdAt: '2026-03-21T12:30:00.000Z',
            updatedAt: '2026-03-21T12:30:00.000Z',
          },
          {
            id: 'off-target',
            prescriptionMapId: 'map-1',
            prescriptionZoneId: 'zone-c',
            applicationDate: '2026-03-21T13:00:00.000Z',
            productName: 'NPK Premium',
            plannedRate: 120,
            actualRate: 70,
            unit: 'kg/ha',
            areaAppliedSqm: 1800,
            executionStatus: 'completed',
            createdAt: '2026-03-21T13:00:00.000Z',
            updatedAt: '2026-03-21T13:00:00.000Z',
          },
          {
            id: 'missed',
            prescriptionMapId: 'map-1',
            prescriptionZoneId: 'zone-d',
            applicationDate: '2026-03-21T13:30:00.000Z',
            productName: 'NPK Premium',
            plannedRate: 120,
            unit: 'kg/ha',
            areaAppliedSqm: 0,
            executionStatus: 'missed',
            createdAt: '2026-03-21T13:30:00.000Z',
            updatedAt: '2026-03-21T13:30:00.000Z',
          },
        ]
      },
    },
    createMap(zones)
  )

  assert.equal(varianceSummary.alignedZones, 1)
  assert.equal(varianceSummary.partialZones, 1)
  assert.equal(varianceSummary.offTargetZones, 1)
  assert.equal(varianceSummary.missedZones, 1)
  assert.equal(varianceSummary.pendingZones, 1)
  assert.equal(varianceSummary.zoneVariances.find((zone) => zone.zoneId === 'zone-a')?.varianceStatus, 'aligned')
  assert.equal(varianceSummary.zoneVariances.find((zone) => zone.zoneId === 'zone-c')?.varianceStatus, 'off_target')
  assert.equal(varianceSummary.zoneVariances.find((zone) => zone.zoneId === 'zone-e')?.varianceStatus, 'pending')
})

test('getPrescriptionExecutionOutcomeSummary classifies post-execution quality outcomes by zone', async () => {
  const zones = [
    createZone({ id: 'zone-outcome-a', zoneName: 'Zona Positiva' }),
    createZone({ id: 'zone-outcome-b', zoneName: 'Zona Mista' }),
    createZone({ id: 'zone-outcome-c', zoneName: 'Zona Negativa' }),
    createZone({ id: 'zone-outcome-d', zoneName: 'Zona Senza Dati' }),
  ]

  const executionRecords: PrescriptionExecutionRecord[] = zones.map((zone, index) => ({
    id: `exec-outcome-${index}`,
    prescriptionMapId: 'map-1',
    prescriptionZoneId: zone.id,
    applicationDate: '2026-03-21T08:00:00.000Z',
    productName: 'NPK Premium',
    plannedRate: 120,
    actualRate: 120,
    unit: 'kg/ha',
    areaAppliedSqm: 4000,
    executionStatus: 'completed',
    createdAt: '2026-03-21T08:00:00.000Z',
    updatedAt: '2026-03-21T08:00:00.000Z',
  }))

  const outcomeSummary = await getPrescriptionExecutionOutcomeSummary(
    {
      async getPrescriptionExecutionRecords() {
        return executionRecords
      },
      async getQualityResults(_gardenId: string, filters?: { zoneId?: string }) {
        switch (filters?.zoneId) {
          case 'zone-outcome-a':
            return [{
              id: 'quality-a',
              gardenId: 'garden-1',
              cropContextId: 'vineyard',
              scopeType: 'zone',
              zoneId: 'zone-outcome-a',
              recordedAt: '2026-03-21T12:00:00.000Z',
              source: 'lab_analysis',
              qualityScore: 88,
              brix: 18,
              defectIncidencePercentage: 6,
              qualityGrade: 'excellent',
              createdAt: '2026-03-21T12:00:00.000Z',
              updatedAt: '2026-03-21T12:00:00.000Z',
            }]
          case 'zone-outcome-b':
            return [{
              id: 'quality-b',
              gardenId: 'garden-1',
              cropContextId: 'vineyard',
              scopeType: 'zone',
              zoneId: 'zone-outcome-b',
              recordedAt: '2026-03-21T12:00:00.000Z',
              source: 'field_measurement',
              qualityScore: 58,
              brix: 12,
              defectIncidencePercentage: 18,
              qualityGrade: 'fair',
              createdAt: '2026-03-21T12:00:00.000Z',
              updatedAt: '2026-03-21T12:00:00.000Z',
            }]
          case 'zone-outcome-c':
            return [{
              id: 'quality-c',
              gardenId: 'garden-1',
              cropContextId: 'vineyard',
              scopeType: 'zone',
              zoneId: 'zone-outcome-c',
              recordedAt: '2026-03-21T12:00:00.000Z',
              source: 'field_measurement',
              qualityScore: 28,
              brix: 8,
              defectIncidencePercentage: 52,
              qualityGrade: 'poor',
              createdAt: '2026-03-21T12:00:00.000Z',
              updatedAt: '2026-03-21T12:00:00.000Z',
            }]
          default:
            return []
        }
      },
    },
    createMap(zones)
  )

  assert.equal(outcomeSummary.positiveZones, 1)
  assert.equal(outcomeSummary.mixedZones, 1)
  assert.equal(outcomeSummary.negativeZones, 1)
  assert.equal(outcomeSummary.noDataZones, 1)
  assert.equal(outcomeSummary.zoneOutcomes.find((zone) => zone.zoneId === 'zone-outcome-a')?.outcomeStatus, 'positive')
  assert.equal(outcomeSummary.zoneOutcomes.find((zone) => zone.zoneId === 'zone-outcome-c')?.outcomeStatus, 'negative')
  assert.equal(outcomeSummary.zoneOutcomes.find((zone) => zone.zoneId === 'zone-outcome-d')?.outcomeStatus, 'no_data')
})

test('getPrescriptionExecutionEfficacySummary combines adherence and outcome by zone, crop and season', async () => {
  const zones = [
    createZone({ id: 'zone-eff-a', zoneName: 'Zona Efficace' }),
    createZone({ id: 'zone-eff-b', zoneName: 'Zona Media' }),
    createZone({ id: 'zone-eff-c', zoneName: 'Zona Debole' }),
  ]

  const summary = await getPrescriptionExecutionEfficacySummary(
    {
      async getPrescriptionExecutionRecords() {
        return [
          {
            id: 'exec-eff-a',
            prescriptionMapId: 'map-1',
            prescriptionZoneId: 'zone-eff-a',
            applicationDate: '2026-03-21T08:00:00.000Z',
            productName: 'NPK Premium',
            plannedRate: 120,
            actualRate: 120,
            unit: 'kg/ha',
            areaAppliedSqm: 4000,
            executionStatus: 'completed',
            createdAt: '2026-03-21T08:00:00.000Z',
            updatedAt: '2026-03-21T08:00:00.000Z',
          },
          {
            id: 'exec-eff-b',
            prescriptionMapId: 'map-1',
            prescriptionZoneId: 'zone-eff-b',
            applicationDate: '2026-03-21T08:00:00.000Z',
            productName: 'NPK Premium',
            plannedRate: 120,
            actualRate: 95,
            unit: 'kg/ha',
            areaAppliedSqm: 3000,
            executionStatus: 'partial',
            createdAt: '2026-03-21T08:00:00.000Z',
            updatedAt: '2026-03-21T08:00:00.000Z',
          },
          {
            id: 'exec-eff-c',
            prescriptionMapId: 'map-1',
            prescriptionZoneId: 'zone-eff-c',
            applicationDate: '2026-03-21T08:00:00.000Z',
            productName: 'NPK Premium',
            plannedRate: 120,
            actualRate: 70,
            unit: 'kg/ha',
            areaAppliedSqm: 1500,
            executionStatus: 'completed',
            createdAt: '2026-03-21T08:00:00.000Z',
            updatedAt: '2026-03-21T08:00:00.000Z',
          },
        ]
      },
      async getQualityResults(_gardenId: string, filters?: { zoneId?: string }) {
        switch (filters?.zoneId) {
          case 'zone-eff-a':
            return [{
              id: 'quality-eff-a',
              gardenId: 'garden-1',
              cropContextId: 'vineyard',
              scopeType: 'zone',
              zoneId: 'zone-eff-a',
              recordedAt: '2026-03-21T12:00:00.000Z',
              source: 'lab_analysis',
              qualityScore: 90,
              qualityGrade: 'premium',
              createdAt: '2026-03-21T12:00:00.000Z',
              updatedAt: '2026-03-21T12:00:00.000Z',
            }]
          case 'zone-eff-b':
            return [{
              id: 'quality-eff-b',
              gardenId: 'garden-1',
              cropContextId: 'vineyard',
              scopeType: 'zone',
              zoneId: 'zone-eff-b',
              recordedAt: '2026-03-21T12:00:00.000Z',
              source: 'field_measurement',
              qualityScore: 58,
              qualityGrade: 'fair',
              createdAt: '2026-03-21T12:00:00.000Z',
              updatedAt: '2026-03-21T12:00:00.000Z',
            }]
          case 'zone-eff-c':
            return [{
              id: 'quality-eff-c',
              gardenId: 'garden-1',
              cropContextId: 'vineyard',
              scopeType: 'zone',
              zoneId: 'zone-eff-c',
              recordedAt: '2026-03-21T12:00:00.000Z',
              source: 'field_measurement',
              qualityScore: 35,
              qualityGrade: 'poor',
              createdAt: '2026-03-21T12:00:00.000Z',
              updatedAt: '2026-03-21T12:00:00.000Z',
            }]
          default:
            return []
        }
      },
    },
    createMap(zones)
  )

  assert.equal(summary.highZones, 1)
  assert.equal(summary.mediumZones, 1)
  assert.equal(summary.lowZones, 1)
  assert.equal(summary.unknownZones, 0)
  assert.equal(summary.cropContextScores[0]?.key, 'vineyard')
  assert.equal(summary.seasonScores[0]?.label, 'Primavera')
  assert.equal(summary.zoneScores.find((zone) => zone.zoneId === 'zone-eff-a')?.efficacyStatus, 'high')
  assert.equal(summary.zoneScores.find((zone) => zone.zoneId === 'zone-eff-c')?.efficacyStatus, 'low')
})

test('computeMicroclimateEfficacy grades stable and critical post-intervention microclimate snapshots', () => {
  const stableSnapshot: HealthMicroclimateSnapshot = {
    gardenId: 'garden-1',
    readings: {},
    metrics: {},
    fungalPressure: 'low',
    waterStress: 'none',
    heatStress: 'low',
    hasRecentData: true,
    supportingSignals: [],
  }

  const criticalSnapshot: HealthMicroclimateSnapshot = {
    gardenId: 'garden-1',
    readings: {},
    metrics: {},
    fungalPressure: 'medium',
    waterStress: 'high',
    heatStress: 'high',
    hasRecentData: true,
    supportingSignals: [],
  }

  const stable = computeMicroclimateEfficacy(stableSnapshot)
  const critical = computeMicroclimateEfficacy(criticalSnapshot)

  assert.equal(stable.status, 'stable')
  assert.ok((stable.score || 0) > 70)
  assert.equal(critical.status, 'critical')
  assert.ok((critical.score || 0) < 40)
})

test('computeSoilResponseEfficacy grades responsive and poor soil responses after execution', () => {
  const latestExecution: PrescriptionExecutionRecord = {
    id: 'exec-soil',
    prescriptionMapId: 'map-1',
    prescriptionZoneId: 'zone-1',
    applicationDate: '2026-03-21T08:00:00.000Z',
    productName: 'Acqua',
    plannedRate: 100,
    actualRate: 100,
    unit: 'L/ha',
    areaAppliedSqm: 4000,
    executionStatus: 'completed',
    createdAt: '2026-03-21T08:00:00.000Z',
    updatedAt: '2026-03-21T08:00:00.000Z',
  }

  const responsiveSnapshot: HealthMicroclimateSnapshot = {
    gardenId: 'garden-1',
    readings: {
      soilMoisture30cm: { garden_id: 'garden-1', sensor_type: 'soil_moisture_30cm', value: 27, unit: '%', reading_date: '2026-03-21T10:00:00.000Z' },
      soilMoisture60cm: { garden_id: 'garden-1', sensor_type: 'soil_moisture_60cm', value: 28, unit: '%', reading_date: '2026-03-21T10:00:00.000Z' },
      soilTensionKpa: { garden_id: 'garden-1', sensor_type: 'soil_tension_kpa', value: 48, unit: 'kPa', reading_date: '2026-03-21T10:00:00.000Z' },
    },
    metrics: {
      soilMoisture30cm: 27,
      soilMoisture60cm: 28,
      soilTensionKpa: 48,
    },
    fungalPressure: 'low',
    waterStress: 'low',
    heatStress: 'low',
    hasRecentData: true,
    supportingSignals: [],
  }

  const poorSnapshot: HealthMicroclimateSnapshot = {
    gardenId: 'garden-1',
    readings: {
      soilMoisture30cm: { garden_id: 'garden-1', sensor_type: 'soil_moisture_30cm', value: 12, unit: '%', reading_date: '2026-03-21T10:00:00.000Z' },
      soilMoisture60cm: { garden_id: 'garden-1', sensor_type: 'soil_moisture_60cm', value: 11, unit: '%', reading_date: '2026-03-21T10:00:00.000Z' },
      soilTensionKpa: { garden_id: 'garden-1', sensor_type: 'soil_tension_kpa', value: 170, unit: 'kPa', reading_date: '2026-03-21T10:00:00.000Z' },
    },
    metrics: {
      soilMoisture30cm: 12,
      soilMoisture60cm: 11,
      soilTensionKpa: 170,
    },
    fungalPressure: 'low',
    waterStress: 'high',
    heatStress: 'medium',
    hasRecentData: true,
    supportingSignals: [],
  }

  const responsive = computeSoilResponseEfficacy(responsiveSnapshot, latestExecution)
  const poor = computeSoilResponseEfficacy(poorSnapshot, latestExecution)

  assert.equal(responsive.status, 'responsive')
  assert.ok((responsive.score || 0) >= 75)
  assert.equal(poor.status, 'poor')
  assert.ok((poor.score || 0) < 45)
})
