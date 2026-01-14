/**
 * Composter Service
 * Servizio per gestire compostiere con validazione AI materiali
 */

import { getSupabaseClient } from '@/config/supabase'
import {
  Composter,
  ComposterAddition,
  ComposterMonitoring,
  ComposterType,
  ComposterStatus,
  MaterialType,
  CarbonNitrogenRatio,
  MoistureLevel,
  OdorType
} from '@/types/activeAIAdvice'

// Material C/N ratio classification
const MATERIAL_CN_RATIOS: Record<MaterialType, CarbonNitrogenRatio> = {
  'GREEN_WASTE': 'HIGH_NITROGEN',
  'BROWN_WASTE': 'HIGH_CARBON',
  'FOOD_SCRAPS': 'HIGH_NITROGEN',
  'MANURE': 'HIGH_NITROGEN',
  'PAPER': 'HIGH_CARBON',
  'CARDBOARD': 'HIGH_CARBON',
  'WOOD_CHIPS': 'HIGH_CARBON',
  'LEAVES': 'HIGH_CARBON',
  'GRASS': 'HIGH_NITROGEN',
  'OTHER': 'BALANCED'
}

class ComposterService {
  private getClient() {
    const client = getSupabaseClient()
    if (!client) {
      throw new Error('Supabase client not available')
    }
    return client
  }

  // ===== COMPOSTER MANAGEMENT =====

  async createComposter(data: Partial<Composter>): Promise<Composter> {
    const { data: composter, error } = await this.getClient()
      .from('composters')
      .insert({
        garden_id: data.gardenId,
        name: data.name,
        type: data.type,
        capacity_liters: data.capacityLiters,
        location: data.location,
        status: data.status || 'ACTIVE',
        started_date: data.startedDate || new Date().toISOString().split('T')[0],
        estimated_ready_date: data.estimatedReadyDate,
        notes: data.notes
      })
      .select()
      .single()

    if (error) throw error
    return this.mapComposterFromDb(composter)
  }

