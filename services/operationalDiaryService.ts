import type { IStorageProvider } from '@/packages/core/storage/interface'
import type { DiaryEvent, DiaryEventCreate } from '@/types/diary'

export interface DiaryAnalytics {
  totalEntries: number
  operationsCount: number
  resultsCount: number
  issuesCount: number
  averageEfficiency: number
  totalROI: number
  topPerformingOperations: DiaryEvent[]
  recentTrends: { efficiency: number; effectiveness: number; issues: number }
  correlations: { operationToResult: any[]; weatherImpact: any[]; seasonalPatterns: any[] }
}

export interface AutoEntry {
  trigger: 'operation_completed' | 'result_measured' | 'issue_detected' | 'milestone_reached' | 'ai_analysis'
  data: Partial<DiaryEventCreate>
  confidence: number
  suggestedTags: string[]
}

type DiaryStorage = Pick<IStorageProvider, 'getDiaryEvents' | 'createDiaryEvent' | 'updateDiaryEvent' | 'voidDiaryEvent'>

export class OperationalDiaryService {
  constructor(private readonly storageProvider?: Partial<DiaryStorage>) {}

  private require<K extends keyof DiaryStorage>(method: K): NonNullable<DiaryStorage[K]> {
    const implementation = this.storageProvider?.[method]
    if (!implementation) throw new Error(`Cloud diary capability unavailable: ${method}`)
    return implementation.bind(this.storageProvider) as NonNullable<DiaryStorage[K]>
  }

  async addEntry(gardenId: string, entry: Omit<DiaryEventCreate, 'gardenId'>): Promise<DiaryEvent> {
    const create = this.require('createDiaryEvent')
    const saved = await create({ ...entry, gardenId })
    const reread = await this.getEntries(gardenId)
    const verified = reread.find(item => item.id === saved.id)
    if (!verified) throw new Error('Diary write could not be verified after persistence')
    return verified
  }

  async autoRecord(gardenId: string, input: AutoEntry): Promise<DiaryEvent | null> {
    if (input.confidence < 0.7) return null
    const now = new Date()
    return this.addEntry(gardenId, {
      date: now.toISOString().slice(0, 10),
      time: now.toTimeString().slice(0, 5),
      type: input.trigger === 'ai_analysis' ? 'ai_suggestion' : 'operation',
      category: 'care',
      title: input.data.title || 'Evento automatico',
      description: input.data.description || '',
      source: input.trigger === 'ai_analysis' ? 'ai' : 'automation',
      verified: input.confidence > 0.9,
      aiGenerated: input.trigger === 'ai_analysis',
      tags: input.suggestedTags,
      ...input.data,
    })
  }

  async getEntries(gardenId: string, filters?: { type?: DiaryEvent['type']; category?: DiaryEvent['category']; dateRange?: { start: string; end: string }; tags?: string[]; verified?: boolean }): Promise<DiaryEvent[]> {
    const read = this.require('getDiaryEvents')
    const entries = await read(gardenId, { type: filters?.type, category: filters?.category, dateFrom: filters?.dateRange?.start, dateTo: filters?.dateRange?.end })
    return entries.filter(entry => {
      if (filters?.verified !== undefined && entry.verified !== filters.verified) return false
      if (filters?.tags?.length && !filters.tags.some(tag => entry.tags?.includes(tag))) return false
      return true
    })
  }

  async updateEntry(id: string, updates: Partial<DiaryEvent>): Promise<DiaryEvent> {
    return this.require('updateDiaryEvent')(id, updates)
  }

  async voidEntry(id: string, reason: string): Promise<DiaryEvent> {
    if (!reason.trim()) throw new Error('A reason is required to void a diary event')
    return this.require('voidDiaryEvent')(id, reason.trim())
  }

  async getAnalytics(gardenId: string): Promise<DiaryAnalytics> {
    const entries = await this.getEntries(gardenId)
    const metric = (name: 'efficiency' | 'effectiveness') => {
      const values = entries.flatMap(entry => entry.performance?.[name] === undefined ? [] : [entry.performance[name]])
      return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0
    }
    return {
      totalEntries: entries.length,
      operationsCount: entries.filter(item => item.type === 'operation').length,
      resultsCount: entries.filter(item => item.type === 'result').length,
      issuesCount: entries.filter(item => item.type === 'issue').length,
      averageEfficiency: metric('efficiency'),
      totalROI: entries.reduce((sum, item) => sum + (item.performance?.roi || 0), 0),
      topPerformingOperations: entries.filter(item => (item.performance?.effectiveness || 0) > 85).sort((a, b) => (b.performance?.effectiveness || 0) - (a.performance?.effectiveness || 0)).slice(0, 5),
      recentTrends: { efficiency: 0, effectiveness: 0, issues: 0 },
      correlations: { operationToResult: [], weatherImpact: [], seasonalPatterns: [] },
    }
  }

  async exportDiary(gardenId: string, format: 'json' | 'csv' = 'json'): Promise<string> {
    const entries = await this.getEntries(gardenId)
    if (format === 'json') return JSON.stringify({ gardenId, exportDate: new Date().toISOString(), entries }, null, 2)
    const rows = entries.map(entry => [entry.date, entry.time, entry.type, entry.category, entry.title, entry.description].map(value => `"${String(value).replaceAll('"', '""')}"`).join(','))
    return [['Data', 'Ora', 'Tipo', 'Categoria', 'Titolo', 'Descrizione'].join(','), ...rows].join('\n')
  }
}

export const createOperationalDiaryService = (storageProvider: Partial<DiaryStorage>) => new OperationalDiaryService(storageProvider)

/** @deprecated Inject the active storage provider with createOperationalDiaryService. */
export const operationalDiaryService = new OperationalDiaryService()
