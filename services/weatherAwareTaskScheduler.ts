/**
 * WEATHER-AWARE TASK SCHEDULER
 *
 * Sistema intelligente che riprogramma automaticamente i task in base alle condizioni meteo.
 *
 * PROBLEMA RISOLTO:
 * - Task dice "Trattamento tra 15 giorni"
 * - Al giorno 14, previsioni dicono "domani pioggia"
 * - Sistema sposta automaticamente al primo giorno utile
 *
 * LOGICA:
 * 1. Ogni notte (o su richiesta) analizza task dei prossimi 7 giorni
 * 2. Per ogni task, verifica condizioni meteo necessarie
 * 3. Se meteo non compatibile, trova primo giorno utile e riprogramma
 * 4. Notifica utente del cambio automatico
 */

import { GardenTask, Garden } from '../types'
import { getWeatherForecast7Days, WeatherForecast } from './weatherService'
import { addDays, parseISO, format, isBefore, isAfter } from 'date-fns'

/**
 * Condizioni meteo richieste per tipo di task
 */
export interface TaskWeatherRequirements {
  taskType: GardenTask['taskType']
  // Temperatura
  minTemp?: number // Temperatura minima richiesta (°C)
  maxTemp?: number // Temperatura massima tollerata (°C)
  // Pioggia
  maxRain?: number // Pioggia massima tollerata (mm)
  noRainRequired?: boolean // True = non deve piovere
  // Vento
  maxWind?: number // Vento massimo tollerato (km/h)
  // Timing
  dryDaysBefore?: number // Giorni senza pioggia richiesti prima
  dryDaysAfter?: number // Giorni senza pioggia richiesti dopo
  // Note
  reason?: string // Motivazione (per UI)
}

/**
 * Requisiti meteo per ogni tipo di task
 */
const TASK_WEATHER_REQUIREMENTS: Record<string, TaskWeatherRequirements> = {
  // Trattamenti fogliari
  Treatment: {
    taskType: 'Treatment',
    maxRain: 0, // NO pioggia
    noRainRequired: true,
    dryDaysAfter: 1, // Almeno 24h senza pioggia dopo trattamento
    maxWind: 20, // Vento moderato max (per evitare deriva)
    reason: 'Trattamenti fogliari richiedono assenza pioggia per 24-48h per essere efficaci'
  },

  // Fertilizzazione
  Fertilize: {
    taskType: 'Fertilize',
    maxRain: 5, // Pioggia leggera OK (aiuta distribuzione)
    minTemp: 5, // Non fertilizzare con terreno ghiacciato
    reason: 'Fertilizzanti devono essere assorbiti gradualmente, no piogge intense che dilavano'
  },

  // Potatura
  Prune: {
    taskType: 'Prune',
    maxRain: 2, // Pioggia leggera tollerata
    minTemp: 0, // OK anche con gelo
    reason: 'Potatura meglio a tempo asciutto per evitare infezioni fungine sui tagli'
  },

  // Semina
  Sowing: {
    taskType: 'Sowing',
    maxRain: 10, // Pioggia moderata OK
    minTemp: 8, // Dipende dalla pianta (questo è medio)
    maxTemp: 35, // Evita caldo estremo
    dryDaysBefore: 1, // Terreno non troppo fangoso
    reason: 'Semina richiede terreno lavorabile (non troppo bagnato) e temperature adeguate'
  },

  // Trapianto
  Transplant: {
    taskType: 'Transplant',
    maxRain: 5, // Pioggia leggera aiuta
    minTemp: 10, // Variabile per pianta
    maxTemp: 32, // Evita stress da caldo
    reason: 'Trapianti meglio con tempo mite e leggera umidità'
  },

  // Irrigazione
  Watering: {
    taskType: 'Watering',
    maxRain: 10, // Se piove >10mm, salta irrigazione
    noRainRequired: false, // Pioggia cancella il bisogno
    reason: 'Irrigazione non necessaria se pioggia sufficiente prevista'
  },

  // Raccolta
  Harvest: {
    taskType: 'Harvest',
    maxRain: 5, // Meglio raccogliere a secco
    reason: 'Raccolta preferibile a tempo asciutto per qualità e conservazione'
  }
}

