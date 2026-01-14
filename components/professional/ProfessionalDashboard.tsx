/**
 * Professional Dashboard - Command Center per Professionisti
 * Espone le funzionalità del Director in modo ottimizzato per uso professionale
 */

'use client'

import React, { useState, useEffect } from 'react'
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Droplets, 
  Thermometer,
  Wind,
  Sun,
  Moon,
  Activity,
  BarChart3,
  Settings,
  Calendar,
  MapPin,
  Leaf,
  Shield,
  Zap,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Eye,
  FileText
} from 'lucide-react'
import { Garden, GardenTask, DailyPlan } from '@/types'
import { getDailyGardenPlan } from '@/logic/director'

interface ProfessionalDashboardProps {
  garden: Garden
  tasks: GardenTask[]
  onTaskAction?: (action: string, taskId?: string) => void
  onNavigate?: (path: string) => void
}

interface PrioritySection {
  id: string
  title: string
  icon: React.ComponentType<any>
  color: string
  items: any[]
  expanded: boolean
}

export default function ProfessionalDashboard({
  garden,
  tasks,
  onTaskAction,
  onNavigate
}: ProfessionalDashboardProps) {
  const [dailyPlan, setDailyPlan] = useState<DailyPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    alerts: true,
    lifecycle: true,
    baseline: false,
    irrigation: false,
    analytics: false
  })

  // Carica piano giornaliero dal Director
  useEffect(() => {
    const loadDailyPlan = async () => {
      try {
        setLoading(true)
        const plan = await getDailyGardenPlan(garden, tasks)
        setDailyPlan(plan)
      } catch (error) {
        console.error('Error loading daily plan:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDailyPlan()
  }, [garden, tasks])

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'border-red-500 bg-red-50'
      case 'High': return 'border-orange-500 bg-orange-50'
      case 'Medium': return 'border-yellow-500 bg-yellow-50'
      case 'Low': return 'border-green-500 bg-green-50'
      default: return 'border-gray-300 bg-gray-50'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'Critical': return <AlertTriangle className="text-red-600" size={16} />
      case 'High': return <AlertTriangle className="text-orange-600" size={16} />
      case 'Medium': return <Clock className="text-yellow-600" size={16} />
      case 'Low': return <CheckCircle className="text-green-600" size={16} />
      default: return <Activity className="text-gray-600" size={16} />
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">Caricamento piano operativo...</span>
        </div>
      </div>
    )
  }

  if (!dailyPlan) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="text-center py-12 text-gray-500">
          <AlertTriangle size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">Errore caricamento piano</p>
          <p className="text-sm">Riprova più tardi</p>
        </div>
      </div>
    )
  }

  // Organizza le sezioni per priorità
  const sections: PrioritySection[] = [
    {
      id: 'alerts',
      title: 'Allerte Operative',
      icon: AlertTriangle,
      color: dailyPlan.urgentAlerts.length > 0 ? 'text-red-600' : 'text-gray-400',
      items: dailyPlan.urgentAlerts,
      expanded: expandedSections.alerts
    },
    {
      id: 'lifecycle',
      title: 'Operazioni Prioritarie',
      icon: Activity,
      color: dailyPlan.lifecycleTasks.length > 0 ? 'text-blue-600' : 'text-gray-400',
      items: dailyPlan.lifecycleTasks,
      expanded: expandedSections.lifecycle
    },
    {
      id: 'baseline',
      title: 'Baseline Stagionale',
      icon: Calendar,
      color: dailyPlan.baselinePrompts?.length ? 'text-green-600' : 'text-gray-400',
      items: dailyPlan.baselinePrompts || [],
      expanded: expandedSections.baseline
    },
    {
      id: 'irrigation',
      title: 'Gestione Idrica',
      icon: Droplets,
      color: dailyPlan.irrigationTasks?.length ? 'text-blue-600' : 'text-gray-400',
      items: dailyPlan.irrigationTasks || [],
      expanded: expandedSections.irrigation
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header Professionale */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <BarChart3 className="text-green-600" size={28} />
              Command Center Professionale
            </h2>
            <p className="text-gray-600 mt-1">
              Piano operativo generato dal Director • {new Date(dailyPlan.date).toLocaleDateString('it-IT')}
            </p>
          </div>
          
          {/* Status Generale */}
          <div className={`px-4 py-2 rounded-full border-2 ${getPriorityColor(dailyPlan.priority)}`}>
            <div className="flex items-center gap-2">
              {getPriorityIcon(dailyPlan.priority)}
              <span className="font-semibold text-sm">
                Priorità: {dailyPlan.priority}
              </span>
            </div>
          </div>
        </div>

        {/* KPI Rapidi */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="text-lg font-bold text-red-600">{dailyPlan.urgentAlerts.length}</div>
            <div className="text-xs text-red-600">Allerte</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-lg font-bold text-blue-600">{dailyPlan.lifecycleTasks.length}</div>
            <div className="text-xs text-blue-600">Operazioni</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-lg font-bold text-green-600">{dailyPlan.nutrientTasks.length}</div>
            <div className="text-xs text-green-600">Nutrizione</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-lg font-bold text-purple-600">{dailyPlan.healthTasks.length}</div>
            <div className="text-xs text-purple-600">Salute</div>
          </div>
        </div>
      </div>

      {/* Sezioni Operative */}
      {sections.map((section) => (
        <div key={section.id} className="bg-white rounded-xl border border-gray-200">
          {/* Header Sezione */}
          <div 
            className="p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleSection(section.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <section.icon className={section.color} size={20} />
                <h3 className="font-semibold text-gray-900">{section.title}</h3>
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                  {section.items.length}
                </span>
              </div>
              {section.expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </div>

          {/* Contenuto Sezione */}
          {section.expanded && (
            <div className="p-4">
              {section.items.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle size={32} className="mx-auto mb-2 text-green-500" />
                  <p className="text-sm">Tutto sotto controllo</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {section.items.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      {/* Allerte */}
                      {section.id === 'alerts' && (
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="text-red-500 mt-1 flex-shrink-0" size={16} />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">{item.message}</h4>
                            <p className="text-sm text-gray-600 mb-2">{item.action}</p>
                            {item.blockOperations && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Blocca Operazioni
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Operazioni Lifecycle */}
                      {section.id === 'lifecycle' && (
                        <div className="flex items-start gap-3">
                          {getPriorityIcon(item.priority)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900">{item.plantName}</h4>
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                {item.phase}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{item.message}</p>
                            {item.action && (
                              <p className="text-sm text-green-700 bg-green-50 p-2 rounded border-l-4 border-green-500">
                                <strong>Azione:</strong> {item.action}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => onTaskAction?.('view', item.taskId)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      )}

                      {/* Baseline Stagionale */}
                      {section.id === 'baseline' && (
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <Calendar className="text-green-500 mt-1 flex-shrink-0" size={16} />
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                              <p className="text-sm text-gray-600 mb-3">{item.body}</p>
                              
                              {/* Opzioni Azione */}
                              {item.options && (
                                <div className="flex flex-wrap gap-2">
                                  {item.options.map((option: any, optIndex: number) => (
                                    <button
                                      key={optIndex}
                                      onClick={() => {
                                        if (option.actionType === 'create_task') {
                                          onTaskAction?.('create', option.createTask?.taskType)
                                        } else if (option.actionType === 'open_wizard') {
                                          onNavigate?.(option.href)
                                        }
                                      }}
                                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                        option.actionType === 'create_task'
                                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                          : option.actionType === 'open_wizard'
                                          ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                      }`}
                                    >
                                      {option.label}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Irrigazione */}
                      {section.id === 'irrigation' && (
                        <div className="flex items-start gap-3">
                          <Droplets className="text-blue-500 mt-1 flex-shrink-0" size={16} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900">{item.zoneName}</h4>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                item.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {item.priority}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Litri necessari:</span>
                                <span className="ml-2 font-semibold">{item.litersNeeded}L</span>
                              </div>
                              {item.durationMinutes && (
                                <div>
                                  <span className="text-gray-600">Durata:</span>
                                  <span className="ml-2 font-semibold">{item.durationMinutes} min</span>
                                </div>
                              )}
                            </div>
                            {item.weatherAdjustment && (
                              <p className="text-xs text-blue-600 mt-2 bg-blue-50 p-2 rounded">
                                {item.weatherAdjustment}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Pannello Informazioni Aggiuntive */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Condizioni Climatiche */}
        {dailyPlan.climateWarnings.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Thermometer className="text-orange-500" size={18} />
              Condizioni Climatiche
            </h3>
            <div className="space-y-2">
              {dailyPlan.climateWarnings.map((warning, index) => (
                <div key={index} className="text-sm p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="font-medium text-yellow-800">{warning.message}</div>
                  <div className="text-yellow-700">{warning.recommendation}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Consiglio Lunare */}
        {dailyPlan.lunarAdvice && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Moon className="text-purple-500" size={18} />
              Calendario Lunare
            </h3>
            <div className="text-sm">
              <div className="font-medium text-purple-800 mb-1">
                {dailyPlan.lunarAdvice.phaseName}
              </div>
              <div className="text-gray-600 mb-2">{dailyPlan.lunarAdvice.advice}</div>
              {dailyPlan.lunarAdvice.idealFor.length > 0 && (
                <div className="text-xs text-purple-600">
                  <strong>Ideale per:</strong> {dailyPlan.lunarAdvice.idealFor.join(', ')}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Azioni Rapide */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Zap className="text-yellow-500" size={18} />
          Azioni Rapide
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => onNavigate?.('/app/registry')}
            className="flex items-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <FileText className="text-blue-600" size={16} />
            <span className="text-sm font-medium text-blue-800">Registro</span>
          </button>
          <button
            onClick={() => onNavigate?.('/app/compliance')}
            className="flex items-center gap-2 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <Shield className="text-green-600" size={16} />
            <span className="text-sm font-medium text-green-800">Compliance</span>
          </button>
          <button
            onClick={() => onNavigate?.('/app/analytics')}
            className="flex items-center gap-2 p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <BarChart3 className="text-purple-600" size={16} />
            <span className="text-sm font-medium text-purple-800">Analytics</span>
          </button>
          <button
            onClick={() => onNavigate?.('/app/planner')}
            className="flex items-center gap-2 p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
          >
            <Calendar className="text-orange-600" size={16} />
            <span className="text-sm font-medium text-orange-800">Planner AI</span>
          </button>
        </div>
      </div>
    </div>
  )
}