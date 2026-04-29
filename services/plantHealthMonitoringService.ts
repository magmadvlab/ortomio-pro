/**
 * Plant Health Monitoring Service
 * Sistema intelligente per monitoraggio salute piante e suggerimenti automatici
 */

import { Garden, GardenTask, SmartDevice } from '@/types'
import type { IStorageProvider } from '@/packages/core/storage/interface'
import { getSupabaseClient } from '@/config/supabase'
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
import {
  getAgronomicCropProfileById,
  resolveAgronomicCropProfile,
} from '@/services/agronomicKernelService'
import {
  getAgronomicMeasuredFeedbackRecords,
  type AgronomicMeasuredFeedbackRecord,
} from '@/services/agronomicMeasuredFeedbackService'
import {
  buildAgronomicHealthLearningAdjustment,
  getAgronomicProfileLearningSnapshots,
  type AgronomicHealthLearningAdjustment,
} from '@/services/agronomicProfileLearningService'
import {
  getPersistedGardenEnvironmentalHistorySummary,
  type GardenEnvironmentalHistorySummary,
} from '@/services/environmentalMonitoringService'
import { scoreAgronomicPriority } from '@/services/agronomicPriorityService'
import { buildAgronomicRefinedContext } from '@/services/agronomicRefinedContextService'
import type {
  AgronomicHealthPriority,
  AgronomicRefinedContext,
  AgronomicSignalKey,
  ResolvedAgronomicCropProfile,
} from '@/types/agronomicKernel'

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
  cropAliases?: string[]
  agronomicProfileIds?: string[]
  requiredHealthPriorities?: AgronomicHealthPriority[]
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
    cropAliases: ['pomodoro'],
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
    requiredHealthPriorities: ['sap_sucking_pests'],
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
    requiredHealthPriorities: ['nutrient_imbalance'],
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
    agronomicProfileIds: ['vineyard_quality'],
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
    agronomicProfileIds: ['olive_grove_oil'],
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
    agronomicProfileIds: ['orchard_generic'],
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
  environmentalHistorySummary?: GardenEnvironmentalHistorySummary | null
  phenology: CurrentPhenologyState | null
  devices: SmartDevice[]
  agronomicProfile: ResolvedAgronomicCropProfile | null
  dominantPlantNames: string[]
  measuredFeedbackPressure: number
  measuredFeedbackNotes: string[]
  adaptiveLearning: AgronomicHealthLearningAdjustment
  refinedContext?: AgronomicRefinedContext | null
}

export interface PlantHealthAnalysisOptions {
  devices?: SmartDevice[]
  storageProvider?: Pick<IStorageProvider, 'getPhenologyObservations' | 'getUserPreference'> | null
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
    const dominantPlantNames = this.getDominantPlantNames(garden, tasks)
    const agronomicProfile = await this.resolveAgronomicHealthProfile(garden, dominantPlantNames)
    const gardenOwnerId = await this.resolveGardenOwnerId(garden)
    const today = new Date().toISOString().split('T')[0]
    const recentStartDate = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const [weatherData, microclimate, environmentalHistorySummary, phenology, measuredFeedbackRecords, learningSnapshots] = await Promise.all([
      garden.coordinates ? weatherService.getWeatherForGarden(garden).catch(() => null) : Promise.resolve(null),
      getScopedHealthMicroclimateSnapshot(garden, { devices }).catch(() => null),
      gardenOwnerId
        ? getPersistedGardenEnvironmentalHistorySummary({
            userId: gardenOwnerId,
            gardenId: garden.id,
            startDate: recentStartDate,
            endDate: today,
          }).catch(() => null)
        : Promise.resolve(null),
      getCurrentPhenologyState(options.storageProvider, garden, {}, {
        cropName: dominantPlantNames[0],
        profileId: agronomicProfile?.profile.id,
      }).catch(() => null),
      options.storageProvider?.getUserPreference
        ? getAgronomicMeasuredFeedbackRecords(options.storageProvider, garden.id).catch(() => [])
        : Promise.resolve([] as AgronomicMeasuredFeedbackRecord[]),
      options.storageProvider?.getUserPreference
        ? getAgronomicProfileLearningSnapshots(options.storageProvider, garden.id).catch(() => [])
        : Promise.resolve([]),
    ])
    const measuredFeedbackContext = this.buildMeasuredFeedbackHealthContext(
      measuredFeedbackRecords,
      dominantPlantNames
    )
    const adaptiveLearning = buildAgronomicHealthLearningAdjustment(learningSnapshots, {
      plantName: dominantPlantNames[0],
      profileId: agronomicProfile?.profile.id,
    })
    const environmentalContext: HealthEnvironmentalContext = {
      cropContext: context,
      weatherData,
      microclimate,
      environmentalHistorySummary,
      phenology,
      devices,
      agronomicProfile,
      dominantPlantNames,
      measuredFeedbackPressure: measuredFeedbackContext.pressure,
      measuredFeedbackNotes: measuredFeedbackContext.notes,
      adaptiveLearning,
      refinedContext: buildAgronomicRefinedContext({
        cropProfile: agronomicProfile?.profile,
        textValues: [garden.name, ...dominantPlantNames],
        speciesLabel: dominantPlantNames[0],
        gardenType: garden.gardenType,
        altitudeMeters: garden.altitudeMeters,
        dailySunHours: garden.dailySunHours,
        sunExposure: garden.sunExposure,
        aspectDirection: garden.aspectDirection,
        windProtection: garden.windProtection,
        soilType: garden.soilType,
        soilPh: garden.soilPh,
        shadowObstaclesCount: Array.isArray(garden.obstacles) ? garden.obstacles.length : undefined,
      }).refinedContext,
    }

