'use client'

import React, { useState, useEffect } from 'react'
import { 
  Bot, Calendar, MapPin, Clock, AlertTriangle, CheckCircle, 
  Droplets, Tractor, Thermometer, Cloud, Sun, Wind,
  Settings, Zap, Target, Plus, Info
} from 'lucide-react'
import { Garden, GardenTask } from '@/types'
import { format, addDays, parseISO } from 'date-fns'
import { it } from 'date-fns/locale'
import { smartOperationsService, SmartOperation, WeatherData } from '@/services/smartOperationsService'
import CalendarAlmanac from '@/components/CalendarAlmanac'
import AlmanaccoWidget from '@/components/almanacco/AlmanaccoWidget'

interface SmartPlannerProps {
  garden: Garden
  tasks: GardenTask[]
  onTasksUpdate: (tasks: GardenTask[]) => void
}

const OPERATION_TYPES = [
  { id: 'irrigation', name: 'Irrigazione', icon: Droplets, color: 'blue', weatherDependent: false },
  { id: 'plowing', name: 'Aratura', icon: Tractor, color: 'brown', weatherDependent: true },
  { id: 'fertilization', name: 'Concimazione', icon: Zap, color: 'yellow', weatherDependent: true },
  { id: 'treatment', name: 'Trattamento', icon: Settings, color: 'red', weatherDependent: true },
  { id: 'harvest', name: 'Raccolta', icon: Target, color: 'orange', weatherDependent: false },
  { id: 'sowing', name: 'Semina', icon: Plus, color: 'green', weatherDependent: true }
]

