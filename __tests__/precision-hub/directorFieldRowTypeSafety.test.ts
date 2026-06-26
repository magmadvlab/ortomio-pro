import test from 'node:test'
import assert from 'node:assert/strict'

import { directorService } from '@/services/directorService'
import type { Garden } from '@/types'

const minimalGarden: Garden = {
  id: 'g1',
  name: 'Test',
  sizeSqMeters: 100,
  createdAt: new Date().toISOString(),
}

test('getFieldRowDirectorInsights accepts undefined storageProvider without throwing', async () => {
  await assert.doesNotReject(
    directorService.getFieldRowDirectorInsights({
      garden: minimalGarden,
      tasks: [],
      fieldRow: { id: 'row-1', name: 'Filare 1', cultivar: 'Nebbiolo' },
      currentDate: new Date('2026-06-01'),
      storageProvider: undefined,
    })
  )
})
