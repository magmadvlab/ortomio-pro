import { NextRequest, NextResponse } from 'next/server'
import { verifyTier } from '@/lib/auth.server'
import { getSupabaseClient } from '@/lib/auth.server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getCreditCost } from '@/lib/credits'
import { consumeAICredits, isInsufficientAICreditsError } from '@/lib/ai-credits.server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    // Verify tier PLUS or PRO
    const result = await verifyTier(request, ['PLUS', 'PRO'])
    
    if ('error' in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      )
    }
    
    const { user, profile } = result
    
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
    
    const supabase = getSupabaseClient()
    const remaining = await consumeAICredits(supabase, {
      userId: user.id,
      amount: cost,
      feature: 'recipe',
      description: 'AI recipe generation',
      metadata: { ingredients, cuisine },
    })
    
    return NextResponse.json({
      recipe,
      creditsUsed: cost,
      creditsRemaining: remaining,
    })
  } catch (error: unknown) {
    console.error('Recipe error:', error)
    if (isInsufficientAICreditsError(error)) {
      return NextResponse.json(
        { error: 'insufficient_credits', message: 'Credits insufficienti' },
        { status: 402 }
      )
    }
    return NextResponse.json(
      { error: 'internal_error', message: 'Errore durante la generazione ricetta' },
      { status: 500 }
    )
  }
}







