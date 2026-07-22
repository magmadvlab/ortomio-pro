/**
 * Winter Protection Service
 * Servizio per gestire protezione invernale con trigger automatici da meteo
 */

import { getSupabaseClient } from '@/config/supabase'
import {
  WinterProtectionChecklist,
  WinterProtectionTask,
  WinterProtectionTrigger,
  ProtectionType,
  ProtectionUrgency,
  ProtectionEffectiveness,
  ChecklistStatus
} from '@/types/activeAIAdvice'

// Protection type recommendations based on temperature
const PROTECTION_RECOMMENDATIONS: Record<string, {
  type: ProtectionType
  description: string
  materials: string[]
}> = {
  'LIGHT_FROST': {
    type: 'FROST_CLOTH',
    description: 'Tessuto non tessuto per gelate leggere',
    materials: ['Tessuto non tessuto', 'Picchetti', 'Corde']
  },
  'MODERATE_FROST': {
    type: 'ROW_COVER',
    description: 'Coperture per filari con supporti',
    materials: ['Tessuto non tessuto doppio strato', 'Archi di supporto', 'Clips', 'Pesi']
  },
  'SEVERE_FROST': {
    type: 'COLD_FRAME',
    description: 'Tunnel freddi o mini-serre',
    materials: ['Film plastico', 'Archi metallici', 'Tessuto non tessuto', 'Paglia per pacciamatura']
  },
  'EXTREME_FROST': {
    type: 'GREENHOUSE',
    description: 'Protezione in serra riscaldata',
    materials: ['Serra', 'Riscaldamento', 'Isolamento termico']
  }
}

// Default tasks for each protection type
const DEFAULT_TASKS: Record<ProtectionType, Array<{
  title: string
  description: string
  materials: string[]
  estimatedTime: number
}>> = {
  'FROST_CLOTH': [
    {
      title: 'Preparare tessuto non tessuto',
      description: 'Verificare disponibilità e condizioni del tessuto',
      materials: ['Tessuto non tessuto', 'Forbici'],
      estimatedTime: 15
    },
    {
      title: 'Coprire piante sensibili',
      description: 'Coprire pomodori, peperoni, melanzane, basilico',
      materials: ['Tessuto non tessuto', 'Picchetti', 'Corde'],
      estimatedTime: 45
    },
    {
      title: 'Fissare coperture',
      description: 'Assicurare che il tessuto sia ben fissato al suolo',
      materials: ['Pesi', 'Picchetti', 'Corde'],
      estimatedTime: 20
    },
    {
      title: 'Verificare copertura completa',
      description: 'Controllare che tutte le piante siano protette',
      materials: [],
      estimatedTime: 10
    }
  ],
  'MULCHING': [
    {
      title: 'Preparare materiale pacciamante',
      description: 'Raccogliere paglia, foglie secche o compost',
      materials: ['Paglia', 'Foglie secche', 'Compost'],
      estimatedTime: 30
    },
    {
      title: 'Applicare pacciamatura',
      description: 'Stendere strato di 10-15 cm attorno alle piante',
      materials: ['Paglia', 'Rastrello', 'Guanti'],
      estimatedTime: 60
    },
    {
      title: 'Proteggere colletto piante',
      description: 'Assicurare protezione alla base delle piante',
      materials: ['Paglia', 'Foglie'],
      estimatedTime: 20
    }
  ],
  'ROW_COVER': [
    {
      title: 'Installare archi di supporto',
      description: 'Posizionare archi metallici o PVC lungo i filari',
      materials: ['Archi', 'Picchetti', 'Martello'],
      estimatedTime: 45
    },
    {
      title: 'Stendere tessuto protettivo',
      description: 'Coprire archi con tessuto non tessuto doppio strato',
      materials: ['Tessuto non tessuto', 'Clips'],
      estimatedTime: 30
    },
    {
      title: 'Fissare lateralmente',
      description: 'Chiudere i lati per evitare ingresso aria fredda',
      materials: ['Clips', 'Pesi', 'Corde'],
      estimatedTime: 25
    },
    {
      title: 'Verificare stabilità',
      description: 'Controllare che la struttura sia stabile al vento',
      materials: [],
      estimatedTime: 10
    }
  ],
  'COLD_FRAME': [
    {
      title: 'Assemblare tunnel freddo',
      description: 'Montare struttura con archi e film plastico',
      materials: ['Archi metallici', 'Film plastico', 'Clips', 'Corde'],
      estimatedTime: 90
    },
    {
      title: 'Aggiungere strato isolante',
      description: 'Applicare tessuto non tessuto sotto il film',
      materials: ['Tessuto non tessuto', 'Clips'],
      estimatedTime: 30
    },
    {
      title: 'Pacciamare interno',
      description: 'Stendere paglia sul terreno interno',
      materials: ['Paglia', 'Rastrello'],
      estimatedTime: 20
    },
    {
      title: 'Verificare chiusure',
      description: 'Controllare che non ci siano aperture',
      materials: [],
      estimatedTime: 15
    }
  ],
  'GREENHOUSE': [
    {
      title: 'Trasferire piante in serra',
      description: 'Spostare piante sensibili nella serra',
      materials: ['Carrello', 'Vasi'],
      estimatedTime: 60
    },
    {
      title: 'Attivare riscaldamento',
      description: 'Impostare temperatura minima 5°C',
      materials: ['Riscaldatore'],
      estimatedTime: 10
    },
    {
      title: 'Verificare isolamento',
      description: 'Controllare chiusure e isolamento serra',
      materials: ['Nastro isolante'],
      estimatedTime: 30
    }
  ],
  'CLOCHES': [
    {
      title: 'Posizionare campane protettive',
      description: 'Coprire singole piante con campane o bottiglie',
      materials: ['Campane', 'Bottiglie plastica', 'Pesi'],
      estimatedTime: 45
    },
    {
      title: 'Fissare al suolo',
      description: 'Assicurare che non vengano spostate dal vento',
      materials: ['Pesi', 'Picchetti'],
      estimatedTime: 15
    }
  ],
  'SOIL_COVER': [
    {
      title: 'Coprire terreno nudo',
      description: 'Proteggere terreno con teli o pacciamatura',
      materials: ['Teli', 'Paglia', 'Pesi'],
      estimatedTime: 40
    }
  ],
  'PRUNING': [
    {
      title: 'Potare parti sensibili',
      description: 'Rimuovere parti aeree che potrebbero danneggiarsi',
      materials: ['Forbici da potatura', 'Guanti'],
      estimatedTime: 30
    }
  ],
  'OTHER': [
    {
      title: 'Applicare protezione personalizzata',
      description: 'Implementare metodo di protezione specifico',
      materials: [],
      estimatedTime: 60
    }
  ]
}

