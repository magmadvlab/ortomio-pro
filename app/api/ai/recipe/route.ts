import { NextRequest, NextResponse } from 'next/server'
import { verifyTier } from '@/lib/auth.server'
import { getSupabaseClient } from '@/lib/auth.server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getCreditCost } from '@/lib/credits'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    // Verify tier PRO_CONSUMER ONLY (not PRO_PROFESSIONAL!)
    const result = await verifyTier(request, ['PRO_CONSUMER', 'PRO']) // Legacy PRO = PRO_CONSUMER
    
    if ('error' in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      )
    }
    
    const { user, profile, tier } = result
    
    // Explicitly check: PRO_PROFESSIONAL cannot access recipes
    if (tier === 'PRO_PROFESSIONAL') {
      return NextResponse.json(
        {
          error: 'feature_not_available',
          message: 'Le ricette AI sono disponibili solo per PRO Consumer, non per PRO Professional.',
        },
        { status: 403 }
      )
    }
    
    const { ingredients, cuisine } = await request.json()
    
    // Check credits (cost: 1 credit)
    const cost = getCreditCost('recipe')
    const available = (profile.ai_credits_total || 0) - (profile.ai_credits_used || 0)
    
    if (available < cost) {
      return NextResponse.json(
        {
          error: 'insufficient_credits',
          message: `Credits insufficienti. Servono ${cost} credits, ne hai ${available}.`,
        },
        { status: 402 }
      )
    }
    
    // Call Gemini API for recipe
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
    
    const prompt = `
Sei un chef italiano esperto. Crea una ricetta tradizionale italiana usando questi ingredienti: ${ingredients || 'ortaggi freschi dell\'orto'}.
${cuisine ? `Stile cucina: ${cuisine}` : ''}

Fornisci:
1. Nome ricetta
2. Ingredienti (lista completa)
3. Preparazione (passo-passo)
4. Tempo preparazione
5. Difficoltà
6. Consigli per servire

Risposta in formato JSON italiano.
    `
    
    const response = await model.generateContent(prompt)
    const recipe = response.response.text()
    
    // Deduct credits
    const supabase = getSupabaseClient()
    await supabase.rpc('deduct_credits', {
      p_user_id: user.id,
      p_amount: cost,
    })
    
    // Log transaction
    await supabase.from('ai_credit_transactions').insert({
      user_id: user.id,
      amount: -cost,
      type: 'usage',
      feature: 'recipe',
      description: 'AI recipe generation',
      metadata: { ingredients, cuisine },
    })
    
    // Get updated credits
    const { data: updatedProfile } = await supabase
      .from('profiles')
      .select('ai_credits_total, ai_credits_used')
      .eq('id', user.id)
      .single()
    
    const remaining = (updatedProfile?.ai_credits_total || 0) - (updatedProfile?.ai_credits_used || 0)
    
    return NextResponse.json({
      recipe,
      creditsUsed: cost,
      creditsRemaining: remaining,
    })
  } catch (error: any) {
    console.error('Recipe error:', error)
    return NextResponse.json(
      { error: 'internal_error', message: error.message || 'Errore durante la generazione ricetta' },
      { status: 500 }
    )
  }
}








