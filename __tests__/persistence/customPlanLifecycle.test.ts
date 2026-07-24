import assert from 'node:assert/strict'
import test from 'node:test'

import {
  applyCustomPlanToTask,
  getCustomPlan,
  getUserCustomPlans,
} from '../../services/customPlanService'

const storedPlan = {
  id: 'plan-1',
  baseMasterSheetId: 'pomodoro',
  userId: 'user-1',
  name: 'Piano pomodoro',
  overrides: {},
  createdAt: '2026-07-24T00:00:00.000Z',
  updatedAt: '2026-07-24T00:00:00.000Z',
} as any

test('custom plan reads are delegated to durable storage', async () => {
  const storage = {
    getCustomPlan: async () => storedPlan,
    getUserCustomPlans: async () => [storedPlan],
    updateTask: async (_id: string, updates: any) => ({ id: _id, ...updates }),
    createCustomPlan: async (plan: any) => ({ ...plan, id: 'plan-1' }),
  }

  const one = await getCustomPlan(storage as any, 'plan-1')
  const list = await getUserCustomPlans(storage as any, 'user-1')
  assert.equal(one?.id, 'plan-1')
  assert.equal(list.length, 1)
})

test('applying a custom plan persists its task reference', async () => {
  let persisted: any
  const storage = {
    getCustomPlan: async () => storedPlan,
    getUserCustomPlans: async () => [],
    createCustomPlan: async (plan: any) => plan,
    updateTask: async (id: string, updates: any) => {
      persisted = { id, updates }
      return persisted
    },
  }

  await applyCustomPlanToTask(storage as any, 'task-1', 'plan-1')
  assert.deepEqual(persisted, {
    id: 'task-1',
    updates: { customPlanId: 'plan-1' },
  })
})

test('applying a missing custom plan fails closed', async () => {
  const storage = {
    getCustomPlan: async () => null,
    getUserCustomPlans: async () => [],
    createCustomPlan: async (plan: any) => plan,
    updateTask: async () => { throw new Error('must not write') },
  }
  await assert.rejects(
    applyCustomPlanToTask(storage as any, 'task-1', 'missing'),
    /Custom plan not found/
  )
})
