import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import {
  validateTaskTransitionInput,
  type TaskTransitionInput,
} from '../../services/taskTransitionService'

const migration = readFileSync(
  new URL('../../supabase/migrations/20260724150000_task_transition_ledger.sql', import.meta.url),
  'utf8'
)

test('task transition ledger is durable, owner-scoped and serialized', () => {
  assert.match(migration, /CREATE TABLE IF NOT EXISTS public\.garden_task_transition_events/)
  assert.match(migration, /FOR UPDATE/)
  assert.match(migration, /SECURITY DEFINER/)
  assert.match(migration, /g\.user_id = current_actor/)
  assert.match(migration, /actor_id, idempotency_key/)
  assert.match(migration, /task_transition_idempotency_conflict/)
  assert.match(migration, /REVOKE ALL ON FUNCTION public\.transition_garden_task/)
})

test('reopen and cancellation require an auditable reason', () => {
  const base: Omit<TaskTransitionInput, 'nextStatus'> = {
    taskId: 'task-1',
    idempotencyKey: 'transition-1',
  }

  assert.throws(
    () => validateTaskTransitionInput({ ...base, nextStatus: 'open', reason: '  ' }),
    /reason required/
  )
  assert.throws(
    () => validateTaskTransitionInput({ ...base, nextStatus: 'cancelled' }),
    /reason required/
  )
  assert.doesNotThrow(() =>
    validateTaskTransitionInput({ ...base, nextStatus: 'open', reason: 'meteo cambiato' })
  )
  assert.doesNotThrow(() =>
    validateTaskTransitionInput({ ...base, nextStatus: 'completed' })
  )
})
