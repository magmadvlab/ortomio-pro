import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildAgronomicEconomicPrioritySummary,
  summarizeAgronomicEconomicObservations,
} from '@/services/agronomicEconomicPriorityService'
import type { AgronomicMeasuredFeedbackRecord } from '@/services/agronomicMeasuredFeedbackService'
import { OperationRegistryService } from '@/services/operationRegistryService'
import type { FertilizerApplicationLogDB, HarvestLogData } from '@/types'

test('operation registry hydrates fertilizer costs from inventory and harvest value into summary', async () => {
  const fertilizerLog: FertilizerApplicationLogDB = {
    id: 'fert-1',
    gardenId: 'garden-1',
    fertilizerProductId: 'npk-20',
    fertilizerProductName: 'NPK 20-20-20',
    fertilizerType: 'mineral',
    applicationDate: '2026-06-10',
    dosageAmount: 500,
    dosageUnit: 'g',
    method: 'surface',
    createdAt: '2026-06-10T08:00:00.000Z',
    fieldRowId: 'row-1',
    areaSqm: 50,
  }

  const harvestLog: HarvestLogData = {
    id: 'harvest-1',
    gardenId: 'garden-1',
    plantName: 'POMODORO',
    quantity: 10,
    unit: 'kg',
    rating: 4,
    date: '2026-06-25',
  }

  const service = new OperationRegistryService({
    async getGarden() {
      return { id: 'garden-1', name: 'Campo prova' } as any
    },
    async getFieldRows() {
      return [{ id: 'row-1', name: 'Filare 1', rowNumber: 1 }] as any
    },
    async getWateringLogs() {
      return []
    },
    async getFertilizerApplicationLogs() {
      return [fertilizerLog]
    },
    async getTreatments() {
      return []
    },
    async getMechanicalWorks() {
      return []
    },
    async getHarvestLogs() {
      return [harvestLog]
    },
    async getFertilizerInventory() {
      return [
        {
          id: 'inv-1',
          garden_id: 'garden-1',
          product_id: 'npk-20',
          product_name: 'NPK 20-20-20',
          product_type: 'mineral',
          category: 'base',
          quantity: 5,
          unit: 'kg',
          cost_per_unit: 4,
          created_at: '2026-06-01T00:00:00.000Z',
          updated_at: '2026-06-01T00:00:00.000Z',
        },
      ] as any
    },
    async getPhytoInventory() {
      return []
    },
  })

  const operations = await service.getOperationsAsync('garden-1')
  const fertilization = operations.find((operation) => operation.type === 'fertilization')
  const harvest = operations.find((operation) => operation.type === 'harvest')
  const summary = service.getOperationSummary('garden-1')

  assert.ok(fertilization)
  assert.equal(fertilization?.results.costSource, 'inventory_derived')
  assert.ok((fertilization?.results.actualCost || 0) > 2)

  assert.ok(harvest)
  assert.ok((harvest?.results.economicValue || 0) > 45)
  assert.ok((harvest?.results.netEconomicImpact || 0) > 40)

  assert.equal(summary.totalOperations, 2)
  assert.ok(summary.totalEconomicValue > 45)
  assert.ok(summary.totalNetEconomicImpact > 20)
})

test('economic observation summary captures data quality and improves ROI priority reasoning', () => {
  const records: AgronomicMeasuredFeedbackRecord[] = [
    {
      id: 'obs-1',
      gardenId: 'garden-1',
      operation: 'harvest',
      focus: 'quality',
      recordedAt: '2026-08-20',
      plantName: 'POMODORO',
      summary: 'Raccolta premium',
      metrics: {
        actualCost: 12,
        estimatedValue: 54,
        netImpact: 42,
        roiRatio: 3.5,
        costSource: 'observed',
      },
    },
    {
      id: 'obs-2',
      gardenId: 'garden-1',
      operation: 'harvest',
      focus: 'quality',
      recordedAt: '2026-08-13',
      plantName: 'POMODORO',
      summary: 'Raccolta premium 2',
      metrics: {
        actualCost: 14,
        estimatedValue: 52,
        netImpact: 38,
        roiRatio: 2.71,
        costSource: 'observed',
      },
    },
  ]

  const observationSummary = summarizeAgronomicEconomicObservations(records, {
    focus: 'quality',
    plantName: 'pomodoro',
  })

  assert.ok(observationSummary)
  assert.equal(observationSummary?.dataQuality, 'observed')
  assert.equal(observationSummary?.averageObservedInterventionCost, 13)
  assert.equal(observationSummary?.averageObservedValueProtected, 53)

  const prioritySummary = buildAgronomicEconomicPrioritySummary({
    source: 'phenology',
    focus: 'quality',
    priorityScore: 72,
    priorityConfidence: 0.82,
    cropNameHint: 'POMODORO',
    isCriticalStage: true,
    qualityScoreGap: 8,
    observationSummary,
  })

  assert.equal(prioritySummary.status, 'favorable')
  assert.ok((prioritySummary.estimatedInterventionCost || 0) <= 15)
  assert.ok((prioritySummary.estimatedValueProtected || 0) >= 50)
  assert.ok((prioritySummary.roiRatio || 0) > 2)
})

