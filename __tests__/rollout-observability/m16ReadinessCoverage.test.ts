import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const route = readFileSync('app/api/admin/release-readiness/route.ts', 'utf8')
const localCheck = readFileSync('scripts/check-release-readiness.mjs', 'utf8')

test('M16 schema readiness covers the complete commercial lifecycle', () => {
  for (const schemaEvidence of [
    'organization_invitations_delivery',
    'organization_commercial_accounts',
    'organization_invoices',
    'organization_commercial_audit_log',
    'organization_access_suspensions',
    'organization_support_access_grants',
  ]) {
    assert.match(route, new RegExp(schemaEvidence))
  }
  assert.match(route, /delivery_status,delivery_provider,provider_message_id,delivered_at/)
})

test('M16 deploy readiness requires migration, isolation, lifecycle and agronomic evidence', () => {
  for (const gate of [
    'RELEASE_MIGRATION_AUDIT_ID',
    'RELEASE_TENANT_ISOLATION_RUN_ID',
    'RELEASE_COMMERCIAL_LIFECYCLE_E2E_ID',
    'RELEASE_AGRONOMIC_SHADOW_ID',
    'RELEASE_AGRONOMIC_REVIEW_ID',
  ]) {
    assert.match(route, new RegExp(gate))
  }
  assert.match(
    route,
    /deployReady: Object\.values\(schema\)\.every\(Boolean\)[\s\S]*Object\.values\(externalGates\)\.every\(Boolean\)/,
  )
})

test('local release check requires every O38-O43 migration artifact', () => {
  for (const migration of [
    '20260726103000_transactional_organization_provisioning.sql',
    '20260726113000_server_organization_invitations.sql',
    '20260726150000_single_pro_billing_lifecycle.sql',
    '20260726160000_organization_suspension_lifecycle.sql',
    '20260726170000_organization_exit_and_support_lifecycle.sql',
  ]) {
    assert.match(localCheck, new RegExp(migration))
  }
})
