'use client'

import React from 'react'
import { AlertTriangle, Snowflake, CloudRain, Droplets } from 'lucide-react'
import { Card } from '@/components/ui/Card'

interface WeatherAlert {
  type: 'frost' | 'hail' | 'drought' | 'rain'
  severity: 'low' | 'medium' | 'high'
  message: string
  date: Date
}

interface WeatherAlertsProps {
  alerts: WeatherAlert[]
}

export function WeatherAlerts({ alerts }: WeatherAlertsProps) {
  if (alerts.length === 0) {
    return null
  }

  const getAlertIcon = (type: WeatherAlert['type']) => {
    switch (type) {
      case 'frost':
        return <Snowflake className="text-blue-500" size={24} />
      case 'hail':
        return <CloudRain className="text-gray-500" size={24} />
      case 'drought':
        return <Droplets className="text-orange-500" size={24} />
      case 'rain':
        return <CloudRain className="text-blue-500" size={24} />
    }
  }

  const getSeverityColor = (severity: WeatherAlert['severity']) => {
    switch (severity) {
      case 'low':
        return 'border-blue-200 bg-blue-50'
      case 'medium':
        return 'border-orange-200 bg-orange-50'
      case 'high':
        return 'border-red-200 bg-red-50'
    }
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert, idx) => (
        <Card
          key={idx}
          variant="elevated"
          status={alert.severity === 'high' ? 'error' : alert.severity === 'medium' ? 'warning' : undefined}
          className={`p-4 ${getSeverityColor(alert.severity)}`}
        >
          <div className="flex items-start gap-3">
            {getAlertIcon(alert.type)}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <AlertTriangle className="text-semantic-warning" size={18} />
                <h4 className="font-semibold text-gray-900">
                  {alert.type === 'frost' && 'Rischio Gelate'}
                  {alert.type === 'hail' && 'Rischio Grandine'}
                  {alert.type === 'drought' && 'Siccità'}
                  {alert.type === 'rain' && 'Pioggia Prevista'}
                </h4>
              </div>
              <p className="text-sm text-gray-700">{alert.message}</p>
              <p className="text-xs text-gray-500 mt-1">
                {alert.date.toLocaleDateString('it-IT', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

