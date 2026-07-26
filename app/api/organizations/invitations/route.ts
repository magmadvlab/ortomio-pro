import { randomUUID } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import {
  AccessError,
  accessErrorResponse,
  getSupabaseClient,
  requireUser,
} from '@/lib/auth.server'
import { deliverOrganizationInvitation } from '@/lib/organization-invitation-delivery.server'

type InvitationDependencies = {
  requireUserFn?: typeof requireUser
  getSupabaseClientFn?: typeof getSupabaseClient
  deliverFn?: typeof deliverOrganizationInvitation
}

const normalizeEmail = (value: unknown): string =>
  typeof value === 'string' ? value.trim().toLowerCase() : ''

async function requireInvitationManager(
  supabase: ReturnType<typeof getSupabaseClient>,
  organizationId: string,
  userId: string,
) {
  const { data: organization } = await supabase
    .from('organizations')
    .select('id, name, owner_id')
    .eq('id', organizationId)
    .maybeSingle()
  if (!organization) throw new AccessError('not_found', 404)
  if (organization.owner_id === userId) return organization

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
  return organization
}

export async function handleCreateOrganizationInvitation(
  request: NextRequest,
  dependencies: InvitationDependencies = {},
) {
  try {
    const user = await (dependencies.requireUserFn ?? requireUser)(request)
    const body = await request.json()
    const organizationId = typeof body?.organizationId === 'string' ? body.organizationId : ''
    const roleId = typeof body?.roleId === 'string' ? body.roleId : ''
    const email = normalizeEmail(body?.email)
    if (!organizationId || !roleId || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'invalid_invitation_input' }, { status: 400 })
    }

    const supabase = (dependencies.getSupabaseClientFn ?? getSupabaseClient)()
    const organization = await requireInvitationManager(supabase, organizationId, user.id)
    const { data: role } = await supabase
      .from('roles')
      .select('id, name')
      .eq('id', roleId)
      .eq('organization_id', organizationId)
      .maybeSingle()
    if (!role) return NextResponse.json({ error: 'role_not_found' }, { status: 404 })

    const token = randomUUID()
    const { data: invitation, error } = await supabase
      .from('organization_invitations')
      .insert({
        organization_id: organizationId,
        email,
        role_id: roleId,
        status: 'Pending',
        token,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        invited_by: user.id,
        delivery_status: 'Pending',
      })
      .select('id, organization_id, email, role_id, status, expires_at, invited_by, invited_at')
      .single()
    if (error || !invitation) throw error ?? new Error('invitation_persistence_failed')

    const delivery = await (dependencies.deliverFn ?? deliverOrganizationInvitation)({
      recipient: email,
      organizationName: organization.name,
      roleName: role.name,
      token,
    })
    await supabase
      .from('organization_invitations')
      .update(delivery.delivered
        ? {
            delivery_status: 'Delivered',
            delivery_provider: delivery.provider,
            provider_message_id: delivery.messageId,
            delivered_at: new Date().toISOString(),
            delivery_error: null,
          }
        : {
            delivery_status: 'Failed',
            delivery_provider: delivery.provider,
            delivery_error: delivery.error,
          })
      .eq('id', invitation.id)

    if (!delivery.delivered) {
      return NextResponse.json(
        { error: delivery.error, invitationId: invitation.id },
        { status: 503 },
      )
    }
    return NextResponse.json({
      invitation: { ...invitation, deliveryStatus: 'Delivered' },
      providerMessageId: delivery.messageId,
    }, { status: 201 })
  } catch (error) {
    const access = accessErrorResponse(error)
    if (access) return access
    console.error('Organization invitation creation error:', error)
    return NextResponse.json({ error: 'invitation_creation_failed' }, { status: 503 })
  }
}

export async function handleAcceptOrganizationInvitation(
  request: NextRequest,
  dependencies: InvitationDependencies = {},
) {
  try {
    const user = await (dependencies.requireUserFn ?? requireUser)(request)
    const body = await request.json()
    const token = typeof body?.token === 'string' ? body.token : ''
    if (!token || !user.email) {
      return NextResponse.json({ error: 'invitation_token_and_email_required' }, { status: 400 })
    }
    const supabase = (dependencies.getSupabaseClientFn ?? getSupabaseClient)()
    const { data, error } = await supabase.rpc('accept_organization_invitation', {
      p_token: token,
      p_user_id: user.id,
      p_user_email: user.email,
    })
    if (error || !data) {
      return NextResponse.json({ error: 'invalid_or_expired_invitation' }, { status: 409 })
    }
    return NextResponse.json({ member: data })
  } catch (error) {
    const access = accessErrorResponse(error)
    if (access) return access
    console.error('Organization invitation acceptance error:', error)
    return NextResponse.json({ error: 'invitation_acceptance_failed' }, { status: 503 })
  }
}

export async function handleListOrganizationInvitations(
  request: NextRequest,
  dependencies: InvitationDependencies = {},
) {
  try {
    const user = await (dependencies.requireUserFn ?? requireUser)(request)
    const organizationId = request.nextUrl.searchParams.get('organizationId') || ''
    if (!organizationId) {
      return NextResponse.json({ error: 'organization_id_required' }, { status: 400 })
    }
    const supabase = (dependencies.getSupabaseClientFn ?? getSupabaseClient)()
    await requireInvitationManager(supabase, organizationId, user.id)
    const { data, error } = await supabase
      .from('organization_invitations')
      .select(
        'id, organization_id, email, role_id, status, expires_at, invited_by, invited_at, responded_at, delivery_status, delivery_provider, provider_message_id, delivered_at',
      )
      .eq('organization_id', organizationId)
      .eq('status', 'Pending')
      .order('invited_at', { ascending: false })
    if (error) throw error
    return NextResponse.json({ invitations: data ?? [] }, {
      headers: { 'Cache-Control': 'private, no-store' },
    })
  } catch (error) {
    const access = accessErrorResponse(error)
    if (access) return access
    console.error('Organization invitations read error:', error)
    return NextResponse.json({ error: 'invitation_read_failed' }, { status: 503 })
  }
}

export async function GET(request: NextRequest) {
  return handleListOrganizationInvitations(request)
}

export async function POST(request: NextRequest) {
  return handleCreateOrganizationInvitation(request)
}

export async function PATCH(request: NextRequest) {
  return handleAcceptOrganizationInvitation(request)
}
