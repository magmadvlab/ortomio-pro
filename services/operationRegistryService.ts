/**
 * Operation Registry Service
 * Servizio per registrare e tracciare tutte le operazioni sui filari
 */

import type { IStorageProvider } from '@/packages/core/storage/interface'
import type {
  FieldRow,
  FertilizerApplicationLogDB,
  FertilizerInventoryItemDB,
  HarvestLogData,
  MechanicalWorkRecord,
  PhytoInventoryItemDB,
  TreatmentRecordDB,
} from '@/types'
import type { WateringLog } from '@/types/irrigation'
import {
  estimateFertilizationOperationEconomics,
  estimateHarvestOperationEconomics,
  estimateIrrigationOperationEconomics,
  estimateMechanicalOperationEconomics,
  estimateTreatmentOperationEconomics,
  type OperationalEconomicsAssessment,
} from '@/services/agronomicOperationalEconomicsService'

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
      qualityScore?: number // 0-100
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
    costSource?: 'observed' | 'inventory_derived' | 'estimated'
    economicValue?: number // € valore protetto o generato
    netEconomicImpact?: number // € valore meno costo
    economicRationale?: string[]
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
  totalEconomicValue: number
  totalNetEconomicImpact: number
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
  private storageProvider?: Pick<
    IStorageProvider,
    | 'getGarden'
    | 'getFieldRows'
    | 'getWateringLogs'
    | 'getFertilizerApplicationLogs'
    | 'getTreatments'
    | 'getMechanicalWorks'
    | 'getHarvestLogs'
  > &
    Partial<Pick<IStorageProvider, 'getFertilizerInventory' | 'getPhytoInventory'>>

  constructor(storageProvider?: OperationRegistryService['storageProvider']) {
    this.storageProvider = storageProvider
  }

  setStorageProvider(storageProvider: OperationRegistryService['storageProvider']): void {
    this.storageProvider = storageProvider
  }
  
  /**
   * Registra una nuova operazione
   */
  async registerOperation(operation: OperationRecord): Promise<void> {
    const gardenOperations = this.operations.get(operation.gardenId) || []
    gardenOperations.push(operation)
    this.operations.set(operation.gardenId, gardenOperations)
    console.log('📋 Operazione registrata:', operation)
  }

  async hydrateGardenOperations(gardenId: string): Promise<OperationRecord[]> {
    if (!this.storageProvider) {
      return this.getOperations(gardenId)
    }

    const [
      garden,
      fieldRows,
      wateringLogs,
      fertilizerLogs,
      treatments,
      mechanicalWorks,
      harvestLogs,
      fertilizerInventory,
      phytoInventory,
    ] = await Promise.all([
      this.storageProvider.getGarden(gardenId),
      this.storageProvider.getFieldRows(gardenId),
      this.storageProvider.getWateringLogs(undefined, gardenId),
      this.storageProvider.getFertilizerApplicationLogs(gardenId),
      this.storageProvider.getTreatments(gardenId),
      this.storageProvider.getMechanicalWorks(gardenId),
      this.storageProvider.getHarvestLogs(gardenId),
      this.storageProvider.getFertilizerInventory
        ? this.storageProvider.getFertilizerInventory(gardenId).catch(() => [])
        : Promise.resolve([] as FertilizerInventoryItemDB[]),
      this.storageProvider.getPhytoInventory
        ? this.storageProvider.getPhytoInventory(gardenId).catch(() => [])
        : Promise.resolve([] as PhytoInventoryItemDB[]),
    ])

    const rowNameById = new Map<string, string>(
      fieldRows.map((fieldRow: FieldRow) => [fieldRow.id, fieldRow.name || `Filare ${fieldRow.rowNumber || ''}`.trim()])
    )
    const gardenName = garden?.name || 'Orto'

    const records: OperationRecord[] = [
      ...wateringLogs.map(log => this.mapWateringLog(log, gardenId, gardenName, rowNameById)),
      ...fertilizerLogs.map(log =>
        this.mapFertilizerLog(log, gardenName, rowNameById, fertilizerInventory)
      ),
      ...treatments.map(treatment =>
        this.mapTreatmentLog(treatment, gardenName, rowNameById, phytoInventory)
      ),
      ...mechanicalWorks.map(work => this.mapMechanicalWork(work, gardenName, rowNameById)),
      ...harvestLogs.map(harvest => this.mapHarvestLog(harvest, gardenId, gardenName, rowNameById))
    ]

    this.operations.set(
      gardenId,
      records.sort((a, b) => new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime())
    )

    return this.getOperations(gardenId)
  }

  async getOperationsAsync(gardenId: string, filter?: OperationFilter): Promise<OperationRecord[]> {
    await this.hydrateGardenOperations(gardenId)
    return this.getOperations(gardenId, filter)
  }

  async getFieldRowOperationsAsync(gardenId: string, fieldRowId: string): Promise<OperationRecord[]> {
    await this.hydrateGardenOperations(gardenId)
    return this.getFieldRowOperations(fieldRowId)
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
    
    const totalCost = operations.reduce((sum, op) => sum + this.getOperationCost(op), 0)
    const totalEconomicValue = operations.reduce(
      (sum, op) => sum + (op.results.economicValue || 0),
      0
    )
    const totalNetEconomicImpact = operations.reduce(
      (sum, op) =>
        sum + (typeof op.results.netEconomicImpact === 'number'
          ? op.results.netEconomicImpact
          : (op.results.economicValue || 0) - this.getOperationCost(op)),
      0
    )
    const totalPlantsAffected = operations.reduce((sum, op) => sum + op.results.plantsAffected, 0)
    
    // Calcola efficienza media (basata su costo per pianta)
    const averageEfficiency = totalPlantsAffected > 0
      ? totalCost / totalPlantsAffected
      : operations.length > 0
        ? totalCost / operations.length
      : 0
    
    return {
      totalOperations: operations.length,
      operationsByType,
      totalCost,
      totalEconomicValue,
      totalNetEconomicImpact,
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

    if (summary.totalEconomicValue > 0 && summary.totalNetEconomicImpact > 0) {
      insights.push('Registro operativo con valore economico netto positivo nel periodo selezionato')
    }

    const inventoryBackedOperations = operations.filter(
      operation => operation.results.costSource === 'inventory_derived' || operation.results.costSource === 'observed'
    ).length
    if (inventoryBackedOperations > 0) {
      insights.push(
        `${inventoryBackedOperations} operazioni con costo osservato o derivato da inventario`
      )
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
      'Valore',
      'ImpattoNetto',
      'FonteCosto',
      'Temperatura',
      'Condizioni',
      'Note'
    ]
    
    const rows = operations.map(op => {
      const [datePart, timePart = '00:00'] = op.executedAt.split('T')
      return [
      datePart,
      timePart.slice(0, 5),
      op.type,
      op.fieldRowName,
      op.results.plantsAffected.toString(),
      op.results.totalAmount.toString(),
      `€${this.getOperationCost(op).toFixed(2)}`,
      `€${(op.results.economicValue || 0).toFixed(2)}`,
      `€${(op.results.netEconomicImpact || ((op.results.economicValue || 0) - this.getOperationCost(op))).toFixed(2)}`,
      op.results.costSource || 'estimated',
      `${op.weatherConditions.temperature}°C`,
      op.weatherConditions.condition,
      op.notes || ''
      ]
    })
    
    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')
  }

  private getOperationCost(operation: OperationRecord): number {
    return operation.results.actualCost ?? operation.results.estimatedCost
  }

  private buildOperationResults(
    base: Pick<OperationRecord['results'], 'plantsAffected' | 'fieldRowsAffected' | 'totalAmount' | 'duration'>,
    economics: OperationalEconomicsAssessment
  ): OperationRecord['results'] {
    return {
      ...base,
      estimatedCost: economics.estimatedCost,
      actualCost: economics.actualCost,
      costSource: economics.costSource,
      economicValue: economics.economicValue,
      netEconomicImpact:
        typeof economics.netEconomicImpact === 'number'
          ? economics.netEconomicImpact
          : typeof economics.economicValue === 'number'
            ? Number((economics.economicValue - (economics.actualCost ?? economics.estimatedCost)).toFixed(2))
            : undefined,
      economicRationale: economics.rationale,
    }
  }

  private getRowName(fieldRowId: string | undefined, rowNameById: Map<string, string>): string {
    if (!fieldRowId) {
      return 'Filare non associato'
    }
    return rowNameById.get(fieldRowId) || `Filare ${fieldRowId.slice(0, 8)}`
  }

  private normalizeCultivationType(
    workType?: string
  ): NonNullable<OperationRecord['details']['cultivation']>['type'] {
    switch (workType) {
      case 'weeding':
      case 'hoeing':
      case 'mulching':
      case 'pruning':
        return workType
      default:
        return 'weeding'
    }
  }

  private mapWateringLog(
    log: WateringLog,
    gardenId: string,
    gardenName: string,
    rowNameById: Map<string, string>
  ): OperationRecord {
    const fieldRowId = log.fieldRowId || log.rowId || log.bedRowId || 'unknown'
    const economics = estimateIrrigationOperationEconomics(log)
    return {
      id: log.id,
      type: 'irrigation',
      gardenId,
      gardenName,
      fieldRowId,
      fieldRowName: this.getRowName(fieldRowId, rowNameById),
      executedAt: log.wateredAt || log.date,
      executedBy: 'system',
      details: {
        irrigation: {
          duration: log.durationMinutes,
          waterAmount: log.litersApplied,
          flowRate: log.durationMinutes > 0 ? (log.litersApplied / log.durationMinutes) * 60 : 0
        }
      },
      weatherConditions: {
        temperature: log.airTemperatureC || 0,
        humidity: 0,
        windSpeed: 0,
        condition: (log.weatherCondition?.toLowerCase().includes('piogg') ? 'pioggia' : 'sereno') as OperationRecord['weatherConditions']['condition'],
        source: 'manual'
      },
      results: {
        ...this.buildOperationResults(
          {
            plantsAffected: log.plantsAffected || log.plantIds?.length || 0,
            fieldRowsAffected: 1,
            totalAmount: log.litersApplied,
            duration: log.durationMinutes,
          },
          economics
        )
      },
      notes: log.notes,
      photosCount: 0,
      createdAt: log.createdAt,
      status: log.completed ? 'completed' : 'scheduled'
    }
  }

  private mapFertilizerLog(
    log: FertilizerApplicationLogDB,
    gardenName: string,
    rowNameById: Map<string, string>,
    inventoryItems: FertilizerInventoryItemDB[]
  ): OperationRecord {
    const fieldRowId = log.fieldRowId || log.bedRowId || 'unknown'
    const economics = estimateFertilizationOperationEconomics(log, inventoryItems)
    return {
      id: log.id,
      type: 'fertilization',
      gardenId: log.gardenId,
      gardenName,
      fieldRowId,
      fieldRowName: this.getRowName(fieldRowId, rowNameById),
      executedAt: log.applicationDate,
      executedBy: 'system',
      details: {
        fertilization: {
          type: log.fertilizerProductName,
          dosagePerPlant: 0,
          totalDosage: log.dosageAmount,
          applicationMethod: log.method === 'foliar' ? 'foliar' : log.method === 'fertigation' ? 'fertigation' : 'soil'
        }
      },
      weatherConditions: {
        temperature: log.weatherConditions?.temp || 0,
        humidity: log.weatherConditions?.humidity || 0,
        windSpeed: 0,
        condition: 'sereno',
        source: 'manual'
      },
      results: {
        ...this.buildOperationResults(
          {
            plantsAffected: 0,
            fieldRowsAffected: 1,
            totalAmount: log.dosageAmount,
          },
          economics
        )
      },
      notes: log.notes || economics.rationale[0],
      photosCount: 0,
      createdAt: log.applicationDate,
      status: 'completed'
    }
  }

  private mapTreatmentLog(
    treatment: TreatmentRecordDB,
    gardenName: string,
    rowNameById: Map<string, string>,
    inventoryItems: PhytoInventoryItemDB[]
  ): OperationRecord {
    const fieldRowId = treatment.field_row_id || treatment.bed_row_id || 'unknown'
    const economics = estimateTreatmentOperationEconomics(treatment, inventoryItems)
    return {
      id: treatment.id,
      type: 'treatment',
      gardenId: treatment.garden_id || 'unknown',
      gardenName,
      fieldRowId,
      fieldRowName: this.getRowName(fieldRowId, rowNameById),
      executedAt: treatment.treatment_date,
      executedBy: treatment.operator_name || 'system',
      details: {
        treatment: {
          productName: treatment.product_name,
          activeIngredient: treatment.active_ingredient || '',
          concentration: treatment.dosage || 0,
          treatmentType:
            treatment.treatment_type === 'organic'
              ? 'biologico'
              : treatment.reason === 'pest_control'
                ? 'insetticida'
                : treatment.reason === 'nutrient'
                  ? 'biologico'
                  : 'fungicida',
          applicationMethod:
            treatment.method === 'spray' || treatment.method === 'soil'
              ? treatment.method
              : 'systemic'
        }
      },
      weatherConditions: {
        temperature: treatment.weather_conditions?.temp || 0,
        humidity: treatment.weather_conditions?.humidity || 0,
        windSpeed: 0,
        condition: 'sereno',
        source: 'manual'
      },
      results: {
        ...this.buildOperationResults(
          {
            plantsAffected: 0,
            fieldRowsAffected: 1,
            totalAmount: treatment.dosage || 0,
          },
          economics
        )
      },
      notes: treatment.notes,
      photosCount: 0,
      createdAt: treatment.created_at,
      status: 'completed'
    }
  }

  private mapMechanicalWork(
    work: MechanicalWorkRecord,
    gardenName: string,
    rowNameById: Map<string, string>
  ): OperationRecord {
    const fieldRowId = work.field_row_id || work.bed_row_id || 'unknown'
    const economics = estimateMechanicalOperationEconomics(work)
    return {
      id: work.id,
      type: 'cultivation',
      gardenId: work.garden_id || 'unknown',
      gardenName,
      fieldRowId,
      fieldRowName: this.getRowName(fieldRowId, rowNameById),
      executedAt: work.work_date,
      executedBy: work.operator_name || 'system',
      details: {
        cultivation: {
          type: this.normalizeCultivationType(work.work_type),
          tools: work.equipment_type || work.equipment_attachment || 'attrezzatura'
        }
      },
      weatherConditions: {
        temperature: work.weather_conditions?.temp || 0,
        humidity: work.weather_conditions?.humidity || 0,
        windSpeed: 0,
        condition: work.weather_conditions?.rain ? 'pioggia' : 'sereno',
        source: 'manual'
      },
      results: {
        ...this.buildOperationResults(
          {
            plantsAffected: 0,
            fieldRowsAffected: 1,
            totalAmount: work.area_m2,
          },
          economics
        )
      },
      notes: work.notes,
      photosCount: 0,
      createdAt: work.created_at,
      status: 'completed'
    }
  }

  private mapHarvestLog(
    harvest: HarvestLogData,
    gardenId: string,
    gardenName: string,
    rowNameById: Map<string, string>
  ): OperationRecord {
    const fieldRowId = harvest.strawberryHarvest?.plantPosition?.rowId || 'unknown'
    const economics = estimateHarvestOperationEconomics(harvest)
    return {
      id: harvest.id || `harvest-${gardenId}-${harvest.date}-${harvest.quantity}`,
      type: 'harvest',
      gardenId,
      gardenName,
      fieldRowId,
      fieldRowName: this.getRowName(fieldRowId, rowNameById),
      executedAt: harvest.date,
      executedBy: 'system',
      details: {
        harvest: {
          expectedYield: harvest.quantity,
          actualYield: harvest.quantity,
          qualityGrade: harvest.rating >= 4 ? 'A' : harvest.rating >= 3 ? 'B' : 'C',
          qualityScore: harvest.rating * 20
        }
      },
      weatherConditions: {
        temperature: 0,
        humidity: 0,
        windSpeed: 0,
        condition: 'sereno',
        source: 'manual'
      },
      results: {
        ...this.buildOperationResults(
          {
            plantsAffected: 1,
            fieldRowsAffected: fieldRowId === 'unknown' ? 0 : 1,
            totalAmount: harvest.quantity,
          },
          economics
        )
      },
      notes: harvest.notes,
      photosCount: 0,
      createdAt: harvest.date,
      status: 'completed'
    }
  }
}

// Singleton instance
export const operationRegistryService = new OperationRegistryService()
