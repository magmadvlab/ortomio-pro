'use client'

import React, { useState, useEffect } from 'react'
import { Garden, GardenTask, GrowingLocation } from '@/types'
import { getMasterSheetSync } from '@/services/plantMasterService'
import { CheckCircle2, Circle, Calendar, Droplets, Shovel, Scissors, FlaskConical, Camera, Sparkles, Loader2, Sprout, X, PlusCircle, AlertCircle, Clock, Gauge, Scale, Star, ShoppingBasket, Snowflake, Sun, Box, Flower2, LayoutGrid, Filter, Search, MapPin } from 'lucide-react'
import { format, parseISO, isToday, isYesterday, isThisWeek, isSameDay, differenceInDays } from 'date-fns'
import { it } from 'date-fns/locale'
import { AddCropWizard } from '../crops/AddCropWizard'
import { HarvestPromptModal } from '@/components/shared/HarvestPromptModal'
import { EditTaskModal } from '../tasks/EditTaskModal'
import { ManualTaskModal } from './ManualTaskModal'
import { isPlantMature } from '@/utils/plantMaturityDetector'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { useChallengeNotifications } from '@/hooks/useChallengeNotifications'
import { ChallengeToast } from '@/components/challenges/ChallengeToast'
import { useAuth } from '@/packages/core/hooks/useAuth'

interface ListViewProps {
  garden: Garden
  tasks: GardenTask[]
  onToggleTask: (id: string) => void
  onAddTask: (task: Omit<GardenTask, 'id' | 'completed' | 'gardenId'>) => void
  onDeleteTask: (id: string) => void
  onUpdateTask: (task: GardenTask) => void
}

