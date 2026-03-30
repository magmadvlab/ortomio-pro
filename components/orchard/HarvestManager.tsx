'use client'

import React, { useState, useEffect } from 'react'
import { 
  HarvestSchedule, 
  TreeHarvestRecord, 
  HarvestType, 
  HarvestMethod, 
  TargetMarket,
  QualityClass,
  ScheduleStatus
} from '@/types/orchard'
import { orchardService } from '@/services/orchardService'
import { useStorage } from '@/packages/core/hooks/useStorage'
import {
  calculateAdaptiveQualityPrice,
  resolveAdaptiveQualityPricingBenchmark,
  type AdaptiveQualityPricingBenchmark,
} from '@/services/adaptiveMarketPricingService'
import { 
  Calendar, 
  Plus, 
  TrendingUp, 
  Package, 
  DollarSign, 
  Scale, 
  CheckCircle, 
  AlertTriangle,
  Play,
  Pause,
  X,
  Edit,
  Eye,
  Filter,
  Download,
  BarChart3,
  Truck,
  Star,
  Clock
} from 'lucide-react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

interface HarvestManagerProps {
  orchardId: string
  gardenId: string
}

interface OrchardHarvestBenchmarkSummary {
  benchmark: AdaptiveQualityPricingBenchmark
  qualityScore: number | null
  status: 'above_target' | 'watch' | 'below_target' | 'no_data'
  adjustedPrice: number
  premiumRate: number
}

