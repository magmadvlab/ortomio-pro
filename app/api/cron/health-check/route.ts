/**
 * Cron Job: Health Check
 *
 * Genera automaticamente alert di salute per tutti i giardini attivi
 * basandosi su:
 * - Condizioni meteo (rischio malattie)
 * - Task in ritardo (irrigazione, fertilizzazione)
 * - Alert stagionali (parassiti)
 * - Dati sensori (se disponibili)
 *
 * Frequenza consigliata: 2x al giorno (mattina/sera)
 * Vercel Cron: "0 8,20 * * *" (8:00 e 20:00)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkHealthAlerts } from '@/services/healthAlertEngine'
import { Garden, GardenTask } from '@/types'
import { HealthAlert } from '@/types/healthAlert'

// Inizializza Supabase client con service role (per bypassare RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function GET(request: NextRequest) {
  // Check Supabase credentials
  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { error: 'Missing Supabase credentials' },
      { status: 500 }
    )
  }

  // Verifica authorization (Vercel Cron Secret)
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET || 'dev-secret'

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const startTime = Date.now()
  const results = {
    success: true,
    gardensChecked: 0,
    alertsCreated: 0,
    alertsSkipped: 0,
    errors: [] as string[],
    duration: 0
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // 1. Carica tutti i giardini attivi
    const { data: gardens, error: gardensError } = await supabase
      .from('gardens')
      .select('*')
      .order('created_at', { ascending: false })

    if (gardensError) throw gardensError
    if (!gardens || gardens.length === 0) {
      return NextResponse.json({
        ...results,
        message: 'No gardens found',
        duration: Date.now() - startTime
      })
    }

    console.log(`[Health Check] Checking ${gardens.length} gardens...`)

    // 2. Per ogni giardino, genera alert
    for (const gardenDb of gardens) {
      try {
        results.gardensChecked++

        // Map garden da DB format
        const garden: Garden = {
          id: gardenDb.id,
          name: gardenDb.name,
          sizeSqMeters: gardenDb.size_sq_meters || 100,
          coordinates: gardenDb.coordinates,
          soilType: gardenDb.soil_type,
          dimensions: gardenDb.dimensions,
          createdAt: gardenDb.created_at
        }

        // Carica task del giardino
        const { data: tasksDb, error: tasksError } = await supabase
          .from('garden_tasks')
          .select('*')
          .eq('garden_id', garden.id)
          .order('date', { ascending: true })

        if (tasksError) {
          results.errors.push(`Garden ${garden.id}: ${tasksError.message}`)
          continue
        }

        // Map tasks da DB format
        const tasks: GardenTask[] = (tasksDb || []).map((t: any) => ({
          id: t.id,
          gardenId: t.garden_id,
          plantName: t.plant_name,
          variety: t.variety,
          taskType: t.task_type,
          date: t.date,
          completed: t.completed,
          notes: t.notes,
          quantity: t.quantity,
          bedId: t.bed_id,
          daysToMaturity: t.days_to_maturity,
          harvestLogId: t.harvest_log_id,
          createdAt: t.created_at
        }))

        // Carica meteo (se disponibili coordinate)
        let weather: any = null
        if (garden.coordinates) {
          try {
            const weatherResponse = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${garden.coordinates.latitude}&longitude=${garden.coordinates.longitude}&current_weather=true&daily=precipitation_sum,precipitation_probability_max&timezone=auto&forecast_days=3`,
              { next: { revalidate: 900 } } // Cache 15 minuti
            )

            if (weatherResponse.ok) {
              const weatherData = await weatherResponse.json()
              const current = weatherData.current_weather
              const daily = weatherData.daily

              weather = {
                temp: current.temperature,
                humidity: 70, // Default (Open-Meteo free non ha humidity)
                rainMm: daily.precipitation_sum[0] || 0,
                rainTomorrow: daily.precipitation_probability_max[1] > 50,
                condition: current.weathercode
              }
            }
          } catch (weatherError) {
            console.warn(`Weather fetch failed for garden ${garden.id}:`, weatherError)
          }
        }

        // Genera alert
        const newAlerts = await checkHealthAlerts({
          garden,
          tasks,
          weather,
          sensorData: [] // TODO: integrare sensori se disponibili
        })

        console.log(`[Health Check] Garden ${garden.name}: ${newAlerts.length} potential alerts`)

        // Salva nuovi alert (con controllo duplicati)
        for (const alert of newAlerts) {
          try {
            // Check se alert simile già esiste (stesso tipo + titolo + giardino + non risolto)
            const { data: existingAlerts } = await supabase
              .from('health_alerts')
              .select('id')
              .eq('garden_id', garden.id)
              .eq('alert_type', alert.alertType)
              .eq('title', alert.title)
              .eq('resolved', false)
              .limit(1)

            if (existingAlerts && existingAlerts.length > 0) {
              results.alertsSkipped++
              console.log(`[Health Check] Skipping duplicate alert: ${alert.title}`)
              continue
            }

            // Crea nuovo alert
            const { error: insertError } = await supabase
              .from('health_alerts')
              .insert({
                garden_id: alert.gardenId,
                plant_id: alert.plantId || null,
                alert_type: alert.alertType,
                severity: alert.severity,
                source: alert.source,
                title: alert.title,
                message: alert.message,
                recommendation: alert.recommendation || null,
                resolved: false,
                metadata: alert.metadata || null
              })

            if (insertError) {
              results.errors.push(`Alert insert failed: ${insertError.message}`)
            } else {
              results.alertsCreated++
            }
          } catch (alertError: any) {
            results.errors.push(`Alert processing error: ${alertError.message}`)
          }
        }
      } catch (gardenError: any) {
        results.errors.push(`Garden ${gardenDb.id} failed: ${gardenError.message}`)
        results.success = false
      }
    }

    results.duration = Date.now() - startTime

    console.log(`[Health Check] Completed in ${results.duration}ms:`, {
      gardensChecked: results.gardensChecked,
      alertsCreated: results.alertsCreated,
      alertsSkipped: results.alertsSkipped,
      errors: results.errors.length
    })

    return NextResponse.json(results)
  } catch (error: any) {
    results.success = false
    results.duration = Date.now() - startTime
    results.errors.push(error.message)

    console.error('[Health Check] Fatal error:', error)

    return NextResponse.json(
      { ...results, error: error.message },
      { status: 500 }
    )
  }
}

// Per sviluppo locale (non richiede auth)
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'POST only allowed in development' },
      { status: 403 }
    )
  }

  return GET(request)
}
