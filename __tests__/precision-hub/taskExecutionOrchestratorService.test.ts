import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildMechanicalExecutionInitialData,
  buildTaskExecutionNotes,
} from '@/services/taskExecutionOrchestratorService'
import type { TaskExecutionContext } from '@/services/taskExecutionLaunchService'

const baseContext: TaskExecutionContext = {
  route: 'mechanical-work',
  sourceTaskId: 'task-123',
  taskType: 'Tilling',
  plantName: 'Pomodoro',
  zoneId: 'zone-9',
  rowId: 'row-3',
  rowNumber: '3',
  date: '2026-04-29',
}

test('buildMechanicalExecutionInitialData carries launch scope into the form bootstrap', () => {
  assert.deepEqual(buildMechanicalExecutionInitialData(baseContext, 'garden-1'), {
    gardenId: 'garden-1',
    zoneId: 'zone-9',
    rowIds: ['row-3'],
    workType: 'Tilling',
    workDate: '2026-04-29',
    notes: buildTaskExecutionNotes(baseContext),
    completed: true,
  })
})

test('buildMechanicalExecutionInitialData omits rowIds when launch context has no row', () => {
  assert.deepEqual(
    buildMechanicalExecutionInitialData({
      ...baseContext,
      rowId: undefined,
      rowNumber: undefined,
    }, 'garden-1'),
    {
      gardenId: 'garden-1',
      zoneId: 'zone-9',
      rowIds: undefined,
      workType: 'Tilling',
      workDate: '2026-04-29',
      notes: 'Task sorgente per Pomodoro • Zona zone-9',
      completed: true,
    }
  )
})
