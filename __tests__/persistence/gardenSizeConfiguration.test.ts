import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const sizeStep = readFileSync(
  new URL('../../components/gardens/SizeConfigurationStep.tsx', import.meta.url),
  'utf8'
)
const aquaponicForm = readFileSync(
  new URL('../../components/gardens/AquaponicConfigForm.tsx', import.meta.url),
  'utf8'
)
const aeroponicForm = readFileSync(
  new URL('../../components/gardens/AeroponicConfigForm.tsx', import.meta.url),
  'utf8'
)

test('controlled-environment footprints contribute measured area', () => {
  assert.match(aquaponicForm, /footprintAreaSqMeters: parseFloat\(footprintAreaSqMeters\)/)
  assert.match(aeroponicForm, /footprintAreaSqMeters: parseFloat\(footprintAreaSqMeters\)/)
  assert.match(sizeStep, /aquaponicConfig\?\.footprintAreaSqMeters/)
  assert.match(sizeStep, /aeroponicConfig\?\.footprintAreaSqMeters/)
  assert.doesNotMatch(sizeStep, /Per ora lasciamo 0/)
})
