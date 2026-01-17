import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const { clientId, clientSecret, instanceId } = await request.json()

    if (!clientId || !clientSecret || !instanceId) {
      return NextResponse.json(
        { success: false, error: 'Client ID, Client Secret e Instance ID sono richiesti' },
        { status: 400 }
      )
    }

    // Path del file .env.local
    const envPath = path.join(process.cwd(), '.env.local')
    
    // Leggi il file esistente o crea nuovo contenuto
    let envContent = ''
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8')
    }

    // Rimuovi eventuali configurazioni esistenti
    const linesToRemove = [
      'SH_CLIENT_ID=',
      'SH_CLIENT_SECRET=',
      'SH_INSTANCE_ID=',
      'SENTINEL_HUB_CLIENT_ID=',
      'SENTINEL_HUB_CLIENT_SECRET=',
      'COPERNICUS_CLIENT_ID=',
      'COPERNICUS_CLIENT_SECRET='
    ]

    const lines = envContent.split('\n').filter(line => {
      return !linesToRemove.some(prefix => line.startsWith(prefix))
    })

    // Aggiungi le nuove configurazioni
    lines.push('')
    lines.push('# Sentinel Hub / Copernicus Configuration')
    lines.push(`SH_CLIENT_ID=${clientId}`)
    lines.push(`SH_CLIENT_SECRET=${clientSecret}`)
    lines.push(`SH_INSTANCE_ID=${instanceId}`)
    lines.push('')
    lines.push('# Alternative names for compatibility')
    lines.push(`SENTINEL_HUB_CLIENT_ID=${clientId}`)
    lines.push(`SENTINEL_HUB_CLIENT_SECRET=${clientSecret}`)
    lines.push(`COPERNICUS_CLIENT_ID=${clientId}`)
    lines.push(`COPERNICUS_CLIENT_SECRET=${clientSecret}`)

    // Scrivi il file aggiornato
    const newContent = lines.join('\n')
    fs.writeFileSync(envPath, newContent, 'utf8')

    return NextResponse.json({
      success: true,
      message: 'Credenziali salvate con successo'
    })

  } catch (error: any) {
    console.error('Error saving credentials:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}