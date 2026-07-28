'use client'

import { NutritionStatsWidget } from '@/components/nutrition/NutritionStatsWidget'
import NutritionAISuggestionsWidget from '@/components/nutrition/NutritionAISuggestionsWidget'
import ProfessionalNutritionDashboard from '@/components/nutrition/ProfessionalNutritionDashboard'
import ProductManager from '@/components/nutrition/ProductManager'
import TreatmentPlanner from '@/components/nutrition/TreatmentPlanner'
import NutritionAnalytics from '@/components/nutrition/NutritionAnalytics'
import InventoryManager from '@/components/nutrition/InventoryManager'
import type { TreatmentPlannerLaunchRequest } from '@/components/nutrition/TreatmentPlanner'
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { FlaskConical, Droplets, Leaf, Calendar, Plus, BarChart3, Settings } from 'lucide-react'
import { useStorage } from '@/packages/core/hooks/useStorage'
import type { FertilizerInventoryItemDB, Garden, TreatmentRecordDB } from '@/types'
import TaskExecutionBanner from '@/components/shared/TaskExecutionBanner'
import type { TaskExecutionContext } from '@/services/taskExecutionLaunchService'
import { resolveGardenContext } from '@/services/gardenContextResolverService'
import {
  buildNutritionExecutionBootstrapState,
  parseTaskExecutionContext,
} from '@/services/taskExecutionOrchestratorService'

type NutritionTab = 'dashboard' | 'overview' | 'products' | 'treatments' | 'analytics' | 'inventory'

const DESKTOP_TABS = [
  { id: 'dashboard', label: 'Dashboard Pro', icon: Settings },
  { id: 'overview', label: 'Panoramica', icon: BarChart3 },
  { id: 'products', label: 'Prodotti', icon: FlaskConical },
  { id: 'treatments', label: 'Trattamenti', icon: Droplets },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'inventory', label: 'Inventario', icon: Calendar },
] satisfies Array<{ id: NutritionTab; label: string; icon: typeof Settings }>

const MOBILE_PRIMARY_TABS = DESKTOP_TABS.slice(0, 3)
const MOBILE_SECONDARY_TABS = DESKTOP_TABS.slice(3)

