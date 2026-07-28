import { NextRequest, NextResponse } from 'next/server'
import { verifyTier } from '@/lib/auth.server'
import { getSupabaseClient, isSupabaseAvailable } from '@/lib/auth.server'
import { CREDIT_COSTS, getCreditCost, type CreditFeature } from '@/lib/credits'
import { consumeAICredits, isInsufficientAICreditsError } from '@/lib/ai-credits.server'

const isCreditFeature = (value: unknown): value is CreditFeature =>
  typeof value === 'string' && value in CREDIT_COSTS

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseAvailable()) {
      return NextResponse.json(
        { error: 'cloud_storage_unavailable' },
        { status: 503 }
      )
    }

    // Verify tier PRO
    const result = await verifyTier(request, ['PLUS', 'PRO'])
    
    if ('error' in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      )
    }
    
    const { user, profile } = result
    const { feature, metadata } = await request.json()
    
    if (!isCreditFeature(feature)) {
      return NextResponse.json(
        { error: 'invalid_feature' },
        { status: 400 }
      )
    }

    const amount = getCreditCost(feature)
    
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
    
    const supabase = getSupabaseClient()
    const remaining = await consumeAICredits(supabase, {
      userId: user.id,
      amount,
      feature,
      description: `Used ${amount} credits for ${feature}`,
      metadata: metadata && typeof metadata === 'object' && !Array.isArray(metadata)
        ? metadata as Record<string, unknown>
        : {},
    })
    
    return NextResponse.json({
      success: true,
      creditsUsed: amount,
      creditsRemaining: remaining,
    })
  } catch (error: unknown) {
    console.error('Deduct credits error:', error)
    if (isInsufficientAICreditsError(error)) {
      return NextResponse.json(
        { error: 'insufficient_credits', message: 'Credits insufficienti' },
        { status: 402 }
      )
    }
    return NextResponse.json(
      { error: 'internal_error' },
      { status: 500 }
    )
  }
}







