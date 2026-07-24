import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import {
  getCompostLogs,
  trackCompostProduction,
  type CompostLog,
} from '@/services/compostService'

test('compost production is persisted and read through the canonical provider', async () => {
  const stored: any[] = []
  const provider = {
    async createCompostLog(log: any) {
      const saved = {
        id: 'compost-1',
        ...log,
        created_at: '2026-07-24T07:00:00.000Z',
        updated_at: '2026-07-24T07:00:00.000Z',
      }
      stored.push(saved)
      return saved
    },
    async getCompostLogs(gardenId: string) {
      return stored.filter((log) => log.garden_id === gardenId)
    },
  }
  const input: Omit<CompostLog, 'id' | 'createdAt' | 'updatedAt'> = {
    gardenId: 'garden-1',
    compostType: 'compost',
    startDate: new Date('2026-07-24T06:00:00.000Z'),
    materials: [],
    unit: 'kg',
  }

  const created = await trackCompostProduction('garden-1', input, provider)
  const reloaded = await getCompostLogs('garden-1', provider)

  assert.equal(created.id, 'compost-1')
  assert.equal(reloaded.length, 1)
  assert.equal(reloaded[0]?.gardenId, 'garden-1')
  assert.equal(reloaded[0]?.startDate.toISOString(), '2026-07-24T06:00:00.000Z')
})

test('macerate production requires authenticated durable storage with owner-scoped RLS', () => {
  const service = readFileSync(
    new URL('../../services/maceratesService.ts', import.meta.url),
    'utf8'
  )
  const migration = readFileSync(
    new URL('../../supabase/migrations/20260724070000_create_macerate_logs.sql', import.meta.url),
    'utf8'
  )

  assert.match(service, /\.from\('macerate_logs'\)/)
  assert.match(service, /auth\.getUser\(\)/)
  assert.doesNotMatch(service, /localStorage/)
  assert.match(migration, /ENABLE ROW LEVEL SECURITY/)
  assert.match(migration, /user_id = auth\.uid\(\)/)
  assert.match(migration, /g\.user_id = auth\.uid\(\)/)
})
