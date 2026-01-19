// Vineyard Management Types

export interface VineyardConfiguration {
  id: string
  gardenId: string
  name: string
  vineyardType: 'wine' | 'table' | 'raisin' | 'dual-purpose'
  establishedDate?: Date
  totalVines: number
  hectares: number
  mainVarieties?: Array<{
    variety: string
    percentage: number
    cloneCode?: string
  }>
  trainingSystem?: 'guyot' | 'cordon' | 'pergola' | 'tendone' | 'other'
  rowSpacing?: number // meters
  vineSpacing?: number // meters
  organicCertified?: boolean
  description?: string
  createdAt: Date
  updatedAt: Date
}

// Bud Load and Ravaz Index Types
export interface BudLoadData {
  id: string
  vineyardId: string
  season: string // e.g., "2025-2026"
  pruningDate: Date
  pruningWoodWeight: number // kg
  harvestDate?: Date
  grapeYield: number // kg
  ravazIndex?: number // Calculated: grapeYield / pruningWoodWeight
  budsPerVine?: number
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface RavazIndexCalculation {
  ravazIndex: number
  interpretation: 'under-production' | 'optimal' | 'over-production' | 'severe-over-production'
  recommendation: string
  color: string
  icon: string
}

// Grape Maturity Tracking Types
export interface GrapeMaturityData {
  id: string
  vineyardId: string
  measurementDate: Date
  brix: number // °Brix (sugar content)
  ph?: number
  totalAcidity?: number // g/L
  malicAcid?: number // g/L
  tartaricAcid?: number // g/L
  estimatedAlcohol?: number // % vol (calculated from Brix)
  berryWeight?: number // grams
  berryColor?: 'green' | 'yellow' | 'pink' | 'red' | 'purple' | 'black'
  tastingNotes?: string
  harvestRecommendation?: 'too-early' | 'wait' | 'optimal' | 'harvest-soon' | 'overripe'
  location?: string // zone or block
  variety?: string
  createdAt: Date
  updatedAt: Date
}

// Green Operations Types
export interface GreenOperation {
  id: string
  vineyardId: string
  operationType: 'defoliation' | 'topping' | 'shoot-thinning' | 'cluster-thinning'
  operationDate: Date
  intensity: 'light' | 'medium' | 'heavy'
  zone?: 'basal' | 'apical' | 'lateral' | 'all'
  affectedVines: number
  estimatedHours: number
  actualHours?: number
  operator?: string
  notes?: string
  photos?: string[]
  createdAt: Date
  updatedAt: Date
}

// Defoliation (Sfogliatura) specific
export interface DefoliationData extends GreenOperation {
  operationType: 'defoliation'
  leavesRemoved: 'basal' | 'apical' | 'both'
  timing: 'pre-flowering' | 'fruit-set' | 'veraison' | 'pre-harvest'
  benefits: string[]
}

// Topping/Shoot Thinning (Cimatura/Spollonatura) specific
export interface ToppingData extends GreenOperation {
  operationType: 'topping' | 'shoot-thinning'
  shootsRemoved?: number
  heightReduction?: number // cm
  vigorControl: 'low' | 'medium' | 'high'
}

// Cluster Thinning (Diradamento Grappoli) specific
export interface ClusterThinningData extends GreenOperation {
  operationType: 'cluster-thinning'
  clustersPerVine: number
  clustersRemoved: number
  targetYield: number // kg/vine
  qualityGoal: 'standard' | 'premium' | 'reserve'
}

// Vineyard KPIs
export interface VineyardKPIs {
  vineyardId: string
  season: string
  totalYield: number // kg
  yieldPerVine: number // kg
  yieldPerHectare: number // kg/ha
  averageClusterWeight: number // grams
  averageBrix: number // °Brix
  averagePh: number
  averageAcidity: number // g/L
  ravazIndex: number
  qualityScore: number // 0-100
  estimatedWineProduction?: number // liters
  estimatedRevenue?: number // €
}
