/**
 * WeatherWidget - Widget meteo riutilizzabile per tutte le pagine
 * Mostra condizioni attuali e alert agricoli intelligenti
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Cloud, Sun, CloudRain, Snowflake, Wind, Droplets, Thermometer, AlertTriangle, Info, XCircle } from 'lucide-react'
import { weatherService, WeatherData } from '@/services/weatherService'

interface WeatherWidgetProps {
  garden?: any
  compact?: boolean
  showAlerts?: boolean
  className?: string
}

export function WeatherWidget({ 
  garden, 
  compact = false, 
  showAlerts = true, 
  className = '' 
}: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadWeather()
  }, [garden])

  const loadWeather = async () => {
    try {
      setLoading(true)
      setError(null)
      
      let weatherData: WeatherData
      if (garden) {
        weatherData = await weatherService.getWeatherForGarden(garden)
      } else {
        weatherData = await weatherService.getWeatherForUserLocation()
      }
      
      setWeather(weatherData)
    } catch (err) {
      console.error('Error loading weather:', err)
      setError('Impossibile caricare i dati meteo')
    } finally {
      setLoading(false)
    }
  }

  const getWeatherIcon = (condition: string) => {
    const conditionLower = condition.toLowerCase()
    if (conditionLower.includes('sereno') || conditionLower.includes('sole')) {
      return <Sun className="w-6 h-6 text-yellow-500" />
    } else if (conditionLower.includes('pioggia') || conditionLower.includes('temporale')) {
      return <CloudRain className="w-6 h-6 text-blue-500" />
    } else if (conditionLower.includes('neve')) {
      return <Snowflake className="w-6 h-6 text-blue-300" />
    } else if (conditionLower.includes('nuvoloso') || conditionLower.includes('coperto')) {
      return <Cloud className="w-6 h-6 text-gray-500" />
    } else {
      return <Sun className="w-6 h-6 text-yellow-500" />
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'danger': return <XCircle className="w-4 h-4" />
      case 'warning': return <AlertTriangle className="w-4 h-4" />
      case 'info': return <Info className="w-4 h-4" />
      default: return <Info className="w-4 h-4" />
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'danger': return 'bg-red-500/20 border-red-300 text-red-800'
      case 'warning': return 'bg-orange-500/20 border-orange-300 text-orange-800'
      case 'info': return 'bg-blue-500/20 border-blue-300 text-blue-800'
      default: return 'bg-gray-500/20 border-gray-300 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className={`bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-white/20 rounded mb-2"></div>
          <div className="h-8 bg-white/20 rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !weather) {
    return (
      <div className={`bg-gray-500 rounded-xl p-4 text-white shadow-lg ${className}`}>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          <span className="text-sm">{error || 'Dati meteo non disponibili'}</span>
        </div>
      </div>
    )
  }

  const alerts = showAlerts ? weatherService.generateWeatherAlerts(weather) : []

  if (compact) {
    return (
      <div className={`bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-3 text-white shadow-md ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getWeatherIcon(weather.condition)}
            <div>
              <div className="text-sm opacity-90">Oggi</div>
              <div className="font-semibold">{weather.condition}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{weather.temp}°</div>
            {weather.rainMm > 0 && (
              <div className="text-xs opacity-90">{weather.rainMm}mm</div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-medium opacity-90">
            {weather.location.name ? `Condizioni - ${weather.location.name}` : 'Condizioni Oggi'}
          </h3>
          <p className="text-xl md:text-2xl font-bold">{weather.condition}</p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold">{weather.temp}°</div>
          <div className="text-xs opacity-90 space-y-1">
            {weather.rainMm > 0 && <div>Pioggia: {weather.rainMm}mm</div>}
            {weather.windSpeed > 0 && <div>Vento: {weather.windSpeed}km/h</div>}
          </div>
        </div>
      </div>

      {/* Dettagli aggiuntivi */}
      <div className="grid grid-cols-3 gap-4 mb-3 text-xs opacity-90">
        <div className="flex items-center gap-1">
          <Droplets className="w-3 h-3" />
          <span>{weather.humidity}%</span>
        </div>
        <div className="flex items-center gap-1">
          <Wind className="w-3 h-3" />
          <span>{weather.windSpeed}km/h</span>
        </div>
        <div className="flex items-center gap-1">
          <Thermometer className="w-3 h-3" />
          <span>{weather.pressure}hPa</span>
        </div>
      </div>

      {/* Alert meteo agricoli */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.slice(0, 2).map((alert, index) => (
            <div
              key={index}
              className={`backdrop-blur-sm rounded-lg p-3 border ${getAlertColor(alert.type)}`}
            >
              <div className="flex items-start gap-2">
                {getAlertIcon(alert.type)}
                <div className="flex-1">
                  <p className="text-sm font-medium">{alert.icon} {alert.title}</p>
                  <p className="text-xs opacity-90 mt-1">{alert.message}</p>
                </div>
              </div>
            </div>
          ))}
          
          {alerts.length > 2 && (
            <div className="text-center">
              <button className="text-xs opacity-75 hover:opacity-100 underline">
                +{alerts.length - 2} altri alert
              </button>
            </div>
          )}
        </div>
      )}

      {/* Previsioni rapide (solo se non compact) */}
      {weather.forecast && weather.forecast.length > 0 && (
        <div className="mt-4 pt-3 border-t border-white/20">
          <div className="flex justify-between text-xs">
            {weather.forecast.slice(1, 4).map((day, index) => (
              <div key={index} className="text-center opacity-90">
                <div className="mb-1">
                  {new Date(day.date).toLocaleDateString('it-IT', { weekday: 'short' })}
                </div>
                <div className="font-semibold">
                  {day.tempMax}°/{day.tempMin}°
                </div>
                {day.rainMm > 0 && (
                  <div className="text-blue-200">
                    {day.rainMm}mm
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

export default WeatherWidget