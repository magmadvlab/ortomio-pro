/**
 * Crop Rotation Service
 * Servizio per gestire la rotazione delle colture con memoria storica
 */

import { getSoilCompatibility } from '@/utils/soilTemperatureUtils'
import type { Garden } from '@/types'
import { plantPHData } from '@/data/plantPHData'
import { getSupabaseClient } from '@/config/supabase'
import { CropRotationHistory, CropRotationPlan, SuggestedCrop } from '@/types/activeAIAdvice'

// Plant family rotation rules
const PLANT_FAMILIES = {
  'Solanaceae': ['Pomodoro', 'Peperone', 'Melanzana', 'Patata'],
  'Leguminose': ['Fagiolo', 'Pisello', 'Fava', 'Cece', 'Lenticchia'],
  'Brassicaceae': ['Cavolo', 'Cavolfiore', 'Broccolo', 'Rapa', 'Ravanello'],
  'Cucurbitaceae': ['Zucchina', 'Cetriolo', 'Melone', 'Anguria', 'Zucca'],
  'Apiaceae': ['Carota', 'Sedano', 'Prezzemolo', 'Finocchio'],
  'Asteraceae': ['Lattuga', 'Cicoria', 'Carciofo', 'Girasole'],
  'Chenopodiaceae': ['Bietola', 'Spinacio', 'Barbabietola'],
  'Liliaceae': ['Cipolla', 'Aglio', 'Porro', 'Asparago']
}

// Rotation rules: which families should follow which
const ROTATION_RULES = {
  'Solanaceae': {
    avoid: ['Solanaceae'], // Don't repeat same family
    good: ['Leguminose', 'Brassicaceae'], // Good successors
    excellent: ['Leguminose'], // Excellent successors (nitrogen fixers)
    reasoning: 'Le Solanacee depauperano il suolo. Seguire con leguminose per ripristinare azoto.'
  },
  'Leguminose': {
    avoid: ['Leguminose'],
    good: ['Solanaceae', 'Cucurbitaceae', 'Brassicaceae'],
    excellent: ['Solanaceae', 'Cucurbitaceae'], // Heavy feeders benefit from nitrogen
    reasoning: 'Le Leguminose arricchiscono il suolo di azoto. Ideale prima di colture esigenti.'
  },
  'Brassicaceae': {
    avoid: ['Brassicaceae'],
    good: ['Leguminose', 'Chenopodiaceae'],
    excellent: ['Leguminose'],
    reasoning: 'Le Brassicacee sono esigenti. Seguire con leguminose per recupero suolo.'
  },
  'Cucurbitaceae': {
    avoid: ['Cucurbitaceae'],
    good: ['Leguminose', 'Brassicaceae', 'Apiaceae'],
    excellent: ['Leguminose'],
    reasoning: 'Le Cucurbitacee sono molto esigenti. Necessario ripristino con leguminose.'
  },
  'Apiaceae': {
    avoid: ['Apiaceae'],
    good: ['Leguminose', 'Solanaceae', 'Asteraceae'],
    excellent: ['Leguminose'],
    reasoning: 'Le Apiacee hanno radici profonde. Alternare con colture a radice superficiale.'
  },
  'Asteraceae': {
    avoid: ['Asteraceae'],
    good: ['Leguminose', 'Brassicaceae'],
    excellent: ['Leguminose'],
    reasoning: 'Le Asteracee sono poco esigenti ma beneficiano di rotazione.'
  },
  'Chenopodiaceae': {
    avoid: ['Chenopodiaceae'],
    good: ['Leguminose', 'Solanaceae'],
    excellent: ['Leguminose'],
    reasoning: 'Le Chenopodiacee sono mediamente esigenti. Rotazione standard.'
  },
  'Liliaceae': {
    avoid: ['Liliaceae'],
    good: ['Leguminose', 'Solanaceae', 'Cucurbitaceae'],
    excellent: ['Leguminose'],
    reasoning: 'Le Liliacee hanno esigenze specifiche. Rotazione con leguminose ideale.'
  }
}

