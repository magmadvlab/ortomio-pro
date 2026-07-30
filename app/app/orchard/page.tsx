'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { FeatureGate } from '@/components/shared/FeatureGate'
import { OrchardConfiguration } from '@/types/orchard'
import { Garden } from '@/types'
import { orchardService } from '@/services/orchardService'
import OrchardDashboard from '@/components/orchard/OrchardDashboard'
import OrchardWizard from '@/components/orchard/OrchardWizard'
import TreeManager from '@/components/orchard/TreeManager'
import PruningManager from '@/components/orchard/PruningManager'
import HarvestManager from '@/components/orchard/HarvestManager'
import OrchardRowsView from '@/components/orchard/OrchardRowsView'
import SmartPlantManager from '@/components/plants/SmartPlantManager'
import {
  TreePine,
  ArrowLeft,
  Scissors,
  Calendar,
  BarChart3,
  Users,
  Rows3
} from 'lucide-react'

type ViewMode = 'dashboard' | 'trees' | 'rows' | 'individual-plants' | 'pruning' | 'harvest' | 'analytics'

export default function OrchardPage() {
  const { storageProvider } = useStorage()
  const [gardens, setGardens] = useState<Garden[]>([])
  const [selectedGardenId, setSelectedGardenId] = useState<string>('')
  const [selectedOrchard, setSelectedOrchard] = useState<OrchardConfiguration | null>(null)
  const [focusedTreeId, setFocusedTreeId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard')
  const [showWizard, setShowWizard] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadGardens = useCallback(async () => {
    try {
      setLoading(true)
      const allGardens = await storageProvider.getGardens()
      // Filtra solo i gardens di tipo Frutteto
      const gardensList = allGardens.filter(g => g.gardenType === 'Orchard')
      setGardens(gardensList)

      if (gardensList.length > 0) {
        setSelectedGardenId(prev => prev || gardensList[0].id)
      }
    } catch (error) {
      console.error('Error loading gardens:', error)
    } finally {
      setLoading(false)
    }
  }, [storageProvider])

  useEffect(() => {
    loadGardens()
  }, [loadGardens])

  const handleCreateOrchard = () => {
    setShowWizard(true)
  }

  const handleSelectOrchard = (orchard: OrchardConfiguration) => {
    setSelectedOrchard(orchard)
    setFocusedTreeId(null)
    setViewMode('trees')
  }

  const handleOpenTreeFromDashboard = (orchard: OrchardConfiguration, treeId: string) => {
    setSelectedOrchard(orchard)
    setFocusedTreeId(treeId)
    setViewMode('trees')
  }

  const handleWizardComplete = () => {
    setShowWizard(false)
    // Reload orchards and select the new one
    loadGardens()
  }

  const renderNavigation = () => {
    if (!selectedOrchard) return null

    const navItems = [
      { key: 'trees', label: 'Alberi', icon: TreePine },
      { key: 'rows', label: 'Filari', icon: Rows3 },
      { key: 'individual-plants', label: 'Piante Individuali', icon: Users },
      { key: 'pruning', label: 'Potature', icon: Scissors },
      { key: 'harvest', label: 'Raccolte', icon: Calendar },
      { key: 'analytics', label: 'Analytics', icon: BarChart3 }
    ]

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedOrchard(null)
                setViewMode('dashboard')
              }}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={16} />
              Torna alla Dashboard
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Frutteto:</span>
            <span className="font-medium text-gray-900">{selectedOrchard.name}</span>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.key}
                onClick={() => setViewMode(item.key as ViewMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  viewMode === item.key
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon size={16} />
                {item.label}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  const renderContent = () => {
    if (!selectedGardenId) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <TreePine className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600 mb-2">Nessun giardino disponibile</p>
          <p className="text-sm text-gray-500">Crea un giardino dalla Dashboard per iniziare</p>
        </div>
      )
    }

    if (!selectedOrchard) {
      return (
        <OrchardDashboard
          gardenId={selectedGardenId}
          onCreateOrchard={handleCreateOrchard}
          onSelectOrchard={handleSelectOrchard}
          onOpenTree={handleOpenTreeFromDashboard}
        />
      )
    }

    switch (viewMode) {
      case 'trees':
        return (
          <TreeManager
            orchardId={selectedOrchard.id}
            gardenId={selectedGardenId}
            orchardConfig={selectedOrchard}
            initialSelectedTreeId={focusedTreeId}
            onInitialTreeHandled={() => setFocusedTreeId(null)}
          />
        )
      case 'rows':
        return (
          <OrchardRowsView
            orchard={selectedOrchard}
            orchardId={selectedOrchard.id}
            gardenId={selectedGardenId}
            onOrchardUpdate={setSelectedOrchard}
            onNavigateToTree={() => setViewMode('trees')}
            onSelectTree={(treeId) => {
              setFocusedTreeId(treeId)
              setViewMode('trees')
            }}
          />
        )
      case 'individual-plants':
        const selectedGarden = gardens.find(g => g.id === selectedGardenId)
        return selectedGarden ? (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Users className="text-blue-600" size={20} />
                <div>
                  <h3 className="font-semibold text-blue-900">Gestione Piante Individuali</h3>
                  <p className="text-sm text-blue-800">
                    Tracciamento dettagliato di ogni singolo albero del frutteto con foto, salute e operazioni
                  </p>
                </div>
              </div>
            </div>
            <SmartPlantManager garden={selectedGarden} />
          </div>
        ) : null
      case 'pruning':
        return (
          <PruningManager
            orchardId={selectedOrchard.id}
            gardenId={selectedGardenId}
          />
        )
      case 'harvest':
        return (
          <HarvestManager
            orchardId={selectedOrchard.id}
            gardenId={selectedGardenId}
          />
        )
      case 'analytics':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <BarChart3 className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Frutteto</h3>
            <p className="text-gray-600">Funzionalità in sviluppo</p>
          </div>
        )
      default:
        return (
          <OrchardDashboard
            gardenId={selectedGardenId}
            onCreateOrchard={handleCreateOrchard}
            onSelectOrchard={handleSelectOrchard}
            onOpenTree={handleOpenTreeFromDashboard}
          />
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <TreePine className="mx-auto text-gray-400 mb-4 animate-pulse" size={48} />
          <p className="text-gray-600">Caricamento...</p>
        </div>
      </div>
    )
  }

  return (
    <FeatureGate feature="ORCHARD">
      <div className="min-h-screen p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Garden Selection */}
        {gardens.length > 1 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleziona Giardino
            </label>
            <select
              value={selectedGardenId}
              onChange={(e) => {
                setSelectedGardenId(e.target.value)
                setSelectedOrchard(null)
                setViewMode('dashboard')
              }}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              {gardens.map(garden => (
                <option key={garden.id} value={garden.id}>
                  {garden.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Navigation */}
        {renderNavigation()}

        {/* Content */}
        {renderContent()}

        {/* Wizard Modal */}
        {showWizard && (
          <OrchardWizard
            gardenId={selectedGardenId}
            onComplete={handleWizardComplete}
            onCancel={() => setShowWizard(false)}
          />
        )}
      </div>
    </FeatureGate>
  )
}
