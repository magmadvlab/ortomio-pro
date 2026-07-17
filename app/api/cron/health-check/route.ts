import { NextRequest, NextResponse } from 'next/server'
import { requireCron } from '@/lib/auth.server'
import { requireSupabase } from '@/lib/supabase-server'
import { checkHealthAlerts } from '@/services/healthAlertEngine'
import { extractGardenEnvironmentalHistory, summarizeGardenEnvironmentalHistory } from '@/services/environmentalMonitoringService'
import type { Garden, GardenTask } from '@/types'
import { monitoringRunKey, monitoringTaskSourceKey } from '@/services/healthMonitoringPolicyService'

const finite = (...values: unknown[]) => {
  for (const value of values) {
    const number = typeof value === 'string' ? Number(value) : value
    if (typeof number === 'number' && Number.isFinite(number)) return number
  }
  return undefined
}

export async function GET(request: NextRequest) {
  const start = Date.now()
  try {
    requireCron(request)
    const supabase = requireSupabase()
    const checkedAt = new Date()
    const { data: gardens, error } = await supabase.from('gardens').select('*').order('created_at')
    if (error) throw new Error(error.message)
    const result = { gardensChecked: 0, gardensSkipped: 0, alertsCreated: 0, alertsRefreshed: 0, tasksCreated: 0, errorsQueued: 0 }

    for (const gardenRow of gardens ?? []) {
      const key = monitoringRunKey(gardenRow.id, checkedAt)
      const { data: existingRun } = await supabase.from('monitoring_runs').select('id').eq('garden_id', gardenRow.id).eq('idempotency_key', key).maybeSingle()
      if (existingRun) { result.gardensSkipped += 1; continue }
      const { data: run, error: runError } = await supabase.from('monitoring_runs').insert({
        garden_id: gardenRow.id, user_id: gardenRow.user_id, idempotency_key: key,
        status: 'running', checked_at: checkedAt.toISOString(),
      }).select('id').single()
      if (runError || !run) { result.errorsQueued += 1; continue }

      try {
        result.gardensChecked += 1
        const since = new Date(checkedAt.getTime() - 30 * 86_400_000).toISOString().slice(0, 10)
        const [tasksRes, weatherRes, sensorsRes, inventoryRes, prefsRes] = await Promise.all([
          supabase.from('garden_tasks').select('*').eq('garden_id', gardenRow.id).order('date'),
          supabase.from('daily_weather_log').select('*').eq('garden_id', gardenRow.id).gte('log_date', since).order('log_date', { ascending: false }),
          supabase.from('sensor_readings').select('*').eq('garden_id', gardenRow.id).gte('recorded_at', new Date(checkedAt.getTime() - 48 * 3_600_000).toISOString()).order('recorded_at', { ascending: false }),
          supabase.from('phyto_inventory').select('id, quantity').eq('garden_id', gardenRow.id).gt('quantity', 0).limit(1),
          supabase.from('notification_preferences').select('*').eq('user_id', gardenRow.user_id).maybeSingle(),
        ])
        if (tasksRes.error) throw new Error(tasksRes.error.message)
        const tasks = (tasksRes.data ?? []).map((row: any) => ({
          id: row.id, gardenId: row.garden_id, plantName: row.plant_name, variety: row.variety,
          taskType: row.task_type, date: row.date, nextDueDate: row.next_due_date,
          completed: Boolean(row.completed), quantity: finite(row.quantity), notes: row.notes,
        })) as GardenTask[]
        const garden: Garden = {
          id: gardenRow.id, name: gardenRow.name, sizeSqMeters: finite(gardenRow.size_sq_meters) ?? 0,
          coordinates: gardenRow.coordinates, soilType: gardenRow.soil_type,
          dimensions: gardenRow.dimensions, createdAt: gardenRow.created_at,
        }
        const weatherRows = weatherRes.data ?? []
        const latest: any = weatherRows[0]
        const sensors = sensorsRes.data ?? []
        const findSensor = (type: string) => sensors.find((row: any) => row.sensor_type === type)
        const humiditySensor: any = findSensor('humidity')
        const windSensor: any = findSensor('wind_speed')
        const temp = latest ? finite(latest.temperature_max, latest.temperature_min) : undefined
        const humidity = finite(humiditySensor?.value, latest?.raw_data?.humidity, latest?.raw_data?.snapshot?.weather?.humidityPercentage)
        const weather = temp !== undefined && humidity !== undefined ? {
          temp, humidity, rainMm: finite(latest?.precipitation_mm) ?? 0,
          rainTomorrow: finite(weatherRows[1]?.precipitation_mm) ? Number(weatherRows[1].precipitation_mm) > 0 : false,
          windSpeed: finite(windSensor?.value, latest?.raw_data?.snapshot?.weather?.windSpeedKmh) ?? 0,
          recordedAt: latest?.log_date ? `${latest.log_date}T12:00:00.000Z` : checkedAt.toISOString(),
          source: 'persisted_daily_weather_log',
        } : undefined
        const environmentalSummary = summarizeGardenEnvironmentalHistory(extractGardenEnvironmentalHistory(
          weatherRows.map((row: any) => ({ log_date: row.log_date, raw_data: row.raw_data || {} })),
          { gardenId: gardenRow.id }
        ))
        const sensorData = sensors.flatMap((row: any) => {
          const type = row.sensor_type === 'soil_moisture' ? 'soil_moisture' : row.sensor_type === 'temperature' ? 'temperature' : row.sensor_type === 'humidity' ? 'humidity' : null
          return type ? [{ type, value: Number(row.value), timestamp: row.recorded_at, zoneId: row.sensor_location }] : []
        }) as any
        const nextHarvest = tasks.filter(task => !task.completed && task.taskType === 'Harvest').sort((a, b) => a.date.localeCompare(b.date))[0]?.date
        const alerts = await checkHealthAlerts({
          garden, tasks, weather, sensorData, checkedAt: checkedAt.toISOString(),
          environmentalHistorySummary: environmentalSummary,
          productAvailability: inventoryRes.error ? 'unknown' : inventoryRes.data?.length ? 'available' : 'unavailable',
          nextHarvestDate: nextHarvest,
        })

        for (const alert of alerts) {
          const metadata = alert.metadata || {}
          const fingerprint = String(metadata.fingerprint)
          const { data: existing } = await supabase.from('health_alerts').select('id, occurrence_count')
            .eq('garden_id', gardenRow.id).eq('fingerprint', fingerprint).eq('resolved', false).maybeSingle()
          let alertId: string
          if (existing) {
            await supabase.from('health_alerts').update({
              severity: alert.severity, message: alert.message, recommendation: alert.recommendation,
              metadata, last_seen_at: checkedAt.toISOString(), occurrence_count: (existing.occurrence_count || 1) + 1,
              confidence: metadata.confidence, freshness_hours: metadata.freshnessHours,
              contraindications: metadata.contraindications || [], input_snapshot: metadata.inputSnapshot || {},
            }).eq('id', existing.id)
            alertId = existing.id
            result.alertsRefreshed += 1
          } else {
            const { data: inserted, error: insertError } = await supabase.from('health_alerts').insert({
              garden_id: gardenRow.id, plant_id: alert.plantId || null, alert_type: alert.alertType,
              severity: alert.severity, source: alert.source, title: alert.title, message: alert.message,
              recommendation: alert.recommendation || null, resolved: false, metadata,
              fingerprint, source_kind: metadata.sourceKind, rule_id: metadata.ruleId, rule_version: metadata.ruleVersion,
              confidence: metadata.confidence, input_snapshot: metadata.inputSnapshot || {},
              freshness_hours: metadata.freshnessHours, contraindications: metadata.contraindications || [],
              first_seen_at: checkedAt.toISOString(), last_seen_at: checkedAt.toISOString(),
            }).select('id').single()
            if (insertError || !inserted) throw new Error(insertError?.message ?? 'health_alert_insert_failed')
            alertId = inserted.id
            result.alertsCreated += 1
          }

          if (alert.severity === 'critical') {
            const sourceKey = monitoringTaskSourceKey(fingerprint)
            const { data: existingTask } = await supabase.from('garden_tasks').select('id')
              .eq('garden_id', gardenRow.id).eq('monitoring_source_key', sourceKey).eq('completed', false).maybeSingle()
            if (!existingTask) {
              const { error: taskError } = await supabase.from('garden_tasks').insert({
                garden_id: gardenRow.id, plant_name: alert.plantId || 'Monitoraggio garden',
                task_type: 'Treatment', date: checkedAt.toISOString().slice(0, 10), completed: false,
                notes: ['PROPOSTA DA CONFERMARE - non e una diagnosi o esecuzione', alert.title, alert.message, alert.recommendation].filter(Boolean).join('\n'),
                is_suggested: true, suggested_by: 'health-monitoring-cron', monitoring_source_key: sourceKey,
              })
              if (!taskError) result.tasksCreated += 1
            }
          }

          const emailAllowed = Boolean(prefsRes.data?.email_enabled && prefsRes.data?.weather_alerts)
          await supabase.from('monitoring_notification_queue').upsert({
            alert_id: alertId, garden_id: gardenRow.id, user_id: gardenRow.user_id, channel: 'email',
            status: emailAllowed ? 'queued' : 'suppressed', suppression_reason: emailAllowed ? null : 'notification_preferences',
            payload: { title: alert.title, message: alert.message, severity: alert.severity },
          }, { onConflict: 'alert_id,channel', ignoreDuplicates: true })
        }
        await supabase.from('monitoring_runs').update({
          status: 'completed', completed_at: new Date().toISOString(),
          input_snapshot: { weatherRows: weatherRows.length, sensors: sensors.length, tasks: tasks.length, environmentalSummary },
          result_summary: { alerts: alerts.length },
        }).eq('id', run.id)
      } catch (gardenError) {
        const message = gardenError instanceof Error ? gardenError.message : 'monitoring_garden_failed'
        await supabase.from('monitoring_runs').update({ status: 'failed', completed_at: new Date().toISOString(), last_error: message }).eq('id', run.id)
        await supabase.from('monitoring_error_queue').insert({
          run_id: run.id, garden_id: gardenRow.id, stage: 'garden_check', error_code: 'monitoring_garden_failed',
          error_message: message, payload: { idempotencyKey: key }, attempts: 0, status: 'pending',
          next_retry_at: new Date(Date.now() + 30 * 60_000).toISOString(),
        })
        result.errorsQueued += 1
      }
    }
    return NextResponse.json({ success: true, ...result, durationMs: Date.now() - start })
  } catch (error) {
    const status = error instanceof Error && error.message.includes('cron') ? 401 : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : 'health_monitoring_failed' }, { status })
  }
}

export const POST = GET
