import 'server-only'
import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'
import { AccessError, requireGardenAccess } from '@/lib/auth.server'
import { requireSupabase } from '@/lib/supabase-server'
import { notificationRetryDecision, type NotificationDeliveryRow } from '@/services/notificationDeliveryService'
import type { SupabaseClient } from '@supabase/supabase-js'

export const agronomistRequestSchema = z.object({
  requestId: z.string().uuid(), gardenId: z.string().uuid(), agronomistId: z.string().uuid(),
  topic: z.string().trim().min(3).max(200), notes: z.string().trim().min(10).max(4000),
  urgency: z.enum(['standard', 'urgent']),
}).strict()
const contactSchema = z.object({ email: z.string().email(), name: z.string().min(1) })
const configuration = () => ({ key: process.env.RESEND_API_KEY, from: process.env.AGRONOMIST_REQUEST_FROM || process.env.ORGANIZATION_INVITATION_FROM })
type Dependencies = { authorize?: typeof requireGardenAccess; client?: () => SupabaseClient; config?: typeof configuration; fetcher?: typeof fetch }

export async function sendAgronomistEmail(input: { recipient: string; replyTo: string; subject: string; text: string; id: string }, config = configuration(), fetcher = fetch) {
  if (!config.key || !config.from) throw new Error('Servizio email non configurato.')
  const response = await fetcher('https://api.resend.com/emails', {
    method: 'POST', signal: AbortSignal.timeout(15_000),
    headers: { Authorization: `Bearer ${config.key}`, 'Content-Type': 'application/json', 'Idempotency-Key': `agronomist/${input.id}` },
    body: JSON.stringify({ from: config.from, to: [input.recipient], reply_to: input.replyTo, subject: input.subject, text: input.text }),
  })
  const payload = await response.json().catch(() => null)
  if (!response.ok || typeof payload?.id !== 'string' || !payload.id) throw new Error('Il servizio email non ha confermato l’invio.')
  return payload.id as string
}

export async function processAgronomistRequest(client: SupabaseClient, row: NotificationDeliveryRow & { garden_id?: string; created_at?: string }, dependencies: Dependencies = {}) {
  try {
    // Revalidate persisted queue data: authenticated users can enqueue rows under RLS.
    const input = agronomistRequestSchema.parse(row.payload)
    if (input.gardenId !== row.garden_id || !row.created_at || Date.now() - Date.parse(row.created_at) > 23 * 60 * 60_000) throw new Error('Richiesta scaduta o non valida.')
    const garden = await client.from('gardens').select('id,name').eq('id', input.gardenId).eq('user_id', row.user_id).single()
    const contact = await client.from('agronomists').select('name,email').eq('id', input.agronomistId).eq('user_id', row.user_id).single()
    const user = await client.auth.admin.getUserById(row.user_id)
    if (garden.error || contact.error || user.error || !user.data.user?.email || !user.data.user.email_confirmed_at) throw new Error('Verifica terreno, contatto e indirizzo email dell’account.')
    const recipient = contactSchema.parse(contact.data)
    if (recipient.email !== row.recipient) throw new Error('Il contatto è cambiato. Crea una nuova richiesta.')
    const since = new Date(Date.now() - 86400_000).toISOString()
    const rate = await client.from('notification_delivery_queue').select('id', { count: 'exact', head: true }).eq('user_id', row.user_id).eq('notification_type', 'agronomist_request').in('status', ['sent', 'delivered']).gte('sent_at', since)
    if (rate.error || (rate.count ?? 0) >= 10) throw new Error('Limite giornaliero di invii raggiunto.')
    const messageId = await sendAgronomistEmail({ id: row.id, recipient: recipient.email, replyTo: user.data.user.email,
      subject: `Richiesta di consulto: ${input.topic}`, text: `Richiesta da ${user.data.user.email}\nTerreno: ${garden.data.name}\nPriorità richiesta: ${input.urgency === 'urgent' ? 'Urgente' : 'Standard'}\nOggetto: ${input.topic}\n\n${input.notes}\n\nRispondi a questa email per concordare disponibilità, modalità e compenso.` }, (dependencies.config ?? configuration)(), dependencies.fetcher)
    const saved = await client.from('notification_delivery_queue').update({ status: 'sent', provider_message_id: messageId, sent_at: new Date().toISOString(), locked_at: null, last_error: null }).eq('id', row.id).eq('status', 'processing').select('id').single()
    if (saved.error || !saved.data) throw new Error('Conferma di invio non registrata.')
    return { status: 'sent' as const }
  } catch (cause) {
    const expired = !row.created_at || !Number.isFinite(Date.parse(row.created_at)) || Date.now() - Date.parse(row.created_at) > 23 * 60 * 60_000
    const decision = notificationRetryDecision(expired ? row.max_attempts : row.attempts, row.max_attempts)
    const saved = await client.from('notification_delivery_queue').update({ status: decision.status, next_attempt_at: decision.nextAttemptAt, failed_at: new Date().toISOString(), locked_at: null, last_error: cause instanceof Error ? cause.message : 'Invio non riuscito.' }).eq('id', row.id).eq('status', 'processing')
    if (saved.error) throw new Error('Impossibile registrare l’esito della richiesta.')
    return { status: decision.status }
  }
}

