// GlobalG.A.P. IFA V5.2 - CB (Coltivazioni Base) + FV (Frutta/Ortaggi) Types
// Complete compliance coverage for professional agriculture

// CB1.1.1 - Variety Selection
export interface GlobalGapVarietySelection {
  id: string
  garden_id: string
  crop_name: string
  variety_name: string
  resistance_traits: ResistanceTrait[]
  selection_criteria: string
  supplier_info?: SupplierInfo
  certification_status?: string
  planting_date?: string
  field_location?: string
  performance_notes?: string
  created_at: string
  updated_at: string
}

export interface ResistanceTrait {
  pathogen_type: 'disease' | 'pest' | 'virus' | 'fungus' | 'bacteria'
  pathogen_name: string
  resistance_level: 'immune' | 'highly_resistant' | 'moderately_resistant' | 'tolerant'
  certification_source?: string
}

export interface SupplierInfo {
  supplier_name: string
  contact_info: string
  certification_status: string
  seed_lot_number?: string
}

// CB4.1.1 - IPM Monitoring
export interface GlobalGapIpmMonitoring {
  id: string
  garden_id: string
  monitoring_date: string
  field_location: string
  pest_species: string
  monitoring_method: 'visual' | 'trap' | 'pheromone' | 'sampling' | 'other'
  population_level: 'low' | 'medium' | 'high' | 'critical'
  threshold_exceeded: boolean
  action_taken?: string
  weather_conditions?: WeatherConditions
  monitored_by: string
  photos?: string[]
  created_at: string
  updated_at: string
}

export interface WeatherConditions {
  temperature: number
  humidity: number
  wind_speed: number
  precipitation: number
  conditions: string
}

// CB4.4.1 - Sprayer Calibration
export interface GlobalGapSprayerCalibration {
  id: string
  garden_id: string
  equipment_id: string
  equipment_type: string
  calibration_date: string
  calibrated_by: string
  pressure_settings: PressureSettings
  nozzle_specifications: NozzleSpecs
  flow_rate_measurements: FlowRateMeasurement[]
  coverage_uniformity_test?: UniformityTest
  calibration_certificate?: string
  next_calibration_date: string
  status: 'valid' | 'expired' | 'needs_recalibration'
  created_at: string
  updated_at: string
}

export interface PressureSettings {
  operating_pressure: number
  pressure_unit: 'bar' | 'psi'
  pressure_gauge_calibrated: boolean
}

export interface NozzleSpecs {
  nozzle_type: string
  nozzle_size: string
  spray_angle: number
  flow_rate_per_nozzle: number
  number_of_nozzles: number
}

export interface FlowRateMeasurement {
  nozzle_position: string
  flow_rate: number
  unit: 'L/min' | 'L/ha'
  deviation_percentage: number
}

export interface UniformityTest {
  test_method: string
  coverage_percentage: number
  uniformity_coefficient: number
  acceptable: boolean
}

// CB5.1.1 - Water Analysis
export interface GlobalGapWaterAnalysis {
  id: string
  garden_id: string
  sample_date: string
  water_source: string
  sample_location: string
  analysis_type: 'microbiological' | 'chemical' | 'physical' | 'complete'
  laboratory_name: string
  test_parameters: TestParameter[]
  results: TestResult[]
  compliance_status: 'compliant' | 'non_compliant' | 'marginal'
  corrective_actions?: string
  certificate_path?: string
  next_analysis_date?: string
  created_at: string
  updated_at: string
}

export interface TestParameter {
  parameter_name: string
  test_method: string
  detection_limit: number
  acceptable_limit: number
  unit: string
}

export interface TestResult {
  parameter_name: string
  measured_value: number
  unit: string
  status: 'pass' | 'fail' | 'marginal'
  notes?: string
}

// CB5.2.1 - Fertilizer Records
export interface GlobalGapFertilizerRecord {
  id: string
  garden_id: string
  application_date: string
  field_location: string
  fertilizer_name: string
  fertilizer_type: 'organic' | 'mineral' | 'foliar' | 'slow_release'
  npk_content: NpkContent
  application_rate: number
  application_method: string
  weather_conditions?: WeatherConditions
  soil_conditions?: string
  justification: string
  applied_by: string
  equipment_used?: string
  created_at: string
  updated_at: string
}

