import { NextRequest, NextResponse } from 'next/server'
import { verifyTier } from '@/lib/auth.server'
import { getSupabaseClient, isSupabaseAvailable } from '@/lib/auth.server'

export async function GET(request: NextRequest) {
  try {
    // In locale senza Supabase, restituisci array vuoto
    if (!isSupabaseAvailable()) {
      return NextResponse.json({ treatments: [] })
    }

    // Verify tier PRO
    const result = await verifyTier(request, ['PRO'])
    
    if ('error' in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      )
    }
    
    const { user } = result
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const gardenId = searchParams.get('garden_id')
    
    const supabase = getSupabaseClient()
    
    let query = supabase
      .from('treatment_register')
      .select('*')
      .eq('user_id', user.id)
      .order('treatment_date', { ascending: false })
      .limit(limit)
    
    if (gardenId) {
      query = query.eq('garden_id', gardenId)
    }
    
    const { data: treatments, error } = await query
    
    if (error) {
      throw error
    }
    
    return NextResponse.json({ treatments: treatments || [] })
  } catch (error: any) {
    console.error('Treatments GET error:', error)
    return NextResponse.json(
      { error: 'internal_error', message: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // In locale senza Supabase, simula successo (dati salvati in localStorage dal frontend)
    if (!isSupabaseAvailable()) {
      const body = await request.json()
      return NextResponse.json({ 
        treatment: {
          id: crypto.randomUUID(),
          ...body,
          created_at: new Date().toISOString()
        }
      })
    }

    // Verify tier PRO
    const result = await verifyTier(request, ['PRO'])
    
    if ('error' in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      )
    }
    
    const { user } = result
    const body = await request.json()
    
    const {
      garden_id,
      crop_name,
      treatment_date,
      product_name,
      active_ingredient,
      dosage,
      dosage_unit,
      area_treated,
      method,
      reason,
      weather_conditions,
      operator_name,
      notes,
    } = body
    
    // Validate required fields
    if (!crop_name || !treatment_date || !product_name || !dosage || !area_treated) {
      return NextResponse.json(
        { error: 'missing_required_fields' },
        { status: 400 }
      )
    }
    
    const supabase = getSupabaseClient()
    
    const { data: treatment, error } = await supabase
      .from('treatment_register')
      .insert({
        user_id: user.id,
        garden_id,
        crop_name,
        treatment_date,
        product_name,
        active_ingredient,
        dosage: parseFloat(dosage),
        dosage_unit,
        area_treated: parseFloat(area_treated),
        method,
        reason,
        weather_conditions,
        operator_name,
        notes,
      })
      .select()
      .single()
    
    if (error) {
      throw error
    }
    
    return NextResponse.json({ treatment })
  } catch (error: any) {
    console.error('Treatments POST error:', error)
    return NextResponse.json(
      { error: 'internal_error', message: error.message },
      { status: 500 }
    )
  }
}








