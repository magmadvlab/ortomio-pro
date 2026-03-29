/**
 * Plant Health Monitoring Service
 * Sistema intelligente per monitoraggio salute piante e suggerimenti automatici
 */

import { Garden, GardenTask, SmartDevice } from '@/types'
import type { IStorageProvider } from '@/packages/core/storage/interface'
import { weatherService } from '@/services/weatherService'
import {
  getScopedHealthMicroclimateSnapshot,
  type HealthMicroclimateSnapshot,
} from '@/services/healthMicroclimateService'
import {
  getCurrentPhenologyState,
  type CurrentPhenologyState,
} from '@/services/phenologyService'
import {
  inferHealthCropContext,
  type HealthCropContext,
  type HealthCropContextId,
} from '@/utils/healthCropContext'

export interface HealthAlert {
  id: string
  type: 'disease_risk' | 'pest_alert' | 'nutrient_deficiency' | 'stress_symptoms' | 'harvest_timing' | 'weather_stress'
  severity: 'low' | 'medium' | 'high' | 'critical'
  plantCode?: string
  plantName: string
  description: string
  detectedAt: string
  suggestedActions: HealthAction[]
  photoRequired: boolean
  agronomistConsultation: boolean
  urgencyDays: number
  confidence: number
  triggers: string[]
}

export interface HealthAction {
  type: 'photo_analysis' | 'agronomist_contact' | 'intervention' | 'monitoring'
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  estimatedTime: string
  cost?: number
  taskTemplate?: Partial<GardenTask>
}

export interface MonitoringRule {
  id: string
  name: string
  description: string
  triggers: MonitoringTrigger[]
  conditions: MonitoringCondition[]
  actions: HealthAction[]
  enabled: boolean
  applicableContexts?: HealthCropContextId[]
  samplePlants?: Array<{ code: string; name: string }>
}

export interface MonitoringTrigger {
  type: 'weather' | 'calendar' | 'task_completion' | 'photo_analysis' | 'manual'
  parameters: Record<string, unknown>
}

export interface MonitoringCondition {
  type: 'plant_age' | 'season' | 'weather_pattern' | 'previous_issues' | 'growth_stage'
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'in_range'
  value: unknown
}

