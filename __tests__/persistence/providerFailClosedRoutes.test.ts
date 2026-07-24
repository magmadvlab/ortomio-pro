import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = (path: string) => readFileSync(path, 'utf8')

test('operational write routes never simulate persistence success', () => {
  const routes = [
    source('app/api/treatments/route.ts'),
    source('app/api/mechanical-work/route.ts'),
    source('app/api/support/submit/route.ts'),
  ].join('\n')

  assert.doesNotMatch(routes, /simula successo|localStorage|Support Request:/)
  assert.match(routes, /cloud_storage_unavailable/)
  assert.match(routes, /status:\s*503/)
})

test('sun exposure routes never substitute a default garden or anonymous mock', () => {
  const routes = [
    source('app/api/garden/sun-exposure/route.ts'),
    source('app/api/garden/sun-exposure/seasonal-windows/route.ts'),
    source('app/api/garden/sun-exposure/plant-suggestions/route.ts'),
    source('app/api/garden/sun-exposure/planting-windows/route.ts'),
  ].join('\n')

  assert.doesNotMatch(routes, /mockLat|mockLng|mockObstacles|suggerimenti mock/)
  assert.match(routes, /cloud_storage_unavailable/)
  assert.match(routes, /status:\s*503/)
})