export interface NpkContent {
  nitrogen_percentage: number
  phosphorus_percentage: number
  potassium_percentage: number
  secondary_nutrients?: SecondaryNutrients
  micronutrients?: Micronutrient[]
}

export interface SecondaryNutrients {
  calcium?: number
  magnesium?: number
  sulfur?: number
}

export interface Micronutrient {
  element: string
  percentage: number
  form: string
}

// CB7.1.1 - Harvest Assessment
export interface GlobalGapHarvestAssessment {
  id: string
  garden_id: string
  assessment_date: string
  field_location: string
  crop_name: string
  maturity_indicators: MaturityIndicator[]
  quality_parameters: QualityParameter[]
  suitability_decision: 'suitable' | 'not_suitable' | 'conditional'
  harvest_authorization: boolean
  authorized_by?: string
  quality_defects?: QualityDefect[]
  estimated_yield?: number
  harvest_instructions?: string
  created_at: string
  updated_at: string
}

export interface MaturityIndicator {
  indicator_type: 'color' | 'size' | 'firmness' | 'sugar_content' | 'other'
  measurement: string
  target_value: string
  actual_value: string
  meets_criteria: boolean
}

export interface QualityParameter {
  parameter_name: string
  measurement_method: string
  target_specification: string
  actual_measurement: string
  acceptable: boolean
}

export interface QualityDefect {
  defect_type: string
  severity: 'minor' | 'major' | 'critical'
  percentage_affected: number
  corrective_action?: string
}

// CB7.6.1 - Lot Traceability
export interface GlobalGapLotTraceability {
  id: string
  garden_id: string
  lot_code: string
  product_name: string
  harvest_date: string
  field_locations: string[]
  quantity_harvested: number
  unit: string
  quality_grade?: string
  packaging_date?: string
  storage_conditions?: StorageConditions
  destination?: Destination[]
  traceability_chain: TraceabilityStep[]
  created_at: string
  updated_at: string
}

export interface StorageConditions {
  temperature: number
  humidity: number
  atmosphere?: string
  duration_days: number
}

export interface Destination {
  destination_type: 'customer' | 'market' | 'storage' | 'processing'
  destination_name: string
  quantity: number
  delivery_date: string
  transport_conditions?: string
}

export interface TraceabilityStep {
  step_number: number
  step_type: 'planting' | 'treatment' | 'harvest' | 'processing' | 'packaging' | 'storage' | 'transport'
  date: string
  location: string
  responsible_person: string
  inputs_used?: string[]
  conditions?: string
  documentation_reference?: string
}

// FV1.1.1 - Microbiological Risks
export interface GlobalGapMicrobiologicalRisk {
  id: string
  garden_id: string
  risk_assessment_date: string
  site_area: string
  risk_source: string
  pathogen_types: PathogenType[]
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  proximity_to_source?: number
  seasonal_variation?: string
  mitigation_measures: MitigationMeasure[]
  monitoring_frequency: string
  responsible_person: string
  created_at: string
  updated_at: string
}

export interface PathogenType {
  pathogen_name: string
  pathogen_category: 'bacteria' | 'virus' | 'parasite' | 'fungus'
  transmission_route: string[]
  survival_conditions: string
}

export interface MitigationMeasure {
  measure_type: string
  description: string
  implementation_frequency: string
  effectiveness_rating: number
  cost_estimate?: number
}

// FV1.1.2 - Microbiological Management Plan
export interface GlobalGapMicrobiologicalPlan {
  id: string
  garden_id: string
  plan_name: string
  plan_version: string
  effective_date: string
  identified_risks: string[]
  control_measures: ControlMeasure[]
  monitoring_procedures: MonitoringProcedure[]
  corrective_actions: CorrectiveAction[]
  verification_methods: VerificationMethod[]
  training_requirements?: TrainingRequirement[]
  record_keeping_procedures?: string
  review_frequency: string
  next_review_date: string
  approved_by: string
  status: 'active' | 'under_review' | 'expired'
  created_at: string
  updated_at: string
}

