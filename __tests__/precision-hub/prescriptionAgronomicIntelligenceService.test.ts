import test from 'node:test'
import assert from 'node:assert/strict'

import { buildAgronomicActionQueue } from '@/services/agronomicActionQueueService'
import { buildPrescriptionAgronomicIntelligenceSummary } from '@/services/prescriptionAgronomicIntelligenceService'
import type {
  PrescriptionExecutionEfficacySummary,
  PrescriptionExecutionOutcomeSummary,
  PrescriptionExecutionVarianceSummary,
} from '@/services/prescriptionExecutionService'
import type { PrescriptionMap } from '@/types/prescriptionMaps'

const prescriptionMap: PrescriptionMap = {
  id: 'map-1',
  gardenId: 'garden-1',
  gardenName: 'Vigneto Collina',
  name: 'Mappa prova O4',
  mapType: 'fertilizer',
  generationDate: '2026-03-21T08:00:00.000Z',
  dataSourcePeriod: { startDate: '2026-03-01', endDate: '2026-03-20' },
  dataSources: {
    ndviData: true,
    plantLevelData: true,
    rowLevelData: false,
    soilData: true,
    weatherData: true,
  },
  zones: [
    {
      id: 'zone-good',
      prescriptionMapId: 'map-1',
      zoneNumber: 1,
      zoneName: 'Zona Buona',
      zoneType: 'uniform',
      geometry: {
        type: 'Polygon',
        coordinates: [[[12.1, 42.1], [12.2, 42.1], [12.2, 42.2], [12.1, 42.2], [12.1, 42.1]]],
      },
      centroid: {
        latitude: 42.15,
        longitude: 12.15,
      },
      areaSqm: 5000,
      prescription: {
        applicationRate: 100,
        unit: 'kg/ha',
        applicationMethod: 'variable_rate',
      },
      sourceData: {
        soilType: 'Loamy',
      },
      dataQuality: 88,
      confidence: 80,
      createdAt: '2026-03-21T08:00:00.000Z',
      updatedAt: '2026-03-21T08:00:00.000Z',
    },
    {
      id: 'zone-weak',
      prescriptionMapId: 'map-1',
      zoneNumber: 2,
      zoneName: 'Zona Debole',
      zoneType: 'variable',
      geometry: {
        type: 'Polygon',
        coordinates: [[[12.2, 42.2], [12.3, 42.2], [12.3, 42.3], [12.2, 42.3], [12.2, 42.2]]],
      },
      centroid: {
        latitude: 42.25,
        longitude: 12.25,
      },
      areaSqm: 5000,
      prescription: {
        applicationRate: 90,
        unit: 'kg/ha',
        applicationMethod: 'variable_rate',
      },
      sourceData: {
        soilType: 'Clay',
      },
      dataQuality: 82,
      confidence: 74,
      createdAt: '2026-03-21T08:00:00.000Z',
      updatedAt: '2026-03-21T08:00:00.000Z',
    },
  ],
  totalZones: 2,
  totalAreaSqm: 10000,
  exportFormats: { shapefile: true, kml: true, isoxml: false, geojson: true, csv: true },
  areaHectares: 1,
  zonesCount: 2,
  applicationRate: { min: 80, max: 120, unit: 'kg/ha' },
  costSavings: 120,
  inputReduction: 8,
  status: 'completed',
  validationStatus: 'valid',
  qualityScore: 88,
  dataCompleteness: 92,
  createdAt: '2026-03-21T08:00:00.000Z',
  updatedAt: '2026-03-21T08:00:00.000Z',
}

