import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { NextRequest } from 'next/server'
import { GET as csvGet } from '@/app/api/export/csv/route'
import { GET as adminGet } from '@/app/api/admin/overview/route'
import { renderExportCsv, renderExportPdf, type ExportEnvelope } from '@/services/regulatoryExportService.server'

const envelope: ExportEnvelope = {
  schemaVersion: 'ortomio-export-v2', generatedAt: '2026-07-17T12:00:00.000Z', timezone: 'Europe/Rome',
  gardenId: '10000000-0000-0000-0000-000000000001', gardenName: 'Orto Test', dataset: 'treatments',
  period: { from: '2026-07-01', to: '2026-07-17' }, sourceTables: ['treatment_register'],
  rows: [{ product: '=HYPERLINK("bad")', dose: 2, unit: 'L' }],
}

test('CSV includes stable metadata and neutralizes spreadsheet formulas', () => {
  const csv = new TextDecoder().decode(renderExportCsv(envelope))
  assert.match(csv, /ortomio-export-v2/)
  assert.match(csv, /Europe\/Rome/)
  assert.match(csv, /treatment_register/)
  assert.match(csv, /'=HYPERLINK/)
})

test('PDF export is a real paginated PDF payload', () => {
  const pdf = renderExportPdf({ ...envelope, rows: Array.from({ length: 140 }, (_, index) => ({ index, note: `record ${index}` })) })
  assert.equal(new TextDecoder().decode(pdf.slice(0, 5)), '%PDF-')
  assert.ok(pdf.byteLength > 1000)
})

test('anonymous garden and admin exports are rejected server-side', async () => {
  const csv = await csvGet(new NextRequest('http://localhost/api/export/csv?garden_id=10000000-0000-0000-0000-000000000001&dataset=tasks'))
  const admin = await adminGet(new NextRequest('http://localhost/api/admin/overview'))
  assert.equal(csv.status, 401)
  assert.equal(admin.status, 401)
})

test('export routes contain no mock/bypass data and require persisted audit', () => {
  const routes = readFileSync('app/api/export/csv/route.ts', 'utf8') + readFileSync('app/api/export/pdf/route.ts', 'utf8')
  assert.doesNotMatch(routes, /mock|BYPASS_MODE|text\/plain/)
  assert.match(routes, /requireGardenAccess/)
  assert.match(routes, /export_audit_log/)
  assert.match(routes, /application\/pdf/)
})

test('certification overview has no fixed GlobalGAP progress or official certification claim', () => {
  const dashboard = readFileSync('components/certifications/CertificationsDashboard.tsx', 'utf8')
  assert.doesNotMatch(dashboard, /progress:\s*45/)
  assert.match(dashboard, /getCompleteComplianceOverview/)
  assert.match(dashboard, /non esegue submission ufficiali/)
})

test('admin actions are server-backed and provider health exposes no secret values', () => {
  const page = readFileSync('app/app/admin/page.tsx', 'utf8')
  const route = readFileSync('app/api/admin/overview/route.ts', 'utf8')
  assert.doesNotMatch(page, /Gestisci Backup|Visualizza Log|last_sign_in_at'\)/)
  assert.match(route, /requireAdmin/)
  assert.match(route, /admin_audit_log/)
  assert.match(route, /Boolean\(process\.env/)
})

test('P7 migration makes regulatory evidence append-only and excludes demo evidence', () => {
  const sql = readFileSync('supabase/migrations/20260717050000_p7_regulatory_exports_admin.sql', 'utf8')
  assert.match(sql, /certification_evidence_events/)
  assert.match(sql, /regulatory_events_are_append_only/)
  assert.match(sql, /source_kind IN \('observed', 'imported'\) OR certification_eligible = false/)
  assert.match(sql, /export_audit_log/)
  assert.match(sql, /admin_audit_log/)
})
