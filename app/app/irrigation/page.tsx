'use client'

import { useState, useEffect } from 'react'
import { Droplets, Clock, MapPin, Settings, Play, Pause, BarChart3 } from 'lucide-react'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { Garden } from '@/types'
import IrrigationAISuggestionsWidget from '@/components/irrigation/IrrigationAISuggestionsWidget'

export default function IrrigationPage() {
  const { storageProvider } = useStorage()
  const [gardens, setGardens] = useState<Garden[]>([])
  const [activeGarden, setActiveGarden] = useState<Garden | null>(null)

  useEffect(() => {
    const loadGardens = async () => {
      try {
        const loadedGardens = await storageProvider.getGardens()
        setGardens(loadedGardens)
        if (loadedGardens.length > 0) {
          setActiveGarden(loadedGardens[0])
        }
      } catch (error) {
        console.error('Error loading gardens:', error)
      }
    }
    loadGardens()
  }, [storageProvider])
  const [activeTab, setActiveTab] = useState<'zones' | 'schedule' | 'monitoring' | 'settings'>('zones')

  const irrigationZones = [
    {
      id: '1',
      name: 'Zona Pomodori',
      status: 'active',
      lastWatering: '2024-01-12 08:30',
      nextWatering: '2024-01-13 08:00',
      waterUsed: 45,
      soilMoisture: 65
    },
    {
      id: '2',
      name: 'Zona Insalate',
      status: 'scheduled',
      lastWatering: '2024-01-11 18:00',
      nextWatering: '2024-01-12 18:00',
      waterUsed: 25,
      soilMoisture: 45
    },
    {
      id: '3',
      name: 'Zona Erbe Aromatiche',
      status: 'idle',
      lastWatering: '2024-01-10 09:15',
      nextWatering: '2024-01-14 09:00',
      waterUsed: 15,
      soilMoisture: 70
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'idle': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Attiva'
      case 'scheduled': return 'Programmata'
      case 'idle': return 'Inattiva'
      default: return 'Sconosciuto'
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Droplets className="text-blue-500" size={28} />
          Sistema di Irrigazione
        </h1>
        <p className="text-gray-600 mt-1">Gestisci l'irrigazione automatica delle tue colture</p>
      </div>

      {/* Statistiche Rapide */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Droplets className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">85L</p>
              <p className="text-sm text-gray-600">Oggi</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <MapPin className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">3</p>
              <p className="text-sm text-gray-600">Zone Attive</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">15%</p>
              <p className="text-sm text-gray-600">Risparmio</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="text-orange-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">68%</p>
              <p className="text-sm text-gray-600">Umidità Media</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Suggestions Widget */}
      {activeGarden && (
        <div className="mb-6">
          <IrrigationAISuggestionsWidget garden={activeGarden} maxItems={2} />
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'zones', label: 'Zone', icon: MapPin },
              { id: 'schedule', label: 'Programmazione', icon: Clock },
              { id: 'monitoring', label: 'Monitoraggio', icon: BarChart3 },
              { id: 'settings', label: 'Impostazioni', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Contenuto */}
      {activeTab === 'zones' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {irrigationZones.map((zone) => (
            <div key={zone.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{zone.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(zone.status)}`}>
                  {getStatusLabel(zone.status)}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Umidità Suolo:</span>
                  <span className="font-medium">{zone.soilMoisture}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${zone.soilMoisture}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Acqua Usata:</span>
                  <span className="font-medium">{zone.waterUsed}L</span>
                </div>
                
                <div className="text-xs text-gray-500">
                  <p>Ultima: {new Date(zone.lastWatering).toLocaleString('it-IT')}</p>
                  <p>Prossima: {new Date(zone.nextWatering).toLocaleString('it-IT')}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  <Play size={16} />
                  Avvia
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                  <Pause size={16} />
                  Pausa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'schedule' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center py-12">
            <Clock className="mx-auto mb-4 text-blue-500" size={48} />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Programmazione Irrigazione</h2>
            <p className="text-gray-600 mb-6">
              Configura orari e frequenza di irrigazione per ogni zona
            </p>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Configura Programmazione
            </button>
          </div>
        </div>
      )}

      {activeTab === 'monitoring' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center py-12">
            <BarChart3 className="mx-auto mb-4 text-purple-500" size={48} />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Monitoraggio Avanzato</h2>
            <p className="text-gray-600 mb-6">
              Analizza consumi, efficienza e stato dell'irrigazione
            </p>
            <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors">
              Visualizza Analytics
            </button>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center py-12">
            <Settings className="mx-auto mb-4 text-gray-500" size={48} />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Impostazioni Sistema</h2>
            <p className="text-gray-600 mb-6">
              Configura sensori, valvole e parametri del sistema
            </p>
            <button className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors">
              Apri Impostazioni
            </button>
          </div>
        </div>
      )}
    </div>
  )
}