// ============================================================================
// OLIVE GROVE MANAGEMENT TYPES
// Professional types for olive grove operations
// ============================================================================

import { GardenTask, HarvestLogData, PlantMasterSheet } from '../types'

export type OliveVarietyType = 'Oil' | 'Table' | 'Dual-purpose'
export type OliveHarvestMethod = 'Manual' | 'Mechanical' | 'Shaking'
export type OlivePruningType = 'Winter' | 'Summer'
export type OliveMilling = 'Traditional' | 'Continuous' | 'Two-phase'

export interface OliveCrop extends PlantMasterSheet {
  cropType: 'Olive'
  varietyType: OliveVarietyType
  treeAge: number
  treeDensity: number
  harvestMethod: OliveHarvestMethod
  harvestWindow: {
    startMonth: number
    endMonth: number
  }
  oilYieldExpected: number
  millingType: OliveMilling
}

export interface OliveTask extends GardenTask {
  oliveData?: {
    varietyType: OliveVarietyType
    harvestMethod?: OliveHarvestMethod
    pruningType?: OlivePruningType
  }
}

export interface OilQuality {
  acidity?: number
  peroxide?: number
  polyphenols?: number
}

export interface OliveHarvest extends HarvestLogData {
  oliveQuantity: number
  harvestMethod?: OliveHarvestMethod
  millingDate?: string
  millingType?: OliveMilling
  oilProduced?: number
  oilQuality?: OilQuality
  millingNotes?: string
}

export interface OliveGroveConfiguration {
  id: string
  gardenId: string
  name: string
  oliveType: 'oil' | 'table' | 'dual-purpose'
  establishedDate?: Date
  totalTrees: number
  hectares: number
  mainVarieties?: Array<{
    variety: string
    percentage: number
    purpose: 'oil' | 'table' | 'dual'
  }>
  trainingSystem?: 'globo' | 'vaso-policonico' | 'monocono' | 'palmetta' | 'other'
  rowSpacing?: number // meters
  treeSpacing?: number // meters
  organicCertified?: boolean
  irrigationSystem?: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// OLIVE MATURITY TRACKING TYPES
// ============================================================================

export interface OliveMaturityData {
  id: string
  oliveGroveId: string
  measurementDate: Date
  
  // Invaiatura (Color Change)
  invaiatura_percentage: number // 0-100% (% of olives changing color)
  color_stage: 'green' | 'yellow-green' | 'purple-spots' | 'purple' | 'black'
  
  // Physical Parameters
  pulp_firmness: 'very-hard' | 'hard' | 'medium' | 'soft' | 'very-soft'
  detachment_force: 'very-high' | 'high' | 'medium' | 'low' | 'very-low' // Forza distacco
  
  // Oil Content Estimation
  estimated_oil_content: number // % (10-25% typical)
  oil_quality_prediction: 'excellent' | 'good' | 'fair' | 'poor'
  
  // Maturity Index (Jaén Index)
  maturity_index?: number // 0-7 scale
  
  // Harvest Recommendation
  harvest_recommendation: 'too-early' | 'wait' | 'optimal-oil' | 'optimal-table' | 'harvest-soon' | 'overripe'
  harvest_window_days?: number // Days until optimal harvest
  
  // Location and Notes
  location?: string // zone or block
  variety?: string
  sample_size?: number // number of olives sampled
  notes?: string
  photos?: string[]
  
  createdAt: Date
  updatedAt: Date
}

/**
 * Jaén Maturity Index Scale:
 * 0 = Skin intense dark green
 * 1 = Skin yellow-green or yellow
 * 2 = Skin with red or purple spots < 50%
 * 3 = Skin with red or purple spots > 50%
 * 4 = Skin completely black, white or green pulp
 * 5 = Skin black, pulp purple < 50%
 * 6 = Skin black, pulp purple > 50%
 * 7 = Skin and pulp completely black
 * 
 * Optimal Harvest:
 * - Extra Virgin Oil (high quality): 2.0-3.5
 * - Standard Oil: 3.5-5.0
 * - Table Olives (green): 1.0-2.0
 * - Table Olives (black): 5.0-7.0
 */

// ============================================================================
// OLIVE FLY MONITORING TYPES (Bactrocera oleae)
// ============================================================================

export interface OliveFlyTrap {
  id: string
  oliveGroveId: string
  trap_code: string // e.g., "T-01", "T-02"
  trap_type: 'chromotropic' | 'pheromone' | 'food-bait' | 'mcphail'
  installation_date: Date
  location: string // zone or GPS
  gps_latitude?: number
  gps_longitude?: number
  is_active: boolean
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface OliveFlyMonitoring {
  id: string
  trap_id: string
  oliveGroveId: string
  inspection_date: Date
  
  // Captures
  adults_captured: number
  females_captured?: number
  males_captured?: number
  
  // Infestation Assessment
  olives_sampled?: number
  olives_infested?: number
  infestation_percentage?: number // (infested/sampled) * 100
  
  // Damage Level
  damage_level: 'none' | 'low' | 'medium' | 'high' | 'severe'
  
  // Intervention Threshold
  threshold_exceeded: boolean
  intervention_recommended: boolean
  intervention_urgency: 'none' | 'monitor' | 'plan' | 'immediate'
  
  // Weather Conditions
  temperature?: number
  humidity?: number
  
  // Notes and Actions
  notes?: string
  treatment_applied?: boolean
  treatment_date?: Date
  treatment_product?: string
  
  createdAt: Date
  updatedAt: Date
}

/**
 * Olive Fly Intervention Thresholds:
 * 
 * Chromotropic Traps:
 * - < 1 fly/trap/week: No intervention
 * - 1-2 flies/trap/week: Monitor closely
 * - > 2 flies/trap/week: Intervention recommended
 * 
 * Pheromone Traps:
 * - < 5 flies/trap/week: No intervention
 * - 5-10 flies/trap/week: Monitor closely
 * - > 10 flies/trap/week: Intervention recommended
 * 
 * Infestation on Olives:
 * - < 5%: Low risk
 * - 5-10%: Medium risk, monitor
 * - 10-15%: High risk, intervention needed
 * - > 15%: Severe, immediate intervention
 * 
 * Critical Period: June-October (peak July-September)
 */

export interface OliveFlyAlert {
  id: string
  oliveGroveId: string
  alert_date: Date
  alert_type: 'threshold-exceeded' | 'high-infestation' | 'weather-favorable' | 'critical-period'
  severity: 'info' | 'warning' | 'critical'
  message: string
  recommendation: string
  acknowledged: boolean
  acknowledged_date?: Date
  createdAt: Date
}

// ============================================================================
// OLIVE DISEASES TYPES
// ============================================================================

export interface OliveDiseaseMonitoring {
  id: string
  oliveGroveId: string
  inspection_date: Date
  disease_type: 'peacock-spot' | 'olive-knot' | 'verticillium' | 'anthracnose' | 'other'
  
