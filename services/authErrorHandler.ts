/**
 * Authentication Error Handler
 * Gestione centralizzata errori di autenticazione
 */

import { AuthError, RegistrationErrorType } from '@/types/auth';

/**
 * Tipi di errore sessione
 */
export enum SessionErrorType {
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  NETWORK_ERROR = 'NETWORK_ERROR'
}

/**
 * Classe per gestione errori autenticazione
 */
export class AuthErrorHandler {
  
  /**
   * Gestione errori registrazione
   */
  public handleRegistrationError(error: any): AuthError {
    if (error?.message?.includes('Error sending confirmation email')) {
      return {
        type: RegistrationErrorType.DATABASE_ERROR,
        message: 'Impossibile inviare l\'email di conferma. Riprova piu tardi o contatta il supporto.',
        code: 'SUPABASE_005'
      };
    }

    // Errori Supabase specifici
    if (error?.code) {
      switch (error.code) {
        case 'email_address_invalid':
          return {
            type: RegistrationErrorType.INVALID_EMAIL,
            field: 'email',
            message: 'Indirizzo email non valido',
            code: 'SUPABASE_001'
          };
          
        case 'signup_disabled':
          return {
            type: RegistrationErrorType.DATABASE_ERROR,
            message: 'Registrazione temporaneamente disabilitata',
            code: 'SUPABASE_002'
          };
          
        case 'email_address_not_authorized':
          return {
            type: RegistrationErrorType.EMAIL_ALREADY_EXISTS,
            field: 'email',
            message: 'Questo indirizzo email è già registrato',
            code: 'SUPABASE_003'
          };
          
        case 'weak_password':
          return {
            type: RegistrationErrorType.WEAK_PASSWORD,
            field: 'password',
            message: 'Password troppo debole. Usa almeno 8 caratteri con maiuscole, minuscole, numeri e simboli',
            code: 'SUPABASE_004'
          };
          
        default:
          console.error('Supabase registration error:', error);
          return {
            type: RegistrationErrorType.DATABASE_ERROR,
            message: 'Errore durante la registrazione. Riprova più tardi.',
            code: 'SUPABASE_UNKNOWN'
          };
      }
    }
    
    // Errori di rete
    if (error?.message?.includes('fetch')) {
      return {
        type: RegistrationErrorType.DATABASE_ERROR,
        message: 'Errore di connessione. Verifica la tua connessione internet.',
        code: 'NETWORK_001'
      };
    }
    
    // Errore generico
    return {
      type: RegistrationErrorType.DATABASE_ERROR,
      message: error?.message || 'Errore sconosciuto durante la registrazione',
      code: 'UNKNOWN_001'
    };
  }
  
  /**
   * Gestione errori login
   */
  public handleLoginError(error: any): AuthError {
    if (error?.code) {
      switch (error.code) {
        case 'invalid_credentials':
          return {
            type: RegistrationErrorType.INVALID_EMAIL,
            message: 'Email o password non corretti',
            code: 'LOGIN_001'
          };
          
        case 'email_not_confirmed':
          return {
            type: RegistrationErrorType.DATABASE_ERROR,
            message: 'Conferma il tuo indirizzo email prima di accedere',
            code: 'LOGIN_002'
          };
          
        case 'too_many_requests':
          return {
            type: RegistrationErrorType.DATABASE_ERROR,
            message: 'Troppi tentativi di accesso. Riprova tra qualche minuto.',
            code: 'LOGIN_003'
          };
          
        default:
          return {
            type: RegistrationErrorType.DATABASE_ERROR,
            message: 'Errore durante l\'accesso. Riprova più tardi.',
            code: 'LOGIN_UNKNOWN'
          };
      }
    }
    
    return {
      type: RegistrationErrorType.DATABASE_ERROR,
      message: error?.message || 'Errore sconosciuto durante l\'accesso',
      code: 'LOGIN_GENERIC'
    };
  }
  
  /**
   * Gestione errori reset password
   */
  public handlePasswordResetError(error: any): AuthError {
    if (error?.code) {
      switch (error.code) {
        case 'email_address_invalid':
          return {
            type: RegistrationErrorType.INVALID_EMAIL,
            field: 'email',
            message: 'Indirizzo email non valido',
            code: 'RESET_001'
          };
          
        case 'email_not_found':
          // Per sicurezza, non rivelare se l'email esiste o meno
          return {
            type: RegistrationErrorType.DATABASE_ERROR,
            message: 'Se l\'email è registrata, riceverai le istruzioni per il reset',
            code: 'RESET_002'
          };
          
        default:
          return {
            type: RegistrationErrorType.DATABASE_ERROR,
            message: 'Errore durante il reset password. Riprova più tardi.',
            code: 'RESET_UNKNOWN'
          };
      }
    }
    
    return {
      type: RegistrationErrorType.DATABASE_ERROR,
      message: error?.message || 'Errore sconosciuto durante il reset password',
      code: 'RESET_GENERIC'
    };
  }
  
  /**
   * Gestione errori sessione
   */
  public handleSessionError(errorType: SessionErrorType): AuthError {
    switch (errorType) {
      case SessionErrorType.SESSION_EXPIRED:
        return {
          type: RegistrationErrorType.DATABASE_ERROR,
          message: 'La tua sessione è scaduta. Effettua nuovamente l\'accesso.',
          code: 'SESSION_001'
        };
        
      case SessionErrorType.INVALID_TOKEN:
        return {
          type: RegistrationErrorType.DATABASE_ERROR,
          message: 'Token di autenticazione non valido.',
          code: 'SESSION_002'
        };
        
      case SessionErrorType.INSUFFICIENT_PERMISSIONS:
        return {
          type: RegistrationErrorType.DATABASE_ERROR,
          message: 'Non hai i permessi necessari per questa operazione.',
          code: 'SESSION_003'
        };
        
      case SessionErrorType.RATE_LIMIT_EXCEEDED:
        return {
          type: RegistrationErrorType.DATABASE_ERROR,
          message: 'Troppe richieste. Riprova tra qualche minuto.',
          code: 'SESSION_004'
        };
        
      case SessionErrorType.NETWORK_ERROR:
        return {
          type: RegistrationErrorType.DATABASE_ERROR,
          message: 'Errore di connessione. Verifica la tua connessione internet.',
          code: 'SESSION_005'
        };
        
      default:
        return {
          type: RegistrationErrorType.DATABASE_ERROR,
          message: 'Errore di sessione sconosciuto.',
          code: 'SESSION_UNKNOWN'
        };
    }
  }
  
  /**
   * Log errore per debugging e audit
   */
  public logError(error: AuthError, context: string): void {
    const logData = {
      timestamp: new Date().toISOString(),
      context,
      error: {
        type: error.type,
        field: error.field,
        message: error.message,
        code: error.code
      }
    };
    
    // In produzione, invia a servizio di logging
    if (process.env.NODE_ENV === 'production') {
      console.error('Auth Error:', logData);
      // TODO: Invia a servizio di monitoring (Sentry, LogRocket, etc.)
    } else {
      console.warn('Auth Error (Development):', logData);
    }
  }
  
  /**
   * Verifica se errore è critico (richiede intervento immediato)
   */
  public isCriticalError(error: AuthError): boolean {
    const criticalCodes = [
      'SUPABASE_002', // signup_disabled
      'NETWORK_001',  // Errori di rete
      'SESSION_002',  // Token invalido
      'SESSION_003'   // Permessi insufficienti
    ];
    
    return criticalCodes.includes(error.code);
  }
}

// Istanza singleton
export const authErrorHandler = new AuthErrorHandler();
