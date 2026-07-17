import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { NextRequest } from 'next/server'
import { POST as ndviPost } from '@/app/api/ndvi/sentinel/route'
import { parseLatestSentinelNDVI, validateNDVIBounds } from '@/services/ndviProvenanceService'
import { createPrescriptionMapsService } from '@/services/prescriptionMapsService'

test('Sentinel statistics parser selects latest valid real interval', () => {
  const parsed = parseLatestSentinelNDVI({ data: [
    { interval: { from: '2026-07-01T00:00:00Z', to: '2026-07-06T00:00:00Z' }, outputs: { ndvi: { bands: { B0: { stats: { mean: 0.4, min: 0.2, max: 0.7, stDev: 0.1, sampleCount: 100, noDataCount: 20 } } } } } },
    { interval: { from: '2026-07-06T00:00:00Z', to: '2026-07-11T00:00:00Z' }, outputs: { ndvi: { bands: { B0: { stats: { mean: 0.62, min: 0.3, max: 0.85, stDev: 0.08, sampleCount: 200, noDataCount: 10 } } } } } },
  ] })
  assert.equal(parsed?.stats.mean, 0.62)
  assert.equal(parsed?.validPixelPercent, 95)
  assert.equal(parseLatestSentinelNDVI({ data: [] }), null)
})

test('NDVI bounds reject missing, inverted, out-of-range and oversized areas', () => {
  assert.equal(validateNDVIBounds(null), null)
  assert.equal(validateNDVIBounds({ north: 40, south: 41, east: 12, west: 11 }), null)
  assert.equal(validateNDVIBounds({ north: 92, south: 41, east: 12, west: 11 }), null)
  assert.equal(validateNDVIBounds({ north: 42, south: 40, east: 12, west: 11 }), null)
  assert.deepEqual(validateNDVIBounds({ north: 42, south: 41.9, east: 12.6, west: 12.5 }), { north: 42, south: 41.9, east: 12.6, west: 12.5 })
})

test('anonymous NDVI requests are rejected before provider access', async () => {
  const response = await ndviPost(new NextRequest(new Request('http://localhost/api/ndvi/sentinel', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ gardenId: 'garden-a', bbox: { north: 42, south: 41.9, east: 12.6, west: 12.5 } }),
  })))
  assert.equal(response.status, 401)
})

test('remote data paths contain no random or connected-but-simulated NDVI', () => {
  const route = readFileSync('app/api/ndvi/sentinel/route.ts', 'utf8')
  const service = readFileSync('services/ndviSatelliteService.ts', 'utf8')
  assert.doesNotMatch(route + service, /Math\.random|sentinel-hub-connected|simulated_fallback/)
  assert.match(route, /sourceKind: 'real'/)
  assert.match(route, /ndvi_data_cache/)
})

test('prescription generation fails closed without real data or garden geometry', async () => {
  const service = createPrescriptionMapsService({ getGarden: async () => ({ id: 'garden-a' }) })
  const result = await service.generatePrescriptionMap({
    gardenId: 'garden-a', mapType: 'irrigation', name: 'Test',
    dataSources: { ndviWeight: 1, plantHealthWeight: 0, soilWeight: 0, historicalWeight: 0 },
    zoneConfig: { minZoneSize: 100, maxZones: 4, similarityThreshold: 0.5, smoothingFactor: 0 },
    prescriptionConfig: { baseRate: 10, unit: 'L/ha', variableRateEnabled: true, maxVariation: 20 },
    exportFormats: ['geojson'], analysisPeriod: { startDate: '2026-07-01', endDate: '2026-07-17' },
  })
  assert.equal(result.success, false)
  assert.match(result.errors?.[0] || '', /coordinate|geometria/i)
})

test('drone and blockchain mutation routes are explicitly isolated as simulation/lab', () => {
  const drone = readFileSync('app/api/drone/execute/route.ts', 'utf8')
  const blockchain = readFileSync('app/api/blockchain/record/route.ts', 'utf8')
  const nft = readFileSync('app/api/blockchain/nft/route.ts', 'utf8')
  assert.match(drone, /mode !== 'simulation'/)
  assert.match(drone, /operationalLedgerEligible: false/)
  assert.match(blockchain, /blockchain_lab_only/)
  assert.match(nft, /nft_lab_only/)
  assert.doesNotMatch(blockchain + nft, /recordSeedPlanting|generateNFTCertificate/)
})

test('P6 migration provides provenance and atomic map-zone persistence', () => {
  const sql = readFileSync('supabase/migrations/20260717040000_p6_remote_data_provenance.sql', 'utf8')
  assert.match(sql, /source_kind.*real.*estimated.*simulated.*fallback/s)
  assert.match(sql, /algorithm_metadata/)
  assert.match(sql, /content_checksum/)
  assert.match(sql, /create_prescription_map_atomic/)
  assert.match(sql, /jsonb_array_elements\(p_zones\)/)
})