export default function SmartPlanner({ garden, tasks, onTasksUpdate }: SmartPlannerProps) {
  const [smartOperations, setSmartOperations] = useState<SmartOperation[]>([])
  const [weatherForecast, setWeatherForecast] = useState<WeatherData[]>([])
  const [showNewOperationForm, setShowNewOperationForm] = useState(false)
  const [selectedOperationType, setSelectedOperationType] = useState<string>('')
  const [activeView, setActiveView] = useState<'calendar' | 'operations' | 'ai_suggestions' | 'almanacco'>('operations')

  // Carica previsioni meteo reali
  useEffect(() => {
    const loadWeatherForecast = async () => {
      if (garden.coordinates?.latitude && garden.coordinates?.longitude) {
        try {
          const forecast = await smartOperationsService.getWeatherForecast(
            garden.coordinates.latitude,
            garden.coordinates.longitude,
            7
          )
          setWeatherForecast(forecast)
        } catch (error) {
          console.error('Error loading weather forecast:', error)
        }
      }
    }
    
    loadWeatherForecast()
  }, [garden.coordinates])

  // Analizza operazioni e genera avvisi meteo usando il servizio
  useEffect(() => {
    if (weatherForecast.length > 0 && smartOperations.length > 0) {
      const analyzedOperations = smartOperationsService.analyzeOperationsWeather(
        smartOperations,
        weatherForecast
      )
      setSmartOperations(analyzedOperations)
    }
  }, [weatherForecast, smartOperations.length])

  const createSmartOperation = (type: string, data: any) => {
    const operation: SmartOperation = {
      id: `smart-${Date.now()}`,
      type: type as any,
      name: data.name,
      scheduledDate: data.date,
      scheduledTime: data.time,
      duration: data.duration,
      zones: data.zones,
      equipment: data.equipment,
      weatherDependent: OPERATION_TYPES.find(t => t.id === type)?.weatherDependent || false,
      status: 'scheduled'
    }

    setSmartOperations(prev => [...prev, operation])
  }

  const getOperationIcon = (type: string) => {
    const opType = OPERATION_TYPES.find(t => t.id === type)
    return opType?.icon || Settings
  }

  const getOperationColor = (type: string) => {
    const opType = OPERATION_TYPES.find(t => t.id === type)
    return opType?.color || 'gray'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'weather_warning': return 'border-l-orange-500 bg-orange-50'
      case 'ready': return 'border-l-green-500 bg-green-50'
      case 'completed': return 'border-l-blue-500 bg-blue-50'
      case 'cancelled': return 'border-l-red-500 bg-red-50'
      default: return 'border-l-gray-300 bg-white'
    }
  }

  const generateAISuggestions = () => {
    return smartOperationsService.generateAISuggestions(
      smartOperations,
      weatherForecast,
      { garden, tasks }
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Bot className="text-green-600" size={28} />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Smart Planner</h2>
              <p className="text-gray-600">Pianificazione intelligente con controlli meteo e sistemi smart</p>
            </div>
          </div>

          <button
            onClick={() => setShowNewOperationForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus size={16} />
            Nuova Operazione
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {[
            { id: 'operations', label: 'Operazioni Smart', icon: Settings },
            { id: 'calendar', label: 'Calendario', icon: Calendar },
            { id: 'almanacco', label: 'Almanacco', icon: Sun },
            { id: 'ai_suggestions', label: 'Suggerimenti AI', icon: Bot }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === tab.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Operazioni Smart */}
      {activeView === 'operations' && (
        <div className="space-y-4">
          {/* Previsioni Meteo */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Cloud className="text-blue-500" size={20} />
              Previsioni Meteo (7 giorni)
            </h3>
            
            <div className="grid grid-cols-7 gap-3">
              {weatherForecast.map((day, index) => (
                <div key={day.date} className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">
                    {index === 0 ? 'Oggi' : index === 1 ? 'Domani' : format(parseISO(day.date), 'EEE', { locale: it })}
                  </div>
                  <div className="mb-2">
                    {day.conditions === 'sunny' && <Sun className="text-yellow-500 mx-auto" size={20} />}
                    {day.conditions === 'cloudy' && <Cloud className="text-gray-500 mx-auto" size={20} />}
                    {day.conditions === 'rain' && <Cloud className="text-blue-500 mx-auto" size={20} />}
                  </div>
                  <div className="text-sm font-medium">{day.temp.toFixed(0)}°C</div>
                  {day.precipitation > 0 && (
                    <div className="text-xs text-blue-600">{day.precipitation.toFixed(0)}mm</div>
                  )}
                  <div className="text-xs text-gray-500">{day.windSpeed.toFixed(0)} km/h</div>
                </div>
              ))}
            </div>
          </div>

          {/* Lista Operazioni */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Operazioni Programmate</h3>
            </div>

            {smartOperations.length === 0 ? (
              <div className="p-12 text-center">
                <Settings className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nessuna operazione programmata</h3>
                <p className="text-gray-600 mb-4">Inizia programmando la tua prima operazione smart</p>
                <button
                  onClick={() => setShowNewOperationForm(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Programma Operazione
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {smartOperations.map((operation) => {
                  const Icon = getOperationIcon(operation.type)
                  
                  return (
                    <div key={operation.id} className={`p-6 border-l-4 ${getStatusColor(operation.status)}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-lg bg-${getOperationColor(operation.type)}-100`}>
                            <Icon className={`text-${getOperationColor(operation.type)}-600`} size={20} />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-900">{operation.name}</h4>
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                                {OPERATION_TYPES.find(t => t.id === operation.type)?.name}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                              <div className="flex items-center gap-1">
                                <Calendar size={14} />
                                <span>{format(parseISO(operation.scheduledDate), 'dd/MM/yyyy')}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock size={14} />
                                <span>{operation.scheduledTime} ({operation.duration} min)</span>
                              </div>
                              {operation.zones && (
                                <div className="flex items-center gap-1">
                                  <MapPin size={14} />
                                  <span>{operation.zones.join(', ')}</span>
                                </div>
                              )}
                            </div>

                            {operation.weatherWarning && (
                              <div className="bg-orange-100 border border-orange-200 rounded-lg p-3 mt-3">
                                <div className="flex items-start gap-2">
                                  <AlertTriangle className="text-orange-600 mt-0.5" size={16} />
                                  <div className="text-sm text-orange-800">
                                    <strong>Avviso Meteo:</strong>
                                    <p className="mt-1">{operation.weatherWarning}</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {operation.aiSuggestion && (
                              <div className="bg-blue-100 border border-blue-200 rounded-lg p-3 mt-3">
                                <div className="flex items-start gap-2">
                                  <Bot className="text-blue-600 mt-0.5" size={16} />
                                  <div className="text-sm text-blue-800">
                                    <strong>Suggerimento AI:</strong>
                                    <p className="mt-1">{operation.aiSuggestion}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {operation.status === 'weather_warning' && (
                            <button className="px-3 py-1 bg-orange-100 text-orange-800 rounded text-sm font-medium">
                              Riprogramma
                            </button>
                          )}
                          {operation.status === 'ready' && (
                            <button className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm font-medium">
                              Avvia
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Vista Calendario */}
      {activeView === 'calendar' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="text-green-600" size={20} />
            Calendario Operazioni
          </h3>
          <CalendarAlmanac 
            tasks={tasks}
            onDateClick={(date) => {
              // Quando clicchi su una data, apri il form per creare un'operazione
              setShowNewOperationForm(true)
            }}
            onUpdateTask={(task) => {
              // Aggiorna task se necessario
              onTasksUpdate(tasks.map(t => t.id === task.id ? task : t))
            }}
          />
        </div>
      )}

      {/* Vista Almanacco */}
      {activeView === 'almanacco' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Sun className="text-amber-600" size={20} />
              Almanacco del Contadino
            </h3>
            <AlmanaccoWidget 
              date={new Date()}
            />
          </div>
        </div>
      )}

      {/* Suggerimenti AI */}
      {activeView === 'ai_suggestions' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Bot className="text-green-600" size={20} />
              Suggerimenti AI Personalizzati
            </h3>

            <div className="space-y-4">
              {generateAISuggestions().map((suggestion, index) => {
                const Icon = getOperationIcon(suggestion.type)
                
                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg bg-${getOperationColor(suggestion.type)}-100`}>
                        <Icon className={`text-${getOperationColor(suggestion.type)}-600`} size={18} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-gray-900">Suggerimento AI</span>
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                            {suggestion.confidence}% confidenza
                          </span>
                        </div>
                        
                        <p className="text-gray-700 mb-2">{suggestion.message}</p>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Info size={14} />
                          <span>{suggestion.reasoning}</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => {
                          setSelectedOperationType(suggestion.type)
                          setShowNewOperationForm(true)
                        }}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm font-medium hover:bg-green-200 transition-colors"
                      >
                        Programma
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Form Nuova Operazione */}
      {showNewOperationForm && (
        <NewOperationModal
          selectedType={selectedOperationType}
          onSave={(data) => {
            createSmartOperation(data.type, data)
            setShowNewOperationForm(false)
            setSelectedOperationType('')
          }}
          onCancel={() => {
            setShowNewOperationForm(false)
            setSelectedOperationType('')
          }}
        />
      )}
    </div>
  )
}

// Modal per nuova operazione
interface NewOperationModalProps {
  selectedType: string
  onSave: (data: any) => void
  onCancel: () => void
}

function NewOperationModal({ selectedType, onSave, onCancel }: NewOperationModalProps) {
  const [formData, setFormData] = useState({
    type: selectedType || 'irrigation',
    name: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '08:00',
    duration: 60,
    zones: [] as string[],
    equipment: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name) return
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Nuova Operazione Smart</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Operazione</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {OPERATION_TYPES.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Operazione</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="es. Irrigazione zona Nord"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ora</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Durata (minuti)</label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              min="1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Zone/Filari</label>
            <input
              type="text"
              value={formData.zones.join(', ')}
              onChange={(e) => setFormData(prev => ({ ...prev, zones: e.target.value.split(',').map(z => z.trim()) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="es. Zona A, Filare 1-3"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors"
            >
              Programma
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}