/**
 * Operational Diary Service
 * Servizio per gestire il diario operativo intelligente
 * 
 * Funzionalità:
 * - Memorizzazione automatica dei risultati
 * - Correlazione tra operazioni e risultati
 * - Analisi trend e performance
 * - Integrazione con AI per suggerimenti
 * - Export per compliance
 */

import { DiaryEntry } from '@/components/diary/OperationalDiary'

export interface DiaryAnalytics {
  totalEntries: number
  operationsCount: number
  resultsCount: number
  issuesCount: number
  averageEfficiency: number
  totalROI: number
  topPerformingOperations: DiaryEntry[]
  recentTrends: {
    efficiency: number
    effectiveness: number
    issues: number
  }
  correlations: {
    operationToResult: Array<{
      operation: string
      avgTimeToResult: number
      successRate: number
      avgROI: number
    }>
    weatherImpact: Array<{
      condition: string
      avgEfficiency: number
      issueRate: number
    }>
    seasonalPatterns: Array<{
      month: string
      bestOperations: string[]
      commonIssues: string[]
    }>
  }
}

export interface AutoEntry {
  trigger: 'operation_completed' | 'result_measured' | 'issue_detected' | 'milestone_reached' | 'ai_analysis'
  data: Partial<DiaryEntry>
  confidence: number
  suggestedTags: string[]
}

export class OperationalDiaryService {
  private entries: Map<string, DiaryEntry[]> = new Map()
  private analytics: Map<string, DiaryAnalytics> = new Map()
  