  // Severity Assessment
  trees_affected: number
  total_trees_inspected: number
  infection_percentage: number // (affected/inspected) * 100
  severity_level: 'none' | 'low' | 'medium' | 'high' | 'severe'
  
  // Symptoms
  symptoms: string[]
  affected_parts: ('leaves' | 'branches' | 'trunk' | 'fruits')[]
  
  // Location
  location?: string
  gps_latitude?: number
  gps_longitude?: number
  
  // Treatment
  treatment_recommended: boolean
  treatment_applied?: boolean
  treatment_date?: Date
  treatment_product?: string
  
  // Photos and Notes
  photos?: string[]
  notes?: string
  
  createdAt: Date
  updatedAt: Date
}

/**
 * Common Olive Diseases:
 * 
 * 1. Peacock Spot (Occhio di Pavone) - Spilocaea oleagina
 *    - Symptoms: Circular spots on leaves, yellow halo
 *    - Critical Period: Autumn-Spring (humid conditions)
 *    - Treatment: Copper-based fungicides
 * 
 * 2. Olive Knot (Rogna) - Pseudomonas savastanoi
 *    - Symptoms: Galls/tumors on branches and trunk
 *    - Critical Period: After pruning, wounds
 *    - Treatment: Copper, remove affected parts
 * 
 * 3. Verticillium Wilt - Verticillium dahliae
 *    - Symptoms: Wilting, yellowing, branch dieback
 *    - Critical Period: Spring-Summer
 *    - Treatment: No cure, remove affected trees
 * 
 * 4. Anthracnose (Lebbra) - Colletotrichum spp.
 *    - Symptoms: Fruit rot, mummification
 *    - Critical Period: Humid conditions
 *    - Treatment: Copper-based fungicides
 */

// ============================================================================
// OLIVE OIL QUALITY TYPES
// ============================================================================

export interface OliveOilAnalysis {
  id: string
  oliveGroveId: string
  harvest_date: Date
  analysis_date: Date
  
  // Basic Parameters
  acidity: number // % (free fatty acids as oleic acid)
  peroxide_value: number // meq O2/kg
  
  // Quality Classification
  quality_grade: 'extra-virgin' | 'virgin' | 'lampante' | 'refined'
  
  // Organoleptic (if available)
  fruity_intensity?: number // 0-10
  bitter_intensity?: number // 0-10
  pungent_intensity?: number // 0-10
  defects?: string[]
  
  // Polyphenols and Antioxidants
  polyphenols?: number // mg/kg
  tocopherols?: number // mg/kg (Vitamin E)
  
  // Production Data
  olives_processed_kg: number
  oil_produced_liters: number
  oil_yield_percentage: number // (oil/olives) * 100
  
  // Notes
  variety?: string
  extraction_method?: string
  notes?: string
  
  createdAt: Date
  updatedAt: Date
}

/**
 * Extra Virgin Olive Oil Requirements (EU Regulation):
 * - Acidity: ≤ 0.8%
 * - Peroxide Value: ≤ 20 meq O2/kg
 * - Organoleptic: Median defects = 0, Median fruity > 0
 * 
 * Virgin Olive Oil:
 * - Acidity: ≤ 2.0%
 * - Peroxide Value: ≤ 20 meq O2/kg
 * 
 * Typical Oil Yield:
 * - Good quality: 18-22%
 * - Average: 15-18%
 * - Poor: < 15%
 */

// ============================================================================
// OLIVE GROVE KPIs
// ============================================================================

export interface OliveGroveKPIs {
  oliveGroveId: string
  season: string
  
  // Production
  total_yield_kg: number
  yield_per_tree_kg: number
  yield_per_hectare_kg: number
  
  // Oil Production
  oil_produced_liters: number
  oil_yield_percentage: number
  oil_quality_grade: string
  
  // Quality
  average_acidity: number
  average_polyphenols?: number
  
  // Efficiency
  harvest_efficiency_kg_per_hour?: number
  production_cost_per_kg?: number
  revenue_per_hectare?: number
  
  // Health
  fly_infestation_average: number
  disease_incidence_percentage: number
  trees_replaced: number
  
  createdAt: Date
  updatedAt: Date
}
