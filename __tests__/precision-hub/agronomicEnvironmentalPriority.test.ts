import test from 'node:test'
import assert from 'node:assert/strict'

import { buildAgronomicActionQueue } from '@/services/agronomicActionQueueService'
import { scoreAgronomicPriority } from '@/services/agronomicPriorityService'
import type { EfficiencyReport } from '@/types/irrigation'

test('scoreAgronomicPriority increases water priority when persisted zone ledger shows repeated stress', () => {
  const baseline = scoreAgronomicPriority({
    baseScore: 50,
    confidence: 0.6,
    focus: 'water',
  })

  const withEnvironmentalPressure = scoreAgronomicPriority({
    baseScore: 50,
    confidence: 0.6,
    focus: 'water',
    environmentalSummary: {
      zoneId: 'zone-1',
      gardenId: 'garden-1',
      entries: 6,
      highSoilWaterStressDays: 4,
      mediumSoilWaterStressDays: 1,
      highDiseasePressureDays: 0,
      sensorLocalDays: 3,
      latestSensorPrecedence: 'sensor_local',
      latestSoilWaterStressLevel: 'high',
      dominantWeatherSourceClass: 'historical_archive',
    },
  })

  assert.ok(withEnvironmentalPressure.score > baseline.score)
  assert.ok(withEnvironmentalPressure.confidence > baseline.confidence)
})

test('buildAgronomicActionQueue carries zone environmental summary into irrigation queue metadata', () => {
  const irrigationReport: EfficiencyReport = {
    zoneId: 'zone-1',
    zoneName: 'Zona critica',
    period: 'week',
    averageEfficiency: 71,
    uniformityCoefficient: 68,
    waterUseEfficiency: 0.74,
    recommendations: ['Aumenta i turni frazionati'],
    priorityScore: 52,
    priorityConfidence: 0.58,
    missingSignals: [],
  }

  const queue = buildAgronomicActionQueue({
    irrigationReports: [irrigationReport],
    environmentalSummariesByZone: {
      'zone-1': {
        zoneId: 'zone-1',
        gardenId: 'garden-1',
        entries: 5,
        highSoilWaterStressDays: 3,
        mediumSoilWaterStressDays: 1,
        highDiseasePressureDays: 2,
        sensorLocalDays: 2,
        latestSensorPrecedence: 'sensor_local',
        latestSoilWaterStressLevel: 'high',
        dominantWeatherSourceClass: 'historical_archive',
      },
    },
  })

  assert.equal(queue.length, 1)
  assert.equal(queue[0]?.source, 'irrigation')
  assert.ok((queue[0]?.priorityScore || 0) > 52)
  assert.equal(
    (queue[0]?.metadata?.environmentalSummary as { latestSoilWaterStressLevel?: string })?.latestSoilWaterStressLevel,
    'high'
  )
})
