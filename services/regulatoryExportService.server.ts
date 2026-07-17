import 'server-only'
import { createHash } from 'node:crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import { jsPDF } from 'jspdf'

export const EXPORT_SCHEMA_VERSION = 'ortomio-export-v2'
export const EXPORT_TIMEZONE = 'Europe/Rome'
export type ExportDataset = 'garden' | 'tasks' | 'diary' | 'treatments' | 'certification_dossier'

export type ExportEnvelope = {
  schemaVersion: string
  generatedAt: string
  timezone: string
  gardenId: string
  gardenName: string
  dataset: ExportDataset
  period: { from: string | null; to: string | null }
  sourceTables: string[]
  rows: Array<Record<string, string | number | boolean | null>>
}

const asText = (value: unknown): string => {
  if (value === null || value === undefined) return ''
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

const csvCell = (value: unknown): string => {
  let text = asText(value)
  if (/^[=+\-@]/.test(text)) text = `'${text}`
  return `"${text.replace(/"/g, '""')}"`
}

const applyPeriod = (query: any, column: string, from?: string | null, to?: string | null) => {
  let result = query
  if (from) result = result.gte(column, from)
  if (to) result = result.lte(column, to)
  return result
}

const ensureRows = (data: unknown, error: any, table: string): any[] => {
  if (error) throw new Error(`export_source_unavailable:${table}:${error.message || error.code || 'unknown'}`)
  return Array.isArray(data) ? data : []
}

export async function loadAuthorizedExportDataset(
  supabase: SupabaseClient,
  garden: Record<string, any>,
  dataset: ExportDataset,
  period: { from?: string | null; to?: string | null } = {},
): Promise<ExportEnvelope> {
  let rows: ExportEnvelope['rows'] = []
  let sourceTables: string[] = []

  if (dataset === 'garden') {
    sourceTables = ['gardens']
    rows = [{
      id: garden.id,
      name: garden.name || '',
      type: garden.type || garden.garden_type || '',
      sizeSqMeters: Number(garden.size_sqm ?? garden.sizeSqMeters ?? 0),
      latitude: garden.coordinates?.latitude ?? garden.latitude ?? null,
      longitude: garden.coordinates?.longitude ?? garden.longitude ?? null,
      createdAt: garden.created_at || '',
    }]
  } else if (dataset === 'tasks') {
    sourceTables = ['garden_tasks']
    const response = await applyPeriod(
      supabase.from('garden_tasks').select('id,date,plant_name,variety,task_type,completed,actual_completed_date,notes').eq('garden_id', garden.id),
      'date', period.from, period.to,
    ).order('date', { ascending: true })
    rows = ensureRows(response.data, response.error, 'garden_tasks').map(row => ({
      id: row.id, date: row.date, plant: row.plant_name, variety: row.variety,
      operation: row.task_type, completed: Boolean(row.completed), completedAt: row.actual_completed_date, notes: row.notes,
    }))
  } else if (dataset === 'diary') {
    sourceTables = ['daily_diary_entries']
    const response = await applyPeriod(
      supabase.from('daily_diary_entries').select('id,date,weather_data,agronomic_data,lunar_phase,automated_events,notes').eq('garden_id', garden.id),
      'date', period.from, period.to,
    ).order('date', { ascending: true })
    rows = ensureRows(response.data, response.error, 'daily_diary_entries').map(row => ({
      id: row.id, date: row.date, weather: asText(row.weather_data), agronomy: asText(row.agronomic_data),
      lunarPhase: asText(row.lunar_phase), recordedEvents: asText(row.automated_events), notes: row.notes,
    }))
  } else if (dataset === 'treatments') {
    sourceTables = ['treatment_register']
    const response = await applyPeriod(
      supabase.from('treatment_register').select('id,treatment_date,crop_name,product_name,active_ingredient,dosage,dosage_unit,area_treated,method,reason,operator_name,registration_number,product_lot_code,pre_harvest_interval_days,organic_approved,certification_compliance,notes').eq('garden_id', garden.id),
      'treatment_date', period.from, period.to,
    ).order('treatment_date', { ascending: true })
    rows = ensureRows(response.data, response.error, 'treatment_register').map(row => ({
      id: row.id, date: row.treatment_date, crop: row.crop_name, product: row.product_name,
      activeIngredient: row.active_ingredient, dose: row.dosage, unit: row.dosage_unit,
      areaSqm: row.area_treated, method: row.method, reason: row.reason, operator: row.operator_name,
      registrationNumber: row.registration_number, productLot: row.product_lot_code,
      preHarvestIntervalDays: row.pre_harvest_interval_days, organicApproved: row.organic_approved,
      certificationCompliance: asText(row.certification_compliance), notes: row.notes,
    }))
  } else {
    sourceTables = ['certifications', 'bio_certifications', 'certification_documents', 'certification_evidence_events']
    const [certs, bio, documents, events] = await Promise.all([
      supabase.from('certifications').select('id,type,status,valid_from,valid_until,certifying_body,certificate_number,updated_at').eq('garden_id', garden.id),
      supabase.from('bio_certifications').select('id,status,certification_body,certification_number,certification_date,expiry_date,compliance_score,updated_at').eq('garden_id', garden.id),
      supabase.from('certification_documents').select('id,certification_type,title,type,version,status,source_kind,source_reference,content_sha256,created_at').eq('garden_id', garden.id),
      supabase.from('certification_evidence_events').select('id,certification_type,event_type,entity_type,entity_id,operator_id,occurred_at,source_kind,certification_eligible,source_reference,payload').eq('garden_id', garden.id),
    ])
    const rawCerts = ensureRows(certs.data, certs.error, 'certifications')
    const rawBio = ensureRows(bio.data, bio.error, 'bio_certifications')
    const rawDocuments = ensureRows(documents.data, documents.error, 'certification_documents')
    const rawEvents = ensureRows(events.data, events.error, 'certification_evidence_events')
    const eligibleDocuments = rawDocuments.filter(row => row.source_kind === 'observed' || row.source_kind === 'imported')
    const eligibleEvents = rawEvents.filter(row => row.certification_eligible === true && (row.source_kind === 'observed' || row.source_kind === 'imported'))
    const anomalies = [
      ...rawCerts.filter(row => ['NON_COMPLIANT', 'EXPIRED', 'SUSPENDED'].includes(row.status)),
      ...rawBio.filter(row => ['rejected', 'expired'].includes(row.status)),
    ]
    const summary = {
      recordType: 'dossier_summary', certifications: rawCerts.length + rawBio.length,
      eligibleDocuments: eligibleDocuments.length, eligibleEvents: eligibleEvents.length,
      excludedDemoOrSimulated: (rawDocuments.length - eligibleDocuments.length) + (rawEvents.length - eligibleEvents.length),
      anomalies: anomalies.length,
    }
    const certRows = rawCerts.map(row => ({ recordType: 'certification', ...row }))
    const bioRows = rawBio.map(row => ({ recordType: 'bio_certification', ...row }))
    const documentRows = eligibleDocuments.map(row => ({ recordType: 'document', ...row }))
    const eventRows = eligibleEvents.map(row => ({ recordType: 'evidence_event', ...row, payload: asText(row.payload) }))
    rows = [summary, ...certRows, ...bioRows, ...documentRows, ...eventRows]
  }

  return {
    schemaVersion: EXPORT_SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    timezone: EXPORT_TIMEZONE,
    gardenId: garden.id,
    gardenName: garden.name || garden.id,
    dataset,
    period: { from: period.from || null, to: period.to || null },
    sourceTables,
    rows,
  }
}

export function renderExportCsv(envelope: ExportEnvelope): Uint8Array {
  const metadata = [
    ['schema_version', envelope.schemaVersion], ['generated_at', envelope.generatedAt],
    ['timezone', envelope.timezone], ['garden_id', envelope.gardenId], ['garden_name', envelope.gardenName],
    ['dataset', envelope.dataset], ['period_from', envelope.period.from || ''], ['period_to', envelope.period.to || ''],
    ['source_tables', envelope.sourceTables.join('|')],
  ].map(([key, value]) => `${csvCell(key)},${csvCell(value)}`)
  const headers = [...new Set(envelope.rows.flatMap(row => Object.keys(row)))]
  const body = envelope.rows.map(row => headers.map(header => csvCell(row[header])).join(','))
  const csv = ['sep=,', ...metadata, '', headers.map(csvCell).join(','), ...body].join('\r\n')
  return new TextEncoder().encode(`\uFEFF${csv}`)
}

export function renderExportPdf(envelope: ExportEnvelope): Uint8Array {
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
  const margin = 14
  const pageBottom = 282
  let y = 16
  const addLine = (text: string, size = 9) => {
    pdf.setFontSize(size)
    const lines = pdf.splitTextToSize(text, 182)
    for (const line of lines) {
      if (y > pageBottom) { pdf.addPage(); y = 16 }
      pdf.text(line, margin, y)
      y += size * 0.45 + 1.5
    }
  }
  addLine('OrtoMio - Export dati', 16)
  addLine(`Schema: ${envelope.schemaVersion} | Generato: ${envelope.generatedAt} | Timezone: ${envelope.timezone}`)
  addLine(`Orto: ${envelope.gardenName} (${envelope.gardenId})`)
  addLine(`Dataset: ${envelope.dataset} | Periodo: ${envelope.period.from || 'inizio'} - ${envelope.period.to || 'fine'}`)
  addLine(`Fonti: ${envelope.sourceTables.join(', ')} | Record: ${envelope.rows.length}`)
  y += 3
  if (envelope.rows.length === 0) addLine('Nessun record disponibile per i filtri selezionati.', 10)
  envelope.rows.forEach((row, index) => {
    addLine(`${index + 1}. ${Object.entries(row).map(([key, value]) => `${key}: ${asText(value)}`).join(' | ')}`)
    y += 1
  })
  return new Uint8Array(pdf.output('arraybuffer'))
}

export function sha256Hex(content: Uint8Array): string {
  return createHash('sha256').update(content).digest('hex')
}
