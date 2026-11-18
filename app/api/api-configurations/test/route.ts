import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyTier, getSupabaseClient } from '@/lib/auth.server'
import { ownedConfiguration } from '@/services/apiConfiguration.server'
import { configuredAIProvider } from '@/services/configuredAIProvider.server'
export async function POST(request: NextRequest) {
  const auth = await verifyTier(request, ['FREE', 'PLUS', 'PRO'])
  if ('error' in auth) return NextResponse.json({ message: auth.error }, { status: auth.status })
  try {
    const id = z.string().uuid().parse((await request.json()).id)
    const configuration = await ownedConfiguration(getSupabaseClient(), auth.user.id, id)
    if (!configuration) return NextResponse.json({ message: 'Configurazione non trovata.' }, { status: 404 })
    if (!configuration.service_type.startsWith('ai_')) return NextResponse.json({ success: false, error: 'Test di connessione non disponibile per questo provider meteo.' })
    const result = await configuredAIProvider(configuration).generateContent('Reply with OK.', { maxTokens: 16, temperature: 0 })
    if (!result.text.trim()) throw new Error('empty_response')
    return NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ success: false, error: 'Connessione non verificata: controlla credenziali, modello e configurazione server.' }, { headers: { 'Cache-Control': 'no-store' } })
  }
}
