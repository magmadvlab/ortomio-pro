'use client'

import React, { useEffect, useState } from 'react'
import { Garden, GardenTask } from '@/types'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { checkWeatherHealthRisks } from '@/services/weatherService'
import { getScopedHealthMicroclimateSnapshot } from '@/services/healthMicroclimateService'
import { getSeasonalHealthAlerts } from '@/services/seasonalHealthService'
import { getSeasonForDate } from '@/utils/seasonalAdjustment'
import { analyzeHealthRisks } from '@/logic/healthAlertEngine'
import type { HealthAlert } from '@/logic/healthAlertEngine'
import type { IrrigationZone, WateringLog } from '@/types/irrigation'
import type { TreatmentRecordDB } from '@/types'
import { differenceInDays, parseISO, addDays, isAfter } from 'date-fns'

interface HealthAlertSystemProps {
  garden: Garden
  tasks: GardenTask[]
  onAlertsChange: (alerts: HealthAlert[]) => void
}

export function HealthAlertSystem({
  garden,
  tasks,
  onAlertsChange
}: HealthAlertSystemProps) {
  const [alerts, setAlerts] = useState<HealthAlert[]>([])
  const [loading, setLoading] = useState(true)
  const { storageProvider } = useStorage()

  const buildIrrigationDeficitAlerts = async (): Promise<HealthAlert[]> => {
    const sp: any = storageProvider as any
    if (!sp || typeof sp.getIrrigationZones !== 'function' || typeof sp.getWateringLogs !== 'function') {
      return []
    }

    let zones: IrrigationZone[] = []
    try {
      zones = (await sp.getIrrigationZones(undefined, garden.id)) as IrrigationZone[]
    } catch {
      return []
    }

    if (!zones || zones.length === 0) return []

    let logs: WateringLog[] = []
    try {
      logs = (await sp.getWateringLogs(undefined, garden.id)) as WateringLog[]
    } catch {
      logs = []
    }

    const now = new Date()
    const month = now.getMonth() + 1
    const threshold = [6, 7, 8].includes(month) ? 3 : 5

    const alerts: HealthAlert[] = []
    for (const z of zones) {
      const last = logs
        .filter((l) => l.zoneId === z.id)
        .sort((a, b) => new Date((b.wateredAt || b.date) as any).getTime() - new Date((a.wateredAt || a.date) as any).getTime())[0]

      const lastDateStr = z.lastWateredAt || last?.wateredAt || last?.date
      if (!lastDateStr) continue

      const lastDate = typeof lastDateStr === 'string' ? new Date(lastDateStr) : new Date(lastDateStr as any)
      if (Number.isNaN(lastDate.getTime())) continue

      const daysSince = differenceInDays(now, lastDate)
      if (daysSince <= threshold) continue

      alerts.push({
        type: 'stress',
        severity: daysSince > threshold + 2 ? 'critical' : 'high',
        message: `Zona "${z.name}" senza irrigazione da ${daysSince} giorni.`,
        action: 'Registra un\'irrigazione o pianifica un intervento nelle prossime ore.',
        urgency: daysSince > threshold + 2 ? 'immediate' : 'soon',
        confidence: 80,
        affectedPlants: z.plantTypes
      })
    }

    return alerts
  }

  const buildTreatmentSafetyIntervalAlerts = async (): Promise<HealthAlert[]> => {
    const sp: any = storageProvider as any
    if (!sp || typeof sp.getTreatments !== 'function') {
      return []
    }

    let treatments: TreatmentRecordDB[] = []
    try {
      treatments = (await sp.getTreatments(garden.id)) as TreatmentRecordDB[]
    } catch {
      return []
    }

    const now = new Date()
    const alerts: HealthAlert[] = []

    for (const t of treatments || []) {
      const notes = (t.notes || '').toLowerCase()
      const match = notes.match(/safety[_\s-]*interval[_\s-]*days\s*[:=]\s*(\d+)/i)
      const days = match ? Number(match[1]) : undefined
      if (!days || Number.isNaN(days) || days <= 0) continue

      const start = parseISO(t.treatment_date)
      if (Number.isNaN(start.getTime())) continue

      const end = addDays(start, days)
      if (!isAfter(end, now)) continue

      const remaining = differenceInDays(end, now)
      alerts.push({
        type: 'maintenance',
        severity: remaining <= 2 ? 'critical' : 'high',
        message: `Periodo di carenza attivo: ${t.crop_name} (${t.product_name}). Ancora ${remaining} giorni.`,
        action: `Non raccogliere fino al ${end.toLocaleDateString('it-IT')}.`,
        urgency: 'immediate',
        confidence: 85
      })
    }

    return alerts
  }
  
  useEffect(() => {
    const checkAlerts = async () => {
      setLoading(true)
      const newAlerts: HealthAlert[] = []
      
      try {
        const devices = storageProvider?.getDevices
          ? await storageProvider.getDevices(garden.id).catch(() => [])
          : []
        const microclimate = await getScopedHealthMicroclimateSnapshot(garden, { devices }).catch(() => null)

        // 1. Analisi proattiva con healthAlertEngine
        const proactiveAlerts = await analyzeHealthRisks(garden, tasks, new Date(), { devices })
        newAlerts.push(...proactiveAlerts)

        // 1b. Alert irrigazione da log/zone (se disponibili)
        try {
          const irrigationAlerts = await buildIrrigationDeficitAlerts()
          newAlerts.push(...irrigationAlerts)
        } catch (error) {
          console.error('Error checking irrigation deficit alerts:', error)
        }

        // 1c. Alert periodo carenza trattamenti (se disponibile)
        try {
          const safetyAlerts = await buildTreatmentSafetyIntervalAlerts()
          newAlerts.push(...safetyAlerts)
        } catch (error) {
          console.error('Error checking treatment safety interval alerts:', error)
        }
        
        // 2. Alert Meteo
        if (garden.coordinates) {
          try {
            const weatherAlerts = await checkWeatherHealthRisks(garden)
            newAlerts.push(...weatherAlerts)
          } catch (error) {
            console.error('Error checking weather alerts:', error)
          }
        }
        
        // 3. Alert Stagionali (legacy, mantenuto per compatibilità)
        if (garden.coordinates) {
          const season = getSeasonForDate(new Date(), garden.coordinates.latitude)
          const seasonalAlerts = getSeasonalHealthAlerts(season, garden, tasks, microclimate)
          newAlerts.push(...seasonalAlerts)
        }
        
        // 4. Alert da stato piante (sintomi rilevati)
        // TODO: Implementare quando avremo dati da foto AI
        
        setAlerts(newAlerts)
        onAlertsChange(newAlerts)
      } catch (error) {
        console.error('Error checking health alerts:', error)
      } finally {
        setLoading(false)
      }
    }
    
    checkAlerts()
    
    // Ricarica alert ogni ora
    const interval = setInterval(checkAlerts, 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [garden, tasks, onAlertsChange, storageProvider])
  
  // Questo componente non renderizza nulla, solo gestisce la logica
  return null
}
