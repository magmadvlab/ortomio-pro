'use client'

import React, { useState, useEffect } from 'react'
import { VineyardPruningType } from '@/types/vineyard'
import { 
  Scissors, 
  Plus, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Users,
  Target,
  Activity,
  Edit,
  Trash2,
  Play,
  Pause,
  Check,
  Eye,
  BarChart3
} from 'lucide-react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

interface VineyardPruningManagerProps {
  vineyardId: string
}

interface PruningSchedule {
  id: string
  name: string
  pruningType: VineyardPruningType
  scheduledStartDate: string
  scheduledEndDate?: string
  estimatedVines: number
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled'
  completionPercentage: number
  actualVinesPruned: number
  estimatedHours: number
  actualHours?: number
}

interface PruningRecord {
  id: string
  vineNumber: string
  pruningDate: string
  pruningType: VineyardPruningType
  operatorName?: string
  durationMinutes?: number
  canesRemoved?: number
  spursLeft?: number
  budsPerVine?: number
  pruningQuality: 'excellent' | 'good' | 'fair' | 'poor'
  notes?: string
}

export default function VineyardPruningManager({ vineyardId }: VineyardPruningManagerProps) {
  const [schedules, setSchedules] = useState<PruningSchedule[]>([])
  const [records, setRecords] = useState<PruningRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'schedules' | 'records' | 'analytics'>('schedules')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState<PruningSchedule | null>(null)

  useEffect(() => {
    loadData()
  }, [vineyardId])

  const loadData = async () => {
    try {
      setLoading(true)
      // Simulazione dati - in produzione verrebbero caricati dal servizio
      setSchedules([
        {
          id: '1',
          name: 'Potatura Invernale 2024',
          pruningType: 'winter',
          scheduledStartDate: '2024-02-01',
          scheduledEndDate: '2024-02-28',
          estimatedVines: 150,
          status: 'in_progress',
          completionPercentage: 65,
          actualVinesPruned: 98,
          estimatedHours: 45,
          actualHours: 32
        },
        {
          id: '2',
          name: 'Potatura Verde Estiva',
          pruningType: 'green',
          scheduledStartDate: '2024-06-15',
          scheduledEndDate: '2024-07-15',
          estimatedVines: 150,
          status: 'planned',
          completionPercentage: 0,
          actualVinesPruned: 0,
          estimatedHours: 25
        }
      ])

      setRecords([
        {
          id: '1',
          vineNumber: 'V001',
          pruningDate: '2024-02-05',
          pruningType: 'winter',
          operatorName: 'Mario Rossi',
          durationMinutes: 25,
          canesRemoved: 8,
          spursLeft: 6,
          budsPerVine: 24,
          pruningQuality: 'excellent',
          notes: 'Vite in ottima salute, potatura standard'
        },
        {
          id: '2',
          vineNumber: 'V002',
          pruningDate: '2024-02-05',
          pruningType: 'winter',
          operatorName: 'Mario Rossi',
          durationMinutes: 30,
          canesRemoved: 10,
          spursLeft: 5,
          budsPerVine: 20,
          pruningQuality: 'good',
          notes: 'Rimossi alcuni tralci danneggiati dal gelo'
        }
      ])
    } catch (error) {
      console.error('Error loading pruning data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPruningTypeLabel = (type: VineyardPruningType) => {
    switch (type) {
      case 'winter': return 'Potatura Invernale'
      case 'summer': return 'Potatura Estiva'
      case 'green': return 'Potatura Verde'
      case 'spur': return 'Potatura a Sperone'
      case 'cane': return 'Potatura a Tralcio'
      case 'renewal': return 'Potatura di Rinnovo'
      default: return 'Potatura'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'text-blue-600 bg-blue-100'
      case 'in_progress': return 'text-orange-600 bg-orange-100'
      case 'completed': return 'text-green-600 bg-green-100'
      case 'cancelled': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'planned': return 'Pianificata'
      case 'in_progress': return 'In Corso'
      case 'completed': return 'Completata'
      case 'cancelled': return 'Annullata'
      default: return status
    }
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-600 bg-green-100'
      case 'good': return 'text-blue-600 bg-blue-100'
      case 'fair': return 'text-yellow-600 bg-yellow-100'
      case 'poor': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getQualityLabel = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'Eccellente'
      case 'good': return 'Buona'
      case 'fair': return 'Discreta'
      case 'poor': return 'Scarsa'
      default: return quality
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Scissors className="text-purple-600" size={28} />
            Gestione Potature
          </h2>
          <p className="text-gray-600">Pianifica e monitora le potature del vigneto</p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus size={16} />
          Nuova Potatura
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('schedules')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'schedules'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Pianificazioni ({schedules.length})
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'records'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Registrazioni ({records.length})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'analytics'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Analisi
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'schedules' && (
        <div className="space-y-4">
          {schedules.length === 0 ? (
            <div className="text-center py-12">
              <Scissors className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nessuna Potatura Pianificata
              </h3>
              <p className="text-gray-600 mb-4">
                Inizia creando la tua prima pianificazione di potatura
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Plus size={20} />
                Crea Prima Potatura
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {schedules.map((schedule) => (
                <div key={schedule.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{schedule.name}</h3>
                      <p className="text-sm text-gray-600">{getPruningTypeLabel(schedule.pruningType)}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(schedule.status)}`}>
                        {getStatusLabel(schedule.status)}
                      </span>
                      
                      <div className="flex items-center gap-1">
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <Edit size={14} />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-red-600">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  {schedule.status === 'in_progress' && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>Progresso</span>
                        <span>{schedule.completionPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${schedule.completionPercentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Dettagli */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Periodo:</span>
                      <div className="font-medium">
                        {format(new Date(schedule.scheduledStartDate), 'dd MMM', { locale: it })}
                        {schedule.scheduledEndDate && (
                          <> - {format(new Date(schedule.scheduledEndDate), 'dd MMM', { locale: it })}</>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-gray-600">Viti:</span>
                      <div className="font-medium">
                        {schedule.actualVinesPruned}/{schedule.estimatedVines}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-gray-600">Ore Stimate:</span>
                      <div className="font-medium">{schedule.estimatedHours}h</div>
                    </div>
                    
                    {schedule.actualHours && (
                      <div>
                        <span className="text-gray-600">Ore Effettive:</span>
                        <div className="font-medium">{schedule.actualHours}h</div>
                      </div>
                    )}
                  </div>

                  {/* Azioni */}
                  <div className="mt-4 flex items-center gap-2">
                    {schedule.status === 'planned' && (
                      <button className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                        <Play size={14} />
                        Inizia
                      </button>
                    )}
                    
                    {schedule.status === 'in_progress' && (
                      <>
                        <button className="flex items-center gap-2 px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700">
                          <Pause size={14} />
                          Pausa
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                          <Check size={14} />
                          Completa
                        </button>
                      </>
                    )}
                    
                    <button
                      onClick={() => setSelectedSchedule(schedule)}
                      className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
                    >
                      <Eye size={14} />
                      Dettagli
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'records' && (
        <div className="space-y-4">
          {records.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nessuna Registrazione
              </h3>
              <p className="text-gray-600">
                Le registrazioni delle potature appariranno qui
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vite
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Operatore
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Durata
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Qualità
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dettagli
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {records.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Scissors className="text-purple-600 mr-2" size={16} />
                            <span className="font-medium text-gray-900">{record.vineNumber}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {format(new Date(record.pruningDate), 'dd/MM/yyyy', { locale: it })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {getPruningTypeLabel(record.pruningType)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.operatorName || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.durationMinutes ? `${record.durationMinutes} min` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getQualityColor(record.pruningQuality)}`}>
                            {getQualityLabel(record.pruningQuality)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="text-gray-600">
                            {record.canesRemoved && <div>Tralci rimossi: {record.canesRemoved}</div>}
                            {record.spursLeft && <div>Speroni: {record.spursLeft}</div>}
                            {record.budsPerVine && <div>Gemme: {record.budsPerVine}</div>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Statistiche generali */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="text-blue-600" size={20} />
              Statistiche Potature
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Viti Potate (Anno)</span>
                <span className="font-semibold text-gray-900">98</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Ore Totali</span>
                <span className="font-semibold text-gray-900">32h</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Tempo Medio per Vite</span>
                <span className="font-semibold text-gray-900">19.6 min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Qualità Media</span>
                <span className="font-semibold text-green-600">Eccellente</span>
              </div>
            </div>
          </div>

          {/* Efficienza operatori */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="text-green-600" size={20} />
              Efficienza Operatori
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <div className="font-medium text-gray-900">Mario Rossi</div>
                  <div className="text-sm text-gray-600">98 viti potate</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">19.6 min/vite</div>
                  <div className="text-sm text-green-600">Eccellente</div>
                </div>
              </div>
            </div>
          </div>

          {/* Distribuzione per tipo */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Distribuzione per Tipo
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Potatura Invernale</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                  <span className="text-sm font-medium">80%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Potatura Verde</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '20%' }}></div>
                  </div>
                  <span className="text-sm font-medium">20%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Trend mensile */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Trend Mensile
            </h3>
            
            <div className="text-center py-8 text-gray-500">
              <BarChart3 size={48} className="mx-auto mb-2 opacity-50" />
              <p>Grafico trend disponibile con più dati</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal dettagli pianificazione */}
      {selectedSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">{selectedSchedule.name}</h2>
                <button
                  onClick={() => setSelectedSchedule(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Informazioni Generali</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Tipo:</span>
                      <span className="ml-2 font-medium">{getPruningTypeLabel(selectedSchedule.pruningType)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Stato:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedSchedule.status)}`}>
                        {getStatusLabel(selectedSchedule.status)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Periodo:</span>
                      <span className="ml-2 font-medium">
                        {format(new Date(selectedSchedule.scheduledStartDate), 'dd MMMM yyyy', { locale: it })}
                        {selectedSchedule.scheduledEndDate && (
                          <> - {format(new Date(selectedSchedule.scheduledEndDate), 'dd MMMM yyyy', { locale: it })}</>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Progresso</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Viti Potate:</span>
                      <span className="ml-2 font-medium">{selectedSchedule.actualVinesPruned}/{selectedSchedule.estimatedVines}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Completamento:</span>
                      <span className="ml-2 font-medium">{selectedSchedule.completionPercentage}%</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Ore Lavorate:</span>
                      <span className="ml-2 font-medium">
                        {selectedSchedule.actualHours || 0}/{selectedSchedule.estimatedHours}h
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}