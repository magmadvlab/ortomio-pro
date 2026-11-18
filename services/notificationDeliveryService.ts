import type { SupabaseClient } from '@supabase/supabase-js'
import type { NotificationData } from '@/services/notificationService'

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
  scheduled_for?: string
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
  client: SupabaseClient,
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