const VIRTUAL_PLAN_PREFIX = 'fallback:rotation:'

export function isVirtualCropRotationPlanId(planId?: string | null): boolean {
  return typeof planId === 'string' && planId.startsWith(VIRTUAL_PLAN_PREFIX)
}

const isMissingRelationError = (error: unknown, relation?: string) => {
  if (!error) return false
  const err = error as { message?: string; hint?: string; details?: string; code?: string }
  const message = String(err.message || '')
  const hint = String(err.hint || '')
  const details = String(err.details || '')
  const haystack = `${message} ${hint} ${details}`

  if (err.code === 'PGRST205') {
    return !relation || haystack.includes(relation)
  }

  return !relation
    ? haystack.includes("Could not find the table 'public.")
    : haystack.includes(`public.${relation}`)
}

const getSeasonFromDate = (isoDate?: string): CropRotationHistory['season'] => {
  const month = isoDate ? new Date(isoDate).getMonth() : new Date().getMonth()
  if (month >= 2 && month <= 4) return 'Primavera'
  if (month >= 5 && month <= 7) return 'Estate'
  if (month >= 8 && month <= 10) return 'Autunno'
  return 'Inverno'
}

class CropRotationService {
  private backendMode: 'field_row_history' | 'legacy_crop_rotation' | null = null

  private getClient() {
    const client = getSupabaseClient()
    if (!client) {
      throw new Error('Supabase client not available')
    }
    return client
  }

  private async getBackendMode(): Promise<'field_row_history' | 'legacy_crop_rotation'> {
    if (this.backendMode) {
      return this.backendMode
    }

    const client = this.getClient()

    const fieldHistoryProbe = await client
      .from('field_row_crop_history')
      .select('id')
      .limit(1)

    if (!fieldHistoryProbe.error) {
      this.backendMode = 'field_row_history'
      return this.backendMode
    }

    if (!isMissingRelationError(fieldHistoryProbe.error, 'field_row_crop_history')) {
      throw fieldHistoryProbe.error
    }

    this.backendMode = 'legacy_crop_rotation'
    return this.backendMode
  }

  // ===== HISTORY MANAGEMENT =====

  async addToHistory(data: Partial<CropRotationHistory>): Promise<CropRotationHistory> {
    const { data: history, error } = await this.getClient()
      .from('crop_rotation_history')
      .insert({
        garden_id: data.gardenId,
        field_row_id: data.fieldRowId,
        zone_id: data.zoneId,
        plant_variety_id: data.plantVarietyId,
        plant_name: data.plantName,
        plant_family: data.plantFamily,
        planted_date: data.plantedDate,
        harvest_date: data.harvestDate,
        season: data.season,
        year: data.year,
        yield_kg: data.yieldKg,
        quality_score: data.qualityScore,
        diseases: data.diseases,
        pests: data.pests,
        nutrient_deficiencies: data.nutrientDeficiencies,
        notes: data.notes
      })
      .select()
      .single()

    if (error) throw error
    return this.mapHistoryFromDb(history)
  }

  async getHistory(gardenId: string, fieldRowId?: string): Promise<CropRotationHistory[]> {
    return this.getHistoryFromFieldRowFallback(gardenId, fieldRowId)
  }

  async getHistoryByRow(fieldRowId: string): Promise<CropRotationHistory[]> {
    return this.getHistoryFromFieldRowFallback(undefined, fieldRowId)
  }

  // ===== ROTATION PLANNING =====

