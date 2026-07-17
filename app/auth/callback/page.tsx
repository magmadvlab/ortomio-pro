'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { AlertCircle, Loader2 } from 'lucide-react'
import type { EmailOtpType } from '@supabase/supabase-js'
import { getSupabaseClient } from '@/config/supabase'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const completeAuthentication = async () => {
      const callbackError = searchParams.get('error')
      const callbackErrorDescription = searchParams.get('error_description')
      const code = searchParams.get('code')
      const tokenHash = searchParams.get('token_hash')
      const type = searchParams.get('type')
      const next = searchParams.get('next')

      if (callbackError) {
        setError(callbackErrorDescription || callbackError)
        return
      }

      const supabase = getSupabaseClient()
      if (!supabase) {
        setError('Servizio di autenticazione non disponibile')
        return
      }

      try {
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          if (exchangeError) throw exchangeError
        } else if (tokenHash && type) {
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as EmailOtpType,
          })
          if (verifyError) throw verifyError
        } else {
          throw new Error('Link di autenticazione non valido o incompleto')
        }

        if (!active) return

        const isRecovery = type === 'recovery' || next === 'reset-password'
        router.replace(isRecovery ? '/reset-password' : '/app')
      } catch (authError: any) {
        console.error('Auth callback error:', {
          message: authError?.message,
          code: authError?.code,
          status: authError?.status,
        })
        if (active) {
          setError(authError?.message || 'Link di autenticazione non valido o scaduto')
        }
      }
    }

    void completeAuthentication()

    return () => {
      active = false
    }
  }, [router, searchParams])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <AlertCircle size={64} className="text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Link non valido</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/forgot-password"
            className="inline-block py-3 px-6 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Richiedi un nuovo link
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <Loader2 size={64} className="animate-spin text-green-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Accesso in verifica...</h1>
        <p className="text-gray-600">Stiamo completando la procedura in modo sicuro.</p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
          <Loader2 size={64} className="animate-spin text-green-600" />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  )
}
