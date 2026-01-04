/**
 * Auth Callback Handler
 * Gestisce il callback di autenticazione da Supabase (verifica email, OAuth, etc.)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')
  const error = requestUrl.searchParams.get('error')
  const error_description = requestUrl.searchParams.get('error_description')

  // Se c'è un errore, reindirizza alla pagina di errore
  if (error) {
    console.error('Auth callback error:', error, error_description)
    return NextResponse.redirect(
      new URL(`/auth?error=${encodeURIComponent(error_description || error)}`, request.url)
    )
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase credentials not configured')
    return NextResponse.redirect(new URL('/auth?error=configuration_error', request.url))
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  try {
    // Gestione code (PKCE flow - usato per email confirmation)
    if (code) {
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('Code exchange error:', exchangeError)
        return NextResponse.redirect(
          new URL(`/auth?error=${encodeURIComponent(exchangeError.message)}`, request.url)
        )
      }

      if (data.user) {
        console.log('User authenticated via code:', data.user.email)
        // Reindirizza all'app
        return NextResponse.redirect(new URL('/app', request.url))
      }
    }

    // Gestione token_hash (usato per verifica OTP)
    if (token_hash && type) {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        token_hash,
        type: type as any
      })

      if (verifyError) {
        console.error('Token verification error:', verifyError)
        return NextResponse.redirect(
          new URL(`/auth?error=${encodeURIComponent(verifyError.message)}`, request.url)
        )
      }

      if (data.user) {
        console.log('User verified via token:', data.user.email)
        return NextResponse.redirect(new URL('/app', request.url))
      }
    }

    // Se non c'è né code né token_hash, reindirizza al login
    return NextResponse.redirect(new URL('/auth', request.url))

  } catch (error: any) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(
      new URL(`/auth?error=${encodeURIComponent(error.message || 'unknown_error')}`, request.url)
    )
  }
}