import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import { resolveGardenContext } from '@/services/gardenContextResolverService'
import { getDefaultStorageProvider } from '@/packages/core/storage/factory'
import { accessErrorResponse, requireGardenAccess, requireUser } from '@/lib/auth.server'

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request)
    const { searchParams } = new URL(request.url)
    const gardenId = searchParams.get('garden_id')
    const suggestionType = searchParams.get('suggestion_type')
    const status = searchParams.get('status')

    if (gardenId) await requireGardenAccess(request, gardenId)

    const supabase = getSupabaseServerClient()
    if (!supabase) {
      const storageProvider = getDefaultStorageProvider()
      const resolvedContext = gardenId
        ? await resolveGardenContext(storageProvider, gardenId).catch(() => null)
        : null

      return NextResponse.json([
        {
          id: 'mock-1',
          title: resolvedContext?.garden?.name ? `Irrigazione consigliata per ${resolvedContext.garden.name}` : 'Irrigazione Consigliata',
          description: resolvedContext?.garden?.primaryCrop?.label
            ? `Le condizioni del garden ${resolvedContext.garden.primaryCrop.label} suggeriscono di verificare irrigazione e stress idrico`
            : 'Le tue piante potrebbero beneficiare di irrigazione oggi',
          type: 'IRRIGATION',
          status: 'PENDING',
          created_at: new Date().toISOString(),
          garden_id: gardenId,
          context: resolvedContext?.structure.fieldRows?.length
            ? {
                fieldRows: resolvedContext.structure.fieldRows.length,
                firstFieldRowId: resolvedContext.structure.fieldRows[0]?.id,
              }
            : undefined,
        }
      ])
    }

    let query = supabase
      .from('ai_suggestions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (gardenId) {
      query = query.eq('garden_id', gardenId)
    }

    if (suggestionType) {
      const types = suggestionType.split(',')
      query = query.in('suggestion_type', types)
    }

    if (status) {
      const statuses = status.split(',')
      query = query.in('status', statuses)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching AI suggestions:', error)
      return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    const accessResponse = accessErrorResponse(error)
    if (accessResponse) return accessResponse
    console.error('Error in AI suggestions API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request)
    const body = await request.json()
    const { garden_id, suggestion_type, title, description } = body

    if (!title || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (garden_id) await requireGardenAccess(request, garden_id)

    const supabase = getSupabaseServerClient()
    if (!supabase) {
      // Return grounded mock response for local development
      return NextResponse.json({
        id: 'mock-new',
        user_id: user.id,
        garden_id,
        suggestion_type: suggestion_type || 'GENERAL',
        title,
        description,
        status: 'PENDING',
        created_at: new Date().toISOString(),
        context: garden_id ? { garden_id } : undefined
      })
    }

    const { data, error } = await supabase
      .from('ai_suggestions')
      .insert({
        user_id: user.id,
        garden_id,
        suggestion_type: suggestion_type || 'GENERAL',
        title,
        description,
        status: 'PENDING'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating AI suggestion:', error)
      return NextResponse.json({ error: 'Failed to create suggestion' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    const accessResponse = accessErrorResponse(error)
    if (accessResponse) return accessResponse
    console.error('Error in AI suggestions POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
