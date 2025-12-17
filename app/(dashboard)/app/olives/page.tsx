'use client'

import React, { useState, useEffect } from 'react'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { useTier } from '@/packages/core/hooks/useTier'
import { ProFeatureGate } from '@/components/shared/ProFeatureGate'
import { CircleDot, Plus, Calendar, Scissors, AlertCircle, Droplets, MapPin, Link as LinkIcon, Info } from 'lucide-react'
import { Garden, GardenTask } from '@/types'
import { getMasterSheetSync } from '@/services/plantMasterService'
import { OliveCrop } from '@/types/olive'
import { calculateOliveTasks, calculateOptimalHarvestDate } from '@/logic/oliveEngine'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import Link from 'next/link'

export default function OlivesPage() {
  const { storageProvider } = useStorage()
  const { isPro } = useTier()
  const [gardens, setGardens] = useState<Garden[]>([])
  const [tasks, setTasks] = useState<GardenTask[]>([])
  const [selectedGardenId, setSelectedGardenId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [showAddWizard, setShowAddWizard] = useState(false)

  useEffect(() => {
    loadData()
  }, [storageProvider, selectedGardenId])

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
        // Filtra solo task di olivi
        const oliveTasks = gardenTasks.filter(t => {
          const master = getMasterSheetSync(t.plantName)
          return master?.cropType === 'Olive'
        })
        setTasks(oliveTasks)
      }
    } catch (error) {
      console.error('Error loading olives data:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectedGarden = gardens.find(g => g.id === selectedGardenId)

  // Calcola prossime potature da lavorazioni meccaniche
  const [upcomingPrunings, setUpcomingPrunings] = useState<any[]>([])
  
  useEffect(() => {
    const loadPrunings = async () => {
      if (!selectedGardenId) return
      
      try {
        const mechanicalWorks = await storageProvider.getMechanicalWorks(selectedGardenId)
        const pruningWorks = mechanicalWorks
          .filter(w => w.work_type.includes('Pruning') || w.work_type === 'OliveShredding')
          .map(w => ({
            ...w,
            work_date: new Date(w.work_date)
          }))
          .filter(w => w.work_date >= new Date())
          .sort((a, b) => a.work_date.getTime() - b.work_date.getTime())
          .slice(0, 5)
        
        setUpcomingPrunings(pruningWorks)
      } catch (error) {
        console.error('Error loading prunings:', error)
      }
    }
    
    loadPrunings()
  }, [selectedGardenId, storageProvider])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Caricamento...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 max-w-7xl mx-auto">
      <ProFeatureGate
        feature="olives-management"
        title="Gestione Olivi"
        description="Gestisci olivi, potature, raccolta e produzione olio"
        requiredTier="PRO"
      >
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <CircleDot className="text-green-600" size={32} />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestione Olivi</h1>
                <p className="text-gray-600">Monitora e gestisci i tuoi olivi e produzione olio</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddWizard(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus size={20} />
              Aggiungi Olivo
            </button>
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

          {/* Info Oliveto Configurato */}
          {selectedGarden?.oliveGroveConfig && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-md p-6 mb-6 border border-green-200">
              <div className="flex items-start justify-between">
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
            </div>
          )}
        </div>

        {!selectedGarden ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <CircleDot className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 mb-2">Nessun giardino disponibile</p>
            <p className="text-sm text-gray-500">
              Crea un giardino dalla Dashboard per iniziare
            </p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <CircleDot className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nessun olivo registrato
            </h3>
            <p className="text-gray-600 mb-4">
              Inizia aggiungendo il tuo primo olivo
            </p>
            <button
              onClick={() => setShowAddWizard(true)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus size={20} className="inline mr-2" />
              Aggiungi Primo Olivo
            </button>
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
                        href={`/app/mechanical-work?filter=Pruning`}
                        className="text-green-600 hover:text-green-800 text-sm flex items-center gap-1"
                      >
                        Vedi dettagli
                        <LinkIcon size={14} />
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
                  I Tuoi Olivi ({tasks.length})
                </h2>
              </div>
              <div className="divide-y divide-gray-200">
                {tasks.map((task) => {
                  const masterData = getMasterSheetSync(task.plantName)
                  const oliveCrop = masterData as unknown as OliveCrop | undefined
                  
                  if (!oliveCrop || oliveCrop.cropType !== 'Olive') return null
                  
                  const oliveTasks = calculateOliveTasks(oliveCrop)
                  const optimalHarvestDate = calculateOptimalHarvestDate(oliveCrop)
                  const isInHarvestWindow = (() => {
                    const currentMonth = new Date().getMonth() + 1
                    const start = oliveCrop.harvestWindow.startMonth
                    const end = oliveCrop.harvestWindow.endMonth
                    return (currentMonth >= start && currentMonth <= end) ||
                           (start > end && (currentMonth >= start || currentMonth <= end))
                  })()
                  
                  return (
                    <div key={task.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CircleDot className="text-green-500" size={24} />
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {task.plantName}
                                {task.variety && <span className="text-gray-600 ml-2">- {task.variety}</span>}
                              </h3>
                              <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                <span>Tipo: {oliveCrop.varietyType === 'Oil' ? 'Da Olio' : 'Da Mensa'}</span>
                                {oliveCrop.treeAge && <span>Età: {oliveCrop.treeAge} anni</span>}
                                <span>Resa: {oliveCrop.oilYieldExpected} kg olio/100kg olive</span>
                              </div>
                            </div>
                          </div>

                          {/* Prossimi Task */}
                          {oliveTasks.length > 0 && (
                            <div className="mt-4">
                              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <Calendar className="text-green-500" size={16} />
                                Prossimi Interventi
                              </h4>
                              <div className="space-y-2">
                                {oliveTasks.slice(0, 3).map((advice, idx) => (
                                  <div
                                    key={idx}
                                    className={`p-2 rounded text-sm ${
                                      advice.priority === 'High'
                                        ? 'bg-green-50 border border-green-200'
                                        : 'bg-gray-50 border border-gray-200'
                                    }`}
                                  >
                                    <div className="font-medium text-gray-800">{advice.message}</div>
                                    <div className="text-xs text-gray-600">
                                      {format(new Date(advice.dueDate), 'dd MMMM yyyy', { locale: it })}
                                    </div>
                                    {advice.instructions.length > 0 && (
                                      <div className="text-xs text-gray-500 mt-1">
                                        {advice.instructions[0]}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Finestra Raccolta */}
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Droplets className="text-blue-600" size={18} />
                              <div className="text-sm font-medium text-gray-800">
                                Finestra Raccolta
                              </div>
                            </div>
                            <div className="text-sm text-blue-700">
                              {new Date(2024, oliveCrop.harvestWindow.startMonth - 1, 1).toLocaleDateString('it-IT', { month: 'long' })} - {new Date(2024, oliveCrop.harvestWindow.endMonth - 1, 1).toLocaleDateString('it-IT', { month: 'long' })}
                            </div>
                            {isInHarvestWindow && (
                              <div className="mt-2 p-2 bg-green-100 rounded border border-green-300">
                                <div className="text-xs font-semibold text-green-800 mb-1">
                                  ✓ Periodo di raccolta attivo
                                </div>
                                <div className="text-xs text-green-700">
                                  Data ottimale: {format(optimalHarvestDate, 'dd MMMM yyyy', { locale: it })}
                                </div>
                              </div>
                            )}
                            <div className="text-xs text-blue-600 mt-2">
                              Resa attesa: {oliveCrop.oilYieldExpected} kg olio per 100kg olive
                            </div>
                          </div>

                          {/* Metodo Raccolta */}
                          <div className="mt-3 text-sm text-gray-600">
                            Metodo raccolta: <span className="font-medium">{oliveCrop.harvestMethod === 'Manual' ? 'Manuale' : oliveCrop.harvestMethod === 'Mechanical' ? 'Meccanico' : 'Scuotitura'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* TODO: Wizard aggiunta olivo - da implementare */}
        {showAddWizard && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">Aggiungi Olivo</h2>
              <p className="text-gray-600 mb-4">
                Il wizard per aggiungere olivi sarà disponibile a breve.
              </p>
              <button
                onClick={() => setShowAddWizard(false)}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Chiudi
              </button>
            </div>
          </div>
        )}
      </ProFeatureGate>
    </div>
  )
}

