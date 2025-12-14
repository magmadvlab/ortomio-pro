import { NextRequest, NextResponse } from 'next/server'
import { verifyTier } from '@/lib/auth.server'
import { getSupabaseClient, isSupabaseAvailable } from '@/lib/auth.server'

export async function POST(request: NextRequest) {
  try {
    // In locale senza Supabase, simula successo (credits illimitati)
    if (!isSupabaseAvailable()) {
      const { amount, feature, metadata } = await request.json()
      return NextResponse.json({
        success: true,
        remaining: 999,
        deducted: amount,
        feature,
        metadata,
      })
    }

    // Verify tier PRO
    const result = await verifyTier(request, ['PRO', 'PRO_CONSUMER', 'PRO_PROFESSIONAL'])
    
    if ('error' in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      )
    }
    
    const { user, profile } = result
    const { amount, feature, metadata } = await request.json()
    
    // Validate input
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'invalid_amount' },
        { status: 400 }
      )
    }
    
    // Check credits available
    const available = (profile.ai_credits_total || 0) - (profile.ai_credits_used || 0)
    
    if (available < amount) {
      return NextResponse.json(
        {
          error: 'insufficient_credits',
          message: `Credits insufficienti. Servono ${amount} credits, ne hai ${available}.`,
          data: {
            required: amount,
            available,
            resetDate: profile.ai_credits_reset_date,
          },
        },
        { status: 402 }
      )
    }
    
    // Deduct credits using database function
    const supabase = getSupabaseClient()
    const { error: deductError } = await supabase.rpc('deduct_credits', {
      p_user_id: user.id,
      p_amount: amount,
    })
    
    if (deductError) {
      if (deductError.message.includes('insufficient_credits')) {
        return NextResponse.json(
          {
            error: 'insufficient_credits',
            message: 'Credits insufficienti',
          },
          { status: 402 }
        )
      }
      throw deductError
    }
    
    // Log transaction
    await supabase.from('ai_credit_transactions').insert({
      user_id: user.id,
      amount: -amount, // Negative for usage
      type: 'usage',
      feature,
      description: `Used ${amount} credits for ${feature}`,
      metadata,
    })
    
    // Return updated credits
    const { data: updatedProfile } = await supabase
      .from('profiles')
      .select('ai_credits_total, ai_credits_used')
      .eq('id', user.id)
      .single()
    
    const remaining = (updatedProfile?.ai_credits_total || 0) - (updatedProfile?.ai_credits_used || 0)
    
    return NextResponse.json({
      success: true,
      creditsUsed: amount,
      creditsRemaining: remaining,
    })
  } catch (error: any) {
    console.error('Deduct credits error:', error)
    return NextResponse.json(
      { error: 'internal_error', message: error.message },
      { status: 500 }
    )
  }
}







