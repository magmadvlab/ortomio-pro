import test from 'node:test'
import assert from 'node:assert/strict'
import { NextRequest } from 'next/server'

import { AccessError } from '@/lib/auth.server'
import { SeedInventoryService } from '@/services/seedInventoryService'
import {
  handleGetSoilState,
  handleUpdateSoilState,
} from '@/app/api/garden/soil-state/route'

const request = (path: string, init?: RequestInit) =>
  new NextRequest(new Request(`http://localhost${path}`, init))

const seedClient = (result: { data: unknown[] | null; error: unknown }) => ({
  from: (table: string) => {
    assert.equal(table, 'seed_inventory')
    return {
      select: () => ({
        eq: () => ({
          order: async () => result,
        }),
      }),
    }
  },
})

test('empty seed inventory remains empty and is never replaced with demo packets', async () => {
  const service = new SeedInventoryService(() => seedClient({ data: [], error: null }) as never)
  assert.deepEqual(await service.getSeedPackets('garden-1'), [])
})

test('seed provider errors remain distinguishable from an empty inventory', async () => {
  const providerError = new Error('database unavailable')
  const service = new SeedInventoryService(() => seedClient({ data: null, error: providerError }) as never)
  await assert.rejects(() => service.getSeedPackets('garden-1'), providerError)
})

test('cross-garden soil reads and writes stop before database access', async () => {
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

  const read = await handleGetSoilState(
    request('/api/garden/soil-state?garden_id=other&zone_id=zone-1'),
    dependencies,
  )
  assert.equal(read.status, 404)

  const write = await handleUpdateSoilState(
    request('/api/garden/soil-state', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        gardenId: 'other',
        zoneId: 'zone-1',
        state: { compaction: 0.5, drainage: 'good', workableDepth: 30 },
      }),
    }),
    dependencies,
  )
  assert.equal(write.status, 404)
  assert.equal(databaseTouched, false)
})

test('soil state rejects physically invalid measurements', async () => {
  const response = await handleUpdateSoilState(
    request('/api/garden/soil-state', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        gardenId: 'garden-1',
        zoneId: 'zone-1',
        state: { compaction: 2 },
      }),
    }),
  )
  assert.equal(response.status, 400)
  assert.deepEqual(await response.json(), { error: 'invalid_compaction' })
})
