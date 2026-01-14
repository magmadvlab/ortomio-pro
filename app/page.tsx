'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Semplice timeout per evitare loop immediato
    const timer = setTimeout(() => {
      console.log('Redirecting to /app...')
      router.push('/app')
    }, 1000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">OrtoMio AI</h1>
        <p className="text-gray-600 mb-6">Il tuo assistente intelligente per l'orto</p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        <p className="text-sm text-gray-500 mt-4">Caricamento...</p>
        <p className="text-xs text-gray-400 mt-2">Versione professionale - Build test</p>
      </div>
    </div>
  )
}