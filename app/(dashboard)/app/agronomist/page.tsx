'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function AgronomistPageContent() {
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

export default function AgronomistPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Caricamento...</p>
      </div>
    }>
      <AgronomistPageContent />
    </Suspense>
  )
}
