'use client'

import React, { useState, useEffect } from 'react'
import { Garden, GardenTask } from '@/types'
import { HealthAlert } from '@/types/healthAlert'
import { HealthAlertSystem } from './HealthAlertSystem'
import { PlantHealthStatus } from './PlantHealthStatus'
import { QuickDiagnosis } from './QuickDiagnosis'
import { AlertCard } from './AlertCard'
import { AlertTriangle, Heart, Camera, Sparkles, Activity } from 'lucide-react'
import { ContextualTip } from '@/components/shared/ContextualTip'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { checkHealthAlerts } from '@/services/healthAlertEngine'

interface HealthDashboardProps {
  garden: Garden
  tasks: GardenTask[]
}

export function HealthDashboard({ garden, tasks }: HealthDashboardProps) {
  const [alerts, setAlerts] = useState<any[]>([]) // Old system alerts
  const [healthAlerts, setHealthAlerts] = useState<HealthAlert[]>([]) // New system alerts
  const [loading, setLoading] = useState(true)
  const [weather, setWeather] = useState<{ temp: number; rainMm: number; condition: string } | null>(null)
  const { storageProvider } = useStorage()

  // Carica health alerts dal database
  const loadHealthAlerts = async () => {
    try {
      if (storageProvider && 'getHealthAlerts' in storageProvider) {
        const alerts = await storageProvider.getHealthAlerts(garden.id)
        setHealthAlerts(alerts.filter((a: HealthAlert) => !a.resolved))
      }
    } catch (error) {
      // Solo logga l'errore se non è un errore di "nessun dato trovato"
      if (error instanceof Error && !error.message.includes('not found')) {
        console.error('Failed to load health alerts:', error)
      }
      // In caso di errore, imposta array vuoto
      setHealthAlerts([])
    }
  }

  // Gestisci risoluzione alert
  const handleResolveAlert = async (alertId: string) => {
    try {
      if (storageProvider && 'updateHealthAlert' in storageProvider) {
        await storageProvider.updateHealthAlert(alertId, {
          resolved: true,
          resolvedAt: new Date().toISOString()
        })
        await loadHealthAlerts()
      }
    } catch (error) {
      console.error('Failed to resolve alert:', error)
    }
  }

  useEffect(() => {
    // Gli alert vengono caricati da HealthAlertSystem
    setLoading(false)
    loadHealthAlerts()

    // Carica meteo se disponibili coordinate
    const fetchWeather = async () => {
      if (!garden.coordinates) return

      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${garden.coordinates.latitude}&longitude=${garden.coordinates.longitude}&current_weather=true&daily=precipitation_sum&timezone=auto`
        )
        const data = await response.json()
        if (data.current_weather && data.daily) {
          const condition = data.current_weather.weathercode <= 3 ? 'Sereno' :
                           data.current_weather.weathercode <= 48 ? 'Nuvoloso' :
                           data.current_weather.weathercode <= 65 ? 'Pioggia' : 'Brutto'

          setWeather({
            temp: data.current_weather.temperature,
            rainMm: data.daily.precipitation_sum[0] || 0,
            condition
          })
        }
      } catch (error) {
        console.error('Weather fetch failed:', error)
      }
    }

    fetchWeather()
  }, [garden, tasks, garden.coordinates])
  
  // Filtra alert per priorità
  const criticalAlerts = alerts.filter(a => a.severity === 'critical')
  const highAlerts = alerts.filter(a => a.severity === 'high')
  const mediumAlerts = alerts.filter(a => a.severity === 'medium')
  
  // Calcola stato generale
  const activePlants = tasks.filter(t => !t.completed && (t.taskType === 'Sowing' || t.taskType === 'Transplant'))
  const healthyCount = activePlants.length - (highAlerts.length + criticalAlerts.length)
  const needsAttentionCount = highAlerts.length + criticalAlerts.length
  
  const getGeneralStatus = () => {
    if (needsAttentionCount === 0 && activePlants.length > 0) return { emoji: '😊', label: 'Buono', color: 'green' }
    if (needsAttentionCount <= 2) return { emoji: '🙂', label: 'Discreto', color: 'yellow' }
    return { emoji: '😟', label: 'Attenzione', color: 'orange' }
  }
  
  const generalStatus = getGeneralStatus()
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-4 space-y-6">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10 relative -mx-4 -mt-4 mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">💚 Salute Orto</h1>
          <ContextualTip
            id="health-intro"
            title="Monitora la salute del tuo orto"
            message="Questa sezione ti aiuta a identificare problemi proattivamente e a mantenere le tue piante in salute. Usa la diagnosi rapida per analizzare foto delle piante."
            position="bottom"
          />
        </div>
      </header>

      {/* WIDGET METEO PROATTIVO */}
      {weather && (
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-medium opacity-90">Condizioni Oggi</h3>
              <p className="text-2xl font-bold">{weather.condition}</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{weather.temp.toFixed(0)}°</div>
              <p className="text-xs opacity-90">Pioggia: {weather.rainMm}mm</p>
            </div>
          </div>

          {/* Alert meteo proattivi */}
          {weather.rainMm > 5 && (
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 mt-3">
              <p className="text-sm font-medium">⚠️ Pioggia prevista oggi</p>
              <p className="text-xs opacity-90 mt-1">Evita irrigazione, controlla ristagni d'acqua</p>
            </div>
          )}
          {weather.temp > 30 && (
            <div className="bg-orange-500/30 backdrop-blur-sm rounded-lg p-3 mt-3">
              <p className="text-sm font-medium">🌡️ Temperature elevate</p>
              <p className="text-xs opacity-90 mt-1">Aumenta l'irrigazione, proteggi le piantine dal sole diretto</p>
            </div>
          )}
          {weather.temp < 5 && (
            <div className="bg-blue-500/30 backdrop-blur-sm rounded-lg p-3 mt-3">
              <p className="text-sm font-medium">❄️ Rischio gelo</p>
              <p className="text-xs opacity-90 mt-1">Proteggi le piante sensibili con teli o rientrale</p>
            </div>
          )}
        </div>
      )}

      {/* STATO GENERALE */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
        <div className="flex items-center justify-center mb-4">
          <div className="text-center">
            <div className="text-6xl mb-2">{generalStatus.emoji}</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">STATO GENERALE</h2>
            <p className={`text-lg font-semibold ${
              generalStatus.color === 'green' ? 'text-green-600' :
              generalStatus.color === 'yellow' ? 'text-yellow-600' :
              'text-orange-600'
            }`}>
              {generalStatus.label}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              {activePlants.length} piante monitorate
            </p>
          </div>
        </div>
      </div>

      {/* NUOVA SEZIONE: ALERT AUTOMATICI */}
      {healthAlerts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Activity className="text-red-500" size={24} />
              Alert Automatici
              <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-sm rounded-full">
                {healthAlerts.length}
              </span>
            </h2>
          </div>

          <div className="space-y-3">
            {healthAlerts
              .sort((a, b) => {
                // Ordina per severity: critical > warning > info
                const severityOrder = { critical: 0, warning: 1, info: 2 }
                return severityOrder[a.severity] - severityOrder[b.severity]
              })
              .map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onResolve={() => handleResolveAlert(alert.id)}
                  onPlanTask={() => {
                    // TODO: Aprire modal pianifica task collegato all'alert
                    console.log('Plan task for alert:', alert.id)
                  }}
                  onIgnore={() => handleResolveAlert(alert.id)}
                />
              ))}
          </div>
        </div>
      )}

      {/* Messaggio se non ci sono alert */}
      {healthAlerts.length === 0 && (
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
          <div className="text-center">
            <div className="text-4xl mb-2">✅</div>
            <h3 className="text-lg font-bold text-green-900 mb-1">
              Nessun Alert Attivo
            </h3>
            <p className="text-sm text-green-700">
              Il tuo orto è in ottime condizioni! Continua così.
            </p>
          </div>
        </div>
      )}
      
      {/* Alert System */}
      <HealthAlertSystem
        garden={garden}
        tasks={tasks}
        onAlertsChange={setAlerts}
      />
      
      {/* RICHIEDE ATTENZIONE */}
      {(criticalAlerts.length > 0 || highAlerts.length > 0) && (
        <div className="bg-white rounded-xl border-2 border-orange-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="text-orange-600" size={24} />
            <h2 className="text-xl font-bold text-orange-900">
              ⚠️ RICHIEDE ATTENZIONE ({needsAttentionCount})
            </h2>
          </div>
          <div className="space-y-4">
            {[...criticalAlerts, ...highAlerts].map((alert, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border-l-4 border-orange-400 p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">
                      {alert.affectedPlants && alert.affectedPlants.length > 0
                        ? `${alert.affectedPlants[0]} - ${alert.affectedPlants[0]}`
                        : 'Pianta'}
                    </h3>
                    <p className="text-sm font-semibold text-orange-900 mb-2">
                      ⚠️ {alert.message}
                    </p>
                {alert.affectedPlants && alert.affectedPlants.length > 0 && (
                      <p className="text-xs text-gray-600 mb-2">
                    Piante interessate: {alert.affectedPlants.join(', ')}
                  </p>
                )}
                    <div className="bg-white/70 rounded-lg p-3 mt-3">
                      <p className="text-xs font-semibold text-gray-700 mb-1">💡 Consiglio:</p>
                      <p className="text-sm text-gray-900">
                        {alert.action || 'Verifica le condizioni della pianta e agisci tempestivamente.'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                    Segna come risolto
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    Vedi trattamento
                  </button>
                  <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors">
                    Ignora
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* IN SALUTE */}
      {healthyCount > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            ✅ IN SALUTE ({healthyCount})
            </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {activePlants.slice(0, healthyCount).map((task, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center p-3 bg-green-50 rounded-lg border border-green-200"
              >
                <div className="text-2xl mb-1">
                  {task.plantName === 'Pomodoro' ? '🍅' :
                   task.plantName === 'Lattuga' ? '🥬' :
                   task.plantName === 'Basilico' ? '🌿' :
                   task.plantName === 'Zucchine' ? '🥒' :
                   task.plantName === 'Carote' ? '🥕' :
                   task.plantName === 'Peperoncino' ? '🌶️' :
                   task.plantName === 'Cipolla' ? '🧅' :
                   '🌱'}
                </div>
                <div className="text-xs font-medium text-gray-700 text-center">
                  {task.plantName}
                </div>
                <div className="text-xs text-green-600 mt-1">✅</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* HAI UN DUBBIO? */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Camera className="text-purple-600" size={24} />
          <h2 className="text-xl font-bold text-gray-900">📸 HAI UN DUBBIO?</h2>
        </div>
        <p className="text-gray-700 mb-4">
          Scatta una foto e la nostra AI analizzerà la pianta per te
        </p>
      <QuickDiagnosis garden={garden} tasks={tasks} />
      </div>
      
      {/* Medium Priority Alerts (collapsed by default) */}
      {mediumAlerts.length > 0 && (
        <details className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <summary className="cursor-pointer font-semibold text-blue-900 mb-2">
            Informazioni ({mediumAlerts.length})
          </summary>
          <div className="space-y-2 mt-3">
            {mediumAlerts.map((alert, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg border border-blue-200 p-3 text-sm"
              >
                <p className="text-gray-900">{alert.message}</p>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}

