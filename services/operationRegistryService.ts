/**
 * Operation Registry Service
 * Servizio per registrare e tracciare tutte le operazioni sui filari
 */

export interface OperationRecord {
  id: string
  type: 'irrigation' | 'fertilization' | 'treatment' | 'cultivation' | 'harvest'
  
  // Identificatori
  gardenId: string
  gardenName: string
  fieldRowId: string
  fieldRowName: string
  
  // Data e ora
  executedAt: string // ISO string
  executedBy: string // ID utente
  
  // Dettagli operazione
  details: {
    fertilization?: {
      type: string // NPK 20-20-20, Compost, etc.
      dosagePerPlant: number // grammi
      totalDosage: number // grammi
      applicationMethod: 'soil' | 'foliar' | 'fertigation'
    }
    
    treatment?: {
      productName: string
      activeIngredient: string
      concentration: number // %
      treatmentType: 'fungicida' | 'insetticida' | 'erbicida' | 'biologico'
      applicationMethod: 'spray' | 'soil' | 'systemic'
    }
    
    irrigation?: {
      duration: number // minuti
      waterAmount: number // litri
      flowRate: number // L/h
      schedule?: string // es. "daily 08:00"
    }
    
    cultivation?: {
      type: 'weeding' | 'hoeing' | 'mulching' | 'pruning'
      tools: string
    }
    
    harvest?: {
      expectedYield: number // kg
      actualYield?: number // kg
      qualityGrade: 'A' | 'B' | 'C'
    }
  }
  
  // Condizioni meteo
  weatherConditions: {
    temperature: number // °C
    humidity: number // %
    windSpeed: number // km/h
    condition: 'sereno' | 'nuvoloso' | 'pioggia' | 'vento'
    source: 'api' | 'manual' // Fonte dati meteo
  }
  
  // Risultati
  results: {
    plantsAffected: number
    fieldRowsAffected: number
    totalAmount: number // Quantità totale applicata
    estimatedCost: number // €
    actualCost?: number // € (se diverso da stimato)
    duration?: number // minuti effettivi
  }
  
  // Note e media
  notes?: string
  photosCount: number
  photos?: string[] // URLs delle foto
  
  // Metadata
  createdAt: string
  updatedAt?: string
  status: 'completed' | 'scheduled' | 'cancelled'
}

export interface OperationSummary {
  totalOperations: number
  operationsByType: Record<string, number>
  totalCost: number
  totalPlantsAffected: number
  averageEfficiency: number
  lastOperation?: OperationRecord
}

export interface OperationFilter {
  gardenId?: string
  fieldRowId?: string
  type?: string
  dateFrom?: string
  dateTo?: string
  status?: string
}

/**
 * Servizio per la gestione del registro operazioni
 */
export class OperationRegistryService {
  private operations: Map<string, OperationRecord[]> = new Map()
  
  /**
   * Registra una nuova operazione
   */
  async registerOperation(operation: OperationRecord): Promise<void> {
    const gardenOperations = this.operations.get(operation.gardenId) || []
    gardenOperations.push(operation)
    this.operations.set(operation.gardenId, gardenOperations)
    
    // TODO: Salvare nel database
    console.log('📋 Operazione registrata:', operation)
  }
  
  /**
   * Ottieni operazioni per orto
   */
  getOperations(gardenId: string, filter?: OperationFilter): OperationRecord[] {
    let operations = this.operations.get(gardenId) || []
    
    if (filter) {
      operations = operations.filter(op => {
        if (filter.fieldRowId && op.fieldRowId !== filter.fieldRowId) return false
        if (filter.type && op.type !== filter.type) return false
        if (filter.status && op.status !== filter.status) return false
        if (filter.dateFrom && op.executedAt < filter.dateFrom) return false
        if (filter.dateTo && op.executedAt > filter.dateTo) return false
        return true
      })
    }
    
    return operations.sort((a, b) => new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime())
  }
  
  /**
   * Ottieni operazioni per filare
   */
  getFieldRowOperations(fieldRowId: string): OperationRecord[] {
    const allOperations = Array.from(this.operations.values()).flat()
    return allOperations
      .filter(op => op.fieldRowId === fieldRowId)
      .sort((a, b) => new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime())
  }
  
