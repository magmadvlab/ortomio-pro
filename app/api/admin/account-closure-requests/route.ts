import { NextRequest, NextResponse } from 'next/server'
import { accessErrorResponse, requireAdmin, getSupabaseClient } from '@/lib/auth.server'
import { accountClosureRequest, type UserSettings } from '@/services/userSettingsService'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)
    const client = getSupabaseClient()
    const offset = Math.max(0, Number(request.nextUrl.searchParams.get('offset')) || 0)
    const { data, error, count } = await client.from('profiles').select('id,first_name,last_name,preferences', { count: 'exact' }).contains('preferences', { accountClosureRequest: { status: 'requested' } }).order('id').range(offset, offset + 49)
    if (error) throw error
    const requests = await Promise.all((data ?? []).map(async profile => {
      const account = await client.auth.admin.getUserById(profile.id)
      if (account.error) throw account.error
      return { userId: profile.id, name: [profile.first_name, profile.last_name].filter(Boolean).join(' '), email: account.data.user?.email, request: accountClosureRequest({ preferences: profile.preferences } as UserSettings) }
    }))
    return NextResponse.json({ requests, total: count ?? 0 }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (cause) { return accessErrorResponse(cause) ?? NextResponse.json({ error: 'Impossibile caricare le richieste di chiusura.' }, { status: 503 }) }
}
