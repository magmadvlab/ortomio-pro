import { NextRequest, NextResponse } from 'next/server'
import { accessErrorResponse, getSupabaseClient, requireGardenAccess } from '@/lib/auth.server'
import {
  EXPORT_SCHEMA_VERSION,
  EXPORT_TIMEZONE,
  ExportDataset,
  loadAuthorizedExportDataset,
  renderExportPdf,
  sha256Hex,
} from '@/services/regulatoryExportService.server'

const DATASETS = new Set<ExportDataset>(['garden', 'tasks', 'diary', 'treatments', 'certification_dossier'])
const validDate = (value: string | null) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value)

export async function GET(request: NextRequest) {
  try {
    const gardenId = request.nextUrl.searchParams.get('garden_id') || ''
    const dataset = (request.nextUrl.searchParams.get('dataset') || 'tasks') as ExportDataset
    const from = request.nextUrl.searchParams.get('from')
    const to = request.nextUrl.searchParams.get('to')
    if (!DATASETS.has(dataset) || !validDate(from) || !validDate(to) || (from && to && from > to)) {
      return NextResponse.json({ error: 'invalid_export_request' }, { status: 400 })
    }

    const { user, garden } = await requireGardenAccess(request, gardenId)
    const supabase = getSupabaseClient()
    const envelope = await loadAuthorizedExportDataset(supabase, garden, dataset, { from, to })
    const content = renderExportPdf(envelope)
    const checksum = sha256Hex(content)
    const { error: auditError } = await supabase.from('export_audit_log').insert({
      user_id: user.id, garden_id: gardenId, dataset, format: 'pdf', schema_version: EXPORT_SCHEMA_VERSION,
      period_from: from, period_to: to, row_count: envelope.rows.length, content_sha256: checksum,
      timezone: EXPORT_TIMEZONE, source_tables: envelope.sourceTables,
    })
    if (auditError) throw new Error(`export_audit_failed:${auditError.message}`)

    return new NextResponse(content.buffer as ArrayBuffer, { headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="ortomio-${dataset}-${new Date().toISOString().slice(0, 10)}.pdf"`,
      'Cache-Control': 'private, no-store', 'X-OrtoMio-Schema-Version': EXPORT_SCHEMA_VERSION, 'X-Content-SHA256': checksum,
    } })
  } catch (error) {
    const access = accessErrorResponse(error)
    if (access) return access
    console.error('Export PDF error:', error)
    return NextResponse.json({ error: 'export_unavailable' }, { status: 503 })
  }
}
