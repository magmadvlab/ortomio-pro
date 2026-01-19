'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useGarden } from '@/hooks/useGarden'
import { ArrowLeft, Sprout, Package, TreePine } from 'lucide-react'
import SeedInventory from '@/components/seedbank/SeedInventory'
import SeedlingDashboard from '@/components/seedling/SeedlingDashboard'
import SaplingDashboard from '@/components/seedbank/SaplingDashboard'

function SemenzaioPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { currentGarden } = useGarden()
  
  const [activeTab, setActiveTab] = useState<'seeds' | 'seedlings' | 'saplings'>('seedlings')
  const [loading, setLoading] = useState(true)

  // Parametri URL per integrazione con Pianifica
  const shouldCreate = searchParams.get('create') === 'true'
  const plantName = searchParams.get('plant')
  const variety = searchParams.get('variety')
  const fromPage = searchParams.get('from')

  useEffect(() => {
    // Simula caricamento
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const handleBackNavigation = () => {
    if (fromPage === 'pianifica') {
      router.push('/app/planner')
    } else {
      router.push('/app')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento vivaio...</p>
        </div>
      </div>
    )
  }

  if (!currentGarden) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Sprout className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun giardino selezionato</h3>
          <p className="text-gray-600 mb-4">Seleziona un giardino per gestire il vivaio</p>
          <button
            onClick={() => router.push('/app')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Vai alla Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleBackNavigation}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    🌿 Vivaio Pro
                  </h1>
                  <p className="text-sm text-gray-600">
                    Gestisci semi, piantine e alberelli per {currentGarden.name}
                  </p>
                </div>
              </div>
              
              {/* Tab Navigation */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('seeds')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'seeds'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Package size={16} />
                  Semi
                </button>
                <button
                  onClick={() => setActiveTab('seedlings')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'seedlings'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Sprout size={16} />
                  Piantine
                </button>
                <button
                  onClick={() => setActiveTab('saplings')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'saplings'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <TreePine size={16} />
                  Alberelli
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Integration Alert */}
        {shouldCreate && plantName && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-blue-600">🔗</span>
              <h3 className="font-semibold text-blue-900">Integrazione con Planner</h3>
            </div>
            <p className="text-sm text-blue-800">
              Stai per creare un lotto per <strong>{decodeURIComponent(plantName)}</strong>
              {variety && ` (${decodeURIComponent(variety)})`}. 
              Seleziona la tab appropriata per procedere.
            </p>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'seeds' && (
          <SeedInventory 
            garden={currentGarden}
            plantName={plantName ? decodeURIComponent(plantName) : undefined}
            variety={variety ? decodeURIComponent(variety) : undefined}
          />
        )}

        {activeTab === 'seedlings' && (
          <SeedlingDashboard 
            garden={currentGarden}
            shouldCreate={shouldCreate}
            plantName={plantName ? decodeURIComponent(plantName) : undefined}
            variety={variety ? decodeURIComponent(variety) : undefined}
          />
        )}

        {activeTab === 'saplings' && (
          <SaplingDashboard 
            garden={currentGarden}
            plantName={plantName ? decodeURIComponent(plantName) : undefined}
            variety={variety ? decodeURIComponent(variety) : undefined}
          />
        )}
      </div>
    </div>
  )
}

export default function SemenzaioPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    }>
      <SemenzaioPageContent />
    </Suspense>
  )
}