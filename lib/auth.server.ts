/**
 * Authentication and authorization utilities
 * SERVER-ONLY: For Next.js API routes and Server Components
 * DO NOT import this in Client Components!
 */

import 'server-only'
import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
  // Get access token from Authorization header or cookie
  const authHeader = request.headers.get('authorization')
  const accessToken = authHeader?.replace('Bearer ', '') || 
                      request.cookies.get('sb-access-token')?.value ||
                      request.cookies.get('sb-auth-token')?.value
  
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
  requiredTiers: string[] = ['PRO', 'PRO_CONSUMER', 'PRO_PROFESSIONAL']
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
  
  // Check if user has required tier
  const hasAccess = requiredTiers.includes(userTier) || 
                    (userTier === 'PRO' && requiredTiers.includes('PRO_CONSUMER')) // Legacy PRO = PRO_CONSUMER
  
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

