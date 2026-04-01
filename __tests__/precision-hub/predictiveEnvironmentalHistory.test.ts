import test from 'node:test'
import assert from 'node:assert/strict'

import {
  predictDiseaseRisk,
  predictWaterRequirement,
  predictYield,
} from '@/services/predictiveAnalyticsService'

const baseTask = {
  id: 'task-1',
  gardenId: 'garden-1',
  zoneId: 'zone-1',
  plantName: 'Pomodoro',
  taskType: 'Sowing',
  date: '2026-02-01',
  completed: false,
} as any

const baseMaster = {
  id: 'pomodoro',
  commonName: 'Pomodoro',
  scientificName: 'Solanum lycopersicum',
  nutrientCategory: 'Fruit',
  family: 'Solanaceae',
  harvestWindow: '80-100 giorni',
  requiredTools: {
    seedTray: false,
    seedSoil: false,
    heatingMat: false,
    sprayer: false,
  },
  germination: {
    emergenceDays: {
      min: 5,
      max: 12,
    },
  },
} as any

test('predictYield lowers expected yield when persistent environmental deficit is present', async () => {
  const baseline = await predictYield(
    baseTask,
    baseMaster,
    { sizeSqMeters: 10 },
    [],
    new Date('2026-04-01T08:00:00.000Z'),
    { environmentalHistorySummary: null }
  )

  const stressed = await predictYield(
    baseTask,
    baseMaster,
    { sizeSqMeters: 10 },
    [],
    new Date('2026-04-01T08:00:00.000Z'),
    {
      environmentalHistorySummary: {
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
        dominantWeatherSourceClass: 'station',
      },
    }
  )

  assert.equal(stressed.factors.environmentalPressure, 'persistent_deficit')
  assert.ok(stressed.predictedYieldKg < baseline.predictedYieldKg)
  assert.ok(stressed.factors.healthScore < baseline.factors.healthScore)
})

test('predictDiseaseRisk marks historical patterns when recent environmental humidity is persistently high', async () => {
  const risk = await predictDiseaseRisk(
    baseTask,
    baseMaster,
    {},
    new Date('2026-04-01T08:00:00.000Z'),
    {
      environmentalHistorySummary: {
        zoneId: 'zone-1',
        gardenId: 'garden-1',
        entries: 6,
        highSoilWaterStressDays: 0,
        mediumSoilWaterStressDays: 1,
        highDiseasePressureDays: 3,
        sensorLocalDays: 2,
        deficitWaterBalanceDays: 0,
        surplusWaterBalanceDays: 2,
        lowDryingPowerDays: 3,
        latestSoilWaterStressLevel: 'medium',
        dominantWeatherSourceClass: 'historical_archive',
      },
    }
  )

  assert.equal(risk.factors.historicalPatterns, true)
  assert.equal(risk.factors.environmentalPressure, 'persistent_humidity')
  assert.ok(risk.diseases.length > 0)
  assert.ok(risk.riskLevel === 'high' || risk.riskLevel === 'critical')
})

test('predictWaterRequirement increases irrigation need under persistent deficit and lowers it under persistent humidity', async () => {
  const deficit = await predictWaterRequirement(
    baseTask,
    baseMaster,
    { sizeSqMeters: 10 },
    new Date('2026-04-01T08:00:00.000Z'),
    {
      environmentalHistorySummary: {
        zoneId: 'zone-1',
        gardenId: 'garden-1',
        entries: 6,
        highSoilWaterStressDays: 3,
        mediumSoilWaterStressDays: 1,
        highDiseasePressureDays: 0,
        sensorLocalDays: 1,
        deficitWaterBalanceDays: 4,
        surplusWaterBalanceDays: 0,
        lowDryingPowerDays: 0,
        latestSoilWaterStressLevel: 'high',
        dominantWeatherSourceClass: 'station',
      },
    }
  )

  const wet = await predictWaterRequirement(
    baseTask,
    baseMaster,
    { sizeSqMeters: 10 },
    new Date('2026-04-01T08:00:00.000Z'),
    {
      environmentalHistorySummary: {
        zoneId: 'zone-1',
        gardenId: 'garden-1',
        entries: 6,
        highSoilWaterStressDays: 0,
        mediumSoilWaterStressDays: 1,
        highDiseasePressureDays: 3,
        sensorLocalDays: 1,
        deficitWaterBalanceDays: 0,
        surplusWaterBalanceDays: 2,
        lowDryingPowerDays: 3,
        latestSoilWaterStressLevel: 'medium',
        dominantWeatherSourceClass: 'historical_archive',
      },
    }
  )

  assert.ok(deficit.averageDailyRequirement > wet.averageDailyRequirement)
  assert.match(deficit.next7Days[0]?.reason || '', /deficit idrico/)
  assert.match(wet.next7Days[0]?.reason || '', /umidita persistente/)
})
