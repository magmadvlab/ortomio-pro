/**
 * Biological Control Service
 * Servizio per gestire checklist di controllo biologico per certificazioni
 */

import { getSupabaseClient } from '@/config/supabase'
import {
  BiologicalControlChecklist,
  BiologicalControlSubtask,
  BiologicalControlCategory,
  ChecklistFrequency,
  ChecklistStatus,
  ChecklistPriority
} from '@/types/activeAIAdvice'

// Predefined checklist templates
const CHECKLIST_TEMPLATES = {
  INSETTI_BENEFICI: {
    title: 'Introduzione Insetti Benefici',
    description: 'Monitoraggio e introduzione di insetti utili per controllo biologico',
    subtasks: [
      { title: 'Identificare parassiti target', description: 'Identificare quali parassiti necessitano controllo' },
      { title: 'Selezionare insetti benefici', description: 'Scegliere predatori/parassitoidi appropriati' },
      { title: 'Preparare habitat', description: 'Creare condizioni favorevoli per insetti benefici' },
      { title: 'Introdurre insetti', description: 'Rilasciare insetti benefici nelle aree target' },
      { title: 'Monitorare efficacia', description: 'Verificare riduzione parassiti e presenza benefici' }
    ],
    frequency: 'MONTHLY' as ChecklistFrequency,
    priority: 'HIGH' as ChecklistPriority,
    certificationTypes: ['BIO', 'GLOBALGAP']
  },
  TRAPPOLE: {
    title: 'Installazione e Monitoraggio Trappole',
    description: 'Gestione trappole per monitoraggio e cattura massale',
    subtasks: [
      { title: 'Installare trappole cromatiche', description: 'Posizionare trappole gialle/blu per monitoraggio' },
      { title: 'Installare trappole feromoniche', description: 'Posizionare trappole con feromoni specifici' },
      { title: 'Verificare posizionamento', description: 'Controllare altezza e distanza corrette' },
      { title: 'Contare catture', description: 'Registrare numero e tipo di insetti catturati' },
      { title: 'Sostituire trappole', description: 'Cambiare trappole quando necessario' }
    ],
    frequency: 'WEEKLY' as ChecklistFrequency,
    priority: 'MEDIUM' as ChecklistPriority,
    certificationTypes: ['BIO', 'GLOBALGAP', 'INTEGRATED_PEST_MANAGEMENT']
  },
  BARRIERE_FISICHE: {
    title: 'Installazione Barriere Fisiche',
    description: 'Protezione fisica delle colture da parassiti',
    subtasks: [
      { title: 'Installare reti anti-insetto', description: 'Posizionare reti a maglia fine' },
      { title: 'Verificare integrità', description: 'Controllare assenza di buchi o aperture' },
      { title: 'Installare collari anti-lumache', description: 'Proteggere piante giovani' },
      { title: 'Verificare efficacia', description: 'Controllare riduzione danni' },
      { title: 'Manutenzione barriere', description: 'Riparare o sostituire barriere danneggiate' }
    ],
    frequency: 'BIWEEKLY' as ChecklistFrequency,
    priority: 'MEDIUM' as ChecklistPriority,
    certificationTypes: ['BIO']
  },
  MONITORAGGIO: {
    title: 'Monitoraggio Parassiti e Malattie',
    description: 'Ispezione regolare per rilevamento precoce',
    subtasks: [
      { title: 'Ispezionare foglie', description: 'Controllare pagina superiore e inferiore' },
      { title: 'Ispezionare fusti', description: 'Verificare presenza di uova o larve' },
      { title: 'Ispezionare frutti', description: 'Controllare danni o segni di infestazione' },
      { title: 'Registrare osservazioni', description: 'Documentare tipo e livello di infestazione' },
      { title: 'Valutare soglia intervento', description: 'Decidere se necessario intervento' }
    ],
    frequency: 'WEEKLY' as ChecklistFrequency,
    priority: 'HIGH' as ChecklistPriority,
    certificationTypes: ['BIO', 'GLOBALGAP', 'INTEGRATED_PEST_MANAGEMENT']
  }
}

class BiologicalControlService {
  private getClient() {
    const client = getSupabaseClient()
    if (!client) {
      throw new Error('Supabase client not available')
    }
    return client
  }

  // ===== CHECKLIST MANAGEMENT =====

