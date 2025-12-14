import { NextRequest, NextResponse } from 'next/server'
import { verifyTier, isSupabaseAvailable } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // In locale senza Supabase, restituisci credits illimitati per sviluppo
    if (!isSupabaseAvailable()) {
      return NextResponse.json({
        total: 999,
        used: 0,
        resetDate: null,
        remaining: 999,
      })
    }

    const result = await verifyTier(request)
    
    if ('error' in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      )
    }
    
    const { profile } = result
    
    return NextResponse.json({
      total: profile.ai_credits_total || 0,
      used: profile.ai_credits_used || 0,
      resetDate: profile.ai_credits_reset_date,
      remaining: (profile.ai_credits_total || 0) - (profile.ai_credits_used || 0),
    })
  } catch (error: any) {
    console.error('Credits status error:', error)
    return NextResponse.json(
      { error: 'internal_error', message: error.message },
      { status: 500 }
    )
  }
}







