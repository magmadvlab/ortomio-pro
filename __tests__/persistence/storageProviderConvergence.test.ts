import test from 'node:test'
import assert from 'node:assert/strict'

import { createStorageProvider } from '@/packages/core/storage/factory'

test('an explicitly requested cloud provider never falls back to local storage', () => {
  assert.throws(
    () => createStorageProvider('cloud', { isSupabaseAvailableFn: () => false }),
    /Cloud storage requested but Supabase is not available/,
  )
})

test('local storage remains available only through an explicit local request', () => {
  const provider = createStorageProvider('local')
  assert.equal(provider.constructor.name, 'LocalStorageProvider')
})
