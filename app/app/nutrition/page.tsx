'use client'

import { NutritionStatsWidget } from '@/components/nutrition/NutritionStatsWidget'
import NutritionAISuggestionsWidget from '@/components/nutrition/NutritionAISuggestionsWidget'
import ProfessionalNutritionDashboard from '@/components/nutrition/ProfessionalNutritionDashboard'
import ProductManager from '@/components/nutrition/ProductManager'
import TreatmentPlanner from '@/components/nutrition/TreatmentPlanner'
import NutritionAnalytics from '@/components/nutrition/NutritionAnalytics'
import InventoryManager from '@/components/nutrition/InventoryManager'
import type { TreatmentPlannerLaunchRequest } from '@/components/nutrition/TreatmentPlanner'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { FlaskConical, Droplets, Leaf, Calendar, Plus, BarChart3, X, ArrowLeft, ArrowRight, MapPin, Settings } from 'lucide-react'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { Garden } from '@/types'
import LocationSelector from '@/components/shared/LocationSelector'
import TaskExecutionBanner from '@/components/shared/TaskExecutionBanner'
import type { TaskExecutionContext } from '@/services/taskExecutionLaunchService'
import { resolveGardenContext } from '@/services/gardenContextResolverService'
import {
  buildNutritionExecutionBootstrapState,
  parseTaskExecutionContext,
} from '@/services/taskExecutionOrchestratorService'

interface TreatmentConfig {
  id: string
  gardenId: string
  gardenName: string
  zoneId?: string
  zoneName?: string
  fieldRowId?: string
  fieldRowName?: string
  sectionId?: string
  sectionName?: string
  treatmentType: 'fertilizer' | 'pesticide' | 'fungicide' | 'herbicide' | 'foliar' | 'organic'
  productName: string
  concentration: number // g/L or ml/L
  applicationRate: number // L/ha or g/m²
  applicationMethod: 'spray' | 'drip' | 'granular' | 'foliar' | 'soil'
  schedule: {
    frequency: 'weekly' | 'biweekly' | 'monthly' | 'seasonal' | 'custom'
    startDate: string
    endDate?: string
    times: string[] // HH:MM format
    daysOfWeek?: number[] // 0-6, Sunday = 0
  }
  notes?: string
}