class WinterProtectionService {
  private getClient() {
    const client = getSupabaseClient()
    if (!client) {
      throw new Error('Supabase client not available')
    }
    return client
  }

  // ===== CHECKLIST MANAGEMENT =====

  async createChecklist(data: Partial<WinterProtectionChecklist>): Promise<WinterProtectionChecklist> {
    const { data: checklist, error } = await this.getClient()
      .from('winter_protection_checklists')
      .insert({
        garden_id: data.gardenId,
        zone_id: data.zoneId,
        field_row_id: data.fieldRowId,
        triggered_by: data.triggeredBy || 'MANUAL',
        trigger_details: data.triggerDetails,
        protection_type: data.protectionType,
        urgency: data.urgency || 'MEDIUM',
        frost_date: data.frostDate,
        min_temperature_expected: data.minTemperatureExpected,
        status: data.status || 'PENDING',
        due_date: data.dueDate,
        notes: data.notes
      })
      .select()
      .single()

    if (error) throw error
    return this.mapChecklistFromDb(checklist)
  }

  async createFromWeatherForecast(
    gardenId: string,
    minTemperature: number,
    frostDate: string,
    weatherSource?: string
  ): Promise<WinterProtectionChecklist> {
    // Determine urgency and protection type
    const urgency = this.calculateUrgency(minTemperature, frostDate)
    const protectionType = this.recommendProtectionType(minTemperature)
    
    // Calculate due date (1 day before frost)
    const dueDate = new Date(frostDate)
    dueDate.setDate(dueDate.getDate() - 1)

    // Create checklist
    const checklist = await this.createChecklist({
      gardenId,
      triggeredBy: 'WEATHER_FORECAST',
      triggerDetails: {
        minTemperature,
        frostDate,
        weatherSource: weatherSource || 'Weather API'
      },
      protectionType,
      urgency,
      frostDate,
      minTemperatureExpected: minTemperature,
      dueDate: dueDate.toISOString().split('T')[0]
    })

    // Create default tasks
    await this.createDefaultTasks(checklist.id, protectionType)

    return checklist
  }

