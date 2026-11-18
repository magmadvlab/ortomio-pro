import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyTier, getSupabaseClient } from '@/lib/auth.server'
import { ownedConfiguration } from '@/services/apiConfiguration.server'
import { configuredWeatherForecast } from '@/services/configuredWeatherProvider.server'
const schema = z.object({ id: z.string().uuid().optional(), lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180), days: z.number().int().min(1).max(16) })
export async function POST(request: NextRequest) {
  const auth = await verifyTier(request, ['FREE', 'PLUS', 'PRO'])
  if ('error' in auth) return NextResponse.json({ message: auth.error }, { status: auth.status })
  try {
    const input = schema.parse(await request.json())
    const config = input.id ? await ownedConfiguration(getSupabaseClient(), auth.user.id, input.id) : null
    if (input.id && !config) return NextResponse.json({ message: 'Configurazione non trovata.' }, { status: 404 })
    const forecast = await configuredWeatherForecast(config, input.lat, input.lng, input.days)
    if (!forecast.length) throw new Error('empty_forecast')
    return NextResponse.json({ forecast }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) { return NextResponse.json({ message: 'Previsione non disponibile dal provider selezionato.' }, { status: error instanceof z.ZodError ? 400 : 502 }) }
}
