import test from 'node:test'
import assert from 'node:assert/strict'
import type { SupabaseClient } from '@supabase/supabase-js'
import { processNotificationDelivery, sendNotificationEmail } from '@/services/notificationDelivery.server'
import type { NotificationDeliveryRow } from '@/services/notificationDeliveryService'
import { sendBatchNotifications } from '@/services/notificationService'

const config = () => ({ key: 'fixture-not-a-secret', from: 'OrtoMio <notifications@example.test>' })
const row: NotificationDeliveryRow = { id: 'queue-id', user_id: 'owner', recipient: 'owner@example.test', channel: 'email', notification_type: 'weather_alert', subject: 'Allerta meteo', payload: { message: 'Vento forte', privateKey: 'must-not-send' }, attempts: 1, max_attempts: 3, scheduled_for: new Date().toISOString() }

test('Resend transport requires configured sender and a confirmed provider ID', async () => {
  let calls = 0
  await assert.rejects(sendNotificationEmail(row, { key: undefined, from: undefined }, async () => { calls++; return Response.json({}) }))
  assert.equal(calls, 0)
  for (const response of [Response.json({}, { status: 500 }), Response.json({}), Response.json({ id: ' ' }), new Response('invalid')]) await assert.rejects(sendNotificationEmail(row, config(), async () => response))
  await assert.rejects(sendNotificationEmail(row, config(), async () => { throw new DOMException('timeout', 'TimeoutError') }))
  let sent: RequestInit | undefined
  assert.equal(await sendNotificationEmail(row, config(), async (url, init) => { assert.equal(url, 'https://api.resend.com/emails'); sent = init; return Response.json({ id: 'provider-id' }) }), 'provider-id')
  assert.equal(new Headers(sent?.headers).get('Idempotency-Key'), 'notification/queue-id')
  assert.ok(sent?.signal)
  assert.match(String(sent?.body), /Vento forte/)
  assert.doesNotMatch(String(sent?.body), /must-not-send|privateKey/)
})

function fixture(options: { disabled?: boolean; count?: number; saveError?: boolean } = {}) {
  const updates: Record<string, unknown>[] = []
  const client = { auth: { admin: { getUserById: async () => ({ data: { user: { email: 'owner@example.test', email_confirmed_at: '2026-01-01' } }, error: null }) } }, from(table: string) {
    let values: Record<string, unknown> | undefined
    const result = () => table === 'notification_preferences' ? { data: { email_enabled: !options.disabled, weather_alerts: true }, error: null } : values ? { data: options.saveError ? null : { id: row.id }, error: options.saveError ? new Error('database unavailable') : null } : { count: options.count || 0, error: null }
    const query = { select: () => query, eq: () => query, in: () => query, gte: () => query, update: (value: Record<string, unknown>) => { values = value; updates.push(value); return query }, single: async () => result(), then: (resolve: (value: unknown) => unknown) => Promise.resolve(result()).then(resolve) }
    return query
  } } as unknown as SupabaseClient
  return { client, updates }
}

test('delivery validates account recipient, opt-out, rate and expired retry before contacting provider', async () => {
  for (const scenario of [
    { patch: { recipient: 'stranger@example.test' }, options: {}, status: 'dead_letter' },
    { patch: { channel: 'push' as const }, options: {}, status: 'dead_letter' },
    { patch: {}, options: { disabled: true }, status: 'suppressed' },
    { patch: {}, options: { count: 10 }, status: 'failed' },
    { patch: { attempts: 2, scheduled_for: '2020-01-01' }, options: {}, status: 'dead_letter' },
  ]) {
    const { client, updates } = fixture(scenario.options)
    let calls = 0
    const outcome = await processNotificationDelivery(client, { ...row, ...scenario.patch }, { config, fetcher: async () => { calls++; return Response.json({ id: 'provider-id' }) } })
    assert.equal(outcome.status, scenario.status); assert.equal(calls, 0); assert.equal(updates.at(-1)?.status, scenario.status)
  }
})

test('delivery persists provider ID only on success and retries provider errors', async () => {
  for (const success of [true, false]) {
    const { client, updates } = fixture()
    const outcome = await processNotificationDelivery(client, row, { config, fetcher: async () => success ? Response.json({ id: 'provider-id' }) : Response.json({ error: 'refused' }, { status: 500 }) })
    assert.equal(outcome.status, success ? 'sent' : 'failed')
    assert.equal(updates.at(-1)?.provider_message_id, success ? 'provider-id' : undefined)
  }
})

test('delivery cannot claim success when persistence fails after provider acceptance', async () => {
  const { client } = fixture({ saveError: true })
  await assert.rejects(processNotificationDelivery(client, row, { config, fetcher: async () => Response.json({ id: 'provider-id' }) }), /status_not_saved/)
})

test('batch enqueue counts accepted queue entries without reporting an email as sent', async () => {
  const client = { from(table: string) {
    const query = { select: () => query, eq: () => query, upsert: () => query,
      single: async () => ({ data: null, error: null }),
      maybeSingle: async () => ({ data: { id: 'queued' }, error: null }),
    }
    assert.ok(['notification_preferences', 'notification_delivery_queue'].includes(table))
    return query
  } } as unknown as SupabaseClient
  const result = await sendBatchNotifications([{ userId: row.user_id, userEmail: row.recipient, type: row.notification_type, subject: row.subject, templateData: row.payload }], client)
  assert.deepEqual(result, { queued: 1, sent: 0, failed: 0, errors: [] })
})
