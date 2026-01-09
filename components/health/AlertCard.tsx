'use client'

import React from 'react'
import { HealthAlert } from '@/types/healthAlert'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CheckCircle, Calendar, X, AlertTriangle } from 'lucide-react'

interface AlertCardProps {
  alert: HealthAlert
  onResolve: () => void
  onPlanTask?: () => void
  onIgnore?: () => void
}

export function AlertCard({ alert, onResolve, onPlanTask, onIgnore }: AlertCardProps) {
  // Severity styling
  const severityStyles = {
    critical: {
      border: 'border-l-4 border-red-500',
      bg: 'bg-red-50',
      icon: '🔴',
      textColor: 'text-red-700'
    },
    warning: {
      border: 'border-l-4 border-yellow-500',
      bg: 'bg-yellow-50',
      icon: '⚠️',
      textColor: 'text-yellow-700'
    },
    info: {
      border: 'border-l-4 border-blue-500',
      bg: 'bg-blue-50',
      icon: 'ℹ️',
      textColor: 'text-blue-700'
    }
  }

  // Alert type styling
  const typeIcons = {
    weather: '🌦️',
    water: '💧',
    disease: '🦠',
    pest: '🐛',
    nutrient: '🌿'
  }

  // Source labels
  const sourceLabels = {
    weather_api: 'Meteo',
    task_overdue: 'Task',
    sensor: 'Sensore',
    ai: 'AI',
    seasonal: 'Stagionale'
  }

  const style = severityStyles[alert.severity]

  return (
    <Card className={`${style.border} ${style.bg} shadow-sm hover:shadow-md transition-shadow`}>
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="flex-shrink-0">
              <span className="text-3xl">{style.icon}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className={`font-bold text-lg ${style.textColor}`}>
                  {alert.title}
                </h4>
                <span className="text-sm">
                  {typeIcons[alert.alertType]}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span className="bg-white/60 px-2 py-0.5 rounded">
                  {sourceLabels[alert.source]}
                </span>
                <span className="text-gray-400">•</span>
                <span>
                  {new Date(alert.createdAt).toLocaleDateString('it-IT', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="bg-white/40 p-3 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-800 leading-relaxed">
            {alert.message}
          </p>
        </div>

        {/* Recommendation */}
        {alert.recommendation && (
          <div className="bg-white/60 p-3 rounded-lg border border-gray-200">
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 mt-0.5">
                <span className="text-base">💡</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-700 mb-1">
                  Raccomandazione
                </p>
                <p className="text-sm text-gray-800 leading-relaxed">
                  {alert.recommendation}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Metadata (opzionale, solo per debug o info extra) */}
        {alert.metadata && Object.keys(alert.metadata).length > 0 && (
          <div className="text-xs text-gray-600 bg-white/30 p-2 rounded">
            {alert.metadata.temp && (
              <span className="mr-3">🌡️ {alert.metadata.temp}°C</span>
            )}
            {alert.metadata.humidity && (
              <span className="mr-3">💨 {alert.metadata.humidity}%</span>
            )}
            {alert.metadata.daysSinceLastWatering && (
              <span className="mr-3">
                🚰 {alert.metadata.daysSinceLastWatering} giorni
              </span>
            )}
            {alert.metadata.affectedPlants && Array.isArray(alert.metadata.affectedPlants) && (
              <span>
                🌱 {alert.metadata.affectedPlants.length} piante
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
          <Button
            onClick={onResolve}
            size="sm"
            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle size={16} />
            Risolto
          </Button>

          {onPlanTask && (
            <Button
              onClick={onPlanTask}
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5"
            >
              <Calendar size={16} />
              Pianifica
            </Button>
          )}

          {onIgnore && (
            <Button
              onClick={onIgnore}
              variant="ghost"
              size="sm"
              className="flex items-center gap-1.5 text-gray-600 hover:text-gray-800"
            >
              <X size={16} />
              Ignora
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
