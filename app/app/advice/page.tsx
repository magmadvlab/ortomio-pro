'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, ArrowRight } from 'lucide-react'

export default function AdvicePage() {
  const router = useRouter()

  useEffect(() => {
    // Auto-redirect after 3 seconds
    const timer = setTimeout(() => {
      router.push('/app/planner')
    }, 3000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mb-6">
          <RefreshCw className="mx-auto text-green-600 mb-4" size={48} />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Consigli Integrati nel Planner
          </h1>
          <p className="text-gray-600">
            I consigli AI sono ora integrati direttamente nella Centrale Operativa per un'esperienza più fluida.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left">
            <h3 className="font-semibold text-green-900 mb-2">Nuove Funzionalità:</h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li>🔄 Rotazione Colture nel Planner</li>
              <li>🐛 Controllo Biologico integrato</li>
              <li>💡 Suggerimenti AI contestuali</li>
              <li>📋 Checklist per certificazioni</li>
            </ul>
          </div>

          <button
            onClick={() => router.push('/app/planner')}
            className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Vai alla Centrale Operativa
            <ArrowRight size={16} />
          </button>

          <p className="text-xs text-gray-500">
            Reindirizzamento automatico in 3 secondi...
          </p>
        </div>
      </div>
    </div>
  )
}