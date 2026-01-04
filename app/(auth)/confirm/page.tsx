'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getSupabaseClient } from '@/config/supabase'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

export default function ConfirmPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const supabase = getSupabaseClient()
        if (!supabase) {
          throw new Error('Servizio di autenticazione non disponibile')
        }

        // Ottieni i parametri dalla URL
        const token_hash = searchParams.get('token_hash')
        const type = searchParams.get('type')

        if (!token_hash || type !== 'signup') {
          throw new Error('Link di conferma non valido')
        }

        // Verifica il token
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash,
          type: 'signup'
        })

        if (error) {
          throw error
        }

        if (data.user) {
          setStatus('success')
          setMessage('Email verificata con successo! Stai per essere reindirizzato...')
          
          // Pulisci localStorage
          localStorage.removeItem('ortomio_pending_verification_email')
          
          // Reindirizza all'app dopo 2 secondi
          setTimeout(() => {
            router.push('/app')
          }, 2000)
        } else {
          throw new Error('Verifica fallita')
        }
      } catch (error: any) {
        console.error('Email confirmation error:', error)
        setStatus('error')
        
        if (error.message?.includes('Token has expired')) {
          setMessage('Il link di verifica è scaduto. Richiedi una nuova email di verifica.')
        } else if (error.message?.includes('Invalid token')) {
          setMessage('Link di verifica non valido. Controlla di aver cliccato il link corretto.')
        } else {
          setMessage(error.message || 'Errore durante la verifica dell\'email')
        }
      }
    }

    confirmEmail()
  }, [searchParams, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <Loader2 size={64} className="animate-spin text-blue-600 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Verifica in corso...</h1>
          <p className="text-gray-600">
            Stiamo verificando la tua email. Attendere prego...
          </p>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <CheckCircle size={64} className="text-green-600 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Email Verificata!</h1>
          <p className="text-gray-600 mb-6">{message}</p>
          <Loader2 size={24} className="animate-spin text-green-600 mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <AlertCircle size={64} className="text-red-600 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Errore di Verifica</h1>
        <p className="text-gray-600 mb-6">{message}</p>
        
        <div className="space-y-4">
          <button
            onClick={() => router.push('/verify-email')}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Richiedi Nuova Email
          </button>
          
          <button
            onClick={() => router.push('/auth')}
            className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Torna al Login
          </button>
        </div>
      </div>
    </div>
  )
}