export function ListView({
  garden,
  tasks,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onUpdateTask
}: ListViewProps) {
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [showCropWizard, setShowCropWizard] = useState(false)
  const [showManualTaskModal, setShowManualTaskModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterSeason, setFilterSeason] = useState<'all' | 'Summer' | 'Winter'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed' | 'scheduled'>('pending')
  const [harvestPromptTask, setHarvestPromptTask] = useState<GardenTask | null>(null)
  const [editingTask, setEditingTask] = useState<GardenTask | null>(null)
  const { storageProvider } = useStorage()
  const { user } = useAuth()
  const { checkChallengeProgress, showChallengeNotification, hideNotification, activeNotification } = useChallengeNotifications()
  
  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    // Search filter
    if (searchQuery && !task.plantName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !task.notes?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    
    // Type filter
    if (filterType !== 'all' && task.taskType !== filterType) {
      return false
    }
    
    // Season filter
    if (filterSeason !== 'all' && task.season !== filterSeason) {
      return false
    }
    
    // Status filter
    if (filterStatus === 'completed' && !task.completed) {
      return false
    }
    if (filterStatus === 'pending' && task.completed) {
      return false
    }
    if (filterStatus === 'scheduled') {
      if (task.completed) return false
      const taskDate = task.nextDueDate ? parseISO(task.nextDueDate) : (task.date ? parseISO(task.date) : null)
      if (!taskDate || isToday(taskDate) || isYesterday(taskDate)) return false
      // Solo task futuri
      if (differenceInDays(taskDate, new Date()) <= 0) return false
    }
    
    return true
  })
  
  // Group tasks by date
  const groupedTasks = filteredTasks.reduce((groups, task) => {
    const taskDate = task.nextDueDate ? parseISO(task.nextDueDate) : (task.date ? parseISO(task.date) : new Date())
    let groupKey = ''
    
    if (isToday(taskDate)) {
      groupKey = 'Oggi'
    } else if (isYesterday(taskDate)) {
      groupKey = 'Ieri'
    } else if (isThisWeek(taskDate)) {
      groupKey = 'Questa settimana'
    } else {
      const month = format(taskDate, 'MMMM yyyy', { locale: it })
      groupKey = month
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = []
    }
    groups[groupKey].push(task)
    return groups
  }, {} as Record<string, GardenTask[]>)
  
  // Sort groups
  const sortedGroups = Object.entries(groupedTasks).sort((a, b) => {
    const order = ['Oggi', 'Ieri', 'Questa settimana']
    const aIndex = order.indexOf(a[0])
    const bIndex = order.indexOf(b[0])
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
    if (aIndex !== -1) return -1
    if (bIndex !== -1) return 1
    return a[0].localeCompare(b[0])
  })
  
  const getIcon = (type: string) => {
    switch(type) {
      case 'Sowing': return <Shovel size={18} className="text-brown-500" />;
      case 'Transplant': return <Sprout size={18} className="text-green-500" />;
      case 'Fertilize': return <FlaskConical size={18} className="text-purple-500" />;
      case 'Treatment': return <FlaskConical size={18} className="text-red-500" />;
      case 'Prune': return <Scissors size={18} className="text-orange-500" />;
      case 'Harvest': return <Gauge size={18} className="text-orange-600" />;
      default: return <Droplets size={18} className="text-blue-500" />;
    }
  }
  
  const getLocationIcon = (loc?: GrowingLocation) => {
    if (loc === 'Pot') return <Box size={14}/>
    if (loc === 'RaisedBed') return <LayoutGrid size={14}/>
    return <Flower2 size={14}/>
  }
  
  const getLocationLabel = (loc?: GrowingLocation) => {
    if (loc === 'Pot') return 'Vaso'
    if (loc === 'RaisedBed') return 'Letto'
    if (loc === 'Tray') return 'Vassoio'
    return 'Terra'
  }
  
  const taskTypes = [
    { value: 'all', label: 'Tutti' },
    { value: 'Sowing', label: 'Semina' },
    { value: 'Transplant', label: 'Trapianto' },
    { value: 'Fertilize', label: 'Concimazione' },
    { value: 'Treatment', label: 'Trattamento' },
    { value: 'Prune', label: 'Potatura' },
    { value: 'Harvest', label: 'Raccolta' }
  ]
  
  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Cerca per pianta o note..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          {/* Filters Row */}
          <div className="flex flex-wrap gap-2">
            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
            >
              {taskTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            
            {/* Season Filter */}
            <select
              value={filterSeason}
              onChange={(e) => setFilterSeason(e.target.value as any)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
            >
              <option value="all">Tutte le stagioni</option>
              <option value="Summer">Estivo</option>
              <option value="Winter">Invernale</option>
            </select>
            
            {/* Status Filter - Buttons */}
            <div className="flex gap-2 flex-wrap">
              {[
                { value: 'all', label: 'Tutti' },
                { value: 'pending', label: 'Da fare' },
                { value: 'completed', label: 'Completati' },
                { value: 'scheduled', label: 'Pianificati' }
              ].map(filter => (
                <button
                  key={filter.value}
                  onClick={() => setFilterStatus(filter.value as any)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === filter.value
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Add Task Button with Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
        >
          <PlusCircle size={20} />
          <span>Nuovo Task</span>
        </button>

        {/* Dropdown Menu */}
        {showAddMenu && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-10">
            <button
              onClick={() => {
                setShowCropWizard(true)
                setShowAddMenu(false)
              }}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🌱</span>
                <div>
                  <div className="font-medium text-gray-900">Semina / Trapianto</div>
                  <div className="text-xs text-gray-500">Nuova pianta da seme o piantina</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                setShowManualTaskModal(true)
                setShowAddMenu(false)
              }}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">📝</span>
                <div>
                  <div className="font-medium text-gray-900">Task Manuale</div>
                  <div className="text-xs text-gray-500">Concimazione, Trattamento, Potatura, Raccolta</div>
                </div>
              </div>
            </button>
          </div>
        )}
      </div>
      
      {/* Tasks List */}
      <div className="space-y-6">
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-600">
              {searchQuery || filterType !== 'all' || filterSeason !== 'all' || filterStatus !== 'pending'
                ? 'Nessun task corrisponde ai filtri selezionati'
                : 'Nessun task nel diario. Aggiungi il tuo primo task!'}
            </p>
          </div>
        ) : (
          sortedGroups.map(([groupLabel, groupTasks]) => (
            <div key={groupLabel} className="space-y-3">
              {/* Group Header */}
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-bold text-gray-900">{groupLabel}</h3>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                  {groupTasks.length}
                </span>
              </div>
              
              {/* Tasks in Group */}
              {groupTasks.map(task => {
            const master = getMasterSheetSync(task.plantName)
            const variety = task.variety ? ` (${task.variety})` : ''
            
            return (
              <div
                key={task.id}
                className={`bg-white rounded-xl border-2 p-4 transition-all ${
                  task.completed
                    ? 'border-green-200 bg-green-50 opacity-75'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox Grande Tap-Friendly */}
                  <button
                    onClick={async () => {
                      // Se stiamo completando il task e la pianta è matura, mostra prompt
                      if (!task.completed) {
                        // 🔴 FIX CRITICO: Trova task semina/trapianto collegato alla pianta
                        const sowingTask = tasks.find(t =>
                          t.plantName === task.plantName &&
                          t.variety === task.variety &&
                          (t.taskType === 'Sowing' || t.taskType === 'Transplant')
                        )

                        // Check maturità sulla semina, non sul task corrente
                        if (sowingTask && isPlantMature(sowingTask) && !sowingTask.harvestLogId) {
                          setHarvestPromptTask(sowingTask)
                        }

                        // Completa il task corrente
                        await onToggleTask(task.id)

                        // Controlla challenge progress
                        if (user?.id) {
                          const challengeProgress = await checkChallengeProgress(
                            task.taskType === 'Sowing' ? 'sowing' :
                            task.taskType === 'Harvest' ? 'harvest' :
                            'task_complete',
                            user.id,
                            { gardenId: garden.id }
                          )
                          if (challengeProgress) {
                            showChallengeNotification(challengeProgress)
                          }
                        }
                      } else {
                        await onToggleTask(task.id)
                      }
                    }}
                    className="mt-1 flex-shrink-0 p-1 hover:bg-gray-100 rounded transition-colors"
                    aria-label={task.completed ? 'Segna come non completato' : 'Segna come completato'}
                  >
                    {task.completed ? (
                      <CheckCircle2 size={28} className="text-green-600" strokeWidth={2} />
                    ) : (
                      <Circle size={28} className="text-gray-400 hover:text-green-600 transition-colors" strokeWidth={2} />
                    )}
                  </button>
                  
                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getIcon(task.taskType)}
                          <h3 className="font-semibold text-gray-900">
                            {task.plantName}{variety}
                          </h3>
                          {task.locationType && (
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              {getLocationIcon(task.locationType)}
                              {getLocationLabel(task.locationType)}
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          {task.taskType === 'Sowing' && 'Semina'}
                          {task.taskType === 'Transplant' && 'Trapianto'}
                          {task.taskType === 'Fertilize' && 'Concimazione'}
                          {task.taskType === 'Treatment' && 'Trattamento'}
                          {task.taskType === 'Prune' && 'Potatura'}
                          {task.taskType === 'Harvest' && 'Raccolta'}
                          {task.quantity && ` • ${task.quantity} piante`}
                        </p>
                        
                        {/* Info Contestuali Inline */}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 mb-2">
                          {task.nextDueDate && (
                            <div className="flex items-center gap-1">
                              <Clock size={14} />
                              <span>{format(parseISO(task.nextDueDate), 'HH:mm')}</span>
                            </div>
                          )}
                          {task.date && (
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              <span>{format(parseISO(task.date), 'dd MMM yyyy', { locale: it })}</span>
                            </div>
                          )}
                          {task.locationType && (
                            <div className="flex items-center gap-1">
                              <MapPin size={14} />
                              <span>{getLocationLabel(task.locationType)}</span>
                            </div>
                          )}
                        </div>
                        
                        {task.notes && (
                          <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">
                            {task.notes}
                          </p>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!task.completed && (
                          <>
                            <button
                              onClick={() => {
                                // Rimanda task
                                const newDate = new Date()
                                newDate.setDate(newDate.getDate() + 1)
                                onUpdateTask({
                                  ...task,
                                  nextDueDate: newDate.toISOString().split('T')[0]
                                })
                              }}
                              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors flex items-center gap-1"
                              title="Rimanda"
                            >
                              <Clock size={14} />
                              Rimanda
                            </button>
                            <button
                              onClick={() => {
                                setEditingTask(task)
                              }}
                              className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-200 transition-colors"
                              title="Modifica"
                            >
                              Modifica
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => onDeleteTask(task.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Elimina"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
            </div>
          ))
        )}
      </div>
      
      {/* Add Crop Wizard Modal */}
      {showCropWizard && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Nuovo Task</h2>
              <button
                onClick={() => setShowCropWizard(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-4">
              <AddCropWizard
                garden={garden}
                  onComplete={(taskData: GardenTask) => {
                    onAddTask(taskData)
                    setShowCropWizard(false)
                  }}
                onCancel={() => setShowCropWizard(false)}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Harvest Prompt Modal */}
      {harvestPromptTask && (
        <HarvestPromptModal
          task={harvestPromptTask}
          onHarvest={async (harvestData) => {
            try {
              // Crea il log di raccolto
              await storageProvider.createHarvestLog({
                ...harvestData,
                gardenId: garden.id
              } as any)
              
              // Chiudi il modal
              setHarvestPromptTask(null)
              
              // Opzionalmente mostra un messaggio di successo
              // Potresti usare un toast qui
            } catch (error) {
              console.error('Error creating harvest log:', error)
              alert('Errore nel salvataggio del raccolto')
            }
          }}
          onSkip={() => {
            setHarvestPromptTask(null)
          }}
        />
      )}
      
      {/* Edit Task Modal */}
      <EditTaskModal
        task={editingTask}
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        onTaskUpdated={(updatedTask) => {
          // Aggiorna il task nella lista
          onUpdateTask(updatedTask)
          setEditingTask(null)
        }}
      />
      
      {/* Challenge Toast */}
      {activeNotification && (
        <ChallengeToast
          progress={activeNotification}
          onClose={hideNotification}
        />
      )}

      {/* Manual Task Modal */}
      <ManualTaskModal
        gardenId={garden.id}
        isOpen={showManualTaskModal}
        onClose={() => setShowManualTaskModal(false)}
        onAddTask={onAddTask}
      />
    </div>
  )
}
