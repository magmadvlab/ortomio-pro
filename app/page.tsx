import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import LandingPage from '@/components/landing/LandingPage'
import AuthedRedirect from '@/components/landing/AuthedRedirect'

export const metadata: Metadata = {
  title: 'OrtoMio | Decisioni agronomiche verificabili',
  description: 'OrtoMio registra ogni intervento, punteggia le azioni del giorno su urgenza, impatto, fattibilità e costo, e firma ogni previsione con i dati usati. La decisione resta tua.',
  alternates: { canonical: '/' },
  openGraph: { title: 'OrtoMio | Decisioni agronomiche verificabili', description: 'L’orchestratore agronomico: registra, analizza, prevede — e spiega ogni proposta.', type: 'website' },
  twitter: { card: 'summary_large_image', title: 'OrtoMio | Decisioni agronomiche verificabili', description: 'L’orchestratore agronomico: registra, analizza, prevede — e spiega ogni proposta.' },
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>

function firstValue(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key]
  if (typeof value === 'string' && value.length > 0) return value
  if (Array.isArray(value) && value.length > 0) return value[0]
  return null
}

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams

  // I link di callback Supabase che arrivano sulla root vanno inoltrati al
  // gestore auth; la verifica avviene lato server così la landing resta statica.
  const code = firstValue(params, 'code')
  const tokenHash = firstValue(params, 'token_hash')
  const error = firstValue(params, 'error')
  if (code || tokenHash || error) {
    const forward = new URLSearchParams()
    if (code) forward.set('code', code)
    if (tokenHash) forward.set('token_hash', tokenHash)
    const type = firstValue(params, 'type')
    const errorDescription = firstValue(params, 'error_description')
    if (type) forward.set('type', type)
    if (error) forward.set('error', error)
    if (errorDescription) forward.set('error_description', errorDescription)
    redirect(`/auth/callback?${forward.toString()}`)
  }

  return (
    <>
      <AuthedRedirect />
      <LandingPage />
    </>
  )
}
