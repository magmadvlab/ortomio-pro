'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    // Reindirizza alla pagina unificata di autenticazione in modalità registrazione
    router.replace('/auth?mode=register')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Reindirizzamento...</p>
      </div>
    </div>
  )
}