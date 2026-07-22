/**
 * Supabase client configuration
 * This will be used in Phase 2+ for cloud storage
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;
let clientInitialized = false;

const ACCESS_TOKEN_COOKIE = 'sb-access-token';

/**
 * Mirrors the current session's access token into a cookie so that
 * server-side code (proxy.ts middleware, API routes) can read it via
 * request.cookies — the Supabase client itself only persists the session
 * in localStorage, which is invisible to the server.
 */
export const syncAuthCookie = (session: { access_token: string; expires_in?: number } | null): void => {
  if (typeof document === 'undefined') return;

  const secureAttr = window.location.protocol === 'https:' ? '; Secure' : '';

  if (session?.access_token) {
    const maxAge = session.expires_in ?? 3600;
    document.cookie = `${ACCESS_TOKEN_COOKIE}=${session.access_token}; path=/; max-age=${maxAge}; SameSite=Lax${secureAttr}`;
  } else {
    document.cookie = `${ACCESS_TOKEN_COOKIE}=; path=/; max-age=0; SameSite=Lax${secureAttr}`;
  }
};

/**
 * Initialize Supabase client
 * Returns null if credentials are not configured (for local development)
 */
export const getSupabaseClient = (): SupabaseClient | null => {
  // Return existing client if already initialized
  if (clientInitialized) {
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
    clientInitialized = true;
    return null;
  }

  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
      global: {
        headers: {
          'X-Client-Info': 'ortomio-web',
        },
      },
    });
    
    clientInitialized = true;

    // Mirror session into cookie for server-side middleware on every auth event.
    // The handler is wrapped in try/catch because a throw here would propagate
    // out of the Supabase SDK's internal _notifyAllSubscribers call, which (per
    // @supabase/auth-js@2.110.8) can leave a concurrently-awaited refresh promise
    // unresolved forever in other components subscribed to the same client —
    // manifesting as a page stuck indefinitely on an auth-loading screen.
    if (typeof window !== 'undefined') {
      supabaseClient.auth.onAuthStateChange((_event, session) => {
        try {
          syncAuthCookie(session);
        } catch (err) {
          console.error('onAuthStateChange handler error (config/supabase.ts):', err);
        }
      });
    }

    return supabaseClient;
  } catch (error) {
    console.error('Error initializing Supabase client:', error);
    clientInitialized = true;
    return null;
  }
};

/**
 * Check if Supabase is configured and available
 */
export const isSupabaseAvailable = (): boolean => {
  return getSupabaseClient() !== null;
};

