import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import { getUserFromRequest, getUserProfile } from '@/lib/auth.server'

const resolveAuthSiteUrl = (): string => {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '')
  )
}

async function requireAdmin(request: NextRequest) {
  const user = await getUserFromRequest(request)
  if (!user) {
    return { error: NextResponse.json({ error: 'unauthorized' }, { status: 401 }) }
  }

  const profile = await getUserProfile(user.id)
  const hasAdminAccess = profile?.role === 'admin' || profile?.is_superadmin
  if (!hasAdminAccess) {
    return { error: NextResponse.json({ error: 'forbidden' }, { status: 403 }) }
  }

  const supabase = getSupabaseServerClient()
  if (!supabase) {
    return { error: NextResponse.json({ error: 'supabase_not_configured' }, { status: 503 }) }
  }

  return { supabase }
}

export async function GET(request: NextRequest) {
  const access = await requireAdmin(request)
  if ('error' in access) return access.error

  const { supabase } = access
  const page = Math.max(Number(request.nextUrl.searchParams.get('page') || '1'), 1)
  const perPage = Math.min(Math.max(Number(request.nextUrl.searchParams.get('per_page') || '50'), 1), 100)

  const { data, error } = await supabase.auth.admin.listUsers({
    page,
    perPage,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const users = (data?.users || []).map((user) => ({
    id: user.id,
    email: user.email,
    created_at: user.created_at,
    last_sign_in_at: user.last_sign_in_at,
    confirmed_at: user.email_confirmed_at,
    invited_at: user.invited_at,
    is_verified: Boolean(user.email_confirmed_at),
  }))

  return NextResponse.json({
    users,
    page,
    per_page: perPage,
    total: data?.total || users.length,
  })
}

export async function POST(request: NextRequest) {
  const access = await requireAdmin(request)
  if ('error' in access) return access.error

  const { supabase } = access
  const body = await request.json().catch(() => ({}))
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''

  if (!email) {
    return NextResponse.json({ error: 'missing_email' }, { status: 400 })
  }

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: `${resolveAuthSiteUrl()}/auth/callback`,
    },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, email })
}
