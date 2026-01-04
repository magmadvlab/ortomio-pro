'use client'

import { useEffect } from 'react'
import { setupSessionListener } from '@/lib/session-manager'

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Inizializza il listener per gestire gli errori di sessione
    setupSessionListener()
  }, [])

  return <>{children}</>
}