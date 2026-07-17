/**
 * Diary Planner Integration
 * Integrazione intelligente tra Diario Operativo e Planner AI
 * 
 * Funzionalità:
 * - Timeline unificata con suggerimenti AI
 * - Correlazione automatica tra operazioni e risultati
 * - Suggerimenti proattivi basati sui dati storici
 * - Integrazione con il Planner AI per pianificazione futura
 */

'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  Bot,
  Calendar,
  TrendingUp,
  Lightbulb,
  ArrowRight,
  Clock,
  Target,
  Zap,
  MessageSquare,
  BookOpen,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Star
} from 'lucide-react'
import PlannerAIChat from '../planner/PlannerAIChat'
import { createOperationalDiaryService } from '@/services/operationalDiaryService'
import { useStorage } from '@/packages/core/hooks/useStorage'

interface DiaryPlannerIntegrationProps {
  gardenId: string
  garden?: any
  tasks?: any[]
}

interface AIInsight {
  id: string
  type: 'suggestion' | 'warning' | 'opportunity' | 'pattern'
  title: string
  description: string
  confidence: number
  actionable: boolean
  relatedEntries: string[]
  suggestedActions: string[]
  priority: 'high' | 'medium' | 'low'
}

export default function DiaryPlannerIntegration({ 
  gardenId, 
  garden, 
  tasks = [] 
}: DiaryPlannerIntegrationProps) {
  const { storageProvider } = useStorage()
  const diaryService = useMemo(() => createOperationalDiaryService(storageProvider), [storageProvider])
  const [showPlannerChat, setShowPlannerChat] = useState(false)
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([])
  const [recentEntries, setRecentEntries] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadIntegrationData()
  }, [gardenId])

  const loadIntegrationData = async () => {
    setLoading(true)
    try {
      // Carica dati in parallelo per performance migliori
      const [entries, diaryAnalytics] = await Promise.all([
        // Carica entries (simulato - in produzione sarebbe dal database)
        diaryService.getEntries(gardenId, {
          dateRange: {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            end: new Date().toISOString().split('T')[0]
          }
        }),
        // Carica analytics
        diaryService.getAnalytics(gardenId)
      ])
      
      setRecentEntries(entries.slice(0, 10))
      setAnalytics(diaryAnalytics)
      
      // Genera insights AI in background (non blocca il rendering)
      generateAIInsights(entries, diaryAnalytics).then(insights => {
        setAiInsights(insights)
      })
      
    } catch (error) {
      console.error('Error loading integration data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateAIInsights = async (entries: any[], analytics: any): Promise<AIInsight[]> => {
    const insights: AIInsight[] = []
    
    // Insight 1: Pattern di efficienza
    if (analytics?.recentTrends.efficiency < -10) {
      insights.push({
        id: 'efficiency_decline',
        type: 'warning',
        title: 'Calo di Efficienza Rilevato',
        description: `L'efficienza operativa è calata del ${Math.abs(analytics.recentTrends.efficiency)}% nelle ultime settimane`,
        confidence: 0.85,
        actionable: true,
        relatedEntries: entries.filter(e => e.performance?.efficiency < 70).map(e => e.id),
        suggestedActions: [
          'Rivedi i processi operativi meno efficienti',
          'Considera formazione o aggiornamento strumenti',
          'Analizza i fattori esterni che influenzano le operazioni'
        ],
        priority: 'high'
      })
    }
    
    // Insight 2: Opportunità di miglioramento
    const highPerformingOps = entries.filter(e => 
      e.performance?.effectiveness > 90 && e.type === 'operation'
    )
    
    if (highPerformingOps.length > 0) {
      insights.push({
        id: 'best_practices',
        type: 'opportunity',
        title: 'Pratiche di Successo Identificate',
        description: `${highPerformingOps.length} operazioni hanno mostrato eccellenti risultati`,
        confidence: 0.92,
        actionable: true,
        relatedEntries: highPerformingOps.map(e => e.id),
        suggestedActions: [
          'Replica queste pratiche in altre aree',
          'Documenta i fattori di successo',
          'Forma il team su queste metodologie'
        ],
        priority: 'medium'
      })
    }
    
    // Insight 3: Pattern stagionali
    const currentMonth = new Date().getMonth()
    const seasonalData = analytics?.correlations?.seasonalPatterns?.[currentMonth]
    
    if (seasonalData?.bestOperations?.length > 0) {
      insights.push({
        id: 'seasonal_opportunity',
        type: 'suggestion',
        title: 'Opportunità Stagionale',
        description: `Questo è il momento ideale per: ${seasonalData.bestOperations.join(', ')}`,
        confidence: 0.78,
        actionable: true,
        relatedEntries: [],
        suggestedActions: [
          'Pianifica queste operazioni nelle prossime settimane',
          'Prepara materiali e risorse necessarie',
          'Monitora le condizioni meteo favorevoli'
        ],
        priority: 'medium'
      })
    }
    
    // Insight 4: Problemi ricorrenti
    const recentIssues = entries.filter(e => e.type === 'issue')
    const issuePatterns = recentIssues.reduce((acc: any, issue) => {
      const key = issue.operationData?.plantName || 'unknown'
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})
    
    const recurringIssues = Object.entries(issuePatterns).filter(([_, count]) => (count as number) > 2)
    
    if (recurringIssues.length > 0) {
      insights.push({
        id: 'recurring_issues',
        type: 'warning',
        title: 'Problemi Ricorrenti Rilevati',
        description: `Problemi ripetuti su: ${recurringIssues.map(([plant]) => plant).join(', ')}`,
        confidence: 0.88,
        actionable: true,
        relatedEntries: recentIssues.map(e => e.id),
        suggestedActions: [
          'Analizza le cause radice dei problemi',
          'Considera varietà più resistenti',
          'Implementa misure preventive specifiche'
        ],
        priority: 'high'
      })
    }
    
    // Insight 5: ROI positivo
    const profitableOps = entries.filter(e => 
      e.performance?.roi && e.performance.roi > 50
    )
    
    if (profitableOps.length > 0) {
      const avgROI = profitableOps.reduce((sum, op) => sum + (op.performance?.roi || 0), 0) / profitableOps.length
      
      insights.push({
        id: 'profitable_operations',
        type: 'opportunity',
        title: 'Operazioni ad Alto ROI',
        description: `${profitableOps.length} operazioni hanno generato un ROI medio del ${Math.round(avgROI)}%`,
        confidence: 0.95,
        actionable: true,
        relatedEntries: profitableOps.map(e => e.id),
        suggestedActions: [
          'Espandi queste operazioni profittevoli',
          'Alloca più risorse a queste attività',
          'Studia i fattori che contribuiscono al successo'
        ],
        priority: 'medium'
      })
    }
    
    return insights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'suggestion': return <Lightbulb className="text-blue-600" size={20} />
      case 'warning': return <AlertTriangle className="text-red-600" size={20} />
      case 'opportunity': return <Target className="text-green-600" size={20} />
      case 'pattern': return <TrendingUp className="text-purple-600" size={20} />
      default: return <Star className="text-yellow-600" size={20} />
    }
  }

  const getInsightColor = (type: AIInsight['type']) => {
    switch (type) {
      case 'suggestion': return 'border-l-blue-500 bg-blue-50'
      case 'warning': return 'border-l-red-500 bg-red-50'
      case 'opportunity': return 'border-l-green-500 bg-green-50'
      case 'pattern': return 'border-l-purple-500 bg-purple-50'
      default: return 'border-l-yellow-500 bg-yellow-50'
    }
  }

  const handleAskAI = (insight: AIInsight) => {
    setShowPlannerChat(true)
    // Il Planner AI potrebbe ricevere il contesto dell'insight
    console.log('Opening AI chat with context:', insight)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Caricamento insights AI...</p>
        </div>
        
        {/* Skeleton placeholder per migliorare UX */}
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Bot className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-indigo-900">
                🤖 AI Insights & Pianificazione
              </h2>
              <p className="text-indigo-700">
                Analisi intelligente dei dati del diario con suggerimenti per il futuro
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowPlannerChat(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <MessageSquare size={16} />
            Chat AI
          </button>
        </div>

        {/* Quick Stats */}
        {analytics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-indigo-600">{aiInsights.length}</div>
              <div className="text-sm text-gray-600">Insights AI</div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(analytics.averageEfficiency)}%
              </div>
              <div className="text-sm text-gray-600">Efficienza</div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {analytics.totalROI > 0 ? '+' : ''}{Math.round(analytics.totalROI)}%
              </div>
              <div className="text-sm text-gray-600">ROI Totale</div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {aiInsights.filter(i => i.priority === 'high').length}
              </div>
              <div className="text-sm text-gray-600">Priorità Alta</div>
            </div>
          </div>
        )}
      </div>

      {/* AI Insights */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="text-indigo-600" size={20} />
          <h3 className="text-lg font-semibold text-gray-900">Insights AI Personalizzati</h3>
        </div>

        {aiInsights.length > 0 ? (
          <div className="space-y-4">
            {aiInsights.map((insight) => (
              <div
                key={insight.id}
                className={`border-l-4 ${getInsightColor(insight.type)} rounded-lg p-4`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getInsightIcon(insight.type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          insight.priority === 'high' ? 'bg-red-100 text-red-700' :
                          insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {insight.priority}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                          {Math.round(insight.confidence * 100)}% confidenza
                        </span>
                      </div>
                      
                      <p className="text-gray-700 mb-3">{insight.description}</p>
                      
                      {insight.suggestedActions.length > 0 && (
                        <div className="bg-white rounded-lg p-3 mb-3">
                          <h5 className="font-medium text-gray-900 mb-2">Azioni Suggerite:</h5>
                          <ul className="space-y-1">
                            {insight.suggestedActions.map((action, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                <ArrowRight size={14} className="text-indigo-600 mt-0.5 flex-shrink-0" />
                                {action}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <BookOpen size={12} />
                        <span>{insight.relatedEntries.length} registrazioni correlate</span>
                      </div>
                    </div>
                  </div>
                  
                  {insight.actionable && (
                    <button
                      onClick={() => handleAskAI(insight)}
                      className="flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-sm"
                    >
                      <Bot size={14} />
                      Chiedi AI
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Lightbulb size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">Nessun insight disponibile</p>
            <p className="text-sm">Aggiungi più registrazioni al diario per ricevere suggerimenti AI</p>
          </div>
        )}
      </div>

      {/* Recent Timeline Integration */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="text-blue-600" size={20} />
            <h3 className="text-lg font-semibold text-gray-900">Timeline Recente</h3>
          </div>
          <button
            onClick={() => setShowPlannerChat(true)}
            className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
          >
            <Calendar size={14} />
            Pianifica Prossime
          </button>
        </div>

        {recentEntries.length > 0 ? (
          <div className="space-y-3">
            {recentEntries.slice(0, 5).map((entry) => (
              <div key={entry.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{entry.title}</span>
                    <span className="text-xs px-2 py-1 bg-gray-200 text-gray-600 rounded">
                      {entry.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{entry.description}</p>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(entry.date).toLocaleDateString('it-IT')}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">Nessuna registrazione recente</p>
        )}
      </div>

      {/* Planner AI Chat Integration */}
      <PlannerAIChat
        garden={garden}
        tasks={tasks}
        isOpen={showPlannerChat}
        onToggle={() => setShowPlannerChat(!showPlannerChat)}
      />
    </div>
  )
}
