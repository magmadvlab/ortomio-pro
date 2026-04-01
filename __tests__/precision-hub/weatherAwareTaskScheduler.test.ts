import test from 'node:test'
import assert from 'node:assert/strict'

import { analyzeTaskWeatherSuitability } from '@/services/weatherAwareTaskScheduler'

test('analyzeTaskWeatherSuitability blocks sowing on persistently wet recent history', () => {
  const analysis = analyzeTaskWeatherSuitability(
    {
      id: 'task-1',
      gardenId: 'garden-1',
      plantName: 'Pomodoro',
      taskType: 'Sowing',
      date: '2026-04-02',
      completed: false,
    },
    new Date('2026-04-02T08:00:00.000Z'),
    [
      {
        date: '2026-04-02',
        tempMin: 14,
        tempMax: 24,
        rainMm: 0,
        humidity: 68,
        windSpeed: 8,
      },
    ],
    undefined,
    {
      gardenId: 'garden-1',
      entries: 4,
      trackedZones: 1,
      highSoilWaterStressDays: 0,
      mediumSoilWaterStressDays: 1,
      highDiseasePressureDays: 2,
      sensorLocalDays: 1,
      deficitWaterBalanceDays: 0,
      surplusWaterBalanceDays: 2,
      lowDryingPowerDays: 2,
      dominantWeatherSourceClass: 'historical_archive',
    }
  )

  assert.equal(analysis.isSuitable, false)
  assert.match(analysis.reason, /Storico recente troppo umido/)
})

test('analyzeTaskWeatherSuitability keeps irrigation suitable under light rain when drought is persistent', () => {
  const analysis = analyzeTaskWeatherSuitability(
    {
      id: 'task-2',
      gardenId: 'garden-1',
      plantName: 'Peperone',
      taskType: 'Irrigation',
      date: '2026-04-02',
      completed: false,
    },
    new Date('2026-04-02T08:00:00.000Z'),
    [
      {
        date: '2026-04-02',
        tempMin: 18,
        tempMax: 30,
        rainMm: 12,
        humidity: 60,
        windSpeed: 10,
      },
    ],
    undefined,
    {
      zoneId: 'zone-1',
      gardenId: 'garden-1',
      entries: 5,
      highSoilWaterStressDays: 3,
      mediumSoilWaterStressDays: 1,
      highDiseasePressureDays: 0,
      sensorLocalDays: 2,
      deficitWaterBalanceDays: 4,
      surplusWaterBalanceDays: 0,
      lowDryingPowerDays: 0,
      latestSoilWaterStressLevel: 'high',
      dominantWeatherSourceClass: 'station',
    }
  )

  assert.equal(analysis.isSuitable, true)
  assert.equal(analysis.weatherIssues.length, 0)
})
