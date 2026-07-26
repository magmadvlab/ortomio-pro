#!/usr/bin/env node
import nextEnv from '@next/env'

nextEnv.loadEnvConfig(process.cwd())

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const requireReady = process.argv.includes('--require-ready')

if (!supabaseUrl || !anonKey) {
  process.stdout.write(`${JSON.stringify({
    checked: false,
    schemaReady: false,
    reason: 'missing_supabase_public_config',
  }, null, 2)}\n`)
  process.exit(requireReady ? 2 : 0)
}

const probes = [
  {
    name: 'organization_invitations_delivery',
    table: 'organization_invitations',
    select: 'id,delivery_status,delivery_provider,provider_message_id,delivered_at',
  },
  { name: 'organization_commercial_accounts', table: 'organization_commercial_accounts', select: 'id' },
  { name: 'organization_invoices', table: 'organization_invoices', select: 'id' },
  { name: 'organization_commercial_audit_log', table: 'organization_commercial_audit_log', select: 'id' },
  { name: 'organization_access_suspensions', table: 'organization_access_suspensions', select: 'id' },
  { name: 'organization_suspended_memberships', table: 'organization_suspended_memberships', select: 'id' },
  { name: 'organization_suspended_api_keys', table: 'organization_suspended_api_keys', select: 'id' },
  { name: 'organization_support_access_grants', table: 'organization_support_access_grants', select: 'id' },
]

const classify = (status, code) => {
  if (status >= 200 && status < 300) return 'available'
  if (code === 'PGRST205' || code === '42P01') return 'missing_relation'
  if (code === 'PGRST204' || code === '42703') return 'missing_column'
  if (status === 401 || status === 403) return 'exists_but_protected'
  return 'probe_failed'
}

const results = await Promise.all(probes.map(async probe => {
  const url = new URL(`/rest/v1/${probe.table}`, supabaseUrl)
  url.searchParams.set('select', probe.select)
  url.searchParams.set('limit', '1')
  const response = await fetch(url, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      Accept: 'application/json',
    },
  })
  let code = ''
  try {
    const payload = await response.json()
    if (typeof payload?.code === 'string') code = payload.code
  } catch {
    // Status and PostgREST code are sufficient; never print response data.
  }
  return {
    name: probe.name,
    status: response.status,
    postgrestCode: code,
    state: classify(response.status, code),
  }
}))

const schemaReady = results.every(result =>
  result.state === 'available' || result.state === 'exists_but_protected',
)
process.stdout.write(`${JSON.stringify({
  checked: true,
  scope: 'anonymous_schema_probe',
  schemaReady,
  probes: results,
}, null, 2)}\n`)
process.exit(requireReady && !schemaReady ? 2 : 0)
