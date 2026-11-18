import 'server-only'
import { copernicusToken } from '@/services/copernicusAuth.server'
import { NextRequest, NextResponse } from 'next/server'
import { accessErrorResponse, requireAdmin } from '@/lib/auth.server'

export async function testSatelliteConnection(request: NextRequest, dependencies: {
  authorize?: (request: NextRequest) => Promise<unknown>;
  fetch?: typeof fetch;
  credentials?: { clientId?: string; clientSecret?: string }
} = {}) {
  try {
    await (dependencies.authorize ?? requireAdmin)(request)
    const { clientId, clientSecret } = dependencies.credentials ?? {
      clientId: process.env.SH_CLIENT_ID, clientSecret: process.env.SH_CLIENT_SECRET,
    }
    if (!clientId || !clientSecret) return NextResponse.json({ error: 'Credenziali Sentinel non configurate sul server.' }, { status: 503 })
    await copernicusToken(clientId, clientSecret, { fetcher: dependencies.fetch, force: true })
    return NextResponse.json({ success: true, status: 'connected', provider: 'sentinel-hub', checkedAt: new Date().toISOString() }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    const access = accessErrorResponse(error)
    if (access) return access
    return NextResponse.json({ error: 'Connessione satellite non riuscita. Riprova tra poco.' }, { status: 502 })
  }
}
