/**
 * Test Script: Health Check Cron Job
 *
 * Esegue localmente la cron job di controllo salute
 * senza bisogno di aspettare lo schedule Vercel
 *
 * Usage:
 *   npm run test:health-check
 *
 * Oppure:
 *   ts-node scripts/test-health-check.ts
 */

import { createClient } from '@supabase/supabase-js'
import { checkHealthAlerts } from '../services/healthAlertEngine'
import { Garden, GardenTask } from '../types'

// Configurazione
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing environment variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL')
  console.error('   SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function testHealthCheck() {
  console.log('🚀 Starting Health Check Test...\n')

  const startTime = Date.now()
  let gardensChecked = 0
  let alertsCreated = 0
  let alertsSkipped = 0

  try {
    // 1. Carica giardini
    console.log('📊 Loading gardens...')
    const { data: gardens, error: gardensError } = await supabase
      .from('gardens')
      .select('*')
      .order('created_at', { ascending: false })

    if (gardensError) throw gardensError

    console.log(`✅ Found ${gardens?.length || 0} gardens\n`)

    if (!gardens || gardens.length === 0) {
      console.log('⚠️  No gardens to check')
      return
    }

    // 2. Per ogni giardino
    for (const gardenDb of gardens) {
      gardensChecked++

      console.log(`\n🌱 Garden: ${gardenDb.name} (${gardenDb.id})`)
      console.log('   ----------------------------------------')

      // Map garden
      const garden: Garden = {
        id: gardenDb.id,
        name: gardenDb.name,
        sizeSqMeters: gardenDb.size_sq_meters || 100,
        coordinates: gardenDb.coordinates,
        soilType: gardenDb.soil_type,
        dimensions: gardenDb.dimensions,
        createdAt: gardenDb.created_at
      }

      // Carica tasks
      const { data: tasksDb, error: tasksError } = await supabase
        .from('garden_tasks')
        .select('*')
        .eq('garden_id', garden.id)
        .order('date', { ascending: true })

      if (tasksError) {
        console.error(`   ❌ Failed to load tasks: ${tasksError.message}`)
        continue
      }

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

      console.log(`   📋 Tasks: ${tasks.length}`)

      // Carica meteo (se coordinate disponibili)
      let weather: any = null
      if (garden.coordinates) {
        try {
          console.log(`   🌦️  Fetching weather for ${garden.coordinates.latitude}, ${garden.coordinates.longitude}...`)

          const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${garden.coordinates.latitude}&longitude=${garden.coordinates.longitude}&current_weather=true&daily=precipitation_sum,precipitation_probability_max&timezone=auto&forecast_days=3`
          )

          if (weatherResponse.ok) {
            const weatherData = await weatherResponse.json()
            const current = weatherData.current_weather
            const daily = weatherData.daily

            weather = {
              temp: current.temperature,
              humidity: 70, // Default
              rainMm: daily.precipitation_sum[0] || 0,
              rainTomorrow: daily.precipitation_probability_max[1] > 50,
              condition: current.weathercode
            }

            console.log(`   ✅ Weather: ${weather.temp}°C, Rain: ${weather.rainMm}mm, Tomorrow: ${weather.rainTomorrow ? 'Rain' : 'Dry'}`)
          }
        } catch (weatherError) {
          console.warn(`   ⚠️  Weather fetch failed`)
        }
      } else {
        console.log(`   ⚠️  No coordinates, skipping weather`)
      }

      // Genera alert
      console.log(`   🔍 Checking health conditions...`)
      const newAlerts = await checkHealthAlerts({
        garden,
        tasks,
        weather,
        sensorData: []
      })

      console.log(`   💡 Generated ${newAlerts.length} potential alerts`)

      // Stampa alert
      for (const alert of newAlerts) {
        console.log(`\n   📢 Alert: ${alert.severity.toUpperCase()} - ${alert.title}`)
        console.log(`      Type: ${alert.alertType}`)
        console.log(`      Source: ${alert.source}`)
        console.log(`      Message: ${alert.message}`)
        if (alert.recommendation) {
          console.log(`      💡 Recommendation: ${alert.recommendation}`)
        }

        // Check duplicati
        const { data: existingAlerts } = await supabase
          .from('health_alerts')
          .select('id')
          .eq('garden_id', garden.id)
          .eq('alert_type', alert.alertType)
          .eq('title', alert.title)
          .eq('resolved', false)
          .limit(1)

        if (existingAlerts && existingAlerts.length > 0) {
          console.log(`      ⏭️  Skipped (duplicate)`)
          alertsSkipped++
          continue
        }

        // Inserisci alert
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
          console.error(`      ❌ Insert failed: ${insertError.message}`)
        } else {
          console.log(`      ✅ Created in database`)
          alertsCreated++
        }
      }
    }

    const duration = Date.now() - startTime

    console.log('\n\n========================================')
    console.log('✅ Health Check Test Completed!')
    console.log('========================================')
    console.log(`⏱️  Duration: ${duration}ms (${(duration / 1000).toFixed(2)}s)`)
    console.log(`🌱 Gardens checked: ${gardensChecked}`)
    console.log(`📢 Alerts created: ${alertsCreated}`)
    console.log(`⏭️  Alerts skipped (duplicates): ${alertsSkipped}`)
    console.log('========================================\n')

  } catch (error: any) {
    console.error('\n❌ Fatal error:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

// Esegui test
testHealthCheck()
  .then(() => {
    console.log('👋 Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Unhandled error:', error)
    process.exit(1)
  })
