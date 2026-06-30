'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, ChevronLeft, ChevronRight, Edit, Trash2, Check, Clock, Moon } from 'lucide-react'
import { Garden, GardenTask } from '@/types'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, addMonths, subMonths, isSameMonth, isToday } from 'date-fns'
import { it } from 'date-fns/locale'
import TreatmentCalendarIntegration from '@/components/treatments/TreatmentCalendarIntegration'
import AlmanaccoIntegration from '@/components/planner/AlmanaccoIntegration'
import { translateTaskType, getCommonTaskTypesItalian } from '@/utils/taskTranslations'
import { buildTaskExecutionUrl, canLaunchTaskExecution } from '@/services/taskExecutionLaunchService'
import {
  preserveAgronomicQueueTaskMetadata,
  stripAgronomicQueueTaskMetadata,
} from '@/services/agronomicQueueTaskService'
import { calculateMoonPhase, type MoonPhaseInfo as MoonPhase } from '@/logic/lunarCalendar'

interface TaskCalendarProps {
  garden: Garden
  tasks: GardenTask[]
  onTaskUpdate: (task: GardenTask) => Promise<void>
  onTaskCreate: (task: Omit<GardenTask, 'id'>) => Promise<void>
  onTaskDelete: (taskId: string) => Promise<void>
}

interface NewTaskForm {
  plantName: string
  taskType: string
  date: string
  notes: string
  variety?: string
  zoneId?: string
  rowId?: string
  rowNumber?: number
  quantity?: number
}

const TASK_TYPES = getCommonTaskTypesItalian();

const TASK_COLORS = {
  'Semina': 'bg-green-100 text-green-800 border-green-200',
  'Trapianto': 'bg-blue-100 text-blue-800 border-blue-200', 
  'Fertilizzazione': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Potatura': 'bg-purple-100 text-purple-800 border-purple-200',
  'Raccolta': 'bg-orange-100 text-orange-800 border-orange-200',
  'Trattamento': 'bg-red-100 text-red-800 border-red-200',
  'Irrigazione': 'bg-cyan-100 text-cyan-800 border-cyan-200',
  'Diserbo': 'bg-amber-100 text-amber-800 border-amber-200',
  'Pacciamatura': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Tutoraggio': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'Diradamento': 'bg-pink-100 text-pink-800 border-pink-200'
}

