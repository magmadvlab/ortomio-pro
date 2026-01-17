'use client'

import React, { useState, useEffect } from 'react'
import { VineyardConfiguration } from '@/types/vineyard'
import { vineyardService } from '@/services/vineyardService'
import { FeatureGate } from '@/components/shared/FeatureGate'
import VineyardDashboard from '@/components/vineyard/VineyardDashboard'
import VineyardWizard from '@/components/vineyard/VineyardWizard'
import VineManager from '@/components/vineyard/VineManager'
import VineyardPruningManager from '@/components/vineyard/VineyardPruningManager'
import VineyardHarvestManager from '@/components/vineyard/VineyardHarvestManager'
import SmartPlantManager from '@/components/plants/SmartPlantManager'
import { 
  Grape, 
  ArrowLeft, 
  Settings, 
  Users, 
  Scissors, 
  Calendar,
  BarChart3,
  Eye,
  Plus
} from 'lucide-react'
import { useStorage } from '@/packages/core/hooks/useStorage'

type ViewMode = 'dashboard' | 'vines' | 'individual-plants' | 'pruning' | 'harvest' | 'analytics'

export default function VineyardPage() {
  const { storageProvider } = useStorage()
  const [gardens, setGardens] = useState<any[]>([])
  const [selectedGardenId, setSelectedGardenId] = useState<string>('')
  const [selectedVineyard, setSelectedVineyard] = useState<VineyardConfiguration | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard')
  const [showWizard, setShowWizard] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadGardens()
  }, [storageProvider])

  const loadGardens = async () => {
    try {
      setLoading(true)
      const gardensList = await storageProvider.getGardens()
      setGardens(gardensList)
      
      if (gardensList.length > 0 && !selectedGardenId) {
        setSelectedGardenId(gardensList[0].id)
      }
    } catch (error) {
      console.error('Error loading gardens:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateVineyard = () => {
    setShowWizard(true)
  }

  const handleWizardComplete = (vineyardId: string) => {
    setShowWizard(false)
    // Ricarica i dati e seleziona il nuovo vigneto
    loadVineyardData(vineyardId)
  }

  const handleWizardCancel = () => {
    setShowWizard(false)
  }

  const handleSelectVineyard = (vineyard: VineyardConfiguration) => {
    setSelectedVineyard(vineyard)
    setViewMode('vines')
  }

  const loadVineyardData = async (vineyardId: string) => {
    try {
      // In produzione, caricare i dati del vigneto specifico
      console.log('Loading vineyard data for:', vineyardId)
    } catch (error) {
      console.error('Error loading vineyard data:', error)
    }
  }

  const getViewTitle = () => {
    switch (viewMode) {
      case 'dashboard': return 'Dashboard Vigneti'
      case 'vines': return `Gestione Viti - ${selectedVineyard?.name || 'Vigneto'}`
      case 'individual-plants': return `Viti Individuali - ${selectedVineyard?.name || 'Vigneto'}`
      case 'pruning': return `Potature - ${selectedVineyard?.name || 'Vigneto'}`
      case 'harvest': return `Vendemmie - ${selectedVineyard?.name || 'Vigneto'}`
      case 'analytics': return `Analisi - ${selectedVineyard?.name || 'Vigneto'}`
      default: return 'Gestione Vigneto'
    }
  }

  const navigationItems = [
    { id: 'vines', label: 'Viti', icon: <Grape size={16} /> },
    { id: 'individual-plants', label: 'Viti Individuali', icon: <Users size={16} /> },
    { id: 'pruning', label: 'Potature', icon: <Scissors size={16} /> },
    { id: 'harvest', label: 'Vendemmie', icon: <Calendar size={16} /> },
    { id: 'analytics', label: 'Analisi', icon: <BarChart3 size={16} /> }
  ]

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
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {viewMode !== 'dashboard' && (
                <button
                  onClick={() => {
                    setViewMode('dashboard')
                    setSelectedVineyard(null)
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <ArrowLeft size={20} />
                </button>
              )}
              <Grape className="text-purple-600" size={32} />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{getViewTitle()}</h1>
                <p className="text-gray-600">
                  {viewMode === 'dashboard' 
                    ? 'Gestione professionale dei tuoi vigneti'
                    : 'Sistema di gestione avanzato per viticoltura di precisione'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Selezione Giardino */}
          {gardens.length > 1 && (
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleziona Giardino
              </label>
              <select
                value={selectedGardenId}
                onChange={(e) => setSelectedGardenId(e.target.value)}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                {gardens.map(garden => (
                  <option key={garden.id} value={garden.id}>
                    {garden.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Navigation per vigneto selezionato */}
          {selectedVineyard && viewMode !== 'dashboard' && (
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    {selectedVineyard.vineyardType === 'wine' ? '🍷' :
                     selectedVineyard.vineyardType === 'table' ? '🍇' :
                     selectedVineyard.vineyardType === 'raisin' ? '🫐' : '🍾'}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{selectedVineyard.name}</h2>
                    <p className="text-sm text-gray-600">
                      {selectedVineyard.totalVines} viti • {selectedVineyard.mainVarieties?.length || 0} varietà
                    </p>
                  </div>
                </div>
                
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Settings size={16} />
                </button>
              </div>
              
              <nav className="flex space-x-1">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setViewMode(item.id as ViewMode)}
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
          )}
        </div>

        {/* Content */}
        {!selectedGardenId ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Grape className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 mb-2">Nessun giardino disponibile</p>
            <p className="text-sm text-gray-500">Crea un giardino dalla Dashboard per iniziare</p>
          </div>
        ) : (
          <>
            {viewMode === 'dashboard' && (
              <VineyardDashboard
                gardenId={selectedGardenId}
                onCreateVineyard={handleCreateVineyard}
                onSelectVineyard={handleSelectVineyard}
              />
            )}

            {viewMode === 'vines' && selectedVineyard && (
              <VineManager
                vineyardId={selectedVineyard.id}
                onCreateVine={() => {
                  // Implementare creazione vite
                  console.log('Create vine for vineyard:', selectedVineyard.id)
                }}
                onEditVine={(vine) => {
                  // Implementare modifica vite
                  console.log('Edit vine:', vine)
                }}
              />
            )}

            {viewMode === 'individual-plants' && selectedVineyard && (
              <div className="space-y-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Users className="text-purple-600" size={20} />
                    <div>
                      <h3 className="font-semibold text-purple-900">Gestione Viti Individuali</h3>
                      <p className="text-sm text-purple-800">
                        Tracciamento dettagliato di ogni singola vite del vigneto con foto, salute e operazioni
                      </p>
                    </div>
                  </div>
                </div>
                {(() => {
                  const selectedGarden = gardens.find(g => g.id === selectedGardenId)
                  return selectedGarden ? <SmartPlantManager garden={selectedGarden} /> : null
                })()}
              </div>
            )}

            {viewMode === 'pruning' && selectedVineyard && (
              <VineyardPruningManager vineyardId={selectedVineyard.id} />
            )}

            {viewMode === 'harvest' && selectedVineyard && (
              <VineyardHarvestManager vineyardId={selectedVineyard.id} />
            )}

            {viewMode === 'analytics' && selectedVineyard && (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <BarChart3 className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Analisi Avanzate
                </h3>
                <p className="text-gray-600">
                  Dashboard di analisi e reportistica per il vigneto {selectedVineyard.name}
                </p>
              </div>
            )}
          </>
        )}

        {/* Wizard per nuovo vigneto */}
        {showWizard && (
          <VineyardWizard
            gardenId={selectedGardenId}
            onComplete={handleWizardComplete}
            onCancel={handleWizardCancel}
          />
        )}
      </div>
    </FeatureGate>
  )
}
