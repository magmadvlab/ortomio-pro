import test from 'node:test'
import assert from 'node:assert/strict'

import { PrescriptionMapsService } from '@/services/prescriptionMapsService'
import type {
  PrescriptionExecutionRecord,
  PrescriptionMap,
  PrescriptionMapExportRecord,
} from '@/types/prescriptionMaps'

const baseMap: PrescriptionMap = {
  id: 'map-1',
  gardenId: 'garden-1',
  gardenName: 'Vigneto Test',
  name: 'Mappa Trattamento',
  mapType: 'treatment',
  generationDate: '2026-03-21T10:00:00.000Z',
  dataSourcePeriod: { startDate: '2026-03-01', endDate: '2026-03-20' },
  dataSources: {
    ndviData: true,
    plantLevelData: true,
    rowLevelData: false,
    soilData: true,
    weatherData: true,
  },
  zones: [
    {
      id: 'zone-1',
      prescriptionMapId: 'map-1',
      zoneNumber: 1,
      zoneName: 'Zona A',
      zoneType: 'variable',
      geometry: { type: 'Polygon', coordinates: [] },
      centroid: { latitude: 41.1, longitude: 14.1 },
      areaSqm: 5000,
      prescription: {
        applicationRate: 100,
        unit: 'L/ha',
        applicationMethod: 'variable_rate',
      },
      sourceData: {},
      dataQuality: 86,
      confidence: 84,
      createdAt: '2026-03-21T10:00:00.000Z',
      updatedAt: '2026-03-21T10:00:00.000Z',
    },
  ],
  totalZones: 1,
  totalAreaSqm: 5000,
  exportFormats: { shapefile: true, kml: true, isoxml: true, geojson: true, csv: true },
  areaHectares: 0.5,
  zonesCount: 1,
  applicationRate: { min: 100, max: 100, unit: 'L/ha' },
  costSavings: 120,
  inputReduction: 8,
  status: 'completed',
  versionNumber: 1,
  versionLabel: 'v1',
  rootVersionId: 'map-1',
  exportCount: 1,
  validationStatus: 'valid',
  qualityScore: 88,
  dataCompleteness: 90,
  createdAt: '2026-03-21T10:00:00.000Z',
  updatedAt: '2026-03-21T10:00:00.000Z',
}

test('createPrescriptionMapRevision increments operational version metadata', async () => {
  const storageProvider = {
    getPrescriptionMap: async () => baseMap,
    createPrescriptionMap: async (map: Omit<PrescriptionMap, 'id' | 'createdAt' | 'updatedAt'>) => ({
      ...map,
      id: 'map-2',
      createdAt: '2026-03-21T11:00:00.000Z',
      updatedAt: '2026-03-21T11:00:00.000Z',
      zones: map.zones.map((zone, index) => ({
        ...zone,
        id: zone.id || `zone-${index + 1}`,
        prescriptionMapId: 'map-2',
      })),
    }),
  }

  const service = new PrescriptionMapsService(storageProvider)
  const revision = await service.createPrescriptionMapRevision(baseMap.id)

  assert.equal(revision.id, 'map-2')
  assert.equal(revision.versionNumber, 2)
  assert.equal(revision.versionLabel, 'v2')
  assert.equal(revision.rootVersionId, 'map-1')
  assert.equal(revision.parentVersionId, 'map-1')
  assert.equal(revision.name.endsWith('v2'), true)
})

test('field ops summary and recordZoneExecution link execution to export trace', async () => {
  const exportRecord: PrescriptionMapExportRecord = {
    id: 'export-1',
    prescriptionMapId: 'map-1',
    gardenId: 'garden-1',
    versionNumber: 1,
    format: 'isoxml',
    coordinateSystem: 'WGS84',
    compression: true,
    includeMetadata: true,
    includePreview: false,
    fileName: 'map.zip',
    status: 'downloaded',
    exportedAt: '2026-03-21T10:30:00.000Z',
    downloadedAt: '2026-03-21T10:31:00.000Z',
    createdAt: '2026-03-21T10:30:00.000Z',
    updatedAt: '2026-03-21T10:31:00.000Z',
  }

  const executionRecord: PrescriptionExecutionRecord = {
    id: 'exec-1',
    prescriptionMapId: 'map-1',
    prescriptionZoneId: 'zone-1',
    applicationDate: '2026-03-21T11:00:00.000Z',
    productName: 'Prodotto Test',
    plannedRate: 100,
    actualRate: 100,
    unit: 'L/ha',
    executionStatus: 'completed',
    sourceOperationType: 'export',
    sourceOperationId: 'export-1',
    prescriptionExportId: 'export-1',
    createdAt: '2026-03-21T11:00:00.000Z',
    updatedAt: '2026-03-21T11:00:00.000Z',
  }

  let updatedMapId: string | null = null
  let updatedExportId: string | null = null

  const storageProvider = {
    getPrescriptionMapExportRecords: async () => [exportRecord],
    getPrescriptionExecutionRecords: async () => [executionRecord],
    createPrescriptionExecutionRecord: async (record: Omit<PrescriptionExecutionRecord, 'id' | 'createdAt' | 'updatedAt'>) => ({
      ...record,
      id: 'exec-2',
      createdAt: '2026-03-21T12:00:00.000Z',
      updatedAt: '2026-03-21T12:00:00.000Z',
    }),
    updatePrescriptionMap: async (id: string, updates: Partial<PrescriptionMap>) => {
      updatedMapId = id
      return { ...baseMap, ...updates }
    },
    updatePrescriptionMapExportRecord: async (id: string, updates: Partial<PrescriptionMapExportRecord>) => {
      updatedExportId = id
      return { ...exportRecord, ...updates }
    },
  }

  const service = new PrescriptionMapsService(storageProvider)
  const summary = await service.getPrescriptionMapFieldOpsSummary(baseMap)

  assert.equal(summary.totalExports, 1)
  assert.equal(summary.downloadedExports, 1)
  assert.equal(summary.linkedExecutions, 1)
  assert.equal(summary.latestExport?.id, 'export-1')

  const created = await service.recordZoneExecution(baseMap, baseMap.zones[0]!, {
    executionStatus: 'completed',
    sourceOperationType: 'export',
    sourceOperationId: 'export-1',
    prescriptionExportId: 'export-1',
  })

  assert.equal(created.prescriptionExportId, 'export-1')
  assert.equal(updatedMapId, 'map-1')
  assert.equal(updatedExportId, 'export-1')
})
