import 'server-only'
import { NextRequest, NextResponse } from 'next/server'

type RateLimitPolicy = {
  name: string
  limit: number
  windowMs: number
}

type RateLimitEntry = {
  count: number
  resetAt: number
}

const buckets = new Map<string, RateLimitEntry>()

const requestIp = (request: NextRequest) =>
  request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
  request.headers.get('x-real-ip') ||
  'unknown'

export function enforceRateLimit(request: NextRequest, policy: RateLimitPolicy) {
  const now = Date.now()
  const key = `${policy.name}:${requestIp(request)}`
  const current = buckets.get(key)
  const entry = !current || current.resetAt <= now
    ? { count: 0, resetAt: now + policy.windowMs }
    : current

  entry.count += 1
  buckets.set(key, entry)

  const remaining = Math.max(policy.limit - entry.count, 0)
  const headers = {
    'RateLimit-Limit': String(policy.limit),
    'RateLimit-Remaining': String(remaining),
    'RateLimit-Reset': String(Math.ceil(entry.resetAt / 1000)),
  }

  if (entry.count > policy.limit) {
    return NextResponse.json(
      { error: 'rate_limit_exceeded' },
      {
        status: 429,
        headers: {
          ...headers,
          'Retry-After': String(Math.max(Math.ceil((entry.resetAt - now) / 1000), 1)),
        },
      },
    )
  }

  return { headers }
}

export const RATE_LIMIT_POLICIES = {
  ai: { name: 'ai', limit: 30, windowMs: 60_000 },
  support: { name: 'support', limit: 5, windowMs: 15 * 60_000 },
  provider: { name: 'provider', limit: 15, windowMs: 60_000 },
} as const
