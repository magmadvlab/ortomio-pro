'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingBasket, ArrowRight } from 'lucide-react'

export default function HarvestPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect a Progressi > Raccolti
    router.replace('/app/progress?tab=harvests')
  }, [router])
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md p-6">
        <ShoppingBasket size={64} className="mx-auto text-green-600 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Raccolto spostato
        </h1>
        <p className="text-gray-600 mb-6">
          La sezione Raccolto è stata spostata in <strong>Progressi</strong> per una migliore organizzazione.
        </p>
        <button
          onClick={() => router.push('/app/progress?tab=harvests')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          Vai a Progressi
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  )
}

