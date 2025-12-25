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
    const type = (searchParams.get('type') || 'analytics') as 'analytics' | 'treatments'
    const gardenId = searchParams.get('garden_id') || undefined

    // Check if we're in bypass mode (no Supabase available)
    const isBypassMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY

    let content = ''
    
    if (type === 'analytics') {
      let analytics: any[] | null = null
      
      if (isBypassMode) {
        analytics = [
          {
            year: 2024,
            season: 'Estate',
            crop_name: 'Pomodoro',
            total_kg: 150,
            total_revenue: 450,
            total_costs: 120,
            roi_percentage: 275
          },
          {
            year: 2024,
            season: 'Primavera',
            crop_name: 'Insalata',
            total_kg: 80,
            total_revenue: 240,
            total_costs: 60,
            roi_percentage: 300
          }
        ]
      } else {
        const supabase = getSupabaseClient()
        // Try to get real data, fallback to mock data in bypass mode
        try {
          const baseQuery = supabase
            .from('professional_analytics')
            .select('*')
            .eq('user_id', user.id)
            .order('year', { ascending: false })

          if (gardenId) {
            const { data, error } = await baseQuery.eq('garden_id', gardenId)
            if (error) {
              const msg = (error as any).message || ''
              const code = (error as any).code || ''
              if (code === '42703' || String(msg).toLowerCase().includes('garden_id')) {
                const retry = await baseQuery
                if (retry.error) throw retry.error
                analytics = retry.data as any
              } else {
                throw error
              }
            } else {
              analytics = data as any
            }
          } else {
            const { data, error } = await baseQuery
            if (error) throw error
            analytics = data as any
          }
        } catch (error: any) {
          if (error.message === 'BYPASS_MODE') {
            analytics = [
              {
                year: 2024,
                season: 'Estate',
                crop_name: 'Pomodoro',
                total_kg: 150,
                total_revenue: 450,
                total_costs: 120,
                roi_percentage: 275
              },
              {
                year: 2024,
                season: 'Primavera',
                crop_name: 'Insalata',
                total_kg: 80,
                total_revenue: 240,
                total_costs: 60,
                roi_percentage: 300
              }
            ]
          } else {
            throw error
          }
        }
      }

      content = `ORTOMIO - REPORT PROFESSIONALE
Generato il: ${new Date().toLocaleDateString('it-IT')}

ANALYTICS

${!analytics || analytics.length === 0 ? 'Nessun dato analytics disponibile.' : 
  analytics.map(a => {
    const year = a.year ?? ''
    const season = a.season ?? ''
    const crop = a.crop_name ?? ''
    const kg = a.total_kg ?? 0
    const revenue = a.total_revenue ?? 0
    const costs = a.total_costs ?? 0
    const roi = a.roi_percentage ?? undefined
    
    return `${crop} - ${season} ${year}
Kg: ${kg} | Revenue: €${revenue} | Costi: €${costs}${roi !== undefined ? ` | ROI: ${roi}%` : ''}`
  }).join('\n\n')
}

Generato da OrtoMio PRO
`
    } else if (type === 'treatments') {
      let treatments: any[] | null = null
      
      if (isBypassMode) {
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
        // Try to get real data, fallback to mock data in bypass mode
        try {
          const baseQuery = supabase
            .from('treatment_register')
            .select('*')
            .eq('user_id', user.id)
            .order('treatment_date', { ascending: false })

          if (gardenId) {
            const { data, error } = await baseQuery.eq('garden_id', gardenId)
            if (error) {
              const msg = (error as any).message || ''
              const code = (error as any).code || ''
              if (code === '42703' || String(msg).toLowerCase().includes('garden_id')) {
                const retry = await baseQuery
                if (retry.error) throw retry.error
                treatments = retry.data as any
              } else {
                throw error
              }
            } else {
              treatments = data as any
            }
          } else {
            const { data, error } = await baseQuery
            if (error) throw error
            treatments = data as any
          }
        } catch (error: any) {
          if (error.message === 'BYPASS_MODE') {
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
            throw error
          }
        }
      }

      content = `ORTOMIO - REPORT PROFESSIONALE
Generato il: ${new Date().toLocaleDateString('it-IT')}

REGISTRO TRATTAMENTI

${!treatments || treatments.length === 0 ? 'Nessun trattamento registrato.' : 
  treatments.map(t => {
    const date = t.treatment_date ?? ''
    const crop = t.crop_name ?? ''
    const product = t.product_name ?? ''
    const active = t.active_ingredient ?? ''
    const dosage = t.dosage ?? ''
    const unit = t.dosage_unit ?? ''
    const area = t.area_treated ?? ''
    const method = t.method ?? ''
    const reason = t.reason ?? ''
    const operator = t.operator_name ?? ''

    let text = `${date} - ${crop}
Prodotto: ${product}${active ? ` (${active})` : ''}
Dose: ${dosage} ${unit} | Area: ${area} m² | Metodo: ${method} | Motivo: ${reason}`
    if (operator) text += `\nOperatore: ${operator}`
    if (t.notes) text += `\nNote: ${String(t.notes)}`
    return text
  }).join('\n\n')
}

Generato da OrtoMio PRO
`
    } else {
      content = `ORTOMIO - REPORT PROFESSIONALE
Generato il: ${new Date().toLocaleDateString('it-IT')}

Tipo report non supportato.

Generato da OrtoMio PRO
`
    }

    // Create a simple text file with .pdf extension (temporary workaround)
    const today = new Date().toISOString().split('T')[0]
    
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="ortomio-${type}-${today}.txt"`,
      },
    })
  } catch (error: any) {
    console.error('Export PDF error:', error)
    return NextResponse.json(
      { error: 'internal_error', message: error.message },
      { status: 500 }
    )
  }
}








