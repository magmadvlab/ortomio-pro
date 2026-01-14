/**
 * Classic Planner Service
 * Servizio per pianificazione coltivazioni con integrazione rotazione colture
 */

import { getSupabaseClient } from '@/config/supabase'
import { cropRotationService } from './cropRotationService'

export interface PlantingPlan {
  id: string
  gardenId: string
  zoneId?: string
  fieldRowId?: string
  fieldRowSectionId?: string
  
  // Plant info
  plantVarietyId?: string
  plantName: string
  plantFamily: string
  quantity: number
  
  // Dates
  plannedPlantingDate: string
  plannedHarvestDate?: string
  actualPlantingDate?: string
  actualHarvestDate?: string
  
  // Status
  status: 'PLANNED' | 'PLANTED' | 'GROWING' | 'HARVESTED' | 'CANCELLED'
  
  // Rotation info
  rotationPlanId?: string
  followsRotationAdvice: boolean
  rotationScore?: number
  rotationWarnings?: string[]
  
  // Notes
  notes?: string
  
  // Metadata
  createdAt: string
  updatedAt: string
}

export interface PlantingSuggestion {
  plantName: string
  plantFamily: string
  score: number
  reason: string
  benefits: string[]
  warnings: string[]
  idealPlantingDates: {
    start: string
    end: string
    optimal: string
  }
}

class ClassicPlannerService {
  private getClient() {
    const client = getSupabaseClient()
    if (!client) {
      throw new Error('Supabase client not available')
    }
    return client
  }

  // ===== PLANNING =====

  async createPlan(data: Partial<PlantingPlan>): Promise<PlantingPlan> {
    // Check rotation if field row specified
    let rotationInfo: any = {}
    if (data.fieldRowId && data.plantName && data.plantFamily) {
      rotationInfo = await this.checkRotation(
        data.gardenId!,
        data.fieldRowId,
        data.plantName,
        data.plantFamily
      )
    }

    const { data: plan, error } = await this.getClient()
      .from('planting_plans')
      .insert({
        garden_id: data.gardenId,
        zone_id: data.zoneId,
        field_row_id: data.fieldRowId,
        field_row_section_id: data.fieldRowSectionId,
        plant_variety_id: data.plantVarietyId,
        plant_name: data.plantName,
        plant_family: data.plantFamily,
        quantity: data.quantity,
        planned_planting_date: data.plannedPlantingDate,
        planned_harvest_date: data.plannedHarvestDate,
        status: data.status || 'PLANNED',
        rotation_plan_id: rotationInfo.planId,
        follows_rotation_advice: rotationInfo.followsAdvice || false,
        rotation_score: rotationInfo.score,
        rotation_warnings: rotationInfo.warnings,
        notes: data.notes
      })
      .select()
      .single()

    if (error) throw error
    return this.mapPlanFromDb(plan)
  }

  private async checkRotation(
    gardenId: string,
    fieldRowId: string,
    plantName: string,
    plantFamily: string
  ): Promise<{
    planId?: string
    followsAdvice: boolean
    score?: number
    warnings?: string[]
  }> {
    try {
      // Get rotation history
      const history = await cropRotationService.getHistoryByRow(fieldRowId)
      
      if (history.length === 0) {
        return { followsAdvice: true }
      }

      // Get last crop
      const lastCrop = history[0]
      
      // Check if same family (bad)
      if (lastCrop.plantFamily === plantFamily) {
        return {
          followsAdvice: false,
          score: 20,
          warnings: [
            `⚠️ Stessa famiglia botanica (${plantFamily}) del raccolto precedente`,
            'Rischio accumulo patogeni specifici',
            'Consigliato alternare con famiglia diversa'
          ]
        }
      }

      // Check if follows rotation plan
      const plans = await cropRotationService.getPlans(gardenId, 'SUGGESTED')
      const relevantPlan = plans.find(p => p.fieldRowId === fieldRowId)
      
      if (relevantPlan) {
        const suggested = relevantPlan.suggestedNextCrops.find(c => c.plantName === plantName)
        if (suggested) {
          return {
            planId: relevantPlan.id,
            followsAdvice: true,
            score: suggested.score,
            warnings: []
          }
        }
      }

      // Check recent history (last 3 years)
      const recentFamilies = history.slice(0, 3).map(h => h.plantFamily)
      if (recentFamilies.includes(plantFamily)) {
        return {
          followsAdvice: false,
          score: 40,
          warnings: [
            `⚠️ Famiglia ${plantFamily} già coltivata negli ultimi 3 anni`,
            'Rischio depauperamento suolo',
            'Consigliato rotazione più lunga'
          ]
        }
      }

      return { followsAdvice: true, score: 70 }
    } catch (error) {
      console.error('Error checking rotation:', error)
      return { followsAdvice: true }
    }
  }

