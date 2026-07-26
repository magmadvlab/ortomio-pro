import { NextRequest, NextResponse } from 'next/server'
import {
  AccessError,
  accessErrorResponse,
  getSupabaseClient,
  requireAdmin,
  requireUser,
} from '@/lib/auth.server'

type BillingDependencies = {
  requireUserFn?: typeof requireUser
  requireAdminFn?: typeof requireAdmin
  getSupabaseClientFn?: typeof getSupabaseClient
}

const text = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : ''

const optionalText = (value: unknown): string | null => text(value) || null

const isEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

const isDate = (value: string): boolean =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`))

async function requireBillingManager(
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

export async function handleGetOrganizationBilling(
  request: NextRequest,
  dependencies: BillingDependencies = {},
) {
  try {
    const user = await (dependencies.requireUserFn ?? requireUser)(request)
    const organizationId = request.nextUrl.searchParams.get('organizationId') || ''
    if (!organizationId) {
      return NextResponse.json({ error: 'organization_id_required' }, { status: 400 })
    }

    const supabase = (dependencies.getSupabaseClientFn ?? getSupabaseClient)()
    await requireBillingManager(supabase, organizationId, user.id)
    const { data: account, error } = await supabase
      .from('organization_commercial_accounts')
      .select('*')
      .eq('organization_id', organizationId)
      .maybeSingle()
    if (error) throw error
    if (!account) {
      return NextResponse.json({ account: null, invoices: [], audit: [] }, {
        headers: { 'Cache-Control': 'private, no-store' },
      })
    }

    const [{ data: invoices, error: invoicesError }, { data: audit, error: auditError }] =
      await Promise.all([
        supabase
          .from('organization_invoices')
          .select('*')
          .eq('commercial_account_id', account.id)
          .order('issued_on', { ascending: false }),
        supabase
          .from('organization_commercial_audit_log')
          .select('id, event_type, invoice_id, details, created_at')
          .eq('organization_id', organizationId)
          .order('created_at', { ascending: false }),
      ])
    if (invoicesError || auditError) throw invoicesError ?? auditError

    return NextResponse.json({
      account,
      invoices: invoices ?? [],
      audit: audit ?? [],
    }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) {
    const access = accessErrorResponse(error)
    if (access) return access
    console.error('Organization billing read error:', error)
    return NextResponse.json({ error: 'organization_billing_read_failed' }, { status: 503 })
  }
}

export async function handleSubmitBillingProfile(
  request: NextRequest,
  dependencies: BillingDependencies = {},
) {
  try {
    const user = await (dependencies.requireUserFn ?? requireUser)(request)
    const body = await request.json()
    const organizationId = text(body?.organizationId)
    const legalName = text(body?.legalName)
    const billingEmail = text(body?.billingEmail).toLowerCase()
    if (!organizationId || !legalName || !isEmail(billingEmail)) {
      return NextResponse.json({ error: 'invalid_billing_profile' }, { status: 400 })
    }

    const supabase = (dependencies.getSupabaseClientFn ?? getSupabaseClient)()
    await requireBillingManager(supabase, organizationId, user.id)
    const { data, error } = await supabase.rpc('submit_pro_billing_profile', {
      p_organization_id: organizationId,
      p_actor_id: user.id,
      p_legal_name: legalName,
      p_billing_email: billingEmail,
      p_vat_number: optionalText(body?.vatNumber),
      p_administrative_notes: optionalText(body?.administrativeNotes),
    })
    if (error || !data) throw error ?? new Error('billing_profile_submission_failed')
    return NextResponse.json({ account: data }, { status: 201 })
  } catch (error) {
    const access = accessErrorResponse(error)
    if (access) return access
    console.error('Organization billing profile error:', error)
    return NextResponse.json({ error: 'billing_profile_submission_failed' }, { status: 503 })
  }
}

export async function handleAdminBillingAction(
  request: NextRequest,
  dependencies: BillingDependencies = {},
) {
  try {
    const { user } = await (dependencies.requireAdminFn ?? requireAdmin)(request)
    const body = await request.json()
    const action = text(body?.action)
    const supabase = (dependencies.getSupabaseClientFn ?? getSupabaseClient)()

    if (action === 'issue_invoice') {
      const organizationId = text(body?.organizationId)
      const externalReference = text(body?.externalReference)
      const currency = text(body?.currency).toUpperCase()
      const issuedOn = text(body?.issuedOn)
      const dueOn = text(body?.dueOn)
      const periodStart = text(body?.periodStart)
      const periodEnd = text(body?.periodEnd)
      const amountCents = body?.amountCents
      if (
        !organizationId ||
        !externalReference ||
        !Number.isSafeInteger(amountCents) ||
        amountCents <= 0 ||
        !/^[A-Z]{3}$/.test(currency) ||
        ![issuedOn, dueOn, periodStart, periodEnd].every(isDate) ||
        dueOn < issuedOn ||
        periodEnd <= periodStart
      ) {
        return NextResponse.json({ error: 'invalid_invoice' }, { status: 400 })
      }
      const { data, error } = await supabase.rpc('issue_pro_invoice', {
        p_organization_id: organizationId,
        p_actor_id: user.id,
        p_external_reference: externalReference,
        p_amount_cents: amountCents,
        p_currency: currency,
        p_issued_on: issuedOn,
        p_due_on: dueOn,
        p_period_start: periodStart,
        p_period_end: periodEnd,
      })
      if (error || !data) throw error ?? new Error('invoice_issue_failed')
      return NextResponse.json({ invoice: data }, { status: 201 })
    }

    if (action === 'record_payment') {
      const invoiceId = text(body?.invoiceId)
      const paidAt = optionalText(body?.paidAt)
      if (!invoiceId || (paidAt && Number.isNaN(Date.parse(paidAt)))) {
        return NextResponse.json({ error: 'invalid_payment' }, { status: 400 })
      }
      const { data, error } = await supabase.rpc('record_pro_payment_and_renewal', {
        p_invoice_id: invoiceId,
        p_actor_id: user.id,
        p_paid_at: paidAt ?? new Date().toISOString(),
      })
      if (error || !data) throw error ?? new Error('payment_record_failed')
      return NextResponse.json({ account: data })
    }

    return NextResponse.json({ error: 'unsupported_billing_action' }, { status: 400 })
  } catch (error) {
    const access = accessErrorResponse(error)
    if (access) return access
    console.error('Organization billing administration error:', error)
    return NextResponse.json({ error: 'billing_administration_failed' }, { status: 503 })
  }
}

export async function GET(request: NextRequest) {
  return handleGetOrganizationBilling(request)
}

export async function POST(request: NextRequest) {
  return handleSubmitBillingProfile(request)
}

export async function PATCH(request: NextRequest) {
  return handleAdminBillingAction(request)
}
