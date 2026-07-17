import test from 'node:test'
import assert from 'node:assert/strict'

import { GeoExportService } from '@/services/geoExportService'
import type { ExportConfiguration, PrescriptionMap, PrescriptionMapExportRecord } from '@/types/prescriptionMaps'

const prescriptionMap: PrescriptionMap = {
  id: 'map-geo-1',
  gardenId: 'garden-1',
  gardenName: 'Frutteto Demo',
  name: 'Mappa Export Test',
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
      id: 'zone-export-1',
      prescriptionMapId: 'map-geo-1',
      zoneNumber: 1,
      zoneName: 'Zona Export',
      zoneType: 'variable',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [14.1, 41.1],
          [14.2, 41.1],
          [14.2, 41.2],
          [14.1, 41.2],
          [14.1, 41.1],
        ]],
      },
      centroid: { latitude: 41.15, longitude: 14.15 },
      areaSqm: 4000,
      prescription: {
        applicationRate: 95,
        unit: 'L/ha',
        applicationMethod: 'variable_rate',
      },
      sourceData: {},
      dataQuality: 85,
      confidence: 83,
      createdAt: '2026-03-21T10:00:00.000Z',
      updatedAt: '2026-03-21T10:00:00.000Z',
    },
  ],
  totalZones: 1,
  totalAreaSqm: 4000,
  exportFormats: { shapefile: true, kml: true, isoxml: true, geojson: true, csv: true },
  areaHectares: 0.4,
  zonesCount: 1,
  applicationRate: { min: 95, max: 95, unit: 'L/ha' },
  costSavings: 90,
  inputReduction: 7,
  status: 'completed',
  versionNumber: 2,
  versionLabel: 'v2',
  algorithmMetadata: {
    algorithmVersion: 'prescription-fusion-kmeans-v2',
    inputHash: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    sourceQuality: 'measured',
    generatedFrom: ['ndvi'],
  },
  contentChecksum: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  validationStatus: 'valid',
  qualityScore: 87,
  dataCompleteness: 89,
  createdAt: '2026-03-21T10:00:00.000Z',
  updatedAt: '2026-03-21T10:00:00.000Z',
}

test('GeoExportService logs tracked export records and returns exportRecordId', async () => {
  let savedExport: Omit<PrescriptionMapExportRecord, 'id' | 'createdAt' | 'updatedAt'> | null = null
  let updatedMapId: string | null = null

  const storageProvider = {
    createPrescriptionMapExportRecord: async (
      record: Omit<PrescriptionMapExportRecord, 'id' | 'createdAt' | 'updatedAt'>
    ) => {
      savedExport = record
      return {
        ...record,
        id: 'export-rec-1',
        createdAt: record.exportedAt,
        updatedAt: record.exportedAt,
      }
    },
    updatePrescriptionMap: async (id: string, updates: Partial<PrescriptionMap>) => {
      updatedMapId = id
      return { ...prescriptionMap, ...updates }
    },
  }

  const service = new GeoExportService(storageProvider)
  const config: ExportConfiguration = {
    format: 'geojson',
    coordinateSystem: 'WGS84',
    compression: false,
    includeMetadata: true,
    includePreview: false,
    machineryBrand: 'John Deere',
    machineryModel: '8R',
  }

  const result = await service.exportPrescriptionMap(prescriptionMap, config)

  assert.equal(result.success, true)
  assert.equal(result.exportRecordId, 'export-rec-1')
  assert.equal(savedExport?.prescriptionMapId, 'map-geo-1')
  assert.equal(savedExport?.format, 'geojson')
  assert.equal(savedExport?.machineryBrand, 'John Deere')
  assert.equal(savedExport?.metadata?.contentChecksum, prescriptionMap.contentChecksum)
  assert.equal(updatedMapId, 'map-geo-1')
})