  private calculateUrgency(minTemperature: number, frostDate: string): ProtectionUrgency {
    const daysUntilFrost = Math.ceil(
      (new Date(frostDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    )

    if (minTemperature <= -5) return 'CRITICAL'
    if (minTemperature <= -2) return 'HIGH'
    if (minTemperature <= 0) return 'MEDIUM'
    return 'LOW'
  }

  private recommendProtectionType(minTemperature: number): ProtectionType {
    if (minTemperature <= -10) return 'GREENHOUSE'
    if (minTemperature <= -5) return 'COLD_FRAME'
    if (minTemperature <= -2) return 'ROW_COVER'
    return 'FROST_CLOTH'
  }

  async getChecklists(
    gardenId: string,
    filters?: {
      status?: ChecklistStatus
      urgency?: ProtectionUrgency
      activeOnly?: boolean
    }
  ): Promise<WinterProtectionChecklist[]> {
    let query = this.getClient()
      .from('winter_protection_checklists')
      .select('*')
      .eq('garden_id', gardenId)
      .order('due_date', { ascending: true })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.urgency) {
      query = query.eq('urgency', filters.urgency)
    }
    if (filters?.activeOnly) {
      query = query.in('status', ['PENDING', 'IN_PROGRESS'])
    }

    const { data, error } = await query

    if (error) throw error
    return (data || []).map(this.mapChecklistFromDb)
  }

  async updateChecklistStatus(
    checklistId: string,
    status: ChecklistStatus,
    completedBy: string,
    data?: {
      effectiveness?: ProtectionEffectiveness
      damageAssessment?: string
      notes?: string
      photos?: string[]
    }
  ): Promise<WinterProtectionChecklist> {
    const updates: any = {
      status,
      updated_at: new Date().toISOString()
    }

    if (status === 'COMPLETED') {
      updates.completed_date = new Date().toISOString().split('T')[0]
      updates.completed_by = completedBy
    }

    if (data?.effectiveness) updates.effectiveness = data.effectiveness
    if (data?.damageAssessment) updates.damage_assessment = data.damageAssessment
    if (data?.notes) updates.notes = data.notes
    if (data?.photos) updates.photos = data.photos

    const { data: checklist, error } = await this.getClient()
      .from('winter_protection_checklists')
      .update(updates)
      .eq('id', checklistId)
      .select()
      .single()

    if (error) throw error
    return this.mapChecklistFromDb(checklist)
  }

  // ===== TASK MANAGEMENT =====

  async createTask(data: Partial<WinterProtectionTask>): Promise<WinterProtectionTask> {
    const { data: task, error } = await this.getClient()
      .from('winter_protection_tasks')
      .insert({
        checklist_id: data.checklistId,
        title: data.title,
        description: data.description,
        order_index: data.orderIndex || 0,
        materials_needed: data.materialsNeeded,
        estimated_time_minutes: data.estimatedTimeMinutes,
        status: data.status || 'PENDING'
      })
      .select()
      .single()

    if (error) throw error
    return this.mapTaskFromDb(task)
  }

  private async createDefaultTasks(
    checklistId: string,
    protectionType: ProtectionType
  ): Promise<void> {
    const taskTemplates = DEFAULT_TASKS[protectionType] || DEFAULT_TASKS['OTHER']

    for (let i = 0; i < taskTemplates.length; i++) {
      const template = taskTemplates[i]
      await this.createTask({
        checklistId,
        title: template.title,
        description: template.description,
        materialsNeeded: template.materials,
        estimatedTimeMinutes: template.estimatedTime,
        orderIndex: i
      })
    }
  }

  async getTasks(checklistId: string): Promise<WinterProtectionTask[]> {
    const { data, error } = await this.getClient()
      .from('winter_protection_tasks')
      .select('*')
      .eq('checklist_id', checklistId)
      .order('order_index', { ascending: true })

    if (error) throw error
    return (data || []).map(this.mapTaskFromDb)
  }

  async updateTaskStatus(
    taskId: string,
    status: ChecklistStatus,
    completedBy: string,
    data?: {
      notes?: string
      photos?: string[]
    }
  ): Promise<WinterProtectionTask> {
    const updates: any = {
      status,
      updated_at: new Date().toISOString()
    }

    if (status === 'COMPLETED') {
      updates.completed_date = new Date().toISOString().split('T')[0]
      updates.completed_by = completedBy
    }

    if (data?.notes) updates.notes = data.notes
    if (data?.photos) updates.photos = data.photos

    const { data: task, error } = await this.getClient()
      .from('winter_protection_tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single()

    if (error) throw error

    // Update parent checklist status if all tasks completed
    await this.updateParentChecklistStatus(task.checklist_id, completedBy)

    return this.mapTaskFromDb(task)
  }

  private async updateParentChecklistStatus(checklistId: string, completedBy: string): Promise<void> {
    const tasks = await this.getTasks(checklistId)

    const allCompleted = tasks.every(t => t.status === 'COMPLETED')
    const anyInProgress = tasks.some(t => t.status === 'IN_PROGRESS')
    const anyFailed = tasks.some(t => t.status === 'FAILED')

    let newStatus: ChecklistStatus = 'PENDING'
    if (allCompleted) {
      newStatus = 'COMPLETED'
    } else if (anyFailed) {
      newStatus = 'FAILED'
    } else if (anyInProgress) {
      newStatus = 'IN_PROGRESS'
    }

    await this.updateChecklistStatus(checklistId, newStatus, completedBy)
  }

  // ===== SEASONAL REPORTS =====

  async getSeasonalReport(
    gardenId: string,
    season: string
  ): Promise<{
    totalChecklists: number
    completedChecklists: number
    averageEffectiveness: number
    totalDamageEvents: number
    protectionTypeUsage: Record<ProtectionType, number>
    recommendations: string[]
  }> {
    // Get all checklists for the season
    const { data, error } = await this.getClient()
      .from('winter_protection_checklists')
      .select('*')
      .eq('garden_id', gardenId)
      .gte('frost_date', `${season}-10-01`)
      .lte('frost_date', `${parseInt(season) + 1}-03-31`)

    if (error) throw error

    const checklists = (data || []).map(this.mapChecklistFromDb)
    const completed = checklists.filter(c => c.status === 'COMPLETED')

    // Calculate effectiveness
    const withEffectiveness = completed.filter(c => c.effectiveness)
    const effectivenessScores = {
      'EXCELLENT': 100,
      'GOOD': 75,
      'FAIR': 50,
      'POOR': 25,
      'FAILED': 0
    }
    const avgEffectiveness = withEffectiveness.length > 0
      ? withEffectiveness.reduce((sum, c) => sum + effectivenessScores[c.effectiveness!], 0) / withEffectiveness.length
      : 0

    // Count damage events
    const damageEvents = checklists.filter(c => 
      c.effectiveness === 'POOR' || c.effectiveness === 'FAILED'
    ).length

    // Protection type usage
    const protectionTypeUsage = checklists.reduce((acc, c) => {
      acc[c.protectionType] = (acc[c.protectionType] || 0) + 1
      return acc
    }, {} as Record<ProtectionType, number>)

    // Generate recommendations
    const recommendations = this.generateSeasonalRecommendations(
      checklists,
      avgEffectiveness,
      protectionTypeUsage
    )

    return {
      totalChecklists: checklists.length,
      completedChecklists: completed.length,
      averageEffectiveness: Math.round(avgEffectiveness),
      totalDamageEvents: damageEvents,
      protectionTypeUsage,
      recommendations
    }
  }

  private generateSeasonalRecommendations(
    checklists: WinterProtectionChecklist[],
    avgEffectiveness: number,
    protectionTypeUsage: Record<ProtectionType, number>
  ): string[] {
    const recommendations: string[] = []

    if (avgEffectiveness < 60) {
      recommendations.push('⚠️ Efficacia protezioni sotto media - considerare metodi più robusti')
    }

    const mostUsed = Object.entries(protectionTypeUsage)
      .sort(([, a], [, b]) => b - a)[0]

    if (mostUsed && mostUsed[0] === 'FROST_CLOTH') {
      recommendations.push('💡 Considerare tunnel freddi per protezione più duratura')
    }

    const failedChecklists = checklists.filter(c => c.effectiveness === 'FAILED')
    if (failedChecklists.length > 0) {
      recommendations.push('📋 Analizzare cause fallimenti per migliorare strategie future')
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ Buona gestione protezioni invernali')
      recommendations.push('Continuare con le strategie attuali')
    }

    return recommendations
  }

  // ===== MAPPING METHODS =====

  private mapChecklistFromDb(data: any): WinterProtectionChecklist {
    return {
      id: data.id,
      gardenId: data.garden_id,
      zoneId: data.zone_id,
      fieldRowId: data.field_row_id,
      triggeredBy: data.triggered_by,
      triggerDetails: data.trigger_details,
      protectionType: data.protection_type,
      urgency: data.urgency,
      frostDate: data.frost_date,
      minTemperatureExpected: data.min_temperature_expected,
      status: data.status,
      dueDate: data.due_date,
      completedDate: data.completed_date,
      completedBy: data.completed_by,
      effectiveness: data.effectiveness,
      damageAssessment: data.damage_assessment,
      notes: data.notes,
      photos: data.photos,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  }

  private mapTaskFromDb(data: any): WinterProtectionTask {
    return {
      id: data.id,
      checklistId: data.checklist_id,
      title: data.title,
      description: data.description,
      orderIndex: data.order_index,
      materialsNeeded: data.materials_needed,
      estimatedTimeMinutes: data.estimated_time_minutes,
      status: data.status,
      completedDate: data.completed_date,
      completedBy: data.completed_by,
      notes: data.notes,
      photos: data.photos,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  }
}

export const winterProtectionService = new WinterProtectionService()
export default winterProtectionService
