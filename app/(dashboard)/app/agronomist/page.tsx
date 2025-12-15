'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AgronomistPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    // Redirect a /app/advice con tab agronomists
    const tab = searchParams.get('tab') || 'agronomists'
    router.replace(`/app/advice?tab=${tab}`)
  }, [router, searchParams])
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600">Reindirizzamento...</p>
    </div>
  )
}