  async createChecklist(data: Partial<BiologicalControlChecklist>): Promise<BiologicalControlChecklist> {
    const { data: checklist, error } = await this.getClient()
      .from('biological_control_checklists')
      .insert({
        garden_id: data.gardenId,
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority || 'MEDIUM',
        frequency: data.frequency || 'MONTHLY',
        applicable_months: data.applicableMonths,
        applicable_seasons: data.applicableSeasons,
        status: data.status || 'PENDING',
        due_date: data.dueDate,
        required_for_certification: data.requiredForCertification || false,
        certification_types: data.certificationTypes
      })
      .select()
      .single()

    if (error) throw error
    return this.mapChecklistFromDb(checklist)
  }

  async createFromTemplate(
    gardenId: string,
    category: BiologicalControlCategory,
    dueDate?: string
  ): Promise<BiologicalControlChecklist> {
    const template = CHECKLIST_TEMPLATES[category]
    if (!template) {
      throw new Error(`Template not found for category: ${category}`)
    }

    // Create main checklist
    const checklist = await this.createChecklist({
      gardenId,
      title: template.title,
      description: template.description,
      category,
      priority: template.priority,
      frequency: template.frequency,
      requiredForCertification: true,
      certificationTypes: template.certificationTypes,
      dueDate
    })

    // Create subtasks
    for (let i = 0; i < template.subtasks.length; i++) {
      const subtask = template.subtasks[i]
      await this.createSubtask({
        checklistId: checklist.id,
        title: subtask.title,
        description: subtask.description,
        orderIndex: i
      })
    }

    return checklist
  }

