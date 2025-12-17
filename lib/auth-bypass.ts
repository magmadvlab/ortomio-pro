/**
 * Authentication Bypass Utilities
 * Sistema di bypass completo per sviluppo locale
 * Permette di testare l'app senza autenticazione Supabase
 */

/**
 * Verifica se siamo in ambiente di sviluppo locale
 */
export const isLocalDevelopment = (): boolean => {
  if (typeof window === 'undefined') {
    // Server-side: controlla solo NODE_ENV
    return process.env.NODE_ENV === 'development';
  }
  
  // Client-side: controlla hostname e variabile d'ambiente
  const isLocalhost = 
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '[::1]';
  
  const bypassEnabled = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
  const isDev = process.env.NODE_ENV === 'development';
  
  return isLocalhost && (bypassEnabled || isDev);
};

/**
 * Mock user object per sviluppo locale
 */
export const getMockUser = () => {
  return {
    id: 'local-dev-user-' + Date.now(),
    email: 'dev@localhost',
    email_confirmed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    app_metadata: {
      provider: 'local-dev',
      providers: ['local-dev'],
    },
    user_metadata: {
      name: 'Local Dev User',
      tier: 'PRO',
    },
    aud: 'authenticated',
    confirmation_sent_at: undefined,
    recovery_sent_at: undefined,
    last_sign_in_at: new Date().toISOString(),
    role: 'authenticated',
  };
};

/**
 * Verifica se il bypass è attivo
 */
export const isBypassActive = (): boolean => {
  return isLocalDevelopment() && process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
};

/**
 * Log helper per debug
 */
export const logBypassStatus = () => {
  if (isBypassActive()) {
    console.log('🔓 Auth Bypass ACTIVE - Running in local development mode without Supabase');
  }
};