export default function HarvestManager({ orchardId, gardenId }: HarvestManagerProps) {
  const [schedules, setSchedules] = useState<HarvestSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState<HarvestSchedule | null>(null)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState<ScheduleStatus | 'all'>('all')

  useEffect(() => {
    loadSchedules()
  }, [orchardId])

  const loadSchedules = async () => {
    try {
      setLoading(true)
      const schedulesData = await orchardService.getHarvestSchedules(orchardId)
      setSchedules(schedulesData)
    } catch (error) {
      console.error('Error loading harvest schedules:', error)
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

  const getHarvestTypeIcon = (type: HarvestType) => {
    switch (type) {
      case 'commercial': return '🍎'
      case 'thinning': return '🌿'
      case 'sampling': return '🔬'
      case 'quality_test': return '⚗️'
      default: return '📦'
    }
  }

  const getMarketIcon = (market: TargetMarket) => {
    switch (market) {
      case 'fresh': return '🍃'
      case 'processing': return '🏭'
      case 'export': return '🌍'
      case 'local': return '🏪'
      case 'premium': return '⭐'
      case 'organic': return '🌱'
      default: return '📦'
    }
  }

  const getMarketLabel = (market?: TargetMarket) => {
    switch (market) {
      case 'fresh': return 'Fresco'
      case 'processing': return 'Industria'
      case 'export': return 'Export'
      case 'local': return 'Locale'
      case 'premium': return 'Alta valorizzazione'
      case 'organic': return 'Biologico'
      default: return 'Non definito'
    }
  }

  const filteredSchedules = schedules.filter(schedule => 
    filterStatus === 'all' || schedule.status === filterStatus
  )

  const handleCreateSchedule = async (scheduleData: Omit<HarvestSchedule, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newSchedule = await orchardService.createHarvestSchedule(scheduleData)
      setSchedules(prev => [...prev, newSchedule])
      setShowCreateModal(false)
    } catch (error) {
      console.error('Error creating harvest schedule:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Calendar className="mx-auto text-gray-400 mb-4 animate-pulse" size={48} />
          <p className="text-gray-600">Caricamento programmi raccolta...</p>
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
            <Calendar className="text-green-600" size={32} />
            Gestione Raccolte
          </h2>
          <p className="text-gray-600">Pianifica e monitora le operazioni di raccolta</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus size={16} />
          Nuovo Programma
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Raccolte Pianificate</p>
              <p className="text-2xl font-bold text-blue-600">
                {schedules.filter(s => s.status === 'planned').length}
              </p>
            </div>
            <Calendar className="text-blue-600" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Corso</p>
              <p className="text-2xl font-bold text-orange-600">
                {schedules.filter(s => s.status === 'in_progress').length}
              </p>
            </div>
            <Play className="text-orange-600" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completate</p>
              <p className="text-2xl font-bold text-green-600">
                {schedules.filter(s => s.status === 'completed').length}
              </p>
            </div>
            <CheckCircle className="text-green-600" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Resa Totale</p>
              <p className="text-2xl font-bold text-purple-600">
                {schedules.reduce((sum, s) => sum + (s.actualYieldKg || 0), 0)} kg
              </p>
            </div>
            <Scale className="text-purple-600" size={24} />
          </div>
        </div>
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
                  ? 'bg-green-600 text-white' 
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
          <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {schedules.length === 0 ? 'Nessun programma di raccolta' : 'Nessun programma trovato'}
          </h3>
          <p className="text-gray-600 mb-4">
            {schedules.length === 0 
              ? 'Inizia creando il primo programma di raccolta per il frutteto'
              : 'Prova a modificare i filtri per vedere altri programmi'
            }
          </p>
          {schedules.length === 0 && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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
                  <div className="text-2xl">{getHarvestTypeIcon(schedule.harvestType)}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{schedule.name}</h3>
                    <p className="text-sm text-gray-600">{schedule.variety}</p>
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
                    {format(new Date(schedule.estimatedStartDate), 'dd MMM yyyy', { locale: it })}
                    {schedule.estimatedEndDate && 
                      ` - ${format(new Date(schedule.estimatedEndDate), 'dd MMM yyyy', { locale: it })}`
                    }
                  </span>
                </div>

                {schedule.estimatedYieldKg && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Scale size={14} />
                    <span>Resa stimata: {schedule.estimatedYieldKg} kg</span>
                  </div>
                )}

                {schedule.targetMarket && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Package size={14} />
                    <span>
                      Mercato: {schedule.targetMarket === 'fresh' ? 'Fresco' :
                              schedule.targetMarket === 'processing' ? 'Industria' :
                              schedule.targetMarket === 'export' ? 'Export' :
                              schedule.targetMarket === 'local' ? 'Locale' :
                              getMarketLabel(schedule.targetMarket)}
                          </span>
                        </div>
                )}

                {schedule.expectedPricePerKg && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <DollarSign size={14} />
                    <span>Prezzo: €{schedule.expectedPricePerKg}/kg</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Truck size={14} />
                  <span>
                    Metodo: {schedule.harvestMethod === 'manual' ? 'Manuale' :
                            schedule.harvestMethod === 'mechanical' ? 'Meccanico' :
                            schedule.harvestMethod === 'selective' ? 'Selettivo' : 'Strip Picking'}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Progresso</span>
                  <span className="font-medium">{schedule.completionPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${schedule.completionPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Results (if completed) */}
              {schedule.status === 'completed' && schedule.actualYieldKg && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-green-600">Raccolto:</span>
                      <div className="font-medium text-green-900">{schedule.actualYieldKg} kg</div>
                    </div>
                    {schedule.totalRevenue && (
                      <div>
                        <span className="text-green-600">Ricavo:</span>
                        <div className="font-medium text-green-900">€{schedule.totalRevenue}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Quality Distribution */}
              {schedule.qualityDistribution && (
                <div className="mb-4">
                  <div className="text-xs text-gray-600 mb-2">Distribuzione Qualità:</div>
                  <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-gray-200">
                    <div 
                      className="bg-green-600" 
                      style={{ width: `${schedule.qualityDistribution.premium}%` }}
                      title={`Premium: ${schedule.qualityDistribution.premium}%`}
                    ></div>
                    <div 
                      className="bg-blue-600" 
                      style={{ width: `${schedule.qualityDistribution.first}%` }}
                      title={`Prima: ${schedule.qualityDistribution.first}%`}
                    ></div>
                    <div 
                      className="bg-yellow-600" 
                      style={{ width: `${schedule.qualityDistribution.second}%` }}
                      title={`Seconda: ${schedule.qualityDistribution.second}%`}
                    ></div>
                    <div 
                      className="bg-orange-600" 
                      style={{ width: `${schedule.qualityDistribution.processing}%` }}
                      title={`Industria: ${schedule.qualityDistribution.processing}%`}
                    ></div>
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
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <Eye size={14} />
                  Dettagli
                </button>
                {schedule.status === 'planned' && (
                  <button className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                    <Play size={14} />
                  </button>
                )}
                {schedule.status === 'in_progress' && (
                  <button className="px-3 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors">
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
        <CreateHarvestScheduleModal
          orchardId={orchardId}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateSchedule}
        />
      )}

      {/* Schedule Detail Modal */}
      {showScheduleModal && selectedSchedule && (
        <HarvestScheduleDetailModal
          schedule={selectedSchedule}
          gardenId={gardenId}
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

// Create Harvest Schedule Modal
interface CreateHarvestScheduleModalProps {
  orchardId: string
  onClose: () => void
  onCreate: (schedule: Omit<HarvestSchedule, 'id' | 'createdAt' | 'updatedAt'>) => void
}

function CreateHarvestScheduleModal({ orchardId, onClose, onCreate }: CreateHarvestScheduleModalProps) {
  const [formData, setFormData] = useState<Partial<HarvestSchedule>>({
    orchardId,
    name: '',
    variety: '',
    harvestType: 'commercial',
    estimatedStartDate: '',
    harvestMethod: 'manual',
    targetMarket: 'fresh',
    status: 'planned',
    completionPercentage: 0
  })

  const harvestTypes: { value: HarvestType; label: string; description: string }[] = [
    { value: 'commercial', label: 'Commerciale', description: 'Raccolta principale per la vendita' },
    { value: 'thinning', label: 'Diradamento', description: 'Rimozione frutti per migliorare qualità' },
    { value: 'sampling', label: 'Campionamento', description: 'Raccolta di campioni per analisi' },
    { value: 'quality_test', label: 'Test Qualità', description: 'Verifica maturazione e qualità' }
  ]

  const harvestMethods: { value: HarvestMethod; label: string }[] = [
    { value: 'manual', label: 'Manuale' },
    { value: 'mechanical', label: 'Meccanico' },
    { value: 'selective', label: 'Selettivo' },
    { value: 'strip_picking', label: 'Strip Picking' }
  ]

  const targetMarkets: { value: TargetMarket; label: string }[] = [
    { value: 'fresh', label: 'Fresco' },
    { value: 'processing', label: 'Industria' },
    { value: 'export', label: 'Export' },
    { value: 'local', label: 'Locale' },
    { value: 'premium', label: 'Premium' },
    { value: 'organic', label: 'Biologico' }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCreate(formData as Omit<HarvestSchedule, 'id' | 'createdAt' | 'updatedAt'>)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex-shrink-0 bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Nuovo Programma Raccolta</h2>
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="es. Raccolta Mele 2026"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Varietà *
              </label>
              <input
                type="text"
                required
                value={formData.variety}
                onChange={(e) => setFormData(prev => ({ ...prev, variety: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="es. Golden Delicious"
              />
            </div>
          </div>

          {/* Type and Method */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo Raccolta *
              </label>
              <select
                required
                value={formData.harvestType}
                onChange={(e) => setFormData(prev => ({ ...prev, harvestType: e.target.value as HarvestType }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                {harvestTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Metodo Raccolta *
              </label>
              <select
                required
                value={formData.harvestMethod}
                onChange={(e) => setFormData(prev => ({ ...prev, harvestMethod: e.target.value as HarvestMethod }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                {harvestMethods.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Timing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Inizio Stimata *
              </label>
              <input
                type="date"
                required
                value={formData.estimatedStartDate}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedStartDate: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Fine Stimata
              </label>
              <input
                type="date"
                value={formData.estimatedEndDate || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedEndDate: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Estimates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alberi Stimati
              </label>
              <input
                type="number"
                value={formData.estimatedTrees || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedTrees: parseInt(e.target.value) || undefined }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="0"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resa Stimata (kg)
              </label>
              <input
                type="number"
                value={formData.estimatedYieldKg || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedYieldKg: parseFloat(e.target.value) || undefined }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="0"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prezzo Atteso (€/kg)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.expectedPricePerKg || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, expectedPricePerKg: parseFloat(e.target.value) || undefined }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="0.00"
                min="0"
              />
            </div>
          </div>

          {/* Market and Logistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mercato Target
              </label>
              <select
                value={formData.targetMarket}
                onChange={(e) => setFormData(prev => ({ ...prev, targetMarket: e.target.value as TargetMarket }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                {targetMarkets.map((market) => (
                  <option key={market.value} value={market.value}>
                    {market.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contenitori Necessari
              </label>
              <input
                type="number"
                value={formData.containersNeeded || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, containersNeeded: parseInt(e.target.value) || undefined }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          {/* Storage and Transport */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requisiti Conservazione
              </label>
              <textarea
                value={formData.storageRequirements || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, storageRequirements: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                rows={3}
                placeholder="Temperatura, umidità, atmosfera controllata..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organizzazione Trasporto
              </label>
              <textarea
                value={formData.transportArrangements || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, transportArrangements: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                rows={3}
                placeholder="Mezzi di trasporto, orari, destinazioni..."
              />
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              rows={4}
              placeholder="Istruzioni dettagliate per la raccolta..."
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
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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
interface HarvestScheduleDetailModalProps {
  schedule: HarvestSchedule
  gardenId: string
  onClose: () => void
  onUpdate: (schedule: HarvestSchedule) => void
}

function HarvestScheduleDetailModal({ schedule, gardenId, onClose, onUpdate }: HarvestScheduleDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'progress' | 'records' | 'quality'>('details')
  const [records, setRecords] = useState<TreeHarvestRecord[]>([])

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex-shrink-0 bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{schedule.name}</h2>
            <p className="text-green-100">{schedule.variety}</p>
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
                ? 'text-green-600 border-b-2 border-green-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Dettagli
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'progress' 
                ? 'text-green-600 border-b-2 border-green-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Progresso
          </button>
          <button
            onClick={() => setActiveTab('quality')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'quality' 
                ? 'text-green-600 border-b-2 border-green-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Qualità
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'records' 
                ? 'text-green-600 border-b-2 border-green-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Registrazioni
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'details' && (
            <HarvestDetailsTab schedule={schedule} />
          )}
          {activeTab === 'progress' && (
            <HarvestProgressTab schedule={schedule} />
          )}
          {activeTab === 'quality' && (
            <HarvestQualityTab schedule={schedule} gardenId={gardenId} />
          )}
          {activeTab === 'records' && (
            <HarvestRecordsTab schedule={schedule} records={records} />
          )}
        </div>
      </div>
    </div>
  )
}

// Harvest Details Tab
function HarvestDetailsTab({ schedule }: { schedule: HarvestSchedule }) {
  const getMarketLabel = (market?: TargetMarket) => {
    switch (market) {
      case 'fresh': return 'Fresco'
      case 'processing': return 'Industria'
      case 'export': return 'Export'
      case 'local': return 'Locale'
      case 'premium': return 'Alta valorizzazione'
      case 'organic': return 'Biologico'
      default: return 'Non definito'
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Informazioni Generali</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Periodo Stimato</label>
            <p className="text-gray-900">
              {format(new Date(schedule.estimatedStartDate), 'dd MMMM yyyy', { locale: it })}
              {schedule.estimatedEndDate && 
                ` - ${format(new Date(schedule.estimatedEndDate), 'dd MMMM yyyy', { locale: it })}`
              }
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Metodo Raccolta</label>
            <p className="text-gray-900">
              {schedule.harvestMethod === 'manual' ? 'Manuale' :
               schedule.harvestMethod === 'mechanical' ? 'Meccanico' :
               schedule.harvestMethod === 'selective' ? 'Selettivo' : 'Strip Picking'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mercato Target</label>
            <p className="text-gray-900">
              {getMarketLabel(schedule.targetMarket)}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Stime e Logistica</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alberi Stimati</label>
            <p className="text-gray-900">{schedule.estimatedTrees || 'Non specificato'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resa Stimata</label>
            <p className="text-gray-900">{schedule.estimatedYieldKg || 'Non specificato'} kg</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prezzo Atteso</label>
            <p className="text-gray-900">
              {schedule.expectedPricePerKg ? `€${schedule.expectedPricePerKg}/kg` : 'Non specificato'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contenitori</label>
            <p className="text-gray-900">{schedule.containersNeeded || 'Non specificato'}</p>
          </div>
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

// Harvest Progress Tab
function HarvestProgressTab({ schedule }: { schedule: HarvestSchedule }) {
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
          <div className="text-sm text-green-600 mb-1">Raccolto Attuale</div>
          <div className="text-3xl font-bold text-green-900">{schedule.actualYieldKg || 0} kg</div>
          <div className="text-sm text-green-600">
            di {schedule.estimatedYieldKg || '?'} kg stimati
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <div className="text-sm text-purple-600 mb-1">Ricavo</div>
          <div className="text-3xl font-bold text-purple-900">€{schedule.totalRevenue || 0}</div>
          <div className="text-sm text-purple-600">
            Prezzo medio: €{schedule.actualPricePerKg || 0}/kg
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
                <div className="font-medium text-gray-900">Inizio Raccolta</div>
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

// Harvest Quality Tab
function HarvestQualityTab({ schedule, gardenId }: { schedule: HarvestSchedule; gardenId: string }) {
  const { storageProvider } = useStorage()
  const [benchmarkSummary, setBenchmarkSummary] = useState<OrchardHarvestBenchmarkSummary | null>(null)

  useEffect(() => {
    let cancelled = false

    const loadBenchmarkSummary = async () => {
      try {
        const benchmark = await resolveAdaptiveQualityPricingBenchmark(storageProvider, gardenId, {
          plantName: schedule.variety,
        })
        const qualityScore = typeof schedule.averageQualityScore === 'number'
          ? Math.round(schedule.averageQualityScore * 10)
          : null
        const adaptivePricing = calculateAdaptiveQualityPrice(schedule.actualPricePerKg || schedule.expectedPricePerKg || 3, {
          qualityScore,
          benchmark,
        })

        if (!cancelled) {
          setBenchmarkSummary({
            benchmark,
            qualityScore,
            status: adaptivePricing.status,
            adjustedPrice: adaptivePricing.adjustedPrice,
            premiumRate: adaptivePricing.premiumRate,
          })
        }
      } catch (error) {
        console.error('Error loading orchard harvest benchmark summary:', error)
        if (!cancelled) {
          setBenchmarkSummary(null)
        }
      }
    }

    void loadBenchmarkSummary()

    return () => {
      cancelled = true
    }
  }, [gardenId, schedule.actualPricePerKg, schedule.averageQualityScore, schedule.expectedPricePerKg, schedule.variety, storageProvider])

  return (
    <div className="space-y-6">
      {benchmarkSummary && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Benchmark Qualità del Sito</h3>
              <p className="text-sm text-gray-600 mt-1">
                Lettura orchard-aware del raccolto rispetto al target reale del sito.
              </p>
            </div>
            <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
              benchmarkSummary.status === 'above_target'
                ? 'bg-green-100 text-green-700'
                : benchmarkSummary.status === 'below_target'
                  ? 'bg-red-100 text-red-700'
                  : benchmarkSummary.status === 'watch'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-600'
            }`}>
              {benchmarkSummary.status === 'above_target'
                ? 'Sopra target'
                : benchmarkSummary.status === 'below_target'
                  ? 'Sotto soglia'
                  : benchmarkSummary.status === 'watch'
                    ? 'In osservazione'
                    : 'Dati parziali'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
              <h4 className="font-semibold text-emerald-900 mb-1">Qualità letta</h4>
              <p className="text-2xl font-bold text-emerald-700">
                {benchmarkSummary.qualityScore !== null ? `${benchmarkSummary.qualityScore}%` : 'n/d'}
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-1">Target / soglia</h4>
              <p className="text-2xl font-bold text-blue-700">
                {benchmarkSummary.benchmark.qualityTargetScore}% / {benchmarkSummary.benchmark.qualityAlertFloorScore}%
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-1">Brix target</h4>
              <p className="text-2xl font-bold text-purple-700">{benchmarkSummary.benchmark.brixTarget}°</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
              <h4 className="font-semibold text-amber-900 mb-1">Prezzo adattivo</h4>
              <p className="text-2xl font-bold text-amber-700">€{benchmarkSummary.adjustedPrice.toFixed(2)}/kg</p>
              <p className="text-xs text-amber-800 mt-1">
                {benchmarkSummary.premiumRate >= 0 ? '+' : ''}{Math.round(benchmarkSummary.premiumRate * 100)}%
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Qualità Media</h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {schedule.averageQualityScore || 0}/10
            </div>
            <div className="text-sm text-gray-600">Score qualità</div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuzione Classi</h3>
          {schedule.qualityDistribution ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Classe alta</span>
                <span className="font-medium text-green-600">{schedule.qualityDistribution.premium}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Prima</span>
                <span className="font-medium text-blue-600">{schedule.qualityDistribution.first}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Seconda</span>
                <span className="font-medium text-yellow-600">{schedule.qualityDistribution.second}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Industria</span>
                <span className="font-medium text-orange-600">{schedule.qualityDistribution.processing}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Scarto</span>
                <span className="font-medium text-red-600">{schedule.qualityDistribution.waste}%</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center">Dati non disponibili</p>
          )}
        </div>
      </div>
    </div>
  )
}

// Harvest Records Tab
function HarvestRecordsTab({ schedule, records }: { schedule: HarvestSchedule; records: TreeHarvestRecord[] }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Registrazioni Raccolta</h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          <Plus size={16} />
          Nuova Registrazione
        </button>
      </div>

      {records.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Nessuna registrazione</h4>
          <p className="text-gray-600 mb-4">Le registrazioni delle raccolte appariranno qui</p>
          <button className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
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
                    {format(new Date(record.harvestDate), 'dd MMM yyyy', { locale: it })}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Raccolto</div>
                  <div className="font-medium">{record.quantityKg} kg</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
