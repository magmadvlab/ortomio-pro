import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const widget = readFileSync(
  new URL('../../components/irrigation/IrrigationZonesWidget.tsx', import.meta.url),
  'utf8'
)

test('irrigation zone widget reads and writes only through the provider', () => {
  assert.match(widget, /storageProvider\.getIrrigationSystems\(garden\.id\)/)
  assert.match(widget, /storageProvider\.getIrrigationZones\(activeSystem\.id, garden\.id\)/)
  assert.match(widget, /storageProvider\.getGardenBeds\(garden\.id\)/)
  assert.match(widget, /storageProvider\.createIrrigationZone/)
  assert.doesNotMatch(widget, /localStorage/)
  assert.doesNotMatch(widget, /beds=\{\[\]\}/)
})