export default function NutritionPage() {
  const { storageProvider } = useStorage()
  const searchParams = useSearchParams()
  const [activeGarden, setActiveGarden] = useState<Garden | null>(null)
  const [activeTab, setActiveTab] = useState<NutritionTab>('dashboard')
  const [nutritionTreatments, setNutritionTreatments] = useState<TreatmentRecordDB[] | null>(null)
  const [fertilizerInventory, setFertilizerInventory] = useState<FertilizerInventoryItemDB[] | null>(null)
  const [nutritionStatsLoading, setNutritionStatsLoading] = useState(false)
  const [plannerLaunchRequest, setPlannerLaunchRequest] = useState<TreatmentPlannerLaunchRequest | null>(null)
  const [consumedLaunchSignature, setConsumedLaunchSignature] = useState<string | null>(null)
  const [taskExecutionContext, setTaskExecutionContext] = useState<TaskExecutionContext | null>(null)

  useEffect(() => {
    const loadGardens = async () => {
      try {
        const loadedGardens = await storageProvider.getGardens()
        if (loadedGardens.length > 0) {
          const resolved = await resolveGardenContext(storageProvider, loadedGardens[0].id).catch(() => null)
          setActiveGarden(resolved?.garden || loadedGardens[0])
        }
      } catch (error) {
        console.error('Error loading gardens:', error)
      }
    }
    loadGardens()
  }, [storageProvider])

  const resumeTaskAwarePlanner = useCallback((context: TaskExecutionContext) => {
    if (!activeGarden) {
      return
    }

    const bootstrapState = buildNutritionExecutionBootstrapState(context, activeGarden.id)
    setActiveTab(bootstrapState.activeTab)
    setPlannerLaunchRequest(bootstrapState.plannerLaunchRequest)
  }, [activeGarden])

  useEffect(() => {
    if (!activeGarden) {
      return
    }

    const context = parseTaskExecutionContext(searchParams, 'nutrition', 'Treatment')
    if (!context || consumedLaunchSignature === context.sourceTaskId) {
      return
    }

    setTaskExecutionContext(context)
    resumeTaskAwarePlanner(context)
    setConsumedLaunchSignature(context.sourceTaskId)
  }, [activeGarden, searchParams, consumedLaunchSignature, resumeTaskAwarePlanner])

  useEffect(() => {
    if (!activeGarden) {
      setNutritionTreatments(null)
      setFertilizerInventory(null)
      return
    }

    let cancelled = false
    const loadNutritionStats = async () => {
      setNutritionStatsLoading(true)
      try {
        const [treatments, fertilizers] = await Promise.all([
          storageProvider.getTreatments(activeGarden.id),
          storageProvider.getFertilizerInventory(activeGarden.id),
        ])
        if (!cancelled) {
          setNutritionTreatments(treatments)
          setFertilizerInventory(fertilizers)
        }
      } catch (error) {
        console.error('Error loading nutrition statistics:', error)
        if (!cancelled) {
          setNutritionTreatments(null)
          setFertilizerInventory(null)
        }
      } finally {
        if (!cancelled) setNutritionStatsLoading(false)
      }
    }

    void loadNutritionStats()
    return () => {
      cancelled = true
    }
  }, [activeGarden, storageProvider])
  
  // Navigation handlers for Professional Dashboard
  const handleNavigateToProducts = () => {
    setActiveTab('products')
  }

  const handleNavigateToTreatments = () => {
    setActiveTab('treatments')
  }

  const openPlanner = (request: Omit<TreatmentPlannerLaunchRequest, 'key'>) => {
    setActiveTab('treatments')
    setPlannerLaunchRequest({
      key: Date.now(),
      ...request,
    })
  }

  const handleNavigateToSchedules = () => {
    setActiveTab('treatments') // Schedules are part of treatment planner
  }

  const handleNavigateToAnalytics = () => {
    setActiveTab('analytics')
  }

  const handleNavigateToInventory = () => {
    setActiveTab('inventory')
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <FlaskConical className="text-green-500" size={28} />
          Nutrizione & Trattamenti
        </h1>
        <p className="text-gray-600 mt-1">Gestisci fertilizzazioni e trattamenti delle tue colture</p>
      </div>

      {taskExecutionContext && (
        <TaskExecutionBanner
          context={taskExecutionContext}
          theme="nutrition"
          storageProvider={storageProvider}
          onResume={() => resumeTaskAwarePlanner(taskExecutionContext)}
          onDismiss={() => setTaskExecutionContext(null)}
        />
      )}

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          {/* Desktop: Single row */}
          <nav className="hidden md:flex -mb-px space-x-8">
            {DESKTOP_TABS.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              )
            })}
          </nav>

          {/* Mobile: Two rows */}
          <div className="md:hidden">
            {/* First row - Main tabs */}
            <nav className="flex space-x-4 border-b border-gray-100 -mb-px">
              {MOBILE_PRIMARY_TABS.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1 py-3 px-2 border-b-2 font-medium text-xs transition-colors flex-1 justify-center ${
                      activeTab === tab.id
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={14} />
                    <span className="truncate">{tab.label}</span>
                  </button>
                )
              })}
            </nav>

            {/* Second row - Additional tabs */}
            <nav className="flex space-x-4 -mb-px">
              {MOBILE_SECONDARY_TABS.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1 py-3 px-2 border-b-2 font-medium text-xs transition-colors flex-1 justify-center ${
                      activeTab === tab.id
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={14} />
                    <span className="truncate">{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Contenuto */}
      {activeTab === 'dashboard' && activeGarden && (
        <ProfessionalNutritionDashboard
          garden={activeGarden}
          onNavigateToProducts={handleNavigateToProducts}
          onNavigateToTreatments={handleNavigateToTreatments}
          onNavigateToSchedules={handleNavigateToSchedules}
          onNavigateToAnalytics={handleNavigateToAnalytics}
          onNavigateToInventory={handleNavigateToInventory}
        />
      )}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* AI Suggestions Widget */}
          {activeGarden && (
            <NutritionAISuggestionsWidget garden={activeGarden} maxItems={2} />
          )}
          
          <NutritionStatsWidget 
            treatments={nutritionTreatments}
            fertilizers={fertilizerInventory}
            loading={nutritionStatsLoading}
          />
          
          {/* Azioni Rapide */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Azioni Rapide</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={() => openPlanner({ viewMode: 'treatments' })}
                className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              >
                <Plus className="text-green-600" size={20} />
                <div className="text-left">
                  <p className="font-medium text-green-900">Nuovo Trattamento</p>
                  <p className="text-sm text-green-700">Programma fertilizzazione</p>
                </div>
              </button>
              
              <button
                onClick={() =>
                  openPlanner({
                    viewMode: 'treatments',
                    initialData: {
                      treatmentType: 'fertilization',
                      applicationMethod: 'fertigation',
                      dosageUnit: 'ml_per_liter',
                      notes: 'Intervento aperto da azione rapida di irrigazione nutritiva.'
                    }
                  })
                }
                className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <Droplets className="text-blue-600" size={20} />
                <div className="text-left">
                  <p className="font-medium text-blue-900">Irrigazione Nutritiva</p>
                  <p className="text-sm text-blue-700">Combina acqua e nutrienti</p>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('analytics')}
                className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
              >
                <Leaf className="text-purple-600" size={20} />
                <div className="text-left">
                  <p className="font-medium text-purple-900">Analisi Fogliare</p>
                  <p className="text-sm text-purple-700">Verifica stato nutrizionale</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'products' && activeGarden && (
        <ProductManager garden={activeGarden} />
      )}
      {activeTab === 'treatments' && activeGarden && (
        <TreatmentPlanner
          garden={activeGarden}
          launchRequest={plannerLaunchRequest}
          onLaunchHandled={() => setPlannerLaunchRequest(null)}
        />
      )}
      {activeTab === 'analytics' && activeGarden && (
        <NutritionAnalytics garden={activeGarden} />
      )}
      {activeTab === 'inventory' && activeGarden && (
        <InventoryManager garden={activeGarden} />
      )}
    </div>
  )
}
