import test from 'node:test'
import assert from 'node:assert/strict'

import { PrescriptionMapsService } from '@/services/prescriptionMapsService'
import type { PrescriptionMap } from '@/types/prescriptionMaps'

const createStoredMap = (
  overrides: Partial<PrescriptionMap> = {}
): PrescriptionMap => ({
  id: overrides.id ?? crypto.randomUUID(),
  gardenId: 'garden-1',
  gardenName: 'Vigneto Collina',
  name: overrides.name ?? 'Mappa N concimazione',
  description: overrides.description,
  mapType: overrides.mapType ?? 'fertilizer',
  generationDate: overrides.generationDate ?? '2026-03-21T09:00:00.000Z',
  dataSourcePeriod: overrides.dataSourcePeriod ?? {
    startDate: '2026-03-01',
    endDate: '2026-03-20',
  },
  dataSources: overrides.dataSources ?? {
    ndviData: true,
    plantLevelData: true,
    rowLevelData: false,
    soilData: true,
    weatherData: false,
  },
  zones: overrides.zones ?? [],
  totalZones: overrides.totalZones ?? 3,
  totalAreaSqm: overrides.totalAreaSqm ?? 12000,
  exportFormats: overrides.exportFormats ?? {
    shapefile: true,
    kml: true,
    isoxml: false,
    geojson: true,
    csv: true,
  },
  areaHectares: overrides.areaHectares ?? 1.2,
  zonesCount: overrides.zonesCount ?? 3,
  applicationRate: overrides.applicationRate ?? { min: 80, max: 125, unit: 'kg/ha' },
  costSavings: overrides.costSavings ?? 240,
  inputReduction: overrides.inputReduction ?? 16,
  status: overrides.status ?? 'completed',
  validationStatus: overrides.validationStatus ?? 'valid',
  qualityScore: overrides.qualityScore ?? 88,
  dataCompleteness: overrides.dataCompleteness ?? 91,
  validationErrors: overrides.validationErrors,
  costAnalysis: overrides.costAnalysis,
  createdAt: overrides.createdAt ?? '2026-03-21T09:00:00.000Z',
  updatedAt: overrides.updatedAt ?? '2026-03-21T09:00:00.000Z',
  createdBy: overrides.createdBy,
})

test('getPrescriptionMaps returns storage-backed maps instead of placeholders', async () => {
  const service = new PrescriptionMapsService({
    async getPrescriptionMaps(gardenId: string) {
      assert.equal(gardenId, 'garden-1')
      return [createStoredMap()]
    },
  })

  const maps = await service.getPrescriptionMaps('garden-1')
  assert.equal(maps.length, 1)
  assert.equal(maps[0].name, 'Mappa N concimazione')
})

test('getPrescriptionMapStats aggregates real stored map metrics', async () => {
  const service = new PrescriptionMapsService({
    async getPrescriptionMaps() {
      return [
        createStoredMap({
          generationDate: '2026-03-20T09:00:00.000Z',
          totalZones: 4,
          areaHectares: 1.4,
          qualityScore: 90,
          dataCompleteness: 94,
          costSavings: 300,
          inputReduction: 18,
          costAnalysis: { roi: 160 } as any,
        }),
        createStoredMap({
          generationDate: '2026-03-10T09:00:00.000Z',
          totalZones: 2,
          areaHectares: 0.8,
          qualityScore: 80,
          dataCompleteness: 88,
          costSavings: 120,
          inputReduction: 10,
          mapType: 'irrigation',
          costAnalysis: { roi: 120 } as any,
        }),
      ]
    },
  })

  const stats = await service.getPrescriptionMapStats('garden-1')

  assert.equal(stats.totalMapsGenerated, 2)
  assert.equal(stats.totalAreaCovered, 2.2)
  assert.equal(stats.averageZonesPerMap, 3)
  assert.equal(stats.averageQualityScore, 85)
  assert.equal(stats.averageDataCompleteness, 91)
  assert.equal(stats.totalCostSavings, 420)
  assert.equal(stats.averageRoi, 140)
  assert.equal(stats.popularMapTypes.fertilizer, 1)
  assert.equal(stats.popularMapTypes.irrigation, 1)
})
