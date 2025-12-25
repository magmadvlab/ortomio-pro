'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function JournalRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace('/app/garden?tab=list')
  }, [router])
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600">Reindirizzamento...</p>
    </div>
  )
}
