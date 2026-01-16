'use client'

import React, { useState, useEffect } from 'react'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { useTier } from '@/packages/core/hooks/useTier'
import { ProFeatureGate } from '@/components/shared/ProFeatureGate'
import { Grape, Plus, Calendar, Scissors, AlertCircle, Wine, TrendingUp, MapPin, Link as LinkIcon, Info } from 'lucide-react'
import { Garden, GardenTask } from '@/types'
import { getMasterSheetSync } from '@/services/plantMasterService'
import { VineCrop } from '@/types/vine'
import { calculateVineTasks, calculateBrixProgress, isOptimalHarvestTime, estimateDaysToHarvest } from '@/logic/vineEngine'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import Link from 'next/link'
import { CreateOrchardWizard } from '@/components/crops/CreateOrchardWizard'

export default function VineyardPage() {
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
        // Filtra solo task di viti
        const vineTasks = gardenTasks.filter(t => {
          const master = getMasterSheetSync(t.plantName)
          return master?.cropType === 'Vine'
        })
        setTasks(vineTasks)
      }
    } catch (error) {
      console.error('Error loading vineyard data:', error)
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
          .filter(w => w.work_type.includes('Pruning'))
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
        feature="vineyard-management"
        title="Gestione Vite"
        description="Gestisci viti, potature, monitoraggio Brix e produzione vino"
        requiredTier="PRO"
      >
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Grape className="text-purple-600" size={32} />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestione Vite</h1>
                <p className="text-gray-600">Monitora e gestisci le tue viti e produzione vino</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddWizard(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus size={20} />
              Aggiungi Vite
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
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                {gardens.map(garden => (
                  <option key={garden.id} value={garden.id}>
                    {garden.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Info Vigneto Configurato */}
          {selectedGarden?.vineyardConfig && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg shadow-md p-6 mb-6 border border-purple-200">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Info className="text-purple-600 flex-shrink-0 mt-1" size={24} />
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">Vigneto Configurato</h3>
                      <span className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm font-medium">
                        🍷 {selectedGarden.vineyardConfig.type === 'WINE' ? 'Da Vino' : 'Da Tavola'}
                      </span>
                      {selectedGarden.vineyardConfig.trainingSystem && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                          {selectedGarden.vineyardConfig.trainingSystem}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      {selectedGarden.vineyardConfig.establishedDate && (
                        <div>
                          <span className="text-gray-600">Data Impianto:</span>{' '}
                          <span className="font-medium text-gray-900">
                            {format(new Date(selectedGarden.vineyardConfig.establishedDate), 'dd MMM yyyy', { locale: it })}
                          </span>
                        </div>
                      )}
                      {selectedGarden.vineyardConfig.totalVines && (
                        <div>
                          <span className="text-gray-600">Viti Totali:</span>{' '}
                          <span className="font-medium text-gray-900">{selectedGarden.vineyardConfig.totalVines}</span>
                        </div>
                      )}
                      {selectedGarden.vineyardConfig.varieties && selectedGarden.vineyardConfig.varieties.length > 0 && (
                        <div>
                          <span className="text-gray-600">Varietà:</span>{' '}
                          <span className="font-medium text-gray-900">
                            {selectedGarden.vineyardConfig.varieties.slice(0, 3).join(', ')}
                            {selectedGarden.vineyardConfig.varieties.length > 3 && '...'}
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
            <Grape className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 mb-2">Nessun giardino disponibile</p>
            <p className="text-sm text-gray-500">
              Crea un giardino dalla Dashboard per iniziare
            </p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Grape className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nessuna vite registrata
            </h3>
            <p className="text-gray-600 mb-4">
              Inizia aggiungendo la tua prima vite
            </p>
            <button
              onClick={() => setShowAddWizard(true)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus size={20} className="inline mr-2" />
              Aggiungi Prima Vite
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Prossime Potature */}
            {upcomingPrunings.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Scissors className="text-purple-600" size={24} />
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
                          {pruning.work_metadata?.cropName || 'Potatura Vite'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {format(pruning.work_date, 'dd MMMM yyyy', { locale: it })}
                        </div>
                      </div>
                      <Link
                        href={`/app/mechanical-work?filter=Pruning`}
                        className="text-purple-600 hover:text-purple-800 text-sm flex items-center gap-1"
                      >
                        Vedi dettagli
                        <LinkIcon size={14} />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lista Viti */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  Le Tue Viti ({tasks.length})
                </h2>
              </div>
              <div className="divide-y divide-gray-200">
                {tasks.map((task) => {
                  const masterData = getMasterSheetSync(task.plantName)
                  const vineCrop = masterData as unknown as VineCrop | undefined
                  
                  if (!vineCrop || vineCrop.cropType !== 'Vine') return null
                  
                  const vineTasks = calculateVineTasks(vineCrop)
                  const currentBrix = calculateBrixProgress(vineCrop)
                  const isReady = isOptimalHarvestTime(vineCrop, currentBrix)
                  const daysToHarvest = estimateDaysToHarvest(vineCrop, currentBrix)
                  const isInHarvestWindow = (() => {
                    const currentMonth = new Date().getMonth() + 1
                    const start = vineCrop.harvestWindow.startMonth
                    const end = vineCrop.harvestWindow.endMonth
                    return (currentMonth >= start && currentMonth <= end) ||
                           (start > end && (currentMonth >= start || currentMonth <= end))
                  })()
                  
                  return (
                    <div key={task.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Grape className="text-purple-500" size={24} />
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {task.plantName}
                                {task.variety && <span className="text-gray-600 ml-2">- {task.variety}</span>}
                              </h3>
                              <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                <span>Sistema: {vineCrop.trainingSystem}</span>
                                {vineCrop.rootstock && <span>Portinnesto: {vineCrop.rootstock}</span>}
                                <span>Target Brix: {vineCrop.brixTarget}°</span>
                              </div>
                            </div>
                          </div>

                          {/* Monitoraggio Brix */}
                          {isInHarvestWindow && (
                            <div className="mt-4 p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <TrendingUp className="text-purple-600" size={18} />
                                  <span className="font-semibold text-gray-800">Monitoraggio Brix</span>
                                </div>
                                {isReady && (
                                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                                    Pronto per vendemmia
                                  </span>
                                )}
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <div className="text-sm text-gray-600">Brix Attuale</div>
                                  <div className="text-2xl font-bold text-purple-600">
                                    {currentBrix.toFixed(1)}°
                                  </div>
                                </div>
                                <div>
                                  <div className="text-sm text-gray-600">Target</div>
                                  <div className="text-xl font-semibold text-gray-800">
                                    {vineCrop.brixTarget}°
                                  </div>
                                </div>
                              </div>
                              {daysToHarvest !== null && daysToHarvest > 0 && (
                                <div className="mt-2 text-sm text-gray-600">
                                  Stima giorni alla vendemmia: <span className="font-medium">{daysToHarvest}</span>
                                </div>
                              )}
                              {isReady && (
                                <div className="mt-2 p-2 bg-green-100 rounded border border-green-300">
                                  <div className="text-xs font-semibold text-green-800">
                                    ✓ Brix target raggiunto! Procedi con la vendemmia
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Prossimi Task */}
                          {vineTasks.length > 0 && (
                            <div className="mt-4">
                              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <Calendar className="text-purple-500" size={16} />
                                Prossimi Interventi
                              </h4>
                              <div className="space-y-2">
                                {vineTasks.slice(0, 3).map((advice, idx) => (
                                  <div
                                    key={idx}
                                    className={`p-2 rounded text-sm ${
                                      advice.priority === 'High'
                                        ? 'bg-purple-50 border border-purple-200'
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

                          {/* Finestra Vendemmia */}
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Wine className="text-blue-600" size={18} />
                              <div className="text-sm font-medium text-gray-800">
                                Finestra Vendemmia
                              </div>
                            </div>
                            <div className="text-sm text-blue-700">
                              {new Date(2024, vineCrop.harvestWindow.startMonth - 1, 1).toLocaleDateString('it-IT', { month: 'long' })} - {new Date(2024, vineCrop.harvestWindow.endMonth - 1, 1).toLocaleDateString('it-IT', { month: 'long' })}
                            </div>
                            {isInHarvestWindow && !isReady && (
                              <div className="mt-2 text-xs text-blue-600">
                                Monitora Brix quotidianamente fino al raggiungimento del target
                              </div>
                            )}
                          </div>

                          {/* Metodo Raccolta */}
                          <div className="mt-3 text-sm text-gray-600">
                            Metodo raccolta: <span className="font-medium">{vineCrop.harvestMethod === 'Manual' ? 'Manuale' : 'Meccanico'}</span>
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

        {/* Wizard Aggiunta Vite */}
        {showAddWizard && selectedGarden && (
          <CreateOrchardWizard
            garden={selectedGarden}
            orchardType="vineyard"
            onComplete={async (config) => {
              setShowAddWizard(false)
              await loadData() // Ricarica dati per mostrare nuova vite
            }}
            onCancel={() => setShowAddWizard(false)}
          />
        )}
      </ProFeatureGate>
    </div>
  )
}

