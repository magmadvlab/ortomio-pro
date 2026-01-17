'use client'

import React, { useState, useEffect } from 'react'
import { VineyardHarvestType } from '@/types/vineyard'
import { 
  Grape, 
  Plus, 
  Calendar, 
  Target, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  BarChart3,
  Thermometer,
  Droplets,
  Edit,
  Trash2,
  Play,
  Check,
  Eye,
  Scale,
  Award,
  Clock
} from 'lucide-react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

interface VineyardHarvestManagerProps {
  vineyardId: string
}

interface HarvestSchedule {
  id: string
  name: string
  variety: string
  harvestType: VineyardHarvestType
  estimatedStartDate: string
  estimatedEndDate?: string
  estimatedVines: number
  estimatedYieldKg: number
  targetBrixMin?: number
  targetBrixMax?: number
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled'
  completionPercentage: number
  actualVinesHarvested: number
  actualYieldKg?: number
  averageBrix?: number
  averageAcidity?: number
  averagePh?: number
}

interface HarvestRecord {
  id: string
  vineNumber: string
  harvestDate: string
  harvestTime?: string
  operatorName?: string
  quantityKg: number
  clusterCount?: number
  brixLevel?: number
  acidityLevel?: number
  phLevel?: number
  berrySize: 'small' | 'medium' | 'large'
  colorIntensity?: number
  rotPercentage?: number
  notes?: string
}

