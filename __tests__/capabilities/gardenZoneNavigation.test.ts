import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const zonesPage = readFileSync(
  new URL('../../app/app/garden/zones/page.tsx', import.meta.url),
  'utf8'
)
const zoneService = readFileSync(
  new URL('../../services/landZoneService.ts', import.meta.url),
  'utf8'
)

test('zone history action reads persisted soil memory and renders explicit states', () => {
  assert.match(zonesPage, /setZoneHistory\(await getZoneHistory\(zoneId\)\)/)
  assert.match(zonesPage, /onClick=\{\(\) => void handleOpenHistory\(zone\.id\)\}/)
  assert.match(zonesPage, /Nessuna coltura registrata/)
  assert.match(zonesPage, /Impossibile caricare lo storico della zona/)
  assert.match(zoneService, /\.rpc\('get_zone_history'/)
  assert.match(zoneService, /Error fetching zone history:[\s\S]*throw error/)
  assert.doesNotMatch(zonesPage, /onClick=\{\(\) => setSelectedZoneForHistory\(zone\.id\)\}/)
})
