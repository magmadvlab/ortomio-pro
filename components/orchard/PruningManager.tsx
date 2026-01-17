'use client'

import React, { useState, useEffect } from 'react'
import { 
  PruningSchedule, 
  TreePruningRecord, 
  PruningType, 
  PruningIntensity, 
  PruningObjective, 
  PruningTechnique,
  TreeSelectionCriteria,
  ScheduleStatus
} from '@/types/orchard'
import { orchardService } from '@/services/orchardService'
import { 
  Scissors, 
  Plus, 
  Calendar, 
  Clock, 
  Users, 
  Target, 
  CheckCircle, 
  AlertTriangle,
  Play,
  Pause,
  X,
  Edit,
  Eye,
  Filter,
  Download,
  BarChart3
} from 'lucide-react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

interface PruningManagerProps {
  orchardId: string
  gardenId: string
}

export default function PruningManager({ orchardId, gardenId }: PruningManagerProps) {
  const [schedules, setSchedules] = useState<PruningSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState<PruningSchedule | null>(null)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState<ScheduleStatus | 'all'>('all')

  useEffect(() => {
    loadSchedules()
  }, [orchardId])

  const loadSchedules = async () => {
    try {
      setLoading(true)
      const schedulesData = await orchardService.getPruningSchedules(orchardId)
      setSchedules(schedulesData)
    } catch (error) {
      console.error('Error loading pruning schedules:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: ScheduleStatus) => {
    switch (status) {
      case 'planned': return 'text-blue-600 bg-blue-100'
      case 'in_progress': return 'text-orange-600 bg-orange-100'
      case 'completed': return 'text-green-600 bg-green-100'
      case 'cancelled': return 'text-red-600 bg-red-100'
      case 'postponed': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: ScheduleStatus) => {
    switch (status) {
      case 'planned': return <Calendar size={16} />
      case 'in_progress': return <Play size={16} />
      case 'completed': return <CheckCircle size={16} />
      case 'cancelled': return <X size={16} />
      case 'postponed': return <Pause size={16} />
      default: return <Clock size={16} />
    }
  }

  const getPruningTypeIcon = (type: PruningType) => {
    switch (type) {
      case 'winter': return '❄️'
      case 'summer': return '☀️'
      case 'training': return '🌱'
      case 'production': return '🍎'
      case 'renovation': return '🔄'
      case 'corrective': return '🔧'
      default: return '✂️'
    }
  }

  const getPruningTypeName = (type: PruningType) => {
    switch (type) {
      case 'winter': return 'Potatura Invernale'
      case 'summer': return 'Potatura Estiva'
      case 'training': return 'Potatura di Allevamento'
      case 'production': return 'Potatura di Produzione'
      case 'renovation': return 'Potatura di Rinnovamento'
      case 'corrective': return 'Potatura Correttiva'
      default: return 'Potatura'
    }
  }

  const getIntensityColor = (intensity: PruningIntensity) => {
    switch (intensity) {
      case 'light': return 'text-green-600'
      case 'moderate': return 'text-yellow-600'
      case 'heavy': return 'text-orange-600'
      case 'severe': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const filteredSchedules = schedules.filter(schedule => 
    filterStatus === 'all' || schedule.status === filterStatus
  )

  const handleCreateSchedule = async (scheduleData: Omit<PruningSchedule, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newSchedule = await orchardService.createPruningSchedule(scheduleData)
      setSchedules(prev => [...prev, newSchedule])
      setShowCreateModal(false)
    } catch (error) {
      console.error('Error creating pruning schedule:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Scissors className="mx-auto text-gray-400 mb-4 animate-pulse" size={48} />
          <p className="text-gray-600">Caricamento programmi potatura...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Scissors className="text-orange-600" size={32} />
            Gestione Potature
          </h2>
          <p className="text-gray-600">Pianifica e monitora le operazioni di potatura</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus size={16} />
          Nuovo Programma
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <Filter className="text-gray-400" size={20} />
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filterStatus === 'all' 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tutti ({schedules.length})
            </button>
            <button
              onClick={() => setFilterStatus('planned')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filterStatus === 'planned' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pianificati ({schedules.filter(s => s.status === 'planned').length})
            </button>
            <button
              onClick={() => setFilterStatus('in_progress')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filterStatus === 'in_progress' 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              In Corso ({schedules.filter(s => s.status === 'in_progress').length})
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filterStatus === 'completed' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Completati ({schedules.filter(s => s.status === 'completed').length})
            </button>
          </div>
        </div>
      </div>

      {/* Schedules List */}
      {filteredSchedules.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Scissors className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {schedules.length === 0 ? 'Nessun programma di potatura' : 'Nessun programma trovato'}
          </h3>
          <p className="text-gray-600 mb-4">
            {schedules.length === 0 
              ? 'Inizia creando il primo programma di potatura per il frutteto'
              : 'Prova a modificare i filtri per vedere altri programmi'
            }
          </p>
          {schedules.length === 0 && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Plus size={20} />
              Crea Primo Programma
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSchedules.map((schedule) => (
            <div
              key={schedule.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{getPruningTypeIcon(schedule.pruningType)}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{schedule.name}</h3>
                    <p className="text-sm text-gray-600">{getPruningTypeName(schedule.pruningType)}</p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(schedule.status)}`}>
                  {getStatusIcon(schedule.status)}
                  {schedule.status === 'planned' ? 'Pianificato' :
                   schedule.status === 'in_progress' ? 'In Corso' :
                   schedule.status === 'completed' ? 'Completato' :
                   schedule.status === 'cancelled' ? 'Annullato' : 'Posticipato'}
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={14} />
                  <span>
                    {format(new Date(schedule.scheduledStartDate), 'dd MMM yyyy', { locale: it })}
                    {schedule.scheduledEndDate && 
                      ` - ${format(new Date(schedule.scheduledEndDate), 'dd MMM yyyy', { locale: it })}`
                    }
                  </span>
                </div>

                {schedule.estimatedTrees && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Target size={14} />
                    <span>{schedule.estimatedTrees} alberi stimati</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <Scissors size={14} className="text-gray-400" />
                  <span className={`font-medium ${getIntensityColor(schedule.pruningIntensity)}`}>
                    Intensità: {schedule.pruningIntensity === 'light' ? 'Leggera' :
                              schedule.pruningIntensity === 'moderate' ? 'Moderata' :
                              schedule.pruningIntensity === 'heavy' ? 'Pesante' : 'Severa'}
                  </span>
                </div>

                {schedule.totalEstimatedHours && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={14} />
                    <span>{schedule.totalEstimatedHours}h stimate</span>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Progresso</span>
                  <span className="font-medium">{schedule.completionPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${schedule.completionPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Objectives */}
              {schedule.pruningObjectives && schedule.pruningObjectives.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs text-gray-600 mb-2">Obiettivi:</div>
                  <div className="flex flex-wrap gap-1">
                    {schedule.pruningObjectives.slice(0, 3).map((objective, index) => (
                      <span key={index} className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">
                        {objective === 'shape_formation' ? 'Forma' :
                         objective === 'light_penetration' ? 'Luce' :
                         objective === 'air_circulation' ? 'Aria' :
                         objective === 'disease_prevention' ? 'Prevenzione' :
                         objective === 'yield_optimization' ? 'Produzione' :
                         objective === 'size_control' ? 'Controllo' :
                         objective === 'rejuvenation' ? 'Ringiovanimento' : 'Meccanizzazione'}
                      </span>
                    ))}
                    {schedule.pruningObjectives.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        +{schedule.pruningObjectives.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedSchedule(schedule)
                    setShowScheduleModal(true)
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  <Eye size={14} />
                  Dettagli
                </button>
                {schedule.status === 'planned' && (
                  <button className="px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
                    <Play size={14} />
                  </button>
                )}
                {schedule.status === 'in_progress' && (
                  <button className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                    <Edit size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Schedule Modal */}
      {showCreateModal && (
        <CreatePruningScheduleModal
          orchardId={orchardId}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateSchedule}
        />
      )}

      {/* Schedule Detail Modal */}
      {showScheduleModal && selectedSchedule && (
        <PruningScheduleDetailModal
          schedule={selectedSchedule}
          onClose={() => {
            setShowScheduleModal(false)
            setSelectedSchedule(null)
          }}
          onUpdate={(updatedSchedule) => {
            setSchedules(prev => prev.map(s => s.id === updatedSchedule.id ? updatedSchedule : s))
            setSelectedSchedule(updatedSchedule)
          }}
        />
      )}
    </div>
  )
}

// Create Pruning Schedule Modal
interface CreatePruningScheduleModalProps {
  orchardId: string
  onClose: () => void
  onCreate: (schedule: Omit<PruningSchedule, 'id' | 'createdAt' | 'updatedAt'>) => void
}

function CreatePruningScheduleModal({ orchardId, onClose, onCreate }: CreatePruningScheduleModalProps) {
  const [formData, setFormData] = useState<Partial<PruningSchedule>>({
    orchardId,
    name: '',
    pruningType: 'winter',
    scheduledStartDate: '',
    pruningIntensity: 'moderate',
    pruningObjectives: [],
    techniques: [],
    requiredTools: [],
    status: 'planned',
    completionPercentage: 0,
    treesPruned: 0,
    targetCriteria: {}
  })

  const pruningTypes: { value: PruningType; label: string; description: string }[] = [
    { value: 'winter', label: 'Potatura Invernale', description: 'Potatura principale durante il riposo vegetativo' },
    { value: 'summer', label: 'Potatura Estiva', description: 'Potatura verde durante la stagione vegetativa' },
    { value: 'training', label: 'Potatura di Allevamento', description: 'Formazione della struttura della pianta' },
    { value: 'production', label: 'Potatura di Produzione', description: 'Ottimizzazione della produzione' },
    { value: 'renovation', label: 'Potatura di Rinnovamento', description: 'Ringiovanimento di piante vecchie' },
    { value: 'corrective', label: 'Potatura Correttiva', description: 'Correzione di difetti strutturali' }
  ]

  const objectives: { value: PruningObjective; label: string }[] = [
    { value: 'shape_formation', label: 'Formazione Forma' },
    { value: 'light_penetration', label: 'Penetrazione Luce' },
    { value: 'air_circulation', label: 'Circolazione Aria' },
    { value: 'disease_prevention', label: 'Prevenzione Malattie' },
    { value: 'yield_optimization', label: 'Ottimizzazione Produzione' },
    { value: 'size_control', label: 'Controllo Dimensioni' },
    { value: 'rejuvenation', label: 'Ringiovanimento' },
    { value: 'mechanical_harvest_prep', label: 'Preparazione Meccanizzazione' }
  ]

  const techniques: { value: PruningTechnique; label: string }[] = [
    { value: 'heading_back', label: 'Speronatura' },
    { value: 'thinning_out', label: 'Diradamento' },
    { value: 'renewal_pruning', label: 'Potatura di Rinnovo' },
    { value: 'spur_pruning', label: 'Potatura a Sperone' },
    { value: 'cane_pruning', label: 'Potatura a Tralcio' },
    { value: 'topping', label: 'Cimatura' },
    { value: 'dehorning', label: 'Capitozzatura' }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCreate(formData as Omit<PruningSchedule, 'id' | 'createdAt' | 'updatedAt'>)
  }

  const toggleObjective = (objective: PruningObjective) => {
    setFormData(prev => ({
      ...prev,
      pruningObjectives: prev.pruningObjectives?.includes(objective)
        ? prev.pruningObjectives.filter(o => o !== objective)
        : [...(prev.pruningObjectives || []), objective]
    }))
  }

  const toggleTechnique = (technique: PruningTechnique) => {
    setFormData(prev => ({
      ...prev,
      techniques: prev.techniques?.includes(technique)
        ? prev.techniques.filter(t => t !== technique)
        : [...(prev.techniques || []), technique]
    }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex-shrink-0 bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Nuovo Programma Potatura</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Programma *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="es. Potatura Invernale 2026"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo Potatura *
              </label>
              <select
                required
                value={formData.pruningType}
                onChange={(e) => setFormData(prev => ({ ...prev, pruningType: e.target.value as PruningType }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                {pruningTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Timing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Inizio *
              </label>
              <input
                type="date"
                required
                value={formData.scheduledStartDate}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduledStartDate: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Fine
              </label>
              <input
                type="date"
                value={formData.scheduledEndDate || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduledEndDate: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Intensity and Estimates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Intensità *
              </label>
              <select
                required
                value={formData.pruningIntensity}
                onChange={(e) => setFormData(prev => ({ ...prev, pruningIntensity: e.target.value as PruningIntensity }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="light">Leggera</option>
                <option value="moderate">Moderata</option>
                <option value="heavy">Pesante</option>
                <option value="severe">Severa</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alberi Stimati
              </label>
              <input
                type="number"
                value={formData.estimatedTrees || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedTrees: parseInt(e.target.value) || undefined }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="0"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ore Totali Stimate
              </label>
              <input
                type="number"
                step="0.5"
                value={formData.totalEstimatedHours || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, totalEstimatedHours: parseFloat(e.target.value) || undefined }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          {/* Objectives */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Obiettivi Potatura
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {objectives.map((objective) => (
                <label key={objective.value} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.pruningObjectives?.includes(objective.value) || false}
                    onChange={() => toggleObjective(objective.value)}
                    className="text-orange-600"
                  />
                  <span className="text-sm">{objective.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Techniques */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tecniche di Potatura
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {techniques.map((technique) => (
                <label key={technique.value} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.techniques?.includes(technique.value) || false}
                    onChange={() => toggleTechnique(technique.value)}
                    className="text-orange-600"
                  />
                  <span className="text-sm">{technique.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Istruzioni
            </label>
            <textarea
              value={formData.instructions || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              rows={4}
              placeholder="Istruzioni dettagliate per la potatura..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Crea Programma
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Schedule Detail Modal
interface PruningScheduleDetailModalProps {
  schedule: PruningSchedule
  onClose: () => void
  onUpdate: (schedule: PruningSchedule) => void
}

function PruningScheduleDetailModal({ schedule, onClose, onUpdate }: PruningScheduleDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'progress' | 'records'>('details')
  const [records, setRecords] = useState<TreePruningRecord[]>([])
  const [loading, setLoading] = useState(false)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex-shrink-0 bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{schedule.name}</h2>
            <p className="text-orange-100">
              {schedule.pruningType === 'winter' ? 'Potatura Invernale' :
               schedule.pruningType === 'summer' ? 'Potatura Estiva' :
               schedule.pruningType === 'training' ? 'Potatura di Allevamento' :
               schedule.pruningType === 'production' ? 'Potatura di Produzione' :
               schedule.pruningType === 'renovation' ? 'Potatura di Rinnovamento' : 'Potatura Correttiva'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'details' 
                ? 'text-orange-600 border-b-2 border-orange-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Dettagli
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'progress' 
                ? 'text-orange-600 border-b-2 border-orange-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Progresso
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'records' 
                ? 'text-orange-600 border-b-2 border-orange-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Registrazioni
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'details' && (
            <ScheduleDetailsTab schedule={schedule} />
          )}
          {activeTab === 'progress' && (
            <ScheduleProgressTab schedule={schedule} />
          )}
          {activeTab === 'records' && (
            <ScheduleRecordsTab schedule={schedule} records={records} />
          )}
        </div>
      </div>
    </div>
  )
}

// Schedule Details Tab
function ScheduleDetailsTab({ schedule }: { schedule: PruningSchedule }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Informazioni Generali</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Periodo</label>
            <p className="text-gray-900">
              {format(new Date(schedule.scheduledStartDate), 'dd MMMM yyyy', { locale: it })}
              {schedule.scheduledEndDate && 
                ` - ${format(new Date(schedule.scheduledEndDate), 'dd MMMM yyyy', { locale: it })}`
              }
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Intensità</label>
            <p className="text-gray-900">
              {schedule.pruningIntensity === 'light' ? 'Leggera' :
               schedule.pruningIntensity === 'moderate' ? 'Moderata' :
               schedule.pruningIntensity === 'heavy' ? 'Pesante' : 'Severa'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alberi Stimati</label>
            <p className="text-gray-900">{schedule.estimatedTrees || 'Non specificato'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ore Stimate</label>
            <p className="text-gray-900">{schedule.totalEstimatedHours || 'Non specificato'} ore</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Obiettivi e Tecniche</h3>
          
          {schedule.pruningObjectives && schedule.pruningObjectives.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Obiettivi</label>
              <div className="flex flex-wrap gap-2">
                {schedule.pruningObjectives.map((objective, index) => (
                  <span key={index} className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full">
                    {objective === 'shape_formation' ? 'Formazione Forma' :
                     objective === 'light_penetration' ? 'Penetrazione Luce' :
                     objective === 'air_circulation' ? 'Circolazione Aria' :
                     objective === 'disease_prevention' ? 'Prevenzione Malattie' :
                     objective === 'yield_optimization' ? 'Ottimizzazione Produzione' :
                     objective === 'size_control' ? 'Controllo Dimensioni' :
                     objective === 'rejuvenation' ? 'Ringiovanimento' : 'Preparazione Meccanizzazione'}
                  </span>
                ))}
              </div>
            </div>
          )}

          {schedule.techniques && schedule.techniques.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tecniche</label>
              <div className="flex flex-wrap gap-2">
                {schedule.techniques.map((technique, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                    {technique === 'heading_back' ? 'Speronatura' :
                     technique === 'thinning_out' ? 'Diradamento' :
                     technique === 'renewal_pruning' ? 'Potatura di Rinnovo' :
                     technique === 'spur_pruning' ? 'Potatura a Sperone' :
                     technique === 'cane_pruning' ? 'Potatura a Tralcio' :
                     technique === 'topping' ? 'Cimatura' : 'Capitozzatura'}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {schedule.instructions && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Istruzioni</label>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-gray-900 whitespace-pre-wrap">{schedule.instructions}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Schedule Progress Tab
function ScheduleProgressTab({ schedule }: { schedule: PruningSchedule }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="text-sm text-blue-600 mb-1">Progresso</div>
          <div className="text-3xl font-bold text-blue-900 mb-2">{schedule.completionPercentage}%</div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${schedule.completionPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="text-sm text-green-600 mb-1">Alberi Potati</div>
          <div className="text-3xl font-bold text-green-900">{schedule.treesPruned}</div>
          <div className="text-sm text-green-600">
            di {schedule.estimatedTrees || '?'} stimati
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="text-sm text-orange-600 mb-1">Ore Lavorate</div>
          <div className="text-3xl font-bold text-orange-900">{schedule.actualHours || 0}</div>
          <div className="text-sm text-orange-600">
            di {schedule.totalEstimatedHours || '?'} stimate
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
            <div>
              <div className="font-medium text-gray-900">Pianificazione</div>
              <div className="text-sm text-gray-600">
                {format(new Date(schedule.createdAt), 'dd MMM yyyy', { locale: it })}
              </div>
            </div>
          </div>

          {schedule.actualStartDate && (
            <div className="flex items-center gap-4">
              <div className="w-4 h-4 bg-green-600 rounded-full"></div>
              <div>
                <div className="font-medium text-gray-900">Inizio Lavori</div>
                <div className="text-sm text-gray-600">
                  {format(new Date(schedule.actualStartDate), 'dd MMM yyyy', { locale: it })}
                </div>
              </div>
            </div>
          )}

          {schedule.actualEndDate && (
            <div className="flex items-center gap-4">
              <div className="w-4 h-4 bg-purple-600 rounded-full"></div>
              <div>
                <div className="font-medium text-gray-900">Completamento</div>
                <div className="text-sm text-gray-600">
                  {format(new Date(schedule.actualEndDate), 'dd MMM yyyy', { locale: it })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Schedule Records Tab
function ScheduleRecordsTab({ schedule, records }: { schedule: PruningSchedule; records: TreePruningRecord[] }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Registrazioni Potatura</h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
          <Plus size={16} />
          Nuova Registrazione
        </button>
      </div>

      {records.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <Scissors className="mx-auto text-gray-400 mb-4" size={48} />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Nessuna registrazione</h4>
          <p className="text-gray-600 mb-4">Le registrazioni delle potature appariranno qui</p>
          <button className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
            <Plus size={20} />
            Prima Registrazione
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((record) => (
            <div key={record.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Albero {record.treeId}</h4>
                  <p className="text-sm text-gray-600">
                    {format(new Date(record.pruningDate), 'dd MMM yyyy', { locale: it })}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Durata</div>
                  <div className="font-medium">{record.durationMinutes} min</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}