  async generateRotationPlan(
    gardenId: string,
    fieldRowId: string,
    currentCrop: string,
    currentFamily: string
  ): Promise<CropRotationPlan> {
    // Get history for this row
    const history = await this.getHistoryByRow(fieldRowId)
    
    // Analyze history to determine best next crops
    const soil = await this.loadSoil(gardenId)
    const ph = soil.forRow(fieldRowId)
    const suggestions = this.analyzeCropRotation(currentFamily, history, ph)
    
    // Calculate confidence based on history completeness
    const confidence = this.calculateConfidence(history)
    
    // Get rotation rules for current family
    const rules = ROTATION_RULES[currentFamily as keyof typeof ROTATION_RULES] || {
      avoid: [currentFamily],
      good: ['Leguminose'],
      excellent: ['Leguminose'],
      reasoning: 'Rotazione standard consigliata'
    }

    const plan: Partial<CropRotationPlan> = {
      gardenId,
      fieldRowId,
      currentCrop,
      currentFamily,
      suggestedNextCrops: suggestions,
      rotationCycle: 4,
      reasoning: rules.reasoning + soil.description(ph),
      benefits: this.getRotationBenefits(currentFamily, suggestions),
      risksToAvoid: this.getRotationRisks(currentFamily, history),
      confidenceScore: confidence,
      status: 'SUGGESTED'
    }

    const backendMode = await this.getBackendMode()
    if (backendMode === 'field_row_history') {
      return this.buildVirtualPlan(plan as CropRotationPlan)
    }

    try {
      const { data, error } = await this.getClient()
        .from('crop_rotation_plans')
        .insert({
          garden_id: plan.gardenId,
          field_row_id: plan.fieldRowId,
          current_crop: plan.currentCrop,
          current_family: plan.currentFamily,
          suggested_next_crops: plan.suggestedNextCrops,
          rotation_cycle: plan.rotationCycle,
          reasoning: plan.reasoning,
          benefits: plan.benefits,
          risks_to_avoid: plan.risksToAvoid,
          confidence_score: plan.confidenceScore,
          status: plan.status
        })
        .select()
        .single()

      if (error) throw error
      return this.mapPlanFromDb(data)
    } catch (error) {
      if (!isMissingRelationError(error, 'crop_rotation_plans')) {
        throw error
      }

      return this.buildVirtualPlan(plan as CropRotationPlan)
    }
  }

  private async loadSoil(gardenId: string) {
    const db = this.getClient()
    const [garden, zones, rows] = await Promise.all([
      db.from('gardens').select('soil_ph,soil_type').eq('id',gardenId).single(),
      db.from('garden_zones').select('id,soil_ph,soil_type').eq('garden_id',gardenId),
      db.from('field_rows').select('id,zone_id').eq('garden_id',gardenId),
    ])
    for (const result of [garden,zones,rows]) if (result.error) throw result.error
    return {
      forRow: (id: string) => {
        const zoneId = rows.data?.find(row => row.id === id)?.zone_id
        const zone = zones.data?.find(zone => zone.id === zoneId)
        const ph = zone?.soil_ph ?? garden.data?.soil_ph
        return { ph: ph != null && Number.isFinite(Number(ph)) ? Number(ph) : undefined, type: (zone?.soil_type || garden.data?.soil_type) as Garden['soilType'] }
      },
      description: (soil: {ph?: number; type?: string}) => ` Suolo: ${soil.type || 'tipo non registrato'}. pH: ${soil.ph ?? 'non registrato'}.`,
    }
  }

  private analyzeCropRotation(
    currentFamily: string,
    history: CropRotationHistory[], soil?: {ph?: number; type?: Garden['soilType']}
  ): SuggestedCrop[] {
    const rules = ROTATION_RULES[currentFamily as keyof typeof ROTATION_RULES]
    if (!rules) return []

    const suggestions: SuggestedCrop[] = []
    
    // Get families used in last 3 years
    const cutoff = new Date()
    cutoff.setUTCFullYear(cutoff.getUTCFullYear() - 3)
    const recentFamilies = history.filter(h => Date.parse(h.harvestDate || h.plantedDate) >= cutoff.getTime())
      .map(h => h.plantFamily)

    // Score each possible family
    Object.entries(PLANT_FAMILIES).forEach(([family, plants]) => {
      // Skip if in avoid list
      if (rules.avoid.includes(family)) return
      
      // Skip if used recently
      if (recentFamilies.includes(family)) return

      let score = 50 // Base score

      // Boost for excellent successors
      if (rules.excellent.includes(family)) {
        score += 40
      }
      // Boost for good successors
      else if (rules.good.includes(family)) {
        score += 25
      }

      plants.forEach(plant => {
        const ph = soil?.ph
        const texture = getSoilCompatibility(plant,soil?.type)
        if (!texture.compatible) return
        const textureScore = soil?.type && texture.optimalSoilTypes ? (texture.optimalSoilTypes.includes(soil.type) ? 5 : -5) : 0
        const range = plantPHData[plant.toLowerCase()]
        if (ph !== undefined && range && (ph < range.tolerable.min || ph > range.tolerable.max)) return
        const ideal = ph !== undefined && range && ph >= range.ideal.min && ph <= range.ideal.max
        suggestions.push({
          plantName: plant,
          plantFamily: family,
          score: Math.max(0, Math.min(100, score + textureScore + (ideal ? 8 : 0))),
          benefits: this.getCropBenefits(family, currentFamily),
          requirements: [...this.getCropRequirements(plant), ...(texture.optimalSoilTypes && texture.reason ? [texture.reason] : []), ...(range ? [`pH ideale ${range.ideal.min}–${range.ideal.max}`] : [])]
        })
      })
    })

    // Sort by score and return top 10
    return suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
  }

