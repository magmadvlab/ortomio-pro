import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const cleanup = readFileSync(
  new URL('../../services/taskCleanupService.ts', import.meta.url),
  'utf8'
)
const migration = readFileSync(
  new URL('../../supabase/migrations/20260724180000_archive_completed_garden_tasks.sql', import.meta.url),
  'utf8'
)

test('completed task archival copies and deletes atomically under owner scope', () => {
  assert.match(cleanup, /await storageProvider\.archiveTask\(task\.id\)/)
  assert.match(migration, /FOR UPDATE/)
  assert.match(migration, /user_id = auth\.uid\(\)/)
  assert.match(migration, /INSERT INTO public\.garden_task_archive/)
  assert.match(migration, /DELETE FROM public\.garden_tasks/)
})
