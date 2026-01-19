'use client'

import React, { useState, useEffect } from 'react'
import { 
  CircleDot, 
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
  Sun,
  Leaf,
  Target,
  Calculator
} from 'lucide-react'
import { Garden } from '@/types'
import DensityCalculator from '../orchard/DensityCalculator'
import OliveMaturityTracker from './OliveMaturityTracker'
import OliveFlyMonitor from './OliveFlyMonitor'

interface OliveManagementDashboardProps {
  garden: Garden
  onAction: (action: string, data?: any) => void
}

interface ManagementTask {
  id: string
  type: 'pruning' | 'treatment' | 'harvest' | 'irrigation' | 'monitoring' | 'fertilization'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  dueDate: Date
  status: 'pending' | 'in-progress' | 'completed'
  oliveSection?: string
}

export default function OliveManagementDashboard({ garden, onAction }: OliveManagementDashboardProps) {
  const [tasks, setTasks] = useState<ManagementTask[]>([])
  const [selectedSection, setSelectedSection] = useState<string>('all')
  const [weatherData, setWeatherData] = useState<any>(null)
  const [oliveGroveHealth, setOliveGroveHealth] = useState<any>(null)
  const [productionData, setProductionData] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'maturity-tracking' | 'fly-monitoring' | 'density-calculator'>('overview')

  useEffect(() => {
    loadManagementData()
    loadWeatherData()
    loadHealthData()
    loadProductionData()
  }, [garden.id])

  const loadManagementData = () => {
    // Generate sample management tasks for olive grove
    const sampleTasks: ManagementTask[] = [
      {
        id: '1',
        type: 'pruning',
        title: 'Potatura di Produzione',
        description: 'Potatura per ottimizzare la produzione di olive e facilitare la raccolta',
        priority: 'high',
        dueDate: new Date('2026-02-28'),
        status: 'pending',
        oliveSection: 'Settore Nord'
      },
      {
        id: '2',
        type: 'treatment',
        title: 'Trattamento Mosca Olearia',
        description: 'Trattamento preventivo contro la mosca olearia (Bactrocera oleae)',
        priority: 'high',
        dueDate: new Date('2026-06-15'),
        status: 'pending',
        oliveSection: 'Tutto l\'oliveto'
      },
      {
        id: '3',
        type: 'fertilization',
        title: 'Concimazione Primaverile',
        description: 'Applicazione concime NPK per supportare la fioritura e allegagione',
        priority: 'medium',
        dueDate: new Date('2026-03-15'),
        status: 'pending',
        oliveSection: 'Tutto l\'oliveto'
      },
      {
        id: '4',
        type: 'monitoring',
        title: 'Controllo Fioritura',
        description: 'Monitoraggio fase di fioritura e impollinazione',
        priority: 'medium',
        dueDate: new Date('2026-05-01'),
        status: 'pending',
        oliveSection: 'Settore Sud'
      },
      {
        id: '5',
        type: 'harvest',
        title: 'Raccolta Olive da Olio',
        description: 'Raccolta meccanica delle olive per la produzione di olio extravergine',
        priority: 'high',
        dueDate: new Date('2026-10-15'),
        status: 'pending',
        oliveSection: 'Tutto l\'oliveto'
      },
      {
        id: '6',
        type: 'irrigation',
        title: 'Irrigazione di Soccorso',
        description: 'Irrigazione durante periodo siccitoso per supportare sviluppo frutti',
        priority: 'medium',
        dueDate: new Date('2026-07-01'),
        status: 'pending',
        oliveSection: 'Settore Est'
      }
    ]
    setTasks(sampleTasks)
  }

  const loadWeatherData = () => {
    // Simulate weather data specific for olive cultivation
    setWeatherData({
      temperature: 22,
      humidity: 58,
      rainfall: 1.2,
      windSpeed: 8,
      forecast: [
        { day: 'Oggi', temp: 22, condition: 'sunny', rain: 0 },
        { day: 'Domani', temp: 24, condition: 'partly-cloudy', rain: 0 },
        { day: 'Dopodomani', temp: 19, condition: 'rainy', rain: 5 }
      ]
    })
  }

  const loadHealthData = () => {
    // Simulate olive grove health data
    setOliveGroveHealth({
      overallHealth: 88,
      diseaseRisk: 'medium',
      stressLevel: 'low',
      pestPressure: 'low',
      recommendations: [
        'Monitorare presenza mosca olearia',
        'Controllare umidità del suolo',
        'Verificare stato nutrizionale foglie',
        'Programmare potatura verde'
      ]
    })
  }

  const loadProductionData = () => {
    // Simulate production data
    setProductionData({
      expectedYield: 1200, // kg
      lastYearYield: 1050,
      oilContent: 18.5, // %
      qualityGrade: 'Extra Vergine',
      harvestWindow: {
        start: new Date('2026-10-01'),
        end: new Date('2026-11-15')
      }
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
      case 'harvest': return <CircleDot className="w-5 h-5" />
      case 'irrigation': return <Droplets className="w-5 h-5" />
      case 'monitoring': return <BarChart3 className="w-5 h-5" />
      case 'fertilization': return <Leaf className="w-5 h-5" />
      default: return <Calendar className="w-5 h-5" />
    }
  }

  const filteredTasks = selectedSection === 'all' 
    ? tasks 
    : tasks.filter(task => task.oliveSection === selectedSection)

  const oliveConfig = garden.oliveGroveConfig

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'overview'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <BarChart3 size={16} />
            Gestione Completa
          </button>
          <button
            onClick={() => setActiveTab('maturity-tracking')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'maturity-tracking'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <CircleDot size={16} />
            Maturazione
          </button>
          <button
            onClick={() => setActiveTab('fly-monitoring')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'fly-monitoring'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Bug size={16} />
            Mosca Olearia
          </button>
          <button
            onClick={() => setActiveTab('density-calculator')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'density-calculator'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Calculator size={16} />
            Calcolo Densità
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'density-calculator' ? (
        <DensityCalculator />
      ) : activeTab === 'maturity-tracking' ? (
        <OliveMaturityTracker oliveGroveId={garden.id} oliveGroveName={garden.name} />
      ) : activeTab === 'fly-monitoring' ? (
        <OliveFlyMonitor oliveGroveId={garden.id} oliveGroveName={garden.name} />
      ) : (
        <>
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-yellow-50 rounded-xl border border-green-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <CircleDot className="text-green-600" size={32} />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{garden.name} - Oliveto</h2>
              <p className="text-gray-600">
                {oliveConfig?.totalTrees || 'N/A'} alberi • 
                {oliveConfig?.type === 'OIL' ? ' Da Olio' : oliveConfig?.type === 'TABLE' ? ' Da Mensa' : ' Dual-Purpose'} • 
                {garden.sizeSqMeters ? (garden.sizeSqMeters / 10000).toFixed(1) + ' ettari' : 'N/A'}
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
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="text-green-600" size={16} />
              <span className="text-sm font-medium text-gray-700">Salute Oliveto</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {oliveGroveHealth?.overallHealth || 0}%
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="text-yellow-600" size={16} />
              <span className="text-sm font-medium text-gray-700">Task Urgenti</span>
            </div>
            <div className="text-2xl font-bold text-yellow-600">
              {tasks.filter(t => t.priority === 'high' && t.status === 'pending').length}
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Target className="text-blue-600" size={16} />
              <span className="text-sm font-medium text-gray-700">Resa Attesa</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {productionData?.expectedYield || 0} kg
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-purple-600" size={16} />
              <span className="text-sm font-medium text-gray-700">vs Anno Scorso</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {productionData ? `+${Math.round(((productionData.expectedYield - productionData.lastYearYield) / productionData.lastYearYield) * 100)}%` : '0%'}
            </div>
          </div>
        </div>
      </div>

      {/* Production Overview */}
      {productionData && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="text-green-600" size={20} />
            Panoramica Produzione 2026
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {productionData.expectedYield} kg
              </div>
              <div className="text-sm text-gray-600">Resa Prevista</div>
            </div>

            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {productionData.oilContent}%
              </div>
              <div className="text-sm text-gray-600">Contenuto Olio</div>
            </div>

            <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-600 mb-1">
                {productionData.qualityGrade}
              </div>
              <div className="text-sm text-gray-600">Qualità Attesa</div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                45 gg
              </div>
              <div className="text-sm text-gray-600">Finestra Raccolta</div>
            </div>
          </div>
        </div>
      )}

      {/* Weather Widget */}
      {weatherData && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Cloud className="text-blue-600" size={20} />
            Condizioni Meteo per Olivicoltura
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-gray-600">Condizioni Attuali</div>
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
              <div className="text-xs text-gray-500">
                {weatherData.rainfall < 5 ? 'Possibile stress idrico' : 'Buone condizioni'}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-gray-600">Vento</div>
              <div className="text-lg font-semibold text-gray-900">{weatherData.windSpeed} km/h</div>
              <div className="text-xs text-gray-500">
                {weatherData.windSpeed > 15 ? 'Attenzione trattamenti' : 'Ideale per trattamenti'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Management Tasks */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Calendario Gestione Oliveto</h3>
            <button
              onClick={() => onAction('add-task')}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Tutto l'Oliveto
            </button>
            <button
              onClick={() => setSelectedSection('Settore Nord')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                selectedSection === 'Settore Nord'
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Settore Nord
            </button>
            <button
              onClick={() => setSelectedSection('Settore Sud')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                selectedSection === 'Settore Sud'
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Settore Sud
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
                    {task.oliveSection && (
                      <span>🫒 {task.oliveSection}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => onAction('start-task', task)}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors"
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
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors"
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
      {oliveGroveHealth && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="text-green-600" size={20} />
            Raccomandazioni Fitosanitarie
          </h3>
          
          <div className="space-y-3">
            {oliveGroveHealth.recommendations.map((rec: string, idx: number) => (
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Azioni Rapide Oliveto</h3>
        
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
            <span className="text-sm font-medium text-gray-900">Trattamento Mosca</span>
          </button>
          
          <button
            onClick={() => onAction('plan-harvest')}
            className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <CircleDot className="text-green-600" size={24} />
            <span className="text-sm font-medium text-gray-900">Pianifica Raccolta</span>
          </button>
          
          <button
            onClick={() => onAction('view-analytics')}
            className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <BarChart3 className="text-purple-600" size={24} />
            <span className="text-sm font-medium text-gray-900">Analisi Produzione</span>
          </button>
        </div>
      </div>
        </>
      )}
    </div>
  )
}