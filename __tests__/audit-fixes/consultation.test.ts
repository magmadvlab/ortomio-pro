import test from 'node:test'
import assert from 'node:assert/strict'
import { NextRequest } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { AccessError } from '@/lib/auth.server'
import { handleAgronomistRequest, sendAgronomistEmail } from '@/services/agronomistRequest.server'

const input = { requestId: '123e4567-e89b-42d3-a456-426614174000', gardenId: '123e4567-e89b-42d3-a456-426614174001', agronomistId: '123e4567-e89b-42d3-a456-426614174002', topic: 'Sintomi fogliari', notes: 'Osservati da due giorni sul filare A.', urgency: 'standard' }
const config = () => ({ key: 'fixture-key', from: 'fixture@example.test' })
const request = (body = input) => new NextRequest('http://localhost/api/agronomist/requests', { method: 'POST', body: JSON.stringify(body) })
const authorize = async () => ({ user: { id: 'owner' }, garden: { id: input.gardenId } }) as never

test('consultation validates fields, ownership and provider configuration before any persistence or mail', async () => {
  const client = () => { throw new Error('must not reach database') }
  assert.equal((await handleAgronomistRequest(request({ ...input, notes: '' }), { client })).status, 400)
  assert.equal((await handleAgronomistRequest(request(), { authorize: async () => { throw new AccessError('not_found', 404) }, client })).status, 404)
  assert.equal((await handleAgronomistRequest(request(), { authorize, client, config: () => ({ key: undefined, from: undefined }) })).status, 503)
})
test('email sender validates provider response and supplies stable idempotency and reply-to', async () => {
  const message = { id: 'queue-id', recipient: 'agronomo@example.test', replyTo: 'owner@example.test', subject: 'Richiesta', text: 'Fixture, never delivered.' }
  for (const response of [Response.json({ error: 'no' }, { status: 500 }), Response.json({}), new Response('invalid')]) await assert.rejects(sendAgronomistEmail(message, config(), async () => response))
  let sent: RequestInit | undefined
  assert.equal(await sendAgronomistEmail(message, config(), async (_url, init) => { sent = init; return Response.json({ id: 'provider-id' }) }), 'provider-id')
  assert.equal(new Headers(sent?.headers).get('Idempotency-Key'), 'agronomist/queue-id')
  assert.equal(JSON.parse(String(sent?.body)).reply_to, message.replyTo)
})

test('consultation persists, sends once, rereads status and preserves error status on provider failure', async () => {
  for (const providerOK of [true, false]) {
    let row: Record<string, any> | null = null, deliveries = 0
    const client = { auth: { admin: { getUserById: async () => ({ data: { user: { id: 'owner', email: 'owner@example.test', email_confirmed_at: '2026-01-01' } }, error: null }) } }, from(table: string) {
      let mode = 'read', values: Record<string, any> = {}, filters: Array<[string, any]> = [], count = false
      const execute = () => {
        if (table === 'agronomists') return { data: { name: 'Fixture', email: 'agronomo@example.test' }, error: null }
        if (table === 'gardens') return { data: { id: input.gardenId, name: 'Campo prova' }, error: null }
        if (count) return { count: 0, data: null, error: null }
        if (mode === 'upsert') row ??= { ...values, id: 'queue-id', status: 'scheduled', created_at: new Date().toISOString(), attempts: 0 }
        if (filters.some(([key, value]) => row?.[key] !== value)) return { data: null, error: null }
        if (mode === 'update' && row) Object.assign(row, values)
        return { data: row ? structuredClone(row) : null, error: null }
      }
      const query = {
        select: (_columns?: string, options?: { count?: string }) => { count = Boolean(options?.count); return query },
        eq: (key: string, value: any) => { filters.push([key, value]); return query },
        in: () => query, gte: () => query,
        upsert: (value: Record<string, any>) => { mode = 'upsert'; values = value; return query },
        update: (value: Record<string, any>) => { mode = 'update'; values = value; return query },
        single: async () => execute(), maybeSingle: async () => execute(),
        then: (resolve: (value: unknown) => unknown) => Promise.resolve(execute()).then(resolve),
      }; return query
    } } as unknown as SupabaseClient
    const dependencies = { authorize, client: () => client, config, fetcher: async () => { deliveries++; return providerOK ? Response.json({ id: 'provider-id' }) : Response.json({ error: 'refused' }, { status: 500 }) } }
    const first = await handleAgronomistRequest(request(), dependencies)
    assert.equal(first.status, 200)
    assert.equal((await first.json()).status, providerOK ? 'sent' : 'failed')
    const duplicate = await handleAgronomistRequest(request(), dependencies)
    assert.equal((await duplicate.json()).status, providerOK ? 'sent' : 'failed'); assert.equal(deliveries, 1)
    const changed = await handleAgronomistRequest(request({ ...input, notes: 'Una richiesta modificata successivamente.' }), dependencies)
    assert.equal(changed.status, 409); assert.equal(deliveries, 1)
  }
})

test('request history and administrative closure requests require authenticated access', async () => {
  const { listAgronomistRequests } = await import('@/services/agronomistRequest.server')
  assert.equal((await listAgronomistRequests(new NextRequest(`http://localhost/api/agronomist/requests?gardenId=${input.gardenId}`))).status, 401)
  const { GET } = await import('@/app/api/admin/account-closure-requests/route')
  assert.equal((await GET(new NextRequest('http://localhost/api/admin/account-closure-requests'))).status, 401)
})
