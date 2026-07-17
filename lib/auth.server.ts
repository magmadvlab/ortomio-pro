/**
 * Authentication and authorization utilities
 * SERVER-ONLY: For Next.js API routes and Server Components
 * DO NOT import this in Client Components!
 */

import 'server-only'
import { createHash, timingSafeEqual } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isBypassActive, getMockUser } from './auth-bypass'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export type AccessErrorCode =
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'invalid_cron_request'
  | 'replayed_cron_request'
  | 'unauthorized_device'

export class AccessError extends Error {
  constructor(
    public readonly code: AccessErrorCode,
    public readonly status: 401 | 403 | 404 | 409,
  ) {
    super(code)
    this.name = 'AccessError'
  }
}

const safeEqual = (actual: string | undefined, expected: string | undefined): boolean => {
  if (!actual || !expected) return false
  const actualBuffer = Buffer.from(actual)
  const expectedBuffer = Buffer.from(expected)
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer)
}

const cronReplayCache = new Map<string, number>()
const CRON_REPLAY_WINDOW_MS = 10 * 60 * 1000

const pruneCronReplayCache = (now: number) => {
  for (const [key, expiresAt] of cronReplayCache.entries()) {
    if (expiresAt <= now) cronReplayCache.delete(key)
  }
}

/**
 * Check if Supabase is available (server-side)
 */
export function isSupabaseAvailable(): boolean {
  return !!(supabaseUrl && supabaseServiceKey)
}

/**
 * Get Supabase client for server-side operations
 * Uses SERVICE_ROLE_KEY - NEVER expose this to client!
 */
