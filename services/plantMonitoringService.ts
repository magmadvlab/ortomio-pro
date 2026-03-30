/**
 * Plant Monitoring Service
 * Persistenza pragmatica lato client per foto, maturazione, Brix e tracking trattamenti.
 */

import {
  PlantPhoto,
  MaturityStage,
  TreatmentTracking,
  BrixHistory,
  HarvestRecommendation,
  PlantMonitoringDashboard,
  PhotoUploadRequest,
  AIPhotoAnalysisRequest,
  BrixMeasurementRequest
} from '@/types/plantMonitoring'
import {
  calculateAdaptiveQualityPrice,
  resolveAdaptiveQualityPricingBenchmarkForGarden,
} from '@/services/adaptiveMarketPricingService'

type MonitoringStore = {
  photos: PlantPhoto[]
  maturityStages: MaturityStage[]
  treatments: TreatmentTracking[]
  brixHistory: BrixHistory[]
}

const STORE_KEY = 'ortomio:plant-monitoring:v1'

const emptyStore = (): MonitoringStore => ({
  photos: [],
  maturityStages: [],
  treatments: [],
  brixHistory: []
})

let memoryStore: MonitoringStore = emptyStore()

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function readStore(): MonitoringStore {
  if (!isBrowser()) {
    return memoryStore
  }

  const raw = window.localStorage.getItem(STORE_KEY)
  if (!raw) {
    return emptyStore()
  }

  try {
    const parsed = JSON.parse(raw) as Partial<MonitoringStore>
    return {
      photos: parsed.photos || [],
      maturityStages: parsed.maturityStages || [],
      treatments: parsed.treatments || [],
      brixHistory: parsed.brixHistory || []
    }
  } catch (error) {
    console.error('Error parsing plant monitoring store:', error)
    return emptyStore()
  }
}

function writeStore(store: MonitoringStore): void {
  memoryStore = store
  if (!isBrowser()) {
    return
  }

  window.localStorage.setItem(STORE_KEY, JSON.stringify(store))
}

function updateStore<T>(updater: (store: MonitoringStore) => T): T {
  const store = readStore()
  const result = updater(store)
  writeStore(store)
  return result
}

function sortByDateDesc<T>(items: T[], selector: (item: T) => string): T[] {
  return [...items].sort((a, b) => new Date(selector(b)).getTime() - new Date(selector(a)).getTime())
}

