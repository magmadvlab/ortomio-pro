import { NextRequest, NextResponse } from 'next/server'
import { AccessError, getSupabaseClient, requireCron } from '@/lib/auth.server'

export async function GET(request: NextRequest) {
  try {
    requireCron(request)
    const supabase = getSupabaseClient()
    const today = new Date()
    
    // Tutti gli account appartengono all'unica versione PRO.
    const { data: profiles, error: fetchError } = await supabase
      .from('profiles')
      .select('id, ai_credits_total, ai_credits_used, ai_credits_reset_date')
      .lte('ai_credits_reset_date', today.toISOString().split('T')[0])
    
    if (fetchError) {
      console.error('Error fetching profiles:', fetchError)
      return NextResponse.json(
        { error: 'fetch_error', message: fetchError.message },
        { status: 500 }
      )
    }
    
    if (!profiles || profiles.length === 0) {
      return NextResponse.json({
        success: true,
        resetCount: 0,
        message: 'No users to reset',
        timestamp: new Date().toISOString(),
      })
    }
    
    let resetCount = 0
    
    for (const profile of profiles) {
      const newTotal = 200
      const nextResetDate = getNextMonthFirstDay()
      
      // Accumula credits non usati (fino al cap)
      const currentRemaining = (profile.ai_credits_total || 0) - (profile.ai_credits_used || 0)
      const cap = 500
      const accumulated = Math.min(currentRemaining + newTotal, cap)
      
      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          ai_credits_total: accumulated,
          ai_credits_used: 0,
          ai_credits_reset_date: nextResetDate,
        })
        .eq('id', profile.id)
      
      if (updateError) {
        console.error(`Error updating profile ${profile.id}:`, updateError)
        continue
      }
      
      // Log transaction
      await supabase.from('ai_credit_transactions').insert({
        user_id: profile.id,
        amount: newTotal,
        type: 'monthly_grant',
        description: 'Monthly PRO credits grant',
      })
      
      resetCount++
    }
    
    return NextResponse.json({
      success: true,
      resetCount,
      timestamp: new Date().toISOString(),
    })
  } catch (error: unknown) {
    console.error('Credit reset failed:', error)
    const status = error instanceof AccessError ? error.status : 500
    return NextResponse.json(
      { error: 'internal_error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status }
    )
  }
}

function getNextMonthFirstDay(): string {
  const now = new Date()
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  return next.toISOString().split('T')[0]
}




