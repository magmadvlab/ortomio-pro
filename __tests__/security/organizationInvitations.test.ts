import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { NextRequest } from 'next/server'
import { handleAcceptOrganizationInvitation } from '@/app/api/organizations/invitations/route'

test('invitation acceptance derives identity and email from the authenticated request', async () => {
  let rpcArguments: Record<string, unknown> | undefined
  const response = await handleAcceptOrganizationInvitation(
    new NextRequest('http://localhost/api/organizations/invitations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: 'invite-token',
        userId: 'spoofed-user',
        email: 'spoofed@example.com',
      }),
    }),
    {
      requireUserFn: async () => ({
        id: 'authenticated-user',
        email: 'invited@example.com',
      }) as never,
      getSupabaseClientFn: (() => ({
        rpc: async (_name: string, args: Record<string, unknown>) => {
          rpcArguments = args
          return {
            data: {
              id: 'member-1',
              organization_id: 'org-1',
              user_id: 'authenticated-user',
              role_id: 'role-1',
              status: 'Active',
            },
            error: null,
          }
        },
      })) as never,
    },
  )

  assert.equal(response.status, 200)
  assert.deepEqual(rpcArguments, {
    p_token: 'invite-token',
    p_user_id: 'authenticated-user',
    p_user_email: 'invited@example.com',
  })
})

test('organization invitation mutations are server-only and acceptance is atomic', () => {
  const service = readFileSync('services/organizationService.ts', 'utf8')
  const migration = readFileSync(
    'supabase/migrations/20260726113000_server_organization_invitations.sql',
    'utf8',
  )
  const route = readFileSync('app/api/organizations/invitations/route.ts', 'utf8')

  assert.doesNotMatch(
    service,
    /\.from\(['"]organization_invitations['"]\)\s*\.insert/,
  )
  assert.doesNotMatch(
    service,
    /\.from\(['"]organization_invitations['"]\)\s*\.select/,
  )
  assert.match(migration, /accept_organization_invitation/)
  assert.match(migration, /invitation_email_mismatch/)
  assert.match(migration, /ON CONFLICT \(organization_id, user_id\)/)
  assert.match(migration, /SET status = 'Accepted', responded_at = now\(\)/)
  assert.doesNotMatch(route, /invitation:\s*\{[^}]*token/s)
  assert.doesNotMatch(
    route,
    /\.select\([^)]*token[^)]*\)/s,
  )
  assert.match(route, /provider_message_id/)
})
