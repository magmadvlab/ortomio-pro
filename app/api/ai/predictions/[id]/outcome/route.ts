import { NextRequest, NextResponse } from 'next/server'
import { accessErrorResponse, requireGardenAccess, requireUser } from '@/lib/auth.server'
import { requireSupabase } from '@/lib/supabase-server'
import { calculatePredictionOutcomeMetrics } from '@/services/predictionOutcomeService'

const TYPES = new Set(['yield', 'disease', 'resource', 'other'])

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const idempotencyKey = request.headers.get('idempotency-key') ?? body?.idempotencyKey
    if (typeof idempotencyKey !== 'string' || idempotencyKey.length < 8 || idempotencyKey.length > 128) {
      return NextResponse.json({ error: 'invalid_idempotency_key' }, { status: 400 })
    }
    if (!TYPES.has(body?.outcomeType) || !body?.observedValue || typeof body.observedValue !== 'object') {
      return NextResponse.json({ error: 'invalid_outcome_payload' }, { status: 400 })
    }
    if (typeof body.evidenceSource !== 'string' || !body.evidenceSource.trim()) {
      return NextResponse.json({ error: 'evidence_source_required' }, { status: 400 })
    }
    const user = await requireUser(request)
    const supabase = requireSupabase()
    const { data: prediction, error } = await supabase.from('agronomic_predictions').select('*')
      .eq('id', id).eq('user_id', user.id).maybeSingle()
    if (error || !prediction) return NextResponse.json({ error: 'prediction_not_found' }, { status: 404 })
    await requireGardenAccess(request, prediction.garden_id)

    const metrics = calculatePredictionOutcomeMetrics(prediction.output_snapshot, body.outcomeType, body.observedValue)
    const observedAt = typeof body.observedAt === 'string' ? new Date(body.observedAt) : new Date()
    if (!Number.isFinite(observedAt.getTime()) || observedAt.getTime() > Date.now() + 5 * 60_000) {
      return NextResponse.json({ error: 'invalid_observed_at' }, { status: 400 })
    }
    const { data: existing } = await supabase.from('agronomic_prediction_outcomes').select('*')
      .eq('prediction_id', id).eq('idempotency_key', idempotencyKey).maybeSingle()
    if (existing) return NextResponse.json({ success: true, duplicate: true, outcome: existing })

    const { data: outcome, error: insertError } = await supabase.from('agronomic_prediction_outcomes').insert({
      prediction_id: id, user_id: user.id, garden_id: prediction.garden_id,
      idempotency_key: idempotencyKey, outcome_type: body.outcomeType,
      observed_at: observedAt.toISOString(), observed_value: body.observedValue,
      predicted_value: metrics.predictedValue, absolute_error: metrics.absoluteError,
      percentage_error: metrics.percentageError, brier_score: metrics.brierScore,
      calibration_score: metrics.calibrationScore, evidence_source: body.evidenceSource,
    }).select('*').single()
    if (insertError || !outcome) throw new Error(insertError?.message ?? 'outcome_persistence_failed')

    const { data: scores } = await supabase.from('agronomic_prediction_outcomes')
      .select('calibration_score').eq('prediction_id', id)
    const average = (scores ?? []).reduce((sum, row) => sum + Number(row.calibration_score || 0), 0) / Math.max(1, scores?.length ?? 0)
    await supabase.from('agronomic_predictions').update({
      calibration_score: average, outcome_count: scores?.length ?? 1,
    }).eq('id', id)
    return NextResponse.json({ success: true, duplicate: false, outcome, calibrationScore: average })
  } catch (error) {
    const accessResponse = accessErrorResponse(error)
    if (accessResponse) return accessResponse
    return NextResponse.json({ error: 'prediction_outcome_failed', message: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
