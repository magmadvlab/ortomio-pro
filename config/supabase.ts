/**
 * Supabase client configuration
 * This will be used in Phase 2+ for cloud storage
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

/**
 * Initialize Supabase client
 * Returns null if credentials are not configured (for local development)
 */
export const getSupabaseClient = (): SupabaseClient | null => {
  if (supabaseClient) {
    return supabaseClient;
  }

  // Support both Next.js and Vite environments
  const supabaseUrl = typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_SUPABASE_URL || (import.meta as any)?.env?.VITE_SUPABASE_URL)
    : process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY)
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Logga il warning solo una volta per sessione (usa sessionStorage per persistere tra hot reload)
    if (typeof window !== 'undefined') {
      const warningKey = 'supabase_warning_logged';
      if (!sessionStorage.getItem(warningKey)) {
        // In modalità sviluppo, usa console.debug invece di warn per ridurre il rumore
        if (process.env.NODE_ENV === 'development') {
          console.debug('Supabase credentials not configured. Running in local mode.');
        } else {
          console.warn('Supabase credentials not configured. Running in local mode.');
        }
        sessionStorage.setItem(warningKey, 'true');
      }
    }
    return null;
  }

  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    return supabaseClient;
  } catch (error) {
    console.error('Error initializing Supabase client:', error);
    return null;
  }
};

/**
 * Check if Supabase is configured and available
 */
export const isSupabaseAvailable = (): boolean => {
  return getSupabaseClient() !== null;
};

