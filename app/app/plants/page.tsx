'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Users, ArrowRight, TreePine, Grape, CircleDot } from 'lucide-react'

export default function PlantsPage() {
  const router = useRouter()

  useEffect(() => {
    // Auto-redirect after 3 seconds
    const timer = setTimeout(() => {
      router.push('/app/orchard')
    }, 3000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mb-6">
          <Users className="mx-auto text-blue-600 mb-4" size={48} />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Piante Individuali Integrate
          </h1>
          <p className="text-gray-600">
            La gestione delle piante individuali è ora integrata nei sistemi specializzati per un controllo più preciso.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
            <h3 className="font-semibold text-blue-900 mb-2">Trova le tue piante in:</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <div className="flex items-center gap-2">
                <TreePine size={16} />
                <span>Frutteto → Piante Individuali</span>
              </div>
              <div className="flex items-center gap-2">
                <Grape size={16} />
                <span>Vigneto → Viti Individuali</span>
              </div>
              <div className="flex items-center gap-2">
                <CircleDot size={16} />
                <span>Oliveto → Olivi Individuali</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => router.push('/app/orchard')}
              className="flex flex-col items-center gap-1 p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
            >
              <TreePine size={20} className="text-green-600" />
              <span className="text-xs text-green-800">Frutteto</span>
            </button>
            <button
              onClick={() => router.push('/app/vineyard')}
              className="flex flex-col items-center gap-1 p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <Grape size={20} className="text-purple-600" />
              <span className="text-xs text-purple-800">Vigneto</span>
            </button>
            <button
              onClick={() => router.push('/app/olives')}
              className="flex flex-col items-center gap-1 p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
            >
              <CircleDot size={20} className="text-green-600" />
              <span className="text-xs text-green-800">Oliveto</span>
            </button>
          </div>

          <p className="text-xs text-gray-500">
            Reindirizzamento automatico al frutteto in 3 secondi...
          </p>
        </div>
      </div>
    </div>
  )
}