export async function handleAgronomistRequest(request: NextRequest, dependencies: Dependencies = {}) {
  try {
    const input = agronomistRequestSchema.parse(await request.json())
    const { user } = await (dependencies.authorize ?? requireGardenAccess)(request, input.gardenId)
    const config = (dependencies.config ?? configuration)()
    if (!config.key || !config.from) return NextResponse.json({ error: 'Il servizio email deve essere configurato dall’amministratore prima dell’invio.' }, { status: 503 })
    const client = (dependencies.client ?? requireSupabase)()
    const contact = await client.from('agronomists').select('name,email').eq('id', input.agronomistId).eq('user_id', user.id).single()
    if (contact.error || !contactSchema.safeParse(contact.data).success) return NextResponse.json({ error: 'Seleziona un tuo agronomo con indirizzo email valido.' }, { status: 400 })
    const key = `agronomist:${user.id}:${input.requestId}`
    const write = await client.from('notification_delivery_queue').upsert({ user_id: user.id, garden_id: input.gardenId, channel: 'email', notification_type: 'agronomist_request', recipient: contact.data.email, subject: input.topic, payload: input, idempotency_key: key, max_attempts: 3 }, { onConflict: 'idempotency_key', ignoreDuplicates: true })
    if (write.error) throw new Error('Richiesta non registrata. Riprova.')
    const queued = await client.from('notification_delivery_queue').select('*').eq('idempotency_key', key).eq('user_id', user.id).single()
    if (queued.error || !queued.data) throw new Error('Impossibile rileggere la richiesta.')
    const original = agronomistRequestSchema.parse(queued.data.payload)
    if (Object.keys(input).some(key => input[key as keyof typeof input] !== original[key as keyof typeof input])) return NextResponse.json({ error: 'Questa richiesta è già stata registrata con altri dati. Controlla lo storico.' }, { status: 409 })
    // Claim only the new row. Repeated submissions return its status without sending twice.
    if (queued.data.status === 'scheduled') {
      const claimed = await client.from('notification_delivery_queue').update({ status: 'processing', attempts: 1, locked_at: new Date().toISOString() }).eq('id', queued.data.id).eq('status', 'scheduled').select('*').maybeSingle()
      if (claimed.error) throw new Error('Impossibile avviare l’invio.')
      if (claimed.data) await processAgronomistRequest(client, claimed.data, dependencies)
    }
    const result = await client.from('notification_delivery_queue').select('id,status,created_at,sent_at,last_error').eq('id', queued.data.id).eq('user_id', user.id).single()
    if (result.error || !result.data) throw new Error('Impossibile leggere l’esito. Controlla lo storico prima di riprovare.')
    return NextResponse.json(result.data)
  } catch (cause) {
    const status = cause instanceof AccessError ? cause.status : cause instanceof z.ZodError || cause instanceof SyntaxError ? 400 : 500
    return NextResponse.json({ error: status === 400 ? 'Controlla terreno, contatto, oggetto e descrizione.' : cause instanceof AccessError ? cause.code : 'Operazione non completata. Controlla lo storico e riprova.' }, { status })
  }
}

export async function listAgronomistRequests(request: NextRequest) {
  try {
    const gardenId = z.string().uuid().parse(request.nextUrl.searchParams.get('gardenId'))
    const { user } = await requireGardenAccess(request, gardenId)
    const { data, error } = await requireSupabase().from('notification_delivery_queue').select('id,subject,status,created_at,sent_at,last_error').eq('user_id', user.id).eq('garden_id', gardenId).eq('notification_type', 'agronomist_request').order('created_at', { ascending: false }).limit(20)
    if (error) throw error
    return NextResponse.json({ requests: data })
  } catch (cause) { return NextResponse.json({ error: 'Impossibile caricare lo storico richieste.' }, { status: cause instanceof AccessError ? cause.status : cause instanceof z.ZodError ? 400 : 500 }) }
}
