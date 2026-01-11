'use client'

import React, { useState, useEffect } from 'react'
import { 
  Drone, 
  Play, 
  Plus, 
  Calendar, 
  MapPin, 
  Camera, 
  BarChart3,
  CheckCircle,
  Clock,
  AlertTriangle,
  Zap,
  Eye,
  Map
} from 'lucide-react'
import { useGarden } from '@/packages/core/hooks/useGarden'

interface DroneFlightPlan {
  id: string
  name: string
  type: 'SURVEY' | 'MONITORING' | 'PRESCRIPTION' | 'EMERGENCY'
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
  scheduledDate: string
  duration: number
  altitude: number
  waypoints: any[]
  results?: {
    imagesCapture: number
    dataSize: number
    batteryUsed: number
    analysis: {
      healthMap: { overallScore: number }
      diseaseDetection: any[]
      yieldEstimation: { totalEstimatedYield: number }
    }
  }
}

export default function DroneOperationsPage() {
  const { activeGarden } = useGarden()
  const [loading, setLoading] = useState(true)
  const [flightPlans, setFlightPlans] = useState<DroneFlightPlan[]>([])
  const [activeTab, setActiveTab] = useState<'flights' | 'results' | 'create'>('flights')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (activeGarden) {
      loadFlightPlans()
    }
  }, [activeGarden])

  const loadFlightPlans = async () => {
    if (!activeGarden) return
    
    try {
      setLoading(true)
      const response = await fetch(`/api/drone/flight-plans?gardenId=${activeGarden.id}`)
      const result = await response.json()
      
      if (result.success) {
        setFlightPlans(result.data)
      }
    } catch (error) {
      console.error('Error loading flight plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const createAutomaticFlight = async () => {
    if (!activeGarden) return
    
    try {
      setCreating(true)
      const response = await fetch('/api/drone/auto-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gardenId: activeGarden.id })
      })
      
      const result = await response.json()
      if (result.success) {
        await loadFlightPlans()
        setActiveTab('flights')
      }
    } catch (error) {
      console.error('Error creating automatic flight:', error)
    } finally {
      setCreating(false)
    }
  }

  const executeFlightPlan = async (flightPlanId: string) => {
    try {
      const response = await fetch('/api/drone/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flightPlanId })
      })
      
      const result = await response.json()
      if (result.success) {
        await loadFlightPlans()
      }
    } catch (error) {
      console.error('Error executing flight:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'text-green-600 bg-green-100'
      case 'IN_PROGRESS': return 'text-blue-600 bg-blue-100'
      case 'PLANNED': return 'text-yellow-600 bg-yellow-100'
      case 'FAILED': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle size={16} />
      case 'IN_PROGRESS': return <Clock size={16} />
      case 'PLANNED': return <Calendar size={16} />
      case 'FAILED': return <AlertTriangle size={16} />
      default: return <Clock size={16} />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SURVEY': return <Map size={16} />
      case 'MONITORING': return <Eye size={16} />
      case 'PRESCRIPTION': return <BarChart3 size={16} />
      case 'EMERGENCY': return <AlertTriangle size={16} />
      default: return <Drone size={16} />
    }
  }

  const getTypeName = (type: string) => {
    switch (type) {
      case 'SURVEY': return 'Ricognizione'
      case 'MONITORING': return 'Monitoraggio'
      case 'PRESCRIPTION': return 'Prescrizione'
      case 'EMERGENCY': return 'Emergenza'
      default: return type
    }
  }

  if (!activeGarden) {
    return (
      <div className="min-h-screen p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <Drone className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Seleziona un Orto
          </h2>
          <p className="text-gray-600">
            Seleziona un orto per accedere alle operazioni drone
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento operazioni drone...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg">
                <Drone className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Operazioni Drone
                </h1>
                <p className="text-gray-600">
                  Monitoraggio aereo avanzato per {activeGarden.name}
                </p>
              </div>
            </div>
            <button
              onClick={createAutomaticFlight}
              disabled={creating}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {creating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Plus size={16} />
              )}
              Volo Automatico
            </button>
          </div>

          {/* Drone Badge */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Zap className="h-6 w-6 text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-900">
                  🚁 Drone Integration Avanzata - DJI Compatible
                </h3>
                <p className="text-sm text-blue-800">
                  Voli automatici • Computer vision • Prescription maps • 
                  Multi-sensor • Real-time analysis • API nativa DJI
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-md">
            {[
              { id: 'flights', label: 'Piani di Volo', icon: Calendar },
              { id: 'results', label: 'Risultati Analisi', icon: BarChart3 },
              { id: 'create', label: 'Crea Volo', icon: Plus }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Flight Plans */}
          {activeTab === 'flights' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Piani di Volo</h2>
              
              {flightPlans.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <Drone className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Nessun Volo Programmato</h3>
                  <p className="text-gray-600 mb-4">Crea il tuo primo piano di volo automatico</p>
                  <button
                    onClick={createAutomaticFlight}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Crea Volo Automatico
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {flightPlans.map((plan) => (
                    <div key={plan.id} className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {getTypeIcon(plan.type)}
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {plan.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {getTypeName(plan.type)} • {plan.duration} min • 
                              {plan.altitude}m altitudine • {plan.waypoints.length} waypoints
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(plan.status)}`}>
                            {getStatusIcon(plan.status)}
                            {plan.status}
                          </div>
                          {plan.status === 'PLANNED' && (
                            <button
                              onClick={() => executeFlightPlan(plan.id)}
                              className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <Play size={16} />
                              Esegui
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Data programmata:</span>
                          <div className="font-medium">
                            {new Date(plan.scheduledDate).toLocaleString('it-IT')}
                          </div>
                        </div>
                        
                        {plan.results && (
                          <>
                            <div>
                              <span className="text-gray-600">Immagini catturate:</span>
                              <div className="font-medium">{plan.results.imagesCapture}</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Dati raccolti:</span>
                              <div className="font-medium">{plan.results.dataSize.toFixed(1)} MB</div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Results */}
          {activeTab === 'results' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Risultati Analisi</h2>
              
              {flightPlans.filter(plan => plan.results).length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <BarChart3 className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Nessun Risultato Disponibile</h3>
                  <p className="text-gray-600">Esegui un volo per vedere i risultati dell'analisi</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {flightPlans
                    .filter(plan => plan.results)
                    .map((plan) => (
                      <div key={plan.id} className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Camera className="h-6 w-6 text-blue-600" />
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              Analisi: {plan.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Completato: {new Date(plan.scheduledDate).toLocaleDateString('it-IT')}
                            </p>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600 mb-2">
                              {plan.results?.analysis.healthMap.overallScore || 0}%
                            </div>
                            <div className="text-gray-600">Salute Generale</div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600 mb-2">
                              {plan.results?.analysis.diseaseDetection.length || 0}
                            </div>
                            <div className="text-gray-600">Malattie Rilevate</div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600 mb-2">
                              {plan.results?.analysis.yieldEstimation.totalEstimatedYield || 0} kg
                            </div>
                            <div className="text-gray-600">Resa Stimata</div>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="grid md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Immagini:</span>
                              <span className="ml-2 font-medium">{plan.results?.imagesCapture}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Dati:</span>
                              <span className="ml-2 font-medium">{plan.results?.dataSize.toFixed(1)} MB</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Batteria usata:</span>
                              <span className="ml-2 font-medium">{plan.results?.batteryUsed}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Create Flight */}
          {activeTab === 'create' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Crea Nuovo Volo</h2>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <button
                    onClick={() => createAutomaticFlight()}
                    className="p-6 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <Zap className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Volo Automatico</h3>
                    <p className="text-sm text-gray-600">
                      L'AI determina automaticamente il tipo di volo ottimale basandosi sulle condizioni attuali
                    </p>
                  </button>

                  <div className="p-6 border-2 border-gray-200 rounded-lg opacity-60">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Volo Personalizzato</h3>
                    <p className="text-sm text-gray-600">
                      Crea un piano di volo personalizzato con waypoints specifici (Prossimamente)
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Tipi di Volo Disponibili:</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>SURVEY:</strong> Ricognizione completa con pattern a griglia
                    </div>
                    <div>
                      <strong>MONITORING:</strong> Monitoraggio mirato delle aree critiche
                    </div>
                    <div>
                      <strong>PRESCRIPTION:</strong> Generazione mappe prescrizione
                    </div>
                    <div>
                      <strong>EMERGENCY:</strong> Risposta rapida per emergenze
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}