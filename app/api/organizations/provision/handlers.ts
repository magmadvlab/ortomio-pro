import { NextRequest, NextResponse } from 'next/server'
import {
  accessErrorResponse,
  getSupabaseClient,
  requireUser,
} from '@/lib/auth.server'
import type { Organization } from '@/types/organization'

const ORGANIZATION_TYPES: Organization['type'][] = [
  'Farm',
  'Cooperative',
  'Enterprise',
  'Research',
]

type ProvisionDependencies = {
  requireUserFn?: typeof requireUser
  getSupabaseClientFn?: typeof getSupabaseClient
}

const optionalText = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() ? value.trim() : null

export async function handleProvisionOrganization(
  request: NextRequest,
  dependencies: ProvisionDependencies = {},
) {
  try {
    const user = await (dependencies.requireUserFn ?? requireUser)(request)
    const body = await request.json()
    const name = optionalText(body?.name)
    const type = body?.type

    if (!name) {
      return NextResponse.json({ error: 'organization_name_required' }, { status: 400 })
    }
    if (!ORGANIZATION_TYPES.includes(type)) {
      return NextResponse.json({ error: 'invalid_organization_type' }, { status: 400 })
    }

    const supabase = (dependencies.getSupabaseClientFn ?? getSupabaseClient)()
    const { data, error } = await supabase.rpc('provision_organization', {
      p_owner_id: user.id,
      p_name: name,
      p_type: type,
      p_description: optionalText(body?.description),
      p_email: optionalText(body?.email),
      p_phone: optionalText(body?.phone),
      p_address: optionalText(body?.address),
      p_vat_number: optionalText(body?.vatNumber),
      p_logo: optionalText(body?.logo),
      p_website: optionalText(body?.website),
    })

    if (error || !data) throw error ?? new Error('organization_provisioning_failed')
    return NextResponse.json({ organization: data }, { status: 201 })
  } catch (error) {
    const access = accessErrorResponse(error)
    if (access) return access
    console.error('Organization provisioning error:', error)
    return NextResponse.json({ error: 'organization_provisioning_failed' }, { status: 503 })
  }
}

export async function POST(request: NextRequest) {
  return handleProvisionOrganization(request)
}
