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
    const year = searchParams.get('year')
    const season = searchParams.get('season')
    
    const supabase = getSupabaseClient()
    
    // Build query
    let query = supabase
      .from('professional_analytics')
      .select('*')
      .eq('user_id', user.id)
    
    if (year) {
      query = query.eq('year', parseInt(year))
    }
    
    if (season) {
      query = query.eq('season', season)
    }
    
    const { data: analytics, error } = await query.order('year', { ascending: false })
    
    if (error) {
      throw error
    }
    
    // Calculate summary
    const summary = {
      totalRevenue: analytics?.reduce((sum, a) => sum + (parseFloat(a.total_revenue) || 0), 0) || 0,
      totalCosts: analytics?.reduce((sum, a) => sum + (parseFloat(a.total_costs) || 0), 0) || 0,
      totalYield: analytics?.reduce((sum, a) => sum + (parseFloat(a.total_kg) || 0), 0) || 0,
      roiPercentage: 0,
    }
    
    if (summary.totalCosts > 0) {
      summary.roiPercentage = ((summary.totalRevenue - summary.totalCosts) / summary.totalCosts) * 100
    }
    
    return NextResponse.json({
      summary,
      crops: analytics || [],
    })
  } catch (error: any) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'internal_error', message: error.message },
      { status: 500 }
    )
  }
}








