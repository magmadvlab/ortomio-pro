import { NextRequest, NextResponse } from 'next/server'
import { verifyTier, getSupabaseClient } from '@/lib/auth.server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getCreditCost } from '@/lib/credits'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

type GlobalAIChatContextType =
  | 'garden-context'
  | 'task-context'
  | 'health-context'
  | 'diary-environment-context'
  | 'irrigation-context'
  | 'harvest-maturity-context'
  | 'director-context'

interface GlobalAIChatContextPayload {
  type: GlobalAIChatContextType
  scope?: Record<string, unknown>
  summary?: string
  signals?: Record<string, unknown>
  missingSignals?: string[]
  routingHints?: Array<{
    label: string
    route?: string
  }>
}

const allowedContextTypes = new Set<GlobalAIChatContextType>([
  'garden-context',
  'task-context',
  'health-context',
  'diary-environment-context',
  'irrigation-context',
  'harvest-maturity-context',
  'director-context',
])

const sanitizeText = (value: unknown, maxLength = 1200): string | undefined => {
  if (typeof value !== 'string') {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed.length > maxLength ? `${trimmed.slice(0, maxLength)}...` : trimmed
}

const sanitizeRecord = (value: unknown): Record<string, unknown> | undefined => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([, entryValue]) => ['string', 'number', 'boolean'].includes(typeof entryValue))
      .slice(0, 12)
  )
}

const parseChatContext = (value: unknown): GlobalAIChatContextPayload | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const raw = value as Record<string, unknown>
  const type = raw.type
  if (typeof type !== 'string' || !allowedContextTypes.has(type as GlobalAIChatContextType)) {
    return null
  }

  const routingHints = Array.isArray(raw.routingHints)
    ? raw.routingHints
        .reduce<Array<{ label: string; route?: string }>>((acc, entry) => {
          if (!entry || typeof entry !== 'object') return acc
          const hint = entry as Record<string, unknown>
          const label = sanitizeText(hint.label, 120)
          if (!label) return acc
          acc.push({
            label,
            route: sanitizeText(hint.route, 120),
          })
          return acc
        }, [])
        .slice(0, 5)
    : undefined

  return {
    type: type as GlobalAIChatContextType,
    scope: sanitizeRecord(raw.scope),
    summary: sanitizeText(raw.summary),
    signals: sanitizeRecord(raw.signals),
    missingSignals: Array.isArray(raw.missingSignals)
      ? raw.missingSignals.map((entry) => sanitizeText(entry, 80)).filter(Boolean).slice(0, 10) as string[]
      : undefined,
    routingHints,
  }
}

const buildGlobalChatPrompt = (message: string, context: GlobalAIChatContextPayload | null): string => {
  const contextBlock = context
    ? [
        `CONTESTO DICHIARATO: ${context.type}`,
        context.scope ? `SCOPE: ${JSON.stringify(context.scope)}` : null,
        context.summary ? `SINTESI: ${context.summary}` : null,
        context.signals ? `SEGNALI: ${JSON.stringify(context.signals)}` : null,
        context.missingSignals?.length ? `SEGNALI MANCANTI: ${context.missingSignals.join(', ')}` : null,
        context.routingHints?.length
          ? `AZIONI NAVIGAZIONE DISPONIBILI: ${context.routingHints
              .map((hint) => `${hint.label}${hint.route ? ` (${hint.route})` : ''}`)
              .join('; ')}`
          : null,
      ].filter(Boolean).join('\n')
    : 'NESSUN CONTESTO APPLICATIVO DICHIARATO.'

  return `Sei l'assistente AI di OrtoMio.
Rispondi in italiano, in modo pratico e agronomicamente prudente.
Usa solo il contesto dichiarato sotto; se manca un dato, dichiaralo come limite.
Non dire di avere creato task, registrato operazioni, comandato dispositivi o modificato dati.
Puoi suggerire azioni o moduli da aprire solo come raccomandazioni all'utente.

${contextBlock}

DOMANDA UTENTE:
${message}`
}

export async function POST(request: NextRequest) {
  try {
    // Verify tier PRO
    const result = await verifyTier(request, ['PLUS', 'PRO'])
    
    if ('error' in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      )
    }
    
    const { user, profile } = result
    const { message, context } = await request.json()
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'message_required' },
        { status: 400 }
      )
    }
    const boundedContext = parseChatContext(context)
    
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
    const response = await model.generateContent(buildGlobalChatPrompt(message, boundedContext))
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
      contextAccepted: Boolean(boundedContext),
    })
  } catch (error: any) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: 'internal_error', message: 'Il motore AI non è disponibile in questo momento. Riprova tra poco.' },
      { status: 500 }
    )
  }
}