  async getChecklists(
    gardenId: string,
    filters?: {
      status?: ChecklistStatus
      category?: BiologicalControlCategory
      requiredForCertification?: boolean
    }
  ): Promise<BiologicalControlChecklist[]> {
    let query = this.getClient()
      .from('biological_control_checklists')
      .select('*')
      .eq('garden_id', gardenId)
      .order('due_date', { ascending: true, nullsFirst: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.category) {
      query = query.eq('category', filters.category)
    }
    if (filters?.requiredForCertification !== undefined) {
      query = query.eq('required_for_certification', filters.requiredForCertification)
    }

    const { data, error } = await query

    if (error) throw error
    return (data || []).map(this.mapChecklistFromDb)
  }

  async updateChecklistStatus(
    checklistId: string,
    status: ChecklistStatus,
    data?: {
      notes?: string
      effectivenessScore?: number
      evidencePhotos?: string[]
    }
  ): Promise<BiologicalControlChecklist> {
    const updates: any = {
      status,
      updated_at: new Date().toISOString()
    }

    if (status === 'COMPLETED') {
      updates.completed_date = new Date().toISOString().split('T')[0]
      updates.completed_by = 'Current User' // TODO: Get from auth
    }

    if (data?.notes) updates.notes = data.notes
    if (data?.effectivenessScore) updates.effectiveness_score = data.effectivenessScore
    if (data?.evidencePhotos) updates.evidence_photos = data.evidencePhotos

    const { data: checklist, error } = await this.getClient()
      .from('biological_control_checklists')
      .update(updates)
      .eq('id', checklistId)
      .select()
      .single()

    if (error) throw error
    return this.mapChecklistFromDb(checklist)
  }

  // ===== SUBTASK MANAGEMENT =====

  async createSubtask(data: Partial<BiologicalControlSubtask>): Promise<BiologicalControlSubtask> {
    const { data: subtask, error } = await this.getClient()
      .from('biological_control_subtasks')
      .insert({
        checklist_id: data.checklistId,
        title: data.title,
        description: data.description,
        order_index: data.orderIndex || 0,
        status: data.status || 'PENDING'
      })
      .select()
      .single()

    if (error) throw error
    return this.mapSubtaskFromDb(subtask)
  }

  async getSubtasks(checklistId: string): Promise<BiologicalControlSubtask[]> {
    const { data, error } = await this.getClient()
      .from('biological_control_subtasks')
      .select('*')
      .eq('checklist_id', checklistId)
      .order('order_index', { ascending: true })

    if (error) throw error
    return (data || []).map(this.mapSubtaskFromDb)
  }

  async updateSubtaskStatus(
    subtaskId: string,
    status: ChecklistStatus,
    data?: {
      notes?: string
      evidencePhotos?: string[]
    }
  ): Promise<BiologicalControlSubtask> {
    const updates: any = {
      status,
      updated_at: new Date().toISOString()
    }

    if (status === 'COMPLETED') {
      updates.completed_date = new Date().toISOString().split('T')[0]
      updates.completed_by = 'Current User' // TODO: Get from auth
    }

    if (data?.notes) updates.notes = data.notes
    if (data?.evidencePhotos) updates.evidence_photos = data.evidencePhotos

    const { data: subtask, error } = await this.getClient()
      .from('biological_control_subtasks')
      .update(updates)
      .eq('id', subtaskId)
      .select()
      .single()

    if (error) throw error

    // Update parent checklist status if all subtasks completed
    await this.updateParentChecklistStatus(subtask.checklist_id)

    return this.mapSubtaskFromDb(subtask)
  }

  private async updateParentChecklistStatus(checklistId: string): Promise<void> {
    const subtasks = await this.getSubtasks(checklistId)
    
    const allCompleted = subtasks.every(s => s.status === 'COMPLETED')
    const anyInProgress = subtasks.some(s => s.status === 'IN_PROGRESS')
    const anyFailed = subtasks.some(s => s.status === 'FAILED')

    let newStatus: ChecklistStatus = 'PENDING'
    if (allCompleted) {
      newStatus = 'COMPLETED'
    } else if (anyFailed) {
      newStatus = 'FAILED'
    } else if (anyInProgress) {
      newStatus = 'IN_PROGRESS'
    }

    await this.updateChecklistStatus(checklistId, newStatus)
  }

  // ===== CERTIFICATION REPORTS =====

  async getCertificationReport(
    gardenId: string,
    certificationType: string,
    startDate: string,
    endDate: string
  ): Promise<{
    totalChecklists: number
    completedChecklists: number
    completionRate: number
    checklists: BiologicalControlChecklist[]
  }> {
    const { data, error } = await this.getClient()
      .from('biological_control_checklists')
      .select('*')
      .eq('garden_id', gardenId)
      .eq('required_for_certification', true)
      .contains('certification_types', [certificationType])
      .gte('created_at', startDate)
      .lte('created_at', endDate)

    if (error) throw error

    const checklists = (data || []).map(this.mapChecklistFromDb)
    const completed = checklists.filter(c => c.status === 'COMPLETED')

    return {
      totalChecklists: checklists.length,
      completedChecklists: completed.length,
      completionRate: checklists.length > 0 ? (completed.length / checklists.length) * 100 : 0,
      checklists
    }
  }

  // ===== RECURRING CHECKLISTS =====

  async createRecurringChecklists(gardenId: string): Promise<void> {
    const now = new Date()
    const currentMonth = now.getMonth() + 1

    // Create monthly checklists
    for (const [category, template] of Object.entries(CHECKLIST_TEMPLATES)) {
      if (template.frequency === 'MONTHLY') {
        const dueDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
        await this.createFromTemplate(
          gardenId,
          category as BiologicalControlCategory,
          dueDate.toISOString().split('T')[0]
        )
      }
    }
  }

  // ===== MAPPING METHODS =====

  private mapChecklistFromDb(data: any): BiologicalControlChecklist {
    return {
      id: data.id,
      gardenId: data.garden_id,
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority,
      frequency: data.frequency,
      applicableMonths: data.applicable_months,
      applicableSeasons: data.applicable_seasons,
      status: data.status,
      dueDate: data.due_date,
      completedDate: data.completed_date,
      completedBy: data.completed_by,
      notes: data.notes,
      effectivenessScore: data.effectiveness_score,
      evidencePhotos: data.evidence_photos,
      requiredForCertification: data.required_for_certification,
      certificationTypes: data.certification_types,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  }

  private mapSubtaskFromDb(data: any): BiologicalControlSubtask {
    return {
      id: data.id,
      checklistId: data.checklist_id,
      title: data.title,
      description: data.description,
      orderIndex: data.order_index,
      status: data.status,
      completedDate: data.completed_date,
      completedBy: data.completed_by,
      notes: data.notes,
      evidencePhotos: data.evidence_photos,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  }
}

export const biologicalControlService = new BiologicalControlService()
export default biologicalControlService
