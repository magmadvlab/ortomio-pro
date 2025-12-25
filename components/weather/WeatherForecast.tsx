'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { ThermometerSun, Droplets, Cloud, Sun } from 'lucide-react'

interface ForecastDay {
  date: Date
  temp: number
  condition: string
  icon: string
  rainChance: number
}

interface WeatherForecastProps {
  forecast: ForecastDay[]
}

export function WeatherForecast({ forecast }: WeatherForecastProps) {
  const getWeatherIcon = (condition: string) => {
    if (condition.includes('sole')) return '☀️'
    if (condition.includes('nuvol')) return '☁️'
    if (condition.includes('pioggia')) return '🌧️'
    if (condition.includes('temporale')) return '⛈️'
    return '🌤️'
  }

  return (
    <Card variant="elevated" className="p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Previsioni 7 Giorni</h3>
      
      <div className="space-y-3">
        {forecast.map((day, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="text-2xl">{getWeatherIcon(day.condition)}</div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">
                  {day.date.toLocaleDateString('it-IT', {
                    weekday: idx === 0 ? 'long' : 'short',
                    day: 'numeric',
                    month: 'short',
                  })}
                </div>
                <div className="text-sm text-gray-600">{day.condition}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {day.rainChance > 0 && (
                <div className="flex items-center gap-1 text-blue-600">
                  <Droplets size={16} />
                  <span className="text-sm font-medium">{day.rainChance}%</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <ThermometerSun size={18} className="text-orange-500" />
                <span className="font-semibold text-gray-900">{day.temp}°C</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

