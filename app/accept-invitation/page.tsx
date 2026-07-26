'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { acceptInvitation } from '@/services/organizationService'

function AcceptInvitationContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''
  const [status, setStatus] = useState<'idle' | 'loading' | 'accepted' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const accept = async () => {
    if (!token) {
      setStatus('error')
      setMessage('Link di invito non valido.')
      return
    }
    setStatus('loading')
    try {
      await acceptInvitation(token)
      setStatus('accepted')
      setMessage('Invito accettato. Ora puoi entrare nell’organizzazione.')
    } catch (error) {
      setStatus('error')
      setMessage(
        error instanceof Error && error.message === 'invitation_acceptance_failed'
          ? 'Accedi con lo stesso indirizzo email che ha ricevuto l’invito e riprova.'
          : 'Invito non valido, scaduto o associato a un altro indirizzo email.',
      )
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <section className="w-full max-w-md rounded-xl bg-white p-6 shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Invito OrtoMio</h1>
        <p className="mt-2 text-gray-600">
          Accedi con l’indirizzo che ha ricevuto l’invito, poi conferma l’ingresso.
        </p>

        {message && (
          <p className={`mt-4 rounded-lg p-3 text-sm ${
            status === 'accepted'
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
          }`}>
            {message}
          </p>
        )}

        <div className="mt-6 flex gap-3">
          {status === 'accepted' ? (
            <Link href="/app/settings" className="rounded-lg bg-green-600 px-4 py-2 text-white">
              Apri impostazioni
            </Link>
          ) : (
            <button
              type="button"
              onClick={accept}
              disabled={status === 'loading' || !token}
              className="rounded-lg bg-green-600 px-4 py-2 text-white disabled:opacity-50"
            >
              {status === 'loading' ? 'Accettazione…' : 'Accetta invito'}
            </button>
          )}
          <Link href="/login" className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700">
            Accedi
          </Link>
        </div>
      </section>
    </main>
  )
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-gray-50" />}>
      <AcceptInvitationContent />
    </Suspense>
  )
}
