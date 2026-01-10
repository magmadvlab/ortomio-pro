// GlobalG.A.P. IFA V5.2 Compliance Types
// Implements the 5 missing Major Requirements

export interface GlobalGapRiskManagementPlan {
  id: string
  garden_id: string
  plan_name: string
  risk_assessment_date: string
  plan_implementation_date: string
  identified_risks: RiskItem[]
  control_procedures: ControlProcedure[]
  monitoring_schedule: MonitoringSchedule[]
  effectiveness_evidence?: string
  responsible_person: string
  next_review_date: string
  status: 'active' | 'under_review' | 'expired'
  created_at: string
  updated_at: string
}

export interface RiskItem {
  id: string
  category: 'environmental' | 'contamination' | 'physical' | 'biological' | 'chemical'
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  probability: 'unlikely' | 'possible' | 'likely' | 'certain'
  risk_score: number // 1-25 (severity × probability)
  source: string // Where risk was identified
}

export interface ControlProcedure {
  risk_id: string
  procedure_description: string
  responsible_person: string
  implementation_date: string
  monitoring_frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually'
  effectiveness_indicators: string[]
  documentation_required: string[]
}

export interface MonitoringSchedule {
  procedure_id: string
  frequency: string
  next_check_date: string
  responsible_person: string
  checklist_items: string[]
}

// AF 2.2 - Self Assessment
export interface GlobalGapSelfAssessment {
  id: string
  garden_id: string
  assessment_date: string
  assessor_name: string
  assessor_role: string
  total_control_points: number
  compliant_points: number
  non_compliant_points: number
  not_applicable_points: number
  checklist_data: GlobalGapChecklist
  overall_compliance_percentage: number
  corrective_actions?: CorrectiveAction[]
  next_assessment_date: string
  status: 'in_progress' | 'completed' | 'under_review'
  created_at: string
  updated_at: string
}

export interface GlobalGapChecklist {
  [sectionKey: string]: ChecklistSection
}

export interface ChecklistSection {
  name: string
  points: ChecklistPoint[]
}

export interface ChecklistPoint {
  id: string // e.g., "AF1.1.1"
  description: string
  status: 'compliant' | 'non_compliant' | 'not_applicable' | 'pending'
  comment: string
  evidence?: string
  corrective_action?: string
  target_date?: string
}

export interface CorrectiveAction {
  control_point_id: string
  action_description: string
  responsible_person: string
  target_completion_date: string
  actual_completion_date?: string
  status: 'planned' | 'in_progress' | 'completed' | 'overdue'
  verification_method: string
}

