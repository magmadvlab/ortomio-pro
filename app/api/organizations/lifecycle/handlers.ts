import { createHash } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import {
  AccessError,
  accessErrorResponse,
  getSupabaseClient,
  requireAdmin,
  requireUser,
} from '@/lib/auth.server'

type LifecycleDependencies = {
  requireUserFn?: typeof requireUser
  requireAdminFn?: typeof requireAdmin
  getSupabaseClientFn?: typeof getSupabaseClient
}

const text = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : ''

const optionalText = (value: unknown): string | null => text(value) || null

const isDate = (value: string): boolean =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`))

async function requireLifecycleManager(
  supabase: ReturnType<typeof getSupabaseClient>,
  organizationId: string,
  userId: string,
) {
  const { data: organization } = await supabase
    .from('organizations')
    .select('id, owner_id')
    .eq('id', organizationId)
    .maybeSingle()
  if (!organization) throw new AccessError('not_found', 404)
  if (organization.owner_id === userId) return

  const { data: membership } = await supabase
    .from('organization_members')
    .select('status, roles!inner(name)')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .eq('status', 'Active')
    .maybeSingle()
  const roleName = (membership?.roles as { name?: string } | null)?.name
  if (roleName !== 'Owner' && roleName !== 'Administrator') {
    throw new AccessError('forbidden', 403)
  }
}

export async function handleGetOrganizationLifecycle(
  request: NextRequest,
  dependencies: LifecycleDependencies = {},
) {
  try {
    const user = await (dependencies.requireUserFn ?? requireUser)(request)
    const organizationId = request.nextUrl.searchParams.get('organizationId') || ''
    if (!organizationId) {
      return NextResponse.json({ error: 'organization_id_required' }, { status: 400 })
    }
    const supabase = (dependencies.getSupabaseClientFn ?? getSupabaseClient)()
    await requireLifecycleManager(supabase, organizationId, user.id)

    const [{ data: account, error: accountError }, { data: grants, error: grantsError }, {
      data: audit,
      error: auditError,
    }] = await Promise.all([
      supabase
        .from('organization_commercial_accounts')
        .select('*')
        .eq('organization_id', organizationId)
        .maybeSingle(),
      supabase
        .from('organization_support_access_grants')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false }),
      supabase
        .from('organization_commercial_audit_log')
        .select('id, actor_id, event_type, invoice_id, details, created_at')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false }),
    ])
    if (accountError || grantsError || auditError) {
      throw accountError ?? grantsError ?? auditError
    }
    return NextResponse.json({ account, supportGrants: grants ?? [], audit: audit ?? [] }, {
      headers: { 'Cache-Control': 'private, no-store' },
    })
  } catch (error) {
    const access = accessErrorResponse(error)
    if (access) return access
    console.error('Organization lifecycle read error:', error)
    return NextResponse.json({ error: 'organization_lifecycle_read_failed' }, { status: 503 })
  }
}

export async function handleOrganizationLifecycleRequest(
  request: NextRequest,
  dependencies: LifecycleDependencies = {},
) {
  try {
    const user = await (dependencies.requireUserFn ?? requireUser)(request)
    const body = await request.json()
    const action = text(body?.action)
    const organizationId = text(body?.organizationId)
    if (!organizationId) {
      return NextResponse.json({ error: 'organization_id_required' }, { status: 400 })
    }
    const supabase = (dependencies.getSupabaseClientFn ?? getSupabaseClient)()
    await requireLifecycleManager(supabase, organizationId, user.id)

    if (action === 'export_data') {
      const [
        organizationResult,
        membersResult,
        rolesResult,
        assignmentsResult,
        invitationsResult,
        accountResult,
        auditResult,
      ] = await Promise.all([
        supabase.from('organizations').select('*').eq('id', organizationId).single(),
        supabase
          .from('organization_members')
          .select('id, user_id, role_id, status, invited_at, joined_at, created_at, updated_at')
          .eq('organization_id', organizationId),
        supabase
          .from('roles')
          .select('id, name, description, permissions, is_system, created_at, updated_at')
          .eq('organization_id', organizationId),
        supabase
          .from('garden_assignments')
          .select('*')
          .eq('organization_id', organizationId),
        supabase
          .from('organization_invitations')
          .select('id, email, role_id, status, expires_at, invited_by, invited_at, responded_at')
          .eq('organization_id', organizationId),
        supabase
          .from('organization_commercial_accounts')
          .select('*')
          .eq('organization_id', organizationId)
          .single(),
        supabase
          .from('organization_commercial_audit_log')
          .select('*')
          .eq('organization_id', organizationId)
          .order('created_at', { ascending: true }),
      ])
      const results = [
        organizationResult,
        membersResult,
        rolesResult,
        assignmentsResult,
        invitationsResult,
        accountResult,
        auditResult,
      ]
      const queryError = results.find(result => result.error)?.error
      if (queryError) throw queryError

      const commercialAccount = accountResult.data
      const invoiceQuery = await supabase
        .from('organization_invoices')
        .select('*')
        .eq('commercial_account_id', commercialAccount.id)
      if (invoiceQuery.error) throw invoiceQuery.error
      const invoices = invoiceQuery.data ?? []

      const exportedAt = new Date().toISOString()
      const exportPayload = {
        schemaVersion: 1,
        productVersion: 'PRO',
        exportedAt,
        organization: organizationResult.data,
        members: membersResult.data ?? [],
        roles: rolesResult.data ?? [],
        gardenAssignments: assignmentsResult.data ?? [],
        invitations: invitationsResult.data ?? [],
        commercialAccount,
        invoices,
        commercialAudit: auditResult.data ?? [],
      }
      const serialized = JSON.stringify(exportPayload)
      const checksum = createHash('sha256').update(serialized).digest('hex')
      const recordCount = [
        exportPayload.members,
        exportPayload.roles,
        exportPayload.gardenAssignments,
        exportPayload.invitations,
        exportPayload.invoices,
        exportPayload.commercialAudit,
      ].reduce((total, records) => total + records.length, 1)
      const { error: auditError } = await supabase.rpc('record_organization_data_export', {
        p_organization_id: organizationId,
        p_actor_id: user.id,
        p_checksum: checksum,
        p_record_count: recordCount,
      })
      if (auditError) throw auditError

      return new NextResponse(serialized, {
        headers: {
          'Cache-Control': 'private, no-store',
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="ortomio-${organizationId}-export.json"`,
          'X-Content-SHA256': checksum,
        },
      })
    }

    if (action === 'grant_support_access') {
      const supportUserId = text(body?.supportUserId)
      const purpose = text(body?.purpose)
      const expiresAt = text(body?.expiresAt)
      if (
        !supportUserId ||
        !purpose ||
        !expiresAt ||
        Number.isNaN(Date.parse(expiresAt)) ||
        Date.parse(expiresAt) <= Date.now()
      ) {
        return NextResponse.json({ error: 'invalid_support_grant' }, { status: 400 })
      }
      const { data: supportProfile } = await supabase
        .from('profiles')
        .select('role, is_superadmin')
        .eq('id', supportUserId)
        .maybeSingle()
      if (
        supportProfile?.role !== 'admin' &&
        supportProfile?.is_superadmin !== true
      ) {
        return NextResponse.json({ error: 'support_admin_required' }, { status: 400 })
      }
      const { data, error } = await supabase.rpc('grant_organization_support_access', {
        p_organization_id: organizationId,
        p_actor_id: user.id,
        p_support_user_id: supportUserId,
        p_purpose: purpose,
        p_expires_at: expiresAt,
      })
      if (error || !data) throw error ?? new Error('support_grant_failed')
      return NextResponse.json({ supportGrant: data }, { status: 201 })
    }

    if (action === 'revoke_support_access') {
      const grantId = text(body?.grantId)
      if (!grantId) {
        return NextResponse.json({ error: 'support_grant_id_required' }, { status: 400 })
      }
      const { data, error } = await supabase.rpc('revoke_organization_support_access', {
        p_grant_id: grantId,
        p_actor_id: user.id,
        p_reason: optionalText(body?.reason),
      })
      if (error || !data) throw error ?? new Error('support_revoke_failed')
      return NextResponse.json({ supportGrant: data })
    }

    return NextResponse.json({ error: 'unsupported_lifecycle_request' }, { status: 400 })
  } catch (error) {
    const access = accessErrorResponse(error)
    if (access) return access
    console.error('Organization lifecycle request error:', error)
    return NextResponse.json({ error: 'organization_lifecycle_request_failed' }, { status: 503 })
  }
}

