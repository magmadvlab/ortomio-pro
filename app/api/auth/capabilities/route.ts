import { NextRequest, NextResponse } from 'next/server'
import { accessErrorResponse, getUserProfile, requireUser } from '@/lib/auth.server'

const normalizeTier = (tier: unknown) => {
  if (tier === 'FREE') return 'FREE'
  if (tier === 'PLUS' || tier === 'PRO_CONSUMER') return 'PLUS'
  return 'PRO'
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request)
    const profile = await getUserProfile(user.id)

    return NextResponse.json({
      role: profile?.role === 'admin' || profile?.is_superadmin ? 'admin' : 'user',
      tier: normalizeTier(profile?.tier),
      providers: {
        supabase: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
        sentinel: Boolean(process.env.SH_CLIENT_ID && process.env.SH_CLIENT_SECRET),
        thingsboard: Boolean(process.env.THINGSBOARD_URL && process.env.THINGSBOARD_ACCESS_TOKEN),
      },
      schema: {},
    })
  } catch (error) {
    return accessErrorResponse(error) ?? NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
}