  private calculateConfidence(history: CropRotationHistory[]): number {
    // More history = higher confidence
    if (history.length === 0) return 0.5
    if (history.length === 1) return 0.6
    if (history.length === 2) return 0.7
    if (history.length >= 3) return 0.85
    return 0.9
  }

  private getCropBenefits(nextFamily: string, currentFamily: string): string[] {
    const benefits: string[] = []

    if (nextFamily === 'Leguminose') {
      benefits.push('Arricchisce il suolo di azoto')
      benefits.push('Migliora la struttura del suolo')
      benefits.push('Riduce necessità di fertilizzanti')
    }

    if (currentFamily === 'Solanaceae' && nextFamily === 'Leguminose') {
      benefits.push('Ripristina nutrienti dopo coltura esigente')
    }

    if (nextFamily === 'Brassicaceae') {
      benefits.push('Radici profonde migliorano drenaggio')
      benefits.push('Effetto biofumigante contro patogeni')
    }

    if (nextFamily === 'Apiaceae') {
      benefits.push('Radici profonde esplorano strati profondi')
      benefits.push('Migliora struttura del suolo')
    }

    return benefits.length > 0 ? benefits : ['Rotazione standard benefica']
  }

  private getCropRequirements(plantName: string): string[] {
    // Simplified requirements - in production would be more detailed
    const requirements: string[] = []
    
    if (['Pomodoro', 'Peperone', 'Melanzana'].includes(plantName)) {
      requirements.push('Terreno fertile e ben drenato')
      requirements.push('Pieno sole')
      requirements.push('Irrigazione regolare')
    } else if (['Fagiolo', 'Pisello', 'Fava'].includes(plantName)) {
      requirements.push('Terreno ben drenato')
      requirements.push('Sole o mezz\'ombra')
      requirements.push('Irrigazione moderata')
    } else if (['Lattuga', 'Spinacio'].includes(plantName)) {
      requirements.push('Terreno fresco e umido')
      requirements.push('Mezz\'ombra in estate')
      requirements.push('Irrigazione frequente')
    } else {
      requirements.push('Terreno ben lavorato')
      requirements.push('Esposizione solare adeguata')
      requirements.push('Irrigazione regolare')
    }

    return requirements
  }

  private getRotationBenefits(currentFamily: string, suggestions: SuggestedCrop[]): string[] {
    const benefits: string[] = [
      'Previene accumulo di patogeni specifici',
      'Mantiene fertilità del suolo',
      'Riduce necessità di trattamenti'
    ]

    if (suggestions.some(s => s.plantFamily === 'Leguminose')) {
      benefits.push('Arricchimento naturale di azoto')
    }

    return benefits
  }

