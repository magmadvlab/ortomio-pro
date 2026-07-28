import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'

export type ConsumeAICreditsInput = {
  userId: string
  amount: number
  feature: string
  description: string
  metadata?: Record<string, unknown>
}

export class AICreditConsumptionError extends Error {
  constructor(
    public readonly code: 'insufficient_credits' | 'credit_consumption_failed',
    options?: { cause?: unknown }
  ) {
    super(code, options)
    this.name = 'AICreditConsumptionError'
  }
}

export const consumeAICredits = async (
  client: Pick<SupabaseClient, 'rpc'>,
  input: ConsumeAICreditsInput
): Promise<number> => {
  if (!Number.isInteger(input.amount) || input.amount <= 0) {
    throw new AICreditConsumptionError('credit_consumption_failed')
  }

  const { data, error } = await client.rpc('consume_ai_credits', {
    p_user_id: input.userId,
    p_amount: input.amount,
    p_feature: input.feature,
    p_description: input.description,
    p_metadata: input.metadata ?? {},
  })

  if (error) {
    const insufficient =
      error.message?.includes('insufficient_credits') ||
      error.code === 'P0001'
    throw new AICreditConsumptionError(
      insufficient ? 'insufficient_credits' : 'credit_consumption_failed',
      { cause: error }
    )
  }

  const remaining = typeof data === 'number' ? data : Number(data)
  if (!Number.isInteger(remaining) || remaining < 0) {
    throw new AICreditConsumptionError('credit_consumption_failed')
  }

  return remaining
}

export const isInsufficientAICreditsError = (error: unknown): boolean =>
  error instanceof AICreditConsumptionError && error.code === 'insufficient_credits'
