/**
 * Plant Monitoring Types
 * Sistema avanzato per monitoraggio piante con foto, maturazione e Brix
 */

export interface PlantPhoto {
  id: string
  plantId: string
  gardenId: string
  fieldRowId?: string
  
  // Metadata foto
  url: string
  thumbnailUrl?: string
  capturedAt: string // ISO timestamp
  uploadedAt: string
  
  // Tipo foto
  photoType: 'general' | 'health_issue' | 'treatment_before' | 'treatment_after' | 
             'maturity_check' | 'harvest' | 'growth_progress' | 'brix_measurement'
  
  // Collegamento operazione (per before/after)
  linkedOperationId?: string
  isBeforePhoto?: boolean // true = before, false = after
  
  // Analisi AI (se disponibile)
  aiAnalysis?: {
    healthScore?: number // 0-100
    detectedIssues?: string[] // ['leaf_spot', 'nutrient_deficiency', 'pest_damage']
    confidence?: number // 0-1
    recommendations?: string[]
    analyzedAt: string
  }
  
  // Misurazione Brix (se disponibile)
  brixMeasurement?: {
    value: number // gradi Brix
    measurementMethod: 'refractometer' | 'ai_estimation' | 'manual'
    confidence?: number // 0-1 (solo per AI)
    location: string // 'fruit_center' | 'fruit_edge' | 'leaf'
    measuredAt: string
  }
  
  // Metadata aggiuntive
  notes?: string
  tags?: string[]
  location?: {
    latitude: number
    longitude: number
  }
  weather?: {
    temp: number
    humidity: number
    conditions: string
  }
}

export interface MaturityStage {
  id: string
  plantId: string
  gardenId: string
  fieldRowId?: string
  
  // Fase maturazione
  stage: 'seedling' | 'vegetative' | 'flowering' | 'fruit_set' | 
         'immature' | 'veraison' | 'mature' | 'overripe' | 'senescent'
  
  // Percentuale maturazione (0-100)
  maturityPercentage: number
  
  // Indicatori specifici
  indicators: {
    colorChange?: number // 0-100 (es: da verde a rosso)
    firmness?: 'very_hard' | 'hard' | 'firm' | 'soft' | 'very_soft'
    size?: number // mm o cm
    sugarContent?: number // Brix
    acidity?: number // pH
    aroma?: 'none' | 'slight' | 'moderate' | 'strong'
  }
  
  // Stima giorni a maturazione ottimale
  daysToOptimalHarvest?: number
  optimalHarvestDate?: string // ISO date
  
  // Foto associate
  photoIds: string[]
  
  // Metadata
  assessedAt: string
  assessedBy: 'user' | 'ai' | 'sensor'
  notes?: string
}

export interface TreatmentTracking {
  id: string
  plantId: string
  gardenId: string
  fieldRowId?: string
  operationId: string // Collegamento a PlantOperation
  
  // Issue identificato
  issue: {
    type: 'disease' | 'pest' | 'nutrient_deficiency' | 'water_stress' | 'other'
    name: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    detectedAt: string
    detectionMethod: 'visual' | 'ai_photo' | 'sensor' | 'lab_test'
  }
  
  // Foto before
  beforePhotos: string[] // PlantPhoto IDs
  
  // Trattamento applicato
  treatment: {
    productName: string
    activeIngredient?: string
    dosage: number
    unit: string
    applicationMethod: string
    appliedAt: string
  }
  
  // Foto after (multiple nel tempo)
  afterPhotos: Array<{
    photoId: string
    daysAfterTreatment: number
    improvementScore?: number // 0-100
    notes?: string
  }>
  
  // Risultato
  outcome?: {
    status: 'resolved' | 'improving' | 'no_change' | 'worsening'
    finalHealthScore: number
    daysToResolution?: number
    effectiveness: number // 0-100
    notes?: string
  }
  
  // Metadata
  createdAt: string
  updatedAt: string
}

