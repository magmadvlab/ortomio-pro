import { getSupabaseClient } from '../config/supabase'
import type { BioCertificationData } from '../components/certifications/BioCertificationForm'

export interface BioCertificationRecord extends BioCertificationData {
  id: string
  complianceScore: number
  readinessStatus?: 'ready' | 'partially_ready' | 'not_ready'
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'expired'
  documentCount?: number
  inspectionCount?: number
  createdAt?: string
  updatedAt?: string
}

type BioCertificationRow = {
  id: string
  company_name: string
  vat_number: string | null
  address: string | null
  certification_body: string
  certification_number: string | null
  certification_date: string | null
  expiry_date: string | null
  total_area: number | string | null
  organic_area: number | string | null
  conversion_area: number | string | null
  conventional_area: number | string | null
  uses_chemical_fertilizers: boolean | null
  uses_synthetic_pesticides: boolean | null
  uses_gmo: boolean | null
  has_buffer_zones: boolean | null
  buffer_zone_width: number | string | null
  has_traceability_system: boolean | null
  separates_organic_conventional: boolean | null
  keeps_production_records: boolean | null
  last_inspection_date: string | null
  next_inspection_date: string | null
  non_conformities: string | null
  corrective_actions: string | null
  compliance_score: number | null
  readiness_status?: 'ready' | 'partially_ready' | 'not_ready'
  status: BioCertificationRecord['status']
  document_count?: number
  inspection_count?: number
  created_at?: string
  updated_at?: string
}

function emptyToNull(value: string): string | null {
  return value.trim() ? value : null
}

function toNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined || value === '') return 0
  return Number(value) || 0
}

function mapBioRow(row: BioCertificationRow): BioCertificationRecord {
  return {
    id: row.id,
    companyName: row.company_name || '',
    vatNumber: row.vat_number || '',
    address: row.address || '',
    certificationBody: row.certification_body || '',
    certificationNumber: row.certification_number || '',
    certificationDate: row.certification_date || '',
    expiryDate: row.expiry_date || '',
    totalArea: toNumber(row.total_area),
    organicArea: toNumber(row.organic_area),
    conversionArea: toNumber(row.conversion_area),
    conventionalArea: toNumber(row.conventional_area),
    usesChemicalFertilizers: row.uses_chemical_fertilizers ?? false,
    usesSyntheticPesticides: row.uses_synthetic_pesticides ?? false,
    usesGMO: row.uses_gmo ?? false,
    hasBufferZones: row.has_buffer_zones ?? true,
    bufferZoneWidth: toNumber(row.buffer_zone_width),
    hasTraceabilitySystem: row.has_traceability_system ?? true,
    separatesOrganicConventional: row.separates_organic_conventional ?? true,
    keepsProductionRecords: row.keeps_production_records ?? true,
    lastInspectionDate: row.last_inspection_date || '',
    nextInspectionDate: row.next_inspection_date || '',
    nonConformities: row.non_conformities || '',
    correctiveActions: row.corrective_actions || '',
    complianceScore: row.compliance_score ?? 0,
    readinessStatus: row.readiness_status,
    status: row.status,
    documentCount: row.document_count,
    inspectionCount: row.inspection_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

function toBioPayload(gardenId: string, data: BioCertificationData) {
  return {
    garden_id: gardenId,
    company_name: data.companyName,
    vat_number: emptyToNull(data.vatNumber),
    address: emptyToNull(data.address),
    certification_body: data.certificationBody,
    certification_number: emptyToNull(data.certificationNumber),
    certification_date: emptyToNull(data.certificationDate),
    expiry_date: emptyToNull(data.expiryDate),
    total_area: data.totalArea,
    organic_area: data.organicArea,
    conversion_area: data.conversionArea,
    conventional_area: data.conventionalArea,
    uses_chemical_fertilizers: data.usesChemicalFertilizers,
    uses_synthetic_pesticides: data.usesSyntheticPesticides,
    uses_gmo: data.usesGMO,
    has_buffer_zones: data.hasBufferZones,
    buffer_zone_width: data.bufferZoneWidth,
    has_traceability_system: data.hasTraceabilitySystem,
    separates_organic_conventional: data.separatesOrganicConventional,
    keeps_production_records: data.keepsProductionRecords,
    last_inspection_date: emptyToNull(data.lastInspectionDate),
    next_inspection_date: emptyToNull(data.nextInspectionDate),
    non_conformities: emptyToNull(data.nonConformities),
    corrective_actions: emptyToNull(data.correctiveActions)
  }
}

class BioCertificationService {
  private getSupabase() {
    const client = getSupabaseClient()
    if (!client) {
      throw new Error('Supabase non configurato: il ciclo BIO richiede persistenza database.')
    }
    return client
  }

  async getLatestByGarden(gardenId: string): Promise<BioCertificationRecord | null> {
    const { data, error } = await this.getSupabase()
      .from('bio_certifications_with_readiness')
      .select('*')
      .eq('garden_id', gardenId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) throw error
    return data ? mapBioRow(data as BioCertificationRow) : null
  }

  async upsertForGarden(gardenId: string, data: BioCertificationData, existingId?: string | null): Promise<BioCertificationRecord> {
    const payload = toBioPayload(gardenId, data)

    const query = existingId
      ? this.getSupabase().from('bio_certifications').update(payload).eq('id', existingId)
      : this.getSupabase().from('bio_certifications').insert(payload)

    const { data: saved, error } = await query.select('*').single()
    if (error) throw error

    const hydrated = await this.getLatestByGarden(gardenId)
    return hydrated || mapBioRow(saved as BioCertificationRow)
  }
}

export const bioCertificationService = new BioCertificationService()
export default bioCertificationService