  async getComposters(gardenId: string, status?: ComposterStatus): Promise<Composter[]> {
    let query = this.getClient()
      .from('composters')
      .select('*')
      .eq('garden_id', gardenId)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) throw error
    return (data || []).map(this.mapComposterFromDb)
  }

  async updateComposterStatus(
    composterId: string,
    status: ComposterStatus,
    estimatedReadyDate?: string
  ): Promise<Composter> {
    const updates: any = {
      status,
      updated_at: new Date().toISOString()
    }

    if (estimatedReadyDate) {
      updates.estimated_ready_date = estimatedReadyDate
    }

    const { data, error } = await this.getClient()
      .from('composters')
      .update(updates)
      .eq('id', composterId)
      .select()
      .single()

    if (error) throw error
    return this.mapComposterFromDb(data)
  }

  // ===== MATERIAL ADDITION =====

  async addMaterial(data: Partial<ComposterAddition>): Promise<{
    addition: ComposterAddition
    validation: {
      isSafe: boolean
      warning?: string
      recommendation?: string
    }
  }> {
    // AI Validation
    const validation = await this.validateMaterial(
      data.materialDescription || '',
      data.isDiseased || false,
      data.isTreatedChemically || false
    )

    // Determine C/N ratio
    const cnRatio = data.materialType ? MATERIAL_CN_RATIOS[data.materialType] : 'BALANCED'

    const { data: addition, error } = await this.getClient()
      .from('composter_additions')
      .insert({
        composter_id: data.composterId,
        material_type: data.materialType,
        material_description: data.materialDescription,
        quantity_kg: data.quantityKg,
        carbon_nitrogen_ratio: cnRatio,
        is_diseased: data.isDiseased || false,
        disease_type: data.diseaseType,
        is_treated_chemically: data.isTreatedChemically || false,
        treatment_type: data.treatmentType,
        ai_validated: true,
        ai_warning: validation.warning,
        ai_recommendation: validation.recommendation,
        added_date: data.addedDate || new Date().toISOString().split('T')[0],
        added_by: data.addedBy,
        notes: data.notes
      })
      .select()
      .single()

    if (error) throw error

    // Update composter status if needed
    await this.updateComposterStatusBasedOnAdditions(data.composterId!)

    return {
      addition: this.mapAdditionFromDb(addition),
      validation
    }
  }

  async validateMaterial(
    materialDescription: string,
    isDiseased: boolean,
    isTreatedChemically: boolean
  ): Promise<{
    isSafe: boolean
    warning?: string
    recommendation?: string
  }> {
    const warnings: string[] = []
    const recommendations: string[] = []

    // Check for diseased material
    if (isDiseased) {
      warnings.push('⚠️ ATTENZIONE: Materiale infetto rilevato')
      recommendations.push('NON aggiungere al compost - rischio diffusione malattie')
      recommendations.push('Smaltire separatamente o bruciare se consentito')
      recommendations.push('Disinfettare attrezzi dopo manipolazione')
    }

    // Check for chemically treated material
    if (isTreatedChemically) {
      warnings.push('⚠️ ATTENZIONE: Materiale trattato chimicamente')
      recommendations.push('Evitare per compost biologico')
      recommendations.push('Residui chimici possono persistere nel compost')
      recommendations.push('Usare solo materiale non trattato per certificazione BIO')
    }

    // Additional AI checks based on description
    const lowerDesc = materialDescription.toLowerCase()
    
    if (lowerDesc.includes('malat') || lowerDesc.includes('infett')) {
      warnings.push('⚠️ Possibile materiale malato rilevato nella descrizione')
      recommendations.push('Verificare stato sanitario prima di aggiungere')
    }

    if (lowerDesc.includes('trattato') || lowerDesc.includes('pesticid') || lowerDesc.includes('erbicid')) {
      warnings.push('⚠️ Possibile trattamento chimico rilevato nella descrizione')
      recommendations.push('Confermare assenza trattamenti recenti')
    }

    const isSafe = !isDiseased && !isTreatedChemically

    return {
      isSafe,
      warning: warnings.length > 0 ? warnings.join('\n') : undefined,
      recommendation: recommendations.length > 0 ? recommendations.join('\n') : undefined
    }
  }

  async getAdditions(composterId: string, limit?: number): Promise<ComposterAddition[]> {
    let query = this.getClient()
      .from('composter_additions')
      .select('*')
      .eq('composter_id', composterId)
      .order('added_date', { ascending: false })

    if (limit) {
      query = query.limit(limit)
    }

    const { data, error } = await query

    if (error) throw error
    return (data || []).map(this.mapAdditionFromDb)
  }

  private async updateComposterStatusBasedOnAdditions(composterId: string): Promise<void> {
    // Get composter
    const { data: composter } = await this.getClient()
      .from('composters')
      .select('capacity_liters')
      .eq('id', composterId)
      .single()

    if (!composter) return

    // Get total additions
    const { data: additions } = await this.getClient()
      .from('composter_additions')
      .select('quantity_kg')
      .eq('composter_id', composterId)

    const totalKg = (additions || []).reduce((sum, a) => sum + (a.quantity_kg || 0), 0)
    
    // Rough estimate: 1 liter ≈ 0.5 kg of compost material
    const estimatedLiters = totalKg * 2
    const fillPercentage = (estimatedLiters / composter.capacity_liters) * 100

    let newStatus: ComposterStatus = 'ACTIVE'
    if (fillPercentage >= 90) {
      newStatus = 'FULL'
    } else if (fillPercentage >= 70) {
      newStatus = 'MATURING'
    }

    await this.updateComposterStatus(composterId, newStatus)
  }

  // ===== MONITORING =====

  async recordMonitoring(data: Partial<ComposterMonitoring>): Promise<ComposterMonitoring> {
    // Calculate AI health score
    const healthScore = this.calculateHealthScore(
      data.temperatureCelsius,
      data.moistureLevel,
      data.odor
    )

    // Generate AI recommendations
    const recommendations = this.generateRecommendations(
      data.temperatureCelsius,
      data.moistureLevel,
      data.odor,
      data.turned || false
    )

    const { data: monitoring, error } = await this.getClient()
      .from('composter_monitoring')
      .insert({
        composter_id: data.composterId,
        temperature_celsius: data.temperatureCelsius,
        moisture_level: data.moistureLevel,
        odor: data.odor,
        turned: data.turned || false,
        watered: data.watered || false,
        material_added: data.materialAdded || false,
        observations: data.observations,
        issues: data.issues,
        actions_taken: data.actionsTaken,
        ai_health_score: healthScore,
        ai_recommendations: recommendations,
        monitoring_date: data.monitoringDate || new Date().toISOString().split('T')[0],
        monitored_by: data.monitoredBy
      })
      .select()
      .single()

    if (error) throw error
    return this.mapMonitoringFromDb(monitoring)
  }

  async getMonitoring(composterId: string, limit?: number): Promise<ComposterMonitoring[]> {
    let query = this.getClient()
      .from('composter_monitoring')
      .select('*')
      .eq('composter_id', composterId)
      .order('monitoring_date', { ascending: false })

    if (limit) {
      query = query.limit(limit)
    }

    const { data, error } = await query

    if (error) throw error
    return (data || []).map(this.mapMonitoringFromDb)
  }

  private calculateHealthScore(
    temperature?: number,
    moisture?: MoistureLevel,
    odor?: OdorType
  ): number {
    let score = 50 // Base score

    // Temperature scoring (optimal: 55-65°C)
    if (temperature) {
      if (temperature >= 55 && temperature <= 65) {
        score += 30 // Optimal
      } else if (temperature >= 45 && temperature <= 75) {
        score += 20 // Good
      } else if (temperature >= 35 && temperature <= 85) {
        score += 10 // Acceptable
      } else {
        score -= 10 // Poor
      }
    }

    // Moisture scoring
    if (moisture === 'OPTIMAL') {
      score += 20
    } else if (moisture === 'TOO_DRY' || moisture === 'TOO_WET') {
      score -= 10
    }

    // Odor scoring
    if (odor === 'EARTHY' || odor === 'NONE') {
      score += 20
    } else if (odor === 'AMMONIA') {
      score -= 15 // Too much nitrogen
    } else if (odor === 'ROTTEN') {
      score -= 25 // Anaerobic conditions
    }

    return Math.max(0, Math.min(100, score))
  }

  private generateRecommendations(
    temperature?: number,
    moisture?: MoistureLevel,
    odor?: OdorType,
    turned?: boolean
  ): string[] {
    const recommendations: string[] = []

    // Temperature recommendations
    if (temperature) {
      if (temperature < 35) {
        recommendations.push('🌡️ Temperatura troppo bassa - aggiungere materiale verde (azoto)')
        recommendations.push('Rivoltare per aumentare attività microbica')
      } else if (temperature > 75) {
        recommendations.push('🌡️ Temperatura troppo alta - rivoltare per raffreddare')
        recommendations.push('Aggiungere materiale marrone (carbonio)')
      } else if (temperature >= 55 && temperature <= 65) {
        recommendations.push('✅ Temperatura ottimale - compostaggio attivo')
      }
    }

    // Moisture recommendations
    if (moisture === 'TOO_DRY') {
      recommendations.push('💧 Troppo secco - innaffiare leggermente')
      recommendations.push('Aggiungere materiali umidi (scarti verdi)')
    } else if (moisture === 'TOO_WET') {
      recommendations.push('💧 Troppo umido - aggiungere materiale secco (foglie, cartone)')
      recommendations.push('Rivoltare per aerare e far evaporare eccesso')
    } else if (moisture === 'OPTIMAL') {
      recommendations.push('✅ Umidità ottimale - mantenere così')
    }

    // Odor recommendations
    if (odor === 'AMMONIA') {
      recommendations.push('👃 Odore di ammoniaca - troppo azoto')
      recommendations.push('Aggiungere materiale marrone (foglie secche, cartone)')
      recommendations.push('Rivoltare per aerare')
    } else if (odor === 'ROTTEN') {
      recommendations.push('👃 Odore marcio - condizioni anaerobiche')
      recommendations.push('URGENTE: Rivoltare immediatamente per aerare')
      recommendations.push('Aggiungere materiale secco per assorbire umidità')
    } else if (odor === 'EARTHY') {
      recommendations.push('✅ Odore di terra - compost sano')
    }

    // Turning recommendations
    if (!turned) {
      recommendations.push('🔄 Consigliato rivoltare per aerazione')
    }

    // General recommendations
    if (recommendations.length === 0) {
      recommendations.push('✅ Compost in buone condizioni')
      recommendations.push('Continuare monitoraggio regolare')
    }

    return recommendations
  }

  // ===== STATISTICS =====

  async getComposterStats(composterId: string): Promise<{
    totalAdditionsKg: number
    additionsCount: number
    averageHealthScore: number
    lastMonitoring?: ComposterMonitoring
    cnBalance: {
      highCarbon: number
      highNitrogen: number
      balanced: number
    }
  }> {
    // Get additions
    const additions = await this.getAdditions(composterId)
    const totalKg = additions.reduce((sum, a) => sum + a.quantityKg, 0)

    // Get monitoring
    const monitoring = await this.getMonitoring(composterId, 10)
    const avgHealthScore = monitoring.length > 0
      ? monitoring.reduce((sum, m) => sum + (m.aiHealthScore || 0), 0) / monitoring.length
      : 0

    // Calculate C/N balance
    const cnBalance = {
      highCarbon: additions.filter(a => a.carbonNitrogenRatio === 'HIGH_CARBON').length,
      highNitrogen: additions.filter(a => a.carbonNitrogenRatio === 'HIGH_NITROGEN').length,
      balanced: additions.filter(a => a.carbonNitrogenRatio === 'BALANCED').length
    }

    return {
      totalAdditionsKg: totalKg,
      additionsCount: additions.length,
      averageHealthScore: Math.round(avgHealthScore),
      lastMonitoring: monitoring[0],
      cnBalance
    }
  }

  // ===== MAPPING METHODS =====

  private mapComposterFromDb(data: any): Composter {
    return {
      id: data.id,
      gardenId: data.garden_id,
      name: data.name,
      type: data.type,
      capacityLiters: data.capacity_liters,
      location: data.location,
      status: data.status,
      startedDate: data.started_date,
      estimatedReadyDate: data.estimated_ready_date,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  }

  private mapAdditionFromDb(data: any): ComposterAddition {
    return {
      id: data.id,
      composterId: data.composter_id,
      materialType: data.material_type,
      materialDescription: data.material_description,
      quantityKg: data.quantity_kg,
      carbonNitrogenRatio: data.carbon_nitrogen_ratio,
      isDiseased: data.is_diseased,
      diseaseType: data.disease_type,
      isTreatedChemically: data.is_treated_chemically,
      treatmentType: data.treatment_type,
      aiValidated: data.ai_validated,
      aiWarning: data.ai_warning,
      aiRecommendation: data.ai_recommendation,
      addedDate: data.added_date,
      addedBy: data.added_by,
      notes: data.notes,
      createdAt: data.created_at
    }
  }

  private mapMonitoringFromDb(data: any): ComposterMonitoring {
    return {
      id: data.id,
      composterId: data.composter_id,
      temperatureCelsius: data.temperature_celsius,
      moistureLevel: data.moisture_level,
      odor: data.odor,
      turned: data.turned,
      watered: data.watered,
      materialAdded: data.material_added,
      observations: data.observations,
      issues: data.issues,
      actionsTaken: data.actions_taken,
      aiHealthScore: data.ai_health_score,
      aiRecommendations: data.ai_recommendations,
      monitoringDate: data.monitoring_date,
      monitoredBy: data.monitored_by,
      createdAt: data.created_at
    }
  }
}

export const composterService = new ComposterService()
export default composterService
