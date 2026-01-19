'use client'

import React, { useState, useEffect } from 'react'
import { 
  Grape, 
  Scissors, 
  Calendar, 
  Droplets, 
  Bug, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Plus,
  Settings,
  BarChart3,
  Thermometer,
  Cloud,
  Sun
} from 'lucide-react'
import { VineyardConfiguration } from '@/types/vineyard'

interface VineyardManagementDashboardProps {
  vineyard: VineyardConfiguration
  onAction: (action: string, data?: any) => void
}

interface ManagementTask {
  id: string
  type: 'pruning' | 'treatment' | 'harvest' | 'irrigation' | 'monitoring'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  dueDate: Date
  status: 'pending' | 'in-progress' | 'completed'
  vineSection?: string
}

export default function VineyardManagementDashboard({ vineyard, onAction }: VineyardManagementDashboardProps) {
  const [tasks, setTasks] = useState<ManagementTask[]>([])
  const [selectedSection, setSelectedSection] = useState<string>('all')
  const [weatherData, setWeatherData] = useState<any>(null)
  const [vineyardHealth, setVineyardHealth] = useState<any>(null)

  useEffect(() => {
    loadManagementData()
    loadWeatherData()
    loadHealthData()
  }, [vineyard.id])

  const loadManagementData = () => {
    // Generate sample management tasks
    const sampleTasks: ManagementTask[] = [
      {
        id: '1',
        type: 'pruning',
        title: 'Potatura Invernale',
        description: 'Potatura di formazione e produzione per la stagione 2026',
        priority: 'high',
        dueDate: new Date('2026-02-15'),
        status: 'pending',
        vineSection: 'Blocco A'
      },
      {
        id: '2',
        type: 'treatment',
        title: 'Trattamento Preventivo Peronospora',
        description: 'Applicazione fungicida preventivo contro peronospora',
        priority: 'medium',
        dueDate: new Date('2026-03-01'),
        status: 'pending',
        vineSection: 'Tutto il vigneto'
      },
      {
        id: '3',
        type: 'monitoring',
        title: 'Controllo Germogliamento',
        description: 'Monitoraggio fase di germogliamento e sviluppo vegetativo',
        priority: 'medium',
        dueDate: new Date('2026-04-10'),
        status: 'pending',
        vineSection: 'Blocco B'
      },
      {
        id: '4',
        type: 'irrigation',
        title: 'Attivazione Impianto Irrigazione',
        description: 'Controllo e attivazione sistema di irrigazione a goccia',
        priority: 'high',
        dueDate: new Date('2026-05-01'),
        status: 'pending',
        vineSection: 'Tutto il vigneto'
      }
    ]
    setTasks(sampleTasks)
  }

  const loadWeatherData = () => {
    // Simulate weather data
    setWeatherData({
      temperature: 18,
      humidity: 65,
      rainfall: 2.5,
      windSpeed: 12,
      forecast: [
        { day: 'Oggi', temp: 18, condition: 'sunny', rain: 0 },
        { day: 'Domani', temp: 20, condition: 'cloudy', rain: 0 },
        { day: 'Dopodomani', temp: 16, condition: 'rainy', rain: 8 }
      ]
    })
  }

  const loadHealthData = () => {
    // Simulate vineyard health data
    setVineyardHealth({
      overallHealth: 85,
      diseaseRisk: 'low',
      stressLevel: 'minimal',
      recommendations: [
        'Monitorare umidità del suolo',
        'Controllare presenza di parassiti',
        'Programmare potatura verde'
      ]
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'pruning': return <Scissors className="w-5 h-5" />
      case 'treatment': return <Bug className="w-5 h-5" />
      case 'harvest': return <Grape className="w-5 h-5" />
      case 'irrigation': return <Droplets className="w-5 h-5" />
      case 'monitoring': return <BarChart3 className="w-5 h-5" />
      default: return <Calendar className="w-5 h-5" />
    }
  }

  const filteredTasks = selectedSection === 'all' 
    ? tasks 
    : tasks.filter(task => task.vineSection === selectedSection)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Grape className="text-purple-600" size={32} />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{vineyard.name}</h2>
              <p className="text-gray-600">
                {vineyard.totalVines} viti • {vineyard.mainVarieties?.length || 0} varietà • {vineyard.hectares} ettari
              </p>
            </div>
          </div>
          <button
            onClick={() => onAction('settings')}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
          >
            <Settings size={20} />
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="text-green-600" size={16} />
              <span className="text-sm font-medium text-gray-700">Salute Generale</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {vineyardHealth?.overallHealth || 0}%
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="text-yellow-600" size={16} />
              <span className="text-sm font-medium text-gray-700">Task Urgenti</span>
            </div>
            <div className="text-2xl font-bold text-yellow-600">
              {tasks.filter(t => t.priority === 'high' && t.status === 'pending').length}
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Thermometer className="text-blue-600" size={16} />
              <span className="text-sm font-medium text-gray-700">Temperatura</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {weatherData?.temperature || 0}°C
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-purple-600" size={16} />
              <span className="text-sm font-medium text-gray-700">Produttività</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">+12%</div>
          </div>
        </div>
      </div>

      {/* Weather Widget */}
      {weatherData && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Cloud className="text-blue-600" size={20} />
            Condizioni Meteo
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-gray-600">Oggi</div>
              <div className="flex items-center gap-3">
                <Sun className="text-yellow-500" size={24} />
                <div>
                  <div className="text-xl font-bold text-gray-900">{weatherData.temperature}°C</div>
                  <div className="text-sm text-gray-600">Umidità {weatherData.humidity}%</div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-gray-600">Precipitazioni (7gg)</div>
              <div className="text-lg font-semibold text-blue-600">{weatherData.rainfall}mm</div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-gray-600">Vento</div>
              <div className="text-lg font-semibold text-gray-900">{weatherData.windSpeed} km/h</div>
            </div>
          </div>

          {/* Forecast */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex gap-4">
              {weatherData.forecast.map((day: any, idx: number) => (
                <div key={idx} className="flex-1 text-center">
                  <div className="text-xs text-gray-600 mb-1">{day.day}</div>
                  <div className="text-sm font-medium text-gray-900">{day.temp}°C</div>
                  {day.rain > 0 && (
                    <div className="text-xs text-blue-600">{day.rain}mm</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Management Tasks */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Attività di Gestione</h3>
            <button
              onClick={() => onAction('add-task')}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus size={16} />
              Nuova Attività
            </button>
          </div>

          {/* Section Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedSection('all')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                selectedSection === 'all'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Tutte le Sezioni
            </button>
            <button
              onClick={() => setSelectedSection('Blocco A')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                selectedSection === 'Blocco A'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Blocco A
            </button>
            <button
              onClick={() => setSelectedSection('Blocco B')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                selectedSection === 'Blocco B'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Blocco B
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredTasks.map((task) => (
            <div key={task.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${getPriorityColor(task.priority)}`}>
                  {getTaskIcon(task.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{task.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Bassa'}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        task.status === 'completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status === 'completed' ? 'Completato' :
                         task.status === 'in-progress' ? 'In Corso' : 'Da Fare'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>📅 Scadenza: {task.dueDate.toLocaleDateString('it-IT')}</span>
                    {task.vineSection && (
                      <span>📍 {task.vineSection}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => onAction('start-task', task)}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm hover:bg-purple-200 transition-colors"
                    >
                      Inizia
                    </button>
                    <button
                      onClick={() => onAction('edit-task', task)}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                    >
                      Modifica
                    </button>
                    <button
                      onClick={() => onAction('complete-task', task)}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors"
                    >
                      Completa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Health Recommendations */}
      {vineyardHealth && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="text-green-600" size={20} />
            Raccomandazioni Salute Vigneto
          </h3>
          
          <div className="space-y-3">
            {vineyardHealth.recommendations.map((rec: string, idx: number) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-green-800">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Azioni Rapide</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => onAction('schedule-pruning')}
            className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Scissors className="text-orange-600" size={24} />
            <span className="text-sm font-medium text-gray-900">Programma Potatura</span>
          </button>
          
          <button
            onClick={() => onAction('schedule-treatment')}
            className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Bug className="text-red-600" size={24} />
            <span className="text-sm font-medium text-gray-900">Programma Trattamento</span>
          </button>
          
          <button
            onClick={() => onAction('check-irrigation')}
            className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Droplets className="text-blue-600" size={24} />
            <span className="text-sm font-medium text-gray-900">Controllo Irrigazione</span>
          </button>
          
          <button
            onClick={() => onAction('view-analytics')}
            className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <BarChart3 className="text-purple-600" size={24} />
            <span className="text-sm font-medium text-gray-900">Analisi Dati</span>
          </button>
        </div>
      </div>
    </div>
  )
}