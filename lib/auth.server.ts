/**
 * Authentication and authorization utilities
 * SERVER-ONLY: For Next.js API routes and Server Components
 * DO NOT import this in Client Components!
 */

import 'server-only'
import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isBypassActive, getMockUser } from './auth-bypass'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

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


