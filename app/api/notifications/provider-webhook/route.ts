import { NextRequest, NextResponse } from 'next/server'
import { requireSupabase } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  const expected = process.env.NOTIFICATION_WEBHOOK_SECRET
  const supplied = request.headers.get('x-notification-webhook-secret')
  if (!expected || supplied !== expected) {
    return NextResponse.json({ error: 'unauthorized_webhook' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const providerMessageId = String(body.messageId || body.message_id || '')
    const event = String(body.event || body.status || '').toLowerCase()
    if (!providerMessageId || !['delivered', 'failed', 'bounced'].includes(event)) {
      return NextResponse.json({ error: 'invalid_webhook_payload' }, { status: 400 })
    }

    const client = requireSupabase()
    const delivered = event === 'delivered'
    const { data, error } = await client.from('notification_delivery_queue').update({
      status: delivered ? 'delivered' : 'dead_letter',
      delivered_at: delivered ? new Date().toISOString() : null,
      failed_at: delivered ? null : new Date().toISOString(),
      dead_letter_at: delivered ? null : new Date().toISOString(),
      last_error: delivered ? null : String(body.reason || event),
    }).eq('provider_message_id', providerMessageId).select('id').maybeSingle()
    if (error) throw error
    if (!data) return NextResponse.json({ error: 'delivery_not_found' }, { status: 404 })
    return NextResponse.json({ success: true, status: delivered ? 'delivered' : 'dead_letter' })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'webhook_update_failed' },
      { status: 500 }
    )
  }
}