export interface ControlMeasure {
  measure_id: string
  risk_addressed: string
  control_type: 'preventive' | 'corrective' | 'monitoring'
  description: string
  implementation_method: string
  frequency: string
  responsible_person: string
  critical_limits?: string
}

export interface MonitoringProcedure {
  procedure_id: string
  what_to_monitor: string
  monitoring_method: string
  frequency: string
  responsible_person: string
  recording_method: string
  alert_criteria: string
}

export interface CorrectiveAction {
  action_id: string
  trigger_condition: string
  immediate_action: string
  investigation_required: boolean
  responsible_person: string
  documentation_required: string[]
  verification_method: string
}

export interface VerificationMethod {
  method_id: string
  verification_type: 'internal_audit' | 'external_audit' | 'testing' | 'observation'
  frequency: string
  responsible_person: string
  acceptance_criteria: string
  documentation_required: string[]
}

export interface TrainingRequirement {
  training_topic: string
  target_audience: string
  frequency: string
  training_method: string
  competency_assessment: boolean
}

// FV4.1.2a - Foliar Water Analysis
export interface GlobalGapFoliarWaterAnalysis {
  id: string
  garden_id: string
  analysis_date: string
  water_source: string
  intended_use: string
  days_before_harvest: number
  laboratory_name: string
  microbiological_parameters: MicrobiologicalParameter[]
  chemical_parameters?: ChemicalParameter[]
  compliance_status: 'compliant' | 'non_compliant' | 'conditional'
  restrictions_applied?: Restriction[]
  certificate_path?: string
  created_at: string
  updated_at: string
}

export interface MicrobiologicalParameter {
  parameter_name: string
  test_method: string
  result_value: number
  unit: string
  acceptable_limit: number
  status: 'pass' | 'fail'
}

export interface ChemicalParameter {
  parameter_name: string
  result_value: number
  unit: string
  acceptable_limit?: number
  status: 'acceptable' | 'unacceptable' | 'marginal'
}

export interface Restriction {
  restriction_type: string
  description: string
  duration_days: number
  monitoring_required: boolean
}

// FV5.1.1 - Harvest Hygiene Risks
export interface GlobalGapHarvestHygieneRisk {
  id: string
  garden_id: string
  assessment_date: string
  harvest_area: string
  risk_factors: RiskFactor[]
  contamination_sources: ContaminationSource[]
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  control_measures: HygieneControlMeasure[]
  monitoring_points: MonitoringPoint[]
  critical_control_points?: CriticalControlPoint[]
  training_needs?: TrainingNeed[]
  equipment_requirements?: EquipmentRequirement[]
  created_at: string
  updated_at: string
}

export interface RiskFactor {
  factor_type: 'worker' | 'equipment' | 'environment' | 'product'
  description: string
  likelihood: 'low' | 'medium' | 'high'
  severity: 'low' | 'medium' | 'high'
  risk_score: number
}

export interface ContaminationSource {
  source_type: string
  location: string
  pathogen_potential: string[]
  proximity_to_harvest: number
  seasonal_risk: string
}

export interface HygieneControlMeasure {
  measure_type: string
  description: string
  implementation_frequency: string
  responsible_person: string
  verification_method: string
}

export interface MonitoringPoint {
  point_id: string
  location: string
  what_to_monitor: string
  monitoring_frequency: string
  acceptable_criteria: string
}

export interface CriticalControlPoint {
  ccp_id: string
  hazard_controlled: string
  critical_limit: string
  monitoring_procedure: string
  corrective_action: string
  verification_method: string
}

export interface TrainingNeed {
  topic: string
  target_audience: string
  urgency: 'immediate' | 'within_month' | 'annual'
  training_method: string
}

export interface EquipmentRequirement {
  equipment_type: string
  specification: string
  quantity_needed: number
  priority: 'high' | 'medium' | 'low'
}

