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
    const requiredSchema = [
      { key: 'diary_event_revisions', table: 'diary_event_revisions', columns: 'id' },
      { key: 'smart_device_commands', table: 'smart_device_commands', columns: 'id' },
      { key: 'agronomic_predictions', table: 'agronomic_predictions', columns: 'id' },
      { key: 'monitoring_runs', table: 'monitoring_runs', columns: 'id' },
      { key: 'ndvi_data_cache', table: 'ndvi_data_cache', columns: 'id' },
      { key: 'prescription_maps', table: 'prescription_maps', columns: 'id' },
      { key: 'certification_evidence_events', table: 'certification_evidence_events', columns: 'id' },
      { key: 'export_audit_log', table: 'export_audit_log', columns: 'id' },
      { key: 'release_capability_rollouts', table: 'release_capability_rollouts', columns: 'id' },
      { key: 'release_observability_events', table: 'release_observability_events', columns: 'id' },
      { key: 'notification_delivery_queue', table: 'notification_delivery_queue', columns: 'id' },
      {
        key: 'organization_invitations_delivery',
        table: 'organization_invitations',
        columns: 'id,delivery_status,delivery_provider,provider_message_id,delivered_at',
      },
      { key: 'organization_commercial_accounts', table: 'organization_commercial_accounts', columns: 'id' },
      { key: 'organization_invoices', table: 'organization_invoices', columns: 'id' },
      { key: 'organization_commercial_audit_log', table: 'organization_commercial_audit_log', columns: 'id' },
      { key: 'organization_access_suspensions', table: 'organization_access_suspensions', columns: 'id' },
      { key: 'organization_support_access_grants', table: 'organization_support_access_grants', columns: 'id' },
    ]
    const [commands, runs, errors, predictions, observability, deliveries, ...schemaProbes] = await Promise.all([
      supabase.from('smart_device_commands').select('status,attempts').gte('requested_at', since),
      supabase.from('monitoring_runs').select('status').gte('checked_at', since),
      supabase.from('monitoring_error_queue').select('status,attempts').gte('created_at', since),
      supabase.from('agronomic_predictions').select('outcome_count,status').eq('status', 'generated').lte('valid_until', outcomeMaturity),
      supabase.from('release_observability_events').select('status,latency_ms,retry_count,outcome_missing').gte('occurred_at', since),
      supabase.from('notification_delivery_queue').select('status,attempts,created_at,sent_at,delivered_at').gte('created_at', since),
      ...requiredSchema.map(probe => supabase.from(probe.table).select(probe.columns).limit(1)),
    ])
    const schema = Object.fromEntries(
      requiredSchema.map((probe, index) => [probe.key, !schemaProbes[index].error]),
    )
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
      migrationHistoryVerified: Boolean(process.env.RELEASE_MIGRATION_AUDIT_ID),
      tenantIsolationVerified: Boolean(process.env.RELEASE_TENANT_ISOLATION_RUN_ID),
      commercialLifecycleVerified: Boolean(process.env.RELEASE_COMMERCIAL_LIFECYCLE_E2E_ID),
      agronomicShadowVerified: Boolean(process.env.RELEASE_AGRONOMIC_SHADOW_ID),
      agronomicReviewVerified: Boolean(process.env.RELEASE_AGRONOMIC_REVIEW_ID),
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
