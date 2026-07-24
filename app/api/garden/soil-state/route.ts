import { NextRequest, NextResponse } from 'next/server'
import {
  accessErrorResponse,
  AccessError,
  getSupabaseClient,
  requireGardenAccess,
} from '@/lib/auth.server'

type SoilStateDependencies = {
  requireGardenAccessFn?: typeof requireGardenAccess
  getSupabaseClientFn?: typeof getSupabaseClient
}

const validNumber = (value: unknown, min: number, max: number): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max

const validateState = (value: unknown) => {
  if (!value || typeof value !== 'object') throw new Error('invalid_soil_state')
  const state = value as Record<string, unknown>
  if (state.compaction !== undefined && !validNumber(state.compaction, 0, 1)) throw new Error('invalid_compaction')
  if (state.workableDepth !== undefined && !validNumber(state.workableDepth, 0, 500)) throw new Error('invalid_workable_depth')
  if (state.lastRainAmount !== undefined && !validNumber(state.lastRainAmount, 0, 2_000)) throw new Error('invalid_rain_amount')
  if (state.drainage !== undefined && !['poor', 'moderate', 'good', 'excellent'].includes(String(state.drainage))) {
    throw new Error('invalid_drainage')
  }
  if (state.lastWorkType !== undefined && !['Plowing', 'Tilling', 'Sarchiatura', 'Rincalzatura'].includes(String(state.lastWorkType))) {
    throw new Error('invalid_work_type')
  }
  return {
    ...(state.compaction !== undefined && { compaction: state.compaction }),
    ...(state.drainage !== undefined && { drainage: state.drainage }),
    ...(state.workableDepth !== undefined && { workable_depth_cm: state.workableDepth }),
    ...(state.lastWorkDate !== undefined && { last_work_date: state.lastWorkDate }),
    ...(state.lastWorkType !== undefined && { last_work_type: state.lastWorkType }),
    ...(state.lastRainDate !== undefined && { last_rain_date: state.lastRainDate }),
    ...(state.lastRainAmount !== undefined && { last_rain_amount_mm: state.lastRainAmount }),
  }
}

const requireAuthorizedZone = async (
  supabase: ReturnType<typeof getSupabaseClient>,
  gardenId: string,
  zoneId: string,
) => {
  const { data, error } = await supabase
    .from('land_zones')
    .select('id')
    .eq('id', zoneId)
    .eq('garden_id', gardenId)
    .maybeSingle()
  if (error || !data) throw new AccessError('not_found', 404)
}

export async function handleGetSoilState(
  request: NextRequest,
  dependencies: SoilStateDependencies = {},
) {
  try {
    const gardenId = request.nextUrl.searchParams.get('garden_id') || ''
    const zoneId = request.nextUrl.searchParams.get('zone_id') || ''
    if (!gardenId || !zoneId) return NextResponse.json({ error: 'garden_and_zone_required' }, { status: 400 })

    await (dependencies.requireGardenAccessFn ?? requireGardenAccess)(request, gardenId)
    const supabase = (dependencies.getSupabaseClientFn ?? getSupabaseClient)()
    await requireAuthorizedZone(supabase, gardenId, zoneId)
    const { data, error } = await supabase
      .from('garden_soil_states')
      .select('*')
      .eq('garden_id', gardenId)
      .eq('zone_id', zoneId)
      .maybeSingle()
    if (error) throw error
    return NextResponse.json({ state: data ?? null }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) {
    const access = accessErrorResponse(error)
    if (access) return access
    console.error('Soil state read error:', error)
    return NextResponse.json({ error: 'soil_state_read_failed' }, { status: 503 })
  }
}

export async function handleUpdateSoilState(
  request: NextRequest,
  dependencies: SoilStateDependencies = {},
) {
  try {
    const body = await request.json()
    const gardenId = typeof body?.gardenId === 'string' ? body.gardenId : ''
    const zoneId = typeof body?.zoneId === 'string' ? body.zoneId : ''
    if (!gardenId || !zoneId) return NextResponse.json({ error: 'garden_and_zone_required' }, { status: 400 })

    let updates
    try {
      updates = validateState(body?.state)
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'invalid_soil_state' }, { status: 400 })
    }

    const { user } = await (dependencies.requireGardenAccessFn ?? requireGardenAccess)(request, gardenId)
    const supabase = (dependencies.getSupabaseClientFn ?? getSupabaseClient)()
    await requireAuthorizedZone(supabase, gardenId, zoneId)
    const { data, error } = await supabase
      .from('garden_soil_states')
      .upsert({
        garden_id: gardenId,
        zone_id: zoneId,
        user_id: user.id,
        ...updates,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'garden_id,zone_id' })
      .select()
      .single()
    if (error) throw error
    return NextResponse.json({ state: data })
  } catch (error) {
    const access = accessErrorResponse(error)
    if (access) return access
    console.error('Soil state update error:', error)
    return NextResponse.json({ error: 'soil_state_update_failed' }, { status: 503 })
  }
}

export const GET = handleGetSoilState
export const PUT = handleUpdateSoilState
