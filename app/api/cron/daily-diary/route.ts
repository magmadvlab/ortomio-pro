/**
 * Daily Diary Cron Job
 * 
 * Endpoint chiamato automaticamente ogni giorno alle 23:00
 * per registrare il diario giornaliero di tutti i giardini attivi
 * 
 * Vercel Cron: configurato in vercel.json
 */

import { NextRequest, NextResponse } from 'next/server'
import { dailyDiaryService } from '@/services/dailyDiaryService'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minuti max

export async function GET(request: NextRequest) {
  try {
    // Verifica authorization header per sicurezza
    const authHeader = request.headers.get('authorization')
    
    // In produzione, verifica che la richiesta venga da Vercel Cron
    if (process.env.NODE_ENV === 'production') {
      const cronSecret = process.env.CRON_SECRET
      if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }
    
    console.log('🌱 Starting daily diary cron job...')
    const startTime = Date.now()
    
    // Esegui registrazione diario giornaliero
    await dailyDiaryService.recordDailyEntries()
    
    const duration = Date.now() - startTime
    console.log(`✅ Daily diary cron job completed in ${duration}ms`)
    
    return NextResponse.json({
      success: true,
      message: 'Daily diary entries recorded successfully',
      duration_ms: duration,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Error in daily diary cron job:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// Endpoint POST per trigger manuale (solo in development)
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Manual trigger not allowed in production' },
      { status: 403 }
    )
  }
  
  try {
    console.log('🔧 Manual trigger of daily diary...')
    await dailyDiaryService.recordDailyEntries()
    
    return NextResponse.json({
      success: true,
      message: 'Daily diary manually triggered',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
