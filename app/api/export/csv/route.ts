import { NextRequest, NextResponse } from 'next/server'
import { verifyTier } from '@/lib/auth.server'
import { getSupabaseClient } from '@/lib/auth.server'

export async function GET(request: NextRequest) {
  try {
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
    const type = searchParams.get('type') || 'analytics' // 'analytics' | 'treatments'
    
    // Check if we're in bypass mode (no Supabase available)
    const isBypassMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (type === 'analytics') {
      let analytics: any[] | null = null
      
      if (isBypassMode) {
        console.log('[CSV API] Using mock analytics data (bypass mode)')
        analytics = [
          {
            crop_name: 'Pomodoro',
            season: 'Estate',
            year: 2024,
            total_kg: 150,
            total_revenue: 450,
            total_costs: 120,
            yield_per_sqm: 3.0
          },
          {
            crop_name: 'Insalata',
            season: 'Primavera',
            year: 2024,
            total_kg: 80,
            total_revenue: 240,
            total_costs: 60,
            yield_per_sqm: 2.5
          }
        ]
      } else {
        const supabase = getSupabaseClient()
        const { data: analyticsData, error } = await supabase
          .from('professional_analytics')
          .select('*')
          .eq('user_id', user.id)
          .order('year', { ascending: false })
        
        if (error) throw error
        analytics = analyticsData
      }
      
      // Generate CSV
      const headers = 'Coltura,Stagione,Anno,Kg,Revenue,Costi,ROI%,Resa/m²\n'
      const rows = (analytics || []).map(a => {
        const roi = a.total_costs > 0
          ? ((parseFloat(a.total_revenue) - parseFloat(a.total_costs)) / parseFloat(a.total_costs)) * 100
          : 0
        return `${a.crop_name},${a.season},${a.year},${a.total_kg || 0},${a.total_revenue || 0},${a.total_costs || 0},${roi.toFixed(2)},${a.yield_per_sqm || 0}`
      }).join('\n')
      
      const csv = headers + rows
      
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="ortomio-analytics-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    }
    
    if (type === 'treatments') {
      let treatments: any[] | null = null
      
      if (isBypassMode) {
        console.log('[CSV API] Using mock treatments data (bypass mode)')
        treatments = [
          {
            treatment_date: '2024-12-20',
            crop_name: 'Pomodoro',
            product_name: 'Cuproxa',
            active_ingredient: 'Rame',
            dosage: '2',
            dosage_unit: 'kg/ha',
            area_treated: '500',
            method: 'Spruzzo',
            reason: 'Prevenzione peronospora',
            operator_name: 'Mario',
            notes: 'Applicato in condizioni di tempo asciutto'
          },
          {
            treatment_date: '2024-12-15',
            crop_name: 'Insalata',
            product_name: 'Bacillus thuringiensis',
            active_ingredient: 'Bt',
            dosage: '1',
            dosage_unit: 'L/ha',
            area_treated: '300',
            method: 'Spruzzo',
            reason: 'Controllo larve',
            operator_name: 'Giulia'
          }
        ]
      } else {
        const supabase = getSupabaseClient()
        const { data: treatmentsData, error } = await supabase
          .from('treatment_register')
          .select('*')
          .eq('user_id', user.id)
          .order('treatment_date', { ascending: false })
        
        if (error) throw error
        treatments = treatmentsData
      }
      
      // Generate CSV
      const headers = 'Data,Coltura,Prodotto,Ingrediente Attivo,Dosaggio,Unità,Area (m²),Metodo,Motivo,Operatore,Note\n'
      const rows = (treatments || []).map(t => {
        return `${t.treatment_date},${t.crop_name},${t.product_name},${t.active_ingredient || ''},${t.dosage},${t.dosage_unit},${t.area_treated},${t.method || ''},${t.reason || ''},${t.operator_name || ''},${t.notes || ''}`
      }).join('\n')
      
      const csv = headers + rows
      
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="ortomio-treatments-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    }
    
    return NextResponse.json(
      { error: 'invalid_type' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Export CSV error:', error)
    return NextResponse.json(
      { error: 'internal_error', message: error.message },
      { status: 500 }
    )
  }
}








