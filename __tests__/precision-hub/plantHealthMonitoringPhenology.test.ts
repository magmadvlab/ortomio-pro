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
      stageLabel: 'Invaiatura',
      scopeLabel: 'filare row-3',
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
      stageLabel: 'Invaiatura',
      scopeLabel: 'giardino',
    },
    devices: [],
  })

  assert.equal(withoutPhenology, 0.84)
  assert.equal(withPhenology, 0.88)
  assert.ok(withPhenology > withoutPhenology)
})
