'use client'

import React, { useState, useEffect } from 'react'
import { 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Clock,
  MapPin,
  Beaker,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Save,
  X,
  Target,
  Droplets,
  Leaf
} from 'lucide-react'
import { Garden } from '@/types'
import { 
  NutritionTreatment, 
  NutritionSchedule,
  FertilizerProduct,
  TreatmentProduct,
  NutritionFilters 
} from '@/types/nutrition'
import { advancedNutritionService } from '@/services/advancedNutritionService'
import { format, parseISO, isToday, isTomorrow, isPast } from 'date-fns'
import { it } from 'date-fns/locale'

interface TreatmentPlannerProps {
  garden: Garden
}

type ViewMode = 'treatments' | 'schedules'
type TreatmentStatus = 'all' | 'planned' | 'in_progress' | 'completed' | 'cancelled'

export default function TreatmentPlanner({ garden }: TreatmentPlannerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('treatments')
  const [treatments, setTreatments] = useState<NutritionTreatment[]>([])
  const [schedules, setSchedules] = useState<NutritionSchedule[]>([])
  const [products, setProducts] = useState<(FertilizerProduct | TreatmentProduct)[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<TreatmentStatus>('all')
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [selectedItem, setSelectedItem] = useState<NutritionTreatment | NutritionSchedule | null>(null)

  useEffect(() => {
    loadData()
  }, [garden.id, viewMode])

  const loadData = async () => {
    try {
      setLoading(true)
      
      if (viewMode === 'treatments') {
        const treatmentData = await advancedNutritionService.getNutritionTreatments(garden.id)
        setTreatments(treatmentData)
      } else {
        const scheduleData = await advancedNutritionService.getNutritionSchedules(garden.id)
        setSchedules(scheduleData)
      }
      
      // Load products for both modes
      const [fertilizers, treatmentProducts] = await Promise.all([
        advancedNutritionService.getFertilizerProducts(garden.id),
        advancedNutritionService.getTreatmentProducts(garden.id)
      ])
      setProducts([...fertilizers, ...treatmentProducts])
      
    } catch (error) {
      console.error('Error loading treatment planner data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTreatment = () => {
    setSelectedItem(null)
    setModalMode('create')
    setShowModal(true)
  }

  const handleEditItem = (item: NutritionTreatment | NutritionSchedule) => {
    setSelectedItem(item)
    setModalMode('edit')
    setShowModal(true)
  }

  const handleViewItem = (item: NutritionTreatment | NutritionSchedule) => {
    setSelectedItem(item)
    setModalMode('view')
    setShowModal(true)
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo elemento?')) return
    
    try {
      if (viewMode === 'treatments') {
        await advancedNutritionService.deleteTreatment(itemId)
      } else {
        await advancedNutritionService.deleteNutritionSchedule(itemId)
      }
      await loadData()
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }

  const handleExecuteTreatment = async (treatmentId: string) => {
    try {
      await advancedNutritionService.updateNutritionTreatment(treatmentId, {
        status: 'in_progress',
        actualApplicationDate: new Date().toISOString().split('T')[0]
      })
      await loadData()
    } catch (error) {
      console.error('Error executing treatment:', error)
    }
  }

  const handleCompleteTreatment = async (treatmentId: string) => {
    try {
      await advancedNutritionService.updateNutritionTreatment(treatmentId, {
        status: 'completed',
        actualApplicationDate: new Date().toISOString().split('T')[0]
      })
      await loadData()
    } catch (error) {
      console.error('Error completing treatment:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'in_progress': return 'text-blue-600 bg-blue-100'
      case 'planned': return 'text-yellow-600 bg-yellow-100'
      case 'cancelled': return 'text-red-600 bg-red-100'
      case 'postponed': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getTreatmentTypeIcon = (type: string) => {
    switch (type) {
      case 'fertilization': return <Leaf className="text-green-600" size={16} />
      case 'pest_control': return <Target className="text-red-600" size={16} />
      case 'disease_control': return <Beaker className="text-blue-600" size={16} />
      case 'weed_control': return <XCircle className="text-orange-600" size={16} />
      case 'growth_regulation': return <RotateCcw className="text-purple-600" size={16} />
      default: return <Droplets className="text-gray-600" size={16} />
    }
  }

  const formatDate = (dateString: string) => {
    const date = parseISO(dateString)
    if (isToday(date)) return 'Oggi'
    if (isTomorrow(date)) return 'Domani'
    return format(date, 'dd MMM yyyy', { locale: it })
  }

  const filteredTreatments = treatments.filter(treatment => {
    const matchesSearch = treatment.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (treatment.notes && treatment.notes.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || treatment.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const filteredSchedules = schedules.filter(schedule =>
    schedule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (schedule.description && schedule.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Calendar className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pianificazione Trattamenti</h1>
              <p className="text-gray-600">Gestisci trattamenti e programmazioni automatiche</p>
            </div>
          </div>
          <button
            onClick={handleCreateTreatment}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            Nuovo {viewMode === 'treatments' ? 'Trattamento' : 'Programmazione'}
          </button>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setViewMode('treatments')}
              className={`flex items-center gap-2 py-4 px-6 border-b-2 font-medium text-sm ${
                viewMode === 'treatments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Droplets size={16} />
              Trattamenti ({treatments.length})
            </button>
            <button
              onClick={() => setViewMode('schedules')}
              className={`flex items-center gap-2 py-4 px-6 border-b-2 font-medium text-sm ${
                viewMode === 'schedules'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Clock size={16} />
              Programmazioni ({schedules.length})
            </button>
          </nav>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder={`Cerca ${viewMode === 'treatments' ? 'trattamenti' : 'programmazioni'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {viewMode === 'treatments' && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as TreatmentStatus)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tutti gli stati</option>
                <option value="planned">Pianificati</option>
                <option value="in_progress">In corso</option>
                <option value="completed">Completati</option>
                <option value="cancelled">Annullati</option>
              </select>
            )}
            
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter size={16} />
              Filtri
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-gray-100 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : viewMode === 'treatments' ? (
            filteredTreatments.length === 0 ? (
              <div className="text-center py-12">
                <Droplets className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun trattamento trovato</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || statusFilter !== 'all' ? 'Prova a modificare i filtri' : 'Inizia pianificando il primo trattamento'}
                </p>
                <button
                  onClick={handleCreateTreatment}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Nuovo Trattamento
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTreatments.map((treatment) => (
                  <TreatmentCard
                    key={treatment.id}
                    treatment={treatment}
                    onEdit={() => handleEditItem(treatment)}
                    onView={() => handleViewItem(treatment)}
                    onDelete={() => handleDeleteItem(treatment.id)}
                    onExecute={() => handleExecuteTreatment(treatment.id)}
                    onComplete={() => handleCompleteTreatment(treatment.id)}
                    getStatusColor={getStatusColor}
                    getTreatmentTypeIcon={getTreatmentTypeIcon}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            )
          ) : (
            filteredSchedules.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nessuna programmazione trovata</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm ? 'Prova a modificare i criteri di ricerca' : 'Inizia creando la prima programmazione automatica'}
                </p>
                <button
                  onClick={handleCreateTreatment}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Nuova Programmazione
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSchedules.map((schedule) => (
                  <ScheduleCard
                    key={schedule.id}
                    schedule={schedule}
                    onEdit={() => handleEditItem(schedule)}
                    onView={() => handleViewItem(schedule)}
                    onDelete={() => handleDeleteItem(schedule.id)}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <TreatmentModal
          mode={modalMode}
          viewMode={viewMode}
          item={selectedItem}
          garden={garden}
          products={products}
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false)
            loadData()
          }}
        />
      )}
    </div>
  )
}

// Treatment Card Component
interface TreatmentCardProps {
  treatment: NutritionTreatment
  onEdit: () => void
  onView: () => void
  onDelete: () => void
  onExecute: () => void
  onComplete: () => void
  getStatusColor: (status: string) => string
  getTreatmentTypeIcon: (type: string) => React.ReactNode
  formatDate: (date: string) => string
}

function TreatmentCard({
  treatment,
  onEdit,
  onView,
  onDelete,
  onExecute,
  onComplete,
  getStatusColor,
  getTreatmentTypeIcon,
  formatDate
}: TreatmentCardProps) {
  const isOverdue = treatment.status === 'planned' && isPast(parseISO(treatment.scheduledDate))
  
  return (
    <div className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
      isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="flex-shrink-0">
            {getTreatmentTypeIcon(treatment.treatmentType)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 truncate">{treatment.productName}</h3>
              {isOverdue && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  <AlertTriangle size={12} className="mr-1" />
                  In ritardo
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {formatDate(treatment.actualApplicationDate || treatment.scheduledDate)}
              </span>
              
              <span className="flex items-center gap-1">
                <Beaker size={12} />
                {treatment.dosage} {treatment.dosageUnit}
              </span>
              
              {treatment.zoneId && (
                <span className="flex items-center gap-1">
                  <MapPin size={12} />
                  Zona specifica
                </span>
              )}
              
              {treatment.totalCost && (
                <span className="flex items-center gap-1">
                  €{treatment.totalCost}
                </span>
              )}
            </div>
            
            {treatment.notes && (
              <p className="text-xs text-gray-500 mt-1 truncate">{treatment.notes}</p>
            )}
          </div>
          
          <div className="flex-shrink-0">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(treatment.status)}`}>
              {treatment.status === 'completed' ? 'Completato' :
               treatment.status === 'in_progress' ? 'In corso' :
               treatment.status === 'planned' ? 'Pianificato' :
               treatment.status === 'cancelled' ? 'Annullato' :
               'Posticipato'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          {treatment.status === 'planned' && (
            <button
              onClick={onExecute}
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Avvia trattamento"
            >
              <Play size={16} />
            </button>
          )}
          
          {treatment.status === 'in_progress' && (
            <button
              onClick={onComplete}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Completa trattamento"
            >
              <CheckCircle size={16} />
            </button>
          )}
          
          <button
            onClick={onView}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Visualizza dettagli"
          >
            <Eye size={16} />
          </button>
          
          <button
            onClick={onEdit}
            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Modifica"
          >
            <Edit size={16} />
          </button>
          
          <button
            onClick={onDelete}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Elimina"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

// Schedule Card Component
interface ScheduleCardProps {
  schedule: NutritionSchedule
  onEdit: () => void
  onView: () => void
  onDelete: () => void
  formatDate: (date: string) => string
}

function ScheduleCard({ schedule, onEdit, onView, onDelete, formatDate }: ScheduleCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="flex-shrink-0">
            <Clock className={`${schedule.isActive ? 'text-green-600' : 'text-gray-400'}`} size={16} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 truncate">{schedule.name}</h3>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                schedule.isActive ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'
              }`}>
                {schedule.isActive ? 'Attivo' : 'Inattivo'}
              </span>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <RotateCcw size={12} />
                {schedule.frequency === 'weekly' ? 'Settimanale' :
                 schedule.frequency === 'monthly' ? 'Mensile' :
                 schedule.frequency === 'daily' ? 'Giornaliero' :
                 'Personalizzato'}
              </span>
              
              {schedule.nextExecutionDate && (
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  Prossimo: {formatDate(schedule.nextExecutionDate)}
                </span>
              )}
              
              <span className="flex items-center gap-1">
                <Target size={12} />
                {schedule.treatments.length} trattamenti
              </span>
            </div>
            
            {schedule.description && (
              <p className="text-xs text-gray-500 mt-1 truncate">{schedule.description}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={onView}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Visualizza dettagli"
          >
            <Eye size={16} />
          </button>
          
          <button
            onClick={onEdit}
            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Modifica"
          >
            <Edit size={16} />
          </button>
          
          <button
            onClick={onDelete}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Elimina"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

// Treatment Modal Component (simplified for now)
interface TreatmentModalProps {
  mode: 'create' | 'edit' | 'view'
  viewMode: ViewMode
  item: NutritionTreatment | NutritionSchedule | null
  garden: Garden
  products: (FertilizerProduct | TreatmentProduct)[]
  onClose: () => void
  onSave: () => void
}

function TreatmentModal({ mode, viewMode, item, garden, products, onClose, onSave }: TreatmentModalProps) {
  const [formData, setFormData] = useState<any>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (item) {
      setFormData(item)
    } else {
      // Initialize with default values
      if (viewMode === 'treatments') {
        setFormData({
          gardenId: garden.id,
          treatmentType: 'fertilization',
          productId: '',
          productName: '',
          dosage: 0,
          dosageUnit: 'ml_per_liter',
          applicationMethod: 'spray',
          scheduledDate: new Date().toISOString().split('T')[0],
          status: 'planned',
          organicCompliant: false,
          followUpRequired: false,
          calibrationCheck: false
        })
      } else {
        setFormData({
          gardenId: garden.id,
          name: '',
          scheduleType: 'recurring',
          frequency: 'weekly',
          isActive: true,
          treatments: []
        })
      }
    }
  }, [item, viewMode, garden.id])

  const handleSave = async () => {
    try {
      setSaving(true)
      
      if (viewMode === 'treatments') {
        if (mode === 'create') {
          await advancedNutritionService.createNutritionTreatment(formData)
        } else {
          await advancedNutritionService.updateNutritionTreatment(formData.id, formData)
        }
      } else {
        if (mode === 'create') {
          await advancedNutritionService.createNutritionSchedule(formData)
        } else {
          await advancedNutritionService.updateNutritionSchedule(formData.id, formData)
        }
      }
      
      onSave()
    } catch (error) {
      console.error('Error saving:', error)
    } finally {
      setSaving(false)
    }
  }

  const isReadOnly = mode === 'view'

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {mode === 'create' ? 'Nuovo' : mode === 'edit' ? 'Modifica' : 'Dettagli'} {' '}
              {viewMode === 'treatments' ? 'Trattamento' : 'Programmazione'}
            </h2>
            <p className="text-sm text-gray-600">
              {mode === 'create' ? 'Crea un nuovo elemento' : 
               mode === 'edit' ? 'Modifica le informazioni' :
               'Visualizza i dettagli'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Form Content - Simplified for now */}
        <div className="p-6">
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Form in sviluppo</h3>
            <p className="text-gray-600">
              Il form completo per {viewMode === 'treatments' ? 'trattamenti' : 'programmazioni'} sarà implementato nel prossimo step
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isReadOnly ? 'Chiudi' : 'Annulla'}
          </button>
          
          {!isReadOnly && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Salva
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}