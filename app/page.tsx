'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getSupabaseClient } from '@/config/supabase'

function HomePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [checking, setChecking] = useState(true)
  
  useEffect(() => {
    const checkAuth = async () => {
      // Controlla se c'è un code di autenticazione nella URL
      const code = searchParams.get('code')
      if (code) {
        // Reindirizza al callback handler
        router.replace(`/auth/callback?code=${code}`)
        return
      }

      // DISABILITATO BYPASS: Richiedi sempre autenticazione
      // In produzione/online, il bypass non deve essere attivo
      const hostname = typeof window !== 'undefined' ? window.location.hostname : ''
      const isOnline = hostname !== 'localhost' && 
        hostname !== '127.0.0.1' &&
        hostname !== '[::1]' &&
        !hostname.includes('localhost') &&
        hostname !== ''

      console.log('[Auth Check] Hostname:', hostname, 'isOnline:', isOnline)

      // Se siamo online, richiedi sempre autenticazione
      if (isOnline) {
        console.log('[Auth Check] Online mode - requiring authentication')
        try {
          const supabase = getSupabaseClient()
          if (supabase) {
            const { data: { session }, error } = await supabase.auth.getSession()
            if (error) {
              console.error('Error checking session:', error)
              // Rimuovi eventuale sessione invalida
              await supabase.auth.signOut()
              router.push('/auth')
              return
            }
            // Verifica che la sessione sia valida e non scaduta
            const now = Math.floor(Date.now() / 1000)
            const isValidSession = session?.user && 
              session.expires_at && 
              session.expires_at > now &&
              session.user.email_confirmed_at // Email deve essere verificata
            
            console.log('[Auth Check] Session exists:', !!session, 'Valid:', isValidSession, 'Email confirmed:', !!session?.user?.email_confirmed_at, 'Expires at:', session?.expires_at, 'Now:', now)
            
            if (isValidSession) {
              // Utente autenticato con sessione valida, vai all'app
              console.log('[Auth Check] Valid session, redirecting to /app')
              router.push('/app')
            } else {
              // Sessione non valida o scaduta, rimuovila e vai al login
              console.log('[Auth Check] Invalid or expired session, signing out and redirecting to /auth')
              if (session) {
                await supabase.auth.signOut()
              }
              router.push('/auth')
            }
          } else {
            // Supabase non configurato, vai al login
            router.push('/auth')
          }
        } catch (error) {
          console.error('Error checking auth:', error)
          router.push('/auth')
        } finally {
          setChecking(false)
        }
        return
      }

      // In locale, controlla comunque l'autenticazione (ma permette bypass se esplicitamente configurato)
      try {
        const supabase = getSupabaseClient()
        if (supabase) {
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.user) {
            // Controlla anche che l'email sia verificata
            if (session.user.email_confirmed_at) {
              router.push('/app')
            } else {
              // Email non verificata, vai alla pagina di verifica
              router.push(`/verify-email?email=${encodeURIComponent(session.user.email || '')}`)
            }
          } else {
            router.push('/auth')
          }
        } else {
          router.push('/auth')
        }
      } catch (error) {
        console.error('Error checking auth:', error)
        router.push('/auth')
      } finally {
        setChecking(false)
      }
    }
    
    checkAuth()
  }, [router])
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600">Caricamento...</p>
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Caricamento...</div>}>
      <HomePageContent />
    </Suspense>
  )
}













