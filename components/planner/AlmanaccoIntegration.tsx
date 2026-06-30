'use client'

import React, { useState, useEffect } from 'react'
import { Calendar, Sun, Moon, Cloud, Droplets, Thermometer, Wind, Eye } from 'lucide-react'
import { calculateMoonPhase, getMoonPhaseEmoji } from '@/logic/lunarCalendar'

interface AlmanaccoData {
  date: string
  moonPhase: {
    name: string
    phase: 'New' | 'WaxingCrescent' | 'FirstQuarter' | 'WaxingGibbous' | 'Full' | 'WaningGibbous' | 'LastQuarter' | 'WaningCrescent'
    isWaxing: boolean
    isWaning: boolean
    emoji: string
  }
  sunrise: string
  sunset: string
  temperature: {
    min: number
    max: number
  }
  weather: string
  recommendations: string[]
  lunarAdvice: {
    sowing: string[]
    transplanting: string[]
    harvesting: string[]
    pruning: string[]
  }
}

interface AlmanaccoIntegrationProps {
  selectedDate?: Date
  compact?: boolean
  showLunarAdvice?: boolean
}

export const AlmanaccoIntegration: React.FC<AlmanaccoIntegrationProps> = ({
  selectedDate = new Date(),
  compact = false,
  showLunarAdvice = true
}) => {
  const [almanaccoData, setAlmanaccoData] = useState<AlmanaccoData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAlmanaccoData(selectedDate)
  }, [selectedDate])

  const getLunarAdvice = (moonPhase: AlmanaccoData['moonPhase']) => {
    if (moonPhase.isWaxing) {
      return {
        sowing: [
          'Ideale per seminare ortaggi da frutto (pomodori, zucchine, peperoni)',
          'Buon momento per seminare cereali e legumi',
          'Favorisce la germinazione e la crescita vegetativa'
        ],
        transplanting: [
          'Ottimo periodo per trapianti di piantine giovani',
          'Le radici si sviluppano meglio',
          'Maggiore attecchimento delle piante'
        ],
        harvesting: [
          'Raccogli frutti per il consumo fresco',
          'I frutti hanno più succo e sapore',
          'Ideale per raccogliere erbe aromatiche'
        ],
        pruning: [
          'Evita potature drastiche',
          'Solo potature leggere di formazione',
          'La linfa sale verso l\'alto'
        ]
      }
    } else if (moonPhase.isWaning) {
      return {
        sowing: [
          'Perfetto per seminare ortaggi da radice (carote, ravanelli, cipolle)',
          'Semina di ortaggi da foglia (lattuga, spinaci, rucola)',
          'La linfa scende verso le radici'
        ],
        transplanting: [
          'Evita trapianti se possibile',
          'Se necessario, fai trapianti al mattino presto',
          'Annaffia abbondantemente dopo il trapianto'
        ],
        harvesting: [
          'Raccogli per la conservazione a lungo termine',
          'Ideale per raccogliere radici e tuberi',
          'I prodotti si conservano meglio'
        ],
        pruning: [
          'Momento ideale per potature',
          'Pota alberi da frutto e arbusti',
          'Minore perdita di linfa'
        ]
      }
    } else {
      return {
        sowing: [
          'Periodo neutro per le semine',
          'Segui le indicazioni climatiche',
          'Concentrati sulla preparazione del terreno'
        ],
        transplanting: [
          'Periodo neutro per i trapianti',
          'Valuta le condizioni meteo',
          'Assicura buona irrigazione'
        ],
        harvesting: [
          'Raccogli secondo necessità',
          'Controlla la maturazione dei frutti',
          'Periodo neutro per la conservazione'
        ],
        pruning: [
          'Periodo neutro per le potature',
          'Concentrati su pulizie e manutenzione',
          'Rimuovi parti secche o danneggiate'
        ]
      }
    }
  }

  const loadAlmanaccoData = async (date: Date) => {
    try {
      setLoading(true)
      
      // Calculate moon phase
      const moonInfo = calculateMoonPhase(date)
      const moonPhase = { ...moonInfo, emoji: getMoonPhaseEmoji(moonInfo.phase) }
      
      // Calculate sunrise/sunset (simplified)
      const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))
      const sunriseHour = 6 + Math.sin((dayOfYear - 81) * 2 * Math.PI / 365) * 1.5
      const sunsetHour = 18 - Math.sin((dayOfYear - 81) * 2 * Math.PI / 365) * 1.5
      
      const sunrise = `${Math.floor(sunriseHour).toString().padStart(2, '0')}:${Math.floor((sunriseHour % 1) * 60).toString().padStart(2, '0')}`
      const sunset = `${Math.floor(sunsetHour).toString().padStart(2, '0')}:${Math.floor((sunsetHour % 1) * 60).toString().padStart(2, '0')}`
      
      // Mock weather data (in a real app, this would come from a weather API)
      const weatherConditions = ['Soleggiato', 'Parzialmente nuvoloso', 'Nuvoloso', 'Pioggia leggera']
      const weather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)]
      
      const temperature = {
        min: Math.floor(Math.random() * 15) + 5,
        max: Math.floor(Math.random() * 15) + 15
      }
      
      // Generate recommendations based on season and moon phase
      const month = date.getMonth()
      const season = month >= 2 && month <= 4 ? 'spring' : 
                   month >= 5 && month <= 7 ? 'summer' : 
                   month >= 8 && month <= 10 ? 'autumn' : 'winter'
      
      const seasonalRecommendations = {
        spring: [
          'Prepara i semenzai per le colture estive',
          'Inizia le semine all\'aperto delle colture resistenti',
          'Controlla e ripara gli impianti di irrigazione',
          'Applica compost maturo alle aiuole'
        ],
        summer: [
          'Mantieni il terreno umido con pacciamatura',
          'Raccogli regolarmente per stimolare la produzione',
          'Proteggi le piante dal caldo eccessivo',
          'Pianifica le semine autunnali'
        ],
        autumn: [
          'Semina le colture invernali',
          'Raccogli e conserva i prodotti maturi',
          'Prepara le protezioni per l\'inverno',
          'Pulisci e prepara il terreno per il riposo'
        ],
        winter: [
          'Pianifica le colture per la prossima stagione',
          'Mantieni le protezioni dal gelo',
          'Prepara il compost con i residui vegetali',
          'Controlla e mantieni gli attrezzi'
        ]
      }
      
      const lunarAdvice = getLunarAdvice(moonPhase)
      
      const data: AlmanaccoData = {
        date: date.toLocaleDateString('it-IT'),
        moonPhase,
        sunrise,
        sunset,
        temperature,
        weather,
        recommendations: seasonalRecommendations[season],
        lunarAdvice
      }
      
      setAlmanaccoData(data)
    } catch (error) {
      console.error('Error loading almanacco data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
      </div>
    )
  }

  if (!almanaccoData) {
    return (
      <div className="text-center text-gray-500 py-4">
        <Calendar className="mx-auto mb-2" size={24} />
        <p>Impossibile caricare i dati dell'almanacco</p>
      </div>
    )
  }

  if (compact) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="text-green-600" size={18} />
            Almanacco
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>{almanaccoData.moonPhase.emoji}</span>
            <span>{almanaccoData.moonPhase.name}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Sun className="text-yellow-500" size={16} />
            <span>{almanaccoData.sunrise} - {almanaccoData.sunset}</span>
          </div>
          <div className="flex items-center gap-2">
            <Thermometer className="text-red-500" size={16} />
            <span>{almanaccoData.temperature.min}°C - {almanaccoData.temperature.max}°C</span>
          </div>
        </div>
        
        <div className="mt-3 p-2 bg-white rounded border">
          <p className="text-xs text-gray-700 font-medium mb-1">Consiglio del giorno:</p>
          <p className="text-xs text-gray-600">{almanaccoData.recommendations[0]}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="text-green-600" size={24} />
            Almanacco del Contadino
          </h2>
          <div className="text-right">
            <div className="text-sm text-gray-600">{almanaccoData.date}</div>
            <div className="text-lg font-medium text-gray-900">{almanaccoData.weather}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Moon Phase */}
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center gap-3 mb-2">
              <Moon className="text-blue-600" size={20} />
              <span className="font-medium text-gray-900">Fase Lunare</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{almanaccoData.moonPhase.emoji}</span>
              <span className="text-sm text-gray-700">{almanaccoData.moonPhase.name}</span>
            </div>
          </div>
          
          {/* Sun Times */}
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center gap-3 mb-2">
              <Sun className="text-yellow-500" size={20} />
              <span className="font-medium text-gray-900">Sole</span>
            </div>
            <div className="text-sm text-gray-700">
              <div>Alba: {almanaccoData.sunrise}</div>
              <div>Tramonto: {almanaccoData.sunset}</div>
            </div>
          </div>
          
          {/* Temperature */}
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center gap-3 mb-2">
              <Thermometer className="text-red-500" size={20} />
              <span className="font-medium text-gray-900">Temperature</span>
            </div>
            <div className="text-sm text-gray-700">
              <div>Min: {almanaccoData.temperature.min}°C</div>
              <div>Max: {almanaccoData.temperature.max}°C</div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Recommendations */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Droplets className="text-green-500" size={20} />
          Consigli per Oggi
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {almanaccoData.recommendations.map((recommendation, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm text-green-800">{recommendation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Lunar Advice */}
      {showLunarAdvice && (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Moon className="text-blue-600" size={20} />
            Consigli Lunari - {almanaccoData.moonPhase.name}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                🌱 Semina
              </h4>
              <ul className="space-y-1">
                {almanaccoData.lunarAdvice.sowing.map((advice, index) => (
                  <li key={index} className="text-xs text-gray-600 flex items-start gap-1">
                    <span className="text-green-500 mt-1">•</span>
                    <span>{advice}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                🌿 Trapianto
              </h4>
              <ul className="space-y-1">
                {almanaccoData.lunarAdvice.transplanting.map((advice, index) => (
                  <li key={index} className="text-xs text-gray-600 flex items-start gap-1">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>{advice}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                🌾 Raccolta
              </h4>
              <ul className="space-y-1">
                {almanaccoData.lunarAdvice.harvesting.map((advice, index) => (
                  <li key={index} className="text-xs text-gray-600 flex items-start gap-1">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>{advice}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                ✂️ Potatura
              </h4>
              <ul className="space-y-1">
                {almanaccoData.lunarAdvice.pruning.map((advice, index) => (
                  <li key={index} className="text-xs text-gray-600 flex items-start gap-1">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>{advice}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AlmanaccoIntegration