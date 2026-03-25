/**
 * Registration Validation Service
 * Servizio per validazione completa dati registrazione
 */

import { RegistrationData, AuthError, RegistrationErrorType, FormValidation } from '@/types/auth';

/**
 * Classe per validazione registrazione
 */
export class RegistrationValidator {
  private static readonly ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
  private static readonly ITALIAN_DATE_PATTERN = /^(\d{2})[\/-](\d{2})[\/-](\d{4})$/;
  
  /**
   * Validazione completa dati registrazione
   */
  public validate(data: RegistrationData): FormValidation {
    const errors: AuthError[] = [];
    
    // Validazione email
    if (!this.isValidEmail(data.email)) {
      errors.push({
        type: RegistrationErrorType.INVALID_EMAIL,
        field: 'email',
        message: 'Inserisci un indirizzo email valido',
        code: 'AUTH_001'
      });
    }
    
    // Validazione password
    const passwordValidation = this.validatePassword(data.password);
    if (!passwordValidation.isValid) {
      errors.push({
        type: RegistrationErrorType.WEAK_PASSWORD,
        field: 'password',
        message: passwordValidation.message,
        code: 'AUTH_002'
      });
    }
    
    // Validazione conferma password
    if (data.password !== data.confirmPassword) {
      errors.push({
        type: RegistrationErrorType.PASSWORD_MISMATCH,
        field: 'confirmPassword',
        message: 'Le password non corrispondono',
        code: 'AUTH_003'
      });
    }
    
    // Validazione campi obbligatori
    this.validateRequiredFields(data, errors);
    
    // Validazione consensi
    this.validateConsents(data, errors);
    
    // Validazione campi opzionali
    this.validateOptionalFields(data, errors);
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Validazione email con regex completa
   */
  private isValidEmail(email: string): boolean {
    if (!email || email.trim().length === 0) return false;
    
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email.trim());
  }
  
  /**
   * Validazione forza password
   */
  private validatePassword(password: string): { isValid: boolean; message: string } {
    if (!password || password.length < 8) {
      return {
        isValid: false,
        message: 'La password deve essere di almeno 8 caratteri'
      };
    }
    
    // Controllo caratteri maiuscoli
    if (!/[A-Z]/.test(password)) {
      return {
        isValid: false,
        message: 'La password deve contenere almeno una lettera maiuscola'
      };
    }
    
    // Controllo caratteri minuscoli
    if (!/[a-z]/.test(password)) {
      return {
        isValid: false,
        message: 'La password deve contenere almeno una lettera minuscola'
      };
    }
    
    // Controllo numeri
    if (!/\d/.test(password)) {
      return {
        isValid: false,
        message: 'La password deve contenere almeno un numero'
      };
    }
    
    // Controllo caratteri speciali
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return {
        isValid: false,
        message: 'La password deve contenere almeno un carattere speciale'
      };
    }
    
