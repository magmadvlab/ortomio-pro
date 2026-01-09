/**
 * Challenges Page - Next.js Route
 * Lista tutte challenge disponibili (passate, presenti, future)
 * Filtro per tipo, badge collection, streak widget
 */

'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, ArrowRight } from 'lucide-react';

export default function ChallengesPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect a Progressi > Traguardi
    router.replace('/app/progress?tab=achievements')
  }, [router])
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md p-6">
        <Trophy size={64} className="mx-auto text-purple-600 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Challenge spostate
        </h1>
        <p className="text-gray-600 mb-6">
          La sezione Challenge è stata spostata in <strong>Progressi</strong> per una migliore organizzazione.
        </p>
        <button
          onClick={() => router.push('/app/progress?tab=achievements')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
        >
          Vai a Progressi
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  )
}
