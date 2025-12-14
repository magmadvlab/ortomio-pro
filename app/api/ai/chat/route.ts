import { NextRequest, NextResponse } from 'next/server'
import { verifyTier, getSupabaseClient } from '@/lib/auth.server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getCreditCost } from '@/lib/credits'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    // Verify tier PRO
    const result = await verifyTier(request, ['PRO', 'PRO_CONSUMER', 'PRO_PROFESSIONAL'])
    
    if ('error' in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      )
    }
    
    const { user, profile } = result
    const { message } = await request.json()
    
    if (!message) {
      return NextResponse.json(
        { error: 'message_required' },
        { status: 400 }
      )
    }
    
    // Check credits (cost: 1 credit)
    const cost = getCreditCost('chat')
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
    
    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
    const response = await model.generateContent(message)
    const reply = response.response.text()
    
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
      feature: 'chat',
      description: 'AI chat request',
    })
    
    // Get updated credits
    const { data: updatedProfile } = await supabase
      .from('profiles')
      .select('ai_credits_total, ai_credits_used')
      .eq('id', user.id)
      .single()
    
    const remaining = (updatedProfile?.ai_credits_total || 0) - (updatedProfile?.ai_credits_used || 0)
    
    return NextResponse.json({
      reply,
      creditsUsed: cost,
      creditsRemaining: remaining,
    })
  } catch (error: any) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: 'internal_error', message: error.message || 'Errore durante la chat' },
      { status: 500 }
    )
  }
}







