import test from 'node:test'
import assert from 'node:assert/strict'

import { buildOperationalAnalytics } from '@/lib/analytics/operationalStats'
import type { GardenTask, HarvestLogData } from '@/types'

const now = new Date('2026-07-28T12:00:00.000Z')

test('analytics returns no invented KPI when evidence is absent', () => {
  const result = buildOperationalAnalytics([], [], 'month', now)

  assert.deepEqual(result.stats, {
    totalTasks: 0,
    completedTasks: 0,
    plantsGrown: 0,
    harvestWeight: 0,
    waterSaved: null,
    co2Offset: null,
    efficiency: null,
    costSavings: null,
    roi: null,
    laborHours: null,
  })
})

test('analytics uses only records inside the selected period', () => {
  const tasks = [
    {
      id: 'recent-complete',
      gardenId: 'garden-1',
      taskType: 'Sowing',
      plantName: 'Pomodoro',
      date: '2026-07-20',
      completed: true,
      durationMinutes: 90,
    },
    {
      id: 'old-complete',
      gardenId: 'garden-1',
      taskType: 'Sowing',
      plantName: 'Lattuga',
      date: '2026-05-01',
      completed: true,
      durationMinutes: 600,
    },
    {
      id: 'recent-open',
      gardenId: 'garden-1',
      taskType: 'Harvest',
      plantName: 'Pomodoro',
      date: '2026-07-21',
      completed: false,
    },
  ] as GardenTask[]
  const harvests = [
    { date: '2026-07-22', quantity: 1500, unit: 'g' },
    { date: '2026-05-10', quantity: 20, unit: 'kg' },
  ] as HarvestLogData[]

  const result = buildOperationalAnalytics(tasks, harvests, 'month', now)

  assert.equal(result.stats.totalTasks, 2)
  assert.equal(result.stats.completedTasks, 1)
  assert.equal(result.stats.plantsGrown, 1)
  assert.equal(result.stats.harvestWeight, 1.5)
  assert.equal(result.stats.efficiency, 50)
  assert.equal(result.stats.laborHours, 1.5)
})
