import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { GardenTask } from '../../types'
import { calculateDashboardGardenStats } from '../../services/dashboardGardenStatsService'

function task(overrides: Partial<GardenTask>): GardenTask {
  return {
    id: 'task-1',
    gardenId: 'garden-1',
    plantName: 'Pomodoro',
    taskType: 'Irrigation',
    date: '2026-07-24T08:00:00+02:00',
    completed: false,
    ...overrides,
  }
}

test('dashboard reports insufficient data instead of inventing plant health or inventory', () => {
  const stats = calculateDashboardGardenStats([], new Date('2026-07-24T12:00:00+02:00'))

  assert.equal(stats.healthScore, null)
  assert.equal(stats.plantsCount, null)
  assert.equal(stats.tasksToday, 0)
  assert.equal(stats.openIrrigationTasks, 0)
  assert.equal(stats.openHarvestTasks, 0)
})

test('dashboard operational counts come only from persisted open tasks', () => {
  const stats = calculateDashboardGardenStats([
    task({ id: 'irrigation-today' }),
    task({ id: 'harvest-open', taskType: 'Harvest', date: '2026-07-25T08:00:00+02:00' }),
    task({ id: 'irrigation-done', completed: true }),
    task({ id: 'overdue', taskType: 'Treatment', date: '2026-07-22T08:00:00+02:00' }),
  ], new Date('2026-07-24T12:00:00+02:00'))

  assert.equal(stats.tasksToday, 1)
  assert.equal(stats.tasksOverdue, 1)
  assert.equal(stats.openIrrigationTasks, 1)
  assert.equal(stats.openHarvestTasks, 1)
})

test('home dashboard exposes daily-plan failures instead of inventing an empty plan', () => {
  const source = readFileSync(
    resolve(process.cwd(), 'components/shared/HomeDashboard.tsx'),
    'utf8',
  )

  assert.match(source, /setDailyPlan\(null\)/)
  assert.match(source, /setPlanError\('Piano giornaliero non disponibile/)
  assert.match(source, /role="alert"/)
  assert.doesNotMatch(source, /Imposta un piano vuoto/)
})
