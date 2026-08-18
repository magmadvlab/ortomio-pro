'use client'

import dynamic from 'next/dynamic'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Map, Brain } from 'lucide-react'
import { FeatureGate } from '@/components/shared/FeatureGate'

const FarmCommandCenter = dynamic(() =>
  import('@/components/farm/FarmCommandCenter').then((module) => module.FarmCommandCenter), {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[360px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-emerald-700" />
          <p className="text-sm text-gray-600">Caricamento centro operativo...</p>
        </div>
      </div>
    ),
  }
)

const AIPredictionsDashboard = dynamic(() =>
  import('@/components/ai/predictions/AIPredictionsDashboard'), {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[360px] items-center justify-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600" />
        <p className="text-sm text-gray-600">Caricamento predizioni AI...</p>
      </div>
    ),
  }
)

type FarmTab = 'map' | 'predictions'
const FARM_TABS: FarmTab[] = ['map', 'predictions']

function FarmPageContent() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<FarmTab>('map')

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && FARM_TABS.includes(tab as FarmTab)) {
      setActiveTab(tab as FarmTab)
    }
  }, [searchParams])

  const tabs = [
    { id: 'map' as const, label: 'Mappa e priorità', icon: Map },
    { id: 'predictions' as const, label: 'Predizioni AI', icon: Brain },
  ]

  return (
    <main className="h-[calc(100vh-4rem)] p-3 sm:p-4 flex flex-col gap-3 overflow-hidden">
      <nav className="flex gap-2 shrink-0">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-green-100 text-green-900'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </nav>

      {activeTab === 'map' && <FarmCommandCenter />}

      {activeTab === 'predictions' && (
        <div className="flex-1 min-h-0 overflow-y-auto rounded-xl">
          <FeatureGate
            feature="AI_PREDICTIONS"
            fallback={
              <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-md mx-auto mt-8 text-center">
                <div className="text-6xl mb-4">🧠</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Predizioni AI</h2>
                <p className="text-gray-600 mb-4">Questa funzionalità non è ancora disponibile.</p>
                <p className="text-sm text-gray-500">Contatta l&apos;amministratore per attivarla.</p>
              </div>
            }
          >
            <AIPredictionsDashboard />
          </FeatureGate>
        </div>
      )}
    </main>
  )
}

export default function AppFarmPage() {
  return (
    <Suspense fallback={null}>
      <FarmPageContent />
    </Suspense>
  )
}
