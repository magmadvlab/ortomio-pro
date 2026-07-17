import { NextRequest, NextResponse } from 'next/server'
import { accessErrorResponse, getSupabaseClient, getUserProfile, requireUser } from '@/lib/auth.server'
import { getEnabledFeatures, type FeatureFlag } from '@/config/features'

const normalizeTier = (tier: unknown) => {
  if (tier === 'FREE') return 'FREE'
  if (tier === 'PLUS' || tier === 'PRO_CONSUMER') return 'PLUS'
  return 'PRO'
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request)
    const profile = await getUserProfile(user.id)
    const supabase = getSupabaseClient()
    const [globalRollouts, userRollouts, gardensSchema, plantsSchema, diarySchema] = await Promise.all([
      supabase.from('release_capability_rollouts').select('feature_flag,enabled').eq('scope_type', 'global'),
      supabase.from('release_capability_rollouts').select('feature_flag,enabled').eq('scope_type', 'user').eq('scope_id', user.id),
      supabase.from('gardens').select('id').limit(1),
      supabase.from('garden_plants').select('id').limit(1),
      supabase.from('daily_diary_entries').select('id').limit(1),
    ])
    const rolloutState = new Map<FeatureFlag, boolean>(getEnabledFeatures().map(flag => [flag, true]))
    for (const row of globalRollouts.data || []) rolloutState.set(row.feature_flag as FeatureFlag, Boolean(row.enabled))
    for (const row of userRollouts.data || []) rolloutState.set(row.feature_flag as FeatureFlag, Boolean(row.enabled))

    return NextResponse.json({
      role: profile?.role === 'admin' || profile?.is_superadmin ? 'admin' : 'user',
      tier: normalizeTier(profile?.tier),
      providers: {
        supabase: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
        sentinel: Boolean((process.env.SENTINEL_HUB_CLIENT_ID || process.env.SH_CLIENT_ID) && (process.env.SENTINEL_HUB_CLIENT_SECRET || process.env.SH_CLIENT_SECRET)),
        thingsboard: Boolean(process.env.THINGSBOARD_URL && (process.env.THINGSBOARD_TOKEN || process.env.THINGSBOARD_ACCESS_TOKEN || process.env.THINGSBOARD_USERNAME)),
      },
      schema: {
        gardens: !gardensSchema.error,
        garden_plants: !plantsSchema.error,
        daily_diary_entries: !diarySchema.error,
      },
      enabledFeatures: [...rolloutState.entries()].filter(([, enabled]) => enabled).map(([flag]) => flag),
    })
  } catch (error) {
    return accessErrorResponse(error) ?? NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
}
