/**
 * Authentication utilities for CLIENT COMPONENTS
 * Safe to import in Client Components - no server-only APIs
 */

import { isSupabaseAvailable as checkSupabaseAvailable } from '@/config/supabase'

/**
 * Check if Supabase is available (client-safe)
 * Uses NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY only
 */
export function isSupabaseAvailable(): boolean {
  return checkSupabaseAvailable()
}
















