/**
 * Unified Plant Tracking Service
 * Sistema unificato per tracciamento completo piante dal seme alla raccolta
 * 
 * Funzionalità:
 * - Registrazione interattiva di ogni operazione
 * - Tracciabilità completa del ciclo di vita
 * - Analisi correlazioni input → risultati
 * - Suggerimenti AI basati su dati storici
 * - Integrazione con monitoraggio continuo
 */

import { GardenPlant, PlantOperation, PlantHarvest } from '@/types/individualPlant'
import { Garden, GardenTask } from '@/types'

export interface PlantLifecycleStage {
  id: string
  name: string
  startDate: string
  endDate?: string
  expectedDuration: number // giorni
  actualDuration?: number
  status: 'pending' | 'active' | 'completed' | 'skipped'
  requirements: {
    temperature: { min: number; max: number; optimal: number }
    humidity: { min: number; max: number; optimal: number }
    light: 'low' | 'medium' | 'high' | 'full_sun'
    water: 'low' | 'medium' | 'high'
    nutrients: string[]
  }
  milestones: {
    id: string
    name: string
    description: string
    achieved: boolean
    achievedDate?: string
    photos?: string[]
  }[]
}

export interface PlantTrackingRecord {
  id: string
  plantId: string
  timestamp: string
  type: 'operation' | 'observation' | 'milestone' | 'issue' | 'harvest'
  category: 'seeding' | 'growth' | 'care' | 'protection' | 'harvest' | 'analysis'
  
  // Dati operazione
  operationData?: {
    operationType: PlantOperation['operationType'] | 'sowing'
    quantity: number
    unit: string
    product?: string
    cost?: number
    duration?: number // minuti
    weather?: {
      temperature: number
      humidity: number
      conditions: string
    }
  }
  
  // Dati osservazione
  observationData?: {
    healthScore: number
    height?: number // cm
    width?: number // cm
    leafCount?: number
    flowerCount?: number
    fruitCount?: number
    issues?: string[]
    notes: string
    photos?: string[]
  }
  
  // Dati raccolta
  harvestData?: {
    quantity: number
    unit: 'kg' | 'g' | 'pieces'
    quality: 1 | 2 | 3 | 4 | 5
    marketValue?: number
    destination: 'personal' | 'market' | 'processing' | 'seed'
  }
  
  // Metadati
  recordedBy: string
  verified: boolean
  gpsLocation?: { lat: number; lng: number }
  environmentalData?: {
    soilMoisture?: number
    soilPH?: number
    ambientLight?: number
  }
  metadata?: Record<string, any>
}
export interface PlantAnalytics {
  plantId: string
  plantCode: string
  plantName: string
  variety: string
  
  // Ciclo di vita
  lifecycle: {
    currentStage: PlantLifecycleStage
    completedStages: PlantLifecycleStage[]
    totalDays: number
    expectedHarvestDate: string
    actualHarvestDate?: string
  }
  
  // Performance
  performance: {
    healthTrend: Array<{ date: string; score: number }>
    growthRate: number // cm/giorno
    survivalRate: number // 0-1
    yieldPerPlant: number // kg
    yieldPerSqMeter: number // kg/m²
    qualityAverage: number // 1-5
  }
  
  // Costi e ROI
  economics: {
    totalCosts: number
    costBreakdown: {
      seeds: number
      water: number
      fertilizers: number
      treatments: number
      labor: number
      other: number
    }
    revenue: number
    profit: number
    roi: number // %
    costPerKg: number
  }
  
  // Correlazioni input → output
  correlations: {
    wateringFrequency: { correlation: number; impact: 'positive' | 'negative' | 'neutral' }
    fertilizerAmount: { correlation: number; impact: 'positive' | 'negative' | 'neutral' }
    treatmentFrequency: { correlation: number; impact: 'positive' | 'negative' | 'neutral' }
    environmentalStress: { correlation: number; impact: 'positive' | 'negative' | 'neutral' }
  }
  
  // Suggerimenti AI
  aiInsights: {
    strengths: string[]
    weaknesses: string[]
    recommendations: Array<{
      type: 'immediate' | 'short_term' | 'long_term'
      priority: 'high' | 'medium' | 'low'
      action: string
      expectedImpact: string
      confidence: number // 0-1
    }>
    predictedYield: {
      estimate: number
      confidence: number
      factors: string[]
    }
  }
}

/**
 * CLASSE PRINCIPALE UNIFIED PLANT TRACKING SERVICE
 */
export class UnifiedPlantTrackingService {
  private records: Map<string, PlantTrackingRecord[]> = new Map()
  private analytics: Map<string, PlantAnalytics> = new Map()
  
  /**
   * Registra una nuova operazione sulla pianta
   */
  async recordOperation(
    plantId: string,
    operationType: PlantOperation['operationType'],
    data: {
      quantity: number
      unit: string
      product?: string
      cost?: number
      notes?: string
      photos?: string[]
      weather?: any
      gpsLocation?: { lat: number; lng: number }
    }
  ): Promise<PlantTrackingRecord> {
    const record: PlantTrackingRecord = {
      id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      plantId,
      timestamp: new Date().toISOString(),
      type: 'operation',
      category: this.mapOperationToCategory(operationType),
      operationData: {
        operationType,
        quantity: data.quantity,
        unit: data.unit,
        product: data.product,
        cost: data.cost,
        duration: this.estimateOperationDuration(operationType),
        weather: data.weather
      },
      recordedBy: 'current_user', // TODO: Get from auth
      verified: true,
      gpsLocation: data.gpsLocation
    }
    
    await this.addRecord(plantId, record)
    await this.updatePlantAnalytics(plantId)
    
    return record
  }
  