export default function NutritionPage() {
  const { storageProvider } = useStorage()
  const searchParams = useSearchParams()
  const [gardens, setGardens] = useState<Garden[]>([])
  const [activeGarden, setActiveGarden] = useState<Garden | null>(null)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'overview' | 'products' | 'treatments' | 'schedule' | 'analytics' | 'inventory'>('dashboard')
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [treatmentConfigs, setTreatmentConfigs] = useState<TreatmentConfig[]>([])
  const [plannerLaunchRequest, setPlannerLaunchRequest] = useState<TreatmentPlannerLaunchRequest | null>(null)
  const [consumedLaunchSignature, setConsumedLaunchSignature] = useState<string | null>(null)
  const [taskExecutionContext, setTaskExecutionContext] = useState<TaskExecutionContext | null>(null)

  useEffect(() => {
    const loadGardens = async () => {
      try {
        const loadedGardens = await storageProvider.getGardens()
        setGardens(loadedGardens)
        if (loadedGardens.length > 0) {
          const resolved = await resolveGardenContext(storageProvider, loadedGardens[0].id).catch(() => null)
          setActiveGarden(resolved?.garden || loadedGardens[0])
        }
        loadTreatmentConfigs()
      } catch (error) {
        console.error('Error loading gardens:', error)
      }
    }
    loadGardens()
  }, [storageProvider])

  const resumeTaskAwarePlanner = (context: TaskExecutionContext) => {
    if (!activeGarden) {
      return
    }

    const bootstrapState = buildNutritionExecutionBootstrapState(context, activeGarden.id)
    setActiveTab(bootstrapState.activeTab)
    setPlannerLaunchRequest(bootstrapState.plannerLaunchRequest)
  }

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
  }, [activeGarden, searchParams, consumedLaunchSignature])
  
  const loadTreatmentConfigs = async () => {
    try {
      // Simulate loading treatment configs from storage
      const configs: TreatmentConfig[] = []
      setTreatmentConfigs(configs)
    } catch (error) {
      console.error('Error loading treatment configs:', error)
    }
  }

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
    setShowAnalytics(true)
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
            {[
              { id: 'dashboard', label: 'Dashboard Pro', icon: Settings },
              { id: 'overview', label: 'Panoramica', icon: BarChart3 },
              { id: 'products', label: 'Prodotti', icon: FlaskConical },
              { id: 'treatments', label: 'Trattamenti', icon: Droplets },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'inventory', label: 'Inventario', icon: Calendar }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
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
              {[
                { id: 'dashboard', label: 'Dashboard Pro', icon: Settings },
                { id: 'overview', label: 'Panoramica', icon: BarChart3 },
                { id: 'products', label: 'Prodotti', icon: FlaskConical }
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
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
              {[
                { id: 'treatments', label: 'Trattamenti', icon: Droplets },
                { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                { id: 'inventory', label: 'Inventario', icon: Calendar }
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
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
            treatments={[]} 
            fertilizers={[]} 
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
      {activeTab === 'schedule' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center py-12">
            <FlaskConical className="mx-auto mb-4 text-green-500" size={48} />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Gestione Trattamenti</h2>
            <p className="text-gray-600 mb-6">
              Programma e monitora i trattamenti nutrizionali delle tue piante
            </p>
            <button 
              onClick={() => openPlanner({ viewMode: 'treatments' })}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Aggiungi Trattamento
            </button>
          </div>
        </div>
      )}

      {activeTab === 'schedule' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center py-12">
            <Calendar className="mx-auto mb-4 text-blue-500" size={48} />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Calendario Trattamenti</h2>
            <p className="text-gray-600 mb-6">
              Le programmazioni sono ora integrate nella sezione Trattamenti
            </p>
            <button 
              onClick={() => setActiveTab('treatments')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Vai ai Trattamenti
            </button>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalytics && (
        <TreatmentAnalyticsModal
          onClose={() => setShowAnalytics(false)}
          treatmentConfigs={treatmentConfigs}
        />
      )}
    </div>
  )
}

// Treatment Configuration Wizard Component
interface TreatmentConfigWizardProps {
  gardens: Garden[]
  onClose: () => void
  onSave: (config: TreatmentConfig) => void
}

function TreatmentConfigWizard({ gardens, onClose, onSave }: TreatmentConfigWizardProps) {
  const [step, setStep] = useState<'garden' | 'location' | 'treatment' | 'schedule'>('garden')
  const [selectedGarden, setSelectedGarden] = useState<Garden | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<any>(null)
  const [treatmentConfig, setTreatmentConfig] = useState({
    treatmentType: 'fertilizer' as const,
    productName: '',
    concentration: 0,
    applicationRate: 0,
    applicationMethod: 'spray' as const,
    notes: ''
  })
  const [scheduleConfig, setScheduleConfig] = useState({
    frequency: 'weekly' as const,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    times: ['08:00'],
    daysOfWeek: [1, 2, 3, 4, 5, 6, 0] // All days
  })

  const handleNext = () => {
    if (step === 'garden' && selectedGarden) {
      setStep('location')
    } else if (step === 'location') {
      setStep('treatment')
    } else if (step === 'treatment') {
      setStep('schedule')
    }
  }

  const handleBack = () => {
    if (step === 'location') {
      setStep('garden')
    } else if (step === 'treatment') {
      setStep('location')
    } else if (step === 'schedule') {
      setStep('treatment')
    }
  }

  const handleSave = () => {
    if (!selectedGarden) return

    const config: TreatmentConfig = {
      id: crypto.randomUUID(),
      gardenId: selectedGarden.id,
      gardenName: selectedGarden.name,
      zoneId: selectedLocation?.zoneId,
      zoneName: selectedLocation?.zoneName,
      fieldRowId: selectedLocation?.fieldRowId,
      fieldRowName: selectedLocation?.fieldRowName,
      sectionId: selectedLocation?.sectionId,
      sectionName: selectedLocation?.sectionName,
      ...treatmentConfig,
      schedule: scheduleConfig
    }

    onSave(config)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Configura Trattamento</h2>
            <p className="text-sm text-gray-600">
              {step === 'garden' && 'Seleziona il giardino'}
              {step === 'location' && 'Scegli zona o filare'}
              {step === 'treatment' && 'Configura trattamento'}
              {step === 'schedule' && 'Imposta programmazione'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Garden Selection */}
          {step === 'garden' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Seleziona Giardino</h3>
              
              {gardens.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">Nessun giardino disponibile</p>
                  <p className="text-sm text-gray-500 mt-2">Crea un giardino per configurare i trattamenti</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {gardens.map((garden) => (
                    <button
                      key={garden.id}
                      onClick={() => setSelectedGarden(garden)}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        selectedGarden?.id === garden.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className="text-green-600" size={20} />
                        <div>
                          <h4 className="font-semibold text-gray-900">{garden.name}</h4>
                          <p className="text-sm text-gray-600">
                            {(garden as any).location || 'Posizione non specificata'}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Location Selection */}
          {step === 'location' && selectedGarden && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Seleziona Area di Trattamento</h3>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-green-800">
                  <strong>Giardino selezionato:</strong> {selectedGarden.name}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scegli zona, filare o porzione specifica
                  </label>
                  <LocationSelector
                    garden={selectedGarden}
                    onLocationChange={(location) => {
                      setSelectedLocation(location)
                    }}
                    placeholder="Seleziona area da trattare..."
                  />
                </div>

                {selectedLocation && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800">
                      <strong>Area selezionata:</strong> {selectedLocation.fullLocationName}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Treatment Configuration */}
          {step === 'treatment' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Configura Trattamento</h3>
              
              {/* Treatment Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo di Trattamento
                </label>
                <select
                  value={treatmentConfig.treatmentType}
                  onChange={(e) => setTreatmentConfig(prev => ({ ...prev, treatmentType: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="fertilizer">Fertilizzante</option>
                  <option value="pesticide">Pesticida</option>
                  <option value="fungicide">Fungicida</option>
                  <option value="herbicide">Erbicida</option>
                  <option value="foliar">Concime Fogliare</option>
                  <option value="organic">Trattamento Biologico</option>
                </select>
              </div>

              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Prodotto
                </label>
                <input
                  type="text"
                  value={treatmentConfig.productName}
                  onChange={(e) => setTreatmentConfig(prev => ({ ...prev, productName: e.target.value }))}
                  placeholder="Es: NPK 20-20-20, Rame ossicloruro..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Concentration and Application Rate */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Concentrazione (g/L o ml/L)
                  </label>
                  <input
                    type="number"
                    value={treatmentConfig.concentration}
                    onChange={(e) => setTreatmentConfig(prev => ({ ...prev, concentration: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    min="0"
                    step="0.1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dose Applicazione (L/ha o g/m²)
                  </label>
                  <input
                    type="number"
                    value={treatmentConfig.applicationRate}
                    onChange={(e) => setTreatmentConfig(prev => ({ ...prev, applicationRate: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>

              {/* Application Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Metodo di Applicazione
                </label>
                <select
                  value={treatmentConfig.applicationMethod}
                  onChange={(e) => setTreatmentConfig(prev => ({ ...prev, applicationMethod: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="spray">Irrorazione</option>
                  <option value="drip">Fertirrigazione</option>
                  <option value="granular">Granulare</option>
                  <option value="foliar">Fogliare</option>
                  <option value="soil">Al Terreno</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note (opzionale)
                </label>
                <textarea
                  value={treatmentConfig.notes}
                  onChange={(e) => setTreatmentConfig(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Note aggiuntive sul trattamento..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          )}

          {/* Step 4: Schedule Configuration */}
          {step === 'schedule' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Programmazione Trattamento</h3>
              
              {/* Frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frequenza
                </label>
                <select
                  value={scheduleConfig.frequency}
                  onChange={(e) => setScheduleConfig(prev => ({ ...prev, frequency: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="weekly">Settimanale</option>
                  <option value="biweekly">Ogni 2 settimane</option>
                  <option value="monthly">Mensile</option>
                  <option value="seasonal">Stagionale</option>
                  <option value="custom">Personalizzata</option>
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Inizio
                </label>
                <input
                  type="date"
                  value={scheduleConfig.startDate}
                  onChange={(e) => setScheduleConfig(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* End Date (optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Fine (opzionale)
                </label>
                <input
                  type="date"
                  value={scheduleConfig.endDate}
                  onChange={(e) => setScheduleConfig(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Times */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Orari di Applicazione
                </label>
                <div className="space-y-2">
                  {scheduleConfig.times.map((time, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => {
                          const newTimes = [...scheduleConfig.times]
                          newTimes[index] = e.target.value
                          setScheduleConfig(prev => ({ ...prev, times: newTimes }))
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                      {scheduleConfig.times.length > 1 && (
                        <button
                          onClick={() => {
                            const newTimes = scheduleConfig.times.filter((_, i) => i !== index)
                            setScheduleConfig(prev => ({ ...prev, times: newTimes }))
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      setScheduleConfig(prev => ({ ...prev, times: [...prev.times, '12:00'] }))
                    }}
                    className="flex items-center gap-2 text-green-600 hover:text-green-800 text-sm"
                  >
                    <Plus size={16} />
                    Aggiungi Orario
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 bg-gray-50 px-6 py-4 flex justify-between">
          <button
            onClick={step === 'garden' ? onClose : handleBack}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ArrowLeft size={16} />
            {step === 'garden' ? 'Annulla' : 'Indietro'}
          </button>
          
          <button
            onClick={step === 'schedule' ? handleSave : handleNext}
            disabled={
              (step === 'garden' && !selectedGarden) ||
              (step === 'treatment' && !treatmentConfig.productName)
            }
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step === 'schedule' ? 'Salva Trattamento' : 'Avanti'}
            {step !== 'schedule' && <ArrowRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  )
}

// Treatment Analytics Modal Component
interface TreatmentAnalyticsModalProps {
  onClose: () => void
  treatmentConfigs: TreatmentConfig[]
}

function TreatmentAnalyticsModal({ onClose, treatmentConfigs }: TreatmentAnalyticsModalProps) {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // Mock analytics data
  const analyticsData = {
    totalTreatments: 24,
    activeTreatments: 8,
    costThisMonth: 156,
    efficiency: 91,
    treatmentsByType: [
      { type: 'Fertilizzante', count: 12, cost: 89 },
      { type: 'Fungicida', count: 6, cost: 45 },
      { type: 'Pesticida', count: 4, cost: 22 },
      { type: 'Biologico', count: 2, cost: 0 }
    ],
    monthlyTrend: [120, 145, 156], // last 3 months
    effectiveness: treatmentConfigs.map((config, index) => ({
      name: config.sectionName || config.fieldRowName || config.zoneName || config.gardenName,
      product: config.productName,
      effectiveness: 85 + Math.random() * 15,
      applications: 3 + Math.floor(Math.random() * 5),
      cost: 15 + Math.random() * 30
    }))
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Analytics Trattamenti</h2>
            <p className="text-sm text-gray-600">Analisi efficacia e costi dei trattamenti</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-3">
                <FlaskConical className="text-green-600" size={24} />
                <div>
                  <p className="text-2xl font-bold text-green-900">{analyticsData.totalTreatments}</p>
                  <p className="text-sm text-green-700">Trattamenti Totali</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-3">
                <Calendar className="text-blue-600" size={24} />
                <div>
                  <p className="text-2xl font-bold text-blue-900">{analyticsData.activeTreatments}</p>
                  <p className="text-sm text-blue-700">Attivi</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center gap-3">
                <BarChart3 className="text-purple-600" size={24} />
                <div>
                  <p className="text-2xl font-bold text-purple-900">{analyticsData.efficiency}%</p>
                  <p className="text-sm text-purple-700">Efficacia</p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <div className="flex items-center gap-3">
                <span className="text-orange-600 text-2xl">€</span>
                <div>
                  <p className="text-2xl font-bold text-orange-900">{analyticsData.costThisMonth}</p>
                  <p className="text-sm text-orange-700">Costo Mensile</p>
                </div>
              </div>
            </div>
          </div>

          {/* Treatment Types Chart */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Trattamenti per Tipo</h3>
            <div className="space-y-4">
              {analyticsData.treatmentsByType.map((treatment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{treatment.type}</h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      <span>🧪 {treatment.count} applicazioni</span>
                      <span>💰 €{treatment.cost}</span>
                    </div>
                  </div>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(treatment.count / Math.max(...analyticsData.treatmentsByType.map(t => t.count))) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Treatment Effectiveness */}
          {analyticsData.effectiveness.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Efficacia per Area</h3>
              <div className="space-y-4">
                {analyticsData.effectiveness.map((area, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{area.name}</h4>
                      <p className="text-sm text-gray-600">{area.product}</p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <span>🔄 {area.applications} applicazioni</span>
                        <span>💰 €{Math.round(area.cost)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">{Math.round(area.effectiveness)}%</div>
                      <div className="text-xs text-gray-500">efficacia</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-4">💡 Raccomandazioni AI</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <p className="text-sm text-green-800">
                  Considera l'uso di trattamenti biologici per ridurre i costi del 25% mantenendo l'efficacia
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <p className="text-sm text-green-800">
                  Ottimizza la frequenza dei trattamenti fungicidi basandoti sulle condizioni meteorologiche
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <p className="text-sm text-green-800">
                  Programma i trattamenti fogliari nelle ore più fresche per massimizzare l'assorbimento
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 bg-gray-50 px-6 py-4 flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Chiudi
          </button>
          <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Esporta Report
          </button>
        </div>
      </div>
    </div>
  )
}
