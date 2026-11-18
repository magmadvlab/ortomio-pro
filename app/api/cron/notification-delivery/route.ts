import { NextRequest, NextResponse } from 'next/server'
import { AccessError, requireCron } from '@/lib/auth.server'
import { requireSupabase } from '@/lib/supabase-server'
import type { NotificationDeliveryRow } from '@/services/notificationDeliveryService'
import { processNotificationDelivery } from '@/services/notificationDelivery.server'
import { processAgronomistRequest } from '@/services/agronomistRequest.server'

export const maxDuration = 300

export async function GET(request: NextRequest) {
  try {
    requireCron(request)
    const client = requireSupabase()
    // Ten provider requests with a 15s timeout leave room for database operations.
    const { data, error } = await client.rpc('claim_notification_deliveries', { p_limit: 10 })
    if (error) throw error

    const result = { claimed: data?.length || 0, sent: 0, failed: 0, deadLetter: 0, suppressed: 0 }
    for (const row of (data || []) as NotificationDeliveryRow[]) {
      try {
        const outcome = row.notification_type === 'agronomist_request'
          ? await processAgronomistRequest(client, row)
          : await processNotificationDelivery(client, row)
        if (outcome.status === 'sent') result.sent += 1
        else if (outcome.status === 'suppressed') result.suppressed += 1
        else if (outcome.status === 'dead_letter') result.deadLetter += 1
        else result.failed += 1
      } catch {
        // A persistence failure must not strand every other claimed row.
        // The SQL claimant recovers abandoned locks on the next invocation.
        result.failed += 1
      }
    }
    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    const status = error instanceof AccessError ? error.status : 500
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'notification_delivery_failed' },
      { status }
    )
  }
}

export const POST = GET
