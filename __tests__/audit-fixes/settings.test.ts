import test from 'node:test'
import assert from 'node:assert/strict'
import type { SupabaseClient } from '@supabase/supabase-js'
import { readUserSettings, saveUserSettings, saveAppearance, saveNotificationPreferences, changePassword, saveAccountClosureRequest, NOTIFICATION_DEFAULTS } from '@/services/userSettingsService'

function fixture() {
  const state = { profile: { id: 'owner', first_name: 'Ada', last_name: 'Verdi', preferences: { retained: 42 } as Record<string, unknown> }, notifications: null as Record<string, unknown> | null, failRead: false, failWrite: false, authenticated: true, passwordAccepted: true, passwordChanged: false, writes: 0, scopes: [] as Array<[string, unknown]> }
  const client = {
    auth: {
      getUser: async () => ({ data: { user: state.authenticated ? { id: 'owner', email: 'fixture@example.test' } : null }, error: null }),
      signInWithPassword: async () => ({ data: { user: state.passwordAccepted ? { id: 'owner' } : null }, error: state.passwordAccepted ? null : new Error('invalid') }),
      updateUser: async () => { state.passwordChanged = true; return { error: null } },
    },
    from(table: string) {
      let operation = 'read', value: Record<string, unknown> = {}
      const execute = () => {
        if (operation === 'read') return { data: table === 'profiles' ? structuredClone(state.profile) : state.notifications, error: state.failRead ? new Error('offline') : null }
        if (state.failWrite) return { data: null, error: new Error('write failed') }
        state.writes++
        if (table === 'profiles') Object.assign(state.profile, value)
        else state.notifications = value
        return { data: { id: 'owner' }, error: null }
      }
      const query = {
        select: () => query,
        eq: (key: string, value: unknown) => { state.scopes.push([key, value]); return query },
        update: (input: Record<string, unknown>) => { operation = 'update'; value = input; return query },
        upsert: (input: Record<string, unknown>) => { operation = 'upsert'; value = input; return query },
        single: async () => execute(), maybeSingle: async () => execute(),
        then: (resolve: (result: unknown) => unknown) => Promise.resolve(execute()).then(resolve),
      }
      return query
    },
  } as unknown as SupabaseClient
  return { client, state }
}

test('profile and theme persist across reads without losing unrelated preferences; scope comes from authenticated identity', async () => {
  const { client, state } = fixture()
  assert.equal((await readUserSettings(client)).theme, 'light')
  await saveUserSettings(client, { firstName: ' Ada Maria ', lastName: 'Verdi', cultivationType: 'Vivaio' })
  assert.equal((await readUserSettings(client)).firstName, 'Ada Maria')
  assert.equal(await saveAppearance(client, 'dark'), 'dark')
  assert.deepEqual(state.profile.preferences, { retained: 42, cultivationType: 'Vivaio', theme: 'dark' })
  assert.ok(state.scopes.every(([key, value]) => key === 'id' && value === 'owner'))
})
test('settings fail closed on unauthenticated access, database reads/writes and invalid values', async () => {
  const { client, state } = fixture()
  state.authenticated = false; await assert.rejects(saveAppearance(client, 'dark')); assert.equal(state.writes, 0)
  state.authenticated = true; state.failRead = true; await assert.rejects(saveAppearance(client, 'dark')); assert.equal(state.writes, 0)
  state.failRead = false; state.failWrite = true; await assert.rejects(saveAppearance(client, 'dark'))
  state.failWrite = false; await assert.rejects(saveAppearance(client, 'invalid' as never)); assert.equal(state.writes, 0)
  await assert.rejects(saveUserSettings(client, { firstName: '', lastName: 'Verdi', cultivationType: 'Vivaio' }))
})
test('notification opt-outs survive reopening and cannot write another account identity', async () => {
  const { client, state } = fixture()
  const saved = await saveNotificationPreferences(client, { ...NOTIFICATION_DEFAULTS, email_enabled: false, weather_alerts: false })
  assert.equal(saved.email_enabled, false); assert.equal(saved.weather_alerts, false)
  assert.equal(state.notifications?.user_id, 'owner')
  state.failWrite = true; await assert.rejects(saveNotificationPreferences(client, NOTIFICATION_DEFAULTS))
})
test('password update requires current-password verification and matching new passwords', async () => {
  const { client, state } = fixture()
  await assert.rejects(changePassword(client, 'fixture-old', 'fixture-new', 'different')); assert.equal(state.passwordChanged, false)
  state.passwordAccepted = false; await assert.rejects(changePassword(client, 'fixture-old', 'fixture-new', 'fixture-new')); assert.equal(state.passwordChanged, false)
  state.passwordAccepted = true; await changePassword(client, 'fixture-old', 'fixture-new', 'fixture-new'); assert.equal(state.passwordChanged, true)
})
test('closure requests are persistent, idempotent and withdrawable without deleting account or preferences', async () => {
  const { client, state } = fixture()
  const first = await saveAccountClosureRequest(client, true)
  const again = await saveAccountClosureRequest(client, true)
  assert.equal(first.id, again.id); assert.equal(state.writes, 1)
  const withdrawn = await saveAccountClosureRequest(client, false)
  assert.equal(withdrawn.status, 'withdrawn'); assert.equal(withdrawn.id, first.id)
  assert.equal(state.profile.preferences.retained, 42)
})
