'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function OrchardPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to garden page with orchard filter
    router.replace('/app/garden?type=orchard')
  }, [router])
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Caricamento frutteto...</p>
      </div>
    </div>
  )
}