// FV5.1.2 - Harvest Procedures
export interface GlobalGapHarvestProcedure {
  id: string
  garden_id: string
  procedure_name: string
  procedure_version: string
  effective_date: string
  crop_specific: boolean
  applicable_crops?: string[]
  pre_harvest_requirements: PreHarvestRequirement[]
  worker_hygiene_procedures: WorkerHygieneProcedure[]
  equipment_sanitization: EquipmentSanitization[]
  container_requirements: ContainerRequirement[]
  field_hygiene_standards: FieldHygieneStandard[]
  quality_control_checks: QualityControlCheck[]
  documentation_requirements: DocumentationRequirement[]
  approved_by: string
  status: 'active' | 'under_review' | 'expired'
  created_at: string
  updated_at: string
}

export interface PreHarvestRequirement {
  requirement_type: string
  description: string
  timing: string
  responsible_person: string
  verification_method: string
}

export interface WorkerHygieneProcedure {
  procedure_step: string
  description: string
  frequency: string
  materials_required: string[]
  verification_method: string
}

export interface EquipmentSanitization {
  equipment_type: string
  cleaning_procedure: string
  sanitization_method: string
  frequency: string
  verification_criteria: string
}

export interface ContainerRequirement {
  container_type: string
  material_specification: string
  cleaning_requirement: string
  storage_conditions: string
  traceability_marking: boolean
}

export interface FieldHygieneStandard {
  standard_type: string
  description: string
  implementation_method: string
  monitoring_frequency: string
  acceptance_criteria: string
}

export interface QualityControlCheck {
  check_type: string
  description: string
  frequency: string
  responsible_person: string
  recording_method: string
  corrective_action: string
}

export interface DocumentationRequirement {
  document_type: string
  content_requirements: string[]
  retention_period: string
  responsible_person: string
}

// FV5.1.4 - Hygiene Training
export interface GlobalGapHygieneTraining {
  id: string
  garden_id: string
  training_date: string
  training_type: 'initial' | 'refresher' | 'specialized'
  participant_name: string
  participant_role: string
  training_topics: TrainingTopic[]
  training_duration: number
  trainer_name: string
  training_materials?: TrainingMaterial[]
  assessment_score?: number
  certificate_issued: boolean
  certificate_path?: string
  next_training_date?: string
  created_at: string
  updated_at: string
}

export interface TrainingTopic {
  topic_name: string
  duration_minutes: number
  learning_objectives: string[]
  assessment_method: string
}

export interface TrainingMaterial {
  material_type: 'presentation' | 'video' | 'handbook' | 'practical_demo'
  material_name: string
  language: string
  version: string
}

// FV5.2.1 - Handwashing Facilities
export interface GlobalGapHandwashingFacility {
  id: string
  garden_id: string
  facility_location: string
  facility_type: 'permanent' | 'portable' | 'temporary'
  water_source: string
  soap_dispenser: boolean
  paper_towels: boolean
  sanitizer_available: boolean
  waste_disposal: boolean
  inspection_date: string
  condition_status: 'excellent' | 'good' | 'needs_repair' | 'non_functional'
  maintenance_notes?: string
  distance_to_harvest_area?: number
  capacity_workers?: number
  created_at: string
  updated_at: string
}

// Compliance Checklist
export interface GlobalGapComplianceChecklist {
  id: string
  garden_id: string
  module_code: 'AF' | 'CB' | 'FV'
  control_point: string
  description: string
  compliance_status: 'compliant' | 'non_compliant' | 'not_applicable'
  evidence_type?: string
  evidence_reference?: string
  last_verified?: string
  verified_by?: string
  notes?: string
  corrective_action?: string
  target_completion_date?: string
  created_at: string
  updated_at: string
}

// Complete Compliance Overview
export interface CompleteComplianceOverview {
  af_module: {
    total_points: number
    compliant_points: number
    compliance_percentage: number
    critical_gaps: string[]
  }
  cb_module: {
    total_points: number
    compliant_points: number
    compliance_percentage: number
    critical_gaps: string[]
  }
  fv_module: {
    total_points: number
    compliant_points: number
    compliance_percentage: number
    critical_gaps: string[]
  }
  overall_compliance: number
  certification_readiness: 'not_ready' | 'partially_ready' | 'ready' | 'certified'
  next_audit_date?: string
  certification_body?: string
}