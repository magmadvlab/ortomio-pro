/**
 * Unified Certifications Service
 * Servizio unificato per gestire tutte le certificazioni: HACCP, GlobalG.A.P., Biologico, etc.
 */

import { 
  BaseCertification, 
  CertificationType, 
  CertificationStatus,
  CertificationOverview,
  HACCPSystem,
  OrganicCertification,
  AuditSchedule,
  TrainingProgram,
  CertificationDocument,
  CertifiedSupplier,
  CertificationDeadline,
  CertificationActivity
} from '@/types/certifications'
import { getSupabaseClient } from '@/config/supabase'

class UnifiedCertificationsService {
  private certifications: Map<string, BaseCertification> = new Map()
  private haccpSystems: Map<string, HACCPSystem> = new Map()
  private organicCertifications: Map<string, OrganicCertification> = new Map()
  private auditSchedules: Map<string, AuditSchedule> = new Map()
  private trainingPrograms: Map<string, TrainingProgram> = new Map()
  private documents: Map<string, CertificationDocument> = new Map()
  private suppliers: Map<string, CertifiedSupplier> = new Map()

  // ===== CERTIFICATION OVERVIEW =====
  
  async getCertificationOverview(gardenId: string): Promise<CertificationOverview> {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase non configurato: la panoramica certificazioni richiede dati persistiti.')
    const [certResponse, auditResponse, activityResponse] = await Promise.all([
      supabase.from('certifications').select('id,type,status,valid_until').eq('garden_id', gardenId),
      supabase.from('audit_schedules').select('id,certification_type,audit_type,scheduled_date,status').eq('garden_id', gardenId),
      supabase.from('certification_evidence_events').select('id,certification_type,event_type,occurred_at,source_kind').eq('garden_id', gardenId).order('occurred_at', { ascending: false }).limit(20),
    ])
    if (certResponse.error) throw certResponse.error
    if (auditResponse.error) throw auditResponse.error
    if (activityResponse.error) throw activityResponse.error

    const certifications = (certResponse.data || []) as Array<{ type: CertificationType; status: CertificationStatus; valid_until: string | null }>
    const totalCertifications = certifications.length
    const activeCertifications = certifications.filter(cert => cert.status === 'COMPLIANT' || cert.status === 'IN_PROGRESS').length
    const now = new Date()
    const sixtyDays = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)
    const expiringSoon = certifications.filter(cert => cert.valid_until && new Date(cert.valid_until) > now && new Date(cert.valid_until) <= sixtyDays).length
    const nonCompliant = certifications.filter(cert => cert.status === 'NON_COMPLIANT' || cert.status === 'EXPIRED').length
    const certificationsByType = this.getCertificationsByType(certifications.map((cert, index) => ({
      id: `persisted-${index}`, gardenId, type: cert.type, status: cert.status, createdAt: '', updatedAt: '',
    } as BaseCertification)))
    const certificationDeadlines: CertificationDeadline[] = certifications.filter(cert => cert.valid_until).map(cert => ({
      certificationType: cert.type, description: `Scadenza record ${this.getCertificationTypeName(cert.type)}`,
      dueDate: cert.valid_until!, priority: new Date(cert.valid_until!) <= now ? 'CRITICAL' : 'HIGH',
      status: new Date(cert.valid_until!) <= now ? 'OVERDUE' : 'PENDING',
    }))
    const auditDeadlines: CertificationDeadline[] = (auditResponse.data || []).map(audit => ({
      certificationType: audit.certification_type as CertificationType,
      description: `Audit ${audit.audit_type}`, dueDate: audit.scheduled_date,
      priority: new Date(audit.scheduled_date) <= now ? 'CRITICAL' : 'MEDIUM',
      status: audit.status === 'COMPLETED' ? 'COMPLETED' : new Date(audit.scheduled_date) <= now ? 'OVERDUE' : 'PENDING',
    }))
    const upcomingDeadlines = [...certificationDeadlines, ...auditDeadlines].sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    const recentActivities: CertificationActivity[] = (activityResponse.data || []).map(event => ({
      id: event.id, certificationType: event.certification_type as CertificationType,
      activity: event.event_type, date: event.occurred_at, user: 'Operatore registrato',
      status: event.source_kind === 'simulated' || event.source_kind === 'demo' ? 'WARNING' : 'SUCCESS',
    }))