export async function handleAdminOrganizationLifecycle(
  request: NextRequest,
  dependencies: LifecycleDependencies = {},
) {
  try {
    const { user } = await (dependencies.requireAdminFn ?? requireAdmin)(request)
    const body = await request.json()
    const action = text(body?.action)
    const organizationId = text(body?.organizationId)
    if (!organizationId) {
      return NextResponse.json({ error: 'organization_id_required' }, { status: 400 })
    }
    const supabase = (dependencies.getSupabaseClientFn ?? getSupabaseClient)()

    if (action === 'schedule_cancellation') {
      const reason = text(body?.reason)
      const retentionUntil = text(body?.retentionUntil)
      const policyReference = text(body?.policyReference)
      if (
        !reason ||
        !policyReference ||
        !isDate(retentionUntil) ||
        retentionUntil <= new Date().toISOString().slice(0, 10)
      ) {
        return NextResponse.json({ error: 'invalid_cancellation' }, { status: 400 })
      }
      const { data, error } = await supabase.rpc('schedule_pro_organization_cancellation', {
        p_organization_id: organizationId,
        p_actor_id: user.id,
        p_reason: reason,
        p_retention_until: retentionUntil,
        p_policy_reference: policyReference,
      })
      if (error || !data) throw error ?? new Error('cancellation_failed')
      return NextResponse.json({ account: data })
    }

    if (action === 'set_legal_hold') {
      const enabled = body?.enabled
      const reason = text(body?.reason)
      if (typeof enabled !== 'boolean' || (enabled && !reason)) {
        return NextResponse.json({ error: 'invalid_legal_hold' }, { status: 400 })
      }
      const { data, error } = await supabase.rpc('set_organization_legal_hold', {
        p_organization_id: organizationId,
        p_actor_id: user.id,
        p_enabled: enabled,
        p_reason: reason || null,
      })
      if (error || !data) throw error ?? new Error('legal_hold_update_failed')
      return NextResponse.json({ account: data })
    }

    if (action === 'purge_operational_data') {
      const { data, error } = await supabase.rpc('purge_cancelled_organization_data', {
        p_organization_id: organizationId,
        p_actor_id: user.id,
      })
      if (error || !data) throw error ?? new Error('operational_data_purge_failed')
      return NextResponse.json({ account: data })
    }

    return NextResponse.json({ error: 'unsupported_lifecycle_action' }, { status: 400 })
  } catch (error) {
    const access = accessErrorResponse(error)
    if (access) return access
    console.error('Organization lifecycle administration error:', error)
    return NextResponse.json({ error: 'organization_lifecycle_administration_failed' }, {
      status: 503,
    })
  }
}

export async function GET(request: NextRequest) {
  return handleGetOrganizationLifecycle(request)
}

export async function POST(request: NextRequest) {
  return handleOrganizationLifecycleRequest(request)
}

export async function PATCH(request: NextRequest) {
  return handleAdminOrganizationLifecycle(request)
}
