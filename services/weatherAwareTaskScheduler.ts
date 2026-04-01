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
import { addDays, subDays, parseISO, format, isBefore, isAfter } from 'date-fns'
import { getSupabaseClient } from '@/config/supabase'
import {
  getPersistedGardenEnvironmentalHistorySummary,
  getPersistedZoneEnvironmentalHistorySummary,
  type GardenEnvironmentalHistorySummary,
  type ZoneEnvironmentalHistorySummary,
} from '@/services/environmentalMonitoringService'

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
 * Requisiti meteo specifici per pianta (override task type)
 * Usato per customizzare in base alla coltura specifica
 */
export const PLANT_SPECIFIC_REQUIREMENTS: Record<string, Partial<TaskWeatherRequirements>> = {
  // ORTAGGI DELICATI (Lattuga, Spinaci, Rucola)
  'Lattuga': {
    maxTemp: 28, // Soffrono il caldo
    reason: 'Lattuga e ortaggi da foglia soffrono con temperature >28°C (montano a seme)'
  },
  'Spinaci': {
    maxTemp: 25,
    reason: 'Spinaci preferiscono clima fresco, >25°C causano montatura a seme'
  },
  'Rucola': {
    maxTemp: 30,
    reason: 'Rucola diventa amara con caldo eccessivo'
  },

  // POMODORI (sensibili umidità)
  'Pomodoro': {
    maxRain: 15, // Pioggia moderata OK ma no eccessi
    reason: 'Pomodori sensibili a peronospora con pioggia eccessiva e umidità alta'
  },

  // ZUCCHINE/CUCURBITACEE (sensibili oidio)
  'Zucchina': {
    maxRain: 10,
    dryDaysAfter: 1,
    reason: 'Zucchine sensibili a oidio, meglio evitare bagnatura fogliare prolungata'
  },
  'Cetriolo': {
    maxRain: 10,
    dryDaysAfter: 1,
    reason: 'Cetrioli sensibili a oidio e peronospora con umidità eccessiva'
  },
  'Melone': {
    maxRain: 5,
    dryDaysAfter: 2,
    reason: 'Meloni richiedono clima asciutto durante maturazione per concentrare zuccheri'
  },

  // LEGUMI (sensibili ristagno)
  'Fagiolo': {
    maxRain: 15,
    dryDaysBefore: 1,
    reason: 'Fagioli soffrono ristagno idrico, terreno deve essere ben drenato'
  },
  'Pisello': {
    maxRain: 20,
    minTemp: 5,
    reason: 'Piselli tollerano freddo ma soffrono ristagno'
  },

  // BRASSICACEE (cavoli, broccoli)
  'Cavolo': {
    maxTemp: 30,
    minTemp: -5,
    reason: 'Cavoli tollerano freddo ma soffrono caldo eccessivo'
  },
  'Broccolo': {
    maxTemp: 28,
    minTemp: -3,
    reason: 'Broccoli preferiscono clima fresco, caldo causa fioriture precoci'
  },

  // PEPERONI (sensibili freddo)
  'Peperone': {
    minTemp: 12,
    maxTemp: 35,
    reason: 'Peperoni molto sensibili a freddo (<12°C bloccano crescita) e caldo estremo'
  },
  'Peperoncino': {
    minTemp: 15,
    maxTemp: 38,
    reason: 'Peperoncini ancora più sensibili al freddo, richiedono caldo'
  },

  // MELANZANE
  'Melanzana': {
    minTemp: 15,
    maxTemp: 35,
    reason: 'Melanzane richiedono caldo costante, freddo rallenta produzione'
  },

  // CAROTE/RADICI (sensibili terreno compatto)
  'Carota': {
    maxRain: 20,
    dryDaysBefore: 2,
    reason: 'Carote richiedono terreno friabile per sviluppo radice, no fango'
  },
  'Ravanello': {
    maxRain: 15,
    dryDaysBefore: 1,
    reason: 'Ravanelli crescono meglio con terreno umido ma non fangoso'
  },

  // AGLIO/CIPOLLA
  'Aglio': {
    maxRain: 5,
    dryDaysAfter: 2,
    reason: 'Aglio richiede clima asciutto durante bulbificazione per qualità'
  },
  'Cipolla': {
    maxRain: 10,
    dryDaysAfter: 1,
    reason: 'Cipolle richiedono clima asciutto durante maturazione bulbi'
  }
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
  Irrigation: {
    taskType: 'Irrigation',
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

type TaskEnvironmentalHistorySummary =
  | GardenEnvironmentalHistorySummary
  | ZoneEnvironmentalHistorySummary

const WET_SOIL_SENSITIVE_TASK_TYPES = new Set<GardenTask['taskType']>([
  'Sowing',
  'Fertilize',
  'Plowing',
  'Subsoiling',
  'Harrowing',
  'Tilling',
  'Rolling',
  'Hoeing',
  'EarthingUp',
  'Digging',
  'DeepHarrowing',
  'Crumbling',
  'SurfaceLeveling',
  'MinimumTillage',
  'StripTillage',
  'NoTill',
])

function hasPersistentWaterDeficit(summary?: TaskEnvironmentalHistorySummary | null): boolean {
  return (
    (summary?.highSoilWaterStressDays || 0) >= 2 ||
    (summary?.deficitWaterBalanceDays || 0) >= 3
  )
}

function hasPersistentWetPattern(summary?: TaskEnvironmentalHistorySummary | null): boolean {
  return (
    (summary?.surplusWaterBalanceDays || 0) >= 2 ||
    (summary?.lowDryingPowerDays || 0) >= 2
  )
}

function collectEnvironmentalHistoryIssues(
  task: GardenTask,
  dayForecast: WeatherForecast,
  summary?: TaskEnvironmentalHistorySummary | null
): string[] {
  if (!summary) {
    return []
  }

  const issues: string[] = []

  if (
    WET_SOIL_SENSITIVE_TASK_TYPES.has(task.taskType) &&
    hasPersistentWetPattern(summary)
  ) {
    issues.push('Storico recente troppo umido: il suolo puo essere ancora poco lavorabile o soggetto a compattazione')
  }

  if (
    task.taskType === 'Treatment' &&
    ((summary.highDiseasePressureDays || 0) >= 2 || (summary.lowDryingPowerDays || 0) >= 2) &&
    ((dayForecast.humidity || 0) >= 85 || dayForecast.rainMm > 0)
  ) {
    issues.push('Sequenza recente umida: copertura e asciugatura del trattamento ancora poco affidabili')
  }

  if (
    task.taskType === 'Harvest' &&
    hasPersistentWetPattern(summary) &&
    ((dayForecast.humidity || 0) >= 85 || dayForecast.rainMm > 0)
  ) {
    issues.push('Storico di bagnatura persistente: raccolta penalizzata per qualita e conservazione')
  }

  if (
    task.taskType === 'Transplant' &&
    hasPersistentWaterDeficit(summary) &&
    (dayForecast.tempMax || 0) >= 30
  ) {
    issues.push('Storico siccitoso recente: trapianto ad alto rischio di stress senza supporto idrico forte')
  }

  return issues
}

/**
 * Analizza se un task può essere eseguito nella data schedulata dato il meteo
 */
export function analyzeTaskWeatherSuitability(
  task: GardenTask,
  scheduledDate: Date,
  forecast: WeatherForecast[],
  requirements?: TaskWeatherRequirements,
  environmentalHistorySummary?: TaskEnvironmentalHistorySummary | null
): WeatherTaskAnalysis {
  // 1. Start con requisiti base per task type
  let taskReqs = requirements || TASK_WEATHER_REQUIREMENTS[task.taskType]

  // 2. MERGE con requisiti specifici della pianta (se esistono)
  const plantName = task.plantName
  if (plantName && PLANT_SPECIFIC_REQUIREMENTS[plantName]) {
    const plantReqs = PLANT_SPECIFIC_REQUIREMENTS[plantName]
    taskReqs = {
      ...taskReqs,
      ...plantReqs,
      // Merge reason (combina entrambi)
      reason: plantReqs.reason || taskReqs?.reason || 'Requisiti meteo specifici'
    } as TaskWeatherRequirements
  }

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
  const persistentWaterDeficit = hasPersistentWaterDeficit(environmentalHistorySummary)
  const effectiveMaxRain =
    task.taskType === 'Irrigation' && persistentWaterDeficit
      ? Math.max(taskReqs.maxRain ?? 0, 15)
      : taskReqs.maxRain

  // Verifica temperatura minima
  if (taskReqs.minTemp && dayForecast.tempMin !== undefined && dayForecast.tempMin < taskReqs.minTemp) {
    issues.push(`Temperatura troppo bassa: ${dayForecast.tempMin.toFixed(1)}°C (min: ${taskReqs.minTemp}°C)`)
  }

  // Verifica temperatura massima
  if (taskReqs.maxTemp && dayForecast.tempMax !== undefined && dayForecast.tempMax > taskReqs.maxTemp) {
    issues.push(`Temperatura troppo alta: ${dayForecast.tempMax.toFixed(1)}°C (max: ${taskReqs.maxTemp}°C)`)
  }

  // Verifica pioggia
  if (taskReqs.noRainRequired && dayForecast.rainMm > 0) {
    issues.push(`Pioggia prevista: ${dayForecast.rainMm.toFixed(1)}mm (richiesto 0mm)`)
  } else if (effectiveMaxRain !== undefined && dayForecast.rainMm > effectiveMaxRain) {
    issues.push(`Pioggia eccessiva: ${dayForecast.rainMm.toFixed(1)}mm (max: ${effectiveMaxRain}mm)`)
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
      const rainAfter = daysAfter.filter(d => d.rainMm > 5)
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
      const rainBefore = daysBefore.filter(d => d.rainMm > 10)
      if (rainBefore.length > 0) {
        issues.push(`Pioggia intensa nei giorni precedenti (terreno troppo bagnato)`)
      }
    }
  }

  issues.push(...collectEnvironmentalHistoryIssues(task, dayForecast, environmentalHistorySummary))

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
  requirements?: TaskWeatherRequirements,
  environmentalHistorySummary?: TaskEnvironmentalHistorySummary | null
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

    const analysis = analyzeTaskWeatherSuitability(
      task,
      checkDate,
      forecast,
      taskReqs,
      environmentalHistorySummary
    )

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

async function resolveGardenOwnerId(garden: Garden): Promise<string | null> {
  const directCandidate =
    (garden as Garden & { user_id?: string; userId?: string; ownerId?: string }).user_id ||
    (garden as Garden & { user_id?: string; userId?: string; ownerId?: string }).userId ||
    (garden as Garden & { user_id?: string; userId?: string; ownerId?: string }).ownerId

  if (directCandidate) {
    return directCandidate
  }

  const supabase = getSupabaseClient()
  if (!supabase) {
    return null
  }

  const { data } = await supabase
    .from('gardens')
    .select('user_id')
    .eq('id', garden.id)
    .maybeSingle()

  return typeof data?.user_id === 'string' ? data.user_id : null
}

async function buildEnvironmentalHistoryByTask(
  garden: Garden,
  tasks: GardenTask[],
  endDate: string
): Promise<{
  gardenSummary: GardenEnvironmentalHistorySummary | null
  zoneSummaries: Map<string, ZoneEnvironmentalHistorySummary>
}> {
  const userId = await resolveGardenOwnerId(garden)
  if (!userId) {
    return {
      gardenSummary: null,
      zoneSummaries: new Map(),
    }
  }

  const startDate = format(subDays(parseISO(endDate), 6), 'yyyy-MM-dd')
  const zoneIds = Array.from(
    new Set(tasks.map((task) => task.zoneId).filter((zoneId): zoneId is string => Boolean(zoneId)))
  )

  const [gardenSummary, zoneSummaryEntries] = await Promise.all([
    getPersistedGardenEnvironmentalHistorySummary({
      userId,
      gardenId: garden.id,
      startDate,
      endDate,
    }).catch(() => null),
    Promise.all(
      zoneIds.map(async (zoneId) => ({
        zoneId,
        summary: await getPersistedZoneEnvironmentalHistorySummary({
          userId,
          gardenId: garden.id,
          zoneId,
          startDate,
          endDate,
        }).catch(() => null),
      }))
    ),
  ])

  return {
    gardenSummary,
    zoneSummaries: new Map(
      zoneSummaryEntries
        .filter(
          (entry): entry is { zoneId: string; summary: ZoneEnvironmentalHistorySummary } =>
            Boolean(entry.summary)
        )
        .map((entry) => [entry.zoneId, entry.summary])
    ),
  }
}

function resolveTaskEnvironmentalHistory(
  task: GardenTask,
  histories: {
    gardenSummary: GardenEnvironmentalHistorySummary | null
    zoneSummaries: Map<string, ZoneEnvironmentalHistorySummary>
  }
): TaskEnvironmentalHistorySummary | null {
  if (task.zoneId && histories.zoneSummaries.has(task.zoneId)) {
    return histories.zoneSummaries.get(task.zoneId) || null
  }

  return histories.gardenSummary
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
  const todayStr = format(today, 'yyyy-MM-dd')
  const environmentalHistories = await buildEnvironmentalHistoryByTask(garden, upcomingTasks, todayStr)

  for (const task of upcomingTasks) {
    const scheduledDate = task.nextDueDate ? parseISO(task.nextDueDate) : parseISO(task.date)
    const environmentalHistorySummary = resolveTaskEnvironmentalHistory(task, environmentalHistories)

    // Analizza compatibilità meteo
    const analysis = analyzeTaskWeatherSuitability(
      task,
      scheduledDate,
      forecast,
      undefined,
      environmentalHistorySummary
    )
    analyses.push(analysis)

    if (!analysis.isSuitable) {
      // Trova primo giorno utile
      const newDate = findNextSuitableDay(
        task,
        scheduledDate,
        forecast,
        undefined,
        environmentalHistorySummary
      )

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
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const environmentalHistories = await buildEnvironmentalHistoryByTask(garden, tomorrowTasks, todayStr)

  for (const task of tomorrowTasks) {
    const analysis = analyzeTaskWeatherSuitability(
      task,
      tomorrow,
      forecast,
      undefined,
      resolveTaskEnvironmentalHistory(task, environmentalHistories)
    )

    if (!analysis.isSuitable) {
      const newDate = findNextSuitableDay(
        task,
        tomorrow,
        forecast,
        undefined,
        resolveTaskEnvironmentalHistory(task, environmentalHistories)
      )

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
 * Helper: Cancella task Irrigation se pioggia sufficiente prevista
 */
export async function cancelIrrigationIfRain(
  garden: Garden,
  irrigationTasks: GardenTask[],
  rainThreshold: number = 10 // mm
): Promise<GardenTask[]> {
  const wateringTasks = irrigationTasks // Alias for backward compatibility
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
