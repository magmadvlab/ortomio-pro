'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Droplets, MapPin, Settings, BarChart3, Plus, AlertTriangle } from 'lucide-react'
import { useStorage } from '@/packages/core/hooks/useStorage'
import type { Garden } from '@/types'
import IrrigationAISuggestionsWidget from '@/components/irrigation/IrrigationAISuggestionsWidget'
import ProfessionalIrrigationDashboard from '@/components/irrigation/ProfessionalIrrigationDashboard'
import IrrigationZoneManager from '@/components/irrigation/IrrigationZoneManager'
import { IrrigationSystemWizard } from '@/components/irrigation/IrrigationSystemWizard'
import { IrrigationSystemCard } from '@/components/irrigation/IrrigationSystemCard'
import { WateringLogForm } from '@/components/irrigation/WateringLogForm'
import { advancedIrrigationService } from '@/services/advancedIrrigationService'
import { buildWateringMeasuredFeedback } from '@/services/agronomicMeasuredFeedbackService'
import { buildWateringOperatorEvidence } from '@/services/agronomicOperatorEvidenceService'
import { executeWateringLogThroughUnifiedService } from '@/services/operationExecutionBridgeService'
import { finalizeTaskExecutionPostAction } from '@/services/taskExecutionPostActionService'
import type { IrrigationSystem, IrrigationZone, WateringLog } from '@/types/irrigation'
import TaskExecutionBanner from '@/components/shared/TaskExecutionBanner'
import type { TaskExecutionContext } from '@/services/taskExecutionLaunchService'
import {
  buildWateringExecutionLaunchState,
  parseTaskExecutionContext,
} from '@/services/taskExecutionOrchestratorService'

type IrrigationTab = 'dashboard' | 'zones' | 'systems'

const IRRIGATION_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'zones', label: 'Zone', icon: MapPin },
  { id: 'systems', label: 'Sistemi', icon: Settings },
] satisfies Array<{ id: IrrigationTab; label: string; icon: typeof Droplets }>

