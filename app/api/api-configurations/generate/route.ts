import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyTier, getSupabaseClient } from '@/lib/auth.server'
import { ownedConfiguration } from '@/services/apiConfiguration.server'
import { configuredAIProvider } from '@/services/configuredAIProvider.server'
const inputSchema = z.object({ id: z.string().uuid(), prompt: z.string().min(1).max(100000), schema: z.record(z.string(), z.unknown()).optional(), options: z.object({ model: z.string().max(200).optional(), temperature: z.number().min(0).max(2).optional(), maxTokens: z.number().int().min(1).max(32768).optional(), systemInstruction: z.string().max(20000).optional() }).optional() })
export async function POST(request: NextRequest) {
  const auth = await verifyTier(request, ['FREE', 'PLUS', 'PRO'])
  if ('error' in auth) return NextResponse.json({ message: auth.error }, { status: auth.status })
  try {
    const input = inputSchema.parse(await request.json())
    const configuration = await ownedConfiguration(getSupabaseClient(), auth.user.id, input.id)
    if (!configuration) return NextResponse.json({ message: 'Configurazione non trovata.' }, { status: 404 })
    const provider = configuredAIProvider(configuration)
    if (input.schema && !provider.generateContentWithSchema) return NextResponse.json({ message: 'Questo provider non supporta le risposte strutturate.' }, { status: 422 })
    const result = input.schema ? await provider.generateContentWithSchema!(input.prompt, input.schema, input.options) : await provider.generateContent(input.prompt, input.options)
    if (!result.text.trim()) throw new Error('empty_provider_response')
    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    return NextResponse.json({ message: error instanceof z.ZodError ? 'Richiesta AI non valida.' : 'Il provider non ha completato la richiesta. Verifica chiave, modello e autorizzazione del servizio.' }, { status: error instanceof z.ZodError ? 400 : 502 })
  }
}