test('economic priority summary increases delay cost when persistent environmental pressure is present', () => {
  const baseline = buildAgronomicEconomicPrioritySummary({
    source: 'irrigation',
    focus: 'water',
    priorityScore: 55,
    averageEfficiency: 74,
    waterUseEfficiency: 76,
  })

  const withEnvironmentalPressure = buildAgronomicEconomicPrioritySummary({
    source: 'irrigation',
    focus: 'water',
    priorityScore: 55,
    averageEfficiency: 74,
    waterUseEfficiency: 76,
    environmentalSummary: {
      zoneId: 'zone-1',
      gardenId: 'garden-1',
      entries: 6,
      highSoilWaterStressDays: 3,
      mediumSoilWaterStressDays: 1,
      highDiseasePressureDays: 0,
      sensorLocalDays: 2,
      deficitWaterBalanceDays: 4,
      surplusWaterBalanceDays: 0,
      lowDryingPowerDays: 0,
      latestSoilWaterStressLevel: 'high',
      dominantWeatherSourceClass: 'historical_archive',
    },
  })

  assert.ok(
    (withEnvironmentalPressure.estimatedCostOfDelay || 0) >
      (baseline.estimatedCostOfDelay || 0)
  )
  assert.ok(
    (withEnvironmentalPressure.estimatedValueProtected || 0) >=
      (baseline.estimatedValueProtected || 0)
  )
  assert.ok(
    withEnvironmentalPressure.rationale.some((entry) =>
      entry.includes('Storico ambientale')
    )
  )
})

test('observed negative ROI pushes alternative action economics toward monitor', () => {
  const records: AgronomicMeasuredFeedbackRecord[] = [
    {
      id: 'obs-neg-1',
      gardenId: 'garden-1',
      zoneId: 'zone-1',
      operation: 'irrigation',
      focus: 'water',
      recordedAt: '2026-07-12',
      plantName: 'GRANO',
      summary: 'Turno inefficiente',
      metrics: {
        actualCost: 42,
        estimatedValue: 24,
        netImpact: -18,
        roiRatio: -0.43,
        costSource: 'observed',
      },
    },
    {
      id: 'obs-neg-2',
      gardenId: 'garden-1',
      zoneId: 'zone-1',
      operation: 'irrigation',
      focus: 'water',
      recordedAt: '2026-07-05',
      plantName: 'GRANO',
      summary: 'Turno inefficiente 2',
      metrics: {
        actualCost: 40,
        estimatedValue: 20,
        netImpact: -20,
        roiRatio: -0.5,
        costSource: 'observed',
      },
    },
  ]

  const observationSummary = summarizeAgronomicEconomicObservations(records, {
    focus: 'water',
    zoneId: 'zone-1',
  })

  const summary = buildAgronomicEconomicPrioritySummary({
    source: 'irrigation',
    focus: 'water',
    priorityScore: 48,
    priorityConfidence: 0.62,
    interventionCost: 55,
    averageEfficiency: 84,
    waterUseEfficiency: 83,
    uniformityCoefficient: 82,
    observationSummary,
  })

  assert.equal(summary.actionComparison?.recommendedAction, 'monitor')
  assert.ok(
    summary.actionComparison?.scenarios.some((scenario) =>
      scenario.rationale.some((entry) => entry.includes('Storico osservato debole'))
    )
  )
})

test('observed prudent ROI can keep next_cycle as preferred compromise', () => {
  const records: AgronomicMeasuredFeedbackRecord[] = [
    {
      id: 'obs-mid-1',
      gardenId: 'garden-1',
      zoneId: 'zone-2',
      operation: 'irrigation',
      focus: 'water',
      recordedAt: '2026-07-20',
      plantName: 'ORZO',
      summary: 'Turno moderatamente utile',
      metrics: {
        actualCost: 28,
        estimatedValue: 39,
        netImpact: 11,
        roiRatio: 0.39,
        costSource: 'observed',
      },
    },
    {
      id: 'obs-mid-2',
      gardenId: 'garden-1',
      zoneId: 'zone-2',
      operation: 'irrigation',
      focus: 'water',
      recordedAt: '2026-07-13',
      plantName: 'ORZO',
      summary: 'Turno moderatamente utile 2',
      metrics: {
        actualCost: 30,
        estimatedValue: 40,
        netImpact: 10,
        roiRatio: 0.33,
        costSource: 'observed',
      },
    },
  ]

  const observationSummary = summarizeAgronomicEconomicObservations(records, {
    focus: 'water',
    zoneId: 'zone-2',
  })

  const summary = buildAgronomicEconomicPrioritySummary({
    source: 'irrigation',
    focus: 'water',
    priorityScore: 34,
    priorityConfidence: 0.4,
    averageEfficiency: 88,
    waterUseEfficiency: 86,
    uniformityCoefficient: 84,
    observationSummary,
  })

  assert.equal(summary.actionComparison?.recommendedAction, 'next_cycle')
  assert.ok(
    summary.actionComparison?.scenarios.some((scenario) =>
      scenario.rationale.some((entry) => entry.includes('Storico osservato prudente'))
    )
  )
})
