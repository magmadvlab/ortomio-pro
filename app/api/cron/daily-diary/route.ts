/**
 * Daily Diary Cron Job
 * 
 * Endpoint chiamato automaticamente ogni giorno alle 23:00
 * per registrare il diario giornaliero di tutti i giardini attivi
 * 
 * Vercel Cron: configurato in vercel.json
 */

import { NextRequest, NextResponse } from 'next/server'
import { DailyDiaryService } from '@/services/dailyDiaryService'
import { requireSupabase } from '@/lib/supabase-server'
import { AccessError, requireCron } from '@/lib/auth.server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minuti max

async function registerDiary() {
  const diary = new DailyDiaryService()
  diary.setSupabaseClient(requireSupabase())
  const result = await diary.recordDailyEntries()
  if (result.failedUsers || result.errors.length) {
    throw new Error(result.errors.join(' | ') || 'Daily registration failed')
  }
}

export async function GET(request: NextRequest) {
  try {
    requireCron(request)
    
    console.log('🌱 Starting daily diary cron job...')
    const startTime = Date.now()

    // Usa un client service_role: il cron non ha un utente loggato, e la RLS
    // di daily_weather_log richiede auth.uid() -- senza questo, ogni scrittura
    // fallirebbe silenziosamente.
    await registerDiary()

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
      { status: error instanceof AccessError ? error.status : 500 }
    )
  }
}

// Endpoint POST per trigger manuale (solo in development)
export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Manual trigger not allowed in production' },
      { status: 403 }
    )
  }
  
  try {
    console.log('🔧 Manual trigger of daily diary...')
    await registerDiary()

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
