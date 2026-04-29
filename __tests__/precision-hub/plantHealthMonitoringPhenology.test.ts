import test from 'node:test'
import assert from 'node:assert/strict'

import { PlantHealthMonitoringService } from '@/services/plantHealthMonitoringService'
import { inferHealthCropContext } from '@/utils/healthCropContext'

const vineyardGarden = {
  id: 'garden-1',
  gardenType: 'Vineyard',
  vineyardConfig: { varieties: ['Sangiovese'] },
} as any

const vineyardContext = inferHealthCropContext(vineyardGarden)

const weatherRule = {
  id: 'vineyard_mildew_pressure',
  name: 'Rischio fungino vigneto',
  description: 'Condizioni favorevoli a pressione fungina',
  triggers: [{ type: 'weather', parameters: {} }],
  conditions: [],
  actions: [],
  enabled: true,
  applicableContexts: ['vineyard'],
}

test('generateDescription appends confirmed phenology when available', () => {
  const service = new PlantHealthMonitoringService()
  const description = (service as any).generateDescription(weatherRule, 'Sangiovese', {
    cropContext: vineyardContext,
    weatherData: null,
    microclimate: null,
    phenology: {
      observation: {
        id: 'obs-1',
        gardenId: 'garden-1',
        cropContextId: 'vineyard',
        scopeType: 'field_row',
        scopeId: 'row-3',
        fieldRowId: 'row-3',
        observedAt: '2026-03-20T10:00:00.000Z',
        phenologyStage: 'veraison',
        observationSource: 'visual',
        createdAt: '2026-03-20T10:00:00.000Z',
        updatedAt: '2026-03-20T10:00:00.000Z',
      },
      stageKey: 'veraison',
      stageLabel: 'Invaiatura',
      scopeLabel: 'filare row-3',
      source: 'observation',
      confidence: 0.95,
    },
    devices: [],
  })

  assert.match(description, /Fase fenologica confermata: Invaiatura \(filare row-3\)\./)
})

test('calculateRuleConfidence increases when a real phenology observation supports the alert', () => {
  const service = new PlantHealthMonitoringService()

  const withoutPhenology = (service as any).calculateRuleConfidence(weatherRule, {
    cropContext: vineyardContext,
    weatherData: { humidity: 88, temp: 19, rainMm: 2.4, forecast: [] },
    microclimate: null,
    phenology: null,
    devices: [],
  })

  const withPhenology = (service as any).calculateRuleConfidence(weatherRule, {
    cropContext: vineyardContext,
    weatherData: { humidity: 88, temp: 19, rainMm: 2.4, forecast: [] },
    microclimate: null,
    phenology: {
      observation: {
        id: 'obs-2',
        gardenId: 'garden-1',
        cropContextId: 'vineyard',
        scopeType: 'garden',
        observedAt: '2026-03-20T10:00:00.000Z',
        phenologyStage: 'veraison',
        observationSource: 'visual',
        createdAt: '2026-03-20T10:00:00.000Z',
        updatedAt: '2026-03-20T10:00:00.000Z',
      },
      stageKey: 'veraison',
      stageLabel: 'Invaiatura',
      scopeLabel: 'giardino',
      source: 'observation',
      confidence: 0.95,
    },
    devices: [],
  })

  assert.equal(withoutPhenology, 0.84)
  assert.equal(withPhenology, 0.88)
  assert.ok(withPhenology > withoutPhenology)
})

