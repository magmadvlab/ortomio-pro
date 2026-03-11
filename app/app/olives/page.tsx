'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import {
  Calendar,
  CircleDot,
  Droplets,
  Filter,
  Info,
  MapPin,
  Plus,
  Scissors,
  TreePine,
  Users,
} from 'lucide-react'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { FeatureGate } from '@/components/shared/FeatureGate'
import LocationSelector from '@/components/shared/LocationSelector'
import SmartPlantManager from '@/components/plants/SmartPlantManager'
import OrchardWizard from '@/components/orchard/OrchardWizard'
import TreeManager from '@/components/orchard/TreeManager'
import PruningManager from '@/components/orchard/PruningManager'
import HarvestManager from '@/components/orchard/HarvestManager'
import { GardenTask } from '@/types'
import { getMasterSheetSync } from '@/services/plantMasterService'
import { orchardService } from '@/services/orchardService'
import {
  OliveGardenContext,
  resolveOliveGardenContexts,
} from '@/services/woodyGardenResolverService'

type ViewMode = 'overview' | 'trees' | 'pruning' | 'harvest' | 'individual-plants'

interface OliveSummary {
  totalOliveGroves: number
  totalTrees: number
  treesNeedingAttention: number
  upcomingHarvests: number
}

const EMPTY_SUMMARY: OliveSummary = {
  totalOliveGroves: 0,
  totalTrees: 0,
  treesNeedingAttention: 0,
  upcomingHarvests: 0,
}

