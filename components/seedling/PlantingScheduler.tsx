'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, CalendarCheck, CheckCircle, CloudSun, Loader2 } from 'lucide-react'

import type { Garden } from '@/types'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { getAllMasterSheets, getMasterSheetSync } from '@/services/plantMasterService'
import { getWeatherForecast7Days } from '@/services/weatherService'
import {
  assessPlantingWeatherWindow,
  type PlantingOperation,
  type PlantingWindowAssessment,
} from '@/logic/plantingWeatherDecisionEngine'

interface PlantingSchedulerProps {
  garden: Garden
  initialPlantName?: string
  initialVariety?: string
}

const futureDate = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

export default function PlantingScheduler({ garden, initialPlantName = '', initialVariety = '' }: PlantingSchedulerProps) {
  const { storageProvider } = useStorage()
  const masterSheets = useMemo(() => getAllMasterSheets(), [])
  const [operation, setOperation] = useState<PlantingOperation>('direct_sowing')
  const [plantName, setPlantName] = useState(initialPlantName)
  const [variety, setVariety] = useState(initialVariety)
  const [quantity, setQuantity] = useState(1)
  const [plannedDate, setPlannedDate] = useState(futureDate(2))
  const [assessment, setAssessment] = useState<PlantingWindowAssessment | null>(null)
  const [checking, setChecking] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedMessage, setSavedMessage] = useState('')

  useEffect(() => {
    let cancelled = false
    const timer = window.setTimeout(async () => {
      if (!plantName || !plannedDate) {
        setAssessment(null)
        return
      }
      if (!garden.coordinates) {
        setAssessment({
          status: 'UNVERIFIED', requestedDate: plannedDate, operation,
          headline: 'Aggiungi le coordinate dell’orto per validare il meteo',
          reasons: ['Questo orto non ha coordinate geografiche disponibili.'],
          actions: ['La programmazione può essere salvata, ma non può ancora essere verificata.'],
          blockingHazards: [], evaluatedDates: [],
        })
        return
      }

      setChecking(true)
      setSavedMessage('')
      try {
        const forecast = await getWeatherForecast7Days(
          garden.coordinates.latitude,
          garden.coordinates.longitude,
        )
        const master = getMasterSheetSync(plantName)
        const minTemperature = operation === 'transplant'
          ? master?.transplanting?.minTemp
          : master?.germination?.minTemp
        const maxTemperature = master?.germination?.maxTemp
        const result = assessPlantingWeatherWindow({
          operation,
          requestedDate: plannedDate,
          forecast,
          cropMinTemperature: minTemperature,
          cropMaxTemperature: maxTemperature,
        })
        if (!cancelled) setAssessment(result)
      } catch (error) {
        console.error('Planting weather validation failed:', error)
        if (!cancelled) {
          setAssessment({
            status: 'UNVERIFIED', requestedDate: plannedDate, operation,
            headline: 'Meteo temporaneamente non verificabile',
            reasons: ['Il servizio meteo non ha restituito una previsione valida.'],
            actions: ['Salva la programmazione e ricontrolla prima della messa in campo.'],
            blockingHazards: [], evaluatedDates: [],
          })
        }
      } finally {
        if (!cancelled) setChecking(false)
      }
    }, 350)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [garden.coordinates, operation, plannedDate, plantName])

  const applyRecommendedDate = () => {
    if (assessment?.recommendedDate) setPlannedDate(assessment.recommendedDate)
  }

  const schedulePlanting = async () => {
    if (!plantName || !plannedDate || assessment?.status === 'POSTPONE') return
    setSaving(true)
    setSavedMessage('')
    try {
      await storageProvider.createTask({
        gardenId: garden.id,
        plantName,
        variety: variety || undefined,
        quantity,
        plantingMethod: operation === 'direct_sowing' ? 'Seed' : 'Seedling',
        taskType: operation === 'direct_sowing' ? 'Sowing' : 'Transplant',
        date: plannedDate,
        scheduledDate: plannedDate,
        schedulingType: 'Scheduled',
        completed: false,
        lifecycleState: operation === 'direct_sowing' ? 'Sowing' : 'Transplanting',
        suggestedDate: assessment?.recommendedDate,
        suggestedBy: 'weather_planting_scheduler',
        notes: assessment?.status === 'UNVERIFIED'
          ? 'Data programmata; verifica meteo automatica ancora in attesa della finestra a 7 giorni.'
          : `Finestra meteo di attecchimento verificata: ${assessment?.evaluatedDates.join(', ')}.`,
      })
      setSavedMessage(`${operation === 'direct_sowing' ? 'Semina' : 'Trapianto'} programmato per il ${new Date(`${plannedDate}T12:00:00`).toLocaleDateString('it-IT')}.`)
    } catch (error) {
      console.error('Error scheduling planting:', error)
      setSavedMessage('Errore durante il salvataggio della programmazione.')
    } finally {
      setSaving(false)
    }
  }

  const statusClass = assessment?.status === 'GO'
    ? 'border-green-200 bg-green-50 text-green-900'
    : assessment?.status === 'POSTPONE'
      ? 'border-red-200 bg-red-50 text-red-900'
      : 'border-amber-200 bg-amber-50 text-amber-900'

  return (
    <section className="rounded-xl border border-blue-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start gap-3">
        <div className="rounded-lg bg-blue-100 p-2"><CalendarCheck className="h-5 w-5 text-blue-700" /></div>
        <div>
          <h2 className="font-semibold text-gray-900">Programma la messa in campo</h2>
          <p className="text-sm text-gray-600">OrtoMio verifica il giorno scelto e i due giorni successivi con il meteo a 7 giorni.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
        <select value={operation} onChange={(event) => setOperation(event.target.value as PlantingOperation)} className="rounded-md border px-3 py-2 text-sm">
          <option value="direct_sowing">Semina diretta in campo</option>
          <option value="transplant">Trapianto di piantine</option>
        </select>
        <select value={plantName} onChange={(event) => setPlantName(event.target.value)} className="rounded-md border px-3 py-2 text-sm">
          <option value="">Seleziona coltura</option>
          {masterSheets.map((sheet) => <option key={sheet.commonName} value={sheet.commonName}>{sheet.commonName}</option>)}
        </select>
        <input value={variety} onChange={(event) => setVariety(event.target.value)} placeholder="Varietà (es. zucca rossa)" className="rounded-md border px-3 py-2 text-sm" />
        <input type="number" min="1" value={quantity} onChange={(event) => setQuantity(Math.max(1, Number(event.target.value)))} className="rounded-md border px-3 py-2 text-sm" aria-label="Quantità" />
        <input type="date" value={plannedDate} onChange={(event) => setPlannedDate(event.target.value)} className="rounded-md border px-3 py-2 text-sm" />
      </div>

      {checking && <div className="mt-4 flex items-center gap-2 text-sm text-blue-700"><Loader2 className="h-4 w-4 animate-spin" /> Analisi della finestra meteo…</div>}
      {!checking && assessment && (
        <div className={`mt-4 rounded-lg border p-4 ${statusClass}`}>
          <div className="flex items-start gap-2">
            {assessment.status === 'GO' ? <CheckCircle className="mt-0.5 h-5 w-5" /> : assessment.status === 'POSTPONE' ? <AlertTriangle className="mt-0.5 h-5 w-5" /> : <CloudSun className="mt-0.5 h-5 w-5" />}
            <div className="flex-1">
              <p className="font-semibold">{assessment.headline}</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{assessment.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
              {assessment.actions.map((action) => <p key={action} className="mt-2 text-sm">{action}</p>)}
              {assessment.status === 'POSTPONE' && assessment.recommendedDate && (
                <button onClick={applyRecommendedDate} className="mt-3 rounded-md bg-red-700 px-3 py-2 text-sm font-medium text-white hover:bg-red-800">Usa la data consigliata</button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={schedulePlanting}
          disabled={saving || !plantName || !plannedDate || checking || assessment?.status === 'POSTPONE'}
          className="rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Salvataggio…' : 'Programma evento'}
        </button>
        {assessment?.status === 'POSTPONE' && <span className="text-sm text-red-700">Prima applica una data meteo compatibile.</span>}
        {savedMessage && <span className="text-sm text-gray-700">{savedMessage}</span>}
      </div>
    </section>
  )
}
