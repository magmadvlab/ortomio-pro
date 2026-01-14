/**
 * Crop Rotation Service
 * Servizio per gestire la rotazione delle colture con memoria storica
 */

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

class CropRotationService {
  private getClient() {
    const client = getSupabaseClient()
    if (!client) {
      throw new Error('Supabase client not available')
    }
    return client
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
    let query = this.getClient()
      .from('crop_rotation_history')
      .select('*')
      .eq('garden_id', gardenId)
      .order('harvest_date', { ascending: false, nullsFirst: false })

    if (fieldRowId) {
      query = query.eq('field_row_id', fieldRowId)
    }

    const { data, error } = await query

    if (error) throw error
    return (data || []).map(this.mapHistoryFromDb)
  }

  async getHistoryByRow(fieldRowId: string): Promise<CropRotationHistory[]> {
    const { data, error } = await this.getClient()
      .from('crop_rotation_history')
      .select('*')
      .eq('field_row_id', fieldRowId)
      .order('year', { ascending: false })
      .order('harvest_date', { ascending: false, nullsFirst: false })

    if (error) throw error
    return (data || []).map(this.mapHistoryFromDb)
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
    const suggestions = this.analyzeCropRotation(currentFamily, history)
    
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
      reasoning: rules.reasoning,
      benefits: this.getRotationBenefits(currentFamily, suggestions),
      risksToAvoid: this.getRotationRisks(currentFamily, history),
      confidenceScore: confidence,
      status: 'SUGGESTED'
    }

    // Save to database
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
  }

  private analyzeCropRotation(
    currentFamily: string,
    history: CropRotationHistory[]
  ): SuggestedCrop[] {
    const rules = ROTATION_RULES[currentFamily as keyof typeof ROTATION_RULES]
    if (!rules) return []

    const suggestions: SuggestedCrop[] = []
    
    // Get families used in last 3 years
    const recentFamilies = history
      .filter(h => h.harvestDate)
      .slice(0, 3)
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

      // Penalty if used in last 3 years
      const yearsAgo = recentFamilies.indexOf(family)
      if (yearsAgo >= 0) {
        score -= (30 - yearsAgo * 10)
      }

      // Add suggestions for each plant in family
      plants.forEach(plant => {
        suggestions.push({
          plantName: plant,
          plantFamily: family,
          score: Math.max(0, Math.min(100, score)),
          benefits: this.getCropBenefits(family, currentFamily),
          requirements: this.getCropRequirements(plant)
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
  }

  async acceptPlan(planId: string, acceptedCrop: string): Promise<CropRotationPlan> {
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
    const { error } = await this.getClient()
      .from('crop_rotation_plans')
      .update({ status: 'REJECTED' })
      .eq('id', planId)

    if (error) throw error
  }

  // ===== UTILITY METHODS =====

  getPlantFamily(plantName: string): string | null {
    for (const [family, plants] of Object.entries(PLANT_FAMILIES)) {
      if (plants.includes(plantName)) {
        return family
      }
    }
    return null
  }

  // ===== MAPPING METHODS =====

  private mapHistoryFromDb(data: any): CropRotationHistory {
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

  private mapPlanFromDb(data: any): CropRotationPlan {
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
}

export const cropRotationService = new CropRotationService()
export default cropRotationService
