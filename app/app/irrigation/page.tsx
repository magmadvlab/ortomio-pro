'use client'

import { useState, useEffect } from 'react'
import { Droplets, Clock, MapPin, Settings, BarChart3, Plus, AlertTriangle, X, ArrowLeft, ArrowRight } from 'lucide-react'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { Garden } from '@/types'
import IrrigationAISuggestionsWidget from '@/components/irrigation/IrrigationAISuggestionsWidget'
import ProfessionalIrrigationDashboard from '@/components/irrigation/ProfessionalIrrigationDashboard'
import IrrigationZoneManager from '@/components/irrigation/IrrigationZoneManager'
import { IrrigationSystemWizard } from '@/components/irrigation/IrrigationSystemWizard'
import { IrrigationSystemCard } from '@/components/irrigation/IrrigationSystemCard'
import { advancedIrrigationService } from '@/services/advancedIrrigationService'
import type { IrrigationSystem, IrrigationZone } from '@/types/irrigation'
import LocationSelector from '@/components/shared/LocationSelector'

interface IrrigationConfig {
  id: string
  gardenId: string
  gardenName: string
  zoneId?: string
  zoneName?: string
  fieldRowId?: string
  fieldRowName?: string
  sectionId?: string
  sectionName?: string
  irrigationType: 'drip' | 'sprinkler' | 'micro_sprinkler' | 'flood' | 'manual'
  tubeLength: number
  tubeDiameter: number
  flowRate: number
  pressure: number
  emitterSpacing: number
  emitterFlowRate: number
  schedule: {
    frequency: 'daily' | 'every_2_days' | 'every_3_days' | 'weekly' | 'custom'
    times: string[]
    duration: number
    daysOfWeek?: number[]
  }
}

