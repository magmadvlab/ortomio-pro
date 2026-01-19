'use client'

import React, { useState, useMemo } from 'react'
import { Garden, GardenTask } from '@/types'
import { Sprout, Filter, Search } from 'lucide-react'
import { getActivePlants } from '@/services/taskCalculationService'
import { PlantCard } from './PlantCard'
import { HarvestPromptModal } from '@/components/shared/HarvestPromptModal'
import { useStorage } from '@/packages/core/hooks/useStorage'

interface PlantsViewProps {
  garden: Garden
  tasks: GardenTask[]
  onUpdateTask: (task: GardenTask) => void
}

type PlantStatus = 'all' | 'growing' | 'ready' | 'new'
type ZoneFilter = string | 'all'

export function PlantsView({ garden, tasks, onUpdateTask }: PlantsViewProps) {
  const [statusFilter, setStatusFilter] = useState<PlantStatus>('all')
  const [zoneFilter, setZoneFilter] = useState<ZoneFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [harvestingTask, setHarvestingTask] = useState<GardenTask | null>(null)
  const [detailsTask, setDetailsTask] = useState<GardenTask | null>(null)
  const { storageProvider } = useStorage()

  // Estrai piante attive dai task
  const activePlants = useMemo(() => {
    if (!tasks || tasks.length === 0) return []
    return getActivePlants((tasks || []).filter(t => t.gardenId === garden.id))
  }, [tasks, garden.id])

  // Raggruppa per pianta e calcola stato
  const plantsData = useMemo(() => {
    const plantsMap = new Map<string, {
      task: GardenTask
      status: 'growing' | 'ready' | 'new'
      progress: number
      zone: string
      daysActive: number
    }>()

    activePlants.forEach(task => {
      const key = task.plantName
      if (!plantsMap.has(key)) {
        // Calcola giorni attivi
        const plantingDate = new Date(task.date)
        const daysActive = Math.floor((new Date().getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24))
        
        // Determina stato
        let status: 'growing' | 'ready' | 'new' = 'growing'
        if (daysActive < 7) status = 'new'
        else if (task.lifecycleState === 'Production' || task.stage === 'Fruiting') status = 'ready'
        
        // Calcola progress (semplificato: 0-100%)
        let progress = 0
        if (task.lifecycleState === 'Production') progress = 100
        else if (task.lifecycleState === 'Transplanting') progress = 75
        else if (task.lifecycleState === 'Nursing') progress = 50
        else if (task.lifecycleState === 'Germination') progress = 25
        else progress = 10

        const zone = task.locationType || 'Zona A'

        plantsMap.set(key, {
          task,
          status,
          progress,
          zone,
          daysActive
        })
      }
    })

    return Array.from(plantsMap.values())
  }, [activePlants])

  // Filtra piante
  const filteredPlants = useMemo(() => {
    return plantsData.filter(plant => {
      // Filtro status
      if (statusFilter !== 'all' && plant.status !== statusFilter) return false
      
      // Filtro zona
      if (zoneFilter !== 'all' && plant.zone !== zoneFilter) return false
      
      // Filtro ricerca
      if (searchQuery && !plant.task.plantName.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      
      return true
    })
  }, [plantsData, statusFilter, zoneFilter, searchQuery])

  // Estrai zone uniche
  const zones = useMemo(() => {
    const uniqueZones = new Set(plantsData.map(p => p.zone))
    return Array.from(uniqueZones).sort()
  }, [plantsData])

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search size={18} className="absolute left-3 top-3/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cerca piante..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          {/* Status Filter */}
          <div className="flex gap-3 min-w-max">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                statusFilter === 'all'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tutte
            </button>
            <button
              onClick={() => setStatusFilter('new')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                statusFilter === 'new'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🌿 Nuove
            </button>
            <button
              onClick={() => setStatusFilter('growing')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                statusFilter === 'growing'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🌱 In crescita
            </button>
            <button
              onClick={() => setStatusFilter('ready')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                statusFilter === 'ready'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🥗 Pronte
            </button>
          </div>

          {/* Zone Filter */}
          {zones.length > 1 && (
            <div className="flex gap-3 min-w-max border-l border-gray-200 pl-2">
              <button
                onClick={() => setZoneFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  zoneFilter === 'all'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Tutte le zone
              </button>
              {zones.map(zone => (
                <button
                  key={zone}
                  onClick={() => setZoneFilter(zone)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    zoneFilter === zone
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {zone}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Plants Grid */}
      {filteredPlants.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Sprout size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">Nessuna pianta trovata</p>
          <p className="text-sm text-gray-400 mt-1">
            {searchQuery || statusFilter !== 'all' || zoneFilter !== 'all'
              ? 'Prova a modificare i filtri'
              : 'Aggiungi una semina per iniziare'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlants.map((plant) => (
            <PlantCard
              key={plant.task.id}
              plant={plant}
              onHarvest={(task) => setHarvestingTask(task)}
              onViewDetails={(task) => setDetailsTask(task)}
            />
          ))}
        </div>
      )}

      {/* Harvest Modal */}
      {harvestingTask && (
        <HarvestPromptModal
          task={harvestingTask}
          onHarvest={async (harvestData) => {
            try {
              // Crea harvest log
              const harvestLog = await storageProvider.createHarvestLog({
                ...harvestData,
                gardenId: garden.id,
                taskId: harvestingTask.id
              } as any)

              // Aggiorna task con harvestLogId reale
              onUpdateTask({
                ...harvestingTask,
                harvestLogId: harvestLog?.id || 'completed'
              })

              // Chiudi modal
              setHarvestingTask(null)
            } catch (error) {
              console.error('Errore registrazione raccolto:', error)
            }
          }}
          onSkip={() => setHarvestingTask(null)}
        />
      )}

      {/* Plant Details Modal */}
      {detailsTask && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <Sprout className="text-green-600" />
                    {detailsTask.plantName}
                  </h2>
                  {detailsTask.variety && (
                    <p className="text-sm text-gray-600 mt-1">Varietà: {detailsTask.variety}</p>
                  )}
                </div>
                <button
                  onClick={() => setDetailsTask(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="space-y-4">
                {/* Basic Info */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-3">Informazioni Base</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Tipo attività:</span>
                      <p className="font-medium text-gray-900">{detailsTask.taskType}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Data semina:</span>
                      <p className="font-medium text-gray-900">
                        {new Date(detailsTask.date).toLocaleDateString('it-IT')}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Posizione:</span>
                      <p className="font-medium text-gray-900">{detailsTask.locationType || 'Non specificato'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Quantità:</span>
                      <p className="font-medium text-gray-900">{detailsTask.quantity || 1}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Giorni dalla semina:</span>
                      <p className="font-medium text-gray-900">
                        {Math.floor((new Date().getTime() - new Date(detailsTask.date).getTime()) / (1000 * 60 * 60 * 24))} giorni
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Stato:</span>
                      <p className="font-medium text-gray-900">
                        {detailsTask.completed ? '✅ Completato' : 
                         detailsTask.stage === 'Harvested' ? '🛒 Raccolto' : '🌱 In crescita'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Growth Status */}
                {detailsTask.lifecycleState && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-3">Stato Crescita</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Fase del ciclo:</span>
                        <p className="font-medium text-gray-900">{detailsTask.lifecycleState}</p>
                      </div>
                      {detailsTask.stage && (
                        <div>
                          <span className="text-gray-600">Stadio:</span>
                          <p className="font-medium text-gray-900">{detailsTask.stage}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {detailsTask.notes && (
                  <div className="bg-yellow-50 border border-yellow-full max-w-sm rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-full max-w-sm mb-2">Note</h3>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{detailsTask.notes}</p>
                  </div>
                )}

                {/* Harvest Information */}
                {detailsTask.stage === 'Harvested' && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h3 className="font-semibold text-orange-900 mb-3">Informazioni Raccolto</h3>
                    <div className="text-sm">
                      <span className="text-gray-600">Stato:</span>
                      <p className="font-medium text-gray-900">🛒 Raccolto completato</p>
                      {detailsTask.notes && (
                        <div className="mt-2">
                          <span className="text-gray-600">Note:</span>
                          <p className="text-sm text-gray-700 mt-1">{detailsTask.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Related Tasks */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Task Correlati</h3>
                  <div className="space-y-2">
                    {(tasks || [])
                      .filter(t =>
                        t.plantName === detailsTask.plantName &&
                        t.id !== detailsTask.id &&
                        t.gardenId === garden.id
                      )
                      .map(relatedTask => (
                        <div
                          key={relatedTask.id}
                          className="flex items-center justify-between p-3 bg-white rounded border border-gray-200"
                        >
                          <div className="flex items-center gap-3">
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              relatedTask.completed
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {relatedTask.taskType}
                            </span>
                            <span className="text-sm text-gray-600">
                              {new Date(relatedTask.date).toLocaleDateString('it-IT')}
                            </span>
                          </div>
                          {relatedTask.completed && (
                            <span className="text-green-600">✓</span>
                          )}
                        </div>
                      ))
                    }
                    {(tasks || []).filter(t =>
                      t.plantName === detailsTask.plantName &&
                      t.id !== detailsTask.id &&
                      t.gardenId === garden.id
                    ).length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-2">
                        Nessun task correlato
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    setDetailsTask(null)
                    setHarvestingTask(detailsTask)
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Registra Raccolto
                </button>
                <button
                  onClick={() => setDetailsTask(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Chiudi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

