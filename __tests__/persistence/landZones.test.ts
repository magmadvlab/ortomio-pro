import test from 'node:test'
import assert from 'node:assert/strict'
import { NextRequest } from 'next/server'

import { AccessError } from '@/lib/auth.server'
import { validateLandZoneInput } from '@/lib/land-zones'
import {
  handleCreateLandZone,
  handleDeleteLandZone,
  handleGetLandZones,
  handleUpdateLandZone,
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

test('update and delete are hidden before touching the database when garden access is denied', async () => {
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

  const updateResponse = await handleUpdateLandZone(
    request('/api/garden/zones', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        gardenId: 'other-garden',
        zoneId: 'zone-1',
        updates: { current_status: 'resting' },
      }),
    }),
    dependencies,
  )
  assert.equal(updateResponse.status, 404)

  const deleteResponse = await handleDeleteLandZone(
    request('/api/garden/zones', {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ gardenId: 'other-garden', zoneId: 'zone-1' }),
    }),
    dependencies,
  )
  assert.equal(deleteResponse.status, 404)
  assert.equal(databaseTouched, false)
})

test('update rejects a zone that does not belong to the authorized garden', async () => {
  const supabase = {
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: null, error: null }),
          }),
        }),
      }),
    }),
  }

  const response = await handleUpdateLandZone(
    request('/api/garden/zones', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        gardenId: 'garden-1',
        zoneId: 'zone-from-another-garden',
        updates: { current_status: 'resting' },
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

  assert.equal(response.status, 404)
})

test('update only writes whitelisted fields scoped to the owned zone and garden', async () => {
  const updatedZone = { id: 'zone-1', garden_id: 'garden-1', current_status: 'resting' }
  let ownershipChecked = false
  let updatePayload: Record<string, unknown> | null = null
  let filteredZoneId = ''
  let filteredGardenId = ''
  const supabase = {
    from: (table: string) => {
      assert.equal(table, 'land_zones')
      return {
        select: () => ({
          eq: (column: string, value: string) => {
            assert.equal(column, 'id')
            assert.equal(value, 'zone-1')
            return {
              eq: (gardenColumn: string, gardenValue: string) => {
                assert.equal(gardenColumn, 'garden_id')
                assert.equal(gardenValue, 'garden-1')
                ownershipChecked = true
                return { maybeSingle: async () => ({ data: { id: 'zone-1' }, error: null }) }
              },
            }
          },
        }),
        update: (value: Record<string, unknown>) => {
          updatePayload = value
          const chain = {
            eq: (column: string, eqValue: string) => {
              if (column === 'id') filteredZoneId = eqValue
              if (column === 'garden_id') filteredGardenId = eqValue
              return chain
            },
            select: () => ({ single: async () => ({ data: updatedZone, error: null }) }),
          }
          return chain
        },
      }
    },
  }

  const response = await handleUpdateLandZone(
    request('/api/garden/zones', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        gardenId: 'garden-1',
        zoneId: 'zone-1',
        updates: { current_status: 'resting', garden_id: 'attacker-garden', user_id: 'attacker' },
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

  assert.equal(response.status, 200)
  assert.equal(ownershipChecked, true)
  assert.deepEqual(updatePayload, { current_status: 'resting' })
  assert.equal(filteredZoneId, 'zone-1')
  assert.equal(filteredGardenId, 'garden-1')
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
