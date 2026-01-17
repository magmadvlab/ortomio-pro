import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Verifica presenza variabili d'ambiente
    const clientId = process.env.SH_CLIENT_ID || process.env.SENTINEL_HUB_CLIENT_ID || process.env.COPERNICUS_CLIENT_ID
    const clientSecret = process.env.SH_CLIENT_SECRET || process.env.SENTINEL_HUB_CLIENT_SECRET || process.env.COPERNICUS_CLIENT_SECRET
    const instanceId = process.env.SH_INSTANCE_ID || 'a9646191-f172-4e6e-a965-670c4a222898'

    const status = {
      configured: !!(clientId && clientSecret),
      clientIdPresent: !!clientId,
      clientSecretPresent: !!clientSecret,
      instanceIdPresent: !!instanceId,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(status)
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Errore verifica configurazione', details: error.message },
      { status: 500 }
    )
  }
}