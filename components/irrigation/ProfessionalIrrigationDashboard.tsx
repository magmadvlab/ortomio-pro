'use client'

import React, { useState, useEffect } from 'react'
import { 
  Droplets, 
  MapPin, 
  Settings, 
  BarChart3, 
  Clock, 
  Play, 
  Pause, 
  AlertTriangle,
  TrendingUp,
  Activity,
  Zap,
  Plus,
  RefreshCw
} from 'lucide-react'
import { Garden } from '@/types'
import { 
  IrrigationDashboardData, 
  IrrigationZone, 
  IrrigationLog, 
  IrrigationSchedule,
  IrrigationAlert,
  SystemStatus
} from '@/types/irrigation'
import { advancedIrrigationService } from '@/services/advancedIrrigationService'
import { format, isToday, isTomorrow, parseISO } from 'date-fns'
import { it } from 'date-fns/locale'

interface ProfessionalIrrigationDashboardProps {
  garden: Garden
  onNavigateToZones?: () => void
  onNavigateToSystems?: () => void
  onNavigateToAnalytics?: () => void
  onNavigateToScheduler?: () => void
}

export default function ProfessionalIrrigationDashboard({
  garden,
  onNavigateToZones,
  onNavigateToSystems,
  onNavigateToAnalytics,
  onNavigateToScheduler
}: ProfessionalIrrigationDashboardProps) {
  const [dashboardData, setDashboardData] = useState<IrrigationDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [garden.id])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await advancedIrrigationService.getDashboardData(garden.id)
      setDashboardData(data)
    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError('Errore nel caricamento dei dati del dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    try {
      setRefreshing(true)
      await loadDashboardData()
    } finally {
      setRefreshing(false)
    }
  }

  const handleStartIrrigation = async (zoneId: string, systemId: string) => {
    try {
      // Start a manual irrigation session (30 minutes, 100L default)
      await advancedIrrigationService.startIrrigation(
        zoneId,
        systemId,
        30, // 30 minutes
        100, // 100 liters
        'manual'
      )
      
      // Refresh dashboard data
      await loadDashboardData()
    } catch (err) {
      console.error('Error starting irrigation:', err)
      setError('Errore nell\'avvio dell\'irrigazione')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-100'
      case 'offline': return 'text-red-600 bg-red-100'
      case 'maintenance': return 'text-yellow-600 bg-yellow-100'
      case 'error': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-50 text-red-800'
      case 'high': return 'border-orange-500 bg-orange-50 text-orange-800'
      case 'medium': return 'border-yellow-500 bg-yellow-50 text-yellow-800'
      case 'low': return 'border-blue-500 bg-blue-50 text-blue-800'
      default: return 'border-gray-500 bg-gray-50 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Caricamento dashboard...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Errore di Caricamento</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Riprova
          </button>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <Droplets className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nessun Dato Disponibile</h3>
          <p className="text-gray-600">Configura il tuo primo sistema di irrigazione per iniziare.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Droplets className="text-blue-500" size={28} />
            Dashboard Irrigazione Professionale
          </h2>
          <p className="text-gray-600 mt-1">Monitoraggio e controllo avanzato - {garden.name}</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Aggiorna
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.activeZones}</p>
              <p className="text-sm text-gray-600">Zone Attive</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Settings className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.activeSystems}</p>
              <p className="text-sm text-gray-600">Sistemi Attivi</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.todayIrrigations}</p>
              <p className="text-sm text-gray-600">Irrigazioni Oggi</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
              <Droplets className="w-6 h-6 text-cyan-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{Math.round(dashboardData.weeklyConsumption)}L</p>
              <p className="text-sm text-gray-600">Consumo Settimanale</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {dashboardData.currentAlerts && dashboardData.currentAlerts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-gray-900">Avvisi Sistema</h3>
          </div>
          <div className="space-y-3">
            {dashboardData.currentAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border-l-4 ${getAlertColor(alert.severity)}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{alert.message}</p>
                    <p className="text-sm opacity-75 mt-1">
                      {format(parseISO(alert.createdAt), 'dd MMM yyyy HH:mm', { locale: it })}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAlertColor(alert.severity)}`}>
                    {alert.severity.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              Attività Recente
            </h3>
            <button
              onClick={onNavigateToAnalytics}
              className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              Vedi Tutto
            </button>
          </div>

          {dashboardData.recentLogs && dashboardData.recentLogs.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.recentLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      log.endTime ? 'bg-green-500' : 'bg-blue-500'
                    }`} />
                    <div>
                      <p className="font-medium text-gray-900">
                        {log.irrigationType === 'manual' ? 'Irrigazione Manuale' : 
                         log.irrigationType === 'scheduled' ? 'Irrigazione Programmata' : 
                         'Irrigazione Test'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {format(parseISO(log.startTime), 'dd MMM HH:mm', { locale: it })}
                        {log.actualVolumeLiters && ` • ${Math.round(log.actualVolumeLiters)}L`}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    log.endTime ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {log.endTime ? 'Completata' : 'In Corso'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-gray-600">Nessuna attività recente</p>
            </div>
          )}
        </div>

        {/* Upcoming Schedules */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-500" />
              Prossime Programmazioni
            </h3>
            <button
              onClick={onNavigateToScheduler}
              className="text-sm text-purple-600 hover:text-purple-700 transition-colors"
            >
              Gestisci
            </button>
          </div>

          {dashboardData.upcomingSchedules && dashboardData.upcomingSchedules.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.upcomingSchedules.slice(0, 5).map((schedule) => {
                const nextDate = schedule.nextExecutionDate ? parseISO(schedule.nextExecutionDate) : null
                const isUrgent = nextDate && isToday(nextDate)
                
                return (
                  <div key={schedule.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        isUrgent ? 'bg-orange-500' : 'bg-purple-500'
                      }`} />
                      <div>
                        <p className="font-medium text-gray-900">{schedule.name}</p>
                        <p className="text-sm text-gray-600">
                          {nextDate && format(nextDate, 'dd MMM HH:mm', { locale: it })}
                          {isUrgent && ' • Oggi!'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{schedule.durationMinutes}min</span>
                      <button
                        onClick={() => advancedIrrigationService.executeScheduledIrrigation(schedule.id)}
                        className="p-1 text-purple-600 hover:bg-purple-100 rounded transition-colors"
                        title="Esegui Ora"
                      >
                        <Play size={14} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-gray-600">Nessuna programmazione attiva</p>
              <button
                onClick={onNavigateToScheduler}
                className="mt-2 text-sm text-purple-600 hover:text-purple-700 transition-colors"
              >
                Crea Programmazione
              </button>
            </div>
          )}
        </div>
      </div>

      {/* System Status */}
      {dashboardData.systemStatus && dashboardData.systemStatus.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-500" />
              Stato Sistemi
            </h3>
            <button
              onClick={onNavigateToSystems}
              className="text-sm text-green-600 hover:text-green-700 transition-colors"
            >
              Gestisci Sistemi
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardData.systemStatus.map((system) => (
              <div key={system.systemId} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{system.systemName}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(system.status)}`}>
                    {system.status}
                  </span>
                </div>
                
                <div className="space-y-1 text-sm text-gray-600">
                  {system.currentPressure && (
                    <p>Pressione: {system.currentPressure} bar</p>
                  )}
                  {system.flowRate && (
                    <p>Portata: {system.flowRate} L/h</p>
                  )}
                  {system.lastActivity && (
                    <p>Ultima attività: {format(parseISO(system.lastActivity), 'dd MMM HH:mm', { locale: it })}</p>
                  )}
                </div>

                {system.status === 'online' && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleStartIrrigation('zone-id', system.systemId)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      <Play size={12} />
                      Avvia
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors">
                      <Pause size={12} />
                      Pausa
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-900">Azioni Rapide</h3>
            <p className="text-sm text-blue-700">Gestisci il tuo sistema di irrigazione</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={onNavigateToZones}
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
          >
            <MapPin className="w-6 h-6 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Gestisci Zone</span>
          </button>

          <button
            onClick={onNavigateToSystems}
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
          >
            <Settings className="w-6 h-6 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Configura Sistemi</span>
          </button>

          <button
            onClick={onNavigateToAnalytics}
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
          >
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Analytics</span>
          </button>

          <button
            onClick={onNavigateToScheduler}
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
          >
            <Clock className="w-6 h-6 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Programmazione</span>
          </button>
        </div>
      </div>

      {/* Empty State for New Users */}
      {dashboardData.activeZones === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Droplets className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Benvenuto nel Sistema Irrigazione Professionale
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Configura le tue prime zone di irrigazione per iniziare a monitorare e controllare 
            l'irrigazione del tuo giardino in modo intelligente.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onNavigateToZones}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Crea Prima Zona
            </button>
            <button
              onClick={onNavigateToSystems}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Settings size={20} />
              Configura Sistema
            </button>
          </div>
        </div>
      )}
    </div>
  )
}