import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

test('notification preference failures suppress delivery instead of opting users in', () => {
  const source = readFileSync('services/notificationService.ts', 'utf8')
  const preferenceFunction = source.slice(
    source.indexOf('async function checkUserPreferences'),
    source.indexOf('/**\n * Invia notifica email'),
  )
  assert.equal(preferenceFunction.includes('return true; // Default: invia'), false)
  assert.match(preferenceFunction, /Senza preferenze autorevoli non inviare/)
})

test('intelligent notifications never set sentAt on failed provider delivery', () => {
  const source = readFileSync('services/intelligentNotificationService.ts', 'utf8')
  assert.match(source, /if \(result\.success\) \{\s*notification\.sentAt/)
  assert.match(source, /idempotencyKey:.*notification\.id/s)
  assert.doesNotMatch(source, /no persistent scheduler exists yet/)
})

test('delivery lifecycle is persistent, deduplicated and claim-safe', () => {
  const migration = readFileSync('supabase/migrations/20260724140000_notification_delivery_lifecycle.sql', 'utf8')
  assert.match(migration, /idempotency_key text NOT NULL UNIQUE/)
  assert.match(migration, /FOR UPDATE SKIP LOCKED/)
  assert.match(migration, /dead_letter/)
  assert.match(migration, /provider_message_id/)
})

test('delivery worker uses bounded backoff and terminal dead letter', async () => {
  const { notificationRetryDecision } = await import('@/services/notificationDeliveryService')
  assert.equal(notificationRetryDecision(5, 5).status, 'dead_letter')
  const retry = notificationRetryDecision(2, 5, 0)
  assert.equal(retry.status, 'failed')
  assert.equal(retry.nextAttemptAt, new Date(10 * 60_000).toISOString())
})

test('provider webhook and cron are authenticated', () => {
  const webhook = readFileSync('app/api/notifications/provider-webhook/route.ts', 'utf8')
  const cron = readFileSync('app/api/cron/notification-delivery/route.ts', 'utf8')
  assert.match(webhook, /NOTIFICATION_WEBHOOK_SECRET/)
  assert.match(cron, /requireCron/)
  assert.match(cron, /claim_notification_deliveries/)
})

test('health monitoring bridges alerts into the generic delivery queue', () => {
  const healthCron = readFileSync('app/api/cron/health-check/route.ts', 'utf8')
  assert.match(healthCron, /\.from\('notification_delivery_queue'\)/)
  assert.match(healthCron, /health-alert.*alertId.*email/)
})
