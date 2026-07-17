import test from 'node:test'
import assert from 'node:assert/strict'

import {
  createUnifiedAgronomicMemoryService,
  UNIFIED_AGRONOMIC_PERSISTENCE_STRATEGY,
  UNIFIED_AGRONOMIC_SOURCE_MAP,
} from '@/services/unifiedAgronomicMemoryService'

const createMemoryStorage = () => {
  const memoryEvents: any[] = []

  return {
    async getAgronomicMemoryEvents() {
      return memoryEvents
    },
    async createAgronomicMemoryEvent(event: any) {
      const index = memoryEvents.findIndex(item => item.id === event.id)
      if (index >= 0) memoryEvents[index] = event
      else memoryEvents.unshift(event)
      return event
    },
    async getGarden(id: string) {
      return id === 'garden-1'
        ? {
            id: 'garden-1',
            name: 'Orto test',
            sizeSqMeters: 120,
            soilType: 'Loamy',
            soilPh: 6.8,
            sunExposure: 'FullSun',
            dailySunHours: 8,
            createdAt: '2026-04-01T00:00:00.000Z',
          }
        : null
    },
    async getGardenZone(id: string) {
      return id === 'zone-1'
        ? {
            id: 'zone-1',
            gardenId: 'garden-1',
            name: 'Zona Nord',
            soilType: 'Loamy',
            sunExposure: 'Full Sun',
          }
        : null
    },
    async getFieldRow(id: string) {
      return id === 'row-1'
        ? {
            id: 'row-1',
            gardenId: 'garden-1',
            zoneId: 'zone-1',
            name: 'Filare Pomodoro',
            rowNumber: 1,
            lengthMeters: 12,
            orientation: 'N-S',
            cultivar: 'Pomodoro',
            isActive: true,
            createdAt: '2026-04-02T00:00:00.000Z',
            updatedAt: '2026-04-03T00:00:00.000Z',
          }
        : null
    },
    async getTasks() {
      return [
        {
          id: 'task-row-1',
          gardenId: 'garden-1',
          zoneId: 'zone-1',
          rowId: 'row-1',
          plantName: 'Pomodoro',
          taskType: 'Irrigation',
          date: '2026-04-10',
          completed: true,
          completedAt: '2026-04-10T09:00:00.000Z',
        },
        {
          id: 'task-row-2',
          gardenId: 'garden-1',
          zoneId: 'zone-2',
          rowId: 'row-2',
          plantName: 'Lattuga',
          taskType: 'Treatment',
          date: '2026-04-11',
          completed: false,
        },
      ] as any[]
    },
    async getWateringLogs() {
      return [
        {
          id: 'watering-row-1',
          gardenId: 'garden-1',
          zoneId: 'zone-1',
          fieldRowId: 'row-1',
          date: '2026-04-10',
          amount: 12,
        },
      ] as any[]
    },
    async getPlantingBatches() {
      return [
        {
          id: 'batch-1',
          gardenId: 'garden-1',
          fieldRowId: 'row-1',
          batchNumber: 1,
          plantName: 'Pomodoro',
          plantsCount: 20,
          transplantingDate: '2026-04-02',
          expectedHarvestDate: '2026-07-01',
          status: 'Growing',
          currentQuantity: 20,
          createdAt: '2026-04-02T00:00:00.000Z',
          updatedAt: '2026-04-03T00:00:00.000Z',
        },
      ] as any[]
    },
  }
}

test('unified agronomic source map covers every service required by P7 plan', () => {
  const services = new Set(UNIFIED_AGRONOMIC_SOURCE_MAP.map((entry) => entry.service))

  for (const service of [
    'directorService',
    'continuousMonitoringService',
    'plantHealthMonitoringService',
    'plantMonitoringService',
    'gardenMemoryService',
    'agronomicDecisionLedgerService',
    'dailyDiaryService',
    'environmentalMonitoringService',
    'fieldRowCropHistoryService',
    'plantLifecycleService',
    'taskExecutionOrchestratorService',
  ]) {
    assert.equal(services.has(service), true, `${service} missing from unified memory source map`)
  }

  assert.equal(UNIFIED_AGRONOMIC_PERSISTENCE_STRATEGY.length, 11)
})

test('field row memory inherits garden and zone context while filtering scoped history', async () => {
  const service = createUnifiedAgronomicMemoryService(createMemoryStorage())

  await service.appendEvent({
    gardenId: 'garden-1',
    type: 'task_execution',
    sourceService: 'test',
    zoneId: 'zone-1',
    fieldRowId: 'row-1',
    taskId: 'task-row-1',
    summary: 'Irrigazione completata',
  })

  const memory = await service.readFieldRowMemory('garden-1', 'row-1')

  assert.equal(memory.scope.zoneId, 'zone-1')
  assert.equal(memory.gardenProfile?.name, 'Orto test')
  assert.equal(memory.zoneProfile?.name, 'Zona Nord')
  assert.equal(memory.fieldRowProfile?.name, 'Filare Pomodoro')
  assert.deepEqual(memory.taskHistory.map((task) => task.id), ['task-row-1'])
  assert.equal(memory.treatmentHistory.wateringLogs.length, 1)
  assert.equal(memory.lifecycleState.latestPlantingDate, '2026-04-02T00:00:00.000Z')
  assert.equal(memory.lifecycleState.expectedHarvestDate, '2026-07-01T00:00:00.000Z')
  assert.equal(memory.outcomesAndLearningSignals.memoryEvents.length, 1)
  assert.equal(memory.derivedSignals.completedTaskCount, 1)
  assert.equal(memory.derivedSignals.hasScopedIdentifiers, true)
})
