/**
 * Registration API Endpoint
 * Handles complete user registration with dual record creation
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/config/supabase'
import { RegistrationData, RegistrationResponse, RegistrationErrorType } from '@/types/auth'
import { registrationValidator } from '@/services/registrationValidator'
import { authErrorHandler } from '@/services/authErrorHandler'
import { resolveAuthSiteUrl as resolveConfiguredAuthSiteUrl } from '@/lib/auth-site-url'
import { getSupabaseServerClient } from '@/lib/supabase-server'

const resolveRegistrationAuthSiteUrl = (): string => {
  return resolveConfiguredAuthSiteUrl(
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.SITE_URL,
    process.env.NEXTAUTH_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : null
  )
}

const isConfirmationEmailError = (error: unknown): error is { message: string } => {
  return Boolean(
    error &&
      typeof error === 'object' &&
      'message' in error &&
      typeof (error as { message?: unknown }).message === 'string' &&
      (error as { message: string }).message.includes('Error sending confirmation email')
  )
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: RegistrationData = await request.json()
    const sanitizedBody: RegistrationData = {
      ...body,
      birthDate: body.birthDate?.trim() || undefined
    }
    
    // Log per debug
    console.log('Registration request body:', JSON.stringify(sanitizedBody, null, 2))
    
    // Validazione registration data
    const validation = registrationValidator.validate(sanitizedBody)
    console.log('Validation result:', JSON.stringify(validation, null, 2))
    
    if (!validation.isValid) {
      // Mostra il primo errore di validazione come messaggio principale
      const firstError = validation.errors[0]
      return NextResponse.json({
        success: false,
        error: {
          type: RegistrationErrorType.MISSING_REQUIRED_FIELD,
          message: firstError?.message || 'Dati di registrazione non validi',
          code: 'REG_VALIDATION_001',
          field: firstError?.field,
          details: validation.errors
        },
        requiresEmailVerification: false
      } as RegistrationResponse, { status: 400 })
    }

    const normalizedBirthDate = registrationValidator.normalizeBirthDate(sanitizedBody.birthDate) ?? undefined

    const profileUpdateData = {
      first_name: sanitizedBody.firstName,
      last_name: sanitizedBody.lastName,
      phone: sanitizedBody.phone || null,
      birth_date: normalizedBirthDate || null,
      company: sanitizedBody.company || null,
      terms_accepted_at: new Date().toISOString(),
      privacy_accepted_at: new Date().toISOString(),
      marketing_consent: sanitizedBody.marketingConsent
    }

    // Get Supabase client
    const supabase = getSupabaseClient()
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: {
          type: RegistrationErrorType.DATABASE_ERROR,
          message: 'Servizio di autenticazione non disponibile',
          code: 'REG_SERVICE_001'
        },
        requiresEmailVerification: false
      } as RegistrationResponse, { status: 503 })
    }

    // Create Supabase auth user
    const authSiteUrl = resolveRegistrationAuthSiteUrl()

    let authData: any = null
    let authError: any = null
    let registrationMessage: string | undefined

    const signUpResult = await supabase.auth.signUp({
      email: body.email,
      password: body.password,
      options: {
        emailRedirectTo: `${authSiteUrl}/auth/callback`,
        data: {
          first_name: sanitizedBody.firstName,
          last_name: sanitizedBody.lastName,
          phone: sanitizedBody.phone,
          company: sanitizedBody.company,
          birth_date: normalizedBirthDate,
          marketing_consent: sanitizedBody.marketingConsent
        }
      }
    })

    authData = signUpResult.data
    authError = signUpResult.error

    if (authError) {
      console.error('Supabase auth error:', JSON.stringify(authError, null, 2))
      console.error('Auth error message:', authError.message)
      console.error('Auth error status:', authError.status)

      if (isConfirmationEmailError(authError)) {
        return NextResponse.json({
          success: false,
          error: {
            type: RegistrationErrorType.DATABASE_ERROR,
            message: 'La registrazione e stata creata ma la mail di conferma non e partita. Controlla la configurazione SMTP/Supabase e riprova.',
            code: 'REG_EMAIL_001',
            details: [
              'Verifica le impostazioni email del progetto Supabase',
              'Controlla SMTP, sender e template di conferma',
              'Usa la pagina di verifica per reinviare la mail dopo la correzione'
            ]
          },
          requiresEmailVerification: true
        } as RegistrationResponse, { status: 502 })
      }
    }

    if (authError) {
      
      const handledError = authErrorHandler.handleRegistrationError(authError)
      authErrorHandler.logError(handledError, 'registration_api')
      
      return NextResponse.json({
        success: false,
        error: {
          ...handledError,
          // Aggiungi dettagli originali per debug
          originalMessage: authError.message,
          originalStatus: authError.status
        },
        requiresEmailVerification: false
      } as RegistrationResponse, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({
        success: false,
        error: {
          type: RegistrationErrorType.DATABASE_ERROR,
          message: 'Errore durante la creazione dell\'utente',
          code: 'REG_USER_001'
        },
        requiresEmailVerification: false
      } as RegistrationResponse, { status: 500 })
    }

    // Verifica che l'utente sia stato effettivamente creato nel database
    console.log('User created:', authData.user.id, authData.user.email)

    // Il profilo viene creato automaticamente dal trigger on_auth_user_created
    // Aspettiamo un momento per permettere al trigger di completare
    await new Promise(resolve => setTimeout(resolve, 100))

    const profileClient = getSupabaseServerClient() || supabase

    const { data: profileResult, error: profileError } = await profileClient
      .from('profiles')
      .update(profileUpdateData)
      .eq('id', authData.user.id)
      .select()
      .single()

    if (profileError) {
      console.error('Profile update error:', profileError)
      // Non è critico se l'update fallisce, il profilo base è già stato creato dal trigger
      console.log('Profile update failed but user was created successfully')
    }

    // Determine if email verification is required
    const requiresEmailVerification = !authData.session || !authData.user?.email_confirmed_at

    // Success response
    return NextResponse.json({
      success: true,
      user: authData.user,
      profile: profileResult,
      requiresEmailVerification,
      message: registrationMessage || (requiresEmailVerification 
        ? 'Registrazione completata! Controlla la tua email per verificare l\'account.'
        : 'Registrazione completata con successo!')
    } as RegistrationResponse, { status: 201 })

  } catch (error: any) {
    console.error('Registration API error:', error)
    
    const handledError = authErrorHandler.handleRegistrationError(error)
    authErrorHandler.logError(handledError, 'registration_api_catch')
    
    return NextResponse.json({
      success: false,
      error: {
        type: RegistrationErrorType.DATABASE_ERROR,
        message: 'Errore interno del server durante la registrazione',
        code: 'REG_SERVER_001'
      },
      requiresEmailVerification: false
    } as RegistrationResponse, { status: 500 })
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