const DEFAULT_MONITORING_RULES: MonitoringRule[] = [
  {
    id: 'tomato_blight_risk',
    name: 'Rischio Peronospora Pomodoro',
    description: 'Monitora condizioni favorevoli alla peronospora su pomodori',
    triggers: [
      {
        type: 'weather',
        parameters: {
          humidity: { min: 80 },
          temperature: { min: 15, max: 25 },
          leaf_wetness: { min: 50 },
          duration_hours: 12,
        },
      },
    ],
    conditions: [
      {
        type: 'plant_age',
        operator: 'greater_than',
        value: 30,
      },
      {
        type: 'season',
        operator: 'in_range',
        value: ['spring', 'summer'],
      },
    ],
    actions: [
      {
        type: 'photo_analysis',
        title: 'Controllo Foglie',
        description: 'Scatta foto delle foglie per rilevare primi sintomi',
        priority: 'high',
        estimatedTime: '5 min',
      },
      {
        type: 'intervention',
        title: 'Trattamento Preventivo',
        description: 'Applicare fungicida rameico preventivo',
        priority: 'medium',
        estimatedTime: '20 min',
        taskTemplate: {
          taskType: 'Treatment',
          notes: 'Trattamento preventivo peronospora - condizioni meteo favorevoli',
        },
      },
    ],
    enabled: true,
    applicableContexts: ['generic'],
    samplePlants: [{ code: 'ROW-01', name: 'Pomodoro San Marzano' }],
  },
  {
    id: 'aphid_spring_alert',
    name: 'Allerta Afidi Primaverili',
    description: 'Monitora comparsa afidi in primavera',
    triggers: [
      {
        type: 'calendar',
        parameters: {
          month: [3, 4, 5],
        },
      },
    ],
    conditions: [
      {
        type: 'season',
        operator: 'in_range',
        value: ['spring'],
      },
    ],
    actions: [
      {
        type: 'monitoring',
        title: 'Ispezione Settimanale',
        description: 'Controllo presenza afidi su germogli giovani',
        priority: 'medium',
        estimatedTime: '10 min',
        taskTemplate: {
          taskType: 'Photo',
          notes: 'Controllo afidi - ispezione germogli e pagina inferiore foglie',
        },
      },
      {
        type: 'photo_analysis',
        title: 'Identificazione Parassiti',
        description: 'Foto per identificare specie e pianificare controllo',
        priority: 'medium',
        estimatedTime: '3 min',
      },
    ],
    enabled: true,
    applicableContexts: ['generic', 'orchard'],
    samplePlants: [{ code: 'CHK-01', name: 'Pesco giovane' }],
  },
  {
    id: 'nutrient_deficiency_detection',
    name: 'Rilevamento Carenze Nutrizionali',
    description: 'Analizza sintomi visivi di carenze nutrizionali',
    triggers: [
      {
        type: 'photo_analysis',
        parameters: {
          leaf_color_change: true,
          growth_anomalies: true,
        },
      },
    ],
    conditions: [
      {
        type: 'plant_age',
        operator: 'greater_than',
        value: 14,
      },
    ],
    actions: [
      {
        type: 'photo_analysis',
        title: 'Analisi Carenze AI',
        description: 'AI analizza colore e forma foglie per identificare carenze',
        priority: 'medium',
        estimatedTime: '3 min',
      },
      {
        type: 'intervention',
        title: 'Concimazione Correttiva',
        description: 'Applicare concime specifico basato su diagnosi',
        priority: 'medium',
        estimatedTime: '15 min',
      },
    ],
    enabled: true,
    applicableContexts: ['generic', 'orchard', 'olive', 'vineyard'],
  },
  {
    id: 'harvest_timing_optimizer',
    name: 'Ottimizzatore Timing Raccolta',
    description: 'Suggerisce momento ottimale per raccolta',
    triggers: [
      {
        type: 'calendar',
        parameters: {
          month: [7, 8, 9, 10],
        },
      },
    ],
    conditions: [],
    actions: [
      {
        type: 'photo_analysis',
        title: 'Valutazione Maturita',
        description: 'AI analizza colore, dimensioni e maturita del raccolto',
        priority: 'low',
        estimatedTime: '2 min',
      },
      {
        type: 'monitoring',
        title: 'Controllo Giornaliero',
        description: 'Monitoraggio quotidiano per timing ottimale',
        priority: 'medium',
        estimatedTime: '5 min',
      },
    ],
    enabled: true,
    applicableContexts: ['generic', 'orchard', 'olive', 'vineyard'],
  },
  {
    id: 'vineyard_mildew_window',
    name: 'Finestra Peronospora Vite',
    description: 'Condizioni favorevoli a peronospora e oidio del vigneto',
    triggers: [
      {
        type: 'weather',
        parameters: {
          humidity: { min: 75 },
          temperature: { min: 14, max: 26 },
          rain_mm: { min: 2 },
          leaf_wetness: { min: 60 },
        },
      },
    ],
    conditions: [
      {
        type: 'season',
        operator: 'in_range',
        value: ['spring', 'summer'],
      },
    ],
    actions: [
      {
        type: 'monitoring',
        title: 'Controllo Foglie e Grappoli',
        description: 'Verifica macchie, patina e stato dei grappoli nelle parcelle piu umide',
        priority: 'high',
        estimatedTime: '20 min',
      },
      {
        type: 'photo_analysis',
        title: 'Analisi Foto del Filare',
        description: 'Documenta foglie e grappoli per confermare il rischio',
        priority: 'medium',
        estimatedTime: '8 min',
      },
    ],
    enabled: true,
    applicableContexts: ['vineyard'],
    samplePlants: [{ code: 'VIN-01', name: 'Vite da vino' }],
  },
  {
    id: 'olive_fly_pressure',
    name: 'Pressione Mosca Olearia',
    description: 'Monitoraggio della mosca dell olivo e danni ai frutti',
    triggers: [
      {
        type: 'calendar',
        parameters: {
          month: [6, 7, 8, 9, 10],
        },
      },
    ],
    conditions: [
      {
        type: 'season',
        operator: 'in_range',
        value: ['summer', 'fall'],
      },
    ],
    actions: [
      {
        type: 'monitoring',
        title: 'Controllo Trappole e Olive',
        description: 'Verifica punture, cascola e catture nelle zone piu umide',
        priority: 'high',
        estimatedTime: '15 min',
      },
      {
        type: 'agronomist_contact',
        title: 'Valutazione Strategia di Difesa',
        description: 'Confronta soglia di intervento e timing del trattamento',
        priority: 'medium',
        estimatedTime: '20 min',
        cost: 50,
      },
    ],
    enabled: true,
    applicableContexts: ['olive'],
    samplePlants: [{ code: 'OLV-01', name: 'Olivo da olio' }],
  },
  {
    id: 'orchard_fruit_sanitation',
    name: 'Sanita Frutti e Chioma',
    description: 'Controlla la sanita della chioma e la pressione sui frutti in allegagione o maturazione',
    triggers: [
      {
        type: 'calendar',
        parameters: {
          month: [4, 5, 6, 7, 8, 9],
        },
      },
    ],
    conditions: [
      {
        type: 'season',
        operator: 'in_range',
        value: ['spring', 'summer', 'fall'],
      },
    ],
    actions: [
      {
        type: 'monitoring',
        title: 'Controllo Chioma-Frutto',
        description: 'Verifica cascola, frutti colpiti e squilibri vegeto-produttivi',
        priority: 'medium',
        estimatedTime: '20 min',
      },
      {
        type: 'photo_analysis',
        title: 'Documenta Sintomi sui Frutti',
        description: 'Scatta foto ravvicinate di foglie e frutti per confermare il problema',
        priority: 'medium',
        estimatedTime: '10 min',
      },
    ],
    enabled: true,
    applicableContexts: ['orchard'],
    samplePlants: [{ code: 'ORC-01', name: 'Melo' }],
  },
]