/**
 * Risultato analisi meteo per un task
 */
export interface WeatherTaskAnalysis {
  taskId: string
  taskType: GardenTask['taskType']
  scheduledDate: string
  isSuitable: boolean
  reason: string
  suggestedDate?: string // Primo giorno utile alternativo
  weatherIssues: string[] // Lista problemi meteo
  autoRescheduled: boolean
}

/**
 * Analizza se un task può essere eseguito nella data schedulata dato il meteo
 */
export function analyzeTaskWeatherSuitability(
  task: GardenTask,
  scheduledDate: Date,
  forecast: WeatherForecast[],
  requirements?: TaskWeatherRequirements
): WeatherTaskAnalysis {
  const taskReqs = requirements || TASK_WEATHER_REQUIREMENTS[task.taskType]

  if (!taskReqs) {
    // Task type senza requisiti meteo specifici
    return {
      taskId: task.id,
      taskType: task.taskType,
      scheduledDate: format(scheduledDate, 'yyyy-MM-dd'),
      isSuitable: true,
      reason: 'Nessun requisito meteo specifico',
      weatherIssues: [],
      autoRescheduled: false
    }
  }

  const dateStr = format(scheduledDate, 'yyyy-MM-dd')
  const dayForecast = forecast.find(f => f.date === dateStr)

  if (!dayForecast) {
    return {
      taskId: task.id,
      taskType: task.taskType,
      scheduledDate: dateStr,
      isSuitable: false,
      reason: 'Previsioni meteo non disponibili',
      weatherIssues: ['Dati meteo mancanti'],
      autoRescheduled: false
    }
  }

  const issues: string[] = []

  // Verifica temperatura minima
  if (taskReqs.minTemp && dayForecast.tempMin !== undefined && dayForecast.tempMin < taskReqs.minTemp) {
    issues.push(`Temperatura troppo bassa: ${dayForecast.tempMin.toFixed(1)}°C (min: ${taskReqs.minTemp}°C)`)
  }

  // Verifica temperatura massima
  if (taskReqs.maxTemp && dayForecast.tempMax !== undefined && dayForecast.tempMax > taskReqs.maxTemp) {
    issues.push(`Temperatura troppo alta: ${dayForecast.tempMax.toFixed(1)}°C (max: ${taskReqs.maxTemp}°C)`)
  }

  // Verifica pioggia
  if (taskReqs.noRainRequired && dayForecast.rainForecastMm > 0) {
    issues.push(`Pioggia prevista: ${dayForecast.rainForecastMm.toFixed(1)}mm (richiesto 0mm)`)
  } else if (taskReqs.maxRain !== undefined && dayForecast.rainForecastMm > taskReqs.maxRain) {
    issues.push(`Pioggia eccessiva: ${dayForecast.rainForecastMm.toFixed(1)}mm (max: ${taskReqs.maxRain}mm)`)
  }

  // Verifica vento (se disponibile)
  if (taskReqs.maxWind && dayForecast.windSpeed && dayForecast.windSpeed > taskReqs.maxWind) {
    issues.push(`Vento troppo forte: ${dayForecast.windSpeed.toFixed(0)}km/h (max: ${taskReqs.maxWind}km/h)`)
  }

  // Verifica giorni asciutti dopo (es. trattamenti)
  if (taskReqs.dryDaysAfter) {
    const dayIndex = forecast.findIndex(f => f.date === dateStr)
    if (dayIndex >= 0 && dayIndex < forecast.length - 1) {
      const daysAfter = forecast.slice(dayIndex + 1, dayIndex + 1 + taskReqs.dryDaysAfter)
      const rainAfter = daysAfter.filter(d => d.rainForecastMm > 5)
      if (rainAfter.length > 0) {
        issues.push(`Pioggia prevista nelle prossime ${taskReqs.dryDaysAfter} ore (necessario tempo asciutto dopo)`)
      }
    }
  }

  // Verifica giorni asciutti prima (es. semina su terreno lavorabile)
  if (taskReqs.dryDaysBefore) {
    const dayIndex = forecast.findIndex(f => f.date === dateStr)
    if (dayIndex > 0) {
      const daysBefore = forecast.slice(Math.max(0, dayIndex - taskReqs.dryDaysBefore), dayIndex)
      const rainBefore = daysBefore.filter(d => d.rainForecastMm > 10)
      if (rainBefore.length > 0) {
        issues.push(`Pioggia intensa nei giorni precedenti (terreno troppo bagnato)`)
      }
    }
  }

  const isSuitable = issues.length === 0

  return {
    taskId: task.id,
    taskType: task.taskType,
    scheduledDate: dateStr,
    isSuitable,
    reason: isSuitable ? 'Condizioni meteo favorevoli' : issues.join('; '),
    weatherIssues: issues,
    autoRescheduled: false
  }
}

