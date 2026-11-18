import test from 'node:test'
import assert from 'node:assert/strict'
import { gardenManagementHref, resolveGardenSelection } from '@/lib/gardens/navigation'
import { buildIndividualPlant } from '@/lib/plants/createIndividualPlant'
import { prescriptionPreview } from '@/lib/prescription/preview'
import type { PrescriptionZone } from '@/types/prescriptionMaps'

test('all cultivation routes preserve the selected garden including URL encoding', () => {
  for (const [type, route] of [['Orchard', 'orchard'], ['OliveGrove', 'olives'], ['Vineyard', 'vineyard'], ['', 'garden']]) {
    assert.equal(gardenManagementHref({ id: 'a&b', gardenType: type as never }), `/app/${route}?garden=a%26b`)
  }
  assert.equal(resolveGardenSelection([{ id: 'a' }, { id: 'b' }], 'b'), 'b')
  assert.equal(resolveGardenSelection([{ id: 'a' }], 'unavailable'), '')
  assert.equal(resolveGardenSelection([{ id: 'a' }, { id: 'b' }], null, 'b'), 'b')
})
test('plant registration preserves actual observations and rejects missing or invalid data', () => {
  const input = { gardenId: 'garden-a', plantName: ' Pomodoro ', plantCode: 'F1-P001', positionInRow: 1, status: 'diseased' as const, healthScore: 45, fieldRowId: 'row-a' }
  const result = buildIndividualPlant(input)
  assert.equal(result.plantName, 'Pomodoro'); assert.equal(result.healthScore, 45); assert.equal(result.fieldRowId, 'row-a')
  for (const invalid of [{ healthScore: NaN }, { healthScore: 101 }, { positionInRow: 0 }, { positionInRow: 1.5 }, { plantCode: ' ' }, { gardenId: '' }]) {
    assert.throws(() => buildIndividualPlant({ ...input, ...invalid }))
  }
})
test('map preview preserves holes, direction and handles invalid/absent geometry', () => {
  const zone = { id: 'z', geometry: { type: 'Polygon', coordinates: [[[12,41], [12.01,41], [12.01,41.01], [12,41.01], [12,41]], [[12.002,41.002], [12.004,41.002], [12.004,41.004], [12.002,41.002]]] } } as PrescriptionZone
  const preview = prescriptionPreview([zone])
  assert.equal(preview.paths.length, 1); assert.equal(preview.invalidCount, 0)
  assert.equal((preview.paths[0].path.match(/ Z/g) ?? []).length, 2)
  assert.doesNotMatch(preview.paths[0].path, /NaN|Infinity/)
  assert.equal(prescriptionPreview([{ ...zone, geometry: { type: 'Polygon', coordinates: [[[NaN, 1]]] } }]).invalidCount, 1)
  assert.deepEqual(prescriptionPreview([]), { paths: [], invalidCount: 0 })
})
