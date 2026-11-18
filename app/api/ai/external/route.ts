import { NextRequest, NextResponse } from 'next/server'
import { verifyTier, getSupabaseClient } from '@/lib/auth.server'
import { getCreditCost } from '@/lib/credits'
import { consumeAICredits, isInsufficientAICreditsError } from '@/lib/ai-credits.server'
import { configuredExternalProviders, externalRequestSchema, generateExternalContent } from '@/services/externalAI.server'
import { ZodError } from 'zod'

export async function GET(request: NextRequest) {
  const auth = await verifyTier(request, ['PLUS', 'PRO'])
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  return NextResponse.json({ providers: configuredExternalProviders() }, { headers: { 'Cache-Control': 'private, no-store' } })
}
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyTier(request, ['PLUS', 'PRO'])
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const input = externalRequestSchema.parse(await request.json())
    if (!configuredExternalProviders().includes(input.provider)) return NextResponse.json({ error: 'provider_not_configured' }, { status: 503 })
    const cost = getCreditCost('advanced_analysis')
    if ((auth.profile.ai_credits_total || 0) - (auth.profile.ai_credits_used || 0) < cost) return NextResponse.json({ error: 'insufficient_credits' }, { status: 402 })
    const result = await generateExternalContent(input)
    const remaining = await consumeAICredits(getSupabaseClient(), { userId: auth.user.id, amount: cost, feature: 'advanced_analysis', description: `AI provider ${input.provider}` })
    return NextResponse.json({ ...result, creditsUsed: cost, creditsRemaining: remaining })
  } catch (error) {
    if (error instanceof ZodError || error instanceof SyntaxError) return NextResponse.json({ error: 'invalid_request' }, { status: 400 })
    if (isInsufficientAICreditsError(error)) return NextResponse.json({ error: 'insufficient_credits' }, { status: 402 })
    return NextResponse.json({ error: 'provider_request_failed' }, { status: 502 })
  }
}