export default function IrrigationPage() {
  const { storageProvider } = useStorage()
  const [gardens, setGardens] = useState<Garden[]>([])
  const [activeGarden, setActiveGarden] = useState<Garden | null>(null)
  const [showConfigWizard, setShowConfigWizard] = useState(false)
  const [editingSystem, setEditingSystem] = useState<IrrigationSystem | null>(null)
  const [irrigationConfigs, setIrrigationConfigs] = useState<IrrigationConfig[]>([])
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [zones, setZones] = useState<IrrigationZone[]>([])
  const [selectedZoneId, setSelectedZoneId] = useState('all')
  const [systems, setSystems] = useState<IrrigationSystem[]>([])
  const [systemsLoading, setSystemsLoading] = useState(false)
  const [systemsError, setSystemsError] = useState<string | null>(null)

  useEffect(() => {
    const loadGardens = async () => {
      try {
        const loadedGardens = await storageProvider.getGardens()
        setGardens(loadedGardens)
        if (loadedGardens.length > 0) {
          setActiveGarden(loadedGardens[0])
        }
      } catch (error) {
        console.error('Error loading gardens:', error)
      }
    }
    loadGardens()
  }, [storageProvider])

  useEffect(() => {
    if (!activeGarden) {
      setZones([])
      setSelectedZoneId('all')
      return
    }
    loadZones(activeGarden.id)
    loadSystems(activeGarden.id)
  }, [activeGarden])

  useEffect(() => {
    if (!activeGarden) return
    loadSystems(activeGarden.id)
  }, [selectedZoneId, activeGarden])

  const loadZones = async (gardenId: string) => {
    try {
      const zoneData = await advancedIrrigationService.getIrrigationZones(gardenId)
      setZones(zoneData)
      if (zoneData.length > 0) {
        setSelectedZoneId((current) =>
          current === 'all' || (current && zoneData.some((zone) => zone.id === current)) ? current : 'all'
        )
      } else {
        setSelectedZoneId('all')
      }
    } catch (error) {
      console.error('Error loading irrigation zones:', error)
      setZones([])
      setSelectedZoneId('all')
    }
  }

  const loadSystems = async (gardenId: string) => {
    try {
      setSystemsLoading(true)
      setSystemsError(null)
      const allSystems = await storageProvider.getIrrigationSystems(gardenId)
      const filteredSystems =
        selectedZoneId === 'all'
          ? allSystems
          : allSystems.filter((system) => system.zoneId === selectedZoneId)
      setSystems(filteredSystems)
    } catch (error) {
      console.error('Error loading irrigation systems:', error)
      setSystems([])
      setSystemsError('Errore nel caricamento dei sistemi di irrigazione')
    } finally {
      setSystemsLoading(false)
    }
  }

  const handleCreateSystem = async (system: Omit<IrrigationSystem, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingSystem) {
      await advancedIrrigationService.updateIrrigationSystem(editingSystem.id, {
        ...system,
        gardenId: activeGarden?.id,
        zoneId: selectedZoneId !== 'all' ? selectedZoneId : undefined,
        isActive: true
      })
    } else {
      await advancedIrrigationService.createIrrigationSystem({
        ...system,
        gardenId: activeGarden?.id,
        zoneId: selectedZoneId !== 'all' ? selectedZoneId : undefined,
        isActive: true
      })
    }

    setEditingSystem(null)
    setShowConfigWizard(false)
    if (activeGarden) {
      await loadSystems(activeGarden.id)
    }
    if (activeGarden) {
      await loadZones(activeGarden.id)
    }
  }

  const handleEditSystem = (system: IrrigationSystem) => {
    setEditingSystem(system)
    if (system.zoneId) {
      setSelectedZoneId(system.zoneId)
    }
    setShowConfigWizard(true)
  }

  const handleDeleteSystem = async (systemId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo sistema di irrigazione?')) {
      return
    }

    await advancedIrrigationService.deleteIrrigationSystem(systemId)
    if (activeGarden) {
      await loadSystems(activeGarden.id)
      await loadZones(activeGarden.id)
    }
  }

  const [activeTab, setActiveTab] = useState<'dashboard' | 'zones' | 'systems' | 'analytics' | 'scheduler'>('dashboard')

  const irrigationZones = [
    {
      id: '1',
      name: 'Zona Pomodori',
      status: 'active',
      lastWatering: '2024-01-12 08:30',
      nextWatering: '2024-01-13 08:00',
      waterUsed: 45,
      soilMoisture: 65
    },
    {
      id: '2',
      name: 'Zona Insalate',
      status: 'scheduled',
      lastWatering: '2024-01-11 18:00',
      nextWatering: '2024-01-12 18:00',
      waterUsed: 25,
      soilMoisture: 45
    },
    {
      id: '3',
      name: 'Zona Erbe Aromatiche',
      status: 'idle',
      lastWatering: '2024-01-10 09:15',
      nextWatering: '2024-01-14 09:00',
      waterUsed: 15,
      soilMoisture: 70
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'idle': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Attiva'
      case 'scheduled': return 'Programmata'
      case 'idle': return 'Inattiva'
      default: return 'Sconosciuto'
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Droplets className="text-blue-500" size={28} />
          Sistema di Irrigazione
        </h1>
        <p className="text-gray-600 mt-1">Gestisci l'irrigazione automatica delle tue colture</p>
      </div>

      {/* Statistiche Rapide */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Droplets className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">85L</p>
              <p className="text-sm text-gray-600">Oggi</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <MapPin className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">3</p>
              <p className="text-sm text-gray-600">Zone Attive</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">15%</p>
              <p className="text-sm text-gray-600">Risparmio</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="text-orange-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">68%</p>
              <p className="text-sm text-gray-600">Umidità Media</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Suggestions Widget */}
      {activeGarden && (
        <div className="mb-6">
          <IrrigationAISuggestionsWidget garden={activeGarden} maxItems={2} />
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          {/* Desktop: Single row */}
          <nav className="hidden md:flex -mb-px space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'zones', label: 'Zone', icon: MapPin },
              { id: 'systems', label: 'Sistemi', icon: Settings },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'scheduler', label: 'Programmazione', icon: Clock }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
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
                { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                { id: 'zones', label: 'Zone', icon: MapPin },
                { id: 'systems', label: 'Sistemi', icon: Settings }
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-1 py-3 px-2 border-b-2 font-medium text-xs transition-colors flex-1 justify-center ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
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
                { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                { id: 'scheduler', label: 'Programmazione', icon: Clock }
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-1 py-3 px-2 border-b-2 font-medium text-xs transition-colors flex-1 justify-center ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
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
        <ProfessionalIrrigationDashboard
          garden={activeGarden}
          onNavigateToZones={() => setActiveTab('zones')}
          onNavigateToSystems={() => setActiveTab('systems')}
          onNavigateToAnalytics={() => setActiveTab('analytics')}
          onNavigateToScheduler={() => setActiveTab('scheduler')}
        />
      )}

      {activeTab === 'zones' && activeGarden && (
        <IrrigationZoneManager
          garden={activeGarden}
          onZoneSelect={(zone) => console.log('Zone selected:', zone)}
          onSystemConfig={(zoneId) => {
            setSelectedZoneId(zoneId)
            setActiveTab('systems')
          }}
        />
      )}

      {activeTab === 'systems' && activeGarden && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Configurazione Sistemi</h2>
                <p className="text-gray-600 mt-1">
                  Associa e gestisci gli impianti irrigui per ogni zona reale del giardino
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingSystem(null)
                  setShowConfigWizard(true)
                }}
                className="inline-flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Plus size={18} />
                Nuovo Sistema
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Zona Irrigua</label>
                  <select
                    value={selectedZoneId}
                    onChange={(event) => setSelectedZoneId(event.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Tutti i sistemi del giardino</option>
                    {zones.map((zone) => (
                        <option key={zone.id} value={zone.id}>
                          {zone.name}
                        </option>
                      ))}
                  </select>
                </div>

                {selectedZoneId !== 'all' && zones.length > 0 && (
                  <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                    {(() => {
                      const selectedZone = zones.find((zone) => zone.id === selectedZoneId)
                      if (!selectedZone) return null
                      return (
                        <div className="space-y-2 text-sm">
                          <p className="font-medium text-blue-900">{selectedZone.name}</p>
                          <p className="text-blue-800">
                            Area: {selectedZone.areaSqm ? `${selectedZone.areaSqm} m²` : 'non definita'}
                          </p>
                          <p className="text-blue-800">
                            Terreno: {selectedZone.soilType || 'non definito'}
                          </p>
                          <p className="text-blue-800">
                            Sistemi filtrati: {systems.length}
                          </p>
                        </div>
                      )
                    })()}
                  </div>
                )}
              </div>

              <div className="lg:col-span-2">
                {systemsLoading ? (
                  <div className="rounded-lg border border-gray-200 p-10 text-center">
                    <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
                    <p className="text-gray-600">Caricamento sistemi...</p>
                  </div>
                ) : systemsError ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-6 flex items-start gap-3">
                    <AlertTriangle className="text-red-500 mt-0.5" size={18} />
                    <p className="text-red-800">{systemsError}</p>
                  </div>
                ) : systems.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-blue-300 bg-blue-50 p-10 text-center">
                    <Settings className="mx-auto mb-4 text-blue-500" size={40} />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Nessun sistema configurato</h3>
                    <p className="text-gray-600 mb-6">
                      {selectedZoneId === 'all'
                        ? 'Crea il primo impianto irriguo del giardino. Potrai poi collegarlo a una zona specifica se necessario.'
                        : 'Crea il primo impianto per la zona selezionata e collegalo a filari, aiuole o settori reali.'}
                    </p>
                    <button
                      onClick={() => {
                        setEditingSystem(null)
                        setShowConfigWizard(true)
                      }}
                      className="inline-flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus size={18} />
                      Crea Primo Sistema
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {systems.map((system) => (
                      <IrrigationSystemCard
                        key={system.id}
                        system={system}
                        onEdit={() => handleEditSystem(system)}
                        onDelete={() => handleDeleteSystem(system.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center py-12">
            <BarChart3 className="mx-auto mb-4 text-purple-500" size={48} />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Analytics Avanzate</h2>
            <p className="text-gray-600 mb-6">
              Analizza consumi, efficienza e performance del sistema
            </p>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-purple-800">
                📊 Componente in sviluppo - Sarà disponibile nel prossimo aggiornamento
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'scheduler' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center py-12">
            <Clock className="mx-auto mb-4 text-green-500" size={48} />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Programmazione Automatica</h2>
            <p className="text-gray-600 mb-6">
              Configura orari e condizioni per l'irrigazione automatica
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-green-800">
                ⏰ Componente in sviluppo - Sarà disponibile nel prossimo aggiornamento
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Irrigation Configuration Wizard */}
      {showConfigWizard && activeGarden && (
        <IrrigationSystemWizard
          gardenId={activeGarden.id}
          initialSystem={editingSystem}
          onCancel={() => {
            setEditingSystem(null)
            setShowConfigWizard(false)
          }}
          onComplete={handleCreateSystem}
        />
      )}

      {/* Analytics Modal */}
      {showAnalytics && (
        <IrrigationAnalyticsModal
          onClose={() => setShowAnalytics(false)}
          irrigationConfigs={irrigationConfigs}
        />
      )}
    </div>
  )
}

// Irrigation Configuration Wizard Component
interface IrrigationConfigWizardProps {
  gardens: Garden[]
  onClose: () => void
  onSave: (config: IrrigationConfig) => void
}

function IrrigationConfigWizard({ gardens, onClose, onSave }: IrrigationConfigWizardProps) {
  const [step, setStep] = useState<'garden' | 'location' | 'system' | 'schedule'>('garden')
  const [selectedGarden, setSelectedGarden] = useState<Garden | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<any>(null)
  const [systemConfig, setSystemConfig] = useState({
    irrigationType: 'drip' as const,
    tubeLength: 100,
    tubeDiameter: 16,
    flowRate: 2.0,
    pressure: 1.5,
    emitterSpacing: 30,
    emitterFlowRate: 2.0
  })
  const [scheduleConfig, setScheduleConfig] = useState<IrrigationConfig['schedule']>({
    frequency: 'daily',
    times: ['08:00'],
    duration: 30,
    daysOfWeek: [1, 2, 3, 4, 5, 6, 0] // All days
  })

  const formatGardenLocation = (garden: Garden) => {
    if (garden.coordinates?.latitude !== undefined && garden.coordinates?.longitude !== undefined) {
      return `${garden.coordinates.latitude.toFixed(4)}, ${garden.coordinates.longitude.toFixed(4)}`
    }
    return 'Posizione non specificata'
  }

  const handleNext = () => {
    if (step === 'garden' && selectedGarden) {
      setStep('location')
    } else if (step === 'location') {
      setStep('system')
    } else if (step === 'system') {
      setStep('schedule')
    }
  }

  const handleBack = () => {
    if (step === 'location') {
      setStep('garden')
    } else if (step === 'system') {
      setStep('location')
    } else if (step === 'schedule') {
      setStep('system')
    }
  }

  const handleSave = () => {
    if (!selectedGarden) return

    const config: IrrigationConfig = {
      id: crypto.randomUUID(),
      gardenId: selectedGarden.id,
      gardenName: selectedGarden.name,
      zoneId: selectedLocation?.zoneId,
      zoneName: selectedLocation?.zoneName,
      fieldRowId: selectedLocation?.fieldRowId,
      fieldRowName: selectedLocation?.fieldRowName,
      sectionId: selectedLocation?.sectionId,
      sectionName: selectedLocation?.sectionName,
      ...systemConfig,
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
            <h2 className="text-xl font-bold text-gray-800">Configura Irrigazione</h2>
            <p className="text-sm text-gray-600">
              {step === 'garden' && 'Seleziona il giardino'}
              {step === 'location' && 'Scegli zona o filare'}
              {step === 'system' && 'Configura sistema irrigazione'}
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
                  <p className="text-sm text-gray-500 mt-2">Crea un giardino per configurare l'irrigazione</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {gardens.map((garden) => (
                    <button
                      key={garden.id}
                      onClick={() => setSelectedGarden(garden)}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        selectedGarden?.id === garden.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className="text-blue-600" size={20} />
                        <div>
                          <h4 className="font-semibold text-gray-900">{garden.name}</h4>
                          <p className="text-sm text-gray-600">
                            {formatGardenLocation(garden)}
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Seleziona Area di Irrigazione</h3>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
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
                    placeholder="Seleziona area da irrigare..."
                  />
                </div>

                {selectedLocation && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800">
                      <strong>Area selezionata:</strong> {selectedLocation.fullLocationName}
                    </p>
                  </div>
                )}

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Opzioni disponibili:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• <strong>Intero giardino:</strong> Configura irrigazione per tutto il giardino</li>
                    <li>• <strong>Zona specifica:</strong> Irrigazione per una zona definita</li>
                    <li>• <strong>Filare:</strong> Irrigazione per un singolo filare</li>
                    <li>• <strong>Porzione di filare:</strong> Irrigazione per una sezione specifica</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: System Configuration */}
          {step === 'system' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Configura Sistema di Irrigazione</h3>
              
              {/* Irrigation Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo di Irrigazione
                </label>
                <select
                  value={systemConfig.irrigationType}
                  onChange={(e) => setSystemConfig(prev => ({ ...prev, irrigationType: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="drip">Goccia a Goccia</option>
                  <option value="sprinkler">Aspersione</option>
                  <option value="micro_sprinkler">Micro-aspersione</option>
                  <option value="flood">Scorrimento</option>
                  <option value="manual">Manuale</option>
                </select>
              </div>

              {/* Tube Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lunghezza Tubo (m)
                  </label>
                  <input
                    type="number"
                    value={systemConfig.tubeLength}
                    onChange={(e) => setSystemConfig(prev => ({ ...prev, tubeLength: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diametro Tubo (mm)
                  </label>
                  <select
                    value={systemConfig.tubeDiameter}
                    onChange={(e) => setSystemConfig(prev => ({ ...prev, tubeDiameter: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="12">12 mm</option>
                    <option value="16">16 mm</option>
                    <option value="20">20 mm</option>
                    <option value="25">25 mm</option>
                    <option value="32">32 mm</option>
                  </select>
                </div>
              </div>

              {/* Flow and Pressure */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Portata (L/min)
                  </label>
                  <input
                    type="number"
                    value={systemConfig.flowRate}
                    onChange={(e) => setSystemConfig(prev => ({ ...prev, flowRate: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pressione (bar)
                  </label>
                  <input
                    type="number"
                    value={systemConfig.pressure}
                    onChange={(e) => setSystemConfig(prev => ({ ...prev, pressure: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>

              {/* Emitter Configuration (for drip irrigation) */}
              {systemConfig.irrigationType === 'drip' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-3">Configurazione Gocciolatori</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-800 mb-2">
                        Spaziatura Gocciolatori (cm)
                      </label>
                      <input
                        type="number"
                        value={systemConfig.emitterSpacing}
                        onChange={(e) => setSystemConfig(prev => ({ ...prev, emitterSpacing: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        min="10"
                        step="5"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-blue-800 mb-2">
                        Portata Gocciolatore (L/h)
                      </label>
                      <select
                        value={systemConfig.emitterFlowRate}
                        onChange={(e) => setSystemConfig(prev => ({ ...prev, emitterFlowRate: parseFloat(e.target.value) }))}
                        className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="1.0">1.0 L/h</option>
                        <option value="2.0">2.0 L/h</option>
                        <option value="4.0">4.0 L/h</option>
                        <option value="8.0">8.0 L/h</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Schedule Configuration */}
          {step === 'schedule' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Programmazione Irrigazione</h3>
              
              {/* Frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frequenza
                </label>
                <select
                  value={scheduleConfig.frequency}
                  onChange={(e) => setScheduleConfig(prev => ({ ...prev, frequency: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="daily">Giornaliera</option>
                  <option value="every_2_days">Ogni 2 giorni</option>
                  <option value="every_3_days">Ogni 3 giorni</option>
                  <option value="weekly">Settimanale</option>
                  <option value="custom">Personalizzata</option>
                </select>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durata Irrigazione (minuti)
                </label>
                <input
                  type="number"
                  value={scheduleConfig.duration}
                  onChange={(e) => setScheduleConfig(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="120"
                />
              </div>

              {/* Times */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Orari di Irrigazione
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
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <Plus size={16} />
                    Aggiungi Orario
                  </button>
                </div>
              </div>

              {/* Days of Week (for custom frequency) */}
              {scheduleConfig.frequency === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giorni della Settimana
                  </label>
                  <div className="grid grid-cols-7 gap-2">
                    {['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'].map((day, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          const newDays = scheduleConfig.daysOfWeek?.includes(index)
                            ? scheduleConfig.daysOfWeek.filter(d => d !== index)
                            : [...(scheduleConfig.daysOfWeek || []), index]
                          setScheduleConfig(prev => ({ ...prev, daysOfWeek: newDays }))
                        }}
                        className={`p-2 text-sm rounded-lg border-2 transition-colors ${
                          scheduleConfig.daysOfWeek?.includes(index)
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 text-gray-600 hover:border-blue-300'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              )}
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
              (step === 'location' && !selectedLocation && (selectedGarden as any)?.zones?.length > 0)
            }
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step === 'schedule' ? 'Salva Configurazione' : 'Avanti'}
            {step !== 'schedule' && <ArrowRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  )
}

// Irrigation Analytics Modal Component
interface IrrigationAnalyticsModalProps {
  onClose: () => void
  irrigationConfigs: IrrigationConfig[]
}

function IrrigationAnalyticsModal({ onClose, irrigationConfigs }: IrrigationAnalyticsModalProps) {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // Mock analytics data
  const analyticsData = {
    totalWaterUsed: 1250, // liters this month
    efficiency: 87, // percentage
    costSavings: 45, // euros saved
    avgDuration: 28, // minutes per session
    systemHealth: 92, // percentage
    weeklyUsage: [120, 135, 98, 156, 142, 178, 165], // last 7 days
    monthlyTrend: [980, 1120, 1250], // last 3 months
    zoneEfficiency: irrigationConfigs.map((config, index) => ({
      name: config.sectionName || config.fieldRowName || config.zoneName || config.gardenName,
      efficiency: 85 + Math.random() * 15,
      waterUsed: 200 + Math.random() * 300,
      sessions: 15 + Math.floor(Math.random() * 10)
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
            <h2 className="text-xl font-bold text-gray-800">Analytics Irrigazione</h2>
            <p className="text-sm text-gray-600">Analisi dettagliata consumi ed efficienza</p>
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
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-3">
                <Droplets className="text-blue-600" size={24} />
                <div>
                  <p className="text-2xl font-bold text-blue-900">{analyticsData.totalWaterUsed}L</p>
                  <p className="text-sm text-blue-700">Acqua Utilizzata</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-3">
                <BarChart3 className="text-green-600" size={24} />
                <div>
                  <p className="text-2xl font-bold text-green-900">{analyticsData.efficiency}%</p>
                  <p className="text-sm text-green-700">Efficienza</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center gap-3">
                <Clock className="text-purple-600" size={24} />
                <div>
                  <p className="text-2xl font-bold text-purple-900">{analyticsData.avgDuration}min</p>
                  <p className="text-sm text-purple-700">Durata Media</p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <div className="flex items-center gap-3">
                <Settings className="text-orange-600" size={24} />
                <div>
                  <p className="text-2xl font-bold text-orange-900">{analyticsData.systemHealth}%</p>
                  <p className="text-sm text-orange-700">Salute Sistema</p>
                </div>
              </div>
            </div>
          </div>

          {/* Usage Chart */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Consumo Settimanale</h3>
            <div className="flex items-end justify-between h-40 gap-2">
              {analyticsData.weeklyUsage.map((usage, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div 
                    className="bg-blue-500 rounded-t w-full transition-all duration-500"
                    style={{ height: `${(usage / Math.max(...analyticsData.weeklyUsage)) * 100}%` }}
                  ></div>
                  <p className="text-xs text-gray-600 mt-2">
                    {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'][index]}
                  </p>
                  <p className="text-xs font-medium text-gray-800">{usage}L</p>
                </div>
              ))}
            </div>
          </div>

          {/* Zone Efficiency */}
          {analyticsData.zoneEfficiency.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Efficienza per Zona</h3>
              <div className="space-y-4">
                {analyticsData.zoneEfficiency.map((zone, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{zone.name}</h4>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <span>💧 {Math.round(zone.waterUsed)}L</span>
                        <span>🔄 {zone.sessions} sessioni</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">{Math.round(zone.efficiency)}%</div>
                      <div className="text-xs text-gray-500">efficienza</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Raccomandazioni AI</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <p className="text-sm text-blue-800">
                  Considera di ridurre la durata dell'irrigazione del 10% nelle zone con efficienza superiore al 90%
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <p className="text-sm text-blue-800">
                  Il consumo è aumentato del 12% rispetto al mese scorso. Verifica eventuali perdite nel sistema
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <p className="text-sm text-blue-800">
                  Ottimizza gli orari di irrigazione per le ore più fresche (6:00-8:00 e 18:00-20:00)
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
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Esporta Report
          </button>
        </div>
      </div>
    </div>
  )
}