// AF 4.5.1 - Health & Safety Manager
export interface GlobalGapHealthSafetyManager {
  id: string
  garden_id: string
  responsible_person_name: string
  position_title: string
  qualifications?: string
  appointment_date: string
  digital_signature?: string
  responsibilities: HealthSafetyResponsibility[]
  training_records?: TrainingRecord[]
  contact_info: ContactInfo
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface HealthSafetyResponsibility {
  area: string
  description: string
  legal_requirements: string[]
  implementation_methods: string[]
}

export interface TrainingRecord {
  training_name: string
  completion_date: string
  expiry_date?: string
  certificate_number?: string
  training_provider: string
}

export interface ContactInfo {
  phone?: string
  email?: string
  emergency_contact?: string
}

// AF 9.1 - Recall Procedures
export interface GlobalGapRecallProcedure {
  id: string
  garden_id: string
  procedure_version: string
  last_updated: string
  trigger_events: TriggerEvent[]
  decision_makers: DecisionMaker[]
  communication_plan: CommunicationPlan
  traceability_method: string
  stock_reconciliation_method: string
  annual_test_date?: string
  test_results?: RecallTestResult[]
  test_documentation?: string
  status: 'active' | 'under_review' | 'expired'
  created_at: string
  updated_at: string
}

export interface TriggerEvent {
  event_type: string
  description: string
  severity_level: 'low' | 'medium' | 'high' | 'critical'
  automatic_trigger: boolean
  notification_required: boolean
}

export interface DecisionMaker {
  name: string
  position: string
  contact_info: ContactInfo
  authority_level: 'local' | 'regional' | 'national' | 'international'
  backup_person?: string
}

export interface CommunicationPlan {
  internal_contacts: ContactInfo[]
  external_contacts: ContactInfo[]
  notification_methods: string[]
  escalation_timeline: EscalationStep[]
  template_messages: TemplateMessage[]
}

export interface EscalationStep {
  time_from_detection: number // minutes
  action_required: string
  responsible_person: string
  notification_targets: string[]
}

export interface TemplateMessage {
  message_type: 'initial_alert' | 'customer_notification' | 'authority_report' | 'all_clear'
  template_text: string
  required_fields: string[]
}

// AF 9.1 - Recall Test
export interface GlobalGapRecallTest {
  id: string
  garden_id: string
  procedure_id: string
  test_date: string
  test_scenario: string
  simulated_lot_code: string
  trace_start_time: string
  trace_end_time?: string
  trace_duration_minutes?: number
  traced_products?: TracedProduct[]
  communication_test_results?: CommunicationTestResult[]
  effectiveness_score?: number
  improvements_identified?: string
  test_conducted_by: string
  status: 'planned' | 'in_progress' | 'completed'
  created_at: string
  updated_at: string
}

export interface TracedProduct {
  product_name: string
  lot_code: string
  production_date: string
  field_location: string
  quantity: number
  destination: string
  trace_time_minutes: number
  trace_successful: boolean
}

export interface CommunicationTestResult {
  contact_type: 'internal' | 'external' | 'authority'
  contact_name: string
  notification_method: string
  response_time_minutes: number
  response_received: boolean
  message_clarity_score: number // 1-10
}

export interface RecallTestResult {
  test_date: string
  scenario_tested: string
  trace_time_minutes: number
  communication_results: CommunicationTestResult[]
  improvements_identified?: string
  overall_success: boolean
}

// AF 11.1 - GGN Codes
export interface GlobalGapGgnCode {
  id: string
  garden_id: string
  ggn_code: string // 13-digit format
  certificate_holder_name: string
  certificate_status: 'valid' | 'suspended' | 'expired' | 'withdrawn'
  issue_date: string
  expiry_date: string
  scope_products: ScopeProduct[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ScopeProduct {
  product_category: string
  product_name: string
  production_method: 'conventional' | 'organic' | 'integrated'
  certification_level: 'option_1' | 'option_2'
}

export interface GlobalGapTransactionDocument {
  id: string
  garden_id: string
  ggn_code_id: string
  document_type: 'invoice' | 'delivery_note' | 'certificate' | 'packing_list'
  document_number: string
  document_date: string
  customer_name: string
  products: TransactionProduct[]
  total_amount?: number
  ggn_reference_included: boolean
  certificate_status_mentioned: boolean
  document_path?: string
  created_at: string
  updated_at: string
}

export interface TransactionProduct {
  product_name: string
  quantity: number
  unit: string
  lot_codes: string[]
  ggn_status: 'certified' | 'non_certified' | 'in_conversion'
  price_per_unit?: number
  total_price?: number
}

// Compliance Dashboard Types
export interface ComplianceOverview {
  overall_percentage: number
  completed_requirements: number
  total_requirements: number
  critical_gaps: string[]
  next_actions: NextAction[]
  certification_readiness: 'not_ready' | 'partially_ready' | 'ready' | 'certified'
}

export interface NextAction {
  requirement_id: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  estimated_completion_time: string
  responsible_person?: string
  due_date?: string
}

// Export Templates
export interface GlobalGapExportOptions {
  format: 'pdf' | 'csv' | 'excel'
  sections: string[]
  date_range?: {
    start: string
    end: string
  }
  include_evidence: boolean
  include_corrective_actions: boolean
  language: 'it' | 'en'
}

export interface GlobalGapAuditPackage {
  assessment_reports: GlobalGapSelfAssessment[]
  risk_management_plans: GlobalGapRiskManagementPlan[]
  recall_procedures: GlobalGapRecallProcedure[]
  recall_test_results: GlobalGapRecallTest[]
  health_safety_documentation: GlobalGapHealthSafetyManager[]
  transaction_documents: GlobalGapTransactionDocument[]
  ggn_certificates: GlobalGapGgnCode[]
  compliance_summary: ComplianceOverview
  export_date: string
  export_version: string
}