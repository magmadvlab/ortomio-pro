import test from 'node:test'
import assert from 'node:assert/strict'
import { NextRequest } from 'next/server'

import { AccessError } from '@/lib/auth.server'
import { validateLandZoneInput } from '@/lib/land-zones'
import {
  handleCreateLandZone,
  handleGetLandZones,
} from '@/app/api/garden/zones/route'

const request = (path: string, init?: RequestInit) =>
  new NextRequest(new Request(`http://localhost${path}`, init))

test('rectangle validation derives the authoritative area', () => {
  const zone = validateLandZoneInput({
    zoneName: ' Campo nord ',
    shapeType: 'rectangle',
    lengthMeters: 50,
    widthMeters: 20,
    currentStatus: 'active',
  })

  assert.equal(zone.zone_name, 'Campo nord')
  assert.equal(zone.area_hectares, 0.1)
  assert.equal(zone.length_meters, 50)
  assert.equal(zone.width_meters, 20)
})

test('zone validation rejects missing dimensions and non-positive areas', () => {
  assert.throws(
    () => validateLandZoneInput({ zoneName: 'A', shapeType: 'rectangle', lengthMeters: 10 }),
    /rectangle_dimensions_required/,
  )
  assert.throws(
    () => validateLandZoneInput({ zoneName: 'A', shapeType: 'custom', areaSquareMeters: 0 }),
    /area_required/,
  )
})

test('cross-garden reads and writes are hidden before querying land zones', async () => {
  let databaseTouched = false
  const dependencies = {
    requireGardenAccessFn: async () => {
      throw new AccessError('not_found', 404)
    },
    getSupabaseClientFn: () => {
      databaseTouched = true
      return {} as never
    },
  }

  const readResponse = await handleGetLandZones(
    request('/api/garden/zones?garden_id=other-garden'),
    dependencies,
  )
  assert.equal(readResponse.status, 404)

  const writeResponse = await handleCreateLandZone(
    request('/api/garden/zones', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        gardenId: 'other-garden',
        zone: { zoneName: 'Zona est', shapeType: 'custom', areaSquareMeters: 500 },
      }),
    }),
    dependencies,
  )
  assert.equal(writeResponse.status, 404)
  assert.equal(databaseTouched, false)
})

test('authorized creation derives user and garden server-side', async () => {
  let inserted: Record<string, unknown> | null = null
  const createdZone = { id: 'zone-1', zone_name: 'Zona est' }
  const supabase = {
    from: (table: string) => {
      assert.equal(table, 'land_zones')
      return {
        insert: (value: Record<string, unknown>) => {
          inserted = value
          return {
            select: () => ({
              single: async () => ({ data: createdZone, error: null }),
            }),
          }
        },
      }
    },
  }

  const response = await handleCreateLandZone(
    request('/api/garden/zones', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        gardenId: 'garden-1',
        zone: {
          zoneName: 'Zona est',
          shapeType: 'custom',
          areaSquareMeters: 500,
          userId: 'attacker-controlled',
        },
      }),
    }),
    {
      requireGardenAccessFn: async () => ({
        user: { id: 'user-1' },
        garden: { id: 'garden-1' },
      }) as never,
      getSupabaseClientFn: () => supabase as never,
    },
  )

  assert.equal(response.status, 201)
  assert.deepEqual(await response.json(), { zone: createdZone })
  assert.ok(inserted)
  assert.equal(inserted!.garden_id, 'garden-1')
  assert.equal(inserted!.user_id, 'user-1')
  assert.equal(inserted!.area_hectares, 0.05)
  assert.equal('userId' in inserted!, false)
})

test('authorized zones can be re-read only through their garden scope', async () => {
  const zones = [{ id: 'zone-1', garden_id: 'garden-1', zone_name: 'Zona est' }]
  let filteredGarden = ''
  const supabase = {
    from: () => ({
      select: () => ({
        eq: (_column: string, value: string) => {
          filteredGarden = value
          return {
            order: async () => ({ data: zones, error: null }),
          }
        },
      }),
    }),
  }

  const response = await handleGetLandZones(
    request('/api/garden/zones?garden_id=garden-1'),
    {
      requireGardenAccessFn: async () => ({
        user: { id: 'user-1' },
        garden: { id: 'garden-1' },
      }) as never,
      getSupabaseClientFn: () => supabase as never,
    },
  )

  assert.equal(response.status, 200)
  assert.equal(filteredGarden, 'garden-1')
  assert.deepEqual(await response.json(), { zones })
})
