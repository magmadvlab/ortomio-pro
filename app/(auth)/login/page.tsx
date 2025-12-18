'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/config/supabase'
import { Mail, Lock, Loader2, AlertCircle, ArrowRight, Shield } from 'lucide-react'
import Link from 'next/link'
import { isBypassActive, logBypassStatus } from '@/lib/auth-bypass'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bypassActive, setBypassActive] = useState(false)

  // Controlla se bypass è attivo e reindirizza automaticamente
  useEffect(() => {
    if (isBypassActive()) {
      logBypassStatus()
      setBypassActive(true)
      // Reindirizza automaticamente all'app dopo un breve delay per mostrare il banner
      const timer = setTimeout(() => {
        router.push('/app')
        router.refresh()
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Se bypass attivo, reindirizza direttamente
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
        throw new Error('Supabase non configurato. L\'app funziona in modalità offline.')
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        throw authError
      }

      if (data.user) {
        // Redirect all'app dopo login successo
        router.push('/app')
        router.refresh()
      }
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'Errore durante il login. Riprova.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Benvenuto in OrtoMio</h1>
          <p className="text-gray-600">Accedi al tuo account</p>
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
                Modalità sviluppo locale: autenticazione bypassata. Reindirizzamento automatico all'app...
              </p>
            </div>
          </div>
        )}

        {/* Messaggio login richiesto */}
        {!bypassActive && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Login richiesto:</strong> Per utilizzare OrtoMio, effettua il login o registrati per creare un nuovo account.
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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
        </form>

        <div className="mt-6 text-center">
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

