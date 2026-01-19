'use client'

import React, { useState } from 'react'
import { Calendar, Plus, Edit, Trash2, Check, Clock, Filter, Search, ChevronDown, ChevronUp } from 'lucide-react'
import { Garden, GardenTask } from '@/types'
import { format, parseISO, isToday, isTomorrow, isPast } from 'date-fns'
import { it } from 'date-fns/locale'

import { translateTaskType, getCommonTaskTypesItalian } from '@/utils/taskTranslations'

interface TaskListProps {
  garden: Garden
  tasks: GardenTask[]
  onTaskUpdate: (task: GardenTask) => Promise<void>
  onTaskCreate: (task: Omit<GardenTask, 'id'>) => Promise<void>
  onTaskDelete: (taskId: string) => Promise<void>
}

type FilterType = 'all' | 'pending' | 'completed' | 'overdue' | 'today' | 'upcoming'
type SortType = 'date' | 'plant' | 'type' | 'status'

const TASK_TYPES = getCommonTaskTypesItalian()

export default function TaskList({ garden, tasks, onTaskUpdate, onTaskCreate, onTaskDelete }: TaskListProps) {
  const [filter, setFilter] = useState<FilterType>('all')
  const [sortBy, setSortBy] = useState<SortType>('date')
  const [searchTerm, setSearchTerm] = useState('')
  const [showNewTaskForm, setShowNewTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState<GardenTask | null>(null)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})

  // Filtra e ordina i task
  const filteredTasks = (tasks || []).filter(task => {
    // Filtro per ricerca
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      if (!task.plantName.toLowerCase().includes(searchLower) &&
          !task.taskType.toLowerCase().includes(searchLower) &&
          !(task.notes || '').toLowerCase().includes(searchLower)) {
        return false
      }
    }

    // Filtro per stato
    const taskDate = task.nextDueDate ? parseISO(task.nextDueDate) : parseISO(task.date)
    
    switch (filter) {
      case 'pending':
        return !task.completed
      case 'completed':
        return task.completed
      case 'overdue':
        return !task.completed && isPast(taskDate) && !isToday(taskDate)
      case 'today':
        return isToday(taskDate)
      case 'upcoming':
        return !task.completed && !isPast(taskDate)
      default:
        return true
    }
  }).sort((a, b) => {
    const dateA = a.nextDueDate ? parseISO(a.nextDueDate) : parseISO(a.date)
    const dateB = b.nextDueDate ? parseISO(b.nextDueDate) : parseISO(b.date)
    
    switch (sortBy) {
      case 'date':
        return dateA.getTime() - dateB.getTime()
      case 'plant':
        return a.plantName.localeCompare(b.plantName)
      case 'type':
        return a.taskType.localeCompare(b.taskType)
      case 'status':
        if (a.completed === b.completed) return dateA.getTime() - dateB.getTime()
        return a.completed ? 1 : -1
      default:
        return 0
    }
  })

  // Raggruppa i task per data
  const groupedTasks = filteredTasks.reduce((groups, task) => {
    const taskDate = task.nextDueDate ? parseISO(task.nextDueDate) : parseISO(task.date)
    let groupKey = ''
    
    if (isToday(taskDate)) {
      groupKey = 'Oggi'
    } else if (isTomorrow(taskDate)) {
      groupKey = 'Domani'
    } else if (isPast(taskDate) && !task.completed) {
      groupKey = 'In ritardo'
    } else {
      groupKey = format(taskDate, 'EEEE d MMMM yyyy', { locale: it })
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = []
    }
    groups[groupKey].push(task)
    return groups
  }, {} as Record<string, GardenTask[]>)

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }))
  }

  const getTaskPriority = (task: GardenTask) => {
    const taskDate = task.nextDueDate ? parseISO(task.nextDueDate) : parseISO(task.date)
    if (task.completed) return 'completed'
    if (isPast(taskDate) && !isToday(taskDate)) return 'overdue'
    if (isToday(taskDate)) return 'today'
    if (isTomorrow(taskDate)) return 'tomorrow'
    return 'upcoming'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'overdue': return 'border-l-red-500 bg-red-50'
      case 'today': return 'border-l-orange-500 bg-orange-50'
      case 'tomorrow': return 'border-l-blue-500 bg-blue-50'
      case 'completed': return 'border-l-green-500 bg-green-50 opacity-75'
      default: return 'border-l-gray-300 bg-white'
    }
  }

  const handleCompleteTask = async (task: GardenTask) => {
    await onTaskUpdate({ ...task, completed: !task.completed })
  }

  return (
    <div className="space-y-6">
      {/* Header e Controlli */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Lista Task</h2>
            <p className="text-gray-600">Gestisci tutte le operazioni del tuo orto</p>
          </div>
          
          <button
            onClick={() => setShowNewTaskForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus size={16} />
            Nuovo Task
          </button>
        </div>

        {/* Filtri e Ricerca */}
        <div className="flex flex-wrap gap-4 items-center">
          {/* Ricerca */}
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Cerca task..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtro Stato */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterType)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">Tutti</option>
            <option value="pending">Da fare</option>
            <option value="today">Oggi</option>
            <option value="overdue">In ritardo</option>
            <option value="upcoming">Prossimi</option>
            <option value="completed">Completati</option>
          </select>

          {/* Ordinamento */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortType)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="date">Per data</option>
            <option value="plant">Per pianta</option>
            <option value="type">Per tipo</option>
            <option value="status">Per stato</option>
          </select>
        </div>

        {/* Statistiche */}
        <div className="flex items-center gap-6 mt-4 text-sm text-gray-600">
          <span>Totale: {filteredTasks.length}</span>
          <span>Da fare: {(filteredTasks || []).filter(t => !t.completed).length}</span>
          <span>Completati: {(filteredTasks || []).filter(t => t.completed).length}</span>
          <span>In ritardo: {(filteredTasks || []).filter(t => !t.completed && isPast(t.nextDueDate ? parseISO(t.nextDueDate) : parseISO(t.date)) && !isToday(t.nextDueDate ? parseISO(t.nextDueDate) : parseISO(t.date))).length}</span>
        </div>
      </div>

      {/* Lista Task Raggruppata */}
      <div className="space-y-4">
        {Object.entries(groupedTasks).map(([groupKey, groupTasks]) => {
          const isExpanded = expandedGroups[groupKey] !== false // Default expanded
          
          return (
            <div key={groupKey} className="bg-white rounded-xl border border-gray-200">
              {/* Header Gruppo */}
              <button
                onClick={() => toggleGroup(groupKey)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-gray-900">{groupKey}</h3>
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                    {groupTasks.length}
                  </span>
                </div>
                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>

              {/* Task del Gruppo */}
              {isExpanded && (
                <div className="border-t border-gray-200">
                  {groupTasks.map((task) => {
                    const priority = getTaskPriority(task)
                    const taskDate = task.nextDueDate ? parseISO(task.nextDueDate) : parseISO(task.date)
                    
                    return (
                      <div
                        key={task.id}
                        className={`border-l-4 p-4 border-b border-gray-100 last:border-b-0 ${getPriorityColor(priority)}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            {/* Checkbox */}
                            <button
                              onClick={() => handleCompleteTask(task)}
                              className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                task.completed
                                  ? 'bg-green-500 border-green-500 text-white'
                                  : 'border-gray-300 hover:border-green-500'
                              }`}
                            >
                              {task.completed && <Check size={12} />}
                            </button>

                            {/* Contenuto Task */}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                  {task.plantName}
                                </h4>
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                  {translateTaskType(task.taskType)}
                                </span>
                                {task.variety && (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                    {task.variety}
                                  </span>
                                )}
                                {task.zoneId && (
                                  <span className="px-2 py-1 bg-purple-100 text-purple-600 rounded text-xs">
                                    Zona: {task.zoneId}
                                  </span>
                                )}
                                {task.rowNumber && (
                                  <span className="px-2 py-1 bg-indigo-100 text-indigo-600 rounded text-xs">
                                    Fila {task.rowNumber}
                                  </span>
                                )}
                                {task.quantity && task.quantity > 1 && (
                                  <span className="px-2 py-1 bg-green-100 text-green-600 rounded text-xs">
                                    {task.quantity} piante
                                  </span>
                                )}
                              </div>
                              
                              {task.notes && (
                                <p className={`text-sm mb-2 ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {task.notes}
                                </p>
                              )}
                              
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Calendar size={12} />
                                  <span>{format(taskDate, 'dd/MM/yyyy')}</span>
                                </div>
                                {priority === 'overdue' && (
                                  <div className="flex items-center gap-1 text-red-600">
                                    <Clock size={12} />
                                    <span>In ritardo</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Azioni */}
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => {
                                setEditingTask(task)
                                setShowNewTaskForm(true)
                              }}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => onTaskDelete(task.id)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {Object.keys(groupedTasks).length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun task trovato</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filter !== 'all' 
                ? 'Prova a modificare i filtri di ricerca'
                : 'Inizia aggiungendo il tuo primo task'
              }
            </p>
            {!searchTerm && filter === 'all' && (
              <button
                onClick={() => setShowNewTaskForm(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Aggiungi Task
              </button>
            )}
          </div>
        )}
      </div>

      {/* Form Modal - Riutilizza lo stesso del TaskCalendar */}
      {showNewTaskForm && (
        <TaskFormModal
          task={editingTask}
          garden={garden}
          onSave={async (taskData) => {
            if (editingTask) {
              await onTaskUpdate({ ...editingTask, ...taskData })
            } else {
              await onTaskCreate(taskData)
            }
            setShowNewTaskForm(false)
            setEditingTask(null)
          }}
          onCancel={() => {
            setShowNewTaskForm(false)
            setEditingTask(null)
          }}
        />
      )}
    </div>
  )
}

// Componente Form Modal separato
interface TaskFormModalProps {
  task?: GardenTask | null
  garden: Garden
  onSave: (taskData: any) => Promise<void>
  onCancel: () => void
}

function TaskFormModal({ task, garden, onSave, onCancel }: TaskFormModalProps) {
  const [formData, setFormData] = useState({
    plantName: task?.plantName || '',
    taskType: task?.taskType || 'Sowing',
    date: task?.nextDueDate || task?.date || format(new Date(), 'yyyy-MM-dd'),
    notes: task?.notes || '',
    variety: task?.variety || '',
    zoneId: task?.zoneId || '',
    rowNumber: task?.rowNumber || undefined,
    quantity: task?.quantity || 1
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.plantName || !formData.date) return

    const taskData = {
      gardenId: garden.id,
      plantName: formData.plantName,
      taskType: formData.taskType as any,
      date: formData.date,
      nextDueDate: formData.date,
      notes: formData.notes,
      variety: formData.variety || undefined,
      zoneId: formData.zoneId || undefined,
      rowNumber: formData.rowNumber || undefined,
      quantity: formData.quantity || 1,
      completed: false,
      season: 'Summer' as const,
      locationType: 'Ground' as const,
      stage: 'Vegetative' as const
    }

    await onSave(taskData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {task ? 'Modifica Task' : 'Nuovo Task'}
          </h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome Pianta *
            </label>
            <input
              type="text"
              value={formData.plantName}
              onChange={(e) => setFormData(prev => ({ ...prev, plantName: e.target.value }))}
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
              value={formData.taskType}
              onChange={(e) => setFormData(prev => ({ ...prev, taskType: e.target.value as GardenTask['taskType'] }))}
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
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
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
              value={formData.variety}
              onChange={(e) => setFormData(prev => ({ ...prev, variety: e.target.value }))}
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
                value={formData.zoneId}
                onChange={(e) => setFormData(prev => ({ ...prev, zoneId: e.target.value }))}
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
                value={formData.rowNumber || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, rowNumber: e.target.value ? parseInt(e.target.value) : undefined }))}
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
              value={formData.quantity}
              onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
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
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={3}
              placeholder="Dettagli aggiuntivi..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors"
            >
              {task ? 'Aggiorna' : 'Crea Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}