    for (const rule of this.rules.filter(
      (candidate) =>
        candidate.enabled &&
        (!candidate.applicableContexts || candidate.applicableContexts.includes(context.id)) &&
        this.isRuleAgronomicallyRelevant(candidate, environmentalContext)
    )) {
      const ruleAlerts = await this.evaluateRule(rule, garden, tasks, environmentalContext)
      alerts.push(...ruleAlerts)
    }

    alerts.push(...this.analyzeTaskPatterns(tasks, context))
    alerts.push(...await this.analyzeWeatherConditions(garden, environmentalContext))

    const rankedAlerts = [...alerts].sort(
      (left, right) =>
        this.scoreHealthAlert(right, environmentalContext) -
        this.scoreHealthAlert(left, environmentalContext)
    )

    this.activeAlerts = rankedAlerts
    return rankedAlerts
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

    const relevantPlants = this.getRelevantPlants(rule, garden, environmentalContext.cropContext, environmentalContext)
    return relevantPlants.map((plant) =>
      this.applyAdaptiveLearningToAlert(
        {
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
          urgencyDays: this.calculateUrgency(rule, environmentalContext),
          confidence: this.calculateRuleConfidence(rule, environmentalContext),
          triggers: rule.triggers.map((trigger) => trigger.type),
        },
        environmentalContext
      )
    )
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
    const adaptiveLearning = environmentalContext.adaptiveLearning
    const environmentalHistory = environmentalContext.environmentalHistorySummary
    const microclimateSignals = microclimate?.supportingSignals.length
      ? ` Sensori: ${microclimate.supportingSignals.join(', ')}.`
      : ''
    const persistentDiseasePressure =
      (environmentalHistory?.highDiseasePressureDays || 0) >= 2 ||
      (environmentalHistory?.lowDryingPowerDays || 0) >= 2
    const persistentWaterStress =
      (environmentalHistory?.highSoilWaterStressDays || 0) >= 2 ||
      (environmentalHistory?.deficitWaterBalanceDays || 0) >= 3
    const historySuffix = this.buildEnvironmentalHistorySuffix(environmentalHistory)

    if (!weatherData && !microclimate?.hasRecentData) {
      if (persistentDiseasePressure) {
        alerts.push(
          this.applyAdaptiveLearningToAlert(
            {
              id: `environmental_fungal_history_${Date.now()}`,
              type: 'disease_risk',
              severity: 'medium',
              plantName: this.getFungalWeatherProfile(context).plantLabel,
              description: `Lo storico ambientale recente mantiene alta la pressione fungina nel ${context.areaLabel}.${historySuffix}`,
              detectedAt: new Date().toISOString(),
              suggestedActions: [
                {
                  type: 'monitoring',
                  title: 'Controllo Umidita Persistente',
                  description: 'Verifica foglie, chioma e zone meno ventilate dopo la sequenza di giornate umide',
                  priority: 'high',
                  estimatedTime: '15 min',
                },
              ],
              photoRequired: true,
              agronomistConsultation: context.id !== 'generic',
              urgencyDays: 2,
              confidence: 0.7,
              triggers: ['environmental_history'],
            },
            environmentalContext
          )
        )
      }

      if (persistentWaterStress) {
        alerts.push(
          this.applyAdaptiveLearningToAlert(
            {
              id: `environmental_water_history_${Date.now()}`,
              type: 'weather_stress',
              severity: 'medium',
              plantName: this.getHeatStressProfile(context).plantLabel,
              description: `Il ledger ambientale mostra stress idrico persistente nel ${context.areaLabel}.${historySuffix}`,
              detectedAt: new Date().toISOString(),
              suggestedActions: [
                {
                  type: 'monitoring',
                  title: 'Verifica Bilancio Idrico',
                  description: 'Controlla umidita del suolo, omogeneita tra zone e necessita di irrigazione di supporto',
                  priority: 'high',
                  estimatedTime: '15 min',
                },
              ],
              photoRequired: false,
              agronomistConsultation: false,
              urgencyDays: 2,
              confidence: 0.68,
              triggers: ['environmental_history'],
            },
            environmentalContext
          )
        )
      }

      return alerts
    }