type WeatherRiskProfile = {
  plantLabel: string
  description: string
  interventionTitle: string
  interventionDescription: string
  monitoringDescription: string
}

type GardenWeatherData = Awaited<ReturnType<typeof weatherService.getWeatherForGarden>>

type HealthEnvironmentalContext = {
  cropContext: HealthCropContext
  weatherData: GardenWeatherData | null
  microclimate: HealthMicroclimateSnapshot | null
  phenology: CurrentPhenologyState | null
  devices: SmartDevice[]
}

export interface PlantHealthAnalysisOptions {
  devices?: SmartDevice[]
  storageProvider?: Pick<IStorageProvider, 'getPhenologyObservations'> | null
}

export class PlantHealthMonitoringService {
  private rules: MonitoringRule[] = DEFAULT_MONITORING_RULES
  private activeAlerts: HealthAlert[] = []

  async analyzeGardenHealth(
    garden: Garden,
    tasks: GardenTask[],
    options: PlantHealthAnalysisOptions = {}
  ): Promise<HealthAlert[]> {
    const alerts: HealthAlert[] = []
    const context = inferHealthCropContext(garden)
    const devices = options.devices || []
    const [weatherData, microclimate, phenology] = await Promise.all([
      garden.coordinates ? weatherService.getWeatherForGarden(garden).catch(() => null) : Promise.resolve(null),
      getScopedHealthMicroclimateSnapshot(garden, { devices }).catch(() => null),
      getCurrentPhenologyState(options.storageProvider, garden).catch(() => null),
    ])
    const environmentalContext: HealthEnvironmentalContext = {
      cropContext: context,
      weatherData,
      microclimate,
      phenology,
      devices,
    }

    for (const rule of this.rules.filter(
      (candidate) => candidate.enabled && (!candidate.applicableContexts || candidate.applicableContexts.includes(context.id))
    )) {
      const ruleAlerts = await this.evaluateRule(rule, garden, tasks, environmentalContext)
      alerts.push(...ruleAlerts)
    }

    alerts.push(...this.analyzeTaskPatterns(tasks, context))
    alerts.push(...await this.analyzeWeatherConditions(garden, environmentalContext))

    this.activeAlerts = alerts
    return alerts
  }

  private async evaluateRule(
    rule: MonitoringRule,
    garden: Garden,
    tasks: GardenTask[],
    environmentalContext: HealthEnvironmentalContext
  ): Promise<HealthAlert[]> {
    if (
      !this.evaluateTriggers(rule.triggers, tasks, environmentalContext) ||
      !this.evaluateConditions(rule.conditions, tasks)
    ) {
      return []
    }

    const relevantPlants = this.getRelevantPlants(rule, garden, environmentalContext.cropContext)
    return relevantPlants.map((plant) => ({
      id: `${rule.id}_${plant.code}_${Date.now()}`,
      type: this.getAlertTypeFromRule(rule),
      severity: this.calculateSeverity(rule),
      plantCode: plant.code,
      plantName: plant.name,
      description: this.generateDescription(rule, plant.name, environmentalContext),
      detectedAt: new Date().toISOString(),
      suggestedActions: rule.actions,
      photoRequired: rule.actions.some((action) => action.type === 'photo_analysis'),
      agronomistConsultation: this.shouldConsultAgronomist(rule),
      urgencyDays: this.calculateUrgency(rule),
      confidence: this.calculateRuleConfidence(rule, environmentalContext),
      triggers: rule.triggers.map((trigger) => trigger.type),
    }))
  }

