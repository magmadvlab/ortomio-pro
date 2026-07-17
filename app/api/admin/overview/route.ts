import { NextRequest, NextResponse } from 'next/server'
import { accessErrorResponse, getSupabaseClient, requireAdmin } from '@/lib/auth.server'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)
    const supabase = getSupabaseClient()
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    const [authUsers, gardens, dbProbe, audits] = await Promise.all([
      supabase.auth.admin.listUsers({ page: 1, perPage: 1000 }),
      supabase.from('gardens').select('id', { count: 'exact', head: true }),
      supabase.from('gardens').select('id').limit(1),
      supabase.from('admin_audit_log').select('id,action,target_type,target_id,outcome,created_at').order('created_at', { ascending: false }).limit(20),
    ])
    if (authUsers.error) throw authUsers.error
    if (gardens.error) throw gardens.error

    const users = authUsers.data.users || []
    return NextResponse.json({
      stats: {
        totalUsers: authUsers.data.total || users.length,
        totalGardens: gardens.count || 0,
        activeUsers: users.filter(user => user.last_sign_in_at && new Date(user.last_sign_in_at).getTime() >= sevenDaysAgo).length,
      },
      providerHealth: {
        database: dbProbe.error ? 'error' : 'healthy',
        sentinelCredentials: Boolean(process.env.SENTINEL_HUB_CLIENT_ID && process.env.SENTINEL_HUB_CLIENT_SECRET) ? 'configured' : 'not_configured',
        thingsboardCredentials: Boolean(process.env.THINGSBOARD_URL && (process.env.THINGSBOARD_TOKEN || process.env.THINGSBOARD_USERNAME)) ? 'configured' : 'not_configured',
        cronCredential: process.env.CRON_SECRET ? 'configured' : 'not_configured',
      },
      recentAudits: audits.error ? [] : audits.data || [],
    }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) {
    const access = accessErrorResponse(error)
    if (access) return access
    console.error('Admin overview error:', error)
    return NextResponse.json({ error: 'admin_overview_unavailable' }, { status: 503 })
  }
}
