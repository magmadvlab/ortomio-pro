'use client'

import React, { useState, useEffect } from 'react'
import { X, Lock, AlertTriangle, Trash2 } from 'lucide-react'
import { getSupabaseClient } from '@/config/supabase'

interface DeleteGardenConfirmProps {
  gardenName: string
  onConfirm: () => Promise<void>
  onCancel: () => void
}

export function DeleteGardenConfirm({ gardenName, onConfirm, onCancel }: DeleteGardenConfirmProps) {
  const [password, setPassword] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [requiresPassword, setRequiresPassword] = useState(false)

  useEffect(() => {
    // Verifica se serve password (solo se utente è autenticato con Supabase)
    const checkAuth = async () => {
      const supabase = getSupabaseClient()
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser()
        setRequiresPassword(!!user)
      } else {
        setRequiresPassword(false)
      }
    }
    checkAuth()
  }, [])

  const handleDelete = async () => {
    setIsDeleting(true)
    setError(null)

    try {
      // Verifica se Supabase è configurato e se l'utente è autenticato
      const supabase = getSupabaseClient()
      
      if (supabase) {
        // Versione PRO/PLUS: richiedi password
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          // Utente autenticato: richiedi password
          if (!password.trim()) {
            setError('Inserisci la password per confermare l\'eliminazione')
            setIsDeleting(false)
            return
          }

          // Verifica password con reauthentication
          const { error: authError } = await supabase.auth.signInWithPassword({
            email: user.email || '',
            password: password,
          })

          if (authError) {
            throw new Error('Password non corretta')
          }
        } else {
          // Supabase configurato ma utente non autenticato
          // Per sicurezza, richiedi comunque conferma esplicita
          if (!window.confirm(`Sei sicuro di voler eliminare definitivamente l'orto "${gardenName}"? Questa azione è irreversibile.`)) {
            setIsDeleting(false)
            return
          }
        }
      } else {
        // Versione FREE (localStorage): richiedi solo conferma
        if (!window.confirm(`Sei sicuro di voler eliminare definitivamente l'orto "${gardenName}"? Questa azione è irreversibile.`)) {
          setIsDeleting(false)
          return
        }
      }

      // Password corretta o conferma data, procedi con l'eliminazione
      await onConfirm()
    } catch (err: any) {
      setError(err.message || 'Errore durante la verifica della password')
      setIsDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
            <h2 className="text-lg md:text-xl font-bold text-gray-900">
              Conferma Eliminazione
            </h2>
          </div>
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="p-3 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            Stai per eliminare definitivamente l'orto <strong>"{gardenName}"</strong>.
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Questa azione è irreversibile. Tutti i dati associati (task, raccolti, foto, ecc.) verranno eliminati.
          </p>
          {requiresPassword && (
            <>
              <p className="text-sm font-semibold text-gray-900 mb-4">
                Inserisci la tua password per confermare:
              </p>

              {/* Password Input */}
              <div className="relative">
            <Lock className="absolute left-3 top-3/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError(null)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isDeleting) {
                  handleDelete()
                }
              }}
              placeholder="Inserisci la tua password"
              disabled={isDeleting}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              disabled={isDeleting}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
            </>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Annulla
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting || (requiresPassword && !password.trim())}
            className="flex-1 py-3 px-4 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Eliminazione...
              </>
            ) : (
              <>
                <Trash2 size={18} />
                Elimina Definitivamente
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