  private analyzeTaskPatterns(tasks: GardenTask[], context: HealthCropContext): HealthAlert[] {
    const alerts: HealthAlert[] = []

    const tasksByPlant = tasks.reduce((acc, task) => {
      const key = task.plantName || 'Pianta'
      if (!acc[key]) acc[key] = []
      acc[key].push(task)
      return acc
    }, {} as Record<string, GardenTask[]>)

    Object.entries(tasksByPlant).forEach(([plantName, plantTasks]) => {
      const treatmentTasks = plantTasks.filter((task) => task.taskType === 'Treatment')
      if (treatmentTasks.length >= 3) {
        alerts.push({
          id: `recurring_issue_${plantName}_${Date.now()}`,
          type: 'disease_risk',
          severity: 'medium',
          plantCode: plantName,
          plantName,
          description: `Rilevati ${treatmentTasks.length} trattamenti recenti su ${plantName}. Possibile problema ricorrente da approfondire.`,
          detectedAt: new Date().toISOString(),
          suggestedActions: [
            {
              type: 'agronomist_contact',
              title: 'Consulto Specialistico',
              description: 'Problema ricorrente che richiede una diagnosi professionale',
              priority: 'high',
              estimatedTime: '30 min',
              cost: 50,
            },
            {
              type: 'photo_analysis',
              title: 'Documentazione Completa',
              description: 'Raccogli foto di dettaglio per comparare i sintomi nel tempo',
              priority: 'medium',
              estimatedTime: '10 min',
            },
          ],
          photoRequired: true,
          agronomistConsultation: true,
          urgencyDays: 7,
          confidence: 0.7,
          triggers: ['task_pattern'],
        })
      }

      const monitoringTasks = plantTasks
        .filter((task) => task.taskType === 'Photo')
        .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())

      const daysSinceLastMonitoring = monitoringTasks.length > 0
        ? Math.floor((Date.now() - new Date(monitoringTasks[0].date).getTime()) / (1000 * 60 * 60 * 24))
        : 999

      if (daysSinceLastMonitoring > context.monitoringIntervalDays) {
        alerts.push({
          id: `monitoring_needed_${plantName}_${Date.now()}`,
          type: 'stress_symptoms',
          severity: 'low',
          plantCode: plantName,
          plantName,
          description: `Nessun controllo registrato da ${daysSinceLastMonitoring} giorni su questa ${context.entitySingular}. E consigliato un nuovo monitoraggio.`,
          detectedAt: new Date().toISOString(),
          suggestedActions: [
            {
              type: 'monitoring',
              title: this.getContextualMonitoringTitle(context),
              description: this.getContextualMonitoringDescription(context),
              priority: 'low',
              estimatedTime: '5 min',
              taskTemplate: {
                taskType: 'Photo',
                notes: `Controllo generale ${context.areaLabel} - stato vegetativo, sintomi e presenza parassiti`,
              },
            },
            {
              type: 'photo_analysis',
              title: 'Documentazione Stato',
              description: `Foto per documentare lo stato della ${context.entitySingular}`,
              priority: 'low',
              estimatedTime: '3 min',
            },
          ],
          photoRequired: false,
          agronomistConsultation: false,
          urgencyDays: 7,
          confidence: 0.6,
          triggers: ['monitoring_gap'],
        })
      }
    })