  /**
   * Aggiunge una nuova entry al diario
   */
  async addEntry(gardenId: string, entry: Omit<DiaryEntry, 'id'>): Promise<DiaryEntry> {
    const newEntry: DiaryEntry = {
      ...entry,
      id: `diary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
    
    if (!this.entries.has(gardenId)) {
      this.entries.set(gardenId, [])
    }
    
    this.entries.get(gardenId)!.push(newEntry)
    
    // Aggiorna analytics
    await this.updateAnalytics(gardenId)
    
    // Cerca correlazioni automatiche
    await this.findCorrelations(gardenId, newEntry)
    
    // Genera suggerimenti AI se appropriato
    if (entry.type === 'result' || entry.type === 'issue') {
      await this.generateAISuggestions(gardenId, newEntry)
    }
    
    console.log(`📖 Diary entry added for garden ${gardenId}:`, newEntry)
    return newEntry
  }
  
  /**
   * Registrazione automatica basata su eventi
   */
  async autoRecord(gardenId: string, autoEntry: AutoEntry): Promise<DiaryEntry | null> {
    if (autoEntry.confidence < 0.7) {
      console.log('⚠️ Auto-record confidence too low:', autoEntry.confidence)
      return null
    }
    
    const entry: Omit<DiaryEntry, 'id'> = {
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
      verified: autoEntry.confidence > 0.9,
      aiGenerated: autoEntry.trigger === 'ai_analysis',
      tags: autoEntry.suggestedTags,
      ...autoEntry.data
    } as Omit<DiaryEntry, 'id'>
    
    return await this.addEntry(gardenId, entry)
  }
  
  /**
   * Ottiene entries del diario con filtri
   */
  getEntries(
    gardenId: string,
    filters?: {
      type?: DiaryEntry['type']
      category?: DiaryEntry['category']
      dateRange?: { start: string; end: string }
      tags?: string[]
      verified?: boolean
    }
  ): DiaryEntry[] {
    const entries = this.entries.get(gardenId) || []
    
    if (!filters) return entries
    
    return entries.filter(entry => {
      if (filters.type && entry.type !== filters.type) return false
      if (filters.category && entry.category !== filters.category) return false
      if (filters.verified !== undefined && entry.verified !== filters.verified) return false
      
      if (filters.dateRange) {
        const entryDate = new Date(entry.date)
        const startDate = new Date(filters.dateRange.start)
        const endDate = new Date(filters.dateRange.end)
        if (entryDate < startDate || entryDate > endDate) return false
      }
      
      if (filters.tags && filters.tags.length > 0) {
        const entryTags = entry.tags || []
        if (!filters.tags.some(tag => entryTags.includes(tag))) return false
      }
      
      return true
    })
  }
  
  /**
   * Calcola analytics del diario
   */
  private async updateAnalytics(gardenId: string): Promise<void> {
    const entries = this.entries.get(gardenId) || []
    
    const analytics: DiaryAnalytics = {
      totalEntries: entries.length,
      operationsCount: entries.filter(e => e.type === 'operation').length,
      resultsCount: entries.filter(e => e.type === 'result').length,
      issuesCount: entries.filter(e => e.type === 'issue').length,
      
      averageEfficiency: this.calculateAverageMetric(entries, 'efficiency'),
      totalROI: entries
        .filter(e => e.performance?.roi)
        .reduce((sum, e) => sum + (e.performance?.roi || 0), 0),
      
      topPerformingOperations: entries
        .filter(e => e.performance?.effectiveness && e.performance.effectiveness > 85)
        .sort((a, b) => (b.performance?.effectiveness || 0) - (a.performance?.effectiveness || 0))
        .slice(0, 5),
      
      recentTrends: {
        efficiency: this.calculateTrend(entries, 'efficiency'),
        effectiveness: this.calculateTrend(entries, 'effectiveness'),
        issues: this.calculateIssueTrend(entries)
      },
      
      correlations: await this.calculateCorrelations(entries)
    }
    
    this.analytics.set(gardenId, analytics)
  }
  
  /**
   * Trova correlazioni automatiche tra entries
   */
  private async findCorrelations(gardenId: string, newEntry: DiaryEntry): Promise<void> {
    const entries = this.entries.get(gardenId) || []
    const correlatedIds: string[] = []
    
    // Cerca entries correlate per pianta
    if (newEntry.operationData?.plantId) {
      const relatedEntries = entries.filter(e => 
        e.operationData?.plantId === newEntry.operationData?.plantId &&
        e.id !== newEntry.id
      )
      correlatedIds.push(...relatedEntries.map(e => e.id))
    }
    
    // Cerca entries correlate per area
    if (newEntry.operationData?.area) {
      const relatedEntries = entries.filter(e => 
        e.operationData?.area === newEntry.operationData?.area &&
        e.id !== newEntry.id &&
        Math.abs(new Date(e.date).getTime() - new Date(newEntry.date).getTime()) < 7 * 24 * 60 * 60 * 1000
      )
      correlatedIds.push(...relatedEntries.map(e => e.id))
    }
    
    // Cerca entries correlate per tag
    if (newEntry.tags) {
      const relatedEntries = entries.filter(e => 
        e.tags?.some(tag => newEntry.tags?.includes(tag)) &&
        e.id !== newEntry.id
      )
      correlatedIds.push(...relatedEntries.map(e => e.id))
    }
    
    // Aggiorna correlazioni
    if (correlatedIds.length > 0) {
      const uniqueIds = [...new Set(correlatedIds)]
      newEntry.correlatedEntries = uniqueIds
      
      // Aggiorna anche le entries correlate
      uniqueIds.forEach(id => {
        const entry = entries.find(e => e.id === id)
        if (entry) {
          if (!entry.correlatedEntries) entry.correlatedEntries = []
          if (!entry.correlatedEntries.includes(newEntry.id)) {
            entry.correlatedEntries.push(newEntry.id)
          }
        }
      })
    }
  }
  
  /**
   * Genera suggerimenti AI basati sui dati del diario
   */
  private async generateAISuggestions(gardenId: string, entry: DiaryEntry): Promise<void> {
    const entries = this.entries.get(gardenId) || []
    const analytics = this.analytics.get(gardenId)
    
    let suggestions: string[] = []
    
    // Suggerimenti basati sui risultati
    if (entry.type === 'result' && entry.results?.quantitative) {
      const { yield: yieldValue, quality, healthScore } = entry.results.quantitative
      
      if (yieldValue && yieldValue < 2) {
        suggestions.push('Resa bassa: considera migliorare fertilizzazione o irrigazione')
      }
      
      if (quality && quality < 3) {
        suggestions.push('Qualità sotto la media: verifica condizioni di crescita e raccolta')
      }
      
      if (healthScore && healthScore < 70) {
        suggestions.push('Salute pianta compromessa: aumenta monitoraggio e cure preventive')
      }
    }
    
    // Suggerimenti basati sui problemi
    if (entry.type === 'issue') {
      const similarIssues = entries.filter(e => 
        e.type === 'issue' &&
        e.operationData?.plantName === entry.operationData?.plantName &&
        e.id !== entry.id
      )
      
      if (similarIssues.length > 2) {
        suggestions.push('Problema ricorrente: considera cambiare varietà o metodo di coltivazione')
      }
      
      suggestions.push('Documenta la soluzione applicata per future referenze')
      suggestions.push('Monitora l\'evoluzione del problema nei prossimi giorni')
    }
    
    // Suggerimenti basati su trend
    if (analytics?.recentTrends.efficiency < -10) {
      suggestions.push('Efficienza in calo: rivedi i processi operativi')
    }
    
    if (analytics?.recentTrends.issues > 2) {
      suggestions.push('Aumento problemi: intensifica controlli preventivi')
    }
    
    // Crea entry AI se ci sono suggerimenti
    if (suggestions.length > 0) {
      const aiEntry: Omit<DiaryEntry, 'id'> = {
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
        type: 'ai_suggestion',
        category: 'analysis',
        title: 'Suggerimenti AI basati su analisi dati',
        description: 'L\'AI ha analizzato i dati recenti e propone questi miglioramenti',
        results: {
          qualitative: {
            improvements: suggestions,
            notes: `Analisi basata su ${entries.length} registrazioni del diario`
          }
        },
        verified: false,
        aiGenerated: true,
        correlatedEntries: [entry.id],
        tags: ['ai', 'suggerimenti', 'analisi']
      }
      
      await this.addEntry(gardenId, aiEntry)
    }
  }
  
  /**
   * Calcola metriche medie
   */
  private calculateAverageMetric(entries: DiaryEntry[], metric: 'efficiency' | 'effectiveness'): number {
    const validEntries = entries.filter(e => e.performance?.[metric])
    if (validEntries.length === 0) return 0
    
    const sum = validEntries.reduce((sum, e) => sum + (e.performance?.[metric] || 0), 0)
    return Math.round(sum / validEntries.length)
  }
  
  /**
   * Calcola trend di una metrica
   */
  private calculateTrend(entries: DiaryEntry[], metric: 'efficiency' | 'effectiveness'): number {
    const recent = entries
      .filter(e => e.performance?.[metric])
      .slice(-10)
      .map(e => e.performance?.[metric] || 0)
    
    if (recent.length < 2) return 0
    
    const firstHalf = recent.slice(0, Math.floor(recent.length / 2))
    const secondHalf = recent.slice(Math.floor(recent.length / 2))
    
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length
    
    return Math.round(secondAvg - firstAvg)
  }
  
  /**
   * Calcola trend dei problemi
   */
  private calculateIssueTrend(entries: DiaryEntry[]): number {
    const issues = entries.filter(e => e.type === 'issue')
    
    const thisWeek = issues.filter(e => 
      new Date(e.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length
    
    const lastWeek = issues.filter(e => {
      const date = new Date(e.date)
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
      return date <= weekAgo && date > twoWeeksAgo
    }).length
    
    return thisWeek - lastWeek
  }
  
  /**
   * Calcola correlazioni avanzate
   */
  private async calculateCorrelations(entries: DiaryEntry[]): Promise<DiaryAnalytics['correlations']> {
    // Correlazioni operazione → risultato
    const operationToResult = this.calculateOperationResultCorrelations(entries)
    
    // Impatto meteo
    const weatherImpact = this.calculateWeatherImpact(entries)
    
    // Pattern stagionali
    const seasonalPatterns = this.calculateSeasonalPatterns(entries)
    
    return {
      operationToResult,
      weatherImpact,
      seasonalPatterns
    }
  }
  
  private calculateOperationResultCorrelations(entries: DiaryEntry[]) {
    const operations = entries.filter(e => e.type === 'operation')
    const results = entries.filter(e => e.type === 'result')
    
    const correlations: { [key: string]: { times: number[], rois: number[], successes: number } } = {}
    
    operations.forEach(op => {
      const key = `${op.category}_${op.operationData?.plantName || 'unknown'}`
      
      // Trova risultati correlati
      const relatedResults = results.filter(r => 
        r.operationData?.plantName === op.operationData?.plantName &&
        new Date(r.date) > new Date(op.date) &&
        new Date(r.date).getTime() - new Date(op.date).getTime() < 90 * 24 * 60 * 60 * 1000 // 90 giorni
      )
      
      if (relatedResults.length > 0) {
        if (!correlations[key]) {
          correlations[key] = { times: [], rois: [], successes: 0 }
        }
        
        relatedResults.forEach(result => {
          const timeToResult = Math.floor(
            (new Date(result.date).getTime() - new Date(op.date).getTime()) / (24 * 60 * 60 * 1000)
          )
          correlations[key].times.push(timeToResult)
          
          if (result.performance?.roi) {
            correlations[key].rois.push(result.performance.roi)
          }
          
          if (result.results?.quantitative?.quality && result.results.quantitative.quality >= 4) {
            correlations[key].successes++
          }
        })
      }
    })
    
    return Object.entries(correlations).map(([operation, data]) => ({
      operation,
      avgTimeToResult: Math.round(data.times.reduce((sum, t) => sum + t, 0) / data.times.length),
      successRate: Math.round((data.successes / data.times.length) * 100),
      avgROI: Math.round(data.rois.reduce((sum, r) => sum + r, 0) / data.rois.length)
    }))
  }
  
  private calculateWeatherImpact(entries: DiaryEntry[]) {
    const weatherData: { [key: string]: { efficiencies: number[], issues: number } } = {}
    
    entries.forEach(entry => {
      if (entry.operationData?.weather) {
        const condition = entry.operationData.weather.conditions
        
        if (!weatherData[condition]) {
          weatherData[condition] = { efficiencies: [], issues: 0 }
        }
        
        if (entry.performance?.efficiency) {
          weatherData[condition].efficiencies.push(entry.performance.efficiency)
        }
        
        if (entry.type === 'issue') {
          weatherData[condition].issues++
        }
      }
    })
    
    return Object.entries(weatherData).map(([condition, data]) => ({
      condition,
      avgEfficiency: Math.round(data.efficiencies.reduce((sum, e) => sum + e, 0) / data.efficiencies.length),
      issueRate: Math.round((data.issues / entries.length) * 100)
    }))
  }
  
  private calculateSeasonalPatterns(entries: DiaryEntry[]) {
    const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']
    
    return months.map((month, index) => {
      const monthEntries = entries.filter(e => new Date(e.date).getMonth() === index)
      
      const bestOperations = monthEntries
        .filter(e => e.type === 'operation' && e.performance?.effectiveness && e.performance.effectiveness > 80)
        .map(e => e.title)
        .slice(0, 3)
      
      const commonIssues = monthEntries
        .filter(e => e.type === 'issue')
        .map(e => e.title)
        .slice(0, 3)
      
      return {
        month,
        bestOperations,
        commonIssues
      }
    })
  }
  
  /**
   * Esporta dati del diario per compliance
   */
  async exportDiary(
    gardenId: string,
    format: 'json' | 'csv' | 'pdf' = 'json',
    filters?: Parameters<typeof this.getEntries>[1]
  ): Promise<string> {
    const entries = this.getEntries(gardenId, filters)
    const analytics = this.analytics.get(gardenId)
    
    const exportData = {
      gardenId,
      exportDate: new Date().toISOString(),
      totalEntries: entries.length,
      entries: entries.map(entry => ({
        ...entry,
        // Rimuovi dati sensibili se necessario
        gpsLocation: entry.gpsLocation ? 'REDACTED' : undefined
      })),
      analytics
    }
    
    switch (format) {
      case 'json':
        return JSON.stringify(exportData, null, 2)
      case 'csv':
        return this.convertToCSV(entries)
      case 'pdf':
        return 'PDF export not implemented yet'
      default:
        return JSON.stringify(exportData, null, 2)
    }
  }
  
  private convertToCSV(entries: DiaryEntry[]): string {
    const headers = ['Data', 'Ora', 'Tipo', 'Categoria', 'Titolo', 'Descrizione', 'Efficienza', 'Efficacia', 'ROI']
    
    const rows = entries.map(entry => [
      entry.date,
      entry.time,
      entry.type,
      entry.category,
      entry.title,
      entry.description.replace(/,/g, ';'),
      entry.performance?.efficiency || '',
      entry.performance?.effectiveness || '',
      entry.performance?.roi || ''
    ])
    
    return [headers, ...rows].map(row => row.join(',')).join('\n')
  }
  
  /**
   * Ottiene analytics del diario
   */
  getAnalytics(gardenId: string): DiaryAnalytics | undefined {
    return this.analytics.get(gardenId)
  }
}

/**
 * Singleton instance
 */
export const operationalDiaryService = new OperationalDiaryService()