    try {
      const { NDVISatelliteService } = await import('../services/ndviSatelliteService')
      const ndviData = await NDVISatelliteService.getLatestNDVI(garden)

      if (ndviData && ndviData.ndvi_value < 0.4) {
        alerts.push(
          this.applyAdaptiveLearningToAlert(
            {
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
            },
            environmentalContext
          )
        )
      }
    } catch {
      // NDVI opzionale: nessuna azione se il servizio non e disponibile.
    }

    if (
      (effectiveTemperature !== undefined && fungalPressure === 'high') ||
      (effectiveTemperature !== undefined &&
        effectiveHumidity > adaptiveLearning.fungalHumidityThreshold &&
        effectiveTemperature > 15 &&
        effectiveTemperature < 28 &&
        effectiveRain > adaptiveLearning.fungalRainThreshold)
    ) {
      const fungalProfile = this.getFungalWeatherProfile(context)
      alerts.push(
        this.applyAdaptiveLearningToAlert(
          {
            id: `fungal_risk_weather_${Date.now()}`,
            type: 'disease_risk',
            severity:
              (fungalPressure === 'high' || persistentDiseasePressure) && context.id === 'vineyard'
                ? 'critical'
                : fungalPressure === 'high' || persistentDiseasePressure || context.id === 'vineyard'
                  ? 'high'
                  : 'medium',
            plantName: fungalProfile.plantLabel,
            description: `${fungalProfile.description}: umidita ${effectiveHumidity}%, temperatura ${effectiveTemperature.toFixed(1)}°C, pioggia fino a ${effectiveRain.toFixed(1)}mm tra oggi e i prossimi giorni.${microclimateSignals}${historySuffix}`,
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
            agronomistConsultation: (fungalPressure === 'high' || persistentDiseasePressure) && context.id !== 'generic',
            urgencyDays: fungalPressure === 'high' ? 1 : 2,
            confidence: Math.min(0.96, (microclimate?.hasRecentData ? 0.9 : 0.75) + (persistentDiseasePressure ? 0.05 : 0)),
            triggers: microclimate?.hasRecentData
              ? ['weather', 'leaf_wetness', 'dew_point', 'rain_gauge_local', ...(persistentDiseasePressure ? ['environmental_history'] : [])]
              : ['weather', ...(persistentDiseasePressure ? ['environmental_history'] : [])],
          },
          environmentalContext
        )
      )
    }