  async getPlans(
    gardenId: string,
    filters?: {
      status?: PlantingPlan['status']
      fieldRowId?: string
      zoneId?: string
      season?: string
    }
  ): Promise<PlantingPlan[]> {
    let query = this.getClient()
      .from('planting_plans')
      .select('*')
      .eq('garden_id', gardenId)
      .order('planned_planting_date', { ascending: true })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.fieldRowId) {
      query = query.eq('field_row_id', filters.fieldRowId)
    }
    if (filters?.zoneId) {
      query = query.eq('zone_id', filters.zoneId)
    }

    const { data, error } = await query

    if (error) throw error
    return (data || []).map(this.mapPlanFromDb)
  }

  async updatePlanStatus(
    planId: string,
    status: PlantingPlan['status'],
    data?: {
      actualPlantingDate?: string
      actualHarvestDate?: string
      notes?: string
    }
  ): Promise<PlantingPlan> {
    const updates: any = {
      status,
      updated_at: new Date().toISOString()
    }

    if (data?.actualPlantingDate) updates.actual_planting_date = data.actualPlantingDate
    if (data?.actualHarvestDate) updates.actual_harvest_date = data.actualHarvestDate
    if (data?.notes) updates.notes = data.notes

    const { data: plan, error } = await this.getClient()
      .from('planting_plans')
      .update(updates)
      .eq('id', planId)
      .select()
      .single()

    if (error) throw error

    // If harvested, add to rotation history
    if (status === 'HARVESTED' && data?.actualHarvestDate) {
      const planData = this.mapPlanFromDb(plan)
      if (planData.fieldRowId) {
        await cropRotationService.addToHistory({
          gardenId: planData.gardenId,
          fieldRowId: planData.fieldRowId,
          plantVarietyId: planData.plantVarietyId,
          plantName: planData.plantName,
          plantFamily: planData.plantFamily,
          plantedDate: planData.actualPlantingDate || planData.plannedPlantingDate,
          harvestDate: data.actualHarvestDate,
          season: this.getSeason(data.actualHarvestDate),
          year: new Date(data.actualHarvestDate).getFullYear()
        })
      }
    }

    return this.mapPlanFromDb(plan)
  }

  // ===== SUGGESTIONS =====

  async getSuggestionsForLocation(
    gardenId: string,
    fieldRowId?: string,
    zoneId?: string
  ): Promise<PlantingSuggestion[]> {
    const suggestions: PlantingSuggestion[] = []

    // If field row specified, use rotation service
    if (fieldRowId) {
      const history = await cropRotationService.getHistoryByRow(fieldRowId)
      
      if (history.length > 0) {
        const lastCrop = history[0]
        
        // Try to get existing rotation plan
        const plans = await cropRotationService.getPlans(gardenId, 'SUGGESTED')
        const relevantPlan = plans.find(p => p.fieldRowId === fieldRowId)
        
        if (relevantPlan) {
          // Use rotation suggestions
          return relevantPlan.suggestedNextCrops.map(crop => ({
            plantName: crop.plantName,
            plantFamily: crop.plantFamily,
            score: crop.score,
            reason: `Rotazione ottimale dopo ${lastCrop.plantName}`,
            benefits: crop.benefits,
            warnings: [],
            idealPlantingDates: this.getIdealPlantingDates(crop.plantName)
          }))
        } else {
          // Generate new rotation plan
          const plan = await cropRotationService.generateRotationPlan(
            gardenId,
            fieldRowId,
            lastCrop.plantName,
            lastCrop.plantFamily
          )
          
          return plan.suggestedNextCrops.map(crop => ({
            plantName: crop.plantName,
            plantFamily: crop.plantFamily,
            score: crop.score,
            reason: plan.reasoning,
            benefits: crop.benefits,
            warnings: [],
            idealPlantingDates: this.getIdealPlantingDates(crop.plantName)
          }))
        }
      }
    }

    // Default seasonal suggestions
    return this.getSeasonalSuggestions()
  }

  private getSeasonalSuggestions(): PlantingSuggestion[] {
    const now = new Date()
    const month = now.getMonth() + 1 // 1-12

    // Simplified seasonal suggestions
    if (month >= 3 && month <= 5) { // Primavera
      return [
        {
          plantName: 'Pomodoro',
          plantFamily: 'Solanaceae',
          score: 90,
          reason: 'Periodo ideale per semina pomodori',
          benefits: ['Temperatura ottimale', 'Lunga stagione di crescita'],
          warnings: [],
          idealPlantingDates: this.getIdealPlantingDates('Pomodoro')
        },
        {
          plantName: 'Lattuga',
          plantFamily: 'Asteraceae',
          score: 85,
          reason: 'Ottimo per raccolti primaverili',
          benefits: ['Crescita rapida', 'Tollera temperature fresche'],
          warnings: [],
          idealPlantingDates: this.getIdealPlantingDates('Lattuga')
        }
      ]
    }

    return []
  }

  private getIdealPlantingDates(plantName: string): {
    start: string
    end: string
    optimal: string
  } {
    // Simplified planting dates - in production would be more detailed
    const now = new Date()
    const start = new Date(now)
    start.setDate(start.getDate() + 7)
    
    const end = new Date(start)
    end.setDate(end.getDate() + 30)
    
    const optimal = new Date(start)
    optimal.setDate(optimal.getDate() + 15)

    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
      optimal: optimal.toISOString().split('T')[0]
    }
  }

  private getSeason(date: string): 'Primavera' | 'Estate' | 'Autunno' | 'Inverno' {
    const month = new Date(date).getMonth() + 1
    if (month >= 3 && month <= 5) return 'Primavera'
    if (month >= 6 && month <= 8) return 'Estate'
    if (month >= 9 && month <= 11) return 'Autunno'
    return 'Inverno'
  }

  // ===== CALENDAR VIEW =====

  async getCalendarView(
    gardenId: string,
    startDate: string,
    endDate: string
  ): Promise<{
    date: string
    plans: PlantingPlan[]
  }[]> {
    const { data, error } = await this.getClient()
      .from('planting_plans')
      .select('*')
      .eq('garden_id', gardenId)
      .gte('planned_planting_date', startDate)
      .lte('planned_planting_date', endDate)
      .order('planned_planting_date', { ascending: true })

    if (error) throw error

    // Group by date
    const grouped = new Map<string, PlantingPlan[]>()
    
    for (const plan of data || []) {
      const mapped = this.mapPlanFromDb(plan)
      const date = mapped.plannedPlantingDate
      
      if (!grouped.has(date)) {
        grouped.set(date, [])
      }
      grouped.get(date)!.push(mapped)
    }

    return Array.from(grouped.entries()).map(([date, plans]) => ({
      date,
      plans
    }))
  }

  // ===== MAPPING =====

  private mapPlanFromDb(data: any): PlantingPlan {
    return {
      id: data.id,
      gardenId: data.garden_id,
      zoneId: data.zone_id,
      fieldRowId: data.field_row_id,
      fieldRowSectionId: data.field_row_section_id,
      plantVarietyId: data.plant_variety_id,
      plantName: data.plant_name,
      plantFamily: data.plant_family,
      quantity: data.quantity,
      plannedPlantingDate: data.planned_planting_date,
      plannedHarvestDate: data.planned_harvest_date,
      actualPlantingDate: data.actual_planting_date,
      actualHarvestDate: data.actual_harvest_date,
      status: data.status,
      rotationPlanId: data.rotation_plan_id,
      followsRotationAdvice: data.follows_rotation_advice,
      rotationScore: data.rotation_score,
      rotationWarnings: data.rotation_warnings,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  }
}

export const classicPlannerService = new ClassicPlannerService()
export default classicPlannerService
