import { NextRequest, NextResponse } from 'next/server'
import { verifyTier } from '@/lib/auth.server'
import { getSupabaseClient, isSupabaseAvailable } from '@/lib/auth.server'

export async function GET(request: NextRequest) {
  try {
    // In locale senza Supabase, restituisci array vuoto
    if (!isSupabaseAvailable()) {
      return NextResponse.json({ works: [] })
    }

    // Verify tier PRO_PROFESSIONAL
    const result = await verifyTier(request, ['PRO_PROFESSIONAL'])
    
    if ('error' in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      )
    }
    
    const { user } = result
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    const gardenId = searchParams.get('garden_id')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    
    const supabase = getSupabaseClient()
    
    let query = supabase
      .from('mechanical_work_register')
      .select('*')
      .eq('user_id', user.id)
      .order('work_date', { ascending: false })
      .limit(limit)
    
    if (gardenId) {
      query = query.eq('garden_id', gardenId)
    }
    
    if (startDate) {
      query = query.gte('work_date', startDate)
    }
    
    if (endDate) {
      query = query.lte('work_date', endDate)
    }
    
    const { data: works, error } = await query
    
    if (error) {
      throw error
    }
    
    return NextResponse.json({ works: works || [] })
  } catch (error: any) {
    console.error('Mechanical work GET error:', error)
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
        work: {
          id: crypto.randomUUID(),
          ...body,
          created_at: new Date().toISOString()
        }
      })
    }

    // Verify tier PRO_PROFESSIONAL
    const result = await verifyTier(request, ['PRO_PROFESSIONAL'])
    
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
      work_type,
      work_date,
      area_m2,
      depth_cm,
      equipment_type,
      equipment_attachment,
      work_metadata,
      weather_conditions,
      operator_name,
      notes,
    } = body
    
    // Validate required fields
    if (!work_type || !work_date || !area_m2) {
      return NextResponse.json(
        { error: 'missing_required_fields' },
        { status: 400 }
      )
    }
    
    // Validate work_type
    const validWorkTypes = [
      // Suolo
      'Plowing', 'Subsoiling', 'Harrowing', 'Tilling', 'Rolling', 'Hoeing', 'EarthingUp', 'Mulching', 'PostSowingRolling',
      // Chioma
      'FormativePruning', 'MaintenancePruning', 'RejuvenationPruning', 'SummerPruning', 'WinterPruning',
      'Thinning', 'Suckering', 'Defoliation', 'Tying', 'OliveShredding', 'RunnerManagement',
      'StrawberryMulching', 'StrawberryCleaning', 'CaneRemoval', 'TipPruning', 'RaspberryTying',
      'SuckerThinning', 'FruitBagging', 'ExoticThinning', 'Shredding',
      // Generale
      'Topping', 'Pruning'
    ]
    if (!validWorkTypes.includes(work_type)) {
      return NextResponse.json(
        { error: 'invalid_work_type' },
        { status: 400 }
      )
    }
    
    // Validate equipment_type if provided
    if (equipment_type) {
      const validEquipmentTypes = [
        'Tractor', 'RotaryHarrow', 'Shredder', 'FertilizerSpreader', 'Seeder',
        'Topper', 'Defoliator', 'PrePruner', 'Thinner',
        'Rototiller', 'Cultivator', 'Mower', 'BrushCutter', 'TrackedCart', 'BackpackSprayer',
        'ElectricTier', 'ElectricPruner', 'TelescopicPruner',
        'Manual'
      ]
      if (!validEquipmentTypes.includes(equipment_type)) {
        return NextResponse.json(
          { error: 'invalid_equipment_type' },
          { status: 400 }
        )
      }
    }
    
    const supabase = getSupabaseClient()
    
    const { data: work, error } = await supabase
      .from('mechanical_work_register')
      .insert({
        user_id: user.id,
        garden_id: garden_id || null,
        work_type,
        work_date,
        area_m2: parseFloat(area_m2),
        depth_cm: depth_cm ? parseFloat(depth_cm) : null,
        equipment_type: equipment_type || null,
        equipment_attachment: equipment_type === 'Tractor' ? (equipment_attachment || null) : null,
        work_metadata: work_metadata || null,
        weather_conditions: weather_conditions || null,
        operator_name: operator_name || null,
        notes: notes || null,
      })
      .select()
      .single()
    
    if (error) {
      throw error
    }
    
    return NextResponse.json({ work })
  } catch (error: any) {
    console.error('Mechanical work POST error:', error)
    return NextResponse.json(
      { error: 'internal_error', message: error.message },
      { status: 500 }
    )
  }
}