    return { isValid: true, message: '' };
  }
  
  /**
   * Validazione campi obbligatori
   */
  private validateRequiredFields(data: RegistrationData, errors: AuthError[]): void {
    const requiredFields = [
      { field: 'firstName', name: 'Nome' },
      { field: 'lastName', name: 'Cognome' }
    ];
    
    requiredFields.forEach(({ field, name }) => {
      const value = data[field as keyof RegistrationData] as string;
      if (!value || value.trim().length === 0) {
        errors.push({
          type: RegistrationErrorType.MISSING_REQUIRED_FIELD,
          field,
          message: `${name} è obbligatorio`,
          code: 'AUTH_004'
        });
      } else if (!this.isValidName(value)) {
        errors.push({
          type: RegistrationErrorType.MISSING_REQUIRED_FIELD,
          field,
          message: `${name} deve contenere solo lettere, spazi, apostrofi e trattini`,
          code: 'AUTH_005'
        });
      }
    });
  }
  
  /**
   * Validazione consensi obbligatori
   */
  private validateConsents(data: RegistrationData, errors: AuthError[]): void {
    if (!data.termsAccepted) {
      errors.push({
        type: RegistrationErrorType.TERMS_NOT_ACCEPTED,
        field: 'termsAccepted',
        message: 'Devi accettare i Termini e Condizioni',
        code: 'AUTH_006'
      });
    }
    
    if (!data.privacyAccepted) {
      errors.push({
        type: RegistrationErrorType.PRIVACY_NOT_ACCEPTED,
        field: 'privacyAccepted',
        message: 'Devi accettare la Privacy Policy',
        code: 'AUTH_007'
      });
    }
  }
  
  /**
   * Validazione campi opzionali
   */
  private validateOptionalFields(data: RegistrationData, errors: AuthError[]): void {
    // Validazione telefono (se fornito)
    if (data.phone && !this.isValidPhone(data.phone)) {
      errors.push({
        type: RegistrationErrorType.MISSING_REQUIRED_FIELD,
        field: 'phone',
        message: 'Numero di telefono non valido (formato: +39 123 456 7890)',
        code: 'AUTH_008'
      });
    }
    
    // Validazione data di nascita (se fornita)
    if (data.birthDate && !this.isValidBirthDate(data.birthDate)) {
      errors.push({
        type: RegistrationErrorType.MISSING_REQUIRED_FIELD,
        field: 'birthDate',
        message: 'Data di nascita non valida',
        code: 'AUTH_009'
      });
    }
    
    // Validazione azienda (se fornita)
    if (data.company && data.company.length > 100) {
      errors.push({
        type: RegistrationErrorType.MISSING_REQUIRED_FIELD,
        field: 'company',
        message: 'Nome azienda troppo lungo (massimo 100 caratteri)',
        code: 'AUTH_010'
      });
    }
  }
  
  /**
   * Validazione nome/cognome
   */
  private isValidName(name: string): boolean {
    if (!name || name.trim().length === 0) return false;
    if (name.length > 50) return false;
    
    // Permette lettere, spazi, apostrofi, trattini, punti
    const nameRegex = /^[A-Za-zÀ-ÿ\s\-'\.]{1,50}$/;
    return nameRegex.test(name.trim());
  }
  
  /**
   * Validazione numero telefono
   */
  private isValidPhone(phone: string): boolean {
    if (!phone || phone.trim().length === 0) return true; // Opzionale
    
    // Formato internazionale: +39 123 456 7890 o +1 234 567 8900
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    return phoneRegex.test(cleanPhone);
  }
  
  /**
   * Validazione data di nascita
   */
  private isValidBirthDate(birthDate: string): boolean {
    return this.normalizeBirthDate(birthDate) !== null;
  }

  /**
   * Normalizza la data di nascita in formato YYYY-MM-DD.
   */
  public normalizeBirthDate(birthDate?: string | null): string | null {
    if (!birthDate) return null;

    const trimmedBirthDate = birthDate.trim();
    if (!trimmedBirthDate) return null;

    const dateParts = this.extractBirthDateParts(trimmedBirthDate);
    if (!dateParts) return null;

    const { year, month, day } = dateParts;
    const date = new Date(Date.UTC(year, month - 1, day));

    if (
      Number.isNaN(date.getTime()) ||
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) {
      return null;
    }

    const today = new Date();
    const todayUtc = Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate()
    );
    const minBirthDateUtc = Date.UTC(
      today.getUTCFullYear() - 120,
      today.getUTCMonth(),
      today.getUTCDate()
    );
    const maxBirthDateUtc = Date.UTC(
      today.getUTCFullYear() - 13,
      today.getUTCMonth(),
      today.getUTCDate()
    );
    const birthDateUtc = date.getTime();

    if (birthDateUtc < minBirthDateUtc || birthDateUtc > maxBirthDateUtc) {
      return null;
    }

    return `${year.toString().padStart(4, '0')}-${month
      .toString()
      .padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  }

  private extractBirthDateParts(value: string): { year: number; month: number; day: number } | null {
    const isoMatch = value.match(RegistrationValidator.ISO_DATE_PATTERN);
    if (isoMatch) {
      return {
        year: Number(isoMatch[1]),
        month: Number(isoMatch[2]),
        day: Number(isoMatch[3])
      };
    }

    const isoDateTimePrefix = value.match(/^(\d{4}-\d{2}-\d{2})T/);
    if (isoDateTimePrefix) {
      return this.extractBirthDateParts(isoDateTimePrefix[1]);
    }

    const italianMatch = value.match(RegistrationValidator.ITALIAN_DATE_PATTERN);
    if (italianMatch) {
      return {
        day: Number(italianMatch[1]),
        month: Number(italianMatch[2]),
        year: Number(italianMatch[3])
      };
    }

    return null;
  }
  
  /**
   * Validazione real-time per singolo campo
   */
  public validateField(field: string, value: any, data: RegistrationData): AuthError | null {
    switch (field) {
      case 'email':
        return !this.isValidEmail(value) ? {
          type: RegistrationErrorType.INVALID_EMAIL,
          field: 'email',
          message: 'Inserisci un indirizzo email valido',
          code: 'AUTH_001'
        } : null;
        
      case 'password':
        const passwordValidation = this.validatePassword(value);
        return !passwordValidation.isValid ? {
          type: RegistrationErrorType.WEAK_PASSWORD,
          field: 'password',
          message: passwordValidation.message,
          code: 'AUTH_002'
        } : null;
        
      case 'confirmPassword':
        return value !== data.password ? {
          type: RegistrationErrorType.PASSWORD_MISMATCH,
          field: 'confirmPassword',
          message: 'Le password non corrispondono',
          code: 'AUTH_003'
        } : null;
        
      case 'firstName':
      case 'lastName':
        return !this.isValidName(value) ? {
          type: RegistrationErrorType.MISSING_REQUIRED_FIELD,
          field,
          message: `${field === 'firstName' ? 'Nome' : 'Cognome'} non valido`,
          code: 'AUTH_005'
        } : null;
        
      case 'phone':
        return value && !this.isValidPhone(value) ? {
          type: RegistrationErrorType.MISSING_REQUIRED_FIELD,
          field: 'phone',
          message: 'Numero di telefono non valido',
          code: 'AUTH_008'
        } : null;
        
      default:
        return null;
    }
  }
}

// Istanza singleton
export const registrationValidator = new RegistrationValidator();
