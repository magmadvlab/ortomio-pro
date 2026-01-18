/**
 * Authentication Security Controller
 * Sistema di sicurezza per produzione con bypass completamente disattivato
 */

/**
 * Interfaccia per configurazione sicurezza
 */
interface SecurityConfig {
  environment: 'development' | 'staging' | 'production';
  bypassEnabled: boolean;
  securityLevel: 'strict' | 'moderate' | 'development';
}

/**
 * Interfaccia per validazione sicurezza
 */
interface SecurityValidation {
  bypassDisabled: boolean;
  environmentSecure: boolean;
  configurationValid: boolean;
  timestamp: string;
}

/**
 * Controller per gestione sicurezza bypass
 */
class SecurityBypassController {
  private static instance: SecurityBypassController;

  public static getInstance(): SecurityBypassController {
    if (!SecurityBypassController.instance) {
      SecurityBypassController.instance = new SecurityBypassController();
    }
    return SecurityBypassController.instance;
  }

  /**
   * Verifica se il bypass è attivo con controlli di sicurezza tripli
   */
  public isBypassActive(): boolean {
    // CONTROLLO 0: Se BYPASS_AUTH è esplicitamente false, SEMPRE disabilitato
    if (process.env.NEXT_PUBLIC_BYPASS_AUTH === 'false') return false;
    
    // CONTROLLO 1: Ambiente di produzione - SEMPRE disabilitato
    if (process.env.NODE_ENV === 'production') return false;
    if (process.env.VERCEL_ENV === 'production') return false;
    
    // CONTROLLO 2: Ambiente localhost verificato
    const isLocalhost = this.isLocalhostEnvironment();
    if (!isLocalhost) return false;
    
    // CONTROLLO 3: Flag espliciti richiesti (TUTTI devono essere true)
    const hasExplicitFlag = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
    const hasDevFlag = process.env.NEXT_PUBLIC_DEV_MODE === 'true';
    const hasDebugFlag = process.env.NEXT_PUBLIC_DEBUG_AUTH === 'true';
    
    // TUTTI i controlli devono passare per attivare il bypass
    return isLocalhost && hasExplicitFlag && hasDevFlag && hasDebugFlag;
  }

  /**
   * Verifica ambiente localhost sicuro
   */
  private isLocalhostEnvironment(): boolean {
    if (typeof window === 'undefined') {
      // Server-side: verifica solo variabili ambiente
      return process.env.NODE_ENV === 'development';
    }
    
    // Client-side: verifica hostname
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.hostname.endsWith('.local');
  }

  /**
   * Validazione completa sicurezza produzione
   */
  public validateProductionSecurity(): SecurityValidation {
    return {
      bypassDisabled: !this.isBypassActive(),
      environmentSecure: process.env.NODE_ENV === 'production',
      configurationValid: this.validateConfiguration(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Validazione configurazione sicurezza
   */
  private validateConfiguration(): boolean {
    // In produzione, nessun flag di bypass deve essere presente
    if (process.env.NODE_ENV === 'production') {
      return process.env.NEXT_PUBLIC_BYPASS_AUTH !== 'true' &&
             process.env.NEXT_PUBLIC_DEV_MODE !== 'true';
    }
    return true;
  }

  /**
   * Log sicurezza per audit
   */
  public logSecurityStatus(): void {
    const validation = this.validateProductionSecurity();
    
    if (this.isBypassActive()) {
      console.warn('🔓 DEVELOPMENT MODE: Auth Bypass ACTIVE - Local development only');
    } else {
      console.log('🔒 PRODUCTION MODE: Auth Bypass DISABLED - Full security active');
    }
    
    // Log audit per produzione
    if (process.env.NODE_ENV === 'production') {
      console.log('🛡️ Security Audit:', validation);
    }
  }
}

// Istanza singleton
const securityController = SecurityBypassController.getInstance();

/**
 * FUNZIONI PUBBLICHE - Compatibilità con codice esistente
 */

/**
 * Verifica se siamo in ambiente di sviluppo locale (DEPRECATA)
 * @deprecated Usa SecurityBypassController.isBypassActive()
 */
export const isLocalDevelopment = (): boolean => {
  console.warn('⚠️ isLocalDevelopment() is deprecated. Use SecurityBypassController instead.');
  return securityController.isBypassActive();
};

/**
 * Mock user object per sviluppo locale (SOLO se bypass attivo)
 */
export const getMockUser = () => {
  if (!securityController.isBypassActive()) {
    throw new Error('SECURITY_ERROR: Mock user not available in production');
  }
  
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
 * Verifica se il bypass è attivo (SICUREZZA RINFORZATA)
 */
export const isBypassActive = (): boolean => {
  return securityController.isBypassActive();
};

/**
 * Log helper per debug e audit
 */
export const logBypassStatus = () => {
  securityController.logSecurityStatus();
};

/**
 * Validazione sicurezza produzione
 */
export const validateProductionSecurity = (): SecurityValidation => {
  return securityController.validateProductionSecurity();
};

// Export del controller per uso avanzato
export { SecurityBypassController };
export type { SecurityConfig, SecurityValidation };