    const hotDays = nextDays.filter(
      (day) => day.tempMax > adaptiveLearning.heatStressTemperatureThreshold
    ).length
    if (
      hotDays >= adaptiveLearning.hotDaysTriggerCount ||
      heatStress === 'high' ||
      waterStress === 'high' ||
      persistentWaterStress
    ) {
      const heatProfile = this.getHeatStressProfile(context)
      alerts.push(
        this.applyAdaptiveLearningToAlert(
          {
            id: `heat_stress_${Date.now()}`,
            type: 'stress_symptoms',
            severity: heatStress === 'high' || waterStress === 'high' || persistentWaterStress ? 'high' : 'medium',
            plantName: heatProfile.plantLabel,
            description:
              hotDays >= adaptiveLearning.hotDaysTriggerCount
                ? `Previste ${hotDays} giornate con temperature >${adaptiveLearning.heatStressTemperatureThreshold}°C. ${heatProfile.description}${microclimateSignals}${historySuffix}`
                : persistentWaterStress
                  ? `Lo storico ambientale conferma stress idrico ricorrente nel ${context.areaLabel}. ${heatProfile.description}${microclimateSignals}${historySuffix}`
                  : `I sensori indicano stress idrico o termico nel ${context.areaLabel}. ${heatProfile.description}${microclimateSignals}${historySuffix}`,
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
            confidence: Math.min(0.96, (microclimate?.hasRecentData ? 0.88 : 0.8) + (persistentWaterStress ? 0.05 : 0)),
            triggers: microclimate?.hasRecentData
              ? ['weather', 'vpd', 'canopy_temperature', 'soil_tension_kpa', ...(persistentWaterStress ? ['environmental_history'] : [])]
              : ['weather', ...(persistentWaterStress ? ['environmental_history'] : [])],
          },
          environmentalContext
        )
      )
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

        const humidity = this.adjustWeatherTriggerRange(
          trigger.parameters.humidity as { min?: number; max?: number } | undefined,
          'humidity',
          environmentalContext
        )
        const temperature = this.adjustWeatherTriggerRange(
          trigger.parameters.temperature as { min?: number; max?: number } | undefined,
          'temperature',
          environmentalContext
        )
        const rainMm = this.adjustWeatherTriggerRange(
          trigger.parameters.rain_mm as { min?: number; max?: number } | undefined,
          'rain',
          environmentalContext
        )
        const leafWetness = this.adjustWeatherTriggerRange(
          trigger.parameters.leaf_wetness as { min?: number; max?: number } | undefined,
          'leafWetness',
          environmentalContext
        )
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
    context: HealthCropContext,
    environmentalContext?: HealthEnvironmentalContext
  ): Array<{ code: string; name: string }> {
    const dominantPlantNames = environmentalContext?.dominantPlantNames || []

    if (dominantPlantNames.length > 0) {
      const filteredPlantNames = rule.cropAliases && rule.cropAliases.length > 0
        ? dominantPlantNames.filter((plantName) => this.matchesCropAlias(rule.cropAliases!, plantName))
        : dominantPlantNames

      if (filteredPlantNames.length > 0) {
        return filteredPlantNames.slice(0, 2).map((plantName, index) => ({
          code: `CROP-${index + 1}`,
          name: plantName,
        }))
      }
    }

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
    const measuredFeedbackNotes = environmentalContext.measuredFeedbackNotes || []
    const adaptiveLearningNotes = environmentalContext.adaptiveLearning?.notes || []
    const sensorSuffix =
      microclimateSignals && microclimateSignals.length > 0
        ? ` Segnali sensore: ${microclimateSignals.join(', ')}.`
        : ''
    const phenologySuffix = environmentalContext.phenology
      ? environmentalContext.phenology.source === 'observation'
        ? ` Fase fenologica confermata: ${environmentalContext.phenology.stageLabel} (${environmentalContext.phenology.scopeLabel}).`
        : ` Fase fenologica stimata dal profilo agronomico: ${environmentalContext.phenology.stageLabel}.`
      : ''
    const agronomicSuffix = environmentalContext.agronomicProfile
      ? ` Profilo agronomico: ${environmentalContext.agronomicProfile.profile.label}. Priorita: ${environmentalContext.agronomicProfile.profile.health.priorities.join(', ')}.`
      : ''
    const measuredFeedbackSuffix =
      measuredFeedbackNotes.length > 0
        ? ` Feedback osservato recente: ${measuredFeedbackNotes.join(', ')}.`
        : ''
    const environmentalHistorySuffix = this.buildEnvironmentalHistorySuffix(
      environmentalContext.environmentalHistorySummary
    )
    const adaptiveLearningSuffix =
      adaptiveLearningNotes.length > 0
        ? ` Memoria sito-specifica: ${adaptiveLearningNotes.join(' ')}.`
        : ''
    const siteContext = environmentalContext.refinedContext?.siteOperationalProfile
    const siteContextClauses = [
      typeof siteContext?.dailySunHours === 'number'
        ? `${siteContext.dailySunHours} h sole`
        : null,
      siteContext?.exposureClass === 'sheltered'
        ? 'sito riparato'
        : siteContext?.exposureClass === 'exposed'
          ? 'sito esposto'
          : null,
      typeof siteContext?.shadowObstaclesCount === 'number' && siteContext.shadowObstaclesCount > 0
        ? `${siteContext.shadowObstaclesCount} ostacoli d ombra`
        : null,
    ].filter((value): value is string => Boolean(value))
    const siteContextSuffix =
      siteContextClauses.length > 0
        ? ` Contesto sito: ${siteContextClauses.join(', ')}.`
        : ''

    if (context.id === 'vineyard') {
      return `${rule.description} rilevate su ${plantName}. Concentrati sui filari piu umidi o chiusi.${phenologySuffix}${agronomicSuffix}${sensorSuffix}${measuredFeedbackSuffix}${environmentalHistorySuffix}${adaptiveLearningSuffix}${siteContextSuffix}`
    }

    if (context.id === 'olive') {
      return `${rule.description} rilevato su ${plantName}. Verifica chioma, olive e uniformita dell impianto.${phenologySuffix}${agronomicSuffix}${sensorSuffix}${measuredFeedbackSuffix}${environmentalHistorySuffix}${adaptiveLearningSuffix}${siteContextSuffix}`
    }

    if (context.id === 'orchard') {
      return `${rule.description} rilevata su ${plantName}. Controlla insieme foglie, chioma e frutti.${phenologySuffix}${agronomicSuffix}${sensorSuffix}${measuredFeedbackSuffix}${environmentalHistorySuffix}${adaptiveLearningSuffix}${siteContextSuffix}`
    }

    return `${rule.description} rilevata per ${plantName}.${phenologySuffix}${agronomicSuffix}${sensorSuffix}${measuredFeedbackSuffix}${environmentalHistorySuffix}${adaptiveLearningSuffix}${siteContextSuffix}`
  }

