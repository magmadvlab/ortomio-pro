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
  const { storageProvider } = useStorage()

  // Estrai piante attive dai task
  const activePlants = useMemo(() => {
    return getActivePlants(tasks.filter(t => t.gardenId === garden.id))
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
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cerca piante..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {/* Status Filter */}
          <div className="flex gap-2 min-w-max">
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
            <div className="flex gap-2 min-w-max border-l border-gray-200 pl-2">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlants.map((plant) => (
            <PlantCard
              key={plant.task.id}
              plant={plant}
              onHarvest={(task) => setHarvestingTask(task)}
              onViewDetails={(task) => {
                // TODO: Implementare dettagli pianta
                console.log('View details for:', task.plantName)
              }}
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
              await storageProvider.createHarvestLog({
                ...harvestData,
                gardenId: garden.id,
                taskId: harvestingTask.id
              } as any)

              // Aggiorna task con harvestLogId
              onUpdateTask({
                ...harvestingTask,
                harvestLogId: 'completed' // TODO: usare ID reale dal log
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
    </div>
  )
}

