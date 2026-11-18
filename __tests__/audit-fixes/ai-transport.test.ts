import test from 'node:test'
import assert from 'node:assert/strict'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { normalizeLegacyContents, planningImageContents } from '@/lib/ai/legacyContents'
import { configuredExternalProviders, externalRequestSchema, generateExternalContent } from '@/services/externalAI.server'

test('legacy text, photo and structured contents produce valid SDK HTTP conversations', async () => {
  const original = globalThis.fetch
  const image = { inlineData: { mimeType: 'image/jpeg', data: 'AA==' } }
  const fixtures = ['Testo', { parts: [{ text: 'Foto' }, image] }, ['Foto', image], [{ role: 'user', parts: [{ text: 'Testo' }] }]]
  const received: unknown[] = []
  globalThis.fetch = async (_url, init) => {
    const body = JSON.parse(String(init?.body)); received.push(body.contents)
    assert.ok(Array.isArray(body.contents)); assert.equal(body.contents[0].role, 'user')
    assert.ok(Array.isArray(body.contents[0].parts)); assert.equal(typeof body.contents[0].parts[0].text, 'string')
    return Response.json({ candidates: [{ content: { role: 'model', parts: [{ text: 'fixture' }] } }] })
  }
  try {
    for (const contents of fixtures) {
      const model = new GoogleGenerativeAI('synthetic-key').getGenerativeModel({ model: 'fixture' })
      assert.equal((await model.generateContent({ contents: normalizeLegacyContents(contents) })).response.text(), 'fixture')
    }
    assert.equal(received.length, 4)
    for (const invalid of ['', [], null, { parts: [] }, [{ role: 'admin', parts: [{ text: 'x' }] }]]) assert.throws(() => normalizeLegacyContents(invalid))
  } finally { globalThis.fetch = original }
})

test('external providers use server keys, fixed endpoints, bounded settings and reject empty responses', async () => {
  const old = { key: process.env.GROQ_API_KEY, model: process.env.GROQ_MODEL, fetch: globalThis.fetch }
  try {
    process.env.GROQ_API_KEY = 'server-only-fixture'; process.env.GROQ_MODEL = 'approved-model'
    assert.ok(configuredExternalProviders().includes('groq'))
    let calls = 0
    globalThis.fetch = async (url, init) => {
      calls++
      assert.equal(url, 'https://api.groq.com/openai/v1/chat/completions')
      assert.equal((init?.headers as Record<string, string>).Authorization, 'Bearer server-only-fixture')
      assert.equal(init?.redirect, 'error')
      const body = JSON.parse(String(init?.body)); assert.equal(body.temperature, 0); assert.equal(body.model, 'approved-model')
      return Response.json({ choices: [{ message: { content: calls === 1 ? 'fixture' : '' } }] })
    }
    const input = externalRequestSchema.parse({ provider: 'groq', messages: [{ role: 'user', content: 'test' }], temperature: 0 })
    assert.equal((await generateExternalContent(input)).text, 'fixture')
    await assert.rejects(generateExternalContent({ ...input, model: 'arbitrary-paid-model' }), /model_not_allowed/)
    await assert.rejects(generateExternalContent(input), /invalid_provider_response/)
    assert.equal(calls, 2)
    assert.throws(() => externalRequestSchema.parse({ ...input, maxTokens: 999999 }))
    delete process.env.GROQ_API_KEY
    assert.ok(!configuredExternalProviders().includes('groq'))
    await assert.rejects(generateExternalContent(input), /provider_not_configured/)
  } finally {
    globalThis.fetch = old.fetch
    for (const [key, value] of [['GROQ_API_KEY', old.key], ['GROQ_MODEL', old.model]]) { if (value === undefined) delete process.env[key!]; else process.env[key!] = value }
  }
})

test('planning photographs reach the vision model as binary parts, not base64 prose', () => {
  const imageData = { mimeType: 'image/jpeg', data: 'AA==' }
  const contents = planningImageContents([{ role: 'system', content: 'Analizza il terreno' }, { role: 'user', content: 'Foto del campo', imageData }])
  assert.deepEqual(contents[1].parts, [{ text: 'Foto del campo' }, { inlineData: imageData }])
  assert.throws(() => planningImageContents([{ role: 'user', content: 'x', imageData: { mimeType: 'text/html', data: 'AA==' } }]))
})