test('buildPrescriptionAgronomicIntelligenceSummary returns high-signal recommendations from weak zones', () => {
  const efficacySummary: PrescriptionExecutionEfficacySummary = {
    totalZones: 2,
    scoredZones: 2,
    averageEfficacyScore: 54,
    averageMicroclimateScore: 61,
    averageSoilResponseScore: 44,
    highZones: 1,
    mediumZones: 0,
    lowZones: 1,
    unknownZones: 0,
    cropContextScores: [{ key: 'vineyard', label: 'vineyard', averageScore: 54, zones: 2 }],
    seasonScores: [{ key: 'Primavera', label: 'Primavera', averageScore: 54, zones: 2 }],
    zoneScores: [
      {
        zoneId: 'zone-good',
        zoneName: 'Zona Buona',
        efficacyScore: 86,
        efficacyStatus: 'high',
        varianceStatus: 'aligned',
        outcomeStatus: 'positive',
        microclimateStatus: 'stable',
        microclimateScore: 88,
        soilResponseStatus: 'responsive',
        soilResponseScore: 82,
        fungalPressure: 'low',
        waterStress: 'low',
        heatStress: 'none',
        cropContextId: 'vineyard',
        seasonLabel: 'Primavera',
      },
      {
        zoneId: 'zone-weak',
        zoneName: 'Zona Debole',
        efficacyScore: 22,
        efficacyStatus: 'low',
        varianceStatus: 'off_target',
        outcomeStatus: 'negative',
        microclimateStatus: 'critical',
        microclimateScore: 30,
        soilResponseStatus: 'poor',
        soilResponseScore: 18,
        fungalPressure: 'high',
        waterStress: 'high',
        heatStress: 'high',
        cropContextId: 'vineyard',
        seasonLabel: 'Primavera',
      },
    ],
  }

  const varianceSummary: PrescriptionExecutionVarianceSummary = {
    totalZones: 2,
    alignedZones: 1,
    partialZones: 0,
    offTargetZones: 1,
    missedZones: 0,
    pendingZones: 0,
    averageAdherenceScore: 51,
    zoneVariances: [
      {
        zoneId: 'zone-good',
        zoneName: 'Zona Buona',
        latestStatus: 'completed',
        varianceStatus: 'aligned',
        plannedRate: 100,
        actualRate: 100,
        plannedAreaSqm: 5000,
        areaAppliedSqm: 5000,
        rateDeviationPercent: 0,
        areaCoveragePercent: 100,
        adherenceScore: 100,
      },
      {
        zoneId: 'zone-weak',
        zoneName: 'Zona Debole',
        latestStatus: 'completed',
        varianceStatus: 'off_target',
        plannedRate: 100,
        actualRate: 60,
        plannedAreaSqm: 5000,
        areaAppliedSqm: 1800,
        rateDeviationPercent: 40,
        areaCoveragePercent: 36,
        adherenceScore: 24,
      },
    ],
  }

  const outcomeSummary: PrescriptionExecutionOutcomeSummary = {
    totalZones: 2,
    zonesWithOutcome: 2,
    positiveZones: 1,
    mixedZones: 0,
    negativeZones: 1,
    noDataZones: 0,
    averageOutcomeScore: 52,
    zoneOutcomes: [
      {
        zoneId: 'zone-good',
        zoneName: 'Zona Buona',
        latestStatus: 'completed',
        outcomeStatus: 'positive',
        outcomeScore: 90,
      },
      {
        zoneId: 'zone-weak',
        zoneName: 'Zona Debole',
        latestStatus: 'completed',
        outcomeStatus: 'negative',
        outcomeScore: 14,
      },
    ],
  }

  const summary = buildPrescriptionAgronomicIntelligenceSummary(
    prescriptionMap,
    efficacySummary,
    varianceSummary,
    outcomeSummary,
    [],
    [],
    {
      'zone-weak': {
        zoneId: 'zone-weak',
        gardenId: 'garden-1',
        entries: 6,
        highSoilWaterStressDays: 3,
        mediumSoilWaterStressDays: 1,
        highDiseasePressureDays: 2,
        sensorLocalDays: 2,
        deficitWaterBalanceDays: 4,
        surplusWaterBalanceDays: 0,
        lowDryingPowerDays: 2,
        latestSoilWaterStressLevel: 'high',
        dominantWeatherSourceClass: 'station',
      },
    }
  )

  assert.equal(summary.bestZoneLabel, 'Zona Buona')
  assert.equal(summary.worstZoneLabel, 'Zona Debole')
  assert.equal(summary.topPriorityLabel, 'Zona Debole')
  assert.equal(summary.immediatePriorities, 2)
  assert.equal(summary.nextCyclePriorities, 0)
  assert.equal(summary.monitorPriorities, 0)
  assert.equal(summary.recommendations.length > 0, true)
  assert.equal(summary.recommendations[0]?.severity, 'urgent')
  assert.equal(summary.recommendations.some((item) => item.category === 'soil'), true)
  assert.equal(summary.recommendations.some((item) => item.category === 'timing'), true)
  assert.equal(summary.operationalPriorities.length, 2)
  assert.equal(summary.operationalPriorities[0]?.scopeLabel, 'Zona Debole')
  assert.equal(summary.operationalPriorities[0]?.urgency, 'immediate')
  assert.equal(summary.operationalPriorities[1]?.urgency, 'immediate')
  assert.equal(summary.operationalPriorities[0]?.drivers.includes('esecuzione off_target'), true)
  assert.equal(summary.operationalPriorities[0]?.drivers.includes('outcome negative'), true)
  assert.equal(summary.operationalPriorities[0]?.drivers.includes('storico deficit persistente'), true)
  assert.equal(summary.recommendations.some((item) => item.id === 'environment:zone-weak'), true)
  assert.equal(summary.operationalPriorities[1]?.operationalContextTags?.includes('vineyard'), true)
  assert.equal(
    summary.operationalPriorities[0]?.refinedContext?.siteOperationalProfile?.soilType,
    'Clay'
  )
  assert.equal(
    summary.operationalPriorities[1]?.refinedContext?.siteOperationalProfile?.soilType,
    'Loamy'
  )
})

