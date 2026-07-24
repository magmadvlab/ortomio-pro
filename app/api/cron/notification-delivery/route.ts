import { NextRequest, NextResponse } from 'next/server'
import { requireCron } from '@/lib/auth.server'
import { requireSupabase } from '@/lib/supabase-server'
import { processNotificationDelivery, type NotificationDeliveryRow } from '@/services/notificationDeliveryService'

export async function GET(request: NextRequest) {
  try {
    requireCron(request)
    const client = requireSupabase()
    const { data, error } = await client.rpc('claim_notification_deliveries', { p_limit: 25 })
    if (error) throw error

    const result = { claimed: data?.length || 0, sent: 0, failed: 0, deadLetter: 0 }
    for (const row of (data || []) as NotificationDeliveryRow[]) {
      const outcome = await processNotificationDelivery(client, row)
      if (outcome.status === 'sent') result.sent += 1
      else if (outcome.status === 'dead_letter') result.deadLetter += 1
      else result.failed += 1
    }
    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    const status = error instanceof Error && error.message.includes('cron') ? 401 : 500
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'notification_delivery_failed' },
      { status }
    )
  }
}

export const POST = GET
