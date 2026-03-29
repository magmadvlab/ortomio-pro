'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Garden, GardenTask } from '@/types'
import { plantHealthMonitoringService, HealthAlert } from '@/services/plantHealthMonitoringService'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { 
  AlertTriangle, 
  Camera, 
  UserCheck, 
  Clock,
  ArrowRight,
  Stethoscope,
  Eye,
  Calendar
} from 'lucide-react'

interface HealthAlertsWidgetProps {
  garden: Garden
  maxAlerts?: number
}

export default function HealthAlertsWidget({ garden, maxAlerts = 3 }: HealthAlertsWidgetProps) {
  const router = useRouter()
  const { storageProvider } = useStorage()
  const [alerts, setAlerts] = useState<HealthAlert[]>([])
  const [loading, setLoading] = useState(true)

  const loadHealthAlerts = useCallback(async () => {
    setLoading(true)
    try {
      // Simula caricamento task per analisi
      const tasks: GardenTask[] = [] // In produzione: caricare task reali
      const devices = storageProvider?.getDevices
        ? await storageProvider.getDevices(garden.id).catch(() => [])
        : []
      const healthAlerts = await plantHealthMonitoringService.analyzeGardenHealth(garden, tasks, { devices })
      
      // Ordina per severità e urgenza
      const sortedAlerts = healthAlerts
        .sort((a, b) => {
          const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
          const severityDiff = severityOrder[b.severity] - severityOrder[a.severity]
          if (severityDiff !== 0) return severityDiff
          return a.urgencyDays - b.urgencyDays
        })
        .slice(0, maxAlerts)
      
      setAlerts(sortedAlerts)
    } catch (error) {
      console.error('Error loading health alerts:', error)
      setAlerts([])
    } finally {
      setLoading(false)
    }
  }, [garden, maxAlerts, storageProvider])

  useEffect(() => {
    if (garden?.id) {
      loadHealthAlerts()
    }
  }, [garden?.id, loadHealthAlerts])

  const getSeverityColor = (severity: HealthAlert['severity']) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-blue-600 bg-blue-100'
    }
  }

  const getSeverityIcon = (severity: HealthAlert['severity']) => {
    switch (severity) {
      case 'critical': 
      case 'high': 
        return <AlertTriangle size={16} />
      case 'medium': 
        return <Eye size={16} />
      case 'low': 
        return <Stethoscope size={16} />
    }
  }

  const getUrgencyText = (days: number) => {
    if (days <= 1) return 'Immediato'
    if (days <= 3) return `${days} giorni`
    if (days <= 7) return 'Questa settimana'
    return 'Non urgente'
  }

  const getQuickAction = (alert: HealthAlert) => {
    if (alert.photoRequired) {
      return {
        icon: <Camera size={14} />,
        text: 'Foto AI',
        color: 'bg-blue-600 hover:bg-blue-700'
      }
    }
    if (alert.agronomistConsultation) {
      return {
        icon: <UserCheck size={14} />,
        text: 'Agronomo',
        color: 'bg-green-600 hover:bg-green-700'
      }
    }
    return {
      icon: <Eye size={14} />,
      text: 'Monitora',
      color: 'bg-gray-600 hover:bg-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <Stethoscope className="text-green-600" size={24} />
          <h3 className="text-lg font-semibold text-gray-900">Salute Piante</h3>
        </div>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  if (alerts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <Stethoscope className="text-green-600" size={24} />
          <h3 className="text-lg font-semibold text-gray-900">Salute Piante</h3>
        </div>
        <div className="text-center py-6">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Stethoscope className="text-green-600" size={24} />
          </div>
          <p className="text-green-700 font-medium">Tutte le piante sono in salute! 🌱</p>
          <p className="text-sm text-gray-600 mt-1">Monitoraggio automatico attivo</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Stethoscope className="text-green-600" size={24} />
          <h3 className="text-lg font-semibold text-gray-900">Salute Piante</h3>
        </div>
        
        {alerts.length > 0 && (
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              alerts.some(a => a.severity === 'critical' || a.severity === 'high')
                ? 'bg-red-100 text-red-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {alerts.filter(a => a.severity === 'critical' || a.severity === 'high').length} urgenti
            </span>
          </div>
        )}
      </div>

      {/* Alert List */}
      <div className="space-y-3">
        {alerts.map((alert) => {
          const quickAction = getQuickAction(alert)
          
          return (
            <div key={alert.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* Plant and Severity */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-gray-900 truncate">
                      {alert.plantName}
                    </span>
                    {alert.plantCode && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {alert.plantCode}
                      </span>
                    )}
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                      {getSeverityIcon(alert.severity)}
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>
                  
                  {/* Description */}
                  <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                    {alert.description}
                  </p>
                  
                  {/* Timing */}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>Urgenza: {getUrgencyText(alert.urgencyDays)}</span>
                    </div>
                    <span>
                      {alert.suggestedActions.length} azioni suggerite
                    </span>
                  </div>
                </div>
                
                {/* Quick Action Button */}
                <button
                  onClick={() => {
                    // Trigger quick action based on alert type
                    if (alert.photoRequired) {
                      // Open photo analysis
                      console.log('Open photo analysis for', alert.id)
                    } else if (alert.agronomistConsultation) {
                      // Open agronomist contact
                      console.log('Open agronomist contact for', alert.id)
                    } else {
                      // Open monitoring
                      console.log('Open monitoring for', alert.id)
                    }
                  }}
                  className={`flex items-center gap-2 px-3 py-2 text-white text-sm rounded-lg transition-colors ${quickAction.color}`}
                >
                  {quickAction.icon}
                  <span className="hidden sm:inline">{quickAction.text}</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* View All Button */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={() => router.push('/app/health')}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-green-600 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
        >
          <span>Vedi Monitoraggio Completo</span>
          <ArrowRight size={16} />
        </button>
        
        <button
          onClick={() => router.push('/app/planner')}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Calendar size={16} />
          <span className="hidden sm:inline">Planner</span>
        </button>
      </div>
    </div>
  )
}
