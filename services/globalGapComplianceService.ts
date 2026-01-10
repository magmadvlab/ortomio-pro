// GlobalG.A.P. IFA V5.2 Compliance Service
// Implements the 5 missing Major Requirements

import { getSupabaseClient } from '../config/supabase'
import type {
  GlobalGapRiskManagementPlan,
  GlobalGapSelfAssessment,
  GlobalGapHealthSafetyManager,
  GlobalGapRecallProcedure,
  GlobalGapRecallTest,
  GlobalGapGgnCode,
  GlobalGapTransactionDocument,
  ComplianceOverview,
  GlobalGapAuditPackage,
  ChecklistPoint,
  TracedProduct,
  GlobalGapChecklist
} from '../types/globalGapCompliance'

class GlobalGapComplianceService {
  private getSupabase() {
    const client = getSupabaseClient()
    if (!client) {
      throw new Error('Supabase client not available. Please configure your environment variables.')
    }
    return client
  }
  // AF 1.2.2 - Risk Management Plans
  async createRiskManagementPlan(plan: Omit<GlobalGapRiskManagementPlan, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await this.getSupabase()
      .from('globalgap_risk_management_plans')
      .insert(plan)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getRiskManagementPlans(gardenId: string) {
    const { data, error } = await this.getSupabase()
      .from('globalgap_risk_management_plans')
      .select('*')
      .eq('garden_id', gardenId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  async updateRiskManagementPlan(id: string, updates: Partial<GlobalGapRiskManagementPlan>) {
    const { data, error } = await this.getSupabase()
      .from('globalgap_risk_management_plans')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // AF 2.2 - Self Assessments
  async createSelfAssessment(assessment: Omit<GlobalGapSelfAssessment, 'id' | 'created_at' | 'updated_at' | 'overall_compliance_percentage'>) {
    // Calculate compliance percentage
    const compliantPoints = this.countPointsByStatus(assessment.checklist_data, 'compliant')
    const notApplicablePoints = this.countPointsByStatus(assessment.checklist_data, 'not_applicable')
    const totalApplicablePoints = assessment.total_control_points - notApplicablePoints

    const assessmentWithCalculations = {
      ...assessment,
      compliant_points: compliantPoints,
      non_compliant_points: this.countPointsByStatus(assessment.checklist_data, 'non_compliant'),
      not_applicable_points: notApplicablePoints
    }

    const { data, error } = await this.getSupabase()
      .from('globalgap_self_assessments')
      .insert(assessmentWithCalculations)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getSelfAssessments(gardenId: string) {
    const { data, error } = await this.getSupabase()
      .from('globalgap_self_assessments')
      .select('*')
      .eq('garden_id', gardenId)
      .order('assessment_date', { ascending: false })

    if (error) throw error
    return data
  }

  async updateSelfAssessment(id: string, updates: Partial<GlobalGapSelfAssessment>) {
    // Recalculate compliance if checklist_data is updated
    if (updates.checklist_data) {
      const compliantPoints = this.countPointsByStatus(updates.checklist_data, 'compliant')
      const notApplicablePoints = this.countPointsByStatus(updates.checklist_data, 'not_applicable')
      
      updates.compliant_points = compliantPoints
      updates.non_compliant_points = this.countPointsByStatus(updates.checklist_data, 'non_compliant')
      updates.not_applicable_points = notApplicablePoints
    }

    const { data, error } = await this.getSupabase()
      .from('globalgap_self_assessments')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  private countPointsByStatus(checklist: any, status: string): number {
    let count = 0
    Object.values(checklist).forEach((section: any) => {
      if (section.points) {
        count += section.points.filter((point: ChecklistPoint) => point.status === status).length
      }
    })
    return count
  }

  // AF 4.5.1 - Health & Safety Managers
  async createHealthSafetyManager(manager: Omit<GlobalGapHealthSafetyManager, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await this.getSupabase()
      .from('globalgap_health_safety_managers')
      .insert(manager)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getHealthSafetyManagers(gardenId: string) {
    const { data, error } = await this.getSupabase()
      .from('globalgap_health_safety_managers')
      .select('*')
      .eq('garden_id', gardenId)
      .eq('is_active', true)
      .order('appointment_date', { ascending: false })

    if (error) throw error
    return data
  }

  async updateHealthSafetyManager(id: string, updates: Partial<GlobalGapHealthSafetyManager>) {
    const { data, error } = await this.getSupabase()
      .from('globalgap_health_safety_managers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // AF 9.1 - Recall Procedures
  async createRecallProcedure(procedure: Omit<GlobalGapRecallProcedure, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await this.getSupabase()
      .from('globalgap_recall_procedures')
      .insert(procedure)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getRecallProcedures(gardenId: string) {
    const { data, error } = await this.getSupabase()
      .from('globalgap_recall_procedures')
      .select('*')
      .eq('garden_id', gardenId)
      .order('last_updated', { ascending: false })

    if (error) throw error
    return data
  }

  async updateRecallProcedure(id: string, updates: Partial<GlobalGapRecallProcedure>) {
    const { data, error } = await this.getSupabase()
      .from('globalgap_recall_procedures')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Recall Test Simulation
  async simulateRecallTest(test: Omit<GlobalGapRecallTest, 'id' | 'created_at' | 'updated_at' | 'trace_duration_minutes'>) {
    const { data, error } = await this.getSupabase()
      .from('globalgap_recall_tests')
      .insert(test)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async completeRecallTest(testId: string, results: {
    trace_end_time: string
    traced_products: TracedProduct[]
    communication_test_results: any[]
    effectiveness_score: number
    improvements_identified?: string
  }) {
    const { data, error } = await this.getSupabase()
      .from('globalgap_recall_tests')
      .update({
        ...results,
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', testId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getRecallTests(gardenId: string) {
    const { data, error } = await this.getSupabase()
      .from('globalgap_recall_tests')
      .select('*')
      .eq('garden_id', gardenId)
      .order('test_date', { ascending: false })

    if (error) throw error
    return data
  }

  // AF 11.1 - GGN Codes
  async generateGgnCode(gardenId: string, certificateData: Omit<GlobalGapGgnCode, 'id' | 'ggn_code' | 'created_at' | 'updated_at'>) {
    // Call the database function to generate unique GGN code
    const { data: ggnResult, error: ggnError } = await this.getSupabase()
      .rpc('generate_ggn_code')

    if (ggnError) throw ggnError

    const ggnData = {
      ...certificateData,
      garden_id: gardenId,
      ggn_code: ggnResult
    }

    const { data, error } = await this.getSupabase()
      .from('globalgap_ggn_codes')
      .insert(ggnData)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getGgnCodes(gardenId: string) {
    const { data, error } = await this.getSupabase()
      .from('globalgap_ggn_codes')
      .select('*')
      .eq('garden_id', gardenId)
      .eq('is_active', true)
      .order('issue_date', { ascending: false })

    if (error) throw error
    return data
  }

  async updateGgnCode(id: string, updates: Partial<GlobalGapGgnCode>) {
    const { data, error } = await this.getSupabase()
      .from('globalgap_ggn_codes')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Transaction Documents with GGN
  async createTransactionDocument(document: Omit<GlobalGapTransactionDocument, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await this.getSupabase()
      .from('globalgap_transaction_documents')
      .insert(document)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getTransactionDocuments(gardenId: string) {
    const { data, error } = await this.getSupabase()
      .from('globalgap_transaction_documents')
      .select(`
        *,
        ggn_code:globalgap_ggn_codes(ggn_code, certificate_holder_name)
      `)
      .eq('garden_id', gardenId)
      .order('document_date', { ascending: false })

    if (error) throw error
    return data
  }

  // Compliance Overview
  async getComplianceOverview(gardenId: string): Promise<ComplianceOverview> {
    // Get latest self-assessment
    const { data: assessments } = await this.getSupabase()
      .from('globalgap_self_assessments')
      .select('*')
      .eq('garden_id', gardenId)
      .order('assessment_date', { ascending: false })
      .limit(1)

    // Get all compliance modules
    const [riskPlans, healthManagers, recallProcedures, ggnCodes] = await Promise.all([
      this.getRiskManagementPlans(gardenId),
      this.getHealthSafetyManagers(gardenId),
      this.getRecallProcedures(gardenId),
      this.getGgnCodes(gardenId)
    ])

    const latestAssessment = assessments?.[0]
    const overallPercentage = latestAssessment?.overall_compliance_percentage || 0

    // Identify critical gaps
    const criticalGaps: string[] = []
    if (!riskPlans?.length) criticalGaps.push('AF 1.2.2 - Risk Management Plan')
    if (!latestAssessment) criticalGaps.push('AF 2.2 - Annual Self-Assessment')
    if (!healthManagers?.length) criticalGaps.push('AF 4.5.1 - Health & Safety Manager')
    if (!recallProcedures?.length) criticalGaps.push('AF 9.1 - Recall Procedures')
    if (!ggnCodes?.length) criticalGaps.push('AF 11.1 - GGN Code')

    // Calculate completion
    const totalRequirements = 5 // The 5 major requirements we're implementing
    const completedRequirements = totalRequirements - criticalGaps.length

    // Determine certification readiness
    let certificationReadiness: ComplianceOverview['certification_readiness'] = 'not_ready'
    if (overallPercentage >= 95 && criticalGaps.length === 0) {
      certificationReadiness = 'ready'
    } else if (overallPercentage >= 80 && criticalGaps.length <= 1) {
      certificationReadiness = 'partially_ready'
    }

    // Generate next actions
    const nextActions = criticalGaps.map(gap => ({
      requirement_id: gap.split(' - ')[0],
      description: `Complete ${gap}`,
      priority: 'high' as const,
      estimated_completion_time: '1-2 weeks'
    }))

    return {
      overall_percentage: overallPercentage,
      completed_requirements: completedRequirements,
      total_requirements: totalRequirements,
      critical_gaps: criticalGaps,
      next_actions: nextActions,
      certification_readiness: certificationReadiness
    }
  }

  // Export Audit Package
  async exportAuditPackage(gardenId: string): Promise<GlobalGapAuditPackage> {
    const [
      assessments,
      riskPlans,
      recallProcedures,
      recallTests,
      healthManagers,
      transactionDocs,
      ggnCodes,
      complianceOverview
    ] = await Promise.all([
      this.getSelfAssessments(gardenId),
      this.getRiskManagementPlans(gardenId),
      this.getRecallProcedures(gardenId),
      this.getRecallTests(gardenId),
      this.getHealthSafetyManagers(gardenId),
      this.getTransactionDocuments(gardenId),
      this.getGgnCodes(gardenId),
      this.getComplianceOverview(gardenId)
    ])

    return {
      assessment_reports: assessments || [],
      risk_management_plans: riskPlans || [],
      recall_procedures: recallProcedures || [],
      recall_test_results: recallTests || [],
      health_safety_documentation: healthManagers || [],
      transaction_documents: transactionDocs || [],
      ggn_certificates: ggnCodes || [],
      compliance_summary: complianceOverview,
      export_date: new Date().toISOString(),
      export_version: '1.0'
    }
  }

  // Generate PDF Reports
  async generateComplianceReport(gardenId: string, format: 'pdf' | 'csv' = 'pdf') {
    const auditPackage = await this.exportAuditPackage(gardenId)
    
    // This would integrate with a PDF generation service
    // For now, return the data structure that can be used by a PDF generator
    return {
      data: auditPackage,
      format,
      filename: `globalgap-compliance-${gardenId}-${new Date().toISOString().split('T')[0]}.${format}`
    }
  }

  // Default Templates
  getDefaultRiskManagementTemplate() {
    return {
      identified_risks: [
        {
          id: 'risk-001',
          category: 'contamination' as const,
          description: 'Potential contamination from adjacent land use',
          severity: 'medium' as const,
          probability: 'possible' as const,
          risk_score: 6,
          source: 'Site assessment'
        },
        {
          id: 'risk-002',
          category: 'environmental' as const,
          description: 'Flooding risk during heavy rainfall',
          severity: 'high' as const,
          probability: 'unlikely' as const,
          risk_score: 8,
          source: 'Historical data'
        }
      ],
      control_procedures: [
        {
          risk_id: 'risk-001',
          procedure_description: 'Regular monitoring of adjacent land activities and buffer zone maintenance',
          responsible_person: 'Farm Manager',
          implementation_date: new Date().toISOString().split('T')[0],
          monitoring_frequency: 'monthly' as const,
          effectiveness_indicators: ['Buffer zone integrity', 'No contamination detected'],
          documentation_required: ['Monthly inspection reports', 'Test results']
        }
      ],
      monitoring_schedule: [
        {
          procedure_id: 'proc-001',
          frequency: 'Monthly',
          next_check_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          responsible_person: 'Farm Manager',
          checklist_items: ['Visual inspection', 'Documentation review', 'Corrective actions if needed']
        }
      ]
    }
  }

  getDefaultSelfAssessmentTemplate(): GlobalGapChecklist {
    return {
      "AF1": {
        "name": "Site History and Site Management",
        "points": [
          {"id": "AF1.1.1", "description": "Site history documented for minimum 3 years", "status": "pending" as const, "comment": ""},
          {"id": "AF1.2.1", "description": "Risk assessment completed for production site", "status": "pending" as const, "comment": ""},
          {"id": "AF1.2.2", "description": "Risk management plan implemented", "status": "pending" as const, "comment": ""}
        ]
      },
      "AF2": {
        "name": "Record Keeping and Internal Self-Assessment",
        "points": [
          {"id": "AF2.1.1", "description": "Records kept for minimum 2 years", "status": "pending" as const, "comment": ""},
          {"id": "AF2.2", "description": "Annual internal self-assessment conducted", "status": "pending" as const, "comment": ""}
        ]
      },
      "AF3": {
        "name": "Hygiene",
        "points": [
          {"id": "AF3.1.1", "description": "Hand washing facilities available", "status": "pending" as const, "comment": ""},
          {"id": "AF3.2.1", "description": "Hygiene procedures documented and implemented", "status": "pending" as const, "comment": ""}
        ]
      },
      "AF4": {
        "name": "Worker Health, Safety and Welfare",
        "points": [
          {"id": "AF4.1.1", "description": "Risk assessment completed for worker activities", "status": "pending" as const, "comment": ""},
          {"id": "AF4.5.1", "description": "Management responsible person identified for H&S", "status": "pending" as const, "comment": ""}
        ]
      },
      "AF9": {
        "name": "Traceability",
        "points": [
          {"id": "AF9.1", "description": "Product recall procedures documented and tested annually", "status": "pending" as const, "comment": ""}
        ]
      },
      "AF11": {
        "name": "Logo Use",
        "points": [
          {"id": "AF11.1", "description": "GGN code included on transaction documents", "status": "pending" as const, "comment": ""}
        ]
      }
    }
  }
}

export const globalGapComplianceService = new GlobalGapComplianceService()