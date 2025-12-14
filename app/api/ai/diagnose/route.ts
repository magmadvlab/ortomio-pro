import { NextRequest, NextResponse } from 'next/server'
import { verifyTier } from '@/lib/auth.server'
import { getSupabaseClient } from '@/lib/auth.server'
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
    const { image, symptoms, plantType } = await request.json()
    
    // Check credits (cost: 3 credits)
    const cost = getCreditCost('diagnose')
    const available = (profile.ai_credits_total || 0) - (profile.ai_credits_used || 0)
    
    if (available < cost) {
      return NextResponse.json(
        {
          error: 'insufficient_credits',
          message: `Credits insufficienti. Servono ${cost} credits, ne hai ${available}.`,
          data: {
            required: cost,
            available,
            resetDate: profile.ai_credits_reset_date,
          },
        },
        { status: 402 }
      )
    }
    
    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
    
    const prompt = `
Act as an expert plant pathologist. Analyze this image of a plant.
1. Identify the disease, pest, or nutrient deficiency. If healthy, state "Pianta Sana".
2. Estimate the SEVERITY (Low, Medium, High, Critical) based on visual damage.
3. List the observed SYMPTOMS (e.g. yellowing, spots, holes).
4. Identify the probable CAUSE (e.g. fungi, insect, abiotic).
5. Provide a detailed DESCRIPTION of the condition.
6. Provide an IMMEDIATE ACTION plan.
7. Provide LONG TERM CARE/Prevention advice.
8. List specific PRODUCTS if needed.
Response MUST be in ITALIAN JSON format.
${symptoms ? `Sintomi riportati: ${symptoms}` : ''}
${plantType ? `Tipo pianta: ${plantType}` : ''}
    `
    
    const response = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: image,
          mimeType: 'image/jpeg',
        },
      },
    ])
    
    const diagnosis = response.response.text()
    
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
      feature: 'diagnose',
      description: `Diagnosis for ${plantType || 'plant'}`,
      metadata: { plantType, hasImage: true },
    })
    
    // Get updated credits
    const { data: updatedProfile } = await supabase
      .from('profiles')
      .select('ai_credits_total, ai_credits_used')
      .eq('id', user.id)
      .single()
    
    const remaining = (updatedProfile?.ai_credits_total || 0) - (updatedProfile?.ai_credits_used || 0)
    
    return NextResponse.json({
      diagnosis,
      creditsUsed: cost,
      creditsRemaining: remaining,
    })
  } catch (error: any) {
    console.error('Diagnosis error:', error)
    
    if (error.message?.includes('insufficient_credits')) {
      return NextResponse.json(
        {
          error: 'insufficient_credits',
          message: 'Credits insufficienti',
        },
        { status: 402 }
      )
    }
    
    return NextResponse.json(
      { error: 'internal_error', message: error.message || 'Errore durante la diagnosi' },
      { status: 500 }
    )
  }
}







