'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getSupabaseClient } from '@/config/supabase'
import { Mail, Lock, Loader2, AlertCircle, ArrowRight, Shield, User, Phone, Building, Calendar } from 'lucide-react'
import Link from 'next/link'
import { isBypassActive, logBypassStatus } from '@/lib/auth-bypass'
import { clearInvalidSession } from '@/lib/session-manager'
import { RegistrationData } from '@/types/auth'

type AuthMode = 'login' | 'register'

function AuthPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<AuthMode>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [bypassActive, setBypassActive] = useState(false)

  // Form data
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [company, setCompany] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false
  })

  // Funzione per validare la password
  const validatePassword = (pwd: string): string[] => {
    const errors: string[] = []
    if (pwd.length < 8) errors.push('La password deve essere di almeno 8 caratteri')
    if (!/[A-Z]/.test(pwd)) errors.push('La password deve contenere almeno una lettera maiuscola')
    if (!/[a-z]/.test(pwd)) errors.push('La password deve contenere almeno una lettera minuscola')
    if (!/\d/.test(pwd)) errors.push('La password deve contenere almeno un numero')
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) errors.push('La password deve contenere almeno un carattere speciale (!@#$%^&*...)')
    return errors
  }

  // Aggiorna i requisiti della password in tempo reale
  const updatePasswordRequirements = (pwd: string) => {
    setPasswordRequirements({
      minLength: pwd.length >= 8,
      hasUppercase: /[A-Z]/.test(pwd),
      hasLowercase: /[a-z]/.test(pwd),
      hasNumber: /\d/.test(pwd),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)
    })
  }

  // Handler per il cambio password con validazione in tempo reale
  const handlePasswordChange = (value: string) => {
    setPassword(value)
    updatePasswordRequirements(value)
  }

  // Inizializza modalità da URL
  useEffect(() => {
    const urlMode = searchParams.get('mode')
    if (urlMode === 'register') {
      setMode('register')
    }
  }, [searchParams])

  // Controlla se bypass è attivo
  useEffect(() => {
    if (isBypassActive()) {
      logBypassStatus()
      setBypassActive(true)
      const timer = setTimeout(() => {
        router.push('/app')
        router.refresh()
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [router])

  // Clear session errors on mount
  useEffect(() => {
    clearInvalidSession()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isBypassActive()) {
      router.push('/app')
      router.refresh()
      return
    }

    setError(null)
    setLoading(true)

    try {
      const supabase = getSupabaseClient()
      if (!supabase) {
        throw new Error('Servizio di autenticazione non disponibile')
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        throw authError
      }

      if (data.user) {
        // Controlla se l'email è verificata
        if (!data.user.email_confirmed_at) {
          // Email non verificata, reindirizza alla pagina di verifica
          localStorage.setItem('ortomio_pending_verification_email', email)
          router.push(`/verify-email?email=${encodeURIComponent(email)}`)
          return
        }
        
        router.push('/app')
        router.refresh()
      }
    } catch (err: any) {
      console.error('Login error:', err)
      let errorMessage = 'Errore durante il login. Riprova.'
      if (err.message?.includes('Invalid login credentials')) {
        errorMessage = 'Email o password non valide. Verifica le tue credenziali.'
      } else if (err.message?.includes('Email not confirmed')) {
        errorMessage = 'Email non confermata. Controlla la tua casella di posta e clicca sul link di verifica.'
        // Reindirizza alla pagina di verifica dopo 3 secondi
        setTimeout(() => {
          localStorage.setItem('ortomio_pending_verification_email', email)
          router.push(`/verify-email?email=${encodeURIComponent(email)}`)
        }, 3000)
      } else if (err.message?.includes('User not found')) {
        errorMessage = 'Utente non trovato. Vuoi registrarti?'
        // Suggerisci di passare alla registrazione
        setTimeout(() => {
          setMode('register')
          setError(null)
        }, 2000)
      } else if (err.message) {
        errorMessage = err.message
      }
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Validazione password completa lato client
    const passwordErrors = validatePassword(password)
    if (passwordErrors.length > 0) {
      setError(passwordErrors[0])
      return
    }

    if (password !== confirmPassword) {
      setError('Le password non coincidono')
      return
    }

    if (!termsAccepted) {
      setError('Devi accettare i Termini e Condizioni')
      return
    }

    if (!privacyAccepted) {
      setError('Devi accettare la Privacy Policy')
      return
    }

    setLoading(true)

    try {
      const registrationData: RegistrationData = {
        email,
        password,
        confirmPassword,
        firstName,
        lastName,
        phone: phone || undefined,
        company: company || undefined,
        birthDate: birthDate || undefined,
        termsAccepted,
        privacyAccepted,
        marketingConsent
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      })

      const result = await response.json()
      console.log('Registration API response:', result)
      console.log('Error details:', JSON.stringify(result.error, null, 2))

      if (!response.ok || !result.success) {
        // Mostra errore specifico dal server
        const errorMsg = result.error?.originalMessage || result.error?.message || 'Errore durante la registrazione'
        const errorField = result.error?.field
        if (errorField) {
          console.log('Validation error on field:', errorField)
        }
        throw new Error(errorMsg)
      }

      // Se richiede verifica email, reindirizza alla pagina di verifica
      if (result.requiresEmailVerification) {
        console.log('Email verification required, redirecting to verify-email page')
        // Salva email per la pagina di verifica
        localStorage.setItem('ortomio_pending_verification_email', email)
        // Forza il redirect immediatamente
        window.location.href = `/verify-email?email=${encodeURIComponent(email)}`
        return
      }

      setSuccess(result.message || 'Registrazione completata con successo! Ora puoi effettuare il login.')
      
      // Reset form e passa al login
      setPassword('')
      setConfirmPassword('')
      setTimeout(() => {
        setMode('login')
        setSuccess(null)
      }, 2000)

    } catch (err: any) {
      console.error('Registration error:', err)
      setError(err.message || 'Errore durante la registrazione')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setFirstName('')
    setLastName('')
    setPhone('')
    setCompany('')
    setBirthDate('')
    setTermsAccepted(false)
    setPrivacyAccepted(false)
    setMarketingConsent(false)
    setError(null)
    setSuccess(null)
  }

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode)
    resetForm()
    // Aggiorna URL senza ricaricare la pagina
    const url = new URL(window.location.href)
    if (newMode === 'register') {
      url.searchParams.set('mode', 'register')
    } else {
      url.searchParams.delete('mode')
    }
    window.history.replaceState({}, '', url.toString())
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="OrtoMio" className="w-24 h-24 mx-auto mb-4 object-contain" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {mode === 'login' ? 'Benvenuto in OrtoMio' : 'Registrati su OrtoMio'}
          </h1>
          <p className="text-gray-600">
            {mode === 'login' ? 'Il tuo assistente smart' : 'Crea il tuo account professionale'}
          </p>
        </div>

        {/* Toggle buttons */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => switchMode('login')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              mode === 'login'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Accedi
          </button>
          <button
            onClick={() => switchMode('register')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              mode === 'register'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Registrati
          </button>
        </div>

        {/* Banner bypass attivo */}
        {bypassActive && (
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-300 rounded-lg flex items-start gap-3">
            <Shield size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-800 mb-1">
                🔓 Auth Bypass Attivo
              </p>
              <p className="text-xs text-green-700">
                Modalità sviluppo locale: autenticazione bypassata. Reindirizzamento automatico...
              </p>
            </div>
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        {/* Login Form */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="tua@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="••••••••"
                />
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
                  Accesso in corso...
                </>
              ) : (
                <>
                  Accedi
                  <ArrowRight size={20} />
                </>
              )}
            </button>

            <div className="text-center">
              <Link
                href="/forgot-password"
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Hai dimenticato la password?
              </Link>
            </div>
          </form>
        )}

        {/* Registration Form */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome *
                </label>
                <div className="relative">
                  <User size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    autoComplete="given-name"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Mario"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Cognome *
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  autoComplete="family-name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Rossi"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <div className="relative">
                <Mail size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="mario.rossi@email.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Conferma *
                </label>
                <div className="relative">
                  <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      confirmPassword && confirmPassword !== password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="••••••••"
                  />
                </div>
                {confirmPassword && confirmPassword !== password && (
                  <p className="mt-1 text-xs text-red-600">Le password non coincidono</p>
                )}
              </div>
            </div>

            {/* Requisiti password */}
            {password && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-700 mb-2">Requisiti password:</p>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <div className={passwordRequirements.minLength ? 'text-green-600' : 'text-gray-500'}>
                    {passwordRequirements.minLength ? '✓' : '○'} Almeno 8 caratteri
                  </div>
                  <div className={passwordRequirements.hasUppercase ? 'text-green-600' : 'text-gray-500'}>
                    {passwordRequirements.hasUppercase ? '✓' : '○'} Una maiuscola
                  </div>
                  <div className={passwordRequirements.hasLowercase ? 'text-green-600' : 'text-gray-500'}>
                    {passwordRequirements.hasLowercase ? '✓' : '○'} Una minuscola
                  </div>
                  <div className={passwordRequirements.hasNumber ? 'text-green-600' : 'text-gray-500'}>
                    {passwordRequirements.hasNumber ? '✓' : '○'} Un numero
                  </div>
                  <div className={`col-span-2 ${passwordRequirements.hasSpecial ? 'text-green-600' : 'text-gray-500'}`}>
                    {passwordRequirements.hasSpecial ? '✓' : '○'} Un carattere speciale (!@#$%...)
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Telefono
                </label>
                <div className="relative">
                  <Phone size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="+39 123 456 7890"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Data di nascita
                </label>
                <div className="relative">
                  <Calendar size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="birthDate"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    autoComplete="bday"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                Azienda
              </label>
              <div className="relative">
                <Building size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="company"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  autoComplete="organization"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Nome azienda (opzionale)"
                />
              </div>
            </div>

            <div className="flex items-start gap-3">
              <input
                id="termsAccepted"
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                required
                className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="termsAccepted" className="text-sm text-gray-700">
                Accetto i{' '}
                <Link href="/terms" className="text-green-600 hover:text-green-700 underline">
                  Termini e Condizioni
                </Link>{' '}
                di utilizzo *
              </label>
            </div>

            <div className="flex items-start gap-3">
              <input
                id="privacyAccepted"
                type="checkbox"
                checked={privacyAccepted}
                onChange={(e) => setPrivacyAccepted(e.target.checked)}
                required
                className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="privacyAccepted" className="text-sm text-gray-700">
                Accetto la{' '}
                <Link href="/privacy" className="text-green-600 hover:text-green-700 underline">
                  Privacy Policy
                </Link>{' '}
                e il trattamento dei miei dati personali *
              </label>
            </div>

            <div className="flex items-start gap-3">
              <input
                id="marketingConsent"
                type="checkbox"
                checked={marketingConsent}
                onChange={(e) => setMarketingConsent(e.target.checked)}
                className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="marketingConsent" className="text-sm text-gray-700">
                Accetto di ricevere comunicazioni marketing e newsletter da OrtoMio (opzionale)
              </label>
            </div>

            <button
              type="submit"
              disabled={
                loading || 
                !termsAccepted || 
                !privacyAccepted ||
                !Object.values(passwordRequirements).every(Boolean) ||
                password !== confirmPassword
              }
              className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Registrazione in corso...
                </>
              ) : (
                <>
                  Crea Account
                  <ArrowRight size={20} />
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center">
              * Campi obbligatori
            </p>
          </form>
        )}
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <AuthPageContent />
    </Suspense>
  )
}