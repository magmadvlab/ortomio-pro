/**
 * Server-side Supabase client helper
 * Lazy initialization to avoid build errors when env vars are missing
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

/**
 * Get Supabase client for server-side operations
 * Returns null if credentials are not configured (for local development)
 */
export function getSupabaseServerClient(): SupabaseClient | null {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // In development, allow build to continue without Supabase
    if (process.env.NODE_ENV === 'development') {
      console.debug('Supabase credentials not configured. API routes will return errors.');
    }
    return null;
  }

  try {
    supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    return supabaseClient;
  } catch (error) {
    console.error('Error initializing Supabase client:', error);
    return null;
  }
}

/**
 * Ensure Supabase is configured, throw error if not
 * Use this in API routes that require Supabase
 */
export function requireSupabase(): SupabaseClient {
  const client = getSupabaseServerClient();
  if (!client) {
    throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
  }
  return client;
}