    return alerts
  }

  private async analyzeWeatherConditions(
    garden: Garden,
    environmentalContext: HealthEnvironmentalContext
  ): Promise<HealthAlert[]> {
    const alerts: HealthAlert[] = []
    const { cropContext: context, microclimate } = environmentalContext
    const weatherData =
      environmentalContext.weatherData ??
      (garden.coordinates ? await weatherService.getWeatherForGarden(garden).catch(() => null) : null)
    const nextDays = Array.isArray(weatherData?.forecast) ? weatherData.forecast.slice(0, 3) : []
    const maxForecastRain = nextDays.reduce((max, day) => Math.max(max, day.rainMm || 0), 0)
    const maxForecastHumidity = nextDays.reduce((max, day) => Math.max(max, day.humidity || 0), weatherData?.humidity || 0)
    const avgForecastTemp =
      nextDays.length > 0
        ? nextDays.reduce((sum, day) => sum + ((day.tempMin + day.tempMax) / 2), 0) / nextDays.length
        : weatherData?.temp
    const effectiveHumidity = microclimate?.metrics.airHumidity ?? maxForecastHumidity
    const effectiveTemperature = microclimate?.metrics.airTemperature ?? avgForecastTemp
    const effectiveRain = Math.max(microclimate?.metrics.rainGaugeLocalMm || 0, weatherData?.rainMm || 0, maxForecastRain)
    const fungalPressure = microclimate?.fungalPressure || 'none'
    const heatStress = microclimate?.heatStress || 'none'
    const waterStress = microclimate?.waterStress || 'none'
    const microclimateSignals = microclimate?.supportingSignals.length
      ? ` Sensori: ${microclimate.supportingSignals.join(', ')}.`
      : ''

    if (!weatherData && !microclimate?.hasRecentData) {
      return alerts
    }

    try {
      const { NDVISatelliteService } = await import('../services/ndviSatelliteService')
      const ndviData = await NDVISatelliteService.getLatestNDVI(garden)

      if (ndviData && ndviData.ndvi_value < 0.4) {
        alerts.push({
          id: `ndvi_stress_${Date.now()}`,
          type: 'stress_symptoms',
          severity: ndviData.ndvi_value < 0.2 ? 'critical' : 'high',
          plantName: 'Vegetazione (Satellite)',
          description: `NDVI satellitare basso (${ndviData.ndvi_value.toFixed(3)}). Stress vegetativo rilevato da Sentinel-2.`,
          detectedAt: new Date().toISOString(),
          suggestedActions: [
            {
              type: 'photo_analysis',
              title: 'Verifica Visiva',
              description: 'Confronta il quadro satellitare con rilievi in campo',
              priority: 'high',
              estimatedTime: '10 min',
            },
            {
              type: 'intervention',
              title: 'Intervento Mirato',
              description: 'Irrigazione o fertilizzazione nelle zone critiche',
              priority: 'high',
              estimatedTime: '30 min',
            },
          ],
          photoRequired: true,
          agronomistConsultation: ndviData.ndvi_value < 0.2,
          urgencyDays: ndviData.ndvi_value < 0.2 ? 1 : 3,
          confidence: 0.9,
          triggers: ['satellite_ndvi'],
        })
      }
    } catch {
      // NDVI opzionale: nessuna azione se il servizio non e disponibile.
    }

    if (
      effectiveTemperature !== undefined &&
      fungalPressure === 'high' ||
      (effectiveTemperature !== undefined &&
        effectiveHumidity > 80 &&
        effectiveTemperature > 15 &&
        effectiveTemperature < 28 &&
        effectiveRain > 1)
    ) {
      const fungalProfile = this.getFungalWeatherProfile(context)
      alerts.push({
        id: `fungal_risk_weather_${Date.now()}`,
        type: 'disease_risk',
        severity:
          fungalPressure === 'high' && context.id === 'vineyard'
            ? 'critical'
            : fungalPressure === 'high' || context.id === 'vineyard'
              ? 'high'
              : 'medium',
        plantName: fungalProfile.plantLabel,
        description: `${fungalProfile.description}: umidita ${effectiveHumidity}%, temperatura ${effectiveTemperature.toFixed(1)}°C, pioggia fino a ${effectiveRain.toFixed(1)}mm tra oggi e i prossimi giorni.${microclimateSignals}`,
        detectedAt: new Date().toISOString(),
        suggestedActions: [
          {
            type: 'intervention',
            title: fungalProfile.interventionTitle,
            description: fungalProfile.interventionDescription,
            priority: context.id === 'vineyard' ? 'high' : 'medium',
            estimatedTime: '30 min',
          },
          {
            type: 'monitoring',
            title: 'Controllo Post-Pioggia',
            description: fungalProfile.monitoringDescription,
            priority: 'medium',
            estimatedTime: '15 min',
          },
        ],
        photoRequired: false,
        agronomistConsultation: fungalPressure === 'high' && context.id !== 'generic',
        urgencyDays: fungalPressure === 'high' ? 1 : 2,
        confidence: microclimate?.hasRecentData ? 0.9 : 0.75,
        triggers: microclimate?.hasRecentData
          ? ['weather', 'leaf_wetness', 'dew_point', 'rain_gauge_local']
          : ['weather'],
      })
    }

    const hotDays = nextDays.filter((day) => day.tempMax > 30).length
    if (hotDays >= 2 || heatStress === 'high' || waterStress === 'high') {
      const heatProfile = this.getHeatStressProfile(context)
      alerts.push({
        id: `heat_stress_${Date.now()}`,
        type: 'stress_symptoms',
        severity: heatStress === 'high' || waterStress === 'high' ? 'high' : 'medium',
        plantName: heatProfile.plantLabel,
        description:
          hotDays >= 2
            ? `Previste ${hotDays} giornate con temperature >30°C. ${heatProfile.description}${microclimateSignals}`
            : `I sensori indicano stress idrico o termico nel ${context.areaLabel}. ${heatProfile.description}${microclimateSignals}`,
        detectedAt: new Date().toISOString(),
        suggestedActions: [
          {
            type: 'intervention',
            title: heatProfile.interventionTitle,
            description: heatProfile.interventionDescription,
            priority: 'high',
            estimatedTime: '20 min',
          },
          {
            type: 'monitoring',
            title: 'Controllo Stress',
            description: heatProfile.monitoringDescription,
            priority: 'medium',
            estimatedTime: '10 min',
          },
        ],
        photoRequired: true,
        agronomistConsultation: false,
        urgencyDays: 1,
        confidence: microclimate?.hasRecentData ? 0.88 : 0.8,
        triggers: microclimate?.hasRecentData
          ? ['weather', 'vpd', 'canopy_temperature', 'soil_tension_kpa']
          : ['weather'],
      })
    }

    return alerts
  }

  private evaluateTriggers(
    triggers: MonitoringTrigger[],
    tasks: GardenTask[],
    environmentalContext: HealthEnvironmentalContext
  ): boolean {
    const currentMonth = new Date().getMonth() + 1
    const weatherMetrics = this.buildWeatherTriggerMetrics(environmentalContext)

    return triggers.every((trigger) => {
      if (trigger.type === 'calendar' && Array.isArray(trigger.parameters.month)) {
        return trigger.parameters.month.includes(currentMonth)
      }

      if (trigger.type === 'weather') {
        if (!weatherMetrics) return false

        const humidity = trigger.parameters.humidity as { min?: number; max?: number } | undefined
        const temperature = trigger.parameters.temperature as { min?: number; max?: number } | undefined
        const rainMm = trigger.parameters.rain_mm as { min?: number; max?: number } | undefined
        const leafWetness = trigger.parameters.leaf_wetness as { min?: number; max?: number } | undefined
        const vpd = trigger.parameters.vpd as { min?: number; max?: number } | undefined

        return [
          this.matchesRange(weatherMetrics.humidity, humidity),
          this.matchesRange(weatherMetrics.temperature, temperature),
          this.matchesRange(weatherMetrics.rainMm, rainMm),
          this.matchesRange(weatherMetrics.leafWetness, leafWetness),
          this.matchesRange(weatherMetrics.vpd, vpd),
        ].every(Boolean)
      }

      if (trigger.type === 'photo_analysis') {
        return tasks.some((task) => task.taskType === 'Photo')
      }

      return true
    })
  }

  private evaluateConditions(conditions: MonitoringCondition[], tasks: GardenTask[]): boolean {
    const currentSeason = this.getCurrentSeasonKey()
    const plantAges = tasks
      .map((task) => task.date)
      .filter(Boolean)
      .map((date) => Math.floor((Date.now() - new Date(date as string).getTime()) / (1000 * 60 * 60 * 24)))

    return conditions.every((condition) => {
      if (condition.type === 'season' && condition.operator === 'in_range' && Array.isArray(condition.value)) {
        return condition.value.includes(currentSeason)
      }

      if (condition.type === 'plant_age' && condition.operator === 'greater_than') {
        if (plantAges.length === 0) return true
        return plantAges.some((age) => age > Number(condition.value))
      }

      return true
    })
  }

  private getRelevantPlants(
    rule: MonitoringRule,
    garden: Garden,
    context: HealthCropContext
  ): Array<{ code: string; name: string }> {
    if (rule.samplePlants && rule.samplePlants.length > 0) {
      return rule.samplePlants
    }

    if (context.id === 'vineyard') {
      return [{ code: 'VIN-01', name: garden.vineyardConfig?.varieties?.[0] || 'Vite' }]
    }

    if (context.id === 'olive') {
      return [{ code: 'OLV-01', name: garden.oliveGroveConfig?.varieties?.[0] || 'Olivo' }]
    }

    if (context.id === 'orchard') {
      return [{ code: 'ORC-01', name: garden.orchardConfig?.varieties?.[0] || 'Albero da frutto' }]
    }

    return [
      { code: 'ROW-01', name: 'Pomodoro San Marzano' },
      { code: 'ROW-02', name: 'Basilico Genovese' },
    ]
  }

  private getAlertTypeFromRule(rule: MonitoringRule): HealthAlert['type'] {
    if (rule.id.includes('blight') || rule.id.includes('mildew')) return 'disease_risk'
    if (rule.id.includes('aphid') || rule.id.includes('fly')) return 'pest_alert'
    if (rule.id.includes('nutrient')) return 'nutrient_deficiency'
    if (rule.id.includes('harvest')) return 'harvest_timing'
    return 'stress_symptoms'
  }

  private calculateSeverity(rule: MonitoringRule): HealthAlert['severity'] {
    if (rule.id.includes('blight') || rule.id.includes('mildew') || rule.id.includes('fly')) return 'high'
    if (rule.id.includes('harvest')) return 'low'
    return 'medium'
  }

  private generateDescription(
    rule: MonitoringRule,
    plantName: string,
    environmentalContext: HealthEnvironmentalContext
  ): string {
    const context = environmentalContext.cropContext
    const microclimateSignals = environmentalContext.microclimate?.supportingSignals.slice(0, 3)
    const sensorSuffix =
      microclimateSignals && microclimateSignals.length > 0
        ? ` Segnali sensore: ${microclimateSignals.join(', ')}.`
        : ''
    const phenologySuffix = environmentalContext.phenology
      ? ` Fase fenologica confermata: ${environmentalContext.phenology.stageLabel} (${environmentalContext.phenology.scopeLabel}).`
      : ''

    if (context.id === 'vineyard') {
      return `${rule.description} rilevate su ${plantName}. Concentrati sui filari piu umidi o chiusi.${phenologySuffix}${sensorSuffix}`
    }

    if (context.id === 'olive') {
      return `${rule.description} rilevato su ${plantName}. Verifica chioma, olive e uniformita dell impianto.${phenologySuffix}${sensorSuffix}`
    }

    if (context.id === 'orchard') {
      return `${rule.description} rilevata su ${plantName}. Controlla insieme foglie, chioma e frutti.${phenologySuffix}${sensorSuffix}`
    }

    return `${rule.description} rilevata per ${plantName}.${phenologySuffix}${sensorSuffix}`
  }

  private shouldConsultAgronomist(rule: MonitoringRule): boolean {
    return rule.actions.some((action) => action.type === 'agronomist_contact') || rule.id.includes('mildew')
  }

  private calculateUrgency(rule: MonitoringRule): number {
    if (rule.id.includes('blight') || rule.id.includes('mildew')) return 2
    if (rule.id.includes('fly')) return 3
    if (rule.id.includes('harvest')) return 3
    return 7
  }

  private calculateRuleConfidence(
    rule: MonitoringRule,
    environmentalContext: HealthEnvironmentalContext
  ): number {
    const baseConfidence = 0.8
    const hasWeatherTrigger = rule.triggers.some((trigger) => trigger.type === 'weather')

    if (!hasWeatherTrigger) {
      return baseConfidence
    }

    if (environmentalContext.microclimate?.hasRecentData) {
      return environmentalContext.phenology ? 0.95 : 0.92
    }

    if (environmentalContext.weatherData) {
      return environmentalContext.phenology ? 0.88 : 0.84
    }

    return environmentalContext.phenology ? 0.76 : 0.68
  }

  private buildWeatherTriggerMetrics(environmentalContext: HealthEnvironmentalContext): {
    humidity?: number
    temperature?: number
    rainMm?: number
    leafWetness?: number
    vpd?: number
  } | null {
    const weatherData = environmentalContext.weatherData
    const microclimate = environmentalContext.microclimate

    if (!weatherData && !microclimate?.hasRecentData) {
      return null
    }

    const nextDays = Array.isArray(weatherData?.forecast) ? weatherData?.forecast.slice(0, 3) : []
    const avgForecastTemp =
      nextDays.length > 0
        ? nextDays.reduce((sum, day) => sum + ((day.tempMin + day.tempMax) / 2), 0) / nextDays.length
        : weatherData?.temp
    const maxForecastHumidity = nextDays.reduce(
      (max, day) => Math.max(max, day.humidity || 0),
      weatherData?.humidity || 0
    )
    const maxRain = nextDays.reduce((max, day) => Math.max(max, day.rainMm || 0), weatherData?.rainMm || 0)

    return {
      humidity: microclimate?.metrics.airHumidity ?? maxForecastHumidity,
      temperature: microclimate?.metrics.airTemperature ?? avgForecastTemp,
      rainMm: Math.max(microclimate?.metrics.rainGaugeLocalMm || 0, maxRain || 0),
      leafWetness: microclimate?.metrics.leafWetness,
      vpd: microclimate?.metrics.vpd,
    }
  }

  private matchesRange(
    value: number | undefined,
    range?: { min?: number; max?: number }
  ): boolean {
    if (!range) {
      return true
    }

    if (value === undefined || value === null) {
      return false
    }

    if (range.min !== undefined && value < range.min) {
      return false
    }

    if (range.max !== undefined && value > range.max) {
      return false
    }

    return true
  }

  private getCurrentSeasonKey(): 'winter' | 'spring' | 'summer' | 'fall' {
    const month = new Date().getMonth() + 1
    if (month >= 3 && month <= 5) return 'spring'
    if (month >= 6 && month <= 8) return 'summer'
    if (month >= 9 && month <= 11) return 'fall'
    return 'winter'
  }

  private getContextualMonitoringTitle(context: HealthCropContext): string {
    switch (context.id) {
      case 'vineyard':
        return 'Ispezione Foglie e Grappoli'
      case 'olive':
        return 'Ispezione Chioma e Olive'
      case 'orchard':
        return 'Ispezione Chioma e Frutti'
      default:
        return 'Ispezione Generale'
    }
  }

  private getContextualMonitoringDescription(context: HealthCropContext): string {
    switch (context.id) {
      case 'vineyard':
        return 'Controllo stato fogliare, grappoli e umidita del filare'
      case 'olive':
        return 'Controllo chioma, presenza di punture e uniformita della fruttificazione'
      case 'orchard':
        return 'Controllo frutti, foglie e rami per individuare sintomi precoci'
      default:
        return 'Controllo stato generale della pianta'
    }
  }

  private getFungalWeatherProfile(context: HealthCropContext): WeatherRiskProfile {
    switch (context.id) {
      case 'vineyard':
        return {
          plantLabel: 'Viti e grappoli sensibili',
          description: 'Condizioni favorevoli a peronospora e oidio del vigneto',
          interventionTitle: 'Copertura Preventiva del Vigneto',
          interventionDescription: 'Valuta un trattamento preventivo e la gestione della parete fogliare prima delle piogge',
          monitoringDescription: 'Ispezione 24-48h dopo la pioggia su foglie basali, femminelle e grappoli',
        }
      case 'olive':
        return {
          plantLabel: 'Olivi sensibili',
          description: 'Condizioni favorevoli a occhio di pavone e ristagni nella chioma',
          interventionTitle: 'Intervento Preventivo in Chioma',
          interventionDescription: 'Riduci umidita persistente e valuta coperture preventive nelle zone piu chiuse',
          monitoringDescription: 'Controlla foglie interne e zone basse 24-48h dopo le precipitazioni',
        }
      case 'orchard':
        return {
          plantLabel: 'Alberi da frutto sensibili',
          description: 'Condizioni favorevoli a ticchiolatura e marciumi superficiali',
          interventionTitle: 'Protezione Preventiva del Frutteto',
          interventionDescription: 'Programma un controllo fitosanitario prima della pioggia sulle varieta piu sensibili',
          monitoringDescription: 'Verifica foglie giovani e frutti 24-48h dopo le precipitazioni',
        }
      default:
        return {
          plantLabel: 'Tutte le piante sensibili',
          description: 'Condizioni meteo favorevoli a malattie fungine',
          interventionTitle: 'Trattamento Preventivo',
          interventionDescription: 'Applicare un fungicida preventivo prima delle piogge',
          monitoringDescription: 'Ispezione 24-48h dopo le precipitazioni',
        }
    }
  }

  private getHeatStressProfile(context: HealthCropContext): WeatherRiskProfile {
    switch (context.id) {
      case 'vineyard':
        return {
          plantLabel: 'Viti e grappoli esposti',
          description: 'Rischio stress idrico e blocco maturativo dei grappoli.',
          interventionTitle: 'Irrigazione di Supporto',
          interventionDescription: 'Riequilibra l acqua disponibile e limita sfogliature aggressive nelle ore calde',
          monitoringDescription: 'Controlla turgore fogliare, scottature e disidratazione dei grappoli',
        }
      case 'olive':
        return {
          plantLabel: 'Olivi e drupe sensibili',
          description: 'Rischio stress idrico, cascola e rallentamento dell accrescimento delle olive.',
          interventionTitle: 'Gestione Idrica Oliveto',
          interventionDescription: 'Programma irrigazione di soccorso o verifica disponibilita idrica del terreno',
          monitoringDescription: 'Controlla cascola, accartocciamento fogliare e differenze tra piante',
        }
      case 'orchard':
        return {
          plantLabel: 'Alberi e frutti esposti',
          description: 'Rischio stress idrico, scottature e calibro irregolare dei frutti.',
          interventionTitle: 'Supporto Idrico del Frutteto',
          interventionDescription: 'Mantieni regolare l acqua disponibile e valuta protezione dei frutti piu esposti',
          monitoringDescription: 'Controlla turgore fogliare, cascola e scottature dei frutti',
        }
      default:
        return {
          plantLabel: 'Piante sensibili al caldo',
          description: 'Rischio stress idrico.',
          interventionTitle: 'Irrigazione Preventiva',
          interventionDescription: 'Aumenta la frequenza di irrigazione',
          monitoringDescription: 'Monitora segni di appassimento',
        }
    }
  }

  async getActiveAlerts(): Promise<HealthAlert[]> {
    return this.activeAlerts
  }

  async dismissAlert(alertId: string): Promise<void> {
    this.activeAlerts = this.activeAlerts.filter((alert) => alert.id !== alertId)
  }

  async createTaskFromAction(alert: HealthAlert, action: HealthAction, garden: Garden): Promise<Partial<GardenTask>> {
    const baseTask: Partial<GardenTask> = {
      gardenId: garden.id,
      plantName: alert.plantName,
      taskType: action.type === 'intervention' ? 'Treatment' : 'Photo',
      date: new Date().toISOString().split('T')[0],
      notes: `${action.title}: ${action.description}`,
      completed: false,
    }

    if (action.taskTemplate) {
      Object.assign(baseTask, action.taskTemplate)
    }

    return baseTask
  }
}

export const plantHealthMonitoringService = new PlantHealthMonitoringService()

export default plantHealthMonitoringService
