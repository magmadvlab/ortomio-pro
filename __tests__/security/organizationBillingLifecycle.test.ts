import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { NextRequest } from 'next/server'
import { handleAdminBillingAction } from '@/app/api/organizations/billing/route'

const route = readFileSync('app/api/organizations/billing/route.ts', 'utf8')
const migration = readFileSync(
  'supabase/migrations/20260726150000_single_pro_billing_lifecycle.sql',
  'utf8',
)

test('O41 models exactly one PRO commercial product without an invented price', () => {
  assert.match(migration, /product_version text NOT NULL DEFAULT 'PRO'/)
  assert.match(migration, /CHECK \(product_version = 'PRO'\)/)
  assert.doesNotMatch(migration, /FREE|PLUS|ENTERPRISE/)
  assert.doesNotMatch(route, /defaultPrice|unitPrice|priceId|stripe/i)
})

test('billing profile submission is restricted to organization managers', () => {
  assert.match(route, /requireBillingManager\(supabase, organizationId, user\.id\)/)
  assert.match(migration, /billing_manager_required/)
  assert.match(migration, /r\.name IN \('Owner', 'Administrator'\)/)
  assert.match(migration, /REVOKE INSERT, UPDATE, DELETE ON public\.organization_commercial_accounts/)
})

test('invoice issue and payment recording require a platform administrator', () => {
  assert.match(route, /requireAdminFn \?\? requireAdmin/)
  assert.match(route, /action === 'issue_invoice'/)
  assert.match(route, /action === 'record_payment'/)
  assert.match(migration, /GRANT EXECUTE ON FUNCTION public\.issue_pro_invoice[\s\S]*TO service_role/)
  assert.match(
    migration,
    /GRANT EXECUTE ON FUNCTION public\.record_pro_payment_and_renewal[\s\S]*TO service_role/,
  )
})

test('payment and renewal are recorded atomically with an audit trail', () => {
  const paymentFunction = migration.slice(
    migration.indexOf('CREATE OR REPLACE FUNCTION public.record_pro_payment_and_renewal'),
  )
  assert.match(paymentFunction, /status = 'Paid'/)
  assert.match(paymentFunction, /status = 'Active'/)
  assert.match(paymentFunction, /current_period_start = invoice\.period_start/)
  assert.match(paymentFunction, /next_renewal_date = invoice\.period_end/)
  assert.match(paymentFunction, /'PaymentRecorded'/)
  assert.match(paymentFunction, /'ContractRenewed'/)
})

test('commercial records are readable but never directly mutable by clients', () => {
  for (const table of [
    'organization_commercial_accounts',
    'organization_invoices',
    'organization_commercial_audit_log',
  ]) {
    assert.match(migration, new RegExp(`ALTER TABLE public\\.${table} ENABLE ROW LEVEL SECURITY`))
    assert.match(
      migration,
      new RegExp(`REVOKE INSERT, UPDATE, DELETE ON public\\.${table}[\\s\\S]*FROM anon, authenticated`),
    )
  }
  assert.match(route, /'Cache-Control': 'private, no-store'/)
})

test('invoice issuer identity is derived from the authenticated administrator', async () => {
  let rpcArguments: Record<string, unknown> | undefined
  const request = new NextRequest('http://localhost/api/organizations/billing', {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      action: 'issue_invoice',
      organizationId: '8a1ef175-cfe0-40cb-928d-37b60fb3469d',
      actorId: 'attacker-controlled-id',
      externalReference: 'INV-2026-001',
      amountCents: 10000,
      currency: 'EUR',
      issuedOn: '2026-07-26',
      dueOn: '2026-08-26',
      periodStart: '2026-07-26',
      periodEnd: '2027-07-26',
    }),
  })
  const response = await handleAdminBillingAction(request, {
    requireAdminFn: (async () => ({
      user: { id: 'authenticated-admin-id' },
      profile: { role: 'admin' },
    })) as never,
    getSupabaseClientFn: (() => ({
      rpc: async (_name: string, args: Record<string, unknown>) => {
        rpcArguments = args
        return { data: { id: 'invoice-id' }, error: null }
      },
    })) as never,
  })

  assert.equal(response.status, 201)
  assert.equal(rpcArguments?.p_actor_id, 'authenticated-admin-id')
  assert.notEqual(rpcArguments?.p_actor_id, 'attacker-controlled-id')
})