    return {
      gardenId,
      totalCertifications,
      activeCertifications,
      expiringSoon,
      nonCompliant,
      certificationsByType,
      upcomingDeadlines,
      recentActivities
    }
  }

  private getExpiringSoonCount(certifications: BaseCertification[]): number {
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    
    return certifications.filter(cert => {
      if (!cert.validUntil) return false
      const expiryDate = new Date(cert.validUntil)
      return expiryDate <= thirtyDaysFromNow && expiryDate > now
    }).length
  }

  private getCertificationsByType(certifications: BaseCertification[]): Record<CertificationType, CertificationStatus> {
    const result = {} as Record<CertificationType, CertificationStatus>
    
    // Initialize all types as NOT_STARTED
    const allTypes: CertificationType[] = [
      'GLOBALGAP', 'HACCP', 'ORGANIC_EU', 'ORGANIC_ICEA', 'ORGANIC_CCPB',
      'BRC', 'IFS', 'ISO22000', 'GRASP', 'RAINFOREST', 'FAIRTRADE'
    ]
    
    allTypes.forEach(type => {
      result[type] = 'NOT_STARTED'
    })

    // Update with actual statuses
    certifications.forEach(cert => {
      result[cert.type] = cert.status
    })

    return result
  }

  private async getUpcomingDeadlines(gardenId: string): Promise<CertificationDeadline[]> {
    const deadlines: CertificationDeadline[] = []
    const now = new Date()
    const sixtyDaysFromNow = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)

    // Check certification expiries
    const certifications = Array.from(this.certifications.values())
      .filter(cert => cert.gardenId === gardenId && cert.validUntil)

    certifications.forEach(cert => {
      const expiryDate = new Date(cert.validUntil!)
      if (expiryDate <= sixtyDaysFromNow && expiryDate > now) {
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
        
        deadlines.push({
          certificationType: cert.type,
          description: `Scadenza certificazione ${this.getCertificationTypeName(cert.type)}`,
          dueDate: cert.validUntil!,
          priority: daysUntilExpiry <= 15 ? 'CRITICAL' : daysUntilExpiry <= 30 ? 'HIGH' : 'MEDIUM',
          status: 'PENDING'
        })
      }
    })

    // Check audit schedules
    const audits = Array.from(this.auditSchedules.values())
      .filter(audit => audit.gardenId === gardenId)

    audits.forEach(audit => {
      const auditDate = new Date(audit.scheduledDate)
      if (auditDate <= sixtyDaysFromNow && auditDate > now) {
        const daysUntilAudit = Math.ceil((auditDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
        
        deadlines.push({
          certificationType: audit.certificationType,
          description: `Audit ${audit.auditType} ${this.getCertificationTypeName(audit.certificationType)}`,
          dueDate: audit.scheduledDate,
          priority: daysUntilAudit <= 7 ? 'CRITICAL' : daysUntilAudit <= 14 ? 'HIGH' : 'MEDIUM',
          status: audit.status === 'COMPLETED' ? 'COMPLETED' : 'PENDING'
        })
      }
    })

    return deadlines.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
  }

  private async getRecentActivities(gardenId: string): Promise<CertificationActivity[]> {
    // Mock implementation - in real app, this would come from audit logs
    return [
      {
        id: '1',
        certificationType: 'GLOBALGAP',
        activity: 'Completata checklist autocontrollo AF 2.2',
        date: new Date().toISOString(),
        user: 'Sistema',
        status: 'SUCCESS'
      },
      {
        id: '2',
        certificationType: 'HACCP',
        activity: 'Aggiornato piano HACCP',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        user: 'Admin',
        status: 'SUCCESS'
      }
    ]
  }

  // ===== HACCP MANAGEMENT =====

  async createHACCPSystem(gardenId: string, data: Partial<HACCPSystem>): Promise<HACCPSystem> {
    const id = this.generateId()
    const now = new Date().toISOString()
    
    const haccpSystem: HACCPSystem = {
      id,
      gardenId,
      teamLeader: data.teamLeader || '',
      teamMembers: data.teamMembers || [],
      hazardAnalysis: data.hazardAnalysis || [],
      criticalControlPoints: data.criticalControlPoints || [],
      monitoringProcedures: data.monitoringProcedures || [],
      correctiveActions: data.correctiveActions || [],
      verificationActivities: data.verificationActivities || [],
      recordKeeping: data.recordKeeping || {
        id: this.generateId(),
        monitoringRecords: [],
        correctiveActionRecords: [],
        verificationRecords: [],
        calibrationRecords: [],
        trainingRecords: [],
        retentionPeriod: '3 anni',
        storageLocation: 'Ufficio amministrativo',
        accessControl: 'Solo personale autorizzato'
      },
      status: data.status || 'IN_PROGRESS',
      lastReview: data.lastReview || now,
      nextReview: data.nextReview || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: now,
      updatedAt: now
    }

    this.haccpSystems.set(id, haccpSystem)

    // Create or update base certification
    await this.createOrUpdateBaseCertification(gardenId, 'HACCP', haccpSystem.status)

    return haccpSystem
  }

  async getHACCPSystem(gardenId: string): Promise<HACCPSystem | null> {
    const systems = Array.from(this.haccpSystems.values())
    return systems.find(system => system.gardenId === gardenId) || null
  }

  async updateHACCPSystem(id: string, updates: Partial<HACCPSystem>): Promise<HACCPSystem> {
    const existing = this.haccpSystems.get(id)
    if (!existing) {
      throw new Error('HACCP system not found')
    }

    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    }

    this.haccpSystems.set(id, updated)

    // Update base certification status
    if (updates.status) {
      await this.createOrUpdateBaseCertification(existing.gardenId, 'HACCP', updates.status)
    }

    return updated
  }

  // ===== ORGANIC CERTIFICATION MANAGEMENT =====

  async createOrganicCertification(gardenId: string, data: Partial<OrganicCertification>): Promise<OrganicCertification> {
    const id = this.generateId()
    const now = new Date().toISOString()

    const organicCert: OrganicCertification = {
      id,
      gardenId,
      certifyingBody: data.certifyingBody || 'ICEA',
      certificateNumber: data.certificateNumber || '',
      validFrom: data.validFrom || now,
      validUntil: data.validUntil || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      scope: data.scope || ['CROP_PRODUCTION'],
      conversionStatus: data.conversionStatus || 'CONVENTIONAL',
      conversionStartDate: data.conversionStartDate,
      conversionEndDate: data.conversionEndDate,
      organicManagementPlan: data.organicManagementPlan || {
        id: this.generateId(),
        cropRotation: [],
        fertilityManagement: {
          soilAnalysis: [],
          organicFertilizers: [],
          compostPlan: {
            materials: [],
            process: '',
            temperature: '',
            turningSchedule: '',
            maturationTime: '',
            qualityTests: []
          },
          greenManure: []
        },
        pestManagement: {
          preventiveMeasures: [],
          biologicalControl: [],
          allowedProducts: [],
          prohibitedProducts: [],
          applicationRecords: []
        },
        seedsAndPlantingMaterial: {
          organicSeeds: [],
          derogations: [],
          treatmentRecords: []
        },
        harvestAndStorage: {
          harvestProcedures: [],
          storageConditions: [],
          cleaningProcedures: [],
          segregation: []
        },
        bufferZones: []
      },
      inputsRegister: data.inputsRegister || [],
      salesRegister: data.salesRegister || [],
      inspectionReports: data.inspectionReports || [],
      status: data.status || 'IN_PROGRESS',
      createdAt: now,
      updatedAt: now
    }

    this.organicCertifications.set(id, organicCert)

    // Create or update base certification
    const certType = data.certifyingBody === 'ICEA' ? 'ORGANIC_ICEA' : 
                    data.certifyingBody === 'CCPB' ? 'ORGANIC_CCPB' : 'ORGANIC_EU'
    await this.createOrUpdateBaseCertification(gardenId, certType, organicCert.status, organicCert.validFrom, organicCert.validUntil)

    return organicCert
  }

  async getOrganicCertification(gardenId: string): Promise<OrganicCertification | null> {
    const certifications = Array.from(this.organicCertifications.values())
    return certifications.find(cert => cert.gardenId === gardenId) || null
  }

  // ===== BASE CERTIFICATION MANAGEMENT =====

  private async createOrUpdateBaseCertification(
    gardenId: string, 
    type: CertificationType, 
    status: CertificationStatus,
    validFrom?: string,
    validUntil?: string
  ): Promise<BaseCertification> {
    const existing = Array.from(this.certifications.values())
      .find(cert => cert.gardenId === gardenId && cert.type === type)

    const now = new Date().toISOString()

    if (existing) {
      const updated = {
        ...existing,
        status,
        validFrom: validFrom || existing.validFrom,
        validUntil: validUntil || existing.validUntil,
        updatedAt: now
      }
      this.certifications.set(existing.id, updated)
      return updated
    } else {
      const id = this.generateId()
      const newCert: BaseCertification = {
        id,
        gardenId,
        type,
        status,
        validFrom,
        validUntil,
        createdAt: now,
        updatedAt: now
      }
      this.certifications.set(id, newCert)
      return newCert
    }
  }

  async getCertifications(gardenId: string): Promise<BaseCertification[]> {
    return Array.from(this.certifications.values())
      .filter(cert => cert.gardenId === gardenId)
  }

  async getCertification(gardenId: string, type: CertificationType): Promise<BaseCertification | null> {
    return Array.from(this.certifications.values())
      .find(cert => cert.gardenId === gardenId && cert.type === type) || null
  }

  // ===== AUDIT MANAGEMENT =====

  async scheduleAudit(gardenId: string, data: Partial<AuditSchedule>): Promise<AuditSchedule> {
    const id = this.generateId()
    const now = new Date().toISOString()

    const audit: AuditSchedule = {
      id,
      gardenId,
      certificationType: data.certificationType!,
      auditType: data.auditType || 'INTERNAL',
      scheduledDate: data.scheduledDate!,
      auditor: data.auditor || '',
      scope: data.scope || [],
      checklist: data.checklist || [],
      status: data.status || 'SCHEDULED',
      createdAt: now,
      updatedAt: now
    }

    this.auditSchedules.set(id, audit)
    return audit
  }

  async getAudits(gardenId: string): Promise<AuditSchedule[]> {
    return Array.from(this.auditSchedules.values())
      .filter(audit => audit.gardenId === gardenId)
      .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime())
  }

  // ===== TRAINING MANAGEMENT =====

  async createTrainingProgram(gardenId: string, data: Partial<TrainingProgram>): Promise<TrainingProgram> {
    const id = this.generateId()
    const now = new Date().toISOString()

    const program: TrainingProgram = {
      id,
      gardenId,
      title: data.title!,
      description: data.description || '',
      certificationType: data.certificationType || [],
      mandatory: data.mandatory || false,
      frequency: data.frequency || 'Annuale',
      duration: data.duration || '',
      trainer: data.trainer || '',
      materials: data.materials || [],
      participants: data.participants || [],
      status: data.status || 'PLANNED',
      createdAt: now,
      updatedAt: now
    }

    this.trainingPrograms.set(id, program)
    return program
  }

  async getTrainingPrograms(gardenId: string): Promise<TrainingProgram[]> {
    return Array.from(this.trainingPrograms.values())
      .filter(program => program.gardenId === gardenId)
  }

  // ===== DOCUMENT MANAGEMENT =====

  async createDocument(gardenId: string, data: Partial<CertificationDocument>): Promise<CertificationDocument> {
    const id = this.generateId()
    const now = new Date().toISOString()

    const document: CertificationDocument = {
      id,
      gardenId,
      certificationType: data.certificationType!,
      title: data.title!,
      description: data.description || '',
      type: data.type!,
      version: data.version || '1.0',
      approvedBy: data.approvedBy || '',
      approvalDate: data.approvalDate || now,
      effectiveDate: data.effectiveDate || now,
      reviewDate: data.reviewDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      status: data.status || 'DRAFT',
      filePath: data.filePath || '',
      tags: data.tags || [],
      createdAt: now,
      updatedAt: now
    }

    this.documents.set(id, document)
    return document
  }

  async getDocuments(gardenId: string, certificationType?: CertificationType): Promise<CertificationDocument[]> {
    let documents = Array.from(this.documents.values())
      .filter(doc => doc.gardenId === gardenId)

    if (certificationType) {
      documents = documents.filter(doc => doc.certificationType === certificationType)
    }

    return documents.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }

  // ===== SUPPLIER MANAGEMENT =====

  async createSupplier(gardenId: string, data: Partial<CertifiedSupplier>): Promise<CertifiedSupplier> {
    const id = this.generateId()
    const now = new Date().toISOString()

    const supplier: CertifiedSupplier = {
      id,
      gardenId,
      name: data.name!,
      type: data.type!,
      certifications: data.certifications || [],
      evaluations: data.evaluations || [],
      contracts: data.contracts || [],
      status: data.status || 'APPROVED',
      createdAt: now,
      updatedAt: now
    }

    this.suppliers.set(id, supplier)
    return supplier
  }

  async getSuppliers(gardenId: string): Promise<CertifiedSupplier[]> {
    return Array.from(this.suppliers.values())
      .filter(supplier => supplier.gardenId === gardenId)
  }

  // ===== UTILITY METHODS =====

  private getCertificationTypeName(type: CertificationType): string {
    const names: Record<CertificationType, string> = {
      'GLOBALGAP': 'GlobalG.A.P.',
      'HACCP': 'HACCP',
      'ORGANIC_EU': 'Biologico UE',
      'ORGANIC_ICEA': 'Biologico ICEA',
      'ORGANIC_CCPB': 'Biologico CCPB',
      'BRC': 'BRC',
      'IFS': 'IFS',
      'ISO22000': 'ISO 22000',
      'GRASP': 'GRASP',
      'RAINFOREST': 'Rainforest Alliance',
      'FAIRTRADE': 'Fairtrade'
    }
    return names[type] || type
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 11)
  }

  // ===== INITIALIZATION =====

  async initializeDefaultCertifications(gardenId: string): Promise<void> {
    // Initialize GlobalG.A.P. as compliant (already implemented)
    await this.createOrUpdateBaseCertification(gardenId, 'GLOBALGAP', 'COMPLIANT')

    // Initialize HACCP as in progress
    await this.createOrUpdateBaseCertification(gardenId, 'HACCP', 'IN_PROGRESS')

    // Initialize Organic as not started
    await this.createOrUpdateBaseCertification(gardenId, 'ORGANIC_EU', 'NOT_STARTED')
  }
}

export const unifiedCertificationsService = new UnifiedCertificationsService()
export default unifiedCertificationsService