export default function TaskCalendar({ garden, tasks, onTaskUpdate, onTaskCreate, onTaskDelete }: TaskCalendarProps) {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showNewTaskForm, setShowNewTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState<GardenTask | null>(null)
  const [newTask, setNewTask] = useState<NewTaskForm>({
    plantName: '',
    taskType: 'Sowing', // Store English value
    date: '',
    notes: '',
    variety: '',
    zoneId: '',
    rowId: '',
    rowNumber: undefined,
    quantity: 1
  })

  // Verifica dati ricevuti
  if (!garden || !tasks) {
    console.warn('TaskCalendar: Missing required props', { garden: !!garden, tasks: !!tasks })
  }

  // Ottieni i giorni del mese corrente
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Aggiungi giorni del mese precedente e successivo per completare la griglia
  const startDate = new Date(monthStart)
  startDate.setDate(startDate.getDate() - monthStart.getDay())
  
  const endDate = new Date(monthEnd)
  endDate.setDate(endDate.getDate() + (6 - monthEnd.getDay()))
  
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate })

  // Ottieni task per una data specifica
  const getTasksForDate = (date: Date) => {
    if (!tasks || tasks.length === 0) return []
    
    return tasks.filter(task => {
      const taskDate = task.nextDueDate ? parseISO(task.nextDueDate) : parseISO(task.date)
      return isSameDay(taskDate, date)
    })
  }

  // Ottieni fase lunare per una data
  const getMoonPhaseForDate = (date: Date) => {
    const moonPhase = calculateMoonPhase(date)
    
    return {
      emoji: moonPhase.isWaxing ? '🌒' : moonPhase.isWaning ? '🌘' : 
             moonPhase.phase === 'Full' ? '🌕' : 
             moonPhase.phase === 'New' ? '🌑' : '🌓',
      name: moonPhase.name,
      phase: moonPhase
    }
  }

  // Consigli lunari per operazioni
  const getLunarAdvice = (moonPhase: MoonPhase, taskType: string) => {
    if (taskType === 'Sowing') {
      if (moonPhase.isWaxing || moonPhase.phase === 'New') {
        return { ideal: true, advice: '🌱 Ideale per semina (Luna Crescente)' }
      } else {
        return { ideal: false, advice: '⏳ Meglio aspettare Luna Crescente per semina' }
      }
    }
    if (taskType === 'Transplant') {
      if (moonPhase.isWaxing || moonPhase.phase === 'New') {
        return { ideal: true, advice: '🌱 Ideale per trapianto (Luna Crescente)' }
      } else {
        return { ideal: false, advice: '⏳ Meglio aspettare Luna Crescente per trapianto' }
      }
    }
    if (taskType === 'Harvest') {
      if (moonPhase.isWaning) {
        return { ideal: true, advice: '🌾 Ideale per raccolta (Luna Calante)' }
      } else {
        return { ideal: false, advice: '⏳ Meglio aspettare Luna Calante per raccolta' }
      }
    }
    return { ideal: true, advice: '🌙 Fase lunare accettabile' }
  }

  // Naviga tra i mesi
  const goToPreviousMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const goToToday = () => setCurrentDate(new Date())

  // Gestione form nuovo task
  const handleNewTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTask.plantName || !newTask.date) return

    const task: Omit<GardenTask, 'id'> = {
      gardenId: garden.id,
      plantName: newTask.plantName,
      taskType: newTask.taskType as any,
      date: newTask.date,
      notes: newTask.notes,
      variety: newTask.variety || undefined,
      zoneId: newTask.zoneId || undefined,
      rowId: newTask.rowId || undefined,
      rowNumber: newTask.rowNumber || undefined,
      quantity: newTask.quantity || 1,
      completed: false,
      season: 'Summer', // Default
      locationType: 'Ground', // Default
      stage: 'Vegetative' // Default
    }

    await onTaskCreate(task)
    setNewTask({ plantName: '', taskType: 'Sowing', date: '', notes: '', variety: '' })
    setShowNewTaskForm(false)
    setSelectedDate(null)
  }

  // Gestione modifica task
  const handleEditTask = (task: GardenTask) => {
    setEditingTask(task)
    setNewTask({
      plantName: task.plantName,
      taskType: task.taskType,
      date: task.nextDueDate || task.date,
      notes: stripAgronomicQueueTaskMetadata(task.notes),
      variety: task.variety || ''
    })
    setShowNewTaskForm(true)
  }

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTask || !newTask.plantName || !newTask.date) return

    const updatedTask: GardenTask = {
      ...editingTask,
      plantName: newTask.plantName,
      taskType: newTask.taskType as any,
      date: newTask.date,
      nextDueDate: newTask.date,
      notes: preserveAgronomicQueueTaskMetadata(editingTask.notes, newTask.notes),
      variety: newTask.variety || undefined
    }

    await onTaskUpdate(updatedTask)
    setEditingTask(null)
    setNewTask({ plantName: '', taskType: 'Sowing', date: '', notes: '', variety: '' })
    setShowNewTaskForm(false)
  }

  const handleCancelForm = () => {
    setShowNewTaskForm(false)
    setEditingTask(null)
    setSelectedDate(null)
    setNewTask({ 
      plantName: '', 
      taskType: 'Sowing', 
      date: '', 
      notes: '', 
      variety: '',
      zoneId: '',
      rowId: '',
      rowNumber: undefined,
      quantity: 1
    })
  }

  // Apri form per nuova data
  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setNewTask(prev => ({ ...prev, date: format(date, 'yyyy-MM-dd') }))
    setShowNewTaskForm(true)
  }

  const openTaskExecution = (task: GardenTask) => {
    const executionUrl = buildTaskExecutionUrl(task)
    if (!executionUrl) {
      return
    }
    router.push(executionUrl)
  }

  return (
    <div className="space-y-6">
      {/* Almanacco Integrato - Più prominente */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
        <AlmanaccoIntegration
          selectedDate={selectedDate || new Date()}
          compact={false}
          showLunarAdvice={true}
        />
      </div>

      {/* Header Calendario */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            
            <h2 className="text-xl font-bold text-gray-900">
              📅 {format(currentDate, 'MMMM yyyy', { locale: it })}
            </h2>
            
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={goToToday}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Oggi
            </button>
            
            <button
              onClick={() => {
                setSelectedDate(new Date())
                setNewTask(prev => ({ ...prev, date: format(new Date(), 'yyyy-MM-dd') }))
                setShowNewTaskForm(true)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus size={16} />
              Nuovo Task
            </button>
          </div>
        </div>

        {/* Griglia Calendario */}
        <div className="grid grid-cols-7 gap-1">
          {/* Header giorni settimana */}
          {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map((day) => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 bg-gray-50 rounded-lg">
              {day}
            </div>
          ))}

          {/* Giorni del calendario */}
          {calendarDays.map((day, index) => {
            const dayTasks = getTasksForDate(day)
            const isCurrentMonth = isSameMonth(day, currentDate)
            const isCurrentDay = isToday(day)
            const moonInfo = getMoonPhaseForDate(day)
            
            return (
              <div
                key={index}
                onClick={() => isCurrentMonth && handleDateClick(day)}
                className={`min-h-[100px] p-2 border rounded-lg cursor-pointer transition-colors ${
                  isCurrentMonth 
                    ? isCurrentDay
                      ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                    : 'bg-gray-50 border-gray-100 text-gray-400'
                }`}
              >
                <div className={`text-sm font-medium mb-1 flex justify-between items-center ${
                  isCurrentDay ? 'text-blue-600' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  <span>{format(day, 'd')}</span>
                  
                  {/* Moon phase for important days */}
                  {isCurrentMonth && (moonInfo.name.includes('Nuova') || moonInfo.name.includes('Piena')) && (
                    <span className="text-xs" title={moonInfo.name}>
                      {moonInfo.emoji}
                    </span>
                  )}
                </div>

                {/* Task del giorno */}
                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map((task) => {
                    const lunarAdvice = getLunarAdvice(moonInfo.phase, task.taskType)
                    return (
                      <div
                        key={task.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditTask(task)
                        }}
                        className={`text-xs p-1 rounded border cursor-pointer hover:opacity-80 relative ${
                          TASK_COLORS[translateTaskType(task.taskType) as keyof typeof TASK_COLORS] || 'bg-gray-100 text-gray-800 border-gray-200'
                        } ${task.completed ? 'opacity-60 line-through' : ''}`}
                        title={`${task.plantName} - ${translateTaskType(task.taskType)}${task.completed ? ' (completato)' : ''}\n${lunarAdvice.advice}`}
                      >
                        <div className="flex items-center gap-1">
                          {task.completed && <Check size={10} />}
                          {!lunarAdvice.ideal && <span className="text-yellow-600">⚠️</span>}
                          <span className="truncate">{task.plantName}</span>
                        </div>
                        <div className="truncate font-medium">{translateTaskType(task.taskType)}</div>
                      </div>
                    )
                  })}
                  
                  {dayTasks.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{dayTasks.length - 3} altri
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Form Nuovo/Modifica Task */}
      {showNewTaskForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingTask ? 'Modifica Task' : 'Nuovo Task'}
              </h3>
              <button
                onClick={handleCancelForm}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <form onSubmit={editingTask ? handleUpdateTask : handleNewTaskSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Pianta *
                </label>
                <input
                  type="text"
                  value={newTask.plantName}
                  onChange={(e) => setNewTask(prev => ({ ...prev, plantName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="es. Pomodoro San Marzano"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo Operazione *
                </label>
                <select
                  value={newTask.taskType}
                  onChange={(e) => setNewTask(prev => ({ ...prev, taskType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  {TASK_TYPES.map(type => (
                    <option key={type.english} value={type.english}>{type.italian}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data *
                </label>
                <input
                  type="date"
                  value={newTask.date}
                  onChange={(e) => setNewTask(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Varietà
                </label>
                <input
                  type="text"
                  value={newTask.variety}
                  onChange={(e) => setNewTask(prev => ({ ...prev, variety: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="es. San Marzano DOP"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zona
                  </label>
                  <input
                    type="text"
                    value={newTask.zoneId}
                    onChange={(e) => setNewTask(prev => ({ ...prev, zoneId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="es. Zona A"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fila N°
                  </label>
                  <input
                    type="number"
                    value={newTask.rowNumber || ''}
                    onChange={(e) => setNewTask(prev => ({ ...prev, rowNumber: e.target.value ? parseInt(e.target.value) : undefined }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="1, 2, 3..."
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantità Piante
                </label>
                <input
                  type="number"
                  value={newTask.quantity || 1}
                  onChange={(e) => setNewTask(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Numero di piante"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note
                </label>
                <textarea
                  value={newTask.notes}
                  onChange={(e) => setNewTask(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                  placeholder="Dettagli aggiuntivi..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Annulla
                </button>

                {editingTask && canLaunchTaskExecution(editingTask) && (
                  <button
                    type="button"
                    onClick={() => openTaskExecution(editingTask)}
                    className="px-4 py-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                  >
                    Apri esecuzione
                  </button>
                )}
                
                {editingTask && (
                  <button
                    type="button"
                    onClick={() => {
                      onTaskDelete(editingTask.id)
                      handleCancelForm()
                    }}
                    className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors"
                >
                  {editingTask ? 'Aggiorna' : 'Crea Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Legenda e Consigli Lunari */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Legenda Operazioni */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Legenda Operazioni</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(TASK_COLORS).map(([taskType, colorClass]) => (
              <div key={taskType} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded border ${colorClass}`}></div>
                <span className="text-sm text-gray-700">{taskType}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Consigli Lunari */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Moon size={20} className="text-purple-600" />
            Consigli Lunari per l'Orto
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <h4 className="font-medium text-gray-800 flex items-center gap-1">
                🌒 Luna Crescente (ideale per):
              </h4>
              <ul className="text-gray-600 ml-4 mt-1 space-y-1">
                <li>• Semina di piante da foglia e frutto</li>
                <li>• Trapianto di piantine</li>
                <li>• Innesti e potature di formazione</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 flex items-center gap-1">
                🌘 Luna Calante (ideale per):
              </h4>
              <ul className="text-gray-600 ml-4 mt-1 space-y-1">
                <li>• Semina di piante da radice</li>
                <li>• Raccolta per conservazione</li>
                <li>• Potature di produzione</li>
              </ul>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                ⚠️ = Operazione non ideale per la fase lunare corrente
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Integrazione Sistema Trattamenti */}
      {selectedDate && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <TreatmentCalendarIntegration
            tasks={tasks}
            selectedDate={selectedDate}
            onTaskUpdate={onTaskUpdate}
            onTaskComplete={async (taskId) => {
              const task = tasks.find(t => t.id === taskId);
              if (task) {
                await onTaskUpdate({
                  ...task,
                  completed: true,
                  actualCompletedDate: format(new Date(), 'yyyy-MM-dd')
                });
              }
            }}
          />
        </div>
      )}
    </div>
  )
}
