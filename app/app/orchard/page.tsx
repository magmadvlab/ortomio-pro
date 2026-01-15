'use client'

import React, { useState, useEffect } from 'react'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { FeatureGate } from '@/components/shared/FeatureGate'
import LocationSelector from '@/components/shared/LocationSelector'
import { TreePine, Plus, Calendar, Scissors, AlertCircle, Info, MapPin, Filter } from 'lucide-react'
import { Garden, GardenTask } from '@/types'
import { getMasterSheetSync } from '@/services/plantMasterService'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import Link from 'next/link'

export default function OrchardPage() {
  const { storageProvider } = useStorage()
  const [gardens, setGardens] = useState<Garden[]>([])
  const [tasks, setTasks] = useState<GardenTask[]>([])
  const [filteredTasks, setFilteredTasks] = useState<GardenTask[]>([])
  const [selectedGardenId, setSelectedGardenId] = useState<string>('')
  const [selectedLocation, setSelectedLocation] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [upcomingPrunings, setUpcomingPrunings] = useState<any[]>([])

  useEffect(() => {
    loadData()
  }, [storageProvider, selectedGardenId])

  useEffect(() => {
    // Filtra alberi per location selezionata
    if (!selectedLocation) {
      setFilteredTasks(tasks)
    } else {
      const filtered = tasks.filter(task => {
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
        const fruitTreeTasks = gardenTasks.filter(t => {
          const master = getMasterSheetSync(t.plantName)
          return master?.cropType === 'FruitTree'
        })
        setTasks(fruitTreeTasks)
        
        // Carica potature
        const mechanicalWorks = await storageProvider.getMechanicalWorks(selectedGardenId)
        const pruningWorks = mechanicalWorks
          .filter(w => w.work_type.includes('Pruning'))
          .map(w => ({ ...w, work_date: new Date(w.work_date) }))
          .filter(w => w.work_date >= new Date())
          .sort((a, b) => a.work_date.getTime() - b.work_date.getTime())
          .slice(0, 5)
        setUpcomingPrunings(pruningWorks)
      }
    } catch (error) {
      console.error('Error loading orchard data:', error)
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
    <FeatureGate feature="ORCHARD">
      <div className="min-h-screen p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <TreePine className="text-green-600" size={32} />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestione Frutteto</h1>
                <p className="text-gray-600">Monitora e gestisci i tuoi alberi da frutto</p>
              </div>
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
                placeholder="Tutti gli alberi"
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

          {/* Info Frutteto */}
          {selectedGarden?.orchardConfig && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-md p-6 mb-6 border border-green-200">
              <div className="flex items-start gap-3">
                <Info className="text-green-600 flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Frutteto Configurato</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    {selectedGarden.orchardConfig.establishedDate && (
                      <div>
                        <span className="text-gray-600">Data Impianto:</span>{' '}
                        <span className="font-medium text-gray-900">
                          {format(new Date(selectedGarden.orchardConfig.establishedDate), 'dd MMM yyyy', { locale: it })}
                        </span>
                      </div>
                    )}
                    {selectedGarden.orchardConfig.totalTrees && (
                      <div>
                        <span className="text-gray-600">Alberi Totali:</span>{' '}
                        <span className="font-medium text-gray-900">{selectedGarden.orchardConfig.totalTrees}</span>
                      </div>
                    )}
                    {selectedGarden.orchardConfig.varieties && selectedGarden.orchardConfig.varieties.length > 0 && (
                      <div>
                        <span className="text-gray-600">Varietà:</span>{' '}
                        <span className="font-medium text-gray-900">
                          {selectedGarden.orchardConfig.varieties.slice(0, 3).join(', ')}
                          {selectedGarden.orchardConfig.varieties.length > 3 && '...'}
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
            <TreePine className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 mb-2">Nessun giardino disponibile</p>
            <p className="text-sm text-gray-500">Crea un giardino dalla Dashboard per iniziare</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <TreePine className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nessun albero da frutto registrato
            </h3>
            <p className="text-gray-600 mb-4">
              Inizia aggiungendo il tuo primo albero da frutto dal Planner
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
                          {pruning.work_metadata?.cropName || 'Potatura'}
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

            {/* Lista Alberi */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedLocation 
                    ? `Alberi in ${selectedLocation.fullLocationName} (${filteredTasks.length})`
                    : `I Tuoi Alberi (${tasks.length})`
                  }
                </h2>
              </div>
              <div className="divide-y divide-gray-200">
                {filteredTasks.map((task) => {
                  const masterData = getMasterSheetSync(task.plantName)
                  
                  return (
                    <div key={task.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <TreePine className="text-green-500 flex-shrink-0" size={24} />
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {task.plantName}
                            {task.variety && <span className="text-gray-600 ml-2">- {task.variety}</span>}
                          </h3>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                            {task.fruitTreeData?.treeAge && (
                              <span>Età: {task.fruitTreeData.treeAge} anni</span>
                            )}
                            {task.startDate && (
                              <span>Piantato: {format(new Date(task.startDate), 'dd MMM yyyy', { locale: it })}</span>
                            )}
                          </div>
                          
                          {/* Periodo Raccolta */}
                          {masterData?.harvestWindow && typeof masterData.harvestWindow === 'object' && (
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="text-sm font-medium text-gray-800 mb-1">
                                Periodo Raccolta
                              </div>
                              <div className="text-sm text-blue-700">
                                {new Date(2024, masterData.harvestWindow.startMonth - 1, 1).toLocaleDateString('it-IT', { month: 'long' })} - {new Date(2024, masterData.harvestWindow.endMonth - 1, 1).toLocaleDateString('it-IT', { month: 'long' })}
                              </div>
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
      </div>
    </FeatureGate>
  )
}
