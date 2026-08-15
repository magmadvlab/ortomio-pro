'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/packages/core/hooks/useAuth'
import { decideRootRouting } from '@/lib/landing/rootRouting'

/**
 * Reindirizza gli utenti già autenticati verso /app senza impedire il
 * server-render statico della landing per i visitatori nuovi.
 */
export default function AuthedRedirect() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    const decision = decideRootRouting({
      hasAuthCallbackParams: false,
      authLoading,
      isAuthenticated: Boolean(user),
    })
    if (decision === 'REDIRECT_APP') {
      router.replace('/app')
    }
  }, [authLoading, user, router])

  return null
}
