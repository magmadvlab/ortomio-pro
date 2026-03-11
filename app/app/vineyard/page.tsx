'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { FeatureGate } from '@/components/shared/FeatureGate'
import VineyardDashboard from '@/components/vineyard/VineyardDashboard'
import VineyardWizard from '@/components/vineyard/VineyardWizard'
import VineManager from '@/components/vineyard/VineManager'
import SmartPlantManager from '@/components/plants/SmartPlantManager'
import { VineyardConfiguration } from '@/types/vineyard'
import { Garden } from '@/types'
import { Grape, ArrowLeft, Users, Cog, Calendar, Scissors, Plus } from 'lucide-react'
import {
  VineyardGardenContext,
  resolveVineyardGardenContexts,
} from '@/services/woodyGardenResolverService'

type ViewMode = 'dashboard' | 'vines' | 'individual-plants'

export default function VineyardPage() {
  const { storageProvider } = useStorage()
  const [allGardens, setAllGardens] = useState<Garden[]>([])
  const [contexts, setContexts] = useState<VineyardGardenContext[]>([])
  const [selectedGardenId, setSelectedGardenId] = useState('')
  const [creationGardenId, setCreationGardenId] = useState('')
  const [selectedVineyard, setSelectedVineyard] = useState<VineyardConfiguration | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard')
  const [showWizard, setShowWizard] = useState(false)
  const [loading, setLoading] = useState(true)

  const selectedContext = useMemo(
    () => contexts.find((context) => context.garden.id === selectedGardenId),
    [contexts, selectedGardenId]
  )
  const selectedGarden = selectedContext?.garden

  useEffect(() => {
    loadGardens()
  }, [storageProvider])

  useEffect(() => {
    if (contexts.length === 0) {
      setSelectedGardenId('')
      setSelectedVineyard(null)
      return
    }

    if (!selectedGardenId || !contexts.some((context) => context.garden.id === selectedGardenId)) {
      setSelectedGardenId(contexts[0].garden.id)
      setSelectedVineyard(null)
      setViewMode('dashboard')
    }
  }, [contexts, selectedGardenId])

  useEffect(() => {
    if (!selectedContext) {
      setSelectedVineyard(null)
      return
    }

    if (
      selectedVineyard &&
      !selectedContext.vineyards.some((vineyard) => vineyard.id === selectedVineyard.id)
    ) {
      setSelectedVineyard(null)
      setViewMode('dashboard')
    }
  }, [selectedContext, selectedVineyard])

  const loadGardens = async () => {
    try {
      setLoading(true)
      const allGardens = await storageProvider.getGardens()
      setAllGardens(allGardens)
      const resolvedContexts = await resolveVineyardGardenContexts(allGardens)
      setContexts(resolvedContexts)
      if (!creationGardenId && allGardens.length > 0) {
        setCreationGardenId(allGardens[0].id)
      }
    } catch (error) {
      console.error('Error loading vineyard gardens:', error)
      setAllGardens([])
      setContexts([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateVineyard = () => {
    if (!selectedGardenId && !creationGardenId) {
      return
    }
    setShowWizard(true)
  }

  const handleWizardComplete = async (_vineyardId: string) => {
    setShowWizard(false)
    setSelectedVineyard(null)
    setViewMode('dashboard')
    await loadGardens()
  }

  const handleSelectVineyard = (vineyard: VineyardConfiguration) => {
    setSelectedVineyard(vineyard)
    setViewMode('vines')
  }

  const getViewTitle = () => {
    switch (viewMode) {
      case 'dashboard':
        return 'Dashboard Vigneti'
      case 'vines':
        return `Gestione Viti - ${selectedVineyard?.name || 'Vigneto'}`
      case 'individual-plants':
        return `Viti Individuali - ${selectedVineyard?.name || 'Vigneto'}`
      default:
        return 'Gestione Vigneto'
    }
  }

  const renderNavigation = () => {
    if (!selectedVineyard) return null

    const navigationItems = [
      { id: 'vines' as const, label: 'Viti', icon: <Grape size={16} /> },
      { id: 'individual-plants' as const, label: 'Viti Individuali', icon: <Users size={16} /> },
    ]

    return (
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setViewMode('dashboard')
                setSelectedVineyard(null)
              }}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={16} />
              Torna alla Dashboard
            </button>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{selectedVineyard.name}</h2>
              <p className="text-sm text-gray-600">
                {selectedVineyard.totalVines} viti • {selectedVineyard.mainVarieties?.length || 0} varieta
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/app/mechanical-work?filter=Pruning"
              className="inline-flex items-center gap-2 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm"
            >
              <Scissors size={16} />
              Potature
            </Link>
            <Link
              href="/app/harvest"
              className="inline-flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
            >
              <Calendar size={16} />
              Vendemmie
            </Link>
          </div>
        </div>

        <nav className="flex space-x-1">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setViewMode(item.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === item.id
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <FeatureGate feature="VINEYARD">
      <div className="min-h-screen p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Grape className="text-purple-600" size={32} />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{getViewTitle()}</h1>
                <p className="text-gray-600">
                  {viewMode === 'dashboard'
                    ? 'Gestione professionale dei tuoi vigneti con dati reali'
                    : 'Operativita vite per vite sul vigneto selezionato'}
                </p>
              </div>
            </div>

            {(selectedGardenId || creationGardenId) && viewMode === 'dashboard' && (
              <button
                onClick={handleCreateVineyard}
                className="inline-flex items-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus size={18} />
                Nuovo Vigneto
              </button>
            )}
          </div>

          {contexts.length > 1 && (
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Seleziona Giardino</label>
              <select
                value={selectedGardenId}
                onChange={(event) => {
                  setSelectedGardenId(event.target.value)
                  setSelectedVineyard(null)
                  setViewMode('dashboard')
                }}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                {contexts.map((context) => (
                  <option key={context.garden.id} value={context.garden.id}>
                    {context.garden.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {renderNavigation()}
        </div>

        {!selectedGardenId ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Grape className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 mb-2">Nessun vigneto disponibile</p>
            <p className="text-sm text-gray-500 mb-6">
              {allGardens.length > 0
                ? 'Seleziona un giardino esistente e crea il primo vigneto da questa pagina'
                : 'Prima crea un giardino, poi potrai configurare uno o piu vigneti'}
            </p>
            {allGardens.length > 0 ? (
              <div className="max-w-md mx-auto space-y-4">
                <select
                  value={creationGardenId}
                  onChange={(event) => setCreationGardenId(event.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  {allGardens.map((garden) => (
                    <option key={garden.id} value={garden.id}>
                      {garden.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleCreateVineyard}
                  disabled={!creationGardenId}
                  className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  <Plus size={18} />
                  Crea Nuovo Vigneto
                </button>
              </div>
            ) : (
              <Link
                href="/app/garden?tab=list&action=add"
                className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus size={18} />
                Crea Nuovo Giardino
              </Link>
            )}
          </div>
        ) : viewMode === 'dashboard' ? (
          <VineyardDashboard
            gardenId={selectedGardenId}
            onCreateVineyard={handleCreateVineyard}
            onSelectVineyard={handleSelectVineyard}
          />
        ) : viewMode === 'vines' && selectedVineyard ? (
          <div className="space-y-6">
            <VineManager vineyardId={selectedVineyard.id} />

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Cog className="text-purple-600" size={20} />
                Azioni Operative
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  href="/app/mechanical-work?filter=Pruning"
                  className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  <Scissors className="text-orange-600" size={20} />
                  <div>
                    <div className="font-medium text-gray-900">Potature</div>
                    <div className="text-sm text-gray-600">Usa il registro lavorazioni per interventi reali</div>
                  </div>
                </Link>
                <Link
                  href="/app/harvest"
                  className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <Calendar className="text-purple-600" size={20} />
                  <div>
                    <div className="font-medium text-gray-900">Vendemmie</div>
                    <div className="text-sm text-gray-600">Collega i raccolti al vigneto e allo storico rese</div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        ) : selectedGarden ? (
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Users className="text-purple-600" size={20} />
                <div>
                  <h3 className="font-semibold text-purple-900">Gestione Viti Individuali</h3>
                  <p className="text-sm text-purple-800">
                    Tracciamento dettagliato di ogni singola vite con foto, salute e operazioni.
                  </p>
                </div>
              </div>
            </div>
            <SmartPlantManager garden={selectedGarden} />
          </div>
        ) : null}

        {showWizard && (selectedGardenId || creationGardenId) && (
          <VineyardWizard
            gardenId={selectedGardenId || creationGardenId}
            onComplete={handleWizardComplete}
            onCancel={() => setShowWizard(false)}
          />
        )}
      </div>
    </FeatureGate>
  )
}
