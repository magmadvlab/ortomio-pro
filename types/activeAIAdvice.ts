/**
 * Active AI Advice System Types
 * Types for integrated, actionable AI advice
 */

// =====================================================
// CROP ROTATION
// =====================================================

export interface CropRotationHistory {
  id: string
  gardenId: string
  fieldRowId?: string
  zoneId?: string
  
  // Crop data
  plantVarietyId?: string
  plantName: string
  plantFamily: string // Solanaceae, Leguminose, Brassicaceae, etc.
  
  // Growing period
  plantedDate: string
  harvestDate?: string
  season: 'Primavera' | 'Estate' | 'Autunno' | 'Inverno'
  year: number
  
  // Results
  yieldKg?: number
  qualityScore?: number // 0-100
  
  // Issues
  diseases?: string[]
  pests?: string[]
  nutrientDeficiencies?: string[]
  
  // Metadata
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface SuggestedCrop {
  plantName: string
  plantFamily: string
  score: number // 0-100
  benefits: string[]
  requirements: string[]
}

export interface CropRotationPlan {
  id: string
  gardenId: string
  fieldRowId?: string
  zoneId?: string
  
  // Rotation plan
  currentCrop: string
  currentFamily: string
  suggestedNextCrops: SuggestedCrop[]
  rotationCycle: number // Years
  
  // Reasoning
  reasoning: string
  benefits: string[]
  risksToAvoid: string[]
  
  // AI confidence
  confidenceScore: number // 0-1
  
  // Status
  status: 'SUGGESTED' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED'
  acceptedCrop?: string
  acceptedDate?: string
  
  // Metadata
  createdAt: string
  updatedAt: string
}

// =====================================================
// BIOLOGICAL CONTROL
// =====================================================

export type BiologicalControlCategory = 
  | 'INSETTI_BENEFICI'
  | 'TRAPPOLE'
  | 'BARRIERE_FISICHE'
  | 'ROTAZIONE'
  | 'CONSOCIAZIONE'
  | 'MONITORAGGIO'

export type ChecklistFrequency = 
  | 'DAILY'
  | 'WEEKLY'
  | 'BIWEEKLY'
  | 'MONTHLY'
  | 'SEASONAL'
  | 'YEARLY'
  | 'ONE_TIME'

export type ChecklistStatus = 
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'FAILED'
  | 'SKIPPED'

export type ChecklistPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface BiologicalControlChecklist {
  id: string
  gardenId: string
  
  // Checklist info
  title: string
  description?: string
  category: BiologicalControlCategory
  
  // Priority and frequency
  priority: ChecklistPriority
  frequency: ChecklistFrequency
  
  // Applicability
  applicableMonths?: number[] // 1-12
  applicableSeasons?: string[]
  
  // Status
  status: ChecklistStatus
  
  // Dates
  dueDate?: string
  completedDate?: string
  completedBy?: string
  
  // Results
  notes?: string
  effectivenessScore?: number // 0-100
  evidencePhotos?: string[]
  
  // Certification
  requiredForCertification: boolean
  certificationTypes?: string[] // BIO, GLOBALGAP, etc.
  
  // Metadata
  createdAt: string
  updatedAt: string
}

export interface BiologicalControlSubtask {
  id: string
  checklistId: string
  
  // Task info
  title: string
  description?: string
  orderIndex: number
  
  // Status
  status: ChecklistStatus
  
  // Results
  completedDate?: string
  completedBy?: string
  notes?: string
  evidencePhotos?: string[]
  
  // Metadata
  createdAt: string
  updatedAt: string
}

// =====================================================
// COMPOSTER TRACKING
// =====================================================

export type ComposterType = 'HEAP' | 'BIN' | 'TUMBLER' | 'WORM' | 'BOKASHI'

export type ComposterStatus = 'ACTIVE' | 'FULL' | 'MATURING' | 'READY' | 'INACTIVE'

export interface Composter {
  id: string
  gardenId: string
  
  // Composter info
  name: string
  type: ComposterType
  capacityLiters: number
  location?: string
  
  // Status
  status: ComposterStatus
  
  // Dates
  startedDate: string
  estimatedReadyDate?: string
  
