import { NextRequest, NextResponse } from 'next/server'
import {
  AccessError,
  accessErrorResponse,
  getSupabaseClient,
  requireGardenAccess,
} from '@/lib/auth.server'
import { validateLandZoneInput } from '@/lib/land-zones'

type ZoneRouteDependencies = {
  requireGardenAccessFn?: typeof requireGardenAccess
  getSupabaseClientFn?: typeof getSupabaseClient
}

export async function handleGetLandZones(
  request: NextRequest,
  dependencies: ZoneRouteDependencies = {},
) {
  try {
    const gardenId = request.nextUrl.searchParams.get('garden_id') || ''
    if (!gardenId) return NextResponse.json({ error: 'garden_id_required' }, { status: 400 })

    await (dependencies.requireGardenAccessFn ?? requireGardenAccess)(request, gardenId)
    const supabase = (dependencies.getSupabaseClientFn ?? getSupabaseClient)()
    const { data, error } = await supabase
      .from('land_zones')
      .select('*')
      .eq('garden_id', gardenId)
      .order('zone_name', { ascending: true })

    if (error) throw error
    return NextResponse.json({ zones: data ?? [] }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) {
    const access = accessErrorResponse(error)
    if (access) return access
    console.error('Land zones read error:', error)
    return NextResponse.json({ error: 'zones_read_failed' }, { status: 503 })
  }
}

export async function handleCreateLandZone(
  request: NextRequest,
  dependencies: ZoneRouteDependencies = {},
) {
  try {
    const body = await request.json()
    const gardenId = typeof body?.gardenId === 'string' ? body.gardenId : ''
    if (!gardenId) return NextResponse.json({ error: 'garden_id_required' }, { status: 400 })

    let zone
    try {
      zone = validateLandZoneInput(body?.zone)
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'invalid_zone' },
        { status: 400 },
      )
    }

    const { user } = await (dependencies.requireGardenAccessFn ?? requireGardenAccess)(request, gardenId)
    const supabase = (dependencies.getSupabaseClientFn ?? getSupabaseClient)()
    const { data, error } = await supabase
      .from('land_zones')
      .insert({ garden_id: gardenId, user_id: user.id, ...zone })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ zone: data }, { status: 201 })
  } catch (error) {
    const access = accessErrorResponse(error)
    if (access) return access
    console.error('Land zone creation error:', error)
    return NextResponse.json({ error: 'zone_creation_failed' }, { status: 503 })
  }
}

const UPDATABLE_ZONE_FIELDS = [
  'zone_name',
  'zone_code',
  'area_hectares',
  'shape_type',
  'length_meters',
  'width_meters',
  'current_status',
  'status_since',
  'soil_type',
  'notes',
] as const

function pickUpdatableZoneFields(updates: unknown): Record<string, unknown> {
  if (!updates || typeof updates !== 'object') return {}
  const source = updates as Record<string, unknown>
  const picked: Record<string, unknown> = {}
  for (const field of UPDATABLE_ZONE_FIELDS) {
    if (field in source) picked[field] = source[field]
  }
  return picked
}

async function requireOwnedZone(
  supabase: ReturnType<typeof getSupabaseClient>,
  gardenId: string,
  zoneId: string,
) {
  const { data: zone, error } = await supabase
    .from('land_zones')
    .select('id')
    .eq('id', zoneId)
    .eq('garden_id', gardenId)
    .maybeSingle()

  if (error || !zone) throw new AccessError('not_found', 404)
}

export async function handleUpdateLandZone(
  request: NextRequest,
  dependencies: ZoneRouteDependencies = {},
) {
  try {
    const body = await request.json()
    const gardenId = typeof body?.gardenId === 'string' ? body.gardenId : ''
    const zoneId = typeof body?.zoneId === 'string' ? body.zoneId : ''
    if (!gardenId || !zoneId) {
      return NextResponse.json({ error: 'garden_id_and_zone_id_required' }, { status: 400 })
    }

    const updates = pickUpdatableZoneFields(body?.updates)
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'no_updatable_fields' }, { status: 400 })
    }

    await (dependencies.requireGardenAccessFn ?? requireGardenAccess)(request, gardenId)
    const supabase = (dependencies.getSupabaseClientFn ?? getSupabaseClient)()
    await requireOwnedZone(supabase, gardenId, zoneId)

    const { data, error } = await supabase
      .from('land_zones')
      .update(updates)
      .eq('id', zoneId)
      .eq('garden_id', gardenId)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ zone: data })
  } catch (error) {
    const access = accessErrorResponse(error)
    if (access) return access
    console.error('Land zone update error:', error)
    return NextResponse.json({ error: 'zone_update_failed' }, { status: 503 })
  }
}

export async function handleDeleteLandZone(
  request: NextRequest,
  dependencies: ZoneRouteDependencies = {},
) {
  try {
    const body = await request.json()
    const gardenId = typeof body?.gardenId === 'string' ? body.gardenId : ''
    const zoneId = typeof body?.zoneId === 'string' ? body.zoneId : ''
    if (!gardenId || !zoneId) {
      return NextResponse.json({ error: 'garden_id_and_zone_id_required' }, { status: 400 })
    }

    await (dependencies.requireGardenAccessFn ?? requireGardenAccess)(request, gardenId)
    const supabase = (dependencies.getSupabaseClientFn ?? getSupabaseClient)()
    await requireOwnedZone(supabase, gardenId, zoneId)

    const { error } = await supabase
      .from('land_zones')
      .delete()
      .eq('id', zoneId)
      .eq('garden_id', gardenId)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    const access = accessErrorResponse(error)
    if (access) return access
    console.error('Land zone deletion error:', error)
    return NextResponse.json({ error: 'zone_deletion_failed' }, { status: 503 })
  }
}

export const GET = handleGetLandZones
export const POST = handleCreateLandZone
export const PATCH = handleUpdateLandZone
export const DELETE = handleDeleteLandZone
