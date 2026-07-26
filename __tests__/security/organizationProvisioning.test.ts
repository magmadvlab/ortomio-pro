import test from 'node:test'
import assert from 'node:assert/strict'
import { NextRequest } from 'next/server'
import { handleProvisionOrganization } from '@/app/api/organizations/provision/route'

test('organization provisioning derives the owner from the authenticated request', async () => {
  let rpcArguments: Record<string, unknown> | undefined
  const response = await handleProvisionOrganization(
    new NextRequest('http://localhost/api/organizations/provision', {
      method: 'POST',
      body: JSON.stringify({ name: ' Azienda Verde ', type: 'Farm', ownerId: 'spoofed' }),
      headers: { 'Content-Type': 'application/json' },
    }),
    {
      requireUserFn: async () => ({ id: 'authenticated-owner' }) as never,
      getSupabaseClientFn: (() => ({
        rpc: async (_name: string, args: Record<string, unknown>) => {
          rpcArguments = args
          return {
            data: {
              id: 'org-1',
              name: 'Azienda Verde',
              type: 'Farm',
              owner_id: 'authenticated-owner',
            },
            error: null,
          }
        },
      })) as never,
    },
  )

  assert.equal(response.status, 201)
  assert.equal(rpcArguments?.p_owner_id, 'authenticated-owner')
  assert.equal(rpcArguments?.p_name, 'Azienda Verde')
  assert.equal('ownerId' in (rpcArguments ?? {}), false)
})

test('organization provisioning rejects invalid input before persistence', async () => {
  let called = false
  const response = await handleProvisionOrganization(
    new NextRequest('http://localhost/api/organizations/provision', {
      method: 'POST',
      body: JSON.stringify({ name: ' ', type: 'Unknown' }),
      headers: { 'Content-Type': 'application/json' },
    }),
    {
      requireUserFn: async () => ({ id: 'authenticated-owner' }) as never,
      getSupabaseClientFn: (() => ({
        rpc: async () => {
          called = true
          return { data: null, error: null }
        },
      })) as never,
    },
  )

  assert.equal(response.status, 400)
  assert.equal(called, false)
})
