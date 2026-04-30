'use client'

import React, { useState, useEffect } from 'react'
import { 
  Lightbulb, 
  RefreshCw, 
  Bug, 
  Leaf, 
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Filter,
  Download,
  Plus,
  Eye,
  Target,
  Droplets,
  Sun,
  Thermometer
} from 'lucide-react'
import CropRotationPlanner from '@/components/advice/CropRotationPlanner'
import BiologicalControlDashboard from '@/components/advice/BiologicalControlDashboard'
import { useGarden } from '@/packages/core/hooks/useGarden'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { resolveGardenContext } from '@/services/gardenContextResolverService'
import type { GardenTask } from '@/types'

interface AIAdvice {
  id: string
  type: 'rotation' | 'biological_control' | 'nutrition' | 'irrigation' | 'weather' | 'pest_prevention' | 'harvest_timing'
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  confidence: number
  plantName?: string
  zone?: string
  timing: string
  actions: AdviceAction[]
  benefits: string[]
  risks?: string[]
  createdAt: string
  validUntil?: string
  weatherDependent: boolean
  seasonalRelevance: number
}

interface AdviceAction {
  type: 'immediate' | 'scheduled' | 'monitoring' | 'preparation'
  title: string
  description: string
  estimatedTime: string
  difficulty: 'easy' | 'medium' | 'hard'
  cost?: number
  materials?: string[]
}

type TaskFeedback = {
  type: 'success' | 'error' | 'info'
  message: string
}

