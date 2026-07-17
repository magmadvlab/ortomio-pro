/**
 * Continuous Monitoring Dashboard
 * Dashboard per il monitoraggio continuo delle piante
 * 
 * Funzionalità:
 * - Vista in tempo reale dello stato delle piante
 * - Alert e notifiche intelligenti
 * - Controllo parametri critici
 * - Azioni rapide per interventi
 * - Statistiche e trend
 */

'use client'

import React, { useState, useEffect } from 'react'
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Droplets,
  Leaf,
  Thermometer,
  Zap,
  Bell,
  BellOff,
  Settings,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  Play,
  Pause,
  RefreshCw,
  Filter,
  Search,
  BarChart3,
  MapPin,
  Calendar,
  User,
  AlertCircle,
  Info,
  X,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react'
import { Garden } from '@/types'
import { GardenPlant } from '@/types/individualPlant'
import {
  ContinuousMonitoringService,
  MonitoringAlert,
  PlantHealthStatus,
  MonitoringConfig,
  createMonitoringService
} from '@/services/continuousMonitoringService'
import {
  IntelligentNotification,
  intelligentNotificationService
} from '@/services/intelligentNotificationService'

interface ContinuousMonitoringDashboardProps {
  garden: Garden
  plants: GardenPlant[]
  onNavigate?: (path: string) => void
  onCreateTask?: (taskData: any) => void
  onUpdatePlant?: (plantId: string, updates: any) => void
}

