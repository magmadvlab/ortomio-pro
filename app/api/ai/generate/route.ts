import { NextRequest, NextResponse } from 'next/server'
import { verifyTier, getSupabaseClient } from '@/lib/auth.server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getCreditCost, CREDIT_COSTS, type CreditFeature } from '@/lib/credits'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const isCreditFeature = (value: unknown): value is CreditFeature =>
  typeof value === 'string' && value in CREDIT_COSTS

/**
 * Generic server-side Gemini proxy for the legacy client-side AI helpers
 * (geminiService, recipeService, diseaseDiagnosisEngine, photoAnalysisService).
 * Replaces direct client-side GoogleGenerativeAI calls that relied on a
 * publicly exposed NEXT_PUBLIC_GEMINI_API_KEY. The caller builds the same
 * prompt/contents/config it always built; only the actual Gemini call moves
 * server-side, gated by tier and credits like /api/ai/chat.
 */
export async function POST(request: NextRequest) {
  try {
    const result = await verifyTier(request, ['PLUS', 'PRO'])

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    const { user, profile } = result
    const { feature, model: modelName, contents, config } = await request.json()

    if (!isCreditFeature(feature)) {
      return NextResponse.json({ error: 'invalid_feature' }, { status: 400 })
    }

    if (!modelName || typeof modelName !== 'string' || !contents) {
      return NextResponse.json({ error: 'model_and_contents_required' }, { status: 400 })
    }

    const cost = getCreditCost(feature)
    const available = (profile.ai_credits_total || 0) - (profile.ai_credits_used || 0)

    if (available < cost) {
      return NextResponse.json(
        {
          error: 'insufficient_credits',
          message: `Credits insufficienti. Servono ${cost} credits, ne hai ${available}.`,
          data: { required: cost, available, resetDate: profile.ai_credits_reset_date },
        },
        { status: 402 }
      )
    }

    const model = genAI.getGenerativeModel({ model: modelName })
    const response = await model.generateContent({
      contents,
      generationConfig: config,
    })

    const text = response.response.text()

    const supabase = getSupabaseClient()
    await supabase.rpc('deduct_credits', {
      p_user_id: user.id,
      p_amount: cost,
    })

    await supabase.from('ai_credit_transactions').insert({
      user_id: user.id,
      amount: -cost,
      type: 'usage',
      feature,
      description: `Legacy AI proxy request (${feature})`,
    })

    const { data: updatedProfile } = await supabase
      .from('profiles')
      .select('ai_credits_total, ai_credits_used')
      .eq('id', user.id)
      .single()

    const remaining = (updatedProfile?.ai_credits_total || 0) - (updatedProfile?.ai_credits_used || 0)

    return NextResponse.json({
      text,
      creditsUsed: cost,
      creditsRemaining: remaining,
    })
  } catch (error: any) {
    console.error('AI generate proxy error:', error)
    return NextResponse.json(
      { error: 'internal_error', message: error.message || 'Errore durante la generazione AI' },
      { status: 500 }
    )
  }
}
