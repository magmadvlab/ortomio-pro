import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { NextRequest } from 'next/server'
import { handleAdminBillingAction } from '@/app/api/organizations/billing/route'

const migration = readFileSync(
  'supabase/migrations/20260726160000_organization_suspension_lifecycle.sql',
  'utf8',
)
const invitationRoute = readFileSync('app/api/organizations/invitations/route.ts', 'utf8')

test('suspension atomically revokes organization memberships and API keys', () => {
  const suspension = migration.slice(
    migration.indexOf('CREATE OR REPLACE FUNCTION public.suspend_pro_organization'),
    migration.indexOf('CREATE OR REPLACE FUNCTION public.reactivate_pro_organization'),
  )
  assert.match(suspension, /organization_suspended_memberships/)
  assert.match(suspension, /SET status = 'Suspended'/)
  assert.match(suspension, /organization_suspended_api_keys/)
  assert.match(suspension, /SET is_active = false/)
  assert.match(suspension, /status = 'Suspended'/)
  assert.match(suspension, /'OrganizationSuspended'/)
})

test('reactivation restores only resources captured by the suspension snapshot', () => {
  const reactivation = migration.slice(
    migration.indexOf('CREATE OR REPLACE FUNCTION public.reactivate_pro_organization'),
  )
  assert.match(reactivation, /snapshot\.suspension_id = suspension\.id/)
  assert.match(reactivation, /snapshot\.member_id = member\.id/)
  assert.match(reactivation, /member\.status = 'Suspended'/)
  assert.match(reactivation, /snapshot\.api_key_id = key\.id/)
  assert.match(reactivation, /key\.is_active = false/)
  assert.match(reactivation, /status = suspension\.previous_commercial_status/)
  assert.match(reactivation, /'OrganizationReactivated'/)
})

test('RLS owner and member helpers deny access while the organization is suspended', () => {
  assert.match(migration, /private\.is_organization_access_enabled/)
  assert.match(
    migration,
    /account\.status IN \('Suspended', 'Cancelled'\)/,
  )
  assert.match(
    migration,
    /private\.is_organization_access_enabled\(p_organization_id\)[\s\S]*public\.organizations/,
  )
  assert.match(
    migration,
    /private\.is_organization_access_enabled\(p_organization_id\)[\s\S]*public\.organization_members/,
  )
  assert.match(migration, /organization_id IS NULL[\s\S]*private\.is_organization_access_enabled/)
})

test('invitation management rejects disabled organizations before owner bypass', () => {
  const disabledCheck = invitationRoute.indexOf("commercialAccount?.status === 'Suspended'")
  const ownerBypass = invitationRoute.indexOf('organization.owner_id === userId')
  assert.ok(disabledCheck > 0)
  assert.ok(ownerBypass > disabledCheck)
  assert.match(invitationRoute, /organization_access_disabled/)
})

test('suspension actor is always the authenticated platform administrator', async () => {
  let rpcArguments: Record<string, unknown> | undefined
  const request = new NextRequest('http://localhost/api/organizations/billing', {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      action: 'suspend_organization',
      organizationId: '8a1ef175-cfe0-40cb-928d-37b60fb3469d',
      actorId: 'attacker-controlled-id',
      reason: 'Administrative hold',
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
        return { data: { status: 'Suspended' }, error: null }
      },
    })) as never,
  })

  assert.equal(response.status, 200)
  assert.equal(rpcArguments?.p_actor_id, 'authenticated-admin-id')
  assert.notEqual(rpcArguments?.p_actor_id, 'attacker-controlled-id')
})
