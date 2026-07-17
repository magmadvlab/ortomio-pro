import { NextRequest, NextResponse } from 'next/server'
import { requireCron } from '@/lib/auth.server'
import { requireSupabase } from '@/lib/supabase-server'
import { thingsboardService } from '@/services/thingsboardService'
import { buildThingsboardRetryPayload, decideCommandRetry } from '@/services/iotCommandLifecycleService'

export async function POST(request: NextRequest) {
  try {
    requireCron(request)
    const supabase = requireSupabase()
    const now = new Date()
    const nowIso = now.toISOString()

    await supabase.from('smart_device_commands').update({
      status: 'timed_out',
      failed_at: nowIso,
      last_error: 'acknowledgement_timeout',
    }).eq('status', 'sent').lt('timeout_at', nowIso)

    const { data: rows, error } = await supabase
      .from('smart_device_commands')
      .select('id, device_id, idempotency_key, desired_valve_state, attempts, max_attempts, smart_devices(external_device_id)')
      .in('status', ['requested', 'failed', 'timed_out'])
      .order('requested_at', { ascending: true })
      .limit(100)
    if (error) throw new Error(error.message)

    let retried = 0
    let deadLettered = 0
    for (const row of rows ?? []) {
      const deviceRelation = Array.isArray(row.smart_devices) ? row.smart_devices[0] : row.smart_devices
      const command = {
        id: row.id,
        deviceId: row.device_id,
        externalDeviceId: deviceRelation?.external_device_id,
        idempotencyKey: row.idempotency_key,
        desiredValveState: row.desired_valve_state,
        attempts: row.attempts,
        maxAttempts: row.max_attempts,
      }
      const decision = decideCommandRetry(command)
      if (decision.action === 'dead_letter') {
        await supabase.from('smart_device_commands').update({
          status: 'dead_letter', attempts: decision.nextAttempt, dead_letter_at: nowIso,
        }).eq('id', row.id)
        deadLettered += 1
        continue
      }

      try {
        await thingsboardService.sendAttributes(buildThingsboardRetryPayload(command, nowIso))
        await supabase.from('smart_device_commands').update({
          status: 'sent', attempts: decision.nextAttempt, sent_at: nowIso,
          timeout_at: new Date(now.getTime() + 15_000).toISOString(), last_error: null,
        }).eq('id', row.id)
        retried += 1
      } catch (dispatchError) {
        await supabase.from('smart_device_commands').update({
          status: 'failed', attempts: decision.nextAttempt, failed_at: nowIso,
          last_error: dispatchError instanceof Error ? dispatchError.message : 'retry_dispatch_failed',
        }).eq('id', row.id)
      }
    }

    return NextResponse.json({ processed: rows?.length ?? 0, retried, deadLettered })
  } catch (error) {
    const status = error instanceof Error && error.message.includes('cron') ? 401 : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : 'iot_retry_failed' }, { status })
  }
}
