import test from 'node:test'
import assert from 'node:assert/strict'
import { read } from 'shapefile'
import JSZip from 'jszip'
import { encodePrescriptionShapefile, parseUtmZone, projectionWkt, transformPrescriptionZones } from '@/lib/prescription/geoEncoding'
import { GeoExportService } from '@/services/geoExportService'
import { ZoneManagementService } from '@/services/zoneManagementService'
import type { ExportConfiguration, PrescriptionMap, PrescriptionZone } from '@/types/prescriptionMaps'

const zone: PrescriptionZone = {
  id: 'zone-1', prescriptionMapId: 'map-1', zoneNumber: 1, zoneName: 'Vigneto qualità è', zoneType: 'uniform',
  geometry: { type: 'Polygon', coordinates: [
    [[15, 0], [15.01, 0], [15.01, 0.01], [15, 0.01], [15, 0]],
    [[15.002, 0.002], [15.004, 0.002], [15.004, 0.004], [15.002, 0.004], [15.002, 0.002]],
  ] },
  centroid: { latitude: 0.005, longitude: 15.005 }, areaSqm: 1000,
  prescription: { applicationRate: 12.5, unit: 'kg/ha', applicationMethod: 'broadcast' },
  sourceData: {}, dataQuality: 65, confidence: 70, createdAt: '2026-11-18', updatedAt: '2026-11-18',
}
const config: ExportConfiguration = { format: 'shapefile', coordinateSystem: 'WGS84', compression: true, includeMetadata: true, includePreview: false }
const map = { id: 'map-1', gardenId: 'garden-1', name: 'Vigneto', zones: [zone], totalAreaSqm: 1000,
  algorithmMetadata: { algorithmVersion: 'fixture-v1', inputHash: 'fixture-input', sourceQuality: 'measured' }, contentChecksum: 'fixture-checksum' } as PrescriptionMap

test('UTM transforms coordinates and sets the southern false northing instead of relabeling degrees', () => {
  const north = transformPrescriptionZones([zone], { ...config, coordinateSystem: 'UTM', utmZone: '33N' })[0]
  assert.ok(Math.abs(north.geometry.coordinates[0][0][0] - 500000) < 0.001)
  assert.ok(Math.abs(north.geometry.coordinates[0][0][1]) < 0.001)
  const southernZone = { ...zone, geometry: { type: 'Polygon' as const, coordinates: zone.geometry.coordinates.map(r => r.map(([x,y]) => [x,-y])) } }
  const south = transformPrescriptionZones([southernZone], { ...config, coordinateSystem: 'UTM', utmZone: '33S' })[0]
  assert.ok(Math.abs(south.geometry.coordinates[0][0][1] - 10000000) < 0.001)
  assert.match(projectionWkt({ ...config, coordinateSystem: 'UTM', utmZone: '33S' }), /false_northing",10000000/)
  assert.equal(zone.geometry.coordinates[0][0][0], 15)
  assert.throws(() => parseUtmZone('0N')); assert.throws(() => parseUtmZone('61S'))
  assert.throws(() => transformPrescriptionZones([zone], { ...config, format: 'geojson', coordinateSystem: 'UTM', utmZone: '33N' }))
})

test('independent Shapefile reader preserves polygon holes, UTF-8 attributes and rates', async () => {
  const encoded = await encodePrescriptionShapefile(transformPrescriptionZones([zone], config), config)
  const decoded = await read(encoded.shp, encoded.dbf, { encoding: 'utf-8' })
  assert.equal(decoded.features.length, 1)
  assert.equal(decoded.features[0].properties?.zone_name, zone.zoneName)
  assert.equal(decoded.features[0].properties?.rate, 12.5)
  const geometry = decoded.features[0].geometry
  assert.equal(geometry.type, 'Polygon')
  if (geometry.type === 'Polygon') assert.equal(geometry.coordinates.length, 2)
  assert.equal(new DataView(encoded.shx).getInt32(0), 9994)
  assert.equal(encoded.cpg, 'UTF-8')
  await assert.rejects(encodePrescriptionShapefile([], config))
  await assert.rejects(encodePrescriptionShapefile([zone], { ...config, shapefileOptions: { includeDbf: true, encoding: 'ASCII' } }))
})

test('export creates a readable complete ZIP and GeoJSON stays WGS84 without a false CRS', async () => {
  const exporter = new GeoExportService({})
  const shape = await exporter.exportPrescriptionMap(map, config)
  assert.equal(shape.success, true, shape.errors?.join(', '))
  const archive = await JSZip.loadAsync(await (await fetch(shape.downloadUrl!)).arrayBuffer())
  for (const extension of ['shp', 'shx', 'dbf', 'prj', 'cpg']) assert.ok(archive.file(`Vigneto.${extension}`))
  const geo = await exporter.exportPrescriptionMap(map, { ...config, format: 'geojson' })
  assert.equal(geo.success, true, geo.errors?.join(', '))
  const json = await (await fetch(geo.downloadUrl!)).json()
  assert.equal(json.crs, undefined)
  assert.deepEqual(json.features[0].geometry.coordinates, zone.geometry.coordinates)
  URL.revokeObjectURL(shape.downloadUrl!); URL.revokeObjectURL(geo.downloadUrl!)
})

test('zone analysis reads the persisted prescription map and fails explicitly for wrong scope', async () => {
  const service = new ZoneManagementService({ getPrescriptionMap: async () => map })
  const analysis = await service.analyzeZone(zone.id, map.id, map.gardenId)
  assert.equal(analysis.statistics.area, 1000)
  assert.equal(analysis.statistics.fieldCount, null)
  await assert.rejects(service.analyzeZone(zone.id, map.id, 'another-garden'))
  await assert.rejects(service.analyzeZone('missing-zone', map.id, map.gardenId))
})
