'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

interface PilotRequestFormProps {
  onClose: () => void
}

export default function PilotRequestForm({ onClose }: PilotRequestFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const nameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    nameInputRef.current?.focus()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus('error')
      return
    }

    setStatus('submitting')
    try {
      const formData = new FormData()
      formData.append('name', name)
      formData.append('email', email)
      formData.append('type', 'pilot')
      formData.append('message', message)
      formData.append('includeSystemInfo', 'false')

      const response = await fetch('/api/support/submit', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        setStatus('success')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="mt-6 flex items-start gap-3 rounded-md border border-ortomio-green-600 bg-white p-5 text-sm">
        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-ortomio-green-600" />
        <div>
          <p className="font-bold text-ortomio-green-900">Richiesta inviata.</p>
          <p className="text-gray-700">Ti rispondiamo via email per definire ambito e tempi del pilot.</p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 max-w-md rounded-md border border-ortomio-earth-200 bg-white p-5">
      <div className="mb-4 flex items-start justify-between">
        <p className="text-sm font-bold text-ortomio-green-900">Richiedi un pilot reale sulla tua azienda</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Chiudi il form"
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      <div className="mb-3">
        <label htmlFor="pilot-name" className="mb-1 block text-xs font-semibold text-gray-700">
          Nome *
        </label>
        <input
          id="pilot-name"
          type="text"
          ref={nameInputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full rounded border border-ortomio-earth-200 px-3 py-2 text-sm focus:border-ortomio-green-600 focus:outline-none"
        />
      </div>

      <div className="mb-3">
        <label htmlFor="pilot-email" className="mb-1 block text-xs font-semibold text-gray-700">
          Email *
        </label>
        <input
          id="pilot-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded border border-ortomio-earth-200 px-3 py-2 text-sm focus:border-ortomio-green-600 focus:outline-none"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="pilot-message" className="mb-1 block text-xs font-semibold text-gray-700">
          La tua azienda / cosa vorresti provare *
        </label>
        <textarea
          id="pilot-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={4}
          placeholder="Es. superficie, colture, cosa vorresti verificare nel pilot"
          className="w-full rounded border border-ortomio-earth-200 px-3 py-2 text-sm focus:border-ortomio-green-600 focus:outline-none"
        />
      </div>

      {status === 'error' && (
        <div className="mb-4 flex items-center gap-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>Compila tutti i campi, oppure riprova più tardi se l&apos;errore persiste.</span>
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-ortomio-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-ortomio-green-700 disabled:opacity-50"
      >
        {status === 'submitting' ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Invio...
          </>
        ) : (
          'Invia richiesta'
        )}
      </button>
    </form>
  )
}
