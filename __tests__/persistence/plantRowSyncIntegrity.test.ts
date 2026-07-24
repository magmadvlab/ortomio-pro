import assert from 'node:assert/strict'
import test from 'node:test'
import { PlantRowSyncService } from '../../services/plantRowSyncService'

test('plant row assignment persists both assignment and removal', async () => {
  const updates: Array<{ id: string; values: Record<string, unknown> }> = []
  const service = new PlantRowSyncService({
    updateIndividualPlant: async (id: string, values: Record<string, unknown>) => {
      updates.push({ id, values })
      return { id, ...values }
    },
  })

  assert.equal((await service.assignPlantsToRow(['plant-1'], 'row-7', 'field_row')).success, true)
  assert.equal((await service.removePlantsFromRow(['plant-1'])).success, true)
  assert.deepEqual(updates, [
    { id: 'plant-1', values: { gardenRowId: undefined, fieldRowId: 'row-7' } },
    { id: 'plant-1', values: { gardenRowId: undefined, fieldRowId: undefined } },
  ])
})

test('plant row assignment fails closed without a durable writer', async () => {
  const result = await new PlantRowSyncService({}).assignPlantsToRow(
    ['plant-1'],
    'row-7',
    'field_row'
  )
  assert.equal(result.success, false)
  assert.match(result.errors[0], /durable individual-plant storage/)
})