export default function ContinuousMonitoringDashboard({
  garden,
  plants,
  onNavigate,
  onCreateTask,
  onUpdatePlant
}: ContinuousMonitoringDashboardProps) {
  const [monitoringService, setMonitoringService] = useState<ContinuousMonitoringService | null>(null)
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [alerts, setAlerts] = useState<MonitoringAlert[]>([])
  const [plantStatuses, setPlantStatuses] = useState<PlantHealthStatus[]>([])
  const [notifications, setNotifications] = useState<IntelligentNotification[]>([])
  const [stats, setStats] = useState<any>(null)
  const [selectedAlert, setSelectedAlert] = useState<MonitoringAlert | null>(null)
  const [selectedPlant, setSelectedPlant] = useState<PlantHealthStatus | null>(null)
  const [viewMode, setViewMode] = useState<'overview' | 'alerts' | 'plants' | 'notifications'>('overview')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [config, setConfig] = useState<MonitoringConfig | null>(null)

  // Inizializza servizio di monitoraggio
  useEffect(() => {
    const service = createMonitoringService(garden.id, {
      checkIntervalMinutes: 30, // Controllo ogni 30 minuti per demo
      notifications: {
        email: true,
        push: true,
        sms: false,
        immediateForCritical: true
      }
    })
    
    setMonitoringService(service)
    setConfig(service['config']) // Accesso alla config privata per demo
    
    return () => {
      service.stop()
    }
  }, [garden.id])

  // Aggiorna dati periodicamente
  useEffect(() => {
    if (!monitoringService) return

    const updateData = () => {
      setAlerts(monitoringService.getActiveAlerts())
      setPlantStatuses(monitoringService.getAllPlantStatuses())
      setStats(monitoringService.getMonitoringStats())
      setNotifications(intelligentNotificationService.getUserNotifications('current-user'))
    }

    // Aggiornamento iniziale
    updateData()

    // Aggiornamento periodico
    const interval = setInterval(updateData, 30000) // Ogni 30 secondi

    return () => clearInterval(interval)
  }, [monitoringService])

  const handleStartMonitoring = () => {
    if (monitoringService) {
      setIsMonitoring(monitoringService.start())
    }
  }

  const handleStopMonitoring = () => {
    if (monitoringService) {
      monitoringService.stop()
      setIsMonitoring(false)
    }
  }

  const handleResolveAlert = (alertId: string) => {
    if (monitoringService) {
      monitoringService.resolveAlert(alertId)
      setAlerts(monitoringService.getActiveAlerts())
    }
  }

  const handleCreateTaskFromAlert = (alert: MonitoringAlert) => {
    if (onCreateTask && alert.suggestedActions.length > 0) {
      onCreateTask({
        plantName: alert.plantId ? plantStatuses.find(p => p.plantId === alert.plantId)?.plantName : 'Generale',
        taskType: alert.category === 'irrigation' ? 'Watering' : 'Maintenance',
        date: new Date().toISOString().split('T')[0],
        notes: `${alert.title}: ${alert.message}. Azione suggerita: ${alert.suggestedActions[0]}`,
        priority: alert.priority <= 2 ? 'high' : 'medium',
        suggestedBy: 'monitoring_system'
      })
    }
  }

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'text-red-600 bg-red-50 border-red-200'
      case 2: return 'text-orange-600 bg-orange-50 border-orange-200'
      case 3: return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 4: return 'text-blue-600 bg-blue-50 border-blue-200'
      case 5: return 'text-gray-600 bg-gray-50 border-gray-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getHealthStatusColor = (status: PlantHealthStatus['status']) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50 border-green-200'
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'dead': return 'text-gray-600 bg-gray-50 border-gray-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const filteredAlerts = alerts.filter(alert => {
    if (filterCategory !== 'all' && alert.category !== filterCategory) return false
    if (searchQuery && !alert.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !alert.message.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const filteredPlants = plantStatuses.filter(plant => {
    if (searchQuery && !plant.plantName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !plant.plantCode.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header con controlli */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Activity className="text-green-600" size={28} />
              Monitoraggio Continuo
            </h2>
            <p className="text-gray-600 mt-1">
              Sistema di controllo automatico per {garden.name}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="px-4 py-2 bg-green-50 text-green-800 border border-green-200 rounded-lg text-sm font-medium">
              Gestito dal server
            </span>
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Settings size={16} />
              Impostazioni
            </button>
          </div>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${
            isMonitoring ? 'text-green-600 bg-green-50 border-green-200' : 'text-gray-600 bg-gray-50 border-gray-200'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="text-sm font-medium">
              {isMonitoring ? 'Monitoraggio locale attivo' : 'Cron persistente configurato'}
            </span>
          </div>
          
          {stats && (
            <div className="text-sm text-gray-600">
              Ultimo controllo: {new Date(stats.lastCheckTime).toLocaleTimeString('it-IT')}
            </div>
          )}
        </div>
      </div>

      {/* Statistiche rapide */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-red-600" size={20} />
              <div>
                <p className="text-sm text-gray-600">Alert Critici</p>
                <p className="text-2xl font-bold text-red-600">{stats.criticalAlerts}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-orange-600" size={20} />
              <div>
                <p className="text-sm text-gray-600">Warning</p>
                <p className="text-2xl font-bold text-orange-600">{stats.warningAlerts}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <Leaf className="text-green-600" size={20} />
              <div>
                <p className="text-sm text-gray-600">Piante Sane</p>
                <p className="text-2xl font-bold text-green-600">{stats.healthyPlants}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="text-blue-600" size={20} />
              <div>
                <p className="text-sm text-gray-600">Salute Media</p>
                <p className="text-2xl font-bold text-blue-600">{Math.round(stats.averageHealthScore)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation tabs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex gap-6 px-6">
            {[
              { id: 'overview', label: 'Panoramica', icon: Activity },
              { id: 'alerts', label: `Alert (${alerts.length})`, icon: AlertTriangle },
              { id: 'plants', label: `Piante (${plantStatuses.length})`, icon: Leaf },
              { id: 'notifications', label: `Notifiche (${notifications.length})`, icon: Bell }
            ].map(tab => {
              const Icon = tab.icon
              const isActive = viewMode === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setViewMode(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
                    isActive
                      ? 'text-green-600 border-green-600'
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content area */}
        <div className="p-6">
          {/* Overview */}
          {viewMode === 'overview' && (
            <div className="space-y-6">
              {/* Alert critici in evidenza */}
              {alerts.filter(a => a.type === 'critical').length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                    <AlertTriangle size={18} />
                    Alert Critici - Azione Immediata Richiesta
                  </h3>
                  <div className="space-y-2">
                    {alerts.filter(a => a.type === 'critical').slice(0, 3).map(alert => (
                      <div key={alert.id} className="flex items-center justify-between bg-white rounded p-3">
                        <div>
                          <p className="font-medium text-red-800">{alert.title}</p>
                          <p className="text-sm text-red-600">{alert.message}</p>
                        </div>
                        <button
                          onClick={() => handleCreateTaskFromAlert(alert)}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                        >
                          Crea Task
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Piante che richiedono attenzione */}
              {plantStatuses.filter(p => p.status !== 'healthy').length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                    <Leaf size={18} />
                    Piante che Richiedono Attenzione
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {plantStatuses.filter(p => p.status !== 'healthy').slice(0, 4).map(plant => (
                      <div key={plant.plantId} className="bg-white rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{plant.plantCode}</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getHealthStatusColor(plant.status)}`}>
                            {plant.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{plant.plantName}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                plant.healthScore >= 70 ? 'bg-green-500' :
                                plant.healthScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${plant.healthScore}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{plant.healthScore}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Prossime azioni suggerite */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  <Clock size={18} />
                  Prossime Azioni Suggerite
                </h3>
                <div className="space-y-2">
                  {plantStatuses
                    .flatMap(p => p.nextActions.map(action => ({ ...action, plantCode: p.plantCode, plantName: p.plantName })))
                    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                    .slice(0, 5)
                    .map((action, index) => (
                      <div key={index} className="flex items-center justify-between bg-white rounded p-3">
                        <div>
                          <p className="font-medium">{action.action}</p>
                          <p className="text-sm text-gray-600">{action.plantCode} - {action.plantName}</p>
                          <p className="text-xs text-gray-500">
                            Scadenza: {new Date(action.dueDate).toLocaleDateString('it-IT')} • 
                            Durata stimata: {action.estimatedDuration} min
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          action.priority === 'high' ? 'text-red-600 bg-red-50' :
                          action.priority === 'medium' ? 'text-yellow-600 bg-yellow-50' :
                          'text-green-600 bg-green-50'
                        }`}>
                          {action.priority}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Alert tab */}
          {viewMode === 'alerts' && (
            <div className="space-y-4">
              {/* Filtri */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Cerca alert..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">Tutte le categorie</option>
                  <option value="health">Salute</option>
                  <option value="irrigation">Irrigazione</option>
                  <option value="nutrition">Nutrizione</option>
                  <option value="weather">Meteo</option>
                  <option value="pest">Parassiti</option>
                  <option value="disease">Malattie</option>
                </select>
              </div>

              {/* Lista alert */}
              <div className="space-y-3">
                {filteredAlerts.map(alert => (
                  <div key={alert.id} className={`border rounded-lg p-4 ${getPriorityColor(alert.priority)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">{alert.title}</span>
                          <span className="text-xs px-2 py-1 bg-white rounded">
                            {alert.category}
                          </span>
                          <span className="text-xs px-2 py-1 bg-white rounded">
                            Priorità {alert.priority}
                          </span>
                        </div>
                        <p className="text-sm mb-3">{alert.message}</p>
                        
                        {alert.suggestedActions.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs font-medium mb-1">Azioni suggerite:</p>
                            <ul className="text-xs space-y-1">
                              {alert.suggestedActions.map((action, index) => (
                                <li key={index} className="flex items-center gap-1">
                                  <span className="w-1 h-1 bg-current rounded-full" />
                                  {action}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <p className="text-xs opacity-75">
                          Creato: {new Date(alert.createdAt).toLocaleString('it-IT')}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        {alert.actionRequired && (
                          <button
                            onClick={() => handleCreateTaskFromAlert(alert)}
                            className="px-3 py-1 bg-white text-current rounded text-sm hover:bg-opacity-80 transition-colors"
                          >
                            Crea Task
                          </button>
                        )}
                        <button
                          onClick={() => handleResolveAlert(alert.id)}
                          className="px-3 py-1 bg-white text-current rounded text-sm hover:bg-opacity-80 transition-colors"
                        >
                          Risolvi
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredAlerts.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle size={48} className="mx-auto mb-4 text-green-500" />
                    <p className="text-lg font-medium">Nessun alert attivo</p>
                    <p className="text-sm">Tutto sotto controllo! 🌱</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Plants tab */}
          {viewMode === 'plants' && (
            <div className="space-y-4">
              {/* Filtri */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Cerca piante..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Griglia piante */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPlants.map(plant => (
                  <div key={plant.plantId} className={`border rounded-lg p-4 ${getHealthStatusColor(plant.status)}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold">{plant.plantCode}</span>
                      <span className="text-xs px-2 py-1 bg-white rounded">
                        {plant.status}
                      </span>
                    </div>
                    
                    <p className="text-sm mb-3">{plant.plantName}</p>
                    
                    {/* Health score */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs">Salute</span>
                        <span className="text-xs font-medium">{plant.healthScore}/100</span>
                      </div>
                      <div className="w-full bg-white rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            plant.healthScore >= 70 ? 'bg-green-500' :
                            plant.healthScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${plant.healthScore}%` }}
                        />
                      </div>
                    </div>
                    
                    {/* Issues */}
                    {plant.issues.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium mb-1">Problemi:</p>
                        <div className="space-y-1">
                          {plant.issues.slice(0, 2).map((issue, index) => (
                            <div key={index} className="text-xs bg-white rounded p-2">
                              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                                issue.severity === 'high' ? 'bg-red-500' :
                                issue.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                              }`} />
                              {issue.description}
                            </div>
                          ))}
                          {plant.issues.length > 2 && (
                            <p className="text-xs opacity-75">
                              +{plant.issues.length - 2} altri problemi
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Next actions */}
                    {plant.nextActions.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium mb-1">Prossime azioni:</p>
                        <div className="space-y-1">
                          {plant.nextActions.slice(0, 2).map((action, index) => (
                            <div key={index} className="text-xs bg-white rounded p-2">
                              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                                action.priority === 'high' ? 'bg-red-500' :
                                action.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                              }`} />
                              {action.action}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <p className="text-xs opacity-75">
                      Ultimo controllo: {new Date(plant.lastChecked).toLocaleString('it-IT')}
                    </p>
                    
                    <button
                      onClick={() => setSelectedPlant(plant)}
                      className="w-full mt-3 px-3 py-1 bg-white text-current rounded text-sm hover:bg-opacity-80 transition-colors"
                    >
                      Dettagli
                    </button>
                  </div>
                ))}
              </div>
              
              {filteredPlants.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Leaf size={48} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium">Nessuna pianta monitorata</p>
                  <p className="text-sm">Aggiungi piante per iniziare il monitoraggio</p>
                </div>
              )}
            </div>
          )}

          {/* Notifications tab */}
          {viewMode === 'notifications' && (
            <div className="space-y-4">
              <div className="space-y-3">
                {notifications.map(notification => (
                  <div key={notification.id} className={`border rounded-lg p-4 ${
                    notification.readAt ? 'bg-gray-50' : 'bg-white'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">{notification.title}</span>
                          {notification.aiGenerated && (
                            <span className="text-xs px-2 py-1 bg-purple-100 text-purple-600 rounded">
                              AI
                            </span>
                          )}
                          <span className={`text-xs px-2 py-1 rounded ${
                            notification.category === 'critical' ? 'bg-red-100 text-red-600' :
                            notification.category === 'operational' ? 'bg-blue-100 text-blue-600' :
                            notification.category === 'informational' ? 'bg-green-100 text-green-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {notification.category}
                          </span>
                        </div>
                        <p className="text-sm mb-3">{notification.message}</p>
                        
                        {notification.actions && notification.actions.length > 0 && (
                          <div className="flex gap-2 mb-3">
                            {notification.actions.map(action => (
                              <button
                                key={action.id}
                                onClick={() => {
                                  if (action.type === 'navigation' && onNavigate) {
                                    onNavigate(action.data.route)
                                  }
                                }}
                                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                              >
                                {action.label}
                              </button>
                            ))}
                          </div>
                        )}
                        
                        <p className="text-xs text-gray-500">
                          {notification.sentAt 
                            ? `Inviata: ${new Date(notification.sentAt).toLocaleString('it-IT')}`
                            : `Programmata: ${new Date(notification.scheduledFor!).toLocaleString('it-IT')}`
                          }
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        {!notification.readAt && (
                          <button
                            onClick={() => intelligentNotificationService.markAsRead(notification.id)}
                            className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 transition-colors"
                          >
                            Segna letta
                          </button>
                        )}
                        <button
                          onClick={() => intelligentNotificationService.dismissNotification(notification.id)}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {notifications.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Bell size={48} className="mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium">Nessuna notifica</p>
                    <p className="text-sm">Le notifiche appariranno qui quando disponibili</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Settings modal */}
      {showSettings && config && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Impostazioni Monitoraggio</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Intervallo controlli (minuti)
                </label>
                <input
                  type="number"
                  min="5"
                  max="1440"
                  value={config.checkIntervalMinutes}
                  onChange={(e) => {
                    const newConfig = { ...config, checkIntervalMinutes: parseInt(e.target.value) }
                    setConfig(newConfig)
                    monitoringService?.updateConfig(newConfig)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notifiche
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.notifications.email}
                      onChange={(e) => {
                        const newConfig = {
                          ...config,
                          notifications: { ...config.notifications, email: e.target.checked }
                        }
                        setConfig(newConfig)
                        monitoringService?.updateConfig(newConfig)
                      }}
                      className="mr-2"
                    />
                    Email
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.notifications.push}
                      onChange={(e) => {
                        const newConfig = {
                          ...config,
                          notifications: { ...config.notifications, push: e.target.checked }
                        }
                        setConfig(newConfig)
                        monitoringService?.updateConfig(newConfig)
                      }}
                      className="mr-2"
                    />
                    Push
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.notifications.immediateForCritical}
                      onChange={(e) => {
                        const newConfig = {
                          ...config,
                          notifications: { ...config.notifications, immediateForCritical: e.target.checked }
                        }
                        setConfig(newConfig)
                        monitoringService?.updateConfig(newConfig)
                      }}
                      className="mr-2"
                    />
                    Immediate per alert critici
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Azioni automatiche
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.autoActions.createTasks}
                      onChange={(e) => {
                        const newConfig = {
                          ...config,
                          autoActions: { ...config.autoActions, createTasks: e.target.checked }
                        }
                        setConfig(newConfig)
                        monitoringService?.updateConfig(newConfig)
                      }}
                      className="mr-2"
                    />
                    Crea task automaticamente
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
