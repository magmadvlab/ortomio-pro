import test from 'node:test'
import assert from 'node:assert/strict'
import { createUnifiedOperationsService } from '../../services/unifiedOperationsService.js'

test('getBedIdForRow: returns bedId from storageProvider when gardenRow exists', async () => {
  const fakeGardenRow = { id: 'row-123', bedId: 'bed-456', name: 'Filare 1' }
  const mockProvider = {
    getGardenRow: async (id: string) => id === 'row-123' ? fakeGardenRow : null,
  } as any
  const svc = createUnifiedOperationsService(mockProvider as any)
  const bedId = await (svc as any).getBedIdForRow('row-123')
  assert.equal(bedId, 'bed-456')
})

test('getBedIdForRow: returns undefined when row does not exist', async () => {
  const mockProvider = {
    getGardenRow: async () => null,
  } as any
  const svc = createUnifiedOperationsService(mockProvider as any)
  const bedId = await (svc as any).getBedIdForRow('non-existent')
  assert.equal(bedId, undefined)
})

test('getBedIdForRow: returns undefined when getGardenRow is not supported by provider', async () => {
  const mockProvider = {} as any  // provider senza getGardenRow
  const svc = createUnifiedOperationsService(mockProvider as any)
  const bedId = await (svc as any).getBedIdForRow('row-123')
  assert.equal(bedId, undefined)
})
