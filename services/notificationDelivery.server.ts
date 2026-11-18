import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { checkUserPreferences } from './notificationService'
import { NOTIFICATION_RATE_LIMIT_PER_DAY, notificationRetryDecision, type NotificationDeliveryRow } from './notificationDeliveryService'

const configuration = () => ({ key: process.env.RESEND_API_KEY, from: process.env.NOTIFICATION_FROM || process.env.ORGANIZATION_INVITATION_FROM })
const labels: Record<string, string> = {
  plantName: 'Pianta', taskType: 'Attività', completedDate: 'Completata il', dueDate: 'Scadenza',
  daysUntilDue: 'Giorni alla scadenza', titolo: 'Sfida', punti: 'Punti', alertType: 'Allerta',
  severity: 'Gravità', message: 'Messaggio', date: 'Data',
}
export async function sendNotificationEmail(row: NotificationDeliveryRow, config = configuration(), fetcher = fetch) {
  if (!config.key || !config.from) throw new Error('notifications_not_configured')
  z.string().email().parse(row.recipient)
  z.string().trim().min(1).max(200).parse(row.subject)
  const details = Object.entries(labels).flatMap(([key, label]) => {
    const value = row.payload[key]
    return typeof value === 'string' || typeof value === 'number' ? [`${label}: ${String(value).slice(0, 2000)}`] : []
  })
  const response = await fetcher('https://api.resend.com/emails', {
    method: 'POST', signal: AbortSignal.timeout(15_000),
    headers: { Authorization: `Bearer ${config.key}`, 'Content-Type': 'application/json', 'Idempotency-Key': `notification/${row.id}` },
    body: JSON.stringify({ from: config.from, to: [row.recipient], subject: row.subject,
      text: `${row.subject}\n\n${details.join('\n')}\n\nApri OrtoMio per i dettagli: https://www.ortomioapp.it\nPuoi gestire le notifiche nelle impostazioni dell’app.` }),
  })
  const payload = await response.json().catch(() => null)
  if (!response.ok || typeof payload?.id !== 'string' || !payload.id.trim()) throw new Error('provider_delivery_not_confirmed')
  return payload.id as string
}

export async function processNotificationDelivery(client: SupabaseClient, row: NotificationDeliveryRow, dependencies: { config?: typeof configuration; fetcher?: typeof fetch } = {}) {
  const save = async (values: Record<string, unknown>) => {
    const result = await client.from('notification_delivery_queue').update({ ...values, locked_at: null }).eq('id', row.id).eq('status', 'processing').select('id').single()
    if (result.error || !result.data) throw new Error('notification_delivery_status_not_saved')
  }
  let terminal = false
  try {
    // Queue rows may be inserted by authenticated users. Never trust their recipient.
    const account = await client.auth.admin.getUserById(row.user_id)
    if (account.error) throw new Error('notification_account_lookup_failed')
    if (row.channel !== 'email' || row.notification_type === 'agronomist_request' || !account.data.user?.email_confirmed_at || account.data.user.email !== row.recipient) {
      terminal = true
      throw new Error('notification_recipient_or_channel_invalid')
    }
    // Provider idempotency lasts 24h. Do not retry an ambiguous send beyond that window.
    const scheduled = Date.parse(row.scheduled_for || '')
    if (row.attempts > 1 && (!Number.isFinite(scheduled) || Date.now() - scheduled > 23 * 60 * 60_000)) {
      terminal = true
      throw new Error('notification_retry_window_expired')
    }
    if (!await checkUserPreferences(row.user_id, row.notification_type, client)) {
      await save({ status: 'suppressed', last_error: 'notification_preferences_disabled_or_unavailable' })
      return { status: 'suppressed' as const }
    }
    const rate = await client.from('notification_delivery_queue').select('id', { count: 'exact', head: true }).eq('user_id', row.user_id).in('status', ['sent', 'delivered']).gte('sent_at', new Date(Date.now() - 86400_000).toISOString())
    if (rate.error || (rate.count || 0) >= NOTIFICATION_RATE_LIMIT_PER_DAY) throw new Error('notification_rate_limit_or_lookup_failed')
    const id = await sendNotificationEmail(row, (dependencies.config ?? configuration)(), dependencies.fetcher)
    await save({ status: 'sent', provider_message_id: id, sent_at: new Date().toISOString(), last_error: null })
    return { status: 'sent' as const, providerMessageId: id }
  } catch (cause) {
    const decision = notificationRetryDecision(terminal ? row.max_attempts : row.attempts, row.max_attempts)
    await save({ status: decision.status, next_attempt_at: decision.nextAttemptAt,
      last_error: cause instanceof Error ? cause.message : 'provider_delivery_failed', failed_at: new Date().toISOString(),
      dead_letter_at: decision.status === 'dead_letter' ? new Date().toISOString() : null })
    return { status: decision.status }
  }
}