  private shouldConsultAgronomist(rule: MonitoringRule): boolean {
    return rule.actions.some((action) => action.type === 'agronomist_contact') || rule.id.includes('mildew')
  }

  private calculateUrgency(
    rule: MonitoringRule,
    environmentalContext?: HealthEnvironmentalContext
  ): number {
    const baseUrgency =
      rule.id.includes('blight') || rule.id.includes('mildew')
        ? 2
        : rule.id.includes('fly') || rule.id.includes('harvest')
          ? 3
          : 7

    return Math.max(
      1,
      baseUrgency + (environmentalContext?.adaptiveLearning.urgencyDaysOffset || 0)
    )
  }

  private calculateRuleConfidence(
    rule: MonitoringRule,
    environmentalContext: HealthEnvironmentalContext
  ): number {
    const baseConfidence = 0.8
    const hasWeatherTrigger = rule.triggers.some((trigger) => trigger.type === 'weather')
    const measuredFeedbackBoost = (environmentalContext.measuredFeedbackPressure || 0) * 0.01
    const adaptiveBoost = environmentalContext.adaptiveLearning?.confidenceBoost || 0

    if (!hasWeatherTrigger) {
      return this.applyAgronomicConfidenceAdjustments(
        Math.min(0.96, baseConfidence + measuredFeedbackBoost + adaptiveBoost),
        environmentalContext
      )
    }

    if (environmentalContext.microclimate?.hasRecentData) {
      return this.applyAgronomicConfidenceAdjustments(
        Math.min(0.98, (environmentalContext.phenology ? 0.95 : 0.92) + measuredFeedbackBoost + adaptiveBoost),
        environmentalContext
      )
    }

    if (environmentalContext.weatherData) {
      return this.applyAgronomicConfidenceAdjustments(
        Math.min(0.95, (environmentalContext.phenology ? 0.88 : 0.84) + measuredFeedbackBoost + adaptiveBoost),
        environmentalContext
      )
    }

    return this.applyAgronomicConfidenceAdjustments(
      Math.min(0.9, (environmentalContext.phenology ? 0.76 : 0.68) + measuredFeedbackBoost + adaptiveBoost),
      environmentalContext
    )
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

  private adjustWeatherTriggerRange(
    range: { min?: number; max?: number } | undefined,
    metric: 'humidity' | 'temperature' | 'rain' | 'leafWetness',
    environmentalContext: HealthEnvironmentalContext
  ): { min?: number; max?: number } | undefined {
    if (!range) {
      return range
    }

    const adaptiveLearning = environmentalContext.adaptiveLearning
    const adjustedRange = { ...range }

    switch (metric) {
      case 'humidity':
        if (typeof adjustedRange.min === 'number') {
          adjustedRange.min = Math.max(
            0,
            adjustedRange.min - Math.max(0, 80 - adaptiveLearning.fungalHumidityThreshold)
          )
        }
        break
      case 'rain':
        if (typeof adjustedRange.min === 'number') {
          adjustedRange.min = Math.max(
            0,
            Number(
              (
                adjustedRange.min - Math.max(0, 1 - adaptiveLearning.fungalRainThreshold)
              ).toFixed(1)
            )
          )
        }
        break
      case 'leafWetness':
        if (typeof adjustedRange.min === 'number') {
          adjustedRange.min = Math.max(
            0,
            adjustedRange.min - Math.max(0, 50 - adaptiveLearning.leafWetnessThreshold)
          )
        }
        break
      case 'temperature':
        if (typeof adjustedRange.max === 'number' && adaptiveLearning.pressureBoost >= 3) {
          adjustedRange.max += 1
        }
        if (typeof adjustedRange.min === 'number' && adaptiveLearning.pressureBoost >= 3) {
          adjustedRange.min = Math.max(0, adjustedRange.min - 1)
        }
        break
    }

    return adjustedRange
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

  private getDominantPlantNames(garden: Garden, tasks: GardenTask[]): string[] {
    const frequencies = new Map<string, number>()

    for (const task of tasks) {
      const plantName = task.plantName?.trim()
      if (!plantName) {
        continue
      }

      frequencies.set(plantName, (frequencies.get(plantName) || 0) + 1)
    }

    const rankedPlantNames = Array.from(frequencies.entries())
      .sort((left, right) => right[1] - left[1])
      .map(([plantName]) => plantName)

    if (rankedPlantNames.length > 0) {
      return rankedPlantNames
    }

    if (garden.vineyardConfig?.varieties?.length) {
      return [garden.vineyardConfig.varieties[0]]
    }

    if (garden.oliveGroveConfig?.varieties?.length) {
      return [garden.oliveGroveConfig.varieties[0]]
    }

    if (garden.orchardConfig?.varieties?.length) {
      return [garden.orchardConfig.varieties[0]]
    }

    return []
  }

  private async resolveAgronomicHealthProfile(
    garden: Garden,
    dominantPlantNames: string[]
  ): Promise<ResolvedAgronomicCropProfile | null> {
    for (const plantName of dominantPlantNames) {
      const resolved = await resolveAgronomicCropProfile({ plantId: plantName })
      if (resolved.profile && resolved.source !== 'fallback') {
        return resolved
      }
    }

    const fallbackProfile =
      (garden.vineyardConfig || garden.gardenType === 'Vineyard')
        ? getAgronomicCropProfileById('vineyard_quality')
        : (garden.oliveGroveConfig || garden.gardenType === 'OliveGrove')
          ? getAgronomicCropProfileById('olive_grove_oil')
          : (garden.orchardConfig || garden.gardenType === 'Orchard')
            ? getAgronomicCropProfileById('orchard_generic')
            : (
              garden.indoorConfig ||
              garden.hydroponicConfig ||
              garden.aquaponicConfig ||
              garden.aeroponicConfig ||
              garden.gardenType === 'Indoor' ||
              garden.gardenType === 'Hydroponic' ||
              garden.gardenType === 'Aquaponic' ||
              garden.gardenType === 'Aeroponic'
            )
              ? getAgronomicCropProfileById('controlled_environment_leafy')
              : null

    if (!fallbackProfile) {
      return null
    }

    return {
      profile: fallbackProfile,
      source: 'fallback',
      matchedBy: garden.gardenType || 'garden_context',
      warnings: ['Health profile resolved from garden context because no dominant crop name was available.'],
    }
  }

  private isRuleAgronomicallyRelevant(
    rule: MonitoringRule,
    environmentalContext: HealthEnvironmentalContext
  ): boolean {
    const agronomicProfile = environmentalContext.agronomicProfile?.profile
    const dominantPlantNames = environmentalContext.dominantPlantNames

    if (rule.cropAliases && rule.cropAliases.length > 0) {
      return dominantPlantNames.some((plantName) => this.matchesCropAlias(rule.cropAliases!, plantName))
    }

    if (rule.agronomicProfileIds && rule.agronomicProfileIds.length > 0) {
      return agronomicProfile ? rule.agronomicProfileIds.includes(agronomicProfile.id) : false
    }

    if (rule.requiredHealthPriorities && rule.requiredHealthPriorities.length > 0) {
      return agronomicProfile
        ? rule.requiredHealthPriorities.some((priority) => agronomicProfile.health.priorities.includes(priority))
        : true
    }

    return true
  }

  private matchesCropAlias(aliases: string[], plantName: string): boolean {
    const normalizedPlantName = plantName.toLowerCase()
    return aliases.some((alias) => normalizedPlantName.includes(alias.toLowerCase()))
  }

  private applyAgronomicConfidenceAdjustments(
    baseConfidence: number,
    environmentalContext: HealthEnvironmentalContext
  ): number {
    const agronomicProfile = environmentalContext.agronomicProfile?.profile
    if (!agronomicProfile) {
      return baseConfidence
    }

    let adjustedConfidence = baseConfidence

    if (environmentalContext.phenology?.source === 'observation') {
      adjustedConfidence += 0.03
    } else if (environmentalContext.phenology?.source === 'agronomic_fallback') {
      adjustedConfidence -= 0.02
    }

    const p0Signals = agronomicProfile.health.recommendedSignals.filter(
      (signal) => signal.priority === 'P0'
    )

    if (p0Signals.length > 0) {
      const availableSignals = this.getAvailableHealthSignals(environmentalContext)
      const coveredSignals = p0Signals.filter((signal) => availableSignals.has(signal.key))
      adjustedConfidence += (coveredSignals.length / p0Signals.length) * 0.08 - 0.03
    }

    return Math.max(0.45, Math.min(0.98, adjustedConfidence))
  }

  private getAvailableHealthSignals(
    environmentalContext: HealthEnvironmentalContext
  ): Set<AgronomicSignalKey> {
    const availableSignals = new Set<AgronomicSignalKey>()
    const weatherData = environmentalContext.weatherData
    const microclimate = environmentalContext.microclimate

    if (weatherData) {
      availableSignals.add('weather_current')
      if (Array.isArray(weatherData.forecast) && weatherData.forecast.length > 0) {
        availableSignals.add('weather_forecast')
      }
      if (typeof weatherData.rainMm === 'number') {
        availableSignals.add('rain_gauge_local')
      }
    }

    if (microclimate?.metrics.leafWetness !== undefined) {
      availableSignals.add('leaf_wetness')
    }

    if (microclimate?.metrics.dewPoint !== undefined) {
      availableSignals.add('dew_point')
    }

    if (microclimate?.metrics.vpd !== undefined) {
      availableSignals.add('vpd')
    }

    if (microclimate?.metrics.canopyTemperature !== undefined) {
      availableSignals.add('canopy_temperature')
    }

    if (microclimate?.metrics.soilTensionKpa !== undefined) {
      availableSignals.add('soil_tension_kpa')
    }

    if (microclimate?.metrics.rainGaugeLocalMm !== undefined) {
      availableSignals.add('rain_gauge_local')
    }

    if (environmentalContext.phenology) {
      availableSignals.add('phenology_observation')
    }

    return availableSignals
  }

  private buildEnvironmentalHistorySuffix(
    environmentalHistorySummary?: GardenEnvironmentalHistorySummary | null
  ): string {
    if (!environmentalHistorySummary || environmentalHistorySummary.entries === 0) {
      return ''
    }

    const clauses: string[] = []
    if (environmentalHistorySummary.highDiseasePressureDays > 0) {
      clauses.push(`${environmentalHistorySummary.highDiseasePressureDays} giorni recenti ad alta pressione fungina`)
    }
    if (environmentalHistorySummary.highSoilWaterStressDays > 0) {
      clauses.push(`${environmentalHistorySummary.highSoilWaterStressDays} giorni recenti con forte stress idrico`)
    }
    if (environmentalHistorySummary.lowDryingPowerDays > 0) {
      clauses.push(`${environmentalHistorySummary.lowDryingPowerDays} giornate con bassa capacita di asciugatura`)
    }

    if (clauses.length === 0) {
      return ''
    }

    return ` Storico ambientale: ${clauses.join(', ')}.`
  }

  private async resolveGardenOwnerId(garden: Garden): Promise<string | null> {
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

  private scoreHealthAlert(
    alert: HealthAlert,
    environmentalContext: HealthEnvironmentalContext
  ): number {
    const severityScore = {
      critical: 100,
      high: 78,
      medium: 52,
      low: 28,
    }[alert.severity]

    const typePriorityScore = this.getAlertTypeAgronomicWeight(alert.type, environmentalContext)
    const urgencyScore = Math.max(0, 14 - Math.min(alert.urgencyDays, 14)) * 2
    const baseScore = severityScore + typePriorityScore + urgencyScore
    const priorityResult = scoreAgronomicPriority({
      baseScore,
      confidence: alert.confidence,
      resolvedProfile: environmentalContext.agronomicProfile,
      focus: 'health',
      availableSignals: this.getAvailableHealthSignals(environmentalContext),
      isCriticalStage:
        Boolean(environmentalContext.phenology) &&
        Boolean(
          environmentalContext.phenology &&
            environmentalContext.agronomicProfile?.profile.phenology.decisionCriticalStages.includes(
              environmentalContext.phenology.stageKey
            )
        ),
      refinedContext: environmentalContext.refinedContext,
    })
    const phenologyScore =
      environmentalContext.phenology &&
      environmentalContext.agronomicProfile?.profile.phenology.decisionCriticalStages.includes(
        environmentalContext.phenology.stageKey
      )
        ? 8
        : 0

    return (
      priorityResult.score +
      phenologyScore +
      environmentalContext.measuredFeedbackPressure +
      environmentalContext.adaptiveLearning.pressureBoost
    )
  }

  private applyAdaptiveLearningToAlert(
    alert: HealthAlert,
    environmentalContext: HealthEnvironmentalContext
  ): HealthAlert {
    const combinedPressure =
      environmentalContext.measuredFeedbackPressure +
      environmentalContext.adaptiveLearning.pressureBoost
    const nextSeverity =
      combinedPressure >= 9 && alert.severity !== 'critical'
        ? alert.severity === 'low'
          ? 'medium'
          : alert.severity === 'medium'
            ? 'high'
            : 'critical'
        : alert.severity
    const adaptiveSuffix =
      environmentalContext.adaptiveLearning.notes.length > 0 &&
      !alert.description.includes('Memoria sito-specifica:')
        ? ` Memoria sito-specifica: ${environmentalContext.adaptiveLearning.notes.join(' ')}.`
        : ''

    return {
      ...alert,
      severity: nextSeverity,
      urgencyDays: Math.max(
        1,
        alert.urgencyDays + environmentalContext.adaptiveLearning.urgencyDaysOffset
      ),
      confidence: Math.min(
        0.99,
        alert.confidence + environmentalContext.adaptiveLearning.confidenceBoost
      ),
      description: `${alert.description}${adaptiveSuffix}`,
    }
  }

  private buildMeasuredFeedbackHealthContext(
    records: AgronomicMeasuredFeedbackRecord[],
    dominantPlantNames: string[]
  ): { pressure: number; notes: string[] } {
    const normalizedPlants = dominantPlantNames.map((plantName) => plantName.toLowerCase().trim())
    const relevantRecords = records
      .filter((record) => {
        if (normalizedPlants.length === 0) {
          return true
        }

        return record.plantName
          ? normalizedPlants.includes(record.plantName.toLowerCase().trim())
          : true
      })
      .slice(0, 10)

    let pressure = 0
    const notes: string[] = []

    for (const record of relevantRecords) {
      const effectivenessScore =
        typeof record.metrics.effectivenessScore === 'number'
          ? record.metrics.effectivenessScore
          : null
      const qualityRating =
        typeof record.metrics.qualityRating === 'number'
          ? record.metrics.qualityRating
          : null
      const moistureDelta =
        typeof record.metrics.averageSoilMoistureDelta === 'number'
          ? record.metrics.averageSoilMoistureDelta
          : null

      if (record.focus === 'nutrition' && effectivenessScore !== null && effectivenessScore < 5) {
        pressure += 3
        notes.push('trattamenti recenti poco efficaci')
      }

      if (record.focus === 'quality' && qualityRating !== null && qualityRating < 3) {
        pressure += 3
        notes.push('qualita recente sotto soglia')
      }

      if (record.focus === 'water' && moistureDelta !== null && moistureDelta <= 0) {
        pressure += 2
        notes.push('irrigazioni recenti con risposta idrica debole')
      }
    }

    return {
      pressure: Math.min(10, pressure),
      notes: [...new Set(notes)].slice(0, 3),
    }
  }

  private getAlertTypeAgronomicWeight(
    alertType: HealthAlert['type'],
    environmentalContext: HealthEnvironmentalContext
  ): number {
    const priorities = environmentalContext.agronomicProfile?.profile.health.priorities || []

    switch (alertType) {
      case 'disease_risk':
        return priorities.includes('foliar_disease') ? 18 : priorities.includes('root_disease') ? 14 : 8
      case 'pest_alert':
        return priorities.includes('sap_sucking_pests') ? 18 : priorities.includes('fruit_quality_pressure') ? 14 : 8
      case 'nutrient_deficiency':
        return priorities.includes('nutrient_imbalance') ? 16 : 8
      case 'stress_symptoms':
      case 'weather_stress':
        return priorities.includes('water_stress') ? 18 : 10
      case 'harvest_timing':
        return environmentalContext.agronomicProfile ? 12 : 6
      default:
        return 0
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
