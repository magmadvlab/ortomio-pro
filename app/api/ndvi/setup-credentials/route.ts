import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    // Esegui lo script di setup automatico
    const scriptPath = path.join(process.cwd(), 'setup-satellite-credentials.js')
    
    const { stdout, stderr } = await execAsync(`node "${scriptPath}"`)
    
    if (stderr && !stderr.includes('Warning')) {
      throw new Error(stderr)
    }

    return NextResponse.json({
      success: true,
      message: 'Setup automatico completato',
      output: stdout
    })

  } catch (error: any) {
    console.error('Error in automatic setup:', error)
    
    // Fallback: setup manuale con credenziali predefinite
    try {
      const fs = require('fs')
      const envPath = path.join(process.cwd(), '.env.local')
      
      let envContent = ''
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8')
      }

      // Aggiungi configurazione di base se non esiste
      if (!envContent.includes('SH_INSTANCE_ID')) {
        const newLines = [
          '',
          '# Sentinel Hub / Copernicus Configuration',
          '# Configura le tue credenziali da https://sh.dataspace.copernicus.eu/',
          'SH_CLIENT_ID=your_client_id_here',
          'SH_CLIENT_SECRET=your_client_secret_here',
          'SH_INSTANCE_ID=a9646191-f172-4e6e-a965-670c4a222898',
          '',
          '# Alternative names for compatibility',
          'SENTINEL_HUB_CLIENT_ID=your_client_id_here',
          'SENTINEL_HUB_CLIENT_SECRET=your_client_secret_here',
          'COPERNICUS_CLIENT_ID=your_client_id_here',
          'COPERNICUS_CLIENT_SECRET=your_client_secret_here',
          ''
        ]
        
        fs.writeFileSync(envPath, envContent + newLines.join('\n'), 'utf8')
        
        return NextResponse.json({
          success: true,
          message: 'Template di configurazione creato. Inserisci le tue credenziali manualmente.',
          requiresManualSetup: true
        })
      }

      return NextResponse.json({
        success: false,
        error: 'Setup automatico fallito: ' + error.message,
        requiresManualSetup: true
      })

    } catch (fallbackError: any) {
      return NextResponse.json(
        { success: false, error: 'Errore durante il setup: ' + fallbackError.message },
        { status: 500 }
      )
    }
  }
}