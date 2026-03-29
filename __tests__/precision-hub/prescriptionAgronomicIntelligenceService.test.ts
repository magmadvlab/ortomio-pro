import test from 'node:test'
import assert from 'node:assert/strict'

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
  zones: [],
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
    outcomeSummary
  )

  assert.equal(summary.bestZoneLabel, 'Zona Buona')
  assert.equal(summary.worstZoneLabel, 'Zona Debole')
  assert.equal(summary.topPriorityLabel, 'Zona Debole')
  assert.equal(summary.immediatePriorities, 1)
  assert.equal(summary.nextCyclePriorities, 0)
  assert.equal(summary.monitorPriorities, 1)
  assert.equal(summary.recommendations.length > 0, true)
  assert.equal(summary.recommendations[0]?.severity, 'urgent')
  assert.equal(summary.recommendations.some((item) => item.category === 'soil'), true)
  assert.equal(summary.recommendations.some((item) => item.category === 'timing'), true)
  assert.equal(summary.operationalPriorities.length, 2)
  assert.equal(summary.operationalPriorities[0]?.scopeLabel, 'Zona Debole')
  assert.equal(summary.operationalPriorities[0]?.urgency, 'immediate')
  assert.equal(summary.operationalPriorities[0]?.drivers.includes('esecuzione off_target'), true)
  assert.equal(summary.operationalPriorities[0]?.drivers.includes('outcome negative'), true)
  assert.equal(summary.operationalPriorities[1]?.urgency, 'monitor')
})