export default function OlivesPage() {
  const { storageProvider } = useStorage()
  const [contexts, setContexts] = useState<OliveGardenContext[]>([])
  const [tasks, setTasks] = useState<GardenTask[]>([])
  const [filteredTasks, setFilteredTasks] = useState<GardenTask[]>([])
  const [selectedGardenId, setSelectedGardenId] = useState('')
  const [selectedOrchardId, setSelectedOrchardId] = useState('')
  const [selectedLocation, setSelectedLocation] = useState<any>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('overview')
  const [upcomingPrunings, setUpcomingPrunings] = useState<any[]>([])
  const [summary, setSummary] = useState<OliveSummary>(EMPTY_SUMMARY)
  const [showWizard, setShowWizard] = useState(false)
  const [loading, setLoading] = useState(true)

  const selectedContext = useMemo(
    () => contexts.find((context) => context.garden.id === selectedGardenId),
    [contexts, selectedGardenId]
  )
  const selectedGarden = selectedContext?.garden
  const selectedOrchards = selectedContext?.oliveOrchards || []
  const selectedOrchard =
    selectedOrchards.find((orchard) => orchard.id === selectedOrchardId) || selectedOrchards[0] || null

  useEffect(() => {
    loadContexts()
  }, [storageProvider])

  useEffect(() => {
    if (contexts.length === 0) {
      setSelectedGardenId('')
      return
    }

    if (!selectedGardenId || !contexts.some((context) => context.garden.id === selectedGardenId)) {
      setSelectedGardenId(contexts[0].garden.id)
    }
  }, [contexts, selectedGardenId])

  useEffect(() => {
    if (!selectedContext) {
      setSelectedOrchardId('')
      return
    }

    const orchardIds = selectedContext.oliveOrchards.map((orchard) => orchard.id)
    if (!selectedOrchardId || !orchardIds.includes(selectedOrchardId)) {
      setSelectedOrchardId(orchardIds[0] || '')
    }
  }, [selectedContext, selectedOrchardId])

  useEffect(() => {
    if (!selectedGardenId || !selectedContext) {
      setTasks([])
      setFilteredTasks([])
      setUpcomingPrunings([])
      setSummary(EMPTY_SUMMARY)
      return
    }

    loadOperationalData(selectedContext)
  }, [storageProvider, selectedGardenId, selectedContext])

  useEffect(() => {
    if (!selectedLocation) {
      setFilteredTasks(tasks)
      return
    }

    const filtered = tasks.filter((task) => {
      const taskAny = task as any
      if (selectedLocation.sectionId && taskAny.fieldRowSectionId) {
        return taskAny.fieldRowSectionId === selectedLocation.sectionId
      }
      if (selectedLocation.fieldRowId && taskAny.fieldRowId) {
        return taskAny.fieldRowId === selectedLocation.fieldRowId
      }
      if (selectedLocation.zoneId && taskAny.zoneId) {
        return taskAny.zoneId === selectedLocation.zoneId
      }
      return true
    })

    setFilteredTasks(filtered)
  }, [tasks, selectedLocation])

  const loadContexts = async () => {
    try {
      setLoading(true)
      const allGardens = await storageProvider.getGardens()
      const resolvedContexts = await resolveOliveGardenContexts(allGardens)
      setContexts(resolvedContexts)
    } catch (error) {
      console.error('Error loading olive gardens:', error)
      setContexts([])
    } finally {
      setLoading(false)
    }
  }

  const loadOperationalData = async (context: OliveGardenContext) => {
    try {
      const [gardenTasks, mechanicalWorks, treeGroups, harvestScheduleGroups] = await Promise.all([
        storageProvider.getTasks(context.garden.id),
        storageProvider.getMechanicalWorks(context.garden.id),
        Promise.all(context.oliveOrchards.map((orchard) => orchardService.getOrchardTrees(orchard.id))),
        Promise.all(context.oliveOrchards.map((orchard) => orchardService.getHarvestSchedules(orchard.id))),
      ])

      const oliveTasks = (gardenTasks || []).filter((task) => {
        const master = getMasterSheetSync(task.plantName)
        return master?.cropType === 'Olive'
      })

      const pruningWorks = mechanicalWorks
        .filter((work) => work.work_type.includes('Pruning') || work.work_type === 'OliveShredding')
        .map((work) => ({ ...work, work_date: new Date(work.work_date) }))
        .filter((work) => work.work_date >= new Date())
        .sort((left, right) => left.work_date.getTime() - right.work_date.getTime())
        .slice(0, 5)

      const trees = treeGroups.flat()
      const harvestSchedules = harvestScheduleGroups.flat()
      const totalTrees =
        trees.length > 0
          ? trees.length
          : context.oliveOrchards.reduce((sum, orchard) => sum + (orchard.totalTrees || 0), 0)

      setTasks(oliveTasks)
      setUpcomingPrunings(pruningWorks)
      setSummary({
        totalOliveGroves: context.oliveOrchards.length,
        totalTrees,
        treesNeedingAttention: trees.filter(
          (tree) => tree.needsPruning || tree.needsTreatment || tree.healthStatus !== 'healthy'
        ).length,
        upcomingHarvests: harvestSchedules.filter((schedule) =>
          ['scheduled', 'planned', 'in_progress'].includes(String((schedule as any).status))
        ).length,
      })
    } catch (error) {
      console.error('Error loading olive operational data:', error)
      setTasks([])
      setFilteredTasks([])
      setUpcomingPrunings([])
      setSummary(EMPTY_SUMMARY)
    }
  }

  const handleWizardComplete = async (_orchardId: string) => {
    setShowWizard(false)
    await loadContexts()
  }

  const renderNavigation = () => {
    if (!selectedGarden) return null

    const items: Array<{ key: ViewMode; label: string; icon: React.ReactNode }> = [
      { key: 'overview', label: 'Panoramica', icon: <CircleDot size={16} /> },
      { key: 'individual-plants', label: 'Olivi Individuali', icon: <Users size={16} /> },
    ]

    if (selectedOrchard) {
      items.splice(1, 0, { key: 'trees', label: 'Alberi', icon: <TreePine size={16} /> })
      items.splice(2, 0, { key: 'pruning', label: 'Potature', icon: <Scissors size={16} /> })
      items.splice(3, 0, { key: 'harvest', label: 'Raccolte', icon: <Calendar size={16} /> })
    }

    return (
      <div className="bg-white rounded-lg shadow-md p-2 mb-6">
        <div className="flex gap-2 overflow-x-auto">
          {items.map((item) => (
            <button
              key={item.key}
              onClick={() => setViewMode(item.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                viewMode === item.key
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </div>
    )
  }

  const renderOverview = () => {
    if (!selectedGarden) {
      return (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <CircleDot className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600 mb-2">Nessun oliveto disponibile</p>
          <p className="text-sm text-gray-500">Configura un giardino legnoso per iniziare</p>
        </div>
      )
    }

    if (selectedOrchards.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <CircleDot className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nessun impianto olivicolo configurato</h3>
          <p className="text-gray-600 mb-4">
            Il giardino esiste, ma manca ancora la configurazione operativa dell&apos;oliveto.
          </p>
          <button
            onClick={() => setShowWizard(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus size={18} />
            Configura Oliveto
          </button>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <SummaryCard label="Oliveti Totali" value={summary.totalOliveGroves} accent="green" />
          <SummaryCard label="Olivi Totali" value={summary.totalTrees} accent="blue" />
          <SummaryCard label="Necessitano Attenzione" value={summary.treesNeedingAttention} accent="orange" />
          <SummaryCard label="Raccolte Programmate" value={summary.upcomingHarvests} accent="purple" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {selectedOrchards.map((orchard) => (
            <button
              key={orchard.id}
              onClick={() => {
                setSelectedOrchardId(orchard.id)
                setViewMode('trees')
              }}
              className={`bg-white rounded-lg shadow-md border p-6 text-left transition-all ${
                selectedOrchard?.id === orchard.id
                  ? 'border-green-400 shadow-lg'
                  : 'border-gray-200 hover:border-green-300 hover:shadow-lg'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{orchard.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">Oliveto operativo</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  Attivo
                </span>
              </div>

              <div className="mt-4 space-y-2 text-sm text-gray-600">
                {orchard.establishedDate && (
                  <div>Impianto: {format(new Date(orchard.establishedDate), 'dd MMM yyyy', { locale: it })}</div>
                )}
                <div>Alberi: {orchard.totalTrees}</div>
                {orchard.mainVarieties.length > 0 && (
                  <div>Varietà: {orchard.mainVarieties.slice(0, 3).map((item) => item.variety).join(', ')}</div>
                )}
              </div>

              <div className="mt-5 text-sm font-medium text-green-700">Gestisci albero per albero →</div>
            </button>
          ))}
        </div>

        {upcomingPrunings.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Scissors className="text-green-600" size={24} />
              Prossime Potature
            </h2>
            <div className="space-y-2">
              {upcomingPrunings.map((pruning, index) => (
                <div
                  key={`${pruning.id || pruning.work_date}-${index}`}
                  className="p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium text-gray-800">
                      {pruning.work_metadata?.cropName || 'Potatura olivo'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {format(pruning.work_date, 'dd MMMM yyyy', { locale: it })}
                    </div>
                  </div>
                  <Link
                    href="/app/mechanical-work?filter=Pruning"
                    className="text-green-600 hover:text-green-800 text-sm"
                  >
                    Dettagli →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedLocation
                  ? `Task oliveto in ${selectedLocation.fullLocationName} (${filteredTasks.length})`
                  : `Task oliveto (${tasks.length})`}
              </h2>
              <div className="flex items-center gap-2">
                <Link
                  href="/app/mechanical-work?filter=Pruning"
                  className="flex items-center gap-2 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm"
                >
                  <Scissors size={16} />
                  Potature
                </Link>
                <Link
                  href="/app/harvest"
                  className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                >
                  <Calendar size={16} />
                  Raccolti
                </Link>
              </div>
            </div>
          </div>

          {tasks.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              Nessun task olivicolo dedicato nel planner. Gli alberi e le operazioni restano comunque gestibili da
              questa sezione.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredTasks.map((task) => {
                const masterData = getMasterSheetSync(task.plantName)
                const isInHarvestWindow =
                  masterData?.harvestWindow && typeof masterData.harvestWindow === 'object'
                    ? (() => {
                        const currentMonth = new Date().getMonth() + 1
                        const start = masterData.harvestWindow.startMonth
                        const end = masterData.harvestWindow.endMonth
                        return (currentMonth >= start && currentMonth <= end) ||
                          (start > end && (currentMonth >= start || currentMonth <= end))
                      })()
                    : false

                return (
                  <div key={task.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <CircleDot className="text-green-500 flex-shrink-0" size={24} />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {task.plantName}
                          {task.variety && <span className="text-gray-600 ml-2">- {task.variety}</span>}
                        </h3>

                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          {task.startDate && (
                            <span>Piantato: {format(new Date(task.startDate), 'dd MMM yyyy', { locale: it })}</span>
                          )}
                        </div>

                        {masterData?.harvestWindow && typeof masterData.harvestWindow === 'object' && (
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Droplets className="text-blue-600" size={18} />
                              <div className="text-sm font-medium text-gray-800">Finestra Raccolta</div>
                            </div>
                            <div className="text-sm text-blue-700">
                              {new Date(2024, masterData.harvestWindow.startMonth - 1, 1).toLocaleDateString('it-IT', {
                                month: 'long',
                              })}{' '}
                              -{' '}
                              {new Date(2024, masterData.harvestWindow.endMonth - 1, 1).toLocaleDateString('it-IT', {
                                month: 'long',
                              })}
                            </div>
                            {isInHarvestWindow && (
                              <div className="mt-2 p-2 bg-green-100 rounded border border-green-300">
                                <div className="text-xs font-semibold text-green-800">Periodo di raccolta attivo</div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Caricamento...</p>
      </div>
    )
  }

  return (
    <FeatureGate feature="OLIVE_GROVE">
      <div className="min-h-screen p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <CircleDot className="text-green-600" size={32} />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestione Oliveto</h1>
                <p className="text-gray-600">Operativita reale su olivi, potature, raccolte e storico alberi</p>
              </div>
            </div>

            {selectedGardenId && (
              <button
                onClick={() => setShowWizard(true)}
                className="inline-flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus size={18} />
                Nuovo Oliveto
              </button>
            )}
          </div>

          {contexts.length > 1 && (
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin size={16} className="inline mr-2" />
                Seleziona Giardino
              </label>
              <select
                value={selectedGardenId}
                onChange={(event) => {
                  setSelectedGardenId(event.target.value)
                  setViewMode('overview')
                }}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                {contexts.map((context) => (
                  <option key={context.garden.id} value={context.garden.id}>
                    {context.garden.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedGarden && (
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter size={16} className="inline mr-2" />
                Filtra per Zona/Filare/Porzione
              </label>
              <LocationSelector
                garden={selectedGarden}
                onLocationChange={(location) => setSelectedLocation(location)}
                placeholder="Tutti gli olivi"
              />
              {selectedLocation && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    Filtro attivo: <strong>{selectedLocation.fullLocationName}</strong>
                  </span>
                  <button onClick={() => setSelectedLocation(null)} className="text-xs text-blue-600 hover:text-blue-800">
                    Rimuovi filtro
                  </button>
                </div>
              )}
            </div>
          )}

          {selectedGarden?.oliveGroveConfig && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-md p-6 mb-6 border border-green-200">
              <div className="flex items-start gap-3">
                <Info className="text-green-600 flex-shrink-0 mt-1" size={24} />
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="text-lg font-semibold text-gray-900">Oliveto Configurato</h3>
                    <span className="px-3 py-1 bg-green-600 text-white rounded-full text-sm font-medium">
                      {selectedGarden.oliveGroveConfig.type === 'OIL'
                        ? 'Da Olio'
                        : selectedGarden.oliveGroveConfig.type === 'TABLE'
                          ? 'Da Mensa'
                          : 'Dual-Purpose'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    {selectedGarden.oliveGroveConfig.establishedDate && (
                      <div>
                        <span className="text-gray-600">Data Impianto:</span>{' '}
                        <span className="font-medium text-gray-900">
                          {format(new Date(selectedGarden.oliveGroveConfig.establishedDate), 'dd MMM yyyy', {
                            locale: it,
                          })}
                        </span>
                      </div>
                    )}
                    {selectedGarden.oliveGroveConfig.totalTrees && (
                      <div>
                        <span className="text-gray-600">Alberi Totali:</span>{' '}
                        <span className="font-medium text-gray-900">{selectedGarden.oliveGroveConfig.totalTrees}</span>
                      </div>
                    )}
                    {selectedGarden.oliveGroveConfig.varieties && selectedGarden.oliveGroveConfig.varieties.length > 0 && (
                      <div>
                        <span className="text-gray-600">Varieta:</span>{' '}
                        <span className="font-medium text-gray-900">
                          {selectedGarden.oliveGroveConfig.varieties.slice(0, 3).join(', ')}
                          {selectedGarden.oliveGroveConfig.varieties.length > 3 && '...'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {renderNavigation()}

        {!selectedGarden ? (
          renderOverview()
        ) : viewMode === 'trees' ? (
          selectedOrchard ? (
            <TreeManager orchardId={selectedOrchard.id} gardenId={selectedGarden.id} />
          ) : (
            renderOverview()
          )
        ) : viewMode === 'pruning' ? (
          selectedOrchard ? (
            <PruningManager orchardId={selectedOrchard.id} gardenId={selectedGarden.id} />
          ) : (
            renderOverview()
          )
        ) : viewMode === 'harvest' ? (
          selectedOrchard ? (
            <HarvestManager orchardId={selectedOrchard.id} gardenId={selectedGarden.id} />
          ) : (
            renderOverview()
          )
        ) : viewMode === 'individual-plants' ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Users className="text-green-600" size={20} />
                <div>
                  <h3 className="font-semibold text-green-900">Gestione Olivi Individuali</h3>
                  <p className="text-sm text-green-800">
                    Tracciamento dettagliato di ogni singolo olivo con foto, salute e operazioni.
                  </p>
                </div>
              </div>
            </div>
            <SmartPlantManager garden={selectedGarden} />
          </div>
        ) : (
          renderOverview()
        )}

        {showWizard && selectedGarden && (
          <OrchardWizard
            gardenId={selectedGarden.id}
            garden={selectedGarden}
            presetType="oliveGrove"
            onComplete={handleWizardComplete}
            onCancel={() => setShowWizard(false)}
          />
        )}
      </div>
    </FeatureGate>
  )
}

function SummaryCard({
  label,
  value,
  accent,
}: {
  label: string
  value: number
  accent: 'green' | 'blue' | 'orange' | 'purple'
}) {
  const accentClasses = {
    green: 'text-green-700 bg-green-100',
    blue: 'text-blue-700 bg-blue-100',
    orange: 'text-orange-700 bg-orange-100',
    purple: 'text-purple-700 bg-purple-100',
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${accentClasses[accent]}`}>
          <CircleDot size={20} />
        </div>
      </div>
    </div>
  )
}