/**
 * Trova il primo giorno utile entro i prossimi 7 giorni
 */
export function findNextSuitableDay(
  task: GardenTask,
  currentScheduled: Date,
  forecast: WeatherForecast[],
  requirements?: TaskWeatherRequirements
): string | null {
  const taskReqs = requirements || TASK_WEATHER_REQUIREMENTS[task.taskType]

  if (!taskReqs) {
    return null // Nessun vincolo meteo
  }

  // Cerca dal giorno dopo la data corrente schedulata
  for (let i = 0; i < forecast.length; i++) {
    const checkDate = parseISO(forecast[i].date!)

    // Salta giorni prima della data schedulata
    if (isBefore(checkDate, currentScheduled)) {
      continue
    }

    const analysis = analyzeTaskWeatherSuitability(task, checkDate, forecast, taskReqs)

    if (analysis.isSuitable) {
      return forecast[i].date!
    }
  }

  return null // Nessun giorno utile trovato nei prossimi 7 giorni
}

/**
 * Notifica di riprogrammazione automatica
 */
export interface RescheduleNotification {
  taskId: string
  taskName: string
  originalDate: string
  newDate: string
  reason: string
  severity: 'info' | 'warning'
}

/**
 * Analizza tutti i task e riprogramma quelli non compatibili con meteo
 */
export async function rescheduleTasksBasedOnWeather(
  garden: Garden,
  tasks: GardenTask[],
  daysAhead: number = 7
): Promise<{
  analyses: WeatherTaskAnalysis[]
  rescheduled: RescheduleNotification[]
  updatedTasks: GardenTask[]
}> {
  if (!garden.coordinates) {
    return { analyses: [], rescheduled: [], updatedTasks: [] }
  }

  // Fetch previsioni 7 giorni
  const forecast = await getWeatherForecast7Days(
    garden.coordinates.latitude,
    garden.coordinates.longitude
  )

  if (forecast.length === 0) {
    console.warn('No weather forecast available for rescheduling')
    return { analyses: [], rescheduled: [], updatedTasks: [] }
  }

  const today = new Date()
  const futureLimit = addDays(today, daysAhead)

  // Filtra task non completati nei prossimi daysAhead giorni
  const upcomingTasks = tasks.filter(t => {
    if (t.completed) return false
    const taskDate = t.nextDueDate ? parseISO(t.nextDueDate) : parseISO(t.date)
    return isAfter(taskDate, today) && isBefore(taskDate, futureLimit)
  })

  const analyses: WeatherTaskAnalysis[] = []
  const rescheduled: RescheduleNotification[] = []
  const updatedTasks: GardenTask[] = []

  for (const task of upcomingTasks) {
    const scheduledDate = task.nextDueDate ? parseISO(task.nextDueDate) : parseISO(task.date)

    // Analizza compatibilità meteo
    const analysis = analyzeTaskWeatherSuitability(task, scheduledDate, forecast)
    analyses.push(analysis)

    if (!analysis.isSuitable) {
      // Trova primo giorno utile
      const newDate = findNextSuitableDay(task, scheduledDate, forecast)

      if (newDate) {
        // Riprogramma task
        const updatedTask: GardenTask = {
          ...task,
          nextDueDate: newDate,
          notes: (task.notes || '') + `\n[Auto-riprogrammato da ${format(scheduledDate, 'dd/MM/yyyy')} per meteo: ${analysis.reason}]`
        }

        updatedTasks.push(updatedTask)

        rescheduled.push({
          taskId: task.id,
          taskName: `${task.taskType} - ${task.plantName}`,
          originalDate: format(scheduledDate, 'dd/MM/yyyy'),
          newDate: format(parseISO(newDate), 'dd/MM/yyyy'),
          reason: analysis.reason,
          severity: 'info'
        })

        analysis.suggestedDate = newDate
        analysis.autoRescheduled = true
      } else {
        // Nessun giorno utile trovato - avvisa utente
        rescheduled.push({
          taskId: task.id,
          taskName: `${task.taskType} - ${task.plantName}`,
          originalDate: format(scheduledDate, 'dd/MM/yyyy'),
          newDate: 'Da decidere',
          reason: `Meteo sfavorevole per 7+ giorni: ${analysis.reason}`,
          severity: 'warning'
        })
      }
    }
  }

  return { analyses, rescheduled, updatedTasks }
}