  // Metadata
  notes?: string
  createdAt: string
  updatedAt: string
}

export type MaterialType = 
  | 'GREEN_WASTE'
  | 'BROWN_WASTE'
  | 'FOOD_SCRAPS'
  | 'MANURE'
  | 'PAPER'
  | 'CARDBOARD'
  | 'WOOD_CHIPS'
  | 'LEAVES'
  | 'GRASS'
  | 'OTHER'

export type CarbonNitrogenRatio = 'HIGH_CARBON' | 'HIGH_NITROGEN' | 'BALANCED'

export interface ComposterAddition {
  id: string
  composterId: string
  
  // Material added
  materialType: MaterialType
  materialDescription: string
  quantityKg: number
  
  // C/N ratio classification
  carbonNitrogenRatio?: CarbonNitrogenRatio
  
  // Safety
  isDiseased: boolean
  diseaseType?: string
  isTreatedChemically: boolean
  treatmentType?: string
  
  // AI validation
  aiValidated: boolean
  aiWarning?: string
  aiRecommendation?: string
  
  // Date
  addedDate: string
  addedBy?: string
  
  // Metadata
  notes?: string
  createdAt: string
}

export type MoistureLevel = 'TOO_DRY' | 'OPTIMAL' | 'TOO_WET'

export type OdorType = 'NONE' | 'EARTHY' | 'AMMONIA' | 'ROTTEN' | 'OTHER'

export interface ComposterMonitoring {
  id: string
  composterId: string
  
  // Measurements
  temperatureCelsius?: number
  moistureLevel?: MoistureLevel
  odor?: OdorType
  
  // Activities
  turned: boolean
  watered: boolean
  materialAdded: boolean
  
  // Observations
  observations?: string
  issues?: string[]
  actionsTaken?: string[]
  
  // AI analysis
  aiHealthScore?: number // 0-100
  aiRecommendations?: string[]
  
  // Date
  monitoringDate: string
  monitoredBy?: string
  
  // Metadata
  createdAt: string
}

// =====================================================
// WINTER PROTECTION
// =====================================================

export type WinterProtectionTrigger = 
  | 'MANUAL'
  | 'WEATHER_FORECAST'
  | 'TEMPERATURE_ALERT'
  | 'SEASONAL'

export type ProtectionType = 
  | 'FROST_CLOTH'
  | 'MULCHING'
  | 'COLD_FRAME'
  | 'GREENHOUSE'
  | 'ROW_COVER'
  | 'CLOCHES'
  | 'SOIL_COVER'
  | 'PRUNING'
  | 'OTHER'

export type ProtectionUrgency = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type ProtectionEffectiveness = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'FAILED'

export interface WinterProtectionChecklist {
  id: string
  gardenId: string
  zoneId?: string
  fieldRowId?: string
  
  // Trigger
  triggeredBy: WinterProtectionTrigger
  triggerDetails?: {
    minTemperature?: number
    frostDate?: string
    weatherSource?: string
  }
  
  // Protection info
  protectionType: ProtectionType
  
  // Urgency
  urgency: ProtectionUrgency
  frostDate?: string
  minTemperatureExpected?: number
  
  // Status
  status: ChecklistStatus
  
  // Dates
  dueDate: string
  completedDate?: string
  completedBy?: string
  
  // Results
  effectiveness?: ProtectionEffectiveness
  damageAssessment?: string
  notes?: string
  photos?: string[]
  
  // Metadata
  createdAt: string
  updatedAt: string
}

export interface WinterProtectionTask {
  id: string
  checklistId: string
  
  // Task info
  title: string
  description?: string
  orderIndex: number
  
  // Materials
  materialsNeeded?: string[]
  estimatedTimeMinutes?: number
  
  // Status
  status: ChecklistStatus
  
  // Results
  completedDate?: string
  completedBy?: string
  notes?: string
  photos?: string[]
  
  // Metadata
  createdAt: string
  updatedAt: string
}

// =====================================================
// UNIFIED ADVICE CARD
// =====================================================

export interface ActiveAdviceCard {
  id: string
  type: 'CROP_ROTATION' | 'BIOLOGICAL_CONTROL' | 'COMPOSTER' | 'WINTER_PROTECTION'
  title: string
  description: string
  icon: string
  
  // Status
  status: 'ACTIVE' | 'PENDING' | 'COMPLETED'
  priority: ChecklistPriority
  
  // Actions
  actionRequired: boolean
  actionText: string
  actionUrl: string
  
  // Data
  relatedData: any // Specific data based on type
  
  // Metadata
  createdAt: string
  updatedAt: string
}