export default function IrrigationPage() {
  const { storageProvider } = useStorage()
  const searchParams = useSearchParams()
  const [gardens, setGardens] = useState<Garden[]>([])
  const [activeGarden, setActiveGarden] = useState<Garden | null>(null)
  const [showConfigWizard, setShowConfigWizard] = useState(false)
  const [editingSystem, setEditingSystem] = useState<IrrigationSystem | null>(null)
  const [zones, setZones] = useState<IrrigationZone[]>([])
  const [selectedZoneId, setSelectedZoneId] = useState('all')
  const [systems, setSystems] = useState<IrrigationSystem[]>([])
  const [systemsLoading, setSystemsLoading] = useState(false)
  const [systemsError, setSystemsError] = useState<string | null>(null)
  const [showWateringLogForm, setShowWateringLogForm] = useState(false)
  const [wateringSourceTaskId, setWateringSourceTaskId] = useState<string | undefined>(undefined)
  const [wateringLaunchDate, setWateringLaunchDate] = useState<string | undefined>(undefined)
  const [wateringLaunchNotes, setWateringLaunchNotes] = useState<string | undefined>(undefined)
  const [wateringLaunchZoneId, setWateringLaunchZoneId] = useState<string | undefined>(undefined)
  const [consumedLaunchSignature, setConsumedLaunchSignature] = useState<string | null>(null)
  const [taskExecutionContext, setTaskExecutionContext] = useState<TaskExecutionContext | null>(null)
  const [activeTab, setActiveTab] = useState<IrrigationTab>('dashboard')

  const loadZones = useCallback(async (gardenId: string) => {
    try {
      const zoneData = await advancedIrrigationService.getIrrigationZones(gardenId)
      setZones(zoneData)
      setSelectedZoneId((current) =>
        current === 'all' || zoneData.some((zone) => zone.id === current) ? current : 'all'
      )
    } catch (error) {
      console.error('Error loading irrigation zones:', error)
      setZones([])
      setSelectedZoneId('all')
    }
  }, [])

  const loadSystems = useCallback(async (gardenId: string) => {
    try {
      setSystemsLoading(true)
      setSystemsError(null)
      const allSystems = await storageProvider.getIrrigationSystems(gardenId)
      setSystems(
        selectedZoneId === 'all'
          ? allSystems
          : allSystems.filter((system) => system.zoneId === selectedZoneId)
      )
    } catch (error) {
      console.error('Error loading irrigation systems:', error)
      setSystems([])
      setSystemsError('Errore nel caricamento dei sistemi di irrigazione')
    } finally {
      setSystemsLoading(false)
    }
  }, [selectedZoneId, storageProvider])

  const openWateringExecution = useCallback((context: TaskExecutionContext) => {
    const launchState = buildWateringExecutionLaunchState(context)
    setActiveTab(launchState.activeTab)
    setWateringSourceTaskId(launchState.sourceTaskId)
    setWateringLaunchZoneId(launchState.zoneId)
    setWateringLaunchDate(launchState.date)
    setWateringLaunchNotes(launchState.notes)
    setSelectedZoneId(launchState.selectedZoneId)
    setShowWateringLogForm(launchState.showForm)
  }, [])

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
    void loadGardens()
  }, [storageProvider])

  useEffect(() => {
    if (!activeGarden) {
      setZones([])
      setSelectedZoneId('all')
      return
    }
    void loadZones(activeGarden.id)
  }, [activeGarden, loadZones])

  useEffect(() => {
    if (!activeGarden) return
    void loadSystems(activeGarden.id)
  }, [activeGarden, loadSystems])

  useEffect(() => {
    if (!activeGarden) {
      return
    }

    const context = parseTaskExecutionContext(searchParams, 'irrigation', 'Irrigation')
    if (!context || consumedLaunchSignature === context.sourceTaskId) {
      return
    }

    setTaskExecutionContext(context)
    openWateringExecution(context)
    setConsumedLaunchSignature(context.sourceTaskId)
  }, [activeGarden, searchParams, consumedLaunchSignature, openWateringExecution])

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

  const resetWateringLaunch = () => {
    setShowWateringLogForm(false)
    setWateringSourceTaskId(undefined)
    setWateringLaunchDate(undefined)
    setWateringLaunchNotes(undefined)
    setWateringLaunchZoneId(undefined)
  }

  const finalizeWateringExecution = async (
    executedLogs?: Array<Omit<WateringLog, 'id' | 'createdAt'>>
  ) => {
    if (!activeGarden) {
      return
    }

    const normalizedLogs = (executedLogs || []).map((log) => ({
      ...log,
      gardenId: log.gardenId || activeGarden.id,
      taskId: log.taskId || wateringSourceTaskId,
    }))

    await finalizeTaskExecutionPostAction({
      storageProvider,
      gardenId: activeGarden.id,
      sourceTaskId: wateringSourceTaskId,
      operatorEvidence: buildWateringOperatorEvidence(normalizedLogs),
      measuredFeedback: buildWateringMeasuredFeedback(
        normalizedLogs,
        {
          gardenId: activeGarden.id,
          plantName: taskExecutionContext?.plantName,
        }
      ),
      close: resetWateringLaunch,
      refresh: [
        () => loadZones(activeGarden.id),
        () => loadSystems(activeGarden.id),
      ],
    })
  }

  const preselectedWateringZone =
    wateringLaunchZoneId
      ? zones.find((zone) => zone.id === wateringLaunchZoneId)
      : undefined

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Droplets className="text-blue-500" size={28} />
          Sistema di Irrigazione
        </h1>
        <p className="text-gray-600 mt-1">Gestisci l'irrigazione automatica delle tue colture</p>
      </div>

      {gardens.length > 1 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleziona Giardino
          </label>
          <select
            value={activeGarden?.id || ''}
            onChange={(e) => {
              const garden = gardens.find((g) => g.id === e.target.value) || null
              setActiveGarden(garden)
            }}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {gardens.map((garden) => (
              <option key={garden.id} value={garden.id}>
                {garden.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {taskExecutionContext && (
        <TaskExecutionBanner
          context={taskExecutionContext}
          theme="irrigation"
          storageProvider={storageProvider}
          onResume={() => openWateringExecution(taskExecutionContext)}
          onDismiss={() => setTaskExecutionContext(null)}
        />
      )}


      {/* AI Suggestions Widget */}
      {activeGarden && (
        <div className="mb-6">
          <IrrigationAISuggestionsWidget garden={activeGarden} maxItems={2} />
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px space-x-4 md:space-x-8">
            {IRRIGATION_TABS.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
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
        </div>
      </div>

      {/* Contenuto */}
      {activeTab === 'dashboard' && activeGarden && (
        <ProfessionalIrrigationDashboard
          garden={activeGarden}
          onNavigateToZones={() => setActiveTab('zones')}
          onNavigateToSystems={() => setActiveTab('systems')}
        />
      )}

      {activeTab === 'zones' && activeGarden && (
        <IrrigationZoneManager
          garden={activeGarden}
          onZoneSelect={(zone) => {
            setSelectedZoneId(zone.id)
            setActiveTab('systems')
          }}
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


      {showWateringLogForm && activeGarden && (
        <WateringLogForm
          zones={zones}
          preselectedZone={preselectedWateringZone}
          sourceTaskId={wateringSourceTaskId}
          initialDate={wateringLaunchDate}
          initialNotes={wateringLaunchNotes}
          onExecuted={finalizeWateringExecution}
          onSubmit={async (log) => {
            await executeWateringLogThroughUnifiedService(storageProvider, log)
            await finalizeWateringExecution([log])
          }}
          onCancel={resetWateringLaunch}
        />
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

    </div>
  )
}
