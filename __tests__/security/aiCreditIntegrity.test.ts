import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import {
  AICreditConsumptionError,
  consumeAICredits,
} from '@/lib/ai-credits.server'

const migration = readFileSync(
  'supabase/migrations/20260728050000_atomic_ai_credit_consumption.sql',
  'utf8'
)

test('AI quota consumption returns the authoritative remaining value', async () => {
  let receivedFunction = ''
  let receivedParameters: Record<string, unknown> | undefined
  const client = {
    rpc: async (functionName: string, parameters: Record<string, unknown>) => {
      receivedFunction = functionName
      receivedParameters = parameters
      return { data: 7, error: null }
    },
  }

  const remaining = await consumeAICredits(client as never, {
    userId: '11111111-1111-4111-8111-111111111111',
    amount: 3,
    feature: 'diagnose',
    description: 'AI diagnosis',
    metadata: { plantType: 'tomato' },
  })

  assert.equal(remaining, 7)
  assert.equal(receivedFunction, 'consume_ai_credits')
  assert.deepEqual(receivedParameters, {
    p_user_id: '11111111-1111-4111-8111-111111111111',
    p_amount: 3,
    p_feature: 'diagnose',
    p_description: 'AI diagnosis',
    p_metadata: { plantType: 'tomato' },
  })
})

test('AI quota consumption distinguishes exhaustion from persistence failure', async () => {
  const insufficientClient = {
    rpc: async () => ({
      data: null,
      error: { code: 'P0001', message: 'insufficient_credits' },
    }),
  }
  const unavailableClient = {
    rpc: async () => ({
      data: null,
      error: { code: '08006', message: 'connection failure' },
    }),
  }

  await assert.rejects(
    () => consumeAICredits(insufficientClient as never, {
      userId: 'user-a',
      amount: 1,
      feature: 'chat',
      description: 'chat',
    }),
    (error: unknown) =>
      error instanceof AICreditConsumptionError &&
      error.code === 'insufficient_credits'
  )

  await assert.rejects(
    () => consumeAICredits(unavailableClient as never, {
      userId: 'user-a',
      amount: 1,
      feature: 'chat',
      description: 'chat',
    }),
    (error: unknown) =>
      error instanceof AICreditConsumptionError &&
      error.code === 'credit_consumption_failed'
  )
})

test('the database RPC updates quota and ledger in one service-role-only transaction', () => {
  assert.match(migration, /CREATE OR REPLACE FUNCTION public\.consume_ai_credits/)
  assert.match(migration, /UPDATE public\.profiles[\s\S]*INSERT INTO public\.ai_credit_transactions/)
  assert.match(migration, /RETURNING[\s\S]*INTO v_remaining/)
  assert.match(
    migration,
    /REVOKE ALL ON FUNCTION public\.consume_ai_credits[\s\S]*FROM PUBLIC, anon, authenticated/
  )
  assert.match(
    migration,
    /GRANT EXECUTE ON FUNCTION public\.consume_ai_credits[\s\S]*TO service_role/
  )
  assert.match(
    migration,
    /REVOKE ALL ON FUNCTION public\.deduct_credits\(uuid, integer\) FROM PUBLIC, anon, authenticated/
  )
})

test('all live AI usage routes use only the atomic quota RPC', () => {
  const routePaths = [
    'app/api/ai/chat/route.ts',
    'app/api/ai/diagnose/route.ts',
    'app/api/ai/generate/route.ts',
    'app/api/ai/recipe/route.ts',
    'app/api/credits/deduct/route.ts',
  ]

  for (const routePath of routePaths) {
    const source = readFileSync(routePath, 'utf8')
    assert.match(source, /consumeAICredits\(/, `${routePath} must consume atomically`)
    assert.doesNotMatch(source, /\.rpc\('deduct_credits'/)
    assert.doesNotMatch(source, /\.from\('ai_credit_transactions'\)\.insert/)
  }
})

test('credit endpoints never invent an unlimited local balance', () => {
  for (const routePath of [
    'app/api/credits/deduct/route.ts',
    'app/api/credits/status/route.ts',
  ]) {
    const source = readFileSync(routePath, 'utf8')
    assert.doesNotMatch(source, /remaining:\s*999|total:\s*999/)
    assert.match(source, /cloud_storage_unavailable/)
    assert.match(source, /status:\s*503/)
  }
})
