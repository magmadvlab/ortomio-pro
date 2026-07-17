'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Loader2, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { getSupabaseClient } from '@/config/supabase'
import { authErrorHandler } from '@/services/authErrorHandler'
import { registrationValidator } from '@/services/registrationValidator'

function ResetPasswordForm() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [validToken, setValidToken] = useState(false)

  // La callback PKCE crea la sessione recovery nel browser prima di arrivare qui.
  useEffect(() => {
    const checkRecoverySession = async () => {
      try {
        const supabase = getSupabaseClient()
        if (!supabase) {
          throw new Error('Servizio di autenticazione non disponibile')
        }

        const { data, error: sessionError } = await supabase.auth.getSession()
        if (sessionError || !data.session) {
          throw sessionError || new Error('Sessione recovery non disponibile')
        }

        setValidToken(true)
      } catch (err: any) {
        console.error('Token validation error:', err)
        setError('Link di reset non valido o scaduto')
      }
    }

    void checkRecoverySession()
  }, [])

  // Calcolo forza password
  const calculatePasswordStrength = (password: string): number => {
    let strength = 0
    if (password.length >= 8) strength += 25
    if (/[A-Z]/.test(password)) strength += 25
    if (/[a-z]/.test(password)) strength += 25
    if (/\d/.test(password)) strength += 25
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength += 25
    return Math.min(strength, 100)
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    setPasswordStrength(calculatePasswordStrength(value))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validazione password
    const passwordValidation = registrationValidator.validateField('password', password, {} as any)
    if (passwordValidation) {
      setError(passwordValidation.message)
      return
    }

    if (password !== confirmPassword) {
      setError('Le password non corrispondono')
      return
    }

    setLoading(true)

    try {
      const supabase = getSupabaseClient()
      if (!supabase) {
        throw new Error('Servizio di autenticazione non disponibile')
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      })

      if (updateError) {
        const handledError = authErrorHandler.handlePasswordResetError(updateError)
        authErrorHandler.logError(handledError, 'reset_password_form')
        throw new Error(handledError.message)
      }

      await supabase.auth.signOut({ scope: 'local' })
      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (err: any) {
      console.error('Password update error:', err)
      setError(err.message || 'Errore durante l\'aggiornamento della password. Riprova.')
    } finally {
      setLoading(false)
    }
  }

  if (!validToken && error) {
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
            Richiedi nuovo link
          </Link>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <CheckCircle size={64} className="text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Password aggiornata!</h1>
          <p className="text-gray-600 mb-6">
            La tua password è stata aggiornata con successo. Stai per essere reindirizzato al login...
          </p>
          <Loader2 size={24} className="animate-spin text-green-600 mx-auto" />
        </div>
      </div>
    )
  }

  if (!validToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <Loader2 size={64} className="animate-spin text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifica in corso...</h1>
          <p className="text-gray-600">Stiamo verificando il tuo link di reset</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Nuova password</h1>
          <p className="text-gray-600">Scegli una password sicura per il tuo account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Nuova Password
            </label>
            <div className="relative">
              <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Almeno 8 caratteri"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
            {/* Indicatore forza password */}
            {password && (
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        passwordStrength < 50 ? 'bg-red-500' :
                        passwordStrength < 75 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${passwordStrength}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600">
                    {passwordStrength < 50 ? 'Debole' :
                     passwordStrength < 75 ? 'Media' : 'Forte'}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Conferma Password
            </label>
            <div className="relative">
              <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ripeti la password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Aggiornamento in corso...
              </>
            ) : (
              'Aggiorna password'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Torna al login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <Loader2 size={64} className="animate-spin text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Caricamento...</h1>
          <p className="text-gray-600">Preparazione della pagina di reset</p>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
