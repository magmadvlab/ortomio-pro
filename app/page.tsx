'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/config/supabase'

export default function HomePage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  
  useEffect(() => {
    const checkAuth = async () => {
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
              router.push('/login')
              return
            }
            // Verifica che la sessione sia valida e non scaduta
            const now = Math.floor(Date.now() / 1000)
            const isValidSession = session?.user && 
              session.expires_at && 
              session.expires_at > now
            
            console.log('[Auth Check] Session exists:', !!session, 'Valid:', isValidSession, 'Expires at:', session?.expires_at, 'Now:', now)
            
            if (isValidSession) {
              // Utente autenticato con sessione valida, vai all'app
              console.log('[Auth Check] Valid session, redirecting to /app')
              router.push('/app')
            } else {
              // Sessione non valida o scaduta, rimuovila e vai al login
              console.log('[Auth Check] Invalid or expired session, signing out and redirecting to /login')
              if (session) {
                await supabase.auth.signOut()
              }
              router.push('/login')
            }
          } else {
            // Supabase non configurato, vai al login
            router.push('/login')
          }
        } catch (error) {
          console.error('Error checking auth:', error)
          router.push('/login')
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
            router.push('/app')
          } else {
            router.push('/login')
          }
        } else {
          router.push('/login')
        }
      } catch (error) {
        console.error('Error checking auth:', error)
        router.push('/login')
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