function createPhotoTypeStats(): Record<PlantPhoto['photoType'], number> {
  return {
    general: 0,
    health_issue: 0,
    treatment_before: 0,
    treatment_after: 0,
    maturity_check: 0,
    harvest: 0,
    growth_progress: 0,
    brix_measurement: 0
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

const HARVEST_RECOMMENDATION_BASE_PRICE = 3

function deriveExpectedQualityScore(options: {
  brixCurrent: number
  brixTarget: number
  maturityPercentage?: number
}): number | null {
  const { brixCurrent, brixTarget, maturityPercentage } = options

  if (brixCurrent <= 0 && typeof maturityPercentage !== 'number') {
    return null
  }

  const brixComponent = brixCurrent > 0
    ? clamp((brixCurrent / Math.max(1, brixTarget)) * 55, 18, 55)
    : 0
  const maturityComponent = typeof maturityPercentage === 'number'
    ? clamp((maturityPercentage / 100) * 45, 18, 45)
    : 0

  return Math.round(clamp(brixComponent + maturityComponent, 35, 98))
}

function mapExpectedQualityGrade(options: {
  qualityScore: number | null
  targetScore: number
  alertFloorScore: number
}): HarvestRecommendation['expectedQuality']['grade'] {
  const { qualityScore, targetScore, alertFloorScore } = options

  if (qualityScore === null) return 'good'
  if (qualityScore >= targetScore) return 'premium'
  if (qualityScore >= Math.round((targetScore + alertFloorScore) / 2)) return 'excellent'
  if (qualityScore >= alertFloorScore) return 'good'
  return 'fair'
}

function hashString(value: string): number {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 100000
  }
  return Math.abs(hash)
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '')
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function inferPhotoWeather(capturedAt: string): PlantPhoto['weather'] {
  const captured = new Date(capturedAt)
  const month = captured.getMonth() + 1
  const hour = captured.getHours()
  const tempBase = month >= 6 && month <= 8 ? 28 : month >= 3 && month <= 5 ? 20 : 12
  const humidityBase = month >= 6 && month <= 8 ? 55 : 70

  return {
    temp: clamp(tempBase + (hour >= 12 && hour <= 16 ? 4 : 0), 4, 40),
    humidity: clamp(humidityBase - (hour >= 12 && hour <= 16 ? 8 : 0), 30, 95),
    conditions: month >= 10 || month <= 3 ? 'variabile' : 'sereno'
  }
}

function getPhoto(plantId: string, photoId: string): PlantPhoto | undefined {
  return readStore().photos.find(photo => photo.plantId === plantId && photo.id === photoId)
}

function updatePhoto(photoId: string, updater: (photo: PlantPhoto) => PlantPhoto): PlantPhoto | null {
  return updateStore((store) => {
    const index = store.photos.findIndex(photo => photo.id === photoId)
    if (index === -1) {
      return null
    }

    const updated = updater(store.photos[index])
    store.photos[index] = updated
    return updated
  })
}

function buildDeterministicAnalysis(photo: PlantPhoto, analysisType: AIPhotoAnalysisRequest['analysisType']): NonNullable<PlantPhoto['aiAnalysis']> {
  const seed = hashString(`${photo.id}:${analysisType}:${photo.photoType}:${photo.notes || ''}:${(photo.tags || []).join(',')}`)
  const photoPenalty =
    photo.photoType === 'health_issue'
      ? 20
      : photo.photoType === 'treatment_before'
        ? 15
        : photo.photoType === 'treatment_after'
          ? 5
          : 0

  const healthScore = clamp(92 - photoPenalty - (seed % 18), 45, 98)
  const detectedIssues: string[] = []

  if (analysisType === 'disease' || photo.photoType === 'health_issue') {
    detectedIssues.push('possible_leaf_stress')
  }
  if (analysisType === 'pest' && seed % 3 === 0) {
    detectedIssues.push('possible_pest_damage')
  }
  if (analysisType === 'health' && healthScore < 70) {
    detectedIssues.push('possible_nutrient_deficiency')
  }

  const recommendations =
    detectedIssues.length === 0
      ? ['Continuare il monitoraggio fotografico periodico']
      : [
          'Verificare la pianta in campo entro 24-48 ore',
          'Confrontare la foto con osservazioni precedenti',
          'Collegare l esito a una osservazione o trattamento reale'
        ]

  return {
    healthScore,
    detectedIssues,
    confidence: Number((0.62 + (seed % 25) / 100).toFixed(2)),
    recommendations,
    analyzedAt: new Date().toISOString()
  }
}

function buildDeterministicBrix(photo: PlantPhoto): NonNullable<PlantPhoto['brixMeasurement']> {
  const seed = hashString(`${photo.id}:brix:${photo.photoType}`)
  const value = Number((10 + (seed % 90) / 10).toFixed(1))

  return {
    value,
    measurementMethod: 'ai_estimation',
    confidence: Number((0.55 + (seed % 20) / 100).toFixed(2)),
    location: 'fruit_center',
    measuredAt: new Date().toISOString()
  }
}

function buildDeterministicMaturity(photo: PlantPhoto): {
  stage: MaturityStage['stage']
  percentage: number
  confidence: number
} {
  const seed = hashString(`${photo.id}:maturity:${photo.photoType}`)
  const percentage = clamp(25 + (seed % 71), 0, 100)

  let stage: MaturityStage['stage'] = 'immature'
  if (percentage >= 95) stage = 'overripe'
  else if (percentage >= 80) stage = 'mature'
  else if (percentage >= 60) stage = 'veraison'
  else if (percentage >= 35) stage = 'fruit_set'

  return {
    stage,
    percentage,
    confidence: Number((0.6 + (seed % 18) / 100).toFixed(2))
  }
}

export const plantPhotoService = {
  async uploadPhoto(request: PhotoUploadRequest): Promise<PlantPhoto> {
    const now = new Date().toISOString()
    const url = await readFileAsDataUrl(request.file)

    const photo: PlantPhoto = {
      id: crypto.randomUUID(),
      plantId: request.plantId,
      gardenId: request.gardenId,
      url,
      capturedAt: now,
      uploadedAt: now,
      photoType: request.photoType,
      linkedOperationId: request.linkedOperationId,
      isBeforePhoto: request.isBeforePhoto,
      notes: request.notes,
      tags: request.tags,
      weather: inferPhotoWeather(now)
    }

    updateStore((store) => {
      store.photos.unshift(photo)
      return photo
    })

    return photo
  },

  async getPlantPhotos(
    plantId: string,
    filters?: {
      photoType?: PlantPhoto['photoType']
      startDate?: string
      endDate?: string
      hasAIAnalysis?: boolean
      hasBrixMeasurement?: boolean
    }
  ): Promise<PlantPhoto[]> {
    let photos = readStore().photos.filter(photo => photo.plantId === plantId)

    if (filters?.photoType) {
      photos = photos.filter(photo => photo.photoType === filters.photoType)
    }
    if (filters?.startDate) {
      photos = photos.filter(photo => photo.capturedAt >= filters.startDate!)
    }
    if (filters?.endDate) {
      photos = photos.filter(photo => photo.capturedAt <= filters.endDate!)
    }
    if (filters?.hasAIAnalysis !== undefined) {
      photos = photos.filter(photo => Boolean(photo.aiAnalysis) === filters.hasAIAnalysis)
    }
    if (filters?.hasBrixMeasurement !== undefined) {
      photos = photos.filter(photo => Boolean(photo.brixMeasurement) === filters.hasBrixMeasurement)
    }

    return sortByDateDesc(photos, photo => photo.capturedAt)
  },

  async getPhotoTimeline(plantId: string): Promise<Array<{ date: string; photos: PlantPhoto[]; events: string[] }>> {
    const photos = await this.getPlantPhotos(plantId)
    const grouped = photos.reduce<Record<string, PlantPhoto[]>>((accumulator, photo) => {
      const date = photo.capturedAt.split('T')[0]
      if (!accumulator[date]) {
        accumulator[date] = []
      }
      accumulator[date].push(photo)
      return accumulator
    }, {})

    return Object.entries(grouped)
      .map(([date, dailyPhotos]) => ({
        date,
        photos: sortByDateDesc(dailyPhotos, photo => photo.capturedAt),
        events: dailyPhotos.map(photo => photo.photoType)
      }))
      .sort((a, b) => b.date.localeCompare(a.date))
  },

  async deletePhoto(photoId: string): Promise<void> {
    updateStore((store) => {
      store.photos = store.photos.filter(photo => photo.id !== photoId)
      store.maturityStages = store.maturityStages.map(stage => ({
        ...stage,
        photoIds: stage.photoIds.filter(id => id !== photoId)
      }))
      store.treatments = store.treatments.map(tracking => ({
        ...tracking,
        beforePhotos: tracking.beforePhotos.filter(id => id !== photoId),
        afterPhotos: tracking.afterPhotos.filter(item => item.photoId !== photoId)
      }))
      store.brixHistory = store.brixHistory.filter(entry => entry.photoId !== photoId)
    })
  }
}

export const aiPhotoAnalysisService = {
  async analyzePhoto(request: AIPhotoAnalysisRequest): Promise<PlantPhoto['aiAnalysis']> {
    const photo = readStore().photos.find(item => item.id === request.photoId)
    if (!photo) {
      return undefined
    }

    const analysis = buildDeterministicAnalysis(photo, request.analysisType)
    updatePhoto(request.photoId, currentPhoto => ({
      ...currentPhoto,
      aiAnalysis: analysis
    }))

    return analysis
  },

  async estimateBrixFromPhoto(photoId: string): Promise<PlantPhoto['brixMeasurement']> {
    const photo = readStore().photos.find(item => item.id === photoId)
    if (!photo) {
      return undefined
    }

    const measurement = buildDeterministicBrix(photo)
    updatePhoto(photoId, currentPhoto => ({
      ...currentPhoto,
      brixMeasurement: measurement
    }))

    return measurement
  },

  async detectMaturityFromPhoto(photoId: string): Promise<{
    stage: MaturityStage['stage']
    percentage: number
    confidence: number
  }> {
    const photo = readStore().photos.find(item => item.id === photoId)
    if (!photo) {
      return {
        stage: 'immature',
        percentage: 0,
        confidence: 0
      }
    }

    return buildDeterministicMaturity(photo)
  }
}

export const maturityTrackingService = {
  async recordMaturityStage(
    plantId: string,
    gardenId: string,
    data: {
      stage: MaturityStage['stage']
      maturityPercentage: number
      indicators: MaturityStage['indicators']
      photoIds?: string[]
      notes?: string
    }
  ): Promise<MaturityStage> {
    const maturityStage: MaturityStage = {
      id: crypto.randomUUID(),
      plantId,
      gardenId,
      stage: data.stage,
      maturityPercentage: data.maturityPercentage,
      indicators: data.indicators,
      photoIds: data.photoIds || [],
      assessedAt: new Date().toISOString(),
      assessedBy: 'user',
      notes: data.notes
    }

    if (data.maturityPercentage < 100) {
      const daysPerPercent = 0.5
      maturityStage.daysToOptimalHarvest = Math.ceil((100 - data.maturityPercentage) * daysPerPercent)
      const optimalDate = new Date()
      optimalDate.setDate(optimalDate.getDate() + maturityStage.daysToOptimalHarvest)
      maturityStage.optimalHarvestDate = optimalDate.toISOString().split('T')[0]
    } else {
      maturityStage.daysToOptimalHarvest = 0
      maturityStage.optimalHarvestDate = new Date().toISOString().split('T')[0]
    }

    updateStore((store) => {
      store.maturityStages.unshift(maturityStage)
      return maturityStage
    })

    return maturityStage
  },

  async getMaturityHistory(plantId: string): Promise<MaturityStage[]> {
    return sortByDateDesc(
      readStore().maturityStages.filter(stage => stage.plantId === plantId),
      stage => stage.assessedAt
    )
  },

  async getCurrentMaturityStage(plantId: string): Promise<MaturityStage | null> {
    const history = await this.getMaturityHistory(plantId)
    return history[0] || null
  },

  async getMaturityTrend(plantId: string): Promise<{
    currentPercentage: number
    weeklyIncrease: number
    projectedHarvestDate: string
    trend: 'fast' | 'normal' | 'slow'
  }> {
    const history = await this.getMaturityHistory(plantId)

    if (history.length < 2) {
      return {
        currentPercentage: history[0]?.maturityPercentage || 0,
        weeklyIncrease: 0,
        projectedHarvestDate: history[0]?.optimalHarvestDate || new Date().toISOString().split('T')[0],
        trend: 'normal'
      }
    }

    const recent = history.slice(0, 2)
    const daysDiff = Math.max(
      1,
      Math.abs(new Date(recent[0].assessedAt).getTime() - new Date(recent[1].assessedAt).getTime()) / (1000 * 60 * 60 * 24)
    )
    const percentageDiff = recent[0].maturityPercentage - recent[1].maturityPercentage
    const weeklyIncrease = (percentageDiff / daysDiff) * 7
    const remainingPercentage = Math.max(0, 100 - recent[0].maturityPercentage)
    const daysToHarvest = weeklyIncrease > 0 ? (remainingPercentage / weeklyIncrease) * 7 : 7
    const projectedDate = new Date()
    projectedDate.setDate(projectedDate.getDate() + Math.max(0, Math.ceil(daysToHarvest)))

    let trend: 'fast' | 'normal' | 'slow' = 'normal'
    if (weeklyIncrease > 15) trend = 'fast'
    else if (weeklyIncrease < 5) trend = 'slow'

    return {
      currentPercentage: recent[0].maturityPercentage,
      weeklyIncrease: Math.round(weeklyIncrease * 10) / 10,
      projectedHarvestDate: projectedDate.toISOString().split('T')[0],
      trend
    }
  }
}

export const treatmentTrackingService = {
  async startTreatmentTracking(
    plantId: string,
    gardenId: string,
    operationId: string,
    data: {
      issueType: TreatmentTracking['issue']['type']
      issueName: string
      severity: TreatmentTracking['issue']['severity']
      beforePhotoIds: string[]
      treatment: TreatmentTracking['treatment']
    }
  ): Promise<TreatmentTracking> {
    const tracking: TreatmentTracking = {
      id: crypto.randomUUID(),
      plantId,
      gardenId,
      operationId,
      issue: {
        type: data.issueType,
        name: data.issueName,
        severity: data.severity,
        detectedAt: new Date().toISOString(),
        detectionMethod: 'visual'
      },
      beforePhotos: data.beforePhotoIds,
      treatment: data.treatment,
      afterPhotos: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    updateStore((store) => {
      store.treatments.unshift(tracking)
      return tracking
    })

    return tracking
  },

  async addAfterPhoto(
    trackingId: string,
    photoId: string,
    daysAfterTreatment: number,
    improvementScore?: number,
    notes?: string
  ): Promise<void> {
    updateStore((store) => {
      store.treatments = store.treatments.map(tracking =>
        tracking.id === trackingId
          ? {
              ...tracking,
              afterPhotos: [
                ...tracking.afterPhotos,
                { photoId, daysAfterTreatment, improvementScore, notes }
              ],
              updatedAt: new Date().toISOString()
            }
          : tracking
      )
    })
  },

  async completeTreatmentTracking(
    trackingId: string,
    outcome: TreatmentTracking['outcome']
  ): Promise<void> {
    updateStore((store) => {
      store.treatments = store.treatments.map(tracking =>
        tracking.id === trackingId
          ? {
              ...tracking,
              outcome,
              updatedAt: new Date().toISOString()
            }
          : tracking
      )
    })
  },

  async getActiveTreatments(plantId: string): Promise<TreatmentTracking[]> {
    const treatments = readStore().treatments.filter(tracking =>
      tracking.plantId === plantId && tracking.outcome?.status !== 'resolved'
    )
    return sortByDateDesc(treatments, tracking => tracking.updatedAt)
  },

  async calculateTreatmentEffectiveness(plantId: string): Promise<{
    totalTreatments: number
    resolved: number
    improving: number
    noChange: number
    worsening: number
    avgEffectiveness: number
    avgDaysToResolution: number
  }> {
    const treatments = readStore().treatments.filter(tracking => tracking.plantId === plantId)
    const completed = treatments.filter(tracking => tracking.outcome)
    const effectivenessValues = completed.map(tracking => tracking.outcome?.effectiveness || 0)
    const resolutionDays = completed
      .filter(tracking => tracking.outcome?.daysToResolution !== undefined)
      .map(tracking => tracking.outcome!.daysToResolution!)

    return {
      totalTreatments: treatments.length,
      resolved: completed.filter(tracking => tracking.outcome?.status === 'resolved').length,
      improving: completed.filter(tracking => tracking.outcome?.status === 'improving').length,
      noChange: completed.filter(tracking => tracking.outcome?.status === 'no_change').length,
      worsening: completed.filter(tracking => tracking.outcome?.status === 'worsening').length,
      avgEffectiveness:
        effectivenessValues.length > 0
          ? Math.round(effectivenessValues.reduce((sum, value) => sum + value, 0) / effectivenessValues.length)
          : 0,
      avgDaysToResolution:
        resolutionDays.length > 0
          ? Math.round(resolutionDays.reduce((sum, value) => sum + value, 0) / resolutionDays.length)
          : 0
    }
  }
}

export const brixManagementService = {
  async recordBrixMeasurement(request: BrixMeasurementRequest): Promise<BrixHistory> {
    const measurement: BrixHistory = {
      id: crypto.randomUUID(),
      plantId: request.plantId,
      gardenId: request.gardenId,
      brixValue: request.value,
      measurementDate: new Date().toISOString(),
      method: request.method,
      fruitSample: {
        location: request.fruitLocation,
        fruitNumber: request.fruitNumber
      },
      photoId: request.photoId,
      measuredBy: 'current_user',
      notes: request.notes
    }

    updateStore((store) => {
      store.brixHistory.unshift(measurement)
      return measurement
    })

    if (request.photoId) {
      updatePhoto(request.photoId, photo => ({
        ...photo,
        brixMeasurement: {
          value: request.value,
          measurementMethod: request.method,
          location: 'fruit_center',
          measuredAt: measurement.measurementDate
        }
      }))
    }

    return measurement
  },

  async getBrixHistory(plantId: string): Promise<BrixHistory[]> {
    return sortByDateDesc(
      readStore().brixHistory.filter(item => item.plantId === plantId),
      item => item.measurementDate
    )
  },

  async getBrixTrend(plantId: string): Promise<{
    current: number
    average: number
    min: number
    max: number
    trend: 'increasing' | 'stable' | 'decreasing'
    weeklyIncrease: number
  }> {
    const history = await this.getBrixHistory(plantId)
    if (history.length === 0) {
      return { current: 0, average: 0, min: 0, max: 0, trend: 'stable', weeklyIncrease: 0 }
    }

    const values = history.map(item => item.brixValue)
    const current = values[0]
    const average = values.reduce((sum, value) => sum + value, 0) / values.length
    const min = Math.min(...values)
    const max = Math.max(...values)

    let trend: 'increasing' | 'stable' | 'decreasing' = 'stable'
    let weeklyIncrease = 0

    if (history.length >= 2) {
      const recent = history.slice(0, 2)
      const daysDiff = Math.max(
        1,
        Math.abs(new Date(recent[0].measurementDate).getTime() - new Date(recent[1].measurementDate).getTime()) / (1000 * 60 * 60 * 24)
      )
      const brixDiff = recent[0].brixValue - recent[1].brixValue
      weeklyIncrease = (brixDiff / daysDiff) * 7

      if (weeklyIncrease > 0.5) trend = 'increasing'
      else if (weeklyIncrease < -0.5) trend = 'decreasing'
    }

    return {
      current: Math.round(current * 10) / 10,
      average: Math.round(average * 10) / 10,
      min: Math.round(min * 10) / 10,
      max: Math.round(max * 10) / 10,
      trend,
      weeklyIncrease: Math.round(weeklyIncrease * 10) / 10
    }
  }
}

export const harvestRecommendationService = {
  async generateHarvestRecommendation(
    plantId: string,
    gardenId: string
  ): Promise<HarvestRecommendation> {
    const [maturityStage, brixTrend] = await Promise.all([
      maturityTrackingService.getCurrentMaturityStage(plantId),
      brixManagementService.getBrixTrend(plantId)
    ])

    const reasons: HarvestRecommendation['reasons'] = []
    let confidence = 50
    const benchmark = gardenId
      ? await resolveAdaptiveQualityPricingBenchmarkForGarden(gardenId)
      : {
          qualityTargetScore: 80,
          qualityAlertFloorScore: 60,
          brixTarget: 12,
          notes: [] as string[],
        }

    if (brixTrend.current > 0) {
      reasons.push({
        factor: 'brix_level',
        value: brixTrend.current,
        weight: 0.4,
        description: `Livello Brix attuale: ${brixTrend.current}°`
      })
      if (brixTrend.current >= benchmark.brixTarget + 1) confidence += 20
      else if (brixTrend.current >= benchmark.brixTarget) confidence += 10
    }

    if (maturityStage) {
      reasons.push({
        factor: 'maturity_stage',
        value: maturityStage.maturityPercentage,
        weight: 0.3,
        description: `Maturazione: ${maturityStage.maturityPercentage}%`
      })
      if (maturityStage.maturityPercentage >= 90) confidence += 20
      else if (maturityStage.maturityPercentage >= 80) confidence += 10
    }

    if (gardenId) {
      reasons.push({
        factor: 'market_timing',
        value: benchmark.qualityTargetScore,
        weight: 0.2,
        description: `Benchmark sito ${benchmark.qualityTargetScore}% con Brix target ${benchmark.brixTarget}°.`
      })
    }

    const daysToHarvest = maturityStage?.daysToOptimalHarvest || 7
    const recommendedDate = new Date()
    recommendedDate.setDate(recommendedDate.getDate() + daysToHarvest)
    const expectedQualityScore = deriveExpectedQualityScore({
      brixCurrent: brixTrend.current,
      brixTarget: benchmark.brixTarget,
      maturityPercentage: maturityStage?.maturityPercentage,
    })
    const expectedGrade = mapExpectedQualityGrade({
      qualityScore: expectedQualityScore,
      targetScore: benchmark.qualityTargetScore,
      alertFloorScore: benchmark.qualityAlertFloorScore,
    })
    const adaptivePricing = calculateAdaptiveQualityPrice(HARVEST_RECOMMENDATION_BASE_PRICE, {
      qualityScore: expectedQualityScore,
      benchmark,
    })

    return {
      id: crypto.randomUUID(),
      plantId,
      gardenId,
      recommendedDate: recommendedDate.toISOString().split('T')[0],
      confidence: Math.min(confidence, 95),
      reasons,
      optimalWindow: {
        startDate: new Date(recommendedDate.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(recommendedDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        peakDate: recommendedDate.toISOString().split('T')[0]
      },
      expectedQuality: {
        grade: expectedGrade,
        brixRange: { min: Math.max(0, brixTrend.current - 1), max: brixTrend.current + 1 },
        shelfLife: 7,
        marketValue: adaptivePricing.adjustedPrice
      },
      risks: [],
      generatedAt: new Date().toISOString(),
      generatedBy: 'ai',
      lastUpdated: new Date().toISOString()
    }
  }
}

export const monitoringDashboardService = {
  async getPlantMonitoringDashboard(plantId: string): Promise<PlantMonitoringDashboard> {
    const [photos, currentMaturity, brixTrend, activeTreatments, effectiveness, recommendation] = await Promise.all([
      plantPhotoService.getPlantPhotos(plantId),
      maturityTrackingService.getCurrentMaturityStage(plantId),
      brixManagementService.getBrixTrend(plantId),
      treatmentTrackingService.getActiveTreatments(plantId),
      treatmentTrackingService.calculateTreatmentEffectiveness(plantId),
      harvestRecommendationService.generateHarvestRecommendation(plantId, '')
    ])

    const photoStats = createPhotoTypeStats()
    photos.forEach(photo => {
      photoStats[photo.photoType] += 1
    })

    const recommendationDate = new Date(recommendation.recommendedDate)
    const daysUntil = Math.ceil((recommendationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    const harvestStatus: PlantMonitoringDashboard['harvestRecommendation'] = {
      daysUntil,
      confidence: recommendation.confidence,
      status:
        daysUntil > 7 ? 'too_early'
        : daysUntil > 2 ? 'approaching'
        : daysUntil >= 0 ? 'optimal'
        : daysUntil >= -3 ? 'urgent'
        : 'overdue'
    }

    const healthHistory = photos
      .filter(photo => photo.aiAnalysis?.healthScore !== undefined)
      .map(photo => ({
        date: photo.capturedAt,
        score: photo.aiAnalysis!.healthScore!,
        source: 'ai' as const
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return {
      plantId,
      plantCode: `PL-${plantId.slice(0, 8)}`,
      plantName: 'Pianta monitorata',
      photoStats: {
        total: photos.length,
        byType: photoStats,
        lastPhotoDate: photos[0]?.capturedAt,
        hasAIAnalysis: photos.filter(photo => photo.aiAnalysis).length,
        hasBrixMeasurements: photos.filter(photo => photo.brixMeasurement).length
      },
      currentMaturity: {
        stage: currentMaturity?.stage || 'immature',
        percentage: currentMaturity?.maturityPercentage || 0,
        daysToHarvest: currentMaturity?.daysToOptimalHarvest,
        lastAssessment: currentMaturity?.assessedAt || new Date().toISOString()
      },
      brixTrend: {
        current: brixTrend.current || undefined,
        average: brixTrend.average,
        min: brixTrend.min,
        max: brixTrend.max,
        trend: brixTrend.trend,
        measurements: (await brixManagementService.getBrixHistory(plantId)).length
      },
      activeIssues: activeTreatments.length,
      resolvedIssues: effectiveness.resolved,
      treatmentEffectiveness: effectiveness.avgEffectiveness,
      harvestRecommendation: harvestStatus,
      healthHistory
    }
  }
}

export default {
  plantPhotoService,
  aiPhotoAnalysisService,
  maturityTrackingService,
  treatmentTrackingService,
  brixManagementService,
  harvestRecommendationService,
  monitoringDashboardService
}
