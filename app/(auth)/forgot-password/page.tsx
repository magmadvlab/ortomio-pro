'use client'

import React, { useState } from 'react'
import { Mail, Loader2, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { getSupabaseClient } from '@/config/supabase'
import { authErrorHandler } from '@/services/authErrorHandler'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !email.includes('@')) {
      setError('Inserisci un indirizzo email valido')
      return
    }

    setLoading(true)

    try {
      const supabase = getSupabaseClient()
      if (!supabase) {
        throw new Error('Servizio di autenticazione non disponibile')
      }

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (resetError) {
        const handledError = authErrorHandler.handlePasswordResetError(resetError)
        authErrorHandler.logError(handledError, 'forgot_password_form')
        throw new Error(handledError.message)
      }

      setSuccess(true)
    } catch (err: any) {
      console.error('Password reset error:', err)
      setError(err.message || 'Errore durante il reset della password. Riprova.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <CheckCircle size={64} className="text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Email inviata!</h1>
          <p className="text-gray-600 mb-6">
            Se l'indirizzo email è registrato nel nostro sistema, riceverai le istruzioni per reimpostare la password.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Controlla anche la cartella spam se non vedi l'email.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
          >
            <ArrowLeft size={20} />
            Torna al login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Recupera password</h1>
          <p className="text-gray-600">Inserisci la tua email per ricevere le istruzioni</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Indirizzo Email
            </label>
            <div className="relative">
              <Mail size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="tua@email.com"
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
                Invio in corso...
              </>
            ) : (
              'Invia istruzioni'
            )}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
          >
            <ArrowLeft size={20} />
            Torna al login
          </Link>
          <p className="text-sm text-gray-600">
            Non hai un account?{' '}
            <Link href="/register" className="text-green-600 hover:text-green-700 font-medium">
              Registrati
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}