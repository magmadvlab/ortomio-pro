'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/config/supabase'
import { isBypassActive } from '@/lib/auth-bypass'

export default function HomePage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  
  useEffect(() => {
    const checkAuth = async () => {
      // Se bypass attivo, vai direttamente all'app
      if (isBypassActive()) {
        router.push('/app')
        return
      }

      try {
        const supabase = getSupabaseClient()
        if (supabase) {
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.user) {
            // Utente autenticato, vai all'app
            router.push('/app')
          } else {
            // Utente non autenticato, vai al login
            router.push('/login')
          }
        } else {
          // Supabase non configurato, vai al login per permettere registrazione
          router.push('/login')
        }
      } catch (error) {
        console.error('Error checking auth:', error)
        // In caso di errore, vai al login
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













