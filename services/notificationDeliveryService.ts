import type { NotificationData } from '@/services/notificationService'
import { sendNotification } from '@/services/notificationService'

export const NOTIFICATION_RATE_LIMIT_PER_DAY = 10

export interface NotificationDeliveryRow {
  id: string
  user_id: string
  channel: 'email' | 'push'
  notification_type: NotificationData['type']
  recipient: string
  subject: string
  payload: Record<string, unknown>
  attempts: number
  max_attempts: number
}

export const notificationRetryDecision = (
  attempts: number,
  maxAttempts: number,
  now = Date.now()
) => attempts >= maxAttempts
  ? { status: 'dead_letter' as const, nextAttemptAt: null }
  : {
      status: 'failed' as const,
      nextAttemptAt: new Date(now + Math.min(24 * 60, 2 ** Math.max(0, attempts - 1) * 5) * 60_000).toISOString(),
    }

export const enqueueNotificationDelivery = async (
  client: any,
  notification: NotificationData,
  options: {
    gardenId?: string
    channel?: 'email' | 'push'
    scheduledFor?: string
    idempotencyKey: string
  }
) => {
  const scheduledFor = options.scheduledFor || new Date().toISOString()
  const { data, error } = await client.from('notification_delivery_queue').upsert({
    user_id: notification.userId,
    garden_id: options.gardenId || null,
    channel: options.channel || 'email',
    notification_type: notification.type,
    recipient: notification.userEmail,
    subject: notification.subject,
    payload: notification.templateData,
    idempotency_key: options.idempotencyKey,
    scheduled_for: scheduledFor,
    next_attempt_at: scheduledFor,
  }, { onConflict: 'idempotency_key', ignoreDuplicates: true }).select().maybeSingle()
  if (error) throw error
  return data
}

const userRateLimitReached = async (client: any, userId: string): Promise<boolean> => {
  const since = new Date(Date.now() - 24 * 60 * 60_000).toISOString()
  const { count, error } = await client
    .from('notification_delivery_queue')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .in('status', ['sent', 'delivered'])
    .gte('sent_at', since)
  if (error) throw error
  return (count || 0) >= NOTIFICATION_RATE_LIMIT_PER_DAY
}

export const processNotificationDelivery = async (client: any, row: NotificationDeliveryRow) => {
  if (await userRateLimitReached(client, row.user_id)) {
    const retryAt = new Date(Date.now() + 60 * 60_000).toISOString()
    await client.from('notification_delivery_queue').update({
      status: 'failed', last_error: 'persistent_rate_limit', next_attempt_at: retryAt, locked_at: null,
    }).eq('id', row.id)
    return { status: 'failed' as const }
  }

  const result = await sendNotification({
    userId: row.user_id,
    userEmail: row.recipient,
    type: row.notification_type,
    subject: row.subject,
    templateData: row.payload,
  }, client, { directProvider: true })

  if (result.success) {
    await client.from('notification_delivery_queue').update({
      status: 'sent',
      provider_message_id: result.providerMessageId || null,
      sent_at: new Date().toISOString(),
      last_error: null,
      locked_at: null,
    }).eq('id', row.id)
    return { status: 'sent' as const, providerMessageId: result.providerMessageId }
  }

  const decision = notificationRetryDecision(row.attempts, row.max_attempts)
  await client.from('notification_delivery_queue').update({
    status: decision.status,
    next_attempt_at: decision.nextAttemptAt,
    last_error: result.error || 'provider_delivery_failed',
    failed_at: new Date().toISOString(),
    dead_letter_at: decision.status === 'dead_letter' ? new Date().toISOString() : null,
    locked_at: null,
  }).eq('id', row.id)
  return { status: decision.status }
}
