import { NextRequest, NextResponse } from 'next/server'
import { verifyTier, isSupabaseAvailable } from '@/lib/auth.server'

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
    
    // Se non autenticato, restituisci credits a 0 invece di errore 401
    // Questo permette al client di gestire graziosamente utenti non autenticati
    if ('error' in result) {
      if (result.status === 401) {
        // Utente non autenticato: restituisci credits a 0
        return NextResponse.json({
          total: 0,
          used: 0,
          resetDate: null,
          remaining: 0,
        })
      }
      // Altri errori: restituisci errore
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
