/**
 * Verifica task di domani e notifica se meteo non adatto
 * Da eseguire ogni sera (es. ore 20:00)
 */
export async function checkTomorrowTasksWeather(
  garden: Garden,
  tasks: GardenTask[]
): Promise<RescheduleNotification[]> {
  const tomorrow = addDays(new Date(), 1)
  const tomorrowStr = format(tomorrow, 'yyyy-MM-dd')

  // Filtra task di domani
  const tomorrowTasks = tasks.filter(t => {
    if (t.completed) return false
    const taskDate = t.nextDueDate || t.date
    return taskDate === tomorrowStr
  })

  if (tomorrowTasks.length === 0) {
    return []
  }

  if (!garden.coordinates) {
    return []
  }

  // Fetch meteo 7 giorni
  const forecast = await getWeatherForecast7Days(
    garden.coordinates.latitude,
    garden.coordinates.longitude
  )

  const notifications: RescheduleNotification[] = []

  for (const task of tomorrowTasks) {
    const analysis = analyzeTaskWeatherSuitability(task, tomorrow, forecast)

    if (!analysis.isSuitable) {
      const newDate = findNextSuitableDay(task, tomorrow, forecast)

      notifications.push({
        taskId: task.id,
        taskName: `${task.taskType} - ${task.plantName}`,
        originalDate: 'Domani',
        newDate: newDate ? format(parseISO(newDate), 'dd/MM/yyyy') : 'Da decidere',
        reason: `⚠️ ${analysis.reason}`,
        severity: 'warning'
      })
    }
  }

  return notifications
}

/**
 * Helper: Ottieni task schedulati per una data specifica
 */
export function getTasksForDate(tasks: GardenTask[], date: Date): GardenTask[] {
  const dateStr = format(date, 'yyyy-MM-dd')
  return tasks.filter(t => {
    if (t.completed) return false
    const taskDate = t.nextDueDate || t.date
    return taskDate === dateStr
  })
}

/**
 * Helper: Cancella task Watering se pioggia sufficiente prevista
 */
export async function cancelIrrigationIfRain(
  garden: Garden,
  wateringTasks: GardenTask[],
  rainThreshold: number = 10 // mm
): Promise<GardenTask[]> {
  if (!garden.coordinates || wateringTasks.length === 0) {
    return []
  }

  const forecast = await getWeatherForecast7Days(
    garden.coordinates.latitude,
    garden.coordinates.longitude
  )

  const cancelled: GardenTask[] = []

  for (const task of wateringTasks) {
    const taskDate = task.nextDueDate || task.date
    const dayForecast = forecast.find(f => f.date === taskDate)

    if (dayForecast && dayForecast.rainForecastMm >= rainThreshold) {
      cancelled.push({
        ...task,
        completed: true,
        notes: (task.notes || '') + `\n[Auto-cancellato: pioggia ${dayForecast.rainForecastMm.toFixed(1)}mm prevista]`
      })
    }
  }

  return cancelled
}
