/**
 * AuthGuard Component
 * Protegge le pagine dell'applicazione richiedendo autenticazione
 */

'use client'

import { useAuth } from '@/packages/core/hooks/useAuth'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { isBypassActive } from '@/lib/auth-bypass'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

// Pagine pubbliche che non richiedono autenticazione
const PUBLIC_ROUTES = [
  '/',
  '/auth',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/confirm',
  '/privacy',
  '/terms',
  '/about'
]

// Componente di loading
const AuthLoadingScreen = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">OrtoMio AI</h2>
      <p className="text-gray-600">Verifica autenticazione...</p>
    </div>
  </div>
)

// Componente di login richiesto
const LoginRequiredScreen = () => {
  const router = useRouter()
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">OrtoMio AI</h1>
          <p className="text-gray-600">Accesso richiesto</p>
        </div>
        
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-gray-700 mb-4">
            Per accedere a OrtoMio AI è necessario effettuare il login.
          </p>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={() => router.push('/auth')}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
          >
            Accedi
          </button>
          <button
            onClick={() => router.push('/auth?mode=register')}
            className="w-full bg-white text-green-600 py-2 px-4 rounded-md border border-green-600 hover:bg-green-50 transition-colors"
          >
            Registrati
          </button>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Hai bisogno di aiuto?{' '}
            <a href="/about" className="text-green-600 hover:text-green-700">
              Contattaci
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const [isClient, setIsClient] = useState(false)

  // Evita hydration mismatch
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Durante il caricamento lato client
  if (!isClient) {
    return <AuthLoadingScreen />
  }

  // Verifica se la route corrente è pubblica
  const isPublicRoute = PUBLIC_ROUTES.some(route => {
    if (route === '/') return pathname === '/'
    return pathname.startsWith(route)
  })

  // Se è una route pubblica, mostra il contenuto
  if (isPublicRoute) {
    return <>{children}</>
  }

  // Durante il caricamento dell'autenticazione
  if (loading) {
    return fallback || <AuthLoadingScreen />
  }

  // Se il bypass è attivo (solo sviluppo), mostra il contenuto
  if (isBypassActive()) {
    console.warn('🔓 AUTH BYPASS ACTIVE - Development mode only')
    return <>{children}</>
  }

  // Se non c'è utente autenticato, mostra schermata di login
  if (!user) {
    return <LoginRequiredScreen />
  }

  // Utente autenticato, mostra il contenuto
  return <>{children}</>
}