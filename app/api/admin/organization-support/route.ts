import { NextRequest, NextResponse } from 'next/server'
import {
  accessErrorResponse,
  getSupabaseClient,
  requireAdmin,
} from '@/lib/auth.server'

type SupportDependencies = {
  requireAdminFn?: typeof requireAdmin
  getSupabaseClientFn?: typeof getSupabaseClient
}

export async function handleOrganizationSupportOverview(
  request: NextRequest,
  dependencies: SupportDependencies = {},
) {
  try {
    const { user } = await (dependencies.requireAdminFn ?? requireAdmin)(request)
    const grantId = request.nextUrl.searchParams.get('grantId') || ''
    if (!grantId) {
      return NextResponse.json({ error: 'support_grant_id_required' }, { status: 400 })
    }
    const supabase = (dependencies.getSupabaseClientFn ?? getSupabaseClient)()
    const { data: supportGrant, error: grantError } = await supabase.rpc(
      'audit_organization_support_access',
      {
        p_grant_id: grantId,
        p_support_user_id: user.id,
        p_action: 'ReadSupportOverview',
      },
    )
    if (grantError || !supportGrant) {
      return NextResponse.json({ error: 'valid_support_grant_required' }, { status: 403 })
    }

    const organizationId = supportGrant.organization_id
    const [organization, account, members, assignments, invitations] = await Promise.all([
      supabase
        .from('organizations')
        .select('id, name, type, email, owner_id, created_at, updated_at')
        .eq('id', organizationId)
        .single(),
      supabase
        .from('organization_commercial_accounts')
        .select(
          'status, product_version, current_period_start, current_period_end, next_renewal_date, suspended_at, cancelled_at, retention_until, legal_hold, operational_data_purged_at',
        )
        .eq('organization_id', organizationId)
        .maybeSingle(),
      supabase
        .from('organization_members')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', organizationId),
      supabase
        .from('garden_assignments')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', organizationId),
      supabase
        .from('organization_invitations')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .eq('status', 'Pending'),
    ])
    const queryError = [organization, account, members, assignments, invitations]
      .find(result => result.error)?.error
    if (queryError) throw queryError

    return NextResponse.json({
      grant: {
        id: supportGrant.id,
        purpose: supportGrant.purpose,
        approvedAt: supportGrant.approved_at,
        expiresAt: supportGrant.expires_at,
      },
      organization: organization.data,
      commercialAccount: account.data,
      counts: {
        members: members.count ?? 0,
        gardenAssignments: assignments.count ?? 0,
        pendingInvitations: invitations.count ?? 0,
      },
    }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) {
    const access = accessErrorResponse(error)
    if (access) return access
    console.error('Organization support access error:', error)
    return NextResponse.json({ error: 'organization_support_unavailable' }, { status: 503 })
  }
}

export async function GET(request: NextRequest) {
  return handleOrganizationSupportOverview(request)
}
