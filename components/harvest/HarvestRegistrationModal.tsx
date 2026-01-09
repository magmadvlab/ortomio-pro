'use client'

import React, { useState, useEffect } from 'react'
import { Garden, GardenTask } from '@/types'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { X, ShoppingBasket, Camera } from 'lucide-react'

interface HarvestRegistrationModalProps {
  garden: Garden
  isOpen: boolean
  onClose: () => void
  onHarvestRegistered?: () => void
}

interface HarvestableTask {
  id: string
  plantName: string
  variety?: string
  plantedDate: string
  daysFromPlanting: number
  location: string
  isReady: boolean
}

export function HarvestRegistrationModal({ 
  garden, 
  isOpen, 
  onClose, 
  onHarvestRegistered 
}: HarvestRegistrationModalProps) {
  const [harvestableTasks, setHarvestableTasks] = useState<HarvestableTask[]>([])
  const [selectedTaskId, setSelectedTaskId] = useState<string>('')
  const [quantity, setQuantity] = useState<number>(0)
  const [unit, setUnit] = useState<string>('kg')
  const [quality, setQuality] = useState<number>(5)
  const [notes, setNotes] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [loadingTasks, setLoadingTasks] = useState(false)
  const { storageProvider } = useStorage()

  // Carica i task che possono essere raccolti
  useEffect(() => {
    if (!isOpen || !garden) return

    const loadHarvestableTasks = async () => {
      setLoadingTasks(true)
      try {
        const tasks = await storageProvider.getTasks(garden.id)
        const now = new Date()
        
        const harvestable = tasks
          .filter(task => 
            (task.taskType === 'Sowing' || task.taskType === 'Transplant') &&
            task.completed &&
            task.stage !== 'Harvested' // Non ancora raccolto
          )
          .map(task => {
            const plantedDate = new Date(task.date)
            const daysFromPlanting = Math.floor((now.getTime() - plantedDate.getTime()) / (1000 * 60 * 60 * 24))
            
            // Stima se è pronto per il raccolto (logica semplificata)
            const isReady = daysFromPlanting >= getMinHarvestDays(task.plantName)
            
            return {
              id: task.id,
              plantName: task.plantName,
              variety: task.variety,
              plantedDate: task.date,
              daysFromPlanting,
              location: task.locationType || 'Non specificato',
              isReady
            }
          })
          .sort((a, b) => b.daysFromPlanting - a.daysFromPlanting) // Più vecchi prima

        setHarvestableTasks(harvestable)
        
        // Seleziona automaticamente il primo task pronto
        const firstReady = harvestable.find(t => t.isReady)
        if (firstReady) {
          setSelectedTaskId(firstReady.id)
        }
      } catch (error) {
        console.error('Error loading harvestable tasks:', error)
      } finally {
        setLoadingTasks(false)
      }
    }

    loadHarvestableTasks()
  }, [isOpen, garden, storageProvider])

  const getMinHarvestDays = (plantName: string): number => {
    // Giorni minimi per il raccolto (semplificato)
    const harvestDays: Record<string, number> = {
      'Lattuga': 30,
      'Rucola': 25,
      'Spinaci': 30,
      'Basilico': 20,
      'Prezzemolo': 25,
      'Pomodoro': 70,
      'Peperone': 80,
      'Melanzana': 90,
      'Zucchina': 50,
      'Cetriolo': 55,
      'Carota': 70,
      'Ravanello': 25,
      'Cipolla': 90,
      'Aglio': 120
    }
    return harvestDays[plantName] || 60
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTaskId || quantity <= 0) return

    setLoading(true)
    try {
      // Aggiorna il task come raccolto
      await storageProvider.updateTask(selectedTaskId, {
        stage: 'Harvested',
        notes: `${notes ? notes + '\n' : ''}Raccolto: ${quantity} ${unit} - Qualità: ${quality}/10`
      })

      // Crea un log di raccolto se il metodo esiste
      if ('createHarvestLog' in storageProvider) {
        const selectedTask = harvestableTasks.find(t => t.id === selectedTaskId)
        if (selectedTask) {
          await (storageProvider as any).createHarvestLog({
            gardenId: garden.id,
            taskId: selectedTaskId,
            plantName: selectedTask.plantName,
            variety: selectedTask.variety,
            quantity,
            unit,
            quality,
            notes,
            harvestDate: new Date().toISOString()
          })
        }
      }

      // Reset form
      setSelectedTaskId('')
      setQuantity(0)
      setUnit('kg')
      setQuality(5)
      setNotes('')
      
      onHarvestRegistered?.()
      onClose()
    } catch (error) {
      console.error('Error registering harvest:', error)
      alert('Errore durante la registrazione del raccolto')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const selectedTask = harvestableTasks.find(t => t.id === selectedTaskId)

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ShoppingBasket className="text-orange-600" size={24} />
              Registra Raccolto
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {loadingTasks ? (
            <div className="text-center py-8">
              <div className="text-gray-600">Caricamento piante...</div>
            </div>
          ) : harvestableTasks.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-600 mb-4">
                Nessuna pianta pronta per il raccolto trovata.
              </div>
              <p className="text-sm text-gray-500">
                Completa prima alcuni task di semina o trapianto per vedere le piante disponibili.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Selezione Pianta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pianta da raccogliere *
                </label>
                <select
                  value={selectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="">Seleziona una pianta...</option>
                  {harvestableTasks.map(task => (
                    <option key={task.id} value={task.id}>
                      {task.plantName} {task.variety && `(${task.variety})`} - {task.location}
                      {task.isReady ? ' ✅' : ` (${task.daysFromPlanting}gg)`}
                    </option>
                  ))}
                </select>
                {selectedTask && (
                  <p className="text-xs text-gray-500 mt-1">
                    Piantato il {new Date(selectedTask.plantedDate).toLocaleDateString('it-IT')} 
                    ({selectedTask.daysFromPlanting} giorni fa)
                    {selectedTask.isReady ? ' - Pronto per il raccolto!' : ' - Potrebbe non essere ancora maturo'}
                  </p>
                )}
              </div>

              {/* Quantità */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantità *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={quantity || ''}
                    onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="0.0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unità
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="pz">pezzi</option>
                    <option value="mazzi">mazzi</option>
                    <option value="l">litri</option>
                  </select>
                </div>
              </div>

              {/* Qualità */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qualità (1-10)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={quality}
                    onChange={(e) => setQuality(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-8 text-center">{quality}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Scarsa</span>
                  <span>Ottima</span>
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note (opzionale)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows={3}
                  placeholder="Colore, sapore, problemi riscontrati..."
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={loading || !selectedTaskId || quantity <= 0}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Salvando...' : 'Registra Raccolto'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}