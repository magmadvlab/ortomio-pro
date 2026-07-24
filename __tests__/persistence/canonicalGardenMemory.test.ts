import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = (path: string) => readFileSync(path, 'utf8')

test('legacy garden memory persists snapshots in the canonical cloud ledger', () => {
  const memoryService = source('services/gardenMemoryService.ts')

  assert.doesNotMatch(memoryService, /localStorage/)
  assert.match(memoryService, /\.from\('agronomic_memory_events'\)/)
  assert.match(memoryService, /Cloud agronomic memory unavailable/)
  assert.match(memoryService, /source_service:\s*'gardenMemoryService'/)
})

test('consumer dashboard uses garden coordinates without a fabricated default', () => {
  const dashboard = source('components/consumer/Dashboard.tsx')

  assert.doesNotMatch(dashboard, /DEFAULT_COORDS|40\.5|16\.5/)
  assert.match(dashboard, /activeGarden\.coordinates/)
  assert.match(dashboard, /Dati meteo non disponibili/)
})

test('seed inventory has no synchronous authoritative cache', () => {
  const service = source('services/seedInventoryService.ts')

  assert.doesNotMatch(service, /seedPacketCache|getSeedPacketCache|setSeedPacketCache/)
  assert.match(service, /export const getSeedPackets = .*Promise<SeedPacket\[\]>/s)
  assert.match(service, /export const findSeedsForPlant = async/)
})
