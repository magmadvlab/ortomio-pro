import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const gardenId = searchParams.get('garden_id')
    const suggestionType = searchParams.get('suggestion_type')
    const status = searchParams.get('status')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const supabase = getSupabaseServerClient()
    if (!supabase) {
      // Return mock data for development
      return NextResponse.json([
        {
          id: 'mock-1',
          title: 'Irrigazione Consigliata',
          description: 'Le tue piante potrebbero beneficiare di irrigazione oggi',
          type: 'IRRIGATION',
          status: 'PENDING',
          created_at: new Date().toISOString()
        }
      ])
    }

    let query = supabase
      .from('ai_suggestions')
      .select('*')
      .eq('user_id', userId)
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
    console.error('Error in AI suggestions API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, garden_id, suggestion_type, title, description } = body

    if (!user_id || !title || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = getSupabaseServerClient()
    if (!supabase) {
      // Return mock response for development
      return NextResponse.json({
        id: 'mock-new',
        user_id,
        garden_id,
        suggestion_type: suggestion_type || 'GENERAL',
        title,
        description,
        status: 'PENDING',
        created_at: new Date().toISOString()
      })
    }

    const { data, error } = await supabase
      .from('ai_suggestions')
      .insert({
        user_id,
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
    console.error('Error in AI suggestions POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}