export interface BrixHistory {
  id: string
  plantId: string
  gardenId: string
  fieldRowId?: string
  
  // Misurazione
  brixValue: number
  measurementDate: string
  
  // Metodo
  method: 'refractometer' | 'ai_estimation' | 'manual'
  confidence?: number // 0-1 per AI
  
  // Contesto
  fruitSample: {
    location: 'top' | 'middle' | 'bottom' // posizione sulla pianta
    fruitNumber: number // quale frutto (1, 2, 3...)
    fruitSize?: number // mm
    fruitColor?: string
  }
  
  // Condizioni
  weather?: {
    temp: number
    humidity: number
    lastRainDays: number
  }
  
  // Foto associata
  photoId?: string
  
  // Metadata
  measuredBy: string // user ID
  notes?: string
}

export interface HarvestRecommendation {
  id: string
  plantId: string
  gardenId: string
  fieldRowId?: string
  
  // Raccomandazione
  recommendedDate: string // ISO date
  confidence: number // 0-100
  
  // Motivi
  reasons: Array<{
    factor: 'brix_level' | 'maturity_stage' | 'color' | 'firmness' | 
            'weather_forecast' | 'market_timing' | 'pest_pressure'
    value: string | number
    weight: number // importanza 0-1
    description: string
  }>
  
  // Finestra ottimale
  optimalWindow: {
    startDate: string
    endDate: string
    peakDate: string
  }
  
  // Qualità attesa
  expectedQuality: {
    grade: 'premium' | 'excellent' | 'good' | 'fair'
    brixRange: { min: number; max: number }
    shelfLife: number // giorni
    marketValue: number // €/kg
  }
  
  // Rischi
  risks: Array<{
    type: 'weather' | 'pest' | 'disease' | 'overripening' | 'market'
    severity: 'low' | 'medium' | 'high'
    description: string
    mitigation?: string
  }>
  
  // Metadata
  generatedAt: string
  generatedBy: 'ai' | 'agronomist' | 'system'
  lastUpdated: string
}

export interface PlantMonitoringDashboard {
  plantId: string
  plantCode: string
  plantName: string
  
  // Statistiche foto
  photoStats: {
    total: number
    byType: Record<PlantPhoto['photoType'], number>
    lastPhotoDate?: string
    hasAIAnalysis: number
    hasBrixMeasurements: number
  }
  
  // Stato maturazione
  currentMaturity: {
    stage: MaturityStage['stage']
    percentage: number
    daysToHarvest?: number
    lastAssessment: string
  }
  
  // Brix trend
  brixTrend: {
    current?: number
    average: number
    min: number
    max: number
    trend: 'increasing' | 'stable' | 'decreasing'
    measurements: number
  }
  
  // Trattamenti attivi
  activeIssues: number
  resolvedIssues: number
  treatmentEffectiveness: number // 0-100 media
  
  // Raccomandazioni
  harvestRecommendation?: {
    daysUntil: number
    confidence: number
    status: 'too_early' | 'approaching' | 'optimal' | 'urgent' | 'overdue'
  }
  
  // Health trend
  healthHistory: Array<{
    date: string
    score: number
    source: 'user' | 'ai' | 'sensor'
  }>
}

// Helper types
export interface PhotoUploadRequest {
  plantId: string
  gardenId: string
  fieldRowId?: string
  photoType: PlantPhoto['photoType']
  file: File
  linkedOperationId?: string
  isBeforePhoto?: boolean
  notes?: string
  tags?: string[]
}

export interface AIPhotoAnalysisRequest {
  photoId: string
  analysisType: 'health' | 'maturity' | 'brix' | 'pest' | 'disease'
  options?: {
    includeRecommendations?: boolean
    detailedReport?: boolean
  }
}

export interface BrixMeasurementRequest {
  plantId: string
  gardenId: string
  fieldRowId?: string
  method: BrixHistory['method']
  value: number
  fruitLocation: BrixHistory['fruitSample']['location']
  fruitNumber: number
  photoId?: string
  notes?: string
}
