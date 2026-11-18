import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyTier, getSupabaseClient } from '@/lib/auth.server'
import { configurationSchema, encryptAPISecret, publicConfiguration } from '@/services/apiConfiguration.server'

const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } })
export async function GET(request: NextRequest) {
  const auth = await verifyTier(request, ['FREE', 'PLUS', 'PRO'])
  if ('error' in auth) return json({ message: auth.error }, auth.status)
  const { data, error } = await getSupabaseClient().from('api_configurations').select('*').eq('user_id', auth.user.id).order('service_name').order('is_default', { ascending: false })
  if (error) return json({ message: 'Impossibile leggere le configurazioni.' }, 500)
  return json({ configurations: (data ?? []).map(publicConfiguration) })
}
async function save(request: NextRequest, update: boolean) {
  const auth = await verifyTier(request, ['FREE', 'PLUS', 'PRO'])
  if ('error' in auth) return json({ message: auth.error }, auth.status)
  try {
    const db = getSupabaseClient()
    const body = await request.json()
    let previous
    if (update) {
      const id = z.string().uuid().parse(body.id)
      const result = await db.from('api_configurations').select('*').eq('id', id).eq('user_id', auth.user.id).maybeSingle()
      if (result.error) throw new Error('configuration_read_failed')
      if (!result.data) return json({ message: 'Configurazione non trovata.' }, 404)
      previous = result.data
    }
    const input = configurationSchema.parse({ ...(previous ? publicConfiguration(previous) : {}), ...body, has_api_key: undefined })
    const keyless = ['weather_openmeteo', 'ai_ollama', 'ai_local'].includes(input.service_type)
    if (!previous && !input.api_key && !keyless) return json({ message: 'Inserisci la chiave API.' }, 400)
    const encrypted = input.api_key ? encryptAPISecret(input.api_key, auth.user.id) : previous?.api_key_encrypted ?? (keyless ? encryptAPISecret('', auth.user.id) : null)
    const { data, error } = await db.rpc('save_api_configuration', {
      p_id: previous?.id ?? null, p_user_id: auth.user.id, p_service_name: input.service_type,
      p_provider_name: input.provider_name, p_encrypted_key: encrypted, p_config: input.config ?? {},
      p_is_active: input.is_active ?? true, p_is_default: input.is_default ?? false,
    })
    if (error?.code === '23505') return json({ message: 'Esiste già una configurazione per questo servizio. Modifica quella presente.' }, 409)
    if (error || !data) throw new Error('configuration_write_failed')
    return json({ configuration: publicConfiguration(data) }, update ? 200 : 201)
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof SyntaxError) return json({ message: 'Parametri di configurazione non validi.' }, 400)
    return json({ message: 'Salvataggio non disponibile: verificare configurazione server e migrazione delle credenziali.' }, 503)
  }
}
export const POST = (request: NextRequest) => save(request, false)
export const PATCH = (request: NextRequest) => save(request, true)
export async function DELETE(request: NextRequest) {
  const auth = await verifyTier(request, ['FREE', 'PLUS', 'PRO'])
  if ('error' in auth) return json({ message: auth.error }, auth.status)
  try {
    const id = z.string().uuid().parse((await request.json()).id)
    const { data, error } = await getSupabaseClient().from('api_configurations').delete().eq('id', id).eq('user_id', auth.user.id).select('id')
    if (error) return json({ message: 'Eliminazione non riuscita.' }, 500)
    if (!data?.length) return json({ message: 'Configurazione non trovata.' }, 404)
    return json({ deleted: true })
  } catch { return json({ message: 'Identificativo non valido.' }, 400) }
}
