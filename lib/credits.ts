/**
 * Credits utility functions
 * Handles credit costs, deduction, and granting
 */

export type CreditFeature = 'chat' | 'recipe' | 'diagnose' | 'advanced_analysis' | 'technical_advice'

export const CREDIT_COSTS: Record<CreditFeature, number> = {
  chat: 1,
  recipe: 1,
  diagnose: 3,
  advanced_analysis: 5,
  technical_advice: 2,
} as const

/**
 * Get credit cost for a feature
 */
export function getCreditCost(feature: CreditFeature): number {
  return CREDIT_COSTS[feature]
}

/**
 * Deduct credits from user account
 */
export async function deductCredits(
  userId: string,
  amount: number,
  feature: CreditFeature,
  metadata?: any
): Promise<void> {
  const response = await fetch('/api/credits/deduct', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount,
      feature,
      metadata,
    }),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to deduct credits')
  }
}

/**
 * Grant credits to user account
 */
export async function grantCredits(
  userId: string,
  amount: number,
  type: 'monthly_grant' | 'purchase' | 'bonus',
  description?: string
): Promise<void> {
  const response = await fetch('/api/credits/grant', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount,
      type,
      description,
    }),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to grant credits')
  }
}

/**
 * Check if user has enough credits
 */
export async function checkCreditsAvailable(
  userId: string,
  cost: number
): Promise<{ available: boolean; remaining: number }> {
  const response = await fetch('/api/credits/status')
  
  if (!response.ok) {
    throw new Error('Failed to check credits')
  }
  
  const data = await response.json()
  const remaining = data.total - data.used
  
  return {
    available: remaining >= cost,
    remaining,
  }
}













