import { NextRequest, NextResponse } from 'next/server'
import {
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

export const GET = handleGetLandZones
export const POST = handleCreateLandZone
