'use client'

import React, { useState, useEffect } from 'react'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { useTier } from '@/packages/core/hooks/useTier'
import { ProFeatureGate } from '@/components/shared/ProFeatureGate'
import { TreePine, Plus, Calendar, Scissors, AlertCircle, CheckCircle, MapPin, Link as LinkIcon, Info } from 'lucide-react'
import { Garden, GardenTask } from '@/types'
import { getMasterSheetSync } from '@/services/plantMasterService'
import { FruitTreeCrop } from '@/types/fruitTree'
import { calculateFruitTreeTasks, isChillRequirementMet } from '@/logic/fruitTreeEngine'
import { calculateTreePruningTasks } from '@/logic/treePruningEngine'
import { getCategoryInfo } from '@/types/orchardTypes'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import Link from 'next/link'
import { CreateOrchardWizard } from '@/components/crops/CreateOrchardWizard'

export default function OrchardPage() {
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
        // Filtra solo task di frutteti
        const fruitTreeTasks = gardenTasks.filter(t => {
          const master = getMasterSheetSync(t.plantName)
          return master?.cropType === 'FruitTree'
        })
        setTasks(fruitTreeTasks)
      }
    } catch (error) {
      console.error('Error loading orchard data:', error)
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

  // Calcola suggerimenti potatura per alberi esistenti
  const pruningSuggestions = selectedGarden && tasks.length > 0
    ? calculateTreePruningTasks(selectedGarden, new Date(), tasks)
    : []

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
        feature="orchard-management"
        title="Gestione Frutteto"
        description="Gestisci alberi da frutto, potature e monitoraggio produzione"
        requiredTier="PRO"
      >
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <TreePine className="text-green-600" size={32} />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestione Frutteto</h1>
                <p className="text-gray-600">Monitora e gestisci i tuoi alberi da frutto</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddWizard(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus size={20} />
                Aggiungi Albero
              </button>
            </div>
          </div>

          {/* Tabs per Tipologie Frutta */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="flex border-b border-gray-200">
              <button className="px-6 py-3 border-b-2 border-green-600 text-green-600 font-medium">
                🍎 Frutta Tradizionale
              </button>
              <button className="px-6 py-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
                🥭 Frutta Esotica/Tropicale
              </button>
              <button className="px-6 py-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
                🌰 Frutta Secca
              </button>
            </div>
            
            {/* Info Sezione Attiva */}
            <div className="p-4 bg-green-50 border-l-4 border-green-500">
              <div className="flex items-center gap-2">
                <Info className="text-green-600" size={16} />
                <span className="text-sm font-medium text-green-800">Frutta Tradizionale</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Meli, peri, peschi, ciliegi, susini e altri alberi da frutto tipici del clima temperato
              </p>
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

          {/* Info Frutteto Configurato */}
          {selectedGarden?.orchardConfig && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-md p-6 mb-6 border border-green-200">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Info className="text-green-600 flex-shrink-0 mt-1" size={24} />
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">Frutteto Configurato</h3>
                      {selectedGarden.orchardConfig.category && (
                        <span className="px-3 py-1 bg-green-600 text-white rounded-full text-sm font-medium">
                          {getCategoryInfo(selectedGarden.orchardConfig.category)?.icon} {getCategoryInfo(selectedGarden.orchardConfig.category)?.label}
                        </span>
                      )}
                    </div>
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
            </div>
          )}
        </div>

        {!selectedGarden ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <TreePine className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 mb-2">Nessun giardino disponibile</p>
            <p className="text-sm text-gray-500">
              Crea un giardino dalla Dashboard per iniziare
            </p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <TreePine className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nessun albero da frutto registrato
            </h3>
            <p className="text-gray-600 mb-4">
              Inizia aggiungendo il tuo primo albero da frutto
            </p>
            <button
              onClick={() => setShowAddWizard(true)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus size={20} className="inline mr-2" />
              Aggiungi Primo Albero
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Prossime Potature */}
            {(upcomingPrunings.length > 0 || pruningSuggestions.length > 0) && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Scissors className="text-green-600" size={24} />
                  Prossime Potature
                </h2>
                
                {upcomingPrunings.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Pianificate</h3>
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

                {pruningSuggestions.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Suggerite</h3>
                    <div className="space-y-2">
                      {pruningSuggestions.slice(0, 5).map((suggestion, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg border-2 flex items-center justify-between ${
                            suggestion.priority === 'High'
                              ? 'bg-red-50 border-red-200'
                              : suggestion.priority === 'Medium'
                              ? 'bg-yellow-50 border-yellow-200'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div>
                            <div className="font-medium text-gray-800">
                              {suggestion.message} - {suggestion.pruningType}
                            </div>
                            <div className="text-sm text-gray-600">
                              {suggestion.suggestedDate && format(new Date(suggestion.suggestedDate), 'dd MMMM yyyy', { locale: it })}
                            </div>
                            {suggestion.instructions && suggestion.instructions.length > 0 && (
                              <div className="text-xs text-gray-500 mt-1">{suggestion.instructions[0]}</div>
                            )}
                          </div>
                          <Link
                            href={`/app/mechanical-work`}
                            className="text-green-600 hover:text-green-800 text-sm flex items-center gap-1"
                          >
                            Registra
                            <LinkIcon size={14} />
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Lista Alberi */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  I Tuoi Alberi ({tasks.length})
                </h2>
              </div>
              <div className="divide-y divide-gray-200">
                {tasks.map((task) => {
                  const masterData = getMasterSheetSync(task.plantName)
                  const fruitTreeCrop = masterData as unknown as FruitTreeCrop | undefined
                  
                  if (!fruitTreeCrop || fruitTreeCrop.cropType !== 'FruitTree') return null
                  
                  const treeAge = task.fruitTreeData?.treeAge || 1
                  const fruitTreeAdvice = calculateFruitTreeTasks(fruitTreeCrop, treeAge)
                  const chillMet = selectedGarden?.coordinates 
                    ? isChillRequirementMet(fruitTreeCrop, selectedGarden.coordinates, selectedGarden.altitudeMeters)
                    : true
                  
                  return (
                    <div key={task.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <TreePine className="text-green-500" size={24} />
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {task.plantName}
                                {task.variety && <span className="text-gray-600 ml-2">- {task.variety}</span>}
                              </h3>
                              <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                <span>Tipo: {fruitTreeCrop.treeType}</span>
                                <span>Età: {treeAge} anni</span>
                                {fruitTreeCrop.rootstock && <span>Portinnesto: {fruitTreeCrop.rootstock}</span>}
                              </div>
                            </div>
                          </div>

                          {/* Alert Impollinazione */}
                          {fruitTreeCrop.pollinationType === 'Self-sterile' && (
                            <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200 flex items-start gap-2">
                              <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={18} />
                              <div className="text-sm text-yellow-800">
                                <strong>Richiede Impollinatori:</strong> {fruitTreeCrop.pollinatorVarieties?.join(', ') || 'varietà compatibili'}
                              </div>
                            </div>
                          )}

                          {/* Alert Chill Hours */}
                          {fruitTreeCrop.chillHours && !chillMet && (
                            <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200 flex items-start gap-2">
                              <AlertCircle className="text-orange-600 flex-shrink-0 mt-0.5" size={18} />
                              <div className="text-sm text-orange-800">
                                <strong>Fabbisogno Freddo:</strong> Richiede {fruitTreeCrop.chillHours} ore di freddo. La località potrebbe non soddisfare questo requisito.
                              </div>
                            </div>
                          )}

                          {/* Prossimi Task */}
                          {fruitTreeAdvice.length > 0 && (
                            <div className="mt-4">
                              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <Calendar className="text-green-500" size={16} />
                                Prossimi Interventi
                              </h4>
                              <div className="space-y-2">
                                {fruitTreeAdvice.slice(0, 3).map((advice, idx) => (
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
                                      {advice.season && ` • ${advice.season}`}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Periodo Raccolta */}
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="text-sm font-medium text-gray-800 mb-1">
                              Periodo Raccolta
                            </div>
                            <div className="text-sm text-blue-700">
                              {new Date(2024, fruitTreeCrop.harvestWindow.startMonth - 1, 1).toLocaleDateString('it-IT', { month: 'long' })} - {new Date(2024, fruitTreeCrop.harvestWindow.endMonth - 1, 1).toLocaleDateString('it-IT', { month: 'long' })}
                            </div>
                            {treeAge < fruitTreeCrop.maturityYears && (
                              <div className="text-xs text-blue-600 mt-2">
                                ⚠️ Produzione ottimale tra {fruitTreeCrop.maturityYears} anni
                              </div>
                            )}
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

        {/* Wizard Aggiunta Albero */}
        {showAddWizard && selectedGarden && (
          <CreateOrchardWizard
            garden={selectedGarden}
            orchardType="orchard"
            onComplete={async (config) => {
              setShowAddWizard(false)
              await loadData() // Ricarica dati per mostrare nuovo albero
            }}
            onCancel={() => setShowAddWizard(false)}
          />
        )}
      </ProFeatureGate>
    </div>
  )
}