export default function VineyardHarvestManager({ vineyardId }: VineyardHarvestManagerProps) {
  const [schedules, setSchedules] = useState<HarvestSchedule[]>([])
  const [records, setRecords] = useState<HarvestRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'schedules' | 'records' | 'analytics'>('schedules')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState<HarvestSchedule | null>(null)

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
          name: 'Vendemmia Sangiovese 2024',
          variety: 'Sangiovese',
          harvestType: 'wine_harvest',
          estimatedStartDate: '2024-09-15',
          estimatedEndDate: '2024-09-25',
          estimatedVines: 80,
          estimatedYieldKg: 1200,
          targetBrixMin: 22,
          targetBrixMax: 24,
          status: 'planned',
          completionPercentage: 0,
          actualVinesHarvested: 0
        },
        {
          id: '2',
          name: 'Vendemmia Trebbiano 2024',
          variety: 'Trebbiano',
          harvestType: 'wine_harvest',
          estimatedStartDate: '2024-09-05',
          estimatedEndDate: '2024-09-12',
          estimatedVines: 70,
          estimatedYieldKg: 1050,
          targetBrixMin: 19,
          targetBrixMax: 21,
          status: 'completed',
          completionPercentage: 100,
          actualVinesHarvested: 70,
          actualYieldKg: 1180,
          averageBrix: 20.2,
          averageAcidity: 6.8,
          averagePh: 3.2
        }
      ])

      setRecords([
        {
          id: '1',
          vineNumber: 'T001',
          harvestDate: '2024-09-06',
          harvestTime: '07:30',
          operatorName: 'Luigi Bianchi',
          quantityKg: 18.5,
          clusterCount: 24,
          brixLevel: 20.1,
          acidityLevel: 6.9,
          phLevel: 3.2,
          berrySize: 'medium',
          colorIntensity: 7.5,
          rotPercentage: 2,
          notes: 'Ottima qualità, grappoli uniformi'
        },
        {
          id: '2',
          vineNumber: 'T002',
          harvestDate: '2024-09-06',
          harvestTime: '07:45',
          operatorName: 'Luigi Bianchi',
          quantityKg: 16.8,
          clusterCount: 22,
          brixLevel: 20.3,
          acidityLevel: 6.7,
          phLevel: 3.1,
          berrySize: 'medium',
          colorIntensity: 7.8,
          rotPercentage: 1,
          notes: 'Qualità eccellente'
        }
      ])
    } catch (error) {
      console.error('Error loading harvest data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getHarvestTypeLabel = (type: VineyardHarvestType) => {
    switch (type) {
      case 'wine_harvest': return 'Vendemmia per Vino'
      case 'table_grape': return 'Raccolta Uva da Tavola'
      case 'selective_harvest': return 'Vendemmia Selettiva'
      case 'late_harvest': return 'Vendemmia Tardiva'
      case 'ice_wine': return 'Vendemmia per Icewine'
      default: return 'Vendemmia'
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

  const getBrixColor = (brix?: number, targetMin?: number, targetMax?: number) => {
    if (!brix || !targetMin || !targetMax) return 'text-gray-600'
    if (brix >= targetMin && brix <= targetMax) return 'text-green-600'
    if (brix < targetMin) return 'text-orange-600'
    return 'text-red-600'
  }

  const getBerrySize = (size: string) => {
    switch (size) {
      case 'small': return 'Piccolo'
      case 'medium': return 'Medio'
      case 'large': return 'Grande'
      default: return size
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
            <Grape className="text-purple-600" size={28} />
            Gestione Vendemmie
          </h2>
          <p className="text-gray-600">Pianifica e monitora le vendemmie del vigneto</p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus size={16} />
          Nuova Vendemmia
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
            Analisi Qualità
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'schedules' && (
        <div className="space-y-4">
          {schedules.length === 0 ? (
            <div className="text-center py-12">
              <Grape className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nessuna Vendemmia Pianificata
              </h3>
              <p className="text-gray-600 mb-4">
                Inizia creando la tua prima pianificazione di vendemmia
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Plus size={20} />
                Crea Prima Vendemmia
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {schedules.map((schedule) => (
                <div key={schedule.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{schedule.name}</h3>
                      <p className="text-sm text-gray-600">{schedule.variety} - {getHarvestTypeLabel(schedule.harvestType)}</p>
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
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-gray-600">Periodo:</span>
                      <div className="font-medium">
                        {format(new Date(schedule.estimatedStartDate), 'dd MMM', { locale: it })}
                        {schedule.estimatedEndDate && (
                          <> - {format(new Date(schedule.estimatedEndDate), 'dd MMM', { locale: it })}</>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-gray-600">Viti:</span>
                      <div className="font-medium">
                        {schedule.actualVinesHarvested}/{schedule.estimatedVines}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-gray-600">Resa Stimata:</span>
                      <div className="font-medium">{schedule.estimatedYieldKg} kg</div>
                    </div>
                    
                    {schedule.actualYieldKg && (
                      <div>
                        <span className="text-gray-600">Resa Effettiva:</span>
                        <div className="font-medium">{schedule.actualYieldKg} kg</div>
                      </div>
                    )}
                  </div>

                  {/* Target Brix */}
                  {schedule.targetBrixMin && schedule.targetBrixMax && (
                    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <Target className="text-amber-600" size={16} />
                        <span className="text-amber-800">
                          Target Brix: {schedule.targetBrixMin}° - {schedule.targetBrixMax}°
                        </span>
                        {schedule.averageBrix && (
                          <span className={`ml-2 font-medium ${getBrixColor(schedule.averageBrix, schedule.targetBrixMin, schedule.targetBrixMax)}`}>
                            (Attuale: {schedule.averageBrix}°)
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Risultati qualità */}
                  {schedule.status === 'completed' && schedule.averageBrix && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">Risultati Qualità</h4>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-green-700">Brix:</span>
                          <div className="font-medium">{schedule.averageBrix}°</div>
                        </div>
                        {schedule.averageAcidity && (
                          <div>
                            <span className="text-green-700">Acidità:</span>
                            <div className="font-medium">{schedule.averageAcidity} g/L</div>
                          </div>
                        )}
                        {schedule.averagePh && (
                          <div>
                            <span className="text-green-700">pH:</span>
                            <div className="font-medium">{schedule.averagePh}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Azioni */}
                  <div className="flex items-center gap-2">
                    {schedule.status === 'planned' && (
                      <button className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                        <Play size={14} />
                        Inizia
                      </button>
                    )}
                    
                    {schedule.status === 'in_progress' && (
                      <button className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                        <Check size={14} />
                        Completa
                      </button>
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
              <Scale className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nessuna Registrazione
              </h3>
              <p className="text-gray-600">
                Le registrazioni delle vendemmie appariranno qui
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
                        Data/Ora
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Operatore
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantità
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Qualità
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Parametri
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {records.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Grape className="text-purple-600 mr-2" size={16} />
                            <span className="font-medium text-gray-900">{record.vineNumber}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            {format(new Date(record.harvestDate), 'dd/MM/yyyy', { locale: it })}
                            {record.harvestTime && (
                              <div className="text-xs text-gray-500">{record.harvestTime}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.operatorName || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <div className="font-medium">{record.quantityKg} kg</div>
                            {record.clusterCount && (
                              <div className="text-xs text-gray-500">{record.clusterCount} grappoli</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600">Dimensione:</span>
                              <span className="font-medium">{getBerrySize(record.berrySize)}</span>
                            </div>
                            {record.colorIntensity && (
                              <div className="flex items-center gap-2">
                                <span className="text-gray-600">Colore:</span>
                                <span className="font-medium">{record.colorIntensity}/10</span>
                              </div>
                            )}
                            {record.rotPercentage !== undefined && (
                              <div className="flex items-center gap-2">
                                <span className="text-gray-600">Marciume:</span>
                                <span className={`font-medium ${record.rotPercentage > 5 ? 'text-red-600' : 'text-green-600'}`}>
                                  {record.rotPercentage}%
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="space-y-1">
                            {record.brixLevel && (
                              <div className="flex items-center gap-2">
                                <Target className="text-amber-600" size={12} />
                                <span>{record.brixLevel}° Brix</span>
                              </div>
                            )}
                            {record.acidityLevel && (
                              <div className="flex items-center gap-2">
                                <Droplets className="text-blue-600" size={12} />
                                <span>{record.acidityLevel} g/L</span>
                              </div>
                            )}
                            {record.phLevel && (
                              <div className="flex items-center gap-2">
                                <Thermometer className="text-green-600" size={12} />
                                <span>pH {record.phLevel}</span>
                              </div>
                            )}
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
          {/* Statistiche produzione */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="text-blue-600" size={20} />
              Statistiche Produzione
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Viti Vendemmiate</span>
                <span className="font-semibold text-gray-900">70</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Produzione Totale</span>
                <span className="font-semibold text-gray-900">1,180 kg</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Resa Media per Vite</span>
                <span className="font-semibold text-gray-900">16.9 kg</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Efficienza vs Stima</span>
                <span className="font-semibold text-green-600">+12.4%</span>
              </div>
            </div>
          </div>

          {/* Analisi qualità */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="text-green-600" size={20} />
              Analisi Qualità
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Brix Medio</span>
                <span className="font-semibold text-gray-900">20.2°</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Acidità Media</span>
                <span className="font-semibold text-gray-900">6.8 g/L</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">pH Medio</span>
                <span className="font-semibold text-gray-900">3.2</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Marciume Medio</span>
                <span className="font-semibold text-green-600">1.5%</span>
              </div>
            </div>
          </div>

          {/* Distribuzione per varietà */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Distribuzione per Varietà
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Trebbiano</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                  <span className="text-sm font-medium">1,180 kg</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Sangiovese</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                  <span className="text-sm font-medium">Pianificata</span>
                </div>
              </div>
            </div>
          </div>

          {/* Trend temporale */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="text-purple-600" size={20} />
              Timing Vendemmie
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                <div>
                  <div className="font-medium text-gray-900">Trebbiano</div>
                  <div className="text-sm text-gray-600">5-12 Settembre</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600">Completata</div>
                  <div className="text-sm text-gray-600">7 giorni</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                <div>
                  <div className="font-medium text-gray-900">Sangiovese</div>
                  <div className="text-sm text-gray-600">15-25 Settembre</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-blue-600">Pianificata</div>
                  <div className="text-sm text-gray-600">10 giorni</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal dettagli pianificazione */}
      {selectedSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
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
                      <span className="text-gray-600">Varietà:</span>
                      <span className="ml-2 font-medium">{selectedSchedule.variety}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Tipo:</span>
                      <span className="ml-2 font-medium">{getHarvestTypeLabel(selectedSchedule.harvestType)}</span>
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
                        {format(new Date(selectedSchedule.estimatedStartDate), 'dd MMMM yyyy', { locale: it })}
                        {selectedSchedule.estimatedEndDate && (
                          <> - {format(new Date(selectedSchedule.estimatedEndDate), 'dd MMMM yyyy', { locale: it })}</>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Obiettivi Produzione</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Viti Stimate:</span>
                      <span className="ml-2 font-medium">{selectedSchedule.estimatedVines}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Resa Stimata:</span>
                      <span className="ml-2 font-medium">{selectedSchedule.estimatedYieldKg} kg</span>
                    </div>
                    {selectedSchedule.targetBrixMin && selectedSchedule.targetBrixMax && (
                      <div>
                        <span className="text-gray-600">Target Brix:</span>
                        <span className="ml-2 font-medium">
                          {selectedSchedule.targetBrixMin}° - {selectedSchedule.targetBrixMax}°
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedSchedule.status === 'completed' && (
                  <div className="md:col-span-2">
                    <h3 className="font-semibold text-gray-900 mb-3">Risultati Finali</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Viti Raccolte:</span>
                        <div className="font-medium">{selectedSchedule.actualVinesHarvested}</div>
                      </div>
                      {selectedSchedule.actualYieldKg && (
                        <div>
                          <span className="text-gray-600">Resa Effettiva:</span>
                          <div className="font-medium">{selectedSchedule.actualYieldKg} kg</div>
                        </div>
                      )}
                      {selectedSchedule.averageBrix && (
                        <div>
                          <span className="text-gray-600">Brix Medio:</span>
                          <div className="font-medium">{selectedSchedule.averageBrix}°</div>
                        </div>
                      )}
                      {selectedSchedule.averageAcidity && (
                        <div>
                          <span className="text-gray-600">Acidità Media:</span>
                          <div className="font-medium">{selectedSchedule.averageAcidity} g/L</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}