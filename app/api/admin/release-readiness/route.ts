import { NextRequest, NextResponse } from 'next/server'
import { accessErrorResponse, getSupabaseClient, requireAdmin } from '@/lib/auth.server'
import { evaluateReleaseMetrics, type ReleaseMetrics } from '@/config/release'

const percentile95 = (values: number[]) => {
  if (!values.length) return 0
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * 0.95) - 1)]
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)
    const supabase = getSupabaseClient()
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const outcomeMaturity = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const requiredTables = [
      'diary_event_revisions', 'smart_device_commands', 'agronomic_predictions', 'monitoring_runs',
      'ndvi_data_cache', 'prescription_maps', 'certification_evidence_events', 'export_audit_log',
      'release_capability_rollouts', 'release_observability_events', 'notification_delivery_queue',
    ]
    const [commands, runs, errors, predictions, observability, deliveries, ...schemaProbes] = await Promise.all([
      supabase.from('smart_device_commands').select('status,attempts').gte('requested_at', since),
      supabase.from('monitoring_runs').select('status').gte('checked_at', since),
      supabase.from('monitoring_error_queue').select('status,attempts').gte('created_at', since),
      supabase.from('agronomic_predictions').select('outcome_count,status').eq('status', 'generated').lte('valid_until', outcomeMaturity),
      supabase.from('release_observability_events').select('status,latency_ms,retry_count,outcome_missing').gte('occurred_at', since),
      supabase.from('notification_delivery_queue').select('status,attempts,created_at,sent_at,delivered_at').gte('created_at', since),
      ...requiredTables.map(table => supabase.from(table).select('id').limit(1)),
    ])
    const schema = Object.fromEntries(requiredTables.map((table, index) => [table, !schemaProbes[index].error]))
    const commandRows = commands.data || []
    const runRows = runs.data || []
    const errorRows = errors.data || []
    const predictionRows = predictions.data || []
    const observationRows = observability.data || []
    const deliveryRows = deliveries.data || []
    const metrics: ReleaseMetrics = {
      criticalWrites: observationRows.length,
      criticalWriteFailures: observationRows.filter(row => row.status === 'failure' || row.status === 'dead_letter').length,
      commands: commandRows.length,
      retriedCommands: commandRows.filter(row => Number(row.attempts) > 1).length,
      deadLetters: commandRows.filter(row => row.status === 'dead_letter').length + errorRows.filter(row => row.status === 'dead_letter').length,
      monitoringRuns: runRows.length,
      failedMonitoringRuns: runRows.filter(row => row.status === 'failed').length,
      maturePredictions: predictionRows.length,
      predictionsWithoutOutcome: predictionRows.filter(row => Number(row.outcome_count) === 0).length,
      p95LatencyMs: percentile95(observationRows.map(row => Number(row.latency_ms)).filter(Number.isFinite)),
    }
    const evaluation = evaluateReleaseMetrics(metrics)
    const notificationMetrics = {
      queued: deliveryRows.filter(row => row.status === 'scheduled' || row.status === 'processing').length,
      sent: deliveryRows.filter(row => row.status === 'sent' || row.status === 'delivered').length,
      delivered: deliveryRows.filter(row => row.status === 'delivered').length,
      failed: deliveryRows.filter(row => row.status === 'failed').length,
      deadLetters: deliveryRows.filter(row => row.status === 'dead_letter').length,
      retried: deliveryRows.filter(row => Number(row.attempts) > 1).length,
    }
    const externalGates = {
      snapshotVerified: Boolean(process.env.RELEASE_SNAPSHOT_ID),
      restoreDrillVerified: Boolean(process.env.RELEASE_RESTORE_DRILL_ID),
      securityAdvisorVerified: Boolean(process.env.RELEASE_SECURITY_ADVISOR_RUN_ID),
      providerSmokeVerified: Boolean(process.env.RELEASE_PROVIDER_SMOKE_ID),
      pilotVerified: Boolean(process.env.RELEASE_PILOT_ID),
    }
    const queryErrors = [commands.error, runs.error, errors.error, predictions.error, observability.error, deliveries.error].filter(Boolean).map(error => error!.message)
    return NextResponse.json({
      windowHours: 24, schema, schemaReady: Object.values(schema).every(Boolean), metrics, notificationMetrics, ...evaluation,
      externalGates, externalReady: Object.values(externalGates).every(Boolean), queryErrors,
      deployReady: Object.values(schema).every(Boolean) && Object.values(externalGates).every(Boolean) && !evaluation.rollbackRequired && queryErrors.length === 0,
    }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) {
    return accessErrorResponse(error) ?? NextResponse.json({ error: 'release_readiness_unavailable' }, { status: 503 })
  }
}
