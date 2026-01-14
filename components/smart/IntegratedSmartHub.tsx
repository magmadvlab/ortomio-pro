/**
 * Integrated Smart Hub - Hub IoT Unificato
 * Integra dispositivi IoT tradizionali (sensori, valvole) con droni
 */

'use client'

import React, { useState, useEffect } from 'react'
import { 
  Wifi, 
  Droplets, 
  Activity, 
  Settings, 
  Power, 
  Bot, 
  Sparkles, 
  Loader2,
  Drone,
  Play,
  Plus,
  Calendar,
  Camera,
  BarChart3,
  CheckCircle,
  Clock,
  AlertTriangle,
  Zap,
  Eye,
  Map,
  MapPin
} from 'lucide-react'
import { SmartDevice, Garden } from '@/types'
import ActionButton, { ActionContext } from '@/components/actions/ActionButton'
import InterventionWizard, { InterventionData } from '@/components/actions/InterventionWizard'
import { interventionService } from '@/services/interventionService'

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

interface IntegratedSmartHubProps {
  devices: SmartDevice[]
  garden: Garden
  onToggleValve: (id: string, isOpen: boolean) => void
  onUpdateDeviceSettings: (id: string, settings: Partial<SmartDevice>) => void
}

export default function IntegratedSmartHub({ 
  devices, 
  garden, 
  onToggleValve, 
  onUpdateDeviceSettings 
}: IntegratedSmartHubProps) {
  const [activeTab, setActiveTab] = useState<'iot' | 'drones'>('iot')
  const [analyzingId, setAnalyzingId] = useState<string | null>(null)
  const [aiAdvice, setAiAdvice] = useState<Record<string, string>>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // Drone state
  const [flightPlans, setFlightPlans] = useState<DroneFlightPlan[]>([])
  const [droneTab, setDroneTab] = useState<'flights' | 'results' | 'create'>('flights')
  const [creating, setCreating] = useState(false)
  const [loading, setLoading] = useState(false)

  // Action Buttons state
  const [wizardOpen, setWizardOpen] = useState(false)
  const [selectedAction, setSelectedAction] = useState<any>(null)
  const [actionContext, setActionContext] = useState<ActionContext | null>(null)

  // Filter devices for current garden
  const gardenDevices = devices.filter(d => d.gardenId === garden.id)

  useEffect(() => {
    if (activeTab === 'drones') {
      loadFlightPlans()
    }
  }, [activeTab, garden.id])

  const loadFlightPlans = async () => {
    try {
      setLoading(true)
      // Simula caricamento piani di volo
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Dati di esempio
      const mockPlans: DroneFlightPlan[] = [
        {
          id: '1',
          name: 'Survey Completo Gennaio',
          type: 'SURVEY',
          status: 'COMPLETED',
          scheduledDate: new Date(Date.now() - 86400000).toISOString(),
          duration: 25,
          altitude: 50,
          waypoints: [],
          results: {
            imagesCapture: 156,
            dataSize: 2.4,
            batteryUsed: 78,
            analysis: {
              healthMap: { overallScore: 87 },
              diseaseDetection: [{ type: 'Peronospora', severity: 'Low' }],
              yieldEstimation: { totalEstimatedYield: 45.2 }
            }
          }
        },
        {
          id: '2',
          name: 'Monitoraggio Zone Critiche',
          type: 'MONITORING',
          status: 'PLANNED',
          scheduledDate: new Date(Date.now() + 86400000).toISOString(),
          duration: 15,
          altitude: 30,
          waypoints: []
        }
      ]
      
      setFlightPlans(mockPlans)
    } catch (error) {
      console.error('Error loading flight plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const createAutomaticFlight = async () => {
    try {
      setCreating(true)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newPlan: DroneFlightPlan = {
        id: Date.now().toString(),
        name: `Volo Automatico ${new Date().toLocaleDateString('it-IT')}`,
        type: 'SURVEY',
        status: 'PLANNED',
        scheduledDate: new Date(Date.now() + 3600000).toISOString(),
        duration: 20,
        altitude: 40,
        waypoints: []
      }
      
      setFlightPlans(prev => [newPlan, ...prev])
      setDroneTab('flights')
    } catch (error) {
      console.error('Error creating flight:', error)
    } finally {
      setCreating(false)
    }
  }

  const executeFlightPlan = async (flightPlanId: string) => {
    try {
      setFlightPlans(prev => prev.map(plan => 
        plan.id === flightPlanId 
          ? { ...plan, status: 'IN_PROGRESS' as const }
          : plan
      ))
      
      // Simula esecuzione
      setTimeout(() => {
        setFlightPlans(prev => prev.map(plan => 
          plan.id === flightPlanId 
            ? { 
                ...plan, 
                status: 'COMPLETED' as const,
                results: {
                  imagesCapture: Math.floor(Math.random() * 200) + 50,
                  dataSize: Math.random() * 3 + 1,
                  batteryUsed: Math.floor(Math.random() * 40) + 60,
                  analysis: {
                    healthMap: { overallScore: Math.floor(Math.random() * 30) + 70 },
                    diseaseDetection: [],
                    yieldEstimation: { totalEstimatedYield: Math.random() * 50 + 20 }
                  }
                }
              }
            : plan
        ))
      }, 5000)
    } catch (error) {
      console.error('Error executing flight:', error)
    }
  }

  const handleAnalyze = async (device: SmartDevice) => {
    setAnalyzingId(device.id)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const advice = `🌿 Analisi per ${device.name}: Umidità al ${device.moisture}%. ${
      device.moisture < 30 
        ? 'Irrigazione consigliata entro 2 ore.' 
        : device.moisture > 70 
        ? 'Terreno ben idratato, evitare irrigazione per 24h.' 
        : 'Livello ottimale, monitorare evoluzione.'
    }`
    
    setAiAdvice(prev => ({ ...prev, [device.id]: advice }))
    setAnalyzingId(null)
  }

  const CircularProgress = ({ value, color, size = 120 }: { value: number, color: string, size?: number }) => {
    const radius = size / 2 - 10
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (value / 100) * circumference
    
    return (
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90 w-full h-full">
          <circle cx={size/2} cy={size/2} r={radius} stroke="#f3f4f6" strokeWidth="8" fill="transparent" />
          <circle 
            cx={size/2} cy={size/2} r={radius} 
            stroke={color} strokeWidth="8" fill="transparent" 
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-xl md:text-2xl font-bold text-gray-700">{Math.round(value)}%</span>
          <span className="text-[10px] text-gray-400 uppercase font-bold">Umidità</span>
        </div>
      </div>
    )
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

  const handleActionSelected = (actionType: any, context: ActionContext) => {
    setSelectedAction(actionType)
    setActionContext(context)
    setWizardOpen(true)
  }

  const handleInterventionCreated = async (intervention: InterventionData) => {
    try {
      await interventionService.createIntervention({
        ...intervention,
        gardenId: garden.id
      })
      
      console.log('Intervento creato con successo:', intervention)
      // Ricarica i dati se necessario
      if (activeTab === 'drones') {
        loadFlightPlans()
      }
    } catch (error) {
      console.error('Errore nella creazione dell\'intervento:', error)
    }
  }

  const getUrgencyFromDevice = (device: SmartDevice): 'low' | 'medium' | 'high' | 'critical' => {
    if (device.moisture < 20) return 'critical'
    if (device.moisture < 30) return 'high'
    if (device.moisture < 50) return 'medium'
    return 'low'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-100 to-green-100 rounded-lg">
              <Wifi className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Smart Hub Integrato</h1>
              <p className="text-gray-600">
                Controllo unificato IoT e droni per {garden.name}
              </p>
            </div>
          </div>

          {/* Integration Badge */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Zap className="h-6 w-6 text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-900">
                  🤖 Hub Intelligente Unificato
                </h3>
                <p className="text-sm text-blue-800">
                  Sensori IoT • Irrigazione automatica • Droni DJI • 
                  Computer vision • AI analysis • Controllo centralizzato
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-md">
            <button
              onClick={() => setActiveTab('iot')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'iot'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Wifi size={16} />
              Dispositivi IoT
            </button>
            <button
              onClick={() => setActiveTab('drones')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'drones'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Drone size={16} />
              Operazioni Drone
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'iot' && (
          <div className="space-y-6">
            {gardenDevices.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="bg-gray-100 p-6 rounded-full inline-block mb-4">
                  <Wifi size={48} className="text-gray-400"/>
                </div>
                <h2 className="text-lg md:text-xl font-bold text-gray-700">Nessun Dispositivo IoT</h2>
                <p className="text-gray-500 mt-2">Collega sensori e valvole per il controllo automatico</p>
                <div className="mt-6 p-4 bg-blue-50 text-blue-800 text-sm rounded-xl border border-blue-100">
                  <p className="font-bold mb-1">💡 Modalità Demo Attiva</p>
                  <p>I dispositivi IoT verranno simulati automaticamente</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {gardenDevices.map(device => (
                  <div key={device.id} className={`bg-white rounded-2xl border transition-all shadow-sm ${device.isValveOpen ? 'border-blue-300 shadow-blue-100' : 'border-gray-200'}`}>
                    {/* Device Header */}
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${device.isValveOpen ? 'bg-blue-600 text-white animate-pulse' : 'bg-gray-100 text-gray-400'}`}>
                          <Droplets size={20}/>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800">{device.name}</h3>
                          <p className="text-xs text-gray-500 flex items-center gap-3">
                            <Activity size={10} className="text-green-500"/> Online
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setEditingId(editingId === device.id ? null : device.id)}
                        className={`p-2 rounded-lg transition-colors ${editingId === device.id ? 'bg-gray-100 text-gray-800' : 'text-gray-400 hover:bg-gray-50'}`}
                      >
                        <Settings size={20}/>
                      </button>
                    </div>

                    {/* Dashboard Body */}
                    <div className="p-6">
                      <div className="flex flex-col sm:flex-col md:flex-row items-center justify-between gap-6">
                        {/* Moisture Gauge */}
                        <div className="flex flex-col items-center">
                          <CircularProgress 
                            value={device.moisture} 
                            color={device.moisture < 30 ? '#ef4444' : device.moisture < 60 ? '#eab308' : '#3b82f6'} 
                          />
                          <button 
                            onClick={() => handleAnalyze(device)}
                            disabled={analyzingId === device.id}
                            className="mt-4 text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-full flex items-center gap-3 hover:bg-purple-100 transition-colors"
                          >
                            {analyzingId === device.id ? <Loader2 size={12} className="animate-spin"/> : <Sparkles size={12}/>}
                            AI ANALISI
                          </button>
                        </div>

                        {/* Controls & Stats */}
                        <div className="flex-1 w-full space-y-4">
                          {/* Valve Control */}
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-center">
                            <div>
                              <p className="text-xs font-bold text-gray-500 uppercase mb-1">Stato Valvola</p>
                              <p className={`font-bold text-lg ${device.isValveOpen ? 'text-blue-600' : 'text-gray-400'}`}>
                                {device.isValveOpen ? 'APERTA' : 'CHIUSA'}
                              </p>
                            </div>
                            <button 
                              onClick={() => onToggleValve(device.id, !device.isValveOpen)}
                              className={`w-14 h-8 rounded-full transition-colors relative ${device.isValveOpen ? 'bg-blue-600' : 'bg-gray-300'}`}
                            >
                              <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full transition-transform shadow-sm ${device.isValveOpen ? 'translate-x-6' : 'translate-x-0'}`}>
                                <Power size={14} className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${device.isValveOpen ? 'text-blue-600' : 'text-gray-400'}`}/>
                              </div>
                            </button>
                          </div>

                          {/* Flow Meter */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                              <p className="text-[10px] font-bold text-blue-400 uppercase mb-1">Sessione</p>
                              <p className="text-lg md:text-xl font-mono font-bold text-blue-900 leading-none">
                                {device.sessionLiters.toFixed(1)} <span className="text-xs font-sans">L</span>
                              </p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Target Auto-Stop</p>
                              <p className="text-lg md:text-xl font-mono font-bold text-gray-600 leading-none">
                                {device.targetLiters > 0 ? device.targetLiters : '∞'} <span className="text-xs font-sans">L</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* AI Advice Result */}
                      {aiAdvice[device.id] && (
                        <div className="mt-4 bg-purple-50 p-3 rounded-xl border border-purple-100 text-sm text-purple-900 animate-in fade-in">
                          <span className="font-bold flex items-center gap-3 mb-1"><Bot size={14}/> Consiglio AI:</span>
                          {aiAdvice[device.id]}
                        </div>
                      )}

                      {/* Action Buttons per alert IoT critici */}
                      {device.moisture < 40 && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-red-900 mb-1">Alert Sensore IoT</h4>
                              <p className="text-sm text-red-800">
                                Umidità critica: {device.moisture}%. {device.moisture < 20 ? 'Intervento urgente richiesto!' : 'Monitoraggio necessario.'}
                              </p>
                            </div>
                            <ActionButton
                              sourceType="iot"
                              sourceData={{
                                device: device,
                                moisture: device.moisture,
                                sessionLiters: device.sessionLiters,
                                targetLiters: device.targetLiters,
                                autoThreshold: device.autoThreshold,
                                isValveOpen: device.isValveOpen
                              }}
                              zoneId={device.id}
                              zoneName={device.name}
                              urgency={getUrgencyFromDevice(device)}
                              onActionSelected={handleActionSelected}
                              size="sm"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Settings Drawer */}
                    {editingId === device.id && (
                      <div className="bg-gray-50 p-5 border-t border-gray-100 animate-in slide-in-from-top-3">
                        <h4 className="font-bold text-gray-700 text-sm uppercase mb-4 flex items-center gap-3">
                          <Settings size={16}/> Configurazione Automazione
                        </h4>
                        
                        <div className="space-y-4">
                          {/* Auto Start Threshold */}
                          <div>
                            <div className="flex justify-between mb-2">
                              <label className="text-xs font-bold text-gray-500">Soglia Avvio Automatico</label>
                              <span className="text-xs font-bold text-blue-600">{device.autoThreshold}% Umidità</span>
                            </div>
                            <input 
                              type="range" min="0" max="80" step="5"
                              value={device.autoThreshold}
                              onChange={(e) => onUpdateDeviceSettings(device.id, { autoThreshold: parseInt(e.target.value) })}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                          </div>

                          {/* Auto Stop Target */}
                          <div>
                            <label className="text-xs font-bold text-gray-500 mb-2 block">Target Acqua (Auto-Stop)</label>
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => onUpdateDeviceSettings(device.id, { targetLiters: Math.max(0, device.targetLiters - 1) })}
                                className="w-8 h-8 rounded bg-white border border-gray-300 font-bold text-gray-600 hover:bg-gray-50"
                              >-</button>
                              <div className="flex-1 text-center font-mono font-bold text-gray-800 bg-white border border-gray-200 py-1.5 rounded">
                                {device.targetLiters} Litri
                              </div>
                              <button 
                                onClick={() => onUpdateDeviceSettings(device.id, { targetLiters: device.targetLiters + 1 })}
                                className="w-8 h-8 rounded bg-white border border-gray-300 font-bold text-gray-600 hover:bg-gray-50"
                              >+</button>
                            </div>
                          </div>

                          {/* Auto Mode */}
                          <div className="pt-2 flex items-center gap-3">
                            <input 
                              type="checkbox" 
                              checked={device.autoMode}
                              onChange={(e) => onUpdateDeviceSettings(device.id, { autoMode: e.target.checked })}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                            />
                            <span className="text-sm font-bold text-gray-700">Abilita Modalità Automatica</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'drones' && (
          <div className="space-y-6">
            {/* Drone Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Operazioni Drone</h2>
                <p className="text-gray-600">Monitoraggio aereo avanzato integrato</p>
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

            {/* Drone Sub-tabs */}
            <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-md">
              {[
                { id: 'flights', label: 'Piani di Volo', icon: Calendar },
                { id: 'results', label: 'Risultati', icon: BarChart3 },
                { id: 'create', label: 'Crea Volo', icon: Plus }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setDroneTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    droneTab === tab.id
                      ? 'bg-green-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Drone Content */}
            {droneTab === 'flights' && (
              <div className="space-y-4">
                {loading ? (
                  <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Caricamento piani di volo...</p>
                  </div>
                ) : flightPlans.length === 0 ? (
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
                              <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                              <p className="text-sm text-gray-600">
                                {getTypeName(plan.type)} • {plan.duration} min • {plan.altitude}m
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

                        <div className="text-sm text-gray-600">
                          <strong>Programmato:</strong> {new Date(plan.scheduledDate).toLocaleString('it-IT')}
                        </div>

                        {plan.results && (
                          <div className="mt-4 grid md:grid-cols-3 gap-4 text-center">
                            <div>
                              <div className="text-2xl font-bold text-green-600">{plan.results.analysis.healthMap.overallScore}%</div>
                              <div className="text-xs text-gray-600">Salute</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-blue-600">{plan.results.imagesCapture}</div>
                              <div className="text-xs text-gray-600">Immagini</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-purple-600">{plan.results.analysis.yieldEstimation.totalEstimatedYield.toFixed(1)} kg</div>
                              <div className="text-xs text-gray-600">Resa Stimata</div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {droneTab === 'results' && (
              <div className="space-y-4">
                {flightPlans.filter(plan => plan.results).length === 0 ? (
                  <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <BarChart3 className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Nessun Risultato</h3>
                    <p className="text-gray-600">Esegui un volo per vedere i risultati</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {flightPlans.filter(plan => plan.results).map((plan) => (
                      <div key={plan.id} className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Camera className="h-6 w-6 text-blue-600" />
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">Analisi: {plan.name}</h3>
                            <p className="text-sm text-gray-600">
                              {new Date(plan.scheduledDate).toLocaleDateString('it-IT')}
                            </p>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-4 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold text-green-600 mb-2">
                              {plan.results?.analysis.healthMap.overallScore}%
                            </div>
                            <div className="text-gray-600">Salute</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-blue-600 mb-2">
                              {plan.results?.imagesCapture}
                            </div>
                            <div className="text-gray-600">Immagini</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-purple-600 mb-2">
                              {plan.results?.analysis.yieldEstimation.totalEstimatedYield.toFixed(1)} kg
                            </div>
                            <div className="text-gray-600">Resa</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-orange-600 mb-2">
                              {plan.results?.batteryUsed}%
                            </div>
                            <div className="text-gray-600">Batteria</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {droneTab === 'create' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Crea Nuovo Volo</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <button
                    onClick={createAutomaticFlight}
                    disabled={creating}
                    className="p-6 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50"
                  >
                    <Zap className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Volo Automatico</h4>
                    <p className="text-sm text-gray-600">
                      L'AI determina automaticamente il tipo di volo ottimale
                    </p>
                  </button>

                  <div className="p-6 border-2 border-gray-200 rounded-lg opacity-60">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Volo Personalizzato</h4>
                    <p className="text-sm text-gray-600">
                      Crea waypoints specifici (Prossimamente)
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Intervention Wizard */}
      {wizardOpen && selectedAction && actionContext && (
        <InterventionWizard
          isOpen={wizardOpen}
          onClose={() => {
            setWizardOpen(false)
            setSelectedAction(null)
            setActionContext(null)
          }}
          actionType={selectedAction}
          context={actionContext}
          onInterventionCreated={handleInterventionCreated}
        />
      )}
    </div>
  )
}