  /**
   * Ottieni statistiche operazioni
   */
  getOperationSummary(gardenId: string, filter?: OperationFilter): OperationSummary {
    const operations = this.getOperations(gardenId, filter)
    
    const operationsByType = operations.reduce((acc, op) => {
      acc[op.type] = (acc[op.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const totalCost = operations.reduce((sum, op) => sum + op.results.estimatedCost, 0)
    const totalPlantsAffected = operations.reduce((sum, op) => sum + op.results.plantsAffected, 0)
    
    // Calcola efficienza media (basata su costo per pianta)
    const averageEfficiency = operations.length > 0 
      ? totalCost / totalPlantsAffected 
      : 0
    
    return {
      totalOperations: operations.length,
      operationsByType,
      totalCost,
      totalPlantsAffected,
      averageEfficiency,
      lastOperation: operations[0] // Più recente
    }
  }
  
  /**
   * Genera report operazioni
   */
  generateOperationReport(gardenId: string, period: 'week' | 'month' | 'season' | 'year'): {
    summary: OperationSummary
    operations: OperationRecord[]
    insights: string[]
  } {
    const now = new Date()
    let dateFrom: string
    
    switch (period) {
      case 'week':
        dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
        break
      case 'month':
        dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
        break
      case 'season':
        dateFrom = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString()
        break
      case 'year':
        dateFrom = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString()
        break
    }
    
    const operations = this.getOperations(gardenId, { dateFrom })
    const summary = this.getOperationSummary(gardenId, { dateFrom })
    
    // Genera insights
    const insights: string[] = []
    
    if (summary.operationsByType.fertilization > summary.operationsByType.treatment) {
      insights.push('Fertilizzazioni più frequenti dei trattamenti - buona gestione preventiva')
    }
    
    if (summary.averageEfficiency < 1) {
      insights.push('Costo per pianta molto efficiente (< €1 per pianta)')
    }
    
    if (operations.length > 0) {
      const avgTemperature = operations.reduce((sum, op) => sum + op.weatherConditions.temperature, 0) / operations.length
      if (avgTemperature > 25) {
        insights.push('Temperature elevate durante le operazioni - considera orari più freschi')
      }
    }
    
    return {
      summary,
      operations,
      insights
    }
  }
  
  /**
   * Ottieni prossime operazioni consigliate
   */
  getRecommendedOperations(gardenId: string): Array<{
    type: string
    fieldRowId: string
    reason: string
    urgency: 'low' | 'medium' | 'high'
    estimatedDate: string
  }> {
    const operations = this.getOperations(gardenId)
    const recommendations: Array<{
      type: string
      fieldRowId: string
      reason: string
      urgency: 'low' | 'medium' | 'high'
      estimatedDate: string
    }> = []
    
    // Analizza pattern operazioni per suggerimenti
    const fieldRows = new Set(operations.map(op => op.fieldRowId))
    
    fieldRows.forEach(fieldRowId => {
      const fieldRowOps = operations.filter(op => op.fieldRowId === fieldRowId)
      const lastFertilization = fieldRowOps.find(op => op.type === 'fertilization')
      const lastTreatment = fieldRowOps.find(op => op.type === 'treatment')
      
      // Suggerisci fertilizzazione se l'ultima è > 30 giorni fa
      if (!lastFertilization || 
          new Date().getTime() - new Date(lastFertilization.executedAt).getTime() > 30 * 24 * 60 * 60 * 1000) {
        recommendations.push({
          type: 'fertilization',
          fieldRowId,
          reason: 'Ultima fertilizzazione oltre 30 giorni fa',
          urgency: 'medium',
          estimatedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        })
      }
      
      // Suggerisci trattamento preventivo se l'ultimo è > 45 giorni fa
      if (!lastTreatment || 
          new Date().getTime() - new Date(lastTreatment.executedAt).getTime() > 45 * 24 * 60 * 60 * 1000) {
        recommendations.push({
          type: 'treatment',
          fieldRowId,
          reason: 'Trattamento preventivo consigliato',
          urgency: 'low',
          estimatedDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        })
      }
    })
    
    return recommendations.sort((a, b) => {
      const urgencyOrder = { high: 3, medium: 2, low: 1 }
      return urgencyOrder[b.urgency] - urgencyOrder[a.urgency]
    })
  }
  
  /**
   * Esporta operazioni in formato CSV
   */
  exportOperationsCSV(gardenId: string, filter?: OperationFilter): string {
    const operations = this.getOperations(gardenId, filter)
    
    const headers = [
      'Data',
      'Ora',
      'Tipo',
      'Filare',
      'Piante',
      'Quantità',
      'Costo',
      'Temperatura',
      'Condizioni',
      'Note'
    ]
    
    const rows = operations.map(op => [
      op.executedAt.split('T')[0],
      op.executedAt.split('T')[1].slice(0, 5),
      op.type,
      op.fieldRowName,
      op.results.plantsAffected.toString(),
      op.results.totalAmount.toString(),
      `€${op.results.estimatedCost.toFixed(2)}`,
      `${op.weatherConditions.temperature}°C`,
      op.weatherConditions.condition,
      op.notes || ''
    ])
    
    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')
  }
}

// Singleton instance
export const operationRegistryService = new OperationRegistryService()