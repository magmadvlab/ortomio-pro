'use client'

import React, { useState, useEffect } from 'react'
import { OrchardConfiguration, OrchardDashboardData, OrchardAlert, UpcomingTask } from '@/types/orchard'
import { orchardService } from '@/services/orchardService'
import { 
  TreePine, 
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
  Calculator
} from 'lucide-react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import DensityCalculator from './DensityCalculator'
import YieldPerTreeTracker from './YieldPerTreeTracker'

interface OrchardDashboardProps {
  gardenId: string
  onCreateOrchard: () => void
  onSelectOrchard: (orchard: OrchardConfiguration) => void
  onOpenTree?: (orchard: OrchardConfiguration, treeId: string) => void
}

type DashboardTab = 'overview' | 'density-calculator' | 'yield-tracker'

export default function OrchardDashboard({ gardenId, onCreateOrchard, onSelectOrchard, onOpenTree }: OrchardDashboardProps) {
  const [orchards, setOrchards] = useState<OrchardConfiguration[]>([])
  const [dashboardData, setDashboardData] = useState<OrchardDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedOrchardId, setSelectedOrchardId] = useState<string>('')
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview')

  useEffect(() => {
    loadData()
  }, [gardenId])

  const loadData = async () => {
    try {
      setLoading(true)
      const [orchardsData, dashData] = await Promise.all([
        orchardService.getOrchardConfigurations(gardenId),
        orchardService.getOrchardDashboardData(gardenId)
      ])
      
      setOrchards(orchardsData)
      setDashboardData(dashData)
      
      if (orchardsData.length > 0 && !selectedOrchardId) {
        setSelectedOrchardId(orchardsData[0].id)
      }
    } catch (error) {
      console.error('Error loading orchard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getOrchardTypeIcon = (type: string) => {
    switch (type) {
      case 'apple': return '🍎'
      case 'pear': return '🍐'
      case 'peach': return '🍑'
      case 'cherry': return '🍒'
      case 'citrus': return '🍊'
      case 'olive': return '🫒'
      case 'walnut': return '🥜'
      case 'mixed': return '🌳'
      default: return '🌳'
    }
  }

  const getOrchardTypeName = (type: string) => {
    switch (type) {
      case 'apple': return 'Meleto'
      case 'pear': return 'Pereto'
      case 'peach': return 'Pescheto'
      case 'cherry': return 'Ceraseto'
      case 'citrus': return 'Agrumeto'
      case 'olive': return 'Oliveto'
      case 'walnut': return 'Noccioleto'
      case 'mixed': return 'Misto'
      default: return 'Frutteto'
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

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'disease': return <Bug size={16} />
      case 'pest': return <Bug size={16} />
      case 'weather': return <Thermometer size={16} />
      case 'harvest_ready': return <Calendar size={16} />
      case 'maintenance': return <Settings size={16} />
      default: return <AlertTriangle size={16} />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const getQualityBenchmarkBadgeClasses = (status?: OrchardDashboardData['qualityBenchmarkStatus']) => {
    switch (status) {
      case 'above_target':
        return 'bg-green-100 text-green-700'
      case 'below_target':
        return 'bg-red-100 text-red-700'
      case 'watch':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const getQualityBenchmarkLabel = (status?: OrchardDashboardData['qualityBenchmarkStatus']) => {
    switch (status) {
      case 'above_target':
        return 'Sopra target'
      case 'below_target':
        return 'Sotto soglia'
      case 'watch':
        return 'In osservazione'
      default:
        return 'Dati parziali'
    }
  }

  const selectedYieldOrchard = orchards.find((orchard) => orchard.id === selectedOrchardId) || orchards[0] || null

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <TreePine className="mx-auto text-gray-400 mb-4 animate-pulse" size={48} />
          <p className="text-gray-600">Caricamento dashboard frutteto...</p>
        </div>
      </div>
    )
  }

  if (orchards.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <TreePine className="mx-auto text-gray-400 mb-6" size={64} />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Benvenuto nella Gestione Frutteto</h2>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Inizia creando il tuo primo frutteto per gestire alberi, monitorare la salute delle piante 
          e ottimizzare le operazioni colturali.
        </p>
        <button
          onClick={onCreateOrchard}
          className="inline-flex items-center gap-3 px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg font-medium"
        >
          <Plus size={24} />
          Crea Primo Frutteto
        </button>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-2xl mb-2">🌳</div>
            <h3 className="font-semibold text-green-900 mb-1">Gestione Alberi</h3>
            <p className="text-sm text-green-700">Traccia ogni albero individualmente</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-2xl mb-2">📊</div>
            <h3 className="font-semibold text-blue-900 mb-1">Analytics</h3>
            <p className="text-sm text-blue-700">Monitora rese e qualità</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-2xl mb-2">✂️</div>
            <h3 className="font-semibold text-purple-900 mb-1">Operazioni</h3>
            <p className="text-sm text-purple-700">Pianifica potature e raccolte</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Frutteto</h1>
          <p className="text-gray-600">Panoramica completa dei tuoi frutteti</p>
        </div>
        <button
          onClick={onCreateOrchard}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus size={16} />
          Nuovo Frutteto
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'overview'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <BarChart3 size={16} />
            Panoramica
          </button>
          <button
            onClick={() => setActiveTab('density-calculator')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'density-calculator'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Calculator size={16} />
            Calcolo Densità
          </button>
          <button
            onClick={() => setActiveTab('yield-tracker')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'yield-tracker'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Target size={16} />
            Resa per Pianta
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'density-calculator' ? (
        <DensityCalculator />
      ) : activeTab === 'yield-tracker' ? (
        <div className="space-y-4">
          {orchards.length > 1 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleziona frutteto per la vista resa
              </label>
              <select
                value={selectedYieldOrchard?.id || ''}
                onChange={(event) => setSelectedOrchardId(event.target.value)}
                className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                {orchards.map((orchard) => (
                  <option key={orchard.id} value={orchard.id}>
                    {orchard.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <YieldPerTreeTracker 
            orchardId={selectedYieldOrchard?.id || ''}
            orchardName={selectedYieldOrchard?.name}
            onSelectTree={(treeId) => {
              if (selectedYieldOrchard) {
                onOpenTree?.(selectedYieldOrchard, treeId)
              }
            }}
          />
        </div>
      ) : (
        <>
          {/* Quick Stats */}
          {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Frutteti Totali</p>
                <p className="text-3xl font-bold text-gray-900">{dashboardData.totalOrchards}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TreePine className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Alberi Totali</p>
                <p className="text-3xl font-bold text-gray-900">{dashboardData.totalTrees}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Leaf className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Necessitano Attenzione</p>
                <p className="text-3xl font-bold text-orange-600">{dashboardData.treesNeedingAttention}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <AlertTriangle className="text-orange-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Raccolte Prossime</p>
                <p className="text-3xl font-bold text-purple-600">{dashboardData.upcomingHarvests}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Calendar className="text-purple-600" size={24} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Orchards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {orchards.map((orchard) => (
          <div
            key={orchard.id}
            onClick={() => onSelectOrchard(orchard)}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{getOrchardTypeIcon(orchard.orchardType)}</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{orchard.name}</h3>
                  <p className="text-sm text-gray-600">{getOrchardTypeName(orchard.orchardType)}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {orchard.organicCertified && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                    Bio
                  </span>
                )}
                {orchard.precisionManagement && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                    Precision
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {orchard.establishedDate && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={14} />
                  <span>Impianto: {format(new Date(orchard.establishedDate), 'dd MMM yyyy', { locale: it })}</span>
                </div>
              )}

              {orchard.totalAreaSqm && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={14} />
                  <span>Superficie: {orchard.totalAreaSqm} m²</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <TreePine size={14} />
                <span>Alberi: {orchard.totalTrees}</span>
              </div>

              {orchard.mainVarieties && orchard.mainVarieties.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Leaf size={14} />
                  <span>
                    Varietà: {orchard.mainVarieties.slice(0, 2).map(v => v.variety).join(', ')}
                    {orchard.mainVarieties.length > 2 && ` +${orchard.mainVarieties.length - 2}`}
                  </span>
                </div>
              )}
            </div>

            {orchard.description && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 line-clamp-2">{orchard.description}</p>
              </div>
            )}

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Attivo</span>
              </div>
              <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                Gestisci →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts and Tasks */}
      {dashboardData && (dashboardData.criticalAlerts.length > 0 || dashboardData.upcomingTasks.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Critical Alerts */}
          {dashboardData.criticalAlerts.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <AlertTriangle className="text-red-600" size={20} />
                  Avvisi Critici
                </h3>
              </div>
              <div className="p-6 space-y-4">
                {dashboardData.criticalAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`border rounded-lg p-4 ${getAlertColor(alert.severity)}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getAlertIcon(alert.type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">{alert.title}</h4>
                        <p className="text-sm mb-2">{alert.description}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span>Alberi coinvolti: {alert.affectedTrees}</span>
                          {alert.dueDate && (
                            <span>Scadenza: {format(new Date(alert.dueDate), 'dd MMM', { locale: it })}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Tasks */}
          {dashboardData.upcomingTasks.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="text-blue-600" size={20} />
                  Prossimi Interventi
                </h3>
              </div>
              <div className="p-6 space-y-4">
                {dashboardData.upcomingTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg">
                    <div className="flex-shrink-0">
                      {task.type === 'pruning' && <Scissors className="text-orange-600" size={20} />}
                      {task.type === 'harvest' && <Calendar className="text-green-600" size={20} />}
                      {task.type === 'treatment' && <Droplets className="text-blue-600" size={20} />}
                      {task.type === 'observation' && <Eye className="text-purple-600" size={20} />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{task.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{format(new Date(task.dueDate), 'dd MMM yyyy', { locale: it })}</span>
                        <span>{task.estimatedDuration}h</span>
                        <span className={getPriorityColor(task.priority)}>
                          {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Bassa'}
                        </span>
                      </div>
                    </div>
                    <button className="text-green-600 hover:text-green-700 text-sm">
                      Dettagli
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Activities */}
      {dashboardData && dashboardData.recentActivities.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Activity className="text-green-600" size={20} />
              Attività Recenti
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {dashboardData.recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    {activity.type === 'harvest' && <Calendar className="text-green-600" size={16} />}
                    {activity.type === 'pruning' && <Scissors className="text-orange-600" size={16} />}
                    {activity.type === 'treatment' && <Droplets className="text-blue-600" size={16} />}
                    {activity.type === 'planting' && <TreePine className="text-green-600" size={16} />}
                    {activity.type === 'observation' && <Eye className="text-purple-600" size={16} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-600 mt-1">
                      <span>{format(new Date(activity.date), 'dd MMM yyyy', { locale: it })}</span>
                      {activity.treeNumber && <span>Albero: {activity.treeNumber}</span>}
                      {activity.variety && <span>{activity.variety}</span>}
                      {activity.quantityKg && <span>{activity.quantityKg} kg</span>}
                      {activity.operator && <span>Op: {activity.operator}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      {dashboardData && (
        <div className="space-y-6">
          {typeof dashboardData.qualityTargetScore === 'number' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Benchmark Qualità Frutteto</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    La qualità orchard viene letta rispetto alla memoria reale del sito, non solo su classi statiche.
                  </p>
                </div>
                <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getQualityBenchmarkBadgeClasses(dashboardData.qualityBenchmarkStatus)}`}>
                  {getQualityBenchmarkLabel(dashboardData.qualityBenchmarkStatus)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                  <div className="text-sm text-emerald-800">Qualità letta</div>
                  <div className="text-2xl font-bold text-emerald-700">
                    {typeof dashboardData.adaptiveQualityScore === 'number' ? `${dashboardData.adaptiveQualityScore}%` : 'n/d'}
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="text-sm text-blue-800">Target / soglia</div>
                  <div className="text-2xl font-bold text-blue-700">
                    {dashboardData.qualityTargetScore}% / {dashboardData.qualityAlertFloorScore ?? 'n/d'}%
                  </div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <div className="text-sm text-orange-800">Redditività</div>
                  <div className="text-2xl font-bold text-orange-700">{dashboardData.profitabilityScore}</div>
                  <div className="text-sm text-orange-700">Score su 100</div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-green-900">Salute Alberi</h4>
                <CheckCircle className="text-green-600" size={20} />
              </div>
              <div className="text-3xl font-bold text-green-900 mb-2">
                {dashboardData.healthyTreesPercentage}%
              </div>
              <p className="text-sm text-green-700">Alberi in salute</p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-blue-900">Resa Media</h4>
                <TrendingUp className="text-blue-600" size={20} />
              </div>
              <div className="text-3xl font-bold text-blue-900 mb-2">
                {dashboardData.averageYieldPerTree} kg
              </div>
              <p className="text-sm text-blue-700">Per albero</p>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-purple-900">Produzione Anno</h4>
                <BarChart3 className="text-purple-600" size={20} />
              </div>
              <div className="text-3xl font-bold text-purple-900 mb-2">
                {dashboardData.totalYieldThisYear} kg
              </div>
              <p className="text-sm text-purple-700">Totale raccolto</p>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-orange-900">Redditività</h4>
                <Target className="text-orange-600" size={20} />
              </div>
              <div className="text-3xl font-bold text-orange-900 mb-2">
                {dashboardData.profitabilityScore}
              </div>
              <p className="text-sm text-orange-700">Score su 100</p>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  )
}