export default function AdvicePage() {
  const { activeGarden } = useGarden()
  const { storageProvider } = useStorage()
  const [activeTab, setActiveTab] = useState<'overview' | 'rotation' | 'biological' | 'ai-suggestions' | 'seasonal'>('overview')
  const [advice, setAdvice] = useState<AIAdvice[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPriority, setSelectedPriority] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [creatingTaskKeys, setCreatingTaskKeys] = useState<Record<string, boolean>>({})
  const [taskFeedback, setTaskFeedback] = useState<Record<string, TaskFeedback>>({})

  useEffect(() => {
    loadAIAdvice()
  }, [activeGarden?.id])

  const loadAIAdvice = async () => {
    try {
      setLoading(true)
      const resolvedContext = activeGarden?.id
        ? await resolveGardenContext(storageProvider, activeGarden.id).catch(() => null)
        : null
      const garden = resolvedContext?.garden || activeGarden
      const firstFieldRow = resolvedContext?.structure.fieldRows?.[0]
      const cropLabel = garden?.primaryCrop?.label || garden?.name || 'coltura attiva'
      const rowLabel = firstFieldRow?.name || firstFieldRow?.cultivar || cropLabel
      const isControlled = Boolean(
        resolvedContext?.structure.indoorSpace ||
        resolvedContext?.structure.greenhouseSpace ||
        resolvedContext?.systems.indoorConfig ||
        resolvedContext?.systems.hydroponicConfig ||
        resolvedContext?.systems.aquaponicConfig ||
        resolvedContext?.systems.aeroponicConfig ||
        resolvedContext?.systems.greenhouseConfig ||
        garden?.hasIndoor ||
        garden?.hasGreenhouse
      )
      const openTasks = activeGarden?.id ? await storageProvider.getTasks(activeGarden.id) : []
      const pendingTasks = openTasks.filter((task: any) => !task.completed)
      const taskCount = pendingTasks.length

      const groundedAdvice: AIAdvice[] = [
        {
          id: 'advice-rotation',
          type: 'rotation',
          title: isControlled ? 'Rotazione/Turnazione del sistema' : 'Rotazione Colture',
          description: isControlled
            ? `Il sistema risulta controllato: mantieni turnazione e pulizia del ciclo per ${rowLabel}, con attenzione ai carichi residui e alle finestre di riposo.`
            : `Usa lo storico attività per pianificare una rotazione coerente attorno a ${rowLabel} e ridurre accumulo di patogeni.`,
          priority: 'high',
          confidence: isControlled ? 0.81 : 0.76,
          timing: 'Prossimi 10 giorni',
          actions: [{
            type: 'scheduled',
            title: 'Rivedi il ciclo',
            description: isControlled
              ? 'Controlla sequenza di coltivazione, pulizia e ripartenza del sistema'
              : 'Definisci successioni colturali per i prossimi cicli e per il filare specifico',
            estimatedTime: '45 minuti',
            difficulty: 'medium',
          }],
          benefits: ['Riduce deriva del ciclo', 'Migliora continuità operativa'],
          createdAt: new Date().toISOString(),
          validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          weatherDependent: false,
          seasonalRelevance: 0.8
        },
        {
          id: 'advice-biological',
          type: 'biological_control',
          title: 'Verifica controllo biologico',
          description: taskCount > 0
            ? `Hai ${taskCount} task aperti: verifica se qualcuno riguarda trattamenti, monitoraggi o ispezioni su ${rowLabel}.`
            : `Nessun task aperto rilevante: programma un controllo biologico di base su ${rowLabel}.`,
          priority: taskCount > 2 ? 'high' : 'medium',
          confidence: 0.74,
          plantName: cropLabel,
          timing: 'Immediato',
          actions: [{
            type: 'monitoring',
            title: 'Apri ispezione',
            description: 'Controlla foglie, fusti e segni di pressione biotica',
            estimatedTime: '20 minuti',
            difficulty: 'easy',
          }],
          benefits: ['Intercetta problemi presto', 'Riduce interventi reattivi'],
          createdAt: new Date().toISOString(),
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          weatherDependent: false,
          seasonalRelevance: 0.7
        },
        {
          id: 'advice-irrigation',
          type: 'irrigation',
          title: isControlled ? 'Bilanciamento idrico del sistema' : 'Ottimizzazione Irrigazione',
          description: isControlled
            ? 'In ambiente controllato conta di più la stabilità: verifica portate, drenaggi e ritorni prima di aumentare i cicli.'
            : `Ricalibra l'irrigazione sul contesto reale del giardino e del filare ${rowLabel} per evitare sovra/interventi.`,
          priority: 'medium',
          confidence: isControlled ? 0.79 : 0.72,
          timing: 'Prossimi 3 giorni',
          actions: [{
            type: 'preparation',
            title: 'Controlla parametri',
            description: 'Verifica timer, portate e uniformità di distribuzione',
            estimatedTime: '20 minuti',
            difficulty: 'easy'
          }],
          benefits: ['Meno sprechi', 'Maggiore stabilità'],
          createdAt: new Date().toISOString(),
          validUntil: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          weatherDependent: false,
          seasonalRelevance: 0.65
        }
      ]

      setAdvice(groundedAdvice)
    } catch (error) {
      console.error('Error loading AI advice:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'rotation': return <RefreshCw className="w-5 h-5" />
      case 'biological_control': return <Bug className="w-5 h-5" />
      case 'nutrition': return <Leaf className="w-5 h-5" />
      case 'irrigation': return <Droplets className="w-5 h-5" />
      case 'weather': return <Sun className="w-5 h-5" />
      case 'pest_prevention': return <AlertTriangle className="w-5 h-5" />
      case 'harvest_timing': return <Target className="w-5 h-5" />
      default: return <Lightbulb className="w-5 h-5" />
    }
  }

  const filteredAdvice = advice.filter(item => {
    if (selectedPriority !== 'all' && item.priority !== selectedPriority) return false
    if (selectedType !== 'all' && item.type !== selectedType) return false
    return true
  })

  const getActionKey = (adviceId: string, actionIndex: number) => `${adviceId}:${actionIndex}`

  const toISODate = (date: Date) => date.toISOString().split('T')[0]

  const addDays = (days: number) => {
    const nextDate = new Date()
    nextDate.setDate(nextDate.getDate() + days)
    return nextDate
  }

  const inferTaskDate = (timing: string, actionType: AdviceAction['type']) => {
    if (actionType === 'immediate' || /immediat/i.test(timing)) {
      return toISODate(new Date())
    }

    const rangeMatch = timing.match(/(\d+)\s*-\s*(\d+)\s*giorni/i)
    if (rangeMatch) {
      return toISODate(addDays(parseInt(rangeMatch[1], 10)))
    }

    const daysMatch = timing.match(/(\d+)\s*giorni/i)
    if (daysMatch) {
      return toISODate(addDays(parseInt(daysMatch[1], 10)))
    }

    if (actionType === 'scheduled') return toISODate(addDays(7))
    if (actionType === 'preparation') return toISODate(addDays(3))
    return toISODate(addDays(1))
  }

  const parseEstimatedMinutes = (estimatedTime: string) => {
    const hourMatch = estimatedTime.match(/(\d+)\s*ore?/i)
    if (hourMatch) {
      return parseInt(hourMatch[1], 10) * 60
    }

    const minuteMatch = estimatedTime.match(/(\d+)\s*min/i)
    if (minuteMatch) {
      return parseInt(minuteMatch[1], 10)
    }

    return undefined
  }

  const mapAdviceTypeToTaskType = (type: AIAdvice['type']): GardenTask['taskType'] => {
    switch (type) {
      case 'irrigation':
        return 'Irrigation'
      case 'nutrition':
        return 'Fertilize'
      case 'harvest_timing':
        return 'Harvest'
      case 'biological_control':
      case 'pest_prevention':
      case 'weather':
        return 'Treatment'
      case 'rotation':
      default:
        return 'Sowing'
    }
  }

  const buildTaskNotes = (item: AIAdvice, action: AdviceAction) => {
    const lines = [
      `Consiglio AI: ${item.title}`,
      action.description,
      item.zone ? `Zona suggerita: ${item.zone}` : '',
      item.plantName ? `Coltura/pianta: ${item.plantName}` : '',
      item.weatherDependent ? 'Attenzione: intervento sensibile alle condizioni meteo.' : '',
      action.materials && action.materials.length > 0
        ? `Materiali: ${action.materials.join(', ')}`
        : '',
      item.benefits.length > 0 ? `Benefici attesi: ${item.benefits.join(', ')}` : '',
      item.risks && item.risks.length > 0 ? `Attenzioni: ${item.risks.join(', ')}` : ''
    ].filter(Boolean)

    return lines.join('\n')
  }

  const handleCreateTask = async (item: AIAdvice, action: AdviceAction, actionIndex: number) => {
    const actionKey = getActionKey(item.id, actionIndex)

    if (!activeGarden) {
      setTaskFeedback(prev => ({
        ...prev,
        [actionKey]: {
          type: 'error',
          message: 'Seleziona prima un orto attivo.'
        }
      }))
      return
    }

    try {
      setCreatingTaskKeys(prev => ({ ...prev, [actionKey]: true }))
      setTaskFeedback(prev => {
        const next = { ...prev }
        delete next[actionKey]
        return next
      })

      const suggestedBy = `advice:${item.id}:${actionIndex}`
      const existingTasks = await storageProvider.getTasks(activeGarden.id)
      const alreadyCreatedTask = existingTasks.find(task =>
        task.gardenId === activeGarden.id &&
        task.suggestedBy === suggestedBy &&
        !task.completed
      )

      if (alreadyCreatedTask) {
        setTaskFeedback(prev => ({
          ...prev,
          [actionKey]: {
            type: 'info',
            message: 'Task già creato.'
          }
        }))
        return
      }

      const taskDate = inferTaskDate(item.timing, action.type)
      const plantName =
        item.plantName ||
        item.zone ||
        activeGarden.primaryCrop?.label ||
        activeGarden.name

      const taskData: Omit<GardenTask, 'id'> = {
        gardenId: activeGarden.id,
        plantName,
        taskType: mapAdviceTypeToTaskType(item.type),
        date: taskDate,
        nextDueDate: taskDate,
        durationMinutes: parseEstimatedMinutes(action.estimatedTime),
        completed: false,
        isSuggested: true,
        aiGenerated: true,
        suggestedBy,
        suggestedDate: taskDate,
        schedulingType: action.type === 'immediate' ? 'Immediate' : 'Scheduled',
        notes: buildTaskNotes(item, action)
      }

      await storageProvider.createTask(taskData)

      setTaskFeedback(prev => ({
        ...prev,
        [actionKey]: {
          type: 'success',
          message: 'Task creato con successo.'
        }
      }))
    } catch (error) {
      console.error('Error creating advice task:', error)
      setTaskFeedback(prev => ({
        ...prev,
        [actionKey]: {
          type: 'error',
          message: 'Errore nella creazione del task.'
        }
      }))
    } finally {
      setCreatingTaskKeys(prev => ({ ...prev, [actionKey]: false }))
    }
  }

  // Configurazione tab per la pagina consigli
  const adviceTabs = [
    { id: 'overview', label: '💡 Panoramica', icon: Lightbulb },
    { id: 'ai-suggestions', label: '🤖 Suggerimenti AI', icon: TrendingUp, badge: advice.filter(a => a.priority === 'critical' || a.priority === 'high').length },
    { id: 'rotation', label: '🔄 Rotazione Colture', icon: RefreshCw },
    { id: 'biological', label: '🐛 Controllo Biologico', icon: Bug },
    { id: 'seasonal', label: '📅 Consigli Stagionali', icon: Calendar }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento consigli AI...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Consigli AI</h1>
                <p className="text-gray-600">Suggerimenti intelligenti per il tuo orto</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download className="w-4 h-4" />
                Esporta
              </button>
              <button 
                onClick={loadAIAdvice}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <RefreshCw className="w-4 h-4" />
                Aggiorna
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Desktop: Single row */}
            <nav className="hidden md:flex space-x-8">
              {adviceTabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={16} />
                    {tab.label}
                    {tab.badge && tab.badge > 0 && (
                      <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center font-bold">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>

            {/* Mobile: Two rows */}
            <div className="md:hidden">
              {/* First row - Main tabs */}
              <nav className="flex space-x-4 border-b border-gray-100">
                {adviceTabs.slice(0, 3).map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-1 py-3 px-2 border-b-2 font-medium text-xs transition-colors flex-1 justify-center ${
                        activeTab === tab.id
                          ? 'border-green-500 text-green-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon size={14} />
                      <span className="truncate">{tab.label.replace('💡 ', '').replace('🤖 ', '').replace('🔄 ', '')}</span>
                      {tab.badge && tab.badge > 0 && (
                        <span className="bg-red-500 text-white text-xs px-1 py-0.5 rounded-full min-w-[16px] text-center font-bold ml-1">
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  )
                })}
              </nav>

              {/* Second row - Additional tabs */}
              <nav className="flex space-x-4">
                {adviceTabs.slice(3).map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-1 py-3 px-2 border-b-2 font-medium text-xs transition-colors flex-1 justify-center ${
                        activeTab === tab.id
                          ? 'border-green-500 text-green-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon size={14} />
                      <span className="truncate">{tab.label.replace('🐛 ', '').replace('📅 ', '')}</span>
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Consigli Totali</p>
                    <p className="text-2xl font-bold text-gray-900">{advice.length}</p>
                  </div>
                  <Lightbulb className="w-8 h-8 text-green-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Priorità Alta</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {advice.filter(a => a.priority === 'high' || a.priority === 'critical').length}
                    </p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-orange-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Azioni Immediate</p>
                    <p className="text-2xl font-bold text-red-600">
                      {advice.filter(a => a.actions.some(action => action.type === 'immediate')).length}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-red-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Confidenza Media</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {Math.round(advice.reduce((sum, a) => sum + a.confidence, 0) / advice.length * 100)}%
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-500" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Azioni Rapide</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                  <RefreshCw className="w-8 h-8 text-green-600" />
                  <div>
                    <div className="font-medium">Pianifica Rotazione</div>
                    <div className="text-sm text-gray-600">Ottimizza le colture</div>
                  </div>
                </button>
                
                <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                  <Bug className="w-8 h-8 text-blue-600" />
                  <div>
                    <div className="font-medium">Controllo Biologico</div>
                    <div className="text-sm text-gray-600">Gestisci parassiti</div>
                  </div>
                </button>
                
                <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                  <Calendar className="w-8 h-8 text-purple-600" />
                  <div>
                    <div className="font-medium">Calendario Stagionale</div>
                    <div className="text-sm text-gray-600">Pianifica attività</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AI Suggestions Tab */}
        {activeTab === 'ai-suggestions' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Filtri:</span>
                </div>
                
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="all">Tutte le priorità</option>
                  <option value="critical">Critico</option>
                  <option value="high">Alto</option>
                  <option value="medium">Medio</option>
                  <option value="low">Basso</option>
                </select>

                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="all">Tutti i tipi</option>
                  <option value="rotation">Rotazione</option>
                  <option value="biological_control">Controllo biologico</option>
                  <option value="nutrition">Nutrizione</option>
                  <option value="irrigation">Irrigazione</option>
                  <option value="harvest_timing">Timing raccolta</option>
                </select>

                <div className="ml-auto text-sm text-gray-600">
                  {filteredAdvice.length} di {advice.length} consigli
                </div>
              </div>
            </div>

            {/* AI Advice Cards */}
            <div className="space-y-4">
              {filteredAdvice.map((item) => (
                <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-green-600">
                      {getTypeIcon(item.type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(item.priority)}`}>
                              {item.priority.toUpperCase()}
                            </span>
                            <span className="text-sm text-gray-500">
                              Confidenza: {Math.round(item.confidence * 100)}%
                            </span>
                          </div>
                          <p className="text-gray-700 mb-3">{item.description}</p>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {item.timing}
                            </div>
                            {item.zone && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {item.zone}
                              </div>
                            )}
                            {item.plantName && (
                              <div className="flex items-center gap-1">
                                <Leaf className="w-4 h-4" />
                                {item.plantName}
                              </div>
                            )}
                            {item.weatherDependent && (
                              <div className="flex items-center gap-1">
                                <Thermometer className="w-4 h-4" />
                                Dipende dal meteo
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Azioni Consigliate:</h4>
                          <div className="space-y-3">
                            {item.actions.map((action, index) => (
                              <div key={index} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="font-medium text-gray-900">{action.title}</h5>
                                  <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                      action.type === 'immediate' ? 'bg-red-100 text-red-700' :
                                      action.type === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                                      action.type === 'monitoring' ? 'bg-green-100 text-green-700' :
                                      'bg-yellow-100 text-yellow-700'
                                    }`}>
                                      {action.type}
                                    </span>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                      action.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                      action.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-red-100 text-red-700'
                                    }`}>
                                      {action.difficulty}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">{action.description}</p>
                                
                                <div className="flex items-center justify-between">
                                  <div className="text-xs text-gray-500">
                                    ⏱️ {action.estimatedTime}
                                    {action.cost && ` • 💰 €${action.cost}`}
                                  </div>

                                  <button
                                    onClick={() => handleCreateTask(item, action, index)}
                                    disabled={creatingTaskKeys[getActionKey(item.id, index)]}
                                    className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
                                  >
                                    <Plus className="w-3 h-3" />
                                    {creatingTaskKeys[getActionKey(item.id, index)] ? 'Creazione...' : 'Crea Task'}
                                  </button>
                                </div>

                                {taskFeedback[getActionKey(item.id, index)] && (
                                  <div className={`mt-3 text-xs font-medium ${
                                    taskFeedback[getActionKey(item.id, index)].type === 'success'
                                      ? 'text-green-700'
                                      : taskFeedback[getActionKey(item.id, index)].type === 'info'
                                        ? 'text-blue-700'
                                        : 'text-red-700'
                                  }`}>
                                    {taskFeedback[getActionKey(item.id, index)].message}
                                  </div>
                                )}

                                {action.materials && action.materials.length > 0 && (
                                  <div className="mt-3 pt-3 border-t border-gray-100">
                                    <div className="text-xs text-gray-600">
                                      <strong>Materiali:</strong> {action.materials.join(', ')}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Benefits */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <h5 className="font-medium text-green-900 mb-2">Benefici Attesi:</h5>
                          <ul className="space-y-1">
                            {item.benefits.map((benefit, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm text-green-800">
                                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Risks */}
                        {item.risks && item.risks.length > 0 && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <h5 className="font-medium text-yellow-900 mb-2">Attenzioni:</h5>
                            <ul className="space-y-1">
                              {item.risks.map((risk, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm text-yellow-800">
                                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                  <span>{risk}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredAdvice.length === 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <Lightbulb className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun consiglio trovato</h3>
                <p className="text-gray-600">
                  {advice.length === 0 
                    ? 'Aggiorna per ricevere nuovi consigli AI personalizzati'
                    : 'Prova a modificare i filtri per vedere altri consigli.'
                  }
                </p>
              </div>
            )}
          </div>
        )}

        {/* Rotation Tab */}
        {activeTab === 'rotation' && (
          <CropRotationPlanner />
        )}

        {/* Biological Control Tab */}
        {activeTab === 'biological' && (
          <BiologicalControlDashboard />
        )}

        {/* Seasonal Tab */}
        {activeTab === 'seasonal' && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Consigli Stagionali</h3>
            <p className="text-gray-600 mb-6">
              Consigli personalizzati basati sulla stagione corrente e le condizioni climatiche locali.
            </p>
            <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Genera Consigli Stagionali
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
