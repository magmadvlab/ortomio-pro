/**
 * Types for Unified Certifications System
 * Sistema unificato per tutte le certificazioni: HACCP, GlobalG.A.P., Biologico, etc.
 */

// Base certification interface
export interface BaseCertification {
  id: string
  gardenId: string
  type: CertificationType
  status: CertificationStatus
  validFrom?: string
  validUntil?: string
  certifyingBody?: string
  certificateNumber?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export type CertificationType = 
  | 'GLOBALGAP'
  | 'HACCP'
  | 'ORGANIC_EU'
  | 'ORGANIC_ICEA'
  | 'ORGANIC_CCPB'
  | 'BRC'
  | 'IFS'
  | 'ISO22000'
  | 'GRASP'
  | 'RAINFOREST'
  | 'FAIRTRADE'

export type CertificationStatus = 
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'COMPLIANT'
  | 'NON_COMPLIANT'
  | 'EXPIRED'
  | 'SUSPENDED'

// HACCP Specific Types
export interface HACCPSystem {
  id: string
  gardenId: string
  teamLeader: string
  teamMembers: HACCPTeamMember[]
  hazardAnalysis: HazardAnalysis[]
  criticalControlPoints: CriticalControlPoint[]
  monitoringProcedures: MonitoringProcedure[]
  correctiveActions: CorrectiveAction[]
  verificationActivities: VerificationActivity[]
  recordKeeping: RecordKeepingSystem
  status: CertificationStatus
  lastReview: string
  nextReview: string
  createdAt: string
  updatedAt: string
}

export interface HACCPTeamMember {
  id: string
  name: string
  role: string
  qualifications: string[]
  responsibilities: string[]
  contactInfo: string
}

export interface HazardAnalysis {
  id: string
  processStep: string
  hazardType: 'BIOLOGICAL' | 'CHEMICAL' | 'PHYSICAL'
  hazardDescription: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH'
  likelihood: 'LOW' | 'MEDIUM' | 'HIGH'
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  preventiveMeasures: string[]
  isCCP: boolean
}

export interface CriticalControlPoint {
  id: string
  hazardAnalysisId: string
  step: string
  hazard: string
  criticalLimit: string
  monitoringProcedure: string
  frequency: string
  responsibility: string
  correctiveAction: string
  verification: string
  records: string
}

export interface MonitoringProcedure {
  id: string
  ccpId: string
  parameter: string
  method: string
  frequency: string
  responsibility: string
  equipment: string
  calibration: string
  recordForm: string
}

export interface CorrectiveAction {
  id: string
  ccpId: string
  deviation: string
  immediateAction: string
  rootCauseAnalysis: string
  preventiveAction: string
  responsibility: string
  verification: string
  recordKeeping: string
}

export interface VerificationActivity {
  id: string
  activity: string
  method: string
  frequency: string
  responsibility: string
  criteria: string
  records: string
}

export interface RecordKeepingSystem {
  id: string
  monitoringRecords: RecordType[]
  correctiveActionRecords: RecordType[]
  verificationRecords: RecordType[]
  calibrationRecords: RecordType[]
  trainingRecords: RecordType[]
  retentionPeriod: string
  storageLocation: string
  accessControl: string
}

export interface RecordType {
  name: string
  format: 'PAPER' | 'DIGITAL' | 'BOTH'
  frequency: string
  responsibility: string
  retention: string
}

// Organic Certification Types
export interface OrganicCertification {
  id: string
  gardenId: string
  certifyingBody: 'ICEA' | 'CCPB' | 'BIOAGRICERT' | 'SUOLO_E_SALUTE' | 'OTHER'
  certificateNumber: string
  validFrom: string
  validUntil: string
  scope: OrganicScope[]
  conversionStatus: ConversionStatus
  conversionStartDate?: string
  conversionEndDate?: string
  organicManagementPlan: OrganicManagementPlan
  inputsRegister: OrganicInput[]
  salesRegister: OrganicSale[]
  inspectionReports: InspectionReport[]
  status: CertificationStatus
  createdAt: string
  updatedAt: string
}

export type OrganicScope = 
  | 'CROP_PRODUCTION'
  | 'LIVESTOCK'
  | 'PROCESSING'
  | 'IMPORT'
  | 'DISTRIBUTION'

export type ConversionStatus = 
  | 'CONVENTIONAL'
  | 'IN_CONVERSION_1'
  | 'IN_CONVERSION_2'
  | 'IN_CONVERSION_3'
  | 'ORGANIC'

export interface OrganicManagementPlan {
  id: string
  cropRotation: CropRotationPlan[]
  fertilityManagement: FertilityManagement
  pestManagement: PestManagement
  seedsAndPlantingMaterial: SeedManagement
  harvestAndStorage: HarvestManagement
  bufferZones: BufferZone[]
}

export interface CropRotationPlan {
  year: number
  field: string
  crop: string
  variety: string
  plantingDate: string
  harvestDate: string
  previousCrop: string
  nextCrop: string
}

export interface FertilityManagement {
  soilAnalysis: SoilAnalysis[]
  organicFertilizers: OrganicFertilizer[]
  compostPlan: CompostPlan
  greenManure: GreenManure[]
}

export interface SoilAnalysis {
  date: string
  field: string
  ph: number
  organicMatter: number
  nitrogen: number
  phosphorus: number
  potassium: number
  laboratory: string
  reportNumber: string
}

export interface OrganicFertilizer {
  name: string
  type: 'COMPOST' | 'MANURE' | 'GREEN_MANURE' | 'ORGANIC_FERTILIZER'
  supplier: string
  certificate: string
  applicationRate: string
  applicationMethod: string
  restrictions: string[]
}

export interface CompostPlan {
  materials: CompostMaterial[]
  process: string
  temperature: string
  turningSchedule: string
  maturationTime: string
  qualityTests: string[]
}

export interface CompostMaterial {
  material: string
  source: string
  ratio: number
  carbonNitrogenRatio: number
  restrictions: string[]
}

export interface GreenManure {
  species: string
  sowingDate: string
  incorporationDate: string
  purpose: string[]
  field: string
}

export interface PestManagement {
  preventiveMeasures: PreventiveMeasure[]
  biologicalControl: BiologicalControl[]
  allowedProducts: AllowedProduct[]
  prohibitedProducts: string[]
  applicationRecords: ApplicationRecord[]
}

export interface PreventiveMeasure {
  measure: string
  target: string
  timing: string
  effectiveness: string
}

export interface BiologicalControl {
  agent: string
  target: string
  supplier: string
  applicationMethod: string
  timing: string
}

export interface AllowedProduct {
  name: string
  activeIngredient: string
  supplier: string
  certificate: string
  restrictions: string[]
  preHarvestInterval: number
}

export interface ApplicationRecord {
  date: string
  product: string
  field: string
  crop: string
  target: string
  rate: string
  method: string
  weather: string
  operator: string
}

export interface SeedManagement {
  organicSeeds: OrganicSeed[]
  derogations: SeedDerogation[]
  treatmentRecords: SeedTreatment[]
}

export interface OrganicSeed {
  crop: string
  variety: string
  supplier: string
  certificate: string
  quantity: string
  lotNumber: string
}

export interface SeedDerogation {
  crop: string
  variety: string
  reason: string
  authority: string
  approvalNumber: string
  validUntil: string
}

export interface SeedTreatment {
  crop: string
  variety: string
  treatment: string
  product: string
  certificate: string
  date: string
}

export interface HarvestManagement {
  harvestProcedures: HarvestProcedure[]
  storageConditions: StorageCondition[]
  cleaningProcedures: CleaningProcedure[]
  segregation: SegregationProcedure[]
}

export interface HarvestProcedure {
  crop: string
  method: string
  equipment: string
  cleaning: string
  contamination: string[]
}

export interface StorageCondition {
  product: string
  facility: string
  temperature: string
  humidity: string
  ventilation: string
  pestControl: string
}

export interface CleaningProcedure {
  equipment: string
  procedure: string
  frequency: string
  verification: string
}

export interface SegregationProcedure {
  product: string
  method: string
  identification: string
  documentation: string
}

export interface BufferZone {
  location: string
  width: number
  purpose: string
  management: string
  monitoring: string
}

export interface OrganicInput {
  date: string
  type: 'SEED' | 'FERTILIZER' | 'PESTICIDE' | 'EQUIPMENT' | 'SERVICE'
  product: string
  supplier: string
  certificate: string
  quantity: string
  cost: number
  field: string
  purpose: string
}

export interface OrganicSale {
  date: string
  product: string
  quantity: string
  unit: string
  buyer: string
  certificate: string
  price: number
  field: string
  harvestDate: string
}

export interface InspectionReport {
  date: string
  inspector: string
  type: 'ANNUAL' | 'SURVEILLANCE' | 'UNANNOUNCED'
  findings: InspectionFinding[]
  nonConformities: NonConformity[]
  correctiveActions: InspectionCorrectiveAction[]
  status: 'PASSED' | 'CONDITIONAL' | 'FAILED'
  nextInspection: string
}

export interface InspectionFinding {
  area: string
  observation: string
  evidence: string
  recommendation: string
}

export interface NonConformity {
  id: string
  severity: 'MINOR' | 'MAJOR' | 'CRITICAL'
  description: string
  requirement: string
  evidence: string
  correctiveAction: string
  deadline: string
  status: 'OPEN' | 'CLOSED' | 'VERIFIED'
}

export interface InspectionCorrectiveAction {
  nonConformityId: string
  action: string
  responsibility: string
  deadline: string
  evidence: string
  verification: string
  status: 'PLANNED' | 'IMPLEMENTED' | 'VERIFIED'
}

// Certification Dashboard Types
export interface CertificationOverview {
  gardenId: string
  totalCertifications: number
  activeCertifications: number
  expiringSoon: number
  nonCompliant: number
  certificationsByType: Record<CertificationType, CertificationStatus>
  upcomingDeadlines: CertificationDeadline[]
  recentActivities: CertificationActivity[]
}

export interface CertificationDeadline {
  certificationType: CertificationType
  description: string
  dueDate: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'PENDING' | 'COMPLETED' | 'OVERDUE'
}

export interface CertificationActivity {
  id: string
  certificationType: CertificationType
  activity: string
  date: string
  user: string
  status: 'SUCCESS' | 'WARNING' | 'ERROR'
}

// Audit and Inspection Types
export interface AuditSchedule {
  id: string
  gardenId: string
  certificationType: CertificationType
  auditType: 'INTERNAL' | 'EXTERNAL' | 'SURVEILLANCE' | 'RECERTIFICATION'
  scheduledDate: string
  auditor: string
  scope: string[]
  checklist: AuditChecklistItem[]
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  createdAt: string
  updatedAt: string
}

export interface AuditChecklistItem {
  id: string
  section: string
  requirement: string
  evidence: string
  conformity: 'COMPLIANT' | 'NON_COMPLIANT' | 'NOT_APPLICABLE' | 'OBSERVATION'
  notes: string
  corrective_action?: string
}

// Training and Competence Types
export interface TrainingProgram {
  id: string
  gardenId: string
  title: string
  description: string
  certificationType: CertificationType[]
  mandatory: boolean
  frequency: string
  duration: string
  trainer: string
  materials: TrainingMaterial[]
  participants: TrainingParticipant[]
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  createdAt: string
  updatedAt: string
}

export interface TrainingMaterial {
  id: string
  title: string
  type: 'DOCUMENT' | 'VIDEO' | 'PRESENTATION' | 'QUIZ'
  url: string
  mandatory: boolean
}

export interface TrainingParticipant {
  id: string
  name: string
  role: string
  completionDate?: string
  score?: number
  certificate?: string
  status: 'ENROLLED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
}

// Document Management Types
export interface CertificationDocument {
  id: string
  gardenId: string
  certificationType: CertificationType
  title: string
  description: string
  type: 'PROCEDURE' | 'RECORD' | 'CERTIFICATE' | 'REPORT' | 'MANUAL'
  version: string
  approvedBy: string
  approvalDate: string
  effectiveDate: string
  reviewDate: string
  status: 'DRAFT' | 'APPROVED' | 'OBSOLETE'
  filePath: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

// Supplier Management Types
export interface CertifiedSupplier {
  id: string
  gardenId: string
  name: string
  type: 'SEED' | 'FERTILIZER' | 'PESTICIDE' | 'EQUIPMENT' | 'SERVICE'
  certifications: SupplierCertification[]
  evaluations: SupplierEvaluation[]
  contracts: SupplierContract[]
  status: 'APPROVED' | 'CONDITIONAL' | 'SUSPENDED' | 'REJECTED'
  createdAt: string
  updatedAt: string
}

export interface SupplierCertification {
  type: CertificationType
  certificateNumber: string
  validFrom: string
  validUntil: string
  certifyingBody: string
  scope: string[]
  status: 'VALID' | 'EXPIRED' | 'SUSPENDED'
}

export interface SupplierEvaluation {
  date: string
  evaluator: string
  criteria: EvaluationCriteria[]
  overallScore: number
  recommendations: string[]
  nextEvaluation: string
}

export interface EvaluationCriteria {
  criterion: string
  weight: number
  score: number
  notes: string
}

export interface SupplierContract {
  contractNumber: string
  startDate: string
  endDate: string
  products: string[]
  terms: string[]
  status: 'ACTIVE' | 'EXPIRED' | 'TERMINATED'
}