  /**
   * Registra un'osservazione sulla pianta
   */
  async recordObservation(
    plantId: string,
    data: {
      healthScore: number
      height?: number
      width?: number
      leafCount?: number
      flowerCount?: number
      fruitCount?: number
      issues?: string[]
      notes: string
      photos?: string[]
    }
  ): Promise<PlantTrackingRecord> {
    const record: PlantTrackingRecord = {
      id: `obs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      plantId,
      timestamp: new Date().toISOString(),
      type: 'observation',
      category: 'growth',
      observationData: data,
      recordedBy: 'current_user',
      verified: true
    }
    
    await this.addRecord(plantId, record)
    await this.updatePlantAnalytics(plantId)
    
    return record
  }
  
  /**
   * Registra un raccolto
   */
  async recordHarvest(
    plantId: string,
    data: {
      quantity: number
      unit: 'kg' | 'g' | 'pieces'
      quality: 1 | 2 | 3 | 4 | 5
      marketValue?: number
      destination: 'personal' | 'market' | 'processing' | 'seed'
      notes?: string
      photos?: string[]
    }
  ): Promise<PlantTrackingRecord> {
    const record: PlantTrackingRecord = {
      id: `harv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      plantId,
      timestamp: new Date().toISOString(),
      type: 'harvest',
      category: 'harvest',
      harvestData: data,
      recordedBy: 'current_user',
      verified: true
    }
    
    await this.addRecord(plantId, record)
    await this.updatePlantAnalytics(plantId)
    
    return record
  }
  
  /**
   * Aggiunge un record alla cronologia
   */
  private async addRecord(plantId: string, record: PlantTrackingRecord): Promise<void> {
    if (!this.records.has(plantId)) {
      this.records.set(plantId, [])
    }
    
    this.records.get(plantId)!.push(record)
    
    // TODO: Salva nel database
    console.log(`📝 Recorded ${record.type} for plant ${plantId}:`, record)
  }
  
  /**
   * Aggiorna analytics della pianta
   */
  private async updatePlantAnalytics(plantId: string): Promise<void> {
    const records = this.records.get(plantId) || []
    const analytics = await this.calculatePlantAnalytics(plantId, records)
    
    this.analytics.set(plantId, analytics)
    
    // Trigger AI analysis per suggerimenti
    await this.generateAIInsights(plantId, analytics)
  }
  
