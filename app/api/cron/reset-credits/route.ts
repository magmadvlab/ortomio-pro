import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/auth'

export async function GET(request: NextRequest) {
  // Verifica auth (Vercel Cron secret)
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
  
  try {
    const supabase = getSupabaseClient()
    const today = new Date()
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    
    // Trova tutti gli utenti PRO con reset_date <= oggi
    const { data: profiles, error: fetchError } = await supabase
      .from('profiles')
      .select('id, tier, ai_credits_total, ai_credits_used, ai_credits_reset_date')
      .in('tier', ['PRO', 'PRO_CONSUMER', 'PRO_PROFESSIONAL'])
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
      const newTotal = profile.tier === 'PRO_PROFESSIONAL' ? 200 : 50
      const nextResetDate = getNextMonthFirstDay()
      
      // Accumula credits non usati (fino al cap)
      const currentRemaining = (profile.ai_credits_total || 0) - (profile.ai_credits_used || 0)
      const cap = profile.tier === 'PRO_PROFESSIONAL' ? 500 : 200
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
        description: `Monthly ${profile.tier} credits grant`,
      })
      
      resetCount++
    }
    
    return NextResponse.json({
      success: true,
      resetCount,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Credit reset failed:', error)
    return NextResponse.json(
      { error: 'internal_error', message: error.message },
      { status: 500 }
    )
  }
}

function getNextMonthFirstDay(): string {
  const now = new Date()
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  return next.toISOString().split('T')[0]
}