export function getSupabaseClient() {
  if (!isSupabaseAvailable()) {
    if (isBypassActive()) {
      throw new Error('BYPASS_MODE')
    }
    throw new Error('Supabase is not configured')
  }
  return createClient(supabaseUrl!, supabaseServiceKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * Get user from request (using cookies)
 */
export async function getUserFromRequest(request: NextRequest) {
  // Se bypass attivo, ritorna mock user senza controllo token
  if (isBypassActive()) {
    return getMockUser()
  }

  // Get access token from Authorization header or cookie
  const authHeader = request.headers.get('authorization')
  const bearer = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : undefined

  const directCookieToken =
    request.cookies.get('sb-access-token')?.value ||
    request.cookies.get('sb-auth-token')?.value

  // Support Supabase project-scoped cookies (e.g. sb-<project-ref>-auth-token)
  // They often contain a JSON payload with access_token/refresh_token.
  let projectScopedToken: string | undefined
  try {
    const allCookies = request.cookies.getAll()
    const projectScopedChunks = allCookies
      .filter((c) => c.name.startsWith('sb-') && (c.name.endsWith('-auth-token') || c.name.includes('-auth-token.')))
      .sort((a, b) => {
        const aIdx = Number((a.name.match(/\.([0-9]+)$/) || [])[1] || 0)
        const bIdx = Number((b.name.match(/\.([0-9]+)$/) || [])[1] || 0)
        return aIdx - bIdx
      })

    const authCookie = projectScopedChunks.find((c) => c.name.endsWith('-auth-token'))
    const raw = authCookie?.value || (projectScopedChunks.length > 0 ? projectScopedChunks.map((c) => c.value).join('') : undefined)

    if (raw) {
      const decoded = (() => {
        try {
          return decodeURIComponent(raw)
        } catch {
          return raw
        }
      })()

      const tryParseSession = (value: string) => {
        try {
          return JSON.parse(value)
        } catch {
          return null
        }
      }

      let parsed = tryParseSession(decoded)

      // Fallback: cookie may be base64 encoded JSON
      if (!parsed) {
        try {
          const b64 = decoded
            .replace(/^base64-/, '')
            .replace(/-/g, '+')
            .replace(/_/g, '/')
          const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4)
          const asJson = Buffer.from(padded, 'base64').toString('utf8')
          parsed = tryParseSession(asJson)
        } catch {
          // ignore
        }
      }

      // Fallback: if it looks like a JWT, use it directly
      if (!parsed) {
        const jwtLike = decoded.split('.')
        if (jwtLike.length === 3 && decoded.length > 40) {
          projectScopedToken = decoded
        }
      }

      if (parsed && typeof parsed === 'object' && typeof (parsed as any).access_token === 'string') {
        projectScopedToken = (parsed as any).access_token
      }
    }
  } catch {
    // ignore cookie parsing issues
  }

  const accessToken = bearer || directCookieToken || projectScopedToken
  
  if (!accessToken) {
    return null
  }
  
  const supabase = getSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser(accessToken)
  
  if (error || !user) {
    return null
  }
  
  return user
}

type AuthorizationDependencies = {
  getUserFromRequestFn?: typeof getUserFromRequest
  getSupabaseClientFn?: typeof getSupabaseClient
  getUserProfileFn?: (userId: string) => Promise<any>
}

export async function requireUser(request: NextRequest, dependencies: AuthorizationDependencies = {}) {
  const user = await (dependencies.getUserFromRequestFn ?? getUserFromRequest)(request)
  if (!user) throw new AccessError('unauthorized', 401)
  return user
}

export async function requireAdmin(request: NextRequest, dependencies: AuthorizationDependencies = {}) {
  const user = await requireUser(request, dependencies)
  const profile = await (dependencies.getUserProfileFn ?? getUserProfile)(user.id)
  if (!profile || (profile.role !== 'admin' && !profile.is_superadmin)) {
    throw new AccessError('forbidden', 403)
  }
  return { user, profile }
}

export async function requireGardenAccess(request: NextRequest, gardenId: string, dependencies: AuthorizationDependencies = {}) {
  const user = await requireUser(request, dependencies)
  if (!gardenId) throw new AccessError('not_found', 404)

  if (isBypassActive()) {
    return { user, garden: { id: gardenId, user_id: user.id } }
  }

  const supabase = (dependencies.getSupabaseClientFn ?? getSupabaseClient)()
  const { data: garden, error } = await supabase
    .from('gardens')
    .select('*')
    .eq('id', gardenId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (error || !garden) throw new AccessError('not_found', 404)
  return { user, garden }
}

export async function requireOrganizationAccess(request: NextRequest, organizationId: string, dependencies: AuthorizationDependencies = {}) {
  const user = await requireUser(request, dependencies)
  if (!organizationId) throw new AccessError('not_found', 404)

  if (isBypassActive()) {
    return { user, membership: { organization_id: organizationId, user_id: user.id, status: 'Active' } }
  }

  const supabase = (dependencies.getSupabaseClientFn ?? getSupabaseClient)()
  const { data: membership, error } = await supabase
    .from('organization_members')
    .select('id, organization_id, user_id, role_id, status')
    .eq('organization_id', organizationId)
    .eq('user_id', user.id)
    .eq('status', 'Active')
    .maybeSingle()

  if (error || !membership) throw new AccessError('not_found', 404)
  return { user, membership }
}

export function requireCron(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  const authorization = request.headers.get('authorization')
  if (!safeEqual(authorization ?? undefined, secret ? `Bearer ${secret}` : undefined)) {
    throw new AccessError('invalid_cron_request', 401)
  }

  const now = Date.now()
  const timestampHeader = request.headers.get('x-cron-timestamp')
  if (timestampHeader) {
    const timestamp = Number(timestampHeader)
    if (!Number.isFinite(timestamp) || Math.abs(now - timestamp) > CRON_REPLAY_WINDOW_MS) {
      throw new AccessError('invalid_cron_request', 401)
    }
  }

  pruneCronReplayCache(now)
  const requestId = request.headers.get('x-vercel-id') || request.headers.get('x-cron-request-id')
  const fallbackWindow = Math.floor(now / 60_000)
  const replayMaterial = `${request.method}:${request.nextUrl.pathname}:${requestId || fallbackWindow}`
  const replayKey = createHash('sha256').update(replayMaterial).digest('hex')
  if (cronReplayCache.has(replayKey)) throw new AccessError('replayed_cron_request', 409)
  cronReplayCache.set(replayKey, now + CRON_REPLAY_WINDOW_MS)

  return { requestId: requestId || null }
}

export function requireDeviceSource(request: NextRequest, deviceId: string) {
  const token = request.headers.get('x-device-token') || request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  let deviceTokens: Record<string, string> = {}

  try {
    deviceTokens = JSON.parse(process.env.IOT_DEVICE_TOKENS_JSON || '{}')
  } catch {
    throw new AccessError('unauthorized_device', 401)
  }

  const expectedToken = deviceTokens[deviceId]
  const developmentFallback = process.env.NODE_ENV === 'development'
    ? process.env.IOT_WEBHOOK_SECRET
    : undefined

  if (!safeEqual(token ?? undefined, expectedToken || developmentFallback)) {
    throw new AccessError('unauthorized_device', 401)
  }

  return { deviceId }
}

export function isAccessError(error: unknown): error is AccessError {
  return error instanceof AccessError
}

export function accessErrorResponse(error: unknown) {
  if (!isAccessError(error)) return null
  return NextResponse.json({ error: error.code }, { status: error.status })
}

/**
 * Get user profile with tier
 */
export async function getUserProfile(userId: string) {
  // Se bypass attivo, ritorna mock profile con tier PRO
  if (isBypassActive()) {
    return {
      id: userId,
      tier: 'PRO',
      created_at: new Date().toISOString(),
    }
  }

  const supabase = getSupabaseClient()
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error || !profile) {
    return null
  }
  
  return profile
}

/**
 * Verify user tier from request
 */
export async function verifyTier(
  request: NextRequest,
  requiredTiers: string[] = ['PLUS', 'PRO']
) {
  const user = await getUserFromRequest(request)
  
  if (!user) {
    return {
      error: 'unauthorized',
      status: 401,
    }
  }
  
  const profile = await getUserProfile(user.id)
  
  if (!profile) {
    return {
      error: 'profile_not_found',
      status: 404,
    }
  }
  
  const userTier = profile.tier || 'FREE'
  
  // Map legacy tiers to new ones for comparison
  const normalizedTier = 
    userTier === 'PRO_CONSUMER' ? 'PLUS' :
    userTier === 'PRO_PROFESSIONAL' ? 'PRO' :
    userTier === 'PRO' && !requiredTiers.includes('PRO') ? 'PLUS' : // Legacy PRO defaults to PLUS if PRO not required
    userTier
  
  // Normalize required tiers (map legacy to new)
  const normalizedRequiredTiers = requiredTiers.map(tier => 
    tier === 'PRO_CONSUMER' ? 'PLUS' :
    tier === 'PRO_PROFESSIONAL' ? 'PRO' :
    tier
  )
  
  // Check if user has required tier (with legacy tier support)
  const hasAccess = normalizedRequiredTiers.includes(normalizedTier) ||
                    normalizedRequiredTiers.includes(userTier) || // Direct match for legacy tiers
                    (userTier === 'PRO' && normalizedRequiredTiers.includes('PLUS')) || // Legacy PRO = PLUS
                    (userTier === 'PRO_PROFESSIONAL' && normalizedRequiredTiers.includes('PRO')) || // Legacy PRO_PROFESSIONAL = PRO
                    (userTier === 'PRO_CONSUMER' && normalizedRequiredTiers.includes('PLUS')) // Legacy PRO_CONSUMER = PLUS
  
  if (!hasAccess) {
    return {
      error: 'insufficient_tier',
      status: 403,
      tier: userTier,
      required: requiredTiers,
    }
  }
  
  return {
    user,
    profile,
    tier: userTier,
  }
}

/**
 * Require specific tier (throws if not met)
 */
export async function requireTier(
  request: NextRequest,
  tier: string
): Promise<{ user: any; profile: any }> {
  const result = await verifyTier(request, [tier])
  
  if ('error' in result) {
    throw new Error(result.error)
  }
  
  return {
    user: result.user,
    profile: result.profile,
  }
}
