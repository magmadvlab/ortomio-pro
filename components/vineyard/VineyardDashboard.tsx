'use client'

import React, { useState, useEffect } from 'react'
import { VineyardConfiguration, VineyardDashboardData, VineyardAlert, VineyardTask } from '@/types/vineyard'
import { vineyardService } from '@/services/vineyardService'
import { 
  Grape, 
  Plus, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Activity, 
  Scissors, 
  Droplets,
  Bug,
  Thermometer,
  Eye,
  Settings,
  BarChart3,
  MapPin,
  Clock,
  Target,
  Leaf,
  Wine,
  Users,
  Zap
} from 'lucide-react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

interface VineyardDashboardProps {
  gardenId: string
  onCreateVineyard: () => void
  onSelectVineyard: (vineyard: VineyardConfiguration) => void
}

export default function VineyardDashboard({ gardenId, onCreateVineyard, onSelectVineyard }: VineyardDashboardProps) {
  const [vineyards, setVineyards] = useState<VineyardConfiguration[]>([])
  const [dashboardData, setDashboardData] = useState<VineyardDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedVineyardId, setSelectedVineyardId] = useState<string>('')

  useEffect(() => {
    loadData()
  }, [gardenId])

  const loadData = async () => {
    try {
      setLoading(true)
      const [vineyardsData, dashData] = await Promise.all([
        vineyardService.getVineyardConfigurations(gardenId),
        vineyardService.getVineyardDashboardData(gardenId)
      ])
      
      setVineyards(vineyardsData)
      setDashboardData(dashData)
      
      if (vineyardsData.length > 0 && !selectedVineyardId) {
        setSelectedVineyardId(vineyardsData[0].id)
      }
    } catch (error) {
      console.error('Error loading vineyard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getVineyardTypeIcon = (type: string) => {
    switch (type) {
      case 'wine': return '🍷'
      case 'table': return '🍇'
      case 'raisin': return '🫐'
      case 'mixed': return '🍾'
      default: return '🍇'
    }
  }

  const getVineyardTypeName = (type: string) => {
    switch (type) {
      case 'wine': return 'Da Vino'
      case 'table': return 'Da Tavola'
      case 'raisin': return 'Da Uva Passa'
      case 'mixed': return 'Misto'
      default: return 'Vigneto'
    }
  }

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200'
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200'
      case 'low': return 'text-blue-600 bg-blue-100 border-blue-200'
      default: return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'pruning': return <Scissors size={16} />
      case 'harvest': return <Grape size={16} />
      case 'treatment': return <Droplets size={16} />
      case 'observation': return <Eye size={16} />
      case 'canopy_management': return <Leaf size={16} />
      default: return <Activity size={16} />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (vineyards.length === 0) {
    return (
      <div className="text-center p-12">
        <Grape className="mx-auto text-gray-400 mb-4" size={64} />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Nessun Vigneto Configurato
        </h3>
        <p className="text-gray-600 mb-6">
          Inizia creando il tuo primo vigneto professionale
        </p>
        <button
          onClick={onCreateVineyard}
          className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus size={20} />
          Crea Nuovo Vigneto
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con selezione vigneto */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <select
            value={selectedVineyardId}
            onChange={(e) => setSelectedVineyardId(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            {vineyards.map((vineyard) => (
              <option key={vineyard.id} value={vineyard.id}>
                {getVineyardTypeIcon(vineyard.vineyardType)} {vineyard.name}
              </option>
            ))}
          </select>
        </div>
        
        <button
          onClick={onCreateVineyard}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus size={16} />
          Nuovo Vigneto
        </button>
      </div>

      {/* Statistiche principali */}
      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vigneti Totali</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.totalVineyards}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Wine className="text-purple-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Viti Totali</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.totalVines}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Grape className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Viti Sane</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.healthyVinesPercentage}%</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-full">
                <CheckCircle className="text-emerald-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Brix Medio</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.averageBrix}°</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-full">
                <Target className="text-amber-600" size={24} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Metriche di produzione */}
      {dashboardData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="text-blue-600" size={20} />
              Produzione
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Resa Media per Vite</span>
                <span className="font-semibold text-gray-900">{dashboardData.averageYieldPerVine} kg</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Produzione Totale</span>
                <span className="font-semibold text-gray-900">{dashboardData.totalYieldThisYear} kg</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Prossime Vendemmie</span>
                <span className="font-semibold text-gray-900">{dashboardData.upcomingHarvests}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="text-green-600" size={20} />
              Stato Vigneto
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Viti che Necessitano Attenzione</span>
                <span className={`font-semibold ${dashboardData.vinesNeedingAttention > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {dashboardData.vinesNeedingAttention}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${dashboardData.healthyVinesPercentage}%` }}
                />
              </div>
              <div className="text-sm text-gray-600">
                {dashboardData.healthyVinesPercentage}% delle viti sono in buona salute
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Avvisi e attività */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Avvisi critici */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="text-red-600" size={20} />
            Avvisi Critici
          </h3>
          
          {dashboardData?.criticalAlerts && dashboardData.criticalAlerts.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.criticalAlerts.slice(0, 5).map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border ${getAlertColor(alert.severity)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{alert.title}</h4>
                      <p className="text-sm mt-1">{alert.description}</p>
                      {alert.affectedVines > 0 && (
                        <p className="text-xs mt-1">
                          Viti interessate: {alert.affectedVines}
                        </p>
                      )}
                    </div>
                    {alert.dueDate && (
                      <span className="text-xs whitespace-nowrap ml-2">
                        {format(new Date(alert.dueDate), 'dd/MM', { locale: it })}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="mx-auto text-green-500 mb-2" size={32} />
              <p className="text-gray-600">Nessun avviso critico</p>
            </div>
          )}
        </div>

        {/* Attività prossime */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="text-blue-600" size={20} />
            Prossime Attività
          </h3>
          
          {dashboardData?.upcomingTasks && dashboardData.upcomingTasks.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.upcomingTasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-gray-600">
                        {getTaskIcon(task.type)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{task.title}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock size={12} />
                          <span>{format(new Date(task.dueDate), 'dd MMM', { locale: it })}</span>
                          {task.estimatedDuration && (
                            <>
                              <span>•</span>
                              <span>{task.estimatedDuration}h</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      task.priority === 'high' ? 'bg-red-100 text-red-800' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {task.priority === 'high' ? 'Alta' : 
                       task.priority === 'medium' ? 'Media' : 'Bassa'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-gray-600">Nessuna attività programmata</p>
            </div>
          )}
        </div>
      </div>

      {/* Lista vigneti */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Grape className="text-purple-600" size={20} />
            I Tuoi Vigneti
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {vineyards.map((vineyard) => (
            <div
              key={vineyard.id}
              className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onSelectVineyard(vineyard)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">
                    {getVineyardTypeIcon(vineyard.vineyardType)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {vineyard.name}
                      </h4>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                        {getVineyardTypeName(vineyard.vineyardType)}
                      </span>
                      {vineyard.organicCertified && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          Biologico
                        </span>
                      )}
                    </div>
                    
                    {vineyard.description && (
                      <p className="text-gray-600 mb-3">{vineyard.description}</p>
                    )}
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {vineyard.establishedDate && (
                        <div>
                          <span className="text-gray-500">Impianto:</span>
                          <div className="font-medium">
                            {format(new Date(vineyard.establishedDate), 'yyyy', { locale: it })}
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <span className="text-gray-500">Viti:</span>
                        <div className="font-medium">{vineyard.totalVines}</div>
                      </div>
                      
                      {vineyard.totalAreaSqm && (
                        <div>
                          <span className="text-gray-500">Superficie:</span>
                          <div className="font-medium">
                            {vineyard.totalAreaSqm > 10000 
                              ? `${(vineyard.totalAreaSqm / 10000).toFixed(1)} ha`
                              : `${vineyard.totalAreaSqm} m²`
                            }
                          </div>
                        </div>
                      )}
                      
                      {vineyard.mainVarieties && vineyard.mainVarieties.length > 0 && (
                        <div>
                          <span className="text-gray-500">Varietà:</span>
                          <div className="font-medium">
                            {vineyard.mainVarieties.length === 1 
                              ? vineyard.mainVarieties[0].variety
                              : `${vineyard.mainVarieties.length} varietà`
                            }
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {vineyard.precisionManagement && (
                    <div className="p-2 bg-blue-100 rounded-full" title="Gestione di Precisione">
                      <Zap className="text-blue-600" size={16} />
                    </div>
                  )}
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectVineyard(vineyard)
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <Settings size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Attività recenti */}
      {dashboardData?.recentActivities && dashboardData.recentActivities.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="text-gray-600" size={20} />
            Attività Recenti
          </h3>
          
          <div className="space-y-3">
            {dashboardData.recentActivities.slice(0, 10).map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg"
              >
                <div className="text-gray-600">
                  {getTaskIcon(activity.type)}
                </div>
                
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{activity.description}</div>
                  <div className="text-sm text-gray-600 flex items-center gap-2">
                    <span>{format(new Date(activity.date), 'dd MMM yyyy', { locale: it })}</span>
                    {activity.vineNumber && (
                      <>
                        <span>•</span>
                        <span>Vite {activity.vineNumber}</span>
                      </>
                    )}
                    {activity.variety && (
                      <>
                        <span>•</span>
                        <span>{activity.variety}</span>
                      </>
                    )}
                  </div>
                </div>
                
                {activity.quantityKg && (
                  <div className="text-right">
                    <div className="font-medium text-gray-900">{activity.quantityKg} kg</div>
                    {activity.brixLevel && (
                      <div className="text-sm text-gray-600">{activity.brixLevel}° Brix</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}