  /**
   * Calcola analytics complete per una pianta
   */
  private async calculatePlantAnalytics(
    plantId: string,
    records: PlantTrackingRecord[]
  ): Promise<PlantAnalytics> {
    // Calcola performance
    const healthRecords = records
      .filter(r => r.observationData?.healthScore)
      .map(r => ({
        date: r.timestamp.split('T')[0],
        score: r.observationData!.healthScore
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
    
    const growthRecords = records
      .filter(r => r.observationData?.height)
      .map(r => ({ date: r.timestamp, height: r.observationData!.height! }))
      .sort((a, b) => a.date.localeCompare(b.date))
    
    const growthRate = this.calculateGrowthRate(growthRecords)
    
    // Calcola costi
    const costs = this.calculateCosts(records)
    
    // Calcola resa
    const harvests = records.filter(r => r.type === 'harvest')
    const totalYield = harvests.reduce((sum, h) => {
      const qty = h.harvestData?.quantity || 0
      const unit = h.harvestData?.unit || 'kg'
      return sum + (unit === 'g' ? qty / 1000 : qty)
    }, 0)
    
    const revenue = harvests.reduce((sum, h) => 
      sum + (h.harvestData?.marketValue || 0), 0
    )
    
    // Calcola correlazioni
    const correlations = await this.calculateCorrelations(records)
    
    const analytics: PlantAnalytics = {
      plantId,
      plantCode: `P-${plantId.slice(0, 8)}`,
      plantName: 'Pomodoro', // TODO: Get from plant data
      variety: 'San Marzano',
      
      lifecycle: {
        currentStage: this.getCurrentLifecycleStage(records),
        completedStages: [],
        totalDays: this.calculateTotalDays(records),
        expectedHarvestDate: this.calculateExpectedHarvestDate(records),
        actualHarvestDate: harvests.length > 0 ? harvests[0].timestamp.split('T')[0] : undefined
      },
      
      performance: {
        healthTrend: healthRecords,
        growthRate,
        survivalRate: 1.0, // TODO: Calculate based on plant status
        yieldPerPlant: totalYield,
        yieldPerSqMeter: totalYield * 4, // Assuming 0.25 m² per plant
        qualityAverage: this.calculateAverageQuality(harvests)
      },
      
      economics: {
        totalCosts: costs.total,
        costBreakdown: costs.breakdown,
        revenue,
        profit: revenue - costs.total,
        roi: costs.total > 0 ? ((revenue - costs.total) / costs.total) * 100 : 0,
        costPerKg: totalYield > 0 ? costs.total / totalYield : 0
      },
      
      correlations,
      
      aiInsights: {
        strengths: [],
        weaknesses: [],
        recommendations: [],
        predictedYield: {
          estimate: totalYield * 1.2, // Simple prediction
          confidence: 0.7,
          factors: ['Salute pianta', 'Condizioni meteo', 'Cure ricevute']
        }
      }
    }
    
    return analytics
  }
  
  /**
   * Genera insights AI basati sui dati
   */
  private async generateAIInsights(
    plantId: string,
    analytics: PlantAnalytics
  ): Promise<void> {
    const insights = analytics.aiInsights
    
    // Analizza punti di forza
    if (analytics.performance.healthTrend.length > 0) {
      const avgHealth = analytics.performance.healthTrend.reduce((sum, h) => sum + h.score, 0) / analytics.performance.healthTrend.length
      if (avgHealth > 80) {
        insights.strengths.push('Salute eccellente mantenuta costantemente')
      }
    }
    
    if (analytics.performance.growthRate > 0.5) {
      insights.strengths.push('Crescita rapida e vigorosa')
    }
    
    if (analytics.economics.roi > 50) {
      insights.strengths.push('ROI superiore alla media del settore')
    }
    
    // Analizza debolezze
    if (analytics.economics.costPerKg > 2.0) {
      insights.weaknesses.push('Costi di produzione elevati')
    }
    
    if (analytics.performance.qualityAverage < 3.5) {
      insights.weaknesses.push('Qualità del raccolto sotto la media')
    }
    
    // Genera raccomandazioni
    if (analytics.correlations.wateringFrequency.correlation > 0.7) {
      insights.recommendations.push({
        type: 'immediate',
        priority: 'high',
        action: 'Aumentare frequenza irrigazione',
        expectedImpact: 'Miglioramento salute +15%',
        confidence: 0.8
      })
    }
    
    if (analytics.economics.costPerKg > 1.5) {
      insights.recommendations.push({
        type: 'short_term',
        priority: 'medium',
        action: 'Ottimizzare dosaggio fertilizzanti',
        expectedImpact: 'Riduzione costi -20%',
        confidence: 0.6
      })
    }
    
    // Aggiorna analytics
    this.analytics.set(plantId, analytics)
  }
  
  /**
   * UTILITY FUNCTIONS
   */
  
  private mapOperationToCategory(operationType: PlantOperation['operationType'] | 'sowing'): PlantTrackingRecord['category'] {
    const mapping: Record<string, PlantTrackingRecord['category']> = {
      'sowing': 'seeding',
      'watering': 'care',
      'fertilizing': 'care',
      'treatment': 'protection',
      'pruning': 'care',
      'harvest': 'harvest',
      'transplanting': 'seeding',
      'thinning': 'care',
      'staking': 'care',
      'mulching': 'care'
    }
    
    return mapping[operationType] || 'care'
  }
  
  private estimateOperationDuration(operationType: PlantOperation['operationType']): number {
    const durations: Record<string, number> = {
      'watering': 5,
      'fertilizing': 15,
      'treatment': 20,
      'pruning': 30,
      'harvest': 45,
      'transplanting': 20,
      'thinning': 25,
      'staking': 15,
      'mulching': 30
    }
    
    return durations[operationType] || 10
  }
  
  private calculateGrowthRate(growthRecords: Array<{ date: string; height: number }>): number {
    if (growthRecords.length < 2) return 0
    
    const first = growthRecords[0]
    const last = growthRecords[growthRecords.length - 1]
    
    const daysDiff = (new Date(last.date).getTime() - new Date(first.date).getTime()) / (1000 * 60 * 60 * 24)
    const heightDiff = last.height - first.height
    
    return daysDiff > 0 ? heightDiff / daysDiff : 0
  }
  
  private calculateCosts(records: PlantTrackingRecord[]): {
    total: number
    breakdown: PlantAnalytics['economics']['costBreakdown']
  } {
    const breakdown = {
      seeds: 0,
      water: 0,
      fertilizers: 0,
      treatments: 0,
      labor: 0,
      other: 0
    }
    
    records.forEach(record => {
      if (record.operationData?.cost) {
        const cost = record.operationData.cost
        const type = record.operationData.operationType
        
        switch (type) {
          case 'watering':
            breakdown.water += cost
            break
          case 'fertilizing':
            breakdown.fertilizers += cost
            break
          case 'treatment':
            breakdown.treatments += cost
            break
          default:
            breakdown.other += cost
        }
      }
      
      // Calcola costo manodopera (€0.20/minuto)
      if (record.operationData?.duration) {
        breakdown.labor += record.operationData.duration * 0.20
      }
    })
    
    const total = Object.values(breakdown).reduce((sum, cost) => sum + cost, 0)
    
    return { total: Math.round(total * 100) / 100, breakdown }
  }
  
  private calculateAverageQuality(harvests: PlantTrackingRecord[]): number {
    if (harvests.length === 0) return 0
    
    const totalQuality = harvests.reduce((sum, h) => 
      sum + (h.harvestData?.quality || 0), 0
    )
    
    return totalQuality / harvests.length
  }
  
  private async calculateCorrelations(records: PlantTrackingRecord[]): Promise<PlantAnalytics['correlations']> {
    // Simplified correlation calculation
    // In a real implementation, this would use statistical analysis
    
    return {
      wateringFrequency: { correlation: 0.75, impact: 'positive' },
      fertilizerAmount: { correlation: 0.60, impact: 'positive' },
      treatmentFrequency: { correlation: -0.20, impact: 'negative' },
      environmentalStress: { correlation: -0.80, impact: 'negative' }
    }
  }
  
  private getCurrentLifecycleStage(records: PlantTrackingRecord[]): PlantLifecycleStage {
    // Determina stage corrente basato sui record
    const hasHarvest = records.some(r => r.type === 'harvest')
    const hasFlowers = records.some(r => r.observationData?.flowerCount && r.observationData.flowerCount > 0)
    const hasFruits = records.some(r => r.observationData?.fruitCount && r.observationData.fruitCount > 0)
    
    if (hasHarvest) {
      return {
        id: 'harvest',
        name: 'Raccolta',
        startDate: new Date().toISOString().split('T')[0],
        status: 'completed',
        expectedDuration: 30,
        requirements: {
          temperature: { min: 15, max: 30, optimal: 22 },
          humidity: { min: 50, max: 70, optimal: 60 },
          light: 'full_sun',
          water: 'medium',
          nutrients: []
        },
        milestones: []
      }
    } else if (hasFruits) {
      return {
        id: 'fruiting',
        name: 'Fruttificazione',
        startDate: new Date().toISOString().split('T')[0],
        status: 'active',
        expectedDuration: 45,
        requirements: {
          temperature: { min: 18, max: 28, optimal: 24 },
          humidity: { min: 60, max: 80, optimal: 70 },
          light: 'full_sun',
          water: 'high',
          nutrients: ['Potassio', 'Fosforo']
        },
        milestones: []
      }
    } else if (hasFlowers) {
      return {
        id: 'flowering',
        name: 'Fioritura',
        startDate: new Date().toISOString().split('T')[0],
        status: 'active',
        expectedDuration: 21,
        requirements: {
          temperature: { min: 16, max: 26, optimal: 21 },
          humidity: { min: 55, max: 75, optimal: 65 },
          light: 'full_sun',
          water: 'medium',
          nutrients: ['Fosforo', 'Potassio']
        },
        milestones: []
      }
    } else {
      return {
        id: 'vegetative',
        name: 'Crescita Vegetativa',
        startDate: new Date().toISOString().split('T')[0],
        status: 'active',
        expectedDuration: 60,
        requirements: {
          temperature: { min: 12, max: 25, optimal: 20 },
          humidity: { min: 50, max: 80, optimal: 65 },
          light: 'high',
          water: 'medium',
          nutrients: ['Azoto', 'Fosforo', 'Potassio']
        },
        milestones: []
      }
    }
  }
  
  private calculateTotalDays(records: PlantTrackingRecord[]): number {
    if (records.length === 0) return 0
    
    const firstRecord = records.sort((a, b) => a.timestamp.localeCompare(b.timestamp))[0]
    const daysDiff = (Date.now() - new Date(firstRecord.timestamp).getTime()) / (1000 * 60 * 60 * 24)
    
    return Math.floor(daysDiff)
  }
  
  private calculateExpectedHarvestDate(records: PlantTrackingRecord[]): string {
    // Calcola data raccolta prevista basata su stage corrente
    const currentStage = this.getCurrentLifecycleStage(records)
    const today = new Date()
    
    let daysToHarvest = 90 // Default per pomodori
    
    switch (currentStage.id) {
      case 'vegetative':
        daysToHarvest = 60
        break
      case 'flowering':
        daysToHarvest = 45
        break
      case 'fruiting':
        daysToHarvest = 21
        break
      case 'harvest':
        daysToHarvest = 0
        break
    }
    
    const harvestDate = new Date(today.getTime() + daysToHarvest * 24 * 60 * 60 * 1000)
    return harvestDate.toISOString().split('T')[0]
  }
  
  /**
   * API PUBBLICHE
   */
  
  /**
   * Ottiene tutti i record di una pianta
   */
  getPlantRecords(plantId: string): PlantTrackingRecord[] {
    return this.records.get(plantId) || []
  }
  
  /**
   * Ottiene analytics di una pianta
   */
  getPlantAnalytics(plantId: string): PlantAnalytics | undefined {
    return this.analytics.get(plantId)
  }
  
  /**
   * Ottiene record per tipo
   */
  getRecordsByType(plantId: string, type: PlantTrackingRecord['type']): PlantTrackingRecord[] {
    return this.getPlantRecords(plantId).filter(r => r.type === type)
  }
  
  /**
   * Ottiene record per categoria
   */
  getRecordsByCategory(plantId: string, category: PlantTrackingRecord['category']): PlantTrackingRecord[] {
    return this.getPlantRecords(plantId).filter(r => r.category === category)
  }
  
  /**
   * Ottiene record in un range di date
   */
  getRecordsByDateRange(plantId: string, startDate: string, endDate: string): PlantTrackingRecord[] {
    return this.getPlantRecords(plantId).filter(r => {
      const recordDate = r.timestamp.split('T')[0]
      return recordDate >= startDate && recordDate <= endDate
    })
  }
  
  /**
   * Esporta dati per tracciabilità
   */
  exportTraceabilityData(plantId: string): {
    plant: { id: string; code: string; name: string; variety: string }
    lifecycle: PlantAnalytics['lifecycle']
    records: PlantTrackingRecord[]
    analytics: PlantAnalytics
    qrCode: string
  } {
    const records = this.getPlantRecords(plantId)
    const analytics = this.getPlantAnalytics(plantId)
    
    if (!analytics) {
      throw new Error(`No analytics found for plant ${plantId}`)
    }
    
    return {
      plant: {
        id: plantId,
        code: analytics.plantCode,
        name: analytics.plantName,
        variety: analytics.variety
      },
      lifecycle: analytics.lifecycle,
      records: records.sort((a, b) => a.timestamp.localeCompare(b.timestamp)),
      analytics,
      qrCode: `QR_${plantId.toUpperCase()}_${Date.now()}`
    }
  }
  
  /**
   * Genera report comparativo tra piante
   */
  generateComparativeReport(plantIds: string[]): {
    plants: Array<{
      id: string
      name: string
      performance: PlantAnalytics['performance']
      economics: PlantAnalytics['economics']
      ranking: number
    }>
    insights: {
      bestPerformer: string
      mostProfitable: string
      recommendations: string[]
    }
  } {
    const plants = plantIds
      .map(id => this.getPlantAnalytics(id))
      .filter(Boolean) as PlantAnalytics[]
    
    const plantsWithRanking = plants
      .map(p => ({
        id: p.plantId,
        name: p.plantName,
        performance: p.performance,
        economics: p.economics,
        ranking: this.calculateOverallRanking(p)
      }))
      .sort((a, b) => b.ranking - a.ranking)
    
    const bestPerformer = plantsWithRanking[0]?.id || ''
    const mostProfitable = plants
      .sort((a, b) => b.economics.roi - a.economics.roi)[0]?.plantId || ''
    
    return {
      plants: plantsWithRanking,
      insights: {
        bestPerformer,
        mostProfitable,
        recommendations: [
          'Replica le pratiche della pianta migliore',
          'Ottimizza i costi delle piante meno profittevoli',
          'Monitora più frequentemente le piante in difficoltà'
        ]
      }
    }
  }
  
  private calculateOverallRanking(analytics: PlantAnalytics): number {
    // Calcola ranking basato su multiple metriche
    const healthScore = analytics.performance.healthTrend.length > 0 
      ? analytics.performance.healthTrend[analytics.performance.healthTrend.length - 1].score 
      : 0
    
    const yieldScore = Math.min(analytics.performance.yieldPerPlant * 20, 100) // Max 5kg = 100 points
    const qualityScore = analytics.performance.qualityAverage * 20 // Max 5 = 100 points
    const roiScore = Math.min(analytics.economics.roi, 100) // Max 100% = 100 points
    
    return (healthScore * 0.3 + yieldScore * 0.3 + qualityScore * 0.2 + roiScore * 0.2)
  }
}

/**
 * SINGLETON
 */
export const unifiedPlantTrackingService = new UnifiedPlantTrackingService()

/**
 * ESTENSIONE: GESTIONE SEMINA vs TRAPIANTO VIVAIO
 */

export interface PlantOrigin {
  type: 'seed' | 'nursery_seedling' | 'cutting' | 'bulb' | 'transplant'
  
  // Dati per semina diretta
  seedData?: {
    variety: string
    supplier: string
    lotNumber: string
    expirationDate: string
    germinationRate: number // %
    seedsPerGram: number
    costPerSeed: number // €
    organicCertified: boolean
    treatmentApplied?: string
  }
  
  // Dati per piantina da vivaio
  nurseryData?: {
    nurseryName: string
    variety: string
    age: number // giorni
    potSize: string // es. "10cm"
    rootingMedium: string // es. "torba", "cocco"
    costPerSeedling: number // €
    healthCertificate: boolean
    organicCertified: boolean
    acclimatizationNeeded: boolean
    transplantShock: 'low' | 'medium' | 'high'
  }
  
  // Dati comuni
  plantingDate: string
  expectedGerminationDays?: number
  expectedTransplantDays?: number
  initialHealthScore: number
  photos?: string[]
  notes?: string
}

export interface PlantLifecycleStageExtended extends PlantLifecycleStage {
  // Stages specifici per origine
  originSpecificStages: {
    // Per semina diretta
    seed?: {
      germination: {
        expectedDays: number
        actualDays?: number
        germinationRate: number // %
        issues?: string[]
      }
      seedlingCare: {
        thinningNeeded: boolean
        thinningDate?: string
        protectionNeeded: boolean
      }
    }
    
    // Per trapianto vivaio
    nursery?: {
      acclimatization: {
        expectedDays: number
        actualDays?: number
        shockLevel: 'none' | 'mild' | 'moderate' | 'severe'
        recoveryActions?: string[]
      }
      rootEstablishment: {
        expectedDays: number
        actualDays?: number
        rootingSuccess: boolean
        supplementalCareNeeded: boolean
      }
    }
  }
}

/**
 * Registra l'origine di una pianta (semina o trapianto)
 */
export async function recordPlantOrigin(
  plantId: string,
  origin: PlantOrigin
): Promise<PlantTrackingRecord> {
  const record: PlantTrackingRecord = {
    id: `origin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    plantId,
    timestamp: new Date().toISOString(),
    type: 'operation',
    category: 'seeding',
    operationData: {
      operationType: origin.type === 'seed' ? 'sowing' : 'transplanting',
      quantity: 1,
      unit: origin.type === 'seed' ? 'seed' : 'seedling',
      product: origin.seedData?.variety || origin.nurseryData?.variety || 'Unknown',
      cost: origin.seedData?.costPerSeed || origin.nurseryData?.costPerSeedling || 0,
      duration: origin.type === 'seed' ? 10 : 15 // minuti
    },
    recordedBy: 'current_user',
    verified: true,
    metadata: {
      origin,
      traceabilityStart: true
    }
  }
  
  // Salva nel sistema unificato
  await unifiedPlantTrackingService['addRecord'](plantId, record)
  
  return record
}

/**
 * Calcola analytics specifiche per origine
 */
export function calculateOriginSpecificAnalytics(
  plantId: string,
  records: PlantTrackingRecord[]
): {
  originType: 'seed' | 'nursery_seedling' | 'unknown'
  originData: PlantOrigin | null
  
  // Metriche specifiche semina
  seedMetrics?: {
    germinationSuccess: boolean
    germinationDays: number
    germinationRate: number // %
    seedCost: number
    thinningPerformed: boolean
    survivalRate: number // %
  }
  
  // Metriche specifiche vivaio
  nurseryMetrics?: {
    transplantSuccess: boolean
    acclimatizationDays: number
    transplantShock: 'none' | 'mild' | 'moderate' | 'severe'
    seedlingCost: number
    rootEstablishmentDays: number
    survivalRate: number // %
  }
  
  // Confronto costi
  costAnalysis: {
    initialCost: number
    costPerSurvivedPlant: number
    timeToProduction: number // giorni
    totalCareHours: number
    costEfficiency: 'excellent' | 'good' | 'average' | 'poor'
  }
} {
  // Trova record di origine
  const originRecord = records.find(r => 
    r.metadata?.traceabilityStart && r.metadata?.origin
  )
  
  if (!originRecord?.metadata?.origin) {
    return {
      originType: 'unknown',
      originData: null,
      costAnalysis: {
        initialCost: 0,
        costPerSurvivedPlant: 0,
        timeToProduction: 0,
        totalCareHours: 0,
        costEfficiency: 'poor'
      }
    }
  }
  
  const origin = originRecord.metadata.origin as PlantOrigin
  const plantingDate = new Date(origin.plantingDate)
  const now = new Date()
  const daysFromPlanting = Math.floor((now.getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24))
  
  // Calcola costi totali
  const totalCosts = records
    .filter(r => r.operationData?.cost)
    .reduce((sum, r) => sum + (r.operationData?.cost || 0), 0)
  
  // Calcola ore di cura
  const totalCareHours = records
    .filter(r => r.operationData?.duration)
    .reduce((sum, r) => sum + (r.operationData?.duration || 0), 0) / 60
  
  const costEfficiency: 'excellent' | 'good' | 'average' | 'poor' =
    totalCosts < 2 ? 'excellent' : totalCosts < 4 ? 'good' : totalCosts < 6 ? 'average' : 'poor'

  const baseAnalysis: {
    initialCost: number
    costPerSurvivedPlant: number
    timeToProduction: number
    totalCareHours: number
    costEfficiency: 'excellent' | 'good' | 'average' | 'poor'
  } = {
    initialCost: origin.seedData?.costPerSeed || origin.nurseryData?.costPerSeedling || 0,
    costPerSurvivedPlant: totalCosts, // Assumendo 1 pianta sopravvissuta
    timeToProduction: daysFromPlanting,
    totalCareHours,
    costEfficiency
  }
  
  if (origin.type === 'seed') {
    // Analisi specifica per semina
    const germinationRecord = records.find(r => 
      r.observationData && r.timestamp > origin.plantingDate
    )
    
    const germinationDays = germinationRecord 
      ? Math.floor((new Date(germinationRecord.timestamp).getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24))
      : 0
    
    return {
      originType: 'seed',
      originData: origin,
      seedMetrics: {
        germinationSuccess: germinationDays > 0 && germinationDays <= (origin.expectedGerminationDays || 14),
        germinationDays,
        germinationRate: origin.seedData?.germinationRate || 0,
        seedCost: origin.seedData?.costPerSeed || 0,
        thinningPerformed: records.some(r => r.operationData?.operationType === 'thinning'),
        survivalRate: 100 // Semplificato - assumendo sopravvivenza se ci sono record
      },
      costAnalysis: baseAnalysis
    }
  } else {
    // Analisi specifica per vivaio
    const transplantDate = new Date(origin.plantingDate)
    const acclimatizationDays = Math.min(daysFromPlanting, 14) // Max 14 giorni per acclimatazione
    
    return {
      originType: 'nursery_seedling',
      originData: origin,
      nurseryMetrics: {
        transplantSuccess: daysFromPlanting > 7, // Se sopravvive 7 giorni = successo
        acclimatizationDays,
        transplantShock:
          origin.nurseryData?.transplantShock === 'high'
            ? 'severe'
            : origin.nurseryData?.transplantShock === 'medium'
              ? 'moderate'
              : origin.nurseryData?.transplantShock === 'low'
                ? 'mild'
                : 'none',
        seedlingCost: origin.nurseryData?.costPerSeedling || 0,
        rootEstablishmentDays: Math.min(daysFromPlanting, 21), // Max 21 giorni per radicamento
        survivalRate: 100 // Semplificato
      },
      costAnalysis: baseAnalysis
    }
  }
}

/**
 * Genera suggerimenti AI specifici per origine
 */
export function generateOriginSpecificRecommendations(
  originAnalysis: ReturnType<typeof calculateOriginSpecificAnalytics>,
  currentHealthScore: number,
  daysFromPlanting: number
): Array<{
  type: 'immediate' | 'short_term' | 'long_term'
  priority: 'high' | 'medium' | 'low'
  action: string
  reason: string
  expectedImpact: string
  confidence: number
}> {
  const recommendations: Array<{
    type: 'immediate' | 'short_term' | 'long_term'
    priority: 'high' | 'medium' | 'low'
    action: string
    reason: string
    expectedImpact: string
    confidence: number
  }> = []
  
  if (originAnalysis.originType === 'seed' && originAnalysis.seedMetrics) {
    const metrics = originAnalysis.seedMetrics
    
    // Suggerimenti per semina
    if (!metrics.germinationSuccess && daysFromPlanting > 14) {
      recommendations.push({
        type: 'immediate',
        priority: 'high',
        action: 'Verifica condizioni germinazione e considera risemina',
        reason: `Germinazione non avvenuta dopo ${daysFromPlanting} giorni`,
        expectedImpact: 'Recupero tempo perso, resa stagionale',
        confidence: 0.9
      })
    }
    
    if (metrics.germinationSuccess && !metrics.thinningPerformed && daysFromPlanting > 21) {
      recommendations.push({
        type: 'short_term',
        priority: 'medium',
        action: 'Esegui diradamento piantine più deboli',
        reason: 'Piantine da seme spesso crescono troppo fitte',
        expectedImpact: 'Piante più forti, resa +20%',
        confidence: 0.8
      })
    }
    
    if (currentHealthScore < 70 && daysFromPlanting < 30) {
      recommendations.push({
        type: 'immediate',
        priority: 'high',
        action: 'Aumenta protezione piantine giovani (tunnel, pacciamatura)',
        reason: 'Piantine da seme più vulnerabili nelle prime settimane',
        expectedImpact: 'Salute +25%, sopravvivenza +30%',
        confidence: 0.85
      })
    }
    
  } else if (originAnalysis.originType === 'nursery_seedling' && originAnalysis.nurseryMetrics) {
    const metrics = originAnalysis.nurseryMetrics
    
    // Suggerimenti per trapianto vivaio
    if (metrics.transplantShock !== 'none' && daysFromPlanting < 14) {
      recommendations.push({
        type: 'immediate',
        priority: 'high',
        action: 'Aumenta frequenza irrigazione e riduci esposizione solare',
        reason: `Shock da trapianto ${metrics.transplantShock} rilevato`,
        expectedImpact: 'Recupero più rapido, salute +30%',
        confidence: 0.9
      })
    }
    
    if (!metrics.transplantSuccess && daysFromPlanting > 10) {
      recommendations.push({
        type: 'immediate',
        priority: 'high',
        action: 'Applica stimolante radicale e verifica drenaggio',
        reason: 'Attecchimento non ottimale dopo 10 giorni',
        expectedImpact: 'Salvataggio pianta, evita perdita €' + metrics.seedlingCost,
        confidence: 0.7
      })
    }
    
    if (metrics.transplantSuccess && daysFromPlanting > 21) {
      recommendations.push({
        type: 'short_term',
        priority: 'low',
        action: 'Inizia fertilizzazione regolare, pianta ben radicata',
        reason: 'Superata fase critica di attecchimento',
        expectedImpact: 'Crescita accelerata, produzione anticipata',
        confidence: 0.8
      })
    }
  }
  
  // Suggerimenti economici
  if (originAnalysis.costAnalysis.costEfficiency === 'poor') {
    recommendations.push({
      type: 'long_term',
      priority: 'medium',
      action: originAnalysis.originType === 'seed' 
        ? 'Considera acquisto piantine per varietà difficili'
        : 'Valuta semina diretta per ridurre costi',
      reason: `Costo per pianta elevato: €${originAnalysis.costAnalysis.costPerSurvivedPlant.toFixed(2)}`,
      expectedImpact: 'Riduzione costi -30%, stesso risultato',
      confidence: 0.6
    })
  }
  
  return recommendations
}

/**
 * Confronta performance semina vs vivaio
 */
export function compareOriginPerformance(
  seedPlants: string[],
  nurseryPlants: string[]
): {
  comparison: {
    metric: string
    seedValue: number
    nurseryValue: number
    winner: 'seed' | 'nursery' | 'tie'
    difference: number
  }[]
  
  recommendation: {
    preferredMethod: 'seed' | 'nursery' | 'mixed'
    reason: string
    confidence: number
  }
  
  economicAnalysis: {
    seedCostPerKg: number
    nurseryCostPerKg: number
    breakEvenPoint: number // giorni
    roi: {
      seed: number
      nursery: number
    }
  }
} {
  // Calcola metriche per entrambi i gruppi
  const seedAnalytics = seedPlants
    .map(id => unifiedPlantTrackingService.getPlantAnalytics(id))
    .filter((analytics): analytics is PlantAnalytics => analytics !== undefined)
  
  const nurseryAnalytics = nurseryPlants
    .map(id => unifiedPlantTrackingService.getPlantAnalytics(id))
    .filter((analytics): analytics is PlantAnalytics => analytics !== undefined)
  
  if (seedAnalytics.length === 0 || nurseryAnalytics.length === 0) {
    return {
      comparison: [],
      recommendation: {
        preferredMethod: 'mixed',
        reason: 'Dati insufficienti per confronto',
        confidence: 0.1
      },
      economicAnalysis: {
        seedCostPerKg: 0,
        nurseryCostPerKg: 0,
        breakEvenPoint: 0,
        roi: { seed: 0, nursery: 0 }
      }
    }
  }
  
  const getLatestHealthScore = (analytics: PlantAnalytics): number =>
    analytics.performance.healthTrend.length > 0
      ? analytics.performance.healthTrend[analytics.performance.healthTrend.length - 1]!.score
      : 0

  // Calcola medie
  const avgSeed = {
    healthScore: seedAnalytics.reduce((sum, a) => sum + getLatestHealthScore(a), 0) / seedAnalytics.length,
    yieldPerPlant: seedAnalytics.reduce((sum, a) => sum + a.performance.yieldPerPlant, 0) / seedAnalytics.length,
    totalCosts: seedAnalytics.reduce((sum, a) => sum + a.economics.totalCosts, 0) / seedAnalytics.length,
    roi: seedAnalytics.reduce((sum, a) => sum + a.economics.roi, 0) / seedAnalytics.length,
    daysToHarvest: seedAnalytics.reduce((sum, a) => sum + a.lifecycle.totalDays, 0) / seedAnalytics.length
  }
  
  const avgNursery = {
    healthScore: nurseryAnalytics.reduce((sum, a) => sum + getLatestHealthScore(a), 0) / nurseryAnalytics.length,
    yieldPerPlant: nurseryAnalytics.reduce((sum, a) => sum + a.performance.yieldPerPlant, 0) / nurseryAnalytics.length,
    totalCosts: nurseryAnalytics.reduce((sum, a) => sum + a.economics.totalCosts, 0) / nurseryAnalytics.length,
    roi: nurseryAnalytics.reduce((sum, a) => sum + a.economics.roi, 0) / nurseryAnalytics.length,
    daysToHarvest: nurseryAnalytics.reduce((sum, a) => sum + a.lifecycle.totalDays, 0) / nurseryAnalytics.length
  }
  
  // Confronto metriche
  const comparison: {
    metric: string
    seedValue: number
    nurseryValue: number
    winner: 'seed' | 'nursery' | 'tie'
    difference: number
  }[] = [
    {
      metric: 'Salute Media',
      seedValue: avgSeed.healthScore,
      nurseryValue: avgNursery.healthScore,
      winner: avgSeed.healthScore > avgNursery.healthScore ? 'seed' : avgNursery.healthScore > avgSeed.healthScore ? 'nursery' : 'tie' as const,
      difference: Math.abs(avgSeed.healthScore - avgNursery.healthScore)
    },
    {
      metric: 'Resa per Pianta (kg)',
      seedValue: avgSeed.yieldPerPlant,
      nurseryValue: avgNursery.yieldPerPlant,
      winner: avgSeed.yieldPerPlant > avgNursery.yieldPerPlant ? 'seed' : avgNursery.yieldPerPlant > avgSeed.yieldPerPlant ? 'nursery' : 'tie' as const,
      difference: Math.abs(avgSeed.yieldPerPlant - avgNursery.yieldPerPlant)
    },
    {
      metric: 'Costi Totali (€)',
      seedValue: avgSeed.totalCosts,
      nurseryValue: avgNursery.totalCosts,
      winner: avgSeed.totalCosts < avgNursery.totalCosts ? 'seed' : avgNursery.totalCosts < avgSeed.totalCosts ? 'nursery' : 'tie' as const,
      difference: Math.abs(avgSeed.totalCosts - avgNursery.totalCosts)
    },
    {
      metric: 'ROI (%)',
      seedValue: avgSeed.roi,
      nurseryValue: avgNursery.roi,
      winner: avgSeed.roi > avgNursery.roi ? 'seed' : avgNursery.roi > avgSeed.roi ? 'nursery' : 'tie' as const,
      difference: Math.abs(avgSeed.roi - avgNursery.roi)
    },
    {
      metric: 'Giorni al Raccolto',
      seedValue: avgSeed.daysToHarvest,
      nurseryValue: avgNursery.daysToHarvest,
      winner: avgSeed.daysToHarvest < avgNursery.daysToHarvest ? 'seed' : avgNursery.daysToHarvest < avgSeed.daysToHarvest ? 'nursery' : 'tie' as const,
      difference: Math.abs(avgSeed.daysToHarvest - avgNursery.daysToHarvest)
    }
  ]
  
  // Determina metodo preferito
  const seedWins = comparison.filter(c => c.winner === 'seed').length
  const nurseryWins = comparison.filter(c => c.winner === 'nursery').length
  
  let preferredMethod: 'seed' | 'nursery' | 'mixed' = 'mixed'
  let reason = 'Performance simili, usa metodo misto'
  let confidence = 0.5
  
  if (seedWins > nurseryWins + 1) {
    preferredMethod = 'seed'
    reason = `Semina diretta vince in ${seedWins}/5 metriche. Più economica e spesso più resistente.`
    confidence = 0.7 + (seedWins - nurseryWins) * 0.1
  } else if (nurseryWins > seedWins + 1) {
    preferredMethod = 'nursery'
    reason = `Piantine da vivaio vincono in ${nurseryWins}/5 metriche. Più rapide e sicure.`
    confidence = 0.7 + (nurseryWins - seedWins) * 0.1
  }
  
  // Analisi economica
  const seedCostPerKg = avgSeed.yieldPerPlant > 0 ? avgSeed.totalCosts / avgSeed.yieldPerPlant : 0
  const nurseryCostPerKg = avgNursery.yieldPerPlant > 0 ? avgNursery.totalCosts / avgNursery.yieldPerPlant : 0
  const breakEvenPoint = Math.abs(avgSeed.daysToHarvest - avgNursery.daysToHarvest)
  
  return {
    comparison,
    recommendation: {
      preferredMethod,
      reason,
      confidence: Math.min(confidence, 0.95)
    },
    economicAnalysis: {
      seedCostPerKg: Math.round(seedCostPerKg * 100) / 100,
      nurseryCostPerKg: Math.round(nurseryCostPerKg * 100) / 100,
      breakEvenPoint,
      roi: {
        seed: Math.round(avgSeed.roi * 100) / 100,
        nursery: Math.round(avgNursery.roi * 100) / 100
      }
    }
  }
}