test('analyzeWeatherConditions escalates risk when persisted environmental history shows recurring pressure', async () => {
  const service = new PlantHealthMonitoringService()

  const alerts = await (service as any).analyzeWeatherConditions(vineyardGarden, {
    cropContext: vineyardContext,
    weatherData: {
      humidity: 88,
      temp: 20,
      rainMm: 3,
      forecast: [
        { date: '2026-04-01', tempMin: 16, tempMax: 24, rainMm: 3, humidity: 88, windSpeed: 8 },
        { date: '2026-04-02', tempMin: 15, tempMax: 23, rainMm: 2, humidity: 86, windSpeed: 9 },
      ],
    },
    microclimate: null,
    environmentalHistorySummary: {
      gardenId: 'garden-1',
      entries: 5,
      trackedZones: 2,
      highSoilWaterStressDays: 0,
      mediumSoilWaterStressDays: 1,
      highDiseasePressureDays: 3,
      sensorLocalDays: 2,
      deficitWaterBalanceDays: 0,
      surplusWaterBalanceDays: 2,
      lowDryingPowerDays: 3,
      latestSensorPrecedence: 'sensor_local',
      latestSoilWaterStressLevel: 'medium',
      dominantWeatherSourceClass: 'historical_archive',
    },
    phenology: null,
    devices: [],
    agronomicProfile: null,
    dominantPlantNames: ['Sangiovese'],
    measuredFeedbackPressure: 0,
    measuredFeedbackNotes: [],
    adaptiveLearning: {
      pressureBoost: 0,
      urgencyDaysOffset: 0,
      confidenceBoost: 0,
      fungalHumidityThreshold: 80,
      fungalRainThreshold: 1,
      leafWetnessThreshold: 50,
      heatStressTemperatureThreshold: 32,
      hotDaysTriggerCount: 2,
      notes: [],
    },
  })

  const fungalAlert = alerts.find((alert: any) => alert.type === 'disease_risk')
  assert.ok(fungalAlert)
  assert.equal(fungalAlert?.severity, 'critical')
  assert.match(fungalAlert?.description || '', /Storico ambientale/)
  assert.ok(fungalAlert?.triggers.includes('environmental_history'))
})

test('generateDescription includes site context when shaded conditions are available', () => {
  const service = new PlantHealthMonitoringService()
  const description = (service as any).generateDescription(weatherRule, 'Sangiovese', {
    cropContext: vineyardContext,
    weatherData: null,
    microclimate: null,
    phenology: null,
    devices: [],
    agronomicProfile: null,
    measuredFeedbackNotes: [],
    environmentalHistorySummary: null,
    adaptiveLearning: {
      pressureBoost: 0,
      urgencyDaysOffset: 0,
      confidenceBoost: 0,
      fungalHumidityThreshold: 80,
      fungalRainThreshold: 1,
      leafWetnessThreshold: 50,
      heatStressTemperatureThreshold: 32,
      hotDaysTriggerCount: 2,
      notes: [],
    },
    refinedContext: {
      siteOperationalProfile: {
        dailySunHours: 3.5,
        exposureClass: 'sheltered',
        shadowObstaclesCount: 2,
      },
    },
  })

  assert.match(description, /Contesto sito: 3.5 h sole, sito riparato, 2 ostacoli d ombra\./)
})

test('scoreHealthAlert increases priority on shaded sheltered sites', () => {
  const service = new PlantHealthMonitoringService()
  const alert = {
    id: 'health-1',
    type: 'disease_risk',
    severity: 'medium',
    plantName: 'Sangiovese',
    description: 'Pressione fungina in aumento',
    detectedAt: '2026-04-02T08:00:00.000Z',
    suggestedActions: [],
    photoRequired: true,
    agronomistConsultation: false,
    urgencyDays: 4,
    confidence: 0.78,
    triggers: ['humidity'],
  } as const
  const baseContext = {
    cropContext: vineyardContext,
    weatherData: null,
    microclimate: null,
    environmentalHistorySummary: null,
    phenology: null,
    devices: [],
    agronomicProfile: null,
    dominantPlantNames: ['Sangiovese'],
    measuredFeedbackPressure: 0,
    measuredFeedbackNotes: [],
    adaptiveLearning: {
      pressureBoost: 0,
      urgencyDaysOffset: 0,
      confidenceBoost: 0,
      fungalHumidityThreshold: 80,
      fungalRainThreshold: 1,
      leafWetnessThreshold: 50,
      heatStressTemperatureThreshold: 32,
      hotDaysTriggerCount: 2,
      notes: [],
    },
  }

  const openScore = (service as any).scoreHealthAlert(alert, {
    ...baseContext,
    refinedContext: {
      siteOperationalProfile: {
        dailySunHours: 8,
        exposureClass: 'exposed',
        shadowObstaclesCount: 0,
      },
    },
  })

  const shelteredScore = (service as any).scoreHealthAlert(alert, {
    ...baseContext,
    refinedContext: {
      siteOperationalProfile: {
        dailySunHours: 3.5,
        exposureClass: 'sheltered',
        shadowObstaclesCount: 2,
      },
    },
  })

  assert.ok(shelteredScore > openScore)
})
