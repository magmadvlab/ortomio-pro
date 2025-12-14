import { NextRequest, NextResponse } from 'next/server'
import { verifyTier } from '@/lib/auth'
import { getSupabaseClient } from '@/lib/auth'

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
    
    // For now, return a simple text response
    // In production, use a PDF library like pdfkit or puppeteer
    const supabase = getSupabaseClient()
    
    const { data: analytics } = await supabase
      .from('professional_analytics')
      .select('*')
      .eq('user_id', user.id)
      .order('year', { ascending: false })
      .limit(10)
    
    // Simple text report (replace with PDF generation in production)
    const report = `
OrtoMio - Report Professionale
Generato il: ${new Date().toLocaleDateString('it-IT')}

ANALYTICS:
${(analytics || []).map(a => `
Coltura: ${a.crop_name}
Anno: ${a.year} - ${a.season}
Kg: ${a.total_kg || 0}
Revenue: €${a.total_revenue || 0}
Costi: €${a.total_costs || 0}
ROI: ${a.roi_percentage || 0}%
`).join('\n')}

NOTA: Questo è un report testuale. In produzione, generare PDF con libreria dedicata.
    `
    
    return new NextResponse(report, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="ortomio-report-${new Date().toISOString().split('T')[0]}.txt"`,
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