test('prescription flow propagates protected vs open-field context into queue economics', () => {
  const efficacySummary: PrescriptionExecutionEfficacySummary = {
    totalZones: 1,
    scoredZones: 1,
    averageEfficacyScore: 24,
    averageMicroclimateScore: 28,
    averageSoilResponseScore: 26,
    highZones: 0,
    mediumZones: 0,
    lowZones: 1,
    unknownZones: 0,
    cropContextScores: [{ key: 'broccoli', label: 'broccoli', averageScore: 24, zones: 1 }],
    seasonScores: [{ key: 'Primavera', label: 'Primavera', averageScore: 24, zones: 1 }],
    zoneScores: [
      {
        zoneId: 'zone-ctx',
        zoneName: 'Zona Test',
        efficacyScore: 24,
        efficacyStatus: 'low',
        varianceStatus: 'off_target',
        outcomeStatus: 'negative',
        microclimateStatus: 'critical',
        microclimateScore: 30,
        soilResponseStatus: 'poor',
        soilResponseScore: 22,
        fungalPressure: 'high',
        waterStress: 'low',
        heatStress: 'none',
        cropContextId: 'broccoli',
        seasonLabel: 'Primavera',
      },
    ],
  }

  const varianceSummary: PrescriptionExecutionVarianceSummary = {
    totalZones: 1,
    alignedZones: 0,
    partialZones: 0,
    offTargetZones: 1,
    missedZones: 0,
    pendingZones: 0,
    averageAdherenceScore: 20,
    zoneVariances: [
      {
        zoneId: 'zone-ctx',
        zoneName: 'Zona Test',
        latestStatus: 'completed',
        varianceStatus: 'off_target',
        plannedRate: 100,
        actualRate: 55,
        plannedAreaSqm: 5000,
        areaAppliedSqm: 2200,
        rateDeviationPercent: 45,
        areaCoveragePercent: 44,
        adherenceScore: 20,
      },
    ],
  }

  const outcomeSummary: PrescriptionExecutionOutcomeSummary = {
    totalZones: 1,
    zonesWithOutcome: 1,
    positiveZones: 0,
    mixedZones: 0,
    negativeZones: 1,
    noDataZones: 0,
    averageOutcomeScore: 18,
    zoneOutcomes: [
      {
        zoneId: 'zone-ctx',
        zoneName: 'Zona Test',
        latestStatus: 'completed',
        outcomeStatus: 'negative',
        outcomeScore: 18,
      },
    ],
  }

  const protectedMap: PrescriptionMap = {
    ...prescriptionMap,
    id: 'map-protected',
    gardenName: 'Serra Brassiche',
    name: 'Trattamento broccoli serra',
    mapType: 'treatment',
  }
  const openFieldMap: PrescriptionMap = {
    ...prescriptionMap,
    id: 'map-open',
    gardenName: 'Campo Aperto Brassiche',
    name: 'Trattamento broccoli pieno campo',
    mapType: 'treatment',
  }

  const protectedSummary = buildPrescriptionAgronomicIntelligenceSummary(
    protectedMap,
    efficacySummary,
    varianceSummary,
    outcomeSummary
  )
  const openFieldSummary = buildPrescriptionAgronomicIntelligenceSummary(
    openFieldMap,
    efficacySummary,
    varianceSummary,
    outcomeSummary
  )

  const protectedQueue = buildAgronomicActionQueue({ prescriptionSummary: protectedSummary })
  const openFieldQueue = buildAgronomicActionQueue({ prescriptionSummary: openFieldSummary })

  assert.equal(
    protectedSummary.operationalPriorities[0]?.operationalContextTags?.includes('protected_culture'),
    true
  )
  assert.equal(
    openFieldSummary.operationalPriorities[0]?.operationalContextTags?.includes('open_field'),
    true
  )
  assert.equal(
    protectedSummary.operationalPriorities[0]?.refinedContext?.subSystemContext?.systemType,
    'protected_culture'
  )
  assert.equal(
    openFieldSummary.operationalPriorities[0]?.refinedContext?.subSystemContext?.systemType,
    'open_field'
  )
  assert.ok(
    protectedSummary.operationalPriorities[0]?.decisionExplanation?.contextRationale?.some((entry) =>
      entry.includes('Sottosistema: protected_culture.')
    )
  )
  assert.ok(
    (((protectedQueue[0]?.metadata?.actionComparison as { dominanceMargin?: number } | undefined)
      ?.dominanceMargin) || 0) >
      (((openFieldQueue[0]?.metadata?.actionComparison as { dominanceMargin?: number } | undefined)
        ?.dominanceMargin) || 0)
  )
})
