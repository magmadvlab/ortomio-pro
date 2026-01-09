'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getSupabaseClient } from '@/config/supabase'
import { Mail, CheckCircle, AlertCircle, Loader2, RefreshCw, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

function VerifyEmailPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [resending, setResending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isVerified, setIsVerified] = useState(false)

  useEffect(() => {
    // Ottieni email dai parametri URL o da localStorage
    const emailParam = searchParams.get('email')
    const storedEmail = localStorage.getItem('ortomio_pending_verification_email')
    
    if (emailParam) {
      setEmail(emailParam)
      localStorage.setItem('ortomio_pending_verification_email', emailParam)
    } else if (storedEmail) {
      setEmail(storedEmail)
    }

    // Controlla se l'utente ha già verificato l'email
    checkVerificationStatus()
  }, [searchParams])

  const checkVerificationStatus = async () => {
    try {
      const supabase = getSupabaseClient()
      if (!supabase) return

      const { data: { session } } = await supabase.auth.getSession()
      
      // Controlla ESPLICITAMENTE se l'email è stata confermata
      if (session?.user?.email_confirmed_at) {
        setIsVerified(true)
        // Pulisci localStorage
        localStorage.removeItem('ortomio_pending_verification_email')
        
        // Reindirizza all'app dopo 2 secondi
        setTimeout(() => {
          router.push('/app')
        }, 2000)
      }
      // Se c'è sessione ma email NON confermata, NON reindirizzare
      // L'utente deve restare su questa pagina
    } catch (error) {
      console.error('Error checking verification status:', error)
    }
  }

  const resendVerificationEmail = async () => {
    if (!email) {
      setError('Email non trovata. Torna alla registrazione.')
      return
    }

    setResending(true)
    setError(null)
    setMessage(null)

    try {
      const supabase = getSupabaseClient()
      if (!supabase) {
        throw new Error('Servizio di autenticazione non disponibile')
      }

      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/app`
        }
      })

      if (resendError) {
        throw resendError
      }

      setMessage('Email di verifica inviata nuovamente! Controlla la tua casella di posta.')
    } catch (err: any) {
      console.error('Resend verification error:', err)
      setError(err.message || 'Errore durante il reinvio dell\'email')
    } finally {
      setResending(false)
    }
  }

  const handleBackToAuth = () => {
    // Pulisci localStorage e torna alla pagina di autenticazione
    localStorage.removeItem('ortomio_pending_verification_email')
    router.push('/auth')
  }

  if (isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <CheckCircle size={64} className="text-green-600 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Email Verificata!</h1>
          <p className="text-gray-600 mb-6">
            La tua email è stata confermata con successo. Stai per essere reindirizzato all'applicazione...
          </p>
          <Loader2 size={24} className="animate-spin text-green-600 mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <Mail size={64} className="text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verifica la tua Email</h1>
          <p className="text-gray-600">
            Abbiamo inviato un link di verifica al tuo indirizzo email
          </p>
        </div>

        {email && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 text-center">
              <strong>Email inviata a:</strong><br />
              {email}
            </p>
          </div>
        )}

        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">Come procedere:</h3>
          <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
            <li>Controlla la tua casella di posta elettronica</li>
            <li>Cerca l'email da OrtoMio (controlla anche spam/promozioni)</li>
            <li>Clicca sul link di verifica nell'email</li>
            <li>Verrai automaticamente reindirizzato all'app</li>
          </ol>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">{message}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={resendVerificationEmail}
            disabled={resending || !email}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {resending ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Invio in corso...
              </>
            ) : (
              <>
                <RefreshCw size={20} />
                Reinvia Email di Verifica
              </>
            )}
          </button>

          <button
            onClick={handleBackToAuth}
            className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft size={20} />
            Torna alla Registrazione
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Hai già verificato la tua email?{' '}
            <Link href="/auth" className="text-blue-600 hover:text-blue-700 font-medium">
              Accedi
            </Link>
          </p>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 text-center">
            <strong>Non ricevi l'email?</strong><br />
            Controlla la cartella spam o promozioni. Se il problema persiste, 
            prova a reinviare l'email di verifica.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <VerifyEmailPageContent />
    </Suspense>
  )
}