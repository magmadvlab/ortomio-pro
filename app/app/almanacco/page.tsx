'use client'

import React, { useState, useEffect } from 'react'
import { Calendar, Cloud, Sun, Droplets, Wind, Thermometer } from 'lucide-react'

interface AlmanaccoData {
  date: string
  moonPhase: string
  sunrise: string
  sunset: string
  temperature: {
    min: number
    max: number
  }
  weather: string
  recommendations: string[]
}

export default function AlmanaccoPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [almanaccoData, setAlmanaccoData] = useState<AlmanaccoData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading almanacco data
    const loadAlmanaccoData = async () => {
      try {
        // Mock data for now - replace with actual API call
        const mockData: AlmanaccoData = {
          date: currentDate.toLocaleDateString('it-IT'),
          moonPhase: getMoonPhase(currentDate),
          sunrise: '07:30',
          sunset: '17:45',
          temperature: {
            min: 8,
            max: 18
          },
          weather: 'Parzialmente nuvoloso',
          recommendations: [
            'Buon momento per seminare ortaggi a foglia',
            'Evitare irrigazioni eccessive',
            'Controllare le protezioni dal freddo',
            'Preparare il terreno per le semine primaverili'
          ]
        }
        
        setAlmanaccoData(mockData)
      } catch (error) {
        console.error('Error loading almanacco data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAlmanaccoData()
  }, [currentDate])

  const getMoonPhase = (date: Date): string => {
    const phases = ['Luna Nuova', 'Primo Quarto', 'Luna Piena', 'Ultimo Quarto']
    const dayOfMonth = date.getDate()
    return phases[Math.floor(dayOfMonth / 7) % 4]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <Calendar className="w-8 h-8 text-green-600" />
            Almanacco del Contadino
          </h1>
          <p className="text-gray-600">
            Consigli e informazioni per la giornata di oggi
          </p>
        </div>

        {almanaccoData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weather and Astronomy */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Sun className="w-6 h-6 text-yellow-500" />
                Condizioni Astronomiche
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Data:</span>
                  <span className="font-medium">{almanaccoData.date}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Fase Lunare:</span>
                  <span className="font-medium">{almanaccoData.moonPhase}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Alba:</span>
                  <span className="font-medium">{almanaccoData.sunrise}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tramonto:</span>
                  <span className="font-medium">{almanaccoData.sunset}</span>
                </div>
              </div>
            </div>

            {/* Weather Conditions */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Cloud className="w-6 h-6 text-blue-500" />
                Condizioni Meteo
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tempo:</span>
                  <span className="font-medium">{almanaccoData.weather}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 flex items-center gap-1">
                    <Thermometer className="w-4 h-4" />
                    Min/Max:
                  </span>
                  <span className="font-medium">
                    {almanaccoData.temperature.min}°C / {almanaccoData.temperature.max}°C
                  </span>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Giornata ideale per lavori all'aperto nelle ore centrali
                  </p>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="md:col-span-2 bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Droplets className="w-6 h-6 text-green-500" />
                Consigli per Oggi
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {almanaccoData.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-green-800">{recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getTime() - 24 * 60 * 60 * 1000))}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Giorno Precedente
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Oggi
          </button>
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getTime() + 24 * 60 * 60 * 1000))}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Giorno Successivo
          </button>
        </div>
      </div>
    </div>
  )
}