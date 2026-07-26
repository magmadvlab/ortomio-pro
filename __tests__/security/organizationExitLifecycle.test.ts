import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { NextRequest } from 'next/server'
import { handleAdminOrganizationLifecycle } from '@/app/api/organizations/lifecycle/route'

const migration = readFileSync(
  'supabase/migrations/20260726170000_organization_exit_and_support_lifecycle.sql',
  'utf8',
)
const lifecycleRoute = readFileSync('app/api/organizations/lifecycle/route.ts', 'utf8')
const supportRoute = readFileSync('app/api/admin/organization-support/route.ts', 'utf8')

test('cancellation requires a prior export and an explicit retention policy', () => {
  const cancellation = migration.slice(
    migration.indexOf('CREATE OR REPLACE FUNCTION public.schedule_pro_organization_cancellation'),
    migration.indexOf('CREATE OR REPLACE FUNCTION public.set_organization_legal_hold'),
  )
  assert.match(cancellation, /event_type = 'DataExported'/)
  assert.match(cancellation, /data_export_required_before_cancellation/)
  assert.match(cancellation, /p_retention_until <= current_date/)
  assert.match(cancellation, /p_policy_reference/)
  assert.match(cancellation, /status = 'Cancelled'/)
  assert.match(cancellation, /SET status = 'Suspended'/)
  assert.match(cancellation, /SET is_active = false/)
  assert.doesNotMatch(cancellation, /interval\s+'(?:30|60|90) days'/i)
})

test('organization export omits invitation tokens and is checksummed before audit', () => {
  assert.match(lifecycleRoute, /action === 'export_data'/)
  assert.match(lifecycleRoute, /createHash\('sha256'\)/)
  assert.match(lifecycleRoute, /record_organization_data_export/)
  assert.match(lifecycleRoute, /'X-Content-SHA256'/)
  assert.match(lifecycleRoute, /Content-Disposition/)
  assert.doesNotMatch(lifecycleRoute, /\.select\([^)]*token/)
  assert.match(migration, /'DataExported'/)
})

test('retention purge is blocked by deadline or legal hold and retains billing audit', () => {
  const purge = migration.slice(
    migration.indexOf('CREATE OR REPLACE FUNCTION public.purge_cancelled_organization_data'),
    migration.indexOf('CREATE OR REPLACE FUNCTION public.grant_organization_support_access'),
  )
  assert.match(purge, /organization_under_legal_hold/)
  assert.match(purge, /retention_period_not_expired/)
  assert.match(purge, /DELETE FROM public\.garden_assignments/)
  assert.match(purge, /DELETE FROM public\.organization_invitations/)
  assert.match(purge, /DELETE FROM public\.api_keys/)
  assert.match(purge, /DELETE FROM public\.organization_members/)
  assert.match(purge, /DELETE FROM public\.roles/)
  assert.match(purge, /'billingAndAuditRetained', true/)
  assert.doesNotMatch(purge, /DELETE FROM public\.organization_invoices/)
  assert.doesNotMatch(purge, /DELETE FROM public\.organization_commercial_audit_log/)
})

test('support access requires customer consent, expiry and the exact admin identity', () => {
  const supportAudit = migration.slice(
    migration.indexOf('CREATE OR REPLACE FUNCTION public.audit_organization_support_access'),
  )
  assert.match(migration, /approved_by uuid NOT NULL/)
  assert.match(migration, /expires_at timestamptz NOT NULL/)
  assert.match(migration, /expires_at > approved_at/)
  assert.match(supportAudit, /support_user_id = p_support_user_id/)
  assert.match(supportAudit, /revoked_at IS NULL/)
  assert.match(supportAudit, /expires_at > now\(\)/)
  assert.match(supportAudit, /'SupportAccessUsed'/)
  assert.match(lifecycleRoute, /support_admin_required/)
})

test('support overview writes the access audit before reading organization data', () => {
  const auditCall = supportRoute.indexOf("'audit_organization_support_access'")
  const organizationRead = supportRoute.indexOf(".from('organizations')")
  assert.ok(auditCall > 0)
  assert.ok(organizationRead > auditCall)
  assert.match(supportRoute, /requireAdminFn \?\? requireAdmin/)
  assert.match(supportRoute, /'Cache-Control': 'private, no-store'/)
})

test('cancellation actor is derived from the authenticated platform administrator', async () => {
  let rpcArguments: Record<string, unknown> | undefined
  const request = new NextRequest('http://localhost/api/organizations/lifecycle', {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      action: 'schedule_cancellation',
      organizationId: '8a1ef175-cfe0-40cb-928d-37b60fb3469d',
      actorId: 'attacker-controlled-id',
      reason: 'Customer request',
      retentionUntil: '2027-07-26',
      policyReference: 'DPA-2026-001',
    }),
  })
  const response = await handleAdminOrganizationLifecycle(request, {
    requireAdminFn: (async () => ({
      user: { id: 'authenticated-admin-id' },
      profile: { role: 'admin' },
    })) as never,
    getSupabaseClientFn: (() => ({
      rpc: async (_name: string, args: Record<string, unknown>) => {
        rpcArguments = args
        return { data: { status: 'Cancelled' }, error: null }
      },
    })) as never,
  })

  assert.equal(response.status, 200)
  assert.equal(rpcArguments?.p_actor_id, 'authenticated-admin-id')
  assert.notEqual(rpcArguments?.p_actor_id, 'attacker-controlled-id')
})
