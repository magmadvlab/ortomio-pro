import { NextRequest, NextResponse } from 'next/server'
import { verifyTier } from '@/lib/auth.server'
import { getSupabaseClient } from '@/lib/auth.server'

export async function GET(request: NextRequest) {
  try {
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
    const type = searchParams.get('type') || 'analytics' // 'analytics' | 'treatments'
    
    const supabase = getSupabaseClient()
    
    if (type === 'analytics') {
      const { data: analytics, error } = await supabase
        .from('professional_analytics')
        .select('*')
        .eq('user_id', user.id)
        .order('year', { ascending: false })
      
      if (error) throw error
      
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
      const { data: treatments, error } = await supabase
        .from('treatment_register')
        .select('*')
        .eq('user_id', user.id)
        .order('treatment_date', { ascending: false })
      
      if (error) throw error
      
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