  private getRotationRisks(currentFamily: string, history: CropRotationHistory[]): string[] {
    const risks: string[] = []

    // Check for repeated families
    const familyCounts = history.reduce((acc, h) => {
      acc[h.plantFamily] = (acc[h.plantFamily] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    Object.entries(familyCounts).forEach(([family, count]) => {
      if (count >= 2) {
        risks.push(`Famiglia ${family} ripetuta ${count} volte - rischio patogeni`)
      }
    })

    // Check for disease history
    const diseases = history.flatMap(h => h.diseases || [])
    if (diseases.length > 0) {
      risks.push('Presenza storica di malattie - rotazione importante')
    }

    if (risks.length === 0) {
      risks.push('Nessun rischio particolare rilevato')
    }

    return risks
  }

  // ===== PLAN MANAGEMENT =====

  async getPlans(gardenId: string, status?: string): Promise<CropRotationPlan[]> {
    const backendMode = await this.getBackendMode()
    if (backendMode === 'field_row_history') {
      return this.getFallbackPlansFromFieldHistory(gardenId, status)
    }

    try {
      let query = this.getClient()
        .from('crop_rotation_plans')
        .select('*')
        .eq('garden_id', gardenId)
        .order('created_at', { ascending: false })

      if (status) {
        query = query.eq('status', status)
      }

      const { data, error } = await query
      if (error) throw error
      return (data || []).map(this.mapPlanFromDb)
    } catch (error) {
      if (!isMissingRelationError(error, 'crop_rotation_plans')) {
        throw error
      }

      return this.getFallbackPlansFromFieldHistory(gardenId, status)
    }
  }

  async acceptPlan(planId: string, acceptedCrop: string): Promise<CropRotationPlan> {
    if (isVirtualCropRotationPlanId(planId)) {
      throw new Error('Questo suggerimento è derivato dallo storico filari e non è ancora persistibile come piano. Usa il Planner Classico per creare la pianificazione.')
    }

    const { data, error } = await this.getClient()
      .from('crop_rotation_plans')
      .update({
        status: 'ACCEPTED',
        accepted_crop: acceptedCrop,
        accepted_date: new Date().toISOString().split('T')[0]
      })
      .eq('id', planId)
      .select()
      .single()

    if (error) throw error
    return this.mapPlanFromDb(data)
  }

  async rejectPlan(planId: string): Promise<void> {
    if (isVirtualCropRotationPlanId(planId)) {
      return
    }

    const { error } = await this.getClient()
      .from('crop_rotation_plans')
      .update({ status: 'REJECTED' })
      .eq('id', planId)

    if (error) throw error
  }

  // ===== UTILITY METHODS =====

  getPlantFamily(plantName: string): string | null {
    for (const [family, plants] of Object.entries(PLANT_FAMILIES)) {
      if (plants.some(name => name.toLowerCase() === plantName.trim().toLowerCase())) {
        return family
      }
    }
    return null
  }

  private async getHistoryFromFieldRowFallback(
    gardenId?: string,
    fieldRowId?: string
  ): Promise<CropRotationHistory[]> {
    let query = this.getClient()
      .from('field_row_crop_history')
      .select('*')
      .order('harvest_date', { ascending: false, nullsFirst: false })
      .order('planting_date', { ascending: false })

    if (gardenId) {
      query = query.eq('garden_id', gardenId)
    }

    if (fieldRowId) {
      query = query.eq('garden_row_id', fieldRowId)
    }

    const { data, error } = await query
    if (error && !isMissingRelationError(error, 'field_row_crop_history')) throw error

    const db = this.getClient()
    let recorded = db.from('crop_rotation_history').select('*').lte('planted_date',new Date().toISOString().slice(0,10))
    let tasks = db.from('garden_tasks').select('id,garden_id,field_row_id,bed_row_id,plant_name,date,created_at,updated_at')
      .in('task_type',['Sowing','Transplant']).eq('completed',true)
      .lte('date',new Date().toISOString().slice(0,10)).or('operational_status.is.null,operational_status.neq.cancelled')
    let plants = db.from('garden_plants').select('id,garden_id,field_row_id,plant_name,planting_date,created_at,updated_at')
      .not('field_row_id','is',null).not('planting_date','is',null).lte('planting_date',new Date().toISOString().slice(0,10))
    if (gardenId) {
      recorded = recorded.eq('garden_id',gardenId); tasks = tasks.eq('garden_id',gardenId); plants = plants.eq('garden_id',gardenId)
    }
    if (fieldRowId) {
      recorded = recorded.eq('field_row_id',fieldRowId); tasks = tasks.eq('field_row_id',fieldRowId); plants = plants.eq('field_row_id',fieldRowId)
    }
    const [ledger, sowings, planted] = await Promise.all([recorded,tasks,plants])
    if (ledger.error && !isMissingRelationError(ledger.error, 'crop_rotation_history')) throw ledger.error
    for (const result of [sowings,planted]) if (result.error) throw result.error
    const history = [...(ledger.data ?? []).map(this.mapHistoryFromDb), ...(data ?? []).map(this.mapHistoryFromFieldRowDb)]
    for (const row of [...(sowings.data ?? []).map(t => ({...t, planting_date:t.date})), ...(planted.data ?? [])]) {
      if (!row.plant_name?.trim()) continue
      history.push({id:row.id,gardenId:row.garden_id,fieldRowId:row.field_row_id ?? ('bed_row_id' in row ? row.bed_row_id : undefined),plantName:row.plant_name,
        plantFamily:this.getPlantFamily(row.plant_name) || 'Altro',plantedDate:row.planting_date,
        season:getSeasonFromDate(row.planting_date),year:Number(row.planting_date.slice(0,4)),createdAt:row.created_at,updatedAt:row.updated_at})
    }
    const unique = new Map<string,CropRotationHistory>()
    for (const entry of history) {
      const key = JSON.stringify([entry.fieldRowId,entry.plantName.trim().toLowerCase(),entry.plantedDate.slice(0,10)])
      if (!unique.has(key)) unique.set(key,{...entry,plantFamily:this.getPlantFamily(entry.plantName) ?? entry.plantFamily})
    }
    return [...unique.values()].sort((a,b) => b.plantedDate.localeCompare(a.plantedDate))

  }

  private async getFallbackPlansFromFieldHistory(
    gardenId: string,
    status?: string
  ): Promise<CropRotationPlan[]> {
    if (status && status !== 'SUGGESTED') {
      return []
    }

    const history = await this.getHistoryFromFieldRowFallback(gardenId)
    if (history.length === 0) {
      return []
    }

    const latestByRow = new Map<string, CropRotationHistory>()
    const historyByRow = new Map<string, CropRotationHistory[]>()

    for (const entry of history) {
      const rowId = entry.fieldRowId || gardenId

      if (!latestByRow.has(rowId)) {
        latestByRow.set(rowId, entry)
      }

      const rowHistory = historyByRow.get(rowId) || []
      rowHistory.push(entry)
      historyByRow.set(rowId, rowHistory)
    }

    const soil = await this.loadSoil(gardenId)
    return Array.from(latestByRow.entries()).map(([rowId, currentEntry]) => {
      const rowHistory = historyByRow.get(rowId) || []
      const suggestions = this.analyzeCropRotation(currentEntry.plantFamily, rowHistory, soil.forRow(rowId))
      const rules = ROTATION_RULES[currentEntry.plantFamily as keyof typeof ROTATION_RULES] || {
        reasoning: 'Suggerimento derivato dallo storico filari'
      }

      return this.buildVirtualPlan({
        id: `${VIRTUAL_PLAN_PREFIX}${rowId}`,
        gardenId,
        fieldRowId: currentEntry.fieldRowId,
        currentCrop: currentEntry.plantName,
        currentFamily: currentEntry.plantFamily,
        suggestedNextCrops: suggestions,
        rotationCycle: 4,
        reasoning: rules.reasoning + soil.description(soil.forRow(rowId)),
        benefits: this.getRotationBenefits(currentEntry.plantFamily, suggestions),
        risksToAvoid: this.getRotationRisks(currentEntry.plantFamily, rowHistory),
        confidenceScore: this.calculateConfidence(rowHistory),
        status: 'SUGGESTED',
        createdAt: currentEntry.updatedAt || currentEntry.createdAt,
        updatedAt: currentEntry.updatedAt || currentEntry.createdAt
      })
    })
  }

  private buildVirtualPlan(plan: CropRotationPlan): CropRotationPlan {
    return {
      ...plan,
      id: isVirtualCropRotationPlanId(plan.id)
        ? plan.id
        : `${VIRTUAL_PLAN_PREFIX}${plan.fieldRowId || plan.gardenId}:${plan.currentFamily}`,
      status: 'SUGGESTED',
      createdAt: plan.createdAt || new Date().toISOString(),
      updatedAt: plan.updatedAt || new Date().toISOString()
    }
  }

  // ===== MAPPING METHODS =====

  private mapHistoryFromDb(data: {
    id: string
    garden_id: string
    field_row_id?: string
    zone_id?: string
    plant_variety_id?: string
    plant_name: string
    plant_family: string
    planted_date: string
    harvest_date?: string
    season: CropRotationHistory['season']
    year: number
    yield_kg?: number
    quality_score?: number
    diseases?: string[]
    pests?: string[]
    nutrient_deficiencies?: string[]
    notes?: string
    created_at: string
    updated_at: string
  }): CropRotationHistory {
    return {
      id: data.id,
      gardenId: data.garden_id,
      fieldRowId: data.field_row_id,
      zoneId: data.zone_id,
      plantVarietyId: data.plant_variety_id,
      plantName: data.plant_name,
      plantFamily: data.plant_family,
      plantedDate: data.planted_date,
      harvestDate: data.harvest_date,
      season: data.season,
      year: data.year,
      yieldKg: data.yield_kg,
      qualityScore: data.quality_score,
      diseases: data.diseases,
      pests: data.pests,
      nutrientDeficiencies: data.nutrient_deficiencies,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  }

  private mapPlanFromDb(data: {
    id: string
    garden_id: string
    field_row_id?: string
    zone_id?: string
    current_crop: string
    current_family: string
    suggested_next_crops: SuggestedCrop[]
    rotation_cycle: number
    reasoning: string
    benefits: string[]
    risks_to_avoid: string[]
    confidence_score: number
    status: CropRotationPlan['status']
    accepted_crop?: string
    accepted_date?: string
    created_at: string
    updated_at: string
  }): CropRotationPlan {
    return {
      id: data.id,
      gardenId: data.garden_id,
      fieldRowId: data.field_row_id,
      zoneId: data.zone_id,
      currentCrop: data.current_crop,
      currentFamily: data.current_family,
      suggestedNextCrops: data.suggested_next_crops,
      rotationCycle: data.rotation_cycle,
      reasoning: data.reasoning,
      benefits: data.benefits,
      risksToAvoid: data.risks_to_avoid,
      confidenceScore: data.confidence_score,
      status: data.status,
      acceptedCrop: data.accepted_crop,
      acceptedDate: data.accepted_date,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  }

  private mapHistoryFromFieldRowDb(data: {
    id: string
    garden_id: string
    garden_row_id?: string
    crop_name: string
    crop_family?: string
    planting_date?: string
    harvest_date?: string
    yield_kg?: number
    quality_rating?: number
    health_issues?: string[]
    notes?: string
    created_at: string
    updated_at: string
  }): CropRotationHistory {
    const plantedDate = data.planting_date || new Date().toISOString()
    const qualityScore = typeof data.quality_rating === 'number'
      ? Math.max(0, Math.min(100, data.quality_rating * 20))
      : undefined

    return {
      id: data.id,
      gardenId: data.garden_id,
      fieldRowId: data.garden_row_id,
      plantName: data.crop_name,
      plantFamily: data.crop_family || 'Altro',
      plantedDate,
      harvestDate: data.harvest_date || undefined,
      season: getSeasonFromDate(plantedDate),
      year: plantedDate ? new Date(plantedDate).getFullYear() : new Date().getFullYear(),
      yieldKg: data.yield_kg || undefined,
      qualityScore,
      diseases: Array.isArray(data.health_issues) ? data.health_issues : [],
      pests: [],
      nutrientDeficiencies: [],
      notes: data.notes || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  }
}

export const cropRotationService = new CropRotationService()
export default cropRotationService
