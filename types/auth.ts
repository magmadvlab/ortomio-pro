/**
 * Enhanced Authentication Types
 * Tipi per sistema di autenticazione migliorato
 */

/**
 * Dati di registrazione completi
 */
export interface RegistrationData {
  // Credenziali autenticazione
  email: string;
  password: string;
  confirmPassword: string;
  
  // Dati personali obbligatori
  firstName: string;
  lastName: string;
  
  // Dati personali opzionali
  phone?: string;
  birthDate?: string;
  company?: string;
  
  // Consensi e compliance (obbligatori)
  termsAccepted: boolean;
  privacyAccepted: boolean;
  marketingConsent: boolean;
}

/**
 * Risposta registrazione
 */
export interface RegistrationResponse {
  success: boolean;
  user?: any; // Supabase User type
  profile?: UserProfile;
  error?: AuthError;
  requiresEmailVerification: boolean;
  message?: string;
}

/**
 * Profilo utente esteso
 */
export interface UserProfile {
  id: string; // References auth.users(id)
  
  // Informazioni personali
  firstName: string;
  lastName: string;
  phone?: string;
  birthDate?: Date;
  company?: string;
  avatarUrl?: string;
  
  // Stato sistema
  tier: 'FREE' | 'PROFESSIONAL' | 'ENTERPRISE';
  emailVerified: boolean;
  phoneVerified: boolean;
  onboardingCompleted: boolean;
  
  // AI e crediti
  aiCreditsTotal: number;
  aiCreditsUsed: number;
  
  // Preferenze e impostazioni
  preferences: {
    language: string;
    timezone: string;
    units: 'metric' | 'imperial';
    notifications: NotificationPreferences;
  };
  
  // Compliance e consensi
  termsAcceptedAt?: Date;
  privacyAcceptedAt?: Date;
  marketingConsent: boolean;
  
  // Timestamp
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Preferenze notifiche
 */
export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  weatherAlerts: boolean;
  taskReminders: boolean;
  harvestNotifications: boolean;
}

/**
 * Errore autenticazione
 */
export interface AuthError {
  type: RegistrationErrorType;
  field?: string;
  message: string;
  code: string;
}

/**
 * Tipi di errore registrazione
 */
export enum RegistrationErrorType {
  INVALID_EMAIL = 'INVALID_EMAIL',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  TERMS_NOT_ACCEPTED = 'TERMS_NOT_ACCEPTED',
  PRIVACY_NOT_ACCEPTED = 'PRIVACY_NOT_ACCEPTED',
  PASSWORD_MISMATCH = 'PASSWORD_MISMATCH',
  DATABASE_ERROR = 'DATABASE_ERROR'
}

/**
 * Richiesta reset password
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Conferma reset password
 */
export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Risposta reset password
 */
export interface PasswordResetResponse {
  success: boolean;
  message: string;
  error?: AuthError;
}

/**
 * Validazione form
 */
export interface FormValidation {
  isValid: boolean;
  errors: AuthError[];
}

/**
 * Stato form registrazione
 */
export interface RegistrationFormState {
  data: RegistrationData;
  validation: FormValidation;
  isSubmitting: boolean;
  isSuccess: boolean;
}