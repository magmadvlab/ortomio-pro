'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/packages/core/hooks/useAuth'
import { decideRootRouting } from '@/lib/landing/rootRouting'

export default function HomePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [callbackParams, setCallbackParams] = useState<URLSearchParams | null>(null)

  useEffect(() => {
    setCallbackParams(new URLSearchParams(window.location.search))
  }, [])

  const hasAuthCallbackParams = useMemo(() => {
    if (!callbackParams) return false
    return Boolean(
      callbackParams.get('code') || callbackParams.get('token_hash') || callbackParams.get('error')
    )
  }, [callbackParams])

  // callbackParams starts null on first render (before the effect above runs) so we
  // don't know yet whether this is an auth-callback link; treat that as still loading.
  const decision = callbackParams === null
    ? 'LOADING'
    : decideRootRouting({
        hasAuthCallbackParams,
        authLoading,
        isAuthenticated: Boolean(user),
      })

  useEffect(() => {
    if (decision === 'AUTH_CALLBACK' && callbackParams) {
      const forward = new URLSearchParams()
      const code = callbackParams.get('code')
      const tokenHash = callbackParams.get('token_hash')
      const type = callbackParams.get('type')
      const error = callbackParams.get('error')
      const errorDescription = callbackParams.get('error_description')
      if (code) forward.set('code', code)
      if (tokenHash) forward.set('token_hash', tokenHash)
      if (type) forward.set('type', type)
      if (error) forward.set('error', error)
      if (errorDescription) forward.set('error_description', errorDescription)
      router.replace(`/auth/callback?${forward.toString()}`)
      return
    }
    if (decision === 'REDIRECT_APP') {
      router.push('/app')
    }
  }, [decision, callbackParams, router])

  if (decision === 'LOADING' || decision === 'AUTH_CALLBACK' || decision === 'REDIRECT_APP') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ortomio-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ortomio-green-600 mx-auto" />
          <p className="text-sm text-gray-500 mt-4">Caricamento...</p>
        </div>
      </div>
    )
  }

  return <div>Landing placeholder</div>
}
