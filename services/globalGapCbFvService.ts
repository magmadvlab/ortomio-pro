// GlobalG.A.P. IFA V5.2 - CB (Coltivazioni Base) + FV (Frutta/Ortaggi) Service
// Complete compliance coverage for professional agriculture

import { getSupabaseClient } from '../config/supabase'
import type {
  GlobalGapVarietySelection,
  GlobalGapIpmMonitoring,
  GlobalGapSprayerCalibration,
  GlobalGapWaterAnalysis,
  GlobalGapFertilizerRecord,
  GlobalGapHarvestAssessment,
  GlobalGapLotTraceability,
  GlobalGapMicrobiologicalRisk,
  GlobalGapMicrobiologicalPlan,
  GlobalGapFoliarWaterAnalysis,
  GlobalGapHarvestHygieneRisk,
  GlobalGapHarvestProcedure,
  GlobalGapHygieneTraining,
  GlobalGapHandwashingFacility,
  GlobalGapComplianceChecklist,
  CompleteComplianceOverview
} from '../types/globalGapCbFv'

class GlobalGapCbFvService {
  private getSupabase() {
    const client = getSupabaseClient()
    if (!client) {
      throw new Error('Supabase client not available. Please configure your environment variables.')
    }
    return client
  }
  // CB1.1.1 - Variety Selection
  async createVarietySelection(selection: Omit<GlobalGapVarietySelection, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await this.getSupabase()
      .from('globalgap_variety_selections')
      .insert(selection)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getVarietySelections(gardenId: string) {
    const { data, error } = await this.getSupabase()
      .from('globalgap_variety_selections')
      .select('*')
      .eq('garden_id', gardenId)
      .order('planting_date', { ascending: false })

    if (error) throw error
    return data
  }

  // CB4.1.1 - IPM Monitoring
  async createIpmMonitoring(monitoring: Omit<GlobalGapIpmMonitoring, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await this.getSupabase()
      .from('globalgap_ipm_monitoring')
      .insert(monitoring)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getIpmMonitoring(gardenId: string, startDate?: string, endDate?: string) {
    let query = this.getSupabase()
      .from('globalgap_ipm_monitoring')
      .select('*')
      .eq('garden_id', gardenId)

    if (startDate) query = query.gte('monitoring_date', startDate)
    if (endDate) query = query.lte('monitoring_date', endDate)

    const { data, error } = await query.order('monitoring_date', { ascending: false })

    if (error) throw error
    return data
  }

  // CB4.4.1 - Sprayer Calibration
  async createSprayerCalibration(calibration: Omit<GlobalGapSprayerCalibration, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await this.getSupabase()
      .from('globalgap_sprayer_calibrations')
      .insert(calibration)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getSprayerCalibrations(gardenId: string) {
    const { data, error } = await this.getSupabase()
      .from('globalgap_sprayer_calibrations')
      .select('*')
      .eq('garden_id', gardenId)
      .order('calibration_date', { ascending: false })

    if (error) throw error
    return data
  }

  // CB5.1.1 - Water Analysis
  async createWaterAnalysis(analysis: Omit<GlobalGapWaterAnalysis, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await this.getSupabase()
      .from('globalgap_water_analyses')
      .insert(analysis)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getWaterAnalyses(gardenId: string) {
    const { data, error } = await this.getSupabase()
      .from('globalgap_water_analyses')
      .select('*')
      .eq('garden_id', gardenId)
      .order('sample_date', { ascending: false })

    if (error) throw error
    return data
  }

  // CB5.2.1 - Fertilizer Records
  async createFertilizerRecord(record: Omit<GlobalGapFertilizerRecord, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await this.getSupabase()
      .from('globalgap_fertilizer_records')
      .insert(record)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getFertilizerRecords(gardenId: string, startDate?: string, endDate?: string) {
    let query = this.getSupabase()
      .from('globalgap_fertilizer_records')
      .select('*')
      .eq('garden_id', gardenId)

    if (startDate) query = query.gte('application_date', startDate)
    if (endDate) query = query.lte('application_date', endDate)

    const { data, error } = await query.order('application_date', { ascending: false })

    if (error) throw error
    return data
  }

  // CB7.1.1 - Harvest Assessment
  async createHarvestAssessment(assessment: Omit<GlobalGapHarvestAssessment, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await this.getSupabase()
      .from('globalgap_harvest_assessments')
      .insert(assessment)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getHarvestAssessments(gardenId: string) {
    const { data, error } = await this.getSupabase()
      .from('globalgap_harvest_assessments')
      .select('*')
      .eq('garden_id', gardenId)
      .order('assessment_date', { ascending: false })

    if (error) throw error
    return data
  }

  // CB7.6.1 - Lot Traceability
  async generateLotCode(gardenId: string, productName: string): Promise<string> {
    const { data, error } = await this.getSupabase()
      .rpc('generate_lot_code', {
        garden_id_param: gardenId,
        product_name_param: productName
      })

    if (error) throw error
    return data
  }

  async createLotTraceability(lot: Omit<GlobalGapLotTraceability, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await this.getSupabase()
      .from('globalgap_lot_traceability')
      .insert(lot)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getLotTraceability(gardenId: string) {
    const { data, error } = await this.getSupabase()
      .from('globalgap_lot_traceability')
      .select('*')
      .eq('garden_id', gardenId)
      .order('harvest_date', { ascending: false })

    if (error) throw error
    return data
  }

  async traceLot(lotCode: string) {
    const { data, error } = await this.getSupabase()
      .from('globalgap_lot_traceability')
      .select('*')
      .eq('lot_code', lotCode)
      .single()

    if (error) throw error
    return data
  }

  // FV1.1.1 - Microbiological Risks
  async createMicrobiologicalRisk(risk: Omit<GlobalGapMicrobiologicalRisk, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await this.getSupabase()
      .from('globalgap_microbiological_risks')
      .insert(risk)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getMicrobiologicalRisks(gardenId: string) {
    const { data, error } = await this.getSupabase()
      .from('globalgap_microbiological_risks')
      .select('*')
      .eq('garden_id', gardenId)
      .order('risk_assessment_date', { ascending: false })

    if (error) throw error
    return data
  }

  // FV1.1.2 - Microbiological Management Plan
  async createMicrobiologicalPlan(plan: Omit<GlobalGapMicrobiologicalPlan, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await this.getSupabase()
      .from('globalgap_microbiological_plans')
      .insert(plan)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getMicrobiologicalPlans(gardenId: string) {
    const { data, error } = await this.getSupabase()
      .from('globalgap_microbiological_plans')
      .select('*')
      .eq('garden_id', gardenId)
      .order('effective_date', { ascending: false })

    if (error) throw error
    return data
  }

  // FV4.1.2a - Foliar Water Analysis
  async createFoliarWaterAnalysis(analysis: Omit<GlobalGapFoliarWaterAnalysis, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await this.getSupabase()
      .from('globalgap_foliar_water_analyses')
      .insert(analysis)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getFoliarWaterAnalyses(gardenId: string) {
    const { data, error } = await this.getSupabase()
      .from('globalgap_foliar_water_analyses')
      .select('*')
      .eq('garden_id', gardenId)
      .order('analysis_date', { ascending: false })

    if (error) throw error
    return data
  }

  // FV5.1.1 - Harvest Hygiene Risks
  async createHarvestHygieneRisk(risk: Omit<GlobalGapHarvestHygieneRisk, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await this.getSupabase()
      .from('globalgap_harvest_hygiene_risks')
      .insert(risk)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getHarvestHygieneRisks(gardenId: string) {
    const { data, error } = await this.getSupabase()
      .from('globalgap_harvest_hygiene_risks')
      .select('*')
      .eq('garden_id', gardenId)
      .order('assessment_date', { ascending: false })

    if (error) throw error
    return data
  }

  // FV5.1.2 - Harvest Procedures
  async createHarvestProcedure(procedure: Omit<GlobalGapHarvestProcedure, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await this.getSupabase()
      .from('globalgap_harvest_procedures')
      .insert(procedure)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getHarvestProcedures(gardenId: string) {
    const { data, error } = await this.getSupabase()
      .from('globalgap_harvest_procedures')
      .select('*')
      .eq('garden_id', gardenId)
      .order('effective_date', { ascending: false })

    if (error) throw error
    return data
  }

  // FV5.1.4 - Hygiene Training
  async createHygieneTraining(training: Omit<GlobalGapHygieneTraining, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await this.getSupabase()
      .from('globalgap_hygiene_training')
      .insert(training)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getHygieneTraining(gardenId: string) {
    const { data, error } = await this.getSupabase()
      .from('globalgap_hygiene_training')
      .select('*')
      .eq('garden_id', gardenId)
      .order('training_date', { ascending: false })

    if (error) throw error
    return data
  }

  // FV5.2.1 - Handwashing Facilities
  async createHandwashingFacility(facility: Omit<GlobalGapHandwashingFacility, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await this.getSupabase()
      .from('globalgap_handwashing_facilities')
      .insert(facility)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getHandwashingFacilities(gardenId: string) {
    const { data, error } = await this.getSupabase()
      .from('globalgap_handwashing_facilities')
      .select('*')
      .eq('garden_id', gardenId)
      .order('inspection_date', { ascending: false })

    if (error) throw error
    return data
  }

  // Compliance Checklist Management
  async getComplianceChecklist(gardenId: string, moduleCode?: 'AF' | 'CB' | 'FV') {
    let query = this.getSupabase()
      .from('globalgap_compliance_checklist')
      .select('*')
      .eq('garden_id', gardenId)

    if (moduleCode) {
      query = query.eq('module_code', moduleCode)
    }

    const { data, error } = await query.order('control_point')

    if (error) throw error
    return data
  }

  async updateCompliancePoint(gardenId: string, controlPoint: string, updates: Partial<GlobalGapComplianceChecklist>) {
    const { data, error } = await this.getSupabase()
      .from('globalgap_compliance_checklist')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('garden_id', gardenId)
      .eq('control_point', controlPoint)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Complete Compliance Overview
  async getCompleteComplianceOverview(gardenId: string): Promise<CompleteComplianceOverview> {
    const checklist = await this.getComplianceChecklist(gardenId)

    const afPoints = checklist.filter(item => item.module_code === 'AF')
    const cbPoints = checklist.filter(item => item.module_code === 'CB')
    const fvPoints = checklist.filter(item => item.module_code === 'FV')

    const calculateModuleCompliance = (points: GlobalGapComplianceChecklist[]) => {
      const applicablePoints = points.filter(p => p.compliance_status !== 'not_applicable')
      const compliantPoints = applicablePoints.filter(p => p.compliance_status === 'compliant')
      const criticalGaps = applicablePoints
        .filter(p => p.compliance_status === 'non_compliant')
        .map(p => `${p.control_point} - ${p.description}`)

      return {
        total_points: applicablePoints.length,
        compliant_points: compliantPoints.length,
        compliance_percentage: applicablePoints.length > 0 
          ? Math.round((compliantPoints.length / applicablePoints.length) * 100)
          : 0,
        critical_gaps: criticalGaps
      }
    }

    const afModule = calculateModuleCompliance(afPoints)
    const cbModule = calculateModuleCompliance(cbPoints)
    const fvModule = calculateModuleCompliance(fvPoints)

    const totalApplicablePoints = afModule.total_points + cbModule.total_points + fvModule.total_points
    const totalCompliantPoints = afModule.compliant_points + cbModule.compliant_points + fvModule.compliant_points
    const overallCompliance = totalApplicablePoints > 0 
      ? Math.round((totalCompliantPoints / totalApplicablePoints) * 100)
      : 0

    let certificationReadiness: CompleteComplianceOverview['certification_readiness'] = 'not_ready'
    if (overallCompliance >= 95) {
      certificationReadiness = 'ready'
    } else if (overallCompliance >= 80) {
      certificationReadiness = 'partially_ready'
    }

    return {
      af_module: afModule,
      cb_module: cbModule,
      fv_module: fvModule,
      overall_compliance: overallCompliance,
      certification_readiness: certificationReadiness
    }
  }

  // Export Functions
  async exportComplianceReport(gardenId: string, format: 'csv' | 'pdf' = 'csv') {
    const overview = await this.getCompleteComplianceOverview(gardenId)
    const checklist = await this.getComplianceChecklist(gardenId)

    if (format === 'csv') {
      const csvData = [
        ['GlobalG.A.P. IFA V5.2 Complete Compliance Report'],
        ['Garden ID', gardenId],
        ['Export Date', new Date().toISOString().split('T')[0]],
        ['Overall Compliance', `${overview.overall_compliance}%`],
        ['Certification Readiness', overview.certification_readiness],
        [''],
        ['Module', 'Total Points', 'Compliant Points', 'Compliance %', 'Critical Gaps'],
        ['AF (Base)', overview.af_module.total_points.toString(), overview.af_module.compliant_points.toString(), `${overview.af_module.compliance_percentage}%`, overview.af_module.critical_gaps.length.toString()],
        ['CB (Crop Base)', overview.cb_module.total_points.toString(), overview.cb_module.compliant_points.toString(), `${overview.cb_module.compliance_percentage}%`, overview.cb_module.critical_gaps.length.toString()],
        ['FV (Fruits/Vegetables)', overview.fv_module.total_points.toString(), overview.fv_module.compliant_points.toString(), `${overview.fv_module.compliance_percentage}%`, overview.fv_module.critical_gaps.length.toString()],
        [''],
        ['Detailed Checklist'],
        ['Module', 'Control Point', 'Description', 'Status', 'Evidence', 'Last Verified', 'Notes'],
        ...checklist.map(item => [
          item.module_code,
          item.control_point,
          item.description,
          item.compliance_status,
          item.evidence_reference || '',
          item.last_verified || '',
          item.notes || ''
        ])
      ]

      return {
        data: csvData,
        filename: `globalgap-complete-compliance-${gardenId}-${new Date().toISOString().split('T')[0]}.csv`
      }
    }

    return {
      data: { overview, checklist },
      filename: `globalgap-complete-compliance-${gardenId}-${new Date().toISOString().split('T')[0]}.json`
    }
  }

  // Initialize compliance checklist for a new garden
  async initializeComplianceChecklist(gardenId: string) {
    // Copy template checklist for this garden
    const { data: templateChecklist } = await this.getSupabase()
      .from('globalgap_compliance_checklist')
      .select('*')
      .eq('garden_id', '00000000-0000-0000-0000-000000000000')

    if (templateChecklist && templateChecklist.length > 0) {
      const gardenChecklist = templateChecklist.map(item => ({
        ...item,
        id: undefined,
        garden_id: gardenId,
        created_at: undefined,
        updated_at: undefined
      }))

      const { data, error } = await this.getSupabase()
        .from('globalgap_compliance_checklist')
        .insert(gardenChecklist)
        .select()

      if (error) throw error
      return data
    }

    return []
  }

  // Quick compliance check
  async getComplianceGaps(gardenId: string) {
    const checklist = await this.getComplianceChecklist(gardenId)
    
    const gaps = checklist
      .filter(item => item.compliance_status === 'non_compliant')
      .map(item => ({
        module: item.module_code,
        control_point: item.control_point,
        description: item.description,
        corrective_action: item.corrective_action,
        target_date: item.target_completion_date
      }))

    return gaps
  }
}

export const globalGapCbFvService = new GlobalGapCbFvService()