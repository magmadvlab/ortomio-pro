'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function VineyardPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to garden page with vineyard filter
    router.replace('/app/garden?type=vineyard')
  }, [router])
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Caricamento vigneto...</p>
      </div>
    </div>
  )
}
