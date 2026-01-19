'use client'

import React, { useState, useEffect } from 'react'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { FeatureGate } from '@/components/shared/FeatureGate'
import LocationSelector from '@/components/shared/LocationSelector'
import SmartPlantManager from '@/components/plants/SmartPlantManager'
import { CircleDot, Plus, Calendar, Scissors, Droplets, Info, MapPin, Filter, Users } from 'lucide-react'
import { Garden, GardenTask } from '@/types'
import { getMasterSheetSync } from '@/services/plantMasterService'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import Link from 'next/link'

export default function OlivesPage() {
  const { storageProvider } = useStorage()
  const [gardens, setGardens] = useState<Garden[]>([])
  const [tasks, setTasks] = useState<GardenTask[]>([])
  const [filteredTasks, setFilteredTasks] = useState<GardenTask[]>([])
  const [selectedGardenId, setSelectedGardenId] = useState<string>('')
  const [selectedLocation, setSelectedLocation] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [upcomingPrunings, setUpcomingPrunings] = useState<any[]>([])
  const [viewMode, setViewMode] = useState<'overview' | 'individual-plants'>('overview')

  useEffect(() => {
    loadData()
  }, [storageProvider, selectedGardenId])

  useEffect(() => {
    if (!selectedLocation) {
      setFilteredTasks(tasks || [])
    } else {
      const filtered = (tasks || []).filter(task => {
        const taskAny = task as any // Temporary: location fields may not be in type yet
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
    }
  }, [tasks, selectedLocation])

  const loadData = async () => {
    try {
      setLoading(true)
      const gardensList = await storageProvider.getGardens()
      setGardens(gardensList)
      
      if (gardensList.length > 0 && !selectedGardenId) {
        setSelectedGardenId(gardensList[0].id)
      }
      
      if (selectedGardenId) {
        const gardenTasks = await storageProvider.getTasks(selectedGardenId)
        const oliveTasks = (gardenTasks || []).filter(t => {
          const master = getMasterSheetSync(t.plantName)
          return master?.cropType === 'Olive'
        })
        setTasks(oliveTasks)
        
        // Carica potature
        const mechanicalWorks = await storageProvider.getMechanicalWorks(selectedGardenId)
        const pruningWorks = mechanicalWorks
          .filter(w => w.work_type.includes('Pruning') || w.work_type === 'OliveShredding')
          .map(w => ({ ...w, work_date: new Date(w.work_date) }))
          .filter(w => w.work_date >= new Date())
          .sort((a, b) => a.work_date.getTime() - b.work_date.getTime())
          .slice(0, 5)
        setUpcomingPrunings(pruningWorks)
      }
    } catch (error) {
      console.error('Error loading olives data:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectedGarden = gardens.find(g => g.id === selectedGardenId)

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
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <CircleDot className="text-green-600" size={32} />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Gestione Oliveto</h1>
                  <p className="text-gray-600">Monitora e gestisci i tuoi olivi e produzione olio</p>
                </div>
              </div>
              
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('overview')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'overview'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <CircleDot size={16} className="inline mr-2" />
                  Panoramica
                </button>
                <button
                  onClick={() => setViewMode('individual-plants')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'individual-plants'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Users size={16} className="inline mr-2" />
                  Olivi Individuali
                </button>
              </div>
            </div>

          {/* Selezione Giardino */}
          {gardens.length > 1 && (
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin size={16} className="inline mr-2" />
                Seleziona Giardino
              </label>
              <select
                value={selectedGardenId}
                onChange={(e) => setSelectedGardenId(e.target.value)}
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

          {/* Location Selector */}
          {selectedGarden && (
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter size={16} className="inline mr-2" />
                Filtra per Zona/Filare/Porzione
              </label>
              <LocationSelector
                garden={selectedGarden}
                onLocationChange={(location) => {
                  setSelectedLocation(location)
                }}
                placeholder="Tutti gli olivi"
              />
              {selectedLocation && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    Filtro attivo: <strong>{selectedLocation.fullLocationName}</strong>
                  </span>
                  <button
                    onClick={() => setSelectedLocation(null)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Rimuovi filtro
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Info Oliveto */}
          {selectedGarden?.oliveGroveConfig && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-md p-6 mb-6 border border-green-200">
              <div className="flex items-start gap-3">
                <Info className="text-green-600 flex-shrink-0 mt-1" size={24} />
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">Oliveto Configurato</h3>
                    <span className="px-3 py-1 bg-green-600 text-white rounded-full text-sm font-medium">
                      🫒 {selectedGarden.oliveGroveConfig.type === 'OIL' ? 'Da Olio' : selectedGarden.oliveGroveConfig.type === 'TABLE' ? 'Da Mensa' : 'Dual-Purpose'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    {selectedGarden.oliveGroveConfig.establishedDate && (
                      <div>
                        <span className="text-gray-600">Data Impianto:</span>{' '}
                        <span className="font-medium text-gray-900">
                          {format(new Date(selectedGarden.oliveGroveConfig.establishedDate), 'dd MMM yyyy', { locale: it })}
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
                        <span className="text-gray-600">Varietà:</span>{' '}
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

        {!selectedGarden ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <CircleDot className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 mb-2">Nessun giardino disponibile</p>
            <p className="text-sm text-gray-500">Crea un giardino dalla Dashboard per iniziare</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <CircleDot className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nessun olivo registrato
            </h3>
            <p className="text-gray-600 mb-4">
              Inizia aggiungendo il tuo primo olivo dal Planner
            </p>
            <Link
              href="/app/planner"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus size={20} />
              Vai al Planner
            </Link>
          </div>
        ) : (
          <>
            {viewMode === 'individual-plants' ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Users className="text-green-600" size={20} />
                    <div>
                      <h3 className="font-semibold text-green-900">Gestione Olivi Individuali</h3>
                      <p className="text-sm text-green-800">
                        Tracciamento dettagliato di ogni singolo olivo con foto, salute e operazioni
                      </p>
                    </div>
                  </div>
                </div>
                <SmartPlantManager garden={selectedGarden} />
              </div>
            ) : (
              <div className="space-y-6">
            {/* Prossime Potature */}
            {upcomingPrunings.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Scissors className="text-green-600" size={24} />
                  Prossime Potature
                </h2>
                <div className="space-y-2">
                  {upcomingPrunings.map((pruning, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium text-gray-800">
                          {pruning.work_metadata?.cropName || 'Potatura Olivo'}
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

            {/* Lista Olivi */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedLocation 
                    ? `Olivi in ${selectedLocation.fullLocationName} (${filteredTasks.length})`
                    : `I Tuoi Olivi (${tasks.length})`
                  }
                </h2>
              </div>
              <div className="divide-y divide-gray-200">
                {filteredTasks.map((task) => {
                  const masterData = getMasterSheetSync(task.plantName)
                  const isInHarvestWindow = masterData?.harvestWindow && typeof masterData.harvestWindow === 'object' ? (() => {
                    const currentMonth = new Date().getMonth() + 1
                    const start = masterData.harvestWindow.startMonth
                    const end = masterData.harvestWindow.endMonth
                    return (currentMonth >= start && currentMonth <= end) ||
                           (start > end && (currentMonth >= start || currentMonth <= end))
                  })() : false
                  
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
                          
                          {/* Finestra Raccolta */}
                          {masterData?.harvestWindow && typeof masterData.harvestWindow === 'object' && (
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="flex items-center gap-2 mb-2">
                                <Droplets className="text-blue-600" size={18} />
                                <div className="text-sm font-medium text-gray-800">
                                  Finestra Raccolta
                                </div>
                              </div>
                              <div className="text-sm text-blue-700">
                                {new Date(2024, masterData.harvestWindow.startMonth - 1, 1).toLocaleDateString('it-IT', { month: 'long' })} - {new Date(2024, masterData.harvestWindow.endMonth - 1, 1).toLocaleDateString('it-IT', { month: 'long' })}
                              </div>
                              {isInHarvestWindow && (
                                <div className="mt-2 p-2 bg-green-100 rounded border border-green-300">
                                  <div className="text-xs font-semibold text-green-800">
                                    ✓ Periodo di raccolta attivo
                                  </div>
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
            </div>
              </div>
            )}
          </>
        )}
      </div>
    </FeatureGate>
  )
}
