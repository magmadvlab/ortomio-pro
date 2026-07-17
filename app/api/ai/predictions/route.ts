import { NextRequest, NextResponse } from 'next/server'
import { buildAIGroundingContext } from '@/services/aiGroundingService'
import { accessErrorResponse, requireGardenAccess } from '@/lib/auth.server'
import { requireSupabase } from '@/lib/supabase-server'
import {
  buildPredictionBundle,
  loadCanonicalPredictionInput,
  persistPredictionBundle,
} from '@/services/agronomicPredictionPipelineService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const gardenId = typeof body?.gardenId === 'string' ? body.gardenId : ''
    if (!gardenId) return NextResponse.json({ error: 'garden_id_required' }, { status: 400 })

    const { user, garden } = await requireGardenAccess(request, gardenId)
    const supabase = requireSupabase()
    // Tutti gli input agronomici arrivano dal database autorizzato. Gli omonimi campi
    // inviati dal client vengono intenzionalmente ignorati.
    const input = await loadCanonicalPredictionInput(supabase, gardenId)
    const bundle = buildPredictionBundle(input)
    const record = await persistPredictionBundle(supabase, user.id, input, bundle)
    const persistedBundle = record.output_snapshot ?? bundle
    const grounding = buildAIGroundingContext({
      id: garden.id,
      name: garden.name,
      gardenType: garden.garden_type ?? garden.gardenType,
      primaryCrop: garden.primary_crop ?? garden.primaryCrop,
      indoorConfig: garden.indoor_config ?? garden.indoorConfig,
      hydroponicConfig: garden.hydroponic_config ?? garden.hydroponicConfig,
      aquaponicConfig: garden.aquaponic_config ?? garden.aquaponicConfig,
      aeroponicConfig: garden.aeroponic_config ?? garden.aeroponicConfig,
      greenhouseConfig: garden.greenhouse_config ?? garden.greenhouseConfig,
      hasIndoor: garden.has_indoor ?? garden.hasIndoor,
      hasGreenhouse: garden.has_greenhouse ?? garden.hasGreenhouse,
    })

    return NextResponse.json({
      success: bundle.status === 'generated',
      status: persistedBundle.status,
      predictionId: record.id,
      data: {
        ...persistedBundle,
        generatedAt: record.created_at,
        grounding,
      },
    })
  } catch (error) {
    const accessResponse = accessErrorResponse(error)
    if (accessResponse) return accessResponse
    console.error('Error generating persisted predictions:', error)
    return NextResponse.json(
      { error: 'prediction_generation_failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'method_not_allowed', message: 'Usa POST: le predizioni richiedono un garden autorizzato e input server-side.' },
    { status: 405, headers: { Allow: 'POST